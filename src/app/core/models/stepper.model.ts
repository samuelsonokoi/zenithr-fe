export interface StepConfig {
  id: string;
  title: string;
  optional?: boolean;
  editable?: boolean;
  completed?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  data?: any;
}

export type StepperConfig = {
  title: string;
  role: string;
  steps: StepConfig[];
  stepValidations?: boolean[]; // Keep for backward compatibility
}