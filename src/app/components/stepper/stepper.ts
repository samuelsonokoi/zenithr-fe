import { ChangeDetectionStrategy, Component, input, output, signal, effect } from '@angular/core';
import { CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import { NgTemplateOutlet, CommonModule } from '@angular/common';
import { StepperConfig, StepConfig } from '../../core/models/stepper.model';

@Component({
  selector: 'app-stepper',
  standalone: true,
  providers: [{provide: CdkStepper, useExisting: Stepper}],
  imports: [NgTemplateOutlet, CdkStepperModule, CommonModule],
  templateUrl: './stepper.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Stepper extends CdkStepper {
  stepperConfig = input<StepperConfig>();
  cancelClicked = output<void>();
  finishClicked = output<void>();
  stepChanged = output<{ fromIndex: number; toIndex: number; stepId: string }>();

  // Add step state management
  stepStates = signal<Map<number, StepConfig>>(new Map());

  constructor() {
    super();
    effect(() => {
      const config = this.stepperConfig();
      if (config?.steps) {
        this.initializeStepStates(config.steps);
      }
    });
  }

  private initializeStepStates(stepConfigs: StepConfig[]) {
    const stateMap = new Map<number, StepConfig>();
    stepConfigs.forEach((config, index) => {
      stateMap.set(index, config);
    });
    this.stepStates.set(stateMap);
  }

  selectStepByIndex(index: number): void {
    if (this.canNavigateToStep(index)) {
      const previousIndex = this.selectedIndex;
      this.selectedIndex = index;
      this.emitStepChange(previousIndex, index);
    }
  }

  goToNextStep(): void {
    if (this.selectedIndex < this.steps.length - 1 && this.canNavigateToNextStep()) {
      const previousIndex = this.selectedIndex;
      this.selectedIndex++;
      this.emitStepChange(previousIndex, this.selectedIndex);
    }
  }

  // Update step state
  updateStepState(stepIndex: number, updates: Partial<StepConfig>) {
    this.stepStates.update(states => {
      const current = states.get(stepIndex) || {} as StepConfig;
      states.set(stepIndex, { ...current, ...updates });
      return new Map(states);
    });
  }

  // Get step configuration
  getStepConfig(stepIndex: number): StepConfig | undefined {
    return this.stepStates().get(stepIndex);
  }

  // Check if step is optional
  isStepOptional(stepIndex: number): boolean {
    return this.getStepConfig(stepIndex)?.optional || false;
  }

  // Check if step has error
  stepHasError(stepIndex: number): boolean {
    return this.getStepConfig(stepIndex)?.hasError || false;
  }

  // Check if step is completed
  isStepCompleted(stepIndex: number): boolean {
    return this.getStepConfig(stepIndex)?.completed || false;
  }

  // Check if step is editable
  isStepEditable(stepIndex: number): boolean {
    const config = this.getStepConfig(stepIndex);
    return config?.editable !== false; // Default to true
  }

  canNavigateToNextStep(): boolean {
    const validations = this.stepperConfig()?.stepValidations;
    if (validations && this.selectedIndex >= 0 && this.selectedIndex < validations.length) {
      return validations[this.selectedIndex];
    }
    return false;
  }

  canNavigateToStep(targetIndex: number): boolean {
    if (targetIndex === this.selectedIndex) {
      return true;
    }

    // Allow backward navigation to editable steps
    if (targetIndex < this.selectedIndex) {
      return this.isStepEditable(targetIndex);
    }

    // Forward navigation logic with step states
    const stepStates = this.stepStates();
    for (let i = this.selectedIndex; i < targetIndex; i++) {
      const stepConfig = stepStates.get(i);

      // If step is not optional and not completed, block navigation
      if (!stepConfig?.optional && !stepConfig?.completed) {
        // Also check legacy stepValidations for backward compatibility
        const validations = this.stepperConfig()?.stepValidations;
        if (validations && i < validations.length && !validations[i]) {
          return false;
        }
      }
    }

    return true;
  }

  goToPreviousStep(): void {
    if (this.selectedIndex > 0) {
      const previousIndex = this.selectedIndex;
      this.selectedIndex--;
      this.emitStepChange(previousIndex, this.selectedIndex);
    }
  }

  get canGoNext(): boolean {
    return this.selectedIndex < this.steps.length - 1;
  }

  get canGoPrevious(): boolean {
    return this.selectedIndex > 0;
  }

  get isLastStep(): boolean {
    return this.selectedIndex === this.steps.length - 1;
  }

  getStepClasses(stepIndex: number): string {
    const isDisabled = !this.canNavigateToStep(stepIndex);
    const hasError = this.stepHasError(stepIndex);
    const isCompleted = this.isStepCompleted(stepIndex);

    if (hasError) {
      return 'bg-red-500 border-red-500 text-white';
    } else if (isCompleted || stepIndex < this.selectedIndex) {
      return 'bg-primary border-primary text-white';
    } else if (stepIndex === this.selectedIndex) {
      return 'bg-[#282D39] border-[#282D39] text-white font-semibold';
    } else if (isDisabled) {
      return 'bg-gray-100 border-gray-300 text-gray-400 font-semibold cursor-not-allowed';
    } else {
      return 'bg-white border border-[#747884] text-[#747884] font-semibold hover:border-primary hover:text-primary cursor-pointer';
    }
  }

  isStepDisabled(stepIndex: number): boolean {
    return !this.canNavigateToStep(stepIndex);
  }

  get isFirstStep(): boolean {
    return this.selectedIndex === 0;
  }

  onCancel(): void {
    this.cancelClicked.emit();
  }

  onFinish(): void {
    this.finishClicked.emit();
  }

  // Mark step as completed
  markStepAsCompleted(stepIndex: number) {
    this.updateStepState(stepIndex, { completed: true, hasError: false });
  }

  // Mark step as having error
  markStepAsError(stepIndex: number) {
    this.updateStepState(stepIndex, { hasError: true, completed: false });
  }

  // Clear step error
  clearStepError(stepIndex: number) {
    this.updateStepState(stepIndex, { hasError: false });
  }

  // Method to programmatically update step states from parent
  updateStepFromParent(stepId: string, updates: Partial<StepConfig>) {
    const stepIndex = this.stepperConfig()?.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== undefined && stepIndex >= 0) {
      this.updateStepState(stepIndex, updates);
    }
  }

  // Generate comprehensive accessibility labels
  getStepAriaLabel(stepIndex: number): string {
    const config = this.getStepConfig(stepIndex);
    const title = config?.title || `Step ${stepIndex + 1}`;
    const optional = config?.optional ? ' (Optional)' : '';
    const completed = this.isStepCompleted(stepIndex) ? ' - Completed' : '';
    const hasError = this.stepHasError(stepIndex) ? ' - Has Error' : '';

    return `${title}${optional}${completed}${hasError}`;
  }

  private emitStepChange(fromIndex: number, toIndex: number): void {
    const config = this.stepperConfig();
    const stepId = config?.steps[toIndex]?.id || `step-${toIndex}`;
    this.stepChanged.emit({ fromIndex, toIndex, stepId });
  }
}
