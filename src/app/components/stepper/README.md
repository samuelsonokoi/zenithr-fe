# Stepper Component

A comprehensive stepper component that extends Angular CDK Stepper with advanced step management, validation, and state tracking capabilities.

## Basic Usage

```typescript
@Component({
  template: `
    <app-stepper [stepperConfig]="config"
                 (cancelClicked)="onCancel()"
                 (finishClicked)="onFinish()"
                 (stepChanged)="onStepChanged($event)">
      <cdk-step label="Product">Product content</cdk-step>
      <cdk-step label="Surveys">Surveys content</cdk-step>
      <cdk-step label="Criteria">Criteria content</cdk-step>
    </app-stepper>
  `
})
export class MyWorkflow {
  config: StepperConfig = {
    title: 'My Workflow',
    role: 'User',
    steps: [
      { id: 'step1', title: 'Step 1', completed: false },
      { id: 'step2', title: 'Step 2', completed: false },
      { id: 'step3', title: 'Step 3', completed: false }
    ]
  };

  onCancel() { /* handle cancel */ }
  onFinish() { /* handle finish */ }
  onStepChanged(event) { /* handle step change */ }
}
```

## Configuration Examples

### User Registration Workflow

```typescript
const userRegistrationConfig: StepperConfig = {
  title: 'User Registration',
  role: 'New User',
  steps: [
    { id: 'account', title: 'Account Details', completed: false },
    { id: 'profile', title: 'Profile Information', completed: false },
    { id: 'verification', title: 'Email Verification', completed: false }
  ]
};
```

### Employee Onboarding with Optional Steps

```typescript
const onboardingConfig: StepperConfig = {
  title: 'Employee Onboarding',
  role: 'HR Administrator',
  steps: [
    { id: 'personal', title: 'Personal Information', completed: false },
    { id: 'documents', title: 'Document Upload', completed: false },
    { id: 'benefits', title: 'Benefits Selection', optional: true, completed: false },
    { id: 'equipment', title: 'Equipment Assignment', completed: false },
    { id: 'training', title: 'Training Schedule', optional: true, completed: false }
  ]
};
```

### Data Migration with Error Handling

```typescript
const migrationConfig: StepperConfig = {
  title: 'Data Migration',
  role: 'System Administrator',
  steps: [
    { id: 'source', title: 'Source Selection', completed: true },
    { id: 'mapping', title: 'Field Mapping', hasError: true, completed: false },
    { id: 'validation', title: 'Data Validation', completed: false },
    { id: 'execution', title: 'Execute Migration', completed: false }
  ]
};
```

### Dynamic Configuration Based on User Role

```typescript
generateProjectConfig(userRole: 'admin' | 'manager' | 'developer'): StepperConfig {
  const baseSteps = [
    { id: 'basics', title: 'Project Basics', completed: false },
    { id: 'team', title: 'Team Assignment', completed: false }
  ];

  if (userRole === 'admin') {
    baseSteps.push({ id: 'permissions', title: 'Access Permissions', completed: false });
  }

  if (userRole === 'manager') {
    baseSteps.push({ id: 'budget', title: 'Budget Planning', optional: true, completed: false });
  }

  return { title: 'Project Setup', role: userRole, steps: baseSteps };
}
```

## Step Validation Examples

### Basic Step Validation

```typescript
onStepChanged(event: { fromIndex: number; toIndex: number; stepId: string }) {
  const isValid = this.validateStep(event.fromIndex);

  if (isValid) {
    this.stepper.markStepAsCompleted(event.fromIndex);
    this.stepper.clearStepError(event.fromIndex);
  } else {
    this.stepper.markStepAsError(event.fromIndex);
    // Optionally prevent navigation
    if (!this.stepper.isStepOptional(event.fromIndex)) {
      this.stepper.selectedIndex = event.fromIndex; // Stay on current step
    }
  }
}
```

### Real-time Validation with Forms

```typescript
// Monitor form changes and update step states
this.myForm.valueChanges.subscribe(() => {
  const currentStepIndex = this.stepper.selectedIndex;
  const isValid = this.myForm.valid;

  if (isValid) {
    this.stepper.markStepAsCompleted(currentStepIndex);
  } else {
    this.stepper.markStepAsError(currentStepIndex);
  }
});
```

