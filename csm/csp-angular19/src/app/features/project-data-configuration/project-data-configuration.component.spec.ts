import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';

import { ProjectDataConfigurationComponent } from './project-data-configuration.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControlService } from '../../core/services/access-control.service';
import { LayoutService } from '../layout/layout.service';

const mockProjNames = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta' }
];

const mockConfigData = [
  { id: 1, configuration_Setting_Id: 10, proj_Id: 'P001', cust_Id: 'C001', is_Approved: true, setting_Name: 'Setting A' },
  { id: 2, configuration_Setting_Id: 11, proj_Id: 'P001', cust_Id: 'C001', is_Approved: false, setting_Name: 'Setting B' }
];

const mockProjSettings: any[] = [
  { id: 10, setting_Name: 'Setting A', setting_Type: 1 },
  { id: 11, setting_Name: 'Setting B', setting_Type: 2 },
  { id: 12, setting_Name: 'Setting C', setting_Type: 3 }
];

describe('ProjectDataConfigurationComponent', () => {
  let component: ProjectDataConfigurationComponent;
  let fixture: ComponentFixture<ProjectDataConfigurationComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessService: any;
  let mockLayoutService: any;
  let mockDialog: any;
  let mockRouter: any;
  let mockHttpClient: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjNames)),
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('EMP001')),
      getProjectConfigurationData: jasmine.createSpy('getProjectConfigurationData').and.returnValue(of(mockConfigData)),
      getProjectSettings: jasmine.createSpy('getProjectSettings').and.returnValue(of(mockProjSettings)),
      getEmpNameById: jasmine.createSpy('getEmpNameById').and.returnValue(of('Alice'))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      setLocaleDate: jasmine.createSpy('setLocaleDate').and.callFake((d: any) => d),
      AppSettings: { token: 'test-token' }
    };

    mockAccessService = {};
    mockLayoutService = { selectedCust: '' };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    mockHttpClient = {
      post: jasmine.createSpy('post').and.returnValue(of({})),
      get: jasmine.createSpy('get').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [
        ProjectDataConfigurationComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControlService, useValue: mockAccessService },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        { provide: HttpClient, useValue: mockHttpClient },
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramSubject.asObservable(),
            snapshot: { url: { toString: () => 'projectdataconfiguration' } }
          }
        },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDataConfigurationComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP001');
    localStorage.setItem('role', '5');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
    localStorage.removeItem('role');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── Default state ─────────────────────────────────────────────────────────

  describe('default state', () => {
    it('should have readonlymode=true and editmode=false', () => {
      fixture.detectChanges();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should have correct displayedColumns', () => {
      fixture.detectChanges();
      expect(component.displayedColumns).toContain('setting_Name');
      expect(component.displayedColumns).toContain('iS_APPROVED');
      expect(component.displayedColumns).toContain('edit');
    });
  });

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set input_customerid from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.input_customerid).toBe('C001');
    });

    it('should set layoutService.selectedCust', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should set allproj=true for PMO role', () => {
      localStorage.setItem('role', '4');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
      localStorage.setItem('role', '5');
    });

    it('should call getProjectSettings on init', () => {
      fixture.detectChanges();
      expect(mockAppsService.getProjectSettings).toHaveBeenCalled();
    });

    it('should call GetDBConfigValue for PROJECTSETTING_APPROVERS', () => {
      fixture.detectChanges();
      expect(mockAppsService.GetDBConfigValue).toHaveBeenCalledWith('PROJECTSETTING_APPROVERS', -1, '');
    });

    it('should set isApprover=true when empid is in approvers list', () => {
      mockAppsService.GetDBConfigValue.and.returnValue(of('EMP001,EMP002'));
      fixture.detectChanges();
      expect(component.isApprover).toBe(true);
    });
  });

  // ─── getAllProjectsFromCustomer ────────────────────────────────────────────

  describe('getAllProjectsFromCustomer', () => {
    it('should populate projNames', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.projNames.length).toBe(2);
    });

    it('should set first project and call onProjectChange', () => {
      spyOn(component, 'onProjectChange');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.input_projectid).toBe('P001');
      expect(component.onProjectChange).toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── onProjectChange ──────────────────────────────────────────────────────

  describe('onProjectChange', () => {
    it('should call GetProjectConfigurationData and reset modes', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.onProjectChange();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
      expect(mockAppsService.getProjectConfigurationData).toHaveBeenCalled();
    });
  });

  // ─── GetProjectConfigurationData ──────────────────────────────────────────

  describe('GetProjectConfigurationData', () => {
    it('should set projectConfigurationData from service', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.GetProjectConfigurationData();
      expect(component.projectConfigurationData.length).toBe(2);
      expect(component._loading).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getProjectConfigurationData.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.GetProjectConfigurationData();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getProjectSettings ───────────────────────────────────────────────────

  describe('getProjectSettings', () => {
    it('should populate projSettings from service', () => {
      fixture.detectChanges();
      component.getProjectSettings();
      expect(component.projSettings.length).toBe(3);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getProjectSettings.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getProjectSettings();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getSettingValue ──────────────────────────────────────────────────────

  describe('getSettingValue', () => {
    it('should return int_Value for setting_Type=1', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      const result = component.getSettingValue({ configuration_Setting_Id: 10, int_Value: 42 } as any);
      expect(result).toBe(42);
    });

    it('should return string_Value for setting_Type=2', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      const result = component.getSettingValue({ configuration_Setting_Id: 11, string_Value: 'hello' } as any);
      expect(result).toBe('hello');
    });

    it('should return Yes/No for setting_Type=3', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      const result = component.getSettingValue({ configuration_Setting_Id: 12, bit_Value: true } as any);
      expect(result).toBe('Yes');
    });
  });

  // ─── AddNew_onClick / Cancel_onClick ──────────────────────────────────────

  describe('AddNew_onClick', () => {
    it('should set editmode=true and readonlymode=false', () => {
      fixture.detectChanges();
      component.AddNew_onClick();
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
    });

    it('should reset type flags', () => {
      fixture.detectChanges();
      component.isInteger = true;
      component.isString = true;
      component.AddNew_onClick();
      expect(component.isInteger).toBe(false);
      expect(component.isString).toBe(false);
      expect(component.isBoolean).toBe(false);
    });
  });

  describe('Cancel_onClick', () => {
    it('should reset to readonlymode and call GetProjectConfigurationData', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.Cancel_onClick();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
      expect(mockAppsService.getProjectConfigurationData).toHaveBeenCalled();
    });

    it('should reset type flags', () => {
      fixture.detectChanges();
      component.isInteger = true;
      component.Cancel_onClick();
      expect(component.isInteger).toBe(false);
      expect(component.isString).toBe(false);
      expect(component.isBoolean).toBe(false);
    });
  });

  // ─── SubmitForm ───────────────────────────────────────────────────────────

  describe('SubmitForm', () => {
    it('should not submit when isValid=false', () => {
      fixture.detectChanges();
      component.SubmitForm(false);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should set readonlymode=true after valid submit', () => {
      fixture.detectChanges();
      component.editprojectdata.id = 0;
      component.congifSettingdId = [10];
      component.input_customerid = 'C001';
      component.input_projectid = 'P001';
      component.SubmitForm(true);
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });
  });

  // ─── EditRow_onClick ──────────────────────────────────────────────────────

  describe('EditRow_onClick', () => {
    it('should populate editprojectdata from element', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      const element = mockConfigData[0];
      component.EditRow_onClick(element as any);
      expect(component.editprojectdata.id).toBe(1);
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
    });

    it('should set isInteger=true for setting_Type=1', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      component.EditRow_onClick(mockConfigData[0] as any);
      expect(component.isInteger).toBe(true);
      expect(component.isString).toBe(false);
      expect(component.isBoolean).toBe(false);
    });

    it('should set isString=true for setting_Type=2', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      component.EditRow_onClick(mockConfigData[1] as any);
      expect(component.isString).toBe(true);
    });
  });

  // ─── onSettingChange ──────────────────────────────────────────────────────

  describe('onSettingChange', () => {
    it('should set isInteger=true for setting_Type=1', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      component.onSettingChange(10);
      expect(component.isInteger).toBe(true);
      expect(component.isString).toBe(false);
      expect(component.isBoolean).toBe(false);
    });

    it('should set isString=true for setting_Type=2', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      component.onSettingChange(11);
      expect(component.isString).toBe(true);
    });

    it('should set isBoolean=true for setting_Type=3', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      component.onSettingChange(12);
      expect(component.isBoolean).toBe(true);
    });
  });

  // ─── getisApproved ────────────────────────────────────────────────────────

  describe('getisApproved', () => {
    it('should return "Yes" when true', () => {
      fixture.detectChanges();
      expect(component.getisApproved(true)).toBe('Yes');
    });

    it('should return "No" when false', () => {
      fixture.detectChanges();
      expect(component.getisApproved(false)).toBe('No');
    });
  });

  // ─── getSettingName ───────────────────────────────────────────────────────

  describe('getSettingName', () => {
    it('should return setting_Name for a known id', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      expect(component.getSettingName(10)).toBe('Setting A');
    });

    it('should return empty string for unknown id', () => {
      fixture.detectChanges();
      component.projSettings = mockProjSettings;
      expect(component.getSettingName(999)).toBe('');
    });
  });

  // ─── Approval dialog state ────────────────────────────────────────────────

  describe('approval dialog', () => {
    it('should set showApprovalDialog=true on opendialog', () => {
      fixture.detectChanges();
      component.opendialog();
      expect(component.showApprovalDialog).toBe(true);
    });

    it('should close dialog on cancelApprovalDialog', () => {
      fixture.detectChanges();
      component.showApprovalDialog = true;
      component.cancelApprovalDialog();
      expect(component.showApprovalDialog).toBe(false);
    });
  });

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      const subSpy = jasmine.createSpy('unsubscribe');
      (component as any).sub = { unsubscribe: subSpy };
      component.ngOnDestroy();
      expect(subSpy).toHaveBeenCalled();
    });
  });
});
