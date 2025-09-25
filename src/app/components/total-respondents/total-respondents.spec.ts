import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TotalRespondents } from './total-respondents';

describe('TotalRespondents Component', () => {
  let component: TotalRespondents;
  let fixture: ComponentFixture<TotalRespondents>;
  let mockRespondentsControl: FormControl;

  beforeEach(async () => {
    mockRespondentsControl = new FormControl('', [Validators.required]);

    await TestBed.configureTestingModule({
      imports: [
        TotalRespondents,
        ReactiveFormsModule,
        CommonModule,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TotalRespondents);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('respondentsControl', mockRespondentsControl);
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
      expect(component.respondentsControl()).toBe(mockRespondentsControl);
    });

    it('should render title and description', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('h3').textContent).toContain('Set the Total Number of Respondents');
      expect(compiled.querySelector('p').textContent).toContain('Define the total number of respondents for this scenario');
    });

    it('should render input with proper attributes', () => {
      const input = fixture.nativeElement.querySelector('input[type="number"]');
      expect(input).toBeTruthy();
      expect(input.getAttribute('id')).toBe('respondentsTotal');
      expect(input.getAttribute('min')).toBe('0');
      expect(input.getAttribute('placeholder')).toBe('Number of respondents');
    });
  });

  describe('Form Integration', () => {
    it('should bind to FormControl correctly', () => {
      const input = fixture.nativeElement.querySelector('input[type="number"]');

      // Test input updates control
      input.value = '100';
      input.dispatchEvent(new Event('input'));

      expect(mockRespondentsControl.value).toBe(100);
    });

    it('should reflect control value in input', () => {
      mockRespondentsControl.setValue('250');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="number"]');
      expect(input.value).toBe('250');
    });

    it('should show validation error when control is invalid and touched', () => {
      mockRespondentsControl.setValue('');
      mockRespondentsControl.markAsTouched();
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('[role="alert"]');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Total number of respondents is required');
    });

    it('should not show error when control is invalid but not touched', () => {
      mockRespondentsControl.setValue('');
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('[role="alert"]');
      expect(errorElement).toBeFalsy();
    });

    it('should apply error styling when control has errors', () => {
      mockRespondentsControl.setValue('');
      mockRespondentsControl.markAsTouched();
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="number"]');
      expect(input.className).toContain('border-[#FF4530]');
    });

    it('should apply normal styling when control is valid', () => {
      mockRespondentsControl.setValue('100');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="number"]');
      expect(input.className).not.toContain('border-[#FF4530]');
      expect(input.className).toContain('placeholder:text-[#9297A0]');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when valid', () => {
      mockRespondentsControl.setValue('100');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="number"]');
      expect(input.getAttribute('aria-invalid')).toBe('false');
      expect(input.getAttribute('aria-describedby')).toBeNull();
    });

    it('should have proper ARIA attributes when invalid and touched', () => {
      mockRespondentsControl.setValue('');
      mockRespondentsControl.markAsTouched();
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="number"]');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('respondents-total-error');
    });

    it('should have proper labels', () => {
      const label = fixture.nativeElement.querySelector('label[for="respondentsTotal"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Total Respondents');
    });
  });

  describe('Number Input Validation', () => {
    it('should accept valid numbers', () => {
      const input = fixture.nativeElement.querySelector('input[type="number"]');

      input.value = '50';
      input.dispatchEvent(new Event('input'));

      expect(mockRespondentsControl.value).toBe(50);
    });

    it('should handle minimum value constraint', () => {
      const input = fixture.nativeElement.querySelector('input[type="number"]');

      // The input has min="0" attribute
      expect(input.getAttribute('min')).toBe('0');
    });

    it('should work with zero value', () => {
      const input = fixture.nativeElement.querySelector('input[type="number"]');

      input.value = '0';
      input.dispatchEvent(new Event('input'));

      expect(mockRespondentsControl.value).toBe(0);
    });
  });

  describe('Component Integration', () => {
    it('should handle control state changes', () => {
      expect(mockRespondentsControl.touched).toBe(false);

      const input = fixture.nativeElement.querySelector('input[type="number"]');
      input.focus();
      input.blur();

      expect(mockRespondentsControl.touched).toBe(true);
    });

    it('should maintain control reference throughout lifecycle', () => {
      const originalControl = component.respondentsControl();

      fixture.detectChanges();

      expect(component.respondentsControl()).toBe(originalControl);
    });
  });
});