import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

import { SurveySettingsVerificationPageComponent } from './survey-settings-verification-page.component';
import { MyUtility } from '../../shared/my-utility';
import { SurveyService } from '../../core/services/survey.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('SurveySettingsVerificationPageComponent', () => {
  let component: SurveySettingsVerificationPageComponent;
  let fixture: ComponentFixture<SurveySettingsVerificationPageComponent>;
  let mockUtil: any;
  let mockSurveyService: any;
  let mockAccess: any;
  let mockDialog: any;
  let mockMediaQueryList: any;
  let mockMediaMatcher: any;

  beforeEach(waitForAsync(() => {
    mockMediaQueryList = {
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
      matches: false
    };

    mockMediaMatcher = {
      matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
    };

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
      GetCSSBatches: jasmine.createSpy('GetCSSBatches').and.returnValue(of([])),
      GetCSSCustomerVerifications: jasmine.createSpy('GetCSSCustomerVerifications').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [SurveySettingsVerificationPageComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: SurveyService, useValue: mockSurveyService },
        { provide: AccessControlService, useValue: mockAccess },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        },
        provideRouter([]),
        provideHttpClient(),
        provideAnimations(),
        ChangeDetectorRef
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingsVerificationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call service_GetCSSMonthlyBatches on init', () => {
      expect(mockSurveyService.GetCSSBatches).toHaveBeenCalled();
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

    it('should initialize isVerificationInProgress to false', () => {
      expect(component.isVerificationInProgress).toBe(false);
    });

    it('should initialize progress to false', () => {
      expect(component.progress).toBe(false);
    });
  });

  describe('service_GetCSSMonthlyBatches', () => {
    it('should filter Quarterly and Half-Yearly batches on success', () => {
      const batches = [
        { id: 1, frequency: 'Quarterly' },
        { id: 2, frequency: 'Monthly' },
        { id: 3, frequency: 'Half-Yearly' }
      ] as any[];
      mockSurveyService.GetCSSBatches.and.returnValue(of(batches));
      component.service_GetCSSMonthlyBatches();
      expect(component.Batches.length).toBe(2);
    });

    it('should call serviceError on failure', () => {
      mockSurveyService.GetCSSBatches.and.returnValue(throwError(() => new Error('error')));
      component.service_GetCSSMonthlyBatches();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('createFilter', () => {
    it('should return a filter function', () => {
      const filter = component.createFilter();
      expect(typeof filter).toBe('function');
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove the mobileQuery listener on destroy', () => {
      component.ngOnDestroy();
      expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
    });
  });
});
