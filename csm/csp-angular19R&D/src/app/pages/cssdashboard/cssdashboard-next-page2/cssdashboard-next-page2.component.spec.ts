import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CssdashboardNextPage2Component } from './cssdashboard-next-page2.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';

describe('CssdashboardNextPage2Component', () => {
  let component: CssdashboardNextPage2Component;
  let fixture: ComponentFixture<CssdashboardNextPage2Component>;
  let mockAppService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getQuestionWiseRatingForCSATInsight: jasmine.createSpy('getQuestionWiseRatingForCSATInsight').and.returnValue(of([]))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError')
    };

    TestBed.configureTestingModule({
      imports: [
        CssdashboardNextPage2Component,
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
    fixture = TestBed.createComponent(CssdashboardNextPage2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component._loading).toBe(false);
    expect(component.allCust).toBe(false);
    expect(component.showTrendData).toBe(false);
    expect(component.stackLabels).toBe(true);
    expect(component.disabled).toBe(false);
  });

  it('should set showTrendData=true when trendQuarter=2 on ngOnChanges()', () => {
    component.trendQuarter = 2;
    component.fromDate = new Date('2024-01-01');
    component.toDate = new Date('2024-03-31');
    component.customerIds = 'C1';
    component.ngOnChanges();
    expect(component.showTrendData).toBe(true);
  });

  it('should set showTrendData=false when trendQuarter!=2 on ngOnChanges()', () => {
    component.trendQuarter = 1;
    component.fromDate = new Date('2024-01-01');
    component.toDate = new Date('2024-03-31');
    component.customerIds = 'C1';
    component.ngOnChanges();
    expect(component.showTrendData).toBe(false);
  });

  it('should build customerList in bindCSATInputs() from inputs', () => {
    component.fromDate = new Date('2024-01-01');
    component.toDate = new Date('2024-03-31');
    component.customerIds = 'C1';
    component.frequency = 'Both';
    component.bindCSATInputs();
    expect(component.customerList).toBeDefined();
    expect(component.customerList.customeR_IDS).toBe('C1');
    expect(component.customerList.frequency).toBe('Both');
  });

  it('should not build customerList when fromDate or toDate is missing', () => {
    component.fromDate = undefined;
    component.toDate = undefined;
    component.bindCSATInputs();
    expect(component.customerList).toBeUndefined();
  });

  it('should not call API when customerList is undefined on getSurveyQuestions()', () => {
    component.customerList = undefined as any;
    component.getSurveyQuestions(false);
    expect(mockAppService.getQuestionWiseRatingForCSATInsight).not.toHaveBeenCalled();
  });

  it('should call getQuestionWiseRatingForCSATInsight when customerList is set', () => {
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getSurveyQuestions(false);
    expect(mockAppService.getQuestionWiseRatingForCSATInsight).toHaveBeenCalledWith(inputs, false);
  });

  it('should set surveyQuestions on successful getSurveyQuestions()', () => {
    const data = [{ id: 1, question: 'Q1' }];
    mockAppService.getQuestionWiseRatingForCSATInsight.and.returnValue(of(data));
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getSurveyQuestions(false);
    expect(component.surveyQuestions).toEqual(data);
    expect(component._loading).toBe(false);
  });

  it('should call serviceError on getSurveyQuestions failure', () => {
    mockAppService.getQuestionWiseRatingForCSATInsight.and.returnValue(throwError(() => new Error('err')));
    const inputs = new CssdashboardInputs();
    inputs.customeR_IDS = 'C1';
    component.customerList = inputs;
    component.getSurveyQuestions(false);
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should call getSurveyQuestions on loadTrendWiseData()', () => {
    spyOn(component, 'getSurveyQuestions');
    component.loadTrendWiseData({ checked: true });
    expect(component.getSurveyQuestions).toHaveBeenCalledWith(true);
  });
});
