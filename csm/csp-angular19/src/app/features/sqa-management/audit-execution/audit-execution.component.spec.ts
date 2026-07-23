import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { AuditExecutionComponent, AuditExecutionModel } from './audit-execution.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

describe('AuditExecutionComponent', () => {
  let component: AuditExecutionComponent;
  let fixture: ComponentFixture<AuditExecutionComponent>;
  let mockAppService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      })
    };

    mockAppService = {
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getDropDownParams: jasmine.createSpy('getDropDownParams').and.returnValue(of({
        auditoR_LIST: [], tesT_RESULTS: [], statuS_CONTROLS: ['Implemented', 'Not Implemented', 'Partially Implemented', 'Not Applicable'],
        impactinG_ATTRIBUTES: [], risK_SEVERITY: []
      })),
      getAuditeesByProjId: jasmine.createSpy('getAuditeesByProjId').and.returnValue(of([])),
      Service_GetPlannedAudits: jasmine.createSpy('Service_GetPlannedAudits').and.returnValue(of([])),
      getAuditAssesment: jasmine.createSpy('getAuditAssesment').and.returnValue(of({ testS_VIEW_MODELS: [], audiT_DATA: [] })),
      saveAuditExecData: jasmine.createSpy('saveAuditExecData').and.returnValue(of([])),
      sendReportToAuditee: jasmine.createSpy('sendReportToAuditee').and.returnValue(of({})),
      getAuditDropDownData: jasmine.createSpy('getAuditDropDownData').and.returnValue(of({
        auditoR_LIST: [], tesT_RESULTS: [], statuS_CONTROLS: ['Implemented','Not Implemented','Partially Implemented','Not Applicable'],
        impactinG_ATTRIBUTES: [], risK_SEVERITY: []
      })),
      getDropDownParamsForAudit: jasmine.createSpy('getDropDownParamsForAudit').and.returnValue(of({
        auditoR_LIST: [], tesT_RESULTS: [], statuS_CONTROLS: ['Implemented','Not Implemented','Partially Implemented','Not Applicable'],
        impactinG_ATTRIBUTES: [], risK_SEVERITY: []
      }))
    };

    TestBed.configureTestingModule({
      imports: [AuditExecutionComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    }).overrideComponent(AuditExecutionComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call Service_GetServiceAreaList on init', () => {
      expect(mockAppService.getServiceAreaList).toHaveBeenCalled();
    });

    it('should call getDropDownParams on init', () => {
      expect(mockAppService.getDropDownParamsForAudit).toHaveBeenCalled();
    });
  });

  describe('showSideDiv', () => {
    it('should set index and showSideStructure to true', () => {
      component.showSideDiv(3);
      expect(component.index).toBe(3);
      expect(component.showSideStructure).toBe(true);
    });
  });

  describe('CloseEditMode_OnClick', () => {
    it('should set showSideStructure to false', () => {
      component.showSideStructure = true;
      component.CloseEditMode_OnClick();
      expect(component.showSideStructure).toBe(false);
    });
  });

  describe('getSeverity', () => {
    beforeEach(() => {
      component.ddData = {
        statuS_CONTROLS: ['Implemented', 'Not Implemented', 'Partially Implemented', 'Not Applicable'],
        auditoR_LIST: [], tesT_RESULTS: [], impactinG_ATTRIBUTES: [], risK_SEVERITY: []
      };
    });

    it('should set severity to High for Not Implemented', () => {
      const audit: AuditExecutionModel = { statuS_OF_CONTROL: 'Not Implemented' };
      component.getSeverity(audit);
      expect(audit.severity).toBe('High');
      expect(audit.findinG_TYPE).toBe('noncompliantmajor');
    });

    it('should set severity to Low for Implemented', () => {
      const audit: AuditExecutionModel = { statuS_OF_CONTROL: 'Implemented' };
      component.getSeverity(audit);
      expect(audit.severity).toBe('Low');
      expect(audit.findinG_TYPE).toBe('compliant');
    });

    it('should set severity to Critical for Not Applicable', () => {
      const audit: AuditExecutionModel = { statuS_OF_CONTROL: 'Not Applicable' };
      component.getSeverity(audit);
      expect(audit.severity).toBe('Critical');
    });

    it('should set severity to Medium for other values', () => {
      const audit: AuditExecutionModel = { statuS_OF_CONTROL: 'Unknown' };
      component.getSeverity(audit);
      expect(audit.severity).toBe('Medium');
      expect(audit.findinG_TYPE).toBe('noncompliantminor');
    });
  });

  describe('changeTestResult', () => {
    it('should set tesT_RESULT to Passed for Implemented', () => {
      const audit: AuditExecutionModel = { statuS_OF_CONTROL: 'Implemented' };
      component.changeTestResult(audit);
      expect(audit.tesT_RESULT).toBe('Passed');
    });

    it('should set tesT_RESULT to Passed for Partially Implemented', () => {
      const audit: AuditExecutionModel = { statuS_OF_CONTROL: 'Partially Implemented' };
      component.changeTestResult(audit);
      expect(audit.tesT_RESULT).toBe('Passed');
    });

    it('should set tesT_RESULT to Failed for Not Implemented', () => {
      const audit: AuditExecutionModel = { statuS_OF_CONTROL: 'Not Implemented' };
      component.changeTestResult(audit);
      expect(audit.tesT_RESULT).toBe('Failed');
    });

    it('should set tesT_RESULT to Pending for Not Yet', () => {
      const audit: AuditExecutionModel = { statuS_OF_CONTROL: 'Not Yet' };
      component.changeTestResult(audit);
      expect(audit.tesT_RESULT).toBe('Pending');
    });
  });

  describe('checkIsValid', () => {
    it('should return true when isevaluated is false', () => {
      const audit: AuditExecutionModel = { isevaluated: false };
      expect(component.checkIsValid(audit)).toBe(true);
    });

    it('should return false when isevaluated is true but fields missing', () => {
      const audit: AuditExecutionModel = { isevaluated: true, audiT_START_DATE: null };
      expect(component.checkIsValid(audit)).toBe(false);
    });

    it('should return true when isevaluated and all required fields are set', () => {
      component.auditDataTitle = 'Test Audit';
      const audit: AuditExecutionModel = {
        isevaluated: true,
        audiT_START_DATE: new Date(),
        audiT_END_DATE: new Date(),
        findinG_TYPE: 'compliant',
        tesT_RESULT: 'Passed',
        statuS_OF_CONTROL: 'Implemented',
        resulT_DESCRIPTION: 'All good'
      };
      expect(component.checkIsValid(audit)).toBe(true);
    });
  });

  describe('filterTests', () => {
    beforeEach(() => {
      component.originaltests = [
        { id: 1, title: 'T1', description: 'D1', status: 'open' },
        { id: 2, title: 'T2', description: 'D2', status: 'closed' }
      ];
      component.tests = [...component.originaltests];
      component.auditData = [
        { tesT_ID: 1, tesT_RESULT: 'Evaluated', statuS_OF_CONTROL: 'Implemented' }
      ];
    });

    it('should return all tests when filter is All', () => {
      component.selectedTestFilter = 'All';
      component.filterTests();
      expect(component.tests.length).toBe(2);
    });

    it('should filter tests when filter is not All', () => {
      component.selectedTestFilter = 'Evaluated';
      component.filterTests();
      expect(component.tests.length).toBe(1);
    });
  });

  describe('Service_GetServiceAreaList', () => {
    it('should populate serviceAreaList on success', () => {
      mockAppService.getServiceAreaList.and.returnValue(of([{ id: 1, title: 'SA1' }]));
      component.Service_GetServiceAreaList();
      expect(component.serviceAreaList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getServiceAreaList.and.returnValue(throwError(() => new Error('error')));
      component.Service_GetServiceAreaList();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('getCustProjInfo', () => {
    it('should parse event and set custId and projId', () => {
      const event = JSON.stringify({ customer: 'C001', project: 'P001' });
      component.getCustProjInfo(event);
      expect(component.custId).toBe('C001');
      expect(component.projId).toBe('P001');
    });

    it('should reset audit state on project change', () => {
      const event = JSON.stringify({ customer: 'C001', project: 'P001' });
      component.showAuditInputs = true;
      component.auditData = [{ id: 1 }];
      component.getCustProjInfo(event);
      expect(component.showAuditInputs).toBe(false);
      expect(component.auditData.length).toBe(0);
    });
  });
});
