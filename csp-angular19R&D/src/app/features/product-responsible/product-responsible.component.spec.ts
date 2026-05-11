import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { ProductResponsibleComponent } from './product-responsible.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { provideHttpClient } from '@angular/common/http';

const mockCustomers = [
  { cusT_ID: 'C001', cusT_NM: 'Acme' },
  { cusT_ID: 'C002', cusT_NM: 'Beta Corp' }
];
const mockProductList = [
  { id: 1, producT_TITLE: 'Product A' },
  { id: 2, producT_TITLE: 'Product B' }
];
const mockResponsibleData = [
  { id: 1, managemenT_TYPE: 'CSM', name: 'Alice', effectivE_FROM: '2024-01-01' },
  { id: 2, managemenT_TYPE: 'QA', name: 'Bob', effectivE_FROM: '2024-02-01' }
];
const mockMgmtTypes = [
  { id: 1, managemenT_TYPE: 'CSM' },
  { id: 2, managemenT_TYPE: 'QUALITYSPOC' },
  { id: 3, managemenT_TYPE: 'PROJECT' }
];
const mockQAList = [{ emP_ID: 'E001', frsT_NM: 'QA User' }];
const mockCustContacts = [{ contacT_NAME: 'Alice', contacT_EMAILID: 'alice@test.com' }];
const mockCustEmployees = [{ emP_ID: 'E002', name: 'Bob' }];
const mockProjectList = [{ proJ_ID: 'P001', proJ_NM: 'Project Alpha' }];
const mockPortfolioList = [{ id: 1, title: 'Portfolio A', products: [] }];

