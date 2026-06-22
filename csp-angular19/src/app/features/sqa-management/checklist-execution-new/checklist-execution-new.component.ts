import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, Inject, Optional, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule, MatRadioGroup } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AssessmentUtility } from '../../../shared/assessment-utility';
import { AccessControl } from '../../../shared/access-control';
import { environment } from '../../../../environments/environment';
import { ProjectSelectorComponent } from '../../../shared/components/project-selector/project-selector.component';
import { ChecklistAuditeeComponent } from '../checklist-auditee/checklist-auditee.component';
import { ChecklistFindingsNewComponent } from '../checklist-findings-new/checklist-findings-new.component';

export class PlannedAuditData {
  cusT_ID: string = '';
  proj_ID: string = '';
  emP_ID: string = '';
  assessmenT_ID: number = 0;
  commentS: string = '';
  statuS: string = '';
  iS_retaiN_CAPA: number = 0;
}

@Component({
  selector: 'app-checklist-execution-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTabsModule,
    MatRadioModule,
    MatTooltipModule,
    MatDialogModule,
    ProjectSelectorComponent,
    ChecklistAuditeeComponent
  ],
  templateUrl: './checklist-execution-new.component.html',
  styleUrls: ['./checklist-execution-new.component.scss']
})
export class ChecklistExecutionNewComponent implements OnInit {
  
  // Component properties matching legacy exactly
  notApplicableId: number = 0;
  originalPlannedAudits: any[] = [];
  checklistStatusValues: any[] = [];
  originalCCList: any[] = [];
  originalToList: any[] = [];
  tolist: any[] = [];
  cclist: any[] = [];
  issubmitenabled: boolean = false;
  auditorList: any;
  @Input("processDescription") processDescription: any[] = [];
  custIds: string[] = [];
  ddData: any;
  endDate: Date | null = null;
  selected: number = -1;
  isChecked: boolean[] = [];
  showAddition: boolean = false;
  actualHours: number = 0;
  plannedHours: number = 0;
  auditscope: string = '';
  IsSavedAuditsExpand: boolean = false;
  custId: string = '';
  selectedAuditId: number = 0;
  checkListData: any[] = [];
  projId: string = '';
  IsSubmitted: boolean = false;
  submittedAll: boolean = false;
  selectedAuditees: any[] = [];
  auditeesList: any;
  flag: boolean = false;
  selectedProcessModel: any;
  selectedServiceArea: any[] = [];
  selectedAuditor: string = '';
  versionId: number = 0;
  serviceArea: any;
  gavsserviceArea: any;
  auditDataTitle: string = '';
  startDate: Date | null = null;
  actualstartDate: Date | null = null;
  actualendDate: Date | null = null;
  savedCheckListaudits: any;
  isExpanded: boolean = false;
  IsSavedAuditsLoaded: boolean = false;
  plannedAudits: any[] = [];
  checkListDataNew: any[] = [];
  serviceAreaNew: any[] = [];
  checklistStatus: string = '';
  IsSubmittednew: boolean = false;
  checklistversion: number = 0;
  checklist: any[] = [];
  selectedchecklist: number = 0;
  statusCategory: string = '';
  checklistScore: any;
  hideweightage: boolean = false;
  dataSentToPopup: any;
  maxMultiplier: number = 0;
  checklistmaturitylevelid: number = 0;
  checklistmaturitylevel: string = '';
  searchCustomerValue: string = '';
  searchCCValue: string = '';
  searchToValue: string = '';
  selectedCCs: any[] = [];
  selectedTos: any[] = [];
  completed: boolean = false;
  checklistSummaryRec: any = {};
  checklistExeViewModel: any = {};
  Customer: any[] = [];
  @ViewChild('statusRadio') staturRadio!: MatRadioGroup;
  @ViewChild('confirmationDialog') confirmationDialogTemplate!: TemplateRef<any>;
  originalCustomer: any[] = [];
  AllServiceArea: boolean = false;
  AllProcessModel: boolean = false;
  AllProcessArea: boolean = false;
  AllProcess: boolean = false;
  IsChecklistDisabled: boolean = false;
  sub: any;
  input_auditid: number = 0;
  allcust: boolean = false;
  allproj: boolean = false;
  isDisabledIncludeAssessment: boolean = false;
  isCreateAccessDisabled: boolean = true;
  checklistList: any[] = [];
  isFromValidation: boolean = false;
  isFromDashboard: boolean = false;
  selectedIndex: number = 0;
  checklistOutofScore: number = 0;
  custidParam: any;
  projIdParam: any;
  MandatoryFindingsTypeForFailedStatus: any = [];
  findingTypeId: number = 0;
  comments: any;
  result: any;
  isApproved: boolean = false;
  plannedAuditData: PlannedAuditData = new PlannedAuditData();
  isLoading: boolean = false;
  findings: any;
  isRetainCapa: boolean = false;
  updatedChecklistScore: any;
  updatedChecklistScorePercentage: any;
  checklistScorePercentage: any;
  averageScore: number = 0;
  auditReportData: any[] = [];
  isMaturityLevelApplicable: boolean = false;
  maturityLevelMappings: any[] = [];
  checklistName: string = '';
  corrective_action_tracking: boolean = false;
  isdataSubmitted: boolean = true;
  tabIndex: any;

  // Validation state tracking for highlighting
  validationAttempted: boolean = false;
  hasAppraiserError: boolean = false;
  hasAppraiseeError: boolean = false;
  hasActualStartError: boolean = false;
  hasActualEndError: boolean = false;
  hasPlannedStartError: boolean = false;
  hasMaturityLevelError: boolean = false;

  selectFormControl = new FormControl('', Validators.required);

  constructor(
    private _router: Router, 
    public _access: AccessControl, 
    private _appService: AppsService, 
    private cdref: ChangeDetectorRef,
    public _utility: MyUtility, 
    private _assessmentUtil: AssessmentUtility, 
    private _http: HttpClient, 
    public dialog: MatDialog, 
    private route: ActivatedRoute,
    @Optional() private qaSummaryDialog: MatDialogRef<ChecklistExecutionNewComponent>, 
    @Optional() @Inject(MAT_DIALOG_DATA) public qaSummaryData: any
  ) {
    if (this._access.IsAllowed(805, 2, '', '')) {
      this.allcust = true;
      this.allproj = true;
      this.isCreateAccessDisabled = false;
    }
    else if (this._access.IsAllowed(805, 1, '', '')) {
      this.allcust = false;
      this.allproj = false;
      this.isCreateAccessDisabled = false;
    }
  }

  ngOnInit() {
    var empId = localStorage.getItem('empid');
    this.LoadCustomerByEmpId();
    this.getDropDownParams();
    
    this.sub = this.route.params.subscribe(params => {
      if (params['custid'] != undefined && params['projid'] != undefined && params['auditid'] != undefined) {
        this.custidParam = params['custid'];
        this.projIdParam = params['projid'];
        this.custId = params['custid'];
        this.projId = params['projid'];
        this.input_auditid = Number(params['auditid']);
      }
      if (this.route.snapshot.url.toString().startsWith("checklistfindings") && params['isApproveReject'] != undefined) {
        let approvers = "";
        this._appService.GetDBConfigValue("ASSESSMENT_RESUBMIT_APPROVERS", -1, "").subscribe(data => {
          approvers = data;
          this.resubmitAssessmentApproval(approvers, empId);
        });
      }
    });

    if (this.qaSummaryData != null) {
      this.custId = this.qaSummaryData.assessmentFindingInputs.cusT_ID;
      this.projId = this.qaSummaryData.assessmentFindingInputs.proJ_ID;
      this.input_auditid = Number(this.qaSummaryData.assessmentFindingInputs.assessmenT_ID);
      if (this.qaSummaryData.assessmentFindingInputs.iS_FROM_DASHBOARD) {
        this.isFromDashboard = true;
        this.selectedIndex = 1;
      }
      else {
        this.selectedIndex = 0;
      }
    }
  }

