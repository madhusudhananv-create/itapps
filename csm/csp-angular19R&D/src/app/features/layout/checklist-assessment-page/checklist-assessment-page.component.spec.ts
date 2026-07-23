import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, BehaviorSubject, of, throwError } from 'rxjs';

import { ChecklistAssessmentPageComponent } from './checklist-assessment-page.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { AssessmentUtility } from '../../../shared/assessment-utility';
import { LayoutService } from '../layout.service';

const mockProjNames = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta' }
];

const mockPlannedAudits = [
  { id: 1, status: 'OPEN', title: 'Audit 1', iS_CHECKED: false },
  { id: 2, status: 'COMPLETED', title: 'Audit 2', iS_CHECKED: false }
];

const mockCCList = [
  { emP_ID: 'E001', frsT_NM: 'Alice', isselected: false },
  { emP_ID: 'E002', frsT_NM: 'Bob', isselected: false }
];

const mockDropdownData = {
  auditoR_LIST: [{ id: 'A1', name: 'Auditor 1' }],
  servicE_AREA: [{ id: 1, name: 'SQA' }],
  procesS_SERVICE_AREA_NEW: [{ id: 1, name: 'IMS' }]
};

const mockChecklistData = [
  {
    checklisT_ID: 10, mappeD_CHECKLIST: true, weightagE_APPLICABLE_FLAG: true,
    correctivE_ACTION_TRACKING: false, findingtypE_VALUES: [],
    maturitY_LEVEL_APPLICABLE: false, pM_MATURITYLEVEL_MAPPINGS: [],
    auditeE_NAMES: ['E001'], cC_LIST: ['E001'], tO_LIST: ['E002'],
    versioN_ID: 1, checklisT_STATUS_LIST_VALUES: [{ id: 1, statuS_CATEGORY: 'MET', multiplier: '1' }],
    checkpointS_BY_SERVICE_AREA: [],
    audiT_CHECKLIST_EXECUTION_SUMMARY: {
      id: 0, score: 85, percentagE_SCORE: 85, updateD_SCORE: 85, updateD_PERCENTAGE_SCORE: 85,
      planneD_AUDIT_START_DATE: null, planneD_AUDIT_END_DATE: null,
      actuaL_AUDIT_START_DATE: null, actuaL_AUDIT_END_DATE: null,
      auditoR_ID: 'A1', auditeE_LIST: []
    }
  }
];

