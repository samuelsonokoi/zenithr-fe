import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Declare jest for TypeScript
declare const jest: any;

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = class IntersectionObserver {
  disconnect() { /* Mock implementation */ }
  observe() { /* Mock implementation */ }
  unobserve() { /* Mock implementation */ }
};

// Mock ResizeObserver
(globalThis as any).ResizeObserver = class ResizeObserver {
  disconnect() { /* Mock implementation */ }
  observe() { /* Mock implementation */ }
  unobserve() { /* Mock implementation */ }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock CSS.supports
(globalThis as any).CSS = {
  supports: jest.fn().mockReturnValue(true),
};

// Setup global test utilities
(globalThis as any).NgZone = {
  isInAngularZone: () => true,
  run: (fn: Function) => fn(),
  runOutsideAngular: (fn: Function) => fn(),
  onStable: {
    subscribe: () => ({ unsubscribe: () => {} })
  }
};

// Setup test data helpers - keeping essential test IDs only
export const testIds = {
  // Form
  scenarioForm: 'scenario-form',

  // Stepper
  stepperContainer: 'stepper-container',
  stepperHeader: 'stepper-header',
  stepperStepItem: 'stepper-step-item',
  stepperStepNumber: 'stepper-step-number',
  stepperStepLabel: 'stepper-step-label',
  stepperContent: 'stepper-content',
  stepperNavigation: 'stepper-navigation'
};

// Helper function to get element by test id
export const getByTestId = (container: HTMLElement, testId: string): HTMLElement | null => {
  return container.querySelector(`[data-test-id="${testId}"]`);
};

// Helper function to get all elements by test id
export const getAllByTestId = (container: HTMLElement, testId: string): NodeListOf<HTMLElement> => {
  return container.querySelectorAll(`[data-test-id="${testId}"]`);
};