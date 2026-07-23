import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ObjectiveUserComponent } from './objective-user.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { provideHttpClient } from '@angular/common/http';

describe('ObjectiveUserComponent', () => {
  let component: ObjectiveUserComponent;
  let fixture: ComponentFixture<ObjectiveUserComponent>;
  let mockAppService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser')
    };

    mockAppService = {
      getProcessList: jasmine.createSpy('getProcessList').and.returnValue(of([])),
      getProcessAreaList: jasmine.createSpy('getProcessAreaList').and.returnValue(of([])),
      getProcessModelList: jasmine.createSpy('getProcessModelList').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getProcessModelProcessMapping: jasmine.createSpy('getProcessModelProcessMapping').and.returnValue(of([])),
      getServiceAreaProcessMapping: jasmine.createSpy('getServiceAreaProcessMapping').and.returnValue(of([])),
      getObjectivesProcessMapping: jasmine.createSpy('getObjectivesProcessMapping').and.returnValue(of([])),
      getObjectivesList: jasmine.createSpy('getObjectivesList').and.returnValue(of([])),
      addObjective: jasmine.createSpy('addObjective').and.returnValue(of({})),
      updateObjective: jasmine.createSpy('updateObjective').and.returnValue(of({})),
      deleteObjective: jasmine.createSpy('deleteObjective').and.returnValue(of({})),
      getProcessModel: jasmine.createSpy('getProcessModel').and.returnValue(of([])),
      GetAllProcessProcessModelMapping: jasmine.createSpy('GetAllProcessProcessModelMapping').and.returnValue(of([])),
      getAllProcessObjectiveMapping: jasmine.createSpy('getAllProcessObjectiveMapping').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ObjectiveUserComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    }).overrideComponent(ObjectiveUserComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectiveUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call Service_GetProcessList on init', () => {
      expect(mockAppService.getProcessList).toHaveBeenCalled();
    });

    it('should call Service_GetProcessAreaList on init', () => {
      expect(mockAppService.getProcessAreaList).toHaveBeenCalled();
    });

    it('should call Service_GetProcessModelList on init', () => {
      expect(mockAppService.getProcessModel).toHaveBeenCalled();
    });

    it('should call Service_GetServiceAreaList on init', () => {
      expect(mockAppService.getServiceAreaList).toHaveBeenCalled();
    });
  });

  describe('bAddNewObjective', () => {
    it('should initialize bAddNewObjective to false', () => {
      expect(component.bAddNewObjective).toBe(false);
    });

    it('should set bAddNewObjective to true when btnAddObjective_Onclick called', () => {
      component.btnAddObjective_Onclick();
      expect(component.bAddNewObjective).toBe(true);
    });

    it('should set bAddNewObjective to false when btnCancelObjective_Onclick called', () => {
      component.bAddNewObjective = true;
      component.btnCancelObjective_Onclick();
      expect(component.bAddNewObjective).toBe(false);
    });
  });

  describe('Service_GetServiceAreaList', () => {
    it('should populate ServiceAreaList on success', () => {
      mockAppService.getServiceAreaList.and.returnValue(of([{ id: 1, title: 'SA A' }]));
      component.Service_GetServiceAreaList();
      expect(component.ServiceAreaList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getServiceAreaList.and.returnValue(throwError(() => new Error('error')));
      component.Service_GetServiceAreaList();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
