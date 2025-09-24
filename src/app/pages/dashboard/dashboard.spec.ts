import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';
import { RouterModule } from '@angular/router';
import { ScenarioTableData } from '../../core/models/scenario-table.model';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard, RouterModule.forRoot([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search term', () => {
    expect(component['searchTerm']()).toBe('');
  });

  it('should show all scenarios when search is empty', () => {
    expect(component['filteredTableData']()).toEqual(component['tableData']());
  });

  describe('Search Functionality', () => {
    it('should filter scenarios by name (case insensitive)', () => {
      component['updateSearchTerm']({ target: { value: 'scenario a' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Scenario A');
    });

    it('should filter scenarios by partial name match', () => {
      component['updateSearchTerm']({ target: { value: 'Scenario' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(3); // All scenarios contain 'Scenario'
    });

    it('should filter scenarios by respondent count', () => {
      component['updateSearchTerm']({ target: { value: '500' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].respondents).toBe(500);
    });

    it('should filter scenarios by partial respondent count', () => {
      component['updateSearchTerm']({ target: { value: '0' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(3); // All scenarios have '0' in respondent count
    });

    it('should filter scenarios by score range start', () => {
      component['updateSearchTerm']({ target: { value: '20' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].rangeStart).toBe(20);
    });

    it('should filter scenarios by score range end', () => {
      component['updateSearchTerm']({ target: { value: '100' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].rangeEnd).toBe(100);
    });

    it('should filter scenarios by range format', () => {
      component['updateSearchTerm']({ target: { value: '10-90' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].rangeStart).toBe(10);
      expect(filtered[0].rangeEnd).toBe(90);
    });

    it('should return empty array for non-matching search', () => {
      component['updateSearchTerm']({ target: { value: 'nonexistent' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(0);
    });

    it('should trim whitespace from search term', () => {
      component['updateSearchTerm']({ target: { value: '  scenario a  ' } } as any);

      const filtered = component['filteredTableData']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Scenario A');
    });

    it('should handle empty search term after searching', () => {
      // First search for something
      component['updateSearchTerm']({ target: { value: 'Scenario A' } } as any);
      expect(component['filteredTableData']().length).toBe(1);

      // Then clear the search
      component['updateSearchTerm']({ target: { value: '' } } as any);
      expect(component['filteredTableData']()).toEqual(component['tableData']());
    });

    it('should update search term signal when updateSearchTerm is called', () => {
      const testValue = 'test search';
      component['updateSearchTerm']({ target: { value: testValue } } as any);

      expect(component['searchTerm']()).toBe(testValue);
    });
  });
});
