import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { DataTableStructureModel } from '../../../models/data-table-structure-model';
import { SqaProjectReportsModel, SqaChartParamsModel, SqaChartFilterModel, SqaChartParamsWithFilterModel } from '../../../models/sqa-project-reports-model';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
//import { Chart } from 'angular-highcharts';
// import { Chart } from 'highcharts';
import * as Highcharts from 'highcharts/highstock';
import * as highchartsPareto from 'highcharts/modules/pareto';
import { Input } from '@angular/core';
import { ParameterModel } from '../../../models/parameter-model';
import { MatSelectModule } from '@angular/material/select';

highchartsPareto(Highcharts);


@Component({
  selector: 'app-sqa-management-upload',
  templateUrl: './sqa-management-upload.component.html',
  styleUrls: ['./sqa-management-upload.component.scss']
})
export class SqaManagementUploadComponent implements OnInit {
  @Input('custId') custId: string;
  projId: string = "";
  _loading = false;
  filteredInsights: any[];
  startDate: Date = new Date(2018, 0, 1)
  endDate: Date = new Date(2019, 0, 1)
  Highcharts = Highcharts;
  fileStructure: DataTableStructureModel[] = [];
  editFileStructure: DataTableStructureModel[] = [];
  filters: SqaChartFilterModel[] = [new SqaChartFilterModel()];
  newReportType: string = '';
  dataDumpType: string = 'Incident and Service Request';
  displayedColumns = ['index', 'fielD_NAME', 'fielD_DISPLAY_NAME', 'charT_FIELD_NAME', 'datA_TYPE', 'requireD_FIELD', 'dB_INCLUDE'];
  constructor(private _http: Http, private _util: myUtility, private _appservice: AppsService) {
  }
  reportTypes: SqaProjectReportsModel[] = [];
  selectedReportType: SqaProjectReportsModel = new SqaProjectReportsModel();
  projectCharts: SqaChartParamsWithFilterModel[] = [];
  selectedParams: SqaChartParamsWithFilterModel = new SqaChartParamsWithFilterModel();
  parameters: ParameterModel[] = [];


  ddDataDumpType = ['Incident and Service Request', 'Incident', 'Service Request', 'CSAT', 'Others']
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

  chart1;

  ngOnInit() {
    this.LoadFieldNames();
  }
  LoadFieldNames() {
    this.service_GetParametersByType(this.dataDumpType);
  }
  ngOnChanges() {
    this.projId = "";
  }
  LoadData() {
    this.service_GetSQAReportTypes(this.projId);
    this.service_GetProjectCharts(this.projId);
  }
  UploadNewFile_onClick(fileName) {
    if (this.validateAddDump(this.newReportType, fileName, this.dataDumpType)) {
      this.service_AddFile(this.newReportType, fileName, this.dataDumpType)
    }
  }
  UploadFile_onClick(fileName) {
    if (this.selectedReportType === undefined) {
      alert("Please select a report type");
    }
    else if (this.validateSave(this.selectedReportType.datA_DUMP_NAME, fileName)) {
      this.service_UploadFile(this.selectedReportType.datA_DUMP_NAME, this.selectedReportType.id, this.dataDumpType, fileName)
    }
  }
  CreateTable_onClick() {
    this.service_AddSQAReportStructure(this.fileStructure);
    //alert("Create Table");
  }
  SaveTable_onClick() {
    if (this.ValidateFieldMapping())
      this.service_UpdateReportTypeStructure(this.editFileStructure);
  }

  ValidateFieldMapping(): boolean {
    //Created Date Validation
    let dbField = this.editFileStructure.filter(t => t.charT_FIELD_NAME === 'Created Date');
    if (dbField === undefined || dbField.length === 0) {
      alert("'Created Date' field is mandatory, please map this field");
      return false;
    }
    else if (dbField.length > 0 && dbField[0].datA_TYPE != 'datetime') {
      alert("Please select 'Date' as data type for 'Created Date' field");
      return false;
    }
    else {
      for (let s of this.editFileStructure) {
        if (s.charT_FIELD_NAME != "" && s.charT_FIELD_NAME != undefined) {
          if (this.editFileStructure.filter(t => t.charT_FIELD_NAME === s.charT_FIELD_NAME).length > 1) {
            alert("Chart field name (" + s.charT_FIELD_NAME + ") cannot be assigned twise");
            return false;
          }
        }
      }
      // this.editFileStructure.forEach(element => {
      //   if (element.charT_FIELD_NAME != "" && element.charT_FIELD_NAME != undefined) {
      //     if (this.editFileStructure.filter(t => t.charT_FIELD_NAME === element.charT_FIELD_NAME).length > 1) {
      //       alert("Chart field name (" + element.charT_FIELD_NAME + ") cannot be assigned twise");
      //       return false;
      //     }
      //   }
      // });
    }
    return true;;
  }

