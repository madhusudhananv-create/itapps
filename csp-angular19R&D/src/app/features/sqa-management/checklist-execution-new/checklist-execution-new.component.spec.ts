import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ChecklistExecutionNewComponent } from './checklist-execution-new.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { AssessmentUtility } from '../../../shared/assessment-utility';

describe('ChecklistExecutionNewComponent', () => {
  let component: ChecklistExecutionNewComponent;
  let fixture: ComponentFixture<ChecklistExecutionNewComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockAssessmentUtil: any;
  let mockRouter: any;
  let mockRoute: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showWarning: jasmine.createSpy('showWarning'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser'),
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true),
      AppSettings: { token: 'test-token' }
    };

    mockAppService = {
      getCustomerListByEmpId: jasmine.createSpy('getCustomerListByEmpId').and.returnValue(of([])),
      getDropDownParams: jasmine.createSpy('getDropDownParams').and.returnValue(of({ auditoR_LIST: [], tesT_RESULTS: [], statuS_CONTROLS: [], impactinG_ATTRIBUTES: [] })),
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
      getPlannedAuditsForExecution: jasmine.createSpy('getPlannedAuditsForExecution').and.returnValue(of([])),
      getChecklistList: jasmine.createSpy('getChecklistList').and.returnValue(of([])),
      saveAssessment: jasmine.createSpy('saveAssessment').and.returnValue(of({})),
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([]))
    };

    mockAccess = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false),
      CheckValidAccess: jasmine.createSpy('CheckValidAccess')
    };

    mockAssessmentUtil = {
      getScore: jasmine.createSpy('getScore').and.returnValue(0)
    };

    mockRouter = { navigate: jasmine.createSpy('navigate'), navigateByUrl: jasmine.createSpy('navigateByUrl') };

    mockRoute = {
      params: of({}),
      snapshot: { url: { toString: () => '' } }
    };

    TestBed.configureTestingModule({
      imports: [ChecklistExecutionNewComponent, HttpClientTestingModule],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: AssessmentUtility, useValue: mockAssessmentUtil },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: {} }
      ]
    }).overrideComponent(ChecklistExecutionNewComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistExecutionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize custId as empty string', () => {
      expect(component.custId).toBe('');
    });

    it('should initialize projId as empty string', () => {
      expect(component.projId).toBe('');
    });

    it('should initialize IsSubmitted to false', () => {
      expect(component.IsSubmitted).toBe(false);
    });

    it('should initialize checkListData as empty array', () => {
      expect(component.checkListData).toEqual([]);
    });

    it('should initialize plannedAudits as empty array', () => {
      expect(component.plannedAudits).toEqual([]);
    });
  });

  describe('dialog mode (qaSummaryData is null)', () => {
    it('should have qaSummaryData as null when MAT_DIALOG_DATA is null', () => {
      expect(component.qaSummaryData).toBeNull();
    });
  });

  describe('allcust / allproj flags', () => {
    it('should set allcust and allproj based on access control', () => {
      // When IsAllowed returns false, both should be false
      expect(component.allcust).toBe(false);
      expect(component.allproj).toBe(false);
    });
  });
});
