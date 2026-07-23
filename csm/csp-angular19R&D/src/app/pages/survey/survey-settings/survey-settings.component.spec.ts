import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SurveySettingsComponent } from './survey-settings.component';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { SurveyService } from '../../../core/services/survey.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('SurveySettingsComponent', () => {
  let component: SurveySettingsComponent;
  let fixture: ComponentFixture<SurveySettingsComponent>;
  let mockSurveyService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockSurveyService = {
      GetCSSBatches: jasmine.createSpy().and.returnValue(of([])),
      GetCSMList: jasmine.createSpy().and.returnValue(of([])),
      GetCSSBatchCustomers: jasmine.createSpy().and.returnValue(of([])),
      UpdateBatchCustomerStatus: jasmine.createSpy().and.returnValue(of({})),
      SendSurveyForBatch: jasmine.createSpy().and.returnValue(of({}))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      tableYear: 2024,
      getMonthNames: jasmine.createSpy().and.returnValue([
        { title: 'Jan' }, { title: 'Feb' }, { title: 'Mar' }
      ])
    };
    mockAccess = {
      IsAllowed: jasmine.createSpy().and.returnValue(true)
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of({ month: 1, year: 2024 }) })
    };

    TestBed.configureTestingModule({
      imports: [SurveySettingsComponent],
      providers: [
        { provide: SurveyService, useValue: mockSurveyService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: { navigate: jasmine.createSpy() } },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        provideHttpClient(),
        provideAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default signal values', () => {
    expect(component.loading()).toBe(false);
    expect(component.selectedBatchId()).toBeNull();
    expect(component.batchDetailsMode()).toBe(false);
  });

  it('should call loadBatches on init', () => {
    expect(mockSurveyService.GetCSSBatches).toHaveBeenCalled();
  });

  it('should set batches after loadBatches', () => {
    const mockBatches: any[] = [{ id: 1, frequency: 'Monthly' }];
    mockSurveyService.GetCSSBatches.and.returnValue(of(mockBatches));
    component.loadBatches();
    expect(component.batches).toEqual(mockBatches);
    expect(component.loading()).toBe(false);
  });

  it('should handle serviceError on loadBatches failure', () => {
    mockSurveyService.GetCSSBatches.and.returnValue(throwError(() => new Error('error')));
    component.loadBatches();
    expect(mockUtil.serviceError).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('should set selectedBatchId on onBatchRowClick', () => {
    const batch: any = { id: 5, frequency: 'Quarterly' };
    mockSurveyService.GetCSSBatchCustomers = jasmine.createSpy().and.returnValue(of([]));
    component.onBatchRowClick(batch, 0);
    expect(component.selectedBatchId()).toBe(5);
    expect(component.selectedBatch()).toEqual(batch);
  });

  it('should have defined batchColumns', () => {
    expect(component.batchColumns.length).toBeGreaterThan(0);
  });

  it('should have defined customerColumns', () => {
    expect(component.customerColumns.length).toBeGreaterThan(0);
  });
});
