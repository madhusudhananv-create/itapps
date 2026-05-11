import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { ManageKpiMetricsComponent } from './manage-kpi-metrics.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { provideHttpClient } from '@angular/common/http';

const mockCustomers = [{ cusT_ID: 'C001', cusT_NM: 'Customer 1' }];
const mockProducts = [{ id: 1, producT_TITLE: 'Product A' }];
const mockModes = [{ id: 1, modE_TITLE: 'Mode 1' }];
const mockLevels = [{ id: 1, servicE_LEVEL: 'Standard' }];
const mockKpiDefs = [
  { kpI_ID: 101, tier: 1, kpI_NAME: 'KPI 1', uniT_OF_MEASUREMENT: '%', expecteD_SERVICE_LEVEL: 95, minimuM_SERVICE_LEVEL: 90 }
];

describe('ManageKpiMetricsComponent', () => {
  let component: ManageKpiMetricsComponent;
  let fixture: ComponentFixture<ManageKpiMetricsComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockSharedService: any;
  let mockAccessService: any;
  let mockDialog: any;
  let paramSubject: Subject<any>;
  let methodCalled$: Subject<void>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();
    methodCalled$ = new Subject<void>();

    mockAppsService = {
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of(mockCustomers)),
      getProductList: jasmine.createSpy('getProductList').and.returnValue(of(mockProducts)),
      GetPortfolioWithProductList: jasmine.createSpy('GetPortfolioWithProductList').and.returnValue(of([])),
      getAllServiceMode: jasmine.createSpy('getAllServiceMode').and.returnValue(of(mockModes)),
      getProductServiceArea: jasmine.createSpy('getProductServiceArea').and.returnValue(of([])),
      getServiceReference: jasmine.createSpy('getServiceReference').and.returnValue(of([])),
      GetGlobalKpiCategories: jasmine.createSpy('GetGlobalKpiCategories').and.returnValue(of([])),
      getServiceLevel: jasmine.createSpy('getServiceLevel').and.returnValue(of(mockLevels)),
      getAllKpiByModeId: jasmine.createSpy('getAllKpiByModeId').and.returnValue(of(mockKpiDefs)),
      deleteKpiForProduct: jasmine.createSpy('deleteKpiForProduct').and.returnValue(of({}))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarningPopup: jasmine.createSpy('showWarningPopup')
    };

    mockSharedService = { methodCalled$: methodCalled$.asObservable() };
    mockAccessService = {};

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    TestBed.configureTestingModule({
      imports: [ManageKpiMetricsComponent, MatSnackBarModule, MatDialogModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AccessControlService, useValue: mockAccessService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable(), snapshot: { params: {} } } },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageKpiMetricsComponent);
    component = fixture.componentInstance;
    component.custId = 'C001';
    localStorage.setItem('empid', 'EMP001');
  });

  afterEach(() => localStorage.removeItem('empid'));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getCustomerDetailsSummary', () => {
      fixture.detectChanges();
      expect(mockAppsService.GetCustomerList).toHaveBeenCalled();
    });

    it('should call GetDBConfigValue to check portfolio customers', () => {
      fixture.detectChanges();
      expect(mockAppsService.GetDBConfigValue).toHaveBeenCalledWith('PORTFOLIO_ENABLED_CUSTOMERS', -1, '');
    });

    it('should set custId from route params if provided', () => {
      component.custId = '';
      fixture.detectChanges();
      paramSubject.next({ custid: 'C002' });
      expect(component.custId).toBe('C002');
    });
  });

  // ─── getCustomerDetailsSummary ────────────────────────────────────────────

  describe('getCustomerDetailsSummary', () => {
    it('should populate Customer array', () => {
      fixture.detectChanges();
      expect(component.Customer.length).toBeGreaterThan(0);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerList.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getPortfolioDetails ──────────────────────────────────────────────────

  describe('getPortfolioDetails', () => {
    it('should call getProductList when no portfolio', () => {
      fixture.detectChanges();
      component.includePortfolio = false;
      component.getPortfolioDetails('C001');
      expect(mockAppsService.getProductList).toHaveBeenCalled();
    });

    it('should call GetPortfolioWithProductList when portfolio enabled', () => {
      fixture.detectChanges();
      component.includePortfolio = true;
      component.getPortfolioDetails('C001');
      expect(mockAppsService.GetPortfolioWithProductList).toHaveBeenCalled();
    });
  });

  // ─── LoadProductData ──────────────────────────────────────────────────────

  describe('LoadProductData', () => {
    it('should show warning when productId is empty', () => {
      fixture.detectChanges();
      component.LoadProductData('');
      expect(mockMyUtility.showWarningPopup).toHaveBeenCalled();
    });

    it('should call loadProductModes for valid productId', () => {
      fixture.detectChanges();
      component.LoadProductData('P001');
      expect(mockAppsService.getAllServiceMode).toHaveBeenCalledWith('P001');
    });
  });

  // ─── loadProductModes ─────────────────────────────────────────────────────

  describe('loadProductModes', () => {
    it('should populate serviceModes and set selectedMode', () => {
      fixture.detectChanges();
      component.loadProductModes('P001');
      expect(component.serviceModes).toEqual(mockModes);
      expect(component.selectedMode).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getAllServiceMode.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.loadProductModes('P001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── loadServiceLevel / ddlevel_Onchange ──────────────────────────────────

  describe('loadServiceLevel', () => {
    it('should populate serviceLevel and call ddlevel_Onchange', () => {
      fixture.detectChanges();
      component.selectedMode = 1;
      component.productId = 'P001';
      component.loadServiceLevel();
      expect(component.serviceLevel).toEqual(mockLevels);
    });
  });

  describe('ddlevel_Onchange', () => {
    it('should populate kpiDefinitions and set showTable=true', () => {
      fixture.detectChanges();
      component.selectedMode = 1;
      component.productId = 'P001';
      component.ddlevel_Onchange(1);
      expect(component.kpiDefinitions).toEqual(mockKpiDefs);
      expect(component.showTable).toBe(true);
    });

    it('should set showTable=false when no kpi data', () => {
      mockAppsService.getAllKpiByModeId.and.returnValue(of([]));
      fixture.detectChanges();
      component.selectedMode = 1;
      component.ddlevel_Onchange(1);
      expect(component.showTable).toBe(false);
    });
  });

  // ─── getmeasurementforServiceLevel ────────────────────────────────────────

  describe('getmeasurementforServiceLevel', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.kpiDefinitions = mockKpiDefs;
    });

    it('should return value with % for percentage UOM', () => {
      expect(component.getmeasurementforServiceLevel(101)).toBe('95%');
    });

    it('should return empty string for unknown kpiId', () => {
      expect(component.getmeasurementforServiceLevel(999)).toBe('');
    });
  });

  describe('getmeasurementforMinServiceLevel', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.kpiDefinitions = mockKpiDefs;
    });

    it('should return min service level with % for percentage UOM', () => {
      expect(component.getmeasurementforMinServiceLevel(101)).toBe('90%');
    });
  });

  // ─── DeleteRow_onClick ────────────────────────────────────────────────────

  describe('DeleteRow_onClick', () => {
    let dialogSpy: jasmine.Spy;

    beforeEach(() => {
      fixture.detectChanges();
      dialogSpy = spyOn(component.dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as any);
    });

    it('should open confirmation dialog', () => {
      component.DeleteRow_onClick({ kpI_ID: 101 });
      expect(dialogSpy).toHaveBeenCalled();
    });

    it('should call deleteKpiForProduct on confirm', () => {
      component.productId = 'P001';
      component.DeleteRow_onClick({ kpI_ID: 101 });
      expect(mockAppsService.deleteKpiForProduct).toHaveBeenCalledWith(101);
    });

    it('should NOT delete when dialog cancelled', () => {
      dialogSpy.and.returnValue({ afterClosed: () => of(false) } as any);
      component.DeleteRow_onClick({ kpI_ID: 101 });
      expect(mockAppsService.deleteKpiForProduct).not.toHaveBeenCalled();
    });
  });

  // ─── addKPI ────────────────────────────────────────────────────────────────

  describe('addKPI', () => {
    it('should show warning when productId not set', () => {
      fixture.detectChanges();
      const dialogSpy = spyOn(component.dialog, 'open');
      component.productId = undefined;
      component.addKPI();
      expect(dialogSpy).not.toHaveBeenCalled();
    });

    it('should open MasterKpiComponent dialog when productId is set', () => {
      fixture.detectChanges();
      const dialogSpy = spyOn(component.dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as any);
      component.productId = 'P001';
      component.addKPI();
      expect(dialogSpy).toHaveBeenCalled();
    });
  });

  // ─── RefreshTable ─────────────────────────────────────────────────────────

  describe('RefreshTable', () => {
    it('should update dataSource with new data', (done) => {
      fixture.detectChanges();
      component.RefreshTable(mockKpiDefs);
      setTimeout(() => {
        expect(component.dataSource.data).toEqual(mockKpiDefs);
        done();
      }, 20);
    });
  });
});
