import { Injectable, signal, computed } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CriteriaType, CriteriaOption, CriteriaGroup } from '../models/scenario.model';
import { availableCriteria, criteriaOptions } from '../data/scenario-options';

/**
 * Type for validation result
 */
export type CriteriaValidationResult = {
  isValid: boolean;
  hasDuplicates: boolean;
  hasEmptyValues: boolean;
  hasInvalidPercentages: boolean;
};

/**
 * Service for managing criteria selection, validation, and distribution logic
 */
@Injectable({
  providedIn: 'root'
})
export class CriteriaService {
  // Available criteria types
  private readonly _availableCriteria = signal(availableCriteria);
  private readonly _criteriaOptions = signal(criteriaOptions);

  // Criteria group state
  private readonly _criteriaGroups = signal<CriteriaGroup[]>(
    availableCriteria.map(criteria => ({
      type: criteria.type,
      name: criteria.name,
      selected: false,
      items: [],
      totalPercentage: 0
    }))
  );

  // Public readonly signals
  readonly availableCriteria = this._availableCriteria.asReadonly();
  readonly criteriaOptions = this._criteriaOptions.asReadonly();
  readonly criteriaGroups = this._criteriaGroups.asReadonly();

  // Computed values
  readonly selectedCriteriaGroups = computed(() =>
    this.criteriaGroups().filter(group => group.selected)
  );

  readonly selectedCriteriaTypes = computed(() =>
    this.selectedCriteriaGroups().map(group => group.type)
  );

  /**
   * Toggle criteria group selection
   */
  toggleCriteriaGroup(type: CriteriaType): void {
    this._criteriaGroups.update(groups =>
      groups.map(group =>
        group.type === type
          ? { ...group, selected: !group.selected }
          : group
      )
    );
  }

  /**
   * Get criteria options for a specific type
   */
  getCriteriaOptionsForType(type: CriteriaType): CriteriaOption[] {
    return this.criteriaOptions()[type] || [];
  }

  /**
   * Get criteria option by type and ID
   */
  getCriteriaOption(type: CriteriaType, id: string): CriteriaOption | undefined {
    const options = this.getCriteriaOptionsForType(type);
    return options.find(option => option.id === id);
  }

  /**
   * Validate criteria distribution for a specific type
   */
  validateCriteriaDistribution(
    criteriaDistributions: FormArray,
    criteriaType: CriteriaType
  ): CriteriaValidationResult {
    const items = this.getDistributionItemsByType(criteriaDistributions, criteriaType);

    if (items.length === 0) {
      return {
        isValid: false,
        hasDuplicates: false,
        hasEmptyValues: true,
        hasInvalidPercentages: false
      };
    }

    let hasEmptyValues = false;
    let hasInvalidPercentages = false;
    const criteriaIds: string[] = [];

    for (const item of items) {
      const criteriaId = item.get('criteriaId')?.value;
      const percentage = item.get('percentage')?.value;

      if (!criteriaId || criteriaId.trim() === '') {
        hasEmptyValues = true;
      } else {
        criteriaIds.push(criteriaId);
      }

      if (!percentage || percentage <= 0) {
        hasInvalidPercentages = true;
      }
    }

    const hasDuplicates = criteriaIds.length !== new Set(criteriaIds).size;

    return {
      isValid: !hasEmptyValues && !hasInvalidPercentages && !hasDuplicates,
      hasDuplicates,
      hasEmptyValues,
      hasInvalidPercentages
    };
  }

  /**
   * Get distribution items for a specific criteria type
   */
  getDistributionItemsByType(
    criteriaDistributions: FormArray,
    criteriaType: CriteriaType
  ): FormGroup[] {
    return criteriaDistributions.controls
      .filter(control => control.get('criteriaType')?.value === criteriaType) as FormGroup[];
  }

  /**
   * Check if a criteria type has duplicates
   */
  hasDuplicatesInType(criteriaDistributions: FormArray, criteriaType: CriteriaType): boolean {
    const items = this.getDistributionItemsByType(criteriaDistributions, criteriaType);
    const criteriaIds = items
      .map(item => item.get('criteriaId')?.value)
      .filter(id => id && id.trim() !== '');

    return criteriaIds.length !== new Set(criteriaIds).size;
  }

  /**
   * Validate all selected criteria types
   */
  validateAllCriteriaDistributions(criteriaDistributions: FormArray): {
    isValid: boolean;
    invalidTypes: CriteriaType[];
    validationResults: Record<string, CriteriaValidationResult>;
  } {
    const selectedTypes = this.selectedCriteriaTypes();
    const validationResults: Record<string, CriteriaValidationResult> = {};
    const invalidTypes: CriteriaType[] = [];

    if (selectedTypes.length === 0) {
      return {
        isValid: true, // No criteria selected is considered valid (optional)
        invalidTypes: [],
        validationResults: {}
      };
    }

    for (const criteriaType of selectedTypes) {
      const validation = this.validateCriteriaDistribution(criteriaDistributions, criteriaType);
      validationResults[criteriaType] = validation;

      if (!validation.isValid) {
        invalidTypes.push(criteriaType);
      }
    }

    return {
      isValid: invalidTypes.length === 0,
      invalidTypes,
      validationResults
    };
  }

  /**
   * Get criteria group status for UI display
   */
  getCriteriaGroupStatus(criteriaDistributions: FormArray): 'VALID' | 'INVALID' {
    const validation = this.validateAllCriteriaDistributions(criteriaDistributions);
    return validation.isValid ? 'VALID' : 'INVALID';
  }

  /**
   * Reset criteria group selections
   */
  resetCriteriaGroups(): void {
    this._criteriaGroups.update(groups =>
      groups.map(group => ({ ...group, selected: false }))
    );
  }

  /**
   * Set criteria group selections
   */
  setCriteriaGroups(selectedTypes: CriteriaType[]): void {
    this._criteriaGroups.update(groups =>
      groups.map(group => ({
        ...group,
        selected: selectedTypes.includes(group.type)
      }))
    );
  }

  /**
   * Get validation error message for criteria type
   */
  getValidationErrorMessage(
    criteriaDistributions: FormArray,
    criteriaType: CriteriaType
  ): string | null {
    const validation = this.validateCriteriaDistribution(criteriaDistributions, criteriaType);

    if (validation.isValid) {
      return null;
    }

    if (validation.hasEmptyValues) {
      return 'Please select criteria options for all items';
    }

    if (validation.hasInvalidPercentages) {
      return 'All percentage values must be greater than 0';
    }

    if (validation.hasDuplicates) {
      return 'Duplicate criteria options are not allowed';
    }

    return 'Invalid criteria distribution';
  }
}