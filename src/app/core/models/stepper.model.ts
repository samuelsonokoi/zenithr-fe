/**
 * Configuration for individual stepper steps
 */
export type StepConfig = {
  id: string;
  title: string;
  optional?: boolean;
  editable?: boolean;
  completed?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  data?: any;
}

/**
 * Configuration for the entire stepper component
 * Includes step definitions and validation state
 */
export type StepperConfig = {
  title: string;
  role: string;
  steps: StepConfig[];
}