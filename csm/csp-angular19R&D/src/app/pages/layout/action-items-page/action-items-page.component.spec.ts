import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { ActionItemsPageComponent } from './action-items-page.component';
import { AppsService } from '../../../services/apps.service';
import { AppsService as CoreAppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { SharedService } from '../../../shared/shared.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ActionItemsComponent', () => {
  let component: ActionItemsPageComponent;
  let fixture: ComponentFixture<ActionItemsPageComponent>;
  let mockAppService: any;
  let mockCoreAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockShared: any;
  let mockDialog: any;
  let mockHttp: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getActionItemsDetails: jasmine.createSpy().and.returnValue(of([])),
      getAllProjectsFromCustomer: jasmine.createSpy().and.returnValue(of([])),
      CanUpdateToCustomer: jasmine.createSpy().and.returnValue(of(false)),
      GetCustomerProjectsName: jasmine.createSpy().and.returnValue(of([]))
    };
    mockCoreAppService = {
      getCustomerProjectsName: jasmine.createSpy().and.returnValue(of([])),
      getPortfolioList: jasmine.createSpy().and.returnValue(of([])),
      getProductList: jasmine.createSpy().and.returnValue(of([])),
      getProjectPortfolioMapping: jasmine.createSpy().and.returnValue(of([]))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      IsPremier: jasmine.createSpy().and.returnValue(false),
      IsGAVS: jasmine.createSpy().and.returnValue(false),
      ShouldLoadAllProjects: jasmine.createSpy().and.returnValue(false),
      ApplyCriteriaRange: jasmine.createSpy().and.returnValue([]),
      showWarningConfirmation: jasmine.createSpy().and.returnValue({ afterClosed: () => of(true) })
    };
    mockAccess = {
      IsAllowed: jasmine.createSpy().and.returnValue(true)
    };
    mockShared = {
      selectedProjects: [],
      savedportfolioId: 0
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) }),
      closeAll: jasmine.createSpy()
    };
    mockHttp = {
      get: jasmine.createSpy().and.returnValue(of({})),
      post: jasmine.createSpy().and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [ActionItemsPageComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: CoreAppsService, useValue: mockCoreAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: SharedService, useValue: mockShared },
        { provide: MatDialog, useValue: mockDialog },
        { provide: HttpClient, useValue: mockHttp },
        { provide: ChangeDetectorRef, useValue: { detectChanges: jasmine.createSpy(), markForCheck: jasmine.createSpy() } },
        { provide: ActivatedRoute, useValue: { params: of({ custid: 'C1' }) } },
        { provide: MAT_DIALOG_DATA, useValue: null },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    TestBed.overrideProvider(AppsService, { useValue: mockAppService });
    TestBed.overrideProvider(CoreAppsService, { useValue: mockCoreAppService });
    TestBed.overrideProvider(MyUtility, { useValue: mockUtil });
    TestBed.overrideProvider(MatDialog, { useValue: mockDialog });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionItemsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.editmode).toBe(false);
    expect(component.readonlymode).toBe(true);
    expect(component.isLoading).toBe(false);
    expect(component.AllChecked).toBe(false);
    expect(component.PastDueChecked).toBe(true);
    expect(component.DueClosureChecked).toBe(true);
  });

  it('should call service_getActionItems on init', () => {
    expect(mockAppService.getActionItemsDetails).toHaveBeenCalled();
  });

  it('should set result data after service call', () => {
    const mockData = [{ actioN_ITEM_ID: 1, status: 'Open' }];
    mockAppService.getActionItemsDetails.and.returnValue(of(mockData));
    component.service_getActionItems();
    expect(component.result).toEqual(mockData);
  });

  it('should call closeAll when closeDialog is called', () => {
    component.closeDialog();
    expect(mockDialog.closeAll).toHaveBeenCalled();
  });

  it('should populate projects and portfolio in filter_projectPortfolio', () => {
    const data = [
      { proJ_NM: 'Project A', portfoliO_NAME: 'Portfolio 1' },
      { proJ_NM: 'Project B', portfoliO_NAME: 'Portfolio 2' }
    ];
    component.filter_projectPortfolio(data);
    expect(component.projects.length).toBeGreaterThan(0);
    expect(component.portfolio.length).toBeGreaterThan(0);
  });

  it('should set bShowFilter to false when result is empty', () => {
    mockAppService.getActionItemsDetails.and.returnValue(of([]));
    component.service_getActionItems();
    expect(component.bShowFilter).toBe(false);
  });

  it('should handle service error in getActionItems', () => {
    mockAppService.getActionItemsDetails.and.returnValue(throwError(() => new Error('error')));
    component.service_getActionItems();
    expect(component.isLoading).toBe(false);
  });
});
