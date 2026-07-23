import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TaskAddComponent } from './task-add.component';
import { TaskService } from '../task/task.service';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { TaskModel, AuditScheduleModel } from '../../core/models/task-model';

describe('TaskAddComponent', () => {
  let component: TaskAddComponent;
  let fixture: ComponentFixture<TaskAddComponent>;
  let mockTaskService: any;
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
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    mockTaskService = {
      GetTaskTypeList: jasmine.createSpy('GetTaskTypeList').and.returnValue(of([])),
      GetTaskCategoryListByTaskType: jasmine.createSpy('GetTaskCategoryListByTaskType').and.returnValue(of([])),
      GetTaskCategoryList: jasmine.createSpy('GetTaskCategoryList').and.returnValue(of([])),
      Service_GetServiceAreaProjectMapping: jasmine.createSpy('Service_GetServiceAreaProjectMapping'),
      addTask: jasmine.createSpy('addTask').and.returnValue(of({})),
      selectedTask: new TaskModel(),
      auditSchedule: new AuditScheduleModel(),
      TaskTypeList: [],
      TaskCategoryList: []
    };

    mockAppService = {
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
      getEmpNameById: jasmine.createSpy('getEmpNameById').and.returnValue(of('Test User')),
      getTaskTypeList: jasmine.createSpy('getTaskTypeList').and.returnValue(of([])),
      getTaskCategoryListByTaskType: jasmine.createSpy('getTaskCategoryListByTaskType').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [TaskAddComponent],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient()
      ]
    })
    .overrideComponent(TaskAddComponent, {
      set: {
        imports: [],
        template: '<div></div>'
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize isSubmit to true', () => {
      expect(component.isSubmit).toBe(true);
    });

    it('should initialize isLoading to false', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should initialize showMoreDetails to false', () => {
      expect(component.showMoreDetails).toBe(false);
    });

    it('should initialize allProj to true', () => {
      expect(component.allProj).toBe(true);
    });

    it('should have priority options defined', () => {
      expect(component.priority.length).toBe(3);
      expect(component.priority[0].value).toBe('HIGH');
    });

    it('should have statusOptions defined', () => {
      expect(component.statusOptions.length).toBe(5);
      expect(component.statusOptions[0].value).toBe('PLANNED');
    });

    it('should have Weeks defined', () => {
      expect(component.Weeks.length).toBe(5);
    });

    it('should have Months defined', () => {
      expect(component.Months.length).toBe(12);
    });
  });

  describe('selectedTask getter', () => {
    it('should return the task from taskService', () => {
      expect(component.selectedTask).toBe(mockTaskService.selectedTask);
    });
  });
});
