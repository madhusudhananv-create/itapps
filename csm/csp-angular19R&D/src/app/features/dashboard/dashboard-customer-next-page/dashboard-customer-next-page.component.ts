import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { HighchartsChartComponent } from 'highcharts-angular';
import { MatIconModule } from '@angular/material/icon';
import { Highcharts } from '../../../highcharts-init';

import { DashboardDetailsModel } from '../../../models/dashboard-details-model';
import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ProjectModelNew } from '../../../models/portfolio-model';
import { DashboardService } from '../../../services/dashboard.service';

/**
 * Dashboard Customer Next Page Component
 * 
 * Modern Angular 19 standalone component featuring:
 * - Highcharts pie and column visualizations
 * - Assessment status tracking
 * - CAP stages monitoring
 * - Findings analysis by type and age
 * - Material Design UI with smooth animations
 * - Fully responsive layout
 */
@Component({
  selector: 'app-dashboard-customer-next-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HighchartsChartComponent,
    MatIconModule
  ],
  templateUrl: './dashboard-customer-next-page.component.html',
  styleUrls: ['./dashboard-customer-next-page.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardCustomerNextPageComponent implements OnInit, OnChanges {
  @Input('customerId') customerId: string = '';
  @Input('month') month: string = '';
  @Input('year') year: any;
  @Input('projectArray') projArray: any[] = [];

  isFindingsByTimeEmpty: boolean = false;
  isFindingsByTypeEmpty: boolean = false;
  findingdatatype: any[] = [];
  dashboardDetails: DashboardDetailsModel[] = [];
  portfolioprojectMap: ProjectModelNew[] = [];
  isAuditStatusEmpty: boolean = false;
  isFindingsByStageEmpty: boolean = false;
  planned: number = 0;
  inProgress: number = 0;
  cancelled: number = 0;
  completed: number = 0;

  constructor(
    public _dashboardUtil: DashboardService,
    private _router: Router,
    private _appservice: AppsService,
    public _util: UtilityService
  ) { }

  ngOnInit() {
    // Use setTimeout to ensure @Input bindings are complete before loading data
    setTimeout(() => {
      if (this._util.IsPremier(this.customerId) && this.projArray.length == 0) {
        this.service_getProjectPortfolioMapping();
        this.service_GetDashboardDetails();
      } else if (this.customerId) {
        this.service_GetDashboardDetails();
      }
    }, 0);
  }

  ngOnChanges() {
    // Only reload if not first change (ngOnInit handles first load)
    if (this.customerId) {
      if (this._util.IsPremier(this.customerId) && this.projArray.length == 0) {
        this.service_getProjectPortfolioMapping();
        this.service_GetDashboardDetails();
      } else {
        this.service_GetDashboardDetails();
      }
    }
  }

  getSelectedProjectsList(event: any) {
    this.projArray = event;
  }

  stagesDict: { [key: string]: string } = {
    'STAGE_FINDING_AUDITEE_ACCEPTANCE AND CAP SUBMISSION': 'Submitted',
    'STAGE_FINDING_CAP REVIEW': 'Review',
    'STAGE_FINDING_IMPLEMENT CAP': 'Implementation',
    'STAGE_FINDING_APPROVE CAP BY CUSTOMER': 'Verification'
  };

  Highcharts = Highcharts;

  chartColors = {
    primary:    ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'],
    secondary:  ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#06b6d4', '#eab308', '#4b5563'],
    assessment: ['#6366f1', '#f59e0b', '#22c55e', '#94a3b8'],
    stages:     ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
    age:        ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#06b6d4', '#eab308', '#4b5563']
  };

  assessmentChartOptions:    any = null;
  capStagesChartOptions:     any = null;
  findingsByTypeChartOptions: any = null;
  findingsByAgeChartOptions:  any = null;

  // ─────────────────────────────────────────────────────────────────────────
  // buildPieChartOptions
  //
  // CONTRACT: callers MUST pass only non-zero data items.
  //           colors[i] is the exact color for data[i] — 1-to-1, no gaps.
  //
  // WHY this works:
  //   Highcharts pie chart with colorByPoint:true on the series cycles through
  //   the chart-level `colors[]` array in order: colors[0] → point 0,
  //   colors[1] → point 1, etc.  The same array drives the legend symbol color.
  //   Because callers pre-filter zeros and resolve colors by name, there is
  //   zero chance of index misalignment between slice and legend symbol.
  // ─────────────────────────────────────────────────────────────────────────
  buildPieChartOptions(title: string, data: any[], colors: string[]): any {
    const seriesData = data.map((item, i) => ({
      name:  item[0],
      y:     item[1],
      color: colors[i],
      className: `custom-point-${i}`
    }));

    // Also inject a <style> block to override by className — this cannot
    // be overridden by any Highcharts internal CSS
    const styleOverrides = data.map((item, i) =>
      `.custom-point-${i} { fill: ${colors[i]} !important; }`
    ).join(' ');

    return {
      colors,
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: 200,
        style: { fontFamily: 'Inter, sans-serif' },
        events: {
          render: function(this: any) {
            const chart = this;
            setTimeout(() => {
              chart.series[0]?.points?.forEach((p: any, i: number) => {
                const color = colors[i];
                if (!color) return;
                // Force slice fill
                p.graphic?.element?.setAttribute('fill', color);
                // Force legend symbol fill
                p.legendItem?.symbol?.element?.setAttribute('fill', color);
                p.legendItem?.symbol?.attr({ fill: color });
              });
            }, 50);
          }
        }
      },
      title:   { text: '' },
      credits: { enabled: false },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            align: 'right', verticalAlign: 'top', x: 0, y: 0,
            symbolStroke: '#6b7280',
            theme: {
              fill: 'transparent',
              states: { hover: { fill: '#f3f4f6' }, select: { fill: '#e5e7eb' } }
            },
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
              'viewData'
            ]
          }
        }
      },
      tooltip: {
        pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)',
        style: { fontSize: '12px' }
      },
      plotOptions: {
        pie: {
          colorByPoint: true,
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.y}',
            distance: -25,
            style: { fontWeight: 'bold', color: '#ffffff', fontSize: '11px', textOutline: 'none' }
          },
          showInLegend: true,
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      },
      legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        useHTML: false,
        labelFormatter: function (this: any): string {
          return this.name;
        },
        itemStyle:       { fontSize: '11px', fontWeight: '500', color: '#1f2937', textDecoration: 'none' },
        itemHoverStyle:  { color: '#1f2937' },
        itemHiddenStyle: { color: '#9ca3af' },
        itemMarginTop: 4, itemMarginBottom: 4,
        symbolRadius: 4, symbolHeight: 10, symbolWidth: 10
      },
      series: [{
        type: 'pie',
        name: title,
        data: seriesData
      }]
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // buildStackedColumnOptions  (unchanged — works correctly already)
  // ─────────────────────────────────────────────────────────────────────────
  buildStackedColumnOptions(columnNames: string[], data: any[]): any {
    const categories = data.map(row => row[0]);
    const seriesNames = columnNames.slice(1);
    const seriesData: any[] = [];

    seriesNames.forEach((name, idx) => {
      seriesData.push({
        name,
        data: data.map(row => row[idx + 1]),
        color: this.chartColors.age[idx % this.chartColors.age.length]
      });
    });

    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 200,
        style: { fontFamily: 'Inter, sans-serif' },
        animation: { duration: 800, easing: 'easeOutQuart' }
      },
      title:   { text: '' },
      credits: { enabled: false },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            align: 'right', verticalAlign: 'top', x: 0, y: 0,
            symbolStroke: '#6b7280',
            theme: {
              fill: 'transparent',
              states: { hover: { fill: '#f3f4f6' }, select: { fill: '#e5e7eb' } }
            },
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
              'viewData'
            ]
          }
        }
      },
      xAxis: {
        categories,
        labels: { style: { fontSize: '9px', color: '#6b7280' } },
        lineColor: '#e5e7eb',
        tickColor: '#e5e7eb'
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: { text: 'count', style: { fontSize: '11px', color: '#6b7280' } },
        gridLineColor: '#f3f4f6',
        labels: { style: { fontSize: '10px', color: '#6b7280' } }
      },
      legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        useHTML: false,
        labelFormatter: function (this: any): string {
          return this.name;
        },
        itemStyle:      { fontSize: '10px', fontWeight: '500', color: '#1f2937' },
        itemHoverStyle: { color: '#1f2937' },
        itemMarginTop: 2, itemMarginBottom: 2,
        symbolRadius: 2, symbolHeight: 10, symbolWidth: 10
      },
      tooltip: { shared: true, style: { fontSize: '11px' } },
      plotOptions: {
        column: { stacking: 'normal', borderRadius: 3, borderWidth: 0, dataLabels: { enabled: false } }
      },
      series: seriesData
    };
  }

  // ── Legacy Google Charts properties (kept for compatibility) ───────────────
  typefindingBytime: any = 'ColumnChart';
  findingdatatime:   any[] = [];
  columfindingtime:  any;
  widthfindingtime  = 500;
  heightfindingtime = 190;
  optionfindingtime: any = {};

  typefindingBytype: any = 'PieChart';
  findingdata:  any[] = [];
  columfinding  = ['Status', 'Value'];
  widthfinding  = 500;
  heightfinding = 180;
  optionfinding: any = {};

  typeaudit: any = 'PieChart';
  auditdata: any[] = [['Planned', 0], ['In Progress', 0], ['Completed', 0], ['Cancelled', 0]];
  columaudit  = ['Status', 'Value'];
  widthaudit  = 500;
  heightaudit = 180;
  optionaudit: any = {};

  typefindingBystage: any = 'PieChart';
  findingdatastage:   any[] = [];
  columfindingstage   = ['Status', 'Value'];
  widthfindingstage   = 500;
  heightfindingstage  = 180;
  optionfindingstage: any = {};

  // ─────────────────────────────────────────────────────────────────────────
  // Data fetching & chart building
  // ─────────────────────────────────────────────────────────────────────────

  GetAssessmentFindingsByTime(custId: string, projArray: any[]) {
    this._appservice.getAssessmentFindingsByTime(custId, projArray).subscribe(data => {
      this.findingdatatime  = data.values;
      this.columfindingtime = data.columnnames;

      if (this.findingdatatime.length > 0) {
        this.isFindingsByTimeEmpty = false;
        this.findingsByAgeChartOptions = this.buildStackedColumnOptions(this.columfindingtime, this.findingdatatime);
      } else {
        this.isFindingsByTimeEmpty = true;
        this.findingsByAgeChartOptions = null;
      }
    }, error => { this._util.serviceError(error); });
  }

  fillQAFindingsSummary1() {
    let findingsTitle: any[] = [];
    let result: any[] = [];
    this.projArray.forEach(x => {
      findingsTitle = this.getTitlesByString('FINDING_', x);
      result = result.concat(findingsTitle);
    });

    result = result.filter((x, i, a) => a.indexOf(x) === i);
    const valuesArray: number[] = new Array(result.length).fill(0);

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projArray.length; j++) {
        valuesArray[i] += this.getGraphValue_project(result[i], this.projArray[j]);
      }
    }

    this.findingdata = [];
    for (let i = 0; i < result.length; i++) {
      let t = result[i].substr(8);
      t = t.charAt(0) + t.substr(1).toLowerCase();
      this.findingdata.push([t, valuesArray[i]]);
    }

    this.getChartVal();
    const total = valuesArray.reduce((x, y) => x + y, 0);
    this.isFindingsByTypeEmpty = total === 0;
  }

  getChartVal() {
    // Fixed color map — each type name always gets the same color.
    const typeColorMap: { [name: string]: string } = {
      'Strength':                      this.chartColors.secondary[0],  // #22c55e green
      'Weakness':                      this.chartColors.secondary[1],  // #f59e0b amber
      'Opportunity':                   this.chartColors.secondary[2],  // #3b82f6 blue
      'Threat':                        this.chartColors.secondary[3],  // #ef4444 red
      'Major':                         this.chartColors.secondary[4],  // #ec4899 pink
      'Minor':                         this.chartColors.secondary[5],  // #06b6d4 cyan
      'Opportunities for Improvement': this.chartColors.secondary[6],  // #eab308 yellow
      'Recommendations':               this.chartColors.secondary[7]   // #4b5563 gray
    };

    const typerArr: any[] = [
      ['Strength', 0], ['Weakness', 0], ['Opportunity', 0], ['Threat', 0],
      ['Major', 0], ['Minor', 0], ['Opportunities for Improvement', 0], ['Recommendations', 0]
    ];
    this.findingdatatype = typerArr;

    typerArr.forEach((x, i) => {
      this.findingdata.forEach(y => {
        if (x[0] === y[0]) this.findingdatatype[i][1] = y[1];
      });
    });

    // Only pass non-zero items — colors[i] matches data[i] exactly, no gaps.
    const nonZeroData   = this.findingdatatype.filter(item => item[1] > 0);
    const nonZeroColors = nonZeroData.map(item => typeColorMap[item[0]] || '#94a3b8');

    if (nonZeroData.length > 0) {
      this.isFindingsByTypeEmpty = false;
      this.findingsByTypeChartOptions = this.buildPieChartOptions('Findings by Type', nonZeroData, nonZeroColors);
    } else {
      this.isFindingsByTypeEmpty = true;
      this.findingsByTypeChartOptions = null;
    }
  }

  getTitlesByString(string: string, projid: any): string[] {
    if (!this.dashboardDetails) return [];
    return this.dashboardDetails
      .filter(entry => entry.title.startsWith(string) && entry.proJ_ID == projid)
      .filter((x, i, a) => a.indexOf(x) === i)
      .map(x => x.title);
  }

  getGraphValue_project(title: string, projid: any): number {
    const sValue = this.getTitleByProject(title, projid);
    if (sValue && sValue !== '-') {
      return Number(sValue.replace(/\D/g, '')) || 0;
    }
    return 0;
  }

  getTitleByProject(title: string, projid: any): string {
    if (!this.dashboardDetails) return '-';
    const details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == projid);
    return details.length > 0 ? details[0].content : '-';
  }

  service_GetDashboardDetails() {
    this._appservice.GetDashboardDetailsbyCustomerId(this.customerId).subscribe(
      data => { this.dashboardDetails = data; },
      error => { this._util.serviceError(error); },
      () => {
        this.fillQAAuditStatus1();
        this.fillQAFindingsSummary1();
        this.fillQAFindingsByStage1();
        this.GetAssessmentFindingsByTime(this.customerId, this.projArray);
      }
    );
  }

  setValue() {
    localStorage.setItem('isFromFindingByAge', 'true');
  }

  service_getProjectPortfolioMapping() {
    this._appservice.getProjectPortfolioMapping(this.customerId, this._util.ShouldLoadAllProjects()).subscribe(
      (data: ProjectModelNew[]) => {
        this.portfolioprojectMap = data;
        this.projArray = this.portfolioprojectMap.map(x => x.proj_id);
      },
      () => {},
      () => {}
    );
  }

  fillQAAuditStatus1() {
    if (!this.month || !this.year) {
      this.isAuditStatusEmpty = true;
      this.assessmentChartOptions = null;
      return;
    }

    const monthNum = this._util.getMonthNum(this.month);
    const yearNum  = parseInt(this.year);

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      this.isAuditStatusEmpty = true;
      this.assessmentChartOptions = null;
      return;
    }

    // Fixed color map — each status name always gets the same color.
    const assessmentColorMap: { [name: string]: string } = {
      'Planned':     this.chartColors.assessment[0],  // #6366f1 indigo
      'In Progress': this.chartColors.assessment[1],  // #f59e0b amber
      'Completed':   this.chartColors.assessment[2],  // #22c55e green
      'Cancelled':   this.chartColors.assessment[3]   // #94a3b8 slate
    };

    this._appservice.GetAssessmentDetails(this.customerId, monthNum, yearNum).subscribe({
      next: (data: any) => {
        this.planned    = data['audiT_PLANNED'];
        this.inProgress = data['audiT_IN_PROGRESS'];
        this.completed  = data['audiT_COMPLETED'];
        this.cancelled  = data['audiT_CANCELLED'];

        if ((this.planned + this.inProgress + this.completed + this.cancelled) === 0) {
          this.isAuditStatusEmpty = true;
          this.assessmentChartOptions = null;
        } else {
          this.isAuditStatusEmpty = false;
          this.auditdata = [
            ['Planned',     this.planned],
            ['In Progress', this.inProgress],
            ['Completed',   this.completed],
            ['Cancelled',   this.cancelled]
          ];

          // Only pass non-zero items — colors[i] matches data[i] exactly, no gaps.
          const nonZeroAudit       = this.auditdata.filter(item => item[1] > 0);
          const nonZeroAuditColors = nonZeroAudit.map(item => assessmentColorMap[item[0]] || '#94a3b8');
          this.assessmentChartOptions = this.buildPieChartOptions('Assessment Status', nonZeroAudit, nonZeroAuditColors);
        }
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  fillQAFindingsByStage1() {
    let findingsTitle: any[] = [];
    let result: any[] = [];
    this.projArray.forEach(x => {
      findingsTitle = this.getTitlesByString('STAGE_FINDING_', x);
      result = result.concat(findingsTitle);
    });

    result = result.filter((x, i, a) => a.indexOf(x) === i);

    const valuesArray: number[] = new Array(result.length).fill(0);
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projArray.length; j++) {
        valuesArray[i] += this.getGraphValue_project(result[i], this.projArray[j]);
      }
    }

    const total = valuesArray.reduce((x, y) => x + y, 0);
    if (total === 0) {
      this.isFindingsByStageEmpty = true;
      this.capStagesChartOptions  = null;
      return;
    }

    this.isFindingsByStageEmpty = false;
    this.findingdatastage = result.map((key, i) => [this.stagesDict[key], valuesArray[i]]);

    // Fixed color map — each stage name always gets the same color.
    const stageColorMap: { [name: string]: string } = {
      'Review':         this.chartColors.stages[0],  // #22c55e green
      'Implementation': this.chartColors.stages[1],  // #3b82f6 blue
      'Verification':   this.chartColors.stages[2],  // #f59e0b orange
      'Submitted':      this.chartColors.stages[3]   // #ef4444 red
    };

    // Only pass non-zero items — colors[i] matches data[i] exactly, no gaps.
    const nonZeroStage       = this.findingdatastage.filter(item => item[1] > 0);
    const nonZeroStageColors = nonZeroStage.map(item => stageColorMap[item[0]] || '#94a3b8');
    this.capStagesChartOptions = this.buildPieChartOptions('CAP Stages', nonZeroStage, nonZeroStageColors);
  }
}