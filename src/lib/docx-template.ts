import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopPosition,
  TabStopType,
  BorderStyle,
  ExternalHyperlink,
  UnderlineType,
} from "docx";

interface CVData {
  profile: {
    name: string;
    phone: string;
    email: string;
    location: string;
    links: { label: string; url: string }[];
  };
  entries: {
    id: string;
    section: string;
    subType?: string;
    data: Record<string, unknown>;
  }[];
  version: {
    entryIds: string[];
    sectionOrder: Record<string, string[]>;
    skillOrder: string[];
    selectedSummaryId?: string | null;
  };
  summaries: {
    id: string;
    content: string;
    isDefault: boolean;
  }[];
}

const FONT = "Times New Roman";
const BASE_SIZE = 22; // 11pt in half-points
const RIGHT_TAB = 10466; // A4 0.5in margin right tab in DXA

function nameText(text: string): TextRun {
  return new TextRun({ text, bold: true, size: 28, font: FONT });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 1 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: BASE_SIZE, font: FONT })],
  });
}

function contactLine(parts: string[]): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0 },
    children: [new TextRun({ text: parts.join(" | "), size: BASE_SIZE, font: FONT })],
  });
}

function linksLine(links: { label: string; url: string }[]): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: links.flatMap((link, i) => {
      const items: (TextRun | ExternalHyperlink)[] = [];
      if (i > 0) items.push(new TextRun({ text: " | ", size: BASE_SIZE, font: FONT }));
      items.push(
        new ExternalHyperlink({
          link: link.url,
          children: [new TextRun({ text: link.label, style: "Hyperlink", size: BASE_SIZE, font: FONT })],
        })
      );
      return items;
    }),
  });
}

function twoColLine(left: (TextRun | ExternalHyperlink)[], right: TextRun): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    children: [
      ...left,
      new TextRun({ text: "\t", size: BASE_SIZE, font: FONT }),
      right,
    ],
  });
}

function bulletLine(texts: (TextRun | string)[], indent = 400): Paragraph {
  const children: (TextRun | ExternalHyperlink)[] = [
    new TextRun({ text: "\u2022 ", size: BASE_SIZE, font: FONT }),
  ];
  for (const t of texts) {
    if (typeof t === "string") {
      children.push(new TextRun({ text: t, size: BASE_SIZE, font: FONT }));
    } else {
      children.push(t as TextRun);
    }
  }
  return new Paragraph({
    indent: { left: indent },
    spacing: { after: 40 },
    children,
  });
}

function plainPara(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text, size: BASE_SIZE, font: FONT })],
  });
}

function entrySpacing(): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

function getSectionEntries(data: CVData, section: string) {
  const versionOrder = data.version.sectionOrder[section] || [];
  const entryMap = new Map(data.entries.map((e) => [e.id, e]));
  if (versionOrder.length > 0) {
    return versionOrder.map((id) => entryMap.get(id)).filter(Boolean) as CVData["entries"];
  }
  return data.entries.filter((e) => e.section === section);
}

function buildEducation(entry: CVData["entries"][0]): Paragraph[] {
  const d = entry.data as { institution: string; degree: string; field: string; period: string; gpa?: string; relatedModules: string[] };
  const result: Paragraph[] = [
    twoColLine(
      [new TextRun({ text: d.institution, bold: true, size: BASE_SIZE, font: FONT })],
      new TextRun({ text: d.period, italics: true, size: BASE_SIZE, font: FONT })
    ),
    new Paragraph({
      children: [new TextRun({ text: `${d.degree}${d.field ? `, ${d.field}` : ""}`, italics: true, size: BASE_SIZE, font: FONT })],
      spacing: { after: 40 },
    }),
  ];
  if (d.gpa) {
    result.push(bulletLine([new TextRun({ text: `Cumulative GPA: ${d.gpa}.`, italics: true, size: BASE_SIZE, font: FONT })]));
  }
  if (d.relatedModules?.length) {
    result.push(bulletLine([new TextRun({ text: `Related Modules: ${d.relatedModules.join(", ")}.`, italics: true, size: BASE_SIZE, font: FONT })]));
  }
  result.push(entrySpacing());
  return result;
}

function buildExperience(entry: CVData["entries"][0]): Paragraph[] {
  const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
  const result: Paragraph[] = [
    twoColLine(
      [
        new TextRun({ text: `${d.role}, ${d.organization}`, bold: true, size: BASE_SIZE, font: FONT }),
        ...(d.location ? [new TextRun({ text: ` | ${d.location}`, size: BASE_SIZE, font: FONT })] : []),
      ],
      new TextRun({ text: d.period, bold: true, italics: true, size: BASE_SIZE, font: FONT })
    ),
  ];
  for (const b of d.bullets || []) {
    result.push(bulletLine([new TextRun({ text: b, size: BASE_SIZE, font: FONT })]));
  }
  result.push(entrySpacing());
  return result;
}

function buildProject(entry: CVData["entries"][0]): Paragraph[] {
  const d = entry.data as { name: string; link?: string; year: string; bullets: string[] };
  const leftChildren: (TextRun | ExternalHyperlink)[] = [
    new TextRun({ text: d.name, bold: true, italics: true, size: BASE_SIZE, font: FONT }),
  ];
  if (d.link) {
    leftChildren.push(new TextRun({ text: " \u2013 ", bold: true, italics: true, size: BASE_SIZE, font: FONT }));
    leftChildren.push(
      new ExternalHyperlink({
        link: d.link,
        children: [new TextRun({ text: "View Project", style: "Hyperlink", bold: true, italics: true, size: BASE_SIZE, font: FONT })],
      })
    );
  }
  const result: Paragraph[] = [
    twoColLine(leftChildren, new TextRun({ text: d.year, size: BASE_SIZE, font: FONT })),
  ];
  for (const b of d.bullets || []) {
    result.push(bulletLine([new TextRun({ text: b, size: BASE_SIZE, font: FONT })]));
  }
  result.push(entrySpacing());
  return result;
}

function buildSkill(entry: CVData["entries"][0]): Paragraph[] {
  const d = entry.data as { category: string; items: string[] };
  return [
    bulletLine([
      new TextRun({ text: `${d.category}: `, bold: true, size: BASE_SIZE, font: FONT }),
      new TextRun({ text: `${d.items.join(", ")}.`, size: BASE_SIZE, font: FONT }),
    ]),
  ];
}

export async function generateDocx(data: CVData): Promise<Uint8Array> {
  const children: Paragraph[] = [];

  // Profile header
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [nameText(data.profile.name)],
  }));
  const contactParts = [data.profile.phone, data.profile.email, data.profile.location].filter(Boolean);
  if (contactParts.length) children.push(contactLine(contactParts));
  if (data.profile.links.length) children.push(linksLine(data.profile.links));

  // About Me
  const selectedSummary = data.version.selectedSummaryId
    ? data.summaries.find((s) => s.id === data.version.selectedSummaryId)
    : data.summaries.find((s) => s.isDefault) ?? data.summaries[0];
  if (selectedSummary) {
    children.push(sectionHeading("ABOUT ME"));
    children.push(plainPara(selectedSummary.content));
  }

  // Education
  const eduEntries = getSectionEntries(data, "education");
  if (eduEntries.length) {
    children.push(sectionHeading("EDUCATION"));
    for (const e of eduEntries) children.push(...buildEducation(e));
  }

  // Professional Experience
  const profEntries = getSectionEntries(data, "experience").filter((e) => (e.subType || "professional") === "professional");
  if (profEntries.length) {
    children.push(sectionHeading("PROFESSIONAL EXPERIENCE"));
    for (const e of profEntries) children.push(...buildExperience(e));
  }

  // Organizational Experience
  const orgEntries = getSectionEntries(data, "experience").filter((e) => e.subType === "organizational");
  if (orgEntries.length) {
    children.push(sectionHeading("ORGANIZATIONAL EXPERIENCE"));
    for (const e of orgEntries) children.push(...buildExperience(e));
  }

  // Projects
  const projEntries = getSectionEntries(data, "project");
  if (projEntries.length) {
    children.push(sectionHeading("PROJECTS"));
    for (const e of projEntries) children.push(...buildProject(e));
  }

  // Skills
  const skillOrder = data.version.skillOrder || [];
  const skillEntries = (skillOrder.length > 0
    ? skillOrder.map((id) => data.entries.find((e) => e.id === id))
    : data.entries.filter((e) => e.section === "skill")
  ).filter(Boolean) as CVData["entries"];
  if (skillEntries.length) {
    children.push(sectionHeading("SKILLS"));
    for (const e of skillEntries) children.push(...buildSkill(e));
  }

  const doc = new DocxDocument({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BASE_SIZE },
          paragraph: { spacing: { after: 0, line: 276 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720,
            right: 720,
            bottom: 720,
            left: 720,
          },
        },
      },
      children,
    }],
  });

  return await Packer.toBuffer(doc);
}
