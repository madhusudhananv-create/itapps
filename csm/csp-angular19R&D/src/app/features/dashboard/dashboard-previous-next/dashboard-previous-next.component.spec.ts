import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';

import { DashboardPreviousNextComponent } from './dashboard-previous-next.component';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { SharedService } from '../../../shared/shared.service';
import { CustomerModel } from '../../../models/customer-model';

const mockCustomers: CustomerModel[] = [
  { cusT_ID: 'C001', cusT_NM: 'Customer One' } as CustomerModel,
  { cusT_ID: 'C002', cusT_NM: 'Customer Two' } as CustomerModel
];

describe('DashboardPreviousNextComponent', () => {
  let component: DashboardPreviousNextComponent;
  let fixture: ComponentFixture<DashboardPreviousNextComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockSharedService: any;
  let mockRouter: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of(mockCustomers))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false)
    };

    mockSharedService = {
      selectedPortfolios: [1, 2],
      selectedProjects: ['P001'],
      selectedProducts: ['PROD001']
    };

    mockRouter = { navigate: jasmine.createSpy('navigate') };

    TestBed.configureTestingModule({
      imports: [DashboardPreviousNextComponent],
      providers: [
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: SharedService, useValue: mockSharedService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } },
        provideHttpClient()
      ]
    })
    .overrideComponent(DashboardPreviousNextComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPreviousNextComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP01');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set currentMonth to a valid month abbreviation', () => {
      fixture.detectChanges();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      expect(months).toContain(component.currentMonth);
    });

    it('should set currentYear to current year', () => {
      fixture.detectChanges();
      expect(component.currentYear).toBe(new Date().getFullYear());
    });

    it('should set customerId from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001', reset: true });
      expect(component.customerId).toBe('C001');
    });

    it('should call service_LoadCustomerByEmpIdByCustomerId when customerId changes', () => {
      spyOn(component, 'service_LoadCustomerByEmpIdByCustomerId');
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001' });
      expect(component.service_LoadCustomerByEmpIdByCustomerId).toHaveBeenCalledWith('C001');
    });

    it('should NOT reload when same customerId emitted twice', () => {
      spyOn(component, 'service_LoadCustomerByEmpIdByCustomerId');
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001' });
      paramSubject.next({ customerid: 'C001' }); // same customer
      expect(component.service_LoadCustomerByEmpIdByCustomerId).toHaveBeenCalledTimes(1);
    });
  });

  // ─── ngAfterViewInit ──────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    it('should load portArray from shared service', () => {
      fixture.detectChanges();
      component.ngAfterViewInit();
      expect(component.portArray).toEqual([1, 2]);
    });

    it('should load projArray from shared service', () => {
      fixture.detectChanges();
      component.ngAfterViewInit();
      expect(component.projArray).toEqual(['P001']);
    });

    it('should load prodArray from shared service', () => {
      fixture.detectChanges();
      component.ngAfterViewInit();
      expect(component.prodArray).toEqual(['PROD001']);
    });

    it('should not set portArray when shared service has empty portfolios', () => {
      mockSharedService.selectedPortfolios = [];
      fixture.detectChanges();
      component.ngAfterViewInit();
      expect(component.portArray).toEqual([]);
    });
  });

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe from route params on destroy', () => {
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001' });
      const subSpy = spyOn(component['sub'] as any, 'unsubscribe').and.callThrough();
      component.ngOnDestroy();
      expect(subSpy).toHaveBeenCalled();
    });
  });

  // ─── onPrev / onNext ──────────────────────────────────────────────────────

  describe('onPrev', () => {
    it('should decrement currIndex when > 0', () => {
      component.currIndex = 2;
      component.onPrev();
      expect(component.currIndex).toBe(1);
    });

    it('should not go below 0', () => {
      component.currIndex = 0;
      component.onPrev();
      expect(component.currIndex).toBe(0);
    });
  });

  describe('onNext', () => {
    it('should increment currIndex when < 3', () => {
      component.currIndex = 0;
      component.onNext();
      expect(component.currIndex).toBe(1);
    });

    it('should not exceed 3', () => {
      component.currIndex = 3;
      component.onNext();
      expect(component.currIndex).toBe(3);
    });
  });

  // ─── service_LoadCustomerByEmpIdByCustomerId ──────────────────────────────

  describe('service_LoadCustomerByEmpIdByCustomerId', () => {
    it('should call GetCustomerList with empId', () => {
      component.service_LoadCustomerByEmpIdByCustomerId('C001');
      expect(mockAppsService.GetCustomerList).toHaveBeenCalledWith('EMP01', false);
    });

    it('should set customerName when customer found', () => {
      component.service_LoadCustomerByEmpIdByCustomerId('C001');
      expect(component.customerName).toBe('Customer One');
    });

    it('should set selectedCustomer when found', () => {
      component.service_LoadCustomerByEmpIdByCustomerId('C001');
      expect(component.selectedCustomer).toEqual(mockCustomers[0]);
    });

    it('should not set customerName when customer not found', () => {
      component.customerName = '';
      component.service_LoadCustomerByEmpIdByCustomerId('UNKNOWN');
      expect(component.customerName).toBe('');
    });

    it('should log error on service failure', () => {
      spyOn(console, 'error');
      mockAppsService.GetCustomerList.and.returnValue(throwError(() => new Error('fail')));
      component.service_LoadCustomerByEmpIdByCustomerId('C001');
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ─── getSelectedProjectsList ──────────────────────────────────────────────

  describe('getSelectedProjectsList', () => {
    it('should update projArray', () => {
      component.getSelectedProjectsList(['P001', 'P002']);
      expect(component.projArray).toEqual(['P001', 'P002']);
    });

    it('should update shared service selectedProjects', () => {
      component.getSelectedProjectsList(['P001', 'P002']);
      expect(mockSharedService.selectedProjects).toEqual(['P001', 'P002']);
    });

    it('should sync portArray from shared service', () => {
      mockSharedService.selectedPortfolios = [5, 6];
      component.getSelectedProjectsList(['P001']);
      expect(component.portArray).toEqual([5, 6]);
    });
  });

  // ─── getSelectedProdList ──────────────────────────────────────────────────

  describe('getSelectedProdList', () => {
    it('should update prodArray', () => {
      component.getSelectedProdList(['PROD001', 'PROD002']);
      expect(component.prodArray).toEqual(['PROD001', 'PROD002']);
    });

    it('should update shared service selectedProducts', () => {
      component.getSelectedProdList(['PROD001']);
      expect(mockSharedService.selectedProducts).toEqual(['PROD001']);
    });

    it('should sync portArray from shared service', () => {
      mockSharedService.selectedPortfolios = [3];
      component.getSelectedProdList(['PROD001']);
      expect(component.portArray).toEqual([3]);
    });
  });
});
