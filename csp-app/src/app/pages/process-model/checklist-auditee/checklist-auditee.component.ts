import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuditCheckListModel, AuditChecklistModelNew, ObservationModel, ChecklistNew, ChecklisExecutionDetails, ChecklistExecutionSummary } from '../../../models/audit-checklist-based-model';
import { CheckListExecutionModel } from '../../../models/checklist-execution';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuditFindingCappa } from '../../../models/audit-finding-capa';
import { AuditFindingStage, AuditFindingCapaExt, AuditFindingCapaReviewExt, AuditFindingCapaImplementation } from '../../../models/audit-finding-stage';
import { EmpInfoModel, ProjectResourceByEmpIdModel } from '../../../models/emp-info-model';
import { AccessControl } from '../../../Shared/accessControl';
import { AuditFindingImplementation } from '../../../models/audit-finding-implementation';
import { AuditFindingVerification } from '../../../models/audit-finding-verification';
import { MatSelectChange } from '@angular/material';
import { SharedService } from '../../../Shared/shared.service';
import { auditeE_ACCEPTANCE } from '../../../models/auditee-acceptance';
import { ChecklistExecutionComponent } from '../checklist-execution/checklist-execution.component';
import { AccesscontrolManagementComponent } from '../../../components/accesscontrol-management/accesscontrol-management.component';



@Component({
  selector: 'app-checklist-auditee',
  templateUrl: './checklist-auditee.component.html',
  styleUrls: ['./checklist-auditee.component.scss']
})

export class ChecklistAuditeeComponent implements OnInit {
  disabletillSaveImplement: boolean;
  disabletillreviewSave: any;
  submitcap: boolean;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  findingStatus: AuditFindingStage
  rootCauseIds: number[]
  causeCollection: any;
  selectedRow: number
  styleObj: string
  checkListFindings: ChecklisExecutionDetails[] = []
  viewCAPA: boolean = false;
  step: number = 1;
  viewCAPANew: boolean = false;
  actionPlan: any;
  SelectedValue: AuditFindingCapaReviewExt[] = []
  SelectedValueImp: AuditFindingImplementation[] = []
  SelectedValueVerification: AuditFindingVerification[] = []
  rootCauseList: any;
  issubmit: boolean = false;
  isCheck: boolean = false;
  rejectImp: boolean = false;
  isCheckImp: boolean = false;
  isCheckVeri: boolean = false;
  stageColor: any;
  empInfo: ProjectResourceByEmpIdModel[];
  projSpocs: any;
  auditFindingCappa: AuditFindingCapaExt[];
  isapprovebutton: boolean
  isimplementbutton: boolean
  iscapsubmitbutton: boolean
  iscapreviewbutton: boolean
  isverficationbutton: boolean
  flag: boolean = false;
  auditeeResponse: string;
  showReject: string = undefined;
  selectAll: boolean;
  disablesubmittillSave: boolean;
  disableTillSaveVerification: boolean;
  auditeeAcceptRec: auditeE_ACCEPTANCE = new auditeE_ACCEPTANCE();
  @Input("checklistSummaryRec") checklistSummaryRec: ChecklistExecutionSummary = new ChecklistExecutionSummary();
  @Input("checkListData") checkListData: AuditChecklistModelNew[] = [];
  @Input("originalPlannedAudits") originalPlannedAudits: any;
  @ViewChild('isroot') private isroot;
  @Output() selectedChecklist: EventEmitter<AuditChecklistModelNew[]> = new EventEmitter<AuditChecklistModelNew[]>();
  showCheck: boolean = false;
  showForAuditor: boolean = false;
  showForQATeam: boolean = false;
  dueDate: Date;
  date: any = new Date().toISOString().split('T')[0];
  auditeeAcceptedDate: Date;
  maxTargetDate: Date;
  project: string[] = [];
  resourceId: number[];
  projectId: string;
  custId: string;
  feature: string;
  accessType: number;
  showAccessRequestButton: boolean = false;
  constructor(private _access: AccessControl, private _formBuilder: FormBuilder, private _appservice: AppsService, private _util: myUtility, private _http: HttpClient, protected elementRef: ElementRef,
    private _sharedService: SharedService) {
  }

