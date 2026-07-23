import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { DashboardCustomerMultipleComponent } from './dashboard-customer-multiple.component';
import { AppsService } from '../../../core/services/apps.service';
import { AuthService } from '../../../core/services/auth.service';
import { MyUtility } from '../../../shared/my-utility';
import { CustomerModel } from '../../../models/customer.model';
import { DashboardDetailsModel } from '../../../models/dashboard-details.model';

const mockCustomers: CustomerModel[] = [
  { cusT_ID: 'C001', cusT_NM: 'Customer One', iS_SLA_AVAILABLE: false } as CustomerModel,
  { cusT_ID: 'C002', cusT_NM: 'Customer Two', iS_SLA_AVAILABLE: true } as CustomerModel
];

const mockDashboardDetails: DashboardDetailsModel[] = [
  { title: 'OVERALL_HEALTH', content: 'Green', cusT_ID: 'C001', proJ_ID: null, portfoliO_ID: null, color: 'green' } as any,
  { title: 'CRISP_C', content: '85', cusT_ID: 'C001', proJ_ID: null, portfoliO_ID: null, color: 'green' } as any,
  { title: 'RISK_ISSUE_TOTAL', content: '3', cusT_ID: 'C001', proJ_ID: null, portfoliO_ID: null, color: 'red' } as any,
  { title: 'OVERALL_HEALTH', content: 'Amber', cusT_ID: 'C002', proJ_ID: 'P001', portfoliO_ID: null, color: 'amber' } as any,
];

