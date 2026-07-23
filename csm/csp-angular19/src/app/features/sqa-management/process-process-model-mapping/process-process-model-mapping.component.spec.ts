import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProcessProcessModelMappingComponent } from './process-process-model-mapping.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { provideHttpClient } from '@angular/common/http';

describe('ProcessProcessModelMappingComponent', () => {
  let component: ProcessProcessModelMappingComponent;
  let fixture: ComponentFixture<ProcessProcessModelMappingComponent>;
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
      getProcessAreaList: jasmine.createSpy('getProcessAreaList').and.returnValue(of([])),
      getAllProcessListByProcessModel: jasmine.createSpy('getAllProcessListByProcessModel').and.returnValue(of([])),
      getProcessList: jasmine.createSpy('getProcessList').and.returnValue(of([])),
      getProcessModelProcessMapping: jasmine.createSpy('getProcessModelProcessMapping').and.returnValue(of([])),
      getProcessModelList: jasmine.createSpy('getProcessModelList').and.returnValue(of([])),
      updateProcessMapping: jasmine.createSpy('updateProcessMapping').and.returnValue(of({})),
      updateProcessArea: jasmine.createSpy('updateProcessArea').and.returnValue(of({})),
      getAllProcessList: jasmine.createSpy('getAllProcessList').and.returnValue(of([])),
      getAllProcessModelReferenceList: jasmine.createSpy('getAllProcessModelReferenceList').and.returnValue(of([])),
      GetAllProcessProcessModelMapping: jasmine.createSpy('GetAllProcessProcessModelMapping').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ProcessProcessModelMappingComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    }).overrideComponent(ProcessProcessModelMappingComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessProcessModelMappingComponent);
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

    it('should call Service_GetProcessModelProcessMapping on init', () => {
      expect(mockAppService.GetAllProcessProcessModelMapping).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize isProcessModelMapped to true', () => {
      expect(component.isProcessModelMapped).toBe(true);
    });

    it('should initialize searchValue to empty string', () => {
      expect(component.searchValue).toBe('');
    });

    it('should initialize ProcessModelList as empty array', () => {
      expect(component.ProcessModelList).toEqual([]);
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
