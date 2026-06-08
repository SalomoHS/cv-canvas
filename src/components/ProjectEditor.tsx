"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";

export function ProjectEditor() {
  const { entries, addEntry, updateEntry, deleteEntry } = useStore();
  const projEntries = entries.filter((e) => e.section === "project");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    link: "",
    year: "",
    bullets: [""],
  });

  const resetForm = () => {
    setForm({ name: "", link: "", year: "", bullets: [""] });
    setEditingId(null);
  };

  const openEdit = (entry: (typeof projEntries)[0]) => {
    const d = entry.data as { name: string; link?: string; year: string; bullets: string[] };
    setForm({
      name: d.name,
      link: d.link ?? "",
      year: d.year,
      bullets: d.bullets?.length ? d.bullets : [""],
    });
    setEditingId(entry.id);
  };

  const save = async () => {
    const data = {
      name: form.name,
      link: form.link || undefined,
      year: form.year,
      bullets: form.bullets.filter((b) => b.trim()),
    };
    if (editingId) {
      await updateEntry(editingId, { data } as Partial<typeof entries[0]>);
    } else {
      await addEntry({ section: "project", data });
    }
    resetForm();
  };

  const remove = async (id: string) => {
    if (confirm("Delete this project?")) await deleteEntry(id);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">Projects</h2>

      <div className="space-y-3 border rounded-lg p-4 bg-white">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="2025" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Link (optional)</label>
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bullets</label>
          {form.bullets.map((b, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input className="flex-1 border rounded px-3 py-2 text-sm" value={b} onChange={(e) => {
                const copy = [...form.bullets];
                copy[i] = e.target.value;
                setForm({ ...form, bullets: copy });
              }} />
              {form.bullets.length > 1 && (
                <button onClick={() => setForm({ ...form, bullets: form.bullets.filter((_, idx) => idx !== i) })} className="text-red-500 text-sm">&times;</button>
              )}
            </div>
          ))}
          <button onClick={() => setForm({ ...form, bullets: [...form.bullets, ""] })} className="text-blue-600 text-sm hover:underline">+ Add bullet</button>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
            {editingId ? "Update" : "Add"} Project
          </button>
          {editingId && <button onClick={resetForm} className="text-zinc-600 text-sm hover:underline">Cancel</button>}
        </div>
      </div>

      <div className="space-y-2">
        {projEntries.map((entry) => {
          const d = entry.data as { name: string; link?: string; year: string };
          return (
            <div key={entry.id} className="border rounded p-3 flex justify-between items-start">
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-sm text-zinc-600">{d.year}{d.link ? ` | ${d.link}` : ""}</p>
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
