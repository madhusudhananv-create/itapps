import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { RequirementReferenceComponent } from './requirement-reference.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('RequirementReferenceComponent', () => {
  let component: RequirementReferenceComponent;
  let fixture: ComponentFixture<RequirementReferenceComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser'),
      setLocaleDate: jasmine.createSpy('setLocaleDate').and.callFake((val: any) => val)
    };

    mockAccess = {
      CheckValidAccess: jasmine.createSpy('CheckValidAccess').and.returnValue(true),
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true)
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) })
    };

    mockAppService = {
      getCategories: jasmine.createSpy('getCategories').and.returnValue(of([])),
      getProcessModelList: jasmine.createSpy('getProcessModelList').and.returnValue(of([])),
      getProcessAreaList: jasmine.createSpy('getProcessAreaList').and.returnValue(of([])),
      getProcessList: jasmine.createSpy('getProcessList').and.returnValue(of([])),
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getProjectLevel: jasmine.createSpy('getProjectLevel').and.returnValue(of([])),
      getApplicabilityLevels: jasmine.createSpy('getApplicabilityLevels').and.returnValue(of([])),
      getReqReference: jasmine.createSpy('getReqReference').and.returnValue(of([])),
      getOwnersList: jasmine.createSpy('getOwnersList').and.returnValue(of([])),
      getStatusList: jasmine.createSpy('getStatusList').and.returnValue(of([])),
      getReqStages: jasmine.createSpy('getReqStages').and.returnValue(of([])),
      getAllProjectsForCustomer: jasmine.createSpy('getAllProjectsForCustomer').and.returnValue(of([])),
      GetRiskOwnersList: jasmine.createSpy('GetRiskOwnersList').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [RequirementReferenceComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: MatDialog, useValue: mockDialog },
        provideRouter([]),
        provideHttpClient(),
        provideAnimations()
      ]
    }).overrideComponent(RequirementReferenceComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadIntitialData on init', () => {
      spyOn(component, 'loadIntitialData');
      component.ngOnInit();
      expect(component.loadIntitialData).toHaveBeenCalled();
    });

    it('should set allproj true for role 3', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'role') return '3';
        return null;
      });
      component.ngOnInit();
      expect(component.allproj).toBe(true);
    });

    it('should set allproj true for role 9', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'role') return '9';
        return null;
      });
      component.ngOnInit();
      expect(component.allproj).toBe(true);
    });

    it('should set allproj true for role 10', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'role') return '10';
        return null;
      });
      component.ngOnInit();
      expect(component.allproj).toBe(true);
    });

    it('should not set allproj for other roles', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'role') return '1';
        return null;
      });
      component.ngOnInit();
      expect(component.allproj).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should initialize showdetails to true', () => {
      expect(component.showdetails).toBe(true);
    });

    it('should initialize readonlymode to true', () => {
      expect(component.readonlymode).toBe(true);
    });

    it('should initialize editmode to false', () => {
      expect(component.editmode).toBe(false);
    });

    it('should initialize getRequirementRef as empty array', () => {
      expect(component.getRequirementRef).toEqual([]);
    });
  });

  describe('Edit_onClick', () => {
    it('should switch to edit mode', () => {
      component.Edit_onClick();
      expect(component.readonlymode).toBe(false);
      expect(component.editmode).toBe(true);
    });

    it('should reset req_Id on click', () => {
      component.req_Id = '10';
      component.Edit_onClick();
      expect(component.req_Id).toBe('');
    });
  });

  describe('Cancel_onClick', () => {
    it('should switch back to readonly mode', () => {
      component.editmode = true;
      component.readonlymode = false;
      component.Cancel_onClick();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });
  });

  describe('getreqApplicabilty', () => {
    it('should return level string for matching id', () => {
      component.levels = [{ id: 1, level: 'Level 1' } as any];
      expect(component.getreqApplicabilty(1)).toBe('Level 1');
    });

    it('should return empty string when id not found', () => {
      component.levels = [];
      expect(component.getreqApplicabilty(99)).toBe('');
    });
  });

  describe('getStatusList', () => {
    it('should populate statusList on success', () => {
      mockAppService.getStatusList.and.returnValue(of([{ id: 1, status: 'Open' }]));
      component.getStatusList();
      expect(component.statusList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getStatusList.and.returnValue(throwError(() => new Error('error')));
      component.getStatusList();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
