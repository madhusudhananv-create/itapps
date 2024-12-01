import { Component, OnInit, Input, Inject, EventEmitter, Output, ViewChild } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import * as Highcharts from 'highcharts/highstock';
import { AppsService } from '../../../Services/apps.service';
import More from 'highcharts/highcharts-more.src';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown.src';
import { ProjectModel } from '../../../models/ras/project-model';
import { enumRoles } from '../../../Shared/enum';
import { AccessControl } from '../../../Shared/accessControl';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';
import { MatSelectChange, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatOption, MatSelect, MatDialogConfig } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';



import { Router } from '@angular/router';

Drilldown(Highcharts);
// Load the exporting module.

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-cssdashboard',
  templateUrl: './cssdashboard.component.html',
  styleUrls: ['./cssdashboard.component.scss'],
  providers: [

    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]

})
export class CssdashboardComponent implements OnInit {
  @Input('isMenuDisabled') isMenuDisabled: boolean = false;
  trendChartDataNPSInPercentage: any;
  heatMapData: any;
  //projNm: ProjectModel[];
  ddyear: number[]
  selectedQuarter: string = "Q1";
  selectedYear: number;
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
  @Input("custId") custId: string;
  @Input('currIndex') currIndex: number;
  startDate = new Date();
  endDate = new Date();
  fromDate: Date;
  toDate: Date;
  //selectedPeriod:string = "Q1";
  customerId: string;
  allCust: Boolean = false;
  trendQuarter: number = 1;
  top15Accounts: any;
  cssInputs: CssdashboardInputs;
  customerIds: string;
  allAccountsExcepttop15Accounts: string;
  _loading: boolean = false;
  csmIds: string;
  constructor(private _router: Router, public _util: myUtility, private _appService: AppsService, public _access: AccessControl) {

  }

  Highcharts = Highcharts;
  ngOnInit() {

    if (this._access.IsAllowed(77, 1, '', '')) {
      this.allCust = true;
      // this.customerId = "-1"; 
    }
    else {
      // this.customerId = String(this.custId); 
    }
  }
  ngAfterViewInit() { 
    this.bindCSATInputs();

  }

  bindCSATInputs() {
    this.cssInputs = new CssdashboardInputs();
    let obj = new CssdashboardInputs();
    obj.StarT_DATE = this.fromDate != undefined ? this.fromDate.toDateString() : "";//this.fromDate.toLocaleDateString();
    obj.enD_DATE = this.toDate != undefined ? this.toDate.toDateString() : "";
    obj.csM_IDs = this.csmIds;
    obj.customeR_IDS = this.customerIds;
    if (this.selectedQuarter == "Select Period") {
      obj.frequency = "Monthly"
    }
    else {
      obj.frequency = "Quarterly"
    }
    this.cssInputs = obj;
  }


  receivedCssInput(event) {
    this.customerId = event.customerId,
      this.selectedYear = event.selectedYear,
      this.selectedQuarter = event.selectedQuarter,
      this.fromDate = event.fromDate,
      this.toDate = event.toDate,
      this.trendQuarter = event.trendQuarter,
      this.customerIds = event.customerIds,
      this.csmIds = event.csmIds
    this.isLoaded = !this.isLoaded;

    this.bindCSATInputs();

  }

  resetValues() {
    this.cssInputs = new CssdashboardInputs();
  }

  getTrendData() {
    this._appService.getTrendChartforCSAT(this.value, this.selectedYear).subscribe(data => {
      this.trendChartData = data;
    }, error => { this._util.serviceError(error); })
  }


  getSurveyData1() {
    this.surveyData = undefined;
    this._appService.getSurveyDataPeriodwise(this.cssInputs).subscribe(data => {
      this.surveyData = data;
    }, error => { this._util.serviceError(error); })
  }

  getNPSTrendDataInPercentage() {
    this.trendChartDataNPSInPercentage = undefined;
    this._appService.getResponseCategoryData(this.cssInputs).subscribe(data => {
      this.trendChartDataNPSInPercentage = data;
    }, error => { this._util.serviceError(error); })
  }

  onPrev() {
    this.currIndex--;
    if (this.currIndex == 0) {
    }
  }
  onNext() {
    this.currIndex++;
  }

  openSurveyFeedback(url) {
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
        text: this.GetCSATPeriod(this.selectedQuarter, this.selectedYear),
        style: {
          "fontFamily": "\"Lucida Grande\", \"Lucida Sans Unicode\", Verdana, Arial, Helvetica, sans-serif",
          "color": "#333333",
          "fontSize": "12px",
          "fontWeight": "bold",
          "fontStyle": "normal"
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
        }
          ,
        {
          name: 'Excellent(70-100)',
          y: this.pieChartData.equalto5
        }]
      }],
      legend: {
        "layout": "horizontal",
        // "align": "",
        // "vertical-align" :"bottom"
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
  GetCSATPeriod(quarter, year) {
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

