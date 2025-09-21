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


export type SurveyPagination = {
  currentPage: number;
  totalPages: number;
  totalSurveys: number;
  surveysPerPage: number;
}

export enum CriteriaType {
  GENDER = 'gender',
  GENERATION = 'generation',
  DEPARTMENT = 'department',
  LOCATION = 'location',
  AGE_GROUP = 'ageGroup'
}

export type CriteriaOption = {
  id: string;
  name: string;
  type: CriteriaType;
}

export type DistributionItem = {
  criteriaId: string;
  criteriaName: string;
  percentage: number | null;
}

export type CriteriaGroup = {
  type: CriteriaType;
  name: string;
  selected: boolean;
  items: DistributionItem[];
  totalPercentage: number;
}

export enum CommentGroup {
  INNOVATION = 'innovation',
  MOTIVATION = 'motivation',
  PERFORMANCE = 'performance',
  AUTONOMY = 'autonomy',
  CONNECTION = 'connection',
}