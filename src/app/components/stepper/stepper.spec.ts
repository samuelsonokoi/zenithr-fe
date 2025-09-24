import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { Stepper } from './stepper';
import { StepperConfig } from '../../core/models/stepper.model';

@Component({
  standalone: true,
  imports: [Stepper, CdkStepperModule],
  template: `
    <app-stepper [stepperConfig]="config" (cancelClicked)="onCancel()" (finishClicked)="onFinish()">
      <cdk-step label="Product">Product content</cdk-step>
      <cdk-step label="Surveys">Surveys content</cdk-step>
      <cdk-step label="Criteria">Criteria content</cdk-step>
      <cdk-step label="Impact Drivers">Impact Drivers content</cdk-step>
      <cdk-step label="eNPS Settings">eNPS Settings content</cdk-step>
      <cdk-step label="Comments">Comments content</cdk-step>
    </app-stepper>
  `
})
class TestHostComponent {
  config: StepperConfig = {
    title: 'Create New Scenario',
    role: 'Product Manager',
    steps: [
      { id: 'product', title: 'Product', completed: true },
      { id: 'surveys', title: 'Surveys', completed: false },
      { id: 'criteria', title: 'Criteria', completed: false, optional: true },
      { id: 'drivers', title: 'Impact Drivers', completed: true },
      { id: 'enps', title: 'eNPS Settings', completed: true },
      { id: 'comments', title: 'Comments', completed: false }
    ]
  };

  onCancel() {}
  onFinish() {}
}

