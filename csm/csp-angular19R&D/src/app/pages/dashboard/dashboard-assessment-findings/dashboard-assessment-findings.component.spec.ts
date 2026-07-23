import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DashboardAssessmentFindingsComponent } from './dashboard-assessment-findings.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('DashboardAssessmentFindingsComponent', () => {
  let component: DashboardAssessmentFindingsComponent;
  let fixture: ComponentFixture<DashboardAssessmentFindingsComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getAccountsForCSATDashboard: jasmine.createSpy().and.returnValue(of({
        customers: [],
        allTop15Accounts: '',
        top15Accounts: [],
        allAccountsExcepttop15Accounts: []
      })),
      getFindingTypeForAssessmentFindingsQADeck: jasmine.createSpy().and.returnValue(of([])),
      getAssessmentFindingChartData: jasmine.createSpy().and.returnValue(of({}))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      Years: jasmine.createSpy().and.returnValue([2023, 2024, 2025]),
      Year: jasmine.createSpy().and.returnValue(2024),
      IsPremier: jasmine.createSpy().and.returnValue(false),
      IsGAVS: jasmine.createSpy().and.returnValue(false),
      getDatesBasedOnQuarter: jasmine.createSpy().and.returnValue([{ fromDate: new Date(), toDate: new Date() }]),
      getQuarter: jasmine.createSpy().and.returnValue('Q1'),
      showWarningPopup: jasmine.createSpy()
    };
    mockAccess = {
      IsAllowed: jasmine.createSpy().and.returnValue(false)
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) })
    };

    TestBed.configureTestingModule({
      imports: [DashboardAssessmentFindingsComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    TestBed.overrideProvider(AppsService, { useValue: mockAppService });
    TestBed.overrideProvider(MyUtility, { useValue: mockUtil });
    TestBed.overrideProvider(MatDialog, { useValue: mockDialog });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardAssessmentFindingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedQuarter).toBe('Q1');
    expect(component.trendQuarter).toBe(1);
    expect(component._loading).toBe(false);
    expect(component.allCust).toBe(false);
  });

  it('should call getAccountsForUser on init', () => {
    expect(mockAppService.getAccountsForCSATDashboard).toHaveBeenCalled();
  });

  it('should call getFindingType on init', () => {
    expect(mockAppService.getFindingTypeForAssessmentFindingsQADeck).toHaveBeenCalled();
  });

  it('should call getDatesBasedOnQuarter on init', () => {
    expect(mockUtil.getDatesBasedOnQuarter).toHaveBeenCalled();
  });

  it('should set _loading to false after init', () => {
    expect(component._loading).toBe(false);
  });

  it('should call getAssessmentFindingChartData when loadData is called with valid inputs', () => {
    (component as any).assessmentFindingInputs = {
      charT_TITLE: 'Test Chart',
      xAxis: 'X',
      yAxis: 'Y'
    };
    component.loadData();
    expect(mockAppService.getAssessmentFindingChartData).toHaveBeenCalled();
  });

  it('should set assessmentFindingData on successful chart data fetch', () => {
    const mockData = { labels: [], values: [] };
    mockAppService.getAssessmentFindingChartData.and.returnValue(of(mockData));
    (component as any).assessmentFindingInputs = {
      charT_TITLE: 'Test Chart',
      xAxis: 'X',
      yAxis: 'Y'
    };
    component.loadData();
    expect(component.assessmentFindingData).toEqual(mockData);
  });

  it('should open dialog when ViewAssessmentFindingDetails is called', () => {
    component.ViewAssessmentFindingDetails();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should reset filters when reset is called', () => {
    component.selectedQuarter = 'currentQuarter';
    component.assessmentFindingData = { some: 'data' };
    component.reset();
    expect(component.selectedQuarter).toBe('Q1');
    expect(component.assessmentFindingData).toBeUndefined();
  });

  it('should call getAccountsForUser with allCust value', () => {
    component.allCust = true;
    component.getAccountsForUser();
    expect(mockAppService.getAccountsForCSATDashboard).toHaveBeenCalledWith(true);
  });

  it('should handle error in getAccountsForUser', () => {
    mockAppService.getAccountsForCSATDashboard.and.returnValue(throwError(() => new Error('error')));
    component.getAccountsForUser();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should bindAssessmentFindingInputs with default values', () => {
    component.bindAssessmentFindingInputs();
    expect((component as any).assessmentFindingInputs).toBeDefined();
    expect((component as any).assessmentFindingInputs.findinG_STATUS).toBe('Open');
  });

  it('should update dates on selectedPeriod_OnChange', () => {
    component.selectedPeriod_OnChange();
    expect(mockUtil.getDatesBasedOnQuarter).toHaveBeenCalled();
  });
});
