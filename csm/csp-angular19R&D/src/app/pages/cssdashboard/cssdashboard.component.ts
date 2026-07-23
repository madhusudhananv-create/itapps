import { Component, OnInit, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { Highcharts } from '../../highcharts-init';

import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { CssdashboardInputs } from '../../models/cssdashboard-inputs';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { CssdashboardFilterComponent } from './cssdashboard-filter/cssdashboard-filter.component';
import { CssdashboardCssTableComponent } from './cssdashboard-css-table/cssdashboard-css-table.component';
import { CssdashboardNextPage1Component } from './cssdashboard-next-page1/cssdashboard-next-page1.component';
import { CssdashboardNextPage2Component } from './cssdashboard-next-page2/cssdashboard-next-page2.component';

@Component({
  selector: 'app-cssdashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarNewComponent,
    CssdashboardFilterComponent,
    CssdashboardCssTableComponent,
    CssdashboardNextPage1Component,
    CssdashboardNextPage2Component
  ],
  templateUrl: './cssdashboard.component.html',
  styleUrls: ['./cssdashboard.component.scss']
})
export class CssdashboardComponent implements OnInit {
  @Input('isMenuDisabled') isMenuDisabled: boolean = false;
  trendChartDataNPSInPercentage: any;
  heatMapData: any;
  ddyear?: number[]
  selectedQuarter: string = "Q1";
  selectedYear?: number;
  pieChartData: any;
  trendChartData: any;
  csatProjWise: any;
  chart1: any;
  chart2: any;
  isLoaded: boolean = false;
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
  customer: any = [];
  @Input("custId") custId?: string;
  @Input('currIndex') currIndex: number = 0;
  startDate = new Date();
  endDate = new Date();
  fromDate?: Date;
  toDate?: Date;
  customerId?: string;
  allCust: boolean = false;
  trendQuarter: number = 1;
  top15Accounts: any;
  cssInputs: CssdashboardInputs = new CssdashboardInputs();
  customerIds?: string;
  allAccountsExcepttop15Accounts?: string;
  _loading: boolean = false;
  csmIds?: string;
  frequency?: string;
  Highcharts = Highcharts;

  private _router = inject(Router);
  public _util = inject(MyUtility);
  private _appService = inject(AppsService);
  public _access = inject(AccessControl);
  private cdref = inject(ChangeDetectorRef);

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  ngOnInit() {
    if (this._access.IsAllowed(77, 1, '', '')) {
      this.allCust = true;
    }
  }

  ngAfterViewInit() {
    // Don't bind inputs until filter emits values
    // this.bindCSATInputs();
  }

  bindCSATInputs() {
    // Only bind if we have valid dates
    if (!this.fromDate || !this.toDate) {
      return;
    }
    
    this.cssInputs = new CssdashboardInputs();
    let obj = new CssdashboardInputs();
    obj.StarT_DATE = this.fromDate != undefined ? this.fromDate.toDateString() : "";
    obj.enD_DATE = this.toDate != undefined ? this.toDate.toDateString() : "";
    obj.csM_IDs = this.csmIds || "";
    obj.customeR_IDS = this.customerIds || "";
    obj.frequency = this.frequency || "";
    this.cssInputs = obj;
  }

  receivedCssInput(event: any) {
    this.customerId = event.customerId,
      this.selectedYear = event.selectedYear,
      this.selectedQuarter = event.selectedQuarter,
      this.fromDate = event.fromDate,
      this.toDate = event.toDate,
      this.trendQuarter = event.trendQuarter,
      this.customerIds = event.customerIds,
      this.csmIds = event.csmIds,
      this.frequency = event.frequency,
      this.isLoaded = !this.isLoaded;

    this.bindCSATInputs();
  }

  resetValues() {
    this.cssInputs = new CssdashboardInputs();
  }

  getTrendData() {
    // TODO: Implement this method when AppsService.getTrendChartforCSAT is available
    // this._appService.getTrendChartforCSAT(this.value, this.selectedYear).subscribe(data => {
    //   this.trendChartData = data;
    // }, error => { this._util.serviceError(error); })
  }

  getSurveyData1() {
    this.surveyData = undefined;
    // TODO: Implement this method when AppsService.getSurveyDataPeriodwise is available
    // this._appService.getSurveyDataPeriodwise(this.cssInputs).subscribe(data => {
    //   this.surveyData = data;
    // }, error => { this._util.serviceError(error); })
  }

  getNPSTrendDataInPercentage() {
    this.trendChartDataNPSInPercentage = undefined;
    // TODO: Implement this method when AppsService.getResponseCategoryData is available
    // this._appService.getResponseCategoryData(this.cssInputs).subscribe(data => {
    //   this.trendChartDataNPSInPercentage = data;
    // }, error => { this._util.serviceError(error); })
  }

  onPrev() {
    this.currIndex--;
    if (this.currIndex == 0) {
    }
  }

  onNext() {
    this.currIndex++;
  }

  openSurveyFeedback(url: string) {
    window.open(url, '_blank');
  }

  LoadChart() {
    this.chart1 = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: this.GetCSATPeriod(this.selectedQuarter, this.selectedYear || 0),
        style: {
          "fontFamily": "\"Lucida Grande\", \"Lucida Sans Unicode\", Verdana, Arial, Helvetica, sans-serif",
          "color": "#333333",
          "fontSize": "12px",
          "fontWeight": "bold",
          "fontStyle": "normal"
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b}'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: "{point.percentage:.1f} %",
            distance: 10,
          },
          showInLegend: true
        }
      },
      series: [{
        name: 'Response Category',
        colorByPoint: true,
        data: [{
          name: 'Need Improvement(-100-0)',
          y: this.pieChartData.lessThan2
        }, {
          name: 'Good(0-30)',
          y: this.pieChartData.equalTo3
        }, {
          name: 'Great(30-70)',
          y: this.pieChartData.equalto4
        }, {
          name: 'Excellent(70-100)',
          y: this.pieChartData.equalto5
        }]
      }],
      legend: {
        "layout": "horizontal",
      },
      colors: [
        "rgb(251, 143, 115)",
        "rgb(254, 235, 132)",
        "rgb(177, 213, 126)",
        "rgb(153, 256, 256)",
      ],
      "credits": {
        "enabled": false
      },
    }
  }

  GetCSATPeriod(quarter: string, year: number) {
    var period = quarter + ' ' + year + '-' + ((year % 100) + 1) + ' ' + "Customer Success Score Distribution";
    return period;
  }

  formatLabel(value: number | null) {
    if (value == 0)
      return 'Q1';
    else if (value == 5)
      return 'Q2';
    else if (value == 10) {
      return 'Q3';
    }
    else if (value == 15)
      return 'Q4'
    return value;
  }
}
