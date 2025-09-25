import { ChangeDetectionStrategy, Component, input, output, signal, effect } from '@angular/core';
import { CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import { NgTemplateOutlet } from '@angular/common';
import { StepperConfig, StepConfig } from '../../core/models/stepper.model';

/**
 * A comprehensive stepper component that extends Angular CDK Stepper with advanced step management,
 * validation, and state tracking capabilities.
 *
 * @example
 * Basic usage with step content:
 * ```typescript
 * @Component({
 *   template: `
 *     <app-stepper [stepperConfig]="config"
 *                  (cancelClicked)="onCancel()"
 *                  (finishClicked)="onFinish()"
 *                  (stepChanged)="onStepChanged($event)">
 *       <cdk-step label="Product">Product content</cdk-step>
 *       <cdk-step label="Surveys">Surveys content</cdk-step>
 *       <cdk-step label="Criteria">Criteria content</cdk-step>
 *     </app-stepper>
 *   `
 * })
 * ```
 *
 * @example
 * Configuration object structure:
 * ```typescript
 * const stepperConfig: StepperConfig = {
 *   title: 'Create New Scenario',
 *   role: 'Product Manager',
 *   steps: [
 *     { id: 'product', title: 'Product', completed: true },
 *     { id: 'surveys', title: 'Surveys', completed: false, optional: true },
 *     { id: 'criteria', title: 'Criteria', completed: false, hasError: true }
 *   ]
 * };
 * ```
 *
 * @example
 * Handling step changes and validation:
 * ```typescript
 * onStepChanged(event: { fromIndex: number; toIndex: number; stepId: string }) {
 *   // Validate previous step before allowing navigation
 *   if (this.isStepValid(event.fromIndex)) {
 *     this.stepper.markStepAsCompleted(event.fromIndex);
 *   } else {
 *     this.stepper.markStepAsError(event.fromIndex);
 *   }
 * }
 * ```
 *
 * @example
 * Programmatic step control:
 * ```typescript
 * // Mark step as completed
 * stepper.markStepAsCompleted(0);
 *
 * // Mark step as having error
 * stepper.markStepAsError(1);
 *
 * // Clear step error
 * stepper.clearStepError(1);
 *
 * // Update step from parent component
 * stepper.updateStepFromParent('product', { completed: true, hasError: false });
 * ```
 *
 * ## Key Features:
 * - **Navigation Control**: Prevents navigation to invalid steps or through invalid steps
 * - **State Management**: Tracks completion, error, and optional states for each step
 * - **Accessibility**: Full keyboard navigation and ARIA support
 * - **Responsive Design**: Adapts to different screen sizes
 * - **Event Handling**: Emits events for cancel, finish, and step changes
 * - **Validation Integration**: Works with form validation systems
 *
 * ## Step States:
 * - `completed`: Step has been successfully completed
 * - `hasError`: Step has validation errors that block navigation
 * - `optional`: Step can be skipped without completion
 * - `editable`: Step can be navigated back to (default: true)
 *
 * ## Navigation Rules:
 * 1. Can always navigate to current step
 * 2. Can navigate to previous steps if they are editable
 * 3. Can navigate forward only if all intermediate steps are completed or optional
 * 4. Cannot navigate if current step has errors (even if optional)
 * 5. Cannot navigate beyond last step
 *
 */
@Component({
  selector: 'app-stepper',
  standalone: true,
  providers: [{provide: CdkStepper, useExisting: Stepper}],
  imports: [NgTemplateOutlet, CdkStepperModule],
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
    // React to configuration changes and initialize step states
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

  protected selectStepByIndex(index: number): void {
    if (this.canNavigateToStep(index)) {
      const previousIndex = this.selectedIndex;
      this.selectedIndex = index;
      this.emitStepChange(previousIndex, index);
    }
  }

  protected goToNextStep(): void {
    if (this.selectedIndex < this.steps.length - 1 && this.canNavigateToNextStep()) {
      const previousIndex = this.selectedIndex;
      this.selectedIndex++;
      this.emitStepChange(previousIndex, this.selectedIndex);
    }
  }

  // Update step state
  /**
   * Updates the state of a specific step with the provided configuration changes.
   * Use this to mark steps as completed, add errors, or change optional status.
   *
   * @param stepIndex The zero-based index of the step to update
   * @param updates Partial step configuration with properties to update
   *
   * @example
   * ```typescript
   * // Mark step as completed
   * stepper.updateStepState(0, { completed: true, hasError: false });
   *
   * // Add error to step
   * stepper.updateStepState(1, { hasError: true, completed: false });
   * ```
   */
  protected updateStepState(stepIndex: number, updates: Partial<StepConfig>) {
    this.stepStates.update(states => {
      const current = states.get(stepIndex) || {} as StepConfig;
      states.set(stepIndex, { ...current, ...updates });
      return new Map(states);
    });
  }

  // Get step configuration
  protected getStepConfig(stepIndex: number): StepConfig | undefined {
    return this.stepStates().get(stepIndex);
  }

  // Check if step is optional
  protected isStepOptional(stepIndex: number): boolean {
    return this.getStepConfig(stepIndex)?.optional || false;
  }

  // Check if step has error
  protected stepHasError(stepIndex: number): boolean {
    return this.getStepConfig(stepIndex)?.hasError || false;
  }

  // Check if step is completed
  protected isStepCompleted(stepIndex: number): boolean {
    return this.getStepConfig(stepIndex)?.completed || false;
  }

  // Check if step is editable
  private isStepEditable(stepIndex: number): boolean {
    const config = this.getStepConfig(stepIndex);
    return config?.editable !== false; // Default to true
  }

  protected canNavigateToNextStep(): boolean {
    const stepConfig = this.getStepConfig(this.selectedIndex);
    if (!stepConfig) return false;

    // If step has error, it cannot be navigated (regardless of optional status)
    if (stepConfig.hasError) return false;

    // If step is optional, it can be navigated (as long as no errors)
    if (stepConfig.optional) return true;

    // If step is completed, it can be navigated
    if (stepConfig.completed) return true;

    // By default, step needs to be completed to navigate
    return false;
  }

  protected canNavigateToStep(targetIndex: number): boolean {
    if (targetIndex === this.selectedIndex) {
      return true;
    }

    if (targetIndex < this.selectedIndex) {
      return this.isStepEditable(targetIndex);
    }

    return this.canNavigateForward(targetIndex);
  }

  private canNavigateForward(targetIndex: number): boolean {
    const stepStates = this.stepStates();

    for (let i = this.selectedIndex; i < targetIndex; i++) {
      const stepConfig = stepStates.get(i);

      // If step is not optional and not completed, block navigation
      if (!stepConfig?.optional && !stepConfig?.completed) {
        return false;
      }

      // If step has error, block navigation
      if (stepConfig?.hasError) {
        return false;
      }
    }

    return true;
  }

  protected goToPreviousStep(): void {
    if (this.selectedIndex > 0) {
      const previousIndex = this.selectedIndex;
      this.selectedIndex--;
      this.emitStepChange(previousIndex, this.selectedIndex);
    }
  }

  protected get canGoNext(): boolean {
    return this.selectedIndex < this.steps.length - 1;
  }

  protected get canGoPrevious(): boolean {
    return this.selectedIndex > 0;
  }

  protected get isLastStep(): boolean {
    return this.selectedIndex === this.steps.length - 1;
  }

  /**
   * Determines the CSS classes for a step button based on its current state.
   * Handles styling for completed, error, current, and disabled states.
   *
   * @param stepIndex The zero-based index of the step
   * @returns A space-separated string of CSS classes
   */
  protected getStepClasses(stepIndex: number): string {
    const stepConfig = this.getStepConfig(stepIndex);
    const isDisabled = !this.canNavigateToStep(stepIndex);
    const hasError = stepConfig?.hasError || false;
    const isCompleted = stepConfig?.completed || false;

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

  protected isStepDisabled(stepIndex: number): boolean {
    return !this.canNavigateToStep(stepIndex);
  }

  protected get isFirstStep(): boolean {
    return this.selectedIndex === 0;
  }

  protected onCancel(): void {
    this.cancelClicked.emit();
  }

  protected onFinish(): void {
    this.finishClicked.emit();
  }

  // Mark step as completed
  protected markStepAsCompleted(stepIndex: number) {
    this.updateStepState(stepIndex, { completed: true, hasError: false });
  }

  // Mark step as having error
  protected markStepAsError(stepIndex: number) {
    this.updateStepState(stepIndex, { hasError: true, completed: false });
  }

  // Clear step error
  protected clearStepError(stepIndex: number) {
    this.updateStepState(stepIndex, { hasError: false });
  }

  // Method to programmatically update step states from parent
  /**
   * Updates a step's state using its string ID rather than numeric index.
   * Useful for parent components that work with step IDs from the configuration.
   *
   * @param stepId The string ID of the step as defined in the stepper configuration
   * @param updates Partial step configuration with properties to update
   *
   * @example
   * ```typescript
   * // Update step by ID
   * stepper.updateStepFromParent('product', { completed: true });
   * stepper.updateStepFromParent('criteria', { hasError: true });
   * ```
   */
  protected updateStepFromParent(stepId: string, updates: Partial<StepConfig>) {
    const stepIndex = this.stepperConfig()?.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== undefined && stepIndex >= 0) {
      this.updateStepState(stepIndex, updates);
    }
  }

  /**
   * Generates an accessible ARIA label for a step button.
   * Includes step title, optional status, completion status, and error state.
   *
   * @param stepIndex The zero-based index of the step
   * @returns A descriptive ARIA label string for accessibility
   */
  protected getStepAriaLabel(stepIndex: number): string {
    const config = this.getStepConfig(stepIndex);
    const title = config?.title || `Step ${stepIndex + 1}`;
    const optional = config?.optional ? ' (Optional)' : '';
    const completed = config?.completed ? ' - Completed' : '';
    const hasError = config?.hasError ? ' - Has Error' : '';

    return `${title}${optional}${completed}${hasError}`;
  }

  /**
   * Emits a stepChanged event with navigation details.
   *
   * @param fromIndex The zero-based index of the step being navigated from
   * @param toIndex The zero-based index of the step being navigated to
   * @internal
   */
  private emitStepChange(fromIndex: number, toIndex: number): void {
    const config = this.stepperConfig();
    const stepId = config?.steps[toIndex]?.id || `step-${toIndex}`;
    this.stepChanged.emit({ fromIndex, toIndex, stepId });
  }
}
