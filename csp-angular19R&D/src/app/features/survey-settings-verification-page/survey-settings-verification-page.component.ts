/**
 * SurveySettingsVerificationPageComponent - CSS Verification Page
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - Display CSS batches (Quarterly and Half-Yearly)
 * - View batch customers with verification details
 * - Approve/Reject customer contact verifications
 * - Export to Excel functionality
 * - Filter and search capabilities
 * - Checkbox selection for bulk operations
 * - Premier and Non-Premier customer separation
 * - Comments dialog for rejection reasons
 * - Confirmation dialogs for actions
 * 
 * Migration Notes:
 * - Converted to standalone component
 * - Used inject() pattern for dependency injection
 * - All logic preserved exactly from legacy
 * - All method names unchanged
 * - All styling preserved
 * - Added app-navbar-new component at top
 */

import { Component, OnInit, TemplateRef, ViewChild, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

// CDK Imports
import { MediaMatcher } from '@angular/cdk/layout';
import { SelectionModel } from '@angular/cdk/collections';

// Material Imports
import { MatDialog, MatDialogConfig, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

// Services and Models
import { MyUtility } from '../../shared/my-utility';
import { SurveyService } from '../../core/services/survey.service';
import { AccessControl } from '../../shared/access-control';
import { CssBatchModel } from '../../models/css-batch-model';
import { CssCustomerVerificationModel } from '../../models/css-customer-verification-model';

// Components
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-survey-settings-verification-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatButtonModule,
    NavbarNewComponent
  ],
  templateUrl: './survey-settings-verification-page.component.html',
  styleUrl: './survey-settings-verification-page.component.scss'
})
export class SurveySettingsVerificationPageComponent implements OnInit {
  // Dependency Injection
  public _util = inject(MyUtility);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private media = inject(MediaMatcher);
  private dialog = inject(MatDialog);
  private surveyService = inject(SurveyService);
  public _access = inject(AccessControl);
  private _router = inject(Router);
  private route = inject(ActivatedRoute);

  // Media Query
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  // ViewChild References
  @ViewChild('tableToExport', { read: ElementRef }) table!: ElementRef;
  @ViewChild('paginatorTable') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild('commentsDialog') commentsDialog!: TemplateRef<any>;
  @ViewChild('confirmationDialog') confirmationDialog!: TemplateRef<any>;

  // Component Properties
  FinalTabData: any[] = [];
  progress: boolean = false;
  Batches: CssBatchModel[] = [];
  BatchCustomers: CssCustomerVerificationModel[] = [];
  selectedBatch!: CssBatchModel;
  startDate: any;
  endDate: any;
  
  // Table Columns
  batchColumns = ['index', 'frequency', 'starT_DATE', 'enD_DATE', 'category', 'status', 'totaL_RECORDS', 'pending', 'verified', 'rejected', 'surveY_SENT', 'surveY_RECD'];
  batchCustomersColumns = ['select', 'index', 'CUST_NM', 'PROJ_NM', 'CSS_Eligible', 'REASON', 'HEAD_COUNT', 'CSS_CONFIGURED', 'CUSTOMER_CONTACT_VERIFICATION', 'VERIFICATION_COMMENTS', 'VERIFIED_BY', 'APPROVAL_DATE', 'RESPONDENT_NAME', 'RESPONDENT_MAIL', 'ROLE', 'ROLETYPE', 'PROJ_STATUS', 'PROJECT_TYPE', 'BUSINESS_UNIT', 'DEPARTMENT', 'PROJECT_GROUP', 'CONTRACTING_UNIT', 'REVENUE_TYPE', 'COUNTRY', 'METHODOLOGY', 'TYPE_OF_ACCOUNT', 'ACCOUNT_OWNER', 'PM', 'PM_MAIL_ID', 'QUALITY_SPOC', 'SKIP_CSAT', 'SKIP_CSAT_COMMENTS', 'contactS_LINK', 'skiP_CSAT_LINK'];
  
