import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';

import { SurveySettingsMonthlyComponent } from './survey-settings-monthly.component';
import { MyUtility } from '../../shared/my-utility';
import { SurveyService } from '../../core/services/survey.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('SurveySettingsMonthlyComponent', () => {
  let component: SurveySettingsMonthlyComponent;
  let fixture: ComponentFixture<SurveySettingsMonthlyComponent>;
  let mockUtil: any;
  let mockSurveyService: any;
  let mockAccess: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showWarningPopup: jasmine.createSpy('showWarningPopup')
    };

    mockAccess = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false),
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true)
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) })
    };

    mockSurveyService = {
      GetCSSMonthlyBatches: jasmine.createSpy('GetCSSMonthlyBatches').and.returnValue(of([])),
      GetCSMList: jasmine.createSpy('GetCSMList').and.returnValue(of([])),
      GetCSSBatchCustomersMonthly: jasmine.createSpy('GetCSSBatchCustomersMonthly').and.returnValue(of([])),
      updateCustomerContactsVerificationForPremier: jasmine.createSpy('updateCustomerContactsVerificationForPremier').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [SurveySettingsMonthlyComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: SurveyService, useValue: mockSurveyService },
        { provide: AccessControlService, useValue: mockAccess },
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        },
        provideRouter([]),
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingsMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call LoadDetails on init', () => {
      expect(mockSurveyService.GetCSSMonthlyBatches).toHaveBeenCalled();
    });

    it('should call customerContactsVerification on init', () => {
      expect(mockSurveyService.GetCSSMonthlyBatches).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize Batches as empty array', () => {
      expect(component.Batches).toEqual([]);
    });

    it('should initialize BatchCustomers as empty array', () => {
      expect(component.BatchCustomers).toEqual([]);
    });

    it('should initialize isLoading to false', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should initialize progress to false', () => {
      expect(component.progress).toBe(false);
    });
  });

  describe('service_GetCSSMonthlyBatches', () => {
    it('should populate Batches on success', () => {
      mockSurveyService.GetCSSMonthlyBatches.and.returnValue(of([{ id: 1 }]));
      component.service_GetCSSMonthlyBatches();
      expect(component.Batches.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockSurveyService.GetCSSMonthlyBatches.and.returnValue(throwError(() => new Error('error')));
      component.service_GetCSSMonthlyBatches();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('service_GetCSMList', () => {
    it('should populate CSMList on success', () => {
      mockSurveyService.GetCSMList.and.returnValue(of([{ proJ_ID: 'P1', csm: 'csm1' }]));
      component.service_GetCSMList();
      expect(component.CSMList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockSurveyService.GetCSMList.and.returnValue(throwError(() => new Error('error')));
      component.service_GetCSMList();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('createFilter', () => {
    it('should return a filter function', () => {
      const filter = component.createFilter();
      expect(typeof filter).toBe('function');
    });

    it('should match data with correct term', () => {
      const filter = component.createFilter();
      const data = { cusT_NM: 'Acme', BUSINESS_UNIT: '', displaY_NAME: '', emaiL_ID: '', status: '', proJ_NM: '', proD_NM: '', proJ_STATUS: '', comments: '', approver: '', contractinG_UNIT: '', iS_VERIFIED: false };
      expect(filter(data, 'acme')).toBe(true);
    });

    it('should not match data with wrong term', () => {
      const filter = component.createFilter();
      const data = { cusT_NM: 'Acme', BUSINESS_UNIT: '', displaY_NAME: '', emaiL_ID: '', status: '', proJ_NM: '', proD_NM: '', proJ_STATUS: '', comments: '', approver: '', contractinG_UNIT: '', iS_VERIFIED: false };
      expect(filter(data, 'zzzzz')).toBe(false);
    });
  });
});