describe('ChecklistAssessmentPageComponent', () => {
  let component: ChecklistAssessmentPageComponent;
  let fixture: ComponentFixture<ChecklistAssessmentPageComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockAssessmentUtil: any;
  let mockLayoutService: any;
  let mockDialog: any;
  let mockRouter: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new BehaviorSubject<any>({ custid: 'C001' });

    mockAppsService = {
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjNames)),
      getPlannedAudits: jasmine.createSpy('getPlannedAudits').and.returnValue(of(mockPlannedAudits)),
      getOpenFindingsCount: jasmine.createSpy('getOpenFindingsCount').and.returnValue(of([])),
      getCCListForChecklist: jasmine.createSpy('getCCListForChecklist').and.returnValue(of(mockCCList)),
      getAuditeeDetails: jasmine.createSpy('getAuditeeDetails').and.returnValue(of([])),
      getCheckListDataForProjNew: jasmine.createSpy('getCheckListDataForProjNew').and.returnValue(of(mockChecklistData)),
      SaveAuditChecklistDetails: jasmine.createSpy('SaveAuditChecklistDetails').and.returnValue(of({
        audiT_CHECKLIST_BY_SERVICE_AREA_LIST: [],
        audiT_CHECKLIST_EXECUTION_SUMMARY: mockChecklistData[0].audiT_CHECKLIST_EXECUTION_SUMMARY
      })),
      enableChecklistStatus: jasmine.createSpy('enableChecklistStatus').and.returnValue(of([]))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarningPopup: jasmine.createSpy('showWarningPopup'),
      showSuccessPopup: jasmine.createSpy('showSuccessPopup'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue(of(true)),
      getFindingsCount: jasmine.createSpy('getFindingsCount').and.returnValue(0),
      AppSettings: { token: 'test-token' }
    };

    mockAccessControl = {};

    mockAssessmentUtil = {
      getServiceAreaScore: jasmine.createSpy().and.returnValue(0),
      getServiceAreaMaxScore: jasmine.createSpy().and.returnValue(0),
      getServiceAreaPercentage: jasmine.createSpy().and.returnValue(0),
      getServiceAreaUpdatedScore: jasmine.createSpy().and.returnValue(0),
      getServiceAreaUpdatedPercentage: jasmine.createSpy().and.returnValue(0),
      getServiceAreaMaturityLevel: jasmine.createSpy().and.returnValue(''),
      getProcessModelScore: jasmine.createSpy().and.returnValue(0),
      getProcessModelMaxScore: jasmine.createSpy().and.returnValue(0),
      getProcessModelPercentage: jasmine.createSpy().and.returnValue(0),
      getProcessModelUpdatedScore: jasmine.createSpy().and.returnValue(0),
      getProcessModelUpdatedPercentage: jasmine.createSpy().and.returnValue(0),
      getProcessModelMaturityLevel: jasmine.createSpy().and.returnValue(''),
      getProcessAreaScore: jasmine.createSpy().and.returnValue(0),
      getProcessAreaMaxScore: jasmine.createSpy().and.returnValue(0),
      getProcessAreaPercentage: jasmine.createSpy().and.returnValue(0),
      getProcessAreaUpdatedScore: jasmine.createSpy().and.returnValue(0),
      getProcessAreaUpdatedercentage: jasmine.createSpy().and.returnValue(0),
      getProcessAreaMaturityLevel: jasmine.createSpy().and.returnValue(''),
      getProcessScore: jasmine.createSpy().and.returnValue(0),
      getProcessMaxScore: jasmine.createSpy().and.returnValue(0),
      getProcessPercentage: jasmine.createSpy().and.returnValue(0),
      getProcessUpdatedScore: jasmine.createSpy().and.returnValue(0),
      getProcessUpdatedPercentage: jasmine.createSpy().and.returnValue(0)
    };

    mockLayoutService = {
      selectedCust: ''
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) })
    };

    mockRouter = { navigate: jasmine.createSpy('navigate') };

    TestBed.configureTestingModule({
      imports: [ChecklistAssessmentPageComponent, HttpClientTestingModule, MatDialogModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: AssessmentUtility, useValue: mockAssessmentUtil },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistAssessmentPageComponent);
    component = fixture.componentInstance;
    localStorage.setItem('role', '5');
  });

  afterEach(() => {
    localStorage.removeItem('role');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set input_customerid from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.input_customerid).toBe('C001');
    });

    it('should set layoutService.selectedCust from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should set allproj=true for Quality role', () => {
      localStorage.setItem('role', '6');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
      localStorage.setItem('role', '5');
    });

    it('should call getAllProjectsFromCustomer on init', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.GetCustomerProjectsName).toHaveBeenCalled();
    });
  });

  // ─── getAllProjectsFromCustomer ────────────────────────────────────────────

  describe('getAllProjectsFromCustomer', () => {
    it('should populate projNames from service', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.projNames.length).toBe(2);
    });

    it('should set filteredProjects from response', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.filteredProjects.length).toBe(2);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── Service_GetPlannedAudits ─────────────────────────────────────────────

  describe('Service_GetPlannedAudits', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should populate plannedAudits filtering out COMPLETED', () => {
      component.Service_GetPlannedAudits('C001', 'P001');
      expect(component.plannedAudits.length).toBe(1);
      expect(component.plannedAudits[0].status).toBe('OPEN');
    });

    it('should populate originalPlannedAudits with all records', () => {
      component.Service_GetPlannedAudits('C001', 'P001');
      expect(component.originalPlannedAudits.length).toBe(2);
    });

    it('should set isLoading=false after load', () => {
      component.Service_GetPlannedAudits('C001', 'P001');
      expect(component.isLoading).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getPlannedAudits.and.returnValue(throwError(() => new Error('fail')));
      component.Service_GetPlannedAudits('C001', 'P001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });

    it('should call getOpenFindingsCount with audit IDs', () => {
      component.Service_GetPlannedAudits('C001', 'P001');
      expect(mockAppsService.getOpenFindingsCount).toHaveBeenCalledWith('1,2');
    });
  });

  // ─── filterList ───────────────────────────────────────────────────────────

  describe('filterList', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.originalPlannedAudits = [...mockPlannedAudits];
    });

    it('should show all audits when completed=true', () => {
      component.completed = true;
      component.filterList();
      expect(component.plannedAudits.length).toBe(2);
    });

    it('should hide COMPLETED audits when completed=false', () => {
      component.completed = false;
      component.filterList();
      expect(component.plannedAudits.length).toBe(1);
    });
  });

  // ─── onProjectChange ──────────────────────────────────────────────────────

  describe('onProjectChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      mockLayoutService.selectedCust = 'C001';
      component.input_projectid = 'P001';
    });

    it('should call getCCList when projId is set', () => {
      component.onProjectChange();
      expect(mockAppsService.getCCListForChecklist).toHaveBeenCalled();
    });

    it('should call getEmployeeListFromproject', () => {
      component.onProjectChange();
      expect(mockAppsService.getAuditeeDetails).toHaveBeenCalled();
    });

    it('should call Service_GetPlannedAudits', () => {
      component.onProjectChange();
      expect(mockAppsService.getPlannedAudits).toHaveBeenCalled();
    });

    it('should reset IsSubmitted to false', () => {
      component.IsSubmitted = true;
      component.onProjectChange();
      expect(component.IsSubmitted).toBe(false);
    });
  });

  // ─── clearAll ─────────────────────────────────────────────────────────────

  describe('clearAll', () => {
    it('should reset all date and selection fields', () => {
      fixture.detectChanges();
      component.startDate = new Date();
      component.endDate = new Date();
      component.selectedAuditor = 'A1';
      component.clearAll();
      expect(component.startDate).toBeNull();
      expect(component.endDate).toBeNull();
      expect(component.selectedAuditor).toBe('');
      expect(component.checkListDataNew.length).toBe(0);
    });
  });

  // ─── getCCList ────────────────────────────────────────────────────────────

  describe('getCCList', () => {
    it('should populate cclist, tolist and originalCCList', () => {
      fixture.detectChanges();
      component.custId = 'C001';
      component.getCCList();
      expect(component.cclist.length).toBe(2);
      expect(component.tolist.length).toBe(2);
      expect(component.originalCCList.length).toBe(2);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getCCListForChecklist.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.custId = 'C001';
      component.getCCList();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── filterCCEmployees / filterToEmployees / filterProjects ───────────────

  describe('filterCCEmployees', () => {
    it('should filter cclist by searchCCValue', () => {
      fixture.detectChanges();
      component.originalCCList = mockCCList as any;
      component.cclist = [...mockCCList] as any;
      component.searchCCValue = 'alice';
      component.filterCCEmployees();
      expect(component.cclist.length).toBe(1);
      expect(component.cclist[0].frsT_NM).toBe('Alice');
    });
  });

  describe('filterToEmployees', () => {
    it('should filter tolist by searchToValue', () => {
      fixture.detectChanges();
      component.originalCCList = mockCCList as any;
      component.searchToValue = 'bob';
      component.filterToEmployees();
      expect(component.tolist.length).toBe(1);
    });
  });

  describe('filterProjects', () => {
    it('should filter projNames by searchProjectValue', () => {
      fixture.detectChanges();
      component.projNames = [...mockProjNames];
      component.searchProjectValue = 'alpha';
      component.filterProjects();
      expect(component.filteredProjects.length).toBe(1);
      expect(component.filteredProjects[0].proJ_NM).toBe('Project Alpha');
    });
  });

  // ─── getOpenFindingsCount ─────────────────────────────────────────────────

  describe('getOpenFindingsCount', () => {
    it('should populate findings array', () => {
      fixture.detectChanges();
      mockAppsService.getOpenFindingsCount.and.returnValue(of([{ id: 1, count: 3 }]));
      component.plannedAudits = [...mockPlannedAudits];
      component.getOpenFindingsCount('1,2');
      expect(component.findings.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      fixture.detectChanges();
      mockAppsService.getOpenFindingsCount.and.returnValue(throwError(() => new Error('fail')));
      component.getOpenFindingsCount('1');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getFindingsCount helpers ─────────────────────────────────────────────

  describe('getFindingsCount', () => {
    it('should call util.getFindingsCount with type "total"', () => {
      fixture.detectChanges();
      component.getFindingsCount(1);
      expect(mockMyUtility.getFindingsCount).toHaveBeenCalledWith(component.findings, 1, 'total');
    });
  });

  describe('getOpenFindingCount', () => {
    it('should call util.getFindingsCount with type "open"', () => {
      fixture.detectChanges();
      component.getOpenFindingCount(1);
      expect(mockMyUtility.getFindingsCount).toHaveBeenCalledWith(component.findings, 1, 'open');
    });
  });

  describe('getClosedFindingsCount', () => {
    it('should call util.getFindingsCount with type "closed"', () => {
      fixture.detectChanges();
      component.getClosedFindingsCount(1);
      expect(mockMyUtility.getFindingsCount).toHaveBeenCalledWith(component.findings, 1, 'closed');
    });
  });

  // ─── validateAllQuestions ─────────────────────────────────────────────────

  describe('validateAllQuestions', () => {
    it('should return true when checkListDataNew is empty', () => {
      fixture.detectChanges();
      component.checkListDataNew = [];
      expect(component.validateAllQuestions()).toBe(true);
    });

    it('should return false when a checkpoint has no status', () => {
      fixture.detectChanges();
      component.checkListDataNew = [{
        checkpointS_BY_PROCESS_MODEL: [{
          checkpointS_BY_PROCESS_AREA: [{
            checkpointS_BY_PROCESS: [{
              checkpoints: [{ statuS_VALUE_ID: 0 }]
            }]
          }]
        }]
      }] as any;
      expect(component.validateAllQuestions()).toBe(false);
    });
  });

  // ─── checkIfAny1MandatoryFindingentered ───────────────────────────────────

  describe('checkIfAny1MandatoryFindingentered', () => {
    it('should return true when mandatory finding has description', () => {
      fixture.detectChanges();
      const findings = [{ findinG_CATEGORY: 'MANDATORY', findinG_DESCRIPTION: 'Issue found' }] as any;
      expect(component.checkIfAny1MandatoryFindingentered(findings)).toBe(true);
    });

    it('should return false when mandatory finding has no description', () => {
      fixture.detectChanges();
      const findings = [{ findinG_CATEGORY: 'MANDATORY', findinG_DESCRIPTION: '' }] as any;
      expect(component.checkIfAny1MandatoryFindingentered(findings)).toBe(false);
    });
  });

  // ─── setOpened / setClosed ────────────────────────────────────────────────

  describe('setOpened / setClosed', () => {
    it('should set isDisplayText=false on setOpened', () => {
      fixture.detectChanges();
      component.setOpened();
      expect(component.isDisplayText).toBe(false);
    });

    it('should set isDisplayText=true on setClosed', () => {
      fixture.detectChanges();
      component.isDisplayText = false;
      component.setClosed();
      expect(component.isDisplayText).toBe(true);
    });
  });

  // ─── getversion ───────────────────────────────────────────────────────────

  describe('getversion', () => {
    it('should return parsed float version', () => {
      fixture.detectChanges();
      expect(component.getversion(2)).toBe(2);
    });
  });

  // ─── checkEveryQuestion / uncheckEveryQuestion ────────────────────────────

  describe('checkEveryQuestion', () => {
    it('should mark all checkpoints as submitted', () => {
      fixture.detectChanges();
      const data: any[] = [{
        checkpointS_BY_PROCESS_MODEL: [{
          checkpointS_BY_PROCESS_AREA: [{
            checkpointS_BY_PROCESS: [{
              checkpoints: [{ issubmitted: false }]
            }]
          }]
        }]
      }];
      component.checkEveryQuestion(data);
      expect(data[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints[0].issubmitted).toBe(true);
    });
  });

  describe('uncheckEveryQuestion', () => {
    it('should mark all checkpoints as not submitted', () => {
      fixture.detectChanges();
      const data: any[] = [{
        checkpointS_BY_PROCESS_MODEL: [{
          checkpointS_BY_PROCESS_AREA: [{
            checkpointS_BY_PROCESS: [{
              checkpoints: [{ issubmitted: true }]
            }]
          }]
        }]
      }];
      component.uncheckEveryQuestion(data);
      expect(data[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints[0].issubmitted).toBe(false);
    });
  });

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe route param subscription', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      spyOn(component.sub, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.sub.unsubscribe).toHaveBeenCalled();
    });
  });
});
