"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { ConfirmDeleteModal } from "./Modals";

export const EducationEditor = memo(function EducationEditor() {
  const entries = useStore((s) => s.entries);
  const addEntry = useStore((s) => s.addEntry);
  const updateEntry = useStore((s) => s.updateEntry);
  const deleteEntry = useStore((s) => s.deleteEntry);
  const selectedEntryId = useStore((s) => s.selectedEntryId);
  const setSelectedEntryId = useStore((s) => s.setSelectedEntryId);

  const eduEntries = useMemo(
    () => entries.filter((e) => e.section === "education"),
    [entries]
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [form, setForm] = useState({
    institution: "",
    degree: "",
    field: "",
    period: "",
    gpa: "",
    relatedModules: [""],
  });

  useEffect(() => {
    if (!selectedEntryId) {
      setEditingId(null);
      setForm({ institution: "", degree: "", field: "", period: "", gpa: "", relatedModules: [""] });
      return;
    }
    const entry = eduEntries.find((e) => e.id === selectedEntryId);
    if (entry) openEdit(entry);
  }, [selectedEntryId]);

  const resetForm = () => {
    setForm({ institution: "", degree: "", field: "", period: "", gpa: "", relatedModules: [""] });
    setEditingId(null);
    setSelectedEntryId(null);
  };

  const openEdit = (entry: (typeof eduEntries)[0]) => {
    const d = entry.data as { institution: string; degree: string; field: string; period: string; gpa?: string; relatedModules: string[] };
    setForm({
      institution: d.institution,
      degree: d.degree,
      field: d.field,
      period: d.period,
      gpa: d.gpa ?? "",
      relatedModules: d.relatedModules?.length ? d.relatedModules : [""],
    });
    setEditingId(entry.id);
  };

  const isFormValid = form.institution.trim() && form.degree.trim() && form.field.trim() && form.period.trim();

  const save = async () => {
    const data = {
      institution: form.institution,
      degree: form.degree,
      field: form.field,
      period: form.period,
      gpa: form.gpa || undefined,
      relatedModules: form.relatedModules.filter((m) => m.trim()),
    };
    if (editingId) {
      await updateEntry(editingId, { data } as Partial<typeof entries[0]>);
    } else {
      await addEntry({ section: "education", data });
      resetForm();
    }
  };

  const remove = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTargetId) {
      await deleteEntry(deleteTargetId);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, deleteEntry]);

  return (
    <div className="p-6 max-w-2xl space-y-6 animate-fade-in" onClick={() => setSelectedEntryId(null)}>
      <h2 className="text-lg font-semibold tracking-tight text-text-primary">Education</h2>

      <div className="card p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Institution</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="University of Example" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Period</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="Sep 2021 — Aug 2025" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Degree</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="Bachelor of Science" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Field</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="Computer Science" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">GPA (optional)</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="3.76 / 4.00" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Related Modules</label>
          {form.relatedModules.map((mod, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <input className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" placeholder="e.g. Data Structures" value={mod} onChange={(e) => {
                const copy = [...form.relatedModules];
                copy[i] = e.target.value;
                setForm({ ...form, relatedModules: copy });
              }} />
              {form.relatedModules.length > 1 && (
                <button onClick={() => setForm({ ...form, relatedModules: form.relatedModules.filter((_, idx) => idx !== i) })} className="btn-danger p-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setForm({ ...form, relatedModules: [...form.relatedModules, ""] })} className="btn-ghost text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add module
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

      <div className="space-y-2">
        {eduEntries.map((entry) => {
          const d = entry.data as { institution: string; degree: string; field: string; period: string; gpa?: string; relatedModules: string[] };
          const isSelected = selectedEntryId === entry.id;
          return (
            <div
              key={entry.id}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("application/x-cv-add-entry-id", entry.id); e.dataTransfer.effectAllowed = "move"; }}
              onClick={(e) => { e.stopPropagation(); setSelectedEntryId(entry.id); }}
              className={`entry-card ${isSelected ? "selected" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text-primary">{d.institution}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{d.degree}{d.field ? `, ${d.field}` : ""} <span className="text-text-muted mx-1">·</span> {d.period}</p>
                  {d.gpa && <p className="text-xs text-text-muted mt-0.5">GPA: {d.gpa}</p>}
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

      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Education Entry"
        message="This education entry will be permanently deleted."
      />
    </div>
  );
});
