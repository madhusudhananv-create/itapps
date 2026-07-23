import { provideAnimations } from '@angular/platform-browser/animations';
import { fakeAsync, tick, waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { DashboardCustomerPage2Component } from './dashboard-customer-page2.component';
import { AppsService } from '../../../core/services/apps.service';
import { AuthService } from '../../../core/services/auth.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { SharedData } from '../../../shared/shared-data';
import { DashboardService } from '../../../services/dashboard.service';
import { provideHttpClient } from '@angular/common/http';

const mockDashboardDetails: any[] = [
  { title: 'ACTION_ITEM_HIGH', content: '2', proJ_ID: 'P001', cusT_ID: 'C001' },
  { title: 'ACTION_ITEM_MEDIUM', content: '1', proJ_ID: 'P001', cusT_ID: 'C001' },
  { title: 'RISK_HIGH', content: '1', proJ_ID: 'P001', cusT_ID: 'C001' },
  { title: 'ISSUE_HIGH', content: '3', proJ_ID: 'P001', cusT_ID: 'C001' },
  { title: 'APPRECIATION', content: '5', proJ_ID: 'P001', cusT_ID: 'C001' },
  { title: 'SUCCESS_GOAL_SCORE_QUALITY', content: '80', proJ_ID: null, cusT_ID: 'C001' },
];

describe('DashboardCustomerPage2Component', () => {
  let component: DashboardCustomerPage2Component;
  let fixture: ComponentFixture<DashboardCustomerPage2Component>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockSharedData: any;
  let mockDashboardService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockMediaMatcher: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      getDashboardDetailsByCustomerId: jasmine.createSpy('getDashboardDetailsByCustomerId').and.returnValue(of(mockDashboardDetails)),
      getAllProjectsForCustomer: jasmine.createSpy('getAllProjectsForCustomer').and.returnValue(of([{ proJ_ID: 'P001' }])),
      refreshDashboardDetails: jasmine.createSpy('refreshDashboardDetails').and.returnValue(of({})),
      getSuccessGoalScores: jasmine.createSpy('getSuccessGoalScores').and.returnValue(of([])),
      getTasksEventsSummary: jasmine.createSpy('getTasksEventsSummary').and.returnValue(of([])),
      getAppreciationDetails: jasmine.createSpy('getAppreciationDetails').and.returnValue(of([])),
      getSuccessGoalScoreForAPeriod: jasmine.createSpy('getSuccessGoalScoreForAPeriod').and.returnValue(of([])),
      getSuccessGoalScoresForProject: jasmine.createSpy('getSuccessGoalScoresForProject').and.returnValue(of([]))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
      getMonthNum: jasmine.createSpy('getMonthNum').and.returnValue(3),
      Month: jasmine.createSpy('Month').and.returnValue('Apr'),
      Year: jasmine.createSpy('Year').and.returnValue(2026)
    };

    mockAccessControl = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
    };
    mockSharedData = {};
    mockDashboardService = {
      getTitleByCustomer: jasmine.createSpy('getTitleByCustomer').and.returnValue(''),
      getGraphValue_customer: jasmine.createSpy('getGraphValue_customer').and.returnValue(0)
    };

    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockDialog = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }) };

    const mockMediaQueryList = {
      matches: false,
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener')
    };
    mockMediaMatcher = { matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList) };

    TestBed.configureTestingModule({
      imports: [DashboardCustomerPage2Component],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: SharedData, useValue: mockSharedData },
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: AuthService, useValue: { isGAVSUser: () => false } },
        provideHttpClient(),
        provideAnimations()
      ]
    }).overrideComponent(DashboardCustomerPage2Component, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCustomerPage2Component);
    component = fixture.componentInstance;
    component.customerid = 'C001';
    localStorage.setItem('empid', 'EMP01');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set empId from localStorage', () => {
      fixture.detectChanges();
      expect(component.empId).toBe('EMP01');
    });

    it('should set isFrontier to true for Frontier customer ID', fakeAsync(() => {
      spyOn(component, 'startTimer');
      spyOn(component, 'initializeDashboard');
      component.customerid = '202100007';
      component.ngOnInit();
      tick(1);
      expect(component.isFrontier).toBe(true);
    }));

    it('should set isFrontier to false for non-Frontier customer', () => {
      fixture.detectChanges();
      expect(component.isFrontier).toBe(false);
    });

    it('should set sMonth from current month', () => {
      fixture.detectChanges();
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      expect(monthNames).toContain(component.sMonth);
    });

    it('should call initializeDashboard when customerid is set', fakeAsync(() => {
      spyOn(component, 'initializeDashboard');
      fixture.detectChanges();
      tick(1);
      expect(component.initializeDashboard).toHaveBeenCalled();
    }));

    it('should call startTimer', () => {
      spyOn(component, 'startTimer');
      fixture.detectChanges();
      expect(component.startTimer).toHaveBeenCalled();
    });
  });

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should close all help popups on destroy', () => {
      fixture.detectChanges();
      component.showSuccessGoalFilter = true;
      component.showQualityHelp = true;
      component.ngOnDestroy();
      expect(component.showSuccessGoalFilter).toBe(false);
      expect(component.showQualityHelp).toBe(false);
    });
  });

  // ─── service_GetDashboardDetails ──────────────────────────────────────────

  describe('service_GetDashboardDetails', () => {
    it('should populate dashboardDetails', fakeAsync(() => {
      fixture.detectChanges();
      tick(1);
      expect(component.dashboardDetails.length).toBe(6);
    }));

    it('should call getAllProjectsForCustomer when projectArray is empty', () => {
      component.projectArray = [];
      component.service_GetDashboardDetails('C001');
      expect(mockAppsService.getAllProjectsForCustomer).toHaveBeenCalledWith('C001');
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getDashboardDetailsByCustomerId.and.returnValue(throwError(() => new Error('fail')));
      component.service_GetDashboardDetails('C001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── createEmptyTasksEventsSummary ────────────────────────────────────────

  describe('createEmptyTasksEventsSummary', () => {
    it('should return object with priority set', () => {
      const summary = component.createEmptyTasksEventsSummary('high');
      expect(summary.priority).toBe('high');
    });

    it('should return object with all numeric fields as 0', () => {
      const summary = component.createEmptyTasksEventsSummary('low');
      expect(summary.dueEvents).toBe(0);
      expect(summary.overdueTasks).toBe(0);
    });
  });

  // ─── Refresh_Onclick ──────────────────────────────────────────────────────

  describe('Refresh_Onclick', () => {
    it('should call refreshDashboardDetails', () => {
      fixture.detectChanges();
      component.Refresh_Onclick();
      expect(mockAppsService.refreshDashboardDetails).toHaveBeenCalled();
    });

    it('should call serviceError on refresh failure', () => {
      mockAppsService.refreshDashboardDetails.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.Refresh_Onclick();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });
});