  resubmitAssessmentApproval(approvers: string, empId: any) {
    this.route.params.subscribe(params => {
      if (params['isApproveReject'] != undefined) {
        const approversArray = approvers.split(',');
        if (!approversArray.includes(empId)) {
          this._utility.showWarningPopup("Sorry! You are not authorized to approve project related settings");
          this._router.navigateByUrl('/newdashboard/custm');
        }
        else {
          this.plannedAuditData = new PlannedAuditData();
          this.plannedAuditData.cusT_ID = params['custid'];
          this.plannedAuditData.proj_ID = params['projid'];
          this.plannedAuditData.emP_ID = empId;
          this.plannedAuditData.assessmenT_ID = Number(params['auditid']);
          this.plannedAuditData.statuS = params['isApproveReject'] == "1" ? "Approved" : "Rejected";
          
          this._utility.showInputDialog(
            'Please provide comments for this action',
            'Assessment Comments',
            '',
            'Comments',
            'Enter comments...'
          ).subscribe((comments: string | null) => {
            if (!comments || !comments.trim()) {
              this._utility.showWarningPopup("Please enter comments");
            } else {
              this.plannedAuditData.commentS = comments.trim();
              this._appService.revertChecklistAssessmentData(this.plannedAuditData).subscribe(
                data => {
                  if (this.plannedAuditData.statuS == "Approved") {
                    this._utility.showSuccessPopup("Asssessment Reverted Successfully");
                  }
                },
                error => {
                  this._utility.serviceError(error);
                }
              );
            }
          });
        }
      }
    });
  }

  onClose() {
    this.qaSummaryDialog.close();
  }

  /**
   * Handle changes from checklist auditee component
   */
  onChecklistDataChange(updatedData: any[]) {
    this.checkListDataNew = updatedData;
  }

