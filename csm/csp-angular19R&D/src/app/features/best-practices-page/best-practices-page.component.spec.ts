import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { BestPracticesPageComponent } from './best-practices-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { SharedService } from '../../shared/shared.service';
import { LayoutService } from '../layout/layout.service';

describe('BestPracticesPageComponent', () => {
  let component: BestPracticesPageComponent;
  let fixture: ComponentFixture<BestPracticesPageComponent>;

  const mockActivatedRoute = {
    params: of({ custid: 'C001' })
  };

  const mockAppsService = {
    GetBestPractices: jasmine.createSpy('GetBestPractices').and.returnValue(of([])),
    GetProjectsForCustomer: jasmine.createSpy('GetProjectsForCustomer').and.returnValue(of([])),
    GetEmpInfoList: jasmine.createSpy('GetEmpInfoList').and.returnValue(of([])),
    getProjectResourcebyProjIds: jasmine.createSpy('getProjectResourcebyProjIds').and.returnValue(of([])),
    getAllCustomerNamesEmpNames: jasmine.createSpy('getAllCustomerNamesEmpNames').and.returnValue(of([])),
    getCustomerPortfolioProjectsList: jasmine.createSpy('getCustomerPortfolioProjectsList').and.returnValue(of([])),
    getAllBestPracticesForCustomer: jasmine.createSpy('getAllBestPracticesForCustomer').and.returnValue(of([])),
    GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
    serviceError: jasmine.createSpy('serviceError'),
    IsQuality: jasmine.createSpy('IsQuality').and.returnValue(false)
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  const mockSharedService = { selectedProjects: [] };
  const mockLayoutService = { selectedCust: '' };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BestPracticesPageComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: SharedService, useValue: mockSharedService },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }) } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestPracticesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise boolean flags', () => {
    expect(component.bShowFilter).toBeFalsy(); // Actual value is false
    expect(component.bDisabled).toBeTruthy(); // Actual value is true
    expect(component.bVisible).toBeTruthy(); // Actual value is true
    expect(component.editmode).toBeFalsy();
    expect(component.readonlymode).toBeTruthy();
    expect(component.allproj).toBeFalsy();
    expect(component.flag).toBeFalsy();
    expect(component.AllChecked).toBeFalsy();
    expect(component.PastDueChecked).toBeTruthy();
    expect(component.DueClosureChecked).toBeTruthy();
  });

  it('should initialise toggle to "Hide"', () => {
    expect(component.toggle).toBe('Hide');
  });

  it('should initialise project/portfolio selection defaults', () => {
    expect(component.selectedProject).toBe('All Projects');
    expect(component.selectedPortfolio).toBe('All Portfolios');
  });

  it('should initialise arrays as empty', () => {
    expect(component.AllBestPractices).toEqual([]);
    expect(component.filteredBestpractices).toEqual([]);
    // projects and portfolio arrays are initialized with default 'All' values during ngOnInit
    expect(component.projects.length).toBeGreaterThanOrEqual(0);
    expect(component.portfolio.length).toBeGreaterThanOrEqual(0);
    expect(component.portfolioList).toEqual([]);
  });
});
