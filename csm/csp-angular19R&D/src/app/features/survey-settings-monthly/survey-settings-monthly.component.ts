/**
 * SurveySettingsMonthlyComponent - Monthly CSS Configuration Page
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - Display CSS monthly batches (Premier customers)
 * - View batch customers with verification details
 * - Send verification mails to CSM
 * - Send survey mails to customers
 * - Create action items for non-respondents
 * - Re-generate customer list
 * - Generate missing contacts
 * - Copy CSAT link to clipboard
 * - Export to Excel functionality
 * - Activate/Reactivate CSS links
 * 
 * Migration Notes:
 * - Converted to standalone component
 * - Used inject() pattern for dependency injection
 * - All logic preserved exactly from legacy
 * - All method names unchanged
 * - All styling preserved
 * - Added app-navbar-new component at top
 */

import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

// Material Imports
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SelectionModel } from '@angular/cdk/collections';

// Services and Models
import { MyUtility } from '../../shared/my-utility';
import { SurveyService } from '../../core/services/survey.service';
import { AccessControl } from '../../shared/access-control';
import { CssBatchMonthlyModel } from '../../models/css-batch-monthly-model';
import { CssBatchCustomerMonthlyExtendedModel } from '../../models/css-batch-customers-monthly-model';

// Components
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { CssbatchPopupComponent } from '../../pages/survey/cssbatch-popup/cssbatch-popup.component';

export class CSMList {
  proJ_ID!: string;
  csm!: string;
}

@Component({
  selector: 'app-survey-settings-monthly',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    NavbarNewComponent
  ],
  templateUrl: './survey-settings-monthly.component.html',
  styleUrl: './survey-settings-monthly.component.scss'
})
export class SurveySettingsMonthlyComponent implements OnInit {
  // Dependency Injection
  private dialog = inject(MatDialog);
  public _util = inject(MyUtility);
  private surveyService = inject(SurveyService);
  public _access = inject(AccessControl);
  private _router = inject(Router);
  private route = inject(ActivatedRoute);

  // ViewChild References
  @ViewChild('tableToExport', { read: ElementRef }) table!: ElementRef;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paginatorTable') paginator!: MatPaginator;

  // Component Properties
  CSMList: CSMList[] = [];
  Batches: CssBatchMonthlyModel[] = [];
  BatchCustomers: CssBatchCustomerMonthlyExtendedModel[] = [];
  selectedBatch!: CssBatchMonthlyModel;
  FinalTabData: any[] = [];
  progress: boolean = false;

  // Table Columns
  batchColumns = ['index', 'starT_DATE', 'enD_DATE', 'status', 'totaL_RECORDS', 'pending', 'verified', 'rejected', 'surveY_SENT', 'surveY_RECD'];
  batchCustomersColumns = ['select', 'index', 'BUSINESS_UNIT', 'cusT_NM', 'displaY_NAME', 'emaiL_ID', 'contacT_ROLE', 'revenuE_TYPE', 'status', 'sentdate', 'recddate', 'CSMList', 'project', 'proJ_STATUS', 'unit', 'verified', 'comments', 'updatedBy', 'updatedDate', 'edit'];

  // Table Data and Selection
  dataSource = new MatTableDataSource(this.BatchCustomers);
  selection = new SelectionModel<CssBatchCustomerMonthlyExtendedModel>(true, []);
  selectedRow: any;

  // State Flags
  isLoading: boolean = false;

  // Dialog Data
  batchCustomerData: CssBatchCustomerMonthlyExtendedModel = new CssBatchCustomerMonthlyExtendedModel();
  newBatch!: CssBatchMonthlyModel;

