import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SuccessPageComponent } from './success-page.component';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { AppsService } from '../../core/services/apps.service';
import { LayoutService } from '../layout/layout.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('SuccessPageComponent', () => {
  let component: SuccessPageComponent;
  let fixture: ComponentFixture<SuccessPageComponent>;
  let mockUtil: any;
  let mockAccess: any;
  let mockAppService: any;
  let mockLayoutService: any;
  let mockSnackBar: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      AppSettings: { token: 'test-token' }
    };

    mockAccess = {
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true),
      CheckValidAccess: jasmine.createSpy('CheckValidAccess').and.returnValue(true),
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };

    mockAppService = {
      getCustomerDetails: jasmine.createSpy('getCustomerDetails').and.returnValue(of({})),
      getProjectsByEmpId: jasmine.createSpy('getProjectsByEmpId').and.returnValue(of([])),
      getGetCSPDetails_Customer: jasmine.createSpy('getGetCSPDetails_Customer').and.returnValue(of({})),
      getGetCSPDetails_Employee: jasmine.createSpy('getGetCSPDetails_Employee').and.returnValue(of([]))
    };

    mockLayoutService = {
      selectedCust: ''
    };

    mockSnackBar = {
      open: jasmine.createSpy('open')
    };

    TestBed.configureTestingModule({
      imports: [SuccessPageComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: AppsService, useValue: mockAppService },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ custid: 'C001' }) }
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize readonlymode to true', () => {
      expect(component.readonlymode).toBe(true);
    });

    it('should initialize editmode to false', () => {
      expect(component.editmode).toBe(false);
    });

    it('should initialize today as a Date', () => {
      expect(component.today instanceof Date).toBe(true);
    });
  });

  describe('Edit_onClick', () => {
    it('should switch to edit mode', () => {
      component.Edit_onClick();
      expect(component.readonlymode).toBe(false);
      expect(component.editmode).toBe(true);
    });
  });

  describe('Cancel_onClick', () => {
    it('should switch back to readonly mode', () => {
      component.editmode = true;
      component.readonlymode = false;
      component.Cancel_onClick();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });
  });

  describe('GoalsSave_onClick', () => {
    it('should switch back to readonlymode after save', () => {
      spyOn(component, 'service_updateOverview');
      component.SelectedData = { client: { client_RAG: '', client_Description: '', gavs_Description: '', reports: [] } };
      component.GoalsSave_onClick(1, 'New goal text');
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should open snackbar on save', () => {
      spyOn(component, 'service_updateOverview');
      const snackSpy = spyOn(component['_snackBar'], 'open');
      component.SelectedData = { client: { client_RAG: '', client_Description: '', gavs_Description: '', reports: [] } };
      component.GoalsSave_onClick(1, 'Goal text');
      expect(snackSpy).toHaveBeenCalledWith(
        'Success goals updated successfully!', 'x',
        jasmine.objectContaining({ duration: 3000 })
      );
    });
  });

  describe('getNewProcess', () => {
    it('should map data fields to process object', () => {
      const data = {
        CREATED_BY: 'user1', CREATED_DATE: '2024-01-01', FILE_CONTENT: 'abc',
        FILE_EXTENSION: '.pdf', FILE_NAME: 'file.pdf', FILE_NAME_SERVER: 'srv.pdf',
        FILE_TYPE: 'PDF', ID: 1, ISACTIVE: true, CUSTOMER_ID: 10,
        PUBLISH_DATE: '2024-01-01', RAG: 'Green', REPORT_TYPE: 'Monthly',
        UPDATED_BY: 'user2', UPDATED_DATE: '2024-01-02'
      };
      const result = component.getNewProcess(data);
      expect(result.createD_BY).toBe('user1');
      expect(result.id).toBe(1);
    });
  });
});
