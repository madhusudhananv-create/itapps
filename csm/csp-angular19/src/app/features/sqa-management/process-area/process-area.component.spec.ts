import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProcessAreaComponent } from './process-area.component';
import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { provideHttpClient } from '@angular/common/http';

describe('ProcessAreaComponent', () => {
  let component: ProcessAreaComponent;
  let fixture: ComponentFixture<ProcessAreaComponent>;
  let mockUtil: any;
  let mockAppService: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser')
    };

    mockAppService = {
      getProcessAreaList: jasmine.createSpy('getProcessAreaList').and.returnValue(of([])),
      getProcessList: jasmine.createSpy('getProcessList').and.returnValue(of([])),
      getProcessModelReferenceList: jasmine.createSpy('getProcessModelReferenceList').and.returnValue(of([])),
      addProcessArea: jasmine.createSpy('addProcessArea').and.returnValue(of({})),
      updateProcessArea: jasmine.createSpy('updateProcessArea').and.returnValue(of({})),
      deleteProcessArea: jasmine.createSpy('deleteProcessArea').and.returnValue(of({})),
      getAllProcessModelReferenceList: jasmine.createSpy('getAllProcessModelReferenceList').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ProcessAreaComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: AppsService, useValue: mockAppService },
        provideHttpClient()
      ]
    }).overrideComponent(ProcessAreaComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call service_GetProcessAreaList on init', () => {
      expect(mockAppService.getProcessAreaList).toHaveBeenCalled();
    });

    it('should call service_GetProcessList on init', () => {
      expect(mockAppService.getProcessList).toHaveBeenCalled();
    });
  });

  describe('service_GetProcessAreaList', () => {
    it('should populate ProcessAreaList and FilteredProcessAreaList on success', () => {
      const data = [{ id: 1, title: 'Area A' }];
      mockAppService.getProcessAreaList.and.returnValue(of(data));
      component.service_GetProcessAreaList();
      expect(component.ProcessAreaList.length).toBe(1);
      expect(component.FilteredProcessAreaList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getProcessAreaList.and.returnValue(throwError(() => new Error('error')));
      component.service_GetProcessAreaList();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('bAddNewProcessArea', () => {
    it('should initialize bAddNewProcessArea to false', () => {
      expect(component.bAddNewProcessArea).toBe(false);
    });
  });

  describe('isProcessAreaEditMode', () => {
    it('should initialize isProcessAreaEditMode to false', () => {
      expect(component.isProcessAreaEditMode).toBe(false);
    });
  });
});
