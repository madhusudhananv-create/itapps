import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';

import { ProjectMigrationComponent } from './project-migration.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { LayoutService } from '../layout/layout.service';

const mockOldProjects = [
  { proJ_ID: 'P001', proJ_NM: 'Old Project Alpha', Proj_Status: 'Closed', enD_DATE: '2022-12-31' },
  { proJ_ID: 'P002', proJ_NM: 'Old Project Beta', Proj_Status: 'Active', enD_DATE: '2023-06-30' }
];

const mockNewProjects = [
  { proJ_ID: 'P003', proJ_NM: 'New Project Gamma', Proj_Status: 'Active', enD_DATE: '2030-12-31' },
  { proJ_ID: 'P004', proJ_NM: 'New Project Delta', Proj_Status: 'Active', enD_DATE: '2031-06-30' }
];

describe('ProjectMigrationComponent', () => {
  let component: ProjectMigrationComponent;
  let fixture: ComponentFixture<ProjectMigrationComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockLayoutService: any;
  let mockDialog: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerProjectsForMigration: jasmine.createSpy('GetCustomerProjectsForMigration').and.callFake(
        (custId: string, includeOld: boolean) => includeOld ? of(mockOldProjects) : of(mockNewProjects)
      ),
      MigrateProjectData: jasmine.createSpy('MigrateProjectData').and.returnValue(of('Migration successful'))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError')
    };

    mockLayoutService = { selectedCust: '' };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    TestBed.configureTestingModule({
      imports: [
        ProjectMigrationComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMigrationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── Default state ─────────────────────────────────────────────────────────

  describe('default state', () => {
    it('should have allproj=true', () => {
      fixture.detectChanges();
      expect(component.allproj).toBe(true);
    });

    it('should have showMessage=false', () => {
      fixture.detectChanges();
      expect(component.showMessage).toBe(false);
    });

    it('should have empty CUST_ID initially', () => {
      fixture.detectChanges();
      expect(component.CUST_ID).toBe('');
    });
  });

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set CUST_ID from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.CUST_ID).toBe('C001');
    });

    it('should set layoutService.selectedCust', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should call getOldProjects on init', () => {
      spyOn(component, 'getOldProjects');
      fixture.detectChanges();
      expect(component.getOldProjects).toHaveBeenCalled();
    });

    it('should call getNewProjects on init', () => {
      spyOn(component, 'getNewProjects');
      fixture.detectChanges();
      expect(component.getNewProjects).toHaveBeenCalled();
    });
  });

  // ─── getOldProjects ────────────────────────────────────────────────────────

  describe('getOldProjects', () => {
    it('should populate oldProjNames', () => {
      fixture.detectChanges();
      component.getOldProjects();
      expect(component.oldProjNames.length).toBe(2);
    });

    it('should call GetCustomerProjectsForMigration with includeOld=true', () => {
      fixture.detectChanges();
      component.CUST_ID = 'C001';
      component.getOldProjects();
      expect(mockAppsService.GetCustomerProjectsForMigration).toHaveBeenCalledWith('C001', true);
    });

    it('should set showMessage=false', () => {
      fixture.detectChanges();
      component.showMessage = true;
      component.getOldProjects();
      expect(component.showMessage).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerProjectsForMigration.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getOldProjects();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getNewProjects ────────────────────────────────────────────────────────

  describe('getNewProjects', () => {
    it('should populate newProjNames', () => {
      fixture.detectChanges();
      component.getNewProjects();
      expect(component.newProjNames.length).toBe(2);
    });

    it('should call GetCustomerProjectsForMigration with includeOld=false', () => {
      fixture.detectChanges();
      component.CUST_ID = 'C001';
      component.getNewProjects();
      expect(mockAppsService.GetCustomerProjectsForMigration).toHaveBeenCalledWith('C001', false);
    });

    it('should set showMessage=false', () => {
      fixture.detectChanges();
      component.showMessage = true;
      component.getNewProjects();
      expect(component.showMessage).toBe(false);
    });
  });

  // ─── getProjectDetails ─────────────────────────────────────────────────────

  describe('getProjectDetails', () => {
    it('should return project from newProjNames when ptype=new', () => {
      fixture.detectChanges();
      component.newProjNames = mockNewProjects as any;
      const result = component.getProjectDetails('new', 'P003');
      expect(result!.proJ_NM).toBe('New Project Gamma');
    });

    it('should return project from oldProjNames when ptype=old', () => {
      fixture.detectChanges();
      component.oldProjNames = mockOldProjects as any;
      const result = component.getProjectDetails('old', 'P001');
      expect(result!.proJ_NM).toBe('Old Project Alpha');
    });

    it('should return undefined for unknown project id', () => {
      fixture.detectChanges();
      component.newProjNames = mockNewProjects as any;
      const result = component.getProjectDetails('new', 'PXXX');
      expect(result).toBeUndefined();
    });
  });

  // ─── onProjectChange ──────────────────────────────────────────────────────

  describe('onProjectChange', () => {
    it('should set newProjDetails when ptype=new', () => {
      fixture.detectChanges();
      component.newProjNames = mockNewProjects as any;
      component.input_newprojectid = 'P003';
      component.onProjectChange('new');
      expect(component.newProjDetails.proJ_NM).toBe('New Project Gamma');
    });

    it('should set oldProjDetails when ptype=old', () => {
      fixture.detectChanges();
      component.oldProjNames = mockOldProjects as any;
      component.input_oldprojectid = 'P001';
      component.onProjectChange('old');
      expect(component.oldProjDetails.proJ_NM).toBe('Old Project Alpha');
    });

    it('should reset successMessage and showMessage', () => {
      fixture.detectChanges();
      component.successMessage = 'Done';
      component.showMessage = true;
      component.newProjNames = [];
      component.onProjectChange('new');
      expect(component.successMessage).toBe('');
      expect(component.showMessage).toBe(false);
    });
  });

  // ─── MigrateProjectData ───────────────────────────────────────────────────

  describe('MigrateProjectData', () => {
    it('should show toast and return when newprojectid is empty', () => {
      fixture.detectChanges();
      component.input_newprojectid = '';
      component.input_oldprojectid = 'P001';
      component.MigrateProjectData();
      expect(mockAppsService.MigrateProjectData).not.toHaveBeenCalled();
    });

    it('should show toast and return when oldprojectid is empty', () => {
      fixture.detectChanges();
      component.input_newprojectid = 'P003';
      component.input_oldprojectid = '';
      component.MigrateProjectData();
      expect(mockAppsService.MigrateProjectData).not.toHaveBeenCalled();
    });

    it('should call MigrateProjectData when both projects selected and dialog confirmed', () => {
      fixture.detectChanges();
      component.input_newprojectid = 'P003';
      component.input_oldprojectid = 'P001';
      component.oldProjDetails = mockOldProjects[0] as any;
      component.newProjDetails = mockNewProjects[0] as any;
      component.MigrateProjectData();
      expect(mockAppsService.MigrateProjectData).toHaveBeenCalledWith('P001', 'P003');
    });

    it('should set statusMessage and showMessage=true on success', () => {
      fixture.detectChanges();
      component.input_newprojectid = 'P003';
      component.input_oldprojectid = 'P001';
      component.oldProjDetails = mockOldProjects[0] as any;
      component.newProjDetails = mockNewProjects[0] as any;
      component.MigrateProjectData();
      expect(component.statusMessage).toBe('Migration successful');
      expect(component.showMessage).toBe(true);
      expect(component.errorStatus).toBe(1);
    });

    it('should not migrate when dialog cancelled', () => {
      mockDialog.open.and.returnValue({ afterClosed: () => of(false) });
      fixture.detectChanges();
      component.input_newprojectid = 'P003';
      component.input_oldprojectid = 'P001';
      component.oldProjDetails = mockOldProjects[0] as any;
      component.newProjDetails = mockNewProjects[0] as any;
      component.MigrateProjectData();
      expect(mockAppsService.MigrateProjectData).not.toHaveBeenCalled();
    });

    it('should call serviceError on MigrateProjectData failure', () => {
      mockAppsService.MigrateProjectData.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.input_newprojectid = 'P003';
      component.input_oldprojectid = 'P001';
      component.oldProjDetails = mockOldProjects[0] as any;
      component.newProjDetails = mockNewProjects[0] as any;
      component.MigrateProjectData();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
      expect(component.errorStatus).toBe(0);
    });
  });
});
