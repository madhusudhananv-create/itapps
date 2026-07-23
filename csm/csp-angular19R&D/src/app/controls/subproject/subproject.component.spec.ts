import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { SubprojectComponent } from './subproject.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';

describe('SubprojectComponent', () => {
  let component: SubprojectComponent;
  let fixture: ComponentFixture<SubprojectComponent>;

  const mockAppsService = {
    GetSubProjects: jasmine.createSpy('GetSubProjects').and.returnValue(of([])),
    AddSubProject: jasmine.createSpy('AddSubProject').and.returnValue(of({ status: 200 })),
    getProjectResourceByProjId: jasmine.createSpy('getProjectResourceByProjId').and.returnValue(of([])),
    getSubProjectTaskResponsibilityList: jasmine.createSpy('getSubProjectTaskResponsibilityList').and.returnValue(of([])),
    getProjectTask: jasmine.createSpy('getProjectTask').and.returnValue(of([])),
    updateProjectTask: jasmine.createSpy('updateProjectTask').and.returnValue(of({ status: 200 })),
    saveSubProject: jasmine.createSpy('saveSubProject').and.returnValue(of({ status: 200 })),
    deleteSubProject: jasmine.createSpy('deleteSubProject').and.returnValue(of({ status: 200 }))
  };

  const mockMyUtility = {
    AppSettings: { empid: 'E001', logintype: 'gavs' },
    serviceError: jasmine.createSpy('serviceError'),
    showWarningPopup: jasmine.createSpy('showWarningPopup'),
    showSuccessPopup: jasmine.createSpy('showSuccessPopup'),
    setLocaleDate: jasmine.createSpy('setLocaleDate').and.callFake((d: any) => d)
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SubprojectComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideNativeDateAdapter(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize input_projectid as empty string', () => {
    expect(component.input_projectid).toBe('');
  });

  it('should initialize input_customerid as empty string', () => {
    expect(component.input_customerid).toBe('');
  });

  it('should initialize bShowAddSubProject as false', () => {
    expect(component.bShowAddSubProject).toBeFalsy();
  });

  it('should initialize subProjects as empty array', () => {
    expect(component.subProjects).toEqual([]);
  });

  it('should initialize projectResource as empty array', () => {
    expect(component.projectResource).toEqual([]);
  });

  it('should initialize projectTasks as empty array', () => {
    expect(component.projectTasks).toEqual([]);
  });

  it('should initialize iEditIndex as -1', () => {
    expect(component.iEditIndex).toBe(-1);
  });

  it('should initialize SubProjectId as "0"', () => {
    expect(component.SubProjectId).toBe('0');
  });

  it('should accept ProjectId input', () => {
    component.input_projectid = 'PROJ001';
    fixture.detectChanges();
    expect(component.input_projectid).toBe('PROJ001');
  });

  it('should accept CustomerId input', () => {
    component.input_customerid = 'CUST001';
    fixture.detectChanges();
    expect(component.input_customerid).toBe('CUST001');
  });

  it('should have _access and _util injected', () => {
    expect(component._access).toBeDefined();
    expect(component._util).toBeDefined();
  });
});
