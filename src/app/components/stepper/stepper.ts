import { Component, forwardRef, input } from '@angular/core';
import { CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import { NgTemplateOutlet } from '@angular/common';
import { StepperConfig } from '../../core/models/stepper.model';
import { Step } from './step/step';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [forwardRef(() => Step), CdkStepperModule],
  templateUrl: './stepper.html',
  styles: ``
})
export class Stepper {
  stepperConfig = input<StepperConfig>();
}
