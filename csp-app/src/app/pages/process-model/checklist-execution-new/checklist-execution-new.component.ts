import { Component, OnInit, Input, ViewEncapsulation, ViewChild, ChangeDetectorRef, PACKAGE_ROOT_URL, Inject, Optional, TemplateRef } from '@angular/core';
import { AppsService } from '../../../Services/apps.service'
import { myUtility } from '../../../Shared/myUtility';
import { assessmentUtility } from '../../../Shared/assessmentUtility';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogConfig, MatDialog, MatDialogRef, MatDatepickerInput, MatRadioButton, MatRadioGroup, MatSelect, MatCheckboxChange, MAT_DIALOG_DATA } from '@angular/material';
import { ChecklistFindingsNewComponent } from './checklist-findings-new/checklist-findings-new.component';
import { AuditCheckListModel, ObservationModel, AuditChecklistModelNew, ChecklistNew, AuditChecklistByProcess, AuditChecklistByProcessArea, ChecklistExecutionSummary, ChecklistExecutionViewModel, custData } from '../../../models/audit-checklist-based-model';
import { CheckListExecutionModel } from '../../../models/checklist-execution';
import { AccessControl } from '../../../Shared/accessControl';
import { error } from 'protractor';
import { ChecklistAuditeeComponent } from '../checklist-auditee/checklist-auditee.component';
import { findingModel } from '../../../models/qaassesmentdetails-model';
import { EmpInfoModel, projResourceExtended } from '../../../models/emp-info-model';
import { max } from 'rxjs/operators';
import { DeliveryDetailsModel } from '../../../models/delivery-model';
import { ActivatedRoute, Router } from '@angular/router';
import { ChecklistModel } from '../../../models/checklist-model';

