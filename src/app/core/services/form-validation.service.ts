import { Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

/**
 * Service for centralized form validation logic
 */
@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  /**
   * Check if a form group is empty (all controls have no value)
   */
  isFormGroupEmpty(formGroup: FormGroup): boolean {
    const values = formGroup.value;
    return Object.values(values).every(value =>
      value === null || value === undefined || value === '' ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  /**
   * Validate impact drivers total (should be reasonable average)
   */
  validateImpactDriversTotal(impactDriversGroup: FormGroup): {
    isValid: boolean;
    total: number;
    filledCount: number;
  } {
    const values = impactDriversGroup.value;
    const driverValues = [
      Number(values.innovation) || 0,
      Number(values.motivation) || 0,
      Number(values.performance) || 0,
      Number(values.autonomy) || 0,
      Number(values.connection) || 0,
      Number(values.transformationalLeadership) || 0
    ];

    const filledValues = driverValues.filter(value => value > 0);
    const total = filledValues.length > 0
      ? Math.round((filledValues.reduce((sum, value) => sum + value, 0) / filledValues.length) * 100) / 100
      : 0;

    return {
      isValid: filledValues.length > 0 && total <= 100,
      total,
      filledCount: filledValues.length
    };
  }

  /**
   * Validate eNPS settings total
   */
  validateEnpsSettingsTotal(enpsSettingsGroup: FormGroup): {
    isValid: boolean;
    total: number;
    filledCount: number;
  } {
    const values = enpsSettingsGroup.value;
    const enpsValues = [
      Number(values.promoters) || 0,
      Number(values.passives) || 0,
      Number(values.detractors) || 0
    ];

    const filledValues = enpsValues.filter(value => value > 0);
    const total = filledValues.length > 0
      ? Math.round((filledValues.reduce((sum, value) => sum + value, 0) / filledValues.length) * 100) / 100
      : 0;

    // eNPS values should ideally sum to 100 or be reasonable averages
    return {
      isValid: filledValues.length > 0 && total <= 100,
      total,
      filledCount: filledValues.length
    };
  }

  /**
   * Get form step validation status
   */
  getFormStepStatus(formGroup: FormGroup, touched: boolean = false): 'VALID' | 'INVALID' | 'PRISTINE' {
    if (!touched && this.isFormGroupEmpty(formGroup)) {
      return 'PRISTINE';
    }

    return formGroup.valid ? 'VALID' : 'INVALID';
  }

  /**
   * Check if form group has validation errors and should show error state
   */
  shouldShowFormGroupError(formGroup: FormGroup, touched: boolean): boolean {
    return touched && formGroup.invalid;
  }

  /**
   * Get detailed validation errors for a form group
   */
  getFormGroupErrors(formGroup: FormGroup): Record<string, any> {
    const errors: Record<string, any> = {};

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];

      if (control instanceof FormGroup) {
        const nestedErrors = this.getFormGroupErrors(control);
        if (Object.keys(nestedErrors).length > 0) {
          errors[key] = nestedErrors;
        }
      } else if (control instanceof FormArray) {
        const arrayErrors = this.getFormArrayErrors(control);
        if (Object.keys(arrayErrors).length > 0) {
          errors[key] = arrayErrors;
        }
      } else if (control.errors) {
        errors[key] = control.errors;
      }
    });

    return errors;
  }

  /**
   * Get validation errors for a form array
   */
  getFormArrayErrors(formArray: FormArray): Record<string, any> {
    const errors: Record<string, any> = {};

    formArray.controls.forEach((control, index) => {
      if (control instanceof FormGroup) {
        const groupErrors = this.getFormGroupErrors(control);
        if (Object.keys(groupErrors).length > 0) {
          errors[index] = groupErrors;
        }
      } else if (control.errors) {
        errors[index] = control.errors;
      }
    });

    if (formArray.errors) {
      errors['__array__'] = formArray.errors;
    }

    return errors;
  }

  /**
   * Mark all controls in a form group as touched
   */
  markFormGroupAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];

      if (control instanceof FormGroup) {
        this.markFormGroupAsTouched(control);
      } else if (control instanceof FormArray) {
        this.markFormArrayAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  /**
   * Mark all controls in a form array as touched
   */
  markFormArrayAsTouched(formArray: FormArray): void {
    formArray.controls.forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
    formArray.markAsTouched();
  }

  /**
   * Validate percentage input event
   */
  validatePercentageInput(event: Event): {
    isValid: boolean;
    value: number | null;
    errorMessage?: string;
  } {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (isNaN(value)) {
      return {
        isValid: false,
        value: null,
        errorMessage: 'Please enter a valid number'
      };
    }

    if (value < 0) {
      return {
        isValid: false,
        value: null,
        errorMessage: 'Value must be greater than or equal to 0'
      };
    }

    if (value > 100) {
      return {
        isValid: false,
        value: null,
        errorMessage: 'Value must be less than or equal to 100'
      };
    }

    return {
      isValid: true,
      value
    };
  }

  /**
   * Get user-friendly error message for form validation
   */
  getFieldErrorMessage(controlName: string, errors: any): string {
    if (!errors) return '';

    if (errors['required']) {
      return `${this.formatFieldName(controlName)} is required`;
    }

    if (errors['min']) {
      return `${this.formatFieldName(controlName)} must be at least ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `${this.formatFieldName(controlName)} must not exceed ${errors['max'].max}`;
    }

    if (errors['email']) {
      return 'Please enter a valid email address';
    }

    if (errors['pattern']) {
      return `${this.formatFieldName(controlName)} format is invalid`;
    }

    return `${this.formatFieldName(controlName)} is invalid`;
  }

  /**
   * Format field name for display in error messages
   */
  private formatFieldName(controlName: string): string {
    return controlName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}