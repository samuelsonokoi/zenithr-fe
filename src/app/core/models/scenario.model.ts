/**
 * Represents a survey with its metadata and selection state
 */
export type Survey = {
  id: string;
  name: string;
  creationDate: string;
  startDate: string;
  endDate: string;
  selected: boolean;
}

/**
 * Generic option type for dropdowns and selections
 */
export type Option = {
  id: string;
  name: string;
  description?: string;
}



/**
 * Pagination configuration for survey lists
 */
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

/**
 * Criteria option with associated type classification
 */
export type CriteriaOption = {
  id: string;
  name: string;
  type: CriteriaType;
}

/**
 * Individual item within a criteria distribution
 */
export type DistributionItem = {
  criteriaId: string;
  criteriaName: string;
  percentage: number | null;
}

/**
 * Groups related distribution items by criteria type
 * Tracks selection state and aggregated percentage
 */
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