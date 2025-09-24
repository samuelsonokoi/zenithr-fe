# Zenithr - HR Survey Scenario Management System

A highly configurable, accessible, and enterprise-ready stepper component built with Angular 20+ and Tailwind CSS. This component provides dynamic content injection, robust validation, and seamless user experience for multi-step workflows.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.19+ or 20.9+
- **npm** 9+ or **Yarn** 1.22+
- **Angular CLI** 20.3+ (installed globally)

### Installation & Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd zenithr
   npm install
   # or
   yarn install
   ```

2. **Start development server:**

   ```bash
   npm start
   # or
   ng serve
   ```

   Navigate to `http://localhost:4200/` - the app will automatically reload on file changes.

3. **Build for production:**

   ```bash
   npm run build
   # or
   ng build
   ```
### Live Demo

You can click [here to view the demo](https://zenithr-fe-demo.web.app) online

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (`ng serve`) |
| `npm run build` | Build for production (`ng build`) |
| `npm run watch` | Build in watch mode (`ng build --watch --configuration development`) |
| `npm test` | Run Jest unit tests |
| `npm run test:watchAll` | Run Jest tests in watch mode |
| `npm run test:coverage` | Generate Jest test coverage report |

## 🏗️ Architecture & Design Decisions

### Modern Angular Patterns

**Standalone Components Architecture**

- No NgModules - using standalone components throughout
- Lazy-loaded routes with dynamic imports
- Reduced bundle size and improved tree-shaking

**Signal-Based State Management**

- Leveraging Angular's new signals for reactive state
- Computed values for derived state
- Enhanced performance with fine-grained reactivity
- Eliminates manual change detection in many cases

**TypeScript-First Approach**

- Strict type definitions for all models
- Custom type guards and validators
- Comprehensive interfaces for complex form data

### Component Design Philosophy

**Composition over Inheritance**

- Reusable components with clear input/output contracts
- Higher-order components for complex behaviors
- Modular design with single responsibility principle

**Accessibility-First Development**

- ARIA labels and roles throughout
- Keyboard navigation support
- Immersive user experience with responsive design
- Screen reader optimizations
- Focus management in complex interactions

### Form Architecture

**Reactive Forms with Nested Complexity**

- Multi-level form groups for step-by-step wizard
- Dynamic form arrays for criteria distribution
- Custom validators with cross-field validation
- Real-time validation feedback

**Advanced Validation Strategy**

- Custom validators (`duplicateDistributionValueValidator`)
- Step-based validation with conditional requirements
- Form state management with error boundaries
- Visual validation feedback integrated with UI

## 📁 Project Structure

```
src/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── header/           # Application header
│   │   ├── sidebar/          # Navigation sidebar
│   │   └── stepper/          # Custom stepper component
│   ├── core/                 # Core business logic
│   │   ├── data/             # Static data and options
│   │   ├── models/           # TypeScript interfaces/types
│   │   └── validators/       # Custom form validators
│   ├── pages/                # Route components
│   │   ├── dashboard/        # Main dashboard
│   │   └── new-scenario/     # Scenario creation wizard
│   ├── app.config.ts         # Application configuration
│   ├── app.routes.ts         # Routing configuration
│   └── app.ts                # Root component
├── public/                   # Static assets
└── styles.css                # Global styles
```

### Core Module Organization

**Models (`core/models/`)**

- `scenario.model.ts` - Survey and criteria type definitions
- `stepper.model.ts` - Stepper configuration interfaces
- `scenario-table.model.ts` - Dashboard data structures
- `sidebar.model.ts` - Navigation link definitions

**Data Layer (`core/data/`)**

- Centralized configuration data
- Survey options and criteria definitions
- Separated from business logic for easy updates

**Validation (`core/validators/`)**

- Custom business rule validators
- Form-level validation logic
- Reusable validation utilities

## 🔧 Key Design Patterns

### 1. Custom Stepper Component

**Advanced Features:**

- **Extended Angular CDK:** Built on Angular CDK Stepper with enhanced state management capabilities
- **Step Validation:** Comprehensive validation with error states that prevent navigation
- **Optional Steps:** Support for skippable steps with conditional validation
- **Error Handling:** Visual error indicators with ARIA error messages
- **State Persistence:** Step completion tracking across navigation sessions
- **Programmatic Control:** API for external step state management and navigation
- **Accessibility First:** Full WCAG 2.1 compliance with ARIA labels, roles, and keyboard navigation
- **Navigation Rules:** Smart navigation that prevents invalid step transitions
- **Visual Feedback:** Dynamic CSS classes based on step state (completed, error, current, disabled)

**Usage Pattern:**

```typescript
stepperConfig(): StepperConfig {
  return {
    title: 'New Scenario',
    role: 'HR Admin',
    steps: [
      { id: 'product', title: 'Select Product', completed: true },
      { id: 'criteria', title: 'Select Criteria', optional: true, hasError: false }
    ]
  };
}

// Programmatic step control API
stepper.markStepAsCompleted(0);           // Mark step as valid
stepper.markStepAsError(1);               // Add error state
stepper.clearStepError(1);                // Remove error state
stepper.updateStepFromParent('product', { // Update by step ID
  completed: true,
  hasError: false
});
```

### 2. Signal-Based Reactive Programming

**State Management:**

```typescript
// Reactive state with signals
protected readonly searchTerm = signal<string>('');
protected readonly tableData = signal<ScenarioTableData[]>([...]);

// Computed derived state
protected readonly filteredData = computed(() => {
  return this.tableData().filter(/* filtering logic */);
});
```

**Benefits:**

- Automatic dependency tracking
- Optimal change detection
- Clear data flow
- Memory efficient

**Real-World Example - Dashboard Search:**

```typescript
// Multi-field reactive search implementation
protected readonly searchTerm = signal<string>('');
protected readonly tableData = signal<ScenarioTableData[]>([...scenarios]);

protected readonly filteredTableData = computed(() => {
  const search = this.searchTerm().toLowerCase().trim();
  if (!search) return this.tableData();

  return this.tableData().filter(scenario => {
    // Search across multiple fields
    return scenario.name.toLowerCase().includes(search) ||
           scenario.respondents.toString().includes(search) ||
           `${scenario.rangeStart}-${scenario.rangeEnd}`.includes(search);
  });
});

// Single event handler updates reactive chain
protected updateSearchTerm(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.searchTerm.set(input.value); // Triggers computed recalculation
}
```

This pattern eliminates manual subscriptions and provides instant, efficient filtering across all table columns.

### 3. Dynamic Form Architecture

**Simplified Form Architecture:**

```typescript
scenarioForm = new FormGroup({
  product: new FormGroup({
    title: new FormControl('', [Validators.required]),
    tenant: new FormControl('', [Validators.required]),
    company: new FormControl('', [Validators.required]),
    experienceProduct: new FormControl('', [Validators.required]),
    selectedSurveys: new FormControl([] as string[])
  }),
  respondentsTotal: new FormControl('', [Validators.required]),
  criteriaDistributions: new FormArray<FormGroup>([], [duplicateDistributionValueValidator()]),
  impactDrivers: new FormGroup({...}),
  enpsSettings: new FormGroup({...}),
  comments: new FormGroup({...})
});
```

**Dynamic Form Arrays:**

- Runtime addition/removal of criteria items
- Type-safe form controls
- Cross-field validation
- State persistence across navigation

### 4. Access Modifier Design Pattern

**Encapsulation Strategy:**

The codebase follows a systematic approach to access modifiers for better encapsulation and maintainability:

```typescript
export class ExampleComponent {
  // Public for external API access (rare)

  // Protected for template access and testing
  protected readonly dataSignal = signal<Data[]>([]);
  protected computedValue = computed(() => this.dataSignal().length);
  protected onUserAction(): void { /* template event handler */ }

  // Private for internal implementation
  private initializeComponent(): void { /* internal logic */ }
  private validateData(data: Data): boolean { /* helper method */ }
}
```

**Testing Access Pattern:**

Protected methods in components are accessed in tests using bracket notation to maintain encapsulation while enabling testing:

```typescript
// Test access to protected methods
component['onUserAction']();
expect(component['computedValue']()).toBe(expectedValue);
expect(component['dataSignal']()).toEqual(expectedData);
```

**Benefits:**

- Clear separation between public API, template interface, and internal implementation
- Maintains encapsulation while enabling comprehensive testing
- Consistent patterns across all components
- TypeScript compiler enforces access boundaries

### 5. Modular Validation System

**Custom Validators:**

```typescript
export function duplicateDistributionValueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Business logic validation
  };
}
```

**Validation Integration:**

- Step-level validation
- Real-time feedback
- Error state management
- Accessibility compliance

## 🎯 Development Assumptions

### Target Users & Use Cases

- **Primary Users:** HR Administrators, Survey Managers
- **Use Cases:** Creating employee survey scenarios with demographic targeting
- **Workflow:** Multi-step scenario creation with validation at each stage
- **Data Complexity:** Nested criteria with percentage distributions

### Technical Assumptions

**Browser Support:**

- Modern browsers supporting ES2022+
- Angular 20+ compatibility requirements
- JavaScript enabled environment

**Performance Considerations:**

- OnPush change detection strategy for optimal performance
- Signal-based reactivity reduces unnecessary re-renders
- Lazy loading for route-based code splitting
- Efficient form validation without excessive watchers

**Accessibility Requirements:**

- WCAG 2.1 AA compliance target
- Screen reader compatibility
- Keyboard navigation throughout
- High contrast mode support

**Data Structure Assumptions:**

- Survey data is relatively static (cached client-side)
- Criteria options are predefined and configurable
- Form state needs persistence during navigation
- Real-time validation is required for user experience

### Business Logic Assumptions

**Survey Management:**

- Multiple surveys can be selected per scenario
- Pagination is needed for large survey lists
- Bulk selection operations are common

**Criteria Distribution:**

- Percentage-based distribution is the primary model
- Multiple criteria types can be active simultaneously
- Duplicate values within criteria types are invalid
- Optional criteria support flexible scenario creation

**Validation Rules:**

- Each step can have different validation requirements
- Optional steps can be skipped but not if they contain errors
- Form submission requires all required steps to be valid
- User should receive immediate feedback on validation errors

**Component Architecture Assumptions:**

- **Access Modifiers:** Components follow strict encapsulation with protected methods for template/test access and private methods for internal implementation
- **Testing Strategy:** All protected methods are testable using bracket notation while maintaining proper encapsulation
- **State Management:** Signals are preferred over observables for local component state
- **Template Binding:** Direct access to protected properties and methods from templates
- **Method Organization:** Public methods for component API, protected for templates/tests, private for internal logic

### Development Environment

**Testing Strategy:**

- **Jest Framework:** Complete unit testing setup with Jest (replacing deprecated Karma/Jasmine)
- **Component Testing:** Comprehensive test coverage with 68+ passing tests across all components
- **Access Pattern Testing:** Protected methods accessed via bracket notation (`component['method']()`)
- **Custom Validator Coverage:** Dedicated test suites for business rule validators
- **Integration Testing:** Angular Testing Library patterns for user interaction testing
- **Accessibility Testing:** ARIA labels and keyboard navigation testing integration

**Code Quality & Patterns:**

- **TypeScript Excellence:** Strict mode enabled with Angular best practices
- **Access Modifier Strategy:** Systematic use of protected/private for proper encapsulation
- **Testing Patterns:** Bracket notation for protected method access in tests
- **Code Formatting:** Prettier with 100-character line width and single quotes
- **Linting:** ESLint for consistent code quality and Angular-specific rules
- **Component Architecture:** OnPush change detection with signal-based reactivity

## 🔮 Future Enhancements

Based on the current architecture, the system is well-positioned for:

- **Backend Integration:** RESTful API integration for survey data
- **State Management:** NgRx integration for complex state scenarios  
- **Internationalization:** Angular i18n for multi-language support
- **Advanced Validation:** Server-side validation integration
- **Reporting Features:** Scenario analytics and reporting dashboards
- **Mobile Responsiveness:** Progressive Web App (PWA) capabilities
