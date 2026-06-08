"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import type { ExperienceSubType } from "@/lib/types";

export function ExperienceEditor() {
  const { entries, addEntry, updateEntry, deleteEntry, selectedEntryId, setSelectedEntryId } = useStore();
  const expEntries = entries.filter((e) => e.section === "experience");

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

  const grouped = {
    professional: expEntries.filter((e) => (e.subType ?? "professional") === "professional"),
    organizational: expEntries.filter((e) => e.subType === "organizational"),
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">Experience</h2>

      <div className="space-y-3 border rounded-lg p-4 bg-white">
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-1 text-sm">
            <input type="radio" name="subtype" checked={subType === "professional"} onChange={() => setSubType("professional")} />
            Professional
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="radio" name="subtype" checked={subType === "organizational"} onChange={() => setSubType("organizational")} />
            Organizational
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Organization</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Feb 2024 - Feb 2025" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </div>
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
            {editingId ? "Update" : "Add"} Entry
          </button>
          {editingId && <button onClick={resetForm} className="text-zinc-600 text-sm hover:underline">Cancel</button>}
        </div>
      </div>

      {(["professional", "organizational"] as const).map((st) => (
        <div key={st}>
          <h3 className="font-medium text-sm uppercase text-zinc-500 mb-2">{st === "professional" ? "Professional" : "Organizational"} Experience</h3>
          {grouped[st].length === 0 && <p className="text-sm text-zinc-400">No entries</p>}
          {grouped[st].map((entry) => {
            const d = entry.data as { role: string; organization: string; period: string };
            const isSelected = selectedEntryId === entry.id;
            return (
              <div
                key={entry.id}
                draggable
                onDragStart={(e) => { e.dataTransfer.setData("application/x-cv-add-entry-id", entry.id); e.dataTransfer.effectAllowed = "move"; }}
                onClick={() => setSelectedEntryId(entry.id)}
                className={`border rounded p-3 flex justify-between items-start mb-2 cursor-grab active:cursor-grabbing hover:bg-zinc-50 transition-colors ${isSelected ? "ring-2 ring-blue-400" : ""}`}
              >
                <div>
                  <p className="font-medium">{d.role}, {d.organization}</p>
                  <p className="text-sm text-zinc-600">{d.period}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(entry)} className="text-blue-600 text-sm hover:underline">Edit</button>
                  <button onClick={() => remove(entry.id)} className="text-red-500 text-sm hover:underline">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
