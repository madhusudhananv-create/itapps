import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { AccessControlProjectComponent } from './access-control-project.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';

describe('AccessControlProjectComponent', () => {
  let component: AccessControlProjectComponent;
  let fixture: ComponentFixture<AccessControlProjectComponent>;

  const mockAppsService = {
    GetEmpInfoList: jasmine.createSpy('GetEmpInfoList').and.returnValue(of([])),
    GetProjectResourceByEmpId: jasmine.createSpy('GetProjectResourceByEmpId').and.returnValue(of([])),
    AddProjectResource: jasmine.createSpy('AddProjectResource').and.returnValue(of({})),
    DeleteProjectResource: jasmine.createSpy('DeleteProjectResource').and.returnValue(of({})),
    getEmpInfo: jasmine.createSpy('getEmpInfo').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError'),
    getMonthAbr: jasmine.createSpy('getMonthAbr').and.returnValue(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']),
    IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
    is102802: jasmine.createSpy('is102802').and.returnValue(false),
    IsQuality: jasmine.createSpy('IsQuality').and.returnValue(false)
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
      imports: [AccessControlProjectComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).overrideComponent(AccessControlProjectComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
    
    // Override providers after compileComponents for standalone components
    TestBed.overrideProvider(AppsService, { useValue: mockAppsService });
    TestBed.overrideProvider(MyUtility, { useValue: mockMyUtility });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise default property values', () => {
    expect(component.custId).toBe('');
    expect(component.projId).toBe('');
    expect(component.isBillable).toBeFalsy();
    expect(component.isProjResource).toBeFalsy();
    expect(component.errorStr).toBe('');
    expect(component.isCreateAccessDisabled).toBeTruthy();
  });

  it('should initialise arrays as empty', () => {
    expect(component.empinfo).toEqual([]);
    expect(component.projectResource).toEqual([]);
    expect(component.dataSource).toEqual([]);
  });

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('cusT_NM');
    expect(component.displayedColumns).toContain('proJ_NM');
    expect(component.displayedColumns).toContain('bilL_FLG');
    expect(component.displayedColumns).toContain('delete');
  });

  it('should have a valid startdate as ISO date string', () => {
    expect(component.startdate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should set isCreateAccessDisabled false when IsAllowed returns true', () => {
    mockAccessControl.IsAllowed.and.returnValue(true);
    const newComp = TestBed.createComponent(AccessControlProjectComponent).componentInstance;
    expect(newComp.isCreateAccessDisabled).toBeFalsy();
  });
});
