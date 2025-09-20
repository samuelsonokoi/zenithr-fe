import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import { NgTemplateOutlet, CommonModule } from '@angular/common';
import { StepperConfig } from '../../core/models/stepper.model';

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

  selectStepByIndex(index: number): void {
    if (this.canNavigateToStep(index)) {
      this.selectedIndex = index;
    }
  }

  goToNextStep(): void {
    if (this.selectedIndex < this.steps.length - 1 && this.canNavigateToNextStep()) {
      this.selectedIndex++;
    }
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

    if (targetIndex < this.selectedIndex) {
      return true;
    }

    const validations = this.stepperConfig()?.stepValidations;
    if (validations) {
      for (let i = this.selectedIndex; i < targetIndex; i++) {
        if (i < validations.length && !validations[i]) {
          return false;
        }
      }
    }

    return true;
  }

  goToPreviousStep(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
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

    if (stepIndex < this.selectedIndex) {
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
}
