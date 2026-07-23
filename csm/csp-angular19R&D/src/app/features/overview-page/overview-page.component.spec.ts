import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { OverviewPageComponent } from './overview-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';

const mockClientData = [{
  client_ID: 'C001',
  clientId: 1,
  client_NM: 'Test Client',
  client_Description: 'Client desc',
  gavs_Description: 'GAVS desc',
  client_RAG: 'green',
  client_Goals: 'Goals text',
  projects: [{ proJ_ID: 'P001', proJ_NM: 'Project A' }]
}];

describe('OverviewPageComponent', () => {
  let component: OverviewPageComponent;
  let fixture: ComponentFixture<OverviewPageComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockLayoutService: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      getGetCSPDetails_Employee: jasmine.createSpy('getGetCSPDetails_Employee').and.returnValue(of(mockClientData)),
      getGetCSPDetails_Customer: jasmine.createSpy('getGetCSPDetails_Customer').and.returnValue(of(mockClientData))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      AppSettings: { token: 'test-token' }
    };

    mockAccessControl = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };
    mockLayoutService = { selectedCust: '' };

    TestBed.configureTestingModule({
      imports: [OverviewPageComponent, HttpClientTestingModule, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewPageComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP001');
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
    localStorage.removeItem('token');
    localStorage.removeItem('logintype');
  });

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
      expect(mockLayoutService.selectedCust).toBe('');
    });

    it('should call getEmployeeProjects for gavs logintype', () => {
      localStorage.setItem('logintype', 'gavs');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.getGetCSPDetails_Employee).toHaveBeenCalled();
    });

    it('should call getCustomerProjects for non-gavs logintype', () => {
      localStorage.setItem('logintype', 'customer');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.getGetCSPDetails_Customer).toHaveBeenCalled();
    });
  });

  // ─── getEmployeeProjects ──────────────────────────────────────────────────

  describe('getEmployeeProjects', () => {
    beforeEach(() => {
      fixture.detectChanges();
      mockLayoutService.selectedCust = 'C001';
    });

    it('should set ClientDescription from client data', () => {
      component.getEmployeeProjects('EMP001');
      expect(component.ClientDescription).toBe('Client desc');
    });

    it('should set GavsDescription from client data', () => {
      component.getEmployeeProjects('EMP001');
      expect(component.GavsDescription).toBe('GAVS desc');
    });

    it('should set ClientRAG from client data', () => {
      component.getEmployeeProjects('EMP001');
      expect(component.ClientRAG).toBe('green');
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getGetCSPDetails_Employee.and.returnValue(throwError(() => new Error('fail')));
      component.getEmployeeProjects('EMP001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getCustomerProjects ──────────────────────────────────────────────────

  describe('getCustomerProjects', () => {
    it('should set SelectedData from customer data', () => {
      fixture.detectChanges();
      component.getCustomerProjects('C001');
      expect(component.SelectedData).toBeTruthy();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getGetCSPDetails_Customer.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getCustomerProjects('C001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── Edit_onClick / Cancel_onClick ────────────────────────────────────────

  describe('Edit_onClick', () => {
    it('should set editmode=true and readonlymode=false', () => {
      fixture.detectChanges();
      component.Edit_onClick();
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
    });
  });

  describe('Cancel_onClick', () => {
    it('should reset editmode=false and readonlymode=true', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.Cancel_onClick();
      expect(component.editmode).toBe(false);
      expect(component.readonlymode).toBe(true);
    });
  });

  // ─── Save_onClick ─────────────────────────────────────────────────────────

  describe('Save_onClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.SelectedData = {
        client: { client_RAG: 'green', client_Description: 'Old desc', gavs_Description: 'Old GAVS', client_Goals: 'Goals' }
      };
    });

    it('should update ClientDescription after save', () => {
      component.Save_onClick(1, 'green', 'New desc', 'New GAVS');
      expect(component.ClientDescription).toBe('New desc');
    });

    it('should reset to readonly mode after save', () => {
      component.Save_onClick(1, 'green', 'New desc', 'New GAVS');
      expect(component.editmode).toBe(false);
      expect(component.readonlymode).toBe(true);
    });

    it('should not save when clientDesc is empty', () => {
      spyOn(component as any, 'service_updateOverview');
      component.Save_onClick(1, 'green', '', 'New GAVS');
      expect((component as any).service_updateOverview).not.toHaveBeenCalled();
    });
  });

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      spyOn((component as any).sub, 'unsubscribe');
      component.ngOnDestroy();
      expect((component as any).sub.unsubscribe).toHaveBeenCalled();
    });
  });
});
