import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { ProjectSelectorComponent } from '../../shared/components/project-selector/project-selector.component';
import { ComplianceInsightsComponent } from '../compliance-insights/compliance-insights.component';
import { SqaManagementSetupComponent } from '../sqa-management-setup/sqa-management-setup.component';
import { SqaManagementViewchartsComponent } from '../sqa-management-viewcharts/sqa-management-viewcharts.component';
import { SqaProjectReportsModel } from '../../models/sqa-project-reports-model';
import { CustomerProjectIds } from '../../models/customer-projects.model';

/**
 * SQA Management Upload Component  
 * Parent component for SQA (Software Quality Assurance) data management
 * 
 * Features:
 * - Tab 1: Upload Data - Upload Excel files with SQA data
 * - Tab 2: Map Data - Map Excel columns to database fields
 * - Tab 3: Setup Charts - Configure charts for analysis
 * - Tab 4: View Charts - Display configured charts
 * - Tab 5: Analysis - Compliance insights (ComplianceInsightsComponent)
 * 
 * Migrated from Angular 6 to Angular 19
 * All business logic, names, and styles preserved exactly from legacy
 */
@Component({
  selector: 'app-sqa-management-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    NavbarNewComponent,
    ProjectSelectorComponent,
    SqaManagementSetupComponent,
    SqaManagementViewchartsComponent,
    ComplianceInsightsComponent
  ],
  templateUrl: './sqa-management-upload.component.html',
  styleUrls: ['./sqa-management-upload.component.scss']
})
export class SqaManagementUploadComponent implements OnInit {
  @Input('custId') custId: string = '';
  projId: string = "";
  allcust: boolean = true;  // Allow all customers in project selector
  allproj: boolean = true;  // Allow all projects in project selector
  _loading = false;
  filteredInsights: any;
  startDate: Date = new Date(2018, 0, 1);
  endDate: Date = new Date(2019, 0, 1);
  fileStructure: any[] = [];
  editFileStructure: any[] = [];
  filters: any[] = [];
  newReportType: string = '';
  dataDumpType: string = 'Incident and Service Request';
  displayedColumns = ['index', 'fielD_NAME', 'fielD_DISPLAY_NAME', 'charT_FIELD_NAME', 'datA_TYPE', 'requireD_FIELD', 'dB_INCLUDE'];
  
  reportTypes: SqaProjectReportsModel[] = [];
  selectedReportType: SqaProjectReportsModel = new SqaProjectReportsModel();
  projectCharts: any[] = [];
  selectedParams: any = {};
  parameters: any[] = [];

  ddDataDumpType = ['Incident and Service Request', 'Incident', 'Service Request', 'CSAT', 'Others'];
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

  ddDataType = [
    { displayName: 'String', dataType: 'varchar' },
    { displayName: 'Number', dataType: 'int' },
    { displayName: 'Date', dataType: 'datetime' },
    { displayName: 'Boolean', dataType: 'bit' },
  ];

  IsToggleView = true;
  NewDataDump = "";

  constructor(
    private http: HttpClient,
    private _util: MyUtility,
    private _appservice: AppsService
  ) { }

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

  UploadNewFile_onClick(fileName: any) {
    if (this.validateAddDump(this.newReportType, fileName, this.dataDumpType)) {
      this.service_AddFile(this.newReportType, fileName, this.dataDumpType);
    }
  }

  UploadFile_onClick(fileName: any) {
    if (this.selectedReportType === undefined) {
      alert("Please select a report type");
    }
    else if (this.validateSave(this.selectedReportType.datA_DUMP_NAME, fileName)) {
      this.service_UploadFile(this.selectedReportType.datA_DUMP_NAME, this.selectedReportType.id, this.dataDumpType, fileName);
    }
  }

  SaveTable_onClick() {
    if (this.ValidateFieldMapping()) {
      this.service_UpdateReportTypeStructure(this.editFileStructure);
    }
  }

