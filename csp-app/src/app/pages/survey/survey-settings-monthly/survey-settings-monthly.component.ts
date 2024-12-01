import { Component, OnInit } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
//import { AppsService } from '../../Services/apps.service';
//import { CssBatchModel } from '../../../models/css-batch-model';
//import { CssBatchCustomersModel, CssBatchCustomersMonthlyExtendedModel } from '../../../models/css-batch-customers-model';
import { MatTableDataSource } from '@angular/material';
import { SurveyService } from '../survey.service';
import { SelectionModel } from '@angular/cdk/collections';
import { CssBatchMonthlyModel } from '../../../models/css-batch-monthly-model';
import { CssBatchCustomerMonthlyExtendedModel } from '../../../models/css-batch-customers-monthly-model';
import { CssbatchPopupComponent } from '../cssbatch-popup/cssbatch-popup.component';
import { MatDialogModule, MatDialog } from '@angular/material';
import { AccessControl } from '../../../Shared/accessControl';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-survey-settings-monthly',
  templateUrl: './survey-settings-monthly.component.html',
  styleUrls: ['./survey-settings-monthly.component.scss']
})
export class SurveySettingsMonthlyComponent implements OnInit {

  //CSMList: CSMList[] = [];
  Batches: CssBatchMonthlyModel[] = [];
  BatchCustomers: CssBatchCustomerMonthlyExtendedModel[] = [];
  selectedBatch: CssBatchMonthlyModel;
  constructor(private dialog: MatDialog, public _util: myUtility, private surveyService: SurveyService,
    public _access: AccessControl, private _router: Router, private route: ActivatedRoute) { }
  batchColumns = ['index', 'starT_DATE', 'enD_DATE', 'status']
  batchCustomersColumns = ['select', 'index', 'cusT_NM', 'displaY_NAME', 'emaiL_ID','contacT_ROLE','revenuE_TYPE', 'status', 'sentdate', 'recddate', 'project', 'proJ_STATUS', 'unit', 'verified', 'comments', 'updatedBy', 'updatedDate', 'edit']
  dataSource = new MatTableDataSource(this.BatchCustomers);
  selection = new SelectionModel<CssBatchCustomerMonthlyExtendedModel>(true, []);
  selectedRow: any;
  isLoading: boolean = false;
  batchCustomerData: CssBatchCustomerMonthlyExtendedModel = new CssBatchCustomerMonthlyExtendedModel();
  //new code changes
  newBatch: CssBatchMonthlyModel;


  ngOnInit() {
    this.LoadDetails();
    this.customerContactsVerification();
    this.dataSource.filterPredicate = this.createFilter();
  }
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

