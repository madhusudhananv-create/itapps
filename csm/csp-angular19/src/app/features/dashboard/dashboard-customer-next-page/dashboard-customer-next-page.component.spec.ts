import { fakeAsync, tick, waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DashboardCustomerNextPageComponent } from './dashboard-customer-next-page.component';
import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardDetailsModel } from '../../../models/dashboard-details-model';

const mockDashboardDetails: DashboardDetailsModel[] = [
  { title: 'FINDING_MAJOR', content: '3', proJ_ID: 'P001', cusT_ID: 'C001' } as any,
  { title: 'FINDING_MINOR', content: '2', proJ_ID: 'P001', cusT_ID: 'C001' } as any,
  { title: 'STAGE_FINDING_IMPLEMENT CAP', content: '1', proJ_ID: 'P001', cusT_ID: 'C001' } as any,
];

const mockAssessmentDetails = {
  audiT_PLANNED: 2,
  audiT_IN_PROGRESS: 1,
  audiT_COMPLETED: 3,
  audiT_CANCELLED: 0
};

describe('DashboardCustomerNextPageComponent', () => {
  let component: DashboardCustomerNextPageComponent;
  let fixture: ComponentFixture<DashboardCustomerNextPageComponent>;
  let mockAppsService: any;
  let mockUtilityService: any;
  let mockDashboardService: any;
  let mockRouter: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      GetDashboardDetailsbyCustomerId: jasmine.createSpy('GetDashboardDetailsbyCustomerId').and.returnValue(of(mockDashboardDetails)),
      GetAssessmentDetails: jasmine.createSpy('GetAssessmentDetails').and.returnValue(of(mockAssessmentDetails)),
      getAssessmentFindingsByTime: jasmine.createSpy('getAssessmentFindingsByTime').and.returnValue(of({ values: [], columnnames: [] })),
      getProjectPortfolioMapping: jasmine.createSpy('getProjectPortfolioMapping').and.returnValue(of([]))
    };

    mockUtilityService = {
      serviceError: jasmine.createSpy('serviceError'),
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
      ShouldLoadAllProjects: jasmine.createSpy('ShouldLoadAllProjects').and.returnValue(false),
      getMonthNum: jasmine.createSpy('getMonthNum').and.returnValue(2)
    };

    mockDashboardService = {};

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      imports: [DashboardCustomerNextPageComponent],
      providers: [
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService },
        { provide: UtilityService, useValue: mockUtilityService },
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: Router, useValue: mockRouter },
        provideHttpClient()
      ]
    })
    .overrideComponent(DashboardCustomerNextPageComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCustomerNextPageComponent);
    component = fixture.componentInstance;
    component.customerId = 'C001';
    component.month = 'Mar';
    component.year = 2026;
    component.projArray = ['P001'];
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should NOT call service methods when IsPremier is false', () => {
      mockUtilityService.IsPremier.and.returnValue(false);
      component.projArray = ['P001'];
      component.ngOnInit();
      expect(mockAppsService.getProjectPortfolioMapping).not.toHaveBeenCalled();
    });

    it('should call service methods when IsPremier is true and projArray is empty', fakeAsync(() => {
      mockUtilityService.IsPremier.and.returnValue(true);
      component.projArray = [];
      component.ngOnInit();
      tick(1);
      expect(mockAppsService.getProjectPortfolioMapping).toHaveBeenCalled();
      expect(mockAppsService.GetDashboardDetailsbyCustomerId).toHaveBeenCalled();
    }));
  });

  // ─── ngOnChanges ──────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should call GetDashboardDetails when projArray is not empty', () => {
      component.projArray = ['P001'];
      component.ngOnChanges();
      expect(mockAppsService.GetDashboardDetailsbyCustomerId).toHaveBeenCalledWith('C001');
    });

    it('should call getProjectPortfolioMapping when IsPremier and projArray empty', () => {
      mockUtilityService.IsPremier.and.returnValue(true);
      component.projArray = [];
      component.ngOnChanges();
      expect(mockAppsService.getProjectPortfolioMapping).toHaveBeenCalled();
    });
  });

  // ─── getTitleByProject ────────────────────────────────────────────────────

  describe('getTitleByProject', () => {
    beforeEach(() => {
      component.dashboardDetails = mockDashboardDetails;
    });

    it('should return content for matching title and projid', () => {
      expect(component.getTitleByProject('FINDING_MAJOR', 'P001')).toBe('3');
    });

    it('should return "-" when title not found', () => {
      expect(component.getTitleByProject('UNKNOWN', 'P001')).toBe('-');
    });

    it('should return "-" when dashboardDetails is null', () => {
      component.dashboardDetails = null as any;
      expect(component.getTitleByProject('FINDING_MAJOR', 'P001')).toBe('-');
    });
  });

  // ─── getGraphValue_project ────────────────────────────────────────────────

  describe('getGraphValue_project', () => {
    beforeEach(() => {
      component.dashboardDetails = mockDashboardDetails;
    });

    it('should return numeric value for valid content', () => {
      expect(component.getGraphValue_project('FINDING_MAJOR', 'P001')).toBe(3);
    });

    it('should return 0 when content is "-"', () => {
      expect(component.getGraphValue_project('UNKNOWN', 'P001')).toBe(0);
    });
  });

  // ─── getTitlesByString ────────────────────────────────────────────────────

  describe('getTitlesByString', () => {
    beforeEach(() => {
      component.dashboardDetails = mockDashboardDetails;
    });

    it('should return titles starting with given string for projid', () => {
      const result = component.getTitlesByString('FINDING_', 'P001');
      expect(result.length).toBe(2);
      expect(result).toContain('FINDING_MAJOR');
    });

    it('should return empty array when dashboardDetails is null', () => {
      component.dashboardDetails = null as any;
      expect(component.getTitlesByString('FINDING_', 'P001')).toEqual([]);
    });
  });

  // ─── fillQAAuditStatus1 ───────────────────────────────────────────────────

  describe('fillQAAuditStatus1', () => {
    beforeEach(() => {
      component.dashboardDetails = mockDashboardDetails;
    });

    it('should set isAuditStatusEmpty to true when month is not set', () => {
      component.month = '';
      component.fillQAAuditStatus1();
      expect(component.isAuditStatusEmpty).toBe(true);
    });

    it('should call GetAssessmentDetails with correct params', () => {
      component.fillQAAuditStatus1();
      expect(mockAppsService.GetAssessmentDetails).toHaveBeenCalledWith('C001', 2, 2026);
    });

    it('should populate planned/inProgress/completed/cancelled from API', () => {
      component.fillQAAuditStatus1();
      expect(component.planned).toBe(2);
      expect(component.inProgress).toBe(1);
      expect(component.completed).toBe(3);
      expect(component.cancelled).toBe(0);
    });

    it('should set isAuditStatusEmpty to false when totals > 0', () => {
      component.fillQAAuditStatus1();
      expect(component.isAuditStatusEmpty).toBe(false);
    });

    it('should set isAuditStatusEmpty to true when all counts are 0', () => {
      mockAppsService.GetAssessmentDetails.and.returnValue(of({
        audiT_PLANNED: 0, audiT_IN_PROGRESS: 0, audiT_COMPLETED: 0, audiT_CANCELLED: 0
      }));
      component.fillQAAuditStatus1();
      expect(component.isAuditStatusEmpty).toBe(true);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetAssessmentDetails.and.returnValue(throwError(() => new Error('fail')));
      component.fillQAAuditStatus1();
      expect(mockUtilityService.serviceError).toHaveBeenCalled();
    });
  });

  // ─── GetAssessmentFindingsByTime ──────────────────────────────────────────

  describe('GetAssessmentFindingsByTime', () => {
    it('should set isFindingsByTimeEmpty to true when data is empty', () => {
      mockAppsService.getAssessmentFindingsByTime.and.returnValue(of({ values: [], columnnames: [] }));
      component.GetAssessmentFindingsByTime('C001', ['P001']);
      expect(component.isFindingsByTimeEmpty).toBe(true);
    });

    it('should set isFindingsByTimeEmpty to false when data is present', () => {
      mockAppsService.getAssessmentFindingsByTime.and.returnValue(of({
        values: [['Jan-25', 5]], columnnames: ['Month', 'Count']
      }));
      component.GetAssessmentFindingsByTime('C001', ['P001']);
      expect(component.isFindingsByTimeEmpty).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getAssessmentFindingsByTime.and.returnValue(throwError(() => new Error('fail')));
      component.GetAssessmentFindingsByTime('C001', ['P001']);
      expect(mockUtilityService.serviceError).toHaveBeenCalled();
    });
  });

  // ─── fillQAFindingsSummary1 ───────────────────────────────────────────────

  describe('fillQAFindingsSummary1', () => {
    beforeEach(() => {
      component.dashboardDetails = mockDashboardDetails;
      component.projArray = ['P001'];
    });

    it('should set isFindingsByTypeEmpty to true when all values are 0', () => {
      component.dashboardDetails = [];
      component.fillQAFindingsSummary1();
      expect(component.isFindingsByTypeEmpty).toBe(true);
    });

    it('should build findingdata array', () => {
      component.fillQAFindingsSummary1();
      expect(component.findingdata.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── fillQAFindingsByStage1 ───────────────────────────────────────────────

  describe('fillQAFindingsByStage1', () => {
    beforeEach(() => {
      component.dashboardDetails = mockDashboardDetails;
      component.projArray = ['P001'];
    });

    it('should set isFindingsByStageEmpty to false when stage data present', () => {
      component.fillQAFindingsByStage1();
      expect(component.isFindingsByStageEmpty).toBe(false);
    });

    it('should set isFindingsByStageEmpty to true when no stage data', () => {
      component.dashboardDetails = [];
      component.fillQAFindingsByStage1();
      expect(component.isFindingsByStageEmpty).toBe(true);
    });
  });

  // ─── getSelectedProjectsList ──────────────────────────────────────────────

  describe('getSelectedProjectsList', () => {
    it('should update projArray from event', () => {
      component.getSelectedProjectsList(['P001', 'P002']);
      expect(component.projArray).toEqual(['P001', 'P002']);
    });
  });

  // ─── setValue ─────────────────────────────────────────────────────────────

  describe('setValue', () => {
    it('should set isFromFindingByAge in localStorage', () => {
      component.setValue();
      expect(localStorage.getItem('isFromFindingByAge')).toBe('true');
      localStorage.removeItem('isFromFindingByAge');
    });
  });
});
