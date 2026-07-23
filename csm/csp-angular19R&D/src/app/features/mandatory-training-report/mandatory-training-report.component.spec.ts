import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';

import { MandatoryTrainingReportComponent } from './mandatory-training-report.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { LayoutService } from '../layout/layout.service';

const mockProjNames = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta' }
];

const mockTrainingData = [
  { emp_name: 'Alice', proj_nm: 'Project Alpha', allocation_End_Date: '2025-01-01' },
  { emp_name: 'Bob', proj_nm: 'Project Beta', allocation_End_Date: '2025-06-01' }
];

describe('MandatoryTrainingReportComponent', () => {
  let component: MandatoryTrainingReportComponent;
  let fixture: ComponentFixture<MandatoryTrainingReportComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockLayoutService: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjNames)),
      GetMandatoryTrainingDetails: jasmine.createSpy('GetMandatoryTrainingDetails').and.returnValue(of(mockTrainingData)),
      getSpParams: jasmine.createSpy('getSpParams').and.returnValue(of([]))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      exportToExcel: jasmine.createSpy('exportToExcel'),
      Year: jasmine.createSpy('Year').and.returnValue(2025),
      getMonthNum: jasmine.createSpy('getMonthNum').and.returnValue(3)
    };

    mockLayoutService = { selectedCust: '' };

    TestBed.configureTestingModule({
      imports: [MandatoryTrainingReportComponent, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MandatoryTrainingReportComponent);
    component = fixture.componentInstance;
    localStorage.setItem('role', '5');
  });

  afterEach(() => localStorage.removeItem('role'));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set input_customerid from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.input_customerid).toBe('C001');
    });

    it('should set layoutService.selectedCust', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should set allproj=true for Quality role', () => {
      localStorage.setItem('role', '6');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
      localStorage.setItem('role', '5');
    });

    it('should call getAllProjectsFromCustomer on init', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.GetCustomerProjectsName).toHaveBeenCalled();
    });

    it('should push projid to input_projectid when provided in params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001', projid: 'P001' });
      expect(component.input_projectid).toContain('P001');
    });
  });

  // ─── getAllProjectsFromCustomer ────────────────────────────────────────────

  describe('getAllProjectsFromCustomer', () => {
    it('should populate projNames', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.projNames.length).toBe(2);
    });

    it('should set showGetDetails=true after load', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.showGetDetails).toBe(true);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── bindData ─────────────────────────────────────────────────────────────

  describe('bindData', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.startDate = new Date('2024-01-01');
      component.endDate = new Date('2024-12-31');
    });

    it('should call service_dispSPResult with correct params', () => {
      component.bindData();
      expect(mockAppsService.GetMandatoryTrainingDetails).toHaveBeenCalled();
    });

    it('should not call service when startDate > endDate', () => {
      component.startDate = new Date('2025-01-01');
      component.endDate = new Date('2024-01-01');
      mockAppsService.GetMandatoryTrainingDetails.calls.reset();
      component.bindData();
      expect(mockAppsService.GetMandatoryTrainingDetails).not.toHaveBeenCalled();
    });
  });

  // ─── service_dispSPResult ─────────────────────────────────────────────────

  describe('service_dispSPResult', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should populate finalData and set showTable=true', () => {
      component.service_dispSPResult({ starDate: new Date(), endDate: new Date(), custId: 'C001', projId: [] });
      expect(component.finalData.length).toBe(2);
      expect(component.showTable).toBe(true);
    });

    it('should set showGetDetails=true and _loading=false on success', () => {
      component.service_dispSPResult({ starDate: new Date(), endDate: new Date(), custId: 'C001', projId: [] });
      expect(component.showGetDetails).toBe(true);
      expect(component._loading).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetMandatoryTrainingDetails.and.returnValue(throwError(() => new Error('fail')));
      component.service_dispSPResult({ starDate: new Date(), endDate: new Date(), custId: 'C001', projId: [] });
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── service_getAllparamsbyId ──────────────────────────────────────────────

  describe('service_getAllparamsbyId', () => {
    it('should call getSpParams with id 14', () => {
      fixture.detectChanges();
      component.service_getAllparamsbyId();
      expect(mockAppsService.getSpParams).toHaveBeenCalledWith(14);
    });
  });

  // ─── displayedColumnsTab ──────────────────────────────────────────────────

  describe('displayedColumnsTab', () => {
    it('should have 15 columns defined', () => {
      fixture.detectChanges();
      expect(component.displayedColumnsTab.length).toBe(15);
    });

    it('should include index and emp_name columns', () => {
      fixture.detectChanges();
      expect(component.displayedColumnsTab).toContain('index');
      expect(component.displayedColumnsTab).toContain('emp_name');
    });
  });
});