  LoadDetails() {
    this.service_GetCSSMonthlyBatches();
  }

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
            }
            else {
              this.batchCustomerData.comments = prompt("Please enter rejection comments", "");
              if (this.batchCustomerData.comments == "" || this.batchCustomerData.comments == undefined || this.batchCustomerData.comments == null) {
                alert("Please enter comments");
              }
              else {
                this.service_customerContactsVerification(this.batchCustomerData); // Mail reject
              }
            }
          }
          else {
            alert("Sorry! You are not Authorized to do Customer Contacts Verification. You can continue to use this screen.");
          }
        }
      });
    }
  }

  service_customerContactsVerification(batchCustomerData) {
    this.surveyService.updateCustomerContactsVerificationForPremier(batchCustomerData).subscribe(
      (data) => {
        if (batchCustomerData.iS_VERIFIED) {
          alert("Customer Contact details verified");
        }
        else {
          alert("Customer Contact details rejected");
        }
        this.selectedBatch = this.Batches.find(x => x.id == this.batchCustomerData.batcH_MONTHLY_ID);
        this.service_GetCSSBatchCustomersMonthly(batchCustomerData.batcH_MONTHLY_ID);
      },
      (error) => {
        this.selectedBatch = this.Batches.find(x => x.id == this.batchCustomerData.batcH_MONTHLY_ID);
        this.service_GetCSSBatchCustomersMonthly(batchCustomerData.batcH_MONTHLY_ID);
        this._util.serviceError(error);
      }
    );
  }

  openPopup(): void {
    let dialog = this.dialog.open(CssbatchPopupComponent, {
      width: "50%",
      height: "50%",
      data: {
        quarter: false,
        label: "Month"
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result == undefined) {
        return;
      }
      else {
        this.AddCSSBatches(result);
      }
    });
  }
  AddCSSBatches(item) {
    this.surveyService.AddCSSBatchesMonthly(item).subscribe(
      (data) => {
        alert("Data Saved Successfully");

        this.LoadDetails();
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
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


  btnRefresh_onclick() {
  }
  ViewBatch_onClick(element) {
    this.selectedBatch = element;
    this.service_GetCSSBatchCustomersMonthly(element.id);
    this.selectedRow = element;
  }
  isSelectedRow(element) {
    return this.selectedRow === element;
  }

  btnVerification_OnClick() {
    if (this.selection.isEmpty()) {
      alert('Please select customer(s) to send Mail.')
      return;
    }

    const hasUnverifiedCustomers = this.selection.selected.some(x => x.iS_VERIFIED);
    if (hasUnverifiedCustomers) {
      alert("There are some verified customer contacts in the selected list. Please remove those customer contacts before sending Verification mails.");
      return false;
    }
    const checkStatus = this.selection.selected.some(x => x.status != "CREATED");
    if (checkStatus) {
      alert("Verification mails can be triggered only for records which are having CREATED status.");
      return false;
    }

    if (confirm("Are you sure you want to send Mails to selected CSM?")) {
      this.service_SendCSSBatchVerification(this.selectedBatch, this.selection.selected.map((x) => x.id).join(","));
    }
  }
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
  service_ActivateCssLink(batchId: number, selectedIds: string) {
    this.surveyService.UpdateCssLinkValidity(batchId, selectedIds, "batchmonthly").subscribe(
      (data) => {
        this.service_GetCSSBatchCustomersMonthly(batchId);
        alert("Link activated for selected customer(s)");
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    );
  }
  service_SendCSSBatchVerification(batch: CssBatchMonthlyModel, selectedIds: string) {
    this.surveyService.SendCSSBatchVerificationForPremier(batch, selectedIds).subscribe(
      (data) => {
        alert("Mail sent to selected Record(s)");
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    );
  }

  btnTriggerSurvey_OnClick() {
    if (this.selection.isEmpty()) {
      alert('Please select customer(s) to send Mail.')
      return;
    }

    const hasUnverifiedCustomers = this.selection.selected.some(x => !x.iS_VERIFIED);
    if (hasUnverifiedCustomers) {
      alert("There are some unverified customer contacts in the selected list. Please verify all customer contacts with respective CSM before sending the Survey.");
      return false;
    }
    const checkStatus = this.selection.selected.some(x => x.status != "CREATED");
    if (checkStatus) {
      alert("Survey mails can be triggered only for records which are having CREATED status.");
      return false;
    }

    if (confirm("Are you sure you want to send Survey Mails to selected Customers?")) {
      this.service_SendCSSBatchSurveyMailsMonthly(this.selectedBatch, this.selection.selected.map(x => x.id).join(","));
    }
  }
  // btnTriggerReminder_OnClick() {
  //   if (confirm("Are you sure you want to send Survey Reminder Mails to selected Customers?")) {
  //     this.service_SendCSSBatchReminderMails(this.selectedBatch,  this.selection.selected.map(x=>x.id).join(",") );
  //   }
  // }
  btnReGenerateCustomerList_OnClick() {
    if (confirm("Are you sure you want to re-generate the list?")) {
      this.RefreshCSSBatchCustomersMonthly(this.selectedBatch.id);
    }
  }
  btnGenerateMissingContacts() {
    alert("Feature yet to be developed");
    return;
  }
  CopyToClipboard(element) {
    this.copyitem(element.url);
    alert('CSAT link copied to Clipboard.');
  }

  copyitem(item): void {
    let listener = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (item));
      e.preventDefault();
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
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
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  // service_SendCSSBatchVerification(batch: CssBatchMonthlyModel, selectedIds: string) {
  //   this.surveyService.SendCSSBatchVerification(batch, selectedIds).subscribe(data => {
  //     //this.Batches = data;
  //     alert("Mail sent to selected Record(s)");
  //   }, error => { this._util.serviceError(error); });
  // }
  service_SendCSSBatchSurveyMailsMonthly(batch: CssBatchMonthlyModel, selectedIds: string) {
    this.surveyService.SendCSSBatchSurveyMailsMonthly(batch, selectedIds).subscribe(data => {
      alert("Mail sent to selected customer(s)");
    }, error => { this._util.serviceError(error); });
  }

  btnCreateActionItem_OnClick() {
    if (this.selection.isEmpty()) {
      alert('Please select customer(s) to send Mail.')
      return;
    }

    const isProjectMapped = this.selection.selected.some(x => x.proJ_ID == null || x.proJ_ID == undefined);
    if (isProjectMapped) {
      alert("Action items can be created only for project mapped records.");
      return false;
    }
    const checkStatus = this.selection.selected.some(x => x.status != "MAIL SENT");
    if (checkStatus) {
      alert("Action items can be created only for MAIL SENT customers.");
      return false;
    }
    if (confirm("Are you sure you want to create Action Item for selected Customers?")) {
      this.service_CreateActionItem(this.selectedBatch, this.selection.selected.map((x) => x.id).join(","));
    }
  }

  service_CreateActionItem(batch: CssBatchMonthlyModel, selectedIds: string) {
    this.surveyService.CreateActionItemForPremierCSAT(batch.id, selectedIds, "PremierCSAT").subscribe(
      (data) => {
        alert("Action Item created for selected customer(s)");
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    );
  }
  // service_SendCSSBatchReminderMails(batch: CssBatchMonthlyModel, selectedIds: string) {
  //   this.surveyService.SendCSSBatchReminderMails(batch, selectedIds).subscribe(data => {
  //     //this.Batches = data;
  //     alert("Mail sent to selected customer(s)");
  //   }, error => { this._util.serviceError(error); });
  // }
  RefreshCSSBatchCustomersMonthly(batchId: number) {
    this.surveyService.RefreshCSSBatchCustomersMonthly(batchId).subscribe(data => {
      this.BatchCustomers = data;
      this.dataSource = new MatTableDataSource(this.BatchCustomers);
    }, error => { this._util.serviceError(error); });
  }
  service_GetCSSMonthlyBatches() {
    this.surveyService.GetCSSMonthlyBatches().subscribe(data => {
      this.Batches = data;
    }, error => { this._util.serviceError(error); });
  }
  service_GetCSSBatchCustomersMonthly(batchId: number) {
    this.isLoading = true;
    this.surveyService.GetCSSBatchCustomersMonthly(batchId).subscribe(data => {
      this.BatchCustomers = data;
      this.dataSource = new MatTableDataSource(this.BatchCustomers);
      this.isLoading = false;
    }, error => { this.isLoading = false; this._util.serviceError(error); });
  }

  // service_GetCSMList() {
  //   this.surveyService.GetCSMList().subscribe(data => {
  //     this.CSMList = data;
  //   }, error => { this._util.serviceError(error); });
  // }

}
export class CSMList {
  proJ_ID: string;
  csm: string;
}



