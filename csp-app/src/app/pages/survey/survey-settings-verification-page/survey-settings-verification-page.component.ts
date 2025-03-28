import { Component, OnInit, TemplateRef, ViewChild,ElementRef } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../survey.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSort, MatTableDataSource,MatPaginator } from '@angular/material';
import { CssBatchMonthlyModel } from '../../../models/css-batch-monthly-model';
import { CssCustomerVerificationModel } from '../../../models/css-customer-verification-model';
import { AccessControl } from '../../../Shared/accessControl';

import { CssBatchModel } from '../../../models/css-batch-model';

@Component({
  selector: 'app-survey-settings-verification-page',
  templateUrl: './survey-settings-verification-page.component.html',
  styleUrls: ['./survey-settings-verification-page.component.scss']
})
export class SurveySettingsVerificationPageComponent implements OnInit {
  mobileQuery: MediaQueryList;
  FinalTabData: any[];
  progress: boolean = false;
  @ViewChild('tableToExport', { read: ElementRef }) table: ElementRef;
  @ViewChild('paginatorTable') paginator: MatPaginator;
  private _mobileQueryListener: () => void;
  constructor(public _util: myUtility, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private dialog: MatDialog, private surveyService: SurveyService,
    public _access: AccessControl, private _router: Router, private route: ActivatedRoute) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  @ViewChild('commentsDialog') commentsDialog: TemplateRef<any>;
  @ViewChild('confirmationDialog') confirmationDialog: TemplateRef<any>;

  private rejectComment: any;
  ngOnInit() {
    this.service_GetCSSMonthlyBatches();
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  logout() {
    if (confirm("Are you sure you want to log out?")) {
      if (this._util.IsGAVS()) {
        this.service_Logout();
        let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
        window.location.href = loginurl;
      }
      else {
        this.service_Logout();
        this._router.navigateByUrl('/login');
      }
    }
  }

  service_Logout() {
    this.surveyService.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }


  //CSMList: CSMList[] = [];
  Batches: CssBatchModel[] = [];
  BatchCustomers: CssCustomerVerificationModel[] = [];
  selectedBatch: CssBatchModel;
  startDate: any;
  endDate: any;
  batchColumns = ['index', 'starT_DATE', 'enD_DATE', 'status', "totaL_RECORDS", "pending", "verified", "rejected", "surveY_SENT", "surveY_RECD"]
  batchCustomersColumns = ['select', 'index', 'CUST_NM', 'PROJ_NM', 'CSS_Eligible', 'REASON', 'HEAD_COUNT', 'CSS_CONFIGURED', 'CUSTOMER_CONTACT_VERIFICATION', 'VERIFICATION_COMMENTS', 'VERIFIED_BY', 'APPROVAL_DATE', 'RESPONDENT_NAME', 'RESPONDENT_MAIL', 'ROLE', 'ROLETYPE', 'PROJ_STATUS', 'PROJECT_TYPE', 'BUSINESS_UNIT', 'DEPARTMENT', 'PROJECT_GROUP', 'CONTRACTING_UNIT', 'REVENUE_TYPE', 'COUNTRY', 'METHODOLOGY', 'TYPE_OF_ACCOUNT', 'ACCOUNT_OWNER', 'PM', 'PM_MAIL_ID', 'QUALITY_SPOC', 'SKIP_CSAT', 'SKIP_CSAT_COMMENTS', 'contactS_LINK', 'skiP_CSAT_LINK']
  dataSource = new MatTableDataSource(this.BatchCustomers);
  selection = new SelectionModel<CssCustomerVerificationModel>(true, []);
  selectedRow: any;
  isLoading: boolean = false;
  isVerificationInProgress: boolean = false;
  batchCustomerData: CssCustomerVerificationModel = new CssCustomerVerificationModel();
  //new code changes
  newBatch: CssBatchModel;
  confirmationMessage: string;
  confirmationDialogRef;

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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;
    if (filterValue) {
      this.dataSource.filterPredicate = (data, filter: string) =>
        this.createFilter()(data, filter);
    } else {
      this.dataSource.filterPredicate = this.createFilter();
    }
  }

