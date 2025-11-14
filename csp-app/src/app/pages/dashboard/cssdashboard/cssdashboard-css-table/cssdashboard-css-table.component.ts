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
  selector: 'app-cssdashboard-css-table',
  templateUrl: './cssdashboard-css-table.component.html',
  styleUrls: ['./cssdashboard-css-table.component.scss']
})
export class CssDashboardCSSTableComponent implements OnInit {

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
  @Input("isLoaded") isLoaded: boolean;
  @Input("cssDashboardInputs") cssDashboardInputs: CssdashboardInputs = new CssdashboardInputs();
  _loading: boolean = false;

  constructor(private _util: myUtility, private _appService: AppsService) { }

  Highcharts = Highcharts;

  ngOnInit() {

    // this.bindCSATInputs();
    // this.getCSATHeatmap1();
  }
  openSurveyFeedback(url) {
    window.open(url, '_blank');
  }
  ngOnChanges() {
    // this.bindCSATInputs();
    this.getCSATHeatmap1();
  }

  getCSATHeatmap1() {
    
    if (this.cssDashboardInputs != null && this.cssDashboardInputs != undefined) {
      this._loading = true;
      if ((this.cssDashboardInputs.csM_IDs != null && this.cssDashboardInputs.csM_IDs != undefined) ||
        (this.cssDashboardInputs.customeR_IDS != null && this.cssDashboardInputs.customeR_IDS != undefined)) {
        this._appService.getCSATHeatMapForPeriod(this.cssDashboardInputs).subscribe(data => {
          this.heatMapData = data;
          this._loading = false;
        }, error => { this._util.serviceError(error); this._loading = false; })
      }
    }
  }
  getSurveyData1() {
    if (this.cssDashboardInputs != null && this.cssDashboardInputs != undefined) {
    this._loading = true;
    this.surveyData = undefined;
    this._appService.getSurveyDataPeriodwise(this.cssDashboardInputs).subscribe(data => {
      this.surveyData = data;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }
}

  getNPSTrendDataInPercentage() {
    if (this.cssDashboardInputs != null && this.cssDashboardInputs != undefined) {
    this._loading = true;
    this.trendChartDataNPSInPercentage = undefined;
    this._appService.getResponseCategoryData(this.cssDashboardInputs).subscribe(data => {
      this.trendChartDataNPSInPercentage = data;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }
}

  bindCSATInputs() {
    // let obj = new CssdashboardInputs();
    // obj.StarT_DATE = this.fromDate.toDateString();
    // obj.enD_DATE = this.toDate.toDateString();
    // obj.customeR_IDS = this.customerIds;
    // obj.frequency = this.frequency;
    // obj.csM_IDs = this.csmIds;
    // this.cssDashboardInputs = obj;
  }
}
