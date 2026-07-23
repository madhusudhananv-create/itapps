import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ControlUserComponent } from './control-user.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { provideHttpClient } from '@angular/common/http';

describe('ControlUserComponent', () => {
  let component: ControlUserComponent;
  let fixture: ComponentFixture<ControlUserComponent>;
  let mockAppService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showWarning: jasmine.createSpy('showWarning'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser')
    };

    mockAppService = {
      getProcessModelNew: jasmine.createSpy('getProcessModelNew').and.returnValue(of([])),
      getRiskNew: jasmine.createSpy('getRiskNew').and.returnValue(of([])),
      getControlsNew: jasmine.createSpy('getControlsNew').and.returnValue(of([])),
      getClassifications: jasmine.createSpy('getClassifications').and.returnValue(of([])),
      getAllControlCategories: jasmine.createSpy('getAllControlCategories').and.returnValue(of([])),
      getAllControlReferences: jasmine.createSpy('getAllControlReferences').and.returnValue(of([])),
      addControlNew: jasmine.createSpy('addControlNew').and.returnValue(of({})),
      updateControlNew: jasmine.createSpy('updateControlNew').and.returnValue(of({})),
      deleteControlNew: jasmine.createSpy('deleteControlNew').and.returnValue(of({})),
      addControlCategory: jasmine.createSpy('addControlCategory').and.returnValue(of({})),
      addControlReference: jasmine.createSpy('addControlReference').and.returnValue(of({})),
      getProcessModel: jasmine.createSpy('getProcessModel').and.returnValue(of([])),
      GetProcessModelRisksNew: jasmine.createSpy('GetProcessModelRisksNew').and.returnValue(of([])),
      getControlRisksMappingData: jasmine.createSpy('getControlRisksMappingData').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ControlUserComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    }).overrideComponent(ControlUserComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call Service_GetProcessModel on init', () => {
      expect(mockAppService.getProcessModel).toHaveBeenCalled();
    });

    it('should call Service_GetRisknew on init', () => {
      expect(mockAppService.GetProcessModelRisksNew).toHaveBeenCalled();
    });

    it('should call Service_Loaddata on init', () => {
      expect(mockAppService.getControlRisksMappingData).toHaveBeenCalled();
    });

    it('should call Service_GetAllControlCategories on init', () => {
      expect(mockAppService.getAllControlCategories).toHaveBeenCalled();
    });

    it('should call Service_GetAllControlReference on init', () => {
      expect(mockAppService.getAllControlReferences).toHaveBeenCalled();
    });
  });

  describe('Service_Loaddata', () => {
    it('should populate controls list on success', () => {
      mockAppService.getControlRisksMappingData.and.returnValue(of([{ id: 1, title: 'Control A' }]));
      component.Service_Loaddata();
      expect(component.controlRisksMapping.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getControlRisksMappingData.and.returnValue(throwError(() => new Error('error')));
      component.Service_Loaddata();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('Service_GetAllControlCategories', () => {
    it('should populate controlCategoryList on success', () => {
      mockAppService.getAllControlCategories.and.returnValue(of([{ id: 1, description: 'Cat A' }]));
      component.Service_GetAllControlCategories();
      expect(component.controlcategories.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getAllControlCategories.and.returnValue(throwError(() => new Error('error')));
      component.Service_GetAllControlCategories();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
