import { Component, Inject, OnInit, OnChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { AccessControl } from '../../../Shared/accessControl';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileUploader } from 'ng2-file-upload';
import { List } from 'sp-pnp-js';


@Component({
  selector: 'app-project-file-upload',
  templateUrl: './project-file-upload.component.html',
  styleUrls: ['./project-file-upload.component.scss']
})
export class ProjectFileUploadComponent implements OnInit {
  projectId: string = "";
  customerId: string = "";
  folderData = new FolderData();
  fileData = new FileData();
  selectedFolder = new FolderData();
  editMode: boolean = false;
  readMode: boolean = true;
  enableSubFolder: boolean = false;
  renameMode: boolean = false;
  renameFile: boolean = false;
  UploadFile: boolean = false;
  parentFolder: any;
  folderId: any;
  Upload: string = "upload";
  msSaveOrOpenBlob: any;
  isLoading: boolean = false;
  private _http: any;
  public uploader: FileUploader = new FileUploader({ url: environment.webapiuri + 'upload' });
  result: any;
  folderName: string;
  fileName: any;
  fileId: any;

  constructor(public _util: myUtility, private _appService: AppsService,
    public _access: AccessControl, private dialog: MatDialogRef<ProjectFileUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data.custid != undefined && this.data.custid != null && this.data.custid != "") {
      this.customerId = this.data.custid;
    }
    if (this.data.projids != undefined && this.data.projids != null && this.data.projids != "") {
      this.projectId = this.data.projids;
    }
    else {
      this.projectId = "";
    }
    this.getProjectFolders(this.customerId, this.projectId);
  }

  AddFolderOnClick() {
    this.editMode = true;
    this.readMode = false;
    this.enableSubFolder = false;
    this.UploadFile = false;
    this.renameFile = false;
    this.renameMode = false;
    this.neweditItem();
  }

  AddSubFolderOnClick() {
    if (this.folderId == null || this.folderId == undefined || this.folderId == 0) {
      alert("Please select a folder and continue");
      return;
    }
    this.editMode = true;
    this.readMode = false;
    this.enableSubFolder = true;
    this.UploadFile = false;
    this.renameFile = false;
    this.renameMode = false;
    this.neweditItem();
  }

  openUploadOption() {
    if (this.folderId == null || this.folderId == undefined || this.folderId == 0) {
      alert("Please select a folder and continue");
      return;
    }
    this.editMode = true;
    this.readMode = false;
    this.enableSubFolder = false;
    this.UploadFile = true;
    this.renameFile = false;
    this.renameMode = false;
    this.neweditItem();
  }

  renameFolderOnClick(folderName, id) {
    if (this.folderId != null && this.folderId == undefined && this.folderId != 0) {
      alert("Please select a folder and continue");
      return;
    }
    this.folderName = folderName;
    this.folderId = id;
    this.editMode = true;
    this.readMode = false;
    this.enableSubFolder = false;
    this.UploadFile = false;
    this.renameFile = false;
    this.renameMode = true;
  }

  setFolderId(id) {
    this.folderId = id;
  }

  refreshFileData() {
    this.editMode = false;
    this.readMode = true;
    this.folderId = '';
    this.neweditItem();
    this.getProjectFolders(this.customerId, this.projectId);
  }

  neweditItem() {
    this.folderName = '';
  }

  createMainFolder(folderName) {
    this.isLoading = true;
    this.folderData.foldernamE = folderName;
    this.folderData.parentfolderiD = 0;
    this._appService.createFolder(this.folderData, this.customerId, this.projectId).subscribe(data => {
      this.isLoading = false;
      alert("Folder Created Successfully");
      this.neweditItem();
      this.refreshFileData();
    }, error => {
      this.isLoading = false;
      this._util.serviceError(error);
    },
    );
  }

  createSubFolder(folderName) {
    if (this.folderId == null || this.folderId == undefined || this.folderId == 0) {
      alert("Please select a folder and continue");
      return;
    }
    this.isLoading = true;
    this.selectedFolder.foldernamE = folderName;
    this.selectedFolder.parentfolderiD = this.folderId;
    this._appService.createFolder(this.selectedFolder, this.customerId, this.projectId).subscribe(data => {
      this.isLoading = false;
      alert("Folder Created Successfully");
      this.neweditItem();
      this.refreshFileData();
    }, error => {
      this.isLoading = false;
      this._util.serviceError(error);
    },
    );
  }

  UploadProjectFile(filename) {
    if (this.folderId == null || this.folderId == undefined || this.folderId == 0) {
      alert("Please select a folder and continue");
      return;
    }
    this.isLoading = true;
    let fileList: FileList = filename.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      this._appService.uploadProjectFile(this.folderId, this.customerId, this.projectId, formData).subscribe(data => {
        this.isLoading = false;
        alert("File Uploaded Successfully");
        this.refreshFileData();
      }, error => {
        this.isLoading = false;
        this._util.serviceError(error);
      },
      );
    }
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

  exportFile(fileName, filePath, fileType, fileExtension) {
    this.fileData.filenamE = fileName;
    this.fileData.filepatH = filePath;
    this.fileData.filetypE = fileType;
    this.fileData.fileextensioN = fileExtension;
    const confirmationMessage = `Are you sure you want to download the file ${fileName}?`;

    if (confirm(confirmationMessage)) {
      this._appService.downloadFile(this.fileData, this.customerId, this.projectId)
        .subscribe(
          (data: Blob) => {
            const blob = new Blob([data], { type: fileType });
            const a = document.createElement('a');
            document.body.appendChild(a);
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          },
          error => {
            this._util.serviceError(error);
          }
        );
    }
  }

  renameOnClick(fileName, id) {
    this.fileName = fileName;
    this.fileId = id;
    this.editMode = true;
    this.readMode = false;
    this.enableSubFolder = false;
    this.UploadFile = false;
    this.renameFile = true;
    this.renameMode = false;
  }

  renameFiles(fileName) {
    this.isLoading = true;
    this.fileData.filenamE = fileName;
    this.fileData.iD = this.fileId;
    this._appService.renameFile(this.fileData, fileName, this.customerId, this.projectId).subscribe(data => {
      this.isLoading = false;
      alert("File renamed successfully");
      this.refreshFileData();
    }, error => {
      this.isLoading = false;
      this._util.serviceError(error);
    },
    );
  }

  deleteFile(id) {
    this.fileData.iD = id;
    if (confirm('Are you sure you want to delete the file?')) {
      this._appService.deleteFile(this.fileData, this.customerId, this.projectId).subscribe(data => {
        alert("File deleted successfully");
        this.refreshFileData();
      }, error => { this._util.serviceError(error); },
      );
    }
  }

  Cancel_onClick() {
    this.dialog.close();
  }

  toggleFolderView(subFolder) {
    subFolder.showFiles = !subFolder.showFiles;
  }

  renameFolder(folderName) {
    this.isLoading = true;
    this.folderData.foldernamE = folderName;
    this.folderData.iD = this.folderId;
    this._appService.renameFolder(this.folderData, this.customerId, this.projectId, folderName).subscribe(data => {
      this.isLoading = false;
      alert("Folder renamed successfully");
      this.neweditItem();
      this.refreshFileData();
    }, error => {
      this.isLoading = false;
      this._util.serviceError(error);
    },
    );
  }

  deleteFolder(id) {
    this.folderData.iD = id;
    if (confirm('Are you sure you want to delete the folder?')) {
      this._appService.deleteFolder(this.folderData, this.customerId, this.projectId).subscribe(data => {
        alert("Folder deleted successfully");
        this.refreshFileData();
      }, error => { this._util.serviceError(error); },
      );
    }
  }

  getProjectFolders(customerId, projectId) {
    this.isLoading = true;
    this.readMode = false;
    if (customerId == undefined || customerId == null || customerId == '') {
      return false;
    }

    this._appService.getProjectFolders(customerId, projectId).subscribe(data => {
      this.parentFolder = data;
      this.readMode = true;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this._util.serviceError(error);
    },
    );
  }

}

export class FolderData {
  iD: number;
  foldernamE: string;
  parentfolderiD: number;
  folderlisT: List;
  filelisT: List;
}

export class FileData {
  iD: number;
  filenamE: string;
  folderiD: number;
  filepatH: string;
  fileextensioN: string;
  filetypE: string
}
