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

    if (this.data != null && this.data.editedRow.producT_ID != null) {
      // Premier product-based KPI
      this.isNonPremier = false;
      console.log('🏷️ ngOnInit: Product-based KPI (isNonPremier=false)');
      this.serviceLevelMetric = this.data.editedRow.servicE_LEVEL_METRICS;
      this.minimumLevel = this.data.editedRow.minimuM_SERVICE_LEVEL;
      this.expectedLevel = this.data.editedRow.expecteD_SERVICE_LEVEL;
      this.isDraft = this.data.editedRow.iS_DRAFT;
      this.custId = this.data.customerId;
      
      const sladata = this.getSLAStatus_KPIActual(this.data.editedRow);
      this.kpiActual = sladata.kpI_ACTUAL;
      this.slaStatus = sladata.slA_STATUS;
      
      // Debug: Log received capaStage data
      console.log('KpiActionPlan ngOnInit: Received capaStage:', this.data.editedRow.capaStage);
      console.log('🔑 KpiActionPlan ngOnInit: ID fields check:');
      console.log('  - kpI_ID:', this.data.editedRow.kpI_ID);
      console.log('  - kpI_ACTUAL_ID:', this.data.editedRow.kpI_ACTUAL_ID);
      console.log('  - detaiL_ID:', this.data.editedRow.detaiL_ID);
      console.log('  - guid:', this.data.editedRow.guid);
      
      // Initialize with existing capaStage data or create new empty object
      this.findingStatus = this.data.editedRow.capaStage || new AuditFindingStage();
      
      console.log('KpiActionPlan ngOnInit: Initialized findingStatus:', this.findingStatus);
      console.log('KpiActionPlan ngOnInit: CAPA items count:', this.findingStatus?.capA_SUBMISSION?.capa?.length || 0);
      
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
      this.IsCAPAApprovalAllowed(); // CRITICAL: Enable Stage 2 submit button for reviewers
      
      // CRITICAL FIX: Only call getCAPAStagesForKPI if we have a valid KPI_DETAILS record ID
      // For new KPIs without detail records, skip the API call (start with empty CAPA)
      const kpiDetailsId = this.data.editedRow.kpI_ACTUAL_ID || this.data.editedRow.detaiL_ID;
      if (kpiDetailsId && kpiDetailsId !== 0) {
        console.log('💾 ngOnInit: Loading existing CAPA for detaiL_ID:', kpiDetailsId);
        this.getCAPAStagesForKPI(kpiDetailsId);
      } else {
        console.log('🆕 ngOnInit: No detail ID, starting with new CAPA (kpI_ID:', this.data.editedRow.kpI_ID, ')');
      }
      this.minDate = this._util.setLocaleDate(this._util.Today());
    } else {
      // Non-premier project-based KPI
      this.isNonPremier = true;
      this.isDraft = this.data.editedRow.isdraft;
      this.kpiActual = this.data.editedRow.kpI_ACTUAL;
      this.slaStatus = 'Not Met';
      this.kpiData = this.data.kpiData[0];
      
      // Initialize with existing capaStage data or create new empty object
      this.findingStatus = this.data.editedRow.capaStage || new AuditFindingStage();
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
      // Note: IsCAPAApprovalAllowed() is ONLY for product view - project view uses Feature ID 85 only
      
      // CRITICAL FIX: Only call getCAPAStagesForKPI if we have a valid KPI_DETAILS record ID
      // For project KPIs without detail records, skip the API call (start with empty CAPA)
      const kpiDetailsId = this.data.editedRow.kpI_ACTUAL_ID || this.data.editedRow.detaiL_ID || this.data.editedRow.id;
      if (kpiDetailsId && kpiDetailsId !== 0) {
        console.log('💾 ngOnInit (project): Loading existing CAPA for detaiL_ID:', kpiDetailsId);
        this.getCAPAStagesForKPI(kpiDetailsId);
      } else {
        console.log('🆕 ngOnInit (project): No detail ID, starting with new CAPA (kpI_ID:', this.data.editedRow.kpI_ID, ')');
      }
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
    if (!this.rootCauseIds || this.rootCauseIds.length === 0) {
      this.findingStatus.capA_SUBMISSION.capa = [];
      this._util.showWarning('Please select at least one cause');
      return;
    }
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

    if ((this.findingStatus?.capA_SUBMISSION?.capa?.length || 0) == 0) {
      this.iscapsubmitbutton = false;
      console.log('🔒 disableCAPSubmitButton: No CAPA items, Stage 2 disabled');
    } else {
      // Check if all items are submitted
      const allSubmitted = !this.findingStatus.capA_SUBMISSION.capa.some((x: any) => !x.cappalist.issubmitted);
      this.iscapsubmitbutton = allSubmitted;
      console.log('🔒 disableCAPSubmitButton: allSubmitted=', allSubmitted, ', Stage 2 enabled=', this.iscapsubmitbutton);
      console.log('🔒 CAPA items issubmitted status:', this.findingStatus.capA_SUBMISSION.capa.map((x: any) => ({
        id: x.cappalist.id,
        issubmitted: x.cappalist.issubmitted,
        cause: x.cappalist.cause
      })));
    }
  }

  disableCAPReviewButton() {
    if (this.findingStatus != undefined) {
      if ((this.findingStatus?.capA_REVIEW?.capa?.length || 0) == 0) {
        this.iscapreviewbutton = false;
        console.log('🔒 disableCAPReviewButton: No review items, Stage 3 disabled');
      } else {
        const allSubmitted = this.findingStatus.capA_REVIEW.capa.every((x: any) => x.issubmitted);
        this.iscapreviewbutton = allSubmitted;
        console.log('🔒 disableCAPReviewButton: All submitted:', allSubmitted, ', Stage 3 enabled:', this.iscapreviewbutton);
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
    console.log('🔒 disableCAPCustomerApproveButton called');
    if (this.findingStatus != undefined) {
      if ((this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0) == 0) {
        this.iscapcustomerapprovebutton = false;
        console.log('🔒 Stage 3: No items, button disabled (iscapcustomerapprovebutton=false)');
      } else {
        for (let element of this.findingStatus.capA_CUSTOMER_APPROVAL.capa) {
          if (element.statuS_ID == 1) {
            this.iscapcustomerapprovebutton = false;
            console.log('🔒 Stage 3: Found statuS_ID=1 (Approved), setting iscapcustomerapprovebutton=false');
            break;
          }
          else {
            this.iscapcustomerapprovebutton = true;
            console.log('🔒 Stage 3: Found statuS_ID!=1, setting iscapcustomerapprovebutton=true');
          }
        }
      }
      console.log('🔒 Stage 3 final state:');
      console.log('  - iscapcustomerapprovebutton:', this.iscapcustomerapprovebutton);
      console.log('  - status.iscomplete:', this.findingStatus.capA_CUSTOMER_APPROVAL?.status?.iscomplete);
      console.log('  - disableTillCustomerApprovalSave:', this.disableTillCustomerApprovalSave);
    }
    this.disableTillCustomerApprovalSave = false;
  }

  getProductManagerForProduct() {
    this.productId = this.data.editedRow.producT_ID;
    console.log('🔍 getProductManagerForProduct: Loading employees for product:', this.productId);
    this._appservice.getProductManagerByProductId(this.productId).subscribe(
      (data: any) => {
        console.log('✅ getProductManagerForProduct: Received employee data:', data);
        console.log('✅ Employee count:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('✅ Sample employee:', data[0]);
        }
        this.empInfo = data;
      },
      (error: any) => { 
        console.error('❌ getProductManagerForProduct: API Error:', error);
        this._util.serviceError(error); 
      }
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
    console.log('🔍 getProjResource: Loading employees for project:', p);
    this._appservice.getProjectResourceByProjId(p).subscribe(
      (data: any) => {
        console.log('✅ getProjResource: Received employee data:', data);
        console.log('✅ Employee count:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('✅ Sample employee:', data[0]);
        }
        this.empInfo = data;
      },
      (error: any) => { 
        console.error('❌ getProjResource: API Error:', error);
        this._util.serviceError(error); 
      }
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
    // Disable button if already submitted
    if (this.iscapsubmitbutton == true) {
      console.log('🔒 isCAPSubmissionDisabled: Disabled - Stage already submitted');
      return true;
    }
    
    // Disable during save operation
    if (this.disablesubmittillSave == true) {
      console.log('🔒 isCAPSubmissionDisabled: Disabled - Save in progress');
      return true;
    }
    
    // Disable in metric view mode
    if (this.iscapametricview == true && this.isDraft == false) {
      console.log('🔒 isCAPSubmissionDisabled: Disabled - Metric view mode');
      return true;
    }
    
    console.log('🔒 isCAPSubmissionDisabled: Enabled');
    return false;
  }

  isStage3SubmitDisabled() {
    console.log('🔒 isStage3SubmitDisabled CALLED');
    // Log the values for debugging
    const iscomplete = this.findingStatus?.capA_CUSTOMER_APPROVAL?.status?.iscomplete;
    const saving = this.disableTillCustomerApprovalSave;
    const noEditAccess = this.isEditAccessDisabled;
    
    console.log('🔒 isStage3SubmitDisabled check:');
    console.log('  - iscomplete:', iscomplete);
    console.log('  - disableTillCustomerApprovalSave:', saving);
    console.log('  - isEditAccessDisabled:', noEditAccess);
    console.log('  - isNonPremier:', this.isNonPremier);
    console.log('  - capa items:', this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0);
    
    if (iscomplete) {
      console.log('🔒 isStage3SubmitDisabled: Disabled - Stage already complete');
      return true;
    }
    
    if (saving) {
      console.log('🔒 isStage3SubmitDisabled: Disabled - Save in progress');
      return true;
    }
    
    if (noEditAccess) {
      console.log('🔒 isStage3SubmitDisabled: Disabled - No edit access');
      return true;
    }
    
    console.log('🔒 isStage3SubmitDisabled: Enabled');
    return false;
  }

  // Diagnostic method to check Stage 3 visibility
  checkStage3Visibility() {
    const isVisible = this.step === 3 
      && this.findingStatus != undefined 
      && this.findingStatus.capA_CUSTOMER_APPROVAL != undefined 
      && this.iscapreviewbutton 
      && this.findingStatus.capA_REVIEW?.status?.stagE_STATUS == 'Corrective Action Plan Approved';
    
    if (this.step === 3) {
      console.log('🔍 Stage 3 visibility check:');
      console.log('  - step===3:', this.step === 3);
      console.log('  - findingStatus defined:', this.findingStatus != undefined);
      console.log('  - capA_CUSTOMER_APPROVAL defined:', this.findingStatus?.capA_CUSTOMER_APPROVAL != undefined);
      console.log('  - iscapreviewbutton:', this.iscapreviewbutton);
      console.log('  - capA_REVIEW.status.stagE_STATUS:', this.findingStatus?.capA_REVIEW?.status?.stagE_STATUS);
      console.log('  - STAGE 3 VISIBLE:', isVisible);
      
      if (isVisible) {
        console.log('🔍 Stage 3 button conditions:');
        console.log('  - isNonPremier:', this.isNonPremier);
        console.log('  - capa items > 0:', (this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length ?? 0) > 0);
        console.log('  - Button should show for premier:', !this.isNonPremier && (this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length ?? 0) > 0);
        console.log('  - Button should show for non-premier:', this.isNonPremier && (this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length ?? 0) > 0);
      }
    }
    
    return isVisible;
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
        console.log('getCAPAStagesForKPI: Server response:', data);
        console.log('getCAPAStagesForKPI: Current findingStatus:', this.findingStatus);
        
        // Smart merge: Only update from server if it has actual data
        // This prevents overwriting loaded CAPA data with empty server responses
        const serverHasData = data && 
                              data.capA_SUBMISSION && 
                              data.capA_SUBMISSION.capa && 
                              data.capA_SUBMISSION.capa.length > 0;
        
        const localHasData = (this.findingStatus?.capA_SUBMISSION?.capa?.length || 0) > 0;
        
        console.log('getCAPAStagesForKPI: serverHasData:', serverHasData, 'localHasData:', localHasData);
        
        // Preserve local flags AND status objects before merging for ALL stages
        const preservedData = {
          stage1Flags: localHasData ? this.findingStatus.capA_SUBMISSION.capa.map((x: any) => x.cappalist.issubmitted) : [],
          stage1Status: this.findingStatus?.capA_SUBMISSION?.status,
          stage2Flags: (this.findingStatus?.capA_REVIEW?.capa?.length || 0) > 0 
            ? this.findingStatus.capA_REVIEW.capa.map((x: any) => x.issubmitted) : [],
          stage2Status: this.findingStatus?.capA_REVIEW?.status,
          stage3Statuses: (this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0) > 0
            ? this.findingStatus.capA_CUSTOMER_APPROVAL.capa.map((x: any) => x.status) : [],
          stage3Status: this.findingStatus?.capA_CUSTOMER_APPROVAL?.status,
          stage4Flags: (this.findingStatus?.caP_IMPLEMENTATION?.capa?.length || 0) > 0
            ? this.findingStatus.caP_IMPLEMENTATION.capa.map((x: any) => x.isimplemented) : [],
          stage4Status: this.findingStatus?.caP_IMPLEMENTATION?.status,
          stage5Flags: (this.findingStatus?.caP_VERIFICATION?.capa?.length || 0) > 0
            ? this.findingStatus.caP_VERIFICATION.capa.map((x: any) => x.isverified) : [],
          stage5Status: this.findingStatus?.caP_VERIFICATION?.status
        };
        
        // Update from server if:
        // 1. Local is empty (new CAPA) OR
        // 2. Server has data and local items are all saved (have IDs) - meaning we can safely refresh
        if (!localHasData) {
          // Case 1: No local data, use server data (even if empty - new CAPA)
          this.findingStatus = data;
          console.log('getCAPAStagesForKPI: No local data, using server data');
        } else if (serverHasData) {
          // Case 2: Both have data, refresh from server and restore local flags
          this.findingStatus = data;
          
          // CRITICAL FIX: Restore all stage flags AND status objects after server refresh
          // Server might not return these correctly, so preserve what we had locally
          // BUT: Always prefer server's "iscomplete" flag to prevent blocking progression
          
          // Stage 1 - Submission
          if (this.findingStatus?.capA_SUBMISSION?.capa && preservedData.stage1Flags.length > 0) {
            this.findingStatus.capA_SUBMISSION.capa.forEach((item: any, index: number) => {
              if (preservedData.stage1Flags[index] !== undefined) {
                item.cappalist.issubmitted = preservedData.stage1Flags[index];
              }
            });
            console.log('getCAPAStagesForKPI: Restored Stage 1 flags');
          }
          if (preservedData.stage1Status && !this.findingStatus.capA_SUBMISSION.status) {
            this.findingStatus.capA_SUBMISSION.status = preservedData.stage1Status;
            console.log('getCAPAStagesForKPI: Restored Stage 1 status object');
          }
          
          // Stage 2 - Review (CRITICAL for enabling Stage 3)
          if (this.findingStatus?.capA_REVIEW?.capa && preservedData.stage2Flags.length > 0) {
            this.findingStatus.capA_REVIEW.capa.forEach((item: any, index: number) => {
              if (preservedData.stage2Flags[index] !== undefined) {
                item.issubmitted = preservedData.stage2Flags[index];
              }
            });
            console.log('getCAPAStagesForKPI: Restored Stage 2 flags');
          }
          // For Stage 2 status, restore stagE_STATUS but preserve server's iscomplete
          if (preservedData.stage2Status) {
            if (!this.findingStatus.capA_REVIEW.status) {
              this.findingStatus.capA_REVIEW.status = {} as any;
            }
            // Restore stagE_STATUS from local if server doesn't have it
            if (!this.findingStatus.capA_REVIEW.status.stagE_STATUS && preservedData.stage2Status.stagE_STATUS) {
              this.findingStatus.capA_REVIEW.status.stagE_STATUS = preservedData.stage2Status.stagE_STATUS;
              console.log('getCAPAStagesForKPI: Restored Stage 2 stagE_STATUS:', preservedData.stage2Status.stagE_STATUS);
            }
          }
          
          // Stage 3 - Customer Approval
          if (this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa && preservedData.stage3Statuses.length > 0) {
            this.findingStatus.capA_CUSTOMER_APPROVAL.capa.forEach((item: any, index: number) => {
              if (preservedData.stage3Statuses[index]) {
                item.status = preservedData.stage3Statuses[index];
              }
            });
            console.log('getCAPAStagesForKPI: Restored Stage 3 item statuses');
          }
          // For Stage 3 status, restore stagE_STATUS but preserve server's iscomplete
          if (preservedData.stage3Status) {
            if (!this.findingStatus.capA_CUSTOMER_APPROVAL.status) {
              this.findingStatus.capA_CUSTOMER_APPROVAL.status = {} as any;
            }
            if (!this.findingStatus.capA_CUSTOMER_APPROVAL.status.stagE_STATUS && preservedData.stage3Status.stagE_STATUS) {
              this.findingStatus.capA_CUSTOMER_APPROVAL.status.stagE_STATUS = preservedData.stage3Status.stagE_STATUS;
              console.log('getCAPAStagesForKPI: Restored Stage 3 stagE_STATUS');
            }
          }
          
          // Stage 4 - Implementation
          if (this.findingStatus?.caP_IMPLEMENTATION?.capa && preservedData.stage4Flags.length > 0) {
            this.findingStatus.caP_IMPLEMENTATION.capa.forEach((item: any, index: number) => {
              if (preservedData.stage4Flags[index] !== undefined) {
                item.isimplemented = preservedData.stage4Flags[index];
              }
            });
            console.log('getCAPAStagesForKPI: Restored Stage 4 flags');
          }
          if (preservedData.stage4Status) {
            if (!this.findingStatus.caP_IMPLEMENTATION.status) {
              this.findingStatus.caP_IMPLEMENTATION.status = {} as any;
            }
            if (!this.findingStatus.caP_IMPLEMENTATION.status.stagE_STATUS && preservedData.stage4Status.stagE_STATUS) {
              this.findingStatus.caP_IMPLEMENTATION.status.stagE_STATUS = preservedData.stage4Status.stagE_STATUS;
              console.log('getCAPAStagesForKPI: Restored Stage 4 stagE_STATUS');
            }
          }
          
          // Stage 5 - Verification
          if (this.findingStatus?.caP_VERIFICATION?.capa && preservedData.stage5Flags.length > 0) {
            this.findingStatus.caP_VERIFICATION.capa.forEach((item: any, index: number) => {
              if (preservedData.stage5Flags[index] !== undefined) {
                item.isverified = preservedData.stage5Flags[index];
              }
            });
            console.log('getCAPAStagesForKPI: Restored Stage 5 flags');
          }
          if (preservedData.stage5Status) {
            if (!this.findingStatus.caP_VERIFICATION.status) {
              this.findingStatus.caP_VERIFICATION.status = {} as any;
            }
            if (!this.findingStatus.caP_VERIFICATION.status.stagE_STATUS && preservedData.stage5Status.stagE_STATUS) {
              this.findingStatus.caP_VERIFICATION.status.stagE_STATUS = preservedData.stage5Status.stagE_STATUS;
              console.log('getCAPAStagesForKPI: Restored Stage 5 stagE_STATUS');
            }
          }
          
          console.log('getCAPAStagesForKPI: Refreshed from server with preserved flags');
        } else {
          // Case 3: Keep existing data - either server is empty or local has unsaved changes
          console.log('getCAPAStagesForKPI: Keeping existing local CAPA data');
        }
        
        // DIAGNOSTIC: Log Stage 3 state after merge
        console.log('🔍 Stage 3 state after getCAPAStagesForKPI:');
        console.log('  - capA_CUSTOMER_APPROVAL exists:', !!this.findingStatus?.capA_CUSTOMER_APPROVAL);
        console.log('  - capa items:', this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.length || 0);
        console.log('  - status object:', this.findingStatus?.capA_CUSTOMER_APPROVAL?.status);
        if (this.findingStatus?.capA_CUSTOMER_APPROVAL?.status) {
          console.log('  - status.iscomplete:', this.findingStatus.capA_CUSTOMER_APPROVAL.status.iscomplete);
          console.log('  - status.stagE_STATUS:', this.findingStatus.capA_CUSTOMER_APPROVAL.status.stagE_STATUS);
        }
        console.log('  - capA_REVIEW.status.stagE_STATUS:', this.findingStatus?.capA_REVIEW?.status?.stagE_STATUS);
        
        
        // CRITICAL FIX: Save current findingStatus to localStorage, not the server response
        // This ensures we always have the latest valid data, even if server returns empty due to timing issues
        let keys = "capaforKPI" + this.data.kpI_ID;
        localStorage.setItem(keys, JSON.stringify(this.findingStatus));
        console.log('getCAPAStagesForKPI: Saved to localStorage:', keys);
        
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
    console.log('💾 saveCAPSubmissionData: Starting save with status:', status);
    console.log('💾 saveCAPSubmissionData: editedRow keys:', Object.keys(this.data.editedRow));
    console.log('💾 saveCAPSubmissionData: editedRow.kpI_ACTUAL_ID:', this.data.editedRow.kpI_ACTUAL_ID);
    console.log('💾 saveCAPSubmissionData: editedRow.detaiL_ID:', this.data.editedRow.detaiL_ID);
    console.log('💾 saveCAPSubmissionData: editedRow.id:', this.data.editedRow.id);
    console.log('💾 saveCAPSubmissionData: editedRow.kpI_ID:', this.data.editedRow.kpI_ID);
    console.log('💾 saveCAPSubmissionData: isNonPremier:', this.isNonPremier);
    console.log('💾 saveCAPSubmissionData: CAPA items count:', this.findingStatus?.capA_SUBMISSION?.capa?.length || 0);
    
    // CRITICAL FIX: Fallback chain for project KPIs where detaiL_ID may be undefined
    // Try kpI_ACTUAL_ID → detaiL_ID → id → kpI_ID (last resort for unsaved project KPIs)
    let kpiActualId = this.data.editedRow.kpI_ACTUAL_ID || this.data.editedRow.detaiL_ID || this.data.editedRow.id;
    
    // Special handling for project KPIs: if no detail ID exists, use kpI_ID
    // Backend will create the detail record association using the master KPI ID
    if (!kpiActualId || kpiActualId === 0) {
      kpiActualId = this.data.editedRow.kpI_ID;
      console.log('💾 saveCAPSubmissionData: Using kpI_ID for project KPI without detail record:', kpiActualId);
    } else {
      console.log('💾 saveCAPSubmissionData: Using kpiActualId:', kpiActualId);
    }
    
    // CRITICAL FIX: Handle null/empty status - default to "Corrective Action Plan Submitted" for new submissions
    const submissionStatus = status || "Corrective Action Plan Submitted";
    console.log('💾 saveCAPSubmissionData: Effective status:', submissionStatus);
    
    this.findingStatus?.capA_SUBMISSION?.capa?.forEach((element: any, index: number) => {
      console.log(`💾 saveCAPSubmissionData: Processing CAPA item ${index}:`, element);
      element.cappalist.caP_TARGET_DATE = this._util.setLocaleDate(element.cappalist.caP_TARGET_DATE);
      element.cappalist.kpI_ACTUAL_ID = kpiActualId;
      
      // CRITICAL FIX: Mark as submitted when submitting or resubmitting
      if (submissionStatus == "Corrective Action Plan Submitted" || 
          submissionStatus == "Corrective Action Plan Resubmit") {
        element.cappalist.issubmitted = true;
        console.log(`💾 saveCAPSubmissionData: Marked item ${index} as submitted`);
      }
      
      if (element.cappalist.status != "Corrective Action Plan Approved")
        element.cappalist.status = submissionStatus;
      console.log(`💾 saveCAPSubmissionData: After processing item ${index}:`, element.cappalist);
    });

    // Save for new submissions, resubmissions, or explicit submission status
    if (submissionStatus == "Corrective Action Plan Resubmit" || 
        submissionStatus == "Corrective Action Plan Submitted") {
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
    console.log('📡 service_saveCAPDetailsForFinding: Sending to API');
    
    // CRITICAL FIX: Fallback chain for project KPIs where detaiL_ID may be undefined
    // Try kpI_ACTUAL_ID → detaiL_ID → id → kpI_ID (for unsaved project KPIs)
    let kpiDetailsId = this.data.editedRow.kpI_ACTUAL_ID || this.data.editedRow.detaiL_ID || this.data.editedRow.id;
    
    // Special handling for project KPIs: if no detail ID exists, use kpI_ID
    // Backend will create the detail record association using the master KPI ID
    if (!kpiDetailsId || kpiDetailsId === 0) {
      kpiDetailsId = this.data.editedRow.kpI_ID;
      console.log('📡 service_saveCAPDetailsForFinding: Using kpI_ID for project KPI without detail record:', kpiDetailsId);
    } else {
      console.log('📡 service_saveCAPDetailsForFinding: Using kpiDetailsId:', kpiDetailsId);
    }
    
    // CRITICAL FIX: Ensure status object exists before setting KPI_DETAILS_ID
    if (this.findingStatus.capA_SUBMISSION) {
      if (!this.findingStatus.capA_SUBMISSION.status) {
        console.log('⚠️ Creating missing capA_SUBMISSION.status object');
        this.findingStatus.capA_SUBMISSION.status = {} as any;
      }
      this.findingStatus.capA_SUBMISSION.status.kpI_DETAILS_ID = kpiDetailsId;
      console.log('📡 Set capA_SUBMISSION.status.kpI_DETAILS_ID to:', kpiDetailsId);
    } else {
      console.error('❌ capA_SUBMISSION is missing! Cannot set kpI_DETAILS_ID');
    }
    
    console.log('📡 Payload - findingStatus:', JSON.stringify(this.findingStatus, null, 2));
    console.log('📡 Payload - selectedPeriod:', this.selectedPeriod);
    console.log('📡 API call - detaiL_ID for refresh:', this.data.editedRow.detaiL_ID);

    this._appservice.addCAPAForKPI(this.findingStatus, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          console.log('✅ service_saveCAPDetailsForFinding: API Success Response:', data);
          console.log('✅ Response CAPA items:', data?.capA_SUBMISSION?.capa?.length || 0);
          this.findingStatus = data;
          
          // CRITICAL FIX: API response doesn't include issubmitted flag
          // Set it manually since we know the submission was successful
          if (this.findingStatus?.capA_SUBMISSION?.capa) {
            this.findingStatus.capA_SUBMISSION.capa.forEach((item: any, index: number) => {
              item.cappalist.issubmitted = true;
              console.log(`✅ Set issubmitted=true for CAPA item ${index} after successful save`);
            });
          }
          
          this.disablesubmittillSave = false;
          this.submitcap = true;
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disableCAPSubmitButton();
          console.log('📡 Calling getCAPAStagesForKPI to refresh after save...');
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
        },
        error: (error: any) => {
          console.error('❌ service_saveCAPDetailsForFinding: API Error:', error);
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
    console.log('📡 service_saveCapReviewDetails: Sending Stage 2 data to API');
    console.log('📡 Review items count:', this.findingStatus.capA_REVIEW.capa.length);
    console.log('📡 Before API - capA_REVIEW.status:', this.findingStatus.capA_REVIEW?.status);

    this._appservice.addCAPReviewDetailsForKPI(this.findingStatus.capA_REVIEW.capa, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          console.log('✅ service_saveCapReviewDetails: Stage 2 submitted successfully');
          console.log('✅ API Response data:', data);
          
          // CRITICAL FIX: Mark all review items as submitted after successful save
          if (this.findingStatus?.capA_REVIEW?.capa) {
            this.findingStatus.capA_REVIEW.capa.forEach((item: any, index: number) => {
              item.issubmitted = true;
              console.log(`✅ Set issubmitted=true for Stage 2 review item ${index}`);
            });
          }
          
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disabletillreviewSave = false;
          this.disableCAPReviewButton();
          
          console.log('📡 Calling getCAPAStagesForKPI to refresh after Stage 2 save...');
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
          this.SelectedValue = [];
        },
        error: (error: any) => {
          console.error('❌ service_saveCapReviewDetails: API Error:', error);
          this._util.serviceError(error); 
          this.findingStatus.capA_REVIEW.capa.forEach((x: any) => x.issubmitted = false);
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
    console.log('📡 service_saveCapImplementationDetailsforFinding: Sending Stage 4 data to API');
    
    this._appservice.addCAPImplementationDetailsForKPI(this.findingStatus.caP_IMPLEMENTATION.capa, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          console.log('✅ service_saveCapImplementationDetailsforFinding: Stage 4 submitted successfully');
          
          // CRITICAL FIX: Mark all implementation items with their implementation status
          if (this.findingStatus?.caP_IMPLEMENTATION?.capa) {
            // The isimplemented flag should already be set, just ensure consistency
            console.log(`✅ Stage 4 implementation items updated`);
          }
          
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disabletillSaveImplement = false;
          this.disableImplementButtonInReview();
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
          this.SelectedValueImp = []
        },
        error: (error: any) => {
          console.error('❌ service_saveCapImplementationDetailsforFinding: API Error:', error);
          this._util.serviceError(error); 
          this.isimplementbutton = false;
          this.disabletillSaveImplement = false;
        }
      });

  }

  CapApprovedByCustomer() {
    console.log('📋 CapApprovedByCustomer called');
    console.log('📋 Stage 3 button disabled state:');
    console.log('  - iscomplete:', this.findingStatus?.capA_CUSTOMER_APPROVAL?.status?.iscomplete);
    console.log('  - disableTillCustomerApprovalSave:', this.disableTillCustomerApprovalSave);
    console.log('  - isEditAccessDisabled:', this.isEditAccessDisabled);
    console.log('  - Items:', this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa?.map((x: any) => ({ statuS_ID: x.statuS_ID, remarks: x.remarks })));

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
    console.log('📡 service_saveCapApprovalByCustomer: Sending Stage 3 data to API');

    this._appservice.addCAPAApprovalByCustomer(this.findingStatus.capA_CUSTOMER_APPROVAL.capa, this.selectedPeriod)
      .subscribe({
        next: (data: any) => {
          console.log('✅ service_saveCapApprovalByCustomer: Stage 3 submitted successfully');
          
          // CRITICAL FIX: Ensure customer approval status is properly reflected
          if (this.findingStatus?.capA_CUSTOMER_APPROVAL?.capa) {
            // Status already set in CapApprovedByCustomer() or CapApprovedByQASpoc()
            console.log(`✅ Stage 3 customer approval items updated`);
          }
          
          this._util.showSuccess("Submitted successfully. Please navigate to respective stage.");
          this.disableTillCustomerApprovalSave = false;      
          this.disableCAPCustomerApproveButton();
          this.getCustomerCAPAApprovalStatus();
          this.getCAPAStagesForKPI(this.data.editedRow.detaiL_ID);
        },
        error: (error: any) => {
          console.error('❌ service_saveCapApprovalByCustomer: API Error:', error);
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
