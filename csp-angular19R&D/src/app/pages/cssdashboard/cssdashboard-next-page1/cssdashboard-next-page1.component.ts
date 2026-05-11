import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HighchartsChartComponent } from 'highcharts-angular';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { Highcharts } from '../../../highcharts-init';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';
import { inject } from '@angular/core';

@Component({
  selector: 'app-cssdashboard-next-page1',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, HighchartsChartComponent],
  templateUrl: './cssdashboard-next-page1.component.html',
  styleUrls: ['./cssdashboard-next-page1.component.scss']
})
export class CssdashboardNextPage1Component implements OnInit, OnChanges {

  private _util = inject(MyUtility);
  private _appService = inject(AppsService);

  trendChartDataNPS: any;
  trendChartDataNPSInPercentage: any;
  surveyQuestions: any;
  heatMapData: any;
  projNm: any[] = [];
  ddyear: number[] = [];
  selectedYear!: number;
  pieChartData: any;
  trendChartData: any;
  csatProjWise: any;
  chart1: any;
  chart2: any;
  surveyData: any;
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 15;
  min = 0;
  showTicks = false;
  step = 5;
  value = 0;
  vertical = false;
  stackLabels = true;
  customer: any[] = [];
  startDate = new Date();
  endDate = new Date();
  @Input('allCust') allCust: Boolean = false;
  @Input('customerId') customerId?: string;
  @Input('fromDate') fromDate?: Date;
  @Input('toDate') toDate?: Date;
  @Input('customerIds') customerIds?: string;
  @Input('frequency') frequency?: string;
  @Input('selectedQuarter') selectedQuarter: string = 'Q1';
  customerList!: CssdashboardInputs;
  _loading: boolean = false;

  Highcharts = Highcharts;

  ngOnInit() {
  }

  ngOnChanges() {
    this.bindCSATInputs();
    this.getSurveyData1();
    this.getNPSTrendDataInPercentage();
  }

  getSurveyData1() {
    this._loading = true;
    this.surveyData = undefined;
    if (this.customerList && this.customerList.customeR_IDS != undefined && this.customerList.customeR_IDS != null) {
      this._appService.getSurveyDataPeriodwise(this.customerList).subscribe({
        next: (data: any) => {
          // Apply styling only - no data transformation (matches legacy behavior)
          this.surveyData = this.applyModernChartStyle(data, 'survey');
          this._loading = false;
        },
        error: (error: any) => { this._util.serviceError(error); this._loading = false; }
      })
    }
    else {
      this._loading = false;
    }
  }

  getNPSTrendDataInPercentage() {
    this._loading = true;
    this.trendChartDataNPSInPercentage = undefined;
    if (this.customerList && this.customerList.customeR_IDS != undefined && this.customerList.customeR_IDS != null) {
      this._appService.getResponseCategoryData(this.customerList).subscribe({
        next: (data: any) => {
          // Apply styling only - no data transformation (matches legacy behavior)
          this.trendChartDataNPSInPercentage = this.applyModernChartStyle(data, 'response');
          this._loading = false;
        },
        error: (error: any) => { this._util.serviceError(error); this._loading = false; }
      })
    }
    else {
      this._loading = false;
    }
  }

