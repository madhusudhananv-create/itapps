import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FileUploader } from 'ng2-file-upload';
import { Observable } from 'rxjs/Rx';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';
import { ProcessDataModel, ProcessDDModel, ProcessTypeModel } from '../../../models/process-model';
import { empty } from 'rxjs';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss'],
})
export class ProcessComponent implements OnInit {
  @Input() input: any[];
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;

  report_data: ProcessDataModel = new ProcessDataModel();
  selectedReportType: ProcessDDModel = new ProcessDDModel();
  selectedCategory: string;
    
  wsr: string = 'WSR';
  str: string[] = [];
  jar: string[] = [];
  bar: string[] = [];
  
  enableTypeInput: boolean = false;
  enableCategoryInput: boolean = false;
  disableTypediv: boolean = false;
  disableCatdiv: boolean = false;
  readonlymode: boolean = true;
  report_type: any;
  report_category: any;
  editmode: boolean = false;
  selectedDate:Date;

  public uploader: FileUploader = new FileUploader({ url: environment.webapiuri + 'upload' });
  constructor(private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService) {
  }

  ngOnInit() {
    // if(this.input_projectid != undefined)
    // this.getProcessNew();
    // this.readonlymode = true;
    // this.editmode = false;
  }
  ngOnChanges() {
    if (this.input_projectid != undefined)
      this.getProcessNew();
    this.readonlymode = true;
    this.editmode = false;
  }
  getProcessNew() {
    this._appservice.getProcessNew(this.input_projectid).subscribe(
      data => {
        this.report_data = data;
        this.bar = [];
        this.getDDDataforProcess(this.report_data);
        this.report_category = "";
        this.report_type = "";
        this.selectedCategory = "";
        this.selectedReportType.reporT_CATEGORY = [];
        this.selectedDate = null;

      },
      error => {
        this._util.serviceError(error);
      });
  }
  getDDDataforProcess(report_data) {
    let m;
    if (report_data.length == 0) {
      this.jar = ['WSR', 'Audit Report'];
    }
    else {
      this.jar = [];
      for (m = 0; m < report_data.length; m++) {
        this.jar.push(report_data[m].ddData.reporT_TYPE);
      }
    }
  }
  AddNewType(j) {
    this.report_type = "";
    this.enableTypeInput = true;
    this.disableTypediv = true;
  }
  AddNewCategory(m) {
    this.report_category = "";
    this.enableCategoryInput = true;
    this.disableCatdiv = true;
  }
  AddType(j) {
    if (this.report_type != "" && this.report_type != undefined) {
      let processType: ProcessDDModel = new ProcessDDModel();
      processType.reporT_TYPE = this.report_type;
      processType.reporT_CATEGORY = [];
      this.report_data.ddData.push(processType);
      this.selectedReportType = processType;
    }
    //j.push(this.report_type);
    this.enableTypeInput = false;
    this.disableTypediv = false;
  }
  AddCategory(m) {
    if (this.report_category != "" && this.report_category != undefined){
      this.selectedReportType.reporT_CATEGORY.push(this.report_category);
      this.selectedCategory = this.report_category;
    }
      //m.push(this.report_category);
    this.enableCategoryInput = false;
    this.disableCatdiv = false;
  }
  EditAllowed = true;
  dataUpdate: any;
  Save_onClick(selectedDate, fileName) {
    if (this.validateSave(this.selectedReportType.reporT_TYPE, selectedDate, fileName)) {
      this.service_AddFile(this.selectedReportType.reporT_TYPE, this.selectedCategory, selectedDate, fileName)
      this.readonlymode = true;
      this.editmode = false;
    }
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
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.bar = []
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
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
    this.input.push(this.getNewProcess(data));
    this.selectedCategory = "";
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
      projecT_ID: data.PROJECT_ID,
      publisH_DATE: data.PUBLISH_DATE,
      rag: data.RAG,
      reporT_TYPE: data.REPORT_TYPE,
      updateD_BY: data.UPDATED_BY,
      updateD_DATE: data.UPDATED_DATE,
    }
    return result;
  }

  SaveRAG_onClick(rag) {
    if (rag === "" || rag === null) {
      alert("Please select RAG");
      return;
    }
    this._util.updateRAG(this.input_rag, 'process', rag);
    let ragdetails = {
      PROJECT_ID: this.input_projectid,
      CATEGORY: 'process',
      RAG: rag,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: this._util.getDate(new Date())
    };
    this.service_updateRag(ragdetails);
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
  service_updateRag(ragdetails) {
    let apiuri: string = environment.webapiuri + 'UpdateRags';
    this._http.post(apiuri, ragdetails, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  fdate: any;
  service_addProcess() {
    let apiuri: string = environment.webapiuri + 'AddProcess';
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  private isUploadBtn: boolean = true;
  service_AddFile(reportType, reportCat, selectedDate, fileName) {
    let apiuri: string = environment.webapiuri + 'AddProcessFile';
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      let headers = new Headers()
      headers.append('PROJECT_ID', this.input_projectid);
      headers.append('REPORT_TYPE', reportType);
      if (reportCat != undefined && reportCat != "")
        headers.append('REPORT_CATEGORY', reportCat);
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
          this.getProcessNew();
//console.log('success');
        },
        error => { this._util.serviceError(error); }
        )
    }
  }

  //********************************************
  service_export(filename, filetype): Observable<Object[]> {
    let apiuri: string = environment.webapiuri + 'GetProcessFile';
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
      .subscribe(data => this.downloadFile(file, data, filetype, extension))//console.log(data),
//error => console.log("Error downloading the file."),
//() => console.log('Completed file download.');

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
  DeleteRow_onClick(element, index, m, dat) {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteProcess(element).subscribe(data => { this.getProcessNew(); alert("Data Deleted Sucessfully") }, error => { this._util.serviceError(error); });
    }
    else {

    }

  }
}
