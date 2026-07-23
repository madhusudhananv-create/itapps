import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { TaskPlannerComponent } from './task-planner.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { TaskService } from '../../task/task.service';

describe('TaskPlannerComponent', () => {
  let component: TaskPlannerComponent;
  let fixture: ComponentFixture<TaskPlannerComponent>;

  const mockAppsService = {
    GetTaskTypes: jasmine.createSpy('GetTaskTypes').and.returnValue(of([])),
    GetTaskCategories: jasmine.createSpy('GetTaskCategories').and.returnValue(of([])),
    GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([])),
    GetProjectsByCustomer: jasmine.createSpy('GetProjectsByCustomer').and.returnValue(of([])),
    GetAllCustomerProjectsName: jasmine.createSpy('GetAllCustomerProjectsName').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError'),
    Month: jasmine.createSpy('Month').and.returnValue('Jan'),
    MonthCurrNum: jasmine.createSpy('MonthCurrNum').and.returnValue(1),
    Year: jasmine.createSpy('Year').and.returnValue(2024),
    Years: jasmine.createSpy('Years').and.returnValue([2022, 2023, 2024]),
    getQuarter: jasmine.createSpy('getQuarter').and.returnValue('Q1'),
    getmonthsBasedonYear: jasmine.createSpy('getmonthsBasedonYear').and.returnValue([]),
    AppSettings: { token: 'test-token', empid: '', displayname: '', role: '' }
  };

  const mockTaskService = {
    selectedTask: undefined,
    bProgress: false,
    taskGroups: { projects: [] },
    plannedAuditsCount: 0,
    GetTaskTypeList: jasmine.createSpy('GetTaskTypeList').and.returnValue(of([])),
    GetTaskCategoryListByTaskType: jasmine.createSpy('GetTaskCategoryListByTaskType').and.returnValue(of([])),
    GetTaskDetailsByDateRange: jasmine.createSpy('GetTaskDetailsByDateRange').and.returnValue(of([])),
    filterAuditCategories: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaskPlannerComponent],
      providers: [
        provideHttpClient(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: TaskService, useValue: mockTaskService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise default property values', () => {
    expect(component.selectedTaskType).toBe(0);
    expect(component.bShowSummary).toBeFalsy();
    expect(component.selectedPeriod).toBe('Yearly');
    expect(component.custIds).toBe('-1');
    expect(component.bShowDateSelection1).toBeFalsy();
    expect(component.bShowDateSelection2).toBeFalsy();
    expect(component.bShowKPIDetails).toBeFalsy();
    expect(component.selectedQuarter).toBe('Q1');
  });

  it('should initialise arrays as empty', () => {
    expect(component.TaskTypeList.length).toBeGreaterThanOrEqual(1); // 'All' entry added by ngOnInit
    expect(component.TaskCategoryList).toEqual([]);
    expect(component.ProjectList).toEqual([]);
    expect(component.CustomerList).toEqual([]);
    expect(component.selectedTaskCategory).toEqual([]);
    expect(component.selectedProject).toEqual([]);
    expect(component.selectedCustomer).toEqual([]);
  });

  it('should set currentYear based on fiscal year logic', () => {
    const now = new Date();
    const expectedYear = now.getMonth() < 4 ? now.getFullYear() - 1 : now.getFullYear();
    expect(component.currentYear).toBe(expectedYear);
  });
});
