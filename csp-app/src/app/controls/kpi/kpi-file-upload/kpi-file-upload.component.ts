import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility'
import { environment } from '../../../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-kpi-file-upload',
  templateUrl: './kpi-file-upload.component.html',
  styleUrls: ['./kpi-file-upload.component.scss']
})

export class KpiFileUploadComponent implements OnInit {

  constructor(private dialog: MatDialogRef<KpiFileUploadComponent>, private _util: myUtility, private _http: Http) { }
  _loading: boolean;
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
    let fileType = ["application/vnd.ms-excel.sheet.macroEnabled.12", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
    if (fileName.files.length == 0) {
      alert("Please select a valid file to upload")
      return false;
    }
    else if (!fileType.includes(fileName.files[0].type)) {
      alert("Please upload only .xslm or .xlsx file.");
      return false;
    }
    else if (fileName.files[0].size > 4194304) // 4 MB in Bytes
    {
      alert("Please upload file with size less than 4 MB.");
      return false;
    }
    else
      return true;
  }

  service_AddFile(fileName) {

    let apiuri: string = environment.webapiuri + 'UploadKPIFile';
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      let headers = new Headers()

      headers.append('empId', localStorage.getItem('empid'));
      headers.append('token', this._util.AppSettings.token);
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
