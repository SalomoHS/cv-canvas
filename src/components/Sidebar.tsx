"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Tab } from "@/lib/types";

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile & About" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "library", label: "Library" },
  { id: "preview", label: "Preview" },
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
    <aside className="w-64 bg-zinc-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-zinc-700">
        <h1 className="text-lg font-bold">CV Manager</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 border-b border-zinc-700">
          <button
            onClick={() => {
              const name = prompt("Folder name:");
              if (name) addCrate(name);
            }}
            className="w-full text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded"
          >
            + New Folder
          </button>
        </div>

        <div className="p-1 space-y-0.5 text-sm">
          {crates.map((crate) => {
            const crateVersions = cvVersions.filter((v) => v.crateId === crate.id);
            const expanded = expandedCrates.has(crate.id);

            return (
              <div key={crate.id}>
                <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-zinc-800 rounded group">
                  <button
                    onClick={() => toggleCrate(crate.id)}
                    className="text-zinc-500 hover:text-white w-4 text-xs"
                  >
                    {expanded ? "▼" : "▶"}
                  </button>
                  {renamingCrateId === crate.id ? (
                    <input
                      autoFocus
                      className="flex-1 bg-zinc-700 text-white text-xs px-1 py-0.5 rounded outline-none"
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
                    <span className="flex-1 text-zinc-300 truncate">{crate.name}</span>
                  )}
                  <button
                    onClick={() => {
                      setRenamingCrateId(crate.id);
                      setRenameValue(crate.name);
                    }}
                    className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 text-xs px-1"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete folder "${crate.name}" and uncategorize its versions?`)) deleteCrate(crate.id);
                    }}
                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>

                {expanded && (
                  <div className="ml-3 border-l border-zinc-700 pl-2">
                    {crateVersions.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setActiveVersion(v.id)}
                        className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs ${
                          activeVersionId === v.id
                            ? "bg-blue-700 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        <span className="text-zinc-500">○</span>
                        <span className="flex-1 truncate">{v.name}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete version "${v.name}"?`)) deleteVersion(v.id);
                          }}
                          className="cursor-pointer text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 text-xs px-0.5"
                        >
                          ✕
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const name = prompt("Version name:");
                        if (name) addVersion(name, crate.id);
                      }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs text-zinc-500 hover:text-white hover:bg-zinc-800"
                    >
                      <span className="text-zinc-600">+</span>
                      <span>New Version</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {uncategorizedVersions.length > 0 && (
            <div>
              <div className="flex items-center gap-1 px-2 py-1.5 text-zinc-500 text-xs">
                <span>Uncategorized</span>
              </div>
              <div className="ml-2">
                {uncategorizedVersions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVersion(v.id)}
                    className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs ${
                      activeVersionId === v.id
                        ? "bg-blue-700 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    <span className="text-zinc-500">○</span>
                    <span className="flex-1 truncate">{v.name}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete version "${v.name}"?`)) deleteVersion(v.id);
                      }}
                      className="cursor-pointer text-zinc-600 hover:text-red-400 text-xs px-0.5"
                    >
                      ✕
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              const name = prompt("Version name:");
              if (name) addVersion(name);
            }}
            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-xs text-zinc-500 hover:text-white hover:bg-zinc-800"
          >
            <span className="text-zinc-600">+</span>
            <span>New Version</span>
          </button>
        </div>
      </div>

      <nav className="p-2 border-t border-zinc-700 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              activeTab === tab.id ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-700 space-y-1">
        <button
          onClick={() => useStore.getState().exportPDF()}
          className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
        >
          Export PDF
        </button>
        <button
          onClick={() => useStore.getState().exportDOCX()}
          className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
        >
          Export DOCX
        </button>

      </div>
    </aside>
  );
}

export type { Tab };
