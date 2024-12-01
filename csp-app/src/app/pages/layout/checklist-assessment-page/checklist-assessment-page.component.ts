import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { AppsService } from '../../../Services/apps.service'
import { myUtility } from '../../../Shared/myUtility';
import { assessmentUtility } from '../../../Shared/assessmentUtility';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogConfig, MatDialog, MatDialogRef, MatDatepickerInput } from '@angular/material';
import { ChecklistFindingsComponent } from '../../process-model/checklist-execution/checklist-findings/checklist-findings.component';
import { AuditCheckListModel, ObservationModel, AuditChecklistModelNew, ChecklistNew, AuditChecklistByProcess, AuditChecklistByProcessArea, ChecklistExecutionSummary, ChecklistExecutionViewModel } from '../../../models/audit-checklist-based-model';
import { CheckListExecutionModel } from '../../../models/checklist-execution';
import { AccessControl } from '../../../Shared/accessControl';
import { error } from 'protractor';
import { ChecklistAuditeeComponent } from '../../process-model/checklist-auditee/checklist-auditee.component';
import { findingModel } from '../../../models/qaassesmentdetails-model';
import { EmpInfoModel, projResourceExtended } from '../../../models/emp-info-model';
import { max } from 'rxjs/operators';
import { DeliveryDetailsModel } from '../../../models/delivery-model';
import { LayoutService } from '../layout.service';
import { ActivatedRoute } from '@angular/router';
import { enumRoles } from '../../../Shared/enum';

@Component({
  selector: 'app-checklist-assessment-page',
  templateUrl: './checklist-assessment-page.component.html',
  styleUrls: ['./checklist-assessment-page.component.scss']

})
export class ChecklistAssessmentPageComponent implements OnInit {

  originalPlannedAudits: any[] = [];
  checklistStatusValues: any[] = [];
  originalCCList: EmpInfoModel[];
  tolist: EmpInfoModel[];
  cclist: EmpInfoModel[];
  issubmitenabled: boolean;
  auditorList: any;
  @Input("processDescription") processDescription: any[];
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
  checkListData: AuditCheckListModel[] = [];
  projId: string;
  IsSubmitted: boolean
  submittedAll: boolean = false;
  selectedAuditees: string[] = []
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
  IsSavedAuditsLoaded: boolean;
  isDisplayText: boolean;
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
  checklistmaturitylevel: string;
  searchCCValue: string;
  searchToValue: string;
  selectedCCs = [];
  selectedTos = [];
  completed: boolean;
  checklistSummaryRec = new ChecklistExecutionSummary();
  checklistExeViewModel = new ChecklistExecutionViewModel();
  sub: any;
  projNames: any[] = [];
  input_customerid: string;
  input_projectid: string;
  allproj: boolean = false;
  isLoading: boolean = false;
  findings: any;
  updatedChecklistScore: any;
  updatedChecklistScorePercentage: any;
  checklistScorePercentage: any;

  constructor(public _access: AccessControl, private _appService: AppsService, private _util: myUtility, private _assessmentUtil: assessmentUtility,
    private _http: HttpClient, public dialog: MatDialog, public _layoutService: LayoutService, private route: ActivatedRoute) { }
  selectFormControl = new FormControl('', Validators.required);

