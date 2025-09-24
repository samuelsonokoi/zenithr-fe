/**
 * Generic data type for stepper steps to allow flexible step-specific data
 */
export type StepData = Record<string, unknown> | null;

/**
 * Configuration for individual stepper steps
 */
export type StepConfig<T extends StepData = StepData> = {
  id: string;
  title: string;
  optional?: boolean;
  editable?: boolean;
  completed?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  data?: T;
}

/**
 * Configuration for the entire stepper component
 * Includes step definitions and validation state
 */
export type StepperConfig<T extends StepData = StepData> = {
  title: string;
  role: string;
  steps: StepConfig<T>[];
}