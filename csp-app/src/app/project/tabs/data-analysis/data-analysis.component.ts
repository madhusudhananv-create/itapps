import { Component, OnInit } from '@angular/core';
import { SqaChartGroupsModel } from '../../../models/sqa-chart-groups-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
//import { Chart } from 'highcharts';
import * as Highcharts from 'highcharts';
import * as highchartsPareto from 'highcharts/modules/pareto';
import { Input } from '@angular/core';

highchartsPareto(Highcharts);


@Component({
  selector: 'app-data-analysis',
  templateUrl: './data-analysis.component.html',
  styleUrls: ['./data-analysis.component.scss']
})
export class DataAnalysisComponent implements OnInit {
  @Input('custId') custId: string;
  projId;
  Highcharts = Highcharts;
  selectedDiv: string = 'mainDiv';
  _loadingCharts: boolean = false;
  constructor(private _util: myUtility, private _appservice: AppsService) { }
  selectedGroup: SqaChartGroupsModel = new SqaChartGroupsModel();
  ProjectVisualCharts: any[] = [];

  ngOnInit() {
    // this.selectedGroup.starT_DATE = new Date('1-aug-2018');
    // this.selectedGroup.enD_DATE = new Date('30-sep-2018');
    // this.selectedGroup.datA_DUMP_TYPE = 'Incident';
  }

  ShowParameterTab(feature) {
    if (feature == 'ANL')
      this.selectedDiv = 'analysisDiv';
    else if (feature == 'Process performance') {
      this.selectedGroup.grouP_ID = feature
      this.selectedDiv = 'reportsDiv';
    }
    else if (feature == 'Find patterns') {
      this.selectedGroup.grouP_ID = feature
      this.selectedDiv = 'reportsDiv';
    }
  }
  BackToMainPage_onClick() {
    this.selectedDiv = 'mainDiv';
    this.ProjectVisualCharts = [];
  }
  GenerateChart_onClick() {
    this.service_GetSQAProjectCharts(this.projId);
  }

  isVisible(divType) {
    if (this.selectedDiv === divType)
      return true;
    else
      return false;
  }
  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
  }
  iChartCount = 0;
  iChartCurrent = 0;
  service_GetSQAProjectCharts(projId) {
    this.iChartCount = 0;
    this.iChartCurrent = 0;
    if(this.selectedGroup.starT_DATE ==null || this.selectedGroup.enD_DATE ==null)
    {
    
      return;
    }
    this._loadingCharts = true;
    this.ProjectVisualCharts = [];
    
    this._appservice.GetSQAGroupCharts(this.selectedGroup, projId).subscribe(data => {
      this.ProjectVisualCharts = data;
      for (let v of this.ProjectVisualCharts) {
        this.iChartCount = this.iChartCount + v.params.length;
      }
      this.iChartCurrent = 1; 
      for (let v of this.ProjectVisualCharts) {
        for (let param of v.params) {
          //-------------------------
          this._appservice.GetSQAChartFromParams(param).subscribe(data => {
            v.charts.push(data);
            this.iChartCurrent += 1;
            this.stopLoading();
          }, error => {
            this._util.serviceError(error);
            this.stopLoading();
          });
          //-------------------------
        }
      }
    }, error => {
      this._loadingCharts = false
      this._util.serviceError(error);
    });
  }
  // iChartCount = 0;
  // iChartCurrent = 0;
  // service_GetSQAProjectCharts(projId, startdate, enddate) {
  //   this.iChartCount = 0;
  //   this.iChartCurrent = 0;
  //   this._loadingCharts = true;
  //   this.ProjectVisualCharts = [];
  //   this._appservice.GetSQAChartsParams(projId, startdate, enddate, this.selectedChartUser, this.selectedChartGroup, '').subscribe(data => {
  //     this.iChartCount = data.length;
  //     this.iChartCurrent = 1; 
  //     for (let v of data) // for acts as a foreach  
  //     {
  //       this.service_GetSQAChartFromParams(v)
  //     }
  //     this.stopLoading();
  //   }, error => {
  //     this._util.serviceError(error);
  //     this.stopLoading();
  //   });
  // }
  stopLoading() {
    if (this.iChartCurrent > this.iChartCount)
      this._loadingCharts = false
  }
  // service_GetSQAChartFromParams(params: SqaChartParamsModel) {
  //   this._loadingCharts = true;
  //   this.ProjectVisualCharts = [];
  //   this._appservice.GetSQAChartFromParams(params).subscribe(data => {
  //     this.ProjectVisualCharts.unshift(data);
  //     this.iChartCurrent += 1;
  //     this.stopLoading();
  //   }, error => {
  //     this._util.serviceError(error);
  //     this.stopLoading();
  //   });
  // }
  ddDataDumpType = ['Incident and Service Request', 'Incident', 'Service Request', 'CSAT', 'Others']

}
