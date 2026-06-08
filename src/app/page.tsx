"use client";

import { useEffect, useState } from "react";
import { Sidebar, type Tab } from "@/components/Sidebar";
import { ProfileEditor } from "@/components/ProfileEditor";
import { EducationEditor } from "@/components/EducationEditor";
import { ExperienceEditor } from "@/components/ExperienceEditor";
import { ProjectEditor } from "@/components/ProjectEditor";
import { SkillEditor } from "@/components/SkillEditor";
import { LibraryView } from "@/components/LibraryView";
import { CVPreview } from "@/components/CVPreview";
import { useStore } from "@/store/useStore";
import { Agentation } from "agentation";

export default function Home() {
  const { init, loading } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("preview");

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-500">
        Loading...
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileEditor />;
      case "education":
        return <EducationEditor />;
      case "experience":
        return <ExperienceEditor />;
      case "projects":
        return <ProjectEditor />;
      case "skills":
        return <SkillEditor />;
      case "library":
        return <LibraryView />;
      case "preview":
        return <CVPreview />;
      default:
        return <CVPreview />;
    }
  };

  return (
    <div className="flex w-full h-screen overflow-x-hidden">
      <Agentation />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab !== "preview" && (
        <main className="flex-1 overflow-y-auto bg-zinc-50">
          {renderContent()}
        </main>
      )}
      <aside className={`${activeTab === "preview" ? "flex-1 min-w-0" : "w-[calc(210mm+3rem)] shrink-0"} overflow-auto border-l border-zinc-200 bg-white`}>
        <CVPreview />
      </aside>
    </div>
  );
}
