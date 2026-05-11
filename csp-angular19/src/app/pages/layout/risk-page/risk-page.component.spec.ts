import { provideNoopAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RiskPageComponent } from './risk-page.component';
import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { SharedService } from '../../../shared/shared.service';
import { LayoutService } from '../../../features/layout/layout.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { AppsService as CoreAppsService } from '../../../core/services/apps.service';

describe('RiskPageComponent', () => {
  let component: RiskPageComponent;
  let fixture: ComponentFixture<RiskPageComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockShared: any;
  let mockDialog: any;
  let mockLayoutService: any;
  let mockCoreAppService: any;

  beforeEach(waitForAsync(() => {
    mockCoreAppService = {
      getCustomerProjectsName: jasmine.createSpy().and.returnValue(of([])),
      getPortfolioList: jasmine.createSpy().and.returnValue(of([])),
      getProductList: jasmine.createSpy().and.returnValue(of([])),
      getProjectPortfolioMapping: jasmine.createSpy().and.returnValue(of([]))
    };
    mockAppService = {
      GetRiskDetailsByCustomerId: jasmine.createSpy().and.returnValue(of({ riskDetails: [], editAllowed: false })),
      GetCustomerProjectsName: jasmine.createSpy().and.returnValue(of([])),
      GetRiskCategory: jasmine.createSpy().and.returnValue(of([])),
      GetRiskLocation: jasmine.createSpy().and.returnValue(of([])),
      GetEmployeeNames: jasmine.createSpy().and.returnValue(of([])),
      addRisk: jasmine.createSpy().and.returnValue(of({ id: 1 })),
      updateRisk: jasmine.createSpy().and.returnValue(of({ id: 1 })),
      deleteRisk: jasmine.createSpy().and.returnValue(of({})),
      getActionItemsforRisk: jasmine.createSpy().and.returnValue(of([]))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      IsPremier: jasmine.createSpy().and.returnValue(false),
      ShouldLoadAllProjects: jasmine.createSpy().and.returnValue(false),
      ApplyCriteriaRange: jasmine.createSpy().and.returnValue([])
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
    mockLayoutService = {
      selectedCust: 'C1'
    };

    TestBed.configureTestingModule({
      imports: [RiskPageComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: UtilityService, useValue: mockUtil },
        { provide: AccessControlService, useValue: mockAccess },
        { provide: SharedService, useValue: mockShared },
        { provide: MatDialog, useValue: mockDialog },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {}, params: { custid: 'C1' } }, params: of({ custid: 'C1' }) } },
        { provide: CoreAppsService, useValue: mockCoreAppService },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.overrideProvider(AppsService, { useValue: mockAppService });
    TestBed.overrideProvider(UtilityService, { useValue: mockUtil });
    TestBed.overrideProvider(AccessControlService, { useValue: mockAccess });
    TestBed.overrideProvider(SharedService, { useValue: mockShared });
    TestBed.overrideProvider(MatDialog, { useValue: mockDialog });
    TestBed.overrideProvider(LayoutService, { useValue: mockLayoutService });
    TestBed.overrideProvider(CoreAppsService, { useValue: mockCoreAppService });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskPageComponent);
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
    expect(component.newRisk).toBe(false);
    expect(component.isLoading).toBe(false);
  });

  it('should call service_getRiskDetailsByCustomerId on init', () => {
    expect(mockAppService.GetRiskDetailsByCustomerId).toHaveBeenCalled();
  });

  it('should call getAllProjectsFromCustomer on init', () => {
    expect(mockAppService.GetCustomerProjectsName).toHaveBeenCalled();
  });

  it('should call getAllRiskCategories on init', () => {
    expect(mockAppService.GetRiskCategory).toHaveBeenCalled();
  });

  it('should set input data from service response', () => {
    const mockRisks = [{ id: 1, description: 'Test Risk', status: 'Open' }];
    mockAppService.GetRiskDetailsByCustomerId.and.returnValue(of({ riskDetails: mockRisks, editAllowed: false }));
    component.service_getRiskDetailsByCustomerId('C1');
    expect(component.input).toEqual(mockRisks as any);
  });

  it('should handle serviceError on risk load failure', () => {
    mockAppService.GetRiskDetailsByCustomerId.and.returnValue(throwError(() => new Error('error')));
    component.service_getRiskDetailsByCustomerId('C1');
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });
});
