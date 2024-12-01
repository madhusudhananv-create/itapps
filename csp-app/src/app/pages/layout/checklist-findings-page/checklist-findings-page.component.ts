import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { ChecklistNew, AuditChecklistModelNew, AuditCheckListModel, ObservationModel, ChecklistExecutionSummary, ChecklistExecutionViewModel } from '../../../models/audit-checklist-based-model';

import { AccessControl } from '../../../Shared/accessControl';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';

import { FormControl, Validators } from '@angular/forms';
import { CheckListExecutionModel } from '../../../models/checklist-execution';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import { MatInputModule } from '@angular/material/input';
import { MatDialogConfig, MatDialog, MatDialogRef, MatDatepickerInput } from '@angular/material';

import { error } from 'protractor';
import { ChecklistAuditeeComponent } from '../../process-model/checklist-auditee/checklist-auditee.component';
import { findingModel } from '../../../models/qaassesmentdetails-model';
import { LayoutService } from '../layout.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectsModel } from '../../../models/projects-model';
import { enumRoles } from '../../../Shared/enum';
import { debug } from 'console';
//import { ChecklistFindingsSectionComponent } from './checklist-findings-section/checklist-findings-section.component';

@Component({
  selector: 'app-checklist-findings-page',
  templateUrl: './checklist-findings-page.component.html',
  styleUrls: ['./checklist-findings-page.component.scss']
})
export class ChecklistFindingsPageComponent implements OnInit {

  projNames: any[] = [];
  allproj: boolean = false;
  input_projectid: string;
  input_customerid: string;
  sub: any;
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
  checklistSummaryRec = new ChecklistExecutionSummary();
  checklistExeViewModel = new ChecklistExecutionViewModel();
  input_auditid: number;
  role: string;
  isLoading: boolean = false;
  openFindings: any;
  updatedChecklistScore: any;
  updatedChecklistScorePercentage: any;
  checklistScorePercentage: any;

  constructor(public _access: AccessControl, private _appService: AppsService, private _util: myUtility, private _http: HttpClient, public dialog: MatDialog, public _layoutService: LayoutService, private route: ActivatedRoute) { }
  selectFormControl = new FormControl('', Validators.required);

  ngOnInit() {



    this.getDropDownParams();

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
    });

    this.sub = this.route.params.subscribe(params => {
      this.input_projectid = params['projid'];
    });

    this.sub = this.route.params.subscribe(params => {
      this.input_auditid = Number(params['auditid']);
    });

    this.role = localStorage.getItem('role');

    if (this.role == enumRoles.BUHeadIMS.toString() || this.role == enumRoles.PMO.toString() || this.role == enumRoles.Quality.toString())
      this.allproj = true;

    this._layoutService.selectedCust = this.input_customerid;
    this.getAllProjectsFromCustomer();


  }

  getAllProjectsFromCustomer() {

    //  if(this.input_customerid == undefined || this.allproj == undefined){
    //    return;
    //  }
    this._appService.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;

        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          if (!this.input_projectid)
            this.input_projectid = this.projNames[0].proJ_ID;
          this.onProjectChange();
        }
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  onProjectChange() {

    this.custId = this._layoutService.selectedCust;
    this.projId = this.input_projectid;
    this.clearAll();

    this.getEmployeeListFromproject();
    this.Service_GetPlannedAudits(this.custId, this.projId);

    this.IsSubmitted = false;




  }


  changeChecklistStatus(data: AuditChecklistModelNew[]) {
    this._appService.enableChecklistStatus(data).subscribe(data => {

      this.checkListDataNew = data;
      this.issubmitenabled = false;
    }, (error) => { this._util.serviceError(error) })
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
      this.originalPlannedAudits = data;
      if (data && data.length > 0 && this.role == enumRoles.Quality.toString()) {
        this.plannedAudits = data;
        let auditsIds = data.map(x => x.id).join(',');
        this.getOpenFindingsCount(auditsIds);
      }
      else {
        this.plannedAudits = data;
      }

      if (this.input_auditid > 0) {
        var assessmentDetailsByAssessmentId = this.originalPlannedAudits.filter(x => x.id == this.input_auditid);
        if (assessmentDetailsByAssessmentId.length > 0) {
          this.IsSavedAuditsLoaded = false;
          assessmentDetailsByAssessmentId[0].iS_CHECKED = true;
          this.auditDataTitle = assessmentDetailsByAssessmentId[0].description;
          this.getCheckListAuditData(this.input_auditid, assessmentDetailsByAssessmentId[0].servicE_AREA_ID, this.auditDataTitle, assessmentDetailsByAssessmentId[0].scheduleD_START_DATE, assessmentDetailsByAssessmentId[0].duE_DATE, assessmentDetailsByAssessmentId[0].auditoR_ID, assessmentDetailsByAssessmentId[0].auditesS_ID, assessmentDetailsByAssessmentId[0].status, assessmentDetailsByAssessmentId[0].scheduleD_DURATION, assessmentDetailsByAssessmentId[0].actuaL_DURATION, assessmentDetailsByAssessmentId[0].actuaL_START_DATE, assessmentDetailsByAssessmentId[0].actuaL_END_DATE);
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
        this.openFindings = data;
        if (this.plannedAudits && this.plannedAudits.length > 0) {
          this.IsSavedAuditsLoaded = true;
        }
      },
      error => {
        this._util.serviceError(error);
      })
  }

  getFindingsCount(id) {
    let count = this._util.getFindingsCount(this.openFindings, id,"total");
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
    this.startDate = startdate;
    this.endDate = enddate;
    this.actualstartDate = actualstartdate
    this.actualendDate = actualenddate;
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
    if (!this.startDate)
      this.startDate = new Date(this.checklistSummaryRec.planneD_AUDIT_START_DATE);
    if (!this.endDate)
      this.startDate = new Date(this.checklistSummaryRec.planneD_AUDIT_END_DATE);
    if (!this.actualstartDate)
      this.actualstartDate = new Date(this.checklistSummaryRec.actuaL_AUDIT_START_DATE);
    if (!this.actualendDate)
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

  corrective_action_tracking: boolean = false;

  setChecklistData() {
    this.checkListDataNew = undefined;
    let submitflag = false;

    let record = this.checklist.find(x => x.checklisT_ID == this.selectedchecklist);
    this.getMappedChecklistData(record);
  }

  // getAuditStartAndEndDate(checklistData : AuditChecklistModelNew[], actualstartdate, actualenddate) {
  //   if (actualstartdate != null && actualenddate != null) {
  //     this.actualstartDate = new Date(actualstartdate);
  //     this.actualendDate = new Date(actualenddate);
  //   }
  //   else {
  //     for (let i = 0; i < this.checkListDataNew.length; i++) 
  //     {
  //       for(let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; p++)
  //       {
  //         for(let l = 0 ; l < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA.length; l++)
  //         {
  //           for(let k=0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS.length; k++)
  //           {
  //             for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints.length; j++) {
  //               if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_END_DATE != null && this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_START_DATE != null) {
  //                 this.actualstartDate = new Date(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_START_DATE);
  //                 this.actualendDate = new Date(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_END_DATE);
  //                 return;
  //               }
  //             }
  //           }
  //         }
  //       }

  //     }
  //   }
  // }


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

  // filterList() {

  //   this.plannedAudits = this.originalPlannedAudits;

  // }
  isdataSubmitted: boolean = true;


}

