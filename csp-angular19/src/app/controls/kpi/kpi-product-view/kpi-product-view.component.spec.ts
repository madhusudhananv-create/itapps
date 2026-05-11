import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { KpiProductViewComponent } from './kpi-product-view.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';

describe('KpiProductViewComponent', () => {
  let component: KpiProductViewComponent;
  let fixture: ComponentFixture<KpiProductViewComponent>;

  const mockAppsService = {
    getDBConfigValueFields: jasmine.createSpy('getDBConfigValueFields').and.returnValue(of('')),
    GetProductServiceModes: jasmine.createSpy('GetProductServiceModes').and.returnValue(of([])),
    GetProductName: jasmine.createSpy('GetProductName').and.returnValue(of('')),
    GetMonthlyKpiMetrics: jasmine.createSpy('GetMonthlyKpiMetrics').and.returnValue(of([])),
    GetQuarterlyKpiMetrics: jasmine.createSpy('GetQuarterlyKpiMetrics').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError'),
    tableYear: new Date().getFullYear(),
    tableMonth: new Date().getMonth() + 1,
    Years: jasmine.createSpy('Years').and.returnValue([2024, 2025, 2026]),
    getmonthsBasedonYear: jasmine.createSpy('getmonthsBasedonYear').and.returnValue([
      { id: 1, name: 'Jan' }, { id: 2, name: 'Feb' }
    ])
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) })
  };

  const mockActivatedRoute = {
    snapshot: { params: {}, url: [] }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KpiProductViewComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiProductViewComponent);
    component = fixture.componentInstance;
    component.custId = 'C001';
    component.prodId = 0;
    component.modeId = 0;
    component.kpiId = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise @Input defaults on fresh component', () => {
    const fresh = TestBed.createComponent(KpiProductViewComponent).componentInstance;
    expect(fresh.custId).toBe('');
    expect(fresh.prodId).toBe(0);
    expect(fresh.modeId).toBe(0);
    expect(fresh.kpiId).toBe(0);
    expect(fresh.monthChanged).toBe(0);
    expect(fresh.yearChanged).toBe(0);
    expect(fresh.tabChange).toBeFalsy();
  });

  it('should initialise arrays as empty', () => {
    expect(component.metricsDetail).toEqual([]);
    expect(component.additionalData).toEqual([]);
    expect(component.monthlyMetrics).toEqual([]);
    expect(component.quarterlyMetrics).toEqual([]);
    expect(component.releaseMetrics).toEqual([]);
    expect(component.serviceModes).toEqual([]);
    expect(component.filteredData).toEqual([]);
  });

  it('should initialise boolean flags', () => {
    expect(component.isLoading).toBeFalsy();
    expect(component.freez).toBeFalsy();
    expect(component.addDatas).toBeFalsy();
    expect(component.showMonth).toBeFalsy();
    expect(component.showRelease).toBeFalsy();
    expect(component.showQuarter).toBeFalsy();
    expect(component.includeExclusions).toBeTruthy();
    expect(component.enableExclusion).toBeFalsy();
    expect(component.isCapaVisible).toBeFalsy();
  });

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('metrics');
    expect(component.displayedColumns).toContain('actuals');
    expect(component.displayedColumns).toContain('slaStatus');
  });

  it('should load month list via getmonthsBasedonYear', () => {
    expect(mockMyUtility.getmonthsBasedonYear).toHaveBeenCalled();
    expect(component.month.length).toBeGreaterThan(0);
  });

  it('should not load service modes when prodId is 0', () => {
    mockAppsService.GetProductServiceModes.calls.reset();
    component.prodId = 0;
    component.ngOnInit();
    expect(mockAppsService.GetProductServiceModes).not.toHaveBeenCalled();
  });
});
