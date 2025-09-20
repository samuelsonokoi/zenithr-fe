import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Stepper } from '../../components/stepper/stepper';
import { StepperConfig } from '../../core/models/stepper.model';
import {
  Survey,
  TenantOption,
  CompanyOption,
  ExperienceProductOption,
  SurveyPagination
} from '../../core/models/scenario.model';

@Component({
  selector: 'app-new-scenario',
  standalone: true,
  imports: [Stepper, CdkStepperModule, ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-scenario.html',
})
export class NewScenario implements OnInit {
  readonly scenarioForm = new FormGroup({
    product: new FormGroup({
      title: new FormControl('', [Validators.required]),
      tenant: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required]),
      experienceProduct: new FormControl('', [Validators.required]),
      selectedSurveys: new FormArray([])
    }),
    respondents: new FormGroup({
      total: new FormControl(0)
    })
  });

  readonly stepperConfig = signal<StepperConfig>({
    title: 'New Scenario',
    role: 'HR Admin',
    steps: [
      'Select Product',
      'Total Respondents',
      'Select Criteria',
      'Set Impact Drivers',
      'eNPS',
      'Comments'
    ]
  });

  readonly tenantOptions: TenantOption[] = [
    { id: 'tenant-a', name: 'Tenant A' },
    { id: 'tenant-b', name: 'Tenant B' },
    { id: 'tenant-c', name: 'Tenant C' }
  ];

  readonly companyOptions: CompanyOption[] = [
    { id: 'company-a', name: 'Company A' },
    { id: 'company-b', name: 'Company B' },
    { id: 'company-c', name: 'Company C' }
  ];

  readonly experienceProductOptions: ExperienceProductOption[] = [
    { id: 'tenant-a', name: 'Tenant A', description: 'Primary tenant experience' },
    { id: 'employee-exp', name: 'Employee Experience Platform', description: 'Complete experience platform' }
  ];

  private readonly allSurveys = signal<Survey[]>([
    { id: '1', name: 'Employee Engagement Survey', creationDate: '15/01/2024', startDate: '20/01/2024', endDate: '30/01/2024', selected: true },
    { id: '2', name: 'Employee Engagement Survey', creationDate: '16/01/2024', startDate: '21/01/2024', endDate: '31/01/2024', selected: true },
    { id: '3', name: 'Employee Engagement Survey', creationDate: '17/01/2024', startDate: '22/01/2024', endDate: '01/02/2024', selected: false },
    { id: '4', name: 'Customer Satisfaction Survey', creationDate: '18/01/2024', startDate: '23/01/2024', endDate: '02/02/2024', selected: false },
    { id: '5', name: 'Team Performance Survey', creationDate: '19/01/2024', startDate: '24/01/2024', endDate: '03/02/2024', selected: false },
    { id: '6', name: 'Workplace Culture Survey', creationDate: '20/01/2024', startDate: '25/01/2024', endDate: '04/02/2024', selected: false },
    { id: '7', name: 'Leadership Feedback Survey', creationDate: '21/01/2024', startDate: '26/01/2024', endDate: '05/02/2024', selected: false },
    { id: '8', name: 'Training Effectiveness Survey', creationDate: '22/01/2024', startDate: '27/01/2024', endDate: '06/02/2024', selected: false },
    { id: '9', name: 'Benefits Satisfaction Survey', creationDate: '23/01/2024', startDate: '28/01/2024', endDate: '07/02/2024', selected: false },
    { id: '10', name: 'Remote Work Experience Survey', creationDate: '24/01/2024', startDate: '29/01/2024', endDate: '08/02/2024', selected: false },
    { id: '11', name: 'Communication Assessment Survey', creationDate: '25/01/2024', startDate: '30/01/2024', endDate: '09/02/2024', selected: false },
    { id: '12', name: 'Work-Life Balance Survey', creationDate: '26/01/2024', startDate: '31/01/2024', endDate: '10/02/2024', selected: false },
    { id: '13', name: 'Professional Development Survey', creationDate: '27/01/2024', startDate: '01/02/2024', endDate: '11/02/2024', selected: false },
    { id: '14', name: 'Company Values Alignment Survey', creationDate: '28/01/2024', startDate: '02/02/2024', endDate: '12/02/2024', selected: false },
    { id: '15', name: 'Technology Usage Survey', creationDate: '29/01/2024', startDate: '03/02/2024', endDate: '13/02/2024', selected: false },
    { id: '16', name: 'Diversity & Inclusion Survey', creationDate: '30/01/2024', startDate: '04/02/2024', endDate: '14/02/2024', selected: false },
    { id: '17', name: 'Manager Effectiveness Survey', creationDate: '31/01/2024', startDate: '05/02/2024', endDate: '15/02/2024', selected: false },
    { id: '18', name: 'Compensation Satisfaction Survey', creationDate: '01/02/2024', startDate: '06/02/2024', endDate: '16/02/2024', selected: false },
    { id: '19', name: 'Career Growth Opportunities Survey', creationDate: '02/02/2024', startDate: '07/02/2024', endDate: '17/02/2024', selected: false },
    { id: '20', name: 'Employee Recognition Survey', creationDate: '03/02/2024', startDate: '08/02/2024', endDate: '18/02/2024', selected: false },
    { id: '21', name: 'Office Environment Survey', creationDate: '04/02/2024', startDate: '09/02/2024', endDate: '19/02/2024', selected: false },
    { id: '22', name: 'Innovation & Creativity Survey', creationDate: '05/02/2024', startDate: '10/02/2024', endDate: '20/02/2024', selected: false },
    { id: '23', name: 'Change Management Survey', creationDate: '06/02/2024', startDate: '11/02/2024', endDate: '21/02/2024', selected: false },
    { id: '24', name: 'Mental Health & Wellness Survey', creationDate: '07/02/2024', startDate: '12/02/2024', endDate: '22/02/2024', selected: false },
    { id: '25', name: 'Exit Interview Survey', creationDate: '08/02/2024', startDate: '13/02/2024', endDate: '23/02/2024', selected: false }
  ]);

  readonly pagination = signal<SurveyPagination>({
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

  readonly selectedSurveysCount = computed(() => {
    return this.allSurveys().filter(survey => survey.selected).length;
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

  toggleSurvey(surveyId: string): void {
    this.allSurveys.update(surveys =>
      surveys.map(survey =>
        survey.id === surveyId
          ? { ...survey, selected: !survey.selected }
          : survey
      )
    );
    this.updateSelectedSurveysFormArray();
  }

  private updateSelectedSurveysFormArray(): void {
    const selectedSurveyIds = this.allSurveys()
      .filter(survey => survey.selected)
      .map(survey => survey.id);

    const formArray = this.scenarioForm.get('selectedSurveys') as FormArray;
    formArray.clear();

    selectedSurveyIds.forEach(id => {
      formArray.push(new FormControl(id));
    });
  }

  goToPage(page: number): void {
    const currentPagination = this.pagination();
    if (page >= 1 && page <= currentPagination.totalPages) {
      this.pagination.update(pagination => ({
        ...pagination,
        currentPage: page
      }));
    }
  }

  ngOnInit(): void {
    this.updateSelectedSurveysFormArray();
  }

  isFormValid(): boolean {
    return this.scenarioForm.valid && this.selectedSurveysCount() > 0;
  }

  markFormGroupTouched(): void {
    Object.keys(this.scenarioForm.controls).forEach(key => {
      const control = this.scenarioForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.scenarioForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      title: 'Title',
      tenant: 'Tenant',
      company: 'Company',
      experienceProduct: 'Experience Product'
    };
    return displayNames[fieldName] || fieldName;
  }
}