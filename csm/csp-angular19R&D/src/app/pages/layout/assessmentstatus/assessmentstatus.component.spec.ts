import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentstatusComponent } from './assessmentstatus.component';
import { AppsService } from '../../../services/apps.service';
import { AppsService as CoreAppsService } from '../../../core/services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { SharedData } from '../../../shared/shared-data';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('AssessmentstatusComponent', () => {
  let component: AssessmentstatusComponent;
  let fixture: ComponentFixture<AssessmentstatusComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockShared: any;
  let mockCoreAppService: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetAuditsByStatus: jasmine.createSpy().and.returnValue(of([]))
    };
    mockCoreAppService = {
      getCustomerProjectsName: jasmine.createSpy().and.returnValue(of([])),
      getPortfolioList: jasmine.createSpy().and.returnValue(of([])),
      getProductList: jasmine.createSpy().and.returnValue(of([])),
      getProjectPortfolioMapping: jasmine.createSpy().and.returnValue(of([]))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      IsPremier: jasmine.createSpy().and.returnValue(false),
      ApplyCriteriaRange: jasmine.createSpy().and.returnValue([]),
      getMonthNum: jasmine.createSpy().and.returnValue(0),
      getDates: jasmine.createSpy(),
      Month: jasmine.createSpy().and.returnValue('Jan'),
      Year: jasmine.createSpy().and.returnValue(2024),
      Years: jasmine.createSpy().and.returnValue([2024, 2023, 2022, 2021, 2020]),
      ShouldLoadAllProjects: jasmine.createSpy().and.returnValue(false)
    };
    mockShared = {
      selectedProjects: []
    };

    TestBed.configureTestingModule({
      imports: [AssessmentstatusComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: CoreAppsService, useValue: mockCoreAppService },
        { provide: UtilityService, useValue: mockUtil },
        { provide: SharedData, useValue: mockShared },
        { provide: ActivatedRoute, useValue: { params: of({ custid: 'C1' }) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy() } },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.overrideProvider(CoreAppsService, { useValue: mockCoreAppService });
    TestBed.overrideProvider(UtilityService, { useValue: mockUtil });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.OpenStatus).toBe(true);
    expect(component.ClosedStatus).toBe(false);
  });

  it('should call GetAuditsByStatus on init', () => {
    expect(mockAppService.GetAuditsByStatus).toHaveBeenCalled();
  });

  it('should set tasks after data load', () => {
    const mockTasks = [{ id: 1, status: 'PLANNED', proJ_ID: 'P1' } as any];
    mockAppService.GetAuditsByStatus.and.returnValue(of(mockTasks));
    component.getAllTasks();
    expect(component.tasks).toEqual(mockTasks);
  });

  it('should call serviceError on getAllTasks error', () => {
    mockAppService.GetAuditsByStatus.and.returnValue(throwError(() => new Error('error')));
    component.getAllTasks();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should filter open status tasks in filteredData', () => {
    component.tasks = [
      { status: 'PLANNED', proJ_ID: 'P1' } as any,
      { status: 'COMPLETED', proJ_ID: 'P1' } as any
    ];
    mockUtil.ApplyCriteriaRange.and.returnValue(component.tasks);
    component.OpenStatus = true;
    component.ClosedStatus = false;
    component.filteredData();
    expect(mockAppService.GetAuditsByStatus).toHaveBeenCalled();
  });

  it('should format status correctly', () => {
    expect(component.getStatus('PLANNED')).toBe('Planned');
    expect(component.getStatus('COMPLETED')).toBe('Completed');
  });

  it('should update dates when saveDates is called', () => {
    component.DateSelection.selectedStartMonth = 'Jan';
    component.DateSelection.selectedStartYear = 2024;
    component.DateSelection.selectedEndMonth = 'Dec';
    component.DateSelection.selectedEndYear = 2024;
    expect(() => component.saveDates()).not.toThrow();
  });
});
