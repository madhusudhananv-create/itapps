import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CssdashboardNextPage1Component } from './cssdashboard-next-page1.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';

describe('CssdashboardNextPage1Component', () => {
  let component: CssdashboardNextPage1Component;
  let fixture: ComponentFixture<CssdashboardNextPage1Component>;
  let mockAppService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getSurveyDataPeriodwise: jasmine.createSpy('getSurveyDataPeriodwise').and.returnValue(of({})),
      getResponseCategoryData: jasmine.createSpy('getResponseCategoryData').and.returnValue(of({}))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError')
    };

    TestBed.configureTestingModule({
      imports: [
        CssdashboardNextPage1Component,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssdashboardNextPage1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component._loading).toBe(false);
    expect(component.allCust).toBe(false);
    expect(component.selectedQuarter).toBe('Q1');
    expect(component.stackLabels).toBe(true);
  });

  it('should call getSurveyData1 and getNPSTrendDataInPercentage on ngOnChanges()', () => {
    spyOn(component, 'getSurveyData1');
    spyOn(component, 'getNPSTrendDataInPercentage');
    component.ngOnChanges();
    expect(component.getSurveyData1).toHaveBeenCalled();
    expect(component.getNPSTrendDataInPercentage).toHaveBeenCalled();
  });

  it('should not call API when customerList has no customeR_IDS on getSurveyData1()', () => {
    component.customerList = undefined as any;
    component.getSurveyData1();
    expect(mockAppService.getSurveyDataPeriodwise).not.toHaveBeenCalled();
  });

  it('should call getSurveyDataPeriodwise when customerList.customeR_IDS is set', () => {
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getSurveyData1();
    expect(mockAppService.getSurveyDataPeriodwise).toHaveBeenCalled();
  });

  it('should set surveyData on successful getSurveyData1()', () => {
    const data = { series: [] };
    mockAppService.getSurveyDataPeriodwise.and.returnValue(of(data));
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getSurveyData1();
    expect(component.surveyData).toBeDefined();
    expect(component._loading).toBe(false);
  });

  it('should call serviceError on getSurveyData1 failure', () => {
    mockAppService.getSurveyDataPeriodwise.and.returnValue(throwError(() => new Error('err')));
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getSurveyData1();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should not call API when customerList is undefined on getNPSTrendDataInPercentage()', () => {
    component.customerList = undefined as any;
    component.getNPSTrendDataInPercentage();
    expect(mockAppService.getResponseCategoryData).not.toHaveBeenCalled();
  });

  it('should call getResponseCategoryData when customerList.customeR_IDS is set', () => {
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getNPSTrendDataInPercentage();
    expect(mockAppService.getResponseCategoryData).toHaveBeenCalled();
  });

  it('should set trendChartDataNPSInPercentage on success', () => {
    const data = { series: [] };
    mockAppService.getResponseCategoryData.and.returnValue(of(data));
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getNPSTrendDataInPercentage();
    expect(component.trendChartDataNPSInPercentage).toBeDefined();
    expect(component._loading).toBe(false);
  });

  it('should call serviceError on getNPSTrendDataInPercentage failure', () => {
    mockAppService.getResponseCategoryData.and.returnValue(throwError(() => new Error('err')));
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getNPSTrendDataInPercentage();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });
});
