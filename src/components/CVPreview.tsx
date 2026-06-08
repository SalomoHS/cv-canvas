"use client";

import { useStore } from "@/store/useStore";
import type { Entry, SectionType } from "@/lib/types";

const sections: { key: SectionType; label: string; filter?: string }[] = [
  { key: "education", label: "Education" },
  { key: "experience", label: "Professional Experience", filter: "professional" },
  { key: "experience", label: "Organizational Experience", filter: "organizational" },
  { key: "project", label: "Projects" },
  { key: "skill", label: "Skills" },
];

function getSectionEntries(allEntries: Entry[], section: SectionType, subType?: string, order?: string[]) {
  const ordered = order ?? [];
  const entryMap = new Map(allEntries.map((e) => [e.id, e]));
  return ordered
    .map((id) => entryMap.get(id))
    .filter((e): e is Entry => !!e && e.section === section && (!subType || (e.subType ?? "professional") === subType));
}

export function CVPreview() {
  const { profile, entries, cvVersions, activeVersionId } = useStore();
  const version = cvVersions.find((v) => v.id === activeVersionId);

  if (!profile || !version) {
    return (
      <div className="p-6 text-zinc-500">
        {!profile ? "Loading profile..." : "No CV version selected. Create one from the sidebar."}
      </div>
    );
  }

  const eduEntries = getSectionEntries(entries, "education", undefined, version.sectionOrder.education);
  const profEntries = getSectionEntries(entries, "experience", "professional", version.sectionOrder.experience);
  const orgEntries = getSectionEntries(entries, "experience", "organizational", version.sectionOrder.experience);
  const projEntries = getSectionEntries(entries, "project", undefined, version.sectionOrder.project);
  const skillEntries = (version.skillOrder ?? [])
    .map((id) => entries.find((e) => e.id === id))
    .filter((e): e is Entry => !!e && e.section === "skill");

  const linkText = profile.links
    .filter((l) => l.label && l.url)
    .map((l) => l.label)
    .join(" | ");

  return (
    <div className="p-6">
      <div className="mx-auto bg-white shadow-lg" style={{ width: "210mm", minHeight: "297mm", padding: "0.5in" }}>
        <div style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "11pt", color: "#000", lineHeight: 1.15 }}>
          {/* Profile Header */}
          <div style={{ textAlign: "center", marginBottom: "6pt" }}>
            <div style={{ fontSize: "14pt", fontWeight: "bold" }}>{profile.name}</div>
            <div style={{ fontSize: "11pt", marginTop: "2pt" }}>
              {[profile.phone, profile.email, profile.location].filter(Boolean).join(" | ")}
            </div>
            {linkText && (
              <div style={{ fontSize: "11pt", marginTop: "2pt", color: "blue", textDecoration: "underline" }}>
                {linkText}
              </div>
            )}
          </div>

          {/* About Me */}
          {profile.summary && (
            <div>
              <SectionHeading text="ABOUT ME" />
              <p style={{ margin: 0 }}>{profile.summary}</p>
            </div>
          )}

          {/* Education */}
          {eduEntries.length > 0 && (
            <div>
              <SectionHeading text="EDUCATION" />
              {eduEntries.map((entry) => {
                const d = entry.data as { institution: string; degree: string; field: string; period: string; gpa?: string; relatedModules: string[] };
                return (
                  <div key={entry.id} style={{ marginBottom: "6pt" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "bold" }}>{d.institution}</span>
                      <span style={{ fontStyle: "italic" }}>{d.period}</span>
                    </div>
                    <div style={{ fontStyle: "italic" }}>{d.degree}{d.field ? `, ${d.field}` : ""}</div>
                    <ul style={{ margin: "2pt 0 0 20pt", padding: 0, listStyle: "none" }}>
                      {d.gpa && <li style={{ fontStyle: "italic" }}>{"\u2022"} Cumulative GPA: {d.gpa}.</li>}
                      {d.relatedModules?.length > 0 && (
                        <li style={{ fontStyle: "italic" }}>{"\u2022"} Related Modules: {d.relatedModules.join(", ")}.</li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Professional Experience */}
          {profEntries.length > 0 && (
            <div>
              <SectionHeading text="PROFESSIONAL EXPERIENCE" />
              {profEntries.map((entry) => {
                const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
                return (
                  <div key={entry.id} style={{ marginBottom: "6pt" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "bold" }}>{d.role}, {d.organization}{d.location ? ` | ${d.location}` : ""}</span>
                      <span style={{ fontWeight: "bold", fontStyle: "italic" }}>{d.period}</span>
                    </div>
                    <ul style={{ margin: "2pt 0 0 20pt", padding: 0, listStyle: "none" }}>
                      {d.bullets?.map((b, i) => <li key={i}>{"\u2022"} {b}</li>)}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Organizational Experience */}
          {orgEntries.length > 0 && (
            <div>
              <SectionHeading text="ORGANIZATIONAL EXPERIENCE" />
              {orgEntries.map((entry) => {
                const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
                return (
                  <div key={entry.id} style={{ marginBottom: "6pt" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "bold" }}>{d.role}, {d.organization}{d.location ? ` | ${d.location}` : ""}</span>
                      <span style={{ fontWeight: "bold", fontStyle: "italic" }}>{d.period}</span>
                    </div>
                    <ul style={{ margin: "2pt 0 0 20pt", padding: 0, listStyle: "none" }}>
                      {d.bullets?.map((b, i) => <li key={i}>{"\u2022"} {b}</li>)}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Projects */}
          {projEntries.length > 0 && (
            <div>
              <SectionHeading text="PROJECTS" />
              {projEntries.map((entry) => {
                const d = entry.data as { name: string; link?: string; year: string; bullets: string[] };
                return (
                  <div key={entry.id} style={{ marginBottom: "6pt" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
                        {d.name}
                        {d.link && <span> {"\u2013"} View Project</span>}
                      </span>
                      <span>{d.year}</span>
                    </div>
                    <ul style={{ margin: "2pt 0 0 20pt", padding: 0, listStyle: "none" }}>
                      {d.bullets?.map((b, i) => <li key={i}>{"\u2022"} {b}</li>)}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Skills */}
          {skillEntries.length > 0 && (
            <div>
              <SectionHeading text="SKILLS" />
              {skillEntries.map((entry) => {
                const d = entry.data as { category: string; items: string[] };
                return (
                  <div key={entry.id} style={{ marginLeft: "10pt", marginBottom: "2pt" }}>
                    <span>{"\u2022"} <strong>{d.category}:</strong> {d.items.join(", ")}.</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ text }: { text: string }) {
  return (
    <div style={{ marginTop: "10pt", marginBottom: "4pt" }}>
      <div style={{ fontWeight: "bold", fontSize: "11pt", textTransform: "uppercase" }}>{text}</div>
      <hr style={{ border: "none", borderTop: "1px solid #000", margin: 0 }} />
    </div>
  );
}
