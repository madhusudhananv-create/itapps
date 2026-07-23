import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProcessServiceAreaMappingComponent } from './process-service-area-mapping.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { provideHttpClient } from '@angular/common/http';

describe('ProcessServiceAreaMappingComponent', () => {
  let component: ProcessServiceAreaMappingComponent;
  let fixture: ComponentFixture<ProcessServiceAreaMappingComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser')
    };

    mockAccess = {
      CheckValidAccess: jasmine.createSpy('CheckValidAccess').and.returnValue(true),
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true)
    };

    mockAppService = {
      getProcessAreaList: jasmine.createSpy('getProcessAreaList').and.returnValue(of([])),
      getMappedProcessListByServiceArea: jasmine.createSpy('getMappedProcessListByServiceArea').and.returnValue(of([])),
      getProcessList: jasmine.createSpy('getProcessList').and.returnValue(of([])),
      getProcessModelList: jasmine.createSpy('getProcessModelList').and.returnValue(of([])),
      getServiceAreaProcessMapping: jasmine.createSpy('getServiceAreaProcessMapping').and.returnValue(of([])),
      getAllProcessModelReferenceList: jasmine.createSpy('getAllProcessModelReferenceList').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getAllProcessListByServiceArea: jasmine.createSpy('getAllProcessListByServiceArea').and.returnValue(of([])),
      getProcessModel: jasmine.createSpy('getProcessModel').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ProcessServiceAreaMappingComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        provideHttpClient()
      ]
    }).overrideComponent(ProcessServiceAreaMappingComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessServiceAreaMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call Service_GetProcessAreaList on init', () => {
      expect(mockAppService.getProcessAreaList).toHaveBeenCalled();
    });

    it('should call Service_GetProcessList on init', () => {
      expect(mockAppService.getProcessList).toHaveBeenCalled();
    });

    it('should call Service_GetProcessModelList on init', () => {
      expect(mockAppService.getProcessModel).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize isServiceAreaMapped to true', () => {
      expect(component.isServiceAreaMapped).toBe(true);
    });

    it('should initialize bAddNewServiceArea to false', () => {
      expect(component.bAddNewServiceArea).toBe(false);
    });

    it('should initialize showServiceAreaTable to false', () => {
      expect(component.showServiceAreaTable).toBe(false);
    });

    it('should initialize view input to true', () => {
      expect(component.view).toBe(true);
    });
  });

  describe('@Input view', () => {
    it('should default view to true', () => {
      expect(component.view).toBe(true);
    });

    it('should accept view false and call OpenMapScreen during init', () => {
      spyOn(component, 'OpenMapScreen');
      component.view = false;
      component.ngOnInit();
      expect(component.OpenMapScreen).toHaveBeenCalled();
    });
  });

  describe('Service_GetProcessAreaList', () => {
    it('should populate ProcessAreaList on success', () => {
      mockAppService.getProcessAreaList.and.returnValue(of([{ id: 1, title: 'Area A' }]));
      component.Service_GetProcessAreaList();
      expect(component.ProcessAreaList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getProcessAreaList.and.returnValue(throwError(() => new Error('error')));
      component.Service_GetProcessAreaList();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
