import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal, inject, ViewChild, output } from '@angular/core';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Stepper } from '../../components/stepper/stepper';
import { StepperConfig } from '../../core/models/stepper.model';
import { duplicateDistributionValueValidator } from '../../core/validators/custom.validators';
import { Scenario } from '../../core/models/scenario.model';
import { ProductStep } from '../../components/product-step/product-step';
import { TotalRespondents } from '../../components/total-respondents/total-respondents';
import { CriteriaDistribution } from '../../components/criteria-distribution/criteria-distribution';
import { ImpactDriverStep } from '../../components/impact-driver-step/impact-driver-step';
import { EnpsSettingsStep } from '../../components/enps-settings-step/enps-settings-step';
import { CommentsStep } from '../../components/comments-step/comments-step';

@Component({
  selector: 'app-new-scenario',
  standalone: true,
  imports: [Stepper, CdkStepperModule, ReactiveFormsModule, ProductStep, TotalRespondents, CriteriaDistribution, ImpactDriverStep, EnpsSettingsStep, CommentsStep],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-scenario.html',
})
export class NewScenario {
  protected readonly router = inject(Router)

  formSubmitted = output<Scenario>();

  @ViewChild(CriteriaDistribution) criteriaDistributionComponent!: CriteriaDistribution;
  readonly scenarioForm = new FormGroup({
    product: new FormGroup({
      title: new FormControl('', [Validators.required]),
      tenant: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required]),
      experienceProduct: new FormControl('', [Validators.required]),
      selectedSurveys: new FormControl([] as string[])
    }),
    respondentsTotal: new FormControl('', [Validators.required]),
    criteriaDistributions: new FormArray<FormGroup>([], [duplicateDistributionValueValidator()]),
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
      innovation: new FormControl(''),
      motivation: new FormControl(''),
      performance: new FormControl(''),
      autonomy: new FormControl(''),
      connection: new FormControl(''),
    }),
  });

  get productGroup() {
    return this.scenarioForm.controls.product as FormGroup;
  }

  get respondentsTotal() {
    return this.scenarioForm.controls.respondentsTotal as FormControl;
  }

  get criteriaDistributions() {
    return this.scenarioForm.controls.criteriaDistributions as FormArray;
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


  private readonly productGroupTouched = signal(false);
  private readonly respondentGroupTouched = signal(false);
  private readonly criteriaGroupTouched = signal(false);
  private readonly impactDriversGroupTouched = signal(false);
  private readonly enpsSettingsGroupTouched = signal(false);
  private readonly commentsGroupTouched = signal(false);


  protected criteriaGroupStatus(): string {
    return this.criteriaDistributionComponent?.criteriaGroupStatus() || 'VALID';
  }

  protected criteriaGroupValid(): boolean {
    return this.criteriaGroupStatus() === 'VALID';
  }

  protected productGroupHasError(): boolean {
    return this.productGroupTouched() && this.productGroup.status !== 'VALID';
  }

  protected respondentGroupHasError(): boolean {
    return this.respondentGroupTouched() && (this.respondentsTotal.invalid || false);
  }

  protected criteriaGroupHasError(): boolean {
    const hasValidationErrors = this.criteriaGroupStatus() !== 'VALID';
    const hasActiveInteraction = this.criteriaDistributionComponent?.selectedCriteriaTypes().length > 0 || false;

    return (this.criteriaGroupTouched() && hasValidationErrors) ||
           (hasActiveInteraction && hasValidationErrors);
  }

  protected impactDriversGroupHasError(): boolean {
    return this.impactDriversGroupTouched() && this.impactDriversGroup.status !== 'VALID';
  }

  protected enpsSettingsGroupHasError(): boolean {
    return this.enpsSettingsGroupTouched() && this.enpsSettingsGroup.status !== 'VALID';
  }

  protected commentsGroupHasError(): boolean {
    return this.commentsGroupTouched() && this.commentsGroup.status !== 'VALID';
  }

  protected stepperConfig(): StepperConfig {
    const completedSteps = this.completedSteps();

    const productValid = this.productGroup.status === 'VALID';
    const respondentValid = this.respondentsTotal.valid || false;
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





  private readonly completedSteps = signal<Set<string>>(new Set());

  protected criteriaValidation(): boolean {
    return this.criteriaDistributionComponent?.criteriaValidation() || false;
  }

  private readonly cdr = inject(ChangeDetectorRef);


  constructor() {
    this.completedSteps.update(steps => {
      steps.add('product');
      return new Set(steps);
    });
  }


  private markStepAsTouched(stepId: string): void {
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

  protected markFormGroupAsTouched(stepId: string): void {
    this.markStepAsTouched(stepId);

    this.cdr.detectChanges();
  }

  protected canCompleteCurrentStep(stepIndex: number): boolean {
    const steps = this.stepperConfig().steps;
    if (stepIndex >= steps.length) return false;

    const step = steps[stepIndex];
    if (step.optional) return true;

    return step.completed || false;
  }

  protected onStepChanged(event: { fromIndex: number; toIndex: number; stepId: string }): void {
    this.completedSteps.update(steps => {
      steps.add(event.stepId);
      return new Set(steps);
    });

    const steps = this.stepperConfig().steps;
    if (event.fromIndex >= 0 && event.fromIndex < steps.length) {
      const fromStepId = steps[event.fromIndex].id;
      this.markStepAsTouched(fromStepId);
    }

    this.cdr.detectChanges();
  }

  private isCriteriaStepCompleted(hasVisited: boolean): boolean {
    if (!hasVisited) return false;

    if (this.criteriaDistributions.length === 0) {
      return true; // User visited but chose not to add criteria
    }

    return this.criteriaValidation();
  }

  private isCommentsStepCompleted(hasVisited: boolean): boolean {
    if (!hasVisited) return false;

    return true;
  }




  private isProductGroupEmpty(): boolean {
    const productValues = this.productGroup.value;

    const hasProductData = productValues.title || productValues.tenant ||
                           productValues.company || productValues.experienceProduct ||
                           (productValues.selectedSurveys && productValues.selectedSurveys.length > 0);

    return !hasProductData;
  }

  protected onCancel(): void {
    if (this.isProductGroupEmpty()) {
      this.router.navigate(['/']);
    } else {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel? All changes will be lost.');
      if (confirmed) {
        this.resetForm();
        this.router.navigate(['/']);
      }
    }
  }

  protected onSubmit(): void {
    if (this.scenarioForm.valid) {
      const formValue = this.scenarioForm.value;
      console.log('Form submitted with values:', formValue);
      this.formSubmitted.emit(formValue);
      this.scenarioForm.reset();
      this.router.navigate(['/']);
    } else {
      console.log('Form is invalid. Please check all required fields.');
      this.markFormGroupTouched(this.scenarioForm);
      this.markAllStepsAsTouched();

      // Trigger change detection for immediate error state updates
      this.cdr.detectChanges();
    }
  }

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




























  private resetForm(): void {
    this.scenarioForm.reset();
    this.criteriaDistributions.clear();
  }
}