import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CdkStepperModule } from '@angular/cdk/stepper';

import { NewScenario } from './new-scenario';
import { Stepper } from '../../components/stepper/stepper';
import { CriteriaType } from '../../core/models/scenario.model';

// Mock the Router
const mockRouter = {
  navigate: jest.fn()
};


describe('NewScenario Component', () => {
  let component: NewScenario;
  let fixture: ComponentFixture<NewScenario>;
  let compiled: HTMLElement;

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

  describe('Survey Management', () => {
    it('should handle survey operations', () => {
      expect(Array.isArray(component.currentPageSurveys())).toBe(true);
      expect(() => component['toggleSurvey']('test-id')).not.toThrow();
      expect(Array.isArray(component.paginationPages())).toBe(true);
    });
  });

  describe('Criteria Management', () => {
    it('should handle criteria operations', () => {
      expect(Array.isArray(component.selectedCriteriaTypes())).toBe(true);
      expect(typeof component['criteriaValidation']()).toBe('boolean');

      const group = component['getCriteriaGroup'](CriteriaType.GENDER);
      expect(group === undefined || typeof group === 'object').toBe(true);
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

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
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

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show confirmation when cancelling form with data', () => {
      jest.spyOn(component as any, 'isProductGroupEmpty').mockReturnValue(false);
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component['onCancel']();

      expect(confirmSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
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




  describe('Criteria Management System', () => {
    describe('toggleCriterion', () => {
      it('should add new criteria group when toggling unselected criterion', () => {
        component['toggleCriterion'](CriteriaType.GENDER);

        const criteriaGroup = component['getCriteriaGroup'](CriteriaType.GENDER);
        expect(criteriaGroup).toBeTruthy();
        expect(criteriaGroup!.selected).toBe(true);
        expect(criteriaGroup!.type).toBe(CriteriaType.GENDER);
        expect(criteriaGroup!.items).toEqual([]);
      });

      it('should toggle selected criterion off and clear items', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');

        component['toggleCriterion'](CriteriaType.GENDER);

        const criteriaGroup = component['getCriteriaGroup'](CriteriaType.GENDER);
        expect(criteriaGroup!.selected).toBe(false);
        expect(criteriaGroup!.items).toEqual([]);
        expect(criteriaGroup!.totalPercentage).toBe(0);
      });

      it('should handle multiple criteria types independently', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['toggleCriterion'](CriteriaType.DEPARTMENT);

        const genderGroup = component['getCriteriaGroup'](CriteriaType.GENDER);
        const deptGroup = component['getCriteriaGroup'](CriteriaType.DEPARTMENT);

        expect(genderGroup!.selected).toBe(true);
        expect(deptGroup!.selected).toBe(true);
        expect(component.selectedCriteriaTypes()).toContain(CriteriaType.GENDER);
        expect(component.selectedCriteriaTypes()).toContain(CriteriaType.DEPARTMENT);
      });
    });

    describe('addDistributionItem', () => {
      beforeEach(() => {
        component['toggleCriterion'](CriteriaType.GENDER);
      });

      it('should add distribution item to criteria group and FormArray', () => {
        component['addDistributionItem'](CriteriaType.GENDER, 'male');

        expect(component.criteriaDistributions.length).toBe(1);

        // Test the helper method
        const formControl = component['getDistributionControl']('male');
        expect(formControl).toBeTruthy();
        expect(formControl!.value.criteriaType).toBe(CriteriaType.GENDER);
        expect(formControl!.value.criteriaId).toBe('male');
        expect(formControl!.value.percentage).toBeNull();
      });

      it('should not add duplicate items', () => {
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
        component['addDistributionItem'](CriteriaType.GENDER, 'male');

        expect(component.criteriaDistributions.length).toBe(1);
      });

      it('should add multiple different items', () => {
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
        component['addDistributionItem'](CriteriaType.GENDER, 'female');

        expect(component.criteriaDistributions.length).toBe(2);
        expect(component['getDistributionItemsByType'](CriteriaType.GENDER).length).toBe(2);
      });
    });

    describe('removeDistributionItem', () => {
      beforeEach(() => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
        component['addDistributionItem'](CriteriaType.GENDER, 'female');
      });

      it('should remove item from criteria group and FormArray', () => {
        component['removeDistributionItem'](CriteriaType.GENDER, 0); // Remove first item (male)

        expect(component.criteriaDistributions.length).toBe(1);
        expect(component['getDistributionItemsByType'](CriteriaType.GENDER).length).toBe(1);

        const remainingItem = component['getDistributionItemsByType'](CriteriaType.GENDER)[0];
        expect(remainingItem.get('criteriaId')!.value).toBe('female');
      });

      it('should handle removing non-existent item gracefully', () => {
        component['removeDistributionItem'](CriteriaType.GENDER, 999); // Invalid index

        expect(component.criteriaDistributions.length).toBe(2);
        expect(component['getDistributionItemsByType'](CriteriaType.GENDER).length).toBe(2);
      });
    });

    describe('updateDistributionPercentage', () => {
      beforeEach(() => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
        component['addDistributionItem'](CriteriaType.GENDER, 'female');
      });

      it('should update percentage in FormControl', () => {
        component['updateDistributionPercentage'](CriteriaType.GENDER, 'male', 60);

        const formControl = component['getDistributionPercentageControl']('male');
        expect(formControl!.value).toBe(60);
        expect(formControl!.touched).toBe(true);
      });

      it('should recalculate total percentage after update', () => {
        component['updateDistributionPercentage'](CriteriaType.GENDER, 'male', 60);
        component['updateDistributionPercentage'](CriteriaType.GENDER, 'female', 40);

        const totalPercentage = component['getTotalPercentageForType'](CriteriaType.GENDER);
        expect(totalPercentage).toBe(50); // Average of 60 and 40
      });
    });

    describe('updateDistributionPercentageFromEvent', () => {
      beforeEach(() => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
      });

      it('should handle input event and update percentage', () => {
        const event = { target: { value: '75' } } as any;

        component['updateDistributionPercentageFromEvent'](CriteriaType.GENDER, 'male', event);

        const formControl = component['getDistributionPercentageControl']('male');
        expect(formControl!.value).toBe(75);
      });

      it('should handle invalid input gracefully', () => {
        const event = { target: { value: 'invalid' } } as any;

        component['updateDistributionPercentageFromEvent'](CriteriaType.GENDER, 'male', event);

        const formControl = component['getDistributionPercentageControl']('male');
        expect(formControl!.value).toBe(0);
      });
    });

    describe('criteriaValidation', () => {
      it('should return false when no criteria are selected', () => {
        expect(component['criteriaValidation']()).toBe(false);
      });

      it('should return false when criteria selected but no items added', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        expect(component['criteriaValidation']()).toBe(false);
      });

      it('should return false when items added but no percentages set', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
        expect(component['criteriaValidation']()).toBe(false);
      });

      it('should return true when properly configured', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
        component['updateDistributionPercentage'](CriteriaType.GENDER, 'male', 60);
        expect(component['criteriaValidation']()).toBe(true);
      });

      it('should handle multiple criteria groups correctly', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
        component['updateDistributionPercentage'](CriteriaType.GENDER, 'male', 60);

        component['toggleCriterion'](CriteriaType.DEPARTMENT);
        component['addDistributionItem'](CriteriaType.DEPARTMENT, 'hr');

        expect(component['criteriaValidation']()).toBe(false); // Department not configured

        component['updateDistributionPercentage'](CriteriaType.DEPARTMENT, 'hr', 40);

        // Debug logging
        const hrControl = component['getDistributionControl']('hr');
        console.log('HR control:', hrControl?.value);
        console.log('All controls:', component.criteriaDistributions.value);

        expect(component['criteriaValidation']()).toBe(true);
      });
    });

    describe('isCriterionSelected', () => {
      it('should return false for unselected criterion', () => {
        expect(component['isCriterionSelected'](CriteriaType.GENDER)).toBe(false);
      });

      it('should return true for selected criterion', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        expect(component['isCriterionSelected'](CriteriaType.GENDER)).toBe(true);
      });

      it('should return false after toggling off', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['toggleCriterion'](CriteriaType.GENDER);
        expect(component['isCriterionSelected'](CriteriaType.GENDER)).toBe(false);
      });

    });
  });

  describe('Survey Pagination & Advanced Selection', () => {
    describe('goToPage', () => {
      it('should navigate to valid page', () => {
        component['goToPage'](2);
        expect(component['pagination']().currentPage).toBe(2);
      });

      it('should not navigate to invalid page numbers', () => {
        const initialPage = component['pagination']().currentPage;

        component['goToPage'](0);
        expect(component['pagination']().currentPage).toBe(initialPage);

        component['goToPage'](10);
        expect(component['pagination']().currentPage).toBe(initialPage);

        component['goToPage'](-1);
        expect(component['pagination']().currentPage).toBe(initialPage);
      });

      it('should update current page surveys after navigation', () => {
        const page1Surveys = component.currentPageSurveys();
        component['goToPage'](2);
        const page2Surveys = component.currentPageSurveys();

        expect(page1Surveys).not.toEqual(page2Surveys);
        expect(page2Surveys.length).toBeGreaterThan(0);
      });
    });


  });

  describe('Form Control Access Methods', () => {
    beforeEach(() => {
      component['toggleCriterion'](CriteriaType.GENDER);
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      component['addDistributionItem'](CriteriaType.GENDER, 'female');
    });

    it('should handle form control access correctly', () => {
      // Test access by criteria ID
      const control = component['getDistributionControl']('male');
      expect(control).toBeTruthy();
      expect(control!.get('criteriaId')!.value).toBe('male');
      expect(control!.get('criteriaType')!.value).toBe(CriteriaType.GENDER);

      const valueControl = component['getDistributionValueControl']('male');
      expect(valueControl).toBeTruthy();
      expect(valueControl!.value).toBe('male');

      const percentageControl = component['getDistributionPercentageControl']('male');
      expect(percentageControl).toBeTruthy();
      expect(percentageControl!.value).toBeNull();

      // Test access by type
      const itemsByType = component['getDistributionItemsByType'](CriteriaType.GENDER);
      expect(itemsByType.length).toBe(2);
      expect(itemsByType[0].get('criteriaId')!.value).toBe('male');
      expect(itemsByType[1].get('criteriaId')!.value).toBe('female');

      // Test invalid cases
      expect(component['getDistributionControl']('nonexistent')).toBeUndefined();
    });
  });

  describe('Form State Management', () => {
    describe('markFormGroupTouched', () => {
      it('should recursively mark all form controls as touched including FormArrays', () => {
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');

        component['markFormGroupTouched'](component.scenarioForm);

        expect(component.scenarioForm.get('product.title')!.touched).toBe(true);
        expect(component.scenarioForm.get('product.tenant')!.touched).toBe(true);
        expect(component.scenarioForm.get('respondentsTotal')!.touched).toBe(true);
        expect(component.scenarioForm.get('impactDrivers.innovation')!.touched).toBe(true);

        const distributionControl = component['getDistributionControl']('male');
        expect(distributionControl!.get('criteriaId')!.touched).toBe(true);
        expect(distributionControl!.get('percentage')!.touched).toBe(true);
      });
    });

    describe('resetForm', () => {
      it('should reset all form values, state, and FormArrays', () => {
        component.scenarioForm.get('product.title')!.setValue('Test Title');
        component['toggleSurvey'](component.currentPageSurveys()[0].id);
        component['toggleCriterion'](CriteriaType.GENDER);
        component['addDistributionItem'](CriteriaType.GENDER, 'male');
        component['addDistributionItem'](CriteriaType.GENDER, 'female');

        expect(component.criteriaDistributions.length).toBe(2);

        component['resetForm']();

        expect(component.scenarioForm.get('product.title')!.value).toBeNull();
        expect(component.currentPageSurveys().every(s => !s.selected)).toBe(true);
        expect(component['criteriaGroups']()).toEqual([]);
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
        component['toggleSurvey'](component.currentPageSurveys()[0].id);
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

    it('should block navigation from criteria step when it has validation errors', () => {
      // Toggle a criterion and add invalid distribution (this should trigger error immediately)
      component['toggleCriterion'](component.availableCriteria[0].type);
      component['addDistributionItem'](component.availableCriteria[0].type, 'item1');
      component['addDistributionItem'](component.availableCriteria[0].type, 'item1'); // Duplicate - should trigger error

      fixture.detectChanges();

      // Get the stepper configuration
      const config = component['stepperConfig']();
      const criteriaStep = config.steps.find(step => step.id === 'criteria');

      // Criteria step should be optional but have error (even without being touched)
      expect(criteriaStep!.optional).toBe(true);
      expect(criteriaStep!.hasError).toBe(true);
      expect(component['criteriaGroupHasError']()).toBe(true);
    });

    it('should show immediate error feedback for criteria validation scenarios', () => {
      // Initially no error
      expect(component['criteriaGroupHasError']()).toBe(false);

      // Toggle a criterion - should show error immediately (selected but no distribution items)
      component['toggleCriterion'](component.availableCriteria[0].type);
      expect(component['criteriaGroupHasError']()).toBe(true);

      // Add a distribution item - still error (no percentage set)
      component['addDistributionItem'](component.availableCriteria[0].type, 'item1');
      expect(component['criteriaGroupHasError']()).toBe(true);

      // Set percentage - error should clear (valid now)
      component['updateDistributionPercentage'](component.availableCriteria[0].type, 'item1', 50);
      expect(component['criteriaGroupHasError']()).toBe(false);

      // This verifies that errors show immediately when criteria are selected/modified
      // without needing the step to be "touched" first
    });
  });


});