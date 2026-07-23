import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { MonthYearPickerDemoComponent } from './month-year-picker-demo.component';

describe('MonthYearPickerDemoComponent', () => {
  let component: MonthYearPickerDemoComponent;
  let fixture: ComponentFixture<MonthYearPickerDemoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MonthYearPickerDemoComponent, BrowserAnimationsModule],
      providers: [provideHttpClient()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthYearPickerDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should initialize selectedData as non-null', () => {
      expect(component.selectedData).not.toBeNull();
    });
  });

  // ─── onDateRangeChange ────────────────────────────────────────────────────

  describe('onDateRangeChange', () => {
    it('should parse valid JSON and set selectedData', () => {
      const event = JSON.stringify({ Option: 'Quarter', Year: 2025, StartDate: '2025-01-01', EndDate: '2025-03-31' });
      component.onDateRangeChange(event);
      expect(component.selectedData).toEqual({ Option: 'Quarter', Year: 2025, StartDate: '2025-01-01', EndDate: '2025-03-31' });
    });

    it('should not throw on invalid JSON', () => {
      expect(() => component.onDateRangeChange('invalid-json')).not.toThrow();
    });

    it('should set StartDate from parsed event', () => {
      const event = JSON.stringify({ Option: 'Year', Year: 2025, StartDate: '2025-04-01', EndDate: '2026-03-31' });
      component.onDateRangeChange(event);
      expect(component.selectedData.StartDate).toBe('2025-04-01');
    });

    it('should set EndDate from parsed event', () => {
      const event = JSON.stringify({ Option: 'Year', Year: 2025, StartDate: '2025-04-01', EndDate: '2026-03-31' });
      component.onDateRangeChange(event);
      expect(component.selectedData.EndDate).toBe('2026-03-31');
    });
  });

  // ─── loadDataForDateRange ─────────────────────────────────────────────────

  describe('loadDataForDateRange', () => {
    it('should not throw when called with date strings', () => {
      expect(() => component.loadDataForDateRange('2025-01-01', '2025-12-31')).not.toThrow();
    });
  });
});
