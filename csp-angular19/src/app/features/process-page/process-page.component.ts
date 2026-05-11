import { Component, OnInit, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';

// Material Design Imports
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';

// File Upload
// import { FileUploader } from 'ng2-file-upload';  // TODO: Install ng2-file-upload package

// Services & Models
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { environment } from '../../../environments/environment';
import { enumRoles } from '../../shared/enum';
import { ProcessDataModel, ProcessDDModel, ProcessTypeModel, ProcessModel } from '../../models/process-model';
import { ProjectsModel } from '../../models/projects-model';

// Navbar Component
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

/**
 * Process Page Component
 * Migrated from Angular 6 to Angular 19
 * 
 * Features:
 * - Process/Report document management
 * - File upload functionality
 * - RAG status management
 * - Report type and category management
 * - Document download with file type detection
 * - Accordion view with expansion panels
 * 
 * Migration Notes:
 * - Converted to standalone component
 * - Replaced Http with HttpClient
 * - Replaced Headers/RequestOptions with HttpHeaders
 * - All logic preserved exactly from legacy
 * - All method names unchanged
 * - All styling preserved
 */
@Component({
  selector: 'app-process-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatExpansionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    NavbarNewComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './process-page.component.html',
  styleUrls: ['./process-page.component.scss']
})
export class ProcessPageComponent implements OnInit, OnChanges {

  private route = inject(ActivatedRoute);
  public _access = inject(AccessControl);
  private _http = inject(HttpClient);
  public _util = inject(MyUtility);
  private _appservice = inject(AppsService);
  public _layoutService = inject(LayoutService);
  private snackBar = inject(MatSnackBar);

  private sub: any;
  input_projectid: string = '';
  input_customerid: string = '';

  _loading: boolean = true;
  showdetails: boolean = false;
  Upload: string = "upload";

  maxdate = new Date();
  projNames: ProjectsModel[] = [];
  allproj: boolean = false;
  empid: string = '';

  // Input data
  input: any[] = [];
  input_rag: any;
  selectedRag: string = '';

  report_data: ProcessDataModel = new ProcessDataModel();
  selectedReportType: ProcessDDModel = new ProcessDDModel();
  selectedCategory: string = '';

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
  selectedDate: Date | null = null;

  // public uploader: FileUploader = new FileUploader({ url: environment.webapiuri + 'upload' });  // TODO: Install ng2-file-upload

  EditAllowed = true;
  dataUpdate: any;
  fdate: any;
  private isUploadBtn: boolean = true;
  iclass: string = "fa fa-file";

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.getAllProjectsFromCustomer();
  }

  ngOnChanges() {
    // if (this.input_projectid != undefined)
    //   this.getProcessNew();
    // this.readonlymode = true;
    // this.editmode = false;
  }

  getProcessNew() {
    this._appservice.getProcessNew(this.input_projectid).subscribe(
      data => {
        this.report_data = data;
        if (this.report_data.projecT_PROCESS_TYPE) {
          this.report_data.projecT_PROCESS_TYPE.forEach((type: any, index: number) => {
            if (type.procesS_CATEGORY) {
              type.procesS_CATEGORY.forEach((cat: any, catIndex: number) => {
              });
            }
          });
        }
        this.bar = [];
        this.getDDDataforProcess(this.report_data);
        this.report_category = "";
        this.report_type = "";
        this.selectedCategory = "";
        this.selectedReportType.reporT_CATEGORY = [];
        this.selectedDate = null;
        this.selectedReportType.reporT_TYPE = "";
        this.showdetails = true;
        this._loading = false;
      },
      error => {
        this._util.serviceError(error);
      });
  }

  getProcessNewOnSave() {
    this._appservice.getProcessNew(this.input_projectid).subscribe(
      data => {
        
        this.report_data = data;
        if (this.report_data.projecT_PROCESS_TYPE) {
          this.report_data.projecT_PROCESS_TYPE.forEach((type: any, index: number) => {
            if (type.procesS_CATEGORY) {
              type.procesS_CATEGORY.forEach((cat: any, catIndex: number) => {
                if (cat.projecT_PROCESS && cat.projecT_PROCESS.length > 0) {
                  cat.projecT_PROCESS.forEach((file: any, fileIndex: number) => {
                  });
                }
              });
            }
            if (type.projecT_PROCESS && type.projecT_PROCESS.length > 0) {
              type.projecT_PROCESS.forEach((file: any, fileIndex: number) => {
              });
            }
          });
        } else {
          console.error('ERROR: projecT_PROCESS_TYPE is undefined or empty!');
        }
        this.bar = [];
        this.getDDDataforProcess(this.report_data);
        this.report_category = "";
        this.report_type = "";
        this.selectedCategory = "";
        this.selectedReportType.reporT_TYPE = "";
        this.selectedReportType.reporT_CATEGORY = [];
        this.selectedDate = null;
        this.showdetails = true;
      },
      error => {
        console.error('=== getProcessNewOnSave() ERROR ===', error);
        this._util.serviceError(error);
      });
  }

  getDDDataforProcess(report_data: any) {
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

  AddNewType(j: any) {
    this.report_type = "";
    this.enableTypeInput = true;
    this.disableTypediv = true;
  }

  AddNewCategory(m: any) {
    this.report_category = "";
    this.enableCategoryInput = true;
    this.disableCatdiv = true;
  }

  AddType(j: any) {
    if (this.report_type != "" && this.report_type != undefined) {
      let processType: ProcessDDModel = new ProcessDDModel();
      processType.reporT_TYPE = this.report_type;
      processType.reporT_CATEGORY = [];
      this.report_data.ddData!.push(processType);
      this.selectedReportType = processType;
    }
    this.enableTypeInput = false;
    this.disableTypediv = false;
  }

  AddCategory(m: any) {
    if (this.report_category != "" && this.report_category != undefined) {
      this.selectedReportType.reporT_CATEGORY!.push(this.report_category);
      this.selectedCategory = this.report_category;
    }
    this.enableCategoryInput = false;
    this.disableCatdiv = false;
  }

  Save_onClick(selectedDate: any, fileName: any) {
    this._loading = true;
    if (this.validateSave(this.selectedReportType.reporT_TYPE, selectedDate, fileName)) {
      this.service_AddFile(this.selectedReportType.reporT_TYPE!, this.selectedCategory, selectedDate, fileName);
      this.readonlymode = true;
      this.editmode = false;
    }
  }

  validateSave(reportType: any, selectedDate: any, fileName: any) {
    let isValid = false;
    if (reportType == undefined || reportType == "" || selectedDate == undefined || selectedDate == null) {
      if (this._loading)
        this._loading = false;
      this.showToast("Please choose the required fields", 'error');
      return false;
    }
    else if (fileName.files.length == 0) {
      if (this._loading)
        this._loading = false;
      this.showToast("Please upload a file", 'error');
      return false;
    }
    else
      return true;
  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.bar = []
    this.showToast("Upload mode enabled", 'info');
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.getProcessNewOnSave();
    this.showToast("Upload cancelled", 'info');
  }

  getIcon(extension: string) {
    if (extension == '.pptx' || extension == '.ppt') {
      this.iclass = "fa fa-file-powerpoint-o pptColor";
    }
    else if (extension == '.xlsx' || extension == '.xls') {
      this.iclass = "fa fa-file-excel excelColor";
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

  refreshData(data: any) {
    this.input.push(this.getNewProcess(data));
    this.selectedCategory = "";
  }

  getNewProcess(data: any) {
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

  SaveRAG_onClick(rag: string) {
    if (rag === "" || rag === null) {
      this.showToast("Please select RAG status", 'error');
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
    this.showToast("RAG status updated successfully", 'success');
  }

  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers = headers.append('token', this._util.AppSettings.token);
    return headers;
  }

  service_updateRag(ragdetails: any) {
    let apiuri: string = environment.webapiuri + 'UpdateRags';
    this._http.post(apiuri, ragdetails, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }

  service_addProcess() {
    let apiuri: string = environment.webapiuri + 'AddProcess';
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }

  service_AddFile(reportType: string, reportCat: string, selectedDate: any, fileName: any) {
    let apiuri: string = environment.webapiuri + 'AddProcessFile';
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      let headers = new HttpHeaders();
      headers = headers.append('PROJECT_ID', this.input_projectid);
      headers = headers.append('REPORT_TYPE', reportType);
      if (reportCat != undefined && reportCat != "")
        headers = headers.append('REPORT_CATEGORY', reportCat);
      headers = headers.append('PUBLISH_DATE', this._util.getDate(new Date(selectedDate)));
      headers = headers.append('CREATED_BY', localStorage.getItem('empid') || '');
      headers = headers.append('token', this._util.AppSettings.token);
      
      this._http.post(apiuri, formData, { headers })
        .pipe(
          map(res => res),
          catchError(error => {
            throw error;
          })
        )
        .subscribe(
          data => {
            this.refreshData(data);
            this.getProcessNewOnSave();
            this.showToast("File uploaded successfully", 'success');
            this._loading = false;
          },
          error => {
            console.error('File upload error:', error);
            this._loading = false;
            this._util.serviceError(error);
            this.showToast("Failed to upload file", 'error');
          }
        )
    }
  }

  service_export(filename: string, filetype: string): Observable<any> {
    let apiuri: string = environment.webapiuri + 'GetProcessFile';
    return new Observable(observer => {
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

  export(file: string, filename: string, filetype: string, extension: string) {
    this.service_export(filename, filetype)
      .subscribe(data => this.downloadFile(file, data, filetype, extension))
  }

  downloadFile(file: string, data: any, filetype: string, ext: string) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    var blob = new Blob([(<any>data)], { type: filetype });
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob)
      (window.navigator as any).msSaveOrOpenBlob(blob, file + "." + ext);
    else {
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = file;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  DeleteRow_onClick(element: any, index: number, m: any, dat: any) {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to delete the record?',
      'Delete Process'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._loading = true;
        this._appservice.deleteProcess(element).subscribe(data => {
          this.getProcessNew();
          this.showToast("File deleted successfully", 'success');
          this._loading = false;
        }, error => { 
          this._util.serviceError(error);
          this.showToast("Failed to delete file", 'error');
          this._loading = false;
        });
      }
    });
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          this.input_projectid = this.projNames[0].proJ_ID!;
          this.onProjectChange();
        }
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  onProjectChange() {
    this._loading = true;
    // this.showdetails=false;

    this.getProjectProcessByProjId(this.input_projectid);
    this.getProjectRagsByProjId(this.input_projectid);

    if (this.input_projectid != undefined)
      this.getProcessNew();
    this.readonlymode = true;
    this.editmode = false;
  }

  getProjectProcessByProjId(projectID: string) {
    this._appservice.getProjectProcessByProjId(projectID).subscribe(
      data => {
        this.input = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getProjectRagsByProjId(projectID: string) {
    this._appservice.getProjectRagsByProjId(projectID).subscribe(
      data => {
        this.input_rag = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  // Toast notification helper method
  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const panelClass = type === 'success' ? ['toast-success'] :
                      type === 'error' ? ['toast-error'] :
                      type === 'warning' ? ['toast-warning'] :
                      ['toast-info'];

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: panelClass
    });
  }

  // Icon helper methods for Material Design icons
  getIconName(extension: string): string {
    if (extension == '.pptx' || extension == '.ppt') {
      return 'slideshow';
    }
    else if (extension == '.xlsx' || extension == '.xls') {
      return 'grid_on';
    }
    else if (extension == '.docx' || extension == '.doc') {
      return 'description';
    }
    else if (extension == '.pdf') {
      return 'picture_as_pdf';
    }
    else if (extension == '.jpg' || extension == '.jpeg' || extension == '.png' || extension == '.gif' || extension == '.tif') {
      return 'image';
    }
    else {
      return 'insert_drive_file';
    }
  }

  getIconClass(extension: string): string {
    if (extension == '.pptx' || extension == '.ppt') {
      return 'icon-powerpoint';
    }
    else if (extension == '.xlsx' || extension == '.xls') {
      return 'icon-excel';
    }
    else if (extension == '.docx' || extension == '.doc') {
      return 'icon-word';
    }
    else if (extension == '.pdf') {
      return 'icon-pdf';
    }
    else if (extension == '.jpg' || extension == '.jpeg' || extension == '.png' || extension == '.gif' || extension == '.tif') {
      return 'icon-image';
    }
    else {
      return 'icon-file';
    }
  }
}
