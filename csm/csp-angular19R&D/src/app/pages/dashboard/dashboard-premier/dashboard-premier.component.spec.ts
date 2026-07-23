import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { DashboardPremierComponent } from './dashboard-premier.component';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { DashboardService } from '../../../services/dashboard.service';
import { ChartsService } from '../../../services/charts.service';
import { SharedService } from '../../../shared/shared.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('DashboardPremierComponent', () => {
  let component: DashboardPremierComponent;
  let fixture: ComponentFixture<DashboardPremierComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockDialog: any;
  let mockDashboardUtil: any;
  let mockChartsService: any;
  let mockShared: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetDBConfigValueFields: jasmine.createSpy().and.returnValue(of('')),
      GetDBConfigValue: jasmine.createSpy().and.returnValue(of('80')),
      GetCustomerList: jasmine.createSpy().and.returnValue(of([])),
      GetPortfolioList: jasmine.createSpy().and.returnValue(of([])),
      GetDashboardDetailsbyCustomerId: jasmine.createSpy().and.returnValue(of([])),
      GetServiceMetricsDashboardDataPortfolioWise: jasmine.createSpy().and.returnValue(of({
        portfoliO_WISE_KPI: []
      })),
      GetServiceMetricsDashboardDataProductWise: jasmine.createSpy().and.returnValue(of({
        producT_WISE_KPI: [],
        engagemenT_WISE_KPI: [],
        highlights: []
      })),
      getAllProjectsForCustomer: jasmine.createSpy().and.returnValue(of([])),
      GetSuccessGoalScoresForProject: jasmine.createSpy().and.returnValue(of([])),
      RefreshDashboardDetails: jasmine.createSpy().and.returnValue(of({})),
      Logout: jasmine.createSpy().and.returnValue(of({})),
      KpiCalledFromNewDashboard: false
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      GetDefaultMonthForPremierSLA: jasmine.createSpy().and.returnValue([{ Month: '01', Year: 2024 }]),
      IsPremier: jasmine.createSpy().and.returnValue(false),
      showThumbsForProduct: jasmine.createSpy().and.returnValue('Under Control'),
      showWarningConfirmation: jasmine.createSpy().and.returnValue({ afterClosed: () => of(false) }),
      IsGAVS: jasmine.createSpy().and.returnValue(false),
      empid: jasmine.createSpy(),
      displayname: jasmine.createSpy(),
      token: jasmine.createSpy(),
      GetCharts: jasmine.createSpy(),
      ShowSideNav: false,
      AppSettings: { token: 'test-token' }
    };
    mockAccess = {
      IsAllowed: jasmine.createSpy().and.returnValue(true)
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) })
    };
    mockDashboardUtil = {
      filteR_MONTH: '01',
      filteR_YEAR: 2024,
      lasT_FILTERED_MONTH: '',
      lasT_FILTERED_YEAR: 0
    };
    mockChartsService = {
      getNotesForCustomer: jasmine.createSpy().and.returnValue(of([]))
    };
    mockShared = {
      selectedPortfolios: [],
      selectedProjects: [],
      selectedProducts: [],
      savedportfolioId: 0
    };

    TestBed.configureTestingModule({
      imports: [DashboardPremierComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: MatDialog, useValue: mockDialog },
        { provide: DashboardService, useValue: mockDashboardUtil },
        { provide: ChartsService, useValue: mockChartsService },
        { provide: SharedService, useValue: mockShared },
        { provide: Router, useValue: { navigate: jasmine.createSpy(), navigateByUrl: jasmine.createSpy() } },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: ChangeDetectorRef, useValue: { detectChanges: jasmine.createSpy() } },
        { provide: MediaMatcher, useValue: { matchMedia: jasmine.createSpy().and.returnValue({ addListener: jasmine.createSpy(), removeListener: jasmine.createSpy() }) } },
        provideHttpClient(),
        provideAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPremierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.progress).toBe(false);
    expect(component.count).toBe(0);
    expect(component.legend).toBe(false);
    expect(component.includeExclusions).toBe(false);
    expect(component.viewBy).toBe('By Expected Service Level');
  });

  it('should call service_getPortfolioDetails on init', () => {
    expect(mockAppService.GetPortfolioList).toHaveBeenCalled();
  });

  it('should set portfolioList from service response', () => {
    const mockPortfolios = [{ id: 1, name: 'Portfolio 1' }];
    mockAppService.GetPortfolioList.and.returnValue(of(mockPortfolios));
    component.service_getPortfolioDetails();
    expect(component.portfolioList).toEqual(mockPortfolios as any);
  });

  it('should call serviceError on portfolio load error', () => {
    mockAppService.GetPortfolioList.and.returnValue(throwError(() => new Error('error')));
    component.service_getPortfolioDetails();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should calculate getAchievement correctly', () => {
    const result = component.getAchievement(8, 2);
    expect(Number(result)).toBe(80);
  });

  it('should return 0 for getAchievement when both are 0', () => {
    const result = component.getAchievement(0, 0);
    expect(Number(result)).toBe(0);
  });

  it('should toggle legend when enablestatus is called', () => {
    expect(component.legend).toBe(false);
    component.enablestatus();
    expect(component.legend).toBe(true);
    component.enablestatus();
    expect(component.legend).toBe(false);
  });

  it('should set viewBy when changeServiceLevel is called', () => {
    component.changeServiceLevel('By Minimum Service Level');
    expect(component.viewBy).toBe('By Minimum Service Level');
  });

  it('should filter project scores by portfolio in filterProjectList', () => {
    component.tempScoresArray = [
      { proJ_ID: 'P1', portfoliO_ID: 1 },
      { proJ_ID: 'P2', portfoliO_ID: 2 }
    ] as any;
    component.filterProjectList(1);
    expect(component.projectScores.length).toBe(1);
  });

  it('should show all projects when filterProjectList called with 0', () => {
    component.tempScoresArray = [
      { proJ_ID: 'P1', portfoliO_ID: 1 },
      { proJ_ID: 'P2', portfoliO_ID: 2 }
    ] as any;
    component.filterProjectList(0);
    expect(component.projectScores.length).toBe(2);
  });

  it('should open KPI notes dialog', () => {
    component.selectedCustomer = { cusT_ID: 'C1' } as any;
    component.showKPINotesForCustomer('C1');
    expect(mockChartsService.getNotesForCustomer).toHaveBeenCalledWith('C1');
  });

  it('should handle error in showKPINotesForCustomer', () => {
    mockChartsService.getNotesForCustomer.and.returnValue(throwError(() => new Error('error')));
    component.selectedCustomer = { cusT_ID: 'C1' } as any;
    component.showKPINotesForCustomer('C1');
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should handle toggleExclusions', () => {
    component.toggleExclusions(true);
    expect(component.includeExclusions).toBe(true);
  });

  it('should open DashboardPortfolioAchievementDetailComponent on openPopUp', () => {
    component.openPopUp([], ['Under Control']);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should open DashboardEngagementLevelAchievementDetailComponent on viewEngagementLevelDetails', () => {
    component.selectedCustomer = { cusT_ID: 'C1' } as any;
    (component as any)._dashboardUtil = mockDashboardUtil;
    component.viewEngagementLevelDetails();
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
