import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal, computed, inject } from '@angular/core';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Stepper } from '../../components/stepper/stepper';
import { StepperConfig } from '../../core/models/stepper.model';
import {
  Survey,
  Option,
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
      total: new FormControl('', [Validators.required])
    }),
    criteria: new FormGroup({
      distributions: new FormArray<FormGroup>([], [duplicateDistributionValueValidator()])
    }),
    impactDrivers: new FormGroup({
      innovation: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      motivation: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      performance: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      autonomy: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      connection: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      transformationalLeadership: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
    }),
    enpsSettings: new FormGroup({
      promoters: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      passives: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      detractors: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
    }),
    comments: new FormGroup({
      innovation: new FormControl('', [Validators.required]),
      motivation: new FormControl('', [Validators.required]),
      performance: new FormControl(''),
      autonomy: new FormControl(''),
      connection: new FormControl(''),
    }),
  });

  get productGroup() {
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


  // Track touched state for each form group
  private readonly productGroupTouched = signal(false);
  private readonly respondentGroupTouched = signal(false);
  private readonly criteriaGroupTouched = signal(false);
  private readonly impactDriversGroupTouched = signal(false);
  private readonly enpsSettingsGroupTouched = signal(false);
  private readonly commentsGroupTouched = signal(false);






  // Cache selected groups to avoid filtering on every access
  private readonly selectedCriteriaGroups = computed(() =>
    this.criteriaGroups().filter(group => group.selected)
  );

  criteriaGroupStatus(): string {
    const selectedGroups = this.selectedCriteriaGroups();

    // If no criteria are selected, consider it valid (optional step)
    if (selectedGroups.length === 0) {
      return 'VALID';
    }

    // Check if all selected criteria have valid distributions
    const hasEmptyDistributions = selectedGroups.some(group => group.items.length === 0);
    if (hasEmptyDistributions) {
      return 'INVALID';
    }

    // Check if all items have valid percentages
    const hasInvalidPercentages = selectedGroups.some(group =>
      group.items.some(item => !item.percentage || item.percentage <= 0)
    );
    if (hasInvalidPercentages) {
      return 'INVALID';
    }

    // Check for duplicates in signal state (immediate feedback)
    const hasDuplicatesInSignalState = selectedGroups.some(group =>
      this.hasDuplicatesInCriteriaType(group.type)
    );
    if (hasDuplicatesInSignalState) {
      return 'INVALID';
    }

    // For required field validation, check individual controls instead of FormArray status
    // to avoid timing issues with the duplicateDistributionValueValidator
    const hasRequiredFieldErrors = selectedGroups.some(group =>
      group.items.some(item => !item.criteriaId || item.criteriaId.trim() === '')
    );
    if (hasRequiredFieldErrors) {
      return 'INVALID';
    }

    return 'VALID';
  }

  criteriaGroupValid(): boolean {
    return this.criteriaGroupStatus() === 'VALID';
  }

  // Helper methods for error detection (touched AND invalid)
  productGroupHasError(): boolean {
    return this.productGroupTouched() && this.productGroup.status !== 'VALID';
  }

  respondentGroupHasError(): boolean {
    return this.respondentGroupTouched() && this.respondentGroup.status !== 'VALID';
  }

  criteriaGroupHasError(): boolean {
    // For criteria step, show errors immediately when validation fails
    // (don't wait for touched state due to complex validation scenarios)
    const hasValidationErrors = this.criteriaGroupStatus() !== 'VALID';
    const hasActiveInteraction = this.selectedCriteriaGroups().length > 0;

    // Show errors if:
    // 1. User has interacted with criteria (touched) AND there are validation errors, OR
    // 2. User has selected criteria AND there are validation errors (immediate feedback)
    return (this.criteriaGroupTouched() && hasValidationErrors) ||
           (hasActiveInteraction && hasValidationErrors);
  }

  impactDriversGroupHasError(): boolean {
    return this.impactDriversGroupTouched() && this.impactDriversGroup.status !== 'VALID';
  }

  enpsSettingsGroupHasError(): boolean {
    return this.enpsSettingsGroupTouched() && this.enpsSettingsGroup.status !== 'VALID';
  }

  commentsGroupHasError(): boolean {
    return this.commentsGroupTouched() && this.commentsGroup.status !== 'VALID';
  }

  // Get step configuration (recalculated on each call for manual change detection)
  stepperConfig(): StepperConfig {
    const completedSteps = this.completedSteps();

    // Cache validation states to prevent repeated calculations
    const productValid = this.productGroup.status === 'VALID';
    const respondentValid = this.respondentGroup.status === 'VALID';
    const driversValid = this.impactDriversGroup.status === 'VALID';
    const enpsValid = this.enpsSettingsGroup.status === 'VALID';

    const productError = this.productGroupHasError();
    const respondentError = this.respondentGroupHasError();
    const criteriaError = this.criteriaGroupHasError();
    const driversError = this.impactDriversGroupHasError();
    const enpsError = this.enpsSettingsGroupHasError();
    const commentsError = this.commentsGroupHasError();

    return {
      title: 'New Scenario',
      role: 'HR Admin',
      steps: [
        {
          id: 'product',
          title: 'Select Product',
          completed: completedSteps.has('product') && productValid,
          hasError: productError
        },
        {
          id: 'respondents',
          title: 'Total Respondents',
          completed: completedSteps.has('respondents') && respondentValid,
          hasError: respondentError
        },
        {
          id: 'criteria',
          title: 'Select Criteria',
          optional: true,
          completed: this.isCriteriaStepCompleted(completedSteps.has('criteria')),
          hasError: criteriaError
        },
        {
          id: 'drivers',
          title: 'Set Impact Drivers',
          completed: completedSteps.has('drivers') && driversValid,
          hasError: driversError
        },
        {
          id: 'enps',
          title: 'eNPS',
          completed: completedSteps.has('enps') && enpsValid,
          hasError: enpsError
        },
        {
          id: 'comments',
          title: 'Comments',
          optional: true,
          completed: this.isCommentsStepCompleted(completedSteps.has('comments')),
          hasError: commentsError
        }
      ]
    };
  };

  readonly tenantOptions: Option[] = tenantOptions;

  readonly companyOptions: Option[] = companyOptions;

  readonly experienceProductOptions: Option[] = experienceProductOptions;

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

  // Track which steps have been visited and completed by the user
  private readonly completedSteps = signal<Set<string>>(new Set());

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
    const selectedGroups = this.selectedCriteriaGroups();

    if (selectedGroups.length === 0) {
      return false;
    }

    return selectedGroups.every(group => {
      if (group.items.length === 0) return false;

      return group.items.every(item =>
        item.criteriaId && item.criteriaId.trim() !== '' && item.percentage != null && item.percentage > 0
      );
    });
  });

  private readonly cdr = inject(ChangeDetectorRef);

  // Helper methods for calculations (replacing computed properties)
  impactDriversTotal(): number {
    const values = this.impactDriversGroup.value;
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
  }

  enpsSettingsTotal(): number {
    const values = this.enpsSettingsGroup.value;
    const enpsValues = [
      Number(values.promoters) || 0,
      Number(values.passives) || 0,
      Number(values.detractors) || 0
    ];

    const filledValues = enpsValues.filter(value => value > 0);
    const average = filledValues.length > 0 ? filledValues.reduce((sum, value) => sum + value, 0) / filledValues.length : 0;
    return Math.round(average * 100) / 100;
  }

  constructor() {
    // Initialize first step as visited
    this.completedSteps.update(steps => {
      steps.add('product');
      return new Set(steps);
    });
  }

  // Method to mark a step as completed when user moves forward
  markStepAsCompleted(stepId: string): void {
    this.completedSteps.update(steps => {
      steps.add(stepId);
      return new Set(steps);
    });
  }

  // Methods to mark form groups as touched
  markStepAsTouched(stepId: string): void {
    switch (stepId) {
      case 'product':
        this.productGroupTouched.set(true);
        break;
      case 'respondents':
        this.respondentGroupTouched.set(true);
        break;
      case 'criteria':
        this.criteriaGroupTouched.set(true);
        break;
      case 'drivers':
        this.impactDriversGroupTouched.set(true);
        break;
      case 'enps':
        this.enpsSettingsGroupTouched.set(true);
        break;
      case 'comments':
        this.commentsGroupTouched.set(true);
        break;
    }
  }

  // Method to mark a form group as touched when user interacts with it
  markFormGroupAsTouched(stepId: string): void {
    this.markStepAsTouched(stepId);

    // Trigger change detection for immediate error state updates
    this.cdr.detectChanges();
  }

  // Method to check if user can complete current step (has validation or is optional)
  canCompleteCurrentStep(stepIndex: number): boolean {
    const steps = this.stepperConfig().steps;
    if (stepIndex >= steps.length) return false;

    const step = steps[stepIndex];
    if (step.optional) return true;

    return step.completed || false;
  }

  // Handle step changes from stepper component
  protected onStepChanged(event: { fromIndex: number; toIndex: number; stepId: string }): void {
    // Mark the new step as visited
    this.completedSteps.update(steps => {
      steps.add(event.stepId);
      return new Set(steps);
    });

    // Mark the previous step as touched when user moves away from it
    const steps = this.stepperConfig().steps;
    if (event.fromIndex >= 0 && event.fromIndex < steps.length) {
      const fromStepId = steps[event.fromIndex].id;
      this.markStepAsTouched(fromStepId);
    }

    // Trigger change detection for immediate error state updates
    this.cdr.detectChanges();
  }

  // Check if criteria step is completed - only when user has actually engaged
  private isCriteriaStepCompleted(hasVisited: boolean): boolean {
    if (!hasVisited) return false;

    // For criteria step, consider it complete if:
    // 1. User has visited AND no criteria are selected (user chose to skip)
    // 2. User has visited AND criteria are properly configured
    const selectedGroups = this.criteriaGroups().filter(group => group.selected);
    if (selectedGroups.length === 0) {
      return true; // User visited but chose not to add criteria
    }

    return this.criteriaValidation();
  }

  // Check if comments step is completed - only when user has actually engaged
  private isCommentsStepCompleted(hasVisited: boolean): boolean {
    if (!hasVisited) return false;

    // Comments step is complete when user has visited it
    // (no validation required as it's optional)
    return true;
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

    this.updateSelectedSurveys();
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

    this.updateSelectedSurveys();
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
      // Mark all steps as touched to show error states
      this.markAllStepsAsTouched();

      // Trigger change detection for immediate error state updates
      this.cdr.detectChanges();
    }
  }

  // Mark all steps as touched to trigger error display
  private markAllStepsAsTouched(): void {
    this.productGroupTouched.set(true);
    this.respondentGroupTouched.set(true);
    this.criteriaGroupTouched.set(true);
    this.impactDriversGroupTouched.set(true);
    this.enpsSettingsGroupTouched.set(true);
    this.commentsGroupTouched.set(true);
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

    // Trigger change detection for immediate UI updates
    this.cdr.detectChanges();
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

      // Force FormArray validation update
      distributionsArray.updateValueAndValidity();
    }

    // Also update the signal for UI display
    this.updateCriteriaGroup(criteriaType, (group) => {
      const existingItemIndex = group.items.findIndex(item => item.criteriaId === criteriaId);
      if (existingItemIndex === -1) {
        group.items.push({
          criteriaId,
          criteriaName,
          percentage: null
        });
      }
    });

    // Trigger change detection for immediate UI updates
    this.cdr.detectChanges();
  }

  removeDistributionItem(criteriaType: CriteriaType, itemIndex: number): void {
    const group = this.getCriteriaGroup(criteriaType);
    if (!group || itemIndex >= group.items.length) return;

    // Remove from FormArray using the FormArray index
    const formArrayIndex = this.getFormArrayIndexForItem(criteriaType, itemIndex);
    const distributionsArray = this.distributionsArray;

    if (formArrayIndex !== -1 && formArrayIndex < distributionsArray.length) {
      distributionsArray.removeAt(formArrayIndex);

      // Force FormArray validation update after removal
      distributionsArray.updateValueAndValidity();
    }

    // Also update the signal for UI display
    this.updateCriteriaGroup(criteriaType, (group) => {
      group.items.splice(itemIndex, 1);
      this.updateCriteriaTotalPercentage(criteriaType);
    });

    // Trigger change detection for immediate UI updates
    this.cdr.detectChanges();
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

      // Force FormArray validation update after removal
      distributionsArray.updateValueAndValidity();
      
      this.cdr.detectChanges();
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

    // Trigger change detection for immediate UI updates
    this.cdr.detectChanges();
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

    // Trigger change detection for immediate error state updates
    this.cdr.detectChanges();
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

      // Force FormArray validation update after value change
      this.distributionsArray.updateValueAndValidity();
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

    // Trigger change detection for immediate error state updates
    this.cdr.detectChanges();
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

  private findCriteriaGroupIndex(criteriaType: CriteriaType): number {
    return this.criteriaGroups().findIndex(g => g.type === criteriaType);
  }

  private updateCriteriaGroup(criteriaType: CriteriaType, updater: (group: CriteriaGroup, index: number) => void): void {
    this.criteriaGroups.update(groups => {
      const groupIndex = this.findCriteriaGroupIndex(criteriaType);
      if (groupIndex >= 0) {
        updater(groups[groupIndex], groupIndex);
      }
      return [...groups];
    });
  }

  private getSelectedSurveyIds(): string[] {
    return this.allSurveys().filter(survey => survey.selected).map(survey => survey.id);
  }

  private updateSelectedSurveys(): void {
    this.productGroup.controls['selectedSurveys'].setValue(this.getSelectedSurveyIds());
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
    this.cdr.detectChanges();
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

    // Force FormArray validation update after clearing criteria
    this.distributionsArray.updateValueAndValidity();

    // Trigger change detection for immediate UI updates
    this.cdr.detectChanges();
  }

  hasDuplicatesInCriteriaType(criteriaType: CriteriaType): boolean {
    const group = this.getCriteriaGroup(criteriaType);
    if (!group || group.items.length <= 1) return false;

    const values = group.items
      .map(item => item.criteriaId)
      .filter(id => id && id.trim() !== '');

    const uniqueValues = new Set(values);
    return values.length !== uniqueValues.size;
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