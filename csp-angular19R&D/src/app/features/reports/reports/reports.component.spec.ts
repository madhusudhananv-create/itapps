import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ReportsComponent } from './reports.component';
import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { provideHttpClient } from '@angular/common/http';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let mockUtil: any;
  let mockAppService: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      exportToExcel: jasmine.createSpy('exportToExcel')
    };

    mockAppService = {
      getCustomerList: jasmine.createSpy('getCustomerList').and.returnValue(of([{ id: 1, name: 'Customer A' }])),
      GetAllProductList: jasmine.createSpy('GetAllProductList').and.returnValue(of([{ id: 1, name: 'Product A' }])),
      GetPortfolioWithProductList: jasmine.createSpy('GetPortfolioWithProductList').and.returnValue(of([{ id: 1, name: 'Portfolio A' }])),
      getChecklistList: jasmine.createSpy('getChecklistList').and.returnValue(of([{ id: 1, name: 'Checklist A' }])),
      getAllSps: jasmine.createSpy('getAllSps').and.returnValue(of([{ id: 1, name: 'SP1' }])),
      getSpParams: jasmine.createSpy('getSpParams').and.returnValue(of([{ param: 'CUSTOMERID', value: '' }])),
      displaySpData: jasmine.createSpy('displaySpData').and.returnValue(of({ columns: ['col1'], data: [{ col1: 'v' }] }))
    };

    TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: AppsService, useValue: mockAppService },
        provideHttpClient()
      ]
    }).overrideComponent(ReportsComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getCustomerList and prepend All to customers', () => {
      expect(mockAppService.getCustomerList).toHaveBeenCalled();
      expect(component.Customers[0].cusT_NM).toBe('All');
    });

    it('should call GetAllProductList on init', () => {
      expect(mockAppService.GetAllProductList).toHaveBeenCalled();
    });

    it('should call GetPortfolioWithProductList on init', () => {
      expect(mockAppService.GetPortfolioWithProductList).toHaveBeenCalled();
    });

    it('should call getChecklistList on init', () => {
      expect(mockAppService.getChecklistList).toHaveBeenCalled();
    });

    it('should call getAllSps and populate AllSps via GetData', () => {
      expect(mockAppService.getAllSps).toHaveBeenCalled();
      expect(component.AllSps.length).toBeGreaterThan(0);
    });
  });

  describe('isCustomerIdVisible', () => {
    it('should return true when selectedSP.id is 14', () => {
      component.selectedSP = { id: 14, name: 'SP14' } as any;
      expect(component.isCustomerIdVisible()).toBe(true);
    });

    it('should return false when selectedSP.id is not 14', () => {
      component.selectedSP = { id: 5, name: 'SP5' } as any;
      expect(component.isCustomerIdVisible()).toBe(false);
    });
  });

  describe('getFilteredReports', () => {
    beforeEach(() => {
      component.AllSps = [
        { id: 1, sP_DISPLAY_NAME: 'Monthly Report' } as any,
        { id: 2, sP_DISPLAY_NAME: 'Weekly Summary' } as any,
        { id: 3, sP_DISPLAY_NAME: 'Monthly Summary' } as any
      ];
    });

    it('should return all reports when reportSearchText is empty', () => {
      component.reportSearchText = '';
      const result = component.getFilteredReports();
      expect(result.length).toBe(3);
    });

    it('should filter reports by reportSearchText (case-insensitive)', () => {
      component.reportSearchText = 'monthly';
      const result = component.getFilteredReports();
      expect(result.length).toBe(2);
    });

    it('should return empty array when no match found', () => {
      component.reportSearchText = 'zzznomatch';
      const result = component.getFilteredReports();
      expect(result.length).toBe(0);
    });
  });

  describe('getFilteredCustomers', () => {
    beforeEach(() => {
      component.Customers = [
        { cusT_ID: '0', cusT_NM: 'All' } as any,
        { cusT_ID: '1', cusT_NM: 'Acme Corp' } as any,
        { cusT_ID: '2', cusT_NM: 'Beta LLC' } as any
      ];
    });

    it('should return all customers when customerSearchText is empty', () => {
      component.customerSearchText = '';
      const result = component.getFilteredCustomers();
      expect(result.length).toBe(3);
    });

    it('should filter customers by customerSearchText', () => {
      component.customerSearchText = 'acme';
      const result = component.getFilteredCustomers();
      expect(result.length).toBe(1);
    });
  });

  describe('service_getdata', () => {
    it('should populate AllSps on success', () => {
      const mockSps = [{ id: 1, name: 'SP1' }];
      mockAppService.getAllSps.and.returnValue(of(mockSps));
      component.service_getdata();
      expect(component.AllSps.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getAllSps.and.returnValue(throwError(() => new Error('error')));
      component.service_getdata();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('service_getAllparamsbyId', () => {
    beforeEach(() => {
      component.selectedSP = { id: 3, name: 'SP3' } as any;
    });

    it('should set isdisabled to false and showDisplayButton to true after loading params', () => {
      component.service_getAllparamsbyId();
      expect(component.isdisabled).toBe(false);
      expect(component.showDisplayButton).toBe(true);
    });

    it('should populate paramData on success', () => {
      const mockParams = [{ param: 'CUSTOMERID', value: '' }];
      mockAppService.getSpParams.and.returnValue(of(mockParams));
      component.service_getAllparamsbyId();
      expect(component.paramData.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getSpParams.and.returnValue(throwError(() => new Error('error')));
      component.service_getAllparamsbyId();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('service_dispSPResult', () => {
    it('should set FinalTabData and showNoDataMessage on success', () => {
      const mockResult = { columns: ['col1'], data: [{ col1: 'v' }] };
      mockAppService.displaySpData.and.returnValue(of(mockResult));
      component.service_dispSPResult([], 'TestSP');
      expect(component.showNoDataMessage).toBe(true);
    });

    it('should call serviceError on failure', () => {
      mockAppService.displaySpData.and.returnValue(throwError(() => new Error('error')));
      component.service_dispSPResult([], 'TestSP');
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('validateParameters', () => {
    it('should return true when paramData is empty', () => {
      component.paramData = [];
      expect(component.validateParameters()).toBe(true);
    });
  });

  describe('bindData', () => {
    it('should call service_dispSPResult directly when paramData is empty', () => {
      component.paramData = [];
      component.selectedSP = { id: 1, name: 'SP1' } as any;
      spyOn(component, 'service_dispSPResult');
      component.bindData();
      expect(component.service_dispSPResult).toHaveBeenCalled();
    });

    it('should validate parameters when paramData is not empty', () => {
      component.paramData = [{ param: 'CUSTOMERID', value: '' }] as any;
      spyOn(component, 'validateParameters').and.returnValue(false);
      component.bindData();
      expect(component.validateParameters).toHaveBeenCalled();
    });
  });
});
