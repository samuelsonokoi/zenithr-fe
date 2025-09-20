import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { Stepper } from '../../components/stepper/stepper';
import { StepperConfig } from '../../core/models/stepper.model';

@Component({
  selector: 'app-new-scenario',
  standalone: true,
  imports: [Stepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-scenario.html',
})
export class NewScenario {
  stepperConfig = signal<StepperConfig>({
    title: 'New Scenario',
    role: 'HR Admin'
  })
}
