import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CommentsStep } from './comments-step';

describe('CommentsStep Component', () => {
  let component: CommentsStep;
  let fixture: ComponentFixture<CommentsStep>;
  let mockCommentsGroup: FormGroup;

  beforeEach(async () => {
    mockCommentsGroup = new FormGroup({
      innovation: new FormControl(''),
      motivation: new FormControl(''),
      performance: new FormControl(''),
      autonomy: new FormControl(''),
      connection: new FormControl(''),
    });

    await TestBed.configureTestingModule({
      imports: [
        CommentsStep,
        ReactiveFormsModule,
        CommonModule,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsStep);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('commentsGroup', mockCommentsGroup);
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
      expect(component.commentsGroup()).toBe(mockCommentsGroup);
    });
  });

  describe('Comments Section', () => {
    it('should handle comment form updates', () => {
      const commentsForm = mockCommentsGroup;
      expect(commentsForm).toBeTruthy();

      commentsForm?.get('innovation')?.setValue('Test comment');
      expect(commentsForm?.get('innovation')?.value).toBe('Test comment');
    });
  });
});