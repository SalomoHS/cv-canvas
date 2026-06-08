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
    <div className="p-6 max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">Skills</h2>

      <div className="space-y-3 border rounded-lg p-4 bg-white">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Technical Skills" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Skills (one per line)</label>
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input className="flex-1 border rounded px-3 py-2 text-sm" value={item} onChange={(e) => {
                const copy = [...form.items];
                copy[i] = e.target.value;
                setForm({ ...form, items: copy });
              }} />
              {form.items.length > 1 && (
                <button onClick={() => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })} className="text-red-500 text-sm">&times;</button>
              )}
            </div>
          ))}
          <button onClick={() => setForm({ ...form, items: [...form.items, ""] })} className="text-blue-600 text-sm hover:underline">+ Add skill</button>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
            {editingId ? "Update" : "Add"} Category
          </button>
          {editingId && <button onClick={resetForm} className="text-zinc-600 text-sm hover:underline">Cancel</button>}
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
              className={`border rounded p-3 flex justify-between items-start cursor-grab active:cursor-grabbing hover:bg-zinc-50 transition-colors ${isSelected ? "ring-2 ring-blue-400" : ""}`}
            >
              <div>
                <p className="font-medium">{d.category}</p>
                <p className="text-sm text-zinc-600">{d.items.join(", ")}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(entry)} className="text-blue-600 text-sm hover:underline">Edit</button>
                <button onClick={() => remove(entry.id)} className="text-red-500 text-sm hover:underline">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
