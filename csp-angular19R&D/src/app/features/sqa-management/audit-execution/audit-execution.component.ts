import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ProjectSelectorComponent } from '../../../shared/components/project-selector/project-selector.component';

// Models
export interface AuditExecutionModel {
  id?: number;
  audiT_EXECUTION_ID?: number;
  audiT_TITLE?: string;
  customeR_ID?: string;
  projecT_ID?: string;
  audiT_START_DATE?: Date | null;
  audiT_END_DATE?: Date | null;
  audiT_PLAN_REFERENCE?: string;
  auditoR_NAME?: number;
  tesT_ID?: number;
  tesT_RESULT?: string;
  statuS_OF_CONTROL?: string;
  resulT_DESCRIPTION?: string;
  findinG_DESCRIPTION?: string;
  findinG_TYPE?: string;
  impactinG_ATTRIBUTES_ID?: number;
  impactinG_ATTRIBUTES?: string[];
  auditeE_NAME?: number[];
  severity?: string;
  statuS_OF_AUDIT?: string;
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  isactive?: boolean;
  isevaluated?: boolean;
}

export interface TestViewModel {
  id: number;
  title: string;
  description: string;
  status: string;
}

export interface ServiceAreaModelNew {
  id: number;
  title: string;
}

export interface PlannedAuditModel {
  description: string;
  scheduleD_START_DATE: string;
  duE_DATE: string;
  auditoR_ID: number;
  auditesS_ID: number[];
  servicE_AREA_ID: number[];
  status: string;
  iS_CHECKED?: boolean;
}

export interface AuditDropDownData {
  auditoR_LIST: any[];
  tesT_RESULTS: string[];
  statuS_CONTROLS: string[];
  impactinG_ATTRIBUTES: string[];
  risK_SEVERITY: string[];
}

export interface AuditDetailsResponse {
  testS_VIEW_MODELS: TestViewModel[];
  audiT_DATA: AuditExecutionModel[];
}

@Component({
  selector: 'app-audit-execution',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    MatDialogModule,
    MatTooltipModule,
    ProjectSelectorComponent
  ],
  templateUrl: './audit-execution.component.html',
  styleUrls: ['./audit-execution.component.scss']
})
export class AuditExecutionComponent implements OnInit, AfterViewInit {
  private _appService = inject(AppsService);
  private _util = inject(MyUtility);
  public dialog = inject(MatDialog);

  // Component state
  custId: string = '';
  projId: string = '';
  index: number = 0;
  cnt: number = 0;

  // Audit execution data
  auditCheck: AuditExecutionModel = {};
  auditResults: AuditExecutionModel[] = [];
  auditData: AuditExecutionModel[] = [];
  auditDataTemp: AuditExecutionModel[] = [];
  selectedAuditData: any;

  // UI control flags
  updateMode: boolean = true;
  enableDiv: boolean = false;
  showSideStructure: boolean = false;
  showStructure: boolean = false;
  disableControl: boolean = false;
  showAuditInputs: boolean = false;
  IsSavedAuditsLoaded: boolean = false;
  IsCompletedAudit: boolean = false;
  disableInput: boolean = false;
  viewInprogress: boolean = false;
  viewCompleted: boolean = false;

  // Form fields
  auditDataTitle: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedAuditor: number | undefined;
  selectedAuditees: number[] = [];
  selectedServiceAreas: number[] = [];
  selectedTestFilter: string = "All";

  // Lists and data
  auditeesList: any[] = [];
  auditorList: any[] = [];
  serviceAreaList: ServiceAreaModelNew[] = [];
  plannedAudits: PlannedAuditModel[] = [];
  savedAudits: any[] = [];
  tests: TestViewModel[] = [];
  originaltests: TestViewModel[] = [];

  // Dropdown data
  ddData: AuditDropDownData = {
    auditoR_LIST: [],
    tesT_RESULTS: [],
    statuS_CONTROLS: [],
    impactinG_ATTRIBUTES: [],
    risK_SEVERITY: []
  };

  // Table configuration
  displayedColumns = ["index", "title", "description", "status", "action"];
  dataSource: MatTableDataSource<TestViewModel> = new MatTableDataSource<TestViewModel>([]);
  
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.Service_GetServiceAreaList();
    this.getDropDownParams();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  /**
   * Get customer and project info from project selector
   */
  getCustProjInfo(event: string) {
    try {
      const Obj = JSON.parse(event);
      this.custId = Obj.customer;
      this.projId = Obj.project;
      
      // Reset form
      this.auditDataTitle = '';
      this.selectedAuditor = undefined;
      this.selectedAuditees = [];
      this.startDate = null;
      this.endDate = null;
      this.showAuditInputs = false;
      this.auditData = [];

      // Load data
      this._appService.getAuditeeDetails(this.custId, this.projId).subscribe({
        next: (data) => {
          this.auditeesList = data;
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });

      this.Service_GetPlannedAudits(this.custId, this.projId);
    } catch (error) {
      console.error('Error parsing project info:', error);
    }
  }

  /**
   * Refresh table data source
   */
  refreshTable(dataSource: TestViewModel[]) {
    this.dataSource = new MatTableDataSource(dataSource);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  /**
   * Get service area list
   */
  Service_GetServiceAreaList() {
    this._appService.getServiceAreaList().subscribe({
      next: (data) => {
        this.serviceAreaList = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get planned audits for project
   */
  Service_GetPlannedAudits(custid: string, projid: string) {
    this.IsSavedAuditsLoaded = false;
    this._appService.getPlannedAudits(custid, projid).subscribe({
      next: (data) => {
        this.plannedAudits = data;
        if (this.plannedAudits.length > 0) {
          this.IsSavedAuditsLoaded = true;
        }
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get audit assessment details
   */
  GetAuditAssesment(
    i: number,
    title: string,
    startdate: string,
    enddate: string,
    auditorname: number,
    auditessname: number[],
    serviceareas: number[],
    status: string
  ) {
    // Update checked state
    this.plannedAudits.forEach((element, index) => {
      element.iS_CHECKED = index === i;
    });

    this.showSideStructure = false;
    this.selectedTestFilter = "All";

    if (status === 'COMPLETED') {
      this.IsCompletedAudit = true;
      this.disableInput = true;
      this.disableControl = true;
      this.viewCompleted = true;
      this.viewInprogress = false;
    } else {
      this.IsCompletedAudit = false;
      this.disableInput = true;
      this.disableControl = false;
      this.viewCompleted = false;
      this.viewInprogress = true;
    }

    this.selectedAuditor = auditorname;
    this.selectedAuditees = auditessname;
    this.startDate = new Date(startdate);
    this.endDate = new Date(enddate);
    this.auditDataTitle = title;
    this.auditData = [];
    this.selectedServiceAreas = serviceareas;

    this.Service_getTestsAuditData(
      this.custId,
      this.projId,
      serviceareas,
      title,
      new Date(startdate),
      new Date(enddate),
      auditorname,
      auditessname,
      status
    );
  }

  /**
   * Get tests and audit data
   */
  Service_getTestsAuditData(
    custid: string,
    projid: string,
    serviceareas: number[],
    title: string,
    startdate: Date,
    enddate: Date,
    auditorname: number,
    auditessname: number[],
    status: string
  ) {
    this._appService.getAuditDetails(
      custid,
      projid,
      serviceareas,
      title,
      startdate,
      enddate,
      auditorname,
      auditessname
    ).subscribe({
      next: (data: AuditDetailsResponse) => {
        this.selectedAuditData = data;
        this.originaltests = data.testS_VIEW_MODELS || [];
        this.tests = data.testS_VIEW_MODELS || [];
        this.refreshTable(this.tests);
        this.auditData = data.audiT_DATA || [];
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get dropdown parameters for audit
   */
  getDropDownParams() {
    this._appService.getDropDownParamsForAudit().subscribe({
      next: (data: AuditDropDownData) => {
        this.ddData = data;
        this.auditorList = data.auditoR_LIST || [];
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Save auditor name to all audit data
   */
  saveAuditorName() {
    this.auditData.forEach((element) => {
      element.auditoR_NAME = this.selectedAuditor;
    });
  }

  /**
   * Save auditee names to all audit data
   */
  saveAuditeeName() {
    this.auditData.forEach((element) => {
      element.auditeE_NAME = this.selectedAuditees;
    });
  }

  /**
   * Save audit title to all audit data
   */
  saveAuditTitle() {
    this.auditData.forEach((element) => {
      element.audiT_TITLE = this.auditDataTitle;
    });
  }

  /**
   * Save start date to all audit data
   */
  saveStartDate(sdate: any) {
    if (this.auditData.length > 0 && this.startDate) {
      this.auditData.forEach((element) => {
        element.audiT_START_DATE = this.getStDate(this.startDate!);
      });
    }
  }

  /**
   * Save end date to all audit data
   */
  saveEndDate(sdate: any) {
    if (this.auditData.length > 0 && this.endDate) {
      this.auditData.forEach((element) => {
        element.audiT_END_DATE = this.getEnDate(this.endDate!);
      });
    }
  }

  /**
   * Convert date to start date format
   */
  getStDate(stdate: Date): Date {
    const date: number = stdate.getDate();
    const month: number = stdate.getMonth();
    const year: number = stdate.getFullYear();
    const offset: number = stdate.getTimezoneOffset();
    const newDate: Date = new Date(year, month, date);
    newDate.setMinutes(newDate.getMinutes() - offset);
    return newDate;
  }

  /**
   * Convert date to end date format
   */
  getEnDate(stdate: Date): Date {
    const date: number = stdate.getDate();
    const month: number = stdate.getMonth();
    const year: number = stdate.getFullYear();
    const offset: number = stdate.getTimezoneOffset();
    const newDate: Date = new Date(year, month, date + 1);
    newDate.setMinutes(newDate.getMinutes() - (offset + 1));
    return newDate;
  }

  /**
   * Show side panel for test evaluation
   */
  showSideDiv(i: number) {
    this.index = i;
    this.showSideStructure = true;
    this.cnt = i;
  }

  /**
   * Close edit mode panel
   */
  CloseEditMode_OnClick() {
    this.showSideStructure = false;
  }

  /**
   * Get severity based on control status
   */
  getSeverity(auditData: AuditExecutionModel) {
    if (auditData.statuS_OF_CONTROL === this.ddData.statuS_CONTROLS[1]) {
      auditData.severity = "High";
      auditData.findinG_TYPE = "noncompliantmajor";
    } else if (auditData.statuS_OF_CONTROL === this.ddData.statuS_CONTROLS[0]) {
      auditData.severity = "Low";
      auditData.findinG_TYPE = "compliant";
    } else if (auditData.statuS_OF_CONTROL === this.ddData.statuS_CONTROLS[3]) {
      auditData.severity = "Critical";
      auditData.findinG_TYPE = "noncompliantmajor";
    } else {
      auditData.severity = "Medium";
      auditData.findinG_TYPE = "noncompliantminor";
    }
  }

  /**
   * Change test result based on status of control
   */
  changeTestResult(auditdata: AuditExecutionModel) {
    if (auditdata.statuS_OF_CONTROL === "Implemented" || auditdata.statuS_OF_CONTROL === "Partially Implemented") {
      auditdata.tesT_RESULT = "Passed";
    } else if (auditdata.statuS_OF_CONTROL === "Not Implemented") {
      auditdata.tesT_RESULT = "Failed";
    } else if (auditdata.statuS_OF_CONTROL === "Not Yet") {
      auditdata.tesT_RESULT = "Pending";
    }
  }

  /**
   * Check if audit data is valid
   */
  checkIsValid(auditData: AuditExecutionModel): boolean {
    if (auditData.isevaluated) {
      if (
        !auditData.audiT_START_DATE ||
        !auditData.audiT_END_DATE ||
        !auditData.findinG_TYPE ||
        !auditData.tesT_RESULT ||
        !auditData.statuS_OF_CONTROL ||
        !auditData.resulT_DESCRIPTION ||
        !this.auditDataTitle
      ) {
        return false;
      }
      return true;
    }
    return true;
  }

  /**
   * Save audit execution details
   */
  SaveAuditExecDetails(status: string) {
    this.saveAuditeeName();
    this.saveAuditorName();
    this.saveAuditTitle();
    
    if (this.startDate) {
      this.saveStartDate(this.startDate);
    }
    if (this.endDate) {
      this.saveEndDate(this.endDate);
    }

    // Set status for all
    this.auditData.forEach((element) => {
      element.statuS_OF_AUDIT = status;
    });

    // Mark evaluated tests
    this.auditData.forEach((x) => {
      if (x.tesT_RESULT || x.statuS_OF_CONTROL) {
        x.isevaluated = true;
      } else {
        x.isevaluated = false;
      }
    });

    // Check if at least one test is evaluated
    let isValid = this.auditData.some((x) => x.isevaluated === true);

    if (this.auditData.length > 0 && isValid) {
      let hasInvalidData = false;
      
      for (let i = 0; i < this.auditData.length; i++) {
        if (!this.checkIsValid(this.auditData[i])) {
          this._util.showError("Enter all field values");
          hasInvalidData = true;
          break;
        }
      }

      if (!hasInvalidData) {
        this.service_SaveAuditExecData(this.auditData);
      }
    } else {
      this._util.showError('Please evaluate Tests');
    }
  }

  /**
   * Save audit execution data to backend
   */
  service_SaveAuditExecData(auditData: AuditExecutionModel[]) {
    this._appService.saveAuditExecDetails(auditData).subscribe({
      next: (data) => {
        this.auditData = data;
        this.showSideStructure = false;
        this._util.showSuccess("Tests evaluated Successfully");
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Show preview popup for audit report
   */
  showPreviewPopup() {
    if (!this.custId || !this.projId || !this.startDate || !this.endDate || 
        !this.selectedAuditor || !this.selectedAuditees || this.selectedAuditees.length === 0 || 
        !this.auditDataTitle) {
      this._util.showError('Please fill all audit details before preview');
      return;
    }

    const auditeeNames: string[] = this.auditeesList
      .filter((x) => this.selectedAuditees.indexOf(x.emP_ID) > -1)
      .map((y) => y.frsT_NM);

    const auditorName = this.ddData.auditoR_LIST
      .filter((x) => x.emP_ID === this.selectedAuditor)
      .map((y) => y.frsT_NM)[0] || '';

    this._util.showInfo('Audit Report Preview feature will be implemented soon');
    
    // TODO: Implement AuditReportComponent dialog
    // const dialogConfig = {
    //   autoFocus: true,
    //   maxWidth: "80%",
    //   height: "90%",
    //   width: "75%",
    //   data: {
    //     projecT_ID: this.projId,
    //     customeR_ID: this.custId,
    //     audiT_START_DATE: this.startDate,
    //     audiT_END_DATE: this.endDate,
    //     auditoR_NAME: auditorName,
    //     auditeeS_NAME: auditeeNames.join(','),
    //     audiT_TITLE: this.auditDataTitle
    //   }
    // };
    // const dialogRef = this.dialog.open(AuditReportComponent, dialogConfig);
  }

  /**
   * Send email report to auditee
   */
  SendReportToAuditee() {
    if (!this.custId || !this.projId || !this.startDate || !this.selectedAuditor || 
        !this.selectedAuditees || !this.auditDataTitle) {
      this._util.showError('Please fill all audit details');
      return;
    }

    this._appService.sendAuditExecutionMail(
      this.custId,
      this.projId,
      this.getStDate(this.startDate),
      this.selectedAuditor,
      this.selectedAuditees,
      this.auditDataTitle
    ).subscribe({
      next: () => {
        this._util.showSuccess('Email Sent Successfully');
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Filter tests based on selected result
   */
  filterTests() {
    this.tests = this.originaltests;
    
    if (this.selectedTestFilter === "All") {
      this.tests = this.originaltests;
    } else {
      const testIds = this.auditData
        .filter((x) => x.tesT_RESULT === this.selectedTestFilter)
        .map((x) => x.tesT_ID);
      
      this.tests = this.originaltests.filter((x) => testIds.indexOf(x.id) > -1);
    }

    this.refreshTable(this.tests);
  }

  /**
   * Get test status for test ID
   */
  getTestStatusForTestid(id: number): string {
    const result = this.auditData
      .filter((x) => x.tesT_ID === id)
      .map((y) => y.tesT_RESULT)[0];
    return result || '';
  }
}
