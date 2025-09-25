import { Component, ChangeDetectionStrategy, input, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CriteriaType, CriteriaOption, CriteriaGroup } from '../../core/models/scenario.model';
import { availableCriteria, criteriaOptions } from '../../core/data/scenario-options';

@Component({
  selector: 'app-criteria-distribution',
  templateUrl: './criteria-distribution.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriteriaDistribution {
  criteriaDistributionsArray = input.required<FormArray>();

  readonly availableCriteria: { type: CriteriaType; name: string }[] = availableCriteria;
  readonly criteriaOptions: Record<CriteriaType, CriteriaOption[]> = criteriaOptions;

  private readonly criteriaGroups = signal<CriteriaGroup[]>([]);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly selectedCriteriaTypes = computed(() => {
    const groups = this.criteriaGroups();
    return groups.filter(group => group.selected).map(group => group.type);
  });

  // Original validation methods from the parent component
  criteriaGroupStatus(): string {
    const selectedTypes = this.selectedCriteriaTypes();

    if (selectedTypes.length === 0) {
      return 'VALID';
    }

    for (const criteriaType of selectedTypes) {
      const items = this.getDistributionItemsByType(criteriaType);

      if (items.length === 0) {
        return 'INVALID';
      }

      for (const item of items) {
        const criteriaId = item.get('criteriaId')?.value;
        const percentage = item.get('percentage')?.value;

        if (!criteriaId || criteriaId.trim() === '') {
          return 'INVALID';
        }

        if (!percentage || percentage <= 0) {
          return 'INVALID';
        }
      }

      if (this.hasDuplicatesInType(criteriaType)) {
        return 'INVALID';
      }
    }

    return 'VALID';
  }

  criteriaValidation(): boolean {
    const uniqueTypes = new Set<CriteriaType>();
    const formArray = this.criteriaDistributionsArray();

    for (const control of formArray.controls) {
      const criteriaType = control.get('criteriaType')?.value;
      if (criteriaType) {
        uniqueTypes.add(criteriaType);
      }
    }
    const selectedTypes = Array.from(uniqueTypes);

    if (selectedTypes.length === 0) {
      return false;
    }

    return selectedTypes.every(criteriaType => {
      const items = this.getDistributionItemsByType(criteriaType);
      if (items.length === 0) return false;

      return items.every(item => {
        const criteriaId = item.get('criteriaId')?.value;
        const percentage = item.get('percentage')?.value;
        return criteriaId && criteriaId.trim() !== '' && percentage != null && percentage > 0;
      });
    });
  }

  protected toggleCriterion(criteriaType: CriteriaType): void {
    this.criteriaGroups.update(groups => {
      const existingGroupIndex = groups.findIndex(g => g.type === criteriaType);

      if (existingGroupIndex >= 0) {
        groups[existingGroupIndex].selected = !groups[existingGroupIndex].selected;
        if (!groups[existingGroupIndex].selected) {
          this.clearCriteriaFromFormArray(criteriaType);

          groups[existingGroupIndex].items = [];
          groups[existingGroupIndex].totalPercentage = 0;
        }
      } else {
        const criteriaName = this.availableCriteria.find(c => c.type === criteriaType)?.name || criteriaType;
        groups.push({
          type: criteriaType,
          name: criteriaName,
          selected: true,
          items: [],
          totalPercentage: 0
        });
      }
      return [...groups];
    });

    this.cdr.detectChanges();
  }

  private createDistributionFormGroup(criteriaType: CriteriaType, criteriaId: string = '', percentage: number | null = null): FormGroup {
    return new FormGroup({
      criteriaType: new FormControl(criteriaType, [Validators.required]),
      criteriaId: new FormControl(criteriaId, [Validators.required]),
      percentage: new FormControl(percentage, [Validators.required, Validators.min(0), Validators.max(100)])
    });
  }

  protected addDistributionItem(criteriaType: CriteriaType, criteriaId: string = ''): void {
    const formArray = this.criteriaDistributionsArray();

    if (criteriaId) {
      const existingControl = formArray.controls.find(control =>
        control.get('criteriaId')?.value === criteriaId
      );
      if (existingControl) return;
    }

    const distributionGroup = this.createDistributionFormGroup(criteriaType, criteriaId, null);
    formArray.push(distributionGroup);
    formArray.updateValueAndValidity();

    this.cdr.detectChanges();
  }

  protected getDistributionItemsByType(criteriaType: CriteriaType): FormGroup[] {
    const formArray = this.criteriaDistributionsArray();
    return formArray.controls.filter(control =>
      control.get('criteriaType')?.value === criteriaType
    ) as FormGroup[];
  }

  protected getCriteriaName(criteriaType: CriteriaType): string {
    const criteria = this.availableCriteria.find(c => c.type === criteriaType);
    return criteria ? criteria.name : criteriaType;
  }

  protected getDistributionItemsCount(criteriaType: CriteriaType): number {
    return this.getDistributionItemsByType(criteriaType).length;
  }

  protected getTotalPercentageForType(criteriaType: CriteriaType): number {
    const items = this.getDistributionItemsByType(criteriaType);
    const percentages = items
      .map(item => Number(item.get('percentage')?.value) || 0)
      .filter(p => p > 0);

    const average = percentages.length > 0
      ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
      : 0;
    return Math.round(average * 100) / 100;
  }

  protected hasDuplicatesInType(criteriaType: CriteriaType): boolean {
    const items = this.getDistributionItemsByType(criteriaType);
    const values = items
      .map(item => item.get('criteriaId')?.value)
      .filter(v => v && v.trim() !== '');
    const uniqueValues = new Set(values);
    return values.length !== uniqueValues.size;
  }

  protected removeDistributionItem(criteriaType: CriteriaType, itemIndex: number): void {
    const itemsOfType = this.getDistributionItemsByType(criteriaType);
    if (itemIndex < 0 || itemIndex >= itemsOfType.length) return;

    const itemToRemove = itemsOfType[itemIndex];
    const formArray = this.criteriaDistributionsArray();
    const formArrayIndex = formArray.controls.indexOf(itemToRemove);

    if (formArrayIndex !== -1) {
      formArray.removeAt(formArrayIndex);
      formArray.updateValueAndValidity();
    }

    this.cdr.detectChanges();
  }

  protected updateDistributionPercentage(_criteriaType: CriteriaType, criteriaId: string, percentage: number): void {
    const formArray = this.criteriaDistributionsArray();
    const control = formArray.controls.find(control =>
      control.get('criteriaId')?.value === criteriaId
    );

    if (control) {
      const percentageControl = control.get('percentage');
      percentageControl?.setValue(percentage);
      percentageControl?.markAsTouched();

      // Force FormArray validation update
      formArray.updateValueAndValidity();

      // Trigger change detection for immediate UI updates
      this.cdr.detectChanges();
    }
  }

  protected updateDistributionPercentageFromEvent(criteriaType: CriteriaType, criteriaId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const percentage = Number(target.value) || 0;
    this.updateDistributionPercentage(criteriaType, criteriaId, percentage);
  }

  protected updateDistributionPercentageFromEventByIndex(criteriaType: CriteriaType, itemIndex: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const percentage = Number(target.value) || 0;

    const control = this.getDistributionControlByIndex(criteriaType, itemIndex);
    if (control) {
      const percentageControl = control.get('percentage');
      percentageControl?.setValue(percentage);
      percentageControl?.markAsTouched();
    }

    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0 && groups[groupIndex].items[itemIndex]) {
        groups[groupIndex].items[itemIndex].percentage = percentage;
        this.updateCriteriaTotalPercentage(criteriaType);
      }
      return [...groups];
    });

    this.cdr.detectChanges();
  }

  protected updateDistributionItem(criteriaType: CriteriaType, itemIndex: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOptionId = target.value;
    const formArray = this.criteriaDistributionsArray();

    const control = this.getDistributionControlByIndex(criteriaType, itemIndex);
    if (control) {
      const valueControl = control.get('criteriaId');
      valueControl?.setValue(selectedOptionId);
      valueControl?.markAsTouched();

      formArray.updateValueAndValidity();
    }

    if (selectedOptionId) {
      const option = this.criteriaOptions[criteriaType].find(opt => opt.id === selectedOptionId);
      if (option) {
        this.criteriaGroups.update(groups => {
          const groupIndex = groups.findIndex(g => g.type === criteriaType);
          if (groupIndex >= 0 && groups[groupIndex].items[itemIndex]) {
            groups[groupIndex].items[itemIndex].criteriaId = option.id;
            groups[groupIndex].items[itemIndex].criteriaName = option.name;
          }
          return [...groups];
        });
      }
    } else {
      this.criteriaGroups.update(groups => {
        const groupIndex = groups.findIndex(g => g.type === criteriaType);
        if (groupIndex >= 0 && groups[groupIndex].items[itemIndex]) {
          groups[groupIndex].items[itemIndex].criteriaId = '';
          groups[groupIndex].items[itemIndex].criteriaName = '';
        }
        return [...groups];
      });
    }

    this.cdr.detectChanges();
  }

  private updateCriteriaTotalPercentage(criteriaType: CriteriaType): void {
    this.criteriaGroups.update(groups => {
      const groupIndex = groups.findIndex(g => g.type === criteriaType);
      if (groupIndex >= 0) {
        const items = groups[groupIndex].items;
        const filledPercentages = items.filter(item => item.percentage != null && item.percentage > 0).map(item => item.percentage!);

        const average = filledPercentages.length > 0
          ? filledPercentages.reduce((sum, percentage) => sum + percentage, 0) / filledPercentages.length
          : 0;

        groups[groupIndex].totalPercentage = Math.round(average * 100) / 100;
      }
      return [...groups];
    });
  }

  protected isCriterionSelected(criteriaType: CriteriaType): boolean {
    return this.criteriaGroups().some(group => group.type === criteriaType && group.selected);
  }

  private getCriteriaGroup(criteriaType: CriteriaType): CriteriaGroup | undefined {
    return this.criteriaGroups().find(group => group.type === criteriaType);
  }

  private getDistributionControl(criteriaId: string): FormGroup | undefined {
    const formArray = this.criteriaDistributionsArray();
    return formArray.controls.find(control =>
      control.get('criteriaId')?.value === criteriaId
    ) as FormGroup;
  }

  protected getDistributionValueControl(criteriaId: string): FormControl | undefined {
    const control = this.getDistributionControl(criteriaId);
    return control?.get('criteriaId') as FormControl;
  }

  protected getDistributionPercentageControl(criteriaId: string): FormControl | undefined {
    const control = this.getDistributionControl(criteriaId);
    return control?.get('percentage') as FormControl;
  }

  protected getDistributionControlByIndex(criteriaType: CriteriaType, itemIndex: number): FormGroup | undefined {
    const itemsOfType = this.getDistributionItemsByType(criteriaType);
    if (itemIndex < 0 || itemIndex >= itemsOfType.length) return undefined;

    return itemsOfType[itemIndex];
  }

  protected getDistributionValueControlByIndex(criteriaType: CriteriaType, itemIndex: number): FormControl | undefined {
    const control = this.getDistributionControlByIndex(criteriaType, itemIndex);
    return control?.get('criteriaId') as FormControl;
  }

  protected getDistributionPercentageControlByIndex(criteriaType: CriteriaType, itemIndex: number): FormControl | undefined {
    const control = this.getDistributionControlByIndex(criteriaType, itemIndex);
    return control?.get('percentage') as FormControl;
  }

  protected markDistributionValueAsTouched(criteriaType: CriteriaType, itemIndex: number): void {
    const control = this.getDistributionValueControlByIndex(criteriaType, itemIndex);
    control?.markAsTouched();
    this.cdr.detectChanges();
  }

  private clearCriteriaFromFormArray(criteriaType: CriteriaType): void {
    const formArray = this.criteriaDistributionsArray();

    for (let i = formArray.length - 1; i >= 0; i--) {
      const control = formArray.at(i);
      const controlCriteriaType = control.get('criteriaType')?.value;

      if (controlCriteriaType === criteriaType) {
        formArray.removeAt(i);
      }
    }

    formArray.updateValueAndValidity();
    this.cdr.detectChanges();
  }
}