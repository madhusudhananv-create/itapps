import { Component, OnInit } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { Input } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import * as highchartsPareto from 'highcharts/modules/pareto';
import { SqaChartParamsWithFilterModel, SqaChartParamsModel } from '../../../models/sqa-project-reports-model';
highchartsPareto(Highcharts);

@Component({
  selector: 'app-sqa-management-viewcharts',
  templateUrl: './sqa-management-viewcharts.component.html',
  styleUrls: ['./sqa-management-viewcharts.component.scss']
})
export class SqaManagementViewchartsComponent implements OnInit {
  Highcharts = Highcharts;
  @Input('projId') projId: string;
  @Input('custId') custId: string;
  starT_DATE: Date; //= new Date ('1-jan-2018');
  enD_DATE: Date; //= new Date('31-Dec-2018');
  _loadingCharts = false;
  ProjectVisualCharts: any[] = [];
  projectCharts: SqaChartParamsWithFilterModel[] = [];
  filteredCharts: SqaChartParamsWithFilterModel[] = [];
  displayedColumns = ['index', 'subcategory', 'title'];

  selectedChartUser = 'PROJECT';
  lstChartUsers = ['SYSTEM', 'PROJECT'];

  selectedChartGroup;
  lstChartGroups = [];

  constructor(private _util: myUtility, private _appservice: AppsService) { }


  ngOnInit() {
    this.service_GetProjectCharts(this.projId);
  }
  ngOnChanges() {
    this.service_GetProjectCharts(this.projId);
  }
  GenerateCharts_onClick() {
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return false;
    }
    else if (this.starT_DATE === undefined || this.enD_DATE == undefined) {
      alert("Please select Start date and End dates");
      return false;
    }
    else
      this.service_GetSQAProjectCharts(this.projId, this.starT_DATE, this.enD_DATE);
  }
  ChartUsers_onChange(event) {
    this.selectedChartGroup = '';
    this.lstChartGroups = this.projectCharts.filter(x => x.charT_USER === event).map(a => a.category);
    this.lstChartGroups = this.lstChartGroups.filter((x, i, a) => a.indexOf(x) == i)
    if (this.lstChartGroups.length > 0) {
      this.selectedChartGroup = this.lstChartGroups[0];
      this.ChartGroups_onChange(this.selectedChartGroup);
    }
    else
      this.filteredCharts = [];

  }
  ChartGroups_onChange(event) {
    this.filteredCharts = [];
    this.filteredCharts = this.projectCharts.filter(t => t.category === this.selectedChartGroup);
  }
  Refresh_onClick() {
    this.service_GetProjectCharts(this.projId);
  }
  // service_GetSQAProjectCharts(projId, startdate, enddate) {
  //   this._loadingCharts = true;
  //   this.ProjectVisualCharts = [];
  //   this._appservice.GetSQAGroupChartsForProject(projId, startdate, enddate, this.selectedChartUser, this.selectedChartGroup, '').subscribe(data => {
  //     for (let v of data) // for acts as a foreach  
  //     {
  //       this.ProjectVisualCharts.push(v);
  //     }
  //     this._loadingCharts = false;
  //   }, error => {
  //     this._util.serviceError(error);
  //     this._loadingCharts = false
  //   });
  // }
  iChartCount = 0;
  iChartCurrent = 0;
  service_GetSQAProjectCharts(projId, startdate, enddate) {
    this.iChartCount = 0;
    this.iChartCurrent = 0;
    this._loadingCharts = true;
    this.ProjectVisualCharts = [];
    this._appservice.GetSQAChartsParams(projId, startdate, enddate, this.selectedChartUser, this.selectedChartGroup, '').subscribe(data => {
      this.iChartCount = data.length;
      this.iChartCurrent = 1; 
      for (let v of data) // for acts as a foreach  
      {
        this.service_GetSQAChartFromParams(v)
      }
      this.stopLoading();
    }, error => {
      this._util.serviceError(error);
      this.stopLoading();
    });
  }
  stopLoading() {
    if (this.iChartCurrent > this.iChartCount)
      this._loadingCharts = false
  }
  service_GetSQAChartFromParams(params: SqaChartParamsModel) {
    this._loadingCharts = true;
    this.ProjectVisualCharts = [];
    this._appservice.GetSQAChartFromParams(params).subscribe(data => {
      this.ProjectVisualCharts.unshift(data);
      this.iChartCurrent += 1;
      this.stopLoading();
    }, error => {
      this._util.serviceError(error);
      this.stopLoading();
    });
  }
  service_GetProjectCharts(projid) {
    this._appservice.GetProjectCharts(projid).subscribe(data => {
      this.projectCharts = data;
      this.ChartUsers_onChange(this.selectedChartUser);
    }, error => { this._util.serviceError(error);  this.stopLoading(); });
  }

}
