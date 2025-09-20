export type Survey = {
  id: string;
  name: string;
  creationDate: string;
  startDate: string;
  endDate: string;
  selected: boolean;
}

export type TenantOption = {
  id: string;
  name: string;
}

export type CompanyOption = {
  id: string;
  name: string;
}

export type ExperienceProductOption = {
  id: string;
  name: string;
  description?: string;
}

export type Scenario = {
  title: string;
  tenant: string;
  company: string;
  experienceProduct: string;
  surveys: Survey[];
}

export type ScenarioFormData = {
  title: string;
  tenant: string;
  company: string;
  experienceProduct: string;
  selectedSurveys: string[];
}

export type SurveyPagination = {
  currentPage: number;
  totalPages: number;
  totalSurveys: number;
  surveysPerPage: number;
}