import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CssdashboardCssTableComponent } from './cssdashboard-css-table.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';

describe('CssdashboardCssTableComponent', () => {
  let component: CssdashboardCssTableComponent;
  let fixture: ComponentFixture<CssdashboardCssTableComponent>;
  let mockAppService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getCSATHeatMapForPeriod: jasmine.createSpy('getCSATHeatMapForPeriod').and.returnValue(of({})),
      getSurveyDataPeriodwise: jasmine.createSpy('getSurveyDataPeriodwise').and.returnValue(of({})),
      getResponseCategoryData: jasmine.createSpy('getResponseCategoryData').and.returnValue(of({}))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError')
    };

    TestBed.configureTestingModule({
      imports: [
        CssdashboardCssTableComponent,
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
    fixture = TestBed.createComponent(CssdashboardCssTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component._loading).toBe(false);
    expect(component.selectedQuarter).toBe('Q1');
    expect(component.selectedYear).toBe(0);
    expect(component.stackLabels).toBe(true);
    expect(component.disabled).toBe(false);
  });

  it('should not call API when cssDashboardInputs is null on getCSATHeatmap1()', () => {
    component.cssDashboardInputs = null as any;
    component.getCSATHeatmap1();
    expect(mockAppService.getCSATHeatMapForPeriod).not.toHaveBeenCalled();
  });

  it('should not call API when dates are empty on getCSATHeatmap1()', () => {
    const inputs = new CssdashboardInputs();
    inputs.StarT_DATE = '';
    inputs.enD_DATE = '';
    component.cssDashboardInputs = inputs;
    component.getCSATHeatmap1();
    expect(mockAppService.getCSATHeatMapForPeriod).not.toHaveBeenCalled();
  });

  it('should call getCSATHeatMapForPeriod when dates are valid', () => {
    const inputs = new CssdashboardInputs();
    inputs.StarT_DATE = '2024-01-01';
    inputs.enD_DATE = '2024-03-31';
    inputs.csM_IDs = '-1';
    inputs.customeR_IDS = 'C1';
    component.cssDashboardInputs = inputs;
    component.getCSATHeatmap1();
    expect(mockAppService.getCSATHeatMapForPeriod).toHaveBeenCalled();
  });

  it('should set heatMapData on successful getCSATHeatmap1()', () => {
    const heatData = { rows: [] };
    mockAppService.getCSATHeatMapForPeriod.and.returnValue(of(heatData));
    const inputs = new CssdashboardInputs();
    inputs.StarT_DATE = '2024-01-01';
    inputs.enD_DATE = '2024-03-31';
    inputs.csM_IDs = '-1';
    inputs.customeR_IDS = 'C1';
    component.cssDashboardInputs = inputs;
    component.getCSATHeatmap1();
    expect(component.heatMapData).toEqual(heatData);
    expect(component._loading).toBe(false);
  });

  it('should call serviceError on getCSATHeatmap1 failure', () => {
    mockAppService.getCSATHeatMapForPeriod.and.returnValue(throwError(() => new Error('err')));
    const inputs = new CssdashboardInputs();
    inputs.StarT_DATE = '2024-01-01';
    inputs.enD_DATE = '2024-03-31';
    inputs.csM_IDs = '-1';
    inputs.customeR_IDS = 'C1';
    component.cssDashboardInputs = inputs;
    component.getCSATHeatmap1();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should not call getSurveyDataPeriodwise when dates are empty on getSurveyData1()', () => {
    const inputs = new CssdashboardInputs();
    inputs.StarT_DATE = '';
    inputs.enD_DATE = '';
    component.cssDashboardInputs = inputs;
    component.getSurveyData1();
    expect(mockAppService.getSurveyDataPeriodwise).not.toHaveBeenCalled();
  });

  it('should call getSurveyDataPeriodwise when inputs are valid on getSurveyData1()', () => {
    const inputs = new CssdashboardInputs();
    inputs.StarT_DATE = '2024-01-01';
    inputs.enD_DATE = '2024-03-31';
    component.cssDashboardInputs = inputs;
    component.getSurveyData1();
    expect(mockAppService.getSurveyDataPeriodwise).toHaveBeenCalled();
  });

  it('should call ngOnChanges without throwing', () => {
    expect(() => component.ngOnChanges()).not.toThrow();
  });

  it('should open a new window on openSurveyFeedback()', () => {
    spyOn(window, 'open');
    component.openSurveyFeedback('https://example.com');
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
  });
});
