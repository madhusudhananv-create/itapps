import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DashboardPortfolioAchievementDetailComponent } from './dashboard-portfolio-achievement-detail.component';
import { AppsService } from '../../../../services/apps.service';
import { MyUtility } from '../../../../shared/my-utility';
import { DashboardService } from '../../../../services/dashboard.service';
import { ChartsService } from '../../../../services/charts.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('DashboardPortfolioAchievementDetailComponent', () => {
  let component: DashboardPortfolioAchievementDetailComponent;
  let fixture: ComponentFixture<DashboardPortfolioAchievementDetailComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDashboardUtil: any;
  let mockChartsService: any;
  let mockDialogRef: any;
  let mockDialog: any;

  const dialogData = {
    porftolioWiseData: [
      {
        title: 'Portfolio 1',
        meT_CRITICAL_KPI: 3,
        meT_KEY_KPI: 2,
        criticaL_KPI: 3,
        overalL_KPI_COUNT: 10,
        secondarY_MET_CRITICAL_KPI: 2,
        secondarY_MET_KEY_KPI: 1,
        slA_STATUS: 'Under Control',
        secondarY_SLA_STATUS: 'Need Focus'
      }
    ],
    custId: 'C1',
    viewBy: 'By Expected Service Level',
    includeExlcusions: false
  };

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetDBConfigValue: jasmine.createSpy().and.returnValue(of('80'))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      AppSettings: { token: 'test-token' }
    };
    mockDashboardUtil = {
      filteR_MONTH: '01',
      filteR_YEAR: 2024
    };
    mockChartsService = {
      getTrendHighChartDetailsForPortfolio: jasmine.createSpy().and.returnValue(of([{
        trendHighChart: [{ trendHighChart: {} }]
      }]))
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({
        afterClosed: () => of(null)
      })
    };

    TestBed.configureTestingModule({
      imports: [DashboardPortfolioAchievementDetailComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: DashboardService, useValue: mockDashboardUtil },
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
    fixture = TestBed.createComponent(DashboardPortfolioAchievementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data from dialog data', () => {
    expect(component.portData).toBeDefined();
    expect(component.custId).toBe('C1' as any);
    expect(component.viewByAchievement).toBe('By Expected Service Level');
    expect(component.includeExclusions).toBe(false);
  });

  it('should initialize isLoading to false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should close dialog when onClose is called', () => {
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should return correct achievement string', () => {
    const portData = {
      meT_CRITICAL_KPI: 4,
      meT_KEY_KPI: 2,
      overalL_KPI_COUNT: 10,
      exclusioN_MET_CRITICAL_KPI: 3,
      exclusioN_MET_KEY_KPI: 1
    };
    component.includeExclusions = false;
    const result = component.getAchievement(portData);
    expect(parseFloat(result)).toBe(60);
  });

  it('should return Need Focus when critical KPI not met', () => {
    const portData = {
      criticaL_KPI: 5,
      meT_CRITICAL_KPI: 3,
      meT_KEY_KPI: 2,
      overalL_KPI_COUNT: 10,
      exclusioN_MET_CRITICAL_KPI: 3,
      exclusioN_MET_KEY_KPI: 1
    };
    component.includeExclusions = false;
    component.achievementPer = '80';
    const result = component.getStatus(portData);
    expect(result).toBe('Need Focus');
  });

  it('should return Under Control when critical KPI met and achievement >= threshold', () => {
    const portData = {
      criticaL_KPI: 3,
      meT_CRITICAL_KPI: 3,
      meT_KEY_KPI: 5,
      overalL_KPI_COUNT: 10,
      exclusioN_MET_CRITICAL_KPI: 3,
      exclusioN_MET_KEY_KPI: 5
    };
    component.includeExclusions = false;
    component.achievementPer = '70';
    const result = component.getStatus(portData);
    expect(result).toBe('Under Control');
  });

  it('should get SLA status by viewByAchievement', () => {
    const portData = { slA_STATUS: 'Under Control', secondarY_SLA_STATUS: 'Need Focus' };
    component.viewByAchievement = 'By Expected Service Level';
    expect(component.getSLAStatus(portData)).toBe('Under Control');
    component.viewByAchievement = 'By Minimum Service Level';
    expect(component.getSLAStatus(portData)).toBe('Need Focus');
  });

  it('should call getTrendHighChartDetailsForPortfolio on displayGraph', () => {
    component.displayGraph('P1', 'KPI1');
    expect(mockChartsService.getTrendHighChartDetailsForPortfolio).toHaveBeenCalled();
  });

  it('should open ViewTrendChartComponent after chart data load', () => {
    component.getTrendHighChartDetails('P1', 'KPI1');
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should set portDisplayIndex when setPortIndex is called', () => {
    component.portDetails = [{ portfoliO_ID: 'P1' }];
    const mockImage = { src: '/assets/images/plus.svg' };
    component.setPortIndex(0, mockImage, 'P1');
    expect(component.portDisplayIndex).toBe(0);
  });
});
