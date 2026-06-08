"use client";

import { useStore } from "@/store/useStore";

type Tab = "profile" | "education" | "experience" | "projects" | "skills" | "library" | "preview";

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
  const { cvVersions, activeVersionId, setActiveVersion, addVersion, deleteVersion } = useStore();
  const activeVersion = cvVersions.find((v) => v.id === activeVersionId);

  return (
    <aside className="w-64 bg-zinc-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-zinc-700">
        <h1 className="text-lg font-bold">CV Manager</h1>
      </div>

      <div className="p-3 border-b border-zinc-700">
        <select
          className="w-full bg-zinc-800 text-white text-sm rounded px-2 py-1.5 border border-zinc-600"
          value={activeVersionId ?? ""}
          onChange={(e) => setActiveVersion(e.target.value)}
        >
          {cvVersions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => {
              const name = prompt("Version name:");
              if (name) addVersion(name);
            }}
            className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded flex-1"
          >
            + New
          </button>
          {activeVersion && (
            <button
              onClick={() => {
                if (confirm(`Delete "${activeVersion.name}"?`)) deleteVersion(activeVersion.id);
              }}
              className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
            >
              Del
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
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
        <button
          onClick={() => useStore.getState().exportJSON()}
          className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
        >
          Backup JSON
        </button>
        <label className="block w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer">
          Restore JSON
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && confirm("Restore will overwrite all data. Continue?")) {
                useStore.getState().importJSON(file);
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </aside>
  );
}

export type { Tab };
