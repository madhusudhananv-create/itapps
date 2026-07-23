import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { AccessControlProjectResourceComponent } from './access-control-project-resource.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';

describe('AccessControlProjectResourceComponent', () => {
  let component: AccessControlProjectResourceComponent;
  let fixture: ComponentFixture<AccessControlProjectResourceComponent>;

  const mockAppsService = {
    GetEmpInfoList: jasmine.createSpy('GetEmpInfoList').and.returnValue(of([])),
    GetProjectResourceByProjId: jasmine.createSpy('GetProjectResourceByProjId').and.returnValue(of([])),
    AddProjectResource: jasmine.createSpy('AddProjectResource').and.returnValue(of({})),
    DeleteProjectResource: jasmine.createSpy('DeleteProjectResource').and.returnValue(of({})),
    getEmpInfo: jasmine.createSpy('getEmpInfo').and.returnValue(of([])),
    GetRASCustomerList: jasmine.createSpy('GetRASCustomerList').and.returnValue(of([])),
    GetProjectDataConfigurationValues: jasmine.createSpy('GetProjectDataConfigurationValues').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
  };

  beforeEach(waitForAsync(() => {
    mockAccessControl.IsAllowed.and.returnValue(false);
    TestBed.configureTestingModule({
      imports: [AccessControlProjectResourceComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();
    
    // Override providers after compileComponents for standalone components
    TestBed.overrideProvider(AppsService, { useValue: mockAppsService });
    TestBed.overrideProvider(MyUtility, { useValue: mockMyUtility });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlProjectResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise default property values', () => {
    expect(component.custId).toBe('');
    expect(component.projId).toBe('');
    expect(component.isBillable).toBeTruthy();
    expect(component.isProjResource).toBeTruthy();
    expect(component.errorStr).toBe('');
    expect(component.isCreateAccessDisabled).toBeTruthy();
  });

  it('should initialise arrays as empty', () => {
    expect(component.empinfo).toEqual([]);
    expect(component.projectResource).toEqual([]);
    expect(component.dataSource).toEqual([]);
  });

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('emP_ID');
    expect(component.displayedColumns).toContain('frsT_NM');
    expect(component.displayedColumns).toContain('bilL_FLG');
    expect(component.displayedColumns).toContain('delete');
  });

  it('should have a valid startdate as ISO date string', () => {
    expect(component.startdate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should set isCreateAccessDisabled false when IsAllowed returns true', () => {
    mockAccessControl.IsAllowed.and.returnValue(true);
    const newComp = TestBed.createComponent(AccessControlProjectResourceComponent).componentInstance;
    expect(newComp.isCreateAccessDisabled).toBeFalsy();
  });
});
