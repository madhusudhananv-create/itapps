import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { AppsService } from '../../../Services/apps.service'
import { myUtility } from '../../../Shared/myUtility';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogConfig, MatDialog, MatDialogRef, MatDatepickerInput } from '@angular/material';
import { ChecklistFindingsComponent } from './checklist-findings/checklist-findings.component';
import { AuditCheckListModel, ObservationModel, AuditChecklistModelNew, ChecklistNew, AuditChecklistByProcess, AuditChecklistByProcessArea } from '../../../models/audit-checklist-based-model';
import { CheckListExecutionModel } from '../../../models/checklist-execution';
import { AccessControl } from '../../../Shared/accessControl';
import { error } from 'protractor';
import { ChecklistAuditeeComponent } from '../checklist-auditee/checklist-auditee.component';
import { findingModel } from '../../../models/qaassesmentdetails-model';
import { EmpInfoModel, projResourceExtended } from '../../../models/emp-info-model';
import { max } from 'rxjs/operators';

@Component({
  selector: 'app-checklist-execution',
  templateUrl: './checklist-execution.component.html',
  styleUrls: ['./checklist-execution.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ChecklistExecutionComponent implements OnInit {

  originalPlannedAudits: any[] = [];
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
  checkListData: AuditCheckListModel[] = [];
  projId: string;
  IsSubmitted: boolean
  submittedAll: boolean = false;
  selectedAuditees: number[] = []
  auditeesList: any;
  flag: boolean;
  selectedProcessModel: any;
  selectedServiceArea: any[] = [];
  selectedAuditor: number
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
  checklistScore: number;
  hideweightage: boolean = false;
  dataSentToPopup: any;
  maxMultiplier: number;
  checklistmaturitylevel: string = '';
  searchCCValue: string;
  searchToValue: string;
  selectedCCs = [];
  selectedTos = [];
  completed: boolean;

  constructor(public _access: AccessControl, private _appService: AppsService, private _util: myUtility, private _http: HttpClient, public dialog: MatDialog) { }
  selectFormControl = new FormControl('', Validators.required);
  ngOnInit() {

    this.getDropDownParams();
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
      console.log("cclist", this.cclist);
    },
      (error) => { this._util.serviceError(error) })
  }

  getversion(version: number) {
    return parseFloat(version.toString());
  }

  getProcessMaxScore(process: AuditChecklistByProcess) {
    let maxScore = 0;

    if (!process || !process.checkpoints || process.checkpoints.length === 0)
      return 0;

    //this.maxMultiplier = Math.max(...process.checkpoints[0].checklisT_STATUS_LIST_VALUES.map(x => x.multiplier), 0);
    process.maX_SCORE = 0;

    if (!this.hideweightage)
      process.checkpoints.forEach((question) => {
        if (question.statuS_CATEGORY == "N/A")
          return;

        process.maX_SCORE += (question.weightagE_SCORE) * this.maxMultiplier;
      });
    else
      process.maX_SCORE = this.maxMultiplier * process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').length;

    return process.maX_SCORE;
  }

  getProcessAreaMaxScore(processArea: AuditChecklistByProcessArea) {
    let questionsCount = 0;
    processArea.maX_SCORE = 0;

    if (processArea != undefined) {
      for (var process of processArea.checkpointS_BY_PROCESS) {
        questionsCount += process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').length;
      }

      if (!this.hideweightage) {
        processArea.checkpointS_BY_PROCESS.forEach((process) => {
          process.checkpoints.forEach((question) => {
            if (question.statuS_CATEGORY == "N/A") return;
            processArea.maX_SCORE += (question.weightagE_SCORE) * this.maxMultiplier;
          });
        })
      }
      else
        processArea.maX_SCORE = questionsCount * this.maxMultiplier;
    }

    return processArea.maX_SCORE;
  }

  getServiceAreaMaxScore(serviceArea: AuditChecklistModelNew) {
    let maxScore = 0;
    let questionsCount = 0;

    if (!serviceArea)
      return 0;

    for (var processModel of serviceArea.checkpointS_BY_PROCESS_MODEL)
      for (var processArea of processModel.checkpointS_BY_PROCESS_AREA)
        for (var process of processArea.checkpointS_BY_PROCESS) {
          questionsCount += process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').length;
          for (var checkpoint of process.checkpoints)
            if (checkpoint.statuS_CATEGORY != 'N/A')
              maxScore += (checkpoint.weightagE_SCORE) * this.maxMultiplier;
        }

    if (!this.hideweightage)
      serviceArea.maX_SCORE = maxScore;
    else
      serviceArea.maX_SCORE = questionsCount * this.maxMultiplier;

    return serviceArea.maX_SCORE;
  }

  setStatusCategory(row, process: AuditChecklistByProcess, processArea, serviceArea) {
    let anyrec = row.checklisT_STATUS_LIST_VALUES.find(x => x.statuS_LIST_VALUE == row.status);
    if (anyrec != undefined) {
      row.statuS_CATEGORY = anyrec.statuS_CATEGORY;
      row.currenT_STATUS = anyrec.statuS_CATEGORY;
    }
    else {
      row.statuS_CATEGORY = "N/A";
      row.currenT_STATUS = "N/A";
    }
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

  getProcessPercentage(process: AuditChecklistByProcess) {
    if (parseFloat(process.maX_SCORE.toString()) > 0)
      process.percentage = +((parseFloat(process.scorE_ACHIEVED.toString()) / parseFloat(process.maX_SCORE.toString()) * 100).toFixed(2));
    else
      process.percentage = 0;

    return process.percentage;
  }

  getProcessAreaPercentage(processArea: AuditChecklistByProcessArea) {
    try {
      if (parseFloat(processArea.maX_SCORE.toString()) > 0)
        processArea.percentage = +((parseFloat(processArea.scorE_ACHIEVED.toString()) / parseFloat(processArea.maX_SCORE.toString()) * 100).toFixed(2));
      else
        processArea.percentage = 0;

      return processArea.percentage;
    }
    catch (e) {
      alert('There is an error in calculating Process area percentage');
    }
  }

  getServiceAreaPercentage(serviceArea: AuditChecklistModelNew) {
    if (parseFloat(serviceArea.maX_SCORE.toString()) > 0)
      serviceArea.percentage = +((parseFloat(serviceArea.scorE_ACHIEVED.toString()) / parseFloat(serviceArea.maX_SCORE.toString()) * 100).toFixed(2));
    else
      serviceArea.percentage = 0;

    return serviceArea.percentage;
  }

  getServiceAreaMaturityLevel(percentage) {
    let maturityLevelScaleRec;
    if (percentage && this.maturityLevelMappings && this.maturityLevelMappings.length > 0) {
      maturityLevelScaleRec = this.maturityLevelMappings.find(x => percentage >= x.loweR_BOUND_SCORE && percentage <= x.uppeR_BOUND_SCORE);
      if (maturityLevelScaleRec != undefined)
        return maturityLevelScaleRec.leveL_TITLE;
    }

    return '';
  }

  getProcessAreaMaturityLevel(percentage) {
    let maturityLevelScaleRec;
    if (percentage && this.maturityLevelMappings && this.maturityLevelMappings.length > 0) {
      maturityLevelScaleRec = this.maturityLevelMappings.find(x => percentage >= x.loweR_BOUND_SCORE && percentage <= x.uppeR_BOUND_SCORE);
      if (maturityLevelScaleRec != undefined)
        return maturityLevelScaleRec.leveL_TITLE;
    }
    return '';
  }


  getProcessScore(process: AuditChecklistByProcess) {
    if (process != undefined && process.checkpoints != undefined) {
      process.scorE_ACHIEVED = process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').map(x => x.score).reduce((x, y) => {
        return (x + y)
      }, 0)
    }
    else
      process.scorE_ACHIEVED = 0;

    return process.scorE_ACHIEVED;
  }

  getServiceAreaScore(serviceArea: AuditChecklistModelNew) {
    if (serviceArea != undefined) {
      serviceArea.scorE_ACHIEVED = 0;
      for (var processModel of serviceArea.checkpointS_BY_PROCESS_MODEL) {
        for (var processArea of processModel.checkpointS_BY_PROCESS_AREA) {
          for (var process of processArea.checkpointS_BY_PROCESS) {
            for (var checkpoint of process.checkpoints) {
              if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY != null && checkpoint.statuS_CATEGORY != 'N/A')
                serviceArea.scorE_ACHIEVED += checkpoint.score;
            }
          }
        }
      }
    }
    else
      serviceArea.scorE_ACHIEVED = 0;
    return serviceArea.scorE_ACHIEVED;
  }

  getProcessAreaScore(parea: AuditChecklistByProcessArea) {
    parea.scorE_ACHIEVED = 0;
    if (parea != undefined) {
      for (var process of parea.checkpointS_BY_PROCESS) {
        parea.scorE_ACHIEVED += process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').map(x => x.score).reduce((x, y) => {
          return (x + y)
        }, 0)
      }
    }

    return parea.scorE_ACHIEVED;
  }

  checklistScorePercentage: number;

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

    if (maxscore == 0)
      this.checklistScorePercentage = 100;
    else
      this.checklistScorePercentage = +((parseFloat(acheivedscore.toString()) / parseFloat(maxscore.toString())) * 100).toFixed(2);
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
    else
      this.checklistmaturitylevel = '';
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
  }

  getScoreForStatus(row) {
    if (row == undefined || row.checklisT_STATUS_LIST_VALUES == undefined)
      return;

    if (row.currenT_STATUS == 'N/A') {
      row.score = 0;
      row.maX_SCORE = 0;
      return;
    }

    this.maxMultiplier = Math.max(...row.checklisT_STATUS_LIST_VALUES.map(x => x.multiplier), 0);
    var multiplier = row.checklisT_STATUS_LIST_VALUES.find(x => x.statuS_LIST_VALUE == row.status).multiplier;

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
  getSavedChecklistAudits() {
    this._appService.getSavedCheckListAudits(this.custId, this.projId).subscribe(
      data => {
        this.savedCheckListaudits = data;
      },
      error => { this._util.serviceError(error); }
    )
  }

  Service_GetPlannedAudits(custid, projid) {
    this.IsSavedAuditsLoaded = false;
    this._appService.getPlannedAudits(custid, projid).subscribe(data => {
      if (data && data.length > 0)
        this.plannedAudits = data.filter(x => x.status != 'COMPLETED');
      else
        this.plannedAudits = data;

      this.originalPlannedAudits = data;
      console.log("planned audits", this.plannedAudits);
      if (this.plannedAudits && this.plannedAudits.length > 0)
        this.IsSavedAuditsLoaded = true;
    } , (error) => { this._util.serviceError(error) })
  }

  checklistName: string;
  getCheckListAuditData(auditid, serviceareas, title, startdate, enddate, auditorid, auditeessid, status, plannedhour, actualhour, actualstartdate, actualenddate) {

    this.auditDataTitle = title;
    this.selectedAuditor = +auditorid;
    this.selectedAuditees = auditeessid.map(x => +x);
    this.plannedHours = plannedhour;
    this.actualHours = actualhour;
    this.startDate = startdate ? new Date(startdate) : null;
    this.endDate = enddate ? new Date(enddate) : null;
    this.actualstartDate = actualstartdate ? new Date(actualstartdate) : null;
    this.actualendDate = actualenddate ? new Date(actualenddate) : null;

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
    console.log("input", data);
    this.checklist = undefined;
    this.checklistScore = undefined;
    this.checklistScorePercentage = undefined;
    this.checklistversion = undefined;
    this._appService.getCheckListDataForProjNew(data).subscribe(
      data => {
        this.checklist = data;
        console.log("checklist", this.checklist);
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
    if (checklist != null) {
      this.checkListDataNew = checklist.checkpointS_BY_SERVICE_AREA;
      this.checklistScore = checklist.overalL_SCORE;
      // this.checklistversion = checklist.version;
      this.checklistScorePercentage = checklist.overalL_SCORE_PERCENT;
      this.hideweightage = !checklist.weightagE_APPLICABLE_FLAG;
      this.corrective_action_tracking = checklist.correctivE_ACTION_TRACKING;
      this.selectedchecklist = checklist.checklisT_ID;
      this.dataSentToPopup = checklist.findingtypE_VALUES;
      this.isMaturityLevelApplicable = checklist.maturitY_LEVEL_APPLICABLE;
      if (this.isMaturityLevelApplicable)
        this.maturityLevelMappings = checklist.pM_MATURITYLEVEL_MAPPINGS;
      this.setMaturityLevel();
    }

    //this.getAuditStartAndEndDate();

    // if (this.checkListDataNew != undefined && this.checkListDataNew.length > 0) {
    //   if (this.selectedAuditor === undefined || this.selectedAuditor == 0)
    //     this.selectedAuditor = this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints[0].auditoR_NAME;
    //   if (this.selectedAuditees === undefined || this.selectedAuditees == null || this.selectedAuditees.length === 0)
    //     this.selectedAuditees = this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints[0].auditeE_NAME;
    //   if (this.selectedCCs === undefined || this.selectedCCs == null || this.selectedCCs.length === 0)
    //     this.selectedCCs = this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints[0].cC_EMP_LIST;
    //   if (this.selectedTos === undefined || this.selectedTos == null || this.selectedTos.length === 0)
    //     this.selectedTos = this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints[0].tO_EMP_LIST;


    //   this.IsSubmitted = false;

    //   for (let i = 0; i < this.checkListDataNew.length; i++) {
    //     for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; p++) {
    //       for (let l = 0; l < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA.length; l++) {
    //         for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS.length; k++) {
    //           if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints.some(x => x.issubmitted)) {
    //             this.IsSubmitted = true;
    //             break;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    // if (!this.IsSubmitted) {
    //   this.issubmitenabled = false;
    //   return;
    // }

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

  // getAuditStartAndEndDate() {

  //   if (this.actualendDate != null && this.actualstartDate != null && this.endDate != null && this.startDate != null)
  //     return;

  //   for (let i = 0; i < this.checkListDataNew.length; i++) {
  //     for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; p++) {
  //       for (let l = 0; l < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA.length; l++) {
  //         for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS.length; k++) {
  //           for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints.length; j++) {

  //             if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_END_DATE != null)
  //               this.actualendDate = new Date(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_END_DATE);

  //             if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_START_DATE != null)
  //               this.actualstartDate = new Date(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_START_DATE);

  //             if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].planneD_AUDIT_START_DATE != null)
  //               this.startDate = new Date(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].planneD_AUDIT_START_DATE);

  //             if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].planneD_AUDIT_END_DATE != null)
  //               this.endDate = new Date(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints[j].planneD_AUDIT_END_DATE);

  //             return;
  //           }
  //         }
  //       }
  //     }
  //   }

  // }

  getModelandServiceAreaDD(custId, projId) {
    this._appService.getProcessModelandServiceAreaDD(custId, projId).subscribe(
      data => {
        this.selectedProcessModel = data.projecT_MODEL;
        this.selectedServiceArea = data.projecT_SERVICE_AREA;
        this.gavsserviceArea = data.gavS_SERVICE_AREA;
        //this.getGavsServiceArea()
      }
      ,
      error => { this._util.serviceError(error); }
    )
  }
  getGavsServiceArea() {
    this.gavsserviceArea = []
    this.processDescription.forEach(element => {
      this.gavsserviceArea.push(element.gavS_SERVICE_AREA);
    });
  }
  autoGrowTextZone(e) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 10) + "px";
  }

  loadnewlyaddedTask(obj) {
    if (this.custId == obj.custid && this.projId == obj.projid) {
      this.Service_GetPlannedAudits(this.custId, this.projId);
    }
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
    this.checklistmaturitylevel = '';
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

    if (this.auditDataTitle != null && this.selectedAuditor != undefined && this.selectedAuditor != 0 && this.selectedAuditees != undefined && this.selectedAuditees.length > 0 &&
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

      if (this.selectedAuditor == undefined || this.selectedAuditor == 0) {
        alert('Please choose an Appraiser');
        return;
      }

      if (this.selectedAuditees == undefined || this.selectedAuditees.length == 0) {
        alert('Please choose Appraisees');
        return;
      }

      if (this.actualstartDate == undefined) {
        alert('Please enter actual start date');
        return;
      }

      if (this.actualendDate == undefined) {
        alert('Please enter actual end date');
        return;
      }

      if (this.startDate == undefined) {
        alert('Please enter planned start date');
        return;
      }

      alert('Please enter valid values for all assessment fields');
      return;

    }
  }

  validateAllQuestions() {
    let flag = true;

    if (this.checkListDataNew.length == 0)
      return flag;

    for (let i = 0; i < this.checkListDataNew.length; i++) {
      for (let n = 0; n < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
        for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
          for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; j++) {
            for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints.length; k++) {
              if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].status == undefined || this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].status == "") {
                flag = false;
                break;
              }
            }
          }
        }
      }
    }

    return flag;
  }

  fillDetailsNew() {
    for (let i = 0; i < this.checkListDataNew.length; i++) {
      for (let n = 0; n < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
        for (let p = 0; p < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
          for (let k = 0; k < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; k++) {
            for (let j = 0; j < this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints.length; j++) {

              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].audiT_TITLE = this.auditDataTitle;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].planneD_AUDIT_START_DATE = this.startDate ? new Date(this.startDate).toDateString() : null;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].planneD_AUDIT_END_DATE = this.endDate ? new Date(this.endDate).toDateString() : null;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].auditoR_NAME = this.selectedAuditor ? this.selectedAuditor : 0;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].auditeE_NAME = this.selectedAuditees ? this.selectedAuditees : [];
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].audiT_PLANNED_HOURS = this.plannedHours ? this.plannedHours : 0;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].audiT_ACTUAL_HOURS = this.actualHours ? this.actualHours : 0;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_START_DATE = this.actualstartDate ? new Date(this.actualstartDate).toDateString() : null;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].actuaL_AUDIT_END_DATE = this.actualendDate ? new Date(this.actualendDate).toDateString() : null;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].customeR_ID = this.custId;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].projecT_ID = this.projId;
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].cC_EMP_LIST = this.selectedCCs
              // this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].tO_EMP_LIST = this.selectedTos

            }
          }

        }
      }

    }
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

    // this._appService.SaveAuditChecklistDetails(this.checkListDataNew).subscribe(
    //   data => {
    //     if (status == "AFSubmit") {
    //       alert("Data Submitted Successfully");
    //       this.checkListDataNew = data;
    //       this.IsSubmitted = true;
    //       this.isdataSubmitted = true;
    //       this.issubmitenabled = true;
    //     }
    //     else {
    //       alert('Data saved Successfully');
    //       this.IsSubmitted = false;
    //     }
    //   },
    //   (error) => {
    //     this._util.serviceError(error); this.IsSubmittednew = false; this.IsSubmitted = false;
    //     this.isdataSubmitted = true; this.uncheckEveryQuestion(this.checkListDataNew);
    //   }
    // )
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
}
