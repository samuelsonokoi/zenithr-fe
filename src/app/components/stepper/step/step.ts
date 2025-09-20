import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-step',
  standalone: true,
  providers: [{provide: CdkStepper, useExisting: Step}],
  imports: [NgTemplateOutlet, CdkStepperModule],
  templateUrl: './step.html',
  styles: ``
})
export class Step extends CdkStepper {
  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }
}
