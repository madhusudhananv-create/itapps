import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SetupChecklistNewComponent } from './setup-checklist-new.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('SetupChecklistNewComponent', () => {
  let component: SetupChecklistNewComponent;
  let fixture: ComponentFixture<SetupChecklistNewComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess')
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) })
    };

    mockAppService = {
      getProcessModel: jasmine.createSpy('getProcessModel').and.returnValue(of([])),
      getMaturityLevel: jasmine.createSpy('getMaturityLevel').and.returnValue(of([])),
      getChecklistList: jasmine.createSpy('getChecklistList').and.returnValue(of([])),
      getAuditStatusList: jasmine.createSpy('getAuditStatusList').and.returnValue(of([])),
      getChecklistApproversList: jasmine.createSpy('getChecklistApproversList').and.returnValue(of([])),
      getAuditStatusListExisting: jasmine.createSpy('getAuditStatusListExisting').and.returnValue(of([])),
      getFindingsTypeList: jasmine.createSpy('getFindingsTypeList').and.returnValue(of({ findingsType: [], findingTypeValues: [] })),
      getWeightageForAllChecklist: jasmine.createSpy('getWeightageForAllChecklist').and.returnValue(of([])),
      getWeightage: jasmine.createSpy('getWeightage').and.returnValue(of([])),
      getWeightageForChecklist: jasmine.createSpy('getWeightageForChecklist').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [SetupChecklistNewComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupChecklistNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call Service_GetProcessModelList on init', () => {
      expect(mockAppService.getProcessModel).toHaveBeenCalled();
    });

    it('should call Service_GetMaturiryLevel on init', () => {
      expect(mockAppService.getMaturityLevel).toHaveBeenCalled();
    });

    it('should call service_getChecklistList on init', () => {
      expect(mockAppService.getChecklistList).toHaveBeenCalled();
    });

    it('should call Service_GetAuditStatusList on init', () => {
      expect(mockAppService.getAuditStatusList).toHaveBeenCalled();
    });

    it('should call Service_getFindingsTypeList on init', () => {
      expect(mockAppService.getFindingsTypeList).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize bAddNewChecklist to false', () => {
      expect(component.bAddNewChecklist).toBe(false);
    });

    it('should initialize showAddCategory to false', () => {
      expect(component.showAddCategory).toBe(false);
    });

    it('should initialize isSaved to true', () => {
      expect(component.isSaved).toBe(true);
    });

    it('should initialize selectedChoice to 2', () => {
      expect(component.selectedChoice).toBe(2);
    });

    it('should initialize ProcessModelList as empty array', () => {
      expect(component.ProcessModelList).toEqual([]);
    });

    it('should have displayedColumns defined', () => {
      expect(component.displayedColumns).toContain('title');
      expect(component.displayedColumns).toContain('version');
    });
  });

  describe('selectversion', () => {
    it('should set result to entire checklistList when selectedChoice is 1', () => {
      component.checklistList = [
        { id: 1, title: 'CL1', version: '1.0', effectivE_FROM: new Date() } as any,
        { id: 2, title: 'CL1', version: '2.0', effectivE_FROM: new Date() } as any
      ];
      component.selectedChoice = 1;
      component.selectversion();
      expect(component.result.length).toBe(2);
    });

    it('should show only latest version per title when selectedChoice is 2', () => {
      component.checklistList = [
        { id: 1, title: 'CL1', version: '1.0', effectivE_FROM: new Date() } as any,
        { id: 2, title: 'CL1', version: '2.0', effectivE_FROM: new Date() } as any
      ];
      component.selectedChoice = 2;
      component.selectversion();
      expect(component.result.length).toBe(1);
    });
  });

  describe('btnAddNewStatusList', () => {
    it('should toggle showStatusList', () => {
      component.showStatusList = false;
      component.btnAddNewStatusList();
      expect(component.showStatusList).toBe(true);
    });

    it('should add initial row to metStatusValues if empty', () => {
      component.metStatusValues = [];
      component.btnAddNewStatusList();
      expect(component.metStatusValues.length).toBe(1);
    });
  });

  describe('Service_GetProcessModelList', () => {
    it('should populate ProcessModelList on success', () => {
      mockAppService.getProcessModel.and.returnValue(of([{ id: 1, title: 'PM1' }]));
      component.Service_GetProcessModelList();
      expect(component.ProcessModelList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getProcessModel.and.returnValue(throwError(() => new Error('error')));
      component.Service_GetProcessModelList();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
