import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DashboardMainComponent } from './dashboard-main.component';
import { AppsService } from '../../../services/apps.service';
import { SharedService } from '../../../shared/shared.service';
import { SurveyService } from '../../../core/services/survey.service';
import { MyUtility } from '../../../shared/my-utility';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, Component, Input } from '@angular/core';
import { TabOverallStatusComponent } from '../tab-overall-status/tab-overall-status.component';
import { RiskchartControlComponent } from '../../../controls/risk-chart-control/risk-chart-control.component';
import { CssdashboardCssTableComponent } from '../../../pages/cssdashboard/cssdashboard-css-table/cssdashboard-css-table.component';
import { CssdashboardNextPage1Component } from '../../../pages/cssdashboard/cssdashboard-next-page1/cssdashboard-next-page1.component';
import { CssdashboardNextPage2Component } from '../../../pages/cssdashboard/cssdashboard-next-page2/cssdashboard-next-page2.component';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';

// Mock child components that require Highcharts
@Component({ selector: 'app-tab-overall-status', template: '', standalone: true })
class MockTabOverallStatusComponent { }

@Component({ selector: 'app-risk-chart-control', template: '', standalone: true })
class MockRiskChartControlComponent {
  @Input() inputs: any;
  @Input() isValid: any;
}

@Component({ selector: 'app-cssdashboard-css-table', template: '', standalone: true })
class MockCssdashboardCssTableComponent {
  @Input() cssDashboardInputs: any;
  @Input() isLoaded: any;
}

@Component({ selector: 'app-cssdashboard-next-page1', template: '', standalone: true })
class MockCssdashboardNextPage1Component {
  @Input() customerId: any;
  @Input() fromDate: any;
  @Input() toDate: any;
}

@Component({ selector: 'app-cssdashboard-next-page2', template: '', standalone: true })
class MockCssdashboardNextPage2Component {
  @Input() customerId: any;
  @Input() fromDate: any;
  @Input() toDate: any;
}

@Component({ selector: 'app-navbar-new', template: '', standalone: true })
class MockNavbarNewComponent { }

