import { Component, OnInit, Input } from '@angular/core';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { ProjectModel } from '../../../../models/ras/project-model';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more.src';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown.src';
import { CssdashboardInputs } from '../../../../models/cssdashboard-inputs';
Drilldown(Highcharts);

@Component({
  selector: 'app-cssdashboard-next-page1',
  templateUrl: './cssdashboard-next-page1.component.html',
  styleUrls: ['./cssdashboard-next-page1.component.scss']
})
export class CssdashboardNextPage1Component implements OnInit {

  trendChartDataNPS: any;
  trendChartDataNPSInPercentage: any;
  surveyQuestions: any;
  heatMapData: any;
  projNm: ProjectModel[];
  ddyear: number[]
  selectedQuarter: string = "Q1";
  selectedYear: number;
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
  customer: any = [];
  startDate = new Date();
  endDate = new Date();
  //selectedPeriod:number = 1;
  //customerId: string;
  @Input("allCust") allCust: Boolean = false;
  @Input("customerId") customerId: string;
  @Input("fromDate") fromDate: Date;
  @Input("toDate") toDate: Date;
  @Input("customerIds") customerIds: string;
  @Input("frequency") frequency: string;
  customerList: CssdashboardInputs;
  _loading: boolean = false;

  constructor(private _util: myUtility, private _appService: AppsService) { }


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
    if (this.customerList.customeR_IDS != undefined && this.customerList.customeR_IDS != null) {
      this._appService.getSurveyDataPeriodwise(this.customerList).subscribe(data => {
        this.surveyData = data;
        this._loading = false;
      }, error => { this._util.serviceError(error); this._loading = false; })
    }
    else {
      this._loading = false;
    }
  }

  getNPSTrendDataInPercentage() {
    this._loading = true;
    this.trendChartDataNPSInPercentage = undefined;
    if (this.customerList.customeR_IDS != undefined && this.customerList.customeR_IDS != null) {
      this._appService.getResponseCategoryData(this.customerList).subscribe(data => {
        this.trendChartDataNPSInPercentage = data;
        this._loading = false;
      }, error => { this._util.serviceError(error); this._loading = false; })
    }
    else {
      this._loading = false;
    }
  }

  bindCSATInputs() {
    let obj = new CssdashboardInputs();
    obj.StarT_DATE = this.fromDate.toDateString();
    obj.enD_DATE = this.toDate.toDateString();
    obj.customeR_IDS = this.customerIds != "-1" ? this.customerIds : null;
    obj.frequency = this.frequency;
    this.customerList = obj;
  }
}
