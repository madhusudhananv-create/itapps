import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { AuditFindingStage } from '../../../models/audit-finding-stage';

/**
 * KPI Action Plan (CAPA) Dialog Component
 * Manages Corrective and Preventive Actions (CAPA) for KPIs that don't meet targets
 * 
 * Features:
 * - Multi-step workflow for CAPA submission, review, implementation, and verification
 * - Root cause analysis and corrective action planning
 * - Customer approval workflow
 * - Status tracking for each stage
 * 
 * Migration Status: ✅ Basic structure migrated
 * Note: This is a large complex component (735 lines). Full migration requires:
 * - Complete models for AuditFindingStage, AuditFindingCapaExt, etc.
 * - All API methods in AppsService
 * - Complete HTML template (558 lines)
 * 
 * Current implementation provides basic dialog structure.
 */
@Component({
  selector: 'app-kpi-action-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatRadioModule,
    MatProgressBarModule
  ],
  templateUrl: './kpi-action-plan.component.html',
  styleUrls: ['./kpi-action-plan.component.scss']
})
export class KpiActionPlanComponent implements OnInit {
  // Root cause and CAPA data
  causeCollection: any[] = [];
  rootCauseIds: number[] = [];
  serviceLevelMetric: string = '';
  productId: string = '';
  findingStatus: AuditFindingStage = new AuditFindingStage();
  auditFindingCappa: any[] = [];
  kpiDetailsId: number = 0;

  // UI control flags
  disabletillSaveImplement: boolean = false;
  disabletillreviewSave: boolean = false;
  submitcap: boolean = false;
  step: number = 1;
  issubmit: boolean = false;
  isDraft: boolean = false;
  isCheck: boolean = false;
  rejectImp: boolean = false;
  isCheckImp: boolean = false;
  isCheckVeri: boolean = false;
  isapprovebutton: boolean = false;
  isimplementbutton: boolean = false;
  iscapametricview: boolean = false;
  iscapsubmitbutton: boolean = false;
  iscapreviewbutton: boolean = false;
  isverficationbutton: boolean = false;
  iscapcustomerapprovebutton: boolean = false;
  disablesubmittillSave: boolean = false;
  disableTillSaveVerification: boolean = false;
  disableTillCustomerApprovalSave: boolean = false;
  flag: boolean = false;

  // Data arrays
  empInfo: any[] = [];
  portfolioprodMap: any[] = [];
  capaCustomerApprovalStatusList: any[] = [];
  isenablereviewbutton: any[] = [];
  kpiData: any[] = [];
  SelectedValue: any[] = [];
  SelectedValueImp: any[] = [];
  SelectedValueVerification: any[] = [];

  // Product and KPI info
  product: string = '';
  expectedLevel: string = '';
  minimumLevel: string = '';
  kpiActual: string = '';
  slaStatus: string = '';
  custId: string = '';
  
  // Access control
  isEditAccessDisabled: boolean = true;
  selectedPeriod: Date = new Date();
  minDate: Date = new Date();
  isNonPremier: boolean = false;

  constructor(
    private dialog: MatDialogRef<KpiActionPlanComponent>,
    private _appservice: AppsService,
    private _util: MyUtility,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _access: AccessControl
  ) {
    // Check edit access permission (Feature ID: 81, Permission: 3)
    if (this._access.IsAllowed(81, 3, '', '')) {
      this.isEditAccessDisabled = false;
    }
  }

