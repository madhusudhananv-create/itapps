import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { AppreciationComponent } from './appreciation.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControlService } from '../../core/services/access-control.service';
import { SharedService } from '../../shared/shared.service';

describe('AppreciationComponent', () => {
  let component: AppreciationComponent;
  let fixture: ComponentFixture<AppreciationComponent>;

  const mockActivatedRoute = {
    params: of({ custid: 'C001' })
  };

  const mockAppsService = {
    getAppreciationDetails: jasmine.createSpy('getAppreciationDetails').and.returnValue(of([])),
    GetAppreciationDetails: jasmine.createSpy('GetAppreciationDetails').and.returnValue(of([])),
    GetProjectsForCustomer: jasmine.createSpy('GetProjectsForCustomer').and.returnValue(of([])),
    GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of([])),
    getCustomerProjectsName: jasmine.createSpy('getCustomerProjectsName').and.returnValue(of([])),
    getAuditeeDetails: jasmine.createSpy('getAuditeeDetails').and.returnValue(of([])),
    getPortfolioName: jasmine.createSpy('getPortfolioName').and.returnValue(of(null)),
    SaveAppreciation: jasmine.createSpy('SaveAppreciation').and.returnValue(of({})),
    updateAppreciation: jasmine.createSpy('updateAppreciation').and.returnValue(of({})),
    deleteAppreciation: jasmine.createSpy('deleteAppreciation').and.returnValue(of({})),
    DeleteAppreciation: jasmine.createSpy('DeleteAppreciation').and.returnValue(of({})),
    GetEmpInfoList: jasmine.createSpy('GetEmpInfoList').and.returnValue(of([]))
  };  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
    serviceError: jasmine.createSpy('serviceError')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  const mockSharedService = {
    selectedProjects: []
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
  };

  const mockSnackBar = {
    open: jasmine.createSpy('open')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppreciationComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControlService, useValue: mockAccessControl },
        { provide: SharedService, useValue: mockSharedService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppreciationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise default property values', () => {
    expect(component.selectedProject).toBe('All Projects');
    expect(component.selectedPortfolio).toBe('All Portfolios');
    expect(component.editmode).toBeFalsy();
    expect(component.readonlymode).toBeTruthy();
    expect(component.allcust).toBeFalsy();
    expect(component.allproj).toBeFalsy();
    expect(component.bShowFilter).toBeTruthy();
  });

  it('should initialise arrays as empty', () => {
    expect(component.result).toEqual([]);
    expect(component.tempData).toEqual([]);
    expect(component.projects).toEqual([]);
    expect(component.projNames).toEqual([]);
    expect(component.ownerList).toEqual([]);
  });

  it('should have correct displayedColumns for non-Premier customer', () => {
    expect(component.displayedColumns).toContain('proJ_NM');
    expect(component.displayedColumns).toContain('appreciateD_BY');
    expect(component.displayedColumns).toContain('recipienT_NM');
    expect(component.displayedColumns).toContain('edit');
    expect(component.displayedColumns).toContain('delete');
  });

  it('should read selectedCust from route params', () => {
    expect(component.selectedCust).toBe('C001');
  });
});
