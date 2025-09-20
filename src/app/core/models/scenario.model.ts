export interface Survey {
  id: string;
  name: string;
  creationDate: string;
  startDate: string;
  endDate: string;
  selected: boolean;
}

export interface TenantOption {
  id: string;
  name: string;
}

export interface CompanyOption {
  id: string;
  name: string;
}

export interface ExperienceProductOption {
  id: string;
  name: string;
  description?: string;
}

export interface Scenario {
  title: string;
  tenant: string;
  company: string;
  experienceProduct: string;
  surveys: Survey[];
}

export interface ScenarioFormData {
  title: string;
  tenant: string;
  company: string;
  experienceProduct: string;
  selectedSurveys: string[];
}

export interface SurveyPagination {
  currentPage: number;
  totalPages: number;
  totalSurveys: number;
  surveysPerPage: number;
}