  ngOnInit() {
    this.dueDate = this.originalPlannedAudits.filter(x => x.id == this.checklistSummaryRec.assessmenT_ID)[0].duE_DATE;
    let empId = localStorage.getItem('empid');
    this.getFindings();
    this.getProjSpocs(empId);
    this.getCauses();
    this.getAllAuditeeResponses();
    this.findingStatus = new AuditFindingStage()
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

  }

  selectallFindings() {
    if (this.selectAll) {
      this.checkListFindings.forEach((question) => {
        question.findings.forEach((find) => {
          find.ischecked = true;
        })
      });
    }
    else {
      this.checkListFindings.forEach((question) => {
        question.findings.forEach((find) => {
          find.ischecked = false;
        })
      });
    }
  }

  auditeeResponses: auditeE_ACCEPTANCE[] = [];
  disableAcceptReject: boolean = false;
  disablebtn: boolean = false;

  SaveAuditorResponse(status) {
    let findingIds = [];
    let flag = false;
    this.disablebtn = true;
    this.checkListFindings.forEach(x => {
      x.findings.forEach(x => {
        if (this.getAuditeeResponse(x.id) && x.ischecked) {
          flag = true;
          findingIds.push(x.id);
        }
      })
    })
    if (!flag) {
      alert('Findings Can be Accepted Or Rejected Only by Auditee or PM or QualitySpoc of the Project')
      this.disablebtn = false;
      return;
    }
    let rec;

    for (let i = 0; i < this.checkListFindings.length; i++) {
      for (let j = 0; j < this.checkListFindings[i].findings.length; j++) {
        if (this.getAuditeeResponse(this.checkListFindings[i].findings[j].id)) {
          if (status == 'Reject' && this.checkListFindings[i].findings[j].findinG_DESCRIPTION != undefined
            && this.checkListFindings[i].findings[j].findinG_DESCRIPTION.trim().length > 0
            && this.checkListFindings[i].findings[j].ischecked && (this.checkListFindings[i].findings[j].remarks === undefined || this.checkListFindings[i].findings[j].remarks.length === 0)) {
            alert('Please enter remarks for the findings to reject.');
            this.disablebtn = false;
            return;
          }
        }
      }
    }

    var acceptanceList: auditeE_ACCEPTANCE[] = [];
    let newrec;
    this.checkListFindings.forEach((question) => {
      question.findings.forEach((find) => {
        if (find.ischecked && this.getAuditeeResponse(find.id) == 'Reject') {
          newrec = new auditeE_ACCEPTANCE();
          newrec.findinG_ID = find.id;
          newrec.status = status;
          newrec.remarks = find.remarks + " Auditor Remarks(" + this.date + "): ";
          newrec.isactive = true;
          newrec.issubmitted = true;
          acceptanceList.push(newrec);
        }
      })
    });

    this._appservice.saveAuditorAcceptanceStatus(acceptanceList).subscribe(data => {
      alert("Status updated");
      this.disablebtn = false;

      if (status == 'Accept') {
        for (let i = 0; i < this.checkListData.length; i++) {
          for (let n = 0; n < this.checkListData[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
            for (let p = 0; p < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
              for (let j = 0; j < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; j++) {
                for (let k = 0; k < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints.length; k++) {
                  for (let l = 0; l < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings.length; l++) {
                    rec = findingIds.find(x => x == this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].id)
                    if (rec != undefined) {
                      this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].issubmitted = true;
                      this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].issubmitted = true;
                    }
                  }
                }
              }
            }
          }
        }

        this.emitchanges();

      }
      this.getFindings();
      this.getAllAuditeeResponses();
    }, (error) => { this._util.serviceError(error); this.disablebtn = false; })
  }

  SaveResponse(status) {
    let findingIds = [];
    let flag = false;
    this.disableAcceptReject = true;

    this.checkListFindings.forEach(x => {
      x.findings.forEach(x => {
        if (!this.getAuditeeResponse(x.id) && x.ischecked) {
          flag = true;
          findingIds.push(x.id);
        }
        else if (this.getAuditeeResponse(x.id) == null && x.ischecked) {
          flag = true;
          findingIds.push(x.id);
        }
        else if (this.getAuditeeResponse(x.id) == 'Auditor Rejected' && x.ischecked) {
          flag = true;
          findingIds.push(x.id);
        }
      })
    })

    if (!flag) {
      alert('Please select a finding to accept/reject');
      this.disableAcceptReject = false;
      return;
    }
    let rec;

    for (let i = 0; i < this.checkListFindings.length; i++) {
      for (let j = 0; j < this.checkListFindings[i].findings.length; j++) {
        if (!this.getAuditeeResponse(this.checkListFindings[i].findings[j].id)) {
          if (status == 'Reject' && this.checkListFindings[i].findings[j].findinG_DESCRIPTION != undefined
            && this.checkListFindings[i].findings[j].findinG_DESCRIPTION.trim().length > 0
            && this.checkListFindings[i].findings[j].ischecked && (this.checkListFindings[i].findings[j].remarks === undefined || this.checkListFindings[i].findings[j].remarks.length === 0)) {
            alert('Please enter remarks for the findings to reject..');
            this.disableAcceptReject = false;
            return;
          }
        }
      }
    }

    var acceptanceList: auditeE_ACCEPTANCE[] = [];
    let newrec;
    this.checkListFindings.forEach((question) => {
      question.findings.forEach((find) => {
        if (find.ischecked && !this.getAuditeeResponse(find.id)) {
          newrec = new auditeE_ACCEPTANCE();
          newrec.findinG_ID = find.id;
          newrec.status = status;
          if (find.remarks == undefined)
            newrec.remarks == ""
          else
            newrec.remarks = find.remarks + " Auditee Remarks(" + this.date + "): ";
          acceptanceList.push(newrec);
        }
        else if (find.ischecked && this.getAuditeeResponse(find.id) != 'Accept') {
          newrec = new auditeE_ACCEPTANCE();
          newrec.findinG_ID = find.id;
          newrec.status = status;
          if (find.remarks == undefined)
            newrec.remarks == ""
          else
            newrec.remarks = find.remarks + " Auditee Remarks(" + this.date + "): ";
          acceptanceList.push(newrec);
        }
      })
    });
    acceptanceList = acceptanceList.filter(x => x.findinG_ID != 0);
    this._appservice.saveAuditeeAcceptanceStatus(acceptanceList).subscribe(data => {
      alert("Status updated");
      this.disableAcceptReject = false;
      if (status == 'Reject') {
        for (let i = 0; i < this.checkListData.length; i++) {
          for (let n = 0; n < this.checkListData[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
            for (let p = 0; p < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
              for (let j = 0; j < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; j++) {
                for (let k = 0; k < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints.length; k++) {
                  for (let l = 0; l < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings.length; l++) {
                    rec = findingIds.find(x => x == this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].id)
                    if (rec != undefined) {
                      this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].issubmitted = false;
                      this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].issubmitted = false;
                      this.checkListFindings.forEach((x) => {
                        x.findings.forEach(find => {
                          find.ischecked = false;
                        })
                      })
                    }
                  }
                }
              }
            }
          }
        }

        this.emitchanges();
      }
      this.getAllAuditeeResponses();
    },
      (error) => { this._util.serviceError(error); this.disableAcceptReject = false; })
  }

  getAllAuditeeResponses() {
    this._appservice.getAllAuditeeResponses(this.checklistSummaryRec.assessmenT_ID).subscribe(data => {
      this.auditeeResponses = data;
      this.setauditeeRemarks();
    }, (error) => { this._util.serviceError(error) });
  }

  setauditeeRemarks() {
    this.checkListFindings.forEach(x => {
      x.findings.forEach(x => {
        x.remarks = this.getremarks(x);
      })
    })
  }

  getAuditeeResponse(findingid) {
    let rec = this.auditeeResponses.find(x => x.findinG_ID == findingid);
    if (rec != null)
      return rec.status;
    else
      return null;
  }

  disableCap(findingid) {
    let rec = this.auditeeResponses.find(x => x.findinG_ID == findingid);
    if (rec != null)
      return rec.disablE_CAPA;
    else
      return null;
  }

  getAuditorResponse(findingid) {
    let rec = this.auditeeResponses.find(x => x.findinG_ID == findingid);
    if (rec != null)
      return rec.status;
    else
      return null;
  }

  ChooseResponse() {
    if (this.auditeeResponse == "Accept")
      this.showReject = "false";
    else
      this.showReject = "true";
  }

  getProjResource() {
    if (this.checkListData.length > 0) {
      this._appservice.getProjectResourceByProjId(this.checklistSummaryRec.projecT_ID).subscribe(data => {
        this.empInfo = data;
      },
        error => { this._util.serviceError(error); }
      )
    }
  }

  getProjSpocs(empId) {
    if (this.checkListData.length > 0) {
      if (this.checklistSummaryRec.projecT_ID != null && this.checklistSummaryRec.projecT_ID != undefined) {
        this._appservice.getProjectSpocsByProjId(this.checklistSummaryRec.projecT_ID).subscribe(data => {
          this.projSpocs = data;
          if (this.projSpocs != null && this.projSpocs != undefined) {
            if (empId == this.projSpocs.proJ_PM_EMP_ID || empId == this.projSpocs.proJ_DM_EMP_ID)
              this.showCheck = true;
          }
          if (this.checklistSummaryRec.auditeE_LIST != null) {
            if (this.checklistSummaryRec.auditeE_LIST.includes(empId))
              this.showCheck = true;
          }
          if (this.projSpocs.qA_HEAD != null) {
            const CAPapproversArray = this.projSpocs.qA_HEAD.split(',');
            if (CAPapproversArray.includes(empId))
              this.showForQATeam = true;
          }
          if (this.checklistSummaryRec.auditoR_ID != null) {
            if (this.checklistSummaryRec.auditoR_ID == empId)
              this.showForAuditor = true;
          }
          this.emitRequestChanges();
        },
          error => { this._util.serviceError(error); }
        )

      }
    }

  }

  emitRequestChanges() {
    this.custId = this.checklistSummaryRec.customeR_ID;
    this.projectId = this.checklistSummaryRec.projecT_ID;
    this.accessType = 1;
    if (this.showForAuditor || this.showForQATeam || this.showCheck) {
      this.showAccessRequestButton = false;
    }
    else {
      this.showAccessRequestButton = true;
    }
  }

  getEmployeeName(empid) {
    let element;
    if (this.empInfo != undefined && this.empInfo.length > 0) {
      element = this.empInfo.find(x => x.emP_ID == empid);
    }
    if (element != undefined)
      return element.frsT_NM;
    else
      return "";
  }
  getCauses() {
    this._appservice.getAuditCauses().subscribe(data => {
      this.causeCollection = data;
    },
      error => { this._util.serviceError(error); }
    )
  }
  empName: string;
  getEmpName(empId) {
    this._appservice.getEmpNameById(empId).subscribe(
      data => {
        this.empName = data;
      },
      error => { this._util.serviceError(error); }
    )
    return this.empName
  }
  getSelectedVal() {
    this._appservice.getAuditFindingsCappa(this.findingStatus, this.rootCauseIds, 1).subscribe(data => {
      this.auditFindingCappa = data;
      this.findingStatus.capA_SUBMISSION.capa = this.auditFindingCappa;

    },
      error => { this._util.serviceError(error); }
    )
  }

  getVal(val, st) {
    if (this.findingStatus != undefined) {
      for (let i = 0; i < this.findingStatus.capA_SUBMISSION.capa.length; i++) {
        if (i == st)
          this.findingStatus.capA_SUBMISSION.capa[i].cappalist.isrootcause = true;
        else
          this.findingStatus.capA_SUBMISSION.capa[i].cappalist.isrootcause = false;;
      }
    }
  }

  incrementNextStep() {
    this.step++;
  }

  incrementPreviousStep() {
    this.step--;
  }
  selectedQuest: number;
  actionPlanQiestion: any;
  AddActionPlan(check, find, quesind, ind) {
    this.viewCAPA = true;
    this.rootCauseIds = []
    this.getFindingStatusdetails(find)
    this.actionPlan = find;
    this.actionPlanQiestion = check;
    this.getProjResource();
    this.selectedRow = ind;
    this.selectedQuest = quesind;
  }

  GetRootCauses(causeId) {
    this.rootCauseList = []
    if (this.causeCollection != undefined)
      this.rootCauseList = this.causeCollection.rootcause.filter(t => t.causE_ID == causeId);
  }
  getFindingStatusdetails(check: ObservationModel) {

    this._appservice.getFindingStatus(check).subscribe(data => {
      this.findingStatus = data;
      if (this.findingStatus.capA_SUBMISSION.capa.length > 0) {
        this.FillSelectedCauses()
        // this.getIsroot()
      }

      if (this.findingStatus.auditeE_ACCEPTANCE_STATUS != null) {
        this.auditeeAcceptedDate = new Date(this.findingStatus.auditeE_ACCEPTANCE_STATUS.auditeE_ACCEPTANCE.updateD_DATE);
        let year = this.auditeeAcceptedDate.getFullYear();
        let month = this.auditeeAcceptedDate.getMonth() + 1;
        let day = this.auditeeAcceptedDate.getDate();
        this.maxTargetDate = new Date(year, month, day);
      }

      this.getChecklistFindingStages(this.checkListFindings);
      this.disableCAPSubmitButton();
      this.disableCAPReviewButton();
      this.disableImplementButtonInReview();
      this.disableVerificationButton();
      this.emitRequestChanges();
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
  disableSaveButton() {
    if (this.findingStatus != undefined) {
      if (this.findingStatus.capA_SUBMISSION.capa.length == 0)
        this.issubmit = false;
      else {
        if (this.checkListFindings)
          for (let i of this.findingStatus.capA_SUBMISSION.capa) {
            if (!i.cappalist.issubmitted) {
              this.issubmit = false;
              break
            }
            else
              this.issubmit = true;
          }
      }
    }
  }
  disableApprovalButtonInReview() {
    if (this.findingStatus != undefined) {
      if (this.findingStatus.capA_REVIEW.capa.length == 0)
        this.isapprovebutton = false;
      else {
        this.isapprovebutton = true;
      }
    }
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
        let flag = this.findingStatus.capA_REVIEW.capa.some(x => !x.issubmitted);
        if (flag)
          this.iscapreviewbutton = false;
        else
          this.iscapreviewbutton = true;
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
  FillSelectedCauses() {
    this.rootCauseIds = []
    this.findingStatus.capA_SUBMISSION.capa.forEach(element => {
      this.rootCauseIds.push(element.cappalist.rooT_CAUSE_ID)
    });
  }
  SaveCheckListCAPA(status) {

    if (!this.validateCAPAinputfields()) {
      alert("Please input all the values for CAPA");
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
        this.findingStatus.capA_SUBMISSION.capa[i].cappalist.correction == undefined || this.findingStatus.capA_SUBMISSION.capa[i].cappalist.plaN_FOR_EFFECTIVE_CAP == undefined) {
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

  getFindings() {
    this.checkListFindings = [];
    this.stageColor = undefined
    let activeFindings = [];

    for (let i = 0; i < this.checkListData.length; i++)
      for (let n = 0; n < this.checkListData[i].checkpointS_BY_PROCESS_MODEL.length; n++)
        for (let p = 0; p < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++)
          for (let k = 0; k < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; k++)
            for (let j = 0; j < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints.length; j++) {
              if (this.checkIfAny1MandatoryFindingentered(this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].findings))
                this.checkListFindings.push(this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j]);
            }
    this.getChecklistFindingStages(this.checkListFindings)
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


  getChecklistFindingStages(checkListFindings: ChecklisExecutionDetails[]) {
    this._appservice.getStageColor(checkListFindings).subscribe(data => {
      this.checkListFindings = data;
      this.getAllAuditeeResponses();
    }, error => { this._util.serviceError(error); });
  }

  saveCAPDetailsForFinding(status) {
    this.disablesubmittillSave = true;
    this.service_saveCAPDetailsForFinding(status, this.findingStatus)
  }
  checkAll(eve) {
    if (eve.checked == true) {
      for (let i in this.findingStatus.capA_REVIEW.capa) {
        this.findingStatus.capA_REVIEW.capa[i].iscaprejected = true;
      }
    }
    else {
      for (let i in this.findingStatus.capA_REVIEW.capa) {
        this.findingStatus.capA_REVIEW.capa[i].iscaprejected = false;
      }
    }
  }
  SendIdtoArray(s: AuditFindingCapaReviewExt) {
    if (s.ischecked == true) {
      s.iscapapproved = true;
      s.iscaprejected = false;
      s.ischecked = true;
    }
    else {
      s.ischecked = false;
      s.iscapapproved = false;
      s.iscaprejected = true;
    }
  }
  isCheckAll() {
    for (let i in this.findingStatus.capA_REVIEW.capa) {
      if (this.findingStatus.capA_REVIEW.capa[i].ischecked == false) {
        this.isCheck = false;
        return;
      }
      else
        this.isCheck = true;
    }
  }
  checkAllImp(eve) {
    if (eve.checked == true) {
      for (let i in this.findingStatus.caP_IMPLEMENTATION.capa) {
        this.findingStatus.caP_IMPLEMENTATION.capa[i].isimplemented = true;
      }
    }
    else {
      for (let i in this.findingStatus.caP_IMPLEMENTATION.capa) {
        this.findingStatus.caP_IMPLEMENTATION.capa[i].isimplemented = false;
      }
    }
  }
  SendIdtoArrayImp(s: AuditFindingImplementation) {
    if (s.isimplemented == true) {
      s.isimplemented = false;
      this.SelectedValueImp = []
    }
    else {
      s.isimplemented = true;
      this.SelectedValueImp.push(s);
    }
    this.isCheckAllImp()
  }
  isCheckAllImp() {
    for (let i in this.findingStatus.caP_IMPLEMENTATION.capa) {
      if (this.findingStatus.caP_IMPLEMENTATION.capa[i].isimplemented == false) {
        this.isCheckImp = false;
        return;
      }
      else
        this.isCheckImp = true;
    }
  }
  checkAllVerification(eve) {
    if (eve.checked == true) {
      for (let i in this.findingStatus.caP_VERIFICATION.capa) {
        this.findingStatus.caP_VERIFICATION.capa[0].ischecked = true;
      }
    }
    else {
      for (let i in this.findingStatus.capA_REVIEW.capa) {
        this.findingStatus.capA_REVIEW.capa[i].ischecked = false;
      }
    }
  }

  saveCAPSubmissionData(status) {
    this.findingStatus.capA_SUBMISSION.capa.forEach(element => {
      element.cappalist.issubmitted = true;
      element.cappalist.findinG_ID = this.actionPlan.id;
      element.cappalist.caP_TARGET_DATE = this._util.setLocaleDate(element.cappalist.caP_TARGET_DATE);
      if (element.cappalist.status != "Corrective Action Plan Approved")
        element.cappalist.status = status;
    });

    this.saveCAPDetailsForFinding(status)
  }

  emitchanges() {
    this.selectedChecklist.emit(this.checkListData);
  }

  SendIdtoArrayVerification(s: AuditFindingVerification) {
    if (s.ischecked == true) {
      s.ischecked = false;
      this.SelectedValueVerification = []
    }
    else {
      s.ischecked = true;
      this.SelectedValueVerification.push(s);
    }
    this.isCheckAll()
  }
  isCheckAllVerification() {
    for (let i in this.findingStatus.caP_VERIFICATION.capa) {
      if (this.findingStatus.caP_VERIFICATION.capa[i].ischecked == false) {
        this.isCheck = false;
        return;
      }
      else
        this.isCheck = true;
    }
  }

  getremarks(find: ObservationModel) {
    let rec = this.auditeeResponses.find(x => x.findinG_ID == find.id);
    if (rec != undefined) {
      return rec.remarks;
    }
    else {
      return "";
    }
  }

  getsubmittedstatus(find: ObservationModel) {

    let rec = this.auditeeResponses.find(x => x.findinG_ID == find.id);
    if (rec != undefined) {
      return rec.issubmitted;
    }
    else {
      return false;
    }
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
          this.addAuditFindingReview()
      }
    }
  }

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

  VerifyCAPImplementation() {
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
      alert("Please select a finding")
  }

  verifyChanges(event: MatSelectChange) {
    this.findingStatus.caP_VERIFICATION.capa.forEach(element => {
      element.isverified = false;
      element.isrejected = true;
      element.recommendeD_ACTION = event.value;
      element.status = "Corrective Action Plan Failed"
    });
  }
  clearrecommendedAction(st: AuditFindingVerification) {
    if (st.isverified)
      st.recommendeD_ACTION = null
  }
  addAuditFindingReview() {
    this.disabletillreviewSave = true;
    this.service_saveCapReviewDetailsforFinding();
  }
  addAuditFindingImplementation() {
    this.disabletillSaveImplement = true;
    this.service_saveCapImplementationDetailsforFinding();
  }
  addAuditFindingVerification() {
    this.disableTillSaveVerification = true;
    this.service_saveCapVerificationDetailsforFinding();
  }
  //services
  //addFindingCAP
  service_saveCAPDetailsForFinding(sta, status) {

    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem("empid") });
    let apiuri: string = environment.webapiuri + 'AddFindingCAP'
    this._http.post<any>(apiuri, this.findingStatus, { headers: header })
      .subscribe(data => {
        this.findingStatus = data;
        this.disablesubmittillSave = false;
        this.submitcap = true;
        alert("Submitted Sucessfully");
        this.getFindingStatusdetails(this.actionPlan)
      }, error => {
        this._util.serviceError(error);
        this.findingStatus.capA_SUBMISSION.capa.forEach(x => x.cappalist.issubmitted = false);
        this.disablesubmittillSave = false;
      });
  }

  service_saveCapReviewDetailsforFinding() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem("empid") });
    let apiuri: string = environment.webapiuri + 'AddFindingCAPReviewDetails'
    this._http.post(apiuri, this.findingStatus.capA_REVIEW.capa, { headers: header })
      .subscribe(data => {
        alert("Submitted Sucessfully");
        this.disabletillreviewSave = false;
        this.getFindingStatusdetails(this.actionPlan)
        this.SelectedValue = []
      }, error => {
        this._util.serviceError(error); this.findingStatus.capA_REVIEW.capa[0].issubmitted = false;
        this.disabletillreviewSave = false
      });
  }
  service_saveCapImplementationDetailsforFinding() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem("empid") });
    let apiuri: string = environment.webapiuri + 'AddFindingCAPImplementationDetails'
    this._http.post(apiuri, this.findingStatus.caP_IMPLEMENTATION.capa, { headers: header })
      .subscribe(data => {
        alert("Submitted Sucessfully");
        this.disabletillSaveImplement = false;
        this.getFindingStatusdetails(this.actionPlan)
        this.SelectedValueImp = []
      }, error => {
        this._util.serviceError(error); this.isimplementbutton = false;
        this.disabletillSaveImplement = false;
      });
  }
  service_saveCapVerificationDetailsforFinding() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem("empid") });
    let apiuri: string = environment.webapiuri + 'AddFindingCAPVerificationDetails'
    this._http.post(apiuri, this.findingStatus.caP_VERIFICATION.capa, { headers: header })
      .subscribe(data => {
        alert("Submitted Sucessfully");
        this.disableTillSaveVerification = false;
        this.getFindingStatusdetails(this.actionPlan);
        this.processCrispScore();
        this.SelectedValueImp = [];
      }, error => {
        this._util.serviceError(error); this.isverficationbutton = false;
        this.disableTillSaveVerification = false;
      });
  }
  SendCheckListCAPAtoAuditor() {
    if (this.findingStatus != undefined) {
      this._appservice.SendCheckListMailToAuditee(this.findingStatus.capA_SUBMISSION).subscribe(data => {
      }, error => { this._util.serviceError(error); });
    }
    else
      alert("Audit Details are empty.Please submit and then send mail");
  }

  processCrispScore() {
    let dueDate = new Date(this.dueDate);
    if (this.checklistSummaryRec.projecT_ID != undefined && this.checklistSummaryRec.projecT_ID != null && this.checklistSummaryRec.projecT_ID != '') {
      this.project.push(this.checklistSummaryRec.projecT_ID);
    }
    let month = dueDate.toLocaleString('default', { month: 'short' });
    let year = dueDate.getFullYear().toString();

    if (this.checklistSummaryRec.customeR_ID != null && this.checklistSummaryRec.customeR_ID != undefined &&
      month != null && month != undefined && year != null && year != undefined) {
      this._appservice.ProcessCrispScoresForProject(this.checklistSummaryRec.customeR_ID, this.project, month, year).subscribe(data => {

      });
    }
  }

}
