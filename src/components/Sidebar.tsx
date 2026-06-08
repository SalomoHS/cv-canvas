"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Tab } from "@/lib/types";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "profile", label: "Profile & About", icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" },
  { id: "education", label: "Education", icon: "M12 14l9-5-9-5-9 5 9 5Zm0 0 6.16-3.422A12.083 12.083 0 0 1 12 21.5a12.083 12.083 0 0 1-6.16-10.922L12 14Z" },
  { id: "experience", label: "Experience", icon: "M9 17h6l3-3v-6h-2.5l-2-3h-5l-2 3H6v6l3 3ZM9 1l3 3H3l-2 2v12l2 2h16l2-2V7l-1-3h-5l-4-4h-2ZM6 14v-4h12v4H6Z" },
  { id: "projects", label: "Projects", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" },
  { id: "skills", label: "Skills", icon: "M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm0 8h14M9 3v18" },
  { id: "library", label: "Library", icon: "M4 21V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v14l-4-2-4 2-4-2-4 2ZM4 21l4-2 4 2 4-2 4 2" },
  { id: "preview", label: "Preview", icon: "M12 4v16m-8-8h16" },
];

export function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const { cvVersions, crates, activeVersionId, setActiveVersion, addVersion, deleteVersion, addCrate, deleteCrate, renameCrate } = useStore();
  const [expandedCrates, setExpandedCrates] = useState<Set<string>>(new Set(crates.map((c) => c.id)));
  const [renamingCrateId, setRenamingCrateId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const toggleCrate = (id: string) => {
    setExpandedCrates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const uncategorizedVersions = cvVersions.filter((v) => !v.crateId);

  return (
    <aside className="w-64 bg-surface-raised border-r border-border flex flex-col h-screen sticky top-0" style={{ fontFamily: "var(--font-family-body)" }}>
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-border-light">
        <h1 className="font-medium tracking-tight text-text-primary" style={{ fontFamily: "var(--font-family-display)", fontSize: "1.25rem" }}>
          CV Manager
        </h1>
        <p className="text-xs text-text-muted mt-0.5">Separate content from presentation</p>
      </div>

      {/* Version tree */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* New Folder */}
        <button
          onClick={() => {
            const name = prompt("Folder name:");
            if (name) addCrate(name);
          }}
          className="btn-ghost w-full justify-start mb-1 text-xs"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          New Folder
        </button>

        <div className="space-y-0.5">
          {crates.map((crate) => {
            const crateVersions = cvVersions.filter((v) => v.crateId === crate.id);
            const expanded = expandedCrates.has(crate.id);

            return (
              <div key={crate.id}>
                <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-surface-alt transition-colors">
                  <button
                    onClick={() => toggleCrate(crate.id)}
                    className="text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {expanded ? <path d="M6 9l6 6 6-6"/> : <path d="M9 6l6 6-6 6"/>}
                    </svg>
                  </button>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted shrink-0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  {renamingCrateId === crate.id ? (
                    <input
                      autoFocus
                      className="flex-1 bg-white border border-accent rounded px-1.5 py-0.5 text-xs outline-none shadow-[0_0_0_2px_#eef4fa]"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => {
                        if (renameValue.trim()) renameCrate(crate.id, renameValue.trim());
                        setRenamingCrateId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (renameValue.trim()) renameCrate(crate.id, renameValue.trim());
                          setRenamingCrateId(null);
                        }
                        if (e.key === "Escape") setRenamingCrateId(null);
                      }}
                    />
                  ) : (
                    <span className="flex-1 text-xs font-medium text-text-secondary truncate">{crate.name}</span>
                  )}
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={() => {
                        setRenamingCrateId(crate.id);
                        setRenameValue(crate.name);
                      }}
                      className="text-text-muted hover:text-text-primary p-0.5 rounded"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete folder "${crate.name}" and uncategorize its versions?`)) deleteCrate(crate.id);
                      }}
                      className="text-text-muted hover:text-danger p-0.5 rounded"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="ml-4 border-l border-border-light pl-2 mt-0.5 space-y-0.5">
                    {crateVersions.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setActiveVersion(v.id)}
                        className={`version-item ${activeVersionId === v.id ? "active" : ""}`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className={activeVersionId === v.id ? "text-accent" : "text-text-muted"}><circle cx="12" cy="12" r="6"/></svg>
                        <span className="flex-1 truncate">{v.name}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete version "${v.name}"?`)) deleteVersion(v.id);
                          }}
                          className="text-text-muted hover:text-danger p-0.5 rounded opacity-0 group-hover/ver:opacity-100 cursor-pointer"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const name = prompt("Version name:");
                        if (name) addVersion(name, crate.id);
                      }}
                      className="version-item text-text-muted hover:text-text-secondary"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      <span>New Version</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {uncategorizedVersions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted tracking-wider uppercase">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                Uncategorized
              </div>
              <div className="ml-4 space-y-0.5">
                {uncategorizedVersions.map((v) => (
                  <div key={v.id} className="group/ver">
                    <button
                      onClick={() => setActiveVersion(v.id)}
                      className={`version-item ${activeVersionId === v.id ? "active" : ""}`}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className={activeVersionId === v.id ? "text-accent" : "text-text-muted"}><circle cx="12" cy="12" r="6"/></svg>
                      <span className="flex-1 truncate">{v.name}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete version "${v.name}"?`)) deleteVersion(v.id);
                        }}
                        className="text-text-muted hover:text-danger p-0.5 rounded cursor-pointer"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              const name = prompt("Version name:");
              if (name) addVersion(name);
            }}
            className="btn-ghost w-full justify-start text-xs"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Version
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-3 border-t border-border-light space-y-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`sidebar-link ${activeTab === tab.id ? "active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Export */}
      <div className="px-3 py-3 border-t border-border-light space-y-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-text-muted px-2 mb-1.5">Export</p>
        <button
          onClick={() => useStore.getState().exportPDF()}
          className="sidebar-link text-xs"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Export PDF
        </button>
        <button
          onClick={() => useStore.getState().exportDOCX()}
          className="sidebar-link text-xs"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Export DOCX
        </button>
      </div>
    </aside>
  );
}

export type { Tab };
