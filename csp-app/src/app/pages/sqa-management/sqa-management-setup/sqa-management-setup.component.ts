import { Component, OnInit } from '@angular/core';
import { SqaChartParamsWithFilterModel, SqaProjectReportsModel, SqaChartFilterModel } from '../../../models/sqa-project-reports-model';
import { Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
//import * as Highcharts from 'highcharts/highstock';
import * as Highcharts from 'highcharts';
import * as highchartsPareto from 'highcharts/modules/pareto';
import { ParameterModel } from '../../../models/parameter-model';
highchartsPareto(Highcharts);

@Component({
  selector: 'app-sqa-management-setup',
  templateUrl: './sqa-management-setup.component.html',
  styleUrls: ['./sqa-management-setup.component.scss']
})
export class SqaManagementSetupComponent implements OnInit {
  Highcharts = Highcharts;
  @Input('projId') projId: string;
  @Input('custId') custId: string;
  _loading = false;
  selectedParams: SqaChartParamsWithFilterModel = new SqaChartParamsWithFilterModel();
  selectedReportType: SqaProjectReportsModel = new SqaProjectReportsModel();
  parameters:ParameterModel[] = [];
  xAxisChartFields:string[] = [];

  showCharts: any[] = [];
  reportTypes: SqaProjectReportsModel[] = [];
  projectCharts: SqaChartParamsWithFilterModel[] = [];
  displayedColumns = ['index', 'category', 'subcategory', 'title', 'edit'];

  constructor(public _util: myUtility, private _appservice: AppsService) { }
  ddChartDataDumpType: string[] = ['Incident & Service Request', 'Incident', 'Service Request', 'CAST'];
  ddFilter = ['', 'equals', 'contains', 'does not contain']
  ddFilterOperator: string[] = ['AND', 'OR'];
  ddChartUsers = ['SYSTEM', 'PROJECT']
  ddChartUsers_quality = ['PROJECT']
  HighChartTypes = ['Bar', 'Line', 'Pareto'];
  ddFrequencyFields = ['', 'Monthly', 'Daily']
  parameterTypes=['Incident','Service Request','Incident and Service Request'];
  ddChartFields = [''
    , 'Count'
    , 'Assigned Engineer'
    , 'Category'
    , 'Closed Date'
    , 'Company'
    , 'Contact Channel'
    , 'Country'
    , 'Created Date'
    , 'End User Department'
    , 'Engineer Name'
    , 'FCR'
    , 'Location'
    , 'Priority'
    , 'Resolved Date'
    , 'Resolved Engineer'
    , 'Request Type'
    , 'SLA Status'
    , 'SLA Performance'
    , 'Status'
    , 'Severity'
    , 'Sub Category'
    , 'Urgency'
    , 'Work Group'];
  reportGroups = ['Process performance', 'Find patterns'];
  ddChartFieldsyAxis = ['Count'];
  ngOnInit() {
    this.LoadData();
  }
  ngOnChanges() {
    this.reportTypes = [];
    this.LoadData();
  }

  LoadData() {
    this.service_GetParametersByTypes(this.parameterTypes);
    this.service_GetSQAReportTypes(this.projId);
    this.service_GetProjectCharts(this.parameters);
  }
  EditRow_onClick(row) {
    this.selectedParams = (JSON.parse(JSON.stringify(row)));
    if (this.selectedParams.filters.length == 0) {
      let newfilter: SqaChartFilterModel = new SqaChartFilterModel();
      this.selectedParams.filters.push(newfilter);
    }
    this.selectedReportType = this.reportTypes.filter(t => t.id == row.datA_DUMP_ID)[0];
  }
  SaveRow_onClick(chart: SqaChartParamsWithFilterModel) {
    if (this.selectedParams.id === chart.id) {
      if (this.validateReportGenerate()) {
        this.selectedParams.datA_DUMP_ID = this.selectedReportType.id;
        this.selectedParams.updateD_BY = localStorage.getItem("empid");
        chart = this._util.CopyObject(this.selectedParams);
        //this.UpdateChart(chart, this.selectedParams);
        this.service_UpdateProjectChart(chart);
      }
    }
    else {
      alert("Please click edit and make changes before saving.")
    }
  }
  DeleteRow_onClick(chart: SqaChartParamsWithFilterModel) {
    if (confirm("Are you sure you want to delete the chart?")) {
      this.service_DeleteProjectChart(chart);
    }
  }
  AddFilter_onClick() {
    let newfilter: SqaChartFilterModel = new SqaChartFilterModel();
    this.selectedParams.filters.push(newfilter);
  }
  RemoveFilter_onClick(filter) {
    const index: number = this.selectedParams.filters.indexOf(filter);
    if (index !== -1) {
      this.selectedParams.filters.splice(index, 1);
      this.service_DeleteFilter(filter);
    }
  }
  GenerateChart_onClick() {
    if (this.validateReportGenerate()) {
      this.selectedParams.customeR_ID = this.custId;
      this.selectedParams.projecT_ID = this.projId;
      this.selectedParams.datA_DUMP_ID = this.selectedReportType.id
      //this.chart1 = {};
      this.service_GetSQAProjectChart(this.selectedParams);
    }
  }
  AddToProject_onClick() {
    if (this.validateReportGenerate()) {
      this.selectedParams.id = 0;
      this.selectedParams.customeR_ID = this.custId;
      this.selectedParams.projecT_ID = this.projId;
      this.selectedParams.datA_DUMP_ID = this.selectedReportType.id;
      this.selectedParams.datA_DUMP_TYPE = this.selectedReportType.datA_DUMP_TYPE;
      this.selectedParams.createD_BY = localStorage.getItem("empid");
      this.selectedParams.createD_DATE = new Date();
      this.selectedParams.updateD_BY = localStorage.getItem("empid");
      this.selectedParams.updateD_DATE = new Date();
      this.service_AddSQAProjectChart(this.selectedParams);
    }
  }
  ddDatadump_Onchange() {
    this.selectedParams.datA_DUMP_ID == this.selectedReportType.id;
  }
  validateReportGenerate() {
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return false;
    }
    else if (this.selectedReportType === undefined || this.selectedReportType.datA_DUMP_NAME == "") {
      alert("Please select the Data Dump");
      return false;
    }
    else if (this.selectedParams.charT_TYPE == '') {
      alert("Please select a Chart");
      return false;
    }
    return true;
  }
  service_DeleteFilter(filter: SqaChartFilterModel) {
    this._appservice.DeleteSQAChartFilter(filter).subscribe(data => {
      //alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
  service_AddSQAProjectChart(params: SqaChartParamsWithFilterModel) {
    this._appservice.AddSQAProjectChart(params).subscribe(data => {
      this.projectCharts.push(params);
      alert("Added to Project Successfully");
    }, error => { this._util.serviceError(error); });
  }
  getProjectCharts() {
    let usercharts = this.projectCharts.filter(t => t.charT_USER === 'PROJECT');
    return usercharts;
  }
  getSystemCharts() {
    let usercharts = this.projectCharts.filter(t => t.charT_USER === 'SYSTEM');
    return usercharts;
  }
  service_GetSQAProjectChart(params: SqaChartParamsWithFilterModel) {
    this._loading = true;
    this._appservice.GetSQAProjectChart(params).subscribe(data => {
      this.showCharts = [];
      this.showCharts.push(data);
      this._loading = false;
    }, error => {
      this._util.serviceError(error);
      this._loading = false
    });
  }
  service_GetParametersByTypes(types:string[]) {
    this._appservice.GetParametersByTypes(types).subscribe(data => {
      this.parameters = data;
      this.xAxisChartFields = this.parameters.filter(t=> t.name === 'Incident').map(t=> t.options);
    }, error => { this._util.serviceError(error); });
  }
  service_GetSQAReportTypes(projid) {
    this._appservice.GetSQAReportTypes(projid).subscribe(data => {
      this.selectedReportType = new SqaProjectReportsModel();
      this.reportTypes = data;
    }, error => { this._util.serviceError(error); });
  }
  service_GetProjectCharts(projid) {
    this._appservice.GetProjectCharts(projid).subscribe(data => {
      this.projectCharts = data;
    }, error => { this._util.serviceError(error); });
  }
  service_UpdateProjectChart(params: SqaChartParamsWithFilterModel) {
    this._appservice.UpdateSQAProjectChart(params).subscribe(data => {
      //params = data;
      alert("Updated Successfully");
      this.service_GetProjectCharts(this.projId);
    }, error => { this._util.serviceError(error); });
  }
  service_DeleteProjectChart(params: SqaChartParamsWithFilterModel) {
    this._appservice.DeleteSQAProjectChart(params).subscribe(data => {
      this.service_GetProjectCharts(this.projId);
    }, error => { this._util.serviceError(error); });
  }

}