  ngOnInit() {
    const empId = localStorage.getItem('empid');
    const capaMetricView = localStorage.getItem('iscapametricview');
    
    if (capaMetricView != null) {
      this.iscapametricview = JSON.parse(capaMetricView);
    }
    localStorage.removeItem('iscapametricview');

    this.getCauses();
    this.findingStatus = new AuditFindingStage();

    if (this.data != null && this.data.editedRow.producT_ID != null) {
      // Premier product-based KPI
      this.isNonPremier = false;
      this.serviceLevelMetric = this.data.editedRow.servicE_LEVEL_METRICS;
      this.minimumLevel = this.data.editedRow.minimuM_SERVICE_LEVEL;
      this.expectedLevel = this.data.editedRow.expecteD_SERVICE_LEVEL;
      this.isDraft = this.data.editedRow.iS_DRAFT;
      this.custId = this.data.customerId;
      
      const sladata = this.getSLAStatus_KPIActual(this.data.editedRow);
      this.kpiActual = sladata.kpI_ACTUAL;
      this.slaStatus = sladata.slA_STATUS;
      this.findingStatus = this.data.editedRow.capaStage;
      this.selectedPeriod = this.data.selectedPeriod;
      
      this.FillSelectedCauses();
      this.disableCAPSubmitButton();
      this.disableCAPReviewButton();
      this.disableImplementButtonInReview();
      this.disableVerificationButton();
      this.disableCAPCustomerApproveButton();
      this.getProductManagerForProduct();
      this.getProductList();
      this.getCustomerCAPAApprovalStatus();
      this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
      this.minDate = this._util.setLocaleDate(this._util.Today());
    } else {
      // Non-premier project-based KPI
      this.isNonPremier = true;
      this.isDraft = this.data.editedRow.isdraft;
      this.kpiActual = this.data.editedRow.kpI_ACTUAL;
      this.slaStatus = 'Not Met';
      this.kpiData = this.data.kpiData[0];
      this.findingStatus = this.data.editedRow.capaStage;
      this.selectedPeriod = this.data.selectedPeriod;
      this.data.editedRow.detaiL_ID = this.data.editedRow.id;
      
      this.FillSelectedCauses();
      this.disableCAPSubmitButton();
      this.disableCAPReviewButton();
      this.disableImplementButtonInReview();
      this.disableVerificationButton();
      this.disableCAPCustomerApproveButton();
      this.getProjResource();
      this.getCustomerCAPAApprovalStatus();
      this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
      this.minDate = this._util.setLocaleDate(this._util.Today());
    }
  }

  onClose() {
    this.dialog.close({ data: this.findingStatus });
    localStorage.removeItem('iscapametricview');
  }

  getCauses() {
    this._appservice.getAuditCauses().subscribe(
      (data: any) => {
        if (data && Array.isArray(data)) {
          // API returns array of { id, causes } objects
          this.causeCollection = data;
        } else {
          this.causeCollection = [];
        }
      },
      (error: any) => {
        console.error('Error loading root causes:', error);
        this.causeCollection = [];
        this._util.serviceError(error);
      }
    );
    // this._appservice.getAuditCauses().subscribe(
    //   (data: any) => {
    //     this.causeCollection = data;
    //   },
    //   (error: any) => { this._util.serviceError(error); }
    // );
  }

