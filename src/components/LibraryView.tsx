"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "@/store/useStore";
import type { SectionType, Entry } from "@/lib/types";
import { ConfirmDeleteModal } from "./Modals";

const sectionLabels: Record<SectionType, string> = {
  education: "Education",
  experience: "Experience",
  project: "Projects",
  skill: "Skills",
};

function SortableEntry({ entry, section, onDeleteRequest }: { entry: Entry; section: SectionType; onDeleteRequest: (id: string) => void }) {
  const { setEntryStatus, activeVersionId, cvVersions, updateVersion } = useStore();
  const version = cvVersions.find((v) => v.id === activeVersionId);
  const isInVersion = version?.entryIds.includes(entry.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const toggleLibrary = async () => {
    if (!version) return;
    if (isInVersion) {
      const newEntryIds = version.entryIds.filter((id) => id !== entry.id);
      const newSectionOrder = { ...version.sectionOrder };
      if (newSectionOrder[section]) {
        newSectionOrder[section] = newSectionOrder[section].filter((id) => id !== entry.id);
      }
      await updateVersion(version.id, { entryIds: newEntryIds, sectionOrder: newSectionOrder });
    } else {
      const newEntryIds = [...version.entryIds, entry.id];
      const newSectionOrder = { ...version.sectionOrder };
      if (!newSectionOrder[section]) newSectionOrder[section] = [];
      newSectionOrder[section] = [...newSectionOrder[section], entry.id];
      await updateVersion(version.id, { entryIds: newEntryIds, sectionOrder: newSectionOrder });
    }
  };

  const renderData = () => {
    switch (entry.section) {
      case "education": {
        const d = entry.data as { institution: string; degree: string; period: string };
        return <span className="text-sm"><strong className="font-medium text-text-primary">{d.institution}</strong><span className="text-text-muted mx-1">—</span>{d.degree}<span className="text-text-muted ml-1">({d.period})</span></span>;
      }
      case "experience": {
        const d = entry.data as { role: string; organization: string; period: string };
        const subLabel = (entry.subType ?? "professional") === "professional" ? "Prof" : "Org";
        return <span className="text-sm"><span className="text-[10px] font-semibold tracking-wide uppercase text-text-muted mr-1.5">[{subLabel}]</span><strong className="font-medium text-text-primary">{d.role}</strong><span className="text-text-muted"> @ {d.organization}</span><span className="text-text-muted ml-1">({d.period})</span></span>;
      }
      case "project": {
        const d = entry.data as { name: string; year: string };
        return <span className="text-sm"><strong className="font-medium text-text-primary">{d.name}</strong><span className="text-text-muted ml-1">({d.year})</span></span>;
      }
      case "skill": {
        const d = entry.data as { category: string; items: string[] };
        return <span className="text-sm"><strong className="font-medium text-text-primary">{d.category}:</strong><span className="text-text-secondary ml-1">{d.items.join(", ")}</span></span>;
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${isInVersion ? "bg-success-bg border-success/30" : "bg-surface-alt/70 border-border"}`}>
      <button {...attributes} {...listeners} className="cursor-grab text-text-muted hover:text-text-secondary text-sm px-1">⠿</button>
      <div className="flex-1 min-w-0">{renderData()}</div>
      <button onClick={toggleLibrary} className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${isInVersion ? "bg-success text-white" : "bg-border text-text-secondary hover:bg-text-muted hover:text-white"}`}>
        {isInVersion ? "Active" : "Library"}
      </button>
      <button onClick={() => onDeleteRequest(entry.id)} className="btn-danger p-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  );
}

export function LibraryView() {
  const { entries, deleteEntry, reorderEntries, activeVersionId } = useStore();
  const [filter, setFilter] = useState<"all" | "active" | "library">("all");
  const [sectionFilter, setSectionFilter] = useState<SectionType | "all">("all");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sections: SectionType[] = ["education", "experience", "project", "skill"];
  const filteredEntries = entries.filter((e) => {
    if (sectionFilter !== "all" && e.section !== sectionFilter) return false;
    if (filter === "all") return true;
    const version = useStore.getState().cvVersions.find((v) => v.id === activeVersionId);
    const inVersion = version?.entryIds.includes(e.id) ?? false;
    return filter === "active" ? inVersion : !inVersion;
  });

  const grouped = sections.reduce(
    (acc, s) => {
      acc[s] = filteredEntries.filter((e) => e.section === s);
      return acc;
    },
    {} as Record<SectionType, typeof entries>
  );

  const handleDragEnd = async (event: DragEndEvent, section: SectionType) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sectionEntries = grouped[section];
    const oldIndex = sectionEntries.findIndex((e) => e.id === active.id);
    const newIndex = sectionEntries.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...sectionEntries];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    await reorderEntries(section, reordered.map((e) => e.id));
  };

  return (
    <div className="p-6 max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">Library</h2>
        <div className="flex gap-2">
          <select className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-surface-raised text-text-secondary" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value as SectionType | "all")}>
            <option value="all">All Sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>{sectionLabels[s]}</option>
            ))}
          </select>
          <select className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-surface-raised text-text-secondary" value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "library")}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="library">Library</option>
          </select>
        </div>
      </div>

      {sections.map((section) => {
        const sectionEntries = grouped[section];
        if (!sectionEntries.length) return null;

        const version = useStore.getState().cvVersions.find((v) => v.id === activeVersionId);
        const order = version?.sectionOrder[section] ?? [];
        const sorted = [...sectionEntries].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

        return (
          <div key={section}>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-2">{sectionLabels[section]}</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, section)}>
              <SortableContext items={sorted.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {sorted.map((entry) => (
                    <SortableEntry key={entry.id} entry={entry} section={section} onDeleteRequest={setDeleteTargetId} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        );
      })}

      {filteredEntries.length === 0 && (
        <p className="text-sm text-text-muted">No entries found. Add entries from the editor tabs first.</p>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteEntry(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Entry"
        message="This entry will be permanently deleted."
      />
    </div>
  );
}