## Programmatic Step Control

### Basic Step State Management

```typescript
// Mark step as completed
this.stepper.markStepAsCompleted(0);

// Mark step as having error
this.stepper.markStepAsError(1);

// Clear step error
this.stepper.clearStepError(1);

// Update step by ID instead of index
this.stepper.updateStepFromParent('product', {
  completed: true,
  hasError: false
});
```

### Bulk Step Updates

```typescript
// Bulk update multiple step states
updateStepperProgress(validationResults: StepValidation[]) {
  validationResults.forEach((result, index) => {
    if (result.isValid) {
      this.stepper.markStepAsCompleted(index);
    } else {
      this.stepper.markStepAsError(index);
    }
  });
}

// Update step by ID instead of index
validateAndUpdateStep(stepId: string, isValid: boolean) {
  this.stepper.updateStepFromParent(stepId, {
    completed: isValid,
    hasError: !isValid
  });
}
```

## Key Features

- **Navigation Control**: Prevents navigation to invalid steps or through invalid steps
- **State Management**: Tracks completion, error, and optional states for each step
- **Accessibility**: Full keyboard navigation and ARIA support with screen reader compatibility
- **Responsive Design**: Adapts to different screen sizes with mobile-first approach
- **Event Handling**: Emits events for cancel, finish, and step changes with detailed context
- **Validation Integration**: Real-time integration with Angular reactive forms and custom validators
- **Visual Feedback**: Dynamic CSS classes and icons based on step state
- **Enterprise Ready**: Supports complex workflows with conditional steps and error recovery

## Step States

- `completed`: Step has been successfully completed and validation passed
- `hasError`: Step has validation errors that block navigation until resolved
- `optional`: Step can be skipped without completion (but still validates if data entered)
- `editable`: Step can be navigated back to for corrections (default: true)
- `disabled`: Step is completely inaccessible (cannot navigate to at all)

## Navigation Rules

1. **Current Step**: Can always navigate to the currently selected step
2. **Backward Navigation**: Can return to any previous step if editable (default behavior)
3. **Forward Navigation**: Can only proceed if current step is completed OR optional (without errors)
4. **Error Blocking**: Steps with `hasError: true` prevent ANY navigation until resolved
5. **Sequential Validation**: Cannot skip over incomplete required steps
6. **Optional Step Flexibility**: Optional steps can be skipped but validate if they contain data

## Enterprise Use Cases

- **Multi-Stage Form Workflows**: User registration, employee onboarding, project setup
- **Data Processing Pipelines**: Import/export wizards, migration workflows, batch operations
- **Approval Processes**: Document review, expense approvals, workflow management
- **Configuration Wizards**: System setup, application configuration, user preferences
- **Survey and Assessment Tools**: Multi-section questionnaires, evaluation forms

## API Reference

### Inputs

| Property | Type | Description |
|----------|------|-------------|
| `stepperConfig` | `StepperConfig` | Configuration object defining steps and metadata |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `cancelClicked` | `void` | Emitted when cancel button is clicked |
| `finishClicked` | `void` | Emitted when finish button is clicked |
| `stepChanged` | `{ fromIndex: number; toIndex: number; stepId: string }` | Emitted when step changes |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `markStepAsCompleted(index)` | `stepIndex: number` | Mark step as completed |
| `markStepAsError(index)` | `stepIndex: number` | Mark step as having error |
| `clearStepError(index)` | `stepIndex: number` | Clear step error state |
| `updateStepFromParent(id, updates)` | `stepId: string, updates: Partial<StepConfig>` | Update step by ID |
| `canNavigateToNextStep()` | - | Check if can navigate forward |
| `canNavigateToStep(index)` | `targetIndex: number` | Check if can navigate to specific step |

## StepperConfig Interface

```typescript
interface StepperConfig {
  title: string;
  role: string;
  steps: StepConfig[];
}

interface StepConfig {
  id: string;
  title: string;
  optional?: boolean;
  editable?: boolean;
  completed?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  data?: any;
}
```