  LoadTable_onClick() {
    if (this.selectedReportType != null && this.selectedReportType != undefined)
      this.service_GetReportTypeStructure(this.selectedReportType.id);
  }
  Analyse_onClick() {
    //this.service_GetSQAFileStructure(this.fileFolder.FILE_NAME_SERVER);
    this.service_GetSQAFileStructure('da155e36-1bea-411d-9b5a-4d74d2b870f2.csv');
  }
  AnalyzeInsights() {
    this.service_getAnalyzedInsights(this.custId, this.projId, this.dataDumpType, this.startDate, this.endDate);
  }


  public clone(): any {
    var cloneObj = new (<any>this.constructor());
    for (var attribut in this) {
      if (typeof this[attribut] === "object") {
        cloneObj[attribut] = this.clone();
      } else {
        cloneObj[attribut] = this[attribut];
      }
    }
    return cloneObj;
  }



  // UpdateChart(oldChart: SqaChartParamsWithFilterModel, newChart: SqaChartParamsWithFilterModel) {
  //   oldChart = this._util.CopyObject(newChart);
  //   // oldChart.charT_TYPE = newChart.charT_TYPE;
  //   // oldChart.starT_DATE = newChart.starT_DATE;
  //   // oldChart.enD_DATE = newChart.enD_DATE;
  //   // oldChart.xaxiS_TYPE = newChart.xaxiS_TYPE;
  //   // oldChart.yaxiS_TYPE = newChart.yaxiS_TYPE;
  //   // oldChart.title = newChart.title;
  //   // oldChart.yaxiS_LABLE = newChart.yaxiS_LABLE;
  // }
  updateFromInput: Boolean = false;

  updateInputChart = function () {
    this.optFromInput = JSON.parse(this.optFromInputString);
  };






