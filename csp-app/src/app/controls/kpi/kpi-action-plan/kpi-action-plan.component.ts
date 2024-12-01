import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AuditFindingImplementation } from '../../../models/audit-finding-implementation';
import { ObservationModel } from '../../../models/audit-checklist-based-model';
import { AuditFindingStage, AuditFindingCapaExt, AuditFindingCapaReviewExt, AuditFindingCapaImplementation } from '../../../models/audit-finding-stage';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { AuditFindingVerification } from '../../../models/audit-finding-verification';
import { AccessControl } from '../../../Shared/accessControl';


@Component({
  selector: 'app-kpi-action-plan',
  templateUrl: './kpi-action-plan.component.html',
  styleUrls: ['./kpi-action-plan.component.scss']
})
export class KpiActionPlanComponent implements OnInit {
  causeCollection: any[] = [];
  rootCauseIds: number[];
  serviceLevelMetric: string;
  productId: string;
  findingStatus: AuditFindingStage = new AuditFindingStage();
  auditFindingCappa: AuditFindingCapaExt[];
  kpiDetailsId: number = 0;
  disabletillSaveImplement: boolean;
  disabletillreviewSave: any;
  submitcap: boolean;
  step: number = 1;
  SelectedValue: AuditFindingCapaReviewExt[] = []
  SelectedValueImp: AuditFindingImplementation[] = []
  SelectedValueVerification: AuditFindingVerification[] = []
  issubmit: boolean = false;
  isDraft: boolean
  isCheck: boolean = false;
  rejectImp: boolean = false;
  isCheckImp: boolean = false;
  isCheckVeri: boolean = false;
  isapprovebutton: boolean
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
  empInfo: any[] = [];
  product: string;
  expectedLevel: string;
  minimumLevel: string;
  kpiActual: string;
  slaStatus: String;
  portfolioprodMap = [];
  capaCustomerApprovalStatusList: any;
  isEditAccessDisabled: boolean = true;
  selectedPeriod: Date;
  minDate: Date;
  isenablereviewbutton: any[] = [];
  custId : string ;
  kpiData: any[] = [];
  isNonPremier: boolean;
  constructor(private dialog: MatDialogRef<KpiActionPlanComponent>, private _appservice: AppsService, private _util: myUtility, @Inject(MAT_DIALOG_DATA) public data: any, public _access: AccessControl) {
    if (this._access.IsAllowed(81, 3, '', '')) {
      this.isEditAccessDisabled = false;
    }

  }

