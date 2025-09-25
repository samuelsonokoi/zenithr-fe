import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CriteriaDistribution } from './criteria-distribution';
import { CriteriaType } from '../../core/models/scenario.model';

describe('CriteriaDistribution Component', () => {
  let component: CriteriaDistribution;
  let fixture: ComponentFixture<CriteriaDistribution>;
  let mockCriteriaDistributions: FormArray<FormGroup>;

  beforeEach(async () => {
    mockCriteriaDistributions = new FormArray<FormGroup>([]);

    await TestBed.configureTestingModule({
      imports: [
        CriteriaDistribution,
        ReactiveFormsModule,
        CommonModule,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CriteriaDistribution);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('criteriaDistributionsArray', mockCriteriaDistributions);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with required inputs', () => {
      expect(component.criteriaDistributionsArray()).toBe(mockCriteriaDistributions);
    });

    it('should have available criteria and options', () => {
      expect(component.availableCriteria.length).toBeGreaterThan(0);
      expect(Object.keys(component.criteriaOptions).length).toBeGreaterThan(0);
    });

    it('should render title and description', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('h3').textContent).toContain('Select Criteria for Distribution');
      expect(compiled.querySelector('p').textContent).toContain('Choose the criteria that will be used for score distribution');
    });

    it('should initialize with empty selected criteria types', () => {
      expect(component.selectedCriteriaTypes().length).toBe(0);
    });
  });

  describe('Criteria Selection', () => {
    it('should handle criterion toggle operations', () => {
      const criteriaType = CriteriaType.GENDER;
      const initialSelected = component['isCriterionSelected'](criteriaType);

      component['toggleCriterion'](criteriaType);

      expect(component['isCriterionSelected'](criteriaType)).toBe(!initialSelected);
    });

    it('should add new criteria group when toggling unselected criterion', () => {
      const criteriaType = CriteriaType.GENDER;
      expect(component['isCriterionSelected'](criteriaType)).toBe(false);

      component['toggleCriterion'](criteriaType);

      expect(component['isCriterionSelected'](criteriaType)).toBe(true);
      expect(component.selectedCriteriaTypes()).toContain(criteriaType);
    });

    it('should toggle selected criterion off and clear items', () => {
      const criteriaType = CriteriaType.GENDER;

      // First, select the criterion
      component['toggleCriterion'](criteriaType);
      expect(component['isCriterionSelected'](criteriaType)).toBe(true);

      // Add some items
      component['addDistributionItem'](criteriaType, 'male');
      expect(mockCriteriaDistributions.length).toBe(1);

      // Now toggle off
      component['toggleCriterion'](criteriaType);
      expect(component['isCriterionSelected'](criteriaType)).toBe(false);
      expect(mockCriteriaDistributions.length).toBe(0);
    });

    it('should handle multiple criteria types independently', () => {
      component['toggleCriterion'](CriteriaType.GENDER);
      component['toggleCriterion'](CriteriaType.AGE_GROUP);

      expect(component['isCriterionSelected'](CriteriaType.GENDER)).toBe(true);
      expect(component['isCriterionSelected'](CriteriaType.AGE_GROUP)).toBe(true);
      expect(component.selectedCriteriaTypes().length).toBe(2);

      // Toggle off one
      component['toggleCriterion'](CriteriaType.GENDER);
      expect(component['isCriterionSelected'](CriteriaType.GENDER)).toBe(false);
      expect(component['isCriterionSelected'](CriteriaType.AGE_GROUP)).toBe(true);
      expect(component.selectedCriteriaTypes().length).toBe(1);
    });
  });

  describe('Distribution Item Management', () => {
    beforeEach(() => {
      // Select a criterion for testing
      component['toggleCriterion'](CriteriaType.GENDER);
    });

    it('should add distribution item to criteria group and FormArray', () => {
      const initialLength = mockCriteriaDistributions.length;

      component['addDistributionItem'](CriteriaType.GENDER, 'male');

      expect(mockCriteriaDistributions.length).toBe(initialLength + 1);
      const control = mockCriteriaDistributions.at(0) as FormGroup;
      expect(control.get('criteriaType')?.value).toBe(CriteriaType.GENDER);
      expect(control.get('criteriaId')?.value).toBe('male');
    });

    it('should not add duplicate items', () => {
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      const initialLength = mockCriteriaDistributions.length;

      // Try to add the same item again
      component['addDistributionItem'](CriteriaType.GENDER, 'male');

      expect(mockCriteriaDistributions.length).toBe(initialLength);
    });

    it('should add multiple different items', () => {
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      component['addDistributionItem'](CriteriaType.GENDER, 'female');

      expect(mockCriteriaDistributions.length).toBe(2);
      expect(mockCriteriaDistributions.at(0).get('criteriaId')?.value).toBe('male');
      expect(mockCriteriaDistributions.at(1).get('criteriaId')?.value).toBe('female');
    });

    it('should remove item from criteria group and FormArray', () => {
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      component['addDistributionItem'](CriteriaType.GENDER, 'female');
      expect(mockCriteriaDistributions.length).toBe(2);

      component['removeDistributionItem'](CriteriaType.GENDER, 0);

      expect(mockCriteriaDistributions.length).toBe(1);
      expect(mockCriteriaDistributions.at(0).get('criteriaId')?.value).toBe('female');
    });

    it('should handle removing non-existent item gracefully', () => {
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      const initialLength = mockCriteriaDistributions.length;

      // Try to remove item at invalid index
      component['removeDistributionItem'](CriteriaType.GENDER, 999);

      expect(mockCriteriaDistributions.length).toBe(initialLength);
    });
  });

  describe('Validation Logic', () => {
    beforeEach(() => {
      component['toggleCriterion'](CriteriaType.GENDER);
    });

    it('should detect duplicates in type', () => {
      // Manually create duplicate entries by bypassing the duplicate prevention
      const formArray = mockCriteriaDistributions;
      const control1 = component['createDistributionFormGroup'](CriteriaType.GENDER, 'male');
      const control2 = component['createDistributionFormGroup'](CriteriaType.GENDER, 'male');

      formArray.push(control1);
      formArray.push(control2);

      expect(component['hasDuplicatesInType'](CriteriaType.GENDER)).toBe(true);
    });

    it('should not report duplicates when items are different', () => {
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      component['addDistributionItem'](CriteriaType.GENDER, 'female');

      expect(component['hasDuplicatesInType'](CriteriaType.GENDER)).toBe(false);
    });

    it('should calculate total percentage correctly', () => {
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      component['addDistributionItem'](CriteriaType.GENDER, 'female');

      // Set percentages
      const maleControl = mockCriteriaDistributions.at(0) as FormGroup;
      const femaleControl = mockCriteriaDistributions.at(1) as FormGroup;
      maleControl.get('percentage')?.setValue(60);
      femaleControl.get('percentage')?.setValue(40);

      const total = component['getTotalPercentageForType'](CriteriaType.GENDER);
      expect(total).toBe(50); // Average of 60 and 40
    });

    it('should return correct distribution items by type', () => {
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      component['toggleCriterion'](CriteriaType.AGE_GROUP);
      component['addDistributionItem'](CriteriaType.AGE_GROUP, '18-25');

      const genderItems = component['getDistributionItemsByType'](CriteriaType.GENDER);
      const ageItems = component['getDistributionItemsByType'](CriteriaType.AGE_GROUP);

      expect(genderItems.length).toBe(1);
      expect(ageItems.length).toBe(1);
      expect(genderItems[0].get('criteriaType')?.value).toBe(CriteriaType.GENDER);
      expect(ageItems[0].get('criteriaType')?.value).toBe(CriteriaType.AGE_GROUP);
    });
  });

  describe('Validation Logic Integration', () => {
    it('should return correct validation status', () => {
      // Initially valid (no criteria selected)
      expect(component['criteriaGroupStatus']()).toBe('VALID');

      // Select criterion but no items - should be invalid
      component['toggleCriterion'](CriteriaType.GENDER);
      expect(component['criteriaGroupStatus']()).toBe('INVALID');

      // Add item but no percentage - should be invalid
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      expect(component['criteriaGroupStatus']()).toBe('INVALID');

      // Set percentage - should be valid
      const control = mockCriteriaDistributions.at(0) as FormGroup;
      control.get('criteriaId')?.setValue('male');
      control.get('percentage')?.setValue(50);
      expect(component['criteriaGroupStatus']()).toBe('VALID');
    });

    it('should validate criteria correctly', () => {
      // Initially false (no criteria)
      expect(component['criteriaValidation']()).toBe(false);

      // Select criterion and add valid item
      component['toggleCriterion'](CriteriaType.GENDER);
      component['addDistributionItem'](CriteriaType.GENDER, 'male');

      const control = mockCriteriaDistributions.at(0) as FormGroup;
      control.get('criteriaId')?.setValue('male');
      control.get('percentage')?.setValue(50);

      expect(component['criteriaValidation']()).toBe(true);
    });

    it('should handle real-time validation updates', () => {
      component['toggleCriterion'](CriteriaType.GENDER);
      component['addDistributionItem'](CriteriaType.GENDER, 'male');

      // Initially invalid
      expect(component['criteriaGroupStatus']()).toBe('INVALID');

      // Update percentage - should become valid immediately
      component['updateDistributionPercentage'](CriteriaType.GENDER, 'male', 60);
      expect(component['criteriaGroupStatus']()).toBe('VALID');
    });
  });

  describe('Utility Methods', () => {
    it('should get criteria name correctly', () => {
      const genderName = component['getCriteriaName'](CriteriaType.GENDER);
      expect(typeof genderName).toBe('string');
      expect(genderName.length).toBeGreaterThan(0);
    });

    it('should count distribution items correctly', () => {
      component['toggleCriterion'](CriteriaType.GENDER);
      component['addDistributionItem'](CriteriaType.GENDER, 'male');
      component['addDistributionItem'](CriteriaType.GENDER, 'female');

      const count = component['getDistributionItemsCount'](CriteriaType.GENDER);
      expect(count).toBe(2);
    });
  });

  describe('UI Integration', () => {
    it('should render criteria checkboxes', () => {
      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should show criteria name labels', () => {
      const labels = fixture.nativeElement.querySelectorAll('label .text-sm');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should show empty state message when no criteria selected', () => {
      const emptyMessage = fixture.nativeElement.querySelector('.text-center p');
      expect(emptyMessage?.textContent).toContain('Select criteria from the left panel');
    });

    it('should show add button when criteria is selected', () => {
      component['toggleCriterion'](CriteriaType.GENDER);
      fixture.detectChanges();

      const addButton = fixture.nativeElement.querySelector('button.text-primary');
      expect(addButton?.textContent).toContain('+ Add');
    });
  });

  describe('Form Control Integration', () => {
    it('should create proper form groups for distribution items', () => {
      component['addDistributionItem'](CriteriaType.GENDER, 'male');

      const control = mockCriteriaDistributions.at(0) as FormGroup;
      expect(control.get('criteriaType')).toBeTruthy();
      expect(control.get('criteriaId')).toBeTruthy();
      expect(control.get('percentage')).toBeTruthy();

      expect(control.get('criteriaType')?.value).toBe(CriteriaType.GENDER);
      expect(control.get('criteriaId')?.value).toBe('male');
    });

    it('should apply proper validators to form controls', () => {
      component['addDistributionItem'](CriteriaType.GENDER);

      const control = mockCriteriaDistributions.at(0) as FormGroup;

      // Test required validators
      control.get('criteriaId')?.setValue('');
      expect(control.get('criteriaId')?.hasError('required')).toBe(true);

      control.get('percentage')?.setValue(null);
      expect(control.get('percentage')?.hasError('required')).toBe(true);

      // Test min/max validators for percentage
      control.get('percentage')?.setValue(-1);
      expect(control.get('percentage')?.hasError('min')).toBe(true);

      control.get('percentage')?.setValue(101);
      expect(control.get('percentage')?.hasError('max')).toBe(true);
    });
  });
});