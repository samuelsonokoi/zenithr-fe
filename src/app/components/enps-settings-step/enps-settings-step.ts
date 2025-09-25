import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-enps-settings-step',
  templateUrl: './enps-settings-step.html',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnpsSettingsStep {
  enpsSettingsGroup = input.required<FormGroup>();

  protected enpsSettingsTotal(): number {
    const values = this.enpsSettingsGroup().value;
    const enpsValues = [
      Number(values.promoters) || 0,
      Number(values.passives) || 0,
      Number(values.detractors) || 0
    ];

    const filledValues = enpsValues.filter(value => value > 0);
    const average = filledValues.length > 0 ? filledValues.reduce((sum, value) => sum + value, 0) / filledValues.length : 0;
    return Math.round(average * 100) / 100;
  }
}