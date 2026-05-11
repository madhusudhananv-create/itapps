import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ManageKpiProductEntryComponent } from './manage-kpi-product-entry.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { provideHttpClient } from '@angular/common/http';

describe('ManageKpiProductEntryComponent', () => {
  let component: ManageKpiProductEntryComponent;
  let fixture: ComponentFixture<ManageKpiProductEntryComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockSharedService: any;
  let mockAccessService: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([])),
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of([])),
      getProductList: jasmine.createSpy('getProductList').and.returnValue(of([])),
      GetProductDetails: jasmine.createSpy('GetProductDetails').and.returnValue(of([])),
      GetInitialDataForCRUDProduct: jasmine.createSpy('GetInitialDataForCRUDProduct').and.returnValue(of({ productTier: [], productModes: [], serviceAreas: [] })),
      getAuditeeDetails: jasmine.createSpy('getAuditeeDetails').and.returnValue(of([])),
      getAllServiceMode: jasmine.createSpy('getAllServiceMode').and.returnValue(of([])),
      getServiceLevel: jasmine.createSpy('getServiceLevel').and.returnValue(of([]))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      ApplyCriteriaRange: jasmine.createSpy('ApplyCriteriaRange').and.returnValue([]),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({ afterClosed: () => of(true) })
    };

    mockSharedService = {
      methodCalled$: of(null),
      callMethod: jasmine.createSpy('callMethod')
    };

    mockAccessService = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };

    TestBed.configureTestingModule({
      imports: [ManageKpiProductEntryComponent, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AccessControlService, useValue: mockAccessService },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { custid: 'C001' } }, params: of({ custid: 'C001' }) } },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageKpiProductEntryComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP001');
  });

  afterEach(() => localStorage.removeItem('empid'));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set custId from snapshot params', () => {
      fixture.detectChanges();
      expect(component.custId).toBe('C001');
    });
  });

  // ─── Component Properties ─────────────────────────────────────────────────

  describe('default state', () => {
    it('should initialize IsBackButtonEnabled as false', () => {
      fixture.detectChanges();
      expect(component.IsBackButtonEnabled).toBe(false);
    });

    it('should initialize isIdeaSubmitted as false', () => {
      fixture.detectChanges();
      expect(component.isIdeaSubmitted).toBe(false);
    });

    it('should initialize menuToggleStatus as false', () => {
      fixture.detectChanges();
      expect(component.menuToggleStatus).toBe(false);
    });
  });
});
