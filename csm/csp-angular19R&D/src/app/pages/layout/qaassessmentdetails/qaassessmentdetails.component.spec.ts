import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { QaassessmentdetailsComponent } from './qaassessmentdetails.component';
import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { SharedData } from '../../../shared/shared-data';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('QaassessmentdetailsComponent', () => {
  let component: QaassessmentdetailsComponent;
  let fixture: ComponentFixture<QaassessmentdetailsComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockShared: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetAssessmentDetails: jasmine.createSpy().and.returnValue(of([])),
      getAssessmentFindingsDetails: jasmine.createSpy().and.returnValue(of([])),
      acceptOrRejectFinding: jasmine.createSpy().and.returnValue(of({})),
      getAllFindingsForCustomer: jasmine.createSpy().and.returnValue(of([]))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      IsPremier: jasmine.createSpy().and.returnValue(false),
      ApplyCriteriaRange: jasmine.createSpy().and.returnValue([]),
      getMonthNum: jasmine.createSpy().and.returnValue(0),
      Month: jasmine.createSpy().and.returnValue(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']),
      Year: jasmine.createSpy().and.returnValue([2024, 2025, 2026]),
      Years: jasmine.createSpy().and.returnValue([2024, 2025, 2026])
    };
    mockShared = {
      selectedProjects: [],
      savedportfolioId: 0
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) })
    };

    TestBed.configureTestingModule({
      imports: [QaassessmentdetailsComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: UtilityService, useValue: mockUtil },
        { provide: SharedData, useValue: mockShared },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { custid: 'C1' } }, params: of({ custid: 'C1' }) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy() } },
        provideHttpClient(),
        provideAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(QaassessmentdetailsComponent, {
      set: { imports: [], template: '<div></div>' }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QaassessmentdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.OpenFindings).toBe(true);
    expect(component.ClosedFindings).toBe(false);
    expect(component.showByFindings).toBe('2');
    expect(component.multiProject).toBe(true);
  });

  it('should set displayedColumns based on isFromFindingByAge', () => {
    expect(component.displayedColumns).toBeDefined();
    expect(component.displayedColumns.length).toBeGreaterThan(0);
  });

  it('should initialize dateSelection', () => {
    expect(component.DateSelection).toBeDefined();
  });

  it('should initialize stageDict correctly', () => {
    expect(component.stageDict['AUDITEE_ACCEPTANCE AND CAP SUBMISSION']).toBe('Auditee acceptance');
    expect(component.stageDict['CAP REVIEW']).toBe('CAP review');
    expect(component.stageDict['IMPLEMENT CAP']).toBe('Implement CAP');
    expect(component.stageDict['VERIFY CAP IMPLEMENTATION']).toBe('Verify CAP');
  });

  it('should have empty findings on init', () => {
    expect(component.findings).toEqual([]);
    expect(component.originalfindings).toEqual([]);
  });
});
