import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EnpsSettingsStep } from './enps-settings-step';

describe('EnpsSettingsStep Component', () => {
  let component: EnpsSettingsStep;
  let fixture: ComponentFixture<EnpsSettingsStep>;
  let mockEnpsSettingsGroup: FormGroup;

  beforeEach(async () => {
    mockEnpsSettingsGroup = new FormGroup({
      promoters: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      passives: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      detractors: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
    });

    await TestBed.configureTestingModule({
      imports: [
        EnpsSettingsStep,
        ReactiveFormsModule,
        CommonModule,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnpsSettingsStep);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('enpsSettingsGroup', mockEnpsSettingsGroup);
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
      expect(component.enpsSettingsGroup()).toBe(mockEnpsSettingsGroup);
    });
  });

  describe('eNPS Settings', () => {
    beforeEach(() => {
      const enpsForm = mockEnpsSettingsGroup;
      enpsForm?.get('promoters')?.setValue('8');
      enpsForm?.get('passives')?.setValue('7');
    });

    it('should calculate eNPS total correctly', () => {
      const total = component['enpsSettingsTotal']();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty eNPS values', () => {
      const enpsForm = mockEnpsSettingsGroup;
      enpsForm?.reset();
      fixture.detectChanges();

      const total = component['enpsSettingsTotal']();
      expect(total).toBe(0);
    });
  });
});