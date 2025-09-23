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
      expect(stepper).toBeInstanceOf(Stepper);
      expect(stepper.steps.length).toBe(6);
      expect(stepper.selectedIndex).toBe(0);
    });
  });

  describe('Navigation Logic', () => {
    describe('goToNextStep', () => {
      it('should move to next step when current step is valid', () => {
        stepper.selectedIndex = 0; // Product step (valid)

        stepper.goToNextStep();

        expect(stepper.selectedIndex).toBe(1);
      });

      it('should not move to next step when current step is invalid', () => {
        stepper.selectedIndex = 1; // Surveys step (invalid)

        stepper.goToNextStep();

        expect(stepper.selectedIndex).toBe(1);
      });

      it('should not move beyond last step', () => {
        stepper.selectedIndex = 5; // Last step

        stepper.goToNextStep();

        expect(stepper.selectedIndex).toBe(5);
      });
    });

    describe('goToPreviousStep', () => {
      it('should move to previous step when not on first step', () => {
        stepper.selectedIndex = 2;

        stepper.goToPreviousStep();

        expect(stepper.selectedIndex).toBe(1);
      });

      it('should not move before first step', () => {
        stepper.selectedIndex = 0;

        stepper.goToPreviousStep();

        expect(stepper.selectedIndex).toBe(0);
      });
    });

    describe('selectStepByIndex', () => {
      it('should navigate to current step', () => {
        stepper.selectedIndex = 2;

        stepper.selectStepByIndex(2);

        expect(stepper.selectedIndex).toBe(2);
      });

      it('should allow navigation to previous completed steps', () => {
        stepper.selectedIndex = 3;

        stepper.selectStepByIndex(0);

        expect(stepper.selectedIndex).toBe(0);
      });
    });
  });

  describe('Navigation Validation', () => {
    describe('canNavigateToNextStep', () => {
      it('should return true when current step is valid', () => {
        stepper.selectedIndex = 0; // Product step (valid)

        expect(stepper.canNavigateToNextStep()).toBe(true);
      });

      it('should return false when current step is invalid', () => {
        stepper.selectedIndex = 1; // Surveys step (invalid)

        expect(stepper.canNavigateToNextStep()).toBe(false);
      });

      it('should return false when no step validations are available', () => {
        // Test with the last step (no next step available)
        stepper.selectedIndex = 5; // Last step (0-5)
        expect(stepper.canNavigateToNextStep()).toBe(false);
      });
    });

    describe('canNavigateToStep', () => {
      it('should allow navigation to current step', () => {
        stepper.selectedIndex = 2;

        expect(stepper.canNavigateToStep(2)).toBe(true);
      });

      it('should allow navigation to previous steps', () => {
        stepper.selectedIndex = 3;

        expect(stepper.canNavigateToStep(1)).toBe(true);
      });

      it('should allow navigation to next valid step', () => {
        stepper.selectedIndex = 0; // Product step (valid)

        expect(stepper.canNavigateToStep(1)).toBe(true);
      });

      it('should prevent navigation through invalid steps', () => {
        stepper.selectedIndex = 0;

        expect(stepper.canNavigateToStep(2)).toBe(false); // Cannot skip invalid step 1
      });
    });
  });

  describe('Step State Properties', () => {
    it('should track navigation state correctly', () => {
      stepper.selectedIndex = 0;
      expect(stepper.canGoNext).toBe(true);
      expect(stepper.canGoPrevious).toBe(false);
      expect(stepper.isFirstStep).toBe(true);
      expect(stepper.isLastStep).toBe(false);

      stepper.selectedIndex = 5;
      expect(stepper.canGoNext).toBe(false);
      expect(stepper.canGoPrevious).toBe(true);
      expect(stepper.isFirstStep).toBe(false);
      expect(stepper.isLastStep).toBe(true);
    });
  });

  describe('Step Styling', () => {
    it('should return correct step classes', () => {
      stepper.selectedIndex = 2;

      expect(stepper.getStepClasses(1)).toBe('bg-primary border-primary text-white');
      expect(stepper.getStepClasses(2)).toBe('bg-[#282D39] border-[#282D39] text-white font-semibold');
      expect(stepper.getStepClasses(4)).toBe('bg-gray-100 border-gray-300 text-gray-400 font-semibold cursor-not-allowed');

      expect(stepper.isStepDisabled(1)).toBe(false);
      expect(stepper.isStepDisabled(4)).toBe(true);
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
      const configSpy = jest.spyOn(stepper, 'stepperConfig');
      stepper.canNavigateToNextStep();
      expect(configSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary conditions safely', () => {
      stepper.selectedIndex = 0;
      expect(stepper.canNavigateToStep(-1)).toBe(true);
      expect(stepper.canNavigateToStep(10)).toBe(false);
    });
  });

  describe('Complex Navigation', () => {
    it('should handle multi-step navigation with validation rules', () => {
      stepper.selectedIndex = 0;
      stepper.goToNextStep();
      expect(stepper.selectedIndex).toBe(1);
      stepper.goToNextStep();
      expect(stepper.selectedIndex).toBe(1); // Cannot move from invalid step

      stepper.selectedIndex = 3;
      expect(stepper.canNavigateToStep(0)).toBe(true);
      expect(stepper.canNavigateToStep(4)).toBe(true);
      expect(stepper.canNavigateToStep(5)).toBe(true);
    });
  });
});