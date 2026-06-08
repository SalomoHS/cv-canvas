"use client";

import { useState, useEffect, useRef } from "react";
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

function SectionHeading({ text }: { text: string }) {
  return (
    <div style={{ marginTop: "10pt", marginBottom: "4pt" }}>
      <div style={{ fontWeight: "bold", fontSize: "11pt", textTransform: "uppercase" }}>{text}</div>
      <hr style={{ border: "none", borderTop: "1px solid #000", margin: 0 }} />
    </div>
  );
}

function Placeholder() {
  return (
    <div style={{ color: "#aaa", fontStyle: "italic", marginLeft: "12pt" }}>
      No items added.
    </div>
  );
}

type SectionEntry = {
  id: string;
  content: React.ReactNode;
  extra?: React.ReactNode;
};

const sectionToTab: Record<string, string> = {
  education: "education",
  experience: "experience",
  project: "projects",
  skill: "skills",
};

export function CVPreview() {
  const { profile, entries, cvVersions, activeVersionId, reorderEntries, updateVersion, selectedEntryId, setSelectedEntryId, setActiveTab } = useStore();
  const maybeVersion = cvVersions.find((v) => v.id === activeVersionId);
  const [dragOverEntryId, setDragOverEntryId] = useState<string | null>(null);
  const dragSourceRef = useRef<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDragOverEntryId(null);
  }, [activeVersionId]);

  if (!profile || !maybeVersion) {
    return (
      <div className="p-6 text-zinc-500">
        {!profile ? "Loading profile..." : "No CV version selected. Create one from the sidebar."}
      </div>
    );
  }
  const version = maybeVersion;

  const eduOrder = version.sectionOrder.education;
  const expOrder = version.sectionOrder.experience;
  const projOrder = version.sectionOrder.project;
  const skillOrder = version.skillOrder;

  const eduEntries = eduOrder !== undefined
    ? getSectionEntries(entries, "education", undefined, eduOrder)
    : entries.filter((e) => e.section === "education");
  const profEntries = expOrder !== undefined
    ? getSectionEntries(entries, "experience", "professional", expOrder)
    : entries.filter((e) => e.section === "experience" && (e.subType ?? "professional") === "professional");
  const orgEntries = expOrder !== undefined
    ? getSectionEntries(entries, "experience", "organizational", expOrder)
    : entries.filter((e) => e.section === "experience" && e.subType === "organizational");
  const projEntries = projOrder !== undefined
    ? getSectionEntries(entries, "project", undefined, projOrder)
    : entries.filter((e) => e.section === "project");
  const skillEntries = skillOrder !== undefined
    ? skillOrder.map((id) => entries.find((e) => e.id === id)).filter((e): e is Entry => !!e && e.section === "skill")
    : entries.filter((e) => e.section === "skill");

  const validLinks = profile.links.filter((l) => l.label && l.url);

  function canDrop(e: React.DragEvent) {
    return e.dataTransfer.types.includes("application/x-cv-add-entry-id") ||
           e.dataTransfer.types.includes("application/x-cv-reorder-id");
  }

  function getOrder(section: SectionType): string[] {
    if (section === "skill") return version.skillOrder;
    return version.sectionOrder[section] ?? [];
  }

  async function handleDrop(e: React.DragEvent, section: SectionType, targetEntryId?: string) {
    e.preventDefault();
    e.stopPropagation();
    const addId = e.dataTransfer.getData("application/x-cv-add-entry-id");
    const reorderId = e.dataTransfer.getData("application/x-cv-reorder-id");

    if (addId) {
      const sourceEntry = entries.find((en) => en.id === addId);
      if (!sourceEntry) return;
      const sourceSection = sourceEntry.section === "experience" ? "experience" : sourceEntry.section;
      if (sourceSection !== section) return;
      const currentOrder = getOrder(section);
      let newOrder: string[];
      if (targetEntryId && targetEntryId !== addId) {
        const idx = currentOrder.indexOf(targetEntryId);
        newOrder = [...currentOrder];
        newOrder.splice(idx + 1, 0, addId);
      } else {
        newOrder = [...currentOrder, addId];
      }
      newOrder = [...new Set(newOrder)];

      const newEntryIds = version.entryIds.includes(addId)
        ? version.entryIds
        : [...version.entryIds, addId];
      const newSectionOrder = { ...version.sectionOrder, [section]: newOrder };
      const updates: Record<string, unknown> = { entryIds: newEntryIds, sectionOrder: newSectionOrder };
      if (section === "skill") updates.skillOrder = newOrder;
      await updateVersion(version.id, updates);
    } else if (reorderId && targetEntryId && reorderId !== targetEntryId) {
      const currentOrder = getOrder(section);
      const newOrder = [...currentOrder];
      const oldIdx = newOrder.indexOf(reorderId);
      const targetIdx = newOrder.indexOf(targetEntryId);
      if (oldIdx !== -1 && targetIdx !== -1) {
        const [moved] = newOrder.splice(oldIdx, 1);
        const adjusted = newOrder.indexOf(targetEntryId);
        newOrder.splice(oldIdx < targetIdx ? adjusted + 1 : adjusted, 0, moved);
        if (section === "skill") {
          useStore.getState().reorderSkills(newOrder);
        } else {
          reorderEntries(section, newOrder);
        }
      }
    }

    setDragOverEntryId(null);
    dragSourceRef.current = null;
  }

  async function handleSectionDrop(e: React.DragEvent, section: SectionType) {
    await handleDrop(e, section);
  }

  function handleEntryClick(entryId: string) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    setSelectedEntryId(entryId);
    const tab = sectionToTab[entry.section] ?? "preview";
    setActiveTab(tab as any);
  }

  function makeDragHandle(entryId: string, section: SectionType) {
    return (
      <span
        contentEditable={false}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("application/x-cv-reorder-id", entryId);
          e.dataTransfer.effectAllowed = "move";
          dragSourceRef.current = entryId;
        }}
        onDragEnd={() => {
          if (dragSourceRef.current === entryId) {
            const v = cvVersions.find((ver) => ver.id === activeVersionId);
            if (v) {
              const newEntryIds = v.entryIds.filter((id) => id !== entryId);
              const newSectionOrder = { ...v.sectionOrder };
              if (section === "skill") {
                newSectionOrder.skill = (newSectionOrder.skill ?? []).filter((id) => id !== entryId);
                updateVersion(v.id, {
                  entryIds: newEntryIds,
                  sectionOrder: newSectionOrder,
                  skillOrder: (v.skillOrder ?? []).filter((id) => id !== entryId),
                });
              } else {
                if (newSectionOrder[section]) {
                  newSectionOrder[section] = newSectionOrder[section].filter((id) => id !== entryId);
                }
                updateVersion(v.id, { entryIds: newEntryIds, sectionOrder: newSectionOrder });
              }
            }
          }
          dragSourceRef.current = null;
        }}
        style={{ cursor: "grab", fontSize: "10pt", color: "#999", userSelect: "none" }}
      >
        ⠿
      </span>
    );
  }

  return (
    <div className="p-6">
      <EditToolbar />
      <div
        ref={previewRef}
        className="mx-auto bg-white shadow-lg"
        style={{ width: "210mm", minHeight: "297mm", padding: "0.5in" }}
        suppressContentEditableWarning
      >
        <div
          contentEditable
          suppressContentEditableWarning
          className="outline-dashed outline-2 outline-blue-200 min-h-[200mm]"
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
          <SectionSection
            heading="EDUCATION"
            entries={eduEntries.map((entry) => ({
              id: entry.id,
              content: (() => {
                const d = entry.data as { institution: string; degree: string; field: string; period: string; gpa?: string; relatedModules: string[] };
                return (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <span style={{ fontWeight: "bold" }}>{d.institution}</span>
                    <span style={{ fontStyle: "italic", marginLeft: "auto" }}>{d.period}</span>
                  </div>
                );
              })(),
              extra: (() => {
                const d = entry.data as { institution: string; degree: string; field: string; period: string; gpa?: string; relatedModules: string[] };
                return (
                  <>
                    <div style={{ fontStyle: "italic" }}>{d.degree}{d.field ? `, ${d.field}` : ""}</div>
                    <ul style={{ margin: "2pt 0 0 20pt", padding: 0, listStyle: "none" }}>
                      {d.gpa && <li style={{ fontStyle: "italic" }}>{"\u2022"} Cumulative GPA: {d.gpa}.</li>}
                      {d.relatedModules?.length > 0 && (
                        <li style={{ fontStyle: "italic" }}>{"\u2022"} Related Modules: {d.relatedModules.join(", ")}.</li>
                      )}
                    </ul>
                  </>
                );
              })(),
            }))}
            sectionType="education"
            selectedEntryId={selectedEntryId}
            dragOverEntryId={dragOverEntryId}
            setDragOverEntryId={setDragOverEntryId}
            canDrop={canDrop}
            handleDrop={handleDrop}
            handleSectionDrop={handleSectionDrop}
            makeDragHandle={makeDragHandle}
            onEntryClick={handleEntryClick}
          />

          {/* Professional Experience */}
          <SectionSection
            heading="PROFESSIONAL EXPERIENCE"
            entries={profEntries.map((entry) => ({
              id: entry.id,
              content: (() => {
                const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
                return (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <span style={{ fontWeight: "bold" }}>{d.role}, {d.organization}{d.location ? ` | ${d.location}` : ""}</span>
                    <span style={{ fontWeight: "bold", fontStyle: "italic", marginLeft: "auto" }}>{d.period}</span>
                  </div>
                );
              })(),
              extra: (() => {
                const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
                return (
                  <ul style={{ margin: "2pt 0 0 20pt", padding: 0, listStyle: "none" }}>
                    {d.bullets?.map((b, i) => <li key={i}>{"\u2022"} {b}</li>)}
                  </ul>
                );
              })(),
            }))}
            sectionType="experience"
            selectedEntryId={selectedEntryId}
            dragOverEntryId={dragOverEntryId}
            setDragOverEntryId={setDragOverEntryId}
            canDrop={canDrop}
            handleDrop={handleDrop}
            handleSectionDrop={handleSectionDrop}
            makeDragHandle={makeDragHandle}
            onEntryClick={handleEntryClick}
          />

          {/* Organizational Experience */}
          <SectionSection
            heading="ORGANIZATIONAL EXPERIENCE"
            entries={orgEntries.map((entry) => ({
              id: entry.id,
              content: (() => {
                const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
                return (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <span style={{ fontWeight: "bold" }}>{d.role}, {d.organization}{d.location ? ` | ${d.location}` : ""}</span>
                    <span style={{ fontWeight: "bold", fontStyle: "italic", marginLeft: "auto" }}>{d.period}</span>
                  </div>
                );
              })(),
              extra: (() => {
                const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
                return (
                  <ul style={{ margin: "2pt 0 0 20pt", padding: 0, listStyle: "none" }}>
                    {d.bullets?.map((b, i) => <li key={i}>{"\u2022"} {b}</li>)}
                  </ul>
                );
              })(),
            }))}
            sectionType="experience"
            selectedEntryId={selectedEntryId}
            dragOverEntryId={dragOverEntryId}
            setDragOverEntryId={setDragOverEntryId}
            canDrop={canDrop}
            handleDrop={handleDrop}
            handleSectionDrop={handleSectionDrop}
            makeDragHandle={makeDragHandle}
            onEntryClick={handleEntryClick}
          />

          {/* Projects */}
          <SectionSection
            heading="PROJECTS"
            entries={projEntries.map((entry) => ({
              id: entry.id,
              content: (() => {
                const d = entry.data as { name: string; link?: string; year: string; bullets: string[] };
                return (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
                      {d.name}
                      {d.link && <span> {"\u2013"} <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>View Project</a></span>}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4pt", marginLeft: "auto" }}>
                      <span>{d.year}</span>
                    </span>
                  </div>
                );
              })(),
              extra: (() => {
                const d = entry.data as { name: string; link?: string; year: string; bullets: string[] };
                return (
                  <ul style={{ margin: "2pt 0 0 20pt", padding: 0, listStyle: "none" }}>
                    {d.bullets?.map((b, i) => <li key={i}>{"\u2022"} {b}</li>)}
                  </ul>
                );
              })(),
            }))}
            sectionType="project"
            selectedEntryId={selectedEntryId}
            dragOverEntryId={dragOverEntryId}
            setDragOverEntryId={setDragOverEntryId}
            canDrop={canDrop}
            handleDrop={handleDrop}
            handleSectionDrop={handleSectionDrop}
            makeDragHandle={makeDragHandle}
            onEntryClick={handleEntryClick}
          />

          {/* Skills */}
          <SectionSection
            heading="SKILLS"
            entries={skillEntries.map((entry) => ({
              id: entry.id,
              content: (() => {
                const d = entry.data as { category: string; items: string[] };
                return (
                  <span>{"\u2022"} <strong>{d.category}:</strong> {d.items.join(", ")}.</span>
                );
              })(),
            }))}
            sectionType="skill"
            selectedEntryId={selectedEntryId}
            dragOverEntryId={dragOverEntryId}
            setDragOverEntryId={setDragOverEntryId}
            canDrop={canDrop}
            handleDrop={handleDrop}
            handleSectionDrop={handleSectionDrop}
            makeDragHandle={makeDragHandle}
            onEntryClick={handleEntryClick}
          />
        </div>
      </div>
    </div>
  );
}

function SectionSection({
  heading,
  entries,
  sectionType,
  selectedEntryId,
  dragOverEntryId,
  setDragOverEntryId,
  canDrop,
  handleDrop,
  handleSectionDrop,
  makeDragHandle,
  onEntryClick,
}: {
  heading: string;
  entries: SectionEntry[];
  sectionType: SectionType;
  selectedEntryId: string | null;
  dragOverEntryId: string | null;
  setDragOverEntryId: (id: string | null) => void;
  canDrop: (e: React.DragEvent) => boolean;
  handleDrop: (e: React.DragEvent, section: SectionType, targetEntryId?: string) => Promise<void>;
  handleSectionDrop: (e: React.DragEvent, section: SectionType) => Promise<void>;
  makeDragHandle: (entryId: string, section: SectionType) => React.ReactNode;
  onEntryClick: (entryId: string) => void;
}) {
  return (
    <div
      onDragOver={(e) => {
        if (canDrop(e)) e.preventDefault();
      }}
      onDrop={(e) => handleSectionDrop(e, sectionType)}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target && !e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragOverEntryId(null);
        }
      }}
    >
      <SectionHeading text={heading} />
      {entries.length > 0 ? entries.map((entry) => {
        const isDragOver = dragOverEntryId === entry.id;
        const isSelected = selectedEntryId === entry.id;
        return (
          <div
            key={entry.id}
            contentEditable={!!isSelected}
            suppressContentEditableWarning
            style={{
              marginBottom: "6pt",
              padding: "2pt 2pt 2pt 0",
              backgroundColor: isDragOver ? "#dbeafe" : isSelected ? "#f0f7ff" : "transparent",
              outline: isDragOver ? "2px dashed #3b82f6" : isSelected ? "2px solid #3b82f6" : "none",
              outlineOffset: isDragOver ? "1px" : "0",
              borderRadius: isDragOver ? "2px" : "0",
              transition: "background-color 0.15s",
            }}
            onBeforeInput={(e) => {
              if (!isSelected) return;
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (!isSelected) return;
              e.preventDefault();
            }}
            onDragOver={(e) => {
              if (canDrop(e)) {
                e.preventDefault();
                e.stopPropagation();
                setDragOverEntryId(entry.id);
              }
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverEntryId(null);
              }
            }}
            onDrop={(e) => handleDrop(e, sectionType, entry.id)}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "4pt" }}>
              {makeDragHandle(entry.id, sectionType)}
              <div
                style={{ flex: 1, minWidth: 0, cursor: "text" }}
                onClick={() => onEntryClick(entry.id)}
              >
                {entry.content}
                {entry.extra}
              </div>
            </div>
          </div>
        );
      }) : (
        <div
          onDragOver={(e) => {
            if (canDrop(e)) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onDrop={(e) => handleSectionDrop(e, sectionType)}
        >
          <Placeholder />
        </div>
      )}
      <div
        onDragOver={(e) => {
          if (canDrop(e)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDrop={(e) => handleSectionDrop(e, sectionType)}
        style={{ minHeight: "8pt" }}
      />
    </div>
  );
}
