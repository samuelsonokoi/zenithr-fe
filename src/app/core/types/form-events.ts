/**
 * Type-safe interfaces for form event handlers
 */

/**
 * HTML Input element with value property
 */
export interface InputElement extends HTMLElement {
  value: string;
}

/**
 * HTML Select element with value property
 */
export interface SelectElement extends HTMLElement {
  value: string;
}

/**
 * Input change event with typed target
 */
export interface InputChangeEvent extends Event {
  target: InputElement;
}

/**
 * Select change event with typed target
 */
export interface SelectChangeEvent extends Event {
  target: SelectElement;
}

/**
 * Checkbox change event with typed target
 */
export interface CheckboxChangeEvent extends Event {
  target: HTMLInputElement & {
    checked: boolean;
    value: string;
  };
}

/**
 * Form submission event
 */
export interface FormSubmissionEvent extends Event {
  target: HTMLFormElement;
  preventDefault(): void;
}

/**
 * Percentage input validation result
 */
export interface PercentageValidation {
  isValid: boolean;
  value: number | null;
  errorMessage?: string;
}

/**
 * Generic form field event handler type
 */
export type FormFieldEventHandler<T = string> = (value: T) => void;

/**
 * Form validation event handler type
 */
export type FormValidationEventHandler = (event: InputChangeEvent | SelectChangeEvent) => void;

/**
 * Type guard to check if event target is an input element
 */
export function isInputElement(target: EventTarget | null): target is InputElement {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/**
 * Type guard to check if event target is a select element
 */
export function isSelectElement(target: EventTarget | null): target is SelectElement {
  return target instanceof HTMLSelectElement;
}

/**
 * Type guard to check if event target is a checkbox
 */
export function isCheckboxElement(target: EventTarget | null): target is HTMLInputElement {
  return target instanceof HTMLInputElement && target.type === 'checkbox';
}

/**
 * Utility to safely extract value from form event
 */
export function getEventValue(event: Event): string {
  const target = event.target;

  if (isInputElement(target) || isSelectElement(target)) {
    return target.value;
  }

  return '';
}

/**
 * Utility to safely extract checkbox value from event
 */
export function getCheckboxValue(event: Event): { checked: boolean; value: string } {
  const target = event.target;

  if (isCheckboxElement(target)) {
    return {
      checked: target.checked,
      value: target.value
    };
  }

  return { checked: false, value: '' };
}

/**
 * Utility to safely extract numeric value from event
 */
export function getNumericEventValue(event: Event): number | null {
  const stringValue = getEventValue(event);
  const numericValue = Number(stringValue);

  return isNaN(numericValue) ? null : numericValue;
}