  /**
   * Apply modern chart styling to Highcharts options
   * Using Angular 19 inspired design with contemporary gradients and vibrant colors
   */
  applyModernChartStyle(chartOptions: any, type: string): any {
    if (!chartOptions) return chartOptions;

    // Transform x-axis categories for H1/H2 period selection
    let transformedCategories = chartOptions.xAxis?.categories;
    if (transformedCategories && Array.isArray(transformedCategories) && 
        (this.selectedQuarter === 'H1' || this.selectedQuarter === 'H2')) {
      transformedCategories = transformedCategories.map((cat: string) => {
        if (typeof cat !== 'string') return cat;
        // Replace Q1/Q2/Q3/Q4 with the selected half-year period
        return cat.replace(/\bQ[1-4]\b/g, this.selectedQuarter);
      });
    }

    // Advanced modern color palettes - Angular 19 inspired
    const responseCategoryColors = [
      '#ef4444', // Vibrant Red - Detractors
      '#fbbf24', // Warm Amber - Passive  
      '#10b981', // Emerald Green - Promoters
      '#6366f1'  // Indigo - Info
    ];

    // Contemporary gradient-inspired flat colors for survey charts
    const surveyChartColors = [
      '#06b6d4', // Cyan - Initiated
      '#8b5cf6'  // Violet - Responded
    ];

    // Select color palette based on chart type
    const chartColors = type === 'response' ? responseCategoryColors : surveyChartColors;

    return {
      ...chartOptions,
      chart: {
        ...chartOptions.chart,
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, '#ffffff'],
            [1, '#f8fafc']
          ]
        },
        borderRadius: 16,
        style: {
          fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        spacingTop: 24,
        spacingBottom: 20,
        spacingLeft: 20,
        spacingRight: 20,
        plotBorderWidth: 0,
        plotShadow: false
      },
      title: {
        ...chartOptions.title,
        style: {
          fontSize: '18px',
          fontWeight: '700',
          color: '#0f172a',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '-0.025em'
        },
        margin: 25
      },
      subtitle: {
        ...chartOptions.subtitle,
        style: {
          fontSize: '13px',
          fontWeight: '500',
          color: '#64748b',
          fontFamily: "'Inter', sans-serif"
        }
      },
      xAxis: {
        ...chartOptions.xAxis,
        categories: transformedCategories,
        labels: {
          ...chartOptions.xAxis?.labels,
          style: {
            fontSize: '12px',
            fontWeight: '500',
            color: '#475569',
            fontFamily: "'Inter', sans-serif"
          }
        },
        lineColor: '#cbd5e1',
        lineWidth: 1,
        tickColor: 'transparent',
        gridLineColor: 'transparent',
        crosshair: {
          color: 'rgba(99, 102, 241, 0.1)',
          width: 40
        }
      },
      yAxis: {
        ...chartOptions.yAxis,
        labels: {
          ...chartOptions.yAxis?.labels,
          style: {
            fontSize: '12px',
            fontWeight: '500',
            color: '#475569',
            fontFamily: "'Inter', sans-serif"
          }
        },
        lineColor: 'transparent',
        gridLineColor: '#e2e8f0',
        gridLineDashStyle: 'Dot',
        gridLineWidth: 1,
        title: {
          ...chartOptions.yAxis?.title,
          style: {
            color: '#64748b',
            fontWeight: '600',
            fontFamily: "'Inter', sans-serif"
          }
        }
      },
      legend: {
        ...chartOptions.legend,
        itemStyle: {
          color: '#334155',
          fontWeight: '600',
          fontSize: '13px',
          fontFamily: "'Inter', sans-serif"
        },
        itemHoverStyle: {
          color: '#6366f1'
        },
        itemMarginTop: 8,
        symbolRadius: 4,
        backgroundColor: 'transparent'
      },
      tooltip: {
        ...chartOptions.tooltip,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'transparent',
        borderRadius: 12,
        padding: 14,
        style: {
          color: '#f1f5f9',
          fontSize: '13px',
          fontWeight: '500',
          fontFamily: "'Inter', sans-serif"
        },
        shadow: {
          color: 'rgba(0, 0, 0, 0.25)',
          offsetX: 0,
          offsetY: 8,
          width: 16
        },
        useHTML: true,
        headerFormat: '<span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">{point.key}</span><br/>',
        pointFormat: '<span style="color:{point.color}; font-size: 20px;">●</span> <span style="font-weight: 600;">{series.name}:</span> <span style="font-weight: 700; color: #ffffff;">{point.y}</span>'
      },
      plotOptions: {
        ...chartOptions.plotOptions,
        column: {
          ...chartOptions.plotOptions?.column,
          borderRadius: 8,
          borderWidth: 0,
          groupPadding: 0.2,
          pointPadding: 0.1,
          shadow: {
            color: 'rgba(0, 0, 0, 0.08)',
            offsetX: 0,
            offsetY: 4,
            width: 8
          },
          dataLabels: {
            ...chartOptions.plotOptions?.column?.dataLabels,
            style: {
              fontSize: '12px',
              fontWeight: '700',
              color: '#0f172a',
              textOutline: '2px white',
              fontFamily: "'Inter', sans-serif"
            }
          },
          states: {
            hover: {
              brightness: 0.1,
              shadow: {
                color: 'rgba(0, 0, 0, 0.15)',
                offsetX: 0,
                offsetY: 6,
                width: 12
              }
            }
          }
        },
        spline: {
          ...chartOptions.plotOptions?.spline,
          lineWidth: 3,
          marker: {
            enabled: true,
            radius: 6,
            lineWidth: 3,
            lineColor: '#ffffff',
            symbol: 'circle',
            states: {
              hover: {
                radius: 8,
                lineWidth: 4
              }
            }
          },
          shadow: {
            color: 'rgba(0, 0, 0, 0.1)',
            offsetX: 0,
            offsetY: 3,
            width: 6
          }
        },
        line: {
          ...chartOptions.plotOptions?.line,
          lineWidth: 3,
          marker: {
            enabled: true,
            radius: 6,
            lineWidth: 3,
            lineColor: '#ffffff',
            symbol: 'circle'
          }
        },
        pie: {
          ...chartOptions.plotOptions?.pie,
          borderWidth: 0,
          shadow: {
            color: 'rgba(0, 0, 0, 0.1)',
            offsetX: 0,
            offsetY: 4,
            width: 8
          },
          dataLabels: {
            style: {
              fontSize: '12px',
              fontWeight: '600',
              color: '#334155',
              textOutline: 'none',
              fontFamily: "'Inter', sans-serif"
            }
          }
        },
        series: {
          ...chartOptions.plotOptions?.series,
          animation: {
            duration: 1000,
            easing: 'easeOutQuint'
          }
        }
      },
      // Enable all export features
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: [
              'printChart',
              'separator',
              'downloadPNG',
              'downloadJPEG',
              'downloadPDF',
              'downloadSVG',
              'separator',
              'downloadCSV',
              'downloadXLS',
              'viewData',
              'openInCloud'
            ],
            symbol: 'menu',
            symbolStroke: '#6366f1',
            symbolStrokeWidth: 2,
            symbolSize: 14,
            theme: {
              fill: '#f8fafc',
              stroke: '#e2e8f0',
              'stroke-width': 1,
              r: 8,
              states: {
                hover: {
                  fill: '#eef2ff',
                  stroke: '#6366f1'
                },
                select: {
                  fill: '#e0e7ff',
                  stroke: '#6366f1'
                }
              }
            }
          }
        },
        chartOptions: {
          chart: {
            backgroundColor: '#ffffff'
          }
        }
      },
      navigation: {
        menuStyle: {
          background: '#ffffff',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          padding: '12px 0'
        },
        menuItemStyle: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: '500',
          color: '#334155',
          padding: '12px 20px',
          transition: 'all 0.2s ease'
        },
        menuItemHoverStyle: {
          background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
          color: '#4f46e5'
        }
      },
      colors: chartColors,
      credits: {
        enabled: false
      }
    };
  }

  bindCSATInputs() {
    if (!this.fromDate || !this.toDate) {
      return;
    }
    let obj = new CssdashboardInputs();
    obj.StarT_DATE = this.fromDate.toDateString();
    obj.enD_DATE = this.toDate.toDateString();
    obj.customeR_IDS = this.customerIds != '-1' ? (this.customerIds || '') : '';
    obj.frequency = this.frequency || '';
    this.customerList = obj;
  }
}
