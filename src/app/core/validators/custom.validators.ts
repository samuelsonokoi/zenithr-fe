import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

export interface CriteriaValidationErrors {
  duplicateDistributionValue?: boolean;
}

/**
 * Custom validator for duplicate values in distribution form
 * Validates that the same criteria value is not added twice across all criteria types
 */
export function duplicateDistributionValueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const distributionsArray = control as FormArray;

    if (!distributionsArray || distributionsArray.length <= 1) {
      return null;
    }

    const values = distributionsArray.controls
      .map(group => group.get('value')?.value)
      .filter(value => value && value.trim() !== '');

    const uniqueValues = new Set(values);

    if (values.length !== uniqueValues.size) {
      return { duplicateDistributionValue: true };
    }

    return null;
  };
}