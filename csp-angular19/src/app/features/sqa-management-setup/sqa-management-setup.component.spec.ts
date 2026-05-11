import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SqaManagementSetupComponent } from './sqa-management-setup.component';
import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { SqaChartParamsWithFilterModel, SqaProjectReportsModel, SqaChartFilterModel } from '../../models/sqa-project-reports-model';
import { provideHttpClient } from '@angular/common/http';

describe('SqaManagementSetupComponent', () => {
  let component: SqaManagementSetupComponent;
  let fixture: ComponentFixture<SqaManagementSetupComponent>;
  let mockUtil: any;
  let mockAppService: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      }),
      CopyObject: jasmine.createSpy('CopyObject').and.callFake((o: any) => JSON.parse(JSON.stringify(o))),
      IsQuality: jasmine.createSpy('IsQuality').and.returnValue(true)
    };

    mockAppService = {
      GetParametersByTypes: jasmine.createSpy('GetParametersByTypes').and.returnValue(of([])),
      GetSQAReportTypes: jasmine.createSpy('GetSQAReportTypes').and.returnValue(of([])),
      GetProjectCharts: jasmine.createSpy('GetProjectCharts').and.returnValue(of([])),
      GetSQAProjectChart: jasmine.createSpy('GetSQAProjectChart').and.returnValue(of({})),
      AddSQAProjectChart: jasmine.createSpy('AddSQAProjectChart').and.returnValue(of({})),
      UpdateSQAProjectChart: jasmine.createSpy('UpdateSQAProjectChart').and.returnValue(of({})),
      DeleteSQAProjectChart: jasmine.createSpy('DeleteSQAProjectChart').and.returnValue(of({})),
      DeleteSQAChartFilter: jasmine.createSpy('DeleteSQAChartFilter').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [SqaManagementSetupComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: AppsService, useValue: mockAppService },
        provideHttpClient()
      ]
    })
    .overrideComponent(SqaManagementSetupComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqaManagementSetupComponent);
    component = fixture.componentInstance;
    component.projId = 'P001';
    component.custId = 'C001';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call LoadData on init', () => {
      expect(mockAppService.GetParametersByTypes).toHaveBeenCalled();
      expect(mockAppService.GetSQAReportTypes).toHaveBeenCalled();
      expect(mockAppService.GetProjectCharts).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should reset reportTypes and call LoadData on input change', () => {
      component.reportTypes = [new SqaProjectReportsModel()];
      component.ngOnChanges();
      expect(component.reportTypes.length).toBe(0);
      expect(mockAppService.GetSQAReportTypes).toHaveBeenCalled();
    });
  });

  describe('LoadData', () => {
    it('should call service_GetParametersByTypes, service_GetSQAReportTypes, and service_GetProjectCharts', () => {
      mockAppService.GetParametersByTypes.calls.reset();
      mockAppService.GetSQAReportTypes.calls.reset();
      mockAppService.GetProjectCharts.calls.reset();
      component.LoadData();
      expect(mockAppService.GetParametersByTypes).toHaveBeenCalled();
      expect(mockAppService.GetSQAReportTypes).toHaveBeenCalled();
      expect(mockAppService.GetProjectCharts).toHaveBeenCalled();
    });
  });

  describe('EditRow_onClick', () => {
    it('should deep-copy chart into selectedParams', () => {
      const chart = new SqaChartParamsWithFilterModel();
      chart.id = 10;
      chart.filters = [];
      component.reportTypes = [{ id: 5, datA_DUMP_ID: 5 } as any];
      chart.datA_DUMP_ID = 5;
      component.EditRow_onClick(chart);
      expect(component.selectedParams.id).toBe(10);
    });

    it('should add a default filter when filters array is empty', () => {
      const chart = new SqaChartParamsWithFilterModel();
      chart.id = 10;
      chart.filters = [];
      component.reportTypes = [];
      component.EditRow_onClick(chart);
      expect(component.selectedParams.filters.length).toBe(1);
    });
  });

  describe('SaveRow_onClick', () => {
    it('should call service_UpdateProjectChart when IDs match and validation passes', () => {
      const chart = new SqaChartParamsWithFilterModel();
      chart.id = 1;
      chart.charT_TYPE = 'Bar';
      component.selectedParams = JSON.parse(JSON.stringify(chart));
      component.selectedReportType = { id: 5, datA_DUMP_NAME: 'Dump1' } as any;
      component.projId = 'P001';
      component.SaveRow_onClick(chart);
      expect(mockAppService.UpdateSQAProjectChart).toHaveBeenCalled();
    });

    it('should not call service_UpdateProjectChart when IDs do not match', () => {
      const chart = new SqaChartParamsWithFilterModel();
      chart.id = 99;
      component.selectedParams.id = 1;
      spyOn(window, 'alert');
      component.SaveRow_onClick(chart);
      expect(mockAppService.UpdateSQAProjectChart).not.toHaveBeenCalled();
    });
  });

  describe('DeleteRow_onClick', () => {
    it('should call service_DeleteProjectChart after confirmation', () => {
      const chart = new SqaChartParamsWithFilterModel();
      chart.id = 1;
      component.DeleteRow_onClick(chart);
      expect(mockAppService.DeleteSQAProjectChart).toHaveBeenCalled();
    });
  });

  describe('AddFilter_onClick', () => {
    it('should add a new filter to selectedParams.filters', () => {
      component.selectedParams.filters = [];
      component.AddFilter_onClick();
      expect(component.selectedParams.filters.length).toBe(1);
    });

    it('should increment filters count on each call', () => {
      component.selectedParams.filters = [];
      component.AddFilter_onClick();
      component.AddFilter_onClick();
      expect(component.selectedParams.filters.length).toBe(2);
    });
  });

  describe('RemoveFilter_onClick', () => {
    it('should remove the filter from selectedParams.filters', () => {
      const filter = new SqaChartFilterModel();
      component.selectedParams.filters = [filter];
      component.RemoveFilter_onClick(filter);
      expect(component.selectedParams.filters.length).toBe(0);
    });

    it('should call service_DeleteFilter after removal', () => {
      const filter = new SqaChartFilterModel();
      component.selectedParams.filters = [filter];
      component.RemoveFilter_onClick(filter);
      expect(mockAppService.DeleteSQAChartFilter).toHaveBeenCalled();
    });
  });

  describe('GenerateChart_onClick', () => {
    it('should call service_GetSQAProjectChart when validation passes', () => {
      component.projId = 'P001';
      component.selectedReportType = { id: 5, datA_DUMP_NAME: 'Dump1' } as any;
      component.selectedParams.charT_TYPE = 'Bar';
      component.GenerateChart_onClick();
      expect(mockAppService.GetSQAProjectChart).toHaveBeenCalled();
    });

    it('should not call service_GetSQAProjectChart when projId is empty', () => {
      component.projId = '';
      spyOn(window, 'alert');
      component.GenerateChart_onClick();
      expect(mockAppService.GetSQAProjectChart).not.toHaveBeenCalled();
    });
  });

  describe('AddToProject_onClick', () => {
    it('should call service_AddSQAProjectChart when validation passes', () => {
      component.projId = 'P001';
      component.custId = 'C001';
      component.selectedReportType = { id: 5, datA_DUMP_NAME: 'Dump1', datA_DUMP_TYPE: 'Incident' } as any;
      component.selectedParams.charT_TYPE = 'Line';
      component.AddToProject_onClick();
      expect(mockAppService.AddSQAProjectChart).toHaveBeenCalled();
    });
  });

  describe('validateReportGenerate', () => {
    it('should return false when projId is empty', () => {
      component.projId = '';
      spyOn(window, 'alert');
      expect(component.validateReportGenerate()).toBe(false);
    });

    it('should return false when selectedReportType name is empty', () => {
      component.projId = 'P001';
      component.selectedReportType = { datA_DUMP_NAME: '' } as any;
      spyOn(window, 'alert');
      expect(component.validateReportGenerate()).toBe(false);
    });

    it('should return false when charT_TYPE is empty', () => {
      component.projId = 'P001';
      component.selectedReportType = { id: 5, datA_DUMP_NAME: 'Dump1' } as any;
      component.selectedParams.charT_TYPE = '';
      spyOn(window, 'alert');
      expect(component.validateReportGenerate()).toBe(false);
    });

    it('should return true when all required values are set', () => {
      component.projId = 'P001';
      component.selectedReportType = { id: 5, datA_DUMP_NAME: 'Dump1' } as any;
      component.selectedParams.charT_TYPE = 'Bar';
      expect(component.validateReportGenerate()).toBe(true);
    });
  });

  describe('getProjectCharts', () => {
    it('should return only PROJECT charts', () => {
      component.projectCharts = [
        { id: 1, charT_USER: 'PROJECT' } as any,
        { id: 2, charT_USER: 'SYSTEM' } as any,
        { id: 3, charT_USER: 'PROJECT' } as any
      ];
      const result = component.getProjectCharts();
      expect(result.length).toBe(2);
      expect(result.every((c: any) => c.charT_USER === 'PROJECT')).toBe(true);
    });
  });

  describe('getSystemCharts', () => {
    it('should return only SYSTEM charts', () => {
      component.projectCharts = [
        { id: 1, charT_USER: 'PROJECT' } as any,
        { id: 2, charT_USER: 'SYSTEM' } as any
      ];
      const result = component.getSystemCharts();
      expect(result.length).toBe(1);
      expect(result[0].charT_USER).toBe('SYSTEM');
    });
  });

  describe('service_GetProjectCharts', () => {
    it('should populate projectCharts on success', () => {
      const mockCharts = [{ id: 1, charT_USER: 'PROJECT' }];
      mockAppService.GetProjectCharts.and.returnValue(of(mockCharts));
      component.service_GetProjectCharts('P001');
      expect(component.projectCharts.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.GetProjectCharts.and.returnValue(throwError(() => new Error('error')));
      component.service_GetProjectCharts('P001');
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('service_GetSQAReportTypes', () => {
    it('should populate reportTypes on success', () => {
      const mockTypes = [{ id: 1, datA_DUMP_NAME: 'Type A' }];
      mockAppService.GetSQAReportTypes.and.returnValue(of(mockTypes));
      component.service_GetSQAReportTypes('P001');
      expect(component.reportTypes.length).toBe(1);
    });

    it('should reset selectedReportType on success', () => {
      mockAppService.GetSQAReportTypes.and.returnValue(of([]));
      component.service_GetSQAReportTypes('P001');
      expect(component.selectedReportType.datA_DUMP_NAME).toBe('');
    });

    it('should call serviceError on failure', () => {
      mockAppService.GetSQAReportTypes.and.returnValue(throwError(() => new Error('error')));
      component.service_GetSQAReportTypes('P001');
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
