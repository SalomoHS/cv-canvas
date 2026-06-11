"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useStore } from "@/store/useStore";
import type { ExperienceSubType } from "@/lib/types";

export const ExperienceEditor = memo(function ExperienceEditor() {
  const entries = useStore((s) => s.entries);
  const addEntry = useStore((s) => s.addEntry);
  const updateEntry = useStore((s) => s.updateEntry);
  const deleteEntry = useStore((s) => s.deleteEntry);
  const selectedEntryId = useStore((s) => s.selectedEntryId);
  const setSelectedEntryId = useStore((s) => s.setSelectedEntryId);

  const expEntries = useMemo(
    () => entries.filter((e) => e.section === "experience"),
    [entries]
  );

  const grouped = useMemo(() => ({
    professional: expEntries.filter((e) => (e.subType ?? "professional") === "professional"),
    organizational: expEntries.filter((e) => e.subType === "organizational"),
  }), [expEntries]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [subType, setSubType] = useState<ExperienceSubType>("professional");
  const [form, setForm] = useState({
    role: "",
    organization: "",
    location: "",
    period: "",
    bullets: [""],
  });

  useEffect(() => {
    if (!selectedEntryId) return;
    const entry = expEntries.find((e) => e.id === selectedEntryId);
    if (entry) openEdit(entry);
  }, [selectedEntryId]);

  const resetForm = () => {
    setForm({ role: "", organization: "", location: "", period: "", bullets: [""] });
    setEditingId(null);
    setSubType("professional");
    setSelectedEntryId(null);
  };

  const openEdit = (entry: (typeof expEntries)[0]) => {
    const d = entry.data as { role: string; organization: string; location: string; period: string; bullets: string[] };
    setForm({
      role: d.role,
      organization: d.organization,
      location: d.location,
      period: d.period,
      bullets: d.bullets?.length ? d.bullets : [""],
    });
    setSubType((entry.subType as ExperienceSubType) ?? "professional");
    setEditingId(entry.id);
  };

  const isFormValid = form.role.trim() && form.organization.trim() && form.location.trim() && form.period.trim();

  const save = async () => {
    const data = {
      role: form.role,
      organization: form.organization,
      location: form.location,
      period: form.period,
      bullets: form.bullets.filter((b) => b.trim()),
    };
    if (editingId) {
      await updateEntry(editingId, { data: data as Partial<typeof entries[0]["data"]>, subType } as Partial<typeof entries[0]>);
    } else {
      await addEntry({ section: "experience", subType, data });
      resetForm();
    }
  };

  const remove = async (id: string) => {
    if (confirm("Delete this experience entry?")) await deleteEntry(id);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6 animate-fade-in">
      <h2 className="text-lg font-semibold tracking-tight text-text-primary">Experience</h2>

      <div className="card p-5 space-y-4">
        <div className="flex gap-4 mb-1">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" name="subtype" checked={subType === "professional"} onChange={() => setSubType("professional")} className="accent-accent w-3.5 h-3.5" />
            <span className="text-text-primary">Professional</span>
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" name="subtype" checked={subType === "organizational"} onChange={() => setSubType("organizational")} className="accent-accent w-3.5 h-3.5" />
            <span className="text-text-primary">Organizational</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Role</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Organization</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Location</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Period</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="Feb 2024 — Feb 2025" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </div>
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
            {editingId ? "Update" : "Add"} Entry
          </button>
          {editingId && <button onClick={resetForm} className="btn-ghost">Cancel</button>}
        </div>
      </div>

      {(["professional", "organizational"] as const).map((st) => (
        <div key={st}>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-3">{st === "professional" ? "Professional" : "Organizational"} Experience</h3>
          {grouped[st].length === 0 && <p className="text-sm text-text-muted">No entries.</p>}
          <div className="space-y-2">
            {grouped[st].map((entry) => {
              const d = entry.data as { role: string; organization: string; period: string };
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
                      <p className="font-medium text-sm text-text-primary">{d.role}<span className="text-text-muted font-normal">, {d.organization}</span></p>
                      <p className="text-xs text-text-secondary mt-0.5">{d.period}</p>
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
      ))}
    </div>
  );
});