  ngOnInit() {
    let empId = localStorage.getItem('empid');
    if (localStorage.getItem('iscapametricview') != null)
      this.iscapametricview = JSON.parse(localStorage.getItem('iscapametricview'));
    localStorage.removeItem('iscapametricview');
    this.getCauses();
    this.findingStatus = new AuditFindingStage();
    if (this.data != null && this.data.editedRow.producT_ID != null) {
      this.isNonPremier = false;
      this.serviceLevelMetric = this.data.editedRow.servicE_LEVEL_METRICS;
      this.minimumLevel = this.data.editedRow.minimuM_SERVICE_LEVEL;
      this.expectedLevel = this.data.editedRow.expecteD_SERVICE_LEVEL;
      this.isDraft = this.data.editedRow.iS_DRAFT;
      this.custId = this.data.customerId;
      var d = this.getSLAStatus_KPIActual(this.data.editedRow);
      this.kpiActual = d.kpI_ACTUAL;
      this.slaStatus = d.slA_STATUS;
      this.findingStatus = this.data.editedRow.capaStage;
      this.selectedPeriod = this.data.selectedPeriod;
      this.FillSelectedCauses()
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
    }
    else {
      this.isNonPremier = true;
      this.isDraft = this.data.editedRow.isdraft;
      this.kpiActual = this.data.editedRow.kpI_ACTUAL;
      this.slaStatus = 'Not Met';
      this.kpiData = this.data.kpiData[0];
      this.findingStatus = this.data.editedRow.capaStage;
      this.selectedPeriod = this.data.selectedPeriod;
      this.data.editedRow.detaiL_ID = this.data.editedRow.id;
      this.FillSelectedCauses()
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
    this._appservice.getAuditCauses().subscribe(data => {
      this.causeCollection = data;
    },
      error => { this._util.serviceError(error); }
    )
  }
  getSelectedVal() {

    this._appservice.getAuditFindingsCappa(this.findingStatus, this.rootCauseIds, 0).subscribe(data => {
      this.auditFindingCappa = data;
      this.findingStatus.capA_SUBMISSION.capa = this.auditFindingCappa;
      if (this.data != null && this.data.editedRow.producT_ID != null){
        this.getProductManagerForProduct();
      }
      else{
        this.getProjResource();
      }
    },
      error => { this._util.serviceError(error); }
    )

  }

  getRootCauseVal(st) {
    if (st)
      return "Yes"
    else
      return "No"
  }

  getEmployeeName(empid) {
    let element;
    if (this.empInfo != undefined && this.empInfo.length > 0 && empid != undefined && this.data.editedRow.producT_ID != null) {
      element = this.empInfo.find(x => x.responsiblE_EMP_ID == empid);
    }
    else {
      element = this.empInfo.find(x => x.emP_ID == empid);
    }
    if (element != undefined && this.data.editedRow.producT_ID != null)
      return element.responsiblE_NAME;
    else if (element != undefined && this.data.editedRow.producT_ID == null)
      return element.frsT_NM;
    else
      return "";
  }

  getCAPAStagesForKPI(kpiDetailsId) {
    if (kpiDetailsId != null) {
      this._appservice.getCAPAStagesForKPI(kpiDetailsId).subscribe(data => {
        if (this.findingStatus.capA_SUBMISSION.capa.every(x => x.cappalist.id > 0)) {
          this.findingStatus = new AuditFindingStage();
          this.findingStatus = data;
        }
        let keys = "capaforKPI" + this.data.kpI_ID;

        localStorage.setItem(keys, JSON.stringify(data));
        if (this.findingStatus.capA_SUBMISSION.capa.length > 0) {
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

  SaveCheckListCAPA(status) {
    if (!this.validateCAPAinputfields()) {
      alert("Please enter all required fields and save.");
      return;
    }

    if (!this.validateRootcauseField()) {
      alert("Please choose any one cause as Root cause");
      return;
    }
    this.saveCAPSubmissionData(status);
  }

  validateCAPAinputfields() {
    let flag = true;

    for (let i = 0; i < this.findingStatus.capA_SUBMISSION.capa.length; i++) {
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
    this.findingStatus.capA_SUBMISSION.capa.forEach((cap) => {
      if (cap.cappalist.isrootcause) {
        flag = true;
      }
    });

    return flag;
  }

  isCapCauseDisabled() {
    if (this.isDraft == false) {
      for (let i = 0; i < this.findingStatus.capA_SUBMISSION.capa.length; i++) {
        if (this.findingStatus.capA_SUBMISSION.capa[i].cappalist.issubmitted == true) {
          return true;
        }
        else {
          return false;
        }
      }
    }
  }

  isCAPSubmissionDisabled() {
    if ((this.iscapsubmitbutton == true || this.disablesubmittillSave == true || this.iscapametricview == true) && this.isDraft == false) {
      return true;
    }
    else {
      return false;
    }
  }

  saveCAPSubmissionData(status) {
    this.findingStatus.capA_SUBMISSION.capa.forEach(element => {
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

  FillSelectedCauses() {
    this.rootCauseIds = []

    this.findingStatus.capA_SUBMISSION.capa.forEach(element => {
      this.rootCauseIds.push(element.causE_ID)
    });

  }

  disableCAPSubmitButton() {

    if (!this.findingStatus)
      return;

    if (this.findingStatus.capA_SUBMISSION.capa.length == 0)
      this.iscapsubmitbutton = false;
    else
      this.iscapsubmitbutton = !this.findingStatus.capA_SUBMISSION.capa.some(x => !x.cappalist.issubmitted);
  }

  disableCAPReviewButton() {
    if (this.findingStatus != undefined) {
      if (this.findingStatus.capA_REVIEW.capa.length == 0)
        this.iscapreviewbutton = false;
      else {
        for (let element of this.findingStatus.capA_REVIEW.capa) {

          if (!element.issubmitted) {
            this.iscapreviewbutton = false;
            break
          }
          else
            this.iscapreviewbutton = true;
        };
      }
    }
    this.disabletillreviewSave = false;
  }

  disableCAPCustomerApproveButton() {

    if (this.findingStatus != undefined) {
      if (this.findingStatus.capA_CUSTOMER_APPROVAL.capa.length == 0)
        this.iscapcustomerapprovebutton = false;
      else {
        for (let element of this.findingStatus.capA_CUSTOMER_APPROVAL.capa) {

          if (element.statuS_ID == 1) {
            this.iscapcustomerapprovebutton = false;
            break;
          }
          else
            this.iscapcustomerapprovebutton = true;
        };
      }
    }
    this.disableTillCustomerApprovalSave = false;
  }

  disableImplementButtonInReview() {
    if (this.findingStatus != undefined) {
      if (this.findingStatus.caP_IMPLEMENTATION.capa.length == 0)
        this.isimplementbutton = false;
      else {
        for (let element of this.findingStatus.caP_IMPLEMENTATION.capa) {
          if (!element.isimplemented) {
            this.isimplementbutton = false;
            break
          }
          else
            this.isimplementbutton = true;
        };
      }
    }
  }

  disableVerificationButton() {
    if (this.findingStatus != undefined) {
      if (this.findingStatus.caP_VERIFICATION.capa.length == 0)
        this.isverficationbutton = false;
      else {
        for (let element of this.findingStatus.caP_VERIFICATION.capa) {
          if (!element.isverified) {
            this.isverficationbutton = false;
            break
          }
          else
            this.isverficationbutton = true;
        };
      }
    }
  }

  getProductManagerForProduct() {

    this.productId = this.data.editedRow.producT_ID;
    this._appservice.getProductManagerByProductId(this.productId).subscribe(data => {
      this.empInfo = data;
    }
      ,
      error => { this._util.serviceError(error); }
    )
  }

  getProjResource() {
    let p = this.data.kpiData.filter(x=>x.projecT_ID != null)[0].projecT_ID
    this._appservice.getProjectResourceByProjId(p).subscribe(data => {
      this.empInfo = data;
    },
      error => { this._util.serviceError(error); }
    )
  }


  IsCAPAApprovalAllowed() {
    this.productId = this.data.editedRow.producT_ID;
    this.kpiDetailsId = this.data.editedRow.detaiL_ID;
    this._appservice.IsCAPAApprovalAllowed(this.productId, this.selectedPeriod, this.kpiDetailsId).subscribe(data => {
      this.isenablereviewbutton = data;
    }
      ,
      error => { this._util.serviceError(error); }
    )
  }

  incrementNextStep() {
    this.step++;
  }

  incrementPreviousStep() {
    this.step--;
  }
  getSLAStatus_KPIActual(kpiDetails): any {
    var opData = { slA_STATUS: "Met", kpI_ACTUAL: kpiDetails.kpI_ACTUAL };
    let isExclusion = kpiDetails.iS_EXCLUSION;// this.includeExclusions; // kpiDetails.iS_EXCLUSION;
    if (!isExclusion) {
      if (kpiDetails.slA_STATUS == "Not Met") {
        opData.slA_STATUS = kpiDetails.slA_STATUS;
        opData.kpI_ACTUAL = kpiDetails.kpI_ACTUAL;
        return opData;
      }
    }
    if (isExclusion) {
      if (kpiDetails.slA_STATUS == "Not Met" && kpiDetails.exclusioN_SLA_STATUS == "Not Met") {
        opData.slA_STATUS = kpiDetails.exclusioN_SLA_STATUS;
        opData.kpI_ACTUAL = kpiDetails.exclusioN_KPI_ACTUAL;
        return opData;
      }
      if (kpiDetails.slA_STATUS == "Met" && kpiDetails.exclusioN_SLA_STATUS == "Not Met") {
        opData.slA_STATUS = kpiDetails.exclusioN_SLA_STATUS;
        opData.kpI_ACTUAL = kpiDetails.exclusioN_KPI_ACTUAL;
        return opData;
      }
    }
    return opData;
  }
  SubmitCap() {

    this.flag = false;
    if (this.findingStatus.capA_REVIEW.capa.length > 0) {
      this.findingStatus.capA_REVIEW.capa.forEach(element => {
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
      if (this.findingStatus.capA_REVIEW.capa.length > 0) {
        for (let element of this.findingStatus.capA_REVIEW.capa) {
          if (element.iscaprejected && (element.remarks == "" || element.remarks == null)) {
            alert("Please enter remarks")
            this.flag = true;
            break;
          }
        }
        if (!this.flag)
          this.updateCapReviewDetails();

      }
    }

  }
  SendIdtoArray(st) { }
  ImplementCap() {
    if (this.findingStatus.caP_IMPLEMENTATION.capa.length > 0) {
      this.findingStatus.caP_IMPLEMENTATION.capa.forEach(element => {
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
      alert("Please select a Corrective Action Plan")

  }

  CapApprovedByCustomer() {

    this.flag = false;
    if (this.findingStatus.capA_CUSTOMER_APPROVAL.capa.length > 0) {
      this.findingStatus.capA_CUSTOMER_APPROVAL.capa.forEach(element => {
        if (element.statuS_ID == 1) {

          element.status = "Corrective Action Plan Approved By Customer";
        }
        else {

          element.status = "Corrective Action Plan Rejected By Customer"
        }
      });

      if (this.findingStatus.capA_CUSTOMER_APPROVAL.capa.length > 0) {
        for (let element of this.findingStatus.capA_CUSTOMER_APPROVAL.capa) {
          if (element.statuS_ID == 2 && (element.remarks == "" || element.remarks == null)) {
            alert("Please enter remarks")
            this.flag = true;
            break;
          }
          if (element.statuS_ID == null) {
            alert("Please enter all required fields and submit.")
            this.flag = true;
            break;
          }

        }
        if (!this.flag)
          this.addCapaApprovalByCustomer();
      }

    }
    else
      alert("Please select a Corrective Action Plan")

  }

  CapApprovedByQASpoc() {

    this.flag = false;
    if (this.findingStatus.capA_CUSTOMER_APPROVAL.capa.length > 0) {
      this.findingStatus.capA_CUSTOMER_APPROVAL.capa.forEach(element => {
        if (element.statuS_ID == 1) {

          element.status = "Corrective Action Plan Approved By QASpoc";
        }
        else {

          element.status = "Corrective Action Plan Rejected By QASpoc"
        }
      });

      if (this.findingStatus.capA_CUSTOMER_APPROVAL.capa.length > 0) {
        for (let element of this.findingStatus.capA_CUSTOMER_APPROVAL.capa) {
          if (element.statuS_ID == 2 && (element.remarks == "" || element.remarks == null)) {
            alert("Please enter remarks")
            this.flag = true;
            break;
          }
          if (element.statuS_ID == null) {
            alert("Please enter all required fields and submit.")
            this.flag = true;
            break;
          }

        }
        if (!this.flag)
          this.addCapaApprovalByQASpoc();
      }

    }
    else
      alert("Please select a Corrective Action Plan")

  }


  updateCapReviewDetails() {
    this.disabletillreviewSave = true;
    this.service_saveCapReviewDetails();
  }

  service_saveCapReviewDetails() {

    this._appservice.addCAPReviewDetailsForKPI(this.findingStatus.capA_REVIEW.capa, this.selectedPeriod)
      .subscribe(data => {
        alert("Submitted sucessfully. Please navigate to respective stage.");
        this.disabletillreviewSave = false;
        this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
        this.SelectedValue = [];

      }, error => {
        this._util.serviceError(error); this.findingStatus.capA_REVIEW.capa[0].issubmitted = false;
        this.disabletillreviewSave = false;
      });
  }


  addAuditFindingImplementation() {
    this.disabletillSaveImplement = true;
    this.service_saveCapImplementationDetailsforFinding();
  }



  service_saveCapImplementationDetailsforFinding() {
    this._appservice.addCAPImplementationDetailsForKPI(this.findingStatus.caP_IMPLEMENTATION.capa, this.selectedPeriod)
      .subscribe(data => {
        alert("Submitted sucessfully.Please nagivate to respective stage.");
        this.disabletillSaveImplement = false;
        this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
        this.SelectedValueImp = []
      }, error => {
        this._util.serviceError(error); this.isimplementbutton = false;
        this.disabletillreviewSave = false;
      });

  }

  addCapaApprovalByCustomer() {
    this.disableTillCustomerApprovalSave = true;
    this.service_saveCapApprovalByCustomer();
  }
  service_saveCapApprovalByCustomer() {

    this._appservice.addCAPAApprovalByCustomer(this.findingStatus.capA_CUSTOMER_APPROVAL.capa, this.selectedPeriod)
      .subscribe(data => {
        alert("Submitted sucessfully. Please navigate to respective stage.");
        this.disableTillCustomerApprovalSave = false;      
        this.disableCAPCustomerApproveButton();
        this.getCustomerCAPAApprovalStatus();
        this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
      }, error => {
        this._util.serviceError(error); this.iscapcustomerapprovebutton = false;
        this.disableTillCustomerApprovalSave = false;
      });

  }

  addCapaApprovalByQASpoc() {
    this.disableTillCustomerApprovalSave = true;
    this.service_saveCapApprovalByQASpoc();
  }
  service_saveCapApprovalByQASpoc() {

    this._appservice.addCAPAApprovalByQASpoc(this.findingStatus.capA_CUSTOMER_APPROVAL.capa, this.selectedPeriod)
      .subscribe(data => {
        alert("Submitted sucessfully. Please navigate to respective stage.");
        this.disableTillCustomerApprovalSave = false;    
        this.disableCAPCustomerApproveButton();
        this.getCustomerCAPAApprovalStatus();
        this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
      }, error => {
        this._util.serviceError(error); this.iscapcustomerapprovebutton = false;
        this.disableTillCustomerApprovalSave = false;
      });

  }

  addAuditFindingVerification() {
    this.disableTillSaveVerification = true;
    this.service_saveCapVerificationDetailsforFinding();
  }
  service_saveCapVerificationDetailsforFinding() {
    this._appservice.addCAPVerificationDetailsForKPI(this.findingStatus.caP_VERIFICATION.capa, this.selectedPeriod)
      .subscribe(data => {

        alert("Submitted sucessfully. Please navigate to respective stage.");
        this.disableTillSaveVerification = false;
        this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
        this.SelectedValueImp = []
        this.SelectedValueVerification = []
      }, error => {
        this._util.serviceError(error); this.isverficationbutton = false;
        this.disableTillSaveVerification = false;
      });
  }

  VerifyCAPImplementation() {
    let b: boolean
    if (this.findingStatus.caP_VERIFICATION.capa.length > 0) {
      this.findingStatus.caP_VERIFICATION.capa.forEach(element => {
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
      alert("Please select a Corrective Action Plan")
  }

  service_saveCAPDetailsForFinding() {

    this._appservice.addCAPAForKPI(this.findingStatus, this.selectedPeriod)
      .subscribe(data => {
        this.findingStatus = data;
        this.disablesubmittillSave = false;
        this.submitcap = true;
        alert("Submitted sucessfully. Please nagivate to respective stage.");
        this.disableCAPSubmitButton();
        this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
      }, error => {
        this._util.serviceError(error);
        this.findingStatus.capA_SUBMISSION.capa.forEach(x => x.cappalist.issubmitted = false);
        this.disablesubmittillSave = false;
      });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 40 || charCode == 41 || charCode == 44 || charCode == 46 || charCode == 20 || charCode == 188 || charCode == 32 || charCode == 8 || (charCode >= 44 && charCode <= 57) || charCode >= 97 && charCode <= 122 || charCode >= 65 && charCode <= 90 || charCode == 32) {
      return true;
    }
    return false;
  }

  getProductList() {
    this._appservice.GetProductName(this.data.editedRow.producT_ID).subscribe(data => {
            this.product = data;
    }, error => { this._util.serviceError(error); }
    );
  }


  getCustomerCAPAApprovalStatus() {
    this._appservice.getCustomerCAPAApprovalStatus().subscribe(data => {
      this.capaCustomerApprovalStatusList = data;
    }, error => { this._util.serviceError(error); },
    );
  }


}
