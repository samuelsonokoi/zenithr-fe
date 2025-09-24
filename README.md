# Zenithr - HR Survey Scenario Management System

A sophisticated Angular 20+ application designed for HR administrators to create and manage survey scenarios with complex criteria distribution and validation systems.

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
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm run watch` | Build in watch mode |
| `npm test` | Run Jest unit tests |
| `npm run test:watchAll` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

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

**Features:**

- Extended Angular CDK Stepper with advanced state management
- Step validation with error states
- Optional step support
- Programmatic navigation control
- Accessibility compliance (ARIA labels, keyboard navigation)

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

### 3. Dynamic Form Architecture

**Nested Form Structure:**

```typescript
scenarioForm = new FormGroup({
  product: new FormGroup({...}),
  criteriaDistributions: new FormArray<FormGroup>([]),
  impactDrivers: new FormGroup({...}),
  // ... more nested groups
});
```

**Dynamic Form Arrays:**

- Runtime addition/removal of criteria items
- Type-safe form controls
- Cross-field validation
- State persistence across navigation

### 4. Modular Validation System

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

### Development Environment

**Testing Strategy:**

- Jest for unit testing (replacing Karma/Jasmine)
- Component testing with Angular Testing Library patterns
- Custom validators have dedicated test coverage
- Accessibility testing integration

**Code Quality:**

- TypeScript and Angular best practice
- TypeScript strict mode enabled
- Prettier for consistent formatting
- ESLint for code quality
- Single-quote preference for strings

## 🔮 Future Enhancements

Based on the current architecture, the system is well-positioned for:

- **Backend Integration:** RESTful API integration for survey data
- **State Management:** NgRx integration for complex state scenarios  
- **Internationalization:** Angular i18n for multi-language support
- **Advanced Validation:** Server-side validation integration
- **Reporting Features:** Scenario analytics and reporting dashboards
- **Mobile Responsiveness:** Progressive Web App (PWA) capabilities
