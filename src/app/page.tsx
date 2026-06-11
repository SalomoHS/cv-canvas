"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProfileEditor } from "@/components/ProfileEditor";
import { EducationEditor } from "@/components/EducationEditor";
import { ExperienceEditor } from "@/components/ExperienceEditor";
import { ProjectEditor } from "@/components/ProjectEditor";
import { SkillEditor } from "@/components/SkillEditor";
import { CVPreview } from "@/components/CVPreview";
import { useStore } from "@/store/useStore";

export default function Home() {
  const { init, loading, activeTab, setActiveTab } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-text-muted">
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
      default:
        return null;
    }
  };

  return (
    <div className="flex w-full h-screen overflow-x-hidden bg-surface">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab !== "preview" && (
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      )}
      <aside className={`${activeTab === "preview" ? "flex-1 min-w-0" : "w-[calc(210mm+3rem)] shrink-0"} overflow-auto bg-surface-raised`}>
        <CVPreview />
      </aside>
    </div>
  );
}
