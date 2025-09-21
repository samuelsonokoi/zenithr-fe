import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Stepper } from '../../components/stepper/stepper';
import { StepperConfig } from '../../core/models/stepper.model';
import {
  Survey,
  TenantOption,
  CompanyOption,
  ExperienceProductOption,
  SurveyPagination,
  CriteriaType,
  CriteriaOption,
  CriteriaGroup,
  CommentGroup,
} from '../../core/models/scenario.model';

@Component({
  selector: 'app-new-scenario',
  standalone: true,
  imports: [Stepper, CdkStepperModule, ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-scenario.html',
})
export class NewScenario implements OnInit {
  protected readonly router = inject(Router)
  protected readonly currentCommentSection = signal<CommentGroup>(CommentGroup.INNOVATION);
  protected readonly CommentGroup = CommentGroup;
  readonly scenarioForm = new FormGroup({
    product: new FormGroup({
      title: new FormControl('', [Validators.required]),
      tenant: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required]),
      experienceProduct: new FormControl('', [Validators.required]),
      selectedSurveys: new FormArray<FormControl<string>>([])
    }),
    respondents: new FormGroup({
      total: new FormControl('', [Validators.required])
    }),
    criteria: new FormGroup({
      selectedCriteria: new FormArray<FormControl<CriteriaType>>([]),
      distributions: new FormArray<FormGroup>([])
    }),
    impactDrivers: new FormGroup({
      innovation: new FormControl(''),
      motivation: new FormControl(''),
      performance: new FormControl(''),
      autonomy: new FormControl(''),
      connection: new FormControl(''),
      transformationalLeadership: new FormControl(''),
    }),
    enpsSettings: new FormGroup({
      promoters: new FormControl(''),
      passives: new FormControl(''),
      detractors: new FormControl(''),
    }),
    comments: new FormGroup({
      innovation: new FormControl(''),
      motivation: new FormControl(''),
      performance: new FormControl(''),
      autonomy: new FormControl(''),
      connection: new FormControl(''),
    }),
  });

  protected get productGroup() {
    return this.scenarioForm.controls.product as FormGroup;
  }

  protected get respondentGroup() {
    return this.scenarioForm.controls.respondents as FormGroup;
  }

  protected get criteriaGroup() {
    return this.scenarioForm.controls.criteria as FormGroup;
  }

  protected get impactDriversGroup() {
    return this.scenarioForm.controls.impactDrivers as FormGroup;
  }

  protected get enpsSettingsGroup() {
    return this.scenarioForm.controls.enpsSettings as FormGroup;
  }

  protected get commentsGroup() {
    return this.scenarioForm.controls.comments as FormGroup;
  }

  protected get distributionsArray() {
    return this.criteriaGroup.get('distributions') as FormArray;
  }

  readonly productGroupStatus = toSignal(this.productGroup.statusChanges, { initialValue: this.productGroup.status });
  readonly respondentGroupStatus = toSignal(this.respondentGroup.statusChanges, { initialValue: this.respondentGroup.status });
  readonly impactDriversGroupStatus = toSignal(this.impactDriversGroup.statusChanges, { initialValue: this.impactDriversGroup.status });
  readonly enpsSettingsGroupStatus = toSignal(this.enpsSettingsGroup.statusChanges, { initialValue: this.enpsSettingsGroup.status });
  readonly commentsGroupStatus = toSignal(this.commentsGroup.statusChanges, { initialValue: this.commentsGroup.status });

  readonly productGroupValid = computed(() => this.productGroupStatus() === 'VALID');

  readonly respondentGroupValid = computed(() => this.respondentGroupStatus() === 'VALID');

  readonly impactDriversGroupValue = toSignal(this.impactDriversGroup.valueChanges, { initialValue: this.impactDriversGroup.value });

  readonly enpsSettingsGroupValue = toSignal(this.enpsSettingsGroup.valueChanges, { initialValue: this.enpsSettingsGroup.value });

  readonly impactDriversGroupValid = computed(() => this.impactDriversGroupStatus() === 'VALID');

  readonly impactDriversTotal = computed(() => {
    const values = this.impactDriversGroupValue(); // Track the value changes to make it reactive
    const driversValues = [
      Number(values.innovation) || 0,
      Number(values.motivation) || 0,
      Number(values.performance) || 0,
      Number(values.autonomy) || 0,
      Number(values.connection) || 0,
      Number(values.transformationalLeadership) || 0
    ];

    // Calculate average of all driver values
    const filledValues = driversValues.filter(value => value > 0);
    const average = filledValues.length > 0 ? filledValues.reduce((sum, value) => sum + value, 0) / filledValues.length : 0;
    return Math.round(average * 100) / 100; // Round to 2 decimal places
  });


  readonly enpsSettingsGroupValid = computed(() => this.enpsSettingsGroupStatus() === 'VALID');

  readonly enpsSettingsTotal = computed(() => {
    const values = this.enpsSettingsGroupValue(); // Track the value changes to make it reactive
    const enpsValues = [
      Number(values.promoters) || 0,
      Number(values.passives) || 0,
      Number(values.detractors) || 0
    ];

    // Calculate average of all eNPS values
    const filledValues = enpsValues.filter(value => value > 0);
    const average = filledValues.length > 0 ? filledValues.reduce((sum, value) => sum + value, 0) / filledValues.length : 0;
    return Math.round(average * 100) / 100; // Round to 2 decimal places
  });



  readonly commentsGroupValid = computed(() => this.commentsGroupStatus() === 'VALID');


  readonly stepValidations = computed(() => {
    return [
      this.productGroupValid(),
      this.respondentGroupValid(),
      this.criteriaValidation(),
      this.impactDriversGroupValid(),
      this.enpsSettingsGroupValid(),
      this.commentsGroupValid()
    ];
  });

  readonly stepperConfig = computed<StepperConfig>(() => ({
    title: 'New Scenario',
    role: 'HR Admin',
    steps: [
      'Select Product',
      'Total Respondents',
      'Select Criteria',
      'Set Impact Drivers',
      'eNPS',
      'Comments'
    ],
    stepValidations: this.stepValidations()
  }));

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
    { id: 'tenant-b', name: 'Tenant B', description: 'Secondary tenant experience' }
  ];

  readonly availableCriteria: { type: CriteriaType; name: string }[] = [
    { type: CriteriaType.AGE_GROUP, name: 'Age Group' },
    { type: CriteriaType.GENERATION, name: 'Generation' },
    { type: CriteriaType.DEPARTMENT, name: 'Department' },
    { type: CriteriaType.GENDER, name: 'Gender' },
    { type: CriteriaType.LOCATION, name: 'Location' }
  ];

  readonly criteriaOptions: Record<CriteriaType, CriteriaOption[]> = {
    [CriteriaType.GENDER]: [
      { id: 'male', name: 'Male', type: CriteriaType.GENDER },
      { id: 'female', name: 'Female', type: CriteriaType.GENDER },
      { id: 'other', name: 'Other', type: CriteriaType.GENDER }
    ],
    [CriteriaType.GENERATION]: [
      { id: 'gen-z', name: 'Generation Z', type: CriteriaType.GENERATION },
      { id: 'millennials', name: 'Millennials', type: CriteriaType.GENERATION },
      { id: 'gen-x', name: 'Generation X', type: CriteriaType.GENERATION },
      { id: 'boomers', name: 'Baby Boomers', type: CriteriaType.GENERATION }
    ],
    [CriteriaType.DEPARTMENT]: [
      { id: 'engineering', name: 'Engineering', type: CriteriaType.DEPARTMENT },
      { id: 'hr', name: 'Human Resources', type: CriteriaType.DEPARTMENT },
      { id: 'marketing', name: 'Marketing', type: CriteriaType.DEPARTMENT },
      { id: 'sales', name: 'Sales', type: CriteriaType.DEPARTMENT },
      { id: 'finance', name: 'Finance', type: CriteriaType.DEPARTMENT }
    ],
    [CriteriaType.LOCATION]: [
      { id: 'liverpool', name: 'Liverpool', type: CriteriaType.LOCATION },
      { id: 'manchester', name: 'Manchester', type: CriteriaType.LOCATION },
      { id: 'london', name: 'London', type: CriteriaType.LOCATION },
      { id: 'remote', name: 'Remote', type: CriteriaType.LOCATION }
    ],
    [CriteriaType.AGE_GROUP]: [
      { id: '18-25', name: '18-25', type: CriteriaType.AGE_GROUP },
      { id: '26-35', name: '26-35', type: CriteriaType.AGE_GROUP },
      { id: '36-45', name: '36-45', type: CriteriaType.AGE_GROUP },
      { id: '46-55', name: '46-55', type: CriteriaType.AGE_GROUP },
      { id: '55+', name: '55+', type: CriteriaType.AGE_GROUP }
    ]
  };

  private readonly allSurveys = signal<Survey[]>([
    { id: '1', name: 'Employee Engagement Survey', creationDate: '15/01/2024', startDate: '20/01/2024', endDate: '30/01/2024', selected: false },
    { id: '2', name: 'Employee Engagement Survey', creationDate: '16/01/2024', startDate: '21/01/2024', endDate: '31/01/2024', selected: false },
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

  protected readonly pagination = signal<SurveyPagination>({
    currentPage: 1,
    totalPages: 3,
    totalSurveys: 25,
    surveysPerPage: 10
  });

  private readonly criteriaGroups = signal<CriteriaGroup[]>([]);

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

  readonly selectedCriteriaTypes = computed(() => {
    const groups = this.criteriaGroups();
    return groups.filter(group => group.selected).map(group => group.type);
  });

  readonly criteriaValidation = computed(() => {
    const groups = this.criteriaGroups();
    const hasSelectedCriteria = groups.some(group => group.selected);

    if (!hasSelectedCriteria) {
      return false;
    }

    return groups.every(group => {
      if (!group.selected) return true;

      if (group.items.length === 0) return false;

      return group.items.every(item =>
        item.criteriaId && item.criteriaId.trim() !== '' && item.percentage > 0
      );
    });
  });

  protected setCurrentComment(section: CommentGroup) {
    this.currentCommentSection.set(section);
  }

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

  areAllCurrentPageSurveysSelected(): boolean {
    const currentSurveys = this.currentPageSurveys();
    return currentSurveys.length > 0 && currentSurveys.every(survey => survey.selected);
  }

  areSomeCurrentPageSurveysSelected(): boolean {
    const currentSurveys = this.currentPageSurveys();
    const selectedCount = currentSurveys.filter(survey => survey.selected).length;
    return selectedCount > 0 && selectedCount < currentSurveys.length;
  }

  toggleAllCurrentPageSurveys(): void {
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
    this.updateSelectedSurveysFormArray();
  }

  private updateSelectedSurveysFormArray(): void {
    const selectedSurveyIds = this.allSurveys()
      .filter(survey => survey.selected)
      .map(survey => survey.id);

    const formArray = this.productGroup.get('selectedSurveys') as FormArray<FormControl<string>>;
    formArray.clear();

    selectedSurveyIds.forEach(id => {
      formArray.push(new FormControl(id, { nonNullable: true }));
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


  isProductGroupEmpty(): boolean {
    const productValues = this.productGroup.value;

    const hasProductData = productValues.title || productValues.tenant ||
                           productValues.company || productValues.experienceProduct ||
                           (productValues.selectedSurveys && productValues.selectedSurveys.length > 0);

    return !hasProductData;
  }

  onCancel(): void {
    if (this.isProductGroupEmpty()) {
      this.router.navigate(['/dashboard']);
    } else {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel? All changes will be lost.');
      if (confirmed) {
        this.resetForm();
        this.router.navigate(['/dashboard']);
      }
    }
  }

  onFinish(): void {
    if (this.scenarioForm.valid) {
      const formValue = this.scenarioForm.value;
      console.log('Form submitted with values:', formValue);

      // Here you can emit the form values or call a service to submit the data
      // For now, we'll just log the values and navigate
      // this.scenarioService.createScenario(formValue);

      this.router.navigate(['/dashboard']);
    } else {
      console.log('Form is invalid. Please check all required fields.');
      this.markFormGroupTouched(this.scenarioForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  toggleCriterion(criteriaType: CriteriaType): void {
    this.criteriaGroups.update(groups => {
      const existingGroupIndex = groups.findIndex(g => g.type === criteriaType);

      if (existingGroupIndex >= 0) {
        groups[existingGroupIndex].selected = !groups[existingGroupIndex].selected;
        if (!groups[existingGroupIndex].selected) {
          groups[existingGroupIndex].items = [];
          groups[existingGroupIndex].totalPercentage = 0;
        }
      } else {
        const criteriaName = this.availableCriteria.find(c => c.type === criteriaType)?.name || criteriaType;
        groups.push({
          type: criteriaType,
          name: criteriaName,
          selected: true,
          items: [],
          totalPercentage: 0
        });
      }
      return [...groups];
    });
  }

  private createDistributionFormGroup(criteriaId: string = '', percentage: number | null = null): FormGroup {
    return new FormGroup({
      value: new FormControl(criteriaId, [Validators.required]),
      percentage: new FormControl(percentage, [Validators.required, Validators.min(1)])
    });
  }

  addDistributionItem(criteriaType: CriteriaType, criteriaId: string, criteriaName: string): void {
    // Check if this criteria is already in the FormArray
    const distributionsArray = this.distributionsArray;
    const existingControl = distributionsArray.controls.find(control =>
      control.get('value')?.value === criteriaId
    );

    if (!existingControl) {
      // Add new FormGroup to the FormArray
      const distributionGroup = this.createDistributionFormGroup(criteriaId);
      distributionsArray.push(distributionGroup);
    }

    // Also update the signal for UI display
    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0) {
        const existingItemIndex = groups[groupIndex].items.findIndex(item => item.criteriaId === criteriaId);
        if (existingItemIndex === -1) {
          groups[groupIndex].items.push({
            criteriaId,
            criteriaName,
            percentage: 0
          });
        }
      }
      return [...groups];
    });
  }

  removeDistributionItem(criteriaType: CriteriaType, criteriaId: string): void {
    // Remove from FormArray
    const distributionsArray = this.distributionsArray;
    const controlIndex = distributionsArray.controls.findIndex(control =>
      control.get('value')?.value === criteriaId
    );

    if (controlIndex !== -1) {
      distributionsArray.removeAt(controlIndex);
    }

    // Also update the signal for UI display
    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0) {
        groups[groupIndex].items = groups[groupIndex].items.filter(item => item.criteriaId !== criteriaId);
        this.updateCriteriaTotalPercentage(criteriaType);
      }
      return [...groups];
    });
  }

  updateDistributionPercentage(criteriaType: CriteriaType, criteriaId: string, percentage: number): void {
    // Update FormControl value
    const distributionsArray = this.distributionsArray;
    const control = distributionsArray.controls.find(control =>
      control.get('value')?.value === criteriaId
    );

    if (control) {
      const percentageControl = control.get('percentage');
      percentageControl?.setValue(percentage);
      percentageControl?.markAsTouched();
    }

    // Also update the signal for UI display
    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0) {
        const itemIndex = groups[groupIndex].items.findIndex(item => item.criteriaId === criteriaId);
        if (itemIndex >= 0) {
          groups[groupIndex].items[itemIndex].percentage = percentage;
          this.updateCriteriaTotalPercentage(criteriaType);
        }
      }
      return [...groups];
    });
  }

  public updateDistributionPercentageFromEvent(criteriaType: CriteriaType, criteriaId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const percentage = Number(target.value) || 0;
    this.updateDistributionPercentage(criteriaType, criteriaId, percentage);
  }

  public updateDistributionItem(criteriaType: CriteriaType, itemIndex: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOptionId = target.value;

    if (selectedOptionId) {
      const option = this.criteriaOptions[criteriaType].find(opt => opt.id === selectedOptionId);
      if (option) {
        // Update the FormControl value
        const distributionsArray = this.distributionsArray;
        const oldCriteriaId = this.criteriaGroups()[this.criteriaGroups().findIndex(g => g.type === criteriaType)]?.items[itemIndex]?.criteriaId;

        if (oldCriteriaId) {
          const control = distributionsArray.controls.find(control =>
            control.get('value')?.value === oldCriteriaId
          );
          if (control) {
            const valueControl = control.get('value');
            valueControl?.setValue(selectedOptionId);
            valueControl?.markAsTouched();
          }
        }

        this.criteriaGroups.update(groups => {
          const groupIndex = groups.findIndex(g => g.type === criteriaType);
          if (groupIndex >= 0 && groups[groupIndex].items[itemIndex]) {
            groups[groupIndex].items[itemIndex].criteriaId = option.id;
            groups[groupIndex].items[itemIndex].criteriaName = option.name;
          }
          return [...groups];
        });
      }
    }
  }

  private updateCriteriaTotalPercentage(criteriaType: CriteriaType): void {
    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0) {
        const items = groups[groupIndex].items;
        const filledPercentages = items.filter(item => item.percentage > 0).map(item => item.percentage);

        // Calculate average of filled percentages
        const average = filledPercentages.length > 0
          ? filledPercentages.reduce((sum, percentage) => sum + percentage, 0) / filledPercentages.length
          : 0;

        groups[groupIndex].totalPercentage = Math.round(average * 100) / 100; // Round to 2 decimal places
      }
      return [...groups];
    });
  }

  isCriterionSelected(criteriaType: CriteriaType): boolean {
    return this.criteriaGroups().some(group => group.type === criteriaType && group.selected);
  }

  getCriteriaGroup(criteriaType: CriteriaType): CriteriaGroup | undefined {
    return this.criteriaGroups().find(group => group.type === criteriaType);
  }

  getDistributionControl(criteriaId: string): FormGroup | undefined {
    return this.distributionsArray.controls.find(control =>
      control.get('value')?.value === criteriaId
    ) as FormGroup;
  }

  getDistributionValueControl(criteriaId: string): FormControl | undefined {
    const control = this.getDistributionControl(criteriaId);
    return control?.get('value') as FormControl;
  }

  getDistributionPercentageControl(criteriaId: string): FormControl | undefined {
    const control = this.getDistributionControl(criteriaId);
    return control?.get('percentage') as FormControl;
  }

  protected getDistributionControlByIndex(criteriaType: CriteriaType, itemIndex: number): FormGroup | undefined {
    const group = this.getCriteriaGroup(criteriaType);
    if (!group || itemIndex >= group.items.length) return undefined;

    const item = group.items[itemIndex];
    // If item has no criteriaId (new item), find by FormArray index that matches our UI index
    if (!item.criteriaId) {
      // For new items, the FormArray control would be at the corresponding index
      const formArrayIndex = this.getFormArrayIndexForItem(criteriaType, itemIndex);
      return this.distributionsArray.at(formArrayIndex) as FormGroup;
    }

    return this.getDistributionControl(item.criteriaId);
  }

  protected getDistributionValueControlByIndex(criteriaType: CriteriaType, itemIndex: number): FormControl | undefined {
    const control = this.getDistributionControlByIndex(criteriaType, itemIndex);
    return control?.get('value') as FormControl;
  }

  protected getDistributionPercentageControlByIndex(criteriaType: CriteriaType, itemIndex: number): FormControl | undefined {
    const control = this.getDistributionControlByIndex(criteriaType, itemIndex);
    return control?.get('percentage') as FormControl;
  }

  private getFormArrayIndexForItem(criteriaType: CriteriaType, itemIndex: number): number {
    // Calculate the FormArray index based on the criteria type and item index
    const groups = this.criteriaGroups();
    let formArrayIndex = 0;

    for (const group of groups) {
      if (group.type === criteriaType) {
        return formArrayIndex + itemIndex;
      }
      if (group.selected) {
        formArrayIndex += group.items.length;
      }
    }

    return formArrayIndex;
  }

  resetForm(): void {
    this.scenarioForm.reset();
    this.allSurveys.update(surveys =>
      surveys.map(survey => ({ ...survey, selected: false }))
    );
    this.updateSelectedSurveysFormArray();
    this.criteriaGroups.set([]);
  }

}