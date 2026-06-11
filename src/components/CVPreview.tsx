"use client";

import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { EditToolbar } from "./EditToolbar";
import { AddCVModal } from "./Modals";
import type { Entry, SectionType } from "@/lib/types";

function getSectionEntries(allEntries: Entry[], section: SectionType, subType?: string, order?: string[]) {
  const ordered = order ?? [];
  const entryMap = new Map(allEntries.map((e) => [e.id, e]));
  return ordered
    .map((id) => entryMap.get(id))
    .filter((e): e is Entry => !!e && e.section === section && (!subType || (e.subType ?? "professional") === subType));
}

const SectionHeading = memo(function SectionHeading({ text }: { text: string }) {
  return (
    <div style={{ marginTop: "10pt", marginBottom: "4pt" }}>
      <div style={{ fontWeight: "bold", fontSize: "11pt", textTransform: "uppercase" }}>{text}</div>
      <hr style={{ border: "none", borderTop: "1px solid #000", margin: 0 }} />
    </div>
  );
});

const Placeholder = memo(function Placeholder() {
  return (
    <div style={{ color: "#aaa", fontStyle: "italic", marginLeft: "12pt" }}>
      No items added.
    </div>
  );
});

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
  const profile = useStore((s) => s.profile);
  const entries = useStore((s) => s.entries);
  const cvVersions = useStore((s) => s.cvVersions);
  const activeVersionId = useStore((s) => s.activeVersionId);
  const summaries = useStore((s) => s.summaries);
  const selectedEntryId = useStore((s) => s.selectedEntryId);
  const reorderEntries = useStore((s) => s.reorderEntries);
  const updateVersion = useStore((s) => s.updateVersion);
  const setSelectedEntryId = useStore((s) => s.setSelectedEntryId);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const maybeVersion = useMemo(
    () => cvVersions.find((v) => v.id === activeVersionId),
    [cvVersions, activeVersionId]
  );
  const [dragOverEntryId, setDragOverEntryId] = useState<string | null>(null);
  const dragSourceRef = useRef<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragOverlay, setDragOverlay] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });

  const selectedSummary = useMemo(
    () => maybeVersion?.selectedSummaryId
      ? summaries.find((s) => s.id === maybeVersion.selectedSummaryId)
      : summaries.find((s) => s.isDefault) ?? summaries[0],
    [maybeVersion?.selectedSummaryId, summaries]
  );

  useEffect(() => {
    setDragOverEntryId(null);
  }, [activeVersionId]);

  // Memoize drag handlers
  const handleDragOver = useCallback((e: DragEvent) => {
    if (!dragSourceRef.current) return;
    const previewEl = previewRef.current;
    const isOutside = previewEl ? !previewEl.contains(e.target as Node) : true;
    setDragOverlay({ visible: isOutside, x: e.clientX + 16, y: e.clientY + 16 });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragOverlay({ visible: false, x: 0, y: 0 });
  }, []);

  useEffect(() => {
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragend", handleDragEnd);
    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [handleDragOver, handleDragEnd]);

  const validLinks = useMemo(
    () => profile?.links.filter((l) => l.label && l.url) ?? [],
    [profile?.links]
  );

  const version = maybeVersion;
  const eduOrder = version?.sectionOrder.education;
  const expOrder = version?.sectionOrder.experience;
  const projOrder = version?.sectionOrder.project;
  const skillOrder = version?.skillOrder;

  const eduEntries = useMemo(
    () => eduOrder !== undefined
      ? getSectionEntries(entries, "education", undefined, eduOrder)
      : entries.filter((e) => e.section === "education"),
    [entries, eduOrder]
  );

  const profEntries = useMemo(
    () => expOrder !== undefined
      ? getSectionEntries(entries, "experience", "professional", expOrder)
      : entries.filter((e) => e.section === "experience" && (e.subType ?? "professional") === "professional"),
    [entries, expOrder]
  );

  const orgEntries = useMemo(
    () => expOrder !== undefined
      ? getSectionEntries(entries, "experience", "organizational", expOrder)
      : entries.filter((e) => e.section === "experience" && e.subType === "organizational"),
    [entries, expOrder]
  );

  const projEntries = useMemo(
    () => projOrder !== undefined
      ? getSectionEntries(entries, "project", undefined, projOrder)
      : entries.filter((e) => e.section === "project"),
    [entries, projOrder]
  );

  const skillEntries = useMemo(
    () => skillOrder !== undefined
      ? skillOrder.map((id) => entries.find((e) => e.id === id)).filter((e): e is Entry => !!e && e.section === "skill")
      : entries.filter((e) => e.section === "skill"),
    [entries, skillOrder]
  );

  if (!profile || !version) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-muted gap-4 p-8">
        {!profile ? (
          <p className="text-sm">Loading profile...</p>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted/50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <p className="text-sm">No CV version selected</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create New CV
            </button>
            <AddCVModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
          </>
        )}
      </div>
    );
  }

  function canDrop(e: React.DragEvent) {
    return e.dataTransfer.types.includes("application/x-cv-add-entry-id") ||
           e.dataTransfer.types.includes("application/x-cv-reorder-id");
  }

  function getOrder(section: SectionType): string[] {
    if (!version) return [];
    if (section === "skill") return version.skillOrder;
    return version.sectionOrder[section] ?? [];
  }

  async function handleDrop(e: React.DragEvent, section: SectionType, targetEntryId?: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!version) return;
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
          const img = new Image();
          img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
          e.dataTransfer.setDragImage(img, 0, 0);
          e.dataTransfer.setData("application/x-cv-reorder-id", entryId);
          e.dataTransfer.effectAllowed = "move";
          dragSourceRef.current = entryId;
        }}
        onDragEnd={() => {
          setDragOverlay({ visible: false, x: 0, y: 0 });
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
        style={{ cursor: "grab", fontSize: "16pt", color: "#999", userSelect: "none" }}
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
        className="mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
        style={{ width: "210mm", minHeight: "297mm", padding: "0.5in" }}
        suppressContentEditableWarning
      >
        <div
          contentEditable
          suppressContentEditableWarning
          className="outline-dashed outline-2 outline-accent-light/60 min-h-[200mm]"
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
          {selectedSummary && (
            <div>
              <SectionHeading text="ABOUT ME" />
              <p style={{ margin: 0 }}>{selectedSummary.content}</p>
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

      {dragOverlay.visible && (
        <div
          style={{
            position: "fixed",
            left: dragOverlay.x,
            top: dragOverlay.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            color: "#ef4444",
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            backdropFilter: "blur(4px)",
            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.2)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Delete
        </div>
      )}
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
          <EntryRow
            key={entry.id}
            entry={entry}
            isDragOver={isDragOver}
            isSelected={isSelected}
            sectionType={sectionType}
            makeDragHandle={makeDragHandle}
            onEntryClick={onEntryClick}
            canDrop={canDrop}
            setDragOverEntryId={setDragOverEntryId}
            handleDrop={handleDrop}
          />
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

const EntryRow = memo(function EntryRow({
  entry,
  isDragOver,
  isSelected,
  sectionType,
  makeDragHandle,
  onEntryClick,
  canDrop,
  setDragOverEntryId,
  handleDrop,
}: {
  entry: SectionEntry;
  isDragOver: boolean;
  isSelected: boolean;
  sectionType: SectionType;
  makeDragHandle: (entryId: string, section: SectionType) => React.ReactNode;
  onEntryClick: (entryId: string) => void;
  canDrop: (e: React.DragEvent) => boolean;
  setDragOverEntryId: (id: string | null) => void;
  handleDrop: (e: React.DragEvent, section: SectionType, targetEntryId?: string) => Promise<void>;
}) {
  return (
    <div
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
});