  ViewBatch_onClick(element) {
    this.selectedBatch = element;
    this.startDate = element.starT_DATE;
    this.endDate = element.enD_DATE;
    this.service_GetCSSVerificationDetails(element.starT_DATE, element.enD_DATE, 0);
    this.selectedRow = element;
  }

  isSelectedRow(element) {
    return this.selectedRow === element;
  }

  CopyToClipboard(element) {
    this.copyitem(element.url);
    alert('CSAT link copied to Clipboard.');
  }

  copyitem(item): void {
    let listener = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', (item));
      }
      e.preventDefault();
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
  }

  openInNewTabCL(url) {
    this.openInNewTab(url.contactS_LINK);
  }
  openInNewTabSC(element) {
    this.openInNewTab(element.skiP_CSAT_LINK);
  }

  openInNewTab(url) {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.focus();
    }
  }

  UpdateTable() {
    this.dataSource = new MatTableDataSource(this.FinalTabData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

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
        alert("No records!");
        this.progress = false;
      }
    }




  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.filteredData.forEach(row => this.selection.select(row));
  }

  service_GetCSSMonthlyBatches() {
    this.surveyService.GetCSSBatches(localStorage.getItem("empid")).subscribe(data => {
      this.Batches = data.filter(x => x.frequency == 'Quarterly');

    }, error => { this._util.serviceError(error); });
  }
  service_GetCSSVerificationDetails(starT_DATE: Date, enD_DATE: Date, custId: any) {

    this.isLoading = true;
    this.surveyService.GetCSSCustomerVerifications(starT_DATE, enD_DATE, custId).subscribe(data => {
      this.BatchCustomers = data;
      this.dataSource = new MatTableDataSource(this.BatchCustomers);
      this.isLoading = false;
      this.selection.clear();
      this.selectedBatch.totaL_RECORDS = this.BatchCustomers.length;
      this.selectedBatch.pending = this.BatchCustomers.filter(x => x.customeR_CONTACT_VERIFICATION === 'No' && (x.verificatioN_COMMENTS == null || x.verificatioN_COMMENTS =='')).length;
      if (this.BatchCustomers.some(x => x.csS_Eligible == 'Yes' && (x.respondenT_NAME == null || x.respondenT_MAIL == ''))) {
        alert("There are CSS eligible projects in this list but customers are not configured. Please configure the contact details for the CSS eligible projects. If you want to skip an eligible project, please follow SKIP CSAT process by clicking on SKIP CSAT link to take approval.");
      };

    }, error => { this.isLoading = false; this._util.serviceError(error); });
  }

  ApproveOnClick() {
    if (this.validateApprove()) {
      this.confirmationMessage = 'Are you sure want to approve the selected customer contact(s)? Please note if you have selected already Rejected contacts then those will be Verified too.';
      const confirmationDialogConfig = new MatDialogConfig();
      confirmationDialogConfig.autoFocus = true;
      confirmationDialogConfig.width = '32%';
      confirmationDialogConfig.height = '25%';
      confirmationDialogConfig.panelClass = 'panelClass';
      this.confirmationDialogRef = this.dialog.open(this.confirmationDialog, confirmationDialogConfig);

      this.confirmationDialogRef.afterClosed().subscribe(result => {
        if (result) {


          this.updateCSSVerification(true, '');

        }
      });
    }
  }

  RejectOnClick() {
    if (this.validateReject()) {
      this.confirmationMessage = 'Are you sure want to reject the selected customer contact(s)? Please note if you have selected already verified contacts then those will be rejected too.';
      const confirmationDialogConfig = new MatDialogConfig();
      confirmationDialogConfig.autoFocus = true;
      confirmationDialogConfig.width = '30%';
      confirmationDialogConfig.height = '25%';
      confirmationDialogConfig.panelClass = 'panelClass';

      this.confirmationDialogRef = this.dialog.open(this.confirmationDialog, confirmationDialogConfig);
      this.confirmationDialogRef.afterClosed().subscribe(result => {
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

  rejectSelectedCustomerVerifications(): void {
    this.dialog.closeAll();

    this.updateCSSVerification(false, this.rejectComment);
  }

  updateCSSVerification(csmAction: boolean, rejectComment: string) {
    this.isLoading = true;
    this.isVerificationInProgress = true;
    var premierCount = this.selection.selected.filter(x => this._util.IsPremier(x.cusT_ID)).length;
    if (premierCount == this.selection.selected.length) {

      //call premier
      this.surveyService.UpdateCustomerContactsVerificationListPremier(this.selection.selected, csmAction, rejectComment).subscribe(data => {
        this.isLoading = false;
        this.isVerificationInProgress = false;
        if (csmAction)
          alert("Selected customer contact(s) are Approved.");

        else
          alert("Selected customer contact(s) are Rejected.");
        this.service_GetCSSVerificationDetails(this.startDate, this.endDate, 0);
      }, error => { this.isLoading = false; this._util.serviceError(error); this.isVerificationInProgress = false; });
    }
    else if (premierCount == 0) {

      this.surveyService.UpdateCustomerContactsVerificationList(this.selection.selected, csmAction, rejectComment).subscribe(data => {
        this.isLoading = false;
        this.isVerificationInProgress = false;
        if (csmAction)
          alert("Selected customer contact(s) are Approved.");

        else
          alert("Selected customer contact(s) are Rejected.");
        this.service_GetCSSVerificationDetails(this.startDate, this.endDate, 0);
      }, error => { this.isLoading = false; this._util.serviceError(error); this.isVerificationInProgress = false; });
    }
    else {
      alert("You are not allowed to update both Premier and Non-Premier customers at the same time.");
      this.isLoading = false;
      this.isVerificationInProgress = false;
    }

  }

  validateApprove() {
    if (this.validateCSSConfigureAndEmail()) {
      return true;
      const hasUnverifiedCustomers = this.selection.selected.some(x => x.customeR_CONTACT_VERIFICATION === 'Yes');
      if (hasUnverifiedCustomers) {
        alert("There are some verified customer contacts in the selected list. Please remove those customer contacts before verification.");
        return false;
      }
      return true;
    }
    else return false;
  }

  validateReject() {
    if (this.validateCSSConfigureAndEmail()) {
      return true;
      const hasVerifiedRejectedCustomers = this.selection.selected.some(x => x.customeR_CONTACT_VERIFICATION === 'No' && x.verificatioN_COMMENTS !== null);
      if (hasVerifiedRejectedCustomers) {

        alert("There are some rejected customer contacts in the selected list. Please remove those customer contacts before verification.");
        return false;
      }
      const hasApprovedCustomers = this.selection.selected.some(x => x.customeR_CONTACT_VERIFICATION === 'Yes');
      if (hasApprovedCustomers) {
        alert("There are verified customer contacts in the selected list. Please remove those customer contacts before verification.");
        return false;
      }
      return true;
    }
    else return false;
  }

  validateCSSConfigureAndEmail() {
    const hasUnverifiedCustomers = this.selection.selected.some(x => x.csS_CONFIGURED === 'No' || x.respondenT_MAIL === '' || x.respondenT_MAIL === null);
    if (hasUnverifiedCustomers) {

      alert("Records which have not configured CSS contact are not allowed for verification.");
      return false;
    }
    return true;
  }

  onYesClicked() {
    this.confirmationDialogRef.close(true);
  }

  onNoClicked() {
    this.confirmationDialogRef.close(false);
  }


  Cancel_onClick() {
    this.dialog.closeAll();
  }
  Cancel_Confirmation_onClick() {
    this.confirmationDialogRef.close(false);
  }

  getStatusText(element: CssCustomerVerificationModel): string {
    let status = "";
    if (element == undefined || element == null) return status;

    if (element.customeR_CONTACT_VERIFICATION == 'Yes')
      status = "Approved";
    else if (element.customeR_CONTACT_VERIFICATION == "No" && element.verificatioN_COMMENTS != null && element.verificatioN_COMMENTS.trim() != "")
      status = "Rejected";
    else if (element.customeR_CONTACT_VERIFICATION == "No" && (element.verificatioN_COMMENTS == null || element.verificatioN_COMMENTS.trim()))
      status = "Not Verified";


    return status;
  }
}