describe('DashboardCustomerMultipleComponent', () => {
  let component: DashboardCustomerMultipleComponent;
  let fixture: ComponentFixture<DashboardCustomerMultipleComponent>;
  let mockAppsService: any;
  let mockAuthService: any;
  let mockMyUtility: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockMediaMatcher: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      getCustomerList: jasmine.createSpy('getCustomerList').and.returnValue(of(mockCustomers)),
      getDashboardDetailsByCustomerIds: jasmine.createSpy('getDashboardDetailsByCustomerIds').and.returnValue(of(mockDashboardDetails)),
      refreshDashboardDetails: jasmine.createSpy('refreshDashboardDetails').and.returnValue(of({})),
      checkProjectAllocationExpiry: jasmine.createSpy('checkProjectAllocationExpiry').and.returnValue(of('')),
      updateClient: jasmine.createSpy('updateClient').and.returnValue(of({})),
      updateRags: jasmine.createSpy('updateRags').and.returnValue(of({})),
      getLastUpdatedDate: jasmine.createSpy('getLastUpdatedDate').and.returnValue(of({})),
      authenticatewithtoken: jasmine.createSpy('authenticatewithtoken').and.returnValue(of({})),
      logout: jasmine.createSpy('logout').and.returnValue(of({})),
      getBusinessUnits: jasmine.createSpy('getBusinessUnits').and.returnValue(of([{ cusT_ID: 'C001', BUSINESS_UNIT: 'BU1' }])),
      getProjectBUMapping: jasmine.createSpy('getProjectBUMapping').and.returnValue(of([]))
    };

    mockAuthService = {
      isGAVSUser: jasmine.createSpy('isGAVSUser').and.returnValue(false)
    };

    mockMyUtility = {
      Month: jasmine.createSpy('Month').and.returnValue('Apr'),
      Year: jasmine.createSpy('Year').and.returnValue(2026),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      }),
      showWarningPopup: jasmine.createSpy('showWarningPopup'),
      serviceError: jasmine.createSpy('serviceError')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    const mockMediaQueryList = {
      matches: false,
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener')
    };

    mockMediaMatcher = {
      matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
    };

    TestBed.configureTestingModule({
      imports: [DashboardCustomerMultipleComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: AppsService, useValue: mockAppsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        provideHttpClient(),
        provideAnimations()
      ]
    })
    .overrideComponent(DashboardCustomerMultipleComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCustomerMultipleComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP01');
    localStorage.setItem('displayname', 'Test User');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
    localStorage.removeItem('displayname');
    localStorage.removeItem('CustomerIds');
    localStorage.removeItem('slaAvailableList');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set empid from localStorage', () => {
      fixture.detectChanges();
      expect(component.empid).toBe('EMP01');
    });

    it('should set displayname from localStorage', () => {
      fixture.detectChanges();
      expect(component.displayname).toBe('Test User');
    });

    it('should call service_LoadCustomerByEmpId on init', () => {
      spyOn(component, 'service_LoadCustomerByEmpId');
      fixture.detectChanges();
      expect(component.service_LoadCustomerByEmpId).toHaveBeenCalled();
    });

    it('should call startTimer on init', () => {
      spyOn(component, 'startTimer');
      fixture.detectChanges();
      expect(component.startTimer).toHaveBeenCalled();
    });
  });

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call pauseTimer on destroy', () => {
      fixture.detectChanges();
      spyOn(component, 'pauseTimer');
      component.ngOnDestroy();
      expect(component.pauseTimer).toHaveBeenCalled();
    });
  });

  // ─── service_LoadCustomerByEmpId ──────────────────────────────────────────

  describe('service_LoadCustomerByEmpId', () => {
    it('should populate customerList from service', () => {
      fixture.detectChanges();
      expect(component.customerList.length).toBe(2);
    });

    it('should store CustomerIds in localStorage', () => {
      fixture.detectChanges();
      const stored = localStorage.getItem('CustomerIds');
      expect(stored).not.toBeNull();
    });

    it('should call service_GetDashboardDetails after loading customers', () => {
      spyOn(component, 'service_GetDashboardDetails');
      fixture.detectChanges();
      expect(component.service_GetDashboardDetails).toHaveBeenCalled();
    });

    it('should open dialog when no customers returned', () => {
      mockAppsService.getCustomerList.and.returnValue(of([]));
      component.service_LoadCustomerByEmpId();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should set progress to false on success', () => {
      fixture.detectChanges();
      expect(component.progress).toBe(false);
    });

    it('should set progress to false on error', () => {
      mockAppsService.getCustomerList.and.returnValue(throwError(() => new Error('fail')));
      component.service_LoadCustomerByEmpId();
      expect(component.progress).toBe(false);
    });
  });

  // ─── service_GetDashboardDetails ──────────────────────────────────────────

  describe('service_GetDashboardDetails', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should populate dashboardDetails', () => {
      expect(component.dashboardDetails.length).toBe(4);
    });

    it('should filter dashboardDetailsCustomerLevel to only entries without proJ_ID', () => {
      expect(component.dashboardDetailsCustomerLevel.every(d => !d.proJ_ID)).toBe(true);
    });

    it('should call checkProjectAllocationExpiry', () => {
      component.service_GetDashboardDetails();
      expect(mockAppsService.checkProjectAllocationExpiry).toHaveBeenCalled();
    });
  });

  // ─── getTitleByCustomerId ─────────────────────────────────────────────────

  describe('getTitleByCustomerId', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return content for matching customer and category', () => {
      const result = component.getTitleByCustomerId('OVERALL_HEALTH', 'C001');
      expect(result).toBe('Green');
    });

    it('should return empty string when dashboardDetailsCustomerLevel is empty', () => {
      component.dashboardDetailsCustomerLevel = [];
      expect(component.getTitleByCustomerId('OVERALL_HEALTH', 'C001')).toBe('');
    });

    it('should return empty string when customer not found', () => {
      const result = component.getTitleByCustomerId('OVERALL_HEALTH', 'UNKNOWN');
      expect(result).toBe('');
    });
  });

  // ─── getColorByCustomerId ─────────────────────────────────────────────────

  describe('getColorByCustomerId', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return color for matching customer and category', () => {
      const result = component.getColorByCustomerId('OVERALL_HEALTH', 'C001');
      expect(result).toBe('green');
    });

    it('should return empty string when not found', () => {
      const result = component.getColorByCustomerId('UNKNOWN', 'C001');
      expect(result).toBe('');
    });
  });

  // ─── hasRisksOrIssues ─────────────────────────────────────────────────────

  describe('hasRisksOrIssues', () => {
    beforeEach(() => {
      component.dashboardDetailsCustomerLevel = [
        { title: 'RISK_ISSUE_H_TOTAL', content: '2', cusT_ID: 'C001', proJ_ID: null },
        { title: 'RISK_ISSUE_M_TOTAL', content: '1', cusT_ID: 'C001', proJ_ID: null },
        { title: 'RISK_ISSUE_L_TOTAL', content: '0', cusT_ID: 'C001', proJ_ID: null }
      ] as any;
    });

    it('should return true when RISK_ISSUE_TOTAL > 0', () => {
      expect(component.hasRisksOrIssues('C001')).toBe(true);
    });

    it('should return false when customer not found', () => {
      expect(component.hasRisksOrIssues('UNKNOWN')).toBe(false);
    });
  });

  // ─── EditCust / SaveCust / CancelCust ─────────────────────────────────────

  describe('Customer RAG editing', () => {
    it('should set EditCustIndex and EditCustId on EditCust_onClick', () => {
      component.EditCust_onClick(1, 'C001');
      expect(component.EditCustIndex).toBe(1);
      expect(component.EditCustId).toBe('C001');
    });

    it('IsReadonlyCust should return false for active edit row', () => {
      component.EditCust_onClick(1, 'C001');
      expect(component.IsReadonlyCust(1, 'C001')).toBe(false);
    });

    it('IsReadonlyCust should return true for non-active row', () => {
      component.EditCust_onClick(1, 'C001');
      expect(component.IsReadonlyCust(0, 'C002')).toBe(true);
    });

    it('should reset EditCustIndex and EditCustId on CancelCust_onClick', () => {
      component.EditCust_onClick(1, 'C001');
      component.CancelCust_onClick();
      expect(component.EditCustIndex).toBe(-1);
      expect(component.EditCustId).toBe('');
    });

    it('should call updateClient and reset edit state on SaveCust_onClick', () => {
      fixture.detectChanges();
      component.EditCust_onClick(0, 'C001');
      component.SaveCust_onClick(mockCustomers[0], 'Amber');
      expect(mockAppsService.updateClient).toHaveBeenCalled();
      expect(component.EditCustIndex).toBe(-1);
    });
  });

  // ─── EditProj / SaveProj / CancelProj ────────────────────────────────────

  describe('Project RAG editing', () => {
    it('should set EditProjIndex and EditProjId on EditProj_onClick', () => {
      component.EditProj_onClick(2, 'P001');
      expect(component.EditProjIndex).toBe(2);
      expect(component.EditProjId).toBe('P001');
    });

    it('IsReadonlyProj should return false for active edit row', () => {
      component.EditProj_onClick(2, 'P001');
      expect(component.IsReadonlyProj(2, 'P001')).toBe(false);
    });

    it('should reset state on CancelProj_onClick', () => {
      component.EditProj_onClick(2, 'P001');
      component.CancelProj_onClick();
      expect(component.EditProjIndex).toBe(-1);
      expect(component.EditProjId).toBe('');
    });
  });

  // ─── getClientBG / getProjectBG ───────────────────────────────────────────

  describe('getClientBG', () => {
    it('should return lightgray for active row', () => {
      component.EditCustIndex = 0;
      component.EditCustId = 'C001';
      expect(component.getClientBG(0, 'C001')).toBe('lightgray');
    });

    it('should return white for non-active row', () => {
      expect(component.getClientBG(0, 'C001')).toBe('white');
    });
  });

  describe('getProjectBG', () => {
    it('should return lightgray for active project row', () => {
      component.EditProjIndex = 1;
      component.EditProjId = 'P001';
      expect(component.getProjectBG(1, 'P001')).toBe('lightgray');
    });

    it('should return white for non-active project row', () => {
      expect(component.getProjectBG(1, 'P001')).toBe('white');
    });
  });

  // ─── ResetFilter ──────────────────────────────────────────────────────────

  describe('ResetFilter', () => {
    it('should navigate to newdashboard when SLA is not available', () => {
      fixture.detectChanges();
      component.ResetFilter('C001', false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/newdashboard/cust', 'C001', true]);
    });

    it('should navigate to serviceleveldashboard when SLA is available', () => {
      fixture.detectChanges();
      component.ResetFilter('C002', true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/serviceleveldashboard/cust', 'C002', true]);
    });
  });

  // ─── trackByCustomerId ────────────────────────────────────────────────────

  describe('trackByCustomerId', () => {
    it('should return the customer cusT_ID', () => {
      expect(component.trackByCustomerId(0, mockCustomers[0])).toBe('C001');
    });
  });

  // ─── today ────────────────────────────────────────────────────────────────

  describe('today', () => {
    it('should return a Date instance close to now', () => {
      const before = Date.now();
      const result = component.today();
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  // ─── enablestatus_onClick ─────────────────────────────────────────────────

  describe('enablestatus_onClick', () => {
    it('should toggle enablestatus', () => {
      component.enablestatus = true;
      component.enablestatus_onClick();
      expect(component.enablestatus).toBe(false);
      component.enablestatus_onClick();
      expect(component.enablestatus).toBe(true);
    });
  });
});