describe('ProductResponsibleComponent', () => {
  let component: ProductResponsibleComponent;
  let fixture: ComponentFixture<ProductResponsibleComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockSharedService: any;
  let mockAccessService: any;
  let mockDialog: any;
  let paramSubject: Subject<any>;
  let methodCalledSubject: Subject<void>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();
    methodCalledSubject = new Subject<void>();

    mockAppsService = {
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of(mockCustomers)),
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjectList)),
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('C001')),
      GetPortfolioWithProductList: jasmine.createSpy('GetPortfolioWithProductList').and.returnValue(of(mockPortfolioList)),
      getProductList: jasmine.createSpy('getProductList').and.returnValue(of(mockProductList)),
      getproductResponsibleDetails: jasmine.createSpy('getproductResponsibleDetails').and.returnValue(of(mockResponsibleData)),
      GetProductListByCustId: jasmine.createSpy('GetProductListByCustId').and.returnValue(of(mockProductList)),
      getProductResponsibleManagementTypeDetails: jasmine.createSpy('getProductResponsibleManagementTypeDetails').and.returnValue(of(mockMgmtTypes)),
      GetQASpocDetails: jasmine.createSpy('GetQASpocDetails').and.returnValue(of(mockQAList)),
      getEmployeeDetailsfromCustomer: jasmine.createSpy('getEmployeeDetailsfromCustomer').and.returnValue(of(mockCustEmployees)),
      getCustomerContacts: jasmine.createSpy('getCustomerContacts').and.returnValue(of(mockCustContacts)),
      AddUpdateProductResponsible: jasmine.createSpy('AddUpdateProductResponsible').and.returnValue(of({})),
      DeleteProductResponsible: jasmine.createSpy('DeleteProductResponsible').and.returnValue(of({}))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError')
    };

    mockSharedService = {
      methodCalled$: methodCalledSubject.asObservable()
    };

    mockAccessService = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    TestBed.configureTestingModule({
      imports: [ProductResponsibleComponent, MatDialogModule, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AccessControlService, useValue: mockAccessService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductResponsibleComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP001');
  });

  afterEach(() => localStorage.removeItem('empid'));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── Default state ─────────────────────────────────────────────────────────

  describe('default state', () => {
    it('should have IsBackButtonEnabled=true by default', () => {
      fixture.detectChanges();
      expect(component.IsBackButtonEnabled).toBe(true);
    });

    it('should have readonlymode=true and editmode=false', () => {
      fixture.detectChanges();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should have correct displayedColumns', () => {
      fixture.detectChanges();
      expect(component.displayedColumns).toEqual(['index', 'managemenT_TYPE', 'name', 'effectivE_FROM', 'action']);
    });
  });

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set custId from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.custId).toBe('C001');
    });

    it('should call GetDBConfigValue for PORTFOLIO_ENABLED_CUSTOMERS', () => {
      fixture.detectChanges();
      expect(mockAppsService.GetDBConfigValue).toHaveBeenCalledWith('PORTFOLIO_ENABLED_CUSTOMERS', -1, '');
    });

    it('should call getCustomerDetailsSummary on init', () => {
      spyOn(component, 'getCustomerDetailsSummary');
      fixture.detectChanges();
      expect(component.getCustomerDetailsSummary).toHaveBeenCalled();
    });

    it('should call getAllProjectsFromCustomer on init', () => {
      spyOn(component, 'getAllProjectsFromCustomer');
      fixture.detectChanges();
      expect(component.getAllProjectsFromCustomer).toHaveBeenCalled();
    });

    it('should call getProductPortfolioMapping when methodCalled$ emits', () => {
      spyOn(component, 'getProductPortfolioMapping');
      fixture.detectChanges();
      methodCalledSubject.next();
      expect(component.getProductPortfolioMapping).toHaveBeenCalledWith(0);
    });
  });

  // ─── getCustomerDetailsSummary ─────────────────────────────────────────────

  describe('getCustomerDetailsSummary', () => {
    it('should set Customer list filtered by custId', () => {
      fixture.detectChanges();
      component.custId = 'C001';
      component.getCustomerDetailsSummary('C001');
      expect(component.Customer.length).toBe(1);
      expect(component.Customer[0].cusT_ID).toBe('C001');
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerList.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getCustomerDetailsSummary('C001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getPortfolioDetails ───────────────────────────────────────────────────

  describe('getPortfolioDetails', () => {
    it('should call GetPortfolioWithProductList when includePortfolio=true', () => {
      fixture.detectChanges();
      component.includePortfolio = true;
      component.custId = 'C001';
      component.getPortfolioDetails('C001');
      expect(mockAppsService.GetPortfolioWithProductList).toHaveBeenCalledWith('C001');
    });

    it('should call getProductList when includePortfolio=false', () => {
      fixture.detectChanges();
      component.includePortfolio = false;
      component.custId = 'C001';
      component.getPortfolioDetails('C001');
      expect(mockAppsService.getProductList).toHaveBeenCalledWith('C001', 0);
    });

    it('should set portfolioList when includePortfolio=true', () => {
      fixture.detectChanges();
      component.includePortfolio = true;
      component.getPortfolioDetails('C001');
      expect(component.portfolioList).toEqual(mockPortfolioList);
    });
  });

  // ─── getProductPortfolioMapping ────────────────────────────────────────────

  describe('getProductPortfolioMapping', () => {
    it('should set productList from service', () => {
      fixture.detectChanges();
      component.custId = 'C001';
      component.getProductPortfolioMapping(0);
      expect(component.productList).toEqual(mockProductList);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getProductList.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.custId = 'C001';
      component.getProductPortfolioMapping(0);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getProductResponsibleSummary ──────────────────────────────────────────

  describe('getProductResponsibleSummary', () => {
    it('should populate dataSource when productId is valid', () => {
      fixture.detectChanges();
      component.getProductResponsibleSummary(1);
      expect(mockAppsService.getproductResponsibleDetails).toHaveBeenCalledWith(1);
    });

    it('should not call service when productId is null', () => {
      fixture.detectChanges();
      mockAppsService.getproductResponsibleDetails.calls.reset();
      component.getProductResponsibleSummary(null);
      expect(mockAppsService.getproductResponsibleDetails).not.toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getproductResponsibleDetails.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getProductResponsibleSummary(1);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── Edit_onClick / Cancel_onClick / EditRow_onClick ──────────────────────

  describe('Edit_onClick', () => {
    it('should set editmode=true and readonlymode=false', () => {
      fixture.detectChanges();
      component.Edit_onClick();
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
    });

    it('should set disableProduct=true when flag=1', () => {
      fixture.detectChanges();
      component.Edit_onClick(1);
      expect(component.disableProduct).toBe(true);
    });

    it('should set disableProduct=false when flag=0', () => {
      fixture.detectChanges();
      component.Edit_onClick(0);
      expect(component.disableProduct).toBe(false);
    });

    it('should call getAllProductsList and getQASpocDetails', () => {
      fixture.detectChanges();
      component.custId = 'C001';
      component.Edit_onClick();
      expect(mockAppsService.GetProductListByCustId).toHaveBeenCalled();
      expect(mockAppsService.GetQASpocDetails).toHaveBeenCalled();
    });
  });

  describe('Cancel_onClick', () => {
    it('should reset to readonlymode', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.Cancel_onClick();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });
  });

  describe('EditRow_onClick', () => {
    it('should copy element to editItem and call Edit_onClick', () => {
      fixture.detectChanges();
      component.custId = 'C001';
      const element = { id: 1, managemenT_TYPE: 'CSM', name: 'Alice' };
      component.EditRow_onClick(element);
      expect(component.editItem.id).toBe(1);
      expect(component.disableProduct).toBe(true);
    });
  });

  // ─── DeleteRow_onClick ────────────────────────────────────────────────────

  describe('DeleteRow_onClick', () => {
    it('should call DeleteProductResponsible when dialog confirmed', () => {
      fixture.detectChanges();
      spyOn(component['dialog'], 'open').and.returnValue({ afterClosed: () => of(true) } as any);
      component.productId = 1;
      component.DeleteRow_onClick({ id: 1 });
      expect(mockAppsService.DeleteProductResponsible).toHaveBeenCalled();
    });

    it('should not delete when dialog cancelled', () => {
      fixture.detectChanges();
      spyOn(component['dialog'], 'open').and.returnValue({ afterClosed: () => of(false) } as any);
      component.DeleteRow_onClick({ id: 1 });
      expect(mockAppsService.DeleteProductResponsible).not.toHaveBeenCalled();
    });
  });

  // ─── managementTypeChange ─────────────────────────────────────────────────

  describe('managementTypeChange', () => {
    it('should clear editItem.name on type change', () => {
      fixture.detectChanges();
      component.editItem = { name: 'Alice', managemenT_TYPE: 'CSM' };
      component.managementTypeChange({});
      expect(component.editItem.name).toBeNull();
    });
  });

  // ─── neweditItem ──────────────────────────────────────────────────────────

  describe('neweditItem', () => {
    it('should reset editItem to a new model', () => {
      fixture.detectChanges();
      component.editItem = { id: 1, name: 'Test' };
      component.neweditItem();
      expect(component.editItem.id).toBeUndefined();
    });
  });
});
