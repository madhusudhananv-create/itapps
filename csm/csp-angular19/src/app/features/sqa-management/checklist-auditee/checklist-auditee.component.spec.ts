import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ChecklistAuditeeComponent } from './checklist-auditee.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { provideHttpClient } from '@angular/common/http';

describe('ChecklistAuditeeComponent', () => {
  let component: ChecklistAuditeeComponent;
  let fixture: ComponentFixture<ChecklistAuditeeComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showWarning: jasmine.createSpy('showWarning'),
      setLocaleDate: jasmine.createSpy('setLocaleDate').and.callFake((d: any) => d),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      })
    };

    mockAppService = {
      getAllAuditeeResponses: jasmine.createSpy('getAllAuditeeResponses').and.returnValue(of([])),
      getStageColor: jasmine.createSpy('getStageColor').and.returnValue(of([])),
      getProjectSpocsByProjId: jasmine.createSpy('getProjectSpocsByProjId').and.returnValue(of([])),
      saveAuditeeAcceptanceStatus: jasmine.createSpy('saveAuditeeAcceptanceStatus').and.returnValue(of({})),
      getProjectResourceByProjId: jasmine.createSpy('getProjectResourceByProjId').and.returnValue(of([])),
      getAuditCauses: jasmine.createSpy('getAuditCauses').and.returnValue(of([])),
      getFindingStatus: jasmine.createSpy('getFindingStatus').and.returnValue(of({})),
      addFindingCAP: jasmine.createSpy('addFindingCAP').and.returnValue(of({})),
      addFindingCAPReviewDetails: jasmine.createSpy('addFindingCAPReviewDetails').and.returnValue(of({})),
      addFindingCAPImplementationDetails: jasmine.createSpy('addFindingCAPImplementationDetails').and.returnValue(of({})),
      addFindingCAPVerificationDetails: jasmine.createSpy('addFindingCAPVerificationDetails').and.returnValue(of({})),
      getAuditeeDetails: jasmine.createSpy('getAuditeeDetails').and.returnValue(of([]))
    };

    mockAccess = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };

    TestBed.configureTestingModule({
      imports: [ChecklistAuditeeComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistAuditeeComponent);
    component = fixture.componentInstance;
    component.checklistSummaryRec = { assessmenT_ID: 1, projecT_ID: 'P001', cusT_ID: 'C001' };
    component.checkListData = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getAllAuditeeResponses on init', () => {
      expect(mockAppService.getAllAuditeeResponses).toHaveBeenCalledWith(1);
    });
  });

  describe('selectAll', () => {
    it('should initialize selectAll to false', () => {
      expect(component.selectAll).toBe(false);
    });
  });

  describe('viewCAPA', () => {
    it('should initialize viewCAPA to false', () => {
      expect(component.viewCAPA).toBe(false);
    });
  });

  describe('disableAcceptReject', () => {
    it('should initialize disableAcceptReject to false', () => {
      expect(component.disableAcceptReject).toBe(false);
    });
  });
});
