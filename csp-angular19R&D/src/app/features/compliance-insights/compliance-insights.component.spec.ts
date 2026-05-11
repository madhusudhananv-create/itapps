import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { ComplianceInsightsComponent } from './compliance-insights.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';

describe('ComplianceInsightsComponent', () => {
  let component: ComplianceInsightsComponent;
  let fixture: ComponentFixture<ComplianceInsightsComponent>;

  const mockActivatedRoute = {
    params: of({})
  };

  const mockAppsService = {
    GetSQAProjectReports: jasmine.createSpy('GetSQAProjectReports').and.returnValue(of([])),
    GetComplianceInsights: jasmine.createSpy('GetComplianceInsights').and.returnValue(of([])),
    GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of([])),
    GetSQAReportTypes: jasmine.createSpy('GetSQAReportTypes').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ComplianceInsightsComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) }) } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise default property values', () => {
    expect(component.dataDumpType).toBe('Incident and Service Request');
    expect(component._loading).toBeFalsy();
  });

  it('should have correct ddDataDumpType options', () => {
    expect(component.ddDataDumpType).toContain('Incident and Service Request');
    expect(component.ddDataDumpType).toContain('Incident');
    expect(component.ddDataDumpType).toContain('Service Request');
    expect(component.ddDataDumpType).toContain('CSAT');
    expect(component.ddDataDumpType).toContain('Others');
  });

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('position');
    expect(component.displayedColumns).toContain('name');
    expect(component.displayedColumns).toContain('complaint');
    expect(component.displayedColumns).toContain('noncomplaint');
    expect(component.displayedColumns).toContain('total');
  });

  it('should initialise reportTypes as empty', () => {
    expect(component.reportTypes).toEqual([]);
  });
});
