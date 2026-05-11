import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewTrendChartComponent } from './view-trend-chart.component';
import { MyUtility } from '../../../../shared/my-utility';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('ViewTrendChartComponent', () => {
  let component: ViewTrendChartComponent;
  let fixture: ComponentFixture<ViewTrendChartComponent>;
  let mockUtil: any;
  let mockDialogRef: any;

  const chartData = {
    trendHighChart: [{ trendHighChart: { title: { text: 'Test Chart' } } }]
  };
  const dialogData = {
    portfolioId: 'P1',
    kpiName: 'KPI 1|sub',
    ChartData: [
      {
        goalName: 'KPI 1',
        trendHighChart: [
          {
            kpiId: 'P1',
            trendHighChart: { title: { text: 'Portfolio Chart' } }
          }
        ]
      }
    ]
  };

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy(),
      AppSettings: { token: 'test-token' }
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [ViewTrendChartComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTrendChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize getData from dialog data', () => {
    expect(component.getData).toEqual(dialogData);
  });

  it('should load graph with portfolio ID when portfolioId is set', () => {
    component.getData = dialogData;
    component.LoadGraph();
    expect(component.chartOptions).toBeDefined();
  });

  it('should load engagement graph when portfolioId is null', () => {
    const engagementData = {
      portfolioId: null,
      kpiName: 'KPI 1',
      ChartData: [
        {
          trendHighChart: [
            {
              trendHighChart: { title: { text: 'Engagement Chart' } }
            }
          ]
        }
      ]
    };
    component.getData = engagementData;
    component.LoadGraphForEnagagment();
    expect(component.chartOptions).toBeDefined();
  });

  it('should close dialog when closeDialog is called', () => {
    component.closeDialog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