@Component({
  selector: 'app-checklist-execution-new',
  templateUrl: './checklist-execution-new.component.html',
  styleUrls: ['./checklist-execution-new.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ChecklistExecutionNewComponent implements OnInit {

  notApplicableId: number;
  originalPlannedAudits: any[] = [];
  checklistStatusValues: any[] = [];
  originalCCList: EmpInfoModel[] = [];
  originalToList: EmpInfoModel[] = [];
  tolist: EmpInfoModel[] = [];
  cclist: EmpInfoModel[] = [];
  issubmitenabled: boolean;
  auditorList: any;
  @Input("processDescription") processDescription: any[];
  custIds: string[] = [];
  ddData: any;
  endDate: Date;
  selected: number = -1;
  isChecked: boolean[] = new Array();
  showAddition: boolean = false;
  actualHours: number;
  plannedHours: number;
  auditscope: string;
  IsSavedAuditsExpand: boolean = false;
  custId: string;
  selectedAuditId: number;
  auditId: number;
  checkListData: AuditCheckListModel[] = [];
  projId: string;
  IsSubmitted: boolean = false;
  submittedAll: boolean = false;
  selectedAuditees: any[] = [];
  auditeesList: any;
  flag: boolean;
  selectedProcessModel: any;
  selectedServiceArea: any[] = [];
  selectedAuditor: string
  versionId: number;
  serviceArea: any;
  gavsserviceArea: any;
  auditDataTitle: string;
  startDate: Date;
  actualstartDate: Date;
  actualendDate: Date;
  savedCheckListaudits: any;
  isExpanded: boolean = false;
  IsSavedAuditsLoaded: boolean = false;
  plannedAudits: any[] = [];
  checkListDataNew: AuditChecklistModelNew[] = [];
  serviceAreaNew: any[] = [];
  checklistStatus: string;
  IsSubmittednew: boolean;
  checklistversion: number;
  checklist: ChecklistNew[] = [];
  selectedchecklist: number
  statusCategory: string;
  checklistScore: any;
  hideweightage: boolean = false;
  dataSentToPopup: any;
  maxMultiplier: number;
  checklistmaturitylevelid: number;
  checklistmaturitylevel: string = '';
  searchCustomerValue: string;
  searchCCValue: string;
  searchToValue: string;
  selectedCCs = [];
  selectedTos = [];
  completed: boolean;
  checklistSummaryRec = new ChecklistExecutionSummary();
  checklistExeViewModel = new ChecklistExecutionViewModel();
  Customer: custData[] = [];
  @ViewChild('statusRadio') staturRadio: MatRadioGroup
  @ViewChild('confirmationDialog') confirmationDialogTemplate: TemplateRef<any>
  originalCustomer: any[];

  AllServiceArea: boolean;
  AllProcessModel: boolean;
  AllProcessArea: boolean;
  AllProcess: boolean;
  IsChecklistDisabled: boolean;
  sub: any;
  input_auditid: number;
  allcust: boolean = false;
  allproj: boolean = false;
  isDisabledIncludeAssessment: boolean = false;
  isCreateAccessDisabled: boolean = true;
  checklistList: ChecklistModel[] = [];
  isFromValidation: boolean = false;
  isFromDashboard: boolean = false;
  selectedIndex: number;
  checklistOutofScore: number;
  custidParam: any;
  projIdParam: any;
  MandatoryFindingsTypeForFailedStatus: any = [];
  findingTypeId: number;
  comments: any;
  result: any;
  isApproved: boolean = false;
  plannedAuditData: plannedAuditData;
  isLoading: boolean = false;
  findings: any;
  isRetainCapa: boolean = false;
  updatedChecklistScore: any;
  updatedChecklistScorePercentage: any;
  checklistScorePercentage: any;
  auditReportData: AuditChecklistModelNew[] = [];

  constructor(private _router: Router, public _access: AccessControl, private _appService: AppsService, private cdref: ChangeDetectorRef,
    private _util: myUtility, private _assessmentUtil: assessmentUtility, private _http: HttpClient, public dialog: MatDialog, private route: ActivatedRoute,
    @Optional() private qaSummaryDialog: MatDialogRef<ChecklistExecutionNewComponent>, @Optional() @Inject(MAT_DIALOG_DATA) public qaSummaryData: any) {
    if (this._access.IsAllowed(805, 2, '', '')) // All rights for Quality and BUHeads
    {
      this.allcust = true;
      this.allproj = true;
      this.isCreateAccessDisabled = false;
    }
    else if (this._access.IsAllowed(805, 1, '', '')) {
      this.allcust = false;
      this.allproj = false;
      this.isCreateAccessDisabled = false;    // CSM & PM have to edit the checklist
    }

  }
  selectFormControl = new FormControl('', Validators.required);
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

  resubmitAssessmentApproval(approvers, empId) {
    this.route.params.subscribe(params => {
      if (params['isApproveReject'] != undefined) {
        const approversArray = approvers.split(',');
        if (!approversArray.includes(empId)) {
          alert("Sorry! You are not authorized to approve project related settings");
          this._router.navigateByUrl('/newdashboard/custm');
        }
        else {
          this.plannedAuditData = new plannedAuditData();
          this.plannedAuditData.cusT_ID = params['custid'];
          this.plannedAuditData.proj_ID = params['projid'];
          this.plannedAuditData.emP_ID = empId;
          this.plannedAuditData.assessmenT_ID = Number(params['auditid']);
          this.plannedAuditData.statuS = params['isApproveReject'] == "1" ? "Approved" : "Rejected";
          this.plannedAuditData.commentS = prompt("Please enter comments", "");

          if (this.plannedAuditData.commentS == "" || this.plannedAuditData.commentS == undefined || this.plannedAuditData.commentS == null) {
            alert("Please enter comments");
          }
          else {
            this._appService.revertChecklistAssessmentData(this.plannedAuditData).subscribe(
              data => {
                if (this.plannedAuditData.statuS == "Approved") {
                  alert("Asssessment Reverted Successfully");
                }
              },
              error => {
                this._util.serviceError(error);
              }
            )
          }
        }
      }
    });
  }

  showFindingPopup(fdata: CheckListExecutionModel, i: number) {
    fdata.customeR_ID = this.custId;
    fdata.projecT_ID = this.projId;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'fdata': fdata,
      'findingsTypes': this.dataSentToPopup,
      'index': i
    }

    dialogConfig.height = "80%";
    dialogConfig.width = "80%"
    const dialogRef = this.dialog.open(ChecklistFindingsNewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  onClose() {
    this.qaSummaryDialog.close();
  }

  selectAllServiceArea(event: MatCheckboxChange, data: AuditChecklistModelNew) {
    if (event.checked)
      this.setNotApplicableValueForServiceArea(data, this.notApplicableId, event.checked, 100, "N/A")
    else
      this.setNotApplicableValueForServiceArea(data, 0, event.checked, 0, null);
  }


  selectAllProcessArea(event: MatCheckboxChange, data) {
    if (event.checked)
      this.setNotApplicableValueForProcessArea(data, this.notApplicableId, event.checked, 100, "N/A")
    else
      this.setNotApplicableValueForProcessArea(data, 0, event.checked, 0, null);
  }

  selectAllProcessModel(event: MatCheckboxChange, data) {

    if (event.checked)
      this.setNotApplicableValueForProcessModel(data, this.notApplicableId, event.checked, 100, "N/A")
    else
      this.setNotApplicableValueForProcessModel(data, 0, event.checked, 0, null);
  }

  selectAllProcess(event: MatCheckboxChange, data) {
    if (event.checked)
      this.setNotApplicableValueForProcess(data, this.notApplicableId, event.checked, 100, "N/A")
    else
      this.setNotApplicableValueForProcess(data, 0, event.checked, 0, null);
  }

  setNotApplicableValueForProcess(data, value, status, percentage, category) {
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

  setNotApplicableValueForProcessModel(data, value, status, percentage, category) {

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

    //this.cdref.detectChanges();
  }
  getMinDate(): Date {
    return this.startDate ? this.startDate : new Date();
  }

  setNotApplicableValueForProcessArea(data, value, status, percentage, category) {

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

  setNotApplicableValueForServiceArea(data, value, status, percentage, category) {

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

  changeChecklistStatus(data: AuditChecklistModelNew[]) {
    this._appService.enableChecklistStatus(data).subscribe(data => {
      this.checkListDataNew = data;
      this.issubmitenabled = false;
    }, (error) => { this._util.serviceError(error) })
  }

  project_onChange($event) {
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
      this.custidParam = undefined; this.projIdParam = undefined;
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
    this._appService.GetCustomerList(localStorage.getItem("empid"), false).subscribe(
      (data) => {
        this.Customer = data;
        this.originalCustomer = data;
      },
      (error) => {
        this._util.serviceError(error);
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
        this._util.serviceError(error);
      }
    );

  }

  autoGrowTextZone(e) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 10) + "px";
  }

  getCCList() {
    this._appService.getCCListForChecklist(this.custId).subscribe(data => {
      this.cclist = data;
      this.originalCCList = data;
      this.tolist = data;

    },
      (error) => { this._util.serviceError(error) });

  }

  getversion(version: number) {
    return parseFloat(version.toString());
  }

  checkifNoFindings(event, row) {
    let anyrec = this.checklistStatusValues.find(x => x.id == row.statuS_VALUE_ID);
    if (anyrec != undefined)
      row.statuS_CATEGORY = anyrec.statuS_CATEGORY;
    else
      row.statuS_CATEGORY = "N/A";

    if (row.statuS_CATEGORY == "N/A") {
      if (this.isAnyFindingsEntered(row.findings)) {
        alert('remove the findings entered and change option')
        return false;
      }
    }

    return true;
  }

  setStatusCategory(row, process: AuditChecklistByProcess, processArea, serviceArea) {

    let anyrec = this.checklistStatusValues.find(x => x.id == row.statuS_VALUE_ID);
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

  isAnyFindingsEntered(findings: ObservationModel[]) {
    for (let i = 0; i < findings.length; i++) {
      if (findings[i] != undefined && findings[i].findinG_DESCRIPTION.trim().length > 0)
        return true;
    }

    return false;
  }

  //Service Area
  getServiceAreaMaturityLevel(percentage) {
    let level = this._assessmentUtil.getServiceAreaMaturityLevel(this.maturityLevelMappings, percentage);
    return level;
  }

  getServiceAreaScore(serviceArea: AuditChecklistModelNew) {
    let score = this._assessmentUtil.getServiceAreaScore(serviceArea);
    return score;
  }

  getServiceAreaMaxScore(serviceArea: AuditChecklistModelNew) {
    let score = this._assessmentUtil.getServiceAreaMaxScore(this.maxMultiplier, this.checklistStatusValues, this.hideweightage, serviceArea);
    return score;
  }

  getServiceAreaPercentage(serviceArea: AuditChecklistModelNew) {
    let percentage = this._assessmentUtil.getServiceAreaPercentage(serviceArea);
    return percentage;
  }

  getServiceAreaUpdatedScore(serviceArea: AuditChecklistModelNew) {
    let score = this._assessmentUtil.getServiceAreaUpdatedScore(serviceArea);
    return score;
  }

  getServiceAreaUpdatedPercentage(serviceArea: AuditChecklistModelNew) {
    let percentage = this._assessmentUtil.getServiceAreaUpdatedPercentage(serviceArea);
    return percentage;
  }

  //Process Model
  getProcessModelMaturityLevel(percentage) {
    let maturityLevel = this._assessmentUtil.getProcessModelMaturityLevel(this.maturityLevelMappings, percentage);
    return maturityLevel;
  }

  getProcessModelScore(processModel) {
    let score = this._assessmentUtil.getProcessModelScore(processModel);
    return score;
  }

  getProcessModelMaxScore(processModel) {
    let maxScore = this._assessmentUtil.getProcessModelMaxScore(processModel, this.maxMultiplier, this.checklistStatusValues, this.hideweightage);
    return maxScore;
  }

  getProcessModelPercentage(processModel) {
    let percentage = this._assessmentUtil.getProcessModelPercentage(processModel);
    return percentage;
  }

  getProcessModelUpdatedScore(processModel) {
    let score = this._assessmentUtil.getProcessModelUpdatedScore(processModel);
    return score;
  }

  getProcessModelUpdatedPercentage(processModel) {
    let percentage = this._assessmentUtil.getProcessModelUpdatedPercentage(processModel);
    return percentage;
  }

  //Process Area
  getProcessAreaMaturityLevel(percentage) {
    let maturityLevel = this._assessmentUtil.getProcessAreaMaturityLevel(percentage, this.maturityLevelMappings);
    return maturityLevel;
  }

  getProcessAreaScore(parea: AuditChecklistByProcessArea) {
    let score = this._assessmentUtil.getProcessAreaScore(parea);
    return score;
  }

  getProcessAreaMaxScore(processArea: AuditChecklistByProcessArea) {
    let score = this._assessmentUtil.getProcessAreaMaxScore(processArea, this.maxMultiplier, this.checklistStatusValues, this.hideweightage);
    return score;
  }

  getProcessAreaPercentage(processArea: AuditChecklistByProcessArea) {
    let percentage = this._assessmentUtil.getProcessAreaPercentage(processArea);
    return percentage;
  }

  getProcessAreaUpdatedScore(parea: AuditChecklistByProcessArea) {
    let score = this._assessmentUtil.getProcessAreaUpdatedScore(parea);
    return score;
  }

  getProcessAreaUpdatedercentage(processArea: AuditChecklistByProcessArea) {
    let percentage = this._assessmentUtil.getProcessAreaUpdatedercentage(processArea);
    return percentage;
  }

  //Process
  getProcessScore(process: AuditChecklistByProcess) {
    let score = this._assessmentUtil.getProcessScore(process);
    return score;
  }

  getProcessMaxScore(process: AuditChecklistByProcess) {
    let maxScore = this._assessmentUtil.getProcessMaxScore(process, this.maxMultiplier, this.checklistStatusValues, this.hideweightage)
    return maxScore;
  }

  getProcessPercentage(process: AuditChecklistByProcess) {
    let percentage = this._assessmentUtil.getProcessPercentage(process);
    return percentage;
  }

  getProcessUpdatedScore(process: AuditChecklistByProcess) {
    let score = this._assessmentUtil.getProcessUpdatedScore(process);
    return score;
  }

  getProcessUpdatedPercentage(process: AuditChecklistByProcess) {
    let percentage = this._assessmentUtil.getProcessUpdatedPercentage(process);
    return percentage;
  }

  getScoreInPercentage(row) {
    let acheivedscore = 0;
    let maxscore = 0;
    this.checkListDataNew.forEach(x => {
      x.checkpointS_BY_PROCESS_MODEL.forEach(x => {
        x.checkpointS_BY_PROCESS_AREA.forEach(x => {
          x.checkpointS_BY_PROCESS.forEach(x => {
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

  }

  setMaturityLevel() {
    let mappingRecord;
    if (this.isMaturityLevelApplicable && this.maturityLevelMappings) {
      mappingRecord = this.maturityLevelMappings.find(x => Math.round(this.checklistScorePercentage) >= x.loweR_BOUND_SCORE &&
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

  getOverallScore() {
    let oscore = 0;
    this.checkListDataNew.forEach(x => {
      x.checkpointS_BY_PROCESS_MODEL.forEach(x => {
        x.checkpointS_BY_PROCESS_AREA.forEach(x => {
          x.checkpointS_BY_PROCESS.forEach(x => {
            x.checkpoints.forEach(x => {
              oscore = oscore + parseFloat(x.score.toString());
            });
          });
        })
      })
    });
    this.checklistScore = oscore;
    this.updatedChecklistScore = oscore;
  }

  getScoreForStatus(row) {

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

    this.maxMultiplier = Math.max(...this.checklistStatusValues.map(x => x.multiplier), 0);
    var multiplier;
    var rec = this.checklistStatusValues.find(x => x.id == row.statuS_VALUE_ID);
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

  GetAuditAssesment(i, auditid, serviceAreas, title, startdate, enddate, auditorid, auditeessid, status, plannedhour, actualhour, actualstartdate, actualenddate) {
    this.clearAll();
    this.IsSavedAuditsLoaded = false;
    this.plannedAudits.forEach(function (element, index) {
      if (index != i)
        element.iS_CHECKED = false;
      else
        element.iS_CHECKED = true;
    });
    this.auditDataTitle = undefined;
    this.getCheckListAuditData(auditid, serviceAreas, title, startdate, enddate, auditorid, auditeessid, status, plannedhour, actualhour, actualstartdate, actualenddate);
  }
  getDropDownParams() {
    this.service_getDropDownDataForAudit()
  }
  getSavedChecklistAudits() {
    this._appService.getSavedCheckListAudits(this.custId, this.projId).subscribe(
      data => {
        this.savedCheckListaudits = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  Service_GetPlannedAudits(custid, projid) {
    this.isLoading = true;
    this.IsSavedAuditsLoaded = false;
    this._appService.getPlannedAudits(custid, projid).subscribe(data => {
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
    }, (error) => {
      this.isLoading = false;
      this._util.serviceError(error)
    })
  }

  getOpenFindingsCount(auditIds) {
    this._appService.getOpenFindingsCount(auditIds).subscribe(
      data => {
        this.findings = data;
        if (this.plannedAudits && this.plannedAudits.length > 0) {
          this.IsSavedAuditsLoaded = true;
        }
      },
      error => {
        this._util.serviceError(error);
      })
  }

  getFindingsCount(id) {
    let count = this._util.getFindingsCount(this.findings, id, "total");
    return count;
  }
  getOpenFindingCount(id) {
    let count = this._util.getFindingsCount(this.findings, id, "open");
    return count;
  }
  getClosedFindingsCount(id) {
    let count = this._util.getFindingsCount(this.findings, id, "closed");
    return count;
  }

  checklistName: string;
  getCheckListAuditData(auditid, serviceareas, title, startdate, enddate, auditorid, auditeessid, status,
    plannedhour, actualhour, actualstartdate, actualenddate) {
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
      this.selectedServiceArea = serviceareas.map(x => +x);
    else
      this.selectedServiceArea = this.serviceAreaNew.map(x => x.id);

    this.checklist = undefined;
    this.IsSubmitted = false;
    this.issubmitenabled = false;

    let data = {
      "audiT_ID": auditid,
      "servicE_AREA_IDS": serviceareas,
      "customeR_ID": this.custId,
      "projecT_ID": this.projId
    };

    this.checklist = undefined;
    this.checklistScore = undefined;
    this.checklistScorePercentage = undefined;
    this.updatedChecklistScore = undefined;
    this.updatedChecklistScorePercentage = undefined;
    this.checklistversion = undefined;
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
          alert('No checklists generated for this Assessment');
          return;
        }
      },
      error => { this._util.serviceError(error); }
    )
  }
  isMaturityLevelApplicable: boolean = false;
  maturityLevelMappings: any[];

  getMappedChecklistData(checklist: ChecklistNew) {
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
    var rec = checklist.checklisT_STATUS_LIST_VALUES.find(x => x.statuS_CATEGORY == "N/A");
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

    // Set audit planned and actual hours

    if (this.checklistSummaryRec.audiT_PLANNED_HOURS != null)
      this.plannedHours = this.checklistSummaryRec.audiT_PLANNED_HOURS;

    if (this.checklistSummaryRec.audiT_ACTUAL_HOURS != null)
      this.actualHours = this.checklistSummaryRec.audiT_ACTUAL_HOURS;

    // Fill Auditor, auditees, cclist, tolist

    if (this.checklistSummaryRec.auditoR_ID != "0")
      this.selectedAuditor = this.checklistSummaryRec.auditoR_ID;

    if (checklist.auditeE_NAMES != null && checklist.auditeE_NAMES.length > 0)
      this.selectedAuditees = checklist.auditeE_NAMES;
    this.checklistSummaryRec.auditeE_LIST = checklist.auditeE_NAMES;


    if (checklist.cC_LIST != null && checklist.cC_LIST.length > 0)
      this.selectedCCs = checklist.cC_LIST;

    if (checklist.tO_LIST != null && checklist.tO_LIST.length > 0)
      this.selectedTos = checklist.tO_LIST;

    // Set Planned and Actual start/end dates

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
  }
  corrective_action_tracking: boolean = false;

  setChecklistData() {

    this.checkListDataNew = undefined;
    let submitflag = false;

    let record = this.checklist.find(x => x.checklisT_ID == this.selectedchecklist);
    this.getMappedChecklistData(record);

  }

  getEmployeeListFromproject() {


    this._appService.getAuditeeDetails(this.custId, this.projId).subscribe(
      data => {
        this.auditeesList = data
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }


  //services
  service_getDropDownDataForAudit() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    let apiuri: string = environment.webapiuri + 'GetDropDownParamsForAudit';
    this._http.get(apiuri, { headers: header })
      .subscribe(data => {
        this.ddData = data;
        this.auditorList = this.ddData.auditoR_LIST;
        this.serviceArea = this.ddData.servicE_AREA;
        this.serviceAreaNew = this.ddData.procesS_SERVICE_AREA_NEW;
      }, error => { this._util.serviceError(error); });
  }
  clearAll() {
    this.checkListDataNew = [];
    this.startDate = null;
    this.endDate = null;
    this.selectedAuditees = null;
    this.selectedAuditor = null;
    this.auditDataTitle = null;
    this.plannedHours = null;
    this.actualHours = null;
    this.auditscope = null;
    this.actualstartDate = null;
    this.actualendDate = null;
    this.selectedServiceArea = [];
    this.selectedCCs = [];
    this.selectedTos = [];
    this.checklistmaturitylevel = '';
  }

  SaveCheckListExecutionNew(status) {
    this.ValidateChecklist(status);
  }



handlePdfExport(i, list) {
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
        alert('File downloaded successfully');
      },
      error => {
        this._util.serviceError(error);
      });
  }


  ValidateFieldsNew(status) {

    if (this.isMaturityLevelApplicable && this.checklistmaturitylevelid == 0 && this.maturityLevelMappings.length > 0) {
      alert('Maturity level is applicable. Choose appropriate status so that Maturity level is calculated.');
      return;
    }

    if (this.auditDataTitle != null && this.selectedAuditor != undefined && this.selectedAuditor != "0" && this.selectedAuditees != undefined && this.selectedAuditees.length > 0 &&
      this.startDate != undefined && this.endDate != undefined && this.actualstartDate != undefined && this.actualendDate != undefined
      && this.plannedHours != undefined && this.actualHours != undefined) {
      if (!this.validateAllQuestions()) {
        alert("Please choose a status for all the questions");
        return;
      }
      if (!this.validateFindingsNew()) {
        alert('Please enter findings for questions with not met status');
        return;
      }
      if (!this.CheckIfMandtoryFindingTypesFilled()) {
        alert(this.bindAlertText());
        return;
      }
      this.fillDetailsNew(status);
      this.service_SaveAuditChecklistDetails(status);
    }
    else {

      if (this.selectedAuditor == "0" || this.selectedAuditor == undefined) {
        alert('Please choose an Appraiser');
        return;
      }

      if (this.selectedAuditees == undefined || this.selectedAuditees.length == 0) {
        alert('Please choose Appraisees');
        return;
      }

      if (this.actualstartDate == undefined || this.actualstartDate == null) {
        alert('Please enter actual start date');
        return;
      }

      if (this.actualendDate == undefined || this.actualendDate == null) {
        alert('Please enter actual end date');
        return;
      }

      if (this.startDate == undefined || this.startDate == null) {
        alert('Please enter planned start date');
        return;
      }

      alert('Please enter valid values for all assessment fields');
      return;

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

  fillDetailsNew(status) {

    this.checklistExeViewModel = new ChecklistExecutionViewModel();
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

  checkIfAny1MandatoryFindingentered(findings: ObservationModel[]) {
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

  checkMandatoryFindingsEntered(findings: ObservationModel[]) {

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

  isdataSubmitted: boolean = true;

  service_SaveAuditChecklistDetails(status) {
    this.IsSubmitted = true;

    if (status == "AFSubmit")
      this.checkEveryQuestion(this.checkListDataNew);
    else
      this.uncheckEveryQuestion(this.checkListDataNew);

    if (status == "AFSubmit")
      this.isdataSubmitted = false;

    this.checklistExeViewModel.audiT_CHECKLIST_BY_SERVICE_AREA_LIST = this.checkListDataNew;
    this._appService.SaveAuditChecklistDetails(this.checklistExeViewModel).subscribe(
      data => {
        if (status == "AFSubmit") {
          alert("Data Submitted Successfully");
          this.checkListDataNew = data.audiT_CHECKLIST_BY_SERVICE_AREA_LIST;
          this.checklistSummaryRec = data.audiT_CHECKLIST_EXECUTION_SUMMARY;
          this.IsSubmitted = true;
          this.isdataSubmitted = true;
          this.issubmitenabled = true;
        }
        else {
          alert('Data saved Successfully');
          this.checkListDataNew = data.audiT_CHECKLIST_BY_SERVICE_AREA_LIST;
          this.checklistSummaryRec = data.audiT_CHECKLIST_EXECUTION_SUMMARY;
          this.IsSubmitted = false;
          this.IsChecklistDisabled = false;
          
        }
      },
      (error) => {
        this._util.serviceError(error); this.IsSubmittednew = false; this.IsSubmitted = false;
        this.isdataSubmitted = true; this.uncheckEveryQuestion(this.checkListDataNew);
      }
    )
  }

  checkEveryQuestion(checklistData) {
    checklistData.forEach(x => {
      x.checkpointS_BY_PROCESS_MODEL.forEach(x => {
        x.checkpointS_BY_PROCESS_AREA.forEach(x => {
          x.checkpointS_BY_PROCESS.forEach(x => {
            x.checkpoints.forEach(x => {
              x.issubmitted = true;
              x.findings.forEach(x => {
                x.issubmitted = true;
              })
            });
          })
        })
      })
    })
  }

  uncheckEveryQuestion(checklistData) {
    checklistData.forEach(x => {
      x.checkpointS_BY_PROCESS_MODEL.forEach(x => {
        x.checkpointS_BY_PROCESS_AREA.forEach(x => {
          x.checkpointS_BY_PROCESS.forEach(x => {
            x.checkpoints.forEach(x => {
              x.issubmitted = false;
              x.findings.forEach(x => {
                x.issubmitted = false;
              })
            });
          })
        })
      })
    })
  }

  openFindingsPage(customerId) {
    if (customerId != undefined) {
      let url = "/layout/qasummary/" + customerId
      window.open(url, '_blank')
    }
  }

  resubmitChecklistAssessment(plannedAudit): void {
    const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
      width: '500px',
      height: '170px',
      data: plannedAudit
    });
    dialogRef.afterClosed().subscribe(result => {
      this.comments = prompt("Please enter justification to resubmit", "");
      if (this.comments == "" || this.comments == undefined || this.comments == null) {
        alert("Please enter justification to resubmit");
      }
      else {
        plannedAudit.emp_Id = localStorage.getItem('empid');
        plannedAudit.assessmenT_STATUS = "Requested";
        plannedAudit.comments = this.comments;
        plannedAudit.iS_retaiN_CAPA = result;
        this._appService.resubmitChecklistAssessment(plannedAudit).subscribe(
          data => {
            alert("Mail Sent to Quality Head");
          },
          error => {
            this._util.serviceError(error);
          }
        )
      }
    })
  }

  ValidateChecklist(status) {

    let message;
    this.isFromValidation = true;
    this._appService.getChecklistList().subscribe(data => {
      this.checklistList = data;
      if (this.checklistList.length > 0) {
        var getUsedChecklistDtls = this.checklistList.filter(x => x.id == this.selectedchecklist);
        var ChecklistUsedInAssessment = this.checklist.filter(x => x.checklisT_ID == this.selectedchecklist);

        if (getUsedChecklistDtls.length == 0) {
          alert("Selected checklist is not available.");
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
            if (confirm("Are you sure you want to submit? After submission no change is possible")) {
              this.ValidateFieldsNew(status);
            }
          }
          else {
            this.fillDetailsNew(status);
            this.service_SaveAuditChecklistDetails(status);
          }
        }
      }
    }, error => { this._util.serviceError(error); });
  }
  confrimMessage(message) {
    if (confirm(message)) {
      this.getCheckListAuditData(this.selectedAuditId, this.selectedServiceArea, this.auditDataTitle, this.startDate, this.endDate, this.selectedAuditor, this.selectedAuditees, '', this.plannedHours, this.actualHours, this.actualstartDate, this.actualendDate);
    }
  }

  getApplicableMessageForConfirm(content, checklistDetails: any) {
    return content + " is marked as applicable for the checklist " + checklistDetails[0].title + '( ' + checklistDetails[0].version + '-' + checklistDetails[0].effectivE_FROM.slice(0, 10) + " ) by " + checklistDetails[0].updateD_NAME;
  }

  getNotApplicableMessageForConfirm(content, checklistDetails) {
    return content + " is marked as not applicable for the checklist " + checklistDetails[0].title + '( ' + checklistDetails[0].version + '-' + checklistDetails[0].effectivE_FROM.slice(0, 10) + ") by " + checklistDetails[0].updateD_NAME;
  }
  tabIndex: boolean = false;

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

  getMandatoryFindingTypeForFailedStatus() {
    this._appService.getMandatoryFindingTypeById(this.findingTypeId).subscribe(data => {
      this.MandatoryFindingsTypeForFailedStatus = data;
    }, error => { this._util.serviceError(error); })
  }

  bindAlertText() {
    let getMandatoryFindingTypesText = this.MandatoryFindingsTypeForFailedStatus.toString();
    let alertText = "Please enter atleast one finding of type (" + getMandatoryFindingTypesText + ") for the questions which are in fail status and Submit.";
    return alertText;
  }
}

export class plannedAuditData {
  cusT_ID: string;
  proj_ID: string;
  emP_ID: string;
  assessmenT_ID: number;
  commentS: string;
  statuS: string;
  iS_retaiN_CAPA: number;
}