  getSelectedVal() {
    this._appservice.getAuditFindingsCappa(this.findingStatus, this.rootCauseIds, 0).subscribe(
      (data: any) => {
        this.auditFindingCappa = data;
        this.findingStatus.capA_SUBMISSION.capa = this.auditFindingCappa;
        
        if (this.data != null && this.data.editedRow.producT_ID != null) {
          this.getProductManagerForProduct();
        } else {
          this.getProjResource();
        }
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  getRootCauseVal(st: boolean): string {
    return st ? "Yes" : "No";
  }

  getEmployeeName(empid: any): string {
    let element: any;
    
    if (this.empInfo != undefined && this.empInfo.length > 0 && empid != undefined && this.data.editedRow.producT_ID != null) {
      element = this.empInfo.find((x: any) => x.responsiblE_EMP_ID == empid);
    } else {
      element = this.empInfo.find((x: any) => x.emP_ID == empid);
    }
    
    if (element != undefined && this.data.editedRow.producT_ID != null)
      return element.responsiblE_NAME;
    else if (element != undefined && this.data.editedRow.producT_ID == null)
      return element.frsT_NM;
    else
      return "";
  }

  getSLAStatus_KPIActual(editedRow: any): any {
    console.warn('getSLAStatus_KPIActual: Implementation needed');
    return { kpI_ACTUAL: editedRow.kpI_ACTUAL, slA_STATUS: editedRow.slA_STATUS };
  }

  FillSelectedCauses() {
    this.rootCauseIds = [];

    this.findingStatus?.capA_SUBMISSION?.capa?.forEach((element: any) => {
      this.rootCauseIds.push(element.causE_ID);
    });
  }

  disableCAPSubmitButton() {
    if (!this.findingStatus)
      return;

    if ((this.findingStatus?.capA_SUBMISSION?.capa?.length || 0) == 0)
      this.iscapsubmitbutton = false;
    else
      this.iscapsubmitbutton = !this.findingStatus.capA_SUBMISSION.capa.some((x: any) => !x.cappalist.issubmitted);
  }

  disableCAPReviewButton() {
    if (this.findingStatus != undefined) {
      if ((this.findingStatus?.capA_REVIEW?.capa?.length || 0) == 0)
        this.iscapreviewbutton = false;
      else {
        for (let element of this.findingStatus.capA_REVIEW.capa) {
          if (!element.issubmitted) {
            this.iscapreviewbutton = false;
            break;
          }
          else
            this.iscapreviewbutton = true;
        }
      }
    }
    this.disabletillreviewSave = false;
  }

  disableImplementButtonInReview() {
    if (this.findingStatus != undefined) {
      if ((this.findingStatus?.caP_IMPLEMENTATION?.capa?.length || 0) == 0)
        this.isimplementbutton = false;
      else {
        for (let element of this.findingStatus.caP_IMPLEMENTATION.capa) {
          if (!element.isimplemented) {
            this.isimplementbutton = false;
            break;
          }
          else
            this.isimplementbutton = true;
        }
      }
    }
  }

  disableVerificationButton() {
    if (this.findingStatus != undefined) {
      if ((this.findingStatus?.caP_VERIFICATION?.capa?.length || 0) == 0)
        this.isverficationbutton = false;
      else {
        for (let element of this.findingStatus.caP_VERIFICATION.capa) {
          if (!element.isverified) {
            this.isverficationbutton = false;
            break;
          }
          else
            this.isverficationbutton = true;
        }
      }
    }
  }

  disableCAPCustomerApproveButton() {
    if (this.findingStatus != undefined) {
      if ((this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0) == 0)
        this.iscapcustomerapprovebutton = false;
      else {
        for (let element of this.findingStatus.capA_CUSTOMER_APPROVAL.capa) {
          if (element.statuS_ID == 1) {
            this.iscapcustomerapprovebutton = false;
            break;
          }
          else
            this.iscapcustomerapprovebutton = true;
        }
      }
    }
    this.disableTillCustomerApprovalSave = false;
  }

  getProductManagerForProduct() {
    this.productId = this.data.editedRow.producT_ID;
    this._appservice.getProductManagerByProductId(this.productId).subscribe(
      (data: any) => {
        this.empInfo = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  getProductList() {
    this._appservice.getProductName(this.data.editedRow.producT_ID).subscribe(
      (data: any) => {
        this.product = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  getCustomerCAPAApprovalStatus() {
    this._appservice.getCustomerCAPAApprovalStatus().subscribe(
      (data: any) => {
        this.capaCustomerApprovalStatusList = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  getProjResource() {
    let p = this.data.kpiData.filter((x: any) => x.projecT_ID != null)[0].projecT_ID;
    this._appservice.getProjectResourceByProjId(p).subscribe(
      (data: any) => {
        this.empInfo = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  IsCAPAApprovalAllowed() {
    this.productId = this.data.editedRow.producT_ID;
    this.kpiDetailsId = this.data.editedRow.detaiL_ID;
    this._appservice.IsCAPAApprovalAllowed(this.productId, this.selectedPeriod, this.kpiDetailsId).subscribe(
      (data: any) => {
        this.isenablereviewbutton = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  // CAPA workflow methods
  isCapCauseDisabled() {
    if (this.isDraft == false) {
      for (let i = 0; i < (this.findingStatus?.capA_SUBMISSION?.capa?.length || 0); i++) {
        if (this.findingStatus.capA_SUBMISSION.capa[i].cappalist.issubmitted == true) {
          return true;
        }
        else {
          return false;
        }
      }
    }
    return false;
  }

  isCAPSubmissionDisabled() {
    if ((this.iscapsubmitbutton == true || this.disablesubmittillSave == true || this.iscapametricview == true) && this.isDraft == false) {
      return true;
    }
    else {
      return false;
    }
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 40 || charCode == 41 || charCode == 44 || charCode == 46 || charCode == 20 || charCode == 188 || charCode == 32 || charCode == 8 || (charCode >= 44 && charCode <= 57) || charCode >= 97 && charCode <= 122 || charCode >= 65 && charCode <= 90 || charCode == 32) {
      return true;
    }
    return false;
  }

  getCAPAStagesForKPI(kpiDetailsId: any) {
    if (kpiDetailsId != null) {
      this._appservice.getCAPAStagesForKPI(kpiDetailsId).subscribe(data => {
        if (this.findingStatus.capA_SUBMISSION.capa.every((x: any) => x.cappalist.id > 0)) {
          this.findingStatus = new AuditFindingStage();
          this.findingStatus = data;
        }
        let keys = "capaforKPI" + this.data.kpI_ID;

        localStorage.setItem(keys, JSON.stringify(data));
        if ((this.findingStatus?.capA_SUBMISSION?.capa?.length || 0) > 0) {
          this.FillSelectedCauses()
        }
        this.disableCAPSubmitButton();
        this.disableCAPReviewButton();
        this.disableImplementButtonInReview()
        this.disableVerificationButton()
        this.disableCAPCustomerApproveButton();
        if (this.data.editedRow.producT_ID != null) {
          this.IsCAPAApprovalAllowed();
        }
      },
        error => { this._util.serviceError(error); }
      )
    }
  }

  SaveCheckListCAPA(status: any) {
    if (!this.validateCAPAinputfields()) {
      this._util.showWarning("Please enter all required fields and save.");
      return;
    }

    if (!this.validateRootcauseField()) {
      this._util.showWarning("Please choose any one cause as Root cause");
      return;
    }
    this.saveCAPSubmissionData(status);
  }

  validateCAPAinputfields() {
    let flag = true;

    for (let i = 0; i < (this.findingStatus?.capA_SUBMISSION?.capa?.length || 0); i++) {
      if (this.findingStatus.capA_SUBMISSION.capa[i].cappalist.caP_TARGET_DATE == undefined || this.findingStatus.capA_SUBMISSION.capa[i].cappalist.correctivE_ACTION_PLAN == undefined ||
        this.findingStatus.capA_SUBMISSION.capa[i].cappalist.correction == undefined || this.findingStatus.capA_SUBMISSION.capa[i].cappalist.plaN_FOR_EFFECTIVE_CAP == undefined || this.findingStatus.capA_SUBMISSION.capa[i].cappalist.responsible == "0"
        || this.findingStatus.capA_SUBMISSION.capa[i].cappalist.rooT_CAUSE.trim() == undefined) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  validateRootcauseField() {
    let flag = false;
    this.findingStatus?.capA_SUBMISSION?.capa?.forEach((cap: any) => {
      if (cap.cappalist.isrootcause) {
        flag = true;
      }
    });

    return flag;
  }

  saveCAPSubmissionData(status: any) {
    this.findingStatus?.capA_SUBMISSION?.capa?.forEach((element: any) => {
      element.cappalist.caP_TARGET_DATE = this._util.setLocaleDate(element.cappalist.caP_TARGET_DATE);
      element.cappalist.kpI_ACTUAL_ID = this.data.editedRow.kpI_ACTUAL_ID;
      if (element.cappalist.status != "Corrective Action Plan Approved")
        element.cappalist.status = status == "" || null ? "Corrective Action Plan Submitted" : status;
    });

    if (status == "Corrective Action Plan Resubmit" || status == "Corrective Action Plan Submitted") {
      this.saveCAPDetailsForFinding()
    }
    else
      this.onClose();

  }

  saveCAPDetailsForFinding() {
    this.disablesubmittillSave = true;
    this.service_saveCAPDetailsForFinding()
  }

  service_saveCAPDetailsForFinding() {

    this._appservice.addCAPAForKPI(this.findingStatus, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          this.findingStatus = data;
          this.disablesubmittillSave = false;
          this.submitcap = true;
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disableCAPSubmitButton();
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
        },
        error: (error: any) => {
          this._util.serviceError(error);
          this.findingStatus?.capA_SUBMISSION?.capa?.forEach((x: any) => x.cappalist.issubmitted = false);
          this.disablesubmittillSave = false;
        }
      });
  }

  SubmitCap() {

    this.flag = false;
    if ((this.findingStatus?.capA_REVIEW?.capa?.length || 0) > 0) {
      this.findingStatus.capA_REVIEW.capa.forEach((element: any) => {
        if (element.ischecked) {
          element.iscaprejected = false;
          element.iscapapproved = true;
          element.status = "Corrective Action Plan Approved"
        }
        else {
          element.iscaprejected = true;
          element.iscapapproved = false;
          element.status = "Corrective Action Plan Rejected"
        }
      });
      if ((this.findingStatus?.capA_REVIEW?.capa?.length || 0) > 0) {
        for (let element of this.findingStatus.capA_REVIEW.capa) {
          if (element.iscaprejected && (element.remarks == "" || element.remarks == null)) {
            this._util.showWarning("Please enter remarks")
            this.flag = true;
            break;
          }
        }
        if (!this.flag)
          this.updateCapReviewDetails();

      }
    }

  }

  updateCapReviewDetails() {
    this.disabletillreviewSave = true;
    this.service_saveCapReviewDetails();
  }

  service_saveCapReviewDetails() {

    this._appservice.addCAPReviewDetailsForKPI(this.findingStatus.capA_REVIEW.capa, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disabletillreviewSave = false;
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
          this.SelectedValue = [];

        },
        error: (error: any) => {
          this._util.serviceError(error); 
          this.findingStatus.capA_REVIEW.capa[0].issubmitted = false;
          this.disabletillreviewSave = false;
        }
      });
  }

  SendIdtoArray(st: any) { }

  ImplementCap() {
    if ((this.findingStatus?.caP_IMPLEMENTATION?.capa?.length || 0) > 0) {
      this.findingStatus.caP_IMPLEMENTATION.capa.forEach((element: any) => {
        if (element.isimplemented) {
          element.isimplemented = true;
          element.status = "Corrective Action Plan Implemented"
        }
        else {
          element.isimplemented = false;
          element.status = "Corrective Action Plan Not Implemented"
        }
      });
      this.addAuditFindingImplementation()
    }
    else
      this._util.showWarning("Please select a Corrective Action Plan")

  }

  addAuditFindingImplementation() {
    this.disabletillSaveImplement = true;
    this.service_saveCapImplementationDetailsforFinding();
  }

  service_saveCapImplementationDetailsforFinding() {
    this._appservice.addCAPImplementationDetailsForKPI(this.findingStatus.caP_IMPLEMENTATION.capa, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disabletillSaveImplement = false;
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
          this.SelectedValueImp = []
        },
        error: (error: any) => {
          this._util.serviceError(error); 
          this.isimplementbutton = false;
          this.disabletillreviewSave = false;
        }
      });

  }

  CapApprovedByCustomer() {

    this.flag = false;
    if ((this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0) > 0) {
      this.findingStatus.capA_CUSTOMER_APPROVAL.capa.forEach((element: any) => {
        if (element.statuS_ID == 1) {

          element.status = "Corrective Action Plan Approved By Customer";
        }
        else {

          element.status = "Corrective Action Plan Rejected By Customer"
        }
      });

      if ((this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0) > 0) {
        for (let element of this.findingStatus.capA_CUSTOMER_APPROVAL.capa) {
          if (element.statuS_ID == 2 && (element.remarks == "" || element.remarks == null)) {
            this._util.showWarning("Please enter remarks")
            this.flag = true;
            break;
          }
          if (element.statuS_ID == null) {
            this._util.showWarning("Please enter all required fields and submit.")
            this.flag = true;
            break;
          }

        }
        if (!this.flag)
          this.addCapaApprovalByCustomer();
      }

    }
    else
      this._util.showWarning("Please select a Corrective Action Plan")

  }

  addCapaApprovalByCustomer() {
    this.disableTillCustomerApprovalSave = true;
    this.service_saveCapApprovalByCustomer();
  }

  service_saveCapApprovalByCustomer() {

    this._appservice.addCAPAApprovalByCustomer(this.findingStatus.capA_CUSTOMER_APPROVAL.capa, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disableTillCustomerApprovalSave = false;      
          this.disableCAPCustomerApproveButton();
          this.getCustomerCAPAApprovalStatus();
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
        },
        error: (error: any) => {
          this._util.serviceError(error); 
          this.iscapcustomerapprovebutton = false;
          this.disableTillCustomerApprovalSave = false;
        }
      });

  }

  CapApprovedByQASpoc() {

    this.flag = false;
    if ((this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0) > 0) {
      this.findingStatus.capA_CUSTOMER_APPROVAL.capa.forEach((element: any) => {
        if (element.statuS_ID == 1) {

          element.status = "Corrective Action Plan Approved By QASpoc";
        }
        else {

          element.status = "Corrective Action Plan Rejected By QASpoc"
        }
      });

      if ((this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0) > 0) {
        for (let element of this.findingStatus.capA_CUSTOMER_APPROVAL.capa) {
          if (element.statuS_ID == 2 && (element.remarks == "" || element.remarks == null)) {
            this._util.showWarning("Please enter remarks")
            this.flag = true;
            break;
          }
          if (element.statuS_ID == null) {
            this._util.showWarning("Please enter all required fields and submit.")
            this.flag = true;
            break;
          }

        }
        if (!this.flag)
          this.addCapaApprovalByQASpoc();
      }

    }
    else
      this._util.showWarning("Please select a Corrective Action Plan")

  }

  addCapaApprovalByQASpoc() {
    this.disableTillCustomerApprovalSave = true;
    this.service_saveCapApprovalByQASpoc();
  }

  service_saveCapApprovalByQASpoc() {

    this._appservice.addCAPAApprovalByQASpoc(this.findingStatus.capA_CUSTOMER_APPROVAL.capa, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disableTillCustomerApprovalSave = false;    
          this.disableCAPCustomerApproveButton();
          this.getCustomerCAPAApprovalStatus();
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
        },
        error: (error: any) => {
          this._util.serviceError(error); 
          this.iscapcustomerapprovebutton = false;
          this.disableTillCustomerApprovalSave = false;
        }
      });

  }

  VerifyCAPImplementation() {
    let b: boolean
    if ((this.findingStatus?.caP_VERIFICATION?.capa?.length || 0) > 0) {
      this.findingStatus.caP_VERIFICATION.capa.forEach((element: any) => {
        if (element.isverified) {
          element.isverified = true;
          element.isrejected = false;
          element.status = "Corrective Action Plan Passed"
        }
        else {
          this.rejectImp = true;
          element.isverified = false;
          element.isrejected = true;
          element.status = "Corrective Action Plan Failed"
        }
      });
      this.addAuditFindingVerification()
    }
    else
      this._util.showWarning("Please select a Corrective Action Plan")
  }

  addAuditFindingVerification() {
    this.disableTillSaveVerification = true;
    this.service_saveCapVerificationDetailsforFinding();
  }

  service_saveCapVerificationDetailsforFinding() {
    this._appservice.addCAPVerificationDetailsForKPI(this.findingStatus.caP_VERIFICATION.capa, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {

          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disableTillSaveVerification = false;
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
          this.SelectedValueImp = []
          this.SelectedValueVerification = []
        },
        error: (error: any) => {
          this._util.serviceError(error); 
          this.isverficationbutton = false;
          this.disableTillSaveVerification = false;
        }
      });
  }

  clearrecommendedAction(st: any) {
    // Stub method for dropdown change event
  }
}
