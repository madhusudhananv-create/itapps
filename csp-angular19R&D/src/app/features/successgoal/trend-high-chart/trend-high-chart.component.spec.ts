import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

import { TrendHighChartComponent } from './trend-high-chart.component';
import { MyUtility } from '../../../shared/my-utility';

describe('TrendHighChartComponent', () => {
  let component: TrendHighChartComponent;
  let fixture: ComponentFixture<TrendHighChartComponent>;
  let mockDialogRef: any;
  let mockUtil: any;
  let mockDialogData: any;

  const trendChart = { series: [] } as any;

  beforeEach(waitForAsync(() => {
    mockDialogRef = {
      disableClose: false,
      close: jasmine.createSpy('close')
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError')
    };

    mockDialogData = {
      GoalName: 'GoalA|extra',
      KPIId: 10,
      ChartData: [
        {
          goalName: 'GoalA',
          trendHighChart: [
            {
              kpiId: 10,
              trendHighChart: trendChart
            }
          ]
        }
      ]
    };

    TestBed.configureTestingModule({
      imports: [TrendHighChartComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient(),
        provideAnimations()
      ]
    }).overrideComponent(TrendHighChartComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendHighChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set dialogRef.disableClose to true', () => {
      expect(mockDialogRef.disableClose).toBe(true);
    });

    it('should receive dialog data via MAT_DIALOG_DATA', () => {
      expect(component.data).toBe(mockDialogData);
    });
  });

  describe('ngOnInit', () => {
    it('should set getData from dialog data', () => {
      expect(component.getData).toBe(mockDialogData);
    });

    it('should call LoadGraph on init', () => {
      spyOn(component, 'LoadGraph');
      component.ngOnInit();
      expect(component.LoadGraph).toHaveBeenCalled();
    });
  });

  describe('LoadGraph', () => {
    it('should populate chartOptions from ChartData matching GoalName and KPIId', () => {
      component.getData = mockDialogData;
      component.LoadGraph();
      expect(component.chartOptions).toBe(trendChart);
    });

    it('should match GoalName using the part before the pipe character', () => {
      component.getData = {
        GoalName: 'GoalA|something',
        KPIId: 10,
        ChartData: [
          {
            goalName: 'GoalA',
            trendHighChart: [{ kpiId: 10, trendHighChart: trendChart }]
          }
        ]
      };
      component.LoadGraph();
      expect(component.chartOptions).toBe(trendChart);
    });
  });

  describe('closeDialog', () => {
    it('should call dialogRef.close()', () => {
      component.closeDialog();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
