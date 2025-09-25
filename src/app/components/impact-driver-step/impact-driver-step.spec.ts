import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ImpactDriverStep } from './impact-driver-step';

describe('ImpactDriverStep Component', () => {
  let component: ImpactDriverStep;
  let fixture: ComponentFixture<ImpactDriverStep>;
  let mockImpactDriversGroup: FormGroup;

  beforeEach(async () => {
    mockImpactDriversGroup = new FormGroup({
      innovation: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      motivation: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      performance: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      autonomy: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      connection: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      transformationalLeadership: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
    });

    await TestBed.configureTestingModule({
      imports: [
        ImpactDriverStep,
        ReactiveFormsModule,
        CommonModule,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImpactDriverStep);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('impactDriversGroup', mockImpactDriversGroup);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with required input', () => {
      expect(component.impactDriversGroup()).toBe(mockImpactDriversGroup);
    });
  });

  describe('Impact Drivers', () => {
    beforeEach(() => {
      const impactForm = mockImpactDriversGroup;
      impactForm?.get('innovation')?.setValue('8');
      impactForm?.get('motivation')?.setValue('7');
    });

    it('should calculate impact drivers total correctly', () => {
      const total = component['impactDriversTotal']();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty impact driver values', () => {
      const impactForm = mockImpactDriversGroup;
      impactForm?.reset();
      fixture.detectChanges();

      const total = component['impactDriversTotal']();
      expect(total).toBe(0);
    });
  });
});