"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { v4 as uuid } from "uuid";

export function EducationEditor() {
  const { entries, addEntry, updateEntry, deleteEntry } = useStore();
  const eduEntries = entries.filter((e) => e.section === "education");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    institution: "",
    degree: "",
    field: "",
    period: "",
    gpa: "",
    relatedModules: [""],
  });

  const resetForm = () => {
    setForm({ institution: "", degree: "", field: "", period: "", gpa: "", relatedModules: [""] });
    setEditingId(null);
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
    }
    resetForm();
  };

  const remove = async (id: string) => {
    if (confirm("Delete this education entry?")) await deleteEntry(id);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">Education</h2>

      <div className="space-y-3 border rounded-lg p-4 bg-white">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Institution</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Sep 2021 - Aug 2025" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Degree</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Field</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GPA (optional)</label>
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="3.76/4.00" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Related Modules</label>
          {form.relatedModules.map((mod, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input className="flex-1 border rounded px-3 py-2 text-sm" value={mod} onChange={(e) => {
                const copy = [...form.relatedModules];
                copy[i] = e.target.value;
                setForm({ ...form, relatedModules: copy });
              }} />
              {form.relatedModules.length > 1 && (
                <button onClick={() => setForm({ ...form, relatedModules: form.relatedModules.filter((_, idx) => idx !== i) })} className="text-red-500 text-sm">&times;</button>
              )}
            </div>
          ))}
          <button onClick={() => setForm({ ...form, relatedModules: [...form.relatedModules, ""] })} className="text-blue-600 text-sm hover:underline">+ Add module</button>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
            {editingId ? "Update" : "Add"} Entry
          </button>
          {editingId && <button onClick={resetForm} className="text-zinc-600 text-sm hover:underline">Cancel</button>}
        </div>
      </div>

      <div className="space-y-2">
        {eduEntries.map((entry) => {
          const d = entry.data as { institution: string; degree: string; field: string; period: string; gpa?: string; relatedModules: string[] };
          return (
            <div key={entry.id} className="border rounded p-3 flex justify-between items-start">
              <div>
                <p className="font-medium">{d.institution}</p>
                <p className="text-sm text-zinc-600">{d.degree}{d.field ? `, ${d.field}` : ""} | {d.period}</p>
                {d.gpa && <p className="text-xs text-zinc-500">GPA: {d.gpa}</p>}
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
