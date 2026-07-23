import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

import { TaskComponent } from './task.component';
import { TaskService } from './task.service';
import { MyUtility } from '../../shared/my-utility';
import { ProcessModelService } from '../process-model/process-model.service';
import { LayoutService } from '../layout/layout.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { AppsService } from '../../core/services/apps.service';
import { TaskModel, AuditScheduleModel } from '../../core/models/task-model';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let mockTaskService: any;
  let mockUtil: any;
  let mockProcessService: any;
  let mockLayoutService: any;
  let mockAccess: any;
  let mockAppService: any;
  let mockMediaQueryList: any;
  let mockMediaMatcher: any;

  beforeEach(waitForAsync(() => {
    mockMediaQueryList = {
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
      matches: false
    };

    mockMediaMatcher = {
      matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccessPopup: jasmine.createSpy('showSuccessPopup'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({ afterClosed: () => of(false) }),
      IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
      Month: jasmine.createSpy('Month').and.returnValue(1),
      Year: jasmine.createSpy('Year').and.returnValue(2024),
      MonthCurrNum: jasmine.createSpy('MonthCurrNum').and.returnValue(1),
      getQuarter: jasmine.createSpy('getQuarter').and.returnValue(1),
      getmonthsBasedonYear: jasmine.createSpy('getmonthsBasedonYear').and.returnValue([]),
      AppSettings: { token: 'test-token', empid: '', displayname: '', role: '' }
    };

    mockTaskService = {
      GetTaskTypeList: jasmine.createSpy('GetTaskTypeList').and.returnValue(of([])),
      GetTaskCategoryList: jasmine.createSpy('GetTaskCategoryList').and.returnValue(of([])),
      GetTaskCategoryListByTaskType: jasmine.createSpy('GetTaskCategoryListByTaskType').and.returnValue(of([])),
      GetTaskDetails: jasmine.createSpy('GetTaskDetails').and.returnValue(of([])),
      GetTaskDetailsByDateRange: jasmine.createSpy('GetTaskDetailsByDateRange').and.returnValue(of([])),
      GetTaskDetailById: jasmine.createSpy('GetTaskDetailById').and.returnValue(of({})),
      GetEventListByCategory: jasmine.createSpy('GetEventListByCategory'),
      GetAuditScheduleByTaskId: jasmine.createSpy('GetAuditScheduleByTaskId').and.returnValue(of({})),
      LoadServiceAreaProjectMapping: jasmine.createSpy('LoadServiceAreaProjectMapping'),
      isAuditTask: jasmine.createSpy('isAuditTask').and.returnValue(false),
      getTaskDetails: jasmine.createSpy('getTaskDetails'),
      addTask: jasmine.createSpy('addTask').and.returnValue(of({})),
      TaskTypeList: [],
      TaskCategoryList: [],
      selectedTask: new TaskModel(),
      auditSchedule: new AuditScheduleModel(),
      stepper: { selectedIndex: 0 },
      plannedAuditsCount: 0,
      params: {},
      filterAuditCategories: false
    };

    mockProcessService = {
      stepper: { selectedIndex: 0 }
    };

    mockLayoutService = {
      selectedCust: ''
    };

    mockAccess = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false),
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true)
    };

    mockAppService = {
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
      GetAllCustomerProjectsName: jasmine.createSpy('GetAllCustomerProjectsName').and.returnValue(of([])),
      getEmpNameById: jasmine.createSpy('getEmpNameById').and.returnValue(of('')),
      getProjectsByEmpId: jasmine.createSpy('getProjectsByEmpId').and.returnValue(of([])),
      getCustomerDetails: jasmine.createSpy('getCustomerDetails').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getServiceAreaProjectMapping: jasmine.createSpy('getServiceAreaProjectMapping').and.returnValue(of([])),
      getServiceTowersProjectMapping: jasmine.createSpy('getServiceTowersProjectMapping').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: ProcessModelService, useValue: mockProcessService },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: AccessControlService, useValue: mockAccess },
        { provide: AppsService, useValue: mockAppService },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        provideRouter([]),
        provideHttpClient(),
        provideNativeDateAdapter(),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ custid: 'C001' }) }
        },
        ChangeDetectorRef
      ]
    })
    .overrideComponent(TaskComponent, {
      set: {
        imports: [],
        template: '<div></div>'
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call service_GetTaskTypeList on init', () => {
      expect(mockTaskService.GetTaskTypeList).toHaveBeenCalled();
    });

    it('should call service_GetTaskCategoryList on init', () => {
      expect(mockTaskService.GetTaskCategoryList).toHaveBeenCalled();
    });

    it('should set custid from route params', () => {
      expect(component.custid).toBe('C001');
    });
  });

  describe('initial state', () => {
    it('should initialize allCust to false', () => {
      expect(component.allCust).toBe(false);
    });

    it('should initialize allProj to false', () => {
      expect(component.allProj).toBe(false);
    });

    it('should initialize menuToggleStatus to false', () => {
      expect(component.menuToggleStatus).toBe(false);
    });
  });

  describe('tabChange', () => {
    it('should reset stepper to index 0 on tab 0', () => {
      component.tabChange({ index: 0 });
      expect(mockProcessService.stepper.selectedIndex).toBe(0);
    });

    it('should reset selectedTask and auditSchedule on tab 1', () => {
      component.tabChange({ index: 1 });
      expect(mockTaskService.selectedTask).toBeInstanceOf(TaskModel);
      expect(mockTaskService.auditSchedule).toBeInstanceOf(AuditScheduleModel);
    });
  });

  describe('onMenuToggleChange', () => {
    it('should update menuToggleStatus', () => {
      component.onMenuToggleChange(true);
      expect(component.menuToggleStatus).toBe(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove mobileQuery listener on destroy', () => {
      component.ngOnDestroy();
      expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
    });
  });
});
