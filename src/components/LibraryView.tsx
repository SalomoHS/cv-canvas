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

const sectionLabels: Record<SectionType, string> = {
  education: "Education",
  experience: "Experience",
  project: "Projects",
  skill: "Skills",
};

function SortableEntry({ entry, section }: { entry: Entry; section: SectionType }) {
  const { setEntryStatus, deleteEntry, activeVersionId, cvVersions, updateVersion } = useStore();
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
        return <span className="text-sm">{d.institution} — {d.degree} ({d.period})</span>;
      }
      case "experience": {
        const d = entry.data as { role: string; organization: string; period: string };
        const subLabel = (entry.subType ?? "professional") === "professional" ? "Professional" : "Organizational";
        return <span className="text-sm">[{subLabel}] {d.role} @ {d.organization} ({d.period})</span>;
      }
      case "project": {
        const d = entry.data as { name: string; year: string };
        return <span className="text-sm">{d.name} ({d.year})</span>;
      }
      case "skill": {
        const d = entry.data as { category: string; items: string[] };
        return <span className="text-sm">{d.category}: {d.items.join(", ")}</span>;
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-2 rounded border ${isInVersion ? "bg-green-50 border-green-300" : "bg-zinc-50 border-zinc-200"}`}>
      <button {...attributes} {...listeners} className="cursor-grab text-zinc-400 hover:text-zinc-600 text-sm">⠿</button>
      <div className="flex-1 min-w-0">{renderData()}</div>
      <button onClick={toggleLibrary} className={`text-xs px-2 py-0.5 rounded ${isInVersion ? "bg-green-200 text-green-800" : "bg-zinc-200 text-zinc-600"}`}>
        {isInVersion ? "Active" : "Library"}
      </button>
      <button onClick={() => deleteEntry(entry.id)} className="text-red-400 hover:text-red-600 text-sm">&times;</button>
    </div>
  );
}

export function LibraryView() {
  const { entries, reorderEntries, activeVersionId } = useStore();
  const [filter, setFilter] = useState<"all" | "active" | "library">("all");
  const [sectionFilter, setSectionFilter] = useState<SectionType | "all">("all");

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
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Library</h2>
        <div className="flex gap-2">
          <select className="border rounded px-2 py-1 text-sm" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value as SectionType | "all")}>
            <option value="all">All Sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>{sectionLabels[s]}</option>
            ))}
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "library")}>
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
            <h3 className="font-semibold text-sm uppercase text-zinc-500 mb-2">{sectionLabels[section]}</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, section)}>
              <SortableContext items={sorted.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {sorted.map((entry) => (
                    <SortableEntry key={entry.id} entry={entry} section={section} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        );
      })}

      {filteredEntries.length === 0 && (
        <p className="text-zinc-500 text-sm">No entries found. Add entries from the editor tabs first.</p>
      )}
    </div>
  );
}
