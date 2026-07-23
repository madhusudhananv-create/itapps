import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { AppsService } from '../../../core/services/apps.service';
import { DialogYesNoComponent } from '../../../controls/dialog-yes-no/dialog-yes-no.component';
import { MyUtility } from '../../../shared/my-utility';
import { AssessmentUtility } from '../../../shared/assessment-utility';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AccessControl } from '../../../shared/access-control';
import { AuditCheckListModel, ObservationModel, AuditChecklistModelNew, AuditChecklistByProcessModel, ChecklistNew, AuditChecklistByProcess, AuditChecklistByProcessArea, ChecklistExecutionSummary, ChecklistExecutionViewModel } from '../../../core/models/audit-checklist-based-model';
import { CheckListExecutionModel } from '../../../core/models/checklist-execution';
import { EmpInfoModel } from '../../../core/models/emp-info-model';
import { LayoutService } from '../layout.service';
import { enumRoles } from '../../../shared/enum';
import { ChecklistFindingsNewComponent } from '../../sqa-management/checklist-findings-new/checklist-findings-new.component';

// Extended interfaces with runtime properties for UI interactions
interface ExtendedAuditChecklistByProcess extends AuditChecklistByProcess {
  isSelected?: boolean;
}

interface ExtendedAuditChecklistByProcessArea extends AuditChecklistByProcessArea {
  isSelected?: boolean;
  checkpointS_BY_PROCESS: ExtendedAuditChecklistByProcess[];
}

interface ExtendedAuditChecklistByProcessModel extends AuditChecklistByProcessModel {
  isSelected?: boolean;
  percentage?: number;
  checkpointS_BY_PROCESS_AREA: ExtendedAuditChecklistByProcessArea[];
}

interface ExtendedAuditChecklistModelNew extends AuditChecklistModelNew {
  isSelected?: boolean;
  checkpointS_BY_PROCESS_MODEL: ExtendedAuditChecklistByProcessModel[];
}

@Component({
  selector: 'app-checklist-assessment-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './checklist-assessment-page.component.html',
  styleUrls: ['./checklist-assessment-page.component.scss']
})
export class ChecklistAssessmentPageComponent implements OnInit {

  originalPlannedAudits: any[] = [];
  checklistStatusValues: any[] = [];
  originalCCList: EmpInfoModel[] = [];
  tolist: EmpInfoModel[] = [];
  cclist: EmpInfoModel[] = [];
  issubmitenabled: boolean = false;
  auditorList: any[] = [];
  @Input("processDescription") processDescription: any[] = [];
  ddData: any;
  endDate: Date | null = null;
  selected: number = -1;
  isChecked: boolean[] = new Array();
  showAddition: boolean = false;
  actualHours: number | null = null;
  plannedHours: number | null = null;
  auditscope: string = '';
  IsSavedAuditsExpand: boolean = false;
  custId: string = '';
  selectedAuditId: number = 0;
  checkListData: AuditCheckListModel[] = [];
  projId: string = '';
  IsSubmitted: boolean = false;
  submittedAll: boolean = false;
  selectedAuditees: string[] = [];
  auditeesList: any[] = [];
  flag: boolean = false;
  selectedProcessModel: any;
  selectedServiceArea: any[] = [];
  selectedAuditor: string = '';
  versionId: number = 0;
  serviceArea: any[] = [];
  gavsserviceArea: any;
  auditDataTitle: string | null = null;
  startDate: Date | null = null;
  actualstartDate: Date | null = null;
  actualendDate: Date | null = null;
  savedCheckListaudits: any;
  isExpanded: boolean = false;
  IsSavedAuditsLoaded: boolean = false;
  isDisplayText: boolean = true;
  plannedAudits: any[] = [];
  checkListDataNew: ExtendedAuditChecklistModelNew[] = [];
  serviceAreaNew: any[] = [];
  checklistStatus: string = '';
  IsSubmittednew: boolean = false;
  checklistversion: number = 0;
  checklist: ChecklistNew[] = [];
  selectedchecklist: number = 0;
  statusCategory: string = '';
  checklistScore: any;
  hideweightage: boolean = false;
  dataSentToPopup: any;
  maxMultiplier: number = 0;
  checklistmaturitylevel: string = '';
  searchCCValue: string = '';
  searchToValue: string = '';
  searchProjectValue: string = '';
  filteredProjects: any[] = [];
  selectedCCs: any[] = [];
  selectedTos: any[] = [];
  completed: boolean = false;
  checklistSummaryRec = new ChecklistExecutionSummary();
  checklistExeViewModel = new ChecklistExecutionViewModel();
  sub: any;
  projNames: any[] = [];
  input_customerid: string = '';
  input_projectid: string = '';
  allcust: boolean = false;
  allproj: boolean = false;
  isLoading: boolean = false;
  findings: any[] = [];
  updatedChecklistScore: any;
  updatedChecklistScorePercentage: any;
  checklistScorePercentage: any;
  isMaturityLevelApplicable: boolean = false;
  maturityLevelMappings: any[] = [];
  corrective_action_tracking: boolean = false;
  isdataSubmitted: boolean = true;
  isCreateAccessDisabled: boolean = false;
  checklistName: string = '';

