import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHttpClient } from '@angular/common/http';

import { MonthandyearpickerComponent } from './monthandyearpicker.component';
import { MyUtility } from '../../shared/my-utility';

describe('MonthandyearpickerComponent', () => {
  let component: MonthandyearpickerComponent;
  let fixture: ComponentFixture<MonthandyearpickerComponent>;

  const currentYear = new Date().getFullYear();

  const mockMyUtility = {
    Year: jasmine.createSpy('Year').and.returnValue(currentYear),
    Years: jasmine.createSpy('Years').and.returnValue([currentYear - 1, currentYear, currentYear + 1])
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MonthandyearpickerComponent],
      providers: [
        provideNativeDateAdapter(),
        { provide: MyUtility, useValue: mockMyUtility },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthandyearpickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize selectedOption as "range"', () => {
    expect(component.selectedOption).toBe('range');
  });

  it('should initialize selectedQuarter as 4', () => {
    expect(component.selectedQuarter).toBe(4);
  });

  it('should initialize years array', () => {
    expect(component.years).toBeDefined();
    expect(Array.isArray(component.years)).toBeTruthy();
    expect(component.years.length).toBeGreaterThan(0);
  });

  it('should initialize StartDate and EndDate as non-empty strings', () => {
    expect(component.StartDate).toBeTruthy();
    expect(component.EndDate).toBeTruthy();
  });

  it('should have onChange EventEmitter defined', () => {
    expect(component.onChange).toBeDefined();
  });

  it('should emit onChange JSON on emitChanges()', () => {
    const emitSpy = spyOn(component.onChange, 'emit');
    component.emitChanges();
    expect(emitSpy).toHaveBeenCalled();
    const emittedValue: string = emitSpy.calls.mostRecent().args[0] as string;
    const parsed = JSON.parse(emittedValue);
    expect(parsed.Option).toBeDefined();
    expect(parsed.Year).toBeDefined();
    expect(parsed.StartDate).toBeDefined();
    expect(parsed.EndDate).toBeDefined();
  });

  it('should set Q1 dates when selectedOption="quarter" and selectedQuarter=1', () => {
    component.selectedOption = 'quarter';
    component.selectedQuarter = 1;
    component.DateChange();
    expect(component.StartDate).toContain('Jan');
    expect(component.EndDate).toContain('Mar');
  });

  it('should set Q2 dates when selectedOption="quarter" and selectedQuarter=2', () => {
    component.selectedOption = 'quarter';
    component.selectedQuarter = 2;
    component.DateChange();
    expect(component.StartDate).toContain('Apr');
    expect(component.EndDate).toContain('Jun');
  });

  it('should set Q3 dates when selectedOption="quarter" and selectedQuarter=3', () => {
    component.selectedOption = 'quarter';
    component.selectedQuarter = 3;
    component.DateChange();
    expect(component.StartDate).toContain('Jul');
    expect(component.EndDate).toContain('Sep');
  });

  it('should set Q4 dates when selectedOption="quarter" and selectedQuarter=4', () => {
    component.selectedOption = 'quarter';
    component.selectedQuarter = 4;
    component.DateChange();
    expect(component.StartDate).toContain('Oct');
    expect(component.EndDate).toContain('Dec');
  });

  it('should set StartDate to Jan in "range" mode', () => {
    component.selectedOption = 'range';
    component.selectedQuarter = 2;
    component.DateChange();
    expect(component.StartDate).toContain('Jan');
  });

  it('should initialize QuarterSlideMin as 1', () => {
    expect(component.QuarterSlideMin).toBe(1);
  });

  it('should initialize QuarterSlideMax as 4', () => {
    expect(component.QuarterSlideMax).toBe(4);
  });
});
