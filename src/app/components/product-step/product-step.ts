import { Component, ChangeDetectionStrategy, input, signal, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Survey, Option, SurveyPagination } from '../../core/models/scenario.model';
import { allSurveyData, companyOptions, experienceProductOptions, tenantOptions } from '../../core/data/scenario-options';

@Component({
  selector: 'app-product-step',
  templateUrl: './product-step.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductStep {
  productFormGroup = input.required<FormGroup>();

  readonly tenantOptions: Option[] = tenantOptions;
  readonly companyOptions: Option[] = companyOptions;
  readonly experienceProductOptions: Option[] = experienceProductOptions;

  private readonly allSurveys = signal<Survey[]>(allSurveyData);

  protected readonly pagination = signal<SurveyPagination>({
    currentPage: 1,
    totalPages: 3,
    totalSurveys: 25,
    surveysPerPage: 10
  });

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

  constructor() {
    effect(() => {
      const formGroup = this.productFormGroup();
      if (formGroup) {
        this.updateSelectedSurveys();
      }
    });
  }

  protected toggleSurvey(surveyId: string): void {
    this.allSurveys.update(surveys =>
      surveys.map(survey =>
        survey.id === surveyId
          ? { ...survey, selected: !survey.selected }
          : survey
      )
    );

    this.updateSelectedSurveys();
  }

  protected areAllCurrentPageSurveysSelected(): boolean {
    const currentSurveys = this.currentPageSurveys();
    return currentSurveys.length > 0 && currentSurveys.every(survey => survey.selected);
  }

  protected areSomeCurrentPageSurveysSelected(): boolean {
    const currentSurveys = this.currentPageSurveys();
    const selectedCount = currentSurveys.filter(survey => survey.selected).length;
    return selectedCount > 0 && selectedCount < currentSurveys.length;
  }

  protected toggleAllCurrentPageSurveys(): void {
    const currentSurveys = this.currentPageSurveys();
    const shouldSelectAll = !this.areAllCurrentPageSurveysSelected();

    this.allSurveys.update(surveys =>
      surveys.map(survey => {
        const isCurrentPageSurvey = currentSurveys.some(cs => cs.id === survey.id);
        return isCurrentPageSurvey
          ? { ...survey, selected: shouldSelectAll }
          : survey;
      })
    );

    this.updateSelectedSurveys();
  }

  protected goToPage(page: number): void {
    const currentPagination = this.pagination();
    if (page >= 1 && page <= currentPagination.totalPages) {
      this.pagination.update(pagination => ({
        ...pagination,
        currentPage: page
      }));
    }
  }

  private getSelectedSurveyIds(): string[] {
    return this.allSurveys().filter(survey => survey.selected).map(survey => survey.id);
  }

  private updateSelectedSurveys(): void {
    const formGroup = this.productFormGroup();
    if (formGroup) {
      formGroup.controls['selectedSurveys'].setValue(this.getSelectedSurveyIds());
    }
  }
}