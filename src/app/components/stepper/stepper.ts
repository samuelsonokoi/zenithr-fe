import { Component, input } from '@angular/core';
import { CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import { NgTemplateOutlet, CommonModule } from '@angular/common';
import { StepperConfig } from '../../core/models/stepper.model';

@Component({
  selector: 'app-stepper',
  standalone: true,
  providers: [{provide: CdkStepper, useExisting: Stepper}],
  imports: [NgTemplateOutlet, CdkStepperModule, CommonModule],
  templateUrl: './stepper.html',
  styles: ``
})
export class Stepper extends CdkStepper {
  stepperConfig = input<StepperConfig>();

  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }

  goToNextStep(): void {
    if (this.selectedIndex < this.steps.length - 1) {
      this.selectedIndex++;
    }
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
    if (stepIndex < this.selectedIndex) {
      return 'bg-primary border-primary text-white';
    } else if (stepIndex === this.selectedIndex) {
      return 'bg-[#282D39] border-[#282D39] text-white font-semibold';
    } else {
      return 'bg-white border border-[#747884] text-[#747884] font-semibold';
    }
  }
}
