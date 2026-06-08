export type SectionType = "education" | "experience" | "project" | "skill";
export type EntryStatus = "active" | "library";
export type ExperienceSubType = "professional" | "organizational";

export type Link = { label: string; url: string };

export type Summary = {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
};

export type Profile = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  links: Link[];
  createdAt?: string;
  updatedAt?: string;
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

export type Crate = {
  id: string;
  name: string;
  createdAt: string;
};

export type CVVersion = {
  id: string;
  name: string;
  crateId: string | null;
  entryIds: string[];
  sectionOrder: Record<SectionType, string[]>;
  skillOrder: string[];
  selectedSummaryId: string | null;
  createdAt: string;
};

export type Tab = "profile" | "education" | "experience" | "projects" | "skills" | "library" | "preview";

export type Store = {
  profile: Profile;
  entries: Entry[];
  cvVersions: CVVersion[];
  activeVersionId: string | null;
};
