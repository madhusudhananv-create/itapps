import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { of } from 'rxjs';

import { KpiPageComponent } from './kpi-page.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { SharedService } from '../../../shared/shared.service';
import { KpiSharedService } from '../kpi-shared.service';

describe('KpiPageComponent', () => {
  let component: KpiPageComponent;
  let fixture: ComponentFixture<KpiPageComponent>;

  const mockMediaQueryList = {
    matches: false,
    addListener: jasmine.createSpy('addListener'),
    removeListener: jasmine.createSpy('removeListener')
  };

  const mockMediaMatcher = {
    matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
  };

  const mockActivatedRoute = {
    snapshot: { params: { custid: 'C001' }, url: [] }
  };

  const mockAppsService = {
    GetCustomerList:                 jasmine.createSpy('GetCustomerList').and.returnValue(of([])),
    getDBConfigValueFields:          jasmine.createSpy('getDBConfigValueFields').and.returnValue(of('')),
    getCustomerProjectsName:         jasmine.createSpy('getCustomerProjectsName').and.returnValue(of([])),
    getPortfolioList:                jasmine.createSpy('getPortfolioList').and.returnValue(of([])),
    getProductList:                  jasmine.createSpy('getProductList').and.returnValue(of([])),
    getProjectPortfolioMapping:      jasmine.createSpy('getProjectPortfolioMapping').and.returnValue(of([])),
    // KpiDefinitionsComponent
    getServiceAreaList:              jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
    getOverallKPIList:               jasmine.createSpy('getOverallKPIList').and.returnValue(of([])),
    GetKpiDefinitions:               jasmine.createSpy('GetKpiDefinitions').and.returnValue(of([])),
    GetGlobalKpiCategories:          jasmine.createSpy('GetGlobalKpiCategories').and.returnValue(of([])),
    getServiceTowersProjectMapping:  jasmine.createSpy('getServiceTowersProjectMapping').and.returnValue(of([])),
    // KpiDetailsComponent
    getKPIDetailsMonthlyandWeekly:   jasmine.createSpy('getKPIDetailsMonthlyandWeekly').and.returnValue(of([])),
    getKpiAdditionalData:            jasmine.createSpy('getKpiAdditionalData').and.returnValue(of([])),
    // KpiGoalsComponent
    GetKpiGoals:                     jasmine.createSpy('GetKpiGoals').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
    IsBaseMeasureEnabledCustomer: jasmine.createSpy('IsBaseMeasureEnabledCustomer').and.returnValue(false),
    ShouldLoadAllProjects: jasmine.createSpy('ShouldLoadAllProjects').and.returnValue(false),
    serviceError: jasmine.createSpy('serviceError'),
    getmonthsBasedonYear: jasmine.createSpy('getmonthsBasedonYear').and.returnValue([]),
    Years: jasmine.createSpy('Years').and.returnValue([2024, 2025, 2026]),
    tableYear: new Date().getFullYear(),
    tableMonth: new Date().getMonth() + 1
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KpiPageComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: SharedService, useValue: {} },
        KpiSharedService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read custId from route params on ngOnInit', () => {
    expect(component.custId).toBe('C001');
  });

  it('should initialise menuToggleStatus to false', () => {
    expect(component.menuToggleStatus).toBeFalsy();
  });

  it('should set up mobileQuery via MediaMatcher', () => {
    expect(mockMediaMatcher.matchMedia).toHaveBeenCalledWith('(max-width: 600px)');
    expect(component.mobileQuery).toBeTruthy();
  });

  it('should remove media query listener on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
  });
});