  project_onChange($event: any) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    this.selectedCCs = [];
    this.selectedTos = [];
    this.completed = false;
    this.clearAll();
    this.getEmployeeListFromproject();
    if (this.custidParam != undefined && this.projIdParam != undefined) {
      this.custId = this.custidParam;
      this.projId = this.projIdParam;
      this.custidParam = undefined; 
      this.projIdParam = undefined;
    }
    this.Service_GetPlannedAudits(this.custId, this.projId);
    this.IsSubmitted = false;
    this.IsChecklistDisabled = true;
  }

  filterList() {
    if (this.completed)
      this.plannedAudits = this.originalPlannedAudits;
    else
      this.plannedAudits = this.originalPlannedAudits.filter(x => x.status != 'COMPLETED');
  }

  filterCustomer() {
    this.Customer = this.originalCustomer.filter(x => x.cusT_NM.toLowerCase().includes(this.searchCustomerValue.toLowerCase()));
  }

  filterCCEmployees() {
    this.cclist = this.originalCCList.filter(x => x.frsT_NM.toLowerCase().includes(this.searchCCValue.toLowerCase()));
  }

  filterToEmployees() {
    this.tolist = this.originalToList.filter(x => x.frsT_NM.toLowerCase().includes(this.searchToValue.toLowerCase()));
  }

  LoadCustomerByEmpId() {
    this._appService.GetCustomerList(localStorage.getItem("empid") || '', false).subscribe(
      (data) => {
        this.Customer = data;
        this.originalCustomer = data;
      },
      (error) => {
        this._utility.serviceError(error);
      }
    );
  }

  sortCustomer() {
    this.Customer = this.originalCustomer;
    this.Customer.forEach(x => x.isselected = false);
    for (var cust of this.custIds) {
      let rec = this.Customer.find(x => x.cusT_ID == cust);
      if (rec == null)
        continue;
      rec.isselected = true;
    }
    this.Customer.sort((x, y) => Number(y.isselected) - Number(x.isselected));
  }

  sortCCList() {
    this.cclist = this.originalCCList;
    this.cclist.forEach(x => x.isselected = false);
    for (var CCvar of this.selectedCCs) {
      let rec = this.cclist.find(x => x.emP_ID == CCvar);
      if (rec == null)
        continue;
      rec.isselected = true;
    }
    this.cclist.sort((x, y) => Number(y.isselected) - Number(x.isselected));
  }

  sortToList() {
    this.tolist = this.originalToList;
    this.tolist.forEach(x => x.isselected = false);
    for (var Tovar of this.selectedTos) {
      let rec = this.tolist.find(x => x.emP_ID == Tovar);
      if (rec == null)
        continue;
      rec.isselected = true;
    }
    this.tolist.sort((x, y) => Number(y.isselected) - Number(x.isselected));
  }

  LoadCustomerID() {
    let customerIds = this.custIds.toString();
    this._appService.getCustomerIdForChecklist(customerIds).subscribe(
      (data) => {
        this.cclist = [...data];
        this.tolist = [...data];
        this.originalCCList = [...data];
        this.originalToList = [...data];
      },
      (error) => {
        this._utility.serviceError(error);
      }
    );
  }

  autoGrowTextZone(e: any) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 10) + "px";
  }

  getDropDownParams() {
    this.service_getDropDownDataForAudit()
  }

  service_getDropDownDataForAudit() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._utility.AppSettings.token });
    let apiuri: string = environment.webapiuri + 'GetDropDownParamsForAudit';
    this._http.get(apiuri, { headers: header })
      .subscribe(data => {
        this.ddData = data;
        this.auditorList = this.ddData.auditoR_LIST;
        this.serviceArea = this.ddData.servicE_AREA;
        this.serviceAreaNew = this.ddData.procesS_SERVICE_AREA_NEW;

        // If a selectedAuditor was set earlier (from planned audits), normalize it now
        if (this.selectedAuditor && this.auditorList && this.auditorList.length > 0) {
          const found = this.auditorList.find((a: any) => a.emP_ID === this.selectedAuditor || a.id === this.selectedAuditor || (a.frsT_NM && this.selectedAuditor && a.frsT_NM.toLowerCase().includes(this.selectedAuditor.toString().toLowerCase())));
          if (found) this.selectedAuditor = found.emP_ID;
        }
      }, error => { this._utility.serviceError(error); });
  }

  Service_GetPlannedAudits(custid: string, projid: string) {
    this.isLoading = true;
    this.IsSavedAuditsLoaded = false;
    this._appService.getPlannedAudits(custid, projid).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.originalPlannedAudits = data;
          this.plannedAudits = data.filter(x => x.status != 'COMPLETED');
          let auditsIds = data.map(x => x.id).join(',');
          this.getOpenFindingsCount(auditsIds);
        }
        else {
          this.plannedAudits = data;
        }

        if (this.input_auditid > 0) {
          this.IsSavedAuditsLoaded = false;
          this.plannedAudits = this.originalPlannedAudits;
          this.isDisabledIncludeAssessment = true;
          var assessmentDetailsByAssessmentId = this.originalPlannedAudits.filter(x => x.id == this.input_auditid);
          if (assessmentDetailsByAssessmentId.length > 0) {
            this.IsSavedAuditsLoaded = false;
            assessmentDetailsByAssessmentId[0].iS_CHECKED = true;
            this.auditDataTitle = assessmentDetailsByAssessmentId[0].description;
            this.getCheckListAuditData(this.input_auditid, assessmentDetailsByAssessmentId[0].servicE_AREA_ID, assessmentDetailsByAssessmentId[0].description, assessmentDetailsByAssessmentId[0].scheduleD_START_DATE, assessmentDetailsByAssessmentId[0].duE_DATE, assessmentDetailsByAssessmentId[0].auditoR_ID, assessmentDetailsByAssessmentId[0].auditesS_ID, assessmentDetailsByAssessmentId[0].status, assessmentDetailsByAssessmentId[0].scheduleD_DURATION, assessmentDetailsByAssessmentId[0].actuaL_DURATION, assessmentDetailsByAssessmentId[0].actuaL_START_DATE, assessmentDetailsByAssessmentId[0].actuaL_END_DATE);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._utility.serviceError(error)
      }
    });
  }

  getOpenFindingsCount(auditIds: string) {
    this._appService.getOpenFindingsCount(auditIds).subscribe(
      data => {
        this.findings = data;
        if (this.plannedAudits && this.plannedAudits.length > 0) {
          this.IsSavedAuditsLoaded = true;
        }
      },
      error => {
        this._utility.serviceError(error);
      })
  }

  getFindingsCount(id: number) {
    let count = this._utility.getFindingsCount(this.findings, id, "total");
    return count;
  }

  getOpenFindingCount(id: number) {
    let count = this._utility.getFindingsCount(this.findings, id, "open");
    return count;
  }

  getClosedFindingsCount(id: number) {
    let count = this._utility.getFindingsCount(this.findings, id, "closed");
    return count;
  }

  GetAuditAssesment(i: number, auditid: number, serviceAreas: any, title: string, startdate: any, enddate: any, auditorid: string, auditeessid: any, status: string, plannedhour: number, actualhour: number, actualstartdate: any, actualenddate: any) {
    this.clearAll();
    this.IsSavedAuditsLoaded = false;
    this.plannedAudits.forEach(function (element, index) {
      if (index != i)
        element.iS_CHECKED = false;
      else
        element.iS_CHECKED = true;
    });
    this.auditDataTitle = '';
    this.getCheckListAuditData(auditid, serviceAreas, title, startdate, enddate, auditorid, auditeessid, status, plannedhour, actualhour, actualstartdate, actualenddate);
  }

  getCheckListAuditData(auditid: number, serviceareas: any, title: string, startdate: any, enddate: any, auditorid: string, auditeessid: any, status: string,
    plannedhour: number, actualhour: number, actualstartdate: any, actualenddate: any) {
    this.auditDataTitle = title;
    this.selectedAuditor = auditorid;
    this.selectedAuditees = auditeessid;
    this.plannedHours = plannedhour;
    this.actualHours = actualhour;
    this.startDate = startdate != null ? new Date(startdate) : null;
    this.endDate = enddate != null ? new Date(enddate) : null;
    this.actualstartDate = actualstartdate != null ? new Date(actualstartdate) : null;
    this.actualendDate = actualenddate != null ? new Date(actualenddate) : null;
    this.selectedAuditId = auditid;

    if (serviceareas != undefined && serviceareas.length > 0)
      this.selectedServiceArea = serviceareas.map((x: any) => +x);
    else
      this.selectedServiceArea = this.serviceAreaNew.map(x => x.id);

    this.checklist = [];
    this.IsSubmitted = false;
    this.issubmitenabled = false;

    // Deduplicate service area IDs to avoid duplicate values in API call
    const uniqueServiceAreas = serviceareas && serviceareas.length > 0 
      ? [...new Set(serviceareas.map((x: any) => +x))]
      : serviceareas;

    let data = {
      "audiT_ID": auditid,
      "servicE_AREA_IDS": uniqueServiceAreas,
      "customeR_ID": this.custId,
      "projecT_ID": this.projId
    };

    this.checklist = [];
    this.checklistScore = 0;
    this.checklistScorePercentage = 0;
    this.updatedChecklistScore = 0;
    this.updatedChecklistScorePercentage = 0;
    this.checklistversion = 0;
    this._appService.getCheckListDataForProjNew(data).subscribe(
      data => {
        this.checklist = data;
        if (this.checklist.length > 0) {
          let record = this.checklist.find(x => x.mappeD_CHECKLIST == true);
          if (record != null)
            this.getMappedChecklistData(record);
          else
            this.getMappedChecklistData(this.checklist[0]);
        }
        else {
          this._utility.showWarningPopup('No Checklists generated for this Assessment. Checklists will be visible based on the combination of PSPD mapping for the project and the Service Tower(s) selected in the Assessment and the Service Towers of the Checklist. Please verify the mentioned screens and update them to see required Checklists here.');
          return;
        }
      },
      error => { this._utility.serviceError(error); }
    )
  }

  getMappedChecklistData(checklist: any) {
    let submitflag = false;
    this.checkListDataNew = checklist.checkpointS_BY_SERVICE_AREA;
    this.checklistSummaryRec = checklist.audiT_CHECKLIST_EXECUTION_SUMMARY;

    if (this.checklistSummaryRec.issubmitted && this.checklistSummaryRec.isactive) {
      this.IsChecklistDisabled = true;
    }
    else {
      this.IsChecklistDisabled = false;
    }

    this.checklistStatusValues = checklist.checklisT_STATUS_LIST_VALUES;
    var rec = checklist.checklisT_STATUS_LIST_VALUES.find((x: any) => x.statuS_CATEGORY == "N/A");
    if (rec != null)
      this.notApplicableId = rec.id;

    this.checklistversion = checklist.versioN_ID;
    this.checklistScore = this.checklistSummaryRec.score;
    this.checklistScorePercentage = this.checklistSummaryRec.percentagE_SCORE;
    this.updatedChecklistScore = this.checklistSummaryRec.updateD_SCORE;
    this.updatedChecklistScorePercentage = this.checklistSummaryRec.updateD_PERCENTAGE_SCORE;
    this.hideweightage = !checklist.weightagE_APPLICABLE_FLAG;
    this.corrective_action_tracking = checklist.correctivE_ACTION_TRACKING;
    this.selectedchecklist = checklist.checklisT_ID;
    this.dataSentToPopup = checklist.findingtypE_VALUES;
    this.findingTypeId = checklist.findingstypE_ID;

    if (this.checklistSummaryRec.audiT_PLANNED_HOURS != null)
      this.plannedHours = this.checklistSummaryRec.audiT_PLANNED_HOURS;

    if (this.checklistSummaryRec.audiT_ACTUAL_HOURS != null)
      this.actualHours = this.checklistSummaryRec.audiT_ACTUAL_HOURS;

    // Preserve any previously-set auditor (e.g., from planned-audit row) if checklist does not provide a valid auditor
    const prevSelectedAuditor = this.selectedAuditor;
    if (this.checklistSummaryRec.auditoR_ID && this.checklistSummaryRec.auditoR_ID !== '0') {
      this.selectedAuditor = this.checklistSummaryRec.auditoR_ID;
    } else {
      // keep prevSelectedAuditor (do nothing) so UI doesn't briefly show then disappear
      this.selectedAuditor = prevSelectedAuditor || '';
    }

    // Normalize auditor id to match `auditorList` entries (they use `emP_ID`)
    if (this.selectedAuditor && this.auditorList && this.auditorList.length > 0) {
      const found = this.auditorList.find((a: any) => a.emP_ID === this.selectedAuditor || a.id === this.selectedAuditor || (a.frsT_NM && this.selectedAuditor && a.frsT_NM.toLowerCase().includes(this.selectedAuditor.toString().toLowerCase())));
      if (found) this.selectedAuditor = found.emP_ID;
    }

    if (checklist.auditeE_NAMES != null && checklist.auditeE_NAMES.length > 0)
      this.selectedAuditees = checklist.auditeE_NAMES;
    this.checklistSummaryRec.auditeE_LIST = checklist.auditeE_NAMES;

    if (checklist.cC_LIST != null && checklist.cC_LIST.length > 0)
      this.selectedCCs = checklist.cC_LIST;

    if (checklist.tO_LIST != null && checklist.tO_LIST.length > 0)
      this.selectedTos = checklist.tO_LIST;

    if (this.checklistSummaryRec.planneD_AUDIT_START_DATE && this.checklistSummaryRec.planneD_AUDIT_START_DATE != null)
      this.startDate = new Date(this.checklistSummaryRec.planneD_AUDIT_START_DATE);

    if (this.checklistSummaryRec.planneD_AUDIT_END_DATE && this.checklistSummaryRec.planneD_AUDIT_END_DATE != null)
      this.endDate = new Date(this.checklistSummaryRec.planneD_AUDIT_END_DATE);

    if (this.checklistSummaryRec.actuaL_AUDIT_START_DATE && this.checklistSummaryRec.actuaL_AUDIT_START_DATE != null)
      this.actualstartDate = new Date(this.checklistSummaryRec.actuaL_AUDIT_START_DATE);

    if (this.checklistSummaryRec.actuaL_AUDIT_END_DATE && this.checklistSummaryRec.actuaL_AUDIT_END_DATE != null)
      this.actualendDate = new Date(this.checklistSummaryRec.actuaL_AUDIT_END_DATE);

    this.isMaturityLevelApplicable = checklist.maturitY_LEVEL_APPLICABLE;

    if (this.isMaturityLevelApplicable) {
      this.checklistmaturitylevel = checklist.maturitY_LEVEL_TITLE;
      this.checklistmaturitylevelid = checklist.maturitY_LEVEL_ID;
      this.maturityLevelMappings = checklist.pM_MATURITYLEVEL_MAPPINGS;
    }

    if (this.findingTypeId > 0) {
      this.getMandatoryFindingTypeForFailedStatus();
    }

    this.IsSubmitted = false;

    if (this.checklistSummaryRec.issubmitted)
      this.IsSubmitted = true;

    if (!this.IsSubmitted) {
      this.issubmitenabled = false;
      return;
    }

    for (let i = 0; i < this.checkListDataNew.length; i++) {
      for (let n = 0; n < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
        for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
          for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; j++) {
            for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints.length; k++) {
              for (let l = 0; l < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings.length; l++) {
                if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].findinG_DESCRIPTION != undefined
                  && this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].findinG_DESCRIPTION.length > 0
                  && this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].issubmitted == false) {
                  submitflag = true;
                  break;
                }
              }
            }
          }
        }
      }
    }

    if (submitflag)
      this.issubmitenabled = false;
    else
      this.issubmitenabled = true;
    
    // Calculate average score when checklist data is loaded
    this.calculateAverageScore();
  }

  setChecklistData() {
    this.checkListDataNew = [];
    let record = this.checklist.find(x => x.checklisT_ID == this.selectedchecklist);
    if (record)
      this.getMappedChecklistData(record);
  }

  getEmployeeListFromproject() {
    this._appService.getAuditeeDetails(this.custId, this.projId).subscribe(
      data => {
        this.auditeesList = data
      },
      error => {
        this._utility.serviceError(error);
      }
    )
  }

  clearAll() {
    this.checkListDataNew = [];
    this.startDate = null;
    this.endDate = null;
    this.selectedAuditees = [];
    this.selectedAuditor = '';
    this.auditDataTitle = '';
    this.plannedHours = 0;
    this.actualHours = 0;
    this.auditscope = '';
    this.actualstartDate = null;
    this.actualendDate = null;
    this.selectedServiceArea = [];
    this.selectedCCs = [];
    this.selectedTos = [];
    this.checklistmaturitylevel = '';
  }

  getMinDate(): Date {
    return this.startDate ? this.startDate : new Date();
  }

  get appraiserTooltip(): string {
    // Try to find by emP_ID first, then id, then by name contains
    let auditor = this.auditorList?.find((item: any) => item.emP_ID === this.selectedAuditor);
    if (!auditor)
      auditor = this.auditorList?.find((item: any) => item.id === this.selectedAuditor || (item.frsT_NM && this.selectedAuditor && item.frsT_NM.toLowerCase().includes(this.selectedAuditor.toString().toLowerCase())));
    return auditor?.frsT_NM || this.selectedAuditor || '';
  }

  get appraiseeTooltip(): string {
    if (!this.selectedAuditees?.length) {
      return '';
    }
    const names = this.auditeesList?.filter((item: any) => this.selectedAuditees.includes(item.emP_ID)).map((item: any) => item.frsT_NM);
    return names?.length ? names.join(', ') : this.selectedAuditees.join(', ');
  }

  get selectedChecklistTooltip(): string {
    const selected = this.checklist?.find((item: any) => item.checklisT_ID === this.selectedchecklist);
    return selected ? `${selected.checklisT_NAME} (${selected.versioN_ID} - ${selected.checklisT_EFFECTIVE_FROM?.slice(0,10)})` : '';
  }

  get customerTooltip(): string {
    if (!this.custIds?.length) {
      return '';
    }
    const names = this.Customer?.filter((item: any) => this.custIds.includes(item.cusT_ID)).map((item: any) => item.cusT_NM);
    return names?.length ? names.join(', ') : this.custIds.join(', ');
  }

  get ccTooltip(): string {
    if (!this.selectedCCs?.length) {
      return '';
    }
    const names = this.originalCCList?.filter((item: any) => this.selectedCCs.includes(item.emP_ID)).map((item: any) => item.frsT_NM);
    return names?.length ? names.join(', ') : this.selectedCCs.join(', ');
  }

  get toTooltip(): string {
    if (!this.selectedTos?.length) {
      return '';
    }
    const names = this.originalToList?.filter((item: any) => this.selectedTos.includes(item.emP_ID)).map((item: any) => item.frsT_NM);
    return names?.length ? names.join(', ') : this.selectedTos.join(', ');
  }

  get serviceAreaTooltip(): string {
    if (!this.selectedServiceArea?.length) {
      return '';
    }
    const names = this.serviceAreaNew?.filter((item: any) => this.selectedServiceArea.includes(item.id)).map((item: any) => item.title);
    return names?.length ? names.join(', ') : this.selectedServiceArea.join(', ');
  }

  getMandatoryFindingTypeForFailedStatus() {
    this._appService.getMandatoryFindingTypeById(this.findingTypeId).subscribe(data => {
      this.MandatoryFindingsTypeForFailedStatus = data;
    }, error => { this._utility.serviceError(error); })
  }

  handlePdfExport(i: number, list: any) {
    this._appService.service_DowloadFile('assessment', this.custId, this.projId, list.id).subscribe(
      (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;

        const currentDateTime = new Date().toLocaleString();
        a.download = `${list.description}_Report_${currentDateTime}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this._utility.showSuccessPopup('File downloaded successfully');
      },
      error => {
        // Handle Blob errors (file download endpoints that return JSON errors)
        if (error.error instanceof Blob && error.error.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorText = reader.result as string;
              const errorJson = JSON.parse(errorText);
              
              // Extract error message from backend
              const errorMessage = errorJson.Message || errorJson.message || 
                                 errorJson.ExceptionMessage || errorJson.exceptionMessage ||
                                 'An error occurred while generating the report';
              
              this._utility.showError(errorMessage);
            } catch {
              this._utility.serviceError(error);
            }
          };
          reader.onerror = () => {
            this._utility.serviceError(error);
          };
          reader.readAsText(error.error);
        } else {
          this._utility.serviceError(error);
        }
      });
  }

  resubmitChecklistAssessment(plannedAudit: any): void {
    const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
      width: '500px',
      maxWidth: '90vw',
      data: plannedAudit,
      panelClass: 'confirm-action-dialog',
      autoFocus: false,
      restoreFocus: false,
      disableClose: true  // Prevent closing on backdrop click or ESC key (close icon is allowed)
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      // Only proceed if user made a valid choice (0 = Remove, 1 = Retain)
      if (result === undefined || result === null) {
        return; // User closed dialog without making a choice
      }

      this._utility.showInputDialog(
        'Please provide justification to resubmit',
        'Resubmit Justification',
        '',
        'Justification',
        'Enter justification...'
      ).subscribe((comments: string | null) => {
        // If user clicked Cancel, just return without showing warning
        if (comments === null) {
          return;
        }
        
        // If user clicked OK but didn't enter text, show warning
        if (!comments.trim()) {
          this._utility.showWarningPopup("Please enter justification to resubmit");
          return;
        }
        
        // Proceed with submission
        this.comments = comments.trim();
        plannedAudit.emp_Id = localStorage.getItem('empid');
        plannedAudit.assessmenT_STATUS = "Requested";
        plannedAudit.comments = this.comments;
        plannedAudit.iS_retaiN_CAPA = result;
        this._appService.resubmitChecklistAssessment(plannedAudit).subscribe(
          (data: any) => {
            this._utility.showSuccessPopup("Mail Sent to Quality Head");
          },
          (error: any) => {
            this._utility.serviceError(error);
          }
        );
      });
    });
  }

  // Scoring and Calculation Methods
  selectAllServiceArea(event: MatCheckboxChange, data: any) {
    if (event.checked)
      this.setNotApplicableValueForServiceArea(data, this.notApplicableId, event.checked, 100, "N/A")
    else
      this.setNotApplicableValueForServiceArea(data, 0, event.checked, 0, null);
  }

  selectAllProcessArea(event: MatCheckboxChange, data: any) {
    if (event.checked)
      this.setNotApplicableValueForProcessArea(data, this.notApplicableId, event.checked, 100, "N/A")
    else
      this.setNotApplicableValueForProcessArea(data, 0, event.checked, 0, null);
  }

  selectAllProcessModel(event: MatCheckboxChange, data: any) {
    if (event.checked)
      this.setNotApplicableValueForProcessModel(data, this.notApplicableId, event.checked, 100, "N/A")
    else
      this.setNotApplicableValueForProcessModel(data, 0, event.checked, 0, null);
  }

  selectAllProcess(event: MatCheckboxChange, data: any) {
    if (event.checked)
      this.setNotApplicableValueForProcess(data, this.notApplicableId, event.checked, 100, "N/A")
    else
      this.setNotApplicableValueForProcess(data, 0, event.checked, 0, null);
  }

  setNotApplicableValueForProcess(data: any, value: number, status: boolean, percentage: number, category: any) {
    data.maX_SCORE = 0;
    data.scorE_ACHIEVED = 0;
    data.percentage = percentage;

    for (var c of data.checkpoints) {
      c.statuS_VALUE_ID = value;
      c.score = 0;
      c.maX_SCORE = 0;
      c.updateD_SCORE = 0;
      c.statuS_CATEGORY = category;
    }

    this.getOverallScore();
    this.getScoreInPercentage(data);
    this.cdref.detectChanges();
  }

  setNotApplicableValueForProcessModel(data: any, value: number, status: boolean, percentage: number, category: any) {
    data.maX_SCORE = 0;
    data.scorE_ACHIEVED = 0;
    data.percentage = percentage;

    for (var pa of data.checkpointS_BY_PROCESS_AREA) {
      pa.isSelected = status;
      pa.maX_SCORE = 0;
      pa.scorE_ACHIEVED = 0;
      pa.percentage = percentage;

      for (var p of pa.checkpointS_BY_PROCESS) {
        p.isSelected = status;
        p.maX_SCORE = 0;
        p.scorE_ACHIEVED = 0;
        p.percentage = percentage;
        for (var c of p.checkpoints) {
          c.statuS_VALUE_ID = value;
          c.score = 0;
          c.maX_SCORE = 0;
          c.updateD_SCORE = 0;
          c.statuS_CATEGORY = category;
        }
      }
    }

    this.getOverallScore();
    this.getScoreInPercentage(data);
  }

  setNotApplicableValueForProcessArea(data: any, value: number, status: boolean, percentage: number, category: any) {
    data.maX_SCORE = 0;
    data.scorE_ACHIEVED = 0;
    data.percentage = percentage;

    for (var p of data.checkpointS_BY_PROCESS) {
      p.isSelected = status;
      p.maX_SCORE = 0;
      p.scorE_ACHIEVED = 0;
      p.percentage = percentage;
      for (var c of p.checkpoints) {
        c.statuS_VALUE_ID = value;
        c.score = 0;
        c.maX_SCORE = 0;
        c.updateD_SCORE = 0;
        c.statuS_CATEGORY = category;
      }
    }
    this.getOverallScore();
    this.getScoreInPercentage(data);
    this.cdref.detectChanges();
  }

  setNotApplicableValueForServiceArea(data: any, value: number, status: boolean, percentage: number, category: any) {
    data.maX_SCORE = 0;
    data.scorE_ACHIEVED = 0;
    data.percentage = percentage;

    for (var pm of data.checkpointS_BY_PROCESS_MODEL) {
      pm.isSelected = status;
      pm.maX_SCORE = 0;
      pm.scorE_ACHIEVED = 0;
      pm.percentage = percentage;
      for (var pa of pm.checkpointS_BY_PROCESS_AREA) {
        pa.isSelected = status;
        pa.maX_SCORE = 0;
        pa.scorE_ACHIEVED = 0;
        pa.percentage = percentage;

        for (var p of pa.checkpointS_BY_PROCESS) {
          p.isSelected = status;
          p.maX_SCORE = 0;
          p.scorE_ACHIEVED = 0;
          p.percentage = percentage;
          for (var c of p.checkpoints) {
            c.statuS_VALUE_ID = value;
            c.score = 0;
            c.maX_SCORE = 0;
            c.updateD_SCORE = 0;
            c.statuS_CATEGORY = category
          }
        }
      }
    }

    this.getOverallScore();
    this.getScoreInPercentage(data);
    this.cdref.detectChanges();
  }

  setStatusCategory(row: any, process: any, processArea: any, serviceArea: any) {
    let anyrec = this.checklistStatusValues.find((x: any) => x.id == row.statuS_VALUE_ID);
    if (anyrec != undefined)
      row.statuS_CATEGORY = anyrec.statuS_CATEGORY;
    else
      row.statuS_CATEGORY = "N/A";

    this.getScoreForStatus(row);
    this.getProcessMaxScore(process);
    this.getProcessScore(process);
    this.getProcessAreaMaxScore(processArea);
    this.getProcessAreaScore(processArea);
    this.getServiceAreaScore(serviceArea);
    this.getProcessPercentage(process);
    this.getProcessAreaPercentage(processArea);
    this.getServiceAreaPercentage(serviceArea);
    this.getOverallScore();
    this.getScoreInPercentage(row);
  }

  getScoreForStatus(row: any) {
    if (row == undefined)
      return;

    if (!this.checklistStatusValues || this.checklistStatusValues == null)
      return;

    if (row.statuS_CATEGORY == "N/A") {
      row.score = 0;
      row.maX_SCORE = 0;
      row.updateD_SCORE = 0;
      return;
    }

    this.maxMultiplier = Math.max(...this.checklistStatusValues.map((x: any) => x.multiplier), 0);
    var multiplier;
    var rec = this.checklistStatusValues.find((x: any) => x.id == row.statuS_VALUE_ID);
    if (rec != undefined)
      multiplier = rec.multiplier;
    else
      multiplier = 1;

    if (row.iS_WEIGHTAGE_APPLICABLE) {
      if (row.weightagE_SCORE && row.weightagE_SCORE != null) {
        row.score = parseFloat(multiplier.toString()) * parseFloat(row.weightagE_SCORE);
        row.maX_SCORE = parseFloat(this.maxMultiplier.toString()) * parseFloat(row.weightagE_SCORE);
      }
      else {
        row.maX_SCORE = parseFloat(this.maxMultiplier.toString());
        row.score = parseFloat(multiplier.toString());
      }
    }
    else {
      row.score = parseFloat(multiplier.toString());
      row.maX_SCORE = parseFloat(this.maxMultiplier.toString());
    }

    row.updateD_SCORE = row.score
  }

  getOverallScore() {
    let oscore = 0;
    this.checkListDataNew.forEach((x: any) => {
      x.checkpointS_BY_PROCESS_MODEL.forEach((x: any) => {
        x.checkpointS_BY_PROCESS_AREA.forEach((x: any) => {
          x.checkpointS_BY_PROCESS.forEach((x: any) => {
            x.checkpoints.forEach((x: any) => {
              oscore = oscore + parseFloat(x.score.toString());
            });
          });
        })
      })
    });
    this.checklistScore = oscore;
    this.updatedChecklistScore = oscore;
    this.calculateAverageScore();
  }

  getScoreInPercentage(row: any) {
    let acheivedscore = 0;
    let maxscore = 0;
    this.checkListDataNew.forEach((x: any) => {
      x.checkpointS_BY_PROCESS_MODEL.forEach((x: any) => {
        x.checkpointS_BY_PROCESS_AREA.forEach((x: any) => {
          x.checkpointS_BY_PROCESS.forEach((x: any) => {
            if (x.scorE_ACHIEVED && !isNaN(x.scorE_ACHIEVED))
              acheivedscore += x.scorE_ACHIEVED;
            if (x.maX_SCORE && !isNaN(x.maX_SCORE))
              maxscore += x.maX_SCORE
          })
        })
      })
    })

    if (maxscore == 0) {
      this.checklistScorePercentage = 100;
      this.updatedChecklistScorePercentage = 100;
    }
    else {
      this.checklistScorePercentage = +((parseFloat(acheivedscore.toString()) / parseFloat(maxscore.toString())) * 100).toFixed(2);
      this.updatedChecklistScorePercentage = this.checklistScorePercentage;
    }
    this.setMaturityLevel();
    this.calculateAverageScore();
  }

  setMaturityLevel() {
    let mappingRecord;
    if (this.isMaturityLevelApplicable && this.maturityLevelMappings) {
      mappingRecord = this.maturityLevelMappings.find((x: any) => Math.round(this.checklistScorePercentage) >= x.loweR_BOUND_SCORE &&
        Math.round(this.checklistScorePercentage) <= x.uppeR_BOUND_SCORE);
      if (mappingRecord != null) {
        this.checklistmaturitylevelid = mappingRecord.maturitY_LEVEL_ID;
        this.checklistmaturitylevel = mappingRecord.leveL_TITLE;
      }
      else {
        this.checklistmaturitylevelid = 0;
        this.checklistmaturitylevel = '';
      }
    }
  }

  /**
   * Calculate average score from all checkpoints
   * Only counts questions that have a score > 0 (excludes N/A status)
   */
  calculateAverageScore() {
    let totalScore = 0;
    let questionCount = 0;

    this.checkListDataNew.forEach((serviceArea: any) => {
      serviceArea.checkpointS_BY_PROCESS_MODEL.forEach((processModel: any) => {
        processModel.checkpointS_BY_PROCESS_AREA.forEach((processArea: any) => {
          processArea.checkpointS_BY_PROCESS.forEach((process: any) => {
            process.checkpoints.forEach((checkpoint: any) => {
              if (checkpoint.score !== undefined && checkpoint.score !== null) {
                const score = parseFloat(checkpoint.score.toString());
                // Only count questions with score > 0 (exclude N/A status)
                if (score > 0) {
                  totalScore += score;
                  questionCount++;
                }
              }
            });
          });
        });
      });
    });

    this.averageScore = questionCount > 0 ? +(totalScore / questionCount).toFixed(2) : 0;
  }

  // Assessment Utility wrapper methods
  getServiceAreaMaturityLevel(percentage: number) {
    return this._assessmentUtil.getServiceAreaMaturityLevel(this.maturityLevelMappings, percentage);
  }

  getServiceAreaScore(serviceArea: any) {
    return this._assessmentUtil.getServiceAreaScore(serviceArea);
  }

  getServiceAreaMaxScore(serviceArea: any) {
    return this._assessmentUtil.getServiceAreaMaxScore(this.maxMultiplier, this.checklistStatusValues, this.hideweightage, serviceArea);
  }

  getServiceAreaPercentage(serviceArea: any) {
    return this._assessmentUtil.getServiceAreaPercentage(serviceArea);
  }

  getServiceAreaUpdatedScore(serviceArea: any) {
    return this._assessmentUtil.getServiceAreaUpdatedScore(serviceArea);
  }

  getServiceAreaUpdatedPercentage(serviceArea: any) {
    return this._assessmentUtil.getServiceAreaUpdatedPercentage(serviceArea);
  }

  getProcessModelMaturityLevel(percentage: number) {
    return this._assessmentUtil.getProcessModelMaturityLevel(this.maturityLevelMappings, percentage);
  }

  getProcessModelScore(processModel: any) {
    return this._assessmentUtil.getProcessModelScore(processModel);
  }

  getProcessModelMaxScore(processModel: any) {
    return this._assessmentUtil.getProcessModelMaxScore(processModel, this.maxMultiplier, this.checklistStatusValues, this.hideweightage);
  }

  getProcessModelPercentage(processModel: any) {
    return this._assessmentUtil.getProcessModelPercentage(processModel);
  }

  getProcessModelUpdatedScore(processModel: any) {
    return this._assessmentUtil.getProcessModelUpdatedScore(processModel);
  }

  getProcessModelUpdatedPercentage(processModel: any) {
    return this._assessmentUtil.getProcessModelUpdatedPercentage(processModel);
  }

  getProcessAreaMaturityLevel(percentage: number) {
    return this._assessmentUtil.getProcessAreaMaturityLevel(percentage, this.maturityLevelMappings);
  }

  getProcessAreaScore(parea: any) {
    return this._assessmentUtil.getProcessAreaScore(parea);
  }

  getProcessAreaMaxScore(processArea: any) {
    return this._assessmentUtil.getProcessAreaMaxScore(processArea, this.maxMultiplier, this.checklistStatusValues, this.hideweightage);
  }

  getProcessAreaPercentage(processArea: any) {
    return this._assessmentUtil.getProcessAreaPercentage(processArea);
  }

  getProcessAreaUpdatedScore(parea: any) {
    return this._assessmentUtil.getProcessAreaUpdatedScore(parea);
  }

  getProcessAreaUpdatedercentage(processArea: any) {
    return this._assessmentUtil.getProcessAreaUpdatedercentage(processArea);
  }

  getProcessScore(process: any) {
    return this._assessmentUtil.getProcessScore(process);
  }

  getProcessMaxScore(process: any) {
    return this._assessmentUtil.getProcessMaxScore(process, this.maxMultiplier, this.checklistStatusValues, this.hideweightage)
  }

  getProcessPercentage(process: any) {
    return this._assessmentUtil.getProcessPercentage(process);
  }

  getProcessUpdatedScore(process: any) {
    return this._assessmentUtil.getProcessUpdatedScore(process);
  }

  getProcessUpdatedPercentage(process: any) {
    return this._assessmentUtil.getProcessUpdatedPercentage(process);
  }

  // Save and Submit Methods
  SaveCheckListExecutionNew(status: string) {
    this.ValidateChecklist(status);
  }

  ValidateChecklist(status: string) {
    let message;
    this.isFromValidation = true;
    this._appService.getChecklistList().subscribe({
      next: (data: any) => {
        this.checklistList = data;
        if (this.checklistList.length > 0) {
          var getUsedChecklistDtls = this.checklistList.filter((x: any) => x.id == this.selectedchecklist);
          var ChecklistUsedInAssessment = this.checklist.filter((x: any) => x.checklisT_ID == this.selectedchecklist);

          if (getUsedChecklistDtls.length == 0) {
            this._utility.showWarningPopup("Selected checklist is not available.");
            this.isFromValidation = false;
          }

          if (getUsedChecklistDtls[0].iS_WEIGHTAGE_APPLICABLE != ChecklistUsedInAssessment[0].weightagE_APPLICABLE_FLAG) {
            message = getUsedChecklistDtls[0].iS_WEIGHTAGE_APPLICABLE ?
              this.getApplicableMessageForConfirm("Weightage", getUsedChecklistDtls) : this.getNotApplicableMessageForConfirm("Weightage", getUsedChecklistDtls);
            this.confrimMessage(message);
            this.isFromValidation = false;
          }

          if (getUsedChecklistDtls[0].maturitY_LEVEL != ChecklistUsedInAssessment[0].maturitY_LEVEL_APPLICABLE) {
            message = getUsedChecklistDtls[0].maturitY_LEVEL ? this.getApplicableMessageForConfirm("Maturity Level", getUsedChecklistDtls) : this.getNotApplicableMessageForConfirm("Maturity Level", getUsedChecklistDtls);
            this.confrimMessage(message);
            this.isFromValidation = false;
          }

          if (getUsedChecklistDtls[0].statuS_LIST_ID != ChecklistUsedInAssessment[0].checklisT_STATUS_LIST_ID) {
            message = "Status changed by " + getUsedChecklistDtls[0].updateD_NAME + " ) for the checklist " + getUsedChecklistDtls[0].title + '( ' + getUsedChecklistDtls[0].version + '-' + getUsedChecklistDtls[0].effectivE_FROM.slice(0, 10) + ").";
            this.confrimMessage(message);
            this.isFromValidation = false;
          }

          if (getUsedChecklistDtls[0].correctivE_ACTION_TRACKING != ChecklistUsedInAssessment[0].correctivE_ACTION_TRACKING) {
            message = getUsedChecklistDtls[0].correctivE_ACTION_TRACKING ?
              this.getApplicableMessageForConfirm("Corrective Action Tracking", getUsedChecklistDtls) : this.getNotApplicableMessageForConfirm("Corrective Action Tracking", getUsedChecklistDtls);
            this.confrimMessage(message);
            this.isFromValidation = false;
          }
          
          if (this.isFromValidation) {
            if (status == "AFSubmit") {
              this._utility.showWarningConfirmation(
                "Are you sure you want to submit? After submission no change is possible",
                "Confirm Submission"
              ).subscribe((result: boolean) => {
                if (result) {
                  this.ValidateFieldsNew(status);
                }
              });
            }
            else {
              this.fillDetailsNew(status);
              this.service_SaveAuditChecklistDetails(status);
            }
          }
        }
      },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  confrimMessage(message: string) {
    this._utility.showWarningConfirmation(message, "Confirm Action").subscribe((result: boolean) => {
      if (result) {
        this.getCheckListAuditData(this.selectedAuditId, this.selectedServiceArea, this.auditDataTitle, this.startDate, this.endDate, this.selectedAuditor, this.selectedAuditees, '', this.plannedHours, this.actualHours, this.actualstartDate, this.actualendDate);
      }
    });
  }

  getApplicableMessageForConfirm(content: string, checklistDetails: any) {
    return content + " is marked as applicable for the checklist " + checklistDetails[0].title + '( ' + checklistDetails[0].version + '-' + checklistDetails[0].effectivE_FROM.slice(0, 10) + " ) by " + checklistDetails[0].updateD_NAME;
  }

  getNotApplicableMessageForConfirm(content: string, checklistDetails: any) {
    return content + " is marked as not applicable for the checklist " + checklistDetails[0].title + '( ' + checklistDetails[0].version + '-' + checklistDetails[0].effectivE_FROM.slice(0, 10) + ") by " + checklistDetails[0].updateD_NAME;
  }

  ValidateFieldsNew(status: string) {
    // Reset validation states
    this.validationAttempted = true;
    this.resetValidationErrors();

    if (this.isMaturityLevelApplicable && this.checklistmaturitylevelid == 0 && this.maturityLevelMappings.length > 0) {
      this.hasMaturityLevelError = true;
      this._utility.showWarningPopup('Maturity level is applicable. Choose appropriate status so that Maturity level is calculated.');
      return;
    }

    if (this.auditDataTitle != null && this.selectedAuditor != undefined && this.selectedAuditor != "0" && this.selectedAuditees != undefined && this.selectedAuditees.length > 0 &&
      this.startDate != undefined && this.endDate != undefined && this.actualstartDate != undefined && this.actualendDate != undefined
      && this.plannedHours != undefined && this.actualHours != undefined) {
      if (!this.validateAllQuestions()) {
        this._utility.showWarningPopup("Please choose a status for all the questions");
        return;
      }
      if (!this.validateFindingsNew()) {
        this._utility.showWarningPopup('Please enter findings for questions with not met status');
        return;
      }
      if (!this.CheckIfMandtoryFindingTypesFilled()) {
        this._utility.showWarningPopup(this.bindAlertText());
        return;
      }
      this.fillDetailsNew(status);
      this.service_SaveAuditChecklistDetails(status);
    }
    else {
      if (this.selectedAuditor == "0" || this.selectedAuditor == undefined) {
        this.hasAppraiserError = true;
        this._utility.showWarningPopup('Please choose an Appraiser');
        return;
      }

      if (this.selectedAuditees == undefined || this.selectedAuditees.length == 0) {
        this.hasAppraiseeError = true;
        this._utility.showWarningPopup('Please choose Appraisees');
        return;
      }

      if (this.actualstartDate == undefined || this.actualstartDate == null) {
        this.hasActualStartError = true;
        this._utility.showWarningPopup('Please enter actual start date');
        return;
      }

      if (this.actualendDate == undefined || this.actualendDate == null) {
        this.hasActualEndError = true;
        this._utility.showWarningPopup('Please enter actual end date');
        return;
      }

      if (this.startDate == undefined || this.startDate == null) {
        this.hasPlannedStartError = true;
        this._utility.showWarningPopup('Please enter planned start date');
        return;
      }

      this._utility.showWarningPopup('Please enter valid values for all assessment fields');
      return;
    }
  }

  resetValidationErrors() {
    this.hasAppraiserError = false;
    this.hasAppraiseeError = false;
    this.hasActualStartError = false;
    this.hasActualEndError = false;
    this.hasPlannedStartError = false;
    this.hasMaturityLevelError = false;
  }

  // Methods to clear individual field errors when user makes changes
  onAppraiserChange() {
    if (this.selectedAuditor && this.selectedAuditor !== "0") {
      this.hasAppraiserError = false;
    }
  }

  onAppraiseeChange() {
    if (this.selectedAuditees && this.selectedAuditees.length > 0) {
      this.hasAppraiseeError = false;
    }
  }

  onActualStartDateChange() {
    if (this.actualstartDate) {
      this.hasActualStartError = false;
    }
  }

  onActualEndDateChange() {
    if (this.actualendDate) {
      this.hasActualEndError = false;
    }
  }

  onPlannedStartDateChange() {
    if (this.startDate) {
      this.hasPlannedStartError = false;
    }
  }

  validateAllQuestions() {
    if (this.checkListDataNew.length == 0)
      return true;

    for (let i = 0; i < this.checkListDataNew.length; i++) {
      for (let n = 0; n < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
        for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
          for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; j++) {
            for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints.length; k++) {
              if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].statuS_VALUE_ID == undefined ||
                this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].statuS_VALUE_ID == 0)
                return false;
            }
          }
        }
      }
    }

    return true;
  }

  validateFindingsNew() {
    for (let i = 0; i < this.checkListDataNew.length; i++) {
      for (let n = 0; n < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
        for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
          for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; k++) {
            for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints.length; j++) {
              if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].statuS_CATEGORY == "NMET") {
                if (!this.checkIfAny1MandatoryFindingentered(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].findings))
                  return false;
              }
            }
          }
        }
      }
    }

    return true;
  }

  checkIfAny1MandatoryFindingentered(findings: any[]) {
    let flag = false;
    for (let i = 0; i < findings.length; i++) {
      if (findings[i].findinG_CATEGORY == 'MANDATORY') {
        if (findings[i].findinG_DESCRIPTION != undefined && findings[i].findinG_DESCRIPTION.trim().length > 0) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }

  // Helper method to check if a question needs findings (for highlighting)
  needsFindingsHighlight(checkpoint: any): boolean {
    if (!this.validationAttempted) return false;
    if (checkpoint.statuS_CATEGORY === 'NMET') {
      // Check if mandatory findings are missing
      return !this.checkIfAny1MandatoryFindingentered(checkpoint.findings || []);
    }
    return false;
  }

  // Helper method to check if a question is missing status
  needsStatusHighlight(checkpoint: any): boolean {
    if (!this.validationAttempted) return false;
    return checkpoint.statuS_VALUE_ID == undefined || checkpoint.statuS_VALUE_ID == 0;
  }

  CheckIfMandtoryFindingTypesFilled() {
    let flag = true;

    if (this.MandatoryFindingsTypeForFailedStatus.length > 0) {
      for (let i = 0; i < this.checkListDataNew.length; i++) {
        for (let n = 0; n < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
          for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
            for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; k++) {
              for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints.length; j++) {
                if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].statuS_CATEGORY == "NMET") {
                  if (!this.checkMandatoryFindingsEntered(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].findings))
                    return flag = false;
                }
              }
            }
          }
        }
      }
    }
    return flag;
  }

  checkMandatoryFindingsEntered(findings: any[]) {
    let flag = true;
    if (findings.length > 0) {
      let count = 0;
      for (let i = 0; i < findings.length; i++) {
        if (this.MandatoryFindingsTypeForFailedStatus.includes(findings[i].findinG_TYPE) && findings[i].findinG_DESCRIPTION != '') {
          count++;
        }
      }

      if (count == 0) {
        flag = false;
      }
    }

    return flag;
  }

  bindAlertText() {
    let getMandatoryFindingTypesText = this.MandatoryFindingsTypeForFailedStatus.toString();
    let alertText = "Please enter atleast one finding of type (" + getMandatoryFindingTypesText + ") for the questions which are in fail status and Submit.";
    return alertText;
  }

  fillDetailsNew(status: string) {
    this.checklistExeViewModel = {};
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY = {};
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.id = this.checklistSummaryRec.id;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.checklisT_ID = this.selectedchecklist;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.assessmenT_ID = this.selectedAuditId;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.customeR_ID = this.custId;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.projecT_ID = this.projId;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.planneD_AUDIT_START_DATE = this.startDate ? new Date(this.startDate).toDateString() : null;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.planneD_AUDIT_END_DATE = this.endDate ? new Date(this.endDate).toDateString() : null;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.actuaL_AUDIT_START_DATE = this.actualstartDate ? new Date(this.actualstartDate).toDateString() : null;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.actuaL_AUDIT_END_DATE = this.actualendDate ? new Date(this.actualendDate).toDateString() : null;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.audiT_ACTUAL_HOURS = this.actualHours;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.audiT_PLANNED_HOURS = this.plannedHours;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.audiT_TITLE = this.auditDataTitle;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.auditoR_ID = this.selectedAuditor;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.versioN_ID = this.checklistversion;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.score = this.checklistScore;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.percentagE_SCORE = this.checklistScorePercentage;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.auditeE_LIST = this.selectedAuditees ? this.selectedAuditees : [];
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.cC_LIST = this.selectedCCs ? this.selectedCCs : [];
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.tO_LIST = this.selectedTos ? this.selectedTos : [];
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.issubmitted = (status == 'AFSubmit') ? true : false;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.maiL_SENT = this.checklistSummaryRec.maiL_SENT;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.totaL_SCORE = this.checklistOutofScore;
    if (this.isMaturityLevelApplicable)
      this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.maturitY_LEVEL_ID = this.checklistmaturitylevelid;
    else
      this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.maturitY_LEVEL_ID = 0;
  }

  service_SaveAuditChecklistDetails(status: string) {
    this.IsSubmitted = true;

    if (status == "AFSubmit")
      this.checkEveryQuestion(this.checkListDataNew);
    else
      this.uncheckEveryQuestion(this.checkListDataNew);

    if (status == "AFSubmit")
      this.isdataSubmitted = false;

    this.checklistExeViewModel.audiT_CHECKLIST_BY_SERVICE_AREA_LIST = this.checkListDataNew;
    this._appService.SaveAuditChecklistDetails(this.checklistExeViewModel).subscribe(
      (data: any) => {
        if (status == "AFSubmit") {
          this._utility.showSuccessPopup("Data Submitted Successfully");
          this.checkListDataNew = data.audiT_CHECKLIST_BY_SERVICE_AREA_LIST;
          this.checklistSummaryRec = data.audiT_CHECKLIST_EXECUTION_SUMMARY;
          this.IsSubmitted = true;
          this.isdataSubmitted = true;
          this.issubmitenabled = true;
        }
        else {
          this._utility.showSuccessPopup('Data saved Successfully');
          this.checkListDataNew = data.audiT_CHECKLIST_BY_SERVICE_AREA_LIST;
          this.checklistSummaryRec = data.audiT_CHECKLIST_EXECUTION_SUMMARY;
          this.IsSubmitted = false;
          this.IsChecklistDisabled = false;
        }
      },
      (error: any) => {
        this._utility.serviceError(error); 
        this.IsSubmittednew = false; 
        this.IsSubmitted = false;
        this.isdataSubmitted = true; 
        this.uncheckEveryQuestion(this.checkListDataNew);
      }
    )
  }

  checkEveryQuestion(checklistData: any[]) {
    checklistData.forEach((x: any) => {
      x.checkpointS_BY_PROCESS_MODEL.forEach((x: any) => {
        x.checkpointS_BY_PROCESS_AREA.forEach((x: any) => {
          x.checkpointS_BY_PROCESS.forEach((x: any) => {
            x.checkpoints.forEach((x: any) => {
              x.issubmitted = true;
              x.findings.forEach((x: any) => {
                x.issubmitted = true;
              })
            });
          })
        })
      })
    })
  }

  uncheckEveryQuestion(checklistData: any[]) {
    checklistData.forEach((x: any) => {
      x.checkpointS_BY_PROCESS_MODEL.forEach((x: any) => {
        x.checkpointS_BY_PROCESS_AREA.forEach((x: any) => {
          x.checkpointS_BY_PROCESS.forEach((x: any) => {
            x.checkpoints.forEach((x: any) => {
              x.issubmitted = false;
              x.findings.forEach((x: any) => {
                x.issubmitted = false;
              })
            });
          })
        })
      })
    })
  }

  changeChecklistStatus(data: any[]) {
    this._appService.enableChecklistStatus(data).subscribe({
      next: (data: any) => {
        this.checkListDataNew = data;
        this.issubmitenabled = false;
      },
      error: (error: any) => { this._utility.serviceError(error) }
    })
  }

  showFindingPopup(fdata: any, i: number) {
    fdata.customeR_ID = this.custId;
    fdata.projecT_ID = this.projId;
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = false;
    dialogConfig.width = '95%';
    dialogConfig.maxWidth = '1200px';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.data = {
      'fdata': fdata,
      'findingsTypes': this.dataSentToPopup,
      'index': i
    };

    const dialogRef = this.dialog.open(ChecklistFindingsNewComponent, dialogConfig);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh data if needed
      }
    });
  }

  /**
   * Check if current checklist is RunOps/IT Operations checklist
   */
  isRunOpsChecklist(): boolean {
    const selected = this.checklist?.find((item: any) => item.checklisT_ID === this.selectedchecklist);
    const checklistName = selected?.checklisT_NAME?.toLowerCase() || '';
    
    return checklistName.includes('it operation') || 
           checklistName.includes('runops') || 
           checklistName.includes('run ops');
  }

  /**
   * Open maturity level image in new window
   */
  onClickMaturityLink() {
    // Check if checklist name contains "IT Operation" or "RunOps"
    if (this.isRunOpsChecklist()) {
      // Open IT Operations Maturity Assessment PNG
      window.open('/assets/images/Maturity_level_Definition.png', '_blank');
    } else {
      // Open default maturity level audit image
      window.open('/assets/images/maturitylevelaudit.png', '_blank');
    }
  }

  /**
   * Navigate to IT Operations Dashboard
   */
  openITOpsDashboard(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this._router.navigate(['/sqamanagement/dashboard-itops']);
  }
}
