import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { SqaManagementUploadComponent } from './sqa-management-upload.component';
import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { SqaProjectReportsModel } from '../../models/sqa-project-reports-model';

describe('SqaManagementUploadComponent', () => {
  let component: SqaManagementUploadComponent;
  let fixture: ComponentFixture<SqaManagementUploadComponent>;
  let mockUtil: any;
  let mockAppService: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError')
    };

    mockAppService = {
      GetParametersByType: jasmine.createSpy('GetParametersByType').and.returnValue(of([])),
      GetSQAReportTypes: jasmine.createSpy('GetSQAReportTypes').and.returnValue(of([])),
      GetProjectCharts: jasmine.createSpy('GetProjectCharts').and.returnValue(of([])),
      AddSQATempFile: jasmine.createSpy('AddSQATempFile').and.returnValue(of([])),
      UploadSQAReportFile: jasmine.createSpy('UploadSQAReportFile').and.returnValue(of([])),
      GetReportTypeStructure: jasmine.createSpy('GetReportTypeStructure').and.returnValue(of([])),
      UpdateReportTypeStructure: jasmine.createSpy('UpdateReportTypeStructure').and.returnValue(of([])),
      GetSQAFileStructure: jasmine.createSpy('GetSQAFileStructure').and.returnValue(of([])),
      AddSQAReportStructure: jasmine.createSpy('AddSQAReportStructure').and.returnValue(of([])),
      GetAnalyzedInsights: jasmine.createSpy('GetAnalyzedInsights').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [SqaManagementUploadComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: MyUtility, useValue: mockUtil },
        { provide: AppsService, useValue: mockAppService }
      ]
    })
    .overrideComponent(SqaManagementUploadComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqaManagementUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call LoadFieldNames on init', () => {
      expect(mockAppService.GetParametersByType).toHaveBeenCalled();
    });
  });

  describe('LoadFieldNames', () => {
    it('should call service_GetParametersByType with dataDumpType', () => {
      mockAppService.GetParametersByType.calls.reset();
      component.LoadFieldNames();
      expect(mockAppService.GetParametersByType).toHaveBeenCalledWith(component.dataDumpType);
    });
  });

  describe('LoadData', () => {
    it('should call GetSQAReportTypes and GetProjectCharts', () => {
      mockAppService.GetSQAReportTypes.calls.reset();
      mockAppService.GetProjectCharts.calls.reset();
      component.projId = 'P001';
      component.LoadData();
      expect(mockAppService.GetSQAReportTypes).toHaveBeenCalledWith('P001');
      expect(mockAppService.GetProjectCharts).toHaveBeenCalledWith('P001');
    });
  });

  describe('validateAddDump', () => {
    it('should return false when projId is empty', () => {
      component.projId = '';
      spyOn(window, 'alert');
      const result = component.validateAddDump('Report A', { files: [{}] }, 'Incident');
      expect(result).toBe(false);
    });

    it('should return false when reportType is empty', () => {
      component.projId = 'P001';
      spyOn(window, 'alert');
      const result = component.validateAddDump('', { files: [{}] }, 'Incident');
      expect(result).toBe(false);
    });

    it('should return false when dataDumpType is empty', () => {
      component.projId = 'P001';
      spyOn(window, 'alert');
      const result = component.validateAddDump('Report A', { files: [{}] }, '');
      expect(result).toBe(false);
    });

    it('should return false when no file is selected', () => {
      component.projId = 'P001';
      spyOn(window, 'alert');
      const result = component.validateAddDump('Report A', { files: [] }, 'Incident');
      expect(result).toBe(false);
    });

    it('should return true when all parameters are valid', () => {
      component.projId = 'P001';
      const result = component.validateAddDump('Report A', { files: [{}] }, 'Incident');
      expect(result).toBe(true);
    });
  });

  describe('validateSave', () => {
    it('should return false when projId is empty', () => {
      component.projId = '';
      spyOn(window, 'alert');
      const result = component.validateSave('Report A', { files: [{}] });
      expect(result).toBe(false);
    });

    it('should return false when reportType is empty', () => {
      component.projId = 'P001';
      spyOn(window, 'alert');
      const result = component.validateSave('', { files: [{}] });
      expect(result).toBe(false);
    });

    it('should return false when no file is selected', () => {
      component.projId = 'P001';
      spyOn(window, 'alert');
      const result = component.validateSave('Report A', { files: [] });
      expect(result).toBe(false);
    });

    it('should return true when all parameters are valid', () => {
      component.projId = 'P001';
      const result = component.validateSave('Report A', { files: [{}] });
      expect(result).toBe(true);
    });
  });

  describe('AddNewDataDump', () => {
    it('should set IsToggleView to false', () => {
      component.IsToggleView = true;
      component.AddNewDataDump();
      expect(component.IsToggleView).toBe(false);
    });
  });

  describe('CancelSavingNewDataDump', () => {
    it('should set IsToggleView to true', () => {
      component.IsToggleView = false;
      component.CancelSavingNewDataDump();
      expect(component.IsToggleView).toBe(true);
    });
  });

  describe('SaveNewDataDump', () => {
    it('should not add report type when projId is empty', () => {
      component.projId = '';
      spyOn(window, 'alert');
      const initialCount = component.reportTypes.length;
      component.SaveNewDataDump();
      expect(component.reportTypes.length).toBe(initialCount);
    });

    it('should add new report type to the beginning of reportTypes list', () => {
      component.projId = 'P001';
      component.NewDataDump = 'My New Report';
      component.reportTypes = [];
      component.SaveNewDataDump();
      expect(component.reportTypes.length).toBe(1);
      expect(component.reportTypes[0].datA_DUMP_NAME).toBe('My New Report');
    });

    it('should set IsToggleView to true after saving', () => {
      component.projId = 'P001';
      component.NewDataDump = 'New Report';
      component.SaveNewDataDump();
      expect(component.IsToggleView).toBe(true);
    });

    it('should clear NewDataDump after saving', () => {
      component.projId = 'P001';
      component.NewDataDump = 'New Report';
      component.SaveNewDataDump();
      expect(component.NewDataDump).toBe('');
    });
  });

  describe('UploadNewFile_onClick', () => {
    it('should not call service_AddFile when validation fails', () => {
      component.projId = '';
      spyOn(window, 'alert');
      component.UploadNewFile_onClick({ files: [] });
      expect(mockAppService.AddSQATempFile).not.toHaveBeenCalled();
    });
  });

  describe('UploadFile_onClick', () => {
    it('should alert when selectedReportType is undefined', () => {
      component.selectedReportType = undefined as any;
      spyOn(window, 'alert');
      component.UploadFile_onClick({ files: [] });
      expect(window.alert).toHaveBeenCalled();
    });

    it('should not call UploadSQAReportFile when validation fails', () => {
      component.selectedReportType = new SqaProjectReportsModel();
      component.projId = '';
      spyOn(window, 'alert');
      component.UploadFile_onClick({ files: [] });
      expect(mockAppService.UploadSQAReportFile).not.toHaveBeenCalled();
    });
  });

  describe('project_onChange', () => {
    it('should parse JSON event and set custId and projId', () => {
      const event = JSON.stringify({ customer: ['C001'], project: ['P001'] });
      component.project_onChange(event);
      expect(component.custId).toBe('C001');
      expect(component.projId).toBe('P001');
    });

    it('should call LoadData after project change', () => {
      spyOn(component, 'LoadData');
      const event = JSON.stringify({ customer: ['C001'], project: ['P001'] });
      component.project_onChange(event);
      expect(component.LoadData).toHaveBeenCalled();
    });
  });

  describe('service_GetParametersByType', () => {
    it('should populate ddChartFields from parameters on success', () => {
      const mockParams = [{ options: 'Field A' }, { options: 'Field B' }];
      mockAppService.GetParametersByType.and.returnValue(of(mockParams));
      component.service_GetParametersByType('Incident');
      expect(component.ddChartFields).toContain('Field A');
      expect(component.ddChartFields[0]).toBe('');
    });

    it('should call serviceError on failure', () => {
      mockAppService.GetParametersByType.and.returnValue(throwError(() => new Error('error')));
      component.service_GetParametersByType('Incident');
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

    it('should call serviceError on failure', () => {
      mockAppService.GetSQAReportTypes.and.returnValue(throwError(() => new Error('error')));
      component.service_GetSQAReportTypes('P001');
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
