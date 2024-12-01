import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Pipe, PipeTransform } from '@angular/core';
import { myUtility } from '../Shared/myUtility';
import { AppsService } from '../Services/apps.service';
import { RagsModel } from '../models/rags-model';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CustomerProjectsModel } from '../models/customer-projects-model';
import { ClientDetailsModel } from '../models/client-details-model';
import { ProcessModel } from '../models/process-model';
import { RiskModel } from '../models/risk-model';
import { IssueModel } from '../models/issue-model';
import { ValueaddModel } from '../models/valueadd-model';
import { ActionitemModel } from '../models/actionitem-model';
import { PeopleModel } from '../models/people-model';
import { ResourceModel } from '../models/resource-model';
import { DeliveryModel } from '../models/delivery-model';
import { ScopeModel } from '../models/scope-Model';
import { FeedbackModel } from '../models/feedback-model';
import { Observable } from 'rxjs/Rx';
import { ReportDetailsModel } from '../models/report-details-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AccessControl } from '../Shared/accessControl';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})

export class ProjectComponent implements OnInit {

  @Input('SelectedData') SelectedData: any;
  @Input('LastUpdatedDate') LastUpdatedDate: Date;
  tabHeader = { title: 'Scope', rag: 'red' };
  tabtitle: string = 'Scope &nbsp;&nbsp;<i class="fa fa-square" [style.color]="SelectedData.project.details.scope.rag">';
  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  datereadonlymode: boolean = true;
  dateeditmode: boolean = false;
  reportreadonlymode: boolean = true;
  reporteditmode: boolean = false;
  today: Date;
  private sub: any;
  projectid: string;
  //clientDetails: ClientDetailsModel[];
  feedback: FeedbackModel;

  constructor(private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, private route: ActivatedRoute) {
    this.today = new Date();
    //private datepipe: DatePipe
  }
  ngOnInit() {
    alert("All the project related features have been migrated to new CSM Platform. Please navigate to new dashboard and use the features there.");
    this.feedback = new FeedbackModel;
    // this.sub = this.route.params.subscribe(params => {
    //   this.projectid = params['projectid'];
    // });
    // this._appservice.getGetCSPDetails_Employee(localStorage.getItem('empid'))
    //   .subscribe(
    //   (data) => {
    //     for (let c of data) {
    //       for (let p of c.projects) {
    //         if (p.proJ_ID == this.projectid) {
    //           this.SelectedData = { type: 'project', project: p, client: c };
    //         }
    //       }
    //     }
    //     //this.clientDetails = data;
    //   }, error => { this._util.serviceError(error); });



   // console.log(this.SelectedData);
  }
  //**********************************************
  // Events
  //**********************************************
  // IsPremier() {
  //   try {
  //     if (this.SelectedData.client.client_ID == '202100062')
  //       return true;
  //     else
  //       return false;
  //   }
  //   catch{ }
  //   return false;
  // }

  ShowElement(category) {
    var result = false;
    if (this.SelectedData === undefined || this.SelectedData.type === category)
      result = true;
    else
      result = false;
    return result;
  }
  Save_onClick(clientId: number, rag: string, clientDesc: string, gavsDesc: string) {
    this.SelectedData.client.client_RAG = rag;
    this.SelectedData.client.client_Description = clientDesc;
    this.SelectedData.client.gavs_Description = gavsDesc;

    this.service_updateOverview(clientId, rag, clientDesc, gavsDesc, this.SelectedData.client.client_Goals);
    alert('Successfully updated');
    this.readonlymode = true;
    this.editmode = false;
  }
  SaveDate_onClick(publishedOn) {
    this._appservice.updatePublishedOn(this.getPublishedOn(publishedOn)).subscribe(data => { }, error => { this._util.serviceError(error); });
    this.CancelDate_onClick();
  }
  GoalsSave_onClick(clientId: number, clientGoals: string) {
    this.SelectedData.client.client_Goals = clientGoals;

    this.service_updateOverview(clientId, this.SelectedData.client.client_RAG, this.SelectedData.client.client_Description, this.SelectedData.client.gavs_Description, clientGoals);
    alert('Successfully updated');
    this.readonlymode = true;
    this.editmode = false;
  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
  }
  Edit_onClickreport() {
    this.reportreadonlymode = false;
    this.reporteditmode = true;
  }
  Cancel_onClickReport() {
    this.reportreadonlymode = true;
    this.reporteditmode = false;
  }
  EditDate_onClick() {
    this.datereadonlymode = false;
    this.dateeditmode = true;
  }
  CancelDate_onClick() {
    this.datereadonlymode = true;
    this.dateeditmode = false;
  }
  Save_onClickReport(reportType, selectedDate, fileName) {
    if (this.validateSave(reportType, selectedDate, fileName)) {
      this.service_AddFile(reportType, selectedDate, fileName)
      this.reportreadonlymode = true;
      this.reporteditmode = false;
    }
  }
  //**********************************************
  // General Methods
  //**********************************************
  getPublishedOn(publishedOn: Date): RagsModel {
    let rag: RagsModel = new RagsModel();
    rag.id = -1;
    rag.projecT_ID = this.SelectedData.project.proJ_ID;
    rag.category = 'project';
    rag.rag = this.SelectedData.rag;
    rag.publisheD_ON = publishedOn;
    rag.createD_BY = localStorage.getItem('empid');
    rag.createD_DATE = new Date();
    rag.updateD_BY = localStorage.getItem('empid');
    rag.updateD_DATE = new Date();
    rag.isactive = true;
    return rag;
  }
  getRAG(category) {
    let result = '';
    let myrag = this.SelectedData.project.details.rags.filter(t => t.category === category);
    if (myrag != null && myrag.length > 0)
      result = myrag[0].rag;
    return result;
  }
  validateSave(reportType, selectedDate, fileName) {
    let isValid = false;
    if (reportType == undefined || selectedDate == undefined || selectedDate == null || fileName.files.length == 0) {
      alert("Please enter required fields")
      return false;
    }
    else
      return true;
  }
  iclass: string = "fa fa-file";
  getIcon(extension) {
    if (extension == '.pptx' || extension == '.ppt') {
      this.iclass = "fa fa-file-powerpoint-o pptColor";
    }
    else if (extension == '.xlsx' || extension == '.xls') {
      this.iclass = "fa fa-file-excel-o excelColor";
    }
    else if (extension == '.docx' || extension == '.doc') {
      this.iclass = "fa fa-file-word-o wordColor";
    }
    else if (extension == '.pdf') {
      this.iclass = "fa fa-file-pdf-o pdfColor";
    }
    else if (extension == '.jpg' || extension == '.jpeg' || extension == '.png' || extension == '.gif' || extension == '.tif') {
      this.iclass = "fa fa-file-image-o imageColor";
    }
    else
      this.iclass = "fa fa-file";
    return this.iclass;
  }
  refreshData(data) {
    this.SelectedData.client.reports.push(this.getNewProcess(data));
  }
  getNewProcess(data) {
    let result = {
      createD_BY: data.CREATED_BY,
      createD_DATE: data.CREATED_DATE,
      filE_CONTENT: data.FILE_CONTENT,
      filE_EXTENSION: data.FILE_EXTENSION,
      filE_NAME: data.FILE_NAME,
      filE_NAME_SERVER: data.FILE_NAME_SERVER,
      filE_TYPE: data.FILE_TYPE,
      id: data.ID,
      isactive: data.ISACTIVE,
      customerR_ID: data.CUSTOMER_ID,
      publisH_DATE: data.PUBLISH_DATE,
      rag: data.RAG,
      reporT_TYPE: data.REPORT_TYPE,
      updateD_BY: data.UPDATED_BY,
      updateD_DATE: data.UPDATED_DATE,
    }
    return result;
  }

  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empid', localStorage.getItem('empid'));
    return headers;
  }
  dataUpdate: any;
  service_updateOverview(clientId, rag, clientDescription, gavsDescription, clientGoals) {
    let apiuri: string = environment.webapiuri + 'UpdateClient';
    this.dataUpdate = {
      CUSTOMER_ID: clientId,
      RAG: rag,
      CUSTOMER_DESCRIPTION: clientDescription,
      CUSTOMER_GOALS: clientGoals,
      GAVS_DESCRIPTION: gavsDescription,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  private isUploadBtn: boolean = true;
  service_AddFile(reportType, selectedDate, fileName) {
    let apiuri: string = environment.webapiuri + 'AddEngagementReportFile';
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      let headers = new Headers()
      headers.append('CUSTOMER_ID', this.SelectedData.client.client_ID);
      headers.append('REPORT_TYPE', reportType);
      headers.append('PUBLISH_DATE', this._util.getDate(new Date(selectedDate)));
      headers.append('CREATED_BY', localStorage.getItem('empid'));
      headers.append('token', this._util.AppSettings.token);
      let options = new RequestOptions({ headers: headers });
      this._http.post(apiuri, formData, options)
        .map(res => res.json())
        .catch(error => Observable.throw(error))
        .subscribe(
        data => {
          this.refreshData(data);
//console.log('success');
        },
        error => { this._util.serviceError(error); }
        )
    }
  }

  //********************************************
  service_export(filename, filetype): Observable<Object[]> {
    let apiuri: string = environment.webapiuri + 'GetEngagementReportFile';
    return Observable.create(observer => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', apiuri, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('FILE_NAME_SERVER', filename);
      xhr.setRequestHeader('token', this._util.AppSettings.token);
      xhr.responseType = 'blob';

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var contentType = filetype;
            var blob = new Blob([xhr.response], { type: contentType });
            observer.next(blob);
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      }
      xhr.send();

    });
  }
  //********************************************
  export(file, filename, filetype, extension) {
    this.service_export(filename, filetype)
      .subscribe(
      data => this.downloadFile(file, data, filetype, extension)
      )//console.log(data),
     //error =>console.log("Error downloading the file."),
     // () => console.log('Completed file download.');
  }
  downloadFile(file, data, filetype, ext) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    var blob = new Blob([(<any>data)], { type: filetype });
    if (window.navigator && window.navigator.msSaveOrOpenBlob)
      window.navigator.msSaveOrOpenBlob(blob, file + "." + ext);
    else {
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = file;
      a.click();
      window.URL.revokeObjectURL(url);
    }
//console.log();
  }
  DeleteRow_onClick(element, index) {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteReport(element).subscribe(data => { this.SelectedData.client.reports.splice(index, 1) }, error => { this._util.serviceError(error); });
      //this.SelectedData.client.reports[0].reports.splice(element.id, 1);
    } else {

    }
  }
}
