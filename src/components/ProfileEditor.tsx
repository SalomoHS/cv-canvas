"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";

export function ProfileEditor() {
  const { profile, setProfile, summaries, addSummary, updateSummary, deleteSummary, cvVersions, activeVersionId, updateVersion } = useStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    links: [{ label: "", url: "" }],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  if (!profile) return <div className="p-6 text-text-muted">Loading...</div>;

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateLink = (i: number, field: "label" | "url", value: string) => {
    const links = [...form.links];
    links[i] = { ...links[i], [field]: value };
    update("links", links);
  };

  const addLink = () => {
    update("links", [...form.links, { label: "", url: "" }]);
  };

  const removeLink = (i: number) => {
    update("links", form.links.filter((_, idx) => idx !== i));
  };

  const save = () => setProfile(form);

  const handleAddSummary = async () => {
    const name = prompt("Version name:") || "Untitled";
    await addSummary(name, "New About Me version...");
  };

  const handleEditSummary = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      await updateSummary(editingId, { content: editContent });
      setEditingId(null);
      setEditContent("");
    }
  };

  const handleStartRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameName(currentName);
  };

  const handleSaveRename = async () => {
    if (renamingId) {
      await updateSummary(renamingId, { name: renameName });
      setRenamingId(null);
      setRenameName("");
    }
  };

  const handleDeleteSummary = async (id: string) => {
    if (confirm("Delete this About Me version?")) {
      await deleteSummary(id);
    }
  };

  const handleSelectSummary = async (summaryId: string) => {
    if (activeVersionId) {
      await updateVersion(activeVersionId, { selectedSummaryId: summaryId });
    }
  };

  const activeVersion = cvVersions.find((v) => v.id === activeVersionId);
  const selectedSummaryId = activeVersion?.selectedSummaryId;

  return (
    <div className="p-6 max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">Profile & About Me</h2>
        <button onClick={save} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Name</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Phone</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Email</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Location</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised" value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <label className="block text-xs font-medium text-text-secondary tracking-wide uppercase">Links</label>
        <div className="space-y-2">
          {form.links.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised"
                placeholder="LinkedIn"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
              />
              <input
                className="flex-[2] border border-border rounded-lg px-3 py-2 text-sm bg-surface-raised"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
              />
              <button onClick={() => removeLink(i)} className="btn-danger p-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
          <button onClick={addLink} className="btn-ghost text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add link
          </button>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-text-secondary tracking-wide uppercase">About Me Versions</label>
          <button onClick={handleAddSummary} className="btn-ghost text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add version
          </button>
        </div>
        <div className="space-y-3">
          {summaries.length === 0 ? (
            <p className="text-sm text-text-muted">No About Me versions yet.</p>
          ) : (
            summaries.map((summary) => (
              <div key={summary.id} className="border border-border rounded-lg p-4 bg-surface-alt/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="selectedSummary"
                      checked={selectedSummaryId === summary.id}
                      onChange={() => handleSelectSummary(summary.id)}
                      className="accent-accent w-3.5 h-3.5"
                    />
                    <span className="text-xs font-medium text-text-primary">
                      {summary.name || "Untitled"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleStartRename(summary.id, summary.name || "")} className="btn-ghost text-xs">Rename</button>
                    <button onClick={() => handleEditSummary(summary.id, summary.content)} className="btn-ghost text-xs">Edit</button>
                    <button onClick={() => handleDeleteSummary(summary.id)} className="btn-danger text-xs">Delete</button>
                  </div>
                </div>
                {renamingId === summary.id ? (
                  <div className="flex gap-2 mb-2">
                    <input className="flex-1 border border-border rounded-lg px-2 py-1.5 text-sm bg-surface-raised" value={renameName} onChange={(e) => setRenameName(e.target.value)} autoFocus />
                    <button onClick={handleSaveRename} className="btn-primary">Save</button>
                    <button onClick={() => setRenamingId(null)} className="btn-ghost">Cancel</button>
                  </div>
                ) : editingId === summary.id ? (
                  <div className="space-y-2">
                    <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[100px] bg-surface-raised" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="btn-primary">Save</button>
                      <button onClick={() => setEditingId(null)} className="btn-ghost">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{summary.content}</p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
