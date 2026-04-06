export interface PortfolioContent {
  fullName: string;
  profileImage: string;
  bio: string;
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  codingProfiles: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  url: string;
  tech: string[];
}

export const defaultPortfolioContent: PortfolioContent = {
  fullName: '',
  profileImage: '',
  bio: '',
  education: [],
  skills: [],
  projects: [],
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  codingProfiles: '',
};
