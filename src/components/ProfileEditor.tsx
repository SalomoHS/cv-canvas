"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";

export function ProfileEditor() {
  const { profile, setProfile } = useStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    summary: "",
    links: [{ label: "", url: "" }],
  });

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
        <label className="block text-sm font-medium mb-1">About Me</label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm min-h-[120px]"
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
        />
      </div>
    </div>
  );
}