  ValidateFieldMapping(): boolean {
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
            alert("Chart field name (" + s.charT_FIELD_NAME + ") cannot be assigned twice");
            return false;
          }
        }
      }
    }
    return true;
  }

  LoadTable_onClick() {
    if (this.selectedReportType != null && this.selectedReportType != undefined) {
      this.service_GetReportTypeStructure(this.selectedReportType.id);
    }
  }

  validateAddDump(reportType: string, fileName: any, dataDumpType: string) {
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
      alert("Please select a file to upload");
      return false;
    }
    else
      return true;
  }

  validateSave(reportType: string, fileName: any) {
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return false;
    }
    else if (reportType === "" || reportType === undefined) {
      alert("Please enter a new report type");
      return false;
    }
    else if (fileName.files.length == 0) {
      alert("Please select a file to upload");
      return false;
    }
    else
      return true;
  }

  AddNewDataDump() {
    this.IsToggleView = false;
  }

  SaveNewDataDump() {
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return;
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

  service_GetSQAReportTypes(projid: string) {
    this._appservice.GetSQAReportTypes(projid).subscribe(
      (data: any) => {
        this.selectedReportType = new SqaProjectReportsModel();
        this.reportTypes = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_GetProjectCharts(projid: string) {
    this._appservice.GetProjectCharts(projid).subscribe(
      (data: any) => {
        this.projectCharts = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_AddFile(reportType: string, fileName: any, dataDumpType: string) {
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      
      this._appservice.AddSQATempFile(
        formData,
        this.custId,
        this.projId,
        reportType,
        dataDumpType,
        localStorage.getItem('empid') || ''
      ).subscribe(
        (data: any) => {
          this.fileStructure = data;
          alert("Uploaded Successfully");
        },
        (error: any) => { this._util.serviceError(error); }
      );
    }
  }

  service_UploadFile(reportType: string, reportId: number, dataDumpType: string, fileName: any) {
    this._loading = true;
    let fileList: FileList = fileName.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);
      
      this._appservice.UploadSQAReportFile(
        formData,
        this.custId,
        this.projId,
        reportType,
        reportId.toString(),
        dataDumpType,
        localStorage.getItem('empid') || ''
      ).subscribe(
        (data: any) => {
          this.fileStructure = data;
          this._loading = false;
          this.LoadData();
          alert("Uploaded Successfully");
        },
        (error: any) => {
          this._util.serviceError(error);
          this._loading = false;
          this.LoadData();
        }
      );
    }
  }

  service_GetReportTypeStructure(reportTypeId: number) {
    this._appservice.GetReportTypeStructure(reportTypeId).subscribe(
      (data: any) => {
        this.editFileStructure = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_UpdateReportTypeStructure(structures: any[]) {
    this._appservice.UpdateReportTypeStructure(structures).subscribe(
      (data: any) => {
        this.editFileStructure = data;
        alert("Table structure updated successfully");
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_GetParametersByType(type: string) {
    this._appservice.GetParametersByType(type).subscribe(
      (data: any) => {
        this.parameters = data;
        this.ddChartFields = this.parameters.map((t: any) => t.options);
        this.ddChartFields.unshift('Count');
        this.ddChartFields.unshift('');
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_GetSQAFileStructure(fileName: string) {
    this._appservice.GetSQAFileStructure(fileName).subscribe(
      (data: any) => {
        this.fileStructure = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_AddSQAReportStructure(fieldStruct: any[]) {
    this._appservice.AddSQAReportStructure(fieldStruct).subscribe(
      (data: any) => {
        this.fileStructure = data;
        alert("Report structure created successfully");
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_getAnalyzedInsights(custId: string, projId: string, type: string, startdate: Date, enddate: Date) {
    this._appservice.GetAnalyzedInsights(custId, projId, type, startdate, enddate).subscribe(
      (data: any) => {
        this.filteredInsights = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  CreateTable_onClick() {
    this.service_AddSQAReportStructure(this.fileStructure);
  }

  Analyse_onClick() {
    this.service_GetSQAFileStructure('da155e36-1bea-411d-9b5a-4d74d2b870f2.csv');
  }

  AnalyzeInsights() {
    this.service_getAnalyzedInsights(this.custId, this.projId, this.dataDumpType, this.startDate, this.endDate);
  }

  project_onChange($event: string) {
    let obj: CustomerProjectIds = JSON.parse($event);
    this.custId = obj.customer[0] || '';
    this.projId = obj.project[0] || '';
    this.LoadData();
  }
}
