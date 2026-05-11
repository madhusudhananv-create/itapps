import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProcessProcessModelViewComponent } from './process-process-model-view.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { provideHttpClient } from '@angular/common/http';

describe('ProcessProcessModelViewComponent', () => {
  let component: ProcessProcessModelViewComponent;
  let fixture: ComponentFixture<ProcessProcessModelViewComponent>;
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
      getAllProcessModelReferenceList: jasmine.createSpy('getAllProcessModelReferenceList').and.returnValue(of([])),
      getAllProcessList: jasmine.createSpy('getAllProcessList').and.returnValue(of([])),
      GetAllProcessProcessModelMapping: jasmine.createSpy('GetAllProcessProcessModelMapping').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ProcessProcessModelViewComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    }).overrideComponent(ProcessProcessModelViewComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessProcessModelViewComponent);
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
    it('should initialize ProcessModelList as empty array', () => {
      expect(component.ProcessModelList).toEqual([]);
    });

    it('should initialize ProcessAreaList as empty array', () => {
      expect(component.ProcessAreaList).toEqual([]);
    });

    it('should initialize ProcessList as empty array', () => {
      expect(component.ProcessList).toEqual([]);
    });

    it('should have displayedColumns defined', () => {
      expect(component.displayedColumns).toContain('procesS_MODEL');
      expect(component.displayedColumns).toContain('procesS_NAME');
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
