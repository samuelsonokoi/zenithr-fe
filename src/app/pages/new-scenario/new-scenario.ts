import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
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
import { allSurveyData, availableCriteria, companyOptions, criteriaOptions, experienceProductOptions, tenantOptions } from '../../core/data/scenario-options';
import { duplicateDistributionValueValidator } from '../../core/validators/custom.validators';

@Component({
  selector: 'app-new-scenario',
  standalone: true,
  imports: [Stepper, CdkStepperModule, ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-scenario.html',
})
export class NewScenario {
  protected readonly router = inject(Router)
  protected readonly currentCommentSection = signal<CommentGroup>(CommentGroup.INNOVATION);
  protected readonly CommentGroup = CommentGroup;
  readonly scenarioForm = new FormGroup({
    product: new FormGroup({
      title: new FormControl('', [Validators.required]),
      tenant: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required]),
      experienceProduct: new FormControl('', [Validators.required]),
      selectedSurveys: new FormControl([] as string[])
    }),
    respondents: new FormGroup({
      total: new FormControl('', [Validators.required, Validators.min(0)])
    }),
    criteria: new FormGroup({
      distributions: new FormArray<FormGroup>([], [duplicateDistributionValueValidator()])
    }),
    impactDrivers: new FormGroup({
      innovation: new FormControl('', [Validators.min(0), Validators.max(100)]),
      motivation: new FormControl('', [Validators.min(0), Validators.max(100)]),
      performance: new FormControl('', [Validators.min(0), Validators.max(100)]),
      autonomy: new FormControl('', [Validators.min(0), Validators.max(100)]),
      connection: new FormControl('', [Validators.min(0), Validators.max(100)]),
      transformationalLeadership: new FormControl('', [Validators.min(0), Validators.max(100)]),
    }),
    enpsSettings: new FormGroup({
      promoters: new FormControl('', [Validators.min(0), Validators.max(100)]),
      passives: new FormControl('', [Validators.min(0), Validators.max(100)]),
      detractors: new FormControl('', [Validators.min(0), Validators.max(100)]),
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

    const filledValues = driversValues.filter(value => value > 0);
    const average = filledValues.length > 0 ? filledValues.reduce((sum, value) => sum + value, 0) / filledValues.length : 0;
    return Math.round(average * 100) / 100;
  });


  readonly enpsSettingsGroupValid = computed(() => this.enpsSettingsGroupStatus() === 'VALID');

  readonly enpsSettingsTotal = computed(() => {
    const values = this.enpsSettingsGroupValue(); // Track the value changes to make it reactive
    const enpsValues = [
      Number(values.promoters) || 0,
      Number(values.passives) || 0,
      Number(values.detractors) || 0
    ];

    const filledValues = enpsValues.filter(value => value > 0);
    const average = filledValues.length > 0 ? filledValues.reduce((sum, value) => sum + value, 0) / filledValues.length : 0;
    return Math.round(average * 100) / 100;
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

  readonly tenantOptions: TenantOption[] = tenantOptions;

  readonly companyOptions: CompanyOption[] = companyOptions;

  readonly experienceProductOptions: ExperienceProductOption[] = experienceProductOptions;

  readonly availableCriteria: { type: CriteriaType; name: string }[] = availableCriteria;

  readonly criteriaOptions: Record<CriteriaType, CriteriaOption[]> = criteriaOptions;

  private readonly allSurveys = signal<Survey[]>(allSurveyData);

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
        item.criteriaId && item.criteriaId.trim() !== '' && item.percentage != null && item.percentage > 0
      );
    });
  });

  constructor() {
  }

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

    const selectedSurveyIds = this.allSurveys().filter(survey => survey.selected).map(survey => survey.id);
    this.productGroup.controls['selectedSurveys'].setValue(selectedSurveyIds);
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

    const selectedSurveyIds = this.allSurveys().filter(survey => survey.selected).map(survey => survey.id);
    this.productGroup.controls['selectedSurveys'].setValue(selectedSurveyIds);
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

  isProductGroupEmpty(): boolean {
    const productValues = this.productGroup.value;

    const hasProductData = productValues.title || productValues.tenant ||
                           productValues.company || productValues.experienceProduct ||
                           this.allSurveys().filter(survey => survey.selected).length > 0;

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
          this.clearCriteriaFromFormArray(criteriaType);

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
      percentage: new FormControl(percentage, [Validators.required, Validators.min(0), Validators.max(100)])
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
            percentage: null
          });
        }
      }
      return [...groups];
    });
  }

  removeDistributionItem(criteriaType: CriteriaType, itemIndex: number): void {
    const group = this.getCriteriaGroup(criteriaType);
    if (!group || itemIndex >= group.items.length) return;

    // Remove from FormArray using the FormArray index
    const formArrayIndex = this.getFormArrayIndexForItem(criteriaType, itemIndex);
    const distributionsArray = this.distributionsArray;

    if (formArrayIndex !== -1 && formArrayIndex < distributionsArray.length) {
      distributionsArray.removeAt(formArrayIndex);
    }

    // Also update the signal for UI display
    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0) {
        groups[groupIndex].items.splice(itemIndex, 1);
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

  public updateDistributionPercentageFromEventByIndex(criteriaType: CriteriaType, itemIndex: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const percentage = Number(target.value) || 0;

    const control = this.getDistributionControlByIndex(criteriaType, itemIndex);
    if (control) {
      const percentageControl = control.get('percentage');
      percentageControl?.setValue(percentage);
      percentageControl?.markAsTouched();
    }

    // Also update the signal for UI display
    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0 && groups[groupIndex].items[itemIndex]) {
        groups[groupIndex].items[itemIndex].percentage = percentage;
        this.updateCriteriaTotalPercentage(criteriaType);
      }
      return [...groups];
    });
  }

  public updateDistributionItem(criteriaType: CriteriaType, itemIndex: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOptionId = target.value;

    // Always mark as touched when value changes
    const control = this.getDistributionControlByIndex(criteriaType, itemIndex);
    if (control) {
      const valueControl = control.get('value');
      valueControl?.setValue(selectedOptionId);
      valueControl?.markAsTouched();
    }

    if (selectedOptionId) {
      const option = this.criteriaOptions[criteriaType].find(opt => opt.id === selectedOptionId);
      if (option) {
        this.criteriaGroups.update(groups => {
          const groupIndex = groups.findIndex(g => g.type === criteriaType);
          if (groupIndex >= 0 && groups[groupIndex].items[itemIndex]) {
            groups[groupIndex].items[itemIndex].criteriaId = option.id;
            groups[groupIndex].items[itemIndex].criteriaName = option.name;
          }
          return [...groups];
        });
      }
    } else {
      // Clear the criteria data when empty option is selected
      this.criteriaGroups.update(groups => {
        const groupIndex = groups.findIndex(g => g.type === criteriaType);
        if (groupIndex >= 0 && groups[groupIndex].items[itemIndex]) {
          groups[groupIndex].items[itemIndex].criteriaId = '';
          groups[groupIndex].items[itemIndex].criteriaName = '';
        }
        return [...groups];
      });
    }
  }

  private updateCriteriaTotalPercentage(criteriaType: CriteriaType): void {
    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0) {
        const items = groups[groupIndex].items;
        const filledPercentages = items.filter(item => item.percentage != null && item.percentage > 0).map(item => item.percentage!);

        const average = filledPercentages.length > 0
          ? filledPercentages.reduce((sum, percentage) => sum + percentage, 0) / filledPercentages.length
          : 0;

        groups[groupIndex].totalPercentage = Math.round(average * 100) / 100;
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

    if (!item.criteriaId) {
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

  public markDistributionValueAsTouched(criteriaType: CriteriaType, itemIndex: number): void {
    const control = this.getDistributionValueControlByIndex(criteriaType, itemIndex);
    control?.markAsTouched();
  }

  private getFormArrayIndexForItem(criteriaType: CriteriaType, itemIndex: number): number {
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

  private clearCriteriaFromFormArray(criteriaType: CriteriaType): void {
    const group = this.getCriteriaGroup(criteriaType);
    if (!group) return;

    const criteriaIds = group.items.map(item => item.criteriaId);

    for (let i = this.distributionsArray.length - 1; i >= 0; i--) {
      const control = this.distributionsArray.at(i);
      const controlValue = control.get('value')?.value;

      if (criteriaIds.includes(controlValue)) {
        this.distributionsArray.removeAt(i);
      }
    }
  }

  resetForm(): void {
    this.scenarioForm.reset();
    this.distributionsArray.clear();
    this.allSurveys.update(surveys =>
      surveys.map(survey => ({ ...survey, selected: false }))
    );
    this.criteriaGroups.set([]);
  }
}