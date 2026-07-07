import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin } from 'rxjs';

import { AppsService } from '../../core/services/apps.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { MyUtility } from '../../shared/my-utility';
import { LayoutService } from '../layout/layout.service';
import { SurveyComponent } from '../../pages/survey/survey.component';
import { ReportsSPParamsModel } from '../../models/report-model';
import { AccessControl } from '../../shared/access-control';
import { PresurveyConnectComponent } from '../presurvey-connect/presurvey-connect.component';

/**
 * ViewCsatComponent - Voice of Customer (Customer Success Survey) Page
 * 
 * Features:
 * - Account level / Project level view toggle
 * - Quarter/Period selector (Q1-Q4, H1-H2)
 * - Year and respondent selection
 * - Survey data viewing and management
 * - Pre-survey connect dialog integration
 * - Export to Excel functionality
 * - Survey feedback form integration
 */
@Component({
  selector: 'app-view-csat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    SurveyComponent
  ],
  providers: [DatePipe],
  templateUrl: './view-csat.component.html',
  styleUrls: ['./view-csat.component.scss']
})
export class ViewCsatComponent implements OnInit, OnDestroy {
  // Dependency injection using Angular 19 inject()
  private route = inject(ActivatedRoute);
  public _layoutService = inject(LayoutService);
  private _appService = inject(AppsService);
  public _util = inject(MyUtility);
  public datepipe = inject(DatePipe);
  public _access = inject(AccessControl);
  public dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  // Component state properties
  sub: any;
  projNames: any[] = [];
  // Style injector for overlay fix (scoped to this component)
  private overlayFixStyleId = 'view-csat-overlay-fix';
  private styleElement: HTMLStyleElement | null = null;
  custNames: any[] = [];
  filteredProjNames: any[] = [];
  filteredCustNames: any[] = [];
  projectSearchTerm: string = '';
  respondentSearchTerm: string = '';
  reportRec: any[] = [];
  input_projectid: string = '';
  input_customerid: string = '';
  input_userid: string = '';
  input_respondedid: number = 0;
  ddyear: number[] = [];
  batchCustomerId: number = 0;
  selectedQuarter: number = 5; // Default to H1
  surveyGuid: any;
  surveyPram = new SurveyModel();
  guid: any;
  showSurveyGuid: boolean = false;
  showSurveyText: boolean = false;
  showPreconnect: boolean = false;
  showQualitativeFeedback: boolean = false;
  loading: boolean = false;
  month: any[] = [];
  showMonthly: boolean = false;
  isMonthly: boolean = false;
  tableMonth: number = 0;
  disablebtn: boolean = false;
  showProjectDropdown: boolean = true;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource(this.reportRec);
  selectedSPName: string = '';
  errorStr: string = '';
  selectedqrt: string = '';
  fileName: string = '';
  isEditable: boolean = false;
  reportParamData: ReportsSPParamsModel[] = [];
  paramData: any[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();

  @ViewChild('TABLE') table!: ElementRef;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paginatorTable') paginator!: MatPaginator;

  ngOnInit() {
    // Inject overlay CSS scoped to this component so dropdowns behave correctly here only
    this.addOverlayFixStyle();
    this.sub = this.route.params.subscribe((params: any) => {
      this.input_customerid = params['custid'];
      this.input_projectid = params['projid'];
      this._util.tableYear = params['year'] != undefined ? Number(params['year']) : new Date().getFullYear();
      this.input_respondedid = params['respondedid'] != undefined ? Number(params['respondedid']) : 0;
      
      if (params['frequencytype'] == "Monthly") {
        this.showMonthly = true;
        this.tableMonth = Number(params['frequency']);
      } else {
        // Set default quarter based on params or current date
        if (params['frequency'] != undefined && params['frequency'] !== 0) {
          this.selectedQuarter = Number(params['frequency']);
        } else {
          // Default to H1 if no frequency specified
          this.selectedQuarter = 5; // H1
        }
        this.showMonthly = false;
        this.tableMonth = 0;
      }
    });

    // this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    this._layoutService.selectedCust = this.input_customerid;
    this.getDBConfig();
  }

  ngOnDestroy(): void {
    // Clean up injected style when leaving the component
    this.removeOverlayFixStyle();
    if (this.sub && typeof this.sub.unsubscribe === 'function') {
      this.sub.unsubscribe();
    }
  }

  /** Injects scoped CSS into document head to hide CDK backdrop for this component */
  private addOverlayFixStyle(): void {
    try {
      if (typeof document === 'undefined') return;
      if (document.getElementById(this.overlayFixStyleId)) return;
      const css = `
/* Hide full-page CDK backdrop for small overlays (mat-select) when this component is active */
.cdk-overlay-backdrop.cdk-overlay-backdrop-showing {
  background: transparent !important;
  backdrop-filter: none !important;
}

/* Restore visible backdrop when a dialog container exists (modern browsers only) */
.cdk-overlay-container:has(.mat-mdc-dialog-container) .cdk-overlay-backdrop.cdk-overlay-backdrop-showing {
  background: rgba(0,0,0,0.55) !important;
  backdrop-filter: blur(3px) !important;
  pointer-events: auto !important;
  z-index: 1000 !important;
}
      `;
      const style = document.createElement('style');
      style.id = this.overlayFixStyleId;
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
      this.styleElement = style;
    } catch (e) {
      console.warn('Failed to inject overlay fix style', e);
    }
  }

  /** Removes the injected scoped CSS */
  private removeOverlayFixStyle(): void {
    try {
      if (this.styleElement && this.styleElement.parentNode) {
        this.styleElement.parentNode.removeChild(this.styleElement);
        this.styleElement = null;
      } else {
        const el = document.getElementById(this.overlayFixStyleId);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Toggle between account level and project level view
   */
  onViewTypeChange() {
    if (!this.showProjectDropdown) {
      this.input_projectid = '';
    } else {
      if (this.projNames && this.projNames.length > 0) {
        this.input_projectid = this.projNames[0].proJ_ID;
      }
    }
    this.guid = [];
    this.showSurveyGuid = false;
    this.showSurveyText = false;
    this.surveyGuid = null;
    this.getAllCustomerUser(this.input_customerid, this.input_projectid, this.isMonthly, this.startDate, this.endDate);
  }

  /**
   * Get database configuration to determine if customer uses monthly CSS
   */
  getDBConfig() {
    this._appService.GetDBConfigValue("MONTHLYCSS", -1, "").subscribe(
      (data: any) => {
        if (data.indexOf(this.input_customerid.toString()) >= 0) {
          this.showMonthly = true;
          this.surveyPram.iS_MONTHLY = true;
          this.getAllCustomerUser(this.input_customerid, '', this.surveyPram.iS_MONTHLY, this.startDate, this.endDate);
        } else {
          this.surveyPram.iS_MONTHLY = false;
          this.showMonthly = false;
        }
        this.getQuarterorMonth();
        this.getAllProjectsFromCustomer();
      },
      (error: any) => { this._util.serviceError(error); },
      () => {
        this.getReportDetails(this.surveyPram.iS_MONTHLY);
        this.getRportSpName(this.surveyPram.iS_MONTHLY);
      }
    );
  }

  /**
   * Determine current quarter or month based on current date
   */
  getQuarterorMonth() {
    // Respect route params when provided (do not override explicit selection)
    const routeFreqType = this.route.snapshot?.params?.['frequencytype'];
    const routeFreq = this.route.snapshot?.params?.['frequency'];
    if (routeFreqType === 'Monthly') {
      // Monthly handled elsewhere
      return;
    }
    if (routeFreq !== undefined && routeFreq !== null && routeFreq !== 0) {
      // Quarter was provided via route params — keep it
      this.getBatchDate();
      return;
    }

    // Default to the previous completed half-year:
    // - If current month is Jan-Jun (we are in H1), previous completed half is H2 of previous year
    // - If current month is Jul-Dec (we are in H2), previous completed half is H1 of current year
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    if (m >= 1 && m <= 6) {
      // In H1 -> default to previous H2 (previous year)
      this.selectedQuarter = 6; // H2
      this._util.tableYear = y - 1;
    } else {
      // In H2 -> default to previous H1 (same year)
      this.selectedQuarter = 5; // H1
      this._util.tableYear = y;
    }

    this.getBatchDate();
  }

  /**
   * Event handlers for dropdown changes
   */
  onYearChange() {
    // this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    this.guid = [];
  }

  onMonthChange() {
    this.guid = [];
  }

  onQuarterChange() {
    this.guid = [];
  }

  onUserChange() {
    this.guid = [];
  }

  onProjectChange() {
    this.guid = [];
    this.getAllCustomerUser(this.input_customerid, this.input_projectid, this.isMonthly, this.startDate, this.endDate);
  }

  /**
   * Filter project dropdown based on search term
   */
  filterProjects() {
    const searchTerm = this.projectSearchTerm.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredProjNames = this.projNames;
    } else {
      this.filteredProjNames = this.projNames.filter(proj => 
        proj.proJ_NM && proj.proJ_NM.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Filter respondent dropdown based on search term
   */
  filterRespondents() {
    const searchTerm = this.respondentSearchTerm.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredCustNames = this.custNames;
    } else {
      this.filteredCustNames = this.custNames.filter(cust => 
        cust.displaY_NAME && cust.displaY_NAME.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Clear project search
   */
  clearProjectSearch() {
    this.projectSearchTerm = '';
    this.filteredProjNames = this.projNames;
  }

  /**
   * Clear respondent search
   */
  clearRespondentSearch() {
    this.respondentSearchTerm = '';
    this.filteredCustNames = this.custNames;
  }

  /**
   * Get selected project name for display
   */
  get selectedProjectName(): string {
    if (!this.input_projectid) return 'Select Project';
    const project = this.projNames.find(p => p.proJ_ID === this.input_projectid);
    return project ? project.proJ_NM : 'Select Project';
  }

  /**
   * Get selected respondent name for display
   */
  get selectedRespondentName(): string {
    if (!this.input_userid) return 'Select Respondent';
    const respondent = this.custNames.find(c => c.emailid === this.input_userid);
    return respondent ? respondent.displaY_NAME : 'Select Respondent';
  }

  /**
   * Get all projects for the selected customer
   */
  getAllProjectsFromCustomer() {
    this._appService.GetCustomerProjectsName(this.input_customerid, false).subscribe(
      (data: any) => {
        this.projNames = data;
        this.filteredProjNames = data; // Initialize filtered array

        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          if (!this.input_projectid)
            this.input_projectid = this.projNames[0].proJ_ID;
          this.getAllCustomerUser(this.input_customerid, this.input_projectid, this.isMonthly, this.startDate, this.endDate);
        }
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  /**
   * Get all customer users (respondents) for survey
   */
  getAllCustomerUser(customerId: string, projectId: string, isMonthly: boolean | null, startDate: Date, endDate: Date) {
    this.input_userid = this.input_respondedid == 0 ? "" : this.input_userid;
    const formattedStartDate = this.datepipe.transform(startDate, 'yyyy-MM-dd') || '';
    const formattedEndDate = this.datepipe.transform(endDate, 'yyyy-MM-dd') || '';

    this._layoutService.GetAllCustomerUser(customerId, projectId, isMonthly ?? false, formattedStartDate, formattedEndDate).subscribe(
      (data: any) => {
        // Ensure we always have an array to avoid null .length access
        this.custNames = Array.isArray(data) ? data : [];
        this.filteredCustNames = this.custNames; // Initialize filtered array

        if (this.input_respondedid == 0) {
          this.input_userid = "";
          this.disablebtn = false;
          if (this.custNames.length > 0) {
            this.input_userid = this.custNames[0].emailid || "";
          } else {
            this.disablebtn = true;
          }
        } else {
          if (this.custNames.length > 0) {
            const found = this.custNames.find((x: any) => x.id == this.input_respondedid);
            this.input_userid = found ? found.emailid : "";
          } else {
            this.input_userid = "";
          }
        }
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }

  /**
   * Bind survey data based on selected parameters
   */
  bindData() {
    this.disablebtn = true;
    this.showQualitativeFeedback = false;
    this.surveyPram.cusT_ID = this.input_customerid;
    this.surveyPram.proJ_ID = this.input_projectid;
    this.surveyPram.montH = this.tableMonth;
    this.surveyPram.quarteR = this.selectedQuarter;
    this.surveyPram.yeaR = this._util.tableYear;
    this.surveyPram.useR_EMAIL_ID = this.input_userid;
    this.surveyPram.iS_MONTHLY = this.showMonthly;
    this.surveyPram.iS_QUALITATIVE_FEEDBACK = this.showQualitativeFeedback;
    this.showSurveyGuid = false;

    this._layoutService.getSurveyGuid(this.surveyPram).subscribe(
      (data: any) => {
        this.loading = true;
        this.surveyGuid = data;
        this.batchCustomerId = data.batchCustomerId;

        // Get employee ID from localStorage directly as fallback
        const empId = this._util.AppSettings.empid || localStorage.getItem('empid') || '';

        if ((data.status == "CREATED" || data.status == "MAIL SENT" || data.status == "MAIL RE-SENT" || 
             data.status == "DRAFT" || data.status == "COMPLETED")) {
          this.showPreconnect = true;
          
          // Allow SPOC, DEX, and DP (Delivery Principal) to edit
          if (data.spoc == empId || data.dex == empId || data.dp == empId) {
            this.isEditable = true;
          }
        }

        if (this.surveyGuid.guid != null) {
          this.loading = false;
          this.showSurveyText = false;
          if (data.status == "COMPLETED") {
            this.showSurveyGuid = true;
          }
          this.guid = this.surveyGuid;
        } else {
          this.loading = false;
          this.showSurveyGuid = false;
          this.showSurveyText = true;
        }
        this.disablebtn = false;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  /**
   * Open CSAT feedback form for manual entry
   */
  get_CSATFeedbackForm(isQualitative: boolean) {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      width: '500px',
      data: {
        title: 'Confirm Feedback Entry',
        message: 'Are you sure you want to give feedback? It will not be reverted once feedback has been given. When you complete entering the Customer feedback in this screen and click on Submit button, system will send the customer feedback details as an email to the chosen customer contact.',
        confirmText: 'Proceed',
        cancelText: 'Cancel',
        confirmColor: 'primary',
        icon: 'feedback',
        iconColor: '#667eea'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showQualitativeFeedback = isQualitative;
        this.surveyPram.iS_QUALITATIVE_FEEDBACK = true;

        this._layoutService.getSurveyGuid(this.surveyPram).subscribe(
          data => {
            this.loading = true;
            this.surveyGuid = data;
            if (this.surveyGuid.guid != null) {
              this.loading = false;
              this.showSurveyText = false;
              if (data.status == "COMPLETED") {
                this.showSurveyGuid = true;
              }
              this.guid = this.surveyGuid;
            } else {
              this.showToast("Please send the customer success survey for the selected quarter. Once sent you can fill the survey on behalf of the Customer.", 'warn');
              this.loading = false;
              this.showSurveyGuid = false;
              this.showSurveyText = true;
            }
            this.disablebtn = false;
          },
          error => { 
            this._util.serviceError(error);
            this.showToast('Failed to load survey', 'error');
          }
        );
      } else {
        this.showSurveyGuid = false;
      }
    });
  }

  /**
   * Get report details configuration (parameter config for Download Report)
   * Migrated from legacy layout.service.ts -> getReportdetails()
   */
  getReportDetails(isMonthly: boolean) {
    this._appService.getReportDetails(isMonthly).subscribe(
      (data: any) => {
        this.paramData = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  /**
   * Get stored procedure name for Download Report
   * Migrated from legacy layout.service.ts -> getRportSpName()
   */
  getRportSpName(isMonthly: boolean) {
    this._appService.getReportSpName(isMonthly).subscribe(
      (data: any) => {
        this.selectedSPName = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  /**
   * Calculate batch date range based on selected quarter
   */
  getBatchDate() {
    if (this.selectedQuarter == 5) {
      this.startDate = this._util.setLocaleDate(new Date(this._util.tableYear + "-01-01"));
      this.endDate = this._util.setLocaleDate(new Date(this._util.tableYear + "-06-30"));
    }
    if (this.selectedQuarter == 6) {
      this.startDate = this._util.setLocaleDate(new Date(this._util.tableYear + "-07-01"));
      this.endDate = this._util.setLocaleDate(new Date(this._util.tableYear + "-12-31"));
    }
  }

  /**
   * Get consolidated report data and export to Excel.
   * Uses forkJoin to guarantee paramData and spName are loaded
   * before building the report parameters, eliminating the async
   * race condition that caused "Cannot read properties of undefined".
   */
  getTabledata() {
    this.reportParamData = [];
    this.reportRec = [];
    this.loading = true;

    // Always fetch fresh from API so timing is never an issue
    forkJoin({
      paramData: this._appService.getReportDetails(this.surveyPram.iS_MONTHLY),
      spName:    this._appService.getReportSpName(this.surveyPram.iS_MONTHLY)
    }).subscribe({
      next: ({ paramData, spName }) => {
        this.paramData     = paramData;
        this.selectedSPName = spName;

        if (!this.paramData || this.paramData.length < 2) {
          this.loading = false;
          this.showToast('Report configuration not found. Please contact admin.', 'error');
          return;
        }

        // Build date range
        if (this.surveyPram.iS_MONTHLY) {
          this.startDate = new Date(this._util.tableYear, this.tableMonth - 1, 1);
          this.endDate   = new Date(this._util.tableYear, this.tableMonth, 0);
        } else {
          if (this.selectedQuarter == 1) {
            this.startDate = new Date(this._util.tableYear + "-04-01");
            this.endDate   = new Date(this._util.tableYear + "-06-30");
          } else if (this.selectedQuarter == 2) {
            this.startDate = new Date(this._util.tableYear + "-07-01");
            this.endDate   = new Date(this._util.tableYear + "-09-30");
          } else if (this.selectedQuarter == 3) {
            this.startDate = new Date(this._util.tableYear + "-10-01");
            this.endDate   = new Date(this._util.tableYear + "-12-31");
          } else if (this.selectedQuarter == 4) {
            this.startDate = new Date((this._util.tableYear + 1) + "-01-01");
            this.endDate   = new Date((this._util.tableYear + 1) + "-03-31");
          } else if (this.selectedQuarter == 5) {
            this.startDate = new Date((this._util.tableYear + 1) + "-01-01");
            this.endDate   = new Date((this._util.tableYear + 1) + "-06-30");
          } else if (this.selectedQuarter == 6) {
            this.startDate = new Date((this._util.tableYear + 1) + "-07-01");
            this.endDate   = new Date((this._util.tableYear + 1) + "-12-31");
          }
          this.selectedqrt = 'Q' + this.selectedQuarter;
        }

        // Build report param payload using fresh paramData
        this.reportParamData.push({
          id:            this.paramData[0].id,
          reporT_SP_ID:  this.paramData[0].reporT_SP_ID,
          paraM_NAME:    this.paramData[0].paraM_NAME,
          paraM_TYPE:    this.paramData[0].paraM_TYPE,
          paraM_VALUE:   this.datepipe.transform(this.startDate, 'yyyy-MM-dd') || ''
        });
        this.reportParamData.push({
          id:            this.paramData[1].id,
          reporT_SP_ID:  this.paramData[1].reporT_SP_ID,
          paraM_NAME:    this.paramData[1].paraM_NAME,
          paraM_TYPE:    this.paramData[1].paraM_TYPE,
          paraM_VALUE:   this.datepipe.transform(this.endDate, 'yyyy-MM-dd') || ''
        });

        // Fetch and export report data
        this._appService.displaySpData(this.reportParamData, this.selectedSPName).subscribe(
          data => {
            if (this.surveyPram.iS_MONTHLY) {
              this.custNames.forEach(ele => {
                let arr = data.filter((x: any) => x.customer_ID == this.input_customerid && x.email_Id === ele.emailid);
                this.reportRec.push(...arr);
              });
            } else {
              this.projNames.forEach(ele => {
                let arr = data.filter((x: any) => x.project_ID === ele.proJ_ID);
                this.reportRec.push(...arr);
              });
            }

            if (this.reportRec.length > 0) {
              this.displayedColumns = Object.keys(this.reportRec[0]);
              this.updateTable();
            } else {
              this.showToast('No Feedback Available For Selected Period', 'warn');
            }
            this.loading = false;
          },
          error => {
            this.loading = false;
            this._util.serviceError(error);
            this.showToast('Failed to load report data', 'error');
          },
          () => {
            if (this.reportRec.length > 0) {
              setTimeout(() => { this.ExportTOExcel(); }, 6000);
            }
          }
        );
      },
      error: (error) => {
        this.loading = false;
        this._util.serviceError(error);
        this.showToast('Failed to load report configuration', 'error');
      }
    });
  }

  /**
   * Export table data to Excel
   */
  ExportTOExcel() {
    let fileName = `${'Report'}_${this.surveyPram.iS_MONTHLY ? 
      this._util.getMonthAbr(this.tableMonth - 1) + this._util.tableYear : 
      this.selectedqrt + `_` + this._util.tableYear}`;
    this._util.exportToExcel(this.table.nativeElement, fileName);
  }

  /**
   * Update MatTable data source
   */
  updateTable() {
    this.dataSource = new MatTableDataSource(this.reportRec);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Open pre-survey connect dialog
   */
  preSurveyPopup() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = "40%";
    dialogConfig.height = "70%";
    dialogConfig.data = {
      batchCustomerId: this.batchCustomerId,
      isDisabled: !this.isEditable,  // Fixed: Set based on edit permission
      isEditable: this.isEditable
    };
    const dialogRef = this.dialog.open(PresurveyConnectComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result: any) => {
      // Handle dialog close if needed
      if (result) {
      }
    });
  }

  /**
   * Show toast notification
   * @param message Message to display
   * @param type Toast type: 'success', 'warn', or 'error'
   */
  private showToast(message: string, type: 'success' | 'warn' | 'error' = 'success'): void {
    const panelClass = type === 'success' ? 'success-snackbar' : 
                       type === 'warn' ? 'warn-snackbar' : 
                       'error-snackbar';
    
    const duration = type === 'error' ? 4000 : 3000;

    this._snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}

/**
 * Survey model for API parameters
 */
class SurveyModel {
  cusT_ID: string = '';
  useR_EMAIL_ID: string = '';
  proJ_ID: string = '';
  quarteR: number = 0;
  yeaR: number = 0;
  montH: number = 0;
  iS_MONTHLY: boolean = false;
  iS_QUALITATIVE_FEEDBACK: boolean = false;
}
