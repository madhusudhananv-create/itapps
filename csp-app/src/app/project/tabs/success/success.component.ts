import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FileUploader } from 'ng2-file-upload';
import { Observable } from 'rxjs/Rx';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  @Input() input: any[];
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  selectedDate: Date;
  reportType: string;
  wsr: string = 'WSR';
  public uploader: FileUploader = new FileUploader({ url: environment.webapiuri + 'upload' });

  constructor(private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService) {
  }

  ngOnInit() {
  }

  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataUpdate: any;
  SubmitForm(successForm, fileUpload) {
    if (this.validateSave(this.reportType, this.selectedDate, fileUpload)) {
      this.service_AddFile(this.reportType, this.selectedDate, fileUpload)
      this.readonlymode = true;
      this.editmode = false;
      successForm.reset();
    }
  }
  validateSave(reportType, selectedDate, fileUpload) {
    let isValid = false;
    if (reportType == undefined || selectedDate == undefined || selectedDate == null || fileUpload.files.length == 0) {
      alert("Please enter required fields")
      return false;
    }
    else
      return true;
  }
  Edit_onClick() {
    this.selectedDate = new Date();
    this.readonlymode = false;
    this.editmode = true;
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
    this.input.push(this.getNewSuccess(data));
  }
  getNewSuccess(data) {
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
    this._util.updateRAG(this.input_rag, 'success', rag);
    let ragdetails = {
      PROJECT_ID: this.input_projectid,
      CATEGORY: 'success',
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
  service_addSuccess() {
    let apiuri: string = environment.webapiuri + 'AddSuccess';
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  private isUploadBtn: boolean = true;
  service_AddFile(reportType, selectedDate, fileName) { 
    let apiuri: string = environment.webapiuri + 'AddSuccessFile';
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      let headers = new Headers()
      headers.append('PROJECT_ID', this.input_projectid);
      headers.append('REPORT_TYPE', reportType);
      headers.append('PUBLISH_DATE', this._util.getDate(selectedDate));
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
    let apiuri: string = environment.webapiuri + 'GetSuccessFile';
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
  export(file, filename, filetype ,extension) {
    this.service_export(filename, filetype)
      .subscribe(data => this.downloadFile(file, data, filetype,extension))//console.log(data),
//error => console.log("Error downloading the file."),
//() => console.log('Completed file download.');
  }

  downloadFile(file, data, filetype,ext) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    var blob = new Blob([(<any>data)], { type: filetype });
    if (window.navigator && window.navigator.msSaveOrOpenBlob)
    window.navigator.msSaveOrOpenBlob(blob, file+"."+ ext);
  else
  {
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
      this._appservice.deleteSucess(element).subscribe(data => { this.input.splice(index, 1) }, error => { this._util.serviceError(error); });
    } else {

    }
  }
}