  // Table Data and Selection
  dataSource = new MatTableDataSource(this.BatchCustomers);
  selection = new SelectionModel<CssCustomerVerificationModel>(true, []);
  selectedRow: any;
  
  // State Flags
  isLoading: boolean = false;
  isVerificationInProgress: boolean = false;
  
  // Dialog Data
  batchCustomerData: CssCustomerVerificationModel = new CssCustomerVerificationModel();
  newBatch!: CssBatchModel;
  confirmationMessage: string = '';
  confirmationDialogRef: any;
  rejectComment: any;

  constructor() {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.service_GetCSSMonthlyBatches();
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  /**
   * Logout functionality
   */
  logout() {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to log out?',
      'Logout'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        if (this._util.IsGAVS()) {
          this.service_Logout();
          let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
          window.location.href = loginurl;
        } else {
          this.service_Logout();
          this._router.navigateByUrl('/login');
        }
      }
    });
  }

  /**
   * Service call for logout
   */
  service_Logout() {
    this.surveyService.Logout().subscribe({
      next: (data) => {
        this._util.empid('');
        this._util.displayname('');
        this._util.token('');
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Create custom filter function for table
   */
  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const searchTerms = filter.toLowerCase().split(' ');

      return searchTerms.every(term => {
        return (
          (data.cusT_NM && data.cusT_NM.toLowerCase().includes(term)) ||
          (data.displaY_NAME && data.displaY_NAME.toLowerCase().includes(term)) ||
          (data.emaiL_ID && data.emaiL_ID.toLowerCase().includes(term)) ||
          (data.status && data.status.toLowerCase().includes(term)) ||
          (data.proJ_NM && data.proJ_NM.toLowerCase().includes(term)) ||
          (data.proD_NM && data.proD_NM.toLowerCase().includes(term)) ||
          (data.proJ_STATUS && data.proJ_STATUS.toLowerCase().includes(term)) ||
          (data.comments && data.comments.toLowerCase().includes(term)) ||
          (data.approver && data.approver.toLowerCase().includes(term)) ||
          (data.contractinG_UNIT && data.contractinG_UNIT.toLowerCase().includes(term)) ||
          ((data.iS_VERIFIED ? "Approved" : "Not Verified").toLowerCase().includes(term))
        );
      });
    };

    return filterFunction;
  }

  /**
   * Apply filter to table
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;
    if (filterValue) {
      this.dataSource.filterPredicate = (data, filter: string) =>
        this.createFilter()(data, filter);
    } else {
      this.dataSource.filterPredicate = this.createFilter();
    }
  }

  /**
   * View batch details on click
   */
  ViewBatch_onClick(element: any) {
    this.selectedBatch = element;
    this.startDate = element.starT_DATE;
    this.endDate = element.enD_DATE;
    this.service_GetCSSVerificationDetails(element.starT_DATE, element.enD_DATE, 0);
    this.selectedRow = element;
  }

  /**
   * Check if row is selected
   */
  isSelectedRow(element: any) {
    return this.selectedRow === element;
  }

  /**
   * Copy CSAT link to clipboard
   */
  CopyToClipboard(element: any) {
    this.copyitem(element.url);
    this._util.showInfo('CSAT link copied to Clipboard.');
  }

  /**
   * Copy item to clipboard
   */
  copyitem(item: string): void {
    // Modern Clipboard API (replaces deprecated execCommand)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(item).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = item;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Open contacts link in new tab
   */
  openInNewTabCL(url: any) {
    this.openInNewTab(url.contactS_LINK);
  }

  /**
   * Open skip CSAT link in new tab
   */
  openInNewTabSC(element: any) {
    this.openInNewTab(element.skiP_CSAT_LINK);
  }

  /**
   * Open URL in new tab
   */
  openInNewTab(url: string) {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.focus();
    }
  }

  /**
   * Update table with data
   */
  UpdateTable() {
    this.dataSource = new MatTableDataSource(this.FinalTabData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Export table to Excel
   */
  exportToExcel() {
    this.progress = true;
    this.FinalTabData = this.BatchCustomers;
    if (this.FinalTabData.length > 0) {
      this.UpdateTable();
      const getDate = new Date();
      const fileName = `CSS_Batch_Customers_Monthly${getDate.toLocaleString()}`;
      this._util.exportToExcel(this.table.nativeElement, fileName);
      this.progress = false;
    } else {
      this._util.showWarningPopup("No records!", "No Data");
      this.progress = false;
    }
  }

  /**
   * Check if all rows are selected
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Master toggle for select all
   */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.filteredData.forEach(row => this.selection.select(row));
  }

  /**
   * Get CSS Monthly Batches
   */
  service_GetCSSMonthlyBatches() {
    this.surveyService.GetCSSBatches(localStorage.getItem("empid") || '').subscribe({
      next: (data) => {
        this.Batches = data.filter((x: CssBatchModel) => x.frequency == 'Quarterly' || x.frequency == 'Half-Yearly');
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get CSS Verification Details
   */
  service_GetCSSVerificationDetails(starT_DATE: Date, enD_DATE: Date, custId: any) {
    this.isLoading = true;
    this.surveyService.GetCSSCustomerVerifications(starT_DATE, enD_DATE, custId).subscribe({
      next: (data) => {
        this.BatchCustomers = data;
        this.dataSource = new MatTableDataSource(this.BatchCustomers);
        this.isLoading = false;
        this.selection.clear();
        this.selectedBatch.totaL_RECORDS = this.BatchCustomers.length;
        this.selectedBatch.pending = this.BatchCustomers.filter((x: CssCustomerVerificationModel) => x.customeR_CONTACT_VERIFICATION === 'No' && (x.verificatioN_COMMENTS == null || x.verificatioN_COMMENTS == '')).length;
        if (this.BatchCustomers.some((x: CssCustomerVerificationModel) => x.csS_Eligible == 'Yes' && (x.respondenT_NAME == null || x.respondenT_MAIL == ''))) {
          this._util.showWarningPopup("There are CSS eligible projects in this list but customers are not configured. Please configure the contact details for the CSS eligible projects. If you want to skip an eligible project, please follow SKIP CSAT process by clicking on SKIP CSAT link to take approval.", "Unconfigured Contacts");
        }
      },
      error: (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Approve button click handler
   */
  ApproveOnClick() {
    if (this.validateApprove()) {
      this.confirmationMessage = 'Are you sure want to approve the selected customer contact(s)? Please note if you have selected already Rejected contacts then those will be Verified too.';
      const confirmationDialogConfig = new MatDialogConfig();
      confirmationDialogConfig.autoFocus = true;
      confirmationDialogConfig.width = '32%';
      confirmationDialogConfig.height = '25%';
      confirmationDialogConfig.panelClass = 'panelClass';
      this.confirmationDialogRef = this.dialog.open(this.confirmationDialog, confirmationDialogConfig);

      this.confirmationDialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.updateCSSVerification(true, '');
        }
      });
    }
  }

  /**
   * Reject button click handler
   */
  RejectOnClick() {
    if (this.validateReject()) {
      this.confirmationMessage = 'Are you sure want to reject the selected customer contact(s)? Please note if you have selected already verified contacts then those will be rejected too.';
      const confirmationDialogConfig = new MatDialogConfig();
      confirmationDialogConfig.autoFocus = true;
      confirmationDialogConfig.width = '30%';
      confirmationDialogConfig.height = '25%';
      confirmationDialogConfig.panelClass = 'panelClass';

      this.confirmationDialogRef = this.dialog.open(this.confirmationDialog, confirmationDialogConfig);
      this.confirmationDialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.autoFocus = true;
          dialogConfig.width = '45%';
          dialogConfig.height = '32%';
          dialogConfig.panelClass = 'panelClass';
          this.dialog.open(this.commentsDialog, dialogConfig);
        }
      });
    }
  }

  /**
   * Reject selected customer verifications
   */
  rejectSelectedCustomerVerifications(): void {
    this.dialog.closeAll();
    this.updateCSSVerification(false, this.rejectComment);
  }

  /**
   * Update CSS Verification (Approve or Reject)
   */
  updateCSSVerification(csmAction: boolean, rejectComment: string) {
    this.isLoading = true;
    this.isVerificationInProgress = true;
    var premierCount = this.selection.selected.filter((x: CssCustomerVerificationModel) => this._util.IsPremier(x.cusT_ID)).length;
    
    if (premierCount == this.selection.selected.length) {
      // Call premier
      this.surveyService.UpdateCustomerContactsVerificationListPremier(this.selection.selected, csmAction, rejectComment).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.isVerificationInProgress = false;
          if (csmAction)
            this._util.showSuccessPopup("Selected customer contact(s) are Approved.", "Success");
          else
            this._util.showSuccessPopup("Selected customer contact(s) are Rejected.", "Success");
          this.service_GetCSSVerificationDetails(this.startDate, this.endDate, 0);
        },
        error: (error) => {
          this.isLoading = false;
          this._util.serviceError(error);
          this.isVerificationInProgress = false;
        }
      });
    } else if (premierCount == 0) {
      this.surveyService.UpdateCustomerContactsVerificationList(this.selection.selected, csmAction, rejectComment).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.isVerificationInProgress = false;
          if (csmAction)
            this._util.showSuccessPopup("Selected customer contact(s) are Approved.", "Success");
          else
            this._util.showSuccessPopup("Selected customer contact(s) are Rejected.", "Success");
          this.service_GetCSSVerificationDetails(this.startDate, this.endDate, 0);
        },
        error: (error) => {
          this.isLoading = false;
          this._util.serviceError(error);
          this.isVerificationInProgress = false;
        }
      });
    } else {
      this._util.showWarningPopup("You are not allowed to update both Premier and Non-Premier customers at the same time.", "Validation Error");
      this.isLoading = false;
      this.isVerificationInProgress = false;
    }
  }

  /**
   * Validate approve action
   */
  validateApprove() {
    if (this.selection.isEmpty()) {
      this._util.showWarningPopup("Please select customer contact(s) to approve.", "Validation Error");
      return false;
    }
    if (this.validateCSSConfigureAndEmail()) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Validate reject action
   */
  validateReject() {
    if (this.selection.isEmpty()) {
      this._util.showWarningPopup("Please select customer contact(s) to reject.", "Validation Error");
      return false;
    }
    if (this.validateCSSConfigureAndEmail()) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Validate CSS Configure and Email
   */
  validateCSSConfigureAndEmail() {
    const hasUnverifiedCustomers = this.selection.selected.some((x: CssCustomerVerificationModel) => x.csS_CONFIGURED === 'No' || x.respondenT_MAIL === '' || x.respondenT_MAIL === null);
    if (hasUnverifiedCustomers) {
      this._util.showWarningPopup("Records which have not configured CSS contact are not allowed for verification.", "Validation Error");
      return false;
    }
    return true;
  }

  /**
   * Yes button in confirmation dialog
   */
  onYesClicked() {
    this.confirmationDialogRef.close(true);
  }

  /**
   * No button in confirmation dialog
   */
  onNoClicked() {
    this.confirmationDialogRef.close(false);
  }

  /**
   * Cancel comments dialog
   */
  Cancel_onClick() {
    this.dialog.closeAll();
  }

  /**
   * Cancel confirmation dialog
   */
  Cancel_Confirmation_onClick() {
    this.confirmationDialogRef.close(false);
  }

  /**
   * Get status text for customer verification
   */
  getStatusText(element: CssCustomerVerificationModel): string {
    let status = "";
    if (element == undefined || element == null) return status;

    if (element.customeR_CONTACT_VERIFICATION == 'Yes')
      status = "Approved";
    else if (element.customeR_CONTACT_VERIFICATION == "No" && element.verificatioN_COMMENTS != null && element.verificatioN_COMMENTS.trim() != "")
      status = "Rejected";
    else if (element.customeR_CONTACT_VERIFICATION == "No" && (element.verificatioN_COMMENTS == null || element.verificatioN_COMMENTS.trim() == ""))
      status = "Not Verified";

    return status;
  }
}
