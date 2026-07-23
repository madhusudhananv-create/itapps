import { provideNoopAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ChecklistFindingsPageComponent } from './checklist-findings-page.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { LayoutService } from '../../../features/layout/layout.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ChecklistFindingsPageComponent', () => {
  let component: ChecklistFindingsPageComponent;
  let fixture: ComponentFixture<ChecklistFindingsPageComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockLayoutService: any;
  let mockDialog: any;
  let mockSnackBar: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetCustomerProjectsName: jasmine.createSpy().and.returnValue(of([])),
      getPlannedAudits: jasmine.createSpy().and.returnValue(of([])),
      service_getDropDownDataForAudit: jasmine.createSpy().and.returnValue(of({})),
      getDropDownForChecklist: jasmine.createSpy().and.returnValue(of({})),
      getChecklistValuesForStatus: jasmine.createSpy().and.returnValue(of([])),
      getOpenFindingsCount: jasmine.createSpy().and.returnValue(of([])),
      enableChecklistStatus: jasmine.createSpy().and.returnValue(of([])),
      GetEmployeesByProject: jasmine.createSpy().and.returnValue(of([])),
      getCheckListDataForProjNew: jasmine.createSpy().and.returnValue(of([]))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      getFindingsCount: jasmine.createSpy().and.returnValue(0),
      AppSettings: { token: 'test-token' }
    };
    mockAccess = {
      IsAllowed: jasmine.createSpy().and.returnValue(true)
    };
    mockLayoutService = {
      selectedCust: 'C1'
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) })
    };
    mockSnackBar = {
      open: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [ChecklistFindingsPageComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: HttpClient, useValue: { get: jasmine.createSpy().and.returnValue(of({})) } },
        { provide: ActivatedRoute, useValue: { params: of({ custid: 'C1', projid: 'P1', auditid: '0' }) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy() } },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.overrideProvider(AppsService, { useValue: mockAppService });
    TestBed.overrideProvider(MyUtility, { useValue: mockUtil });
    TestBed.overrideProvider(AccessControl, { useValue: mockAccess });
    TestBed.overrideProvider(LayoutService, { useValue: mockLayoutService });
    TestBed.overrideProvider(MatDialog, { useValue: mockDialog });
    TestBed.overrideProvider(MatSnackBar, { useValue: mockSnackBar });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistFindingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.allproj).toBe(false);
    expect(component.isLoading).toBe(false);
    expect(component.issubmitenabled).toBe(false);
    expect(component.pageSize).toBe(5);
    expect(component.pageIndex).toBe(0);
  });

  it('should call getAllProjectsFromCustomer on init', () => {
    expect(mockAppService.GetCustomerProjectsName).toHaveBeenCalled();
  });

  it('should set plannedAudits after Service_GetPlannedAudits', () => {
    const mockAudits = [{ id: 1, description: 'Audit 1', status: 'Planned' }];
    mockAppService.getPlannedAudits.and.returnValue(of(mockAudits));
    component.Service_GetPlannedAudits('C1', 'P1');
    expect(component.plannedAudits).toEqual(mockAudits);
  });

  it('should handle error in Service_GetPlannedAudits', () => {
    mockAppService.getPlannedAudits.and.returnValue(throwError(() => new Error('error')));
    component.Service_GetPlannedAudits('C1', 'P1');
    expect(component.isLoading).toBe(false);
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should filter audits by search query', () => {
    component.plannedAudits = [
      { description: 'Audit Alpha', status: 'Planned' },
      { description: 'Audit Beta', status: 'Closed' }
    ];
    component.searchQuery = 'alpha';
    component.onSearchChange();
    expect(component.filteredAudits.length).toBe(1);
  });

  it('should return correct compliance color', () => {
    expect(component.getComplianceColor(null)).toBe('#bdbdbd');
    expect(component.getComplianceColor(85)).toBe('#4caf50');
    expect(component.getComplianceColor(65)).toBe('#ff9800');
    expect(component.getComplianceColor(30)).toBe('#f44336');
  });

  it('should return compliance width percentage', () => {
    expect(component.getComplianceWidth(75)).toBe('75%');
    expect(component.getComplianceWidth(110)).toBe('100%');
    expect(component.getComplianceWidth(-5)).toBe('0%');
  });

  it('should set auditDataTitle on GetAuditAssesment call', () => {
    component.plannedAudits = [{ iS_CHECKED: false }];
    component.GetAuditAssesment(0, 1, [], 'Test Audit', new Date(), new Date(), 'E1', [], 'Planned', 4, 3, null, null);
    expect(component.auditDataTitle).toBe('Test Audit');
  });
});
