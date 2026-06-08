export type SectionType = "education" | "experience" | "project" | "skill";
export type EntryStatus = "active" | "library";
export type ExperienceSubType = "professional" | "organizational";

export type Link = { label: string; url: string };

export type Profile = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  links: Link[];
  summary: string;
};

export type EducationData = {
  institution: string;
  degree: string;
  field: string;
  period: string;
  gpa?: string;
  relatedModules: string[];
};

export type ExperienceData = {
  role: string;
  organization: string;
  location: string;
  period: string;
  bullets: string[];
};

export type ProjectData = {
  name: string;
  link?: string;
  year: string;
  bullets: string[];
};

export type SkillData = {
  category: string;
  items: string[];
};

export type SectionData = EducationData | ExperienceData | ProjectData | SkillData;

export type Entry = {
  id: string;
  section: SectionType;
  subType?: ExperienceSubType;
  status: EntryStatus;
  data: SectionData;
  createdAt: number;
  updatedAt: number;
};

export type CVVersion = {
  id: string;
  name: string;
  entryIds: string[];
  sectionOrder: Record<SectionType, string[]>;
  skillOrder: string[];
  createdAt: string;
};

export type Store = {
  profile: Profile;
  entries: Entry[];
  cvVersions: CVVersion[];
  activeVersionId: string | null;
};