  // Validation state tracking for highlighting
  validationAttempted: boolean = false;
  hasAppraiserError: boolean = false;
  hasAppraiseeError: boolean = false;
  hasActualStartError: boolean = false;
  hasActualEndError: boolean = false;
  hasPlannedStartError: boolean = false;

  constructor(
    public _access: AccessControl,
    private _appService: AppsService,
    public _util: MyUtility,
    private _assessmentUtil: AssessmentUtility,
    private _http: HttpClient,
    public dialog: MatDialog,
    public _layoutService: LayoutService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
    });

    let role = localStorage.getItem('role');

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this._layoutService.selectedCust = this.input_customerid;
    this.getDropDownParams();
    this.getAllProjectsFromCustomer();
  }

  getAllProjectsFromCustomer() {
    this._appService.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        this.filteredProjects = data;

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

  changeChecklistStatus(data: AuditChecklistModelNew[]) {
    this._appService.enableChecklistStatus(data).subscribe({
      next: data => {
        this.checkListDataNew = data;
        this.issubmitenabled = false;
      },
      error: (error) => { this._util.serviceError(error) }
    })
  }

  onProjectChange() {
    this.custId = this._layoutService.selectedCust;
    this.projId = this.input_projectid;
    this.clearAll();
    if (this.projId)
      this.getCCList();

    this.getEmployeeListFromproject();
    this.Service_GetPlannedAudits(this.custId, this.projId);
    this.IsSubmitted = false;
  }

  project_onChange($event: any) {
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

  filterProjects() {
    this.filteredProjects = this.projNames.filter(x => 
      x.proJ_NM.toLowerCase().includes(this.searchProjectValue.toLowerCase())
    );
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
    this.tolist = this.originalCCList;
    this.tolist.forEach(x => x.isselected = false);
    for (var Tovar of this.selectedTos) {
      let rec = this.tolist.find(x => x.emP_ID == Tovar);
      if (rec == null)
        continue;
      rec.isselected = true;
    }
    this.tolist.sort((x, y) => Number(y.isselected) - Number(x.isselected));
  }

  onClickMaturityLink() {
    window.open('/assets/images/maturitylevelaudit.png', '_blank');
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

  setStatusCategory(row: any, process: ExtendedAuditChecklistByProcess, processArea: ExtendedAuditChecklistByProcessArea, serviceArea: ExtendedAuditChecklistModelNew) {
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

  // Service Area methods
  getServiceAreaMaturityLevel(percentage: number) {
    let level = this._assessmentUtil.getServiceAreaMaturityLevel(this.maturityLevelMappings, percentage);
    return level;
  }

  getServiceAreaScore(serviceArea: ExtendedAuditChecklistModelNew) {
    let score = this._assessmentUtil.getServiceAreaScore(serviceArea);
    return score;
  }

  getServiceAreaMaxScore(serviceArea: ExtendedAuditChecklistModelNew) {
    let score = this._assessmentUtil.getServiceAreaMaxScore(this.maxMultiplier, this.checklistStatusValues, this.hideweightage, serviceArea);
    return score;
  }

  getServiceAreaPercentage(serviceArea: ExtendedAuditChecklistModelNew) {
    let percentage = this._assessmentUtil.getServiceAreaPercentage(serviceArea);
    return percentage;
  }

  getServiceAreaUpdatedScore(serviceArea: ExtendedAuditChecklistModelNew) {
    let score = this._assessmentUtil.getServiceAreaUpdatedScore(serviceArea);
    return score;
  }

  getServiceAreaUpdatedPercentage(serviceArea: ExtendedAuditChecklistModelNew) {
    let percentage = this._assessmentUtil.getServiceAreaUpdatedPercentage(serviceArea);
    return percentage;
  }

  // Process Model methods
  getProcessModelMaturityLevel(percentage: number) {
    let maturityLevel = this._assessmentUtil.getProcessModelMaturityLevel(this.maturityLevelMappings, percentage);
    return maturityLevel;
  }

  getProcessModelScore(processModel: any) {
    let score = this._assessmentUtil.getProcessModelScore(processModel);
    return score;
  }

  getProcessModelMaxScore(processModel: any) {
    let maxScore = this._assessmentUtil.getProcessModelMaxScore(processModel, this.maxMultiplier, this.checklistStatusValues, this.hideweightage);
    return maxScore;
  }

  getProcessModelPercentage(processModel: any) {
    let percentage = this._assessmentUtil.getProcessModelPercentage(processModel);
    return percentage;
  }

  getProcessModelUpdatedScore(processModel: any) {
    let score = this._assessmentUtil.getProcessModelUpdatedScore(processModel);
    return score;
  }

  getProcessModelUpdatedPercentage(processModel: any) {
    let percentage = this._assessmentUtil.getProcessModelUpdatedPercentage(processModel);
    return percentage;
  }

  // Process Area methods
  getProcessAreaMaturityLevel(percentage: number) {
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

  // Process methods
  getProcessScore(process: AuditChecklistByProcess) {
    let score = this._assessmentUtil.getProcessScore(process);
    return score;
  }

  getProcessMaxScore(process: AuditChecklistByProcess) {
    let maxScore = this._assessmentUtil.getProcessMaxScore(process, this.maxMultiplier, this.checklistStatusValues, this.hideweightage);
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

  getScoreInPercentage(row: any) {
    let acheivedscore = 0;
    let maxscore = 0;
    this.checkListDataNew.forEach(serviceArea => {
      serviceArea.checkpointS_BY_PROCESS_MODEL.forEach((processModel: any) => {
        processModel.checkpointS_BY_PROCESS_AREA.forEach((processArea: any) => {
          processArea.checkpointS_BY_PROCESS.forEach((process: any) => {
            if (process.scorE_ACHIEVED && !isNaN(process.scorE_ACHIEVED))
              acheivedscore += process.scorE_ACHIEVED;
            if (process.maX_SCORE && !isNaN(process.maX_SCORE))
              maxscore += process.maX_SCORE;
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
    this.checkListDataNew.forEach(serviceArea => {
      serviceArea.checkpointS_BY_PROCESS_MODEL.forEach((processModel: any) => {
        processModel.checkpointS_BY_PROCESS_AREA.forEach((processArea: any) => {
          processArea.checkpointS_BY_PROCESS.forEach((process: any) => {
            process.checkpoints.forEach((checkpoint: any) => {
              oscore = oscore + parseFloat(checkpoint.score.toString());
            });
          });
        })
      })
    });
    this.checklistScore = oscore;
    this.updatedChecklistScore = oscore;
  }

  getScoreForStatus(row: any) {
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

    row.updateD_SCORE = row.score;
  }

  GetAuditAssesment(i: number, auditid: number, serviceAreas: any, title: string, startdate: Date, enddate: Date, auditorid: string, auditeessid: any, status: string, plannedhour: number, actualhour: number, actualstartdate: Date, actualenddate: Date) {
    this.clearAll();
    this.IsSavedAuditsLoaded = false;

    this.plannedAudits.forEach(function (element, index) {
      if (index != i)
        element.iS_CHECKED = false;
      else
        element.iS_CHECKED = true;
    });
    this.auditDataTitle = null;
    this.getCheckListAuditData(auditid, serviceAreas, title, startdate, enddate, auditorid, auditeessid, status, plannedhour, actualhour, actualstartdate, actualenddate);
  }

  getDropDownParams() {
    this.service_getDropDownDataForAudit();
  }

  Service_GetPlannedAudits(custid: string, projid: string) {
    this.IsSavedAuditsLoaded = false;
    this.isLoading = true;
    this._appService.getPlannedAudits(custid, projid).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.originalPlannedAudits = data;
          this.plannedAudits = data.filter(x => x.status != 'COMPLETED');
          let auditsIds = data.map((x: any) => x.id).join(',');
          this.getOpenFindingsCount(auditsIds);
        }
        else {
          this.plannedAudits = data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
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
        this._util.serviceError(error);
      })
  }

  getFindingsCount(id: number) {
    let count = this._util.getFindingsCount(this.findings, id, "total");
    return count;
  }

  getOpenFindingCount(id: number) {
    let count = this._util.getFindingsCount(this.findings, id, "open");
    return count;
  }

  getClosedFindingsCount(id: number) {
    let count = this._util.getFindingsCount(this.findings, id, "closed");
    return count;
  }

  getCheckListAuditData(auditid: number, serviceareas: any, title: string, startdate: Date, enddate: Date, auditorid: string, auditeessid: any, status: string,
    plannedhour: number, actualhour: number, actualstartdate: Date, actualenddate: Date) {

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
    this.checklistScore = undefined;
    this.checklistScorePercentage = undefined;
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
          this._util.showWarningPopup('No checklists generated for this Assessment');
          return;
        }
      },
      error => { this._util.serviceError(error); }
    )
  }

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
              if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[p].checkpointS_BY_PROCESS_AREA[l].checkpointS_BY_PROCESS[k].checkpoints.some((checkpoint: any) => checkpoint.issubmitted)) {
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

  setChecklistData() {
    this.checkListDataNew = [];
    let submitflag = false;

    let record = this.checklist.find(x => x.checklisT_ID == this.selectedchecklist);
    if (record)
      this.getMappedChecklistData(record);
  }

  getEmployeeListFromproject() {
    this._appService.getAuditeeDetails(this.custId, this.projId, false).subscribe(
      data => {
        this.auditeesList = data;
      },
      error => { this._util.serviceError(error); }
    )
  }

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
    this.selectedAuditees = [];
    this.selectedAuditor = '';
    this.auditDataTitle = null;
    this.plannedHours = null;
    this.actualHours = null;
    this.auditscope = '';
    this.actualstartDate = null;
    this.actualendDate = null;
    this.selectedServiceArea = [];
  }

  SaveCheckListExecutionNew(status: string) {
    if (status == "AFSubmit") {
      this._util.showWarningConfirmation(
        "Are you sure you want to submit? After submission no change is possible",
        "Confirm Submission"
      ).subscribe((result: boolean) => {
        if (result) {
          this.ValidateFieldsNew(status);
        }
      });
    }
    else {
      this.fillDetailsNew();
      this.service_SaveAuditChecklistDetails(status);
    }
  }

  ValidateFieldsNew(status: string) {
    // Reset validation states
    this.validationAttempted = true;
    this.resetValidationErrors();

    if (this.auditDataTitle != null && this.selectedAuditor != undefined && this.selectedAuditees != undefined && this.selectedAuditees.length > 0 &&
      this.startDate != undefined && this.endDate != undefined && this.actualstartDate != undefined && this.actualendDate != undefined
      && this.plannedHours != undefined && this.actualHours != undefined) {
      if (!this.validateAllQuestions()) {
        this._util.showWarningPopup("Please choose a status for all the questions");
        return;
      }
      if (!this.validateFindingsNew()) {
        this._util.showWarningPopup('Please enter findings for questions with not met status');
        return;
      }
      this.fillDetailsNew();
      this.service_SaveAuditChecklistDetails(status);
    }
    else {
      if (this.selectedAuditor == undefined) {
        this.hasAppraiserError = true;
        this._util.showWarningPopup('Please choose an Appraiser');
        return;
      }

      if (this.selectedAuditees == undefined || this.selectedAuditees.length == 0) {
        this.hasAppraiseeError = true;
        this._util.showWarningPopup('Please choose Appraisees');
        return;
      }

      if (this.actualstartDate == undefined || this.actualstartDate == null) {
        this.hasActualStartError = true;
        this._util.showWarningPopup('Please enter actual start date');
        return;
      }

      if (this.actualendDate == undefined || this.actualendDate == null) {
        this.hasActualEndError = true;
        this._util.showWarningPopup('Please enter actual end date');
        return;
      }

      if (this.startDate == undefined || this.startDate == null) {
        this.hasPlannedStartError = true;
        this._util.showWarningPopup('Please enter planned start date');
        return;
      }

      this._util.showWarningPopup('Please enter valid values for all assessment fields');
      return;
    }
  }

  resetValidationErrors() {
    this.hasAppraiserError = false;
    this.hasAppraiseeError = false;
    this.hasActualStartError = false;
    this.hasActualEndError = false;
    this.hasPlannedStartError = false;
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

  fillDetailsNew() {
    this.checklistExeViewModel = new ChecklistExecutionViewModel();
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.id = this.checklistSummaryRec.id;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.checklisT_ID = this.selectedchecklist;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.assessmenT_ID = this.selectedAuditId;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.customeR_ID = this.custId;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.projecT_ID = this.projId;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.planneD_AUDIT_START_DATE = this.startDate ? new Date(this.startDate).toDateString() : '';
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.planneD_AUDIT_END_DATE = this.endDate ? new Date(this.endDate).toDateString() : '';
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.actuaL_AUDIT_START_DATE = this.actualstartDate ? new Date(this.actualstartDate).toDateString() : '';
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.actuaL_AUDIT_END_DATE = this.actualendDate ? new Date(this.actualendDate).toDateString() : '';
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.audiT_ACTUAL_HOURS = this.actualHours || 0;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.audiT_PLANNED_HOURS = this.plannedHours || 0;
    this.checklistExeViewModel.audiT_CHECKLIST_EXECUTION_SUMMARY.audiT_TITLE = this.auditDataTitle || '';
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
                return this.checkIfAny1MandatoryFindingentered(this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[k].checkpoints[j].findings);
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
      data => {
        if (status == "AFSubmit") {
          this._util.showSuccessPopup("Data Submitted Successfully");
          this.checkListDataNew = data.audiT_CHECKLIST_BY_SERVICE_AREA_LIST;
          this.checklistSummaryRec = data.audiT_CHECKLIST_EXECUTION_SUMMARY;
          this.IsSubmitted = true;
          this.isdataSubmitted = true;
          this.issubmitenabled = true;
        }
        else {
          this._util.showSuccessPopup('Data saved Successfully');
          this.checkListDataNew = data.audiT_CHECKLIST_BY_SERVICE_AREA_LIST;
          this.checklistSummaryRec = data.audiT_CHECKLIST_EXECUTION_SUMMARY;
          this.IsSubmitted = false;
        }
      },
      (error) => {
        this._util.serviceError(error);
        this.IsSubmittednew = false;
        this.IsSubmitted = false;
        this.isdataSubmitted = true;
        this.uncheckEveryQuestion(this.checkListDataNew);
      }
    )
  }

  checkEveryQuestion(checklistData: ExtendedAuditChecklistModelNew[]) {
    checklistData.forEach(serviceArea => {
      serviceArea.checkpointS_BY_PROCESS_MODEL.forEach((processModel: ExtendedAuditChecklistByProcessModel) => {
        processModel.checkpointS_BY_PROCESS_AREA.forEach((processArea: any) => {
          processArea.checkpointS_BY_PROCESS.forEach((process: any) => {
            process.checkpoints.forEach((checkpoint: any) => {
              checkpoint.issubmitted = true;
            });
          })
        })
      })
    })
  }

  uncheckEveryQuestion(checklistData: ExtendedAuditChecklistModelNew[]) {
    checklistData.forEach(serviceArea => {
      serviceArea.checkpointS_BY_PROCESS_MODEL.forEach((processModel: ExtendedAuditChecklistByProcessModel) => {
        processModel.checkpointS_BY_PROCESS_AREA.forEach((processArea: any) => {
          processArea.checkpointS_BY_PROCESS.forEach((process: any) => {
            process.checkpoints.forEach((checkpoint: any) => {
              checkpoint.issubmitted = false;
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

  autoGrowTextZone(e: any) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 10) + "px";
  }

  // N/A checkbox handlers
  selectAllServiceArea(event: any, data: any) {
    if (data.isSelected) {
      data.checkpointS_BY_PROCESS_MODEL.forEach((processModel: any) => {
        processModel.isSelected = true;
        this.selectAllProcessModel(event, processModel);
      });
    } else {
      data.checkpointS_BY_PROCESS_MODEL.forEach((processModel: any) => {
        processModel.isSelected = false;
        this.selectAllProcessModel(event, processModel);
      });
    }
  }

  selectAllProcessModel(event: any, processModel: any) {
    if (processModel.isSelected) {
      processModel.checkpointS_BY_PROCESS_AREA.forEach((processArea: any) => {
        processArea.isSelected = true;
        this.selectAllProcessArea(event, processArea);
      });
    } else {
      processModel.checkpointS_BY_PROCESS_AREA.forEach((processArea: any) => {
        processArea.isSelected = false;
        this.selectAllProcessArea(event, processArea);
      });
    }
  }

  selectAllProcessArea(event: any, processArea: any) {
    if (processArea.isSelected) {
      processArea.checkpointS_BY_PROCESS.forEach((process: any) => {
        process.isSelected = true;
        this.selectAllProcess(event, process);
      });
    } else {
      processArea.checkpointS_BY_PROCESS.forEach((process: any) => {
        process.isSelected = false;
        this.selectAllProcess(event, process);
      });
    }
  }

  selectAllProcess(event: any, process: any) {
    if (process.isSelected) {
      process.checkpoints.forEach((checkpoint: any) => {
        checkpoint.statuS_VALUE_ID = this.checklistStatusValues.find((x: any) => x.statuS_CATEGORY === 'NA')?.id;
        if (checkpoint.statuS_VALUE_ID) {
          this.setStatusCategory(checkpoint, process, event, event);
        }
      });
    } else {
      process.checkpoints.forEach((checkpoint: any) => {
        checkpoint.statuS_VALUE_ID = undefined;
        checkpoint.score = 0;
        checkpoint.maX_SCORE = 0;
      });
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
