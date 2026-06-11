"use client";

import { create } from "zustand";
import type { Profile, Entry, CVVersion, Crate, SectionType, EntryStatus, ExperienceSubType, SectionData, Tab, Summary } from "@/lib/types";

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
  crates: {
    get: () => fetch("/api/crates").then((r) => r.json()),
    post: (data: Partial<Crate>) => fetch("/api/crates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    put: (id: string, data: Partial<Crate>) => fetch(`/api/crates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    delete: (id: string) => fetch(`/api/crates/${id}`, { method: "DELETE" }).then((r) => r.json()),
  },
  summaries: {
    get: () => fetch("/api/summaries").then((r) => r.json()),
    post: (data: Partial<Summary>) => fetch("/api/summaries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    put: (id: string, data: Partial<Summary>) => fetch(`/api/summaries/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    delete: (id: string) => fetch(`/api/summaries/${id}`, { method: "DELETE" }).then((r) => r.json()),
  },
};

interface StoreState {
  profile: Profile | null;
  entries: Entry[];
  cvVersions: CVVersion[];
  crates: Crate[];
  activeVersionId: string | null;
  selectedEntryId: string | null;
  activeTab: Tab;
  summaries: Summary[];
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  setSelectedEntryId: (id: string | null) => void;
  setActiveTab: (tab: Tab) => void;
  setProfile: (profile: Profile) => Promise<void>;
  addEntry: (entry: { section: SectionType; subType?: ExperienceSubType; data: SectionData }) => Promise<Entry>;
  updateEntry: (id: string, data: Partial<Entry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setEntryStatus: (id: string, status: EntryStatus) => Promise<void>;
  addVersion: (name: string, crateId?: string) => Promise<void>;
  updateVersion: (id: string, data: Partial<CVVersion>) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  setActiveVersion: (id: string) => void;
  reorderEntries: (section: SectionType, entryIds: string[]) => Promise<void>;
  reorderSkills: (entryIds: string[]) => Promise<void>;
  addCrate: (name: string) => Promise<Crate>;
  deleteCrate: (id: string) => Promise<void>;
  renameCrate: (id: string, name: string) => Promise<void>;
  renameVersion: (id: string, name: string) => Promise<void>;
  addSummary: (name: string, content: string) => Promise<Summary>;
  updateSummary: (id: string, data: Partial<Summary>) => Promise<void>;
  deleteSummary: (id: string) => Promise<void>;
  exportPDF: () => Promise<void>;
  exportDOCX: () => Promise<void>;
  exportJSON: () => Promise<void>;
  importJSON: (file: File) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  profile: null,
  entries: [],
  cvVersions: [],
  crates: [],
  activeVersionId: null,
  selectedEntryId: null,
  activeTab: "preview" as Tab,
  summaries: [],
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true });
    try {
      const [profile, entries, cvVersions, crates, summaries] = await Promise.all([
        API.profile.get(),
        API.entries.get(),
        API.versions.get(),
        API.crates.get(),
        API.summaries.get(),
      ]);
      const activeVersionId = cvVersions.length > 0 ? cvVersions[0].id : null;
      set({
        profile: { ...profile, links: profile.links ?? [] },
        entries: entries.map((e: Record<string, unknown>) => ({
          ...e,
          createdAt: new Date(e.createdAt as string).getTime(),
          updatedAt: new Date(e.updatedAt as string).getTime(),
        })),
        cvVersions,
        crates,
        summaries,
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

    set((s) => {
      const base = { entries: [...s.entries, e] };
      const activeVersion = s.cvVersions.find((v) => v.id === s.activeVersionId);
      if (!activeVersion) return base;

      const newSectionOrder = { ...activeVersion.sectionOrder };
      if (entry.section === "skill") {
        newSectionOrder.skill = [...(newSectionOrder.skill || []), e.id];
        return {
          ...base,
          cvVersions: s.cvVersions.map((v) =>
            v.id === activeVersion.id
              ? { ...v, sectionOrder: newSectionOrder, skillOrder: [...v.skillOrder, e.id] }
              : v
          ),
        };
      }
      newSectionOrder[entry.section] = [...(newSectionOrder[entry.section] || []), e.id];
      return {
        ...base,
        cvVersions: s.cvVersions.map((v) =>
          v.id === activeVersion.id ? { ...v, sectionOrder: newSectionOrder } : v
        ),
      };
    });

    const state = get();
    const activeVersion = state.cvVersions.find((v) => v.id === state.activeVersionId);
    if (activeVersion) {
      const update: Record<string, unknown> = { sectionOrder: activeVersion.sectionOrder };
      if (entry.section === "skill") {
        update.skillOrder = activeVersion.skillOrder;
      }
      await API.versions.put(activeVersion.id, update);
    }

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

  addVersion: async (name, crateId) => {
    const entries = get().entries;
    const sections: SectionType[] = ["education", "experience", "project", "skill"];
    const sectionOrder = Object.fromEntries(
      sections.map((s) => [s, entries.filter((e) => e.section === s).map((e) => e.id)])
    ) as Record<SectionType, string[]>;
    const created = await API.versions.post({
      name,
      crateId: crateId ?? null,
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

  addCrate: async (name) => {
    const created = await API.crates.post({ name });
    set((s) => ({ crates: [...s.crates, created] }));
    return created;
  },

  deleteCrate: async (id) => {
    const versionsToDelete = get().cvVersions.filter((v) => v.crateId === id);
    await Promise.all(versionsToDelete.map((v) => API.versions.delete(v.id)));
    await API.crates.delete(id);
    set((s) => ({
      crates: s.crates.filter((c) => c.id !== id),
      cvVersions: s.cvVersions.filter((v) => v.crateId !== id),
      activeVersionId: versionsToDelete.some((v) => v.id === s.activeVersionId) ? (s.cvVersions.find((v) => v.crateId !== id)?.id ?? null) : s.activeVersionId,
    }));
  },

  renameCrate: async (id, name) => {
    const updated = await API.crates.put(id, { name });
    set((s) => ({ crates: s.crates.map((c) => (c.id === id ? { ...c, ...updated } : c)) }));
  },

  renameVersion: async (id, name) => {
    const updated = await API.versions.put(id, { name });
    set((s) => ({ cvVersions: s.cvVersions.map((v) => (v.id === id ? { ...v, ...updated } : v)) }));
  },

  setSelectedEntryId: (id) => set({ selectedEntryId: id }),

  setActiveTab: (tab) => set({ activeTab: tab }),

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

  addSummary: async (content) => {
    const created = await API.summaries.post({ content, isDefault: false });
    set((s) => ({ summaries: [...s.summaries, created] }));
    return created;
  },

  updateSummary: async (id, data) => {
    const updated = await API.summaries.put(id, data);
    set((s) => ({
      summaries: s.summaries.map((sum) => (sum.id === id ? { ...sum, ...updated } : sum)),
    }));
  },

  deleteSummary: async (id) => {
    await API.summaries.delete(id);
    set((s) => ({ summaries: s.summaries.filter((sum) => sum.id !== id) }));
  },

  exportPDF: async () => {
    const versionId = get().activeVersionId;
    if (!versionId) return;
    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || "Failed to export PDF");
    }
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || "Failed to export DOCX");
    }
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
