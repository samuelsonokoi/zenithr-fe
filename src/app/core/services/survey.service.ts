import { Injectable, signal, computed } from '@angular/core';
import { Survey, SurveyPagination } from '../models/scenario.model';
import { allSurveyData } from '../data/scenario-options';

/**
 * Service for managing survey data, pagination, and selection
 */
@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private readonly defaultSurveysPerPage = 10;

  // Survey data state
  private readonly _allSurveys = signal<Survey[]>(
    allSurveyData.map(survey => ({ ...survey }))
  );

  // Pagination state
  private readonly _pagination = signal<SurveyPagination>({
    currentPage: 1,
    surveysPerPage: this.defaultSurveysPerPage,
    totalSurveys: allSurveyData.length,
    totalPages: Math.ceil(allSurveyData.length / this.defaultSurveysPerPage)
  });

  // Public readonly signals
  readonly allSurveys = this._allSurveys.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  // Computed values
  readonly currentPageSurveys = computed(() => {
    const paginationData = this.pagination();
    const surveys = this.allSurveys();
    const startIndex = (paginationData.currentPage - 1) * paginationData.surveysPerPage;
    const endIndex = startIndex + paginationData.surveysPerPage;
    return surveys.slice(startIndex, endIndex);
  });

  readonly paginationPages = computed(() => {
    const paginationData = this.pagination();
    const pages: number[] = [];
    for (let i = 1; i <= paginationData.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  });

  readonly currentPageEndIndex = computed(() => {
    const paginationData = this.pagination();
    return Math.min(paginationData.currentPage * paginationData.surveysPerPage, paginationData.totalSurveys);
  });

  readonly currentPageStartIndex = computed(() => {
    const paginationData = this.pagination();
    return (paginationData.currentPage - 1) * paginationData.surveysPerPage + 1;
  });

  readonly selectedSurveys = computed(() => {
    return this.allSurveys().filter(survey => survey.selected);
  });

  readonly selectedSurveyIds = computed(() => {
    return this.selectedSurveys().map(survey => survey.id);
  });

  /**
   * Toggle survey selection by ID
   */
  toggleSurveySelection(surveyId: string): void {
    this._allSurveys.update(surveys =>
      surveys.map(survey =>
        survey.id === surveyId
          ? { ...survey, selected: !survey.selected }
          : survey
      )
    );
  }

  /**
   * Select all surveys on current page
   */
  selectAllSurveysOnPage(): void {
    const currentPageSurveys = this.currentPageSurveys();
    this._allSurveys.update(surveys =>
      surveys.map(survey => {
        const isOnCurrentPage = currentPageSurveys.some(pageSurvey => pageSurvey.id === survey.id);
        return isOnCurrentPage ? { ...survey, selected: true } : survey;
      })
    );
  }

  /**
   * Deselect all surveys on current page
   */
  deselectAllSurveysOnPage(): void {
    const currentPageSurveys = this.currentPageSurveys();
    this._allSurveys.update(surveys =>
      surveys.map(survey => {
        const isOnCurrentPage = currentPageSurveys.some(pageSurvey => pageSurvey.id === survey.id);
        return isOnCurrentPage ? { ...survey, selected: false } : survey;
      })
    );
  }

  /**
   * Check if all surveys on current page are selected
   */
  areAllSurveysOnPageSelected(): boolean {
    const currentPageSurveys = this.currentPageSurveys();
    return currentPageSurveys.length > 0 && currentPageSurveys.every(survey => survey.selected);
  }

  /**
   * Check if some (but not all) surveys on current page are selected
   */
  areSomeSurveysOnPageSelected(): boolean {
    const currentPageSurveys = this.currentPageSurveys();
    const selectedCount = currentPageSurveys.filter(survey => survey.selected).length;
    return selectedCount > 0 && selectedCount < currentPageSurveys.length;
  }

  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    const totalPages = this.pagination().totalPages;
    if (page >= 1 && page <= totalPages) {
      this._pagination.update(current => ({
        ...current,
        currentPage: page
      }));
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    const currentPage = this.pagination().currentPage;
    const totalPages = this.pagination().totalPages;
    if (currentPage < totalPages) {
      this.goToPage(currentPage + 1);
    }
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    const currentPage = this.pagination().currentPage;
    if (currentPage > 1) {
      this.goToPage(currentPage - 1);
    }
  }

  /**
   * Update surveys per page and recalculate pagination
   */
  updateSurveysPerPage(surveysPerPage: number): void {
    const totalSurveys = this.allSurveys().length;
    const totalPages = Math.ceil(totalSurveys / surveysPerPage);

    this._pagination.update(current => ({
      ...current,
      surveysPerPage,
      totalPages,
      currentPage: Math.min(current.currentPage, totalPages) // Ensure current page is valid
    }));
  }

  /**
   * Reset survey selections
   */
  resetSelections(): void {
    this._allSurveys.update(surveys =>
      surveys.map(survey => ({ ...survey, selected: false }))
    );
  }

  /**
   * Get survey by ID
   */
  getSurveyById(id: string): Survey | undefined {
    return this.allSurveys().find(survey => survey.id === id);
  }

  /**
   * Set selected survey IDs (useful for form integration)
   */
  setSelectedSurveyIds(ids: string[]): void {
    this._allSurveys.update(surveys =>
      surveys.map(survey => ({
        ...survey,
        selected: ids.includes(survey.id)
      }))
    );
  }
}