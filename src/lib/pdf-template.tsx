import React from "react";
import { Document, Page, View, Text, StyleSheet, Font, Link } from "@react-pdf/renderer";

Font.register({
  family: "Times New Roman",
  fonts: [
    { src: "https://fonts.cdnfonts.com/s/28797/TimesNewRoman.woff", fontWeight: "normal" },
    { src: "https://fonts.cdnfonts.com/s/28797/TimesNewRomanBold.woff", fontWeight: "bold" },
    { src: "https://fonts.cdnfonts.com/s/28797/TimesNewRomanItalic.woff", fontStyle: "italic" },
    { src: "https://fonts.cdnfonts.com/s/28797/TimesNewRomanBoldItalic.woff", fontWeight: "bold", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: "0.5in",
    fontFamily: "Times New Roman",
    fontSize: 11,
    lineHeight: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  contact: {
    fontSize: 11,
    marginTop: 2,
  },
  links: {
    fontSize: 11,
    marginTop: 2,
  },
  link: {
    color: "blue",
    textDecoration: "underline",
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 1,
    marginTop: 10,
    marginBottom: 4,
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryLeft: {
    flex: 1,
  },
  entryRight: {
    textAlign: "right",
  },
  institution: {
    fontWeight: "bold",
  },
  degree: {
    fontStyle: "italic",
  },
  period: {
    fontSize: 11,
  },
  periodItalic: {
    fontStyle: "italic",
  },
  periodBoldItalic: {
    fontWeight: "bold",
    fontStyle: "italic",
  },
  bulletContainer: {
    marginTop: 2,
  },
  bullet: {
    flexDirection: "row",
    marginLeft: 10,
    marginBottom: 2,
  },
  bulletPoint: {
    width: 8,
  },
  bulletText: {
    flex: 1,
  },
  italicBullet: {
    fontStyle: "italic",
  },
  projectName: {
    fontWeight: "bold",
    fontStyle: "italic",
  },
  projectLink: {
    fontWeight: "bold",
    fontStyle: "italic",
    color: "blue",
    textDecoration: "underline",
  },
  skillEntry: {
    flexDirection: "row",
    marginLeft: 10,
    marginBottom: 2,
  },
  skillCategory: {
    fontWeight: "bold",
  },
  skillItems: {},
  entrySpacing: {
    marginBottom: 6,
  },
});

interface PDFCVData {
  profile: {
    name: string;
    phone: string;
    email: string;
    location: string;
    links: { label: string; url: string }[];
    summary: string;
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
  };
}

function renderBullets(bullets: string[], italic = false) {
  return (
    <View style={styles.bulletContainer}>
      {bullets.map((b, i) => (
        <View key={i} style={styles.bullet}>
          <Text style={styles.bulletPoint}>{"\u2022"}</Text>
          <Text style={italic ? styles.italicBullet : styles.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function getSectionEntries(data: PDFCVData, section: string) {
  const versionOrder = data.version.sectionOrder[section] || [];
  const entryMap = new Map(data.entries.map((e) => [e.id, e]));
  if (versionOrder.length > 0) {
    return versionOrder.map((id) => entryMap.get(id)).filter(Boolean) as PDFCVData["entries"];
  }
  return data.entries.filter((e) => e.section === section);
}

function ProfileSection({ data }: { data: PDFCVData }) {
  const p = data.profile;
  const contactParts = [p.phone, p.email, p.location].filter(Boolean);
  return (
    <View style={styles.header}>
      <Text style={styles.name}>{p.name}</Text>
      {contactParts.length > 0 && <Text style={styles.contact}>{contactParts.join(" | ")}</Text>}
      {p.links.length > 0 && (
        <Text style={styles.links}>
          {p.links.map((link, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text> | </Text>}
              <Link src={link.url} style={styles.link}>{link.label}</Link>
            </React.Fragment>
          ))}
        </Text>
      )}
    </View>
  );
}

function AboutMeSection({ data }: { data: PDFCVData }) {
  if (!data.profile.summary) return null;
  return (
    <View>
      <Text style={styles.sectionHeading}>ABOUT ME</Text>
      <Text>{data.profile.summary}</Text>
    </View>
  );
}

function EducationSection({ data }: { data: PDFCVData }) {
  const entries = getSectionEntries(data, "education");
  if (entries.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionHeading}>EDUCATION</Text>
      {entries.map((entry) => {
        const d = entry.data as { institution: string; degree: string; field: string; period: string; gpa?: string; relatedModules: string[] };
        return (
          <View key={entry.id} style={styles.entrySpacing}>
            <View style={styles.entryRow}>
              <Text style={styles.institution}>{d.institution}</Text>
              <Text style={[styles.period, styles.periodItalic]}>{d.period}</Text>
            </View>
            <Text style={styles.degree}>{d.degree}{d.field ? `, ${d.field}` : ""}</Text>
            <View style={styles.bulletContainer}>
              {d.gpa && (
                <View style={styles.bullet}>
                  <Text style={styles.bulletPoint}>{"\u2022"}</Text>
                  <Text style={[styles.bulletText, styles.italicBullet]}>Cumulative GPA: {d.gpa}.</Text>
                </View>
              )}
              {d.relatedModules && d.relatedModules.length > 0 && (
                <View style={styles.bullet}>
                  <Text style={styles.bulletPoint}>{"\u2022"}</Text>
                  <Text style={[styles.bulletText, styles.italicBullet]}>
                    Related Modules: {d.relatedModules.join(", ")}.
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ExperienceSection({ data, title, subType: _subType }: { data: PDFCVData; title: string; subType?: string }) {
  const entries = getSectionEntries(data, "experience").filter(
    (e) => (e.subType || "professional") === (_subType || "professional")
  );
  if (entries.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionHeading}>{title}</Text>
      {entries.map((entry) => {
        const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
        return (
          <View key={entry.id} style={styles.entrySpacing}>
            <View style={styles.entryRow}>
              <Text style={styles.institution}>{d.role}, {d.organization}{d.location ? ` | ${d.location}` : ""}</Text>
              <Text style={[styles.period, styles.periodBoldItalic]}>{d.period}</Text>
            </View>
            {d.bullets && renderBullets(d.bullets)}
          </View>
        );
      })}
    </View>
  );
}

function ProjectsSection({ data }: { data: PDFCVData }) {
  const entries = getSectionEntries(data, "project");
  if (entries.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionHeading}>PROJECTS</Text>
      {entries.map((entry) => {
        const d = entry.data as { name: string; link?: string; year: string; bullets: string[] };
        return (
          <View key={entry.id} style={styles.entrySpacing}>
            <View style={styles.entryRow}>
              <View style={styles.entryLeft}>
                <Text style={styles.projectName}>
                  {d.name}
                  {d.link ? (
                    <Text>{` \u2013 `}<Link src={d.link} style={styles.projectLink}>View Project</Link></Text>
                  ) : null}
                </Text>
              </View>
              <Text style={styles.period}>{d.year}</Text>
            </View>
            {d.bullets && renderBullets(d.bullets)}
          </View>
        );
      })}
    </View>
  );
}

function SkillsSection({ data }: { data: PDFCVData }) {
  const skillOrder = data.version.skillOrder || [];
  const entryMap = new Map(data.entries.map((e) => [e.id, e]));
  const ordered = skillOrder.length > 0
    ? skillOrder.map((id) => entryMap.get(id)).filter(Boolean) as PDFCVData["entries"]
    : data.entries.filter((e) => e.section === "skill");
  if (ordered.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionHeading}>SKILLS</Text>
      {ordered.map((entry) => {
        const d = entry.data as { category: string; items: string[] };
        return (
          <View key={entry.id} style={styles.skillEntry}>
            <Text style={styles.bulletPoint}>{"\u2022"}</Text>
            <Text style={styles.skillCategory}>{d.category}: </Text>
            <Text style={styles.skillItems}>{d.items.join(", ")}.</Text>
          </View>
        );
      })}
    </View>
  );
}

export function CVPDFDocument({ data }: { data: PDFCVData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ProfileSection data={data} />
        <AboutMeSection data={data} />
        <EducationSection data={data} />
        <ExperienceSection data={data} title="PROFESSIONAL EXPERIENCE" subType="professional" />
        <ExperienceSection data={data} title="ORGANIZATIONAL EXPERIENCE" subType="organizational" />
        <ProjectsSection data={data} />
        <SkillsSection data={data} />
      </Page>
    </Document>
  );
}
