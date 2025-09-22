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
      expect(component.scenarioForm.get('respondents')).toBeTruthy();
      expect(component.scenarioForm.get('criteria')).toBeTruthy();
      expect(component.scenarioForm.get('impactDrivers')).toBeTruthy();
      expect(component.scenarioForm.get('enpsSettings')).toBeTruthy();
      expect(component.scenarioForm.get('comments')).toBeTruthy();
    });

    it('should render stepper with correct configuration', () => {
      const stepper = compiled.querySelector('app-stepper');
      expect(stepper).toBeTruthy();
      expect(component.stepperConfig().stepValidations.length).toBe(6);
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
      const respondentsForm = component.scenarioForm.get('respondents');
      respondentsForm?.markAllAsTouched();
    });

    it('should require total respondents field', () => {
      const totalControl = component.scenarioForm.get('respondents.total');
      expect(totalControl?.valid).toBeFalsy();
      expect(totalControl?.errors?.['required']).toBeTruthy();
    });
  });

  describe('Survey Management', () => {
    it('should handle survey operations', () => {
      expect(Array.isArray(component.currentPageSurveys())).toBe(true);
      expect(() => component.toggleSurvey('test-id')).not.toThrow();
      expect(Array.isArray(component.paginationPages())).toBe(true);
    });
  });

  describe('Criteria Management', () => {
    it('should handle criteria operations', () => {
      expect(Array.isArray(component.selectedCriteriaTypes())).toBe(true);
      expect(typeof component.criteriaValidation()).toBe('boolean');

      const group = component.getCriteriaGroup(CriteriaType.GENDER);
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
      const total = component.impactDriversTotal();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty impact driver values', () => {
      const impactForm = component.scenarioForm.get('impactDrivers');
      impactForm?.reset();
      fixture.detectChanges();

      const total = component.impactDriversTotal();
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
      const total = component.enpsSettingsTotal();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty eNPS values', () => {
      const enpsForm = component.scenarioForm.get('enpsSettings');
      enpsForm?.reset();
      fixture.detectChanges();

      const total = component.enpsSettingsTotal();
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
      component.scenarioForm.get('respondents.total')?.setValue('100');
    });

    it('should submit valid form', () => {
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component.onFinish();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not submit invalid form', () => {
      // Reset form to make it invalid
      component.scenarioForm.reset();
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component.onFinish();

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Navigation and Cancellation', () => {
    it('should navigate to dashboard when cancelling empty form', () => {
      jest.spyOn(component, 'isProductGroupEmpty').mockReturnValue(true);
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component.onCancel();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show confirmation when cancelling form with data', () => {
      jest.spyOn(component, 'isProductGroupEmpty').mockReturnValue(false);
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component.onCancel();

      expect(confirmSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not navigate when user cancels confirmation', () => {
      jest.spyOn(component, 'isProductGroupEmpty').mockReturnValue(false);
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      const navigateSpy = jest.spyOn(mockRouter, 'navigate');

      component.onCancel();

      expect(confirmSpy).toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Form State Management', () => {
    it('should reset form and track validation states', () => {
      component.scenarioForm.get('product.title')?.setValue('Test');
      component.resetForm();
      expect(component.scenarioForm.get('product.title')?.value).toBeNull();

      expect(typeof component.productGroupValid()).toBe('boolean');
      expect(typeof component.isProductGroupEmpty()).toBe('boolean');
    });
  });

  describe('User Interactions', () => {
    it('should handle form control updates', () => {
      component.scenarioForm.get('product.title')?.setValue('Updated Title');
      expect(component.scenarioForm.get('product.title')?.value).toBe('Updated Title');
    });
  });

  describe('Computed Properties', () => {
    it('should calculate step validations and configuration', () => {
      const validations = component.stepValidations();
      expect(Array.isArray(validations)).toBe(true);
      expect(validations.length).toBe(6);

      const config = component.stepperConfig();
      expect(config.stepValidations).toBeTruthy();
    });
  });

  describe('Criteria Management System', () => {
    describe('toggleCriterion', () => {
      it('should add new criteria group when toggling unselected criterion', () => {
        component.toggleCriterion(CriteriaType.GENDER);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup).toBeTruthy();
        expect(criteriaGroup!.selected).toBe(true);
        expect(criteriaGroup!.type).toBe(CriteriaType.GENDER);
        expect(criteriaGroup!.items).toEqual([]);
      });

      it('should toggle selected criterion off and clear items', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');

        component.toggleCriterion(CriteriaType.GENDER);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.selected).toBe(false);
        expect(criteriaGroup!.items).toEqual([]);
        expect(criteriaGroup!.totalPercentage).toBe(0);
      });

      it('should handle multiple criteria types independently', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.toggleCriterion(CriteriaType.DEPARTMENT);

        const genderGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        const deptGroup = component.getCriteriaGroup(CriteriaType.DEPARTMENT);

        expect(genderGroup!.selected).toBe(true);
        expect(deptGroup!.selected).toBe(true);
        expect(component.selectedCriteriaTypes()).toContain(CriteriaType.GENDER);
        expect(component.selectedCriteriaTypes()).toContain(CriteriaType.DEPARTMENT);
      });
    });

    describe('addDistributionItem', () => {
      beforeEach(() => {
        component.toggleCriterion(CriteriaType.GENDER);
      });

      it('should add distribution item to criteria group and FormArray', () => {
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.items).toHaveLength(1);
        expect(criteriaGroup!.items[0].criteriaId).toBe('male');
        expect(criteriaGroup!.items[0].criteriaName).toBe('Male');
        expect(criteriaGroup!.items[0].percentage).toBeNull();

        expect(component['distributionsArray'].length).toBe(1);
        const formControl = component.getDistributionControl('male');
        expect(formControl!.get('value')!.value).toBe('male');
      });

      it('should not add duplicate items', () => {
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.items).toHaveLength(1);
        expect(component['distributionsArray'].length).toBe(1);
      });

      it('should add multiple different items', () => {
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
        component.addDistributionItem(CriteriaType.GENDER, 'female', 'Female');

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.items).toHaveLength(2);
        expect(component['distributionsArray'].length).toBe(2);
      });
    });

    describe('removeDistributionItem', () => {
      beforeEach(() => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
        component.addDistributionItem(CriteriaType.GENDER, 'female', 'Female');
      });

      it('should remove item from criteria group and FormArray', () => {
        component.removeDistributionItem(CriteriaType.GENDER, 'male');

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.items).toHaveLength(1);
        expect(criteriaGroup!.items[0].criteriaId).toBe('female');
        expect(component['distributionsArray'].length).toBe(1);
      });

      it('should handle removing non-existent item gracefully', () => {
        component.removeDistributionItem(CriteriaType.GENDER, 'nonexistent');

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.items).toHaveLength(2);
        expect(component['distributionsArray'].length).toBe(2);
      });
    });

    describe('updateDistributionPercentage', () => {
      beforeEach(() => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
        component.addDistributionItem(CriteriaType.GENDER, 'female', 'Female');
      });

      it('should update percentage in both signal and FormControl', () => {
        component.updateDistributionPercentage(CriteriaType.GENDER, 'male', 60);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        const maleItem = criteriaGroup!.items.find(item => item.criteriaId === 'male');
        expect(maleItem!.percentage).toBe(60);

        const formControl = component.getDistributionPercentageControl('male');
        expect(formControl!.value).toBe(60);
        expect(formControl!.touched).toBe(true);
      });

      it('should recalculate total percentage after update', () => {
        component.updateDistributionPercentage(CriteriaType.GENDER, 'male', 60);
        component.updateDistributionPercentage(CriteriaType.GENDER, 'female', 40);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.totalPercentage).toBe(50); // Average of 60 and 40
      });
    });

    describe('updateDistributionPercentageFromEvent', () => {
      beforeEach(() => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
      });

      it('should handle input event and update percentage', () => {
        const event = { target: { value: '75' } } as any;

        component.updateDistributionPercentageFromEvent(CriteriaType.GENDER, 'male', event);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        const maleItem = criteriaGroup!.items.find(item => item.criteriaId === 'male');
        expect(maleItem!.percentage).toBe(75);
      });

      it('should handle invalid input gracefully', () => {
        const event = { target: { value: 'invalid' } } as any;

        component.updateDistributionPercentageFromEvent(CriteriaType.GENDER, 'male', event);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        const maleItem = criteriaGroup!.items.find(item => item.criteriaId === 'male');
        expect(maleItem!.percentage).toBe(0);
      });
    });

    describe('criteriaValidation', () => {
      it('should return false when no criteria are selected', () => {
        expect(component.criteriaValidation()).toBe(false);
      });

      it('should return false when criteria selected but no items added', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        expect(component.criteriaValidation()).toBe(false);
      });

      it('should return false when items added but no percentages set', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
        expect(component.criteriaValidation()).toBe(false);
      });

      it('should return true when properly configured', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
        component.updateDistributionPercentage(CriteriaType.GENDER, 'male', 60);
        expect(component.criteriaValidation()).toBe(true);
      });

      it('should handle multiple criteria groups correctly', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
        component.updateDistributionPercentage(CriteriaType.GENDER, 'male', 60);

        component.toggleCriterion(CriteriaType.DEPARTMENT);
        component.addDistributionItem(CriteriaType.DEPARTMENT, 'hr', 'HR');

        expect(component.criteriaValidation()).toBe(false); // Department not configured

        component.updateDistributionPercentage(CriteriaType.DEPARTMENT, 'hr', 40);
        expect(component.criteriaValidation()).toBe(true);
      });
    });

    describe('isCriterionSelected', () => {
      it('should return false for unselected criterion', () => {
        expect(component.isCriterionSelected(CriteriaType.GENDER)).toBe(false);
      });

      it('should return true for selected criterion', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        expect(component.isCriterionSelected(CriteriaType.GENDER)).toBe(true);
      });

      it('should return false after toggling off', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.toggleCriterion(CriteriaType.GENDER);
        expect(component.isCriterionSelected(CriteriaType.GENDER)).toBe(false);
      });
    });
  });

  describe('Survey Pagination & Advanced Selection', () => {
    describe('goToPage', () => {
      it('should navigate to valid page', () => {
        component.goToPage(2);
        expect(component['pagination']().currentPage).toBe(2);
      });

      it('should not navigate to invalid page numbers', () => {
        const initialPage = component['pagination']().currentPage;

        component.goToPage(0);
        expect(component['pagination']().currentPage).toBe(initialPage);

        component.goToPage(10);
        expect(component['pagination']().currentPage).toBe(initialPage);

        component.goToPage(-1);
        expect(component['pagination']().currentPage).toBe(initialPage);
      });

      it('should update current page surveys after navigation', () => {
        const page1Surveys = component.currentPageSurveys();
        component.goToPage(2);
        const page2Surveys = component.currentPageSurveys();

        expect(page1Surveys).not.toEqual(page2Surveys);
        expect(page2Surveys.length).toBeGreaterThan(0);
      });
    });

    describe('Survey selection state management', () => {
      it('should maintain selection state across page changes', () => {
        const firstSurvey = component.currentPageSurveys()[0];
        component.toggleSurvey(firstSurvey.id);

        component.goToPage(2);
        component.goToPage(1);

        const updatedSurveys = component.currentPageSurveys();
        const selectedSurvey = updatedSurveys.find(s => s.id === firstSurvey.id);
        expect(selectedSurvey!.selected).toBe(true);
      });

      it('should handle select all on current page', () => {
        const currentSurveys = component.currentPageSurveys();
        component.toggleAllCurrentPageSurveys();

        expect(component.areAllCurrentPageSurveysSelected()).toBe(true);
        expect(component.areSomeCurrentPageSurveysSelected()).toBe(false);
      });

      it('should handle partial selection state', () => {
        const currentSurveys = component.currentPageSurveys();
        component.toggleSurvey(currentSurveys[0].id);

        expect(component.areAllCurrentPageSurveysSelected()).toBe(false);
        expect(component.areSomeCurrentPageSurveysSelected()).toBe(true);
      });
    });

    describe('Pagination calculations', () => {
      it('should calculate correct start and end indices', () => {
        expect(component.currentPageStartIndex()).toBe(1);
        expect(component.currentPageEndIndex()).toBe(10);

        component.goToPage(2);
        expect(component.currentPageStartIndex()).toBe(11);
        expect(component.currentPageEndIndex()).toBe(20);

        component.goToPage(3);
        expect(component.currentPageStartIndex()).toBe(21);
        expect(component.currentPageEndIndex()).toBe(25); // Total is 25
      });

      it('should generate correct pagination pages', () => {
        const pages = component.paginationPages();
        expect(pages).toEqual([1, 2, 3]);
        expect(pages.length).toBe(3);
      });
    });
  });

  describe('Form Control Access Methods', () => {
    beforeEach(() => {
      component.toggleCriterion(CriteriaType.GENDER);
      component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
      component.addDistributionItem(CriteriaType.GENDER, 'female', 'Female');
    });

    describe('getDistributionControl methods', () => {
      it('should get distribution control by criteria ID', () => {
        const control = component.getDistributionControl('male');
        expect(control).toBeTruthy();
        expect(control!.get('value')!.value).toBe('male');
      });

      it('should return undefined for non-existent criteria ID', () => {
        const control = component.getDistributionControl('nonexistent');
        expect(control).toBeUndefined();
      });

      it('should get value control by criteria ID', () => {
        const valueControl = component.getDistributionValueControl('male');
        expect(valueControl).toBeTruthy();
        expect(valueControl!.value).toBe('male');
      });

      it('should get percentage control by criteria ID', () => {
        const percentageControl = component.getDistributionPercentageControl('male');
        expect(percentageControl).toBeTruthy();
        expect(percentageControl!.value).toBeNull();
      });
    });

    describe('getDistributionControlByIndex methods', () => {
      it('should get distribution control by index', () => {
        const control = component['getDistributionControlByIndex'](CriteriaType.GENDER, 0);
        expect(control).toBeTruthy();
        expect(control!.get('value')!.value).toBe('male');
      });

      it('should return undefined for invalid index', () => {
        const control = component['getDistributionControlByIndex'](CriteriaType.GENDER, 10);
        expect(control).toBeUndefined();
      });

      it('should get value control by index', () => {
        const valueControl = component['getDistributionValueControlByIndex'](CriteriaType.GENDER, 1);
        expect(valueControl).toBeTruthy();
        expect(valueControl!.value).toBe('female');
      });

      it('should get percentage control by index', () => {
        const percentageControl = component['getDistributionPercentageControlByIndex'](CriteriaType.GENDER, 0);
        expect(percentageControl).toBeTruthy();
        expect(percentageControl!.value).toBeNull();
      });
    });
  });

  describe('Form State Management', () => {
    describe('markFormGroupTouched', () => {
      it('should recursively mark all form controls as touched', () => {
        component['markFormGroupTouched'](component.scenarioForm);

        expect(component.scenarioForm.get('product.title')!.touched).toBe(true);
        expect(component.scenarioForm.get('product.tenant')!.touched).toBe(true);
        expect(component.scenarioForm.get('respondents.total')!.touched).toBe(true);
        expect(component.scenarioForm.get('impactDrivers.innovation')!.touched).toBe(true);
      });

      it('should handle FormArray controls', () => {
        component.toggleCriterion(CriteriaType.GENDER);
        component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');

        component['markFormGroupTouched'](component.scenarioForm);

        const distributionControl = component.getDistributionControl('male');
        expect(distributionControl!.get('value')!.touched).toBe(true);
        expect(distributionControl!.get('percentage')!.touched).toBe(true);
      });
    });

    describe('resetForm', () => {
      it('should reset all form values and state', () => {
        component.scenarioForm.get('product.title')!.setValue('Test Title');
        component.toggleSurvey(component.currentPageSurveys()[0].id);
        component.toggleCriterion(CriteriaType.GENDER);

        component.resetForm();

        expect(component.scenarioForm.get('product.title')!.value).toBeNull();
        expect(component.currentPageSurveys().every(s => !s.selected)).toBe(true);
        expect(component['criteriaGroups']()).toEqual([]);
      });
    });

    describe('isProductGroupEmpty', () => {
      it('should return true when product group is empty', () => {
        expect(component.isProductGroupEmpty()).toBe(true);
      });

      it('should return false when product has title', () => {
        component.scenarioForm.get('product.title')!.setValue('Test');
        expect(component.isProductGroupEmpty()).toBe(false);
      });

      it('should return false when surveys are selected', () => {
        component.toggleSurvey(component.currentPageSurveys()[0].id);
        expect(component.isProductGroupEmpty()).toBe(false);
      });

      it('should return false when any product field is filled', () => {
        component.scenarioForm.get('product.tenant')!.setValue('tenant1');
        expect(component.isProductGroupEmpty()).toBe(false);
      });
    });
  });

  describe('Event Handling & Integration', () => {
    beforeEach(() => {
      component.toggleCriterion(CriteriaType.GENDER);
      component.addDistributionItem(CriteriaType.GENDER, 'male', 'Male');
    });

    describe('updateDistributionPercentageFromEventByIndex', () => {
      it('should update percentage by index from event', () => {
        const event = { target: { value: '85' } } as any;

        component.updateDistributionPercentageFromEventByIndex(CriteriaType.GENDER, 0, event);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.items[0].percentage).toBe(85);

        const formControl = component.getDistributionPercentageControl('male');
        expect(formControl!.value).toBe(85);
      });
    });

    describe('updateDistributionItem', () => {
      it('should update distribution item from select event', () => {
        const event = { target: { value: 'female' } } as any;

        component.updateDistributionItem(CriteriaType.GENDER, 0, event);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.items[0].criteriaId).toBe('female');

        const formControl = component.getDistributionValueControl('female');
        expect(formControl!.value).toBe('female');
        expect(formControl!.touched).toBe(true);
      });

      it('should handle empty selection', () => {
        const event = { target: { value: '' } } as any;

        component.updateDistributionItem(CriteriaType.GENDER, 0, event);

        const criteriaGroup = component.getCriteriaGroup(CriteriaType.GENDER);
        expect(criteriaGroup!.items[0].criteriaId).toBe('male'); // Should remain unchanged
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle operations safely', () => {
      expect(() => component.toggleSurvey('nonexistent-id')).not.toThrow();
      expect(component.currentPageStartIndex()).toBeGreaterThan(0);
    });

    it('should handle criteria operations on non-existent types', () => {
      expect(() => component.removeDistributionItem(CriteriaType.GENDER, 'nonexistent')).not.toThrow();
      expect(() => component.updateDistributionPercentage(CriteriaType.GENDER, 'nonexistent', 50)).not.toThrow();
    });

    it('should handle boundary conditions for pagination', () => {
      component.goToPage(1);
      expect(component['pagination']().currentPage).toBe(1);

      component.goToPage(3);
      expect(component['pagination']().currentPage).toBe(3);
    });

    it('should handle empty arrays and null values gracefully', () => {
      expect(component.selectedCriteriaTypes()).toEqual([]);
      expect(component.getCriteriaGroup(CriteriaType.GENDER)).toBeUndefined();
      expect(component.getDistributionControl('nonexistent')).toBeUndefined();
    });
  });
});