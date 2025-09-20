import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  AfterContentInit,
  QueryList,
  ContentChildren,
  Directive,
  Input,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';

@Directive({
  selector: '[step-content]',
  standalone: true
})
export class StepContentDirective {
  @Input('step') stepNumber!: number;
  @Input() stepTitle: string = '';

  constructor(public templateRef: TemplateRef<any>) {}
}

@Component({
  selector: 'app-simple-stepper',
  standalone: true,
  imports: [CommonModule, CdkStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <!-- Step Header -->
      <div class="px-8 py-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          @for (step of steps(); track step.stepNumber; let i = $index) {
            <div class="flex items-center" [class.flex-1]="i < 4">
              <!-- Step Circle -->
              <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200"
                   [class]="getStepClasses(i)">
                @if (i < currentStep()) {
                  <!-- Completed Step -->
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                } @else {
                  <!-- Step Number -->
                  <span class="text-sm font-semibold">{{ i + 1 }}</span>
                }
              </div>

              <!-- Step Label -->
              <div class="ml-3 hidden sm:block">
                <div class="text-sm font-medium" [class]="getStepTextClasses(i)">
                  {{ step.stepTitle || 'Step ' + (i + 1) }}
                </div>
              </div>

              <!-- Connector Line -->
              @if (i < 4) {
                <div class="flex-1 h-0.5 mx-4 transition-colors duration-200"
                     [class]="getConnectorClasses(i)">
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Step Content -->
      <div class="p-8 min-h-96">
        @if (currentStepContent()) {
          <ng-container *ngTemplateOutlet="currentStepContent()!.templateRef"></ng-container>
        }
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between px-8 py-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div>
          @if (canGoPrevious()) {
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
              (click)="previous()">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          }
        </div>

        <div class="text-sm text-gray-500">
          Step {{ currentStep() + 1 }} of {{ totalSteps() }}
        </div>

        <div>
          @if (canGoNext()) {
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
              (click)="next()">
              Next
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          } @else if (isLastStep()) {
            <button
              type="button"
              class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              (click)="complete()">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class SimpleStepperComponent implements AfterContentInit {
  @ContentChildren(StepContentDirective) stepContents!: QueryList<StepContentDirective>;

  private readonly _currentStep = signal<number>(0);
  private readonly _steps = signal<StepContentDirective[]>([]);

  readonly currentStep = this._currentStep.asReadonly();
  readonly steps = this._steps.asReadonly();
  readonly totalSteps = computed(() => this.steps().length);

  readonly canGoPrevious = computed(() => this.currentStep() > 0);
  readonly canGoNext = computed(() => this.currentStep() < this.totalSteps() - 1);
  readonly isLastStep = computed(() => this.currentStep() === this.totalSteps() - 1);

  readonly currentStepContent = computed(() => {
    const currentIndex = this.currentStep();
    const steps = this.steps();
    return steps[currentIndex] || null;
  });

  ngAfterContentInit(): void {
    // Sort steps by step number and limit to 5
    const sortedSteps = this.stepContents.toArray()
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .slice(0, 5);

    this._steps.set(sortedSteps);
  }

  next(): void {
    if (this.canGoNext()) {
      this._currentStep.update(current => current + 1);
    }
  }

  previous(): void {
    if (this.canGoPrevious()) {
      this._currentStep.update(current => current - 1);
    }
  }

  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.totalSteps()) {
      this._currentStep.set(stepIndex);
    }
  }

  complete(): void {
    console.log('Stepper completed!');
    // Emit completion event or handle completion logic
  }

  getStepClasses(stepIndex: number): string {
    const current = this.currentStep();

    if (stepIndex < current) {
      // Completed step
      return 'bg-green-500 border-green-500 text-white';
    } else if (stepIndex === current) {
      // Current step
      return 'bg-primary border-primary text-white';
    } else {
      // Future step
      return 'bg-white border-gray-300 text-gray-500';
    }
  }

  getStepTextClasses(stepIndex: number): string {
    const current = this.currentStep();

    if (stepIndex <= current) {
      return 'text-gray-900';
    } else {
      return 'text-gray-500';
    }
  }

  getConnectorClasses(stepIndex: number): string {
    const current = this.currentStep();

    if (stepIndex < current) {
      return 'bg-green-500';
    } else {
      return 'bg-gray-300';
    }
  }
}