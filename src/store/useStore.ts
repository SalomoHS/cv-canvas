"use client";

import { create } from "zustand";
import type { Profile, Entry, CVVersion, SectionType, EntryStatus, ExperienceSubType, SectionData } from "@/lib/types";

const API = {
  profile: {
    get: () => fetch("/api/profile").then((r) => r.json()),
    put: (data: Partial<Profile>) => fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  },
  entries: {
    get: () => fetch("/api/entries").then((r) => r.json()),
    post: (data: Partial<Entry>) => fetch("/api/entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    put: (id: string, data: Partial<Entry>) => fetch(`/api/entries/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    patch: (id: string, data: Partial<Entry>) => fetch(`/api/entries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    delete: (id: string) => fetch(`/api/entries/${id}`, { method: "DELETE" }).then((r) => r.json()),
  },
  versions: {
    get: () => fetch("/api/cv-versions").then((r) => r.json()),
    post: (data: Partial<CVVersion>) => fetch("/api/cv-versions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    put: (id: string, data: Partial<CVVersion>) => fetch(`/api/cv-versions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    delete: (id: string) => fetch(`/api/cv-versions/${id}`, { method: "DELETE" }).then((r) => r.json()),
  },
};

interface StoreState {
  profile: Profile | null;
  entries: Entry[];
  cvVersions: CVVersion[];
  activeVersionId: string | null;
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  setProfile: (profile: Profile) => Promise<void>;
  addEntry: (entry: { section: SectionType; subType?: ExperienceSubType; data: SectionData }) => Promise<Entry>;
  updateEntry: (id: string, data: Partial<Entry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setEntryStatus: (id: string, status: EntryStatus) => Promise<void>;
  addVersion: (name: string) => Promise<void>;
  updateVersion: (id: string, data: Partial<CVVersion>) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  setActiveVersion: (id: string) => void;
  reorderEntries: (section: SectionType, entryIds: string[]) => Promise<void>;
  reorderSkills: (entryIds: string[]) => Promise<void>;
  exportPDF: () => Promise<void>;
  exportDOCX: () => Promise<void>;
  exportJSON: () => Promise<void>;
  importJSON: (file: File) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  profile: null,
  entries: [],
  cvVersions: [],
  activeVersionId: null,
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true });
    try {
      const [profile, entries, cvVersions] = await Promise.all([
        API.profile.get(),
        API.entries.get(),
        API.versions.get(),
      ]);
      const activeVersionId = cvVersions.length > 0 ? cvVersions[0].id : null;
      set({
        profile: { ...profile, links: profile.links ?? [], summary: profile.summary ?? "" },
        entries: entries.map((e: Record<string, unknown>) => ({
          ...e,
          createdAt: new Date(e.createdAt as string).getTime(),
          updatedAt: new Date(e.updatedAt as string).getTime(),
        })),
        cvVersions,
        activeVersionId,
        loading: false,
      });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  setProfile: async (profile) => {
    const updated = await API.profile.put(profile);
    set({ profile: updated });
  },

  addEntry: async (entry) => {
    const created = await API.entries.post({
      section: entry.section,
      subType: entry.subType,
      status: "library",
      data: entry.data,
    } as Partial<Entry>);
    const e: Entry = { ...created, createdAt: Date.now(), updatedAt: Date.now() };
    set((s) => ({ entries: [...s.entries, e] }));
    return e;
  },

  updateEntry: async (id, data) => {
    const updated = await API.entries.put(id, data);
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...updated, updatedAt: Date.now() } : e)),
    }));
  },

  deleteEntry: async (id) => {
    await API.entries.delete(id);
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== id),
      cvVersions: s.cvVersions.map((v) => ({
        ...v,
        entryIds: v.entryIds.filter((eid) => eid !== id),
        sectionOrder: Object.fromEntries(
          Object.entries(v.sectionOrder).map(([key, ids]) => [key, ids.filter((eid: string) => eid !== id)])
        ) as Record<SectionType, string[]>,
        skillOrder: v.skillOrder.filter((eid) => eid !== id),
      })),
    }));
  },

  setEntryStatus: async (id, status) => {
    const updated = await API.entries.patch(id, { status });
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...updated, updatedAt: Date.now() } : e)),
    }));
  },

  addVersion: async (name) => {
    const entries = get().entries;
    const sections: SectionType[] = ["education", "experience", "project", "skill"];
    const sectionOrder = Object.fromEntries(
      sections.map((s) => [s, entries.filter((e) => e.section === s).map((e) => e.id)])
    ) as Record<SectionType, string[]>;
    const created = await API.versions.post({
      name,
      entryIds: entries.map((e) => e.id),
      sectionOrder,
      skillOrder: entries.filter((e) => e.section === "skill").map((e) => e.id),
    });
    set((s) => ({ cvVersions: [...s.cvVersions, created], activeVersionId: created.id }));
  },

  updateVersion: async (id, data) => {
    const updated = await API.versions.put(id, data);
    set((s) => ({
      cvVersions: s.cvVersions.map((v) => (v.id === id ? { ...v, ...updated } : v)),
    }));
  },

  deleteVersion: async (id) => {
    await API.versions.delete(id);
    set((s) => {
      const remaining = s.cvVersions.filter((v) => v.id !== id);
      return {
        cvVersions: remaining,
        activeVersionId: s.activeVersionId === id ? (remaining[0]?.id ?? null) : s.activeVersionId,
      };
    });
  },

  setActiveVersion: (id) => set({ activeVersionId: id }),

  reorderEntries: async (section, entryIds) => {
    const version = get().cvVersions.find((v) => v.id === get().activeVersionId);
    if (!version) return;
    const newOrder = { ...version.sectionOrder, [section]: entryIds };
    await get().updateVersion(version.id, { sectionOrder: newOrder });
  },

  reorderSkills: async (entryIds) => {
    const version = get().cvVersions.find((v) => v.id === get().activeVersionId);
    if (!version) return;
    await get().updateVersion(version.id, { skillOrder: entryIds });
  },

  exportPDF: async () => {
    const versionId = get().activeVersionId;
    if (!versionId) return;
    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv.pdf";
    a.click();
    URL.revokeObjectURL(url);
  },

  exportDOCX: async () => {
    const versionId = get().activeVersionId;
    if (!versionId) return;
    const res = await fetch("/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv.docx";
    a.click();
    URL.revokeObjectURL(url);
  },

  exportJSON: async () => {
    const res = await fetch("/api/backup");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON: async (file) => {
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await get().init();
    }
  },
}));
