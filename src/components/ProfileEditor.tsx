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

  if (!profile) return <div className="p-6">Loading...</div>;

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
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Profile & About Me</h2>
        <button onClick={save} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
          Save
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.location} onChange={(e) => update("location", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Links</label>
        <div className="space-y-2">
          {form.links.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="Label (e.g. LinkedIn)"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
              />
              <input
                className="flex-[2] border rounded px-3 py-2 text-sm"
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
              />
              <button onClick={() => removeLink(i)} className="text-red-500 text-sm hover:text-red-700">
                &times;
              </button>
            </div>
          ))}
          <button onClick={addLink} className="text-blue-600 text-sm hover:underline">
            + Add link
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">About Me Versions</label>
          <button onClick={handleAddSummary} className="text-blue-600 text-sm hover:underline">
            + Add version
          </button>
        </div>
        <div className="space-y-3">
          {summaries.length === 0 ? (
            <p className="text-sm text-gray-500">No About Me versions yet. Click "Add version" to create one.</p>
          ) : (
            summaries.map((summary) => (
              <div key={summary.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="selectedSummary"
                      checked={selectedSummaryId === summary.id}
                      onChange={() => handleSelectSummary(summary.id)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm font-medium">
                      {selectedSummaryId === summary.id ? "Selected" : "Select for CV"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartRename(summary.id, summary.name || "")}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleEditSummary(summary.id, summary.content)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSummary(summary.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {renamingId === summary.id ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      value={renameName}
                      onChange={(e) => setRenameName(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveRename}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setRenamingId(null)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : editingId === summary.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800">{summary.name || "Untitled"}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.content}</p>
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
