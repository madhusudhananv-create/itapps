import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { KpiDetailsComponent } from './kpi-details.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

describe('KpiDetailsComponent', () => {
  let component: KpiDetailsComponent;
  let fixture: ComponentFixture<KpiDetailsComponent>;

  const mockAppsService = {
    getKPIDetailsMonthlyandWeekly: jasmine.createSpy('getKPIDetailsMonthlyandWeekly').and.returnValue(of([])),
    getKpiAdditionalData:          jasmine.createSpy('getKpiAdditionalData').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin:          jasmine.createSpy('validateLogin'),
    serviceError:           jasmine.createSpy('serviceError'),
    tableYear:              new Date().getFullYear(),
    tableMonth:             new Date().getMonth() + 1,
    getmonthsBasedonYear:   jasmine.createSpy('getmonthsBasedonYear').and.returnValue([]),
    Years:                  jasmine.createSpy('Years').and.returnValue([2024, 2025, 2026])
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KpiDetailsComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideNativeDateAdapter(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility,   useValue: mockMyUtility }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiDetailsComponent);
    component = fixture.componentInstance;
    component.custId = 'C001';
    component.projId = 'P001';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise @Input defaults on fresh component', () => {
    const fresh = TestBed.createComponent(KpiDetailsComponent).componentInstance;
    expect(fresh.custId).toBe('');
    expect(fresh.projId).toBe('');
    expect(fresh.tabChange).toBeFalsy();
  });

  it('should initialise data arrays as empty', () => {
    expect(component.detailmonthly).toEqual([]);
    expect(component.details).toEqual([]);
    expect(component.month).toEqual([]);
    expect(component.colorCode).toEqual([]);
    expect(component.kpiDetailsData).toEqual([]);
  });

  it('should initialise _loading to false', () => {
    expect(component._loading).toBeFalsy();
  });

  it('should initialise disableKPIEdit to false', () => {
    expect(component.disableKPIEdit).toBeFalsy();
  });

  it('should initialise currentDate as a Date', () => {
    expect(component.currentDate instanceof Date).toBeTruthy();
  });

  it('should initialise detail as empty object', () => {
    expect(component.detail).toEqual({});
  });

  it('should initialise ind to 0', () => {
    expect(component.ind).toBe(0);
  });
});
