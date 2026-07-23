import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DashboardEngagementLevelAchievementDetailComponent } from './dashboard-engagement-level-achievement-detail.component';
import { AppsService } from '../../../../services/apps.service';
import { MyUtility } from '../../../../shared/my-utility';
import { ChartsService } from '../../../../services/charts.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('DashboardEngagementLevelAchievementDetailComponent', () => {
  let component: DashboardEngagementLevelAchievementDetailComponent;
  let fixture: ComponentFixture<DashboardEngagementLevelAchievementDetailComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockChartsService: any;
  let mockDialogRef: any;
  let mockDialog: any;

  const dialogData = {
    engagementlevelDetails: [{ kpI_NAME: 'KPI1', expected: 95, actual: 98 }],
    viewBy: 'By Expected Service Level',
    custId: 'C1',
    includeExclusions: false,
    date: '20240101'
  };

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetDBConfigValueFields: jasmine.createSpy().and.returnValue(of(''))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      AppSettings: { token: 'test-token' }
    };
    mockChartsService = {
      getTrendHighChartDetailsForEngagement: jasmine.createSpy().and.returnValue(of([{
        trendHighChart: [{ trendHighChart: {} }]
      }]))
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) })
    };

    TestBed.configureTestingModule({
      imports: [DashboardEngagementLevelAchievementDetailComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: ChartsService, useValue: mockChartsService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardEngagementLevelAchievementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data from dialog data', () => {
    expect(component.engagementKPI).toEqual(dialogData.engagementlevelDetails);
    expect(component.viewBy).toBe('By Expected Service Level');
    expect(component.custId).toBe('C1');
    expect(component.includeExclusions).toBe(false);
  });

  it('should set isLoading to false initially', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should close dialog when onClose is called', () => {
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should return Met when actual >= expected', () => {
    const result = component.getAchievementStatus('KPI1', 95, 98);
    expect(result).toBe('Met');
  });

  it('should return Not Met when actual < expected', () => {
    const result = component.getAchievementStatus('KPI1', 95, 80);
    expect(result).toBe('Not Met');
  });

  it('should return empty string when actual is null', () => {
    const result = component.getAchievementStatus('KPI1', 95, null);
    expect(result).toBe('');
  });

  it('should call getTrendHighChartDetailsForEngagement on displayGraph', () => {
    component.displayGraph('KPI1');
    expect(mockChartsService.getTrendHighChartDetailsForEngagement).toHaveBeenCalled();
  });

  it('should call serviceError on chart load error', () => {
    mockChartsService.getTrendHighChartDetailsForEngagement.and.returnValue(throwError(() => new Error('error')));
    component.getTrendHighChartDetails('KPI1');
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should open ViewTrendChartComponent dialog after chart data load', () => {
    component.getTrendHighChartDetails('KPI1');
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
