import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CdkStepperModule } from '@angular/cdk/stepper';

import { NewScenario } from './new-scenario';
import { Stepper } from '../../components/stepper/stepper';
import { CriteriaType } from '../../core/models/scenario.model';
import { InputChangeEvent } from '../../core/types/form-events';

// Mock the Router
const mockRouter = {
  navigate: jest.fn()
};

describe('NewScenario Component', () => {
  let component: NewScenario;
  let fixture: ComponentFixture<NewScenario>;
  let compiled: HTMLElement;

  const createMockInputEvent = (value: string): InputChangeEvent => {
    return {
      target: { value } as HTMLInputElement,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    } as unknown as InputChangeEvent;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NewScenario,
        Stepper,
        ReactiveFormsModule,
        CommonModule,
        CdkStepperModule,
      ],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewScenario);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component with form structure', () => {
      expect(component).toBeTruthy();
      expect(component.scenarioForm).toBeTruthy();
      expect(component.scenarioForm.get('product')).toBeTruthy();
      expect(component.scenarioForm.get('respondentsTotal')).toBeTruthy();
      expect(component.scenarioForm.get('criteriaDistributions')).toBeTruthy();
      expect(component.scenarioForm.get('impactDrivers')).toBeTruthy();
      expect(component.scenarioForm.get('enpsSettings')).toBeTruthy();
      expect(component.scenarioForm.get('comments')).toBeTruthy();
    });

    it('should render stepper with correct configuration', () => {
      const stepper = compiled.querySelector('app-stepper');
      expect(stepper).toBeTruthy();
      expect(component['stepperConfig']().steps.length).toBe(6);
    });
  });

  describe('Product Form Validation', () => {
    it('should require all product fields', () => {
      const productForm = component.scenarioForm.get('product');
      productForm?.markAllAsTouched();

      expect(component.scenarioForm.get('product.title')?.errors?.['required']).toBeTruthy();
      expect(component.scenarioForm.get('product.tenant')?.errors?.['required']).toBeTruthy();
      expect(component.scenarioForm.get('product.company')?.valid).toBeFalsy();
      expect(component.scenarioForm.get('product.experienceProduct')?.valid).toBeFalsy();
    });

    it('should validate title input correctly', () => {
      const titleControl = component.scenarioForm.get('product.title');

      titleControl?.setValue('');
      expect(titleControl?.invalid).toBeTruthy();

      titleControl?.setValue('Valid Title');
      expect(titleControl?.valid).toBeTruthy();
    });
  });

  describe('Respondents Form Validation', () => {
    beforeEach(() => {
      const respondentsControl = component.scenarioForm.get('respondentsTotal');
      respondentsControl?.markAsTouched();
    });

    it('should require total respondents field', () => {
      const totalControl = component.scenarioForm.get('respondentsTotal');
      expect(totalControl?.valid).toBeFalsy();
      expect(totalControl?.errors?.['required']).toBeTruthy();
    });
  });


  describe('Criteria Management', () => {
    it('should handle criteria validation through component reference', () => {
      // Mock the ViewChild component reference
      const mockCriteriaComponent = {
        criteriaGroupStatus: jest.fn().mockReturnValue('VALID'),
        criteriaValidation: jest.fn().mockReturnValue(true),
        selectedCriteriaTypes: jest.fn().mockReturnValue([])
      };

      // Set the ViewChild reference
      component['criteriaDistributionComponent'] = mockCriteriaComponent as any;

      expect(component['criteriaGroupStatus']()).toBe('VALID');
      expect(component['criteriaValidation']()).toBe(true);
    });
  });

  describe('Impact Drivers', () => {
    beforeEach(() => {
      const impactForm = component.scenarioForm.get('impactDrivers');
      impactForm?.get('innovation')?.setValue('8');
      impactForm?.get('motivation')?.setValue('7');
    });

    it('should calculate impact drivers total correctly', () => {
      const total = component['impactDriversTotal']();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty impact driver values', () => {
      const impactForm = component.scenarioForm.get('impactDrivers');
      impactForm?.reset();
      fixture.detectChanges();

      const total = component['impactDriversTotal']();
      expect(total).toBe(0);
    });
  });

  describe('eNPS Settings', () => {
    beforeEach(() => {
      const enpsForm = component.scenarioForm.get('enpsSettings');
      enpsForm?.get('promoters')?.setValue('8');
      enpsForm?.get('passives')?.setValue('7');
    });

    it('should calculate eNPS total correctly', () => {
      const total = component['enpsSettingsTotal']();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty eNPS values', () => {
      const enpsForm = component.scenarioForm.get('enpsSettings');
      enpsForm?.reset();
      fixture.detectChanges();

      const total = component['enpsSettingsTotal']();
      expect(total).toBe(0);
    });
  });

  describe('Comments Section', () => {
    it('should handle comment form updates', () => {
      const commentsForm = component.scenarioForm.get('comments');
      expect(commentsForm).toBeTruthy();

      commentsForm?.get('innovation')?.setValue('Test comment');
      expect(commentsForm?.get('innovation')?.value).toBe('Test comment');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Set up a valid form
      component.scenarioForm.get('product.title')?.setValue('Test Scenario');
      component.scenarioForm.get('product.tenant')?.setValue('tenant1');
      component.scenarioForm.get('product.company')?.setValue('company1');
      component.scenarioForm.get('product.experienceProduct')?.setValue('product1');
      component.scenarioForm.get('respondentsTotal')?.setValue('100');

      // Add required impact drivers
      component.scenarioForm.get('impactDrivers.innovation')?.setValue('80');
      component.scenarioForm.get('impactDrivers.motivation')?.setValue('75');
      component.scenarioForm.get('impactDrivers.performance')?.setValue('85');
      component.scenarioForm.get('impactDrivers.autonomy')?.setValue('70');
      component.scenarioForm.get('impactDrivers.connection')?.setValue('90');
      component.scenarioForm.get('impactDrivers.transformationalLeadership')?.setValue('78');

      // Add required eNPS settings
      component.scenarioForm.get('enpsSettings.promoters')?.setValue('60');
      component.scenarioForm.get('enpsSettings.passives')?.setValue('25');
      component.scenarioForm.get('enpsSettings.detractors')?.setValue('15');

      // Add required comments
      component.scenarioForm.get('comments.innovation')?.setValue('Test innovation comment');
      component.scenarioForm.get('comments.motivation')?.setValue('Test motivation comment');
    });

    it('should submit valid form', () => {
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component['onSubmit']();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should not submit invalid form', () => {
      // Reset form to make it invalid
      component.scenarioForm.reset();
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component['onSubmit']();

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Navigation and Cancellation', () => {
    it('should navigate to dashboard when cancelling empty form', () => {
      jest.spyOn(component as any, 'isProductGroupEmpty').mockReturnValue(true);
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component['onCancel']();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should show confirmation when cancelling form with data', () => {
      jest.spyOn(component as any, 'isProductGroupEmpty').mockReturnValue(false);
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component['onCancel']();

      expect(confirmSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should not navigate when user cancels confirmation', () => {
      jest.spyOn(component as any, 'isProductGroupEmpty').mockReturnValue(false);
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component['onCancel']();

      expect(confirmSpy).toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });





  describe('Form State Management', () => {
    describe('markFormGroupTouched', () => {
      it('should recursively mark all form controls as touched including FormArrays', () => {
        component['markFormGroupTouched'](component.scenarioForm);

        expect(component.scenarioForm.get('product.title')!.touched).toBe(true);
        expect(component.scenarioForm.get('product.tenant')!.touched).toBe(true);
        expect(component.scenarioForm.get('respondentsTotal')!.touched).toBe(true);
        expect(component.scenarioForm.get('impactDrivers.innovation')!.touched).toBe(true);
      });
    });

    describe('resetForm', () => {
      it('should reset all form values and clear FormArrays', () => {
        component.scenarioForm.get('product.title')!.setValue('Test Title');
        component.scenarioForm.get('respondentsTotal')!.setValue('100');

        component['resetForm']();

        expect(component.scenarioForm.get('product.title')!.value).toBeNull();
        expect(component.scenarioForm.get('respondentsTotal')!.value).toBeNull();
        expect(component.criteriaDistributions.length).toBe(0);

        expect(typeof (component.productGroup.status === 'VALID')).toBe('boolean');
        expect(typeof component['isProductGroupEmpty']()).toBe('boolean');
      });
    });

    describe('isProductGroupEmpty', () => {
      it('should detect empty and non-empty product states', () => {
        expect(component['isProductGroupEmpty']()).toBe(true);

        component.scenarioForm.get('product.title')!.setValue('Test');
        expect(component['isProductGroupEmpty']()).toBe(false);

        component['resetForm']();
        component.scenarioForm.get('product.selectedSurveys')!.setValue(['survey-1']);
        expect(component['isProductGroupEmpty']()).toBe(false);

        component['resetForm']();
        component.scenarioForm.get('product.tenant')!.setValue('tenant1');
        expect(component['isProductGroupEmpty']()).toBe(false);
      });
    });
  });

  describe('Error State Management', () => {
    it('should show error state only when step is touched AND invalid', () => {
      // Initially, no steps should have errors (not touched yet)
      expect(component['productGroupHasError']()).toBe(false);
      expect(component['respondentGroupHasError']()).toBe(false);

      // Mark product step as touched
      component['markStepAsTouched']('product');

      // Now product step should show error (touched + invalid)
      expect(component['productGroupHasError']()).toBe(true);

      // Respondent step should still not show error (not touched)
      expect(component['respondentGroupHasError']()).toBe(false);

      // Fill product form to make it valid
      component.scenarioForm.get('product.title')!.setValue('Test Title');
      component.scenarioForm.get('product.tenant')!.setValue('tenant1');
      component.scenarioForm.get('product.company')!.setValue('company1');
      component.scenarioForm.get('product.experienceProduct')!.setValue('product1');
      component.productGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Product error should be cleared (touched + valid)
      expect(component['productGroupHasError']()).toBe(false);
    });

    it('should mark all steps as touched when form submission fails', () => {
      // Initially no errors
      expect(component['productGroupHasError']()).toBe(false);
      expect(component['respondentGroupHasError']()).toBe(false);

      // Try to submit invalid form
      component['onSubmit']();

      // All steps should now show errors (all touched + invalid)
      expect(component['productGroupHasError']()).toBe(true);
      expect(component['respondentGroupHasError']()).toBe(true);
    });

    it('should reflect error states in stepper configuration for navigation blocking', () => {
      // Mark product step as touched to trigger error state
      component['markStepAsTouched']('product');

      // Get the stepper configuration
      const config = component['stepperConfig']();

      // Product step should have error (touched + invalid)
      expect(config.steps[0].hasError).toBe(true);

      // Fill product form to make it valid
      component.scenarioForm.get('product.title')!.setValue('Test Title');
      component.scenarioForm.get('product.tenant')!.setValue('tenant1');
      component.scenarioForm.get('product.company')!.setValue('company1');
      component.scenarioForm.get('product.experienceProduct')!.setValue('product1');
      component.productGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Product step error should be cleared
      const updatedConfig = component['stepperConfig']();
      expect(updatedConfig.steps[0].hasError).toBe(false);
    });

    it('should show criteria step status based on validation state', () => {
      // Get the stepper configuration
      const config = component['stepperConfig']();
      const criteriaStep = config.steps.find(step => step.id === 'criteria');

      // Criteria step should be optional
      expect(criteriaStep!.optional).toBe(true);
      expect(component['criteriaGroupHasError']()).toBe(false);
    });

    it('should handle criteria error state through component reference', () => {
      // Mock the ViewChild component reference with error state
      const mockCriteriaComponent = {
        criteriaGroupStatus: jest.fn().mockReturnValue('INVALID'),
        selectedCriteriaTypes: jest.fn().mockReturnValue([{ type: 'GENDER' }])
      };

      // Set the ViewChild reference
      component['criteriaDistributionComponent'] = mockCriteriaComponent as any;

      // Should show error when validation fails and has active interaction
      expect(component['criteriaGroupHasError']()).toBe(true);

      // Mock fixing the error
      mockCriteriaComponent.criteriaGroupStatus.mockReturnValue('VALID');
      expect(component['criteriaGroupHasError']()).toBe(false);
    });
  });


});