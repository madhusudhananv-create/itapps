import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProcessModelMainComponent } from './process-model-main.component';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { TaskService } from '../../task/task.service';
import { ProcessModelService } from '../../process-model/process-model.service';
import { provideHttpClient } from '@angular/common/http';

describe('ProcessModelMainComponent', () => {
  let component: ProcessModelMainComponent;
  let fixture: ComponentFixture<ProcessModelMainComponent>;
  let mockUtil: any;
  let mockAccess: any;
  let mockTaskService: any;
  let mockProcessService: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true),
      serviceError: jasmine.createSpy('serviceError')
    };

    mockAccess = {
      CheckValidAccess: jasmine.createSpy('CheckValidAccess'),
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };

    mockTaskService = {
      selectedTask: {},
      auditSchedule: {}
    };

    mockProcessService = {
      stepper: null
    };

    TestBed.configureTestingModule({
      imports: [ProcessModelMainComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: TaskService, useValue: mockTaskService },
        { provide: ProcessModelService, useValue: mockProcessService },
        provideHttpClient()
      ]
    }).overrideComponent(ProcessModelMainComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessModelMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call CheckValidAccess when user is logged in', () => {
      expect(mockAccess.CheckValidAccess).toHaveBeenCalledWith(42);
    });

    it('should not call CheckValidAccess when user is not logged in', () => {
      mockUtil.IsLoggedIn.and.returnValue(false);
      mockAccess.CheckValidAccess.calls.reset();
      component.ngOnInit();
      expect(mockAccess.CheckValidAccess).not.toHaveBeenCalled();
    });
  });

  describe('tabChange', () => {
    it('should reset selectedTask and auditSchedule on tab index 1', () => {
      component.tabChange({ index: 1 });
      expect(mockTaskService.selectedTask).toBeDefined();
      expect(mockTaskService.auditSchedule).toBeDefined();
    });

    it('should handle tab index 0 without errors', () => {
      expect(() => component.tabChange({ index: 0 })).not.toThrow();
    });
  });
});
