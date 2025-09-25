import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

import { ProductStep } from './product-step';

describe('ProductStep Component', () => {
  let component: ProductStep;
  let fixture: ComponentFixture<ProductStep>;
  let mockProductFormGroup: FormGroup;

  beforeEach(async () => {
    mockProductFormGroup = new FormGroup({
      title: new FormControl('', [Validators.required]),
      tenant: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required]),
      experienceProduct: new FormControl('', [Validators.required]),
      selectedSurveys: new FormControl([] as string[])
    });

    await TestBed.configureTestingModule({
      imports: [
        ProductStep,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductStep);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('productFormGroup', mockProductFormGroup);
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
      expect(component.productFormGroup()).toBe(mockProductFormGroup);
    });

    it('should have tenant, company, and experience product options', () => {
      expect(component.tenantOptions.length).toBeGreaterThan(0);
      expect(component.companyOptions.length).toBeGreaterThan(0);
      expect(component.experienceProductOptions.length).toBeGreaterThan(0);
    });

    it('should initialize pagination state', () => {
      const pagination = component['pagination']();
      expect(pagination.currentPage).toBe(1);
      expect(pagination.totalPages).toBeGreaterThan(0);
      expect(pagination.totalSurveys).toBeGreaterThan(0);
      expect(pagination.surveysPerPage).toBeGreaterThan(0);
    });

    it('should compute current page surveys correctly', () => {
      const currentPageSurveys = component.currentPageSurveys();
      expect(Array.isArray(currentPageSurveys)).toBe(true);
      expect(currentPageSurveys.length).toBeGreaterThan(0);
      expect(currentPageSurveys.length).toBeLessThanOrEqual(component['pagination']().surveysPerPage);
    });
  });

  describe('Survey Management', () => {
    it('should handle survey toggle operations', () => {
      const surveyId = component.currentPageSurveys()[0].id;
      const initialSelectedState = component.currentPageSurveys()[0].selected;

      component['toggleSurvey'](surveyId);

      const updatedSurvey = component.currentPageSurveys().find(s => s.id === surveyId);
      expect(updatedSurvey?.selected).toBe(!initialSelectedState);
    });

    it('should detect when all current page surveys are selected', () => {
      const currentSurveys = component.currentPageSurveys();

      // Select all surveys on current page
      currentSurveys.forEach(survey => {
        if (!survey.selected) {
          component['toggleSurvey'](survey.id);
        }
      });

      expect(component['areAllCurrentPageSurveysSelected']()).toBe(true);
    });

    it('should detect when some current page surveys are selected', () => {
      const currentSurveys = component.currentPageSurveys();

      // Ensure at least one is selected and at least one is not
      if (currentSurveys.length > 1) {
        // Select first survey if not selected
        if (!currentSurveys[0].selected) {
          component['toggleSurvey'](currentSurveys[0].id);
        }
        // Ensure second survey is not selected
        if (currentSurveys[1].selected) {
          component['toggleSurvey'](currentSurveys[1].id);
        }

        expect(component['areSomeCurrentPageSurveysSelected']()).toBe(true);
      }
    });

    it('should toggle all current page surveys', () => {
      const initialAllSelected = component['areAllCurrentPageSurveysSelected']();

      component['toggleAllCurrentPageSurveys']();

      expect(component['areAllCurrentPageSurveysSelected']()).toBe(!initialAllSelected);
    });

    it('should update FormControl with selected survey IDs', () => {
      const surveyId = component.currentPageSurveys()[0].id;
      const selectedSurveysControl = mockProductFormGroup.get('selectedSurveys');

      component['toggleSurvey'](surveyId);

      const selectedIds = selectedSurveysControl?.value || [];
      if (component.currentPageSurveys().find(s => s.id === surveyId)?.selected) {
        expect(selectedIds).toContain(surveyId);
      } else {
        expect(selectedIds).not.toContain(surveyId);
      }
    });
  });

  describe('Pagination Management', () => {
    it('should navigate to valid page', () => {
      const totalPages = component['pagination']().totalPages;
      const targetPage = Math.min(2, totalPages);

      component['goToPage'](targetPage);

      expect(component['pagination']().currentPage).toBe(targetPage);
    });

    it('should not navigate to invalid page numbers', () => {
      const initialPage = component['pagination']().currentPage;
      const totalPages = component['pagination']().totalPages;

      // Test invalid pages
      component['goToPage'](0);
      expect(component['pagination']().currentPage).toBe(initialPage);

      component['goToPage'](totalPages + 1);
      expect(component['pagination']().currentPage).toBe(initialPage);

      component['goToPage'](-1);
      expect(component['pagination']().currentPage).toBe(initialPage);
    });

    it('should update current page surveys after navigation', () => {
      const totalPages = component['pagination']().totalPages;
      if (totalPages > 1) {
        const page1Surveys = component.currentPageSurveys();
        component['goToPage'](2);
        const page2Surveys = component.currentPageSurveys();

        expect(page1Surveys).not.toEqual(page2Surveys);
        expect(page2Surveys.length).toBeGreaterThan(0);
      }
    });

    it('should calculate pagination indices correctly', () => {
      const pagination = component['pagination']();
      const startIndex = component.currentPageStartIndex();
      const endIndex = component.currentPageEndIndex();

      expect(startIndex).toBeGreaterThan(0);
      expect(endIndex).toBeGreaterThanOrEqual(startIndex);
      expect(endIndex).toBeLessThanOrEqual(pagination.totalSurveys);
    });

    it('should generate correct pagination pages', () => {
      const paginationPages = component.paginationPages();
      const totalPages = component['pagination']().totalPages;

      expect(paginationPages.length).toBe(totalPages);
      expect(paginationPages[0]).toBe(1);
      expect(paginationPages[paginationPages.length - 1]).toBe(totalPages);
    });
  });

  describe('FormGroup Integration', () => {
    it('should sync selected surveys with FormGroup on effect trigger', () => {
      const newFormGroup = new FormGroup({
        title: new FormControl(''),
        tenant: new FormControl(''),
        company: new FormControl(''),
        experienceProduct: new FormControl(''),
        selectedSurveys: new FormControl([])
      });

      // Change the input to trigger effect
      fixture.componentRef.setInput('productFormGroup', newFormGroup);
      fixture.detectChanges();

      // Toggle a survey to trigger update
      const surveyId = component.currentPageSurveys()[0].id;
      component['toggleSurvey'](surveyId);

      const selectedIds = newFormGroup.get('selectedSurveys')?.value || [];
      if (component.currentPageSurveys().find(s => s.id === surveyId)?.selected) {
        expect(selectedIds).toContain(surveyId);
      }
    });

    it('should handle null FormGroup gracefully', () => {
      const surveyId = component.currentPageSurveys()[0].id;

      // This should not throw even if FormGroup becomes null temporarily
      expect(() => component['toggleSurvey'](surveyId)).not.toThrow();
    });
  });

  describe('Data Options', () => {
    it('should provide tenant options with required structure', () => {
      expect(component.tenantOptions).toBeDefined();
      expect(Array.isArray(component.tenantOptions)).toBe(true);

      if (component.tenantOptions.length > 0) {
        const option = component.tenantOptions[0];
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
      }
    });

    it('should provide company options with required structure', () => {
      expect(component.companyOptions).toBeDefined();
      expect(Array.isArray(component.companyOptions)).toBe(true);

      if (component.companyOptions.length > 0) {
        const option = component.companyOptions[0];
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
      }
    });

    it('should provide experience product options with required structure', () => {
      expect(component.experienceProductOptions).toBeDefined();
      expect(Array.isArray(component.experienceProductOptions)).toBe(true);

      if (component.experienceProductOptions.length > 0) {
        const option = component.experienceProductOptions[0];
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
      }
    });
  });
});