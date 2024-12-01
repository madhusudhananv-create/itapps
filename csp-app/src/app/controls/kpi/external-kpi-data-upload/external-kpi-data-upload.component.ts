import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility'
import { environment } from '../../../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-external-kpi-data-upload',
  templateUrl: './external-kpi-data-upload.component.html',
  styleUrls: ['./external-kpi-data-upload.component.scss']
})

export class ExternalKpiDataUploadComponent implements OnInit { 
  custId:string ;
  constructor(private dialog: MatDialogRef<ExternalKpiDataUploadComponent>,  @Inject(MAT_DIALOG_DATA) public data: any,private _util: myUtility, private _http: Http) { 
  this.custId=data.custId;
  }
  _loading: boolean;
  selSource: string="freshworks";
  message: any[] = [];
  ngOnInit() {

  }
  onClose() {
    this.dialog.close();
  }

  Save_onClick(fileName) {
    if (this.validateSave(fileName)) {
      this.service_AddFile(fileName)
      this._loading = true;
    }
  }

  validateSave(fileName) {
    let isValid = false;
    let fileType = ["text/csv"];
    if(this.selSource=='zif')
    fileType =["application/json"];
    if (fileName.files.length == 0) {
      alert("Please select a valid file to upload")
      return false;
    }
    else if (!fileType.includes(fileName.files[0].type)) {
      if(this.selSource=='zif')
      alert("Please upload .json file only");
      else
      alert("Please upload .csv file only");
      return false;
    }
    else if (fileName.files[0].size > 16777216) // 16 MB in Bytes
    {
      alert("Please upload file with size less than 16 MB.");
      return false;
    }
    else
      return true;
  }

  service_AddFile(fileName) {
    let apiuri: string = environment.webapiuri + 'UploadExternalKPIData';
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('UploadKPIData', file, file.name);

      let data = {
        customerId: '202100121',
        source: 'zif',
        fileType: 'data',
      };
      let headers = new Headers()

      headers.append('empId', localStorage.getItem('empid'));
      headers.append('token', this._util.AppSettings.token);
      headers.append('customerId',  this.custId);
      headers.append('source', this.selSource);
      headers.append('fileType', 'data');
      let options = new RequestOptions({ headers: headers });
      this._http.post(apiuri, formData, options)
        .map(res => res.json())
        .catch(error => Observable.throw(error))
        .subscribe(
          data => { 
            this.message = data;
            this._loading = false;
            alert(this.message);
            this.onClose();
          },
          error => { this._util.serviceError(error); this._loading = false; }
        )
    }
  }

}
