"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useStore } from "@/store/useStore";

export const ProjectEditor = memo(function ProjectEditor() {
  const entries = useStore((s) => s.entries);
  const addEntry = useStore((s) => s.addEntry);
  const updateEntry = useStore((s) => s.updateEntry);
  const deleteEntry = useStore((s) => s.deleteEntry);
  const selectedEntryId = useStore((s) => s.selectedEntryId);
  const setSelectedEntryId = useStore((s) => s.setSelectedEntryId);

  const projEntries = useMemo(
    () => entries.filter((e) => e.section === "project"),
    [entries]
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    link: "",
    year: "",
    bullets: [""],
  });

  useEffect(() => {
    if (!selectedEntryId) return;
    const entry = projEntries.find((e) => e.id === selectedEntryId);
    if (entry) openEdit(entry);
  }, [selectedEntryId]);

  const resetForm = () => {
    setForm({ name: "", link: "", year: "", bullets: [""] });
    setEditingId(null);
    setSelectedEntryId(null);
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

  const isFormValid = form.name.trim() && form.year.trim();

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
      resetForm();
    }
  };

  const remove = async (id: string) => {
    if (confirm("Delete this project?")) await deleteEntry(id);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6 animate-fade-in">
      <h2 className="text-lg font-semibold tracking-tight text-text-primary">Projects</h2>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Project Name</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Year</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="2025" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Link (optional)</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Bullets</label>
          {form.bullets.map((b, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <input className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={b} onChange={(e) => {
                const copy = [...form.bullets];
                copy[i] = e.target.value;
                setForm({ ...form, bullets: copy });
              }} />
              {form.bullets.length > 1 && (
                <button onClick={() => setForm({ ...form, bullets: form.bullets.filter((_, idx) => idx !== i) })} className="btn-danger p-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setForm({ ...form, bullets: [...form.bullets, ""] })} className="btn-ghost text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add bullet
          </button>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={save} className="btn-primary" disabled={!isFormValid}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {editingId ? "Update" : "Add"} Project
          </button>
          {editingId && <button onClick={resetForm} className="btn-ghost">Cancel</button>}
        </div>
      </div>

      <div className="space-y-2">
        {projEntries.map((entry) => {
          const d = entry.data as { name: string; link?: string; year: string };
          const isSelected = selectedEntryId === entry.id;
          return (
            <div
              key={entry.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/x-cv-add-entry-id", entry.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onClick={() => setSelectedEntryId(entry.id)}
              className={`entry-card ${isSelected ? "selected" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text-primary">{d.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{d.year}{d.link ? <span className="text-text-muted"> · {d.link}</span> : ""}</p>
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
});
