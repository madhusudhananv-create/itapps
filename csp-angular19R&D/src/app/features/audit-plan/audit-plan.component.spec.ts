import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { AuditPlanComponent } from './audit-plan.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { ProcessModelService } from '../process-model/process-model.service';
import { TaskService } from '../task/task.service';

describe('AuditPlanComponent', () => {
  let component: AuditPlanComponent;
  let fixture: ComponentFixture<AuditPlanComponent>;

  const mockAppsService = {
    GetTaskTypes: jasmine.createSpy('GetTaskTypes').and.returnValue(of([])),
    GetTaskGroups: jasmine.createSpy('GetTaskGroups').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError')
  };

  const mockProcessModelService = {
    stepper: null
  };

  const mockTaskService = {
    selectedTask: undefined
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AuditPlanComponent],
      providers: [
        provideHttpClient(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: ProcessModelService, useValue: mockProcessModelService },
        { provide: TaskService, useValue: mockTaskService }
      ]
    })
    .overrideComponent(AuditPlanComponent, {
      set: {
        imports: [],
        template: '<div></div>'
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise allCust and allProj to false', () => {
    expect(component.allCust).toBeFalsy();
    expect(component.allProj).toBeFalsy();
  });

  it('selectedTask getter should return undefined when no task in service', () => {
    expect(component.selectedTask).toBeUndefined();
  });
});