  validateAddDump(reportType, fileName, dataDumpType) {
    let isValid = false;
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return false;
    }
    else if (reportType === "" || reportType === undefined) {
      alert("Please enter a new report type");
      return false;
    }
    else if (dataDumpType === "" || dataDumpType === undefined) {
      alert("Please select the Data dump type");
      return false;
    }
    else if (fileName.files.length == 0) {
      alert("Please select a file to upload")
      return false;
    }
    else
      return true;
  }
  validateSave(reportType, fileName) {
    let isValid = false;
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return false;
    }
    else if (reportType === "" || reportType === undefined) {
      alert("Please enter a new report type");
      return false;
    }
    else if (fileName.files.length == 0) {
      alert("Please select a file to upload")
      return false;
    }
    else
      return true;
  }
  IsToggleView = true;
  NewDataDump = "";
  AddNewDataDump() {
    this.IsToggleView = false;
  }
  SaveNewDataDump() {
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return false;
    }
    else {
      let newReport = new SqaProjectReportsModel();
      newReport.datA_DUMP_NAME = this.NewDataDump.toString();
      this.reportTypes.unshift(newReport);
      this.selectedReportType = newReport;
      this.NewDataDump = '';
    }
    this.IsToggleView = true;
  }
  CancelSavingNewDataDump() {
    this.IsToggleView = true;
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
  service_getAnalyzedInsights(custId, projId, type, startdate, enddate) {
    this._appservice.GetAnalyzedInsights(custId, projId, type, startdate, enddate).subscribe(
      data => {
        this.filteredInsights = data;
      },
      error => { this._util.serviceError(error); }
    );
  }
  service_AddFile(reportType, fileName, dataDumpType) {
    let apiuri: string = environment.webapiuri + 'AddSQATempFile';
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      let headers = new Headers()
      headers.append('CUSTOMER_ID', this.custId);
      headers.append('PROJECT_ID', this.projId);
      headers.append('DATA_DUMP_NAME', reportType);
      headers.append('DATA_DUMP_TYPE', dataDumpType);
      //headers.append('PUBLISH_DATE', this._util.getDate(selectedDate));
      headers.append('CREATED_BY', localStorage.getItem('empid'));
      headers.append('token', this._util.AppSettings.token);
      let options = new RequestOptions({ headers: headers });
      this._http.post(apiuri, formData, options)
        .map(res => res.json())
        .catch(error => Observable.throw(error))
        .subscribe(
        data => {
          this.fileStructure = data;
          alert("Uploaded Successfully");
        },
        error => { this._util.serviceError(error); }
        )
    }
  }

  service_UploadFile(reportType, reportId, dataDumpType, fileName) {
    this._loading = true;
    let apiuri: string = environment.webapiuri + 'UploadSQAReportFile';
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      let headers = new Headers()
      headers.append('CUSTOMER_ID', this.custId);
      headers.append('PROJECT_ID', this.projId);
      headers.append('DATA_DUMP_NAME', reportType);
      headers.append('REPORT_ID', reportId);
      headers.append('DATA_DUMP_TYPE', dataDumpType);
      headers.append('CREATED_BY', localStorage.getItem('empid'));
      headers.append('token', this._util.AppSettings.token);
      let options = new RequestOptions({ headers: headers });
      this._http.post(apiuri, formData, options)
        .map(res => res.json())
        .catch(error => Observable.throw(error))
        .subscribe(
        data => {
          this.fileStructure = data;
          this._loading = false;
          this.LoadData();
         
          alert("Uploaded Successfully");
        },
        error => {
          this._util.serviceError(error);
          this._loading = false;
          this.LoadData();
        }
        )
    }
  }

  service_GetReportTypeStructure(reportTypeId) {
    this._appservice.GetReportTypeStructure(reportTypeId).subscribe(data => {
      this.editFileStructure = data;
    }, error => { this._util.serviceError(error); });
  }

  service_UpdateReportTypeStructure(structures: DataTableStructureModel[]) {
    this._appservice.UpdateReportTypeStructure(structures).subscribe(data => {
      this.editFileStructure = data;
    }, error => { this._util.serviceError(error); });
  }


  service_GetSQAFileStructure(FileName) {
    this._appservice.GetSQAFileStructure(FileName).subscribe(data => {
      this.fileStructure = data;
    }, error => { this._util.serviceError(error); });
  }

  service_AddSQAReportStructure(fieldStruct: DataTableStructureModel[]) {
    this._appservice.AddSQAReportStructure(fieldStruct).subscribe(data => {
      this.fileStructure = data;
    }, error => { this._util.serviceError(error); });
  }
  service_GetParametersByType(type: string) {
    this._appservice.GetParametersByType(type).subscribe(data => {
      this.parameters = data;
      this.ddChartFields = this.parameters.map(t => t.options);
      this.ddChartFields.unshift('Count');
      this.ddChartFields.unshift('');
    }, error => { this._util.serviceError(error); });
  }
  ddDataType = [
    { displayName: 'String', dataType: 'varchar' },
    { displayName: 'Number', dataType: 'int' },
    { displayName: 'Date', dataType: 'datetime' },
    { displayName: 'Boolean', dataType: 'bit' },
  ];
  ddChartGroups: string[] = [];
  ddChartDataDumpType: string[] = ['Incident & Service Request', 'Incident', 'Service Request', 'CAST'];
  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    this.LoadData();
  }

  //------ C H A R T
  ClearChart() {
    this.chart1 = {};
  }
  LoadChart() {
    this.chart1 = {
      "chart": { "type": "column", "renderTo": "container" }, "title": { "text": "Pareto Chart" }, "tooltip": { "shared": true }, "xAxis": { "categories": ["Server", "SAP", "Server", "SAP", "G-Apps", "Password Reset", "Other", "Password Reset", "Other", "User Administration", "User Administration", "Hardware", "Hardware", "Alerts", "G-Apps", "Telecom", "Vendor Dependent", "Telecom", "Vendor Dependent", "Alerts"], "crosshair": true }, "yAxis": [{ "title": { "text": "" } }, { "title": { "text": "" }, "minPadding": 0, "maxPadding": 0, "max": 100, "min": 0, "opposite": true, "labels": { "format": "{value}%" } }], "series": [{ "type": "pareto", "name": "pareto", "yAxis": 1, "zIndex": 10, "baseSeries": 1 }, { "type": "column", "name": "Category", "zIndex": 2, "data": [253.0, 172.0, 138.0, 137.0, 110.0, 97.0, 88.0, 77.0, 63.0, 45.0, 44.0, 41.0, 38.0, 38.0, 34.0, 32.0, 30.0, 27.0, 22.0, 12.0] }]
    }
  }
  LoadChart1() {
    // this.chart1 = {
    //   //----------------
    //   "chart":{"type":"column","renderTo":"container"},
    //   "title":{"text":"Pareto Chart"},
    //   "tooltip":{"shared":true},
    //   "xAxis":{"categories":["Server","SAP","Server","SAP","G-Apps","Password Reset","Other","Password Reset","Other","User Administration","User Administration","Hardware","Hardware","Alerts","G-Apps","Telecom","Vendor Dependent","Telecom","Vendor Dependent","Alerts"],"crosshair":true},
    //   "yAxis":[{"title":{"text":""}},{"title":{"text":""},"minPadding":0,"maxPadding":0,"max":100,"min":0,"opposite":true,"labels":{"format":"{value}%"}}],"series":[{"type":"pareto","name":"pareto","yAxis":1,"zIndex":10,"baseSeries":1},{"type":"column","name":"Category","zIndex":2,"data":[253.0,172.0,138.0,137.0,110.0,97.0,88.0,77.0,63.0,45.0,44.0,41.0,38.0,38.0,34.0,32.0,30.0,27.0,22.0,12.0]}]
    //   //----------------
    // }
  }
  //------
}
