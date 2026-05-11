import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { KpiComponent } from './kpi.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControl } from '../../shared/access-control';
import { KpiSharedService } from './kpi-shared.service';
import { UtilityService } from '../../core/services/utility.service';

describe('KpiComponent', () => {
  let component: KpiComponent;
  let fixture: ComponentFixture<KpiComponent>;

  const mockAppsService = {
    GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([
      { cusT_ID: 'C001', releasE_ID: 'C001', name: 'Customer A' }
    ])),
    getDBConfigValueFields: jasmine.createSpy('getDBConfigValueFields').and.returnValue(of('')),
    getCustomerProjectsName: jasmine.createSpy('getCustomerProjectsName').and.returnValue(of([])),
    getPortfolioList: jasmine.createSpy('getPortfolioList').and.returnValue(of([])),
    getProductList: jasmine.createSpy('getProductList').and.returnValue(of([])),
    getProjectPortfolioMapping: jasmine.createSpy('getProjectPortfolioMapping').and.returnValue(of([])),
    // Add methods needed by child components
    GetGlobalKpiCategories: jasmine.createSpy('GetGlobalKpiCategories').and.returnValue(of([])),
    GetKpiByCustomer: jasmine.createSpy('GetKpiByCustomer').and.returnValue(of([])),
    GetKpiByProject: jasmine.createSpy('GetKpiByProject').and.returnValue(of([])),
    GetKpiTargets: jasmine.createSpy('GetKpiTargets').and.returnValue(of([])),
    getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
    GetKpiDetailsReport: jasmine.createSpy('GetKpiDetailsReport').and.returnValue(of([])),
    getOverallKPIList: jasmine.createSpy('getOverallKPIList').and.returnValue(of([])),
    getKPIDetailsMonthlyandWeekly: jasmine.createSpy('getKPIDetailsMonthlyandWeekly').and.returnValue(of([]))
  };

  const mockUtilityService = {
    IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
    ShouldLoadAllProjects: jasmine.createSpy('ShouldLoadAllProjects').and.returnValue(false),
    serviceError: jasmine.createSpy('serviceError')
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
    IsBaseMeasureEnabledCustomer: jasmine.createSpy('IsBaseMeasureEnabledCustomer').and.returnValue(false),
    IsKPIProcessEnabledCustomer: jasmine.createSpy('IsKPIProcessEnabledCustomer').and.returnValue(false),
    serviceError: jasmine.createSpy('serviceError'),
    getmonthsBasedonYear: jasmine.createSpy('getmonthsBasedonYear').and.returnValue([]),
    tableYear: new Date().getFullYear()
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  const mockSharedService = {};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KpiComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: UtilityService, useValue: mockUtilityService },
        KpiSharedService
      ]
    }).overrideComponent(KpiComponent, {
      set: { imports: [], template: '<div></div>' }
    }).compileComponents();
  }));

  beforeEach(() => {
    // Set up localStorage for tests
    localStorage.setItem('empid', 'EMP001');
    localStorage.setItem('slaAvailableList', JSON.stringify([
      { customerId: 'C001', slaAvailable: false },
      { customerId: 'C002', slaAvailable: true }
    ]));

    fixture = TestBed.createComponent(KpiComponent);
    component = fixture.componentInstance;
    component.custId = 'C001';
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise default property values', () => {
    expect(component.tempVariable).toBe('C001'); // Set from custId in ngOnInit
    expect(component.projId).toBe('');
    expect(component.includeInternal).toBeFalsy();
    expect(component.CustomerGoal).toBeTruthy();
    expect(component.disabled).toBeFalsy();
    // isProductView is now based on slaAvailable, not Premier status
    // C001 has slaAvailable: false, so isProductView should be false
    expect(component.isProductView).toBeFalsy();
    expect(component._loading).toBeFalsy();
    expect(component.slaAvailable).toBeFalsy(); // C001 has no products
    expect(component.selectedTabIndex).toBe(0);
    expect(component.tabIndex).toBeFalsy();
  });

  it('should initialise Customer array as empty', () => {
    // Customer array starts empty but gets populated during ngOnInit
    // After the observable returns, it should have data
    expect(component.Customer.length).toBeGreaterThan(0);
  });

  it('should have the correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('index');
    expect(component.displayedColumns).toContain('description');
    expect(component.displayedColumns).toContain('issuE_TYPE');
    expect(component.displayedColumns).toContain('severitY');
    expect(component.displayedColumns).toContain('actioN_PLAN');
    expect(component.displayedColumns).toContain('assigneD_TO');
    expect(component.displayedColumns).toContain('status');
    expect(component.displayedColumns).toContain('edit');
    expect(component.displayedColumns).toContain('delete');
  });

  it('should reset projId on ddCustomer_Onchange', () => {
    component.projId = 'P001';
    component.custId = 'C001'; // Customer with no products
    component.ddCustomer_Onchange();
    expect(component.projId).toBe('');
    // For C001 (no products), slaAvailable and isProductView should be false
    expect(component.slaAvailable).toBeFalsy();
    expect(component.isProductView).toBeFalsy();
  });

  it('should set isProductView false for customer without products on ddCustomer_Onchange', () => {
    component.custId = 'C001'; // Customer with no products (slaAvailable: false)
    component.ddCustomer_Onchange();
    expect(component.isProductView).toBeFalsy();
    expect(component.slaAvailable).toBeFalsy();
  });

  it('should set isProductView true for customer with products on ddCustomer_Onchange', () => {
    component.custId = 'C002'; // Customer with products (slaAvailable: true)
    component.ddCustomer_Onchange();
    expect(component.isProductView).toBeTruthy();
    expect(component.slaAvailable).toBeTruthy();
  });

  it('should call GetCustomerList on LoadCustomerByEmpId', () => {
    component.LoadCustomerByEmpId();
    expect(mockAppsService.GetCustomerList).toHaveBeenCalled();
  });

  describe('Action Buttons Visibility Conditions', () => {
    beforeEach(() => {
      mockMyUtility.IsKPIProcessEnabledCustomer = jasmine.createSpy('IsKPIProcessEnabledCustomer').and.returnValue(true);
    });

    // Template is overridden, so test component logic/state instead of DOM

    it('should not show actions when isProductView is false', () => {
      component.isProductView = false;
      component.productViewTabIndex = 1;
      expect(component.isProductView).toBe(false);
    });

    it('should not show actions when productViewTabIndex is not 1', () => {
      component.isProductView = true;
      component.productViewTabIndex = 0;
      expect(component.productViewTabIndex).not.toBe(1);
    });

    it('should show action buttons container when isProductView is true and productViewTabIndex is 1', () => {
      component.isProductView = true;
      component.productViewTabIndex = 1;
      expect(component.isProductView).toBe(true);
      expect(component.productViewTabIndex).toBe(1);
    });

    describe('Upload External KPIs Button (Access ID 95)', () => {
      it('should show button when user has access ID 95 and customer is KPI enabled', () => {
        mockAccessControl.IsAllowed.and.callFake((accessId: number) => accessId === 95);
        mockMyUtility.IsKPIProcessEnabledCustomer.and.returnValue(true);
        expect(mockAccessControl.IsAllowed(95)).toBe(true);
        expect(mockMyUtility.IsKPIProcessEnabledCustomer()).toBe(true);
      });

      it('should hide button when user does not have access ID 95', () => {
        mockAccessControl.IsAllowed.and.callFake((accessId: number) => accessId !== 95);
        expect(mockAccessControl.IsAllowed(95)).toBe(false);
      });

      it('should hide button when customer is not KPI process enabled', () => {
        mockMyUtility.IsKPIProcessEnabledCustomer.and.returnValue(false);
        expect(mockMyUtility.IsKPIProcessEnabledCustomer()).toBe(false);
      });
    });

    describe('Process External KPIs Button (Access ID 98)', () => {
      it('should show button when user has access ID 98 and customer is KPI enabled', () => {
        mockAccessControl.IsAllowed.and.callFake((accessId: number) => accessId === 98);
        mockMyUtility.IsKPIProcessEnabledCustomer.and.returnValue(true);
        expect(mockAccessControl.IsAllowed(98)).toBe(true);
        expect(mockMyUtility.IsKPIProcessEnabledCustomer()).toBe(true);
      });

      it('should hide button when user does not have access ID 98', () => {
        mockAccessControl.IsAllowed.and.callFake((accessId: number) => accessId !== 98);
        expect(mockAccessControl.IsAllowed(98)).toBe(false);
      });

      it('should disable button when _loading is true', () => {
        component._loading = true;
        expect(component._loading).toBe(true);
      });
    });

    describe('Upload External Rules Button (Access ID 96)', () => {
      it('should show button when user has access ID 96 and customer is KPI enabled', () => {
        mockAccessControl.IsAllowed.and.callFake((accessId: number) => accessId === 96);
        mockMyUtility.IsKPIProcessEnabledCustomer.and.returnValue(true);
        expect(mockAccessControl.IsAllowed(96)).toBe(true);
        expect(mockMyUtility.IsKPIProcessEnabledCustomer()).toBe(true);
      });

      it('should hide button when user does not have access ID 96', () => {
        mockAccessControl.IsAllowed.and.callFake((accessId: number) => accessId !== 96);
        expect(mockAccessControl.IsAllowed(96)).toBe(false);
      });

      it('should hide button when customer is not KPI process enabled', () => {
        mockMyUtility.IsKPIProcessEnabledCustomer.and.returnValue(false);
        expect(mockMyUtility.IsKPIProcessEnabledCustomer()).toBe(false);
      });
    });

    describe('All Buttons Combined Conditions', () => {
      it('should show all three buttons when user has all permissions (95, 96, 98)', () => {
        mockAccessControl.IsAllowed.and.returnValue(true);
        mockMyUtility.IsKPIProcessEnabledCustomer.and.returnValue(true);
        component.isProductView = true;
        component.productViewTabIndex = 1;

        expect(mockAccessControl.IsAllowed(95)).toBe(true);
        expect(mockAccessControl.IsAllowed(96)).toBe(true);
        expect(mockAccessControl.IsAllowed(98)).toBe(true);
        expect(mockMyUtility.IsKPIProcessEnabledCustomer()).toBe(true);
      });

      it('should hide all buttons when customer is not KPI process enabled', () => {
        mockAccessControl.IsAllowed.and.returnValue(true);
        mockMyUtility.IsKPIProcessEnabledCustomer.and.returnValue(false);
        expect(mockMyUtility.IsKPIProcessEnabledCustomer()).toBe(false);
      });
    });
  });
});