  ngOnInit() {


    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
    });

    let role = localStorage.getItem('role');

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this._layoutService.selectedCust = this.input_customerid
    this.getDropDownParams();
    this.getAllProjectsFromCustomer();
  }

  getAllProjectsFromCustomer() {
    this._appService.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;

        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          if (!this.input_projectid)
            this.input_projectid = this.projNames[0].proJ_ID;
          this.onProjectChange();
          //this.project_onChange();
        }
      },
      error => {
        this._util.serviceError(error);
      }
    )
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
    const dialogRef = this.dialog.open(ChecklistFindingsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  changeChecklistStatus(data: AuditChecklistModelNew[]) {
    this._appService.enableChecklistStatus(data).subscribe(data => {

      this.checkListDataNew = data;
      this.issubmitenabled = false;
    }, (error) => { this._util.serviceError(error) })
  }
  onProjectChange() {
    this.custId = this._layoutService.selectedCust;
    this.projId = this.input_projectid;
    this.clearAll()
    if (this.projId)
      this.getCCList();

    this.getEmployeeListFromproject();
    this.Service_GetPlannedAudits(this.custId, this.projId);
    this.IsSubmitted = false;
  }
  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    this.selectedCCs = [];
    this.selectedTos = [];
    this.completed = false;
    this.clearAll();
    if (this.projId)
      this.getCCList();

    this.getEmployeeListFromproject();
    this.Service_GetPlannedAudits(this.custId, this.projId);
    this.IsSubmitted = false;
  }

  filterList() {
    if (this.completed)
      this.plannedAudits = this.originalPlannedAudits;
    else
      this.plannedAudits = this.originalPlannedAudits.filter(x => x.status != 'COMPLETED');
  }

  filterCCEmployees() {
    this.cclist = this.originalCCList.filter(x => x.frsT_NM.toLowerCase().includes(this.searchCCValue.toLowerCase()));
  }

  filterToEmployees() {
    this.tolist = this.originalCCList.filter(x => x.frsT_NM.toLowerCase().includes(this.searchToValue.toLowerCase()));
  }


  getCCList() {
    this._appService.getCCListForChecklist(this.custId).subscribe(data => {
      this.cclist = data;
      this.originalCCList = data;
      this.tolist = data;
    },
      (error) => { this._util.serviceError(error) })
  }

  getversion(version: number) {
    return parseFloat(version.toString());
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
      mappingRecord = this.maturityLevelMappings.find(x => this.checklistScorePercentage >= x.loweR_BOUND_SCORE &&
        this.checklistScorePercentage <= x.uppeR_BOUND_SCORE);
      if (mappingRecord != null)
        this.checklistmaturitylevel = mappingRecord.leveL_TITLE;
      else
        this.checklistmaturitylevel = '';
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

    this.maxMultiplier = Math.max(...this.checklistStatusValues.map(x => x.multiplier), 0);

    var multiplier = this.checklistStatusValues.find(x => x.id == row.statuS_VALUE_ID).multiplier;
    if (row.iS_WEIGHTAGE_APPLICABLE) {
      if (row.weightagE_SCORE && row.weightagE_SCORE != null) {
        row.score = parseFloat(multiplier) * parseFloat(row.weightagE_SCORE);
        row.maX_SCORE = parseFloat(this.maxMultiplier.toString()) * parseFloat(row.weightagE_SCORE);
      }
      else {
        row.maX_SCORE = parseFloat(this.maxMultiplier.toString());
        row.score = parseFloat(multiplier);
      }
    }
    else {
      row.score = parseFloat(multiplier);
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

  Service_GetPlannedAudits(custid, projid) {
    this.IsSavedAuditsLoaded = false;
    this.isLoading = true;
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
    let count = this._util.getFindingsCount(this.findings, id,"total");
    return count;
  }
 
  getOpenFindingCount(id) {
    let count = this._util.getFindingsCount(this.findings, id,"open");
    return count;
  }
  getClosedFindingsCount(id) {
    let count = this._util.getFindingsCount(this.findings, id,"closed");
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
    this.checklistStatusValues = checklist.checklisT_STATUS_LIST_VALUES;
    this.checklistversion = checklist.versioN_ID;

    this.checklistScore = this.checklistSummaryRec.score;
    this.checklistScorePercentage = this.checklistSummaryRec.percentagE_SCORE;
    this.updatedChecklistScore = this.checklistSummaryRec.updateD_SCORE;
    this.updatedChecklistScorePercentage = this.checklistSummaryRec.updateD_PERCENTAGE_SCORE;
    this.hideweightage = !checklist.weightagE_APPLICABLE_FLAG;
    this.corrective_action_tracking = checklist.correctivE_ACTION_TRACKING;
    this.selectedchecklist = checklist.checklisT_ID;
    this.dataSentToPopup = checklist.findingtypE_VALUES;
    if (!this.selectedAuditor)
      this.selectedAuditor = this.checklistSummaryRec.auditoR_ID;
    if (checklist.auditeE_NAMES != null && checklist.auditeE_NAMES.length > 0)
      this.selectedAuditees = checklist.auditeE_NAMES;
    this.checklistSummaryRec.auditeE_LIST = checklist.auditeE_NAMES;
    if (!this.selectedCCs || this.selectedCCs.length == 0)
      this.selectedCCs = checklist.cC_LIST;
    if (!this.selectedTos || this.selectedTos.length == 0)
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
    if (this.isMaturityLevelApplicable)
      this.maturityLevelMappings = checklist.pM_MATURITYLEVEL_MAPPINGS;
    this.setMaturityLevel();

    if (this.checkListDataNew != undefined && this.checkListDataNew.length > 0) {
      this.IsSubmitted = false;

      for (let i = 0; i < this.checkListDataNew.length; i++) {
        for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; p++) {
          for (let l = 0; l < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA.length; l++) {
            for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS.length; k++) {
              if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints.some(x => x.issubmitted)) {
                this.IsSubmitted = true;
                break;
              }
            }
          }
        }
      }
    }

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
      }
      ,
      error => { this._util.serviceError(error); }
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
  }

  SaveCheckListExecutionNew(status) {
    if (status == "AFSubmit") {
      if (confirm("Are you sure you want to submit? After submission no change is possible")) {
        this.ValidateFieldsNew(status);
      }
    }
    else {
      this.fillDetailsNew();
      this.service_SaveAuditChecklistDetails(status);
    }
  }

  ValidateFieldsNew(status) {

    if (this.auditDataTitle != null && this.selectedAuditor != undefined && this.selectedAuditees != undefined && this.selectedAuditees.length > 0 &&
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
      this.fillDetailsNew();
      this.service_SaveAuditChecklistDetails(status);
    }
    else {

      if (this.selectedAuditor == undefined) {
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
              if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].statuS_VALUE_ID == undefined)
                return false;
            }
          }
        }
      }
    }

    return true;
  }

  fillDetailsNew() {
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
  }

  validateFindingsNew() {
    for (let i = 0; i < this.checkListDataNew.length; i++) {
      for (let n = 0; n < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
        for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
          for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; k++) {
            for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints.length; j++) {
              if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].statuS_CATEGORY == "NMET") {
                return this.checkIfAny1MandatoryFindingentered(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].findings)

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
        if (findings[i].findinG_DESCRIPTION != undefined && findings[i].findinG_DESCRIPTION.length > 0) {
          flag = true;
          break;
        }
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
            });
          })
        })
      })
    })
  }

  setOpened() {
    this.isDisplayText = false;
  }
  setClosed() {
    this.isDisplayText = true;
  }
}