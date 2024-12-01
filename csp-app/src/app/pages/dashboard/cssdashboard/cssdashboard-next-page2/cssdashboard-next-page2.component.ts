import { Component, OnInit, Input } from '@angular/core';
import { AppsService } from '../../../../../app/Services/apps.service';
import { myUtility } from '../../../../../app/Shared/myUtility';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more.src';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown.src';
import { CssdashboardInputs } from '../../../../models/cssdashboard-inputs';
Drilldown(Highcharts);

@Component({
  selector: 'app-cssdashboard-next-page2',
  templateUrl: './cssdashboard-next-page2.component.html',
  styleUrls: ['./cssdashboard-next-page2.component.scss']
})
export class CssdashboardNextPage2Component implements OnInit {
  @Input("allCust") allCust: Boolean = false;
  @Input("customerId") customerId: string;
  @Input("fromDate") fromDate: Date;
  @Input("toDate") toDate: Date;
  @Input("customerIds") customerIds: string;
  @Input("frequency") frequency: string;
  @Input("trendQuarter") trendQuarter: number;
  customerList: CssdashboardInputs;
  surveyQuestions: any;
  chart1: any;
  chart2: any;
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
  showTrendData = false;
  _loading = false;
  constructor(private _util: myUtility, private _appService: AppsService) { }

  Highcharts = Highcharts;

  ngOnInit() {
    
  }

  ngOnChanges() {
    
    if(this.trendQuarter == 2)
    {
      this.showTrendData = true;
    }
    else
    {
      this.showTrendData = false;
    }
    
    this.bindCSATInputs();
    this.getSurveyQuestions(this.showTrendData);

  }

  bindCSATInputs() {
    let obj = new CssdashboardInputs();
    obj.StarT_DATE = this.fromDate.toDateString();
    obj.enD_DATE = this.toDate.toDateString();
    obj.customeR_IDS = this.customerIds;
    obj.frequency = this.frequency;
    this.customerList = obj;
  }

  getSurveyQuestions(shouldLoadTrendWiseData) {
    this._loading = true;
    this._appService.getQuestionWiseRatingForCSATInsight(this.customerList,shouldLoadTrendWiseData).subscribe(data => {
      this.surveyQuestions = data;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false;})
  }

  loadTrendWiseData(event)
  {
    this._loading = true;
    this.getSurveyQuestions(event.checked);
  }
}
