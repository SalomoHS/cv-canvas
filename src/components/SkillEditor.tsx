"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";

export function SkillEditor() {
  const { entries, addEntry, updateEntry, deleteEntry, selectedEntryId, setSelectedEntryId } = useStore();
  const skillEntries = entries.filter((e) => e.section === "skill");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: "", items: [""] });

  useEffect(() => {
    if (!selectedEntryId) return;
    const entry = skillEntries.find((e) => e.id === selectedEntryId);
    if (entry) openEdit(entry);
  }, [selectedEntryId]);

  const resetForm = () => {
    setForm({ category: "", items: [""] });
    setEditingId(null);
  };

  const openEdit = (entry: (typeof skillEntries)[0]) => {
    const d = entry.data as { category: string; items: string[] };
    setForm({ category: d.category, items: d.items?.length ? d.items : [""] });
    setEditingId(entry.id);
  };

  const save = async () => {
    const data = { category: form.category, items: form.items.filter((i) => i.trim()) };
    if (editingId) {
      await updateEntry(editingId, { data } as Partial<typeof entries[0]>);
    } else {
      await addEntry({ section: "skill", data });
      resetForm();
    }
  };

  const remove = async (id: string) => {
    if (confirm("Delete this skill category?")) await deleteEntry(id);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6 animate-fade-in">
      <h2 className="text-lg font-semibold tracking-tight text-text-primary">Skills</h2>

      <div className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Category</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="e.g. Technical Skills" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Skills</label>
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <input className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={item} onChange={(e) => {
                const copy = [...form.items];
                copy[i] = e.target.value;
                setForm({ ...form, items: copy });
              }} />
              {form.items.length > 1 && (
                <button onClick={() => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })} className="btn-danger p-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setForm({ ...form, items: [...form.items, ""] })} className="btn-ghost text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add skill
          </button>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={save} className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {editingId ? "Update" : "Add"} Category
          </button>
          {editingId && <button onClick={resetForm} className="btn-ghost">Cancel</button>}
        </div>
      </div>

      <div className="space-y-2">
        {skillEntries.map((entry) => {
          const d = entry.data as { category: string; items: string[] };
          const isSelected = selectedEntryId === entry.id;
          return (
            <div
              key={entry.id}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("application/x-cv-add-entry-id", entry.id); e.dataTransfer.effectAllowed = "move"; }}
              onClick={() => setSelectedEntryId(entry.id)}
              className={`entry-card ${isSelected ? "selected" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text-primary">{d.category}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{d.items.join(", ")}</p>
                </div>
                <div className="flex gap-1 ml-3 shrink-0">
                  <button onClick={() => openEdit(entry)} className="btn-ghost text-xs">Edit</button>
                  <button onClick={() => remove(entry.id)} className="btn-danger text-xs">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