  ngOnInit() {
    this.LoadDetails();
    this.customerContactsVerification();
    this.dataSource.filterPredicate = this.createFilter();
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
          (data.BUSINESS_UNIT && data.BUSINESS_UNIT.toLowerCase().includes(term)) ||
          (data.displaY_NAME && data.displaY_NAME.toLowerCase().includes(term)) ||
          (data.emaiL_ID && data.emaiL_ID.toLowerCase().includes(term)) ||
          (data.status && data.status.toLowerCase().includes(term)) ||
          (data.proJ_NM && data.proJ_NM.toLowerCase().includes(term)) ||
          (data.proD_NM && data.proD_NM.toLowerCase().includes(term)) ||
          (data.proJ_STATUS && data.proJ_STATUS.toLowerCase().includes(term)) ||
          (data.comments && data.comments.toLowerCase().includes(term)) ||
          (data.approver && data.approver.toLowerCase().includes(term)) ||
          (data.contractinG_UNIT && data.contractinG_UNIT.toLowerCase().includes(term)) ||
          (!data.iS_VERIFIED && data.comments != null && data.comments.trim() != "" ? "Rejected" : "Not Verified").toLowerCase().includes(term) ||
          ((data.iS_VERIFIED ? "Approved" : "Not Verified").toLowerCase().includes(term))
        );
      });
    };

    return filterFunction;
  }

  /**
   * Load batch details and CSM list
   */
  LoadDetails() {
    this.service_GetCSSMonthlyBatches();
    this.service_GetCSMList();
  }

  /**
   * Handle customer contacts verification from route params
   */
  customerContactsVerification() {
    if (this.route.snapshot.url.toString().startsWith("cssmonthly")) {
      this.route.params.subscribe(params => {
        this.batchCustomerData.batcH_MONTHLY_ID = params['batchid'];
        this.batchCustomerData.id = params['recordid'];
        this.batchCustomerData.iS_VERIFIED = params['isApproveReject'] == "1" ? true : false;

        if (params['isApproveReject'] != null && params['isApproveReject'] != undefined) {
          if (this._access.IsAllowed(115, 1, '', '')) {
            if (params['isApproveReject'] == 1) {
              this.service_customerContactsVerification(this.batchCustomerData); // Mail Approval
            } else {
              this._util.showInputDialog(
                'Please provide comments for rejection',
                'Rejection Comments',
                '',
                'Comments',
                'Enter rejection comments...'
              ).subscribe((rejectionComments: string | null) => {
                if (!rejectionComments || !rejectionComments.trim()) {
                  this._util.showWarningPopup("Please enter comments");
                } else {
                  this.batchCustomerData.comments = rejectionComments.trim();
                  this.service_customerContactsVerification(this.batchCustomerData); // Mail reject
                }
              });
            }
          } else {
            alert("Sorry! You are not Authorized to do Customer Contacts Verification. You can continue to use this screen.");
          }
        }
      });
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
      alert("No records!");
      this.progress = false;
    }
  }

  /**
   * Service call for customer contacts verification
   */
  service_customerContactsVerification(batchCustomerData: CssBatchCustomerMonthlyExtendedModel) {
    this.surveyService.updateCustomerContactsVerificationForPremier(batchCustomerData).subscribe({
      next: (data) => {
        if (batchCustomerData.iS_VERIFIED) {
          alert("Customer Contact details verified");
        } else {
          alert("Customer Contact details rejected");
        }
        this.selectedBatch = this.Batches.find(x => x.id == this.batchCustomerData.batcH_MONTHLY_ID)!;
        this.service_GetCSSBatchCustomersMonthly(batchCustomerData.batcH_MONTHLY_ID);
      },
      error: (error) => {
        this.selectedBatch = this.Batches.find(x => x.id == this.batchCustomerData.batcH_MONTHLY_ID)!;
        this.service_GetCSSBatchCustomersMonthly(batchCustomerData.batcH_MONTHLY_ID);
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Open popup to add new batch
   */
  openPopup(): void {
    let dialogRef = this.dialog.open(CssbatchPopupComponent, {
      width: "50%",
      height: "50%",
      data: {
        quarter: false,
        label: "Month"
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == undefined) {
        return;
      } else {
        this.AddCSSBatches(result);
      }
    });
  }

  /**
   * Add CSS batch
   */
  AddCSSBatches(item: any) {
    this.surveyService.AddCSSBatchesMonthly(item).subscribe({
      next: (data) => {
        alert("Data Saved Successfully");
        this.LoadDetails();
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
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
   * Get CSM for a project
   */
  GetCSM(projId: string) {
    if (!projId) {
      return "";
    }
    let lst: CSMList[] = this.CSMList.filter((t) => t.proJ_ID === projId);
    if (lst.length > 0) {
      return lst[0].csm;
    } else {
      return "-";
    }
  }

  /**
   * Refresh button click handler
   */
  btnRefresh_onclick() {
    // Placeholder for refresh logic
  }

  /**
   * View batch details on click
   */
  ViewBatch_onClick(element: CssBatchMonthlyModel) {
    this.selectedBatch = element;
    this.service_GetCSSBatchCustomersMonthly(element.id);
    this.selectedRow = element;
  }

  /**
   * Check if row is selected
   */
  isSelectedRow(element: any) {
    return this.selectedRow === element;
  }

  /**
   * Send verification mail to CSM
   */
  btnVerification_OnClick() {
    if (this.selection.isEmpty()) {
      alert('Please select customer(s) to send Mail.')
      return;
    }

    const hasUnverifiedCustomers = this.selection.selected.some(x => x.iS_VERIFIED);
    if (hasUnverifiedCustomers) {
      alert("There are some verified customer contacts in the selected list. Please remove those customer contacts before sending Verification mails.");
      return;
    }
    const checkStatus = this.selection.selected.some(x => x.status != "CREATED");
    if (checkStatus) {
      alert("Verification mails can be triggered only for records which are having CREATED status.");
      return;
    }

    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to send Mails to selected CSM?',
      'Send Verification Mails'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.service_SendCSSBatchVerification(this.selectedBatch, this.selection.selected.map((x) => x.id).join(","));
      }
    });
  }

  /**
   * Reactivate CSS link
   */
  btnReactivateLink() {
    if (this.selection.isEmpty()) {
      alert('Please select customer(s) to proceed.')
      return;
    }
    const invalidStatus = this.selection.selected.some(item => !["MAIL SENT", "MAIL RE-SENT"].includes(item.status));
    if (invalidStatus) {
      alert("Please select customer(s) with Mail sent or Mail Re-sent Status");
      return;
    }
    if (this.selection.selected.map((x) => x.id))
      this.service_ActivateCssLink(this.selectedBatch.id, this.selection.selected.map((x) => x.id).join(","));
  }

  /**
   * Service call to activate CSS link
   */
  service_ActivateCssLink(batchId: number, selectedIds: string) {
    this.surveyService.UpdateCssLinkValidity(batchId, selectedIds, "batchmonthly").subscribe({
      next: (data) => {
        this.service_GetCSSBatchCustomersMonthly(batchId);
        alert("Link activated for selected customer(s)");
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Service call to send verification mail
   */
  service_SendCSSBatchVerification(batch: CssBatchMonthlyModel, selectedIds: string) {
    this.surveyService.SendCSSBatchVerificationForPremier(batch, selectedIds).subscribe({
      next: (data) => {
        alert("Mail sent to selected Record(s)");
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Trigger survey mail to customers
   */
  btnTriggerSurvey_OnClick() {
    if (this.selection.isEmpty()) {
      alert('Please select customer(s) to send Mail.')
      return;
    }

    const hasUnverifiedCustomers = this.selection.selected.some(x => !x.iS_VERIFIED);
    if (hasUnverifiedCustomers) {
      alert("There are some unverified customer contacts in the selected list. Please verify all customer contacts with respective CSM before sending the Survey.");
      return;
    }
    const checkStatus = this.selection.selected.some(x => x.status != "CREATED");
    if (checkStatus) {
      alert("Survey mails can be triggered only for records which are having CREATED status.");
      return;
    }

    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to send Survey Mails to selected Customers?',
      'Send Survey Mails'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.service_SendCSSBatchSurveyMailsMonthly(this.selectedBatch, this.selection.selected.map(x => x.id).join(","));
      }
    });
  }

  /**
   * Re-generate customer list
   */
  btnReGenerateCustomerList_OnClick() {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to re-generate the list?',
      'Re-generate List'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.RefreshCSSBatchCustomersMonthly(this.selectedBatch.id);
      }
    });
  }

  /**
   * Generate missing contacts
   */
  btnGenerateMissingContacts() {
    if (this.selectedBatch != undefined && this.selectedBatch != null &&
      this.selectedBatch.id != undefined && this.selectedBatch.id != null) {

      const dialogRef = this._util.showWarningConfirmation(
        'Are you sure you want to generate missing contacts?',
        'Generate Missing Contacts'
      );
      
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          this.service_GenerateMissingCustomerContacts(this.selectedBatch.id);
        }
      });
    }
  }

  /**
   * Service call to generate missing contacts
   */
  service_GenerateMissingCustomerContacts(batchId: number) {
    this.surveyService.GenerateMissingCustomerContactsPremier(batchId).subscribe({
      next: (data) => {
        this.service_GetCSSBatchCustomersMonthly(batchId);
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Copy CSAT link to clipboard
   */
  CopyToClipboard(element: any) {
    this.copyitem(element.url);
    alert('CSAT link copied to Clipboard.');
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
   * Get status text for customer verification
   */
  getStatusText(element: CssBatchCustomerMonthlyExtendedModel): string {
    let status = "";
    if (element.iS_VERIFIED)
      status = "Approved";
    else if (element.iS_VERIFIED == false && element.comments != null && element.comments.trim() != "")
      status = "Rejected";
    else if (element.iS_VERIFIED == false && (element.comments == null || element.comments.trim()))
      status = "Not Verified";

    return status;
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
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /**
   * Service call to send survey mails
   */
  service_SendCSSBatchSurveyMailsMonthly(batch: CssBatchMonthlyModel, selectedIds: string) {
    this.surveyService.SendCSSBatchSurveyMailsMonthly(batch, selectedIds).subscribe({
      next: (data) => {
        alert("Mail sent to selected customer(s)");
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Create action item for non-respondents
   */
  btnCreateActionItem_OnClick() {
    if (this.selection.isEmpty()) {
      alert('Please select customer(s) to send Mail.')
      return;
    }

    const isProjectMapped = this.selection.selected.some(x => x.proJ_ID == null || x.proJ_ID == undefined);
    if (isProjectMapped) {
      alert("Action items can be created only for project mapped records.");
      return;
    }
    const checkStatus = this.selection.selected.some(x => x.status != "MAIL SENT");
    if (checkStatus) {
      alert("Action items can be created only for MAIL SENT customers.");
      return;
    }
    
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to create Action Item for selected Customers?',
      'Create Action Item'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.service_CreateActionItem(this.selectedBatch, this.selection.selected.map((x) => x.id).join(","));
      }
    });
  }

  /**
   * Service call to create action item
   */
  service_CreateActionItem(batch: CssBatchMonthlyModel, selectedIds: string) {
    this.surveyService.CreateActionItemForPremierCSAT(batch.id, selectedIds, "PremierCSAT").subscribe({
      next: (data) => {
        alert("Action Item created for selected customer(s)");
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Refresh CSS batch customers
   */
  RefreshCSSBatchCustomersMonthly(batchId: number) {
    this.surveyService.RefreshCSSBatchCustomersMonthly(batchId).subscribe({
      next: (data) => {
        this.BatchCustomers = data;
        this.dataSource = new MatTableDataSource(this.BatchCustomers);
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get CSS Monthly Batches
   */
  service_GetCSSMonthlyBatches() {
    this.surveyService.GetCSSMonthlyBatches().subscribe({
      next: (data) => {
        this.Batches = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get CSS Batch Customers Monthly
   */
  service_GetCSSBatchCustomersMonthly(batchId: number) {
    this.isLoading = true;
    this.surveyService.GetCSSBatchCustomersMonthly(batchId).subscribe({
      next: (data) => {
        this.BatchCustomers = data;
        this.dataSource = new MatTableDataSource(this.BatchCustomers);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get CSM List
   */
  service_GetCSMList() {
    this.surveyService.GetCSMList().subscribe({
      next: (data) => {
        this.CSMList = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }
}