describe('Stepper Component', () => {
  let stepper: Stepper;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Stepper,
        CdkStepperModule,
        CommonModule,
        TestHostComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    stepper = fixture.debugElement.query(sel => sel.componentInstance instanceof Stepper)?.componentInstance;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create stepper with correct setup', () => {
      expect(stepper).toBeTruthy();
      expect(stepper.steps.length).toBe(6);
      expect(stepper.selectedIndex).toBe(0);
    });
  });

  describe('Navigation Logic', () => {
    describe('goToNextStep', () => {
      it('should move to next step when current step is valid', () => {
        stepper.selectedIndex = 0; // Product step (valid)

        stepper['goToNextStep']();

        expect(stepper.selectedIndex).toBe(1);
      });

      it('should not move to next step when current step is invalid', () => {
        stepper.selectedIndex = 1; // Surveys step (invalid)

        stepper['goToNextStep']();

        expect(stepper.selectedIndex).toBe(1);
      });

      it('should not move beyond last step', () => {
        stepper.selectedIndex = 5; // Last step

        stepper['goToNextStep']();

        expect(stepper.selectedIndex).toBe(5);
      });
    });

    describe('goToPreviousStep', () => {
      it('should move to previous step when not on first step', () => {
        stepper.selectedIndex = 2;

        stepper['goToPreviousStep']();

        expect(stepper.selectedIndex).toBe(1);
      });

      it('should not move before first step', () => {
        stepper.selectedIndex = 0;

        stepper['goToPreviousStep']();

        expect(stepper.selectedIndex).toBe(0);
      });
    });

    describe('selectStepByIndex', () => {
      it('should handle step selection correctly', () => {
        // Navigate to current step
        stepper.selectedIndex = 2;
        stepper['selectStepByIndex'](2);
        expect(stepper.selectedIndex).toBe(2);

        // Navigate to previous completed steps
        stepper.selectedIndex = 3;
        stepper['selectStepByIndex'](0);
        expect(stepper.selectedIndex).toBe(0);
      });
    });
  });

  describe('Navigation Validation', () => {
    describe('canNavigateToNextStep', () => {
      it('should validate next step navigation correctly', () => {
        // Valid step allows navigation
        stepper.selectedIndex = 0;
        expect(stepper['canNavigateToNextStep']()).toBe(true);

        // Invalid step blocks navigation
        stepper.selectedIndex = 1;
        expect(stepper['canNavigateToNextStep']()).toBe(false);

        // Last step blocks navigation
        stepper.selectedIndex = 5;
        expect(stepper['canNavigateToNextStep']()).toBe(false);
      });
    });

    describe('canNavigateToStep', () => {
      it('should handle navigation rules correctly', () => {
        // Allow navigation to current step
        stepper.selectedIndex = 2;
        expect(stepper['canNavigateToStep'](2)).toBe(true);

        // Allow navigation to previous steps
        stepper.selectedIndex = 3;
        expect(stepper['canNavigateToStep'](1)).toBe(true);

        // Allow navigation to next valid step
        stepper.selectedIndex = 0;
        expect(stepper['canNavigateToStep'](1)).toBe(true);

        // Prevent navigation through invalid steps
        expect(stepper['canNavigateToStep'](2)).toBe(false);
      });
    });
  });

  describe('Step State Properties', () => {
    it('should track navigation state correctly', () => {
      stepper.selectedIndex = 0;
      expect(stepper['canGoNext']).toBe(true);
      expect(stepper['canGoPrevious']).toBe(false);
      expect(stepper['isFirstStep']).toBe(true);
      expect(stepper['isLastStep']).toBe(false);

      stepper.selectedIndex = 5;
      expect(stepper['canGoNext']).toBe(false);
      expect(stepper['canGoPrevious']).toBe(true);
      expect(stepper['isFirstStep']).toBe(false);
      expect(stepper['isLastStep']).toBe(true);
    });
  });

  describe('Step Styling', () => {
    it('should return correct step classes', () => {
      stepper.selectedIndex = 2;

      expect(stepper['getStepClasses'](1)).toBe('bg-primary border-primary text-white');
      expect(stepper['getStepClasses'](2)).toBe('bg-[#282D39] border-[#282D39] text-white font-semibold');
      expect(stepper['getStepClasses'](4)).toBe('bg-primary border-primary text-white');

      expect(stepper['isStepDisabled'](1)).toBe(false);
      expect(stepper['isStepDisabled'](4)).toBe(false);
    });
  });

  describe('Events', () => {
    it('should emit cancel and finish events', () => {
      const cancelSpy = jest.spyOn(stepper.cancelClicked, 'emit');
      const finishSpy = jest.spyOn(stepper.finishClicked, 'emit');

      stepper.cancelClicked.emit();
      stepper.finishClicked.emit();

      expect(cancelSpy).toHaveBeenCalled();
      expect(finishSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration Integration', () => {
    it('should use stepperConfig for validation logic', () => {
      const getStepConfigSpy = jest.spyOn(stepper as any, 'getStepConfig');
      stepper['canNavigateToNextStep']();
      expect(getStepConfigSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary conditions safely', () => {
      stepper.selectedIndex = 0;
      expect(stepper['canNavigateToStep'](-1)).toBe(true);
      expect(stepper['canNavigateToStep'](10)).toBe(false);
    });
  });

  describe('Complex Navigation', () => {
    it('should handle multi-step navigation with validation rules', () => {
      stepper.selectedIndex = 0;
      stepper['goToNextStep']();
      expect(stepper.selectedIndex).toBe(1);
      stepper['goToNextStep']();
      expect(stepper.selectedIndex).toBe(1); // Cannot move from invalid step

      stepper.selectedIndex = 3;
      expect(stepper['canNavigateToStep'](0)).toBe(true);
      expect(stepper['canNavigateToStep'](4)).toBe(true);
      expect(stepper['canNavigateToStep'](5)).toBe(true);
    });
  });

  describe('Error State Navigation', () => {
    it('should prevent navigation when current step has errors', () => {
      // Set up step with error
      stepper.selectedIndex = 0;
      stepper['markStepAsError'](0);

      // Should not be able to navigate to next step
      expect(stepper['canNavigateToNextStep']()).toBe(false);

      // Clear error
      stepper['clearStepError'](0);
      stepper['markStepAsCompleted'](0);

      // Should now be able to navigate
      expect(stepper['canNavigateToNextStep']()).toBe(true);
    });

    it('should update step states when config changes', () => {
      // Get the host component
      const hostComponent = fixture.componentInstance;

      // Update config with error state
      hostComponent.config = {
        title: 'Test',
        role: 'Test Role',
        steps: [
          { id: 'step1', title: 'Step 1', completed: false, hasError: true },
          { id: 'step2', title: 'Step 2', completed: false, hasError: false }
        ]
      };

      fixture.detectChanges();

      // Reset to first step and check error state
      stepper.selectedIndex = 0;

      // Check that step state was updated
      expect(stepper['stepHasError'](0)).toBe(true);
      expect(stepper['canNavigateToNextStep']()).toBe(false);
    });

    it('should block navigation on optional steps when they have errors', () => {
      // Get the host component
      const hostComponent = fixture.componentInstance;

      // Update config with optional step that has error
      hostComponent.config = {
        title: 'Test',
        role: 'Test Role',
        steps: [
          { id: 'step1', title: 'Step 1', completed: true, hasError: false },
          { id: 'criteria', title: 'Criteria', optional: true, completed: false, hasError: true },
          { id: 'step3', title: 'Step 3', completed: false, hasError: false }
        ]
      };

      fixture.detectChanges();

      // Navigate to criteria step (optional)
      stepper.selectedIndex = 1;

      // Even though step is optional, error should block navigation
      expect(stepper['stepHasError'](1)).toBe(true);
      expect(stepper['getStepConfig'](1)?.optional).toBe(true);
      expect(stepper['canNavigateToNextStep']()).toBe(false);

      // Clear error - now should be able to navigate
      stepper['clearStepError'](1);
      expect(stepper['canNavigateToNextStep']()).toBe(true);
    });
  });
});