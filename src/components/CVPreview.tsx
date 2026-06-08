"use client";

import { useStore } from "@/store/useStore";
import { EditToolbar } from "./EditToolbar";
import type { Entry, SectionType } from "@/lib/types";

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

  const eduOrder = version.sectionOrder.education;
  const expOrder = version.sectionOrder.experience;
  const projOrder = version.sectionOrder.project;
  const skillOrder = version.skillOrder;

  const eduEntries = eduOrder?.length
    ? getSectionEntries(entries, "education", undefined, eduOrder)
    : entries.filter((e) => e.section === "education");
  const profEntries = expOrder?.length
    ? getSectionEntries(entries, "experience", "professional", expOrder)
    : entries.filter((e) => e.section === "experience" && (e.subType ?? "professional") === "professional");
  const orgEntries = expOrder?.length
    ? getSectionEntries(entries, "experience", "organizational", expOrder)
    : entries.filter((e) => e.section === "experience" && e.subType === "organizational");
  const projEntries = projOrder?.length
    ? getSectionEntries(entries, "project", undefined, projOrder)
    : entries.filter((e) => e.section === "project");
  const skillEntries = skillOrder?.length
    ? skillOrder.map((id) => entries.find((e) => e.id === id)).filter((e): e is Entry => !!e && e.section === "skill")
    : entries.filter((e) => e.section === "skill");

  const validLinks = profile.links.filter((l) => l.label && l.url);

  return (
    <div className="p-6">
      <EditToolbar />
      <div
        className="mx-auto bg-white shadow-lg"
        style={{ width: "210mm", minHeight: "297mm", padding: "0.5in" }}
        suppressContentEditableWarning
      >
        <div
          contentEditable
          suppressContentEditableWarning
          className="outline-dashed outline-2 outline-blue-200 min-h-[200mm] cursor-text"
          style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "11pt", color: "#000", lineHeight: 1.15 }}
        >
          {/* Profile Header */}
          <div style={{ textAlign: "center", marginBottom: "6pt" }}>
            <div style={{ fontSize: "14pt", fontWeight: "bold" }}>{profile.name}</div>
            <div style={{ fontSize: "11pt", marginTop: "2pt" }}>
              {[profile.phone, profile.email, profile.location].filter(Boolean).join(" | ")}
            </div>
            {validLinks.length > 0 && (
              <div style={{ fontSize: "11pt", marginTop: "2pt" }}>
                {validLinks.map((l, i) => (
                  <span key={l.url}>
                    {i > 0 && <span> | </span>}
                    <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>{l.label}</a>
                  </span>
                ))}
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
                          {d.link && <span> {"\u2013"} <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>View Project</a></span>}
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
                  <div key={entry.id} style={{ marginLeft: "12pt", marginBottom: "2pt" }}>
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
