import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-impact-driver-step',
  templateUrl: './impact-driver-step.html',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImpactDriverStep {
  impactDriversGroup = input.required<FormGroup>();

  protected impactDriversTotal(): number {
    const values = this.impactDriversGroup().value;
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
}