import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IssuesPageComponent } from './issues-page.component';
import { AppsService } from '../../../services/apps.service';
import { AppsService as CoreAppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControlService } from '../../../core/services/access-control.service';
import { UtilityService } from '../../../core/services/utility.service';
import { SharedService } from '../../../shared/shared.service';
import { LayoutService } from '../../../features/layout/layout.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('IssuesPageComponent', () => {
  let component: IssuesPageComponent;
  let fixture: ComponentFixture<IssuesPageComponent>;
  let mockAppService: any;
  let mockCoreAppService: any;
  let mockUtil: any;
  let mockMyUtil: any;
  let mockAccess: any;
  let mockShared: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getAllIssuesForCustomer: jasmine.createSpy().and.returnValue(of({
        output: [],
        projects: []
      })),
      getAllProjectsFromCustomer: jasmine.createSpy().and.returnValue(of([])),
      getEmpInfo: jasmine.createSpy().and.returnValue(of([]))
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
      ShouldLoadAllProjects: jasmine.createSpy().and.returnValue(false),
      ApplyCriteriaRange: jasmine.createSpy().and.returnValue([])
    };
    mockMyUtil = {
      serviceError: jasmine.createSpy(),
      IsPremier: jasmine.createSpy().and.returnValue(false),
      ShouldLoadAllProjects: jasmine.createSpy().and.returnValue(false)
    };
    mockAccess = {
      IsAllowed: jasmine.createSpy().and.returnValue(true)
    };
    mockShared = {
      selectedProjects: [],
      savedportfolioId: 0
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) })
    };

    TestBed.configureTestingModule({
      imports: [IssuesPageComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: CoreAppsService, useValue: mockCoreAppService },
        { provide: MyUtility, useValue: mockMyUtil },
        { provide: UtilityService, useValue: mockUtil },
        { provide: AccessControlService, useValue: mockAccess },
        { provide: SharedService, useValue: mockShared },
        { provide: MatDialog, useValue: mockDialog },
        { provide: LayoutService, useValue: { selectedCust: 'C1' } },
        { provide: ActivatedRoute, useValue: { params: of({ custid: 'C1' }) } },
        { provide: MAT_DIALOG_DATA, useValue: null },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    TestBed.overrideProvider(AppsService, { useValue: mockAppService });
    TestBed.overrideProvider(CoreAppsService, { useValue: mockCoreAppService });
    TestBed.overrideProvider(MyUtility, { useValue: mockMyUtil });
    TestBed.overrideProvider(UtilityService, { useValue: mockUtil });
    TestBed.overrideProvider(MatDialog, { useValue: mockDialog });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.AllChecked).toBe(false);
    expect(component.PastDueChecked).toBe(true);
    expect(component.DueClosureChecked).toBe(true);
    expect(component.readonlymode).toBe(true);
    expect(component.editmode).toBe(false);
    expect(component.isLoading).toBe(false);
  });

  it('should call getAllIssuesForCustomer on init', () => {
    expect(mockAppService.getAllIssuesForCustomer).toHaveBeenCalled();
  });

  it('should set input data after service response', () => {
    const mockData = { output: [{ issuE_ID: 1, status: 'Open' }], projects: [] };
    mockAppService.getAllIssuesForCustomer.and.returnValue(of(mockData));
    component.getAllIssuesForCustomer('C1');
    expect(component.input).toEqual(mockData.output);
  });

  it('should set bShowFilter to false when input is empty', () => {
    mockAppService.getAllIssuesForCustomer.and.returnValue(of({ output: [], projects: [] }));
    component.getAllIssuesForCustomer('C1');
    expect(component.bShowFilter).toBe(false);
  });

  it('should handle serviceError on getAllIssuesForCustomer failure', () => {
    mockAppService.getAllIssuesForCustomer.and.returnValue(throwError(() => new Error('error')));
    component.getAllIssuesForCustomer('C1');
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should toggle visibility for responsible change', () => {
    component._isEmpSelVisible = false;
    component.changeResponsible();
    expect(component._isEmpSelVisible).toBe(true);
  });
});

