import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { ManageproductComponent } from './manageproduct.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { provideHttpClient } from '@angular/common/http';

const mockProductList = [
  { id: 1, producT_TITLE: 'Product A', portfoliO_ID: 99 },
  { id: 2, producT_TITLE: 'Product B', portfoliO_ID: 99 }
];

const mockDropdownData = {
  productTier: [{ id: 1, tieR_TITLE: 'Tier 1' }],
  productModes: [{ id: 1, modE_TITLE: 'Mode 1' }],
  serviceAreas: [{ id: 1, servicE_AREA_TYPE: 'SQA' }]
};

describe('ManageproductComponent', () => {
  let component: ManageproductComponent;
  let fixture: ComponentFixture<ManageproductComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockSharedService: any;
  let mockAccessService: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([])),
      GetPortfolioWithProductList: jasmine.createSpy('GetPortfolioWithProductList').and.returnValue(of([])),
      GetProductDetails: jasmine.createSpy('GetProductDetails').and.returnValue(of(mockProductList)),
      GetInitialDataForCRUDProduct: jasmine.createSpy('GetInitialDataForCRUDProduct').and.returnValue(of(mockDropdownData)),
      AddUpdateProduct: jasmine.createSpy('AddUpdateProduct').and.returnValue(of({})),
      DeleteProduct: jasmine.createSpy('DeleteProduct').and.returnValue(of({}))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      ApplyCriteriaRange: jasmine.createSpy('ApplyCriteriaRange').and.returnValue(mockProductList),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({ afterClosed: () => of(true) })
    };

    mockSharedService = {
      callMethod: jasmine.createSpy('callMethod')
    };

    mockAccessService = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
    };

    TestBed.configureTestingModule({
      imports: [ManageproductComponent, MatDialogModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AccessControlService, useValue: mockAccessService },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageproductComponent);
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
    it('should set custId from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C002' });
      expect(component.custId).toBe('C002');
    });

    it('should call GetInitialDataForCRUDProduct on init', () => {
      fixture.detectChanges();
      expect(mockAppsService.GetInitialDataForCRUDProduct).toHaveBeenCalled();
    });

    it('should call GetDBConfigValue on init', () => {
      fixture.detectChanges();
      expect(mockAppsService.GetDBConfigValue).toHaveBeenCalled();
    });
  });

  // ─── getProductDropdownDetails ────────────────────────────────────────────

  describe('getProductDropdownDetails', () => {
    it('should populate productTier, modeList and serviceAreaTypes', () => {
      fixture.detectChanges();
      expect(component.productTier).toEqual(mockDropdownData.productTier);
      expect(component.modeList).toEqual(mockDropdownData.productModes);
      expect(component.serviceAreaTypes).toEqual(mockDropdownData.serviceAreas);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetInitialDataForCRUDProduct.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getProductPortfolioMapping ───────────────────────────────────────────

  describe('getProductPortfolioMapping', () => {
    it('should populate productlist and dataSource', () => {
      fixture.detectChanges();
      component.getProductPortfolioMapping(99);
      expect(component.productlist).toEqual(mockProductList);
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetProductDetails.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getProductPortfolioMapping(99);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── Edit_onClick / EditRow_onClick / Cancel_onClick ──────────────────────

  describe('Edit_onClick', () => {
    it('should switch to edit mode', () => {
      fixture.detectChanges();
      component.Edit_onClick();
      expect(component.editmode).toBe(true);
      expect(component.readmode).toBe(false);
    });
  });

  describe('EditRow_onClick', () => {
    it('should set editItem and switch to edit mode', () => {
      fixture.detectChanges();
      component.EditRow_onClick(mockProductList[0]);
      expect(component.editItem).toBe(mockProductList[0]);
      expect(component.editmode).toBe(true);
      expect(component.readmode).toBe(false);
    });
  });

  describe('Cancel_onClick', () => {
    it('should reset to read mode', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.readmode = false;
      component.Cancel_onClick();
      expect(component.editmode).toBe(false);
      expect(component.readmode).toBe(true);
    });
  });

  // ─── Filter_onChange ──────────────────────────────────────────────────────

  describe('Filter_onChange', () => {
    it('should update dataSource with filtered data', () => {
      fixture.detectChanges();
      component.productlist = mockProductList;
      component.Filter_onChange({ criteria: { producT_TITLE: 'Product A' } });
      expect(component.dataSource.data).toEqual(mockProductList);
    });
  });

  // ─── onSaveButtonClick / UpdateProduct ────────────────────────────────────

  describe('onSaveButtonClick', () => {
    it('should alert when producT_TITLE is empty', () => {
      fixture.detectChanges();
      spyOn(window, 'alert');
      component.editItem = { producT_TITLE: '', portfoliO_ID: 99 };
      component.onSaveButtonClick();
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('UpdateProduct', () => {
    it('should call AddUpdateProduct and reset to read mode', () => {
      fixture.detectChanges();
      spyOn(window, 'alert');
      component.UpdateProduct(mockProductList[0]);
      expect(mockAppsService.AddUpdateProduct).toHaveBeenCalled();
    });
  });

  // ─── DeleteProduct ────────────────────────────────────────────────────────

  describe('DeleteProduct', () => {
    it('should call DeleteProduct service on confirm', () => {
      fixture.detectChanges();
      spyOn(window, 'alert');
      component.DeleteProduct(mockProductList[0]);
      expect(mockAppsService.DeleteProduct).toHaveBeenCalled();
    });
  });
});