describe('DashboardMainComponent', () => {
  let component: DashboardMainComponent;
  let fixture: ComponentFixture<DashboardMainComponent>;
  let mockAppService: any;
  let mockSurveyService: any;
  let mockUtil: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getBusinessUnits: jasmine.createSpy('getBusinessUnits').and.returnValue(of([]))
    };

    mockSurveyService = {
      GetCSMListDistinct: jasmine.createSpy('GetCSMListDistinct').and.returnValue(of([]))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError')
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) })
    };

    TestBed.configureTestingModule({
      imports: [
        DashboardMainComponent,
        NoopAnimationsModule,
        MockTabOverallStatusComponent,
        MockRiskChartControlComponent,
        MockCssdashboardCssTableComponent,
        MockCssdashboardNextPage1Component,
        MockCssdashboardNextPage2Component,
        MockNavbarNewComponent
      ],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: SharedService, useValue: {} },
        { provide: SurveyService, useValue: mockSurveyService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    // Override the component to use mock child components
    TestBed.overrideComponent(DashboardMainComponent, {
      remove: {
        imports: [
          TabOverallStatusComponent,
          RiskchartControlComponent,
          CssdashboardCssTableComponent,
          CssdashboardNextPage1Component,
          CssdashboardNextPage2Component,
          NavbarNewComponent
        ]
      },
      add: {
        imports: [
          MockTabOverallStatusComponent,
          MockRiskChartControlComponent,
          MockCssdashboardCssTableComponent,
          MockCssdashboardNextPage1Component,
          MockCssdashboardNextPage2Component,
          MockNavbarNewComponent
        ]
      }
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key === 'empid' ? 'emp001' : null
    );
    fixture = TestBed.createComponent(DashboardMainComponent);
    component = fixture.componentInstance;
    
    // Initialize _cooDashboardCommon properties
    component['_cooDashboardCommon'].csmIds = [];
    component['_cooDashboardCommon'].customerIds = [];
    component['_cooDashboardCommon'].projectIds = [];
    component['_cooDashboardCommon'].riskStatus = [];
    component['_cooDashboardCommon'].businessUnit = [];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.menuToggleStatus).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.progress).toBe(false);
    expect(component.currIndex).toBe(0);
    expect(component.isChecked).toBe(false);
    expect(component.CSMList).toEqual([]);
  });

  it('should call GetCSMListDistinct on ngOnInit', () => {
    expect(mockSurveyService.GetCSMListDistinct).toHaveBeenCalled();
  });

  it('should call getBusinessUnits on ngOnInit', () => {
    expect(mockAppService.getBusinessUnits).toHaveBeenCalled();
  });

  it('should populate CSMList after service_GetCSMList()', () => {
    const csmData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    mockSurveyService.GetCSMListDistinct.and.returnValue(of(csmData));
    component.service_GetCSMList();
    expect(component.CSMList).toEqual(csmData);
  });

  it('should call serviceError on service_GetCSMList error', () => {
    mockSurveyService.GetCSMListDistinct.and.returnValue(throwError(() => new Error('err')));
    component.service_GetCSMList();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should populate overallBusinessUnit and businessUnit on getOverallBusinessUnits()', () => {
    const units = ['BU1', 'BU2'];
    mockAppService.getBusinessUnits.and.returnValue(of(units));
    component.getOverallBusinessUnits();
    expect(component.overallBusinessUnit).toEqual(units);
    expect(component.businessUnit.length).toBe(3); // units + '-1' prepended
    expect(component.businessUnit[0]).toBe('-1');
  });

  it('should set menuToggleStatus on onMenuToggleChange()', () => {
    component.onMenuToggleChange(true);
    expect(component.menuToggleStatus).toBe(true);
    component.onMenuToggleChange(false);
    expect(component.menuToggleStatus).toBe(false);
  });

  it('should increment currIndex on onNext()', () => {
    component.currIndex = 0;
    component.onNext();
    expect(component.currIndex).toBe(1);
  });

  it('should decrement currIndex on onPrev()', () => {
    component.currIndex = 2;
    component.onPrev();
    expect(component.currIndex).toBe(1);
  });

  it('should alert and return on CSATApply() when csmIds is empty', () => {
    spyOn(window, 'alert');
    component['_cooDashboardCommon'].csmIds = [];
    component.CSATApply();
    expect(window.alert).toHaveBeenCalled();
  });

  it('should call bindCSATInputs on CSATApply() when csmIds has values', () => {
    spyOn(component, 'bindCSATInputs');
    spyOn(component['_cooDashboardCommon'], 'loadCSATInsightsInputs');
    component['_cooDashboardCommon'].csmIds = ['csm1'];
    component.CSATApply();
    expect(component.bindCSATInputs).toHaveBeenCalled();
  });

  it('should call loadRiskDashboardInputs on riskApply()', () => {
    component['_cooDashboardCommon'].customerIds = ['C1'];
    component['_cooDashboardCommon'].riskStatus = ['Open'];
    component['_cooDashboardCommon'].businessUnit = ['BU1'];
    expect(() => component.riskApply()).not.toThrow();
    expect(component.riskDashboardInputs).toBeDefined();
  });

  it('should call tosslePerOne without throwing', () => {
    expect(() => component.tosslePerOne()).not.toThrow();
  });

  it('should call tosslePerOneCSM without throwing', () => {
    expect(() => component.tosslePerOneCSM()).not.toThrow();
  });

  it('should call businessUnitTosslePerOne without throwing', () => {
    expect(() => component.businessUnitTosslePerOne()).not.toThrow();
  });

  it('should call selectedTabChange without throwing', () => {
    expect(() => component.selectedTabChange({ index: 1 })).not.toThrow();
  });
});
