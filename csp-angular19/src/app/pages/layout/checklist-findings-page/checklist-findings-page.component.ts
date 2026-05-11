import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

// Services
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { LayoutService } from '../../../features/layout/layout.service';

// Models
import { EmpInfoModel } from '../../../models/emp-info-model';
import { 
  ChecklistNew, 
  AuditChecklistModelNew, 
  AuditCheckListModel, 
  ObservationModel, 
  ChecklistExecutionSummary, 
  ChecklistExecutionViewModel 
} from '../../../core/models/audit-checklist-based-model';
import { CheckListExecutionModel } from '../../../core/models/checklist-execution';
import { FindingModel } from '../../../models/qaassessmentdetails-model';
import { ProjectsModel } from '../../../models/projects-model';

// Components
import { ChecklistAuditeeComponent } from '../../../features/sqa-management/checklist-auditee/checklist-auditee.component';

// Environment
import { environment } from '../../../../environments/environment';
import { enumRoles } from '../../../shared/enum';

@Component({
  selector: 'app-checklist-findings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    ChecklistAuditeeComponent
  ],
  templateUrl: './checklist-findings-page.component.html',
  styleUrls: ['./checklist-findings-page.component.scss']
})
export class ChecklistFindingsPageComponent implements OnInit {
  
  // Injected services
  private _appService = inject(AppsService);
  public _util = inject(MyUtility);
  public _access = inject(AccessControl);
  public _layoutService = inject(LayoutService);
  private _http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Component properties
  projNames: any[] = [];
  filteredProjNames: any[] = [];
  projectSearchText: string = '';
  allproj: boolean = false;
  input_projectid: string = '';
  input_customerid: string = '';
  sub: any;
  originalPlannedAudits: any[] = [];
  checklistStatusValues: any[] = [];
  originalCCList: EmpInfoModel[] = [];
  tolist: EmpInfoModel[] = [];
  cclist: EmpInfoModel[] = [];
  issubmitenabled: boolean = false;
  auditorList: any;
  @Input("processDescription") processDescription: any[] = [];
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
  checkListData: AuditCheckListModel[] = [];
  projId: string = '';
  IsSubmitted: boolean = false;
  submittedAll: boolean = false;
  selectedAuditees: string[] = [];
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

  // ── Pagination ──────────────────────────────────────────────────────────
  pagedAudits: any[] = [];       // slice shown in the table
  filteredAudits: any[] = [];    // search-filtered list
  pageSize: number = 5;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 20];
  searchQuery: string = '';

  onSearchChange() {
    const q = (this.searchQuery || '').toLowerCase().trim();
    this.filteredAudits = q
      ? this.plannedAudits.filter(a =>
          (a.description || '').toLowerCase().includes(q) ||
          (a.status || '').toLowerCase().includes(q)
        )
      : [...this.plannedAudits];
    this.pageIndex = 0;
    this.applyPage();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.applyPage();
  }

  private applyPage() {
    if (!this.filteredAudits || this.filteredAudits.length === 0) {
      this.filteredAudits = [...this.plannedAudits];
    }
    const start = this.pageIndex * this.pageSize;
    this.pagedAudits = this.filteredAudits.slice(start, start + this.pageSize);
  }

  getComplianceColor(value: number | null | undefined): string {
    if (value === null || value === undefined || value === 0) return '#bdbdbd';
    if (value >= 80) return '#4caf50';
    if (value >= 50) return '#ff9800';
    return '#f44336';
  }

  getComplianceWidth(value: number | null | undefined): string {
    const v = Math.min(Math.max(Number(value) || 0, 0), 100);
    return v + '%';
  }
  // ────────────────────────────────────────────────────────────────────────
  checkListDataNew: AuditChecklistModelNew[] = [];
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
  selectedCCs: any[] = [];
  selectedTos: any[] = [];
  checklistSummaryRec = new ChecklistExecutionSummary();
  checklistExeViewModel = new ChecklistExecutionViewModel();
  input_auditid: number = 0;
  role: string = '';
  isLoading: boolean = false;
  isDetailsLoading: boolean = false;
  openFindings: any;
  updatedChecklistScore: any;
  updatedChecklistScorePercentage: any;
  checklistScorePercentage: any;
  isMaturityLevelApplicable: boolean = false;
  maturityLevelMappings: any[] = [];
  corrective_action_tracking: boolean = false;
  isdataSubmitted: boolean = true;
  isCreateAccessDisabled: boolean = false;

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

    this.role = localStorage.getItem('role') || '';

    if (this.role == enumRoles.BUHeadIMS.toString() || 
        this.role == enumRoles.PMO.toString() || 
        this.role == enumRoles.Quality.toString()) {
      this.allproj = true;
    }

    this._layoutService.selectedCust = this.input_customerid;
    this.getAllProjectsFromCustomer();
  }

  getAllProjectsFromCustomer() {
    this._appService.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe({
      next: (data) => {
        this.projNames = data;
        this.filteredProjNames = [...data];
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          if (!this.input_projectid)
            this.input_projectid = this.projNames[0].proJ_ID;
          this.onProjectChange();
        }
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
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
    this._appService.enableChecklistStatus(data).subscribe({
      next: (data) => {
        this.checkListDataNew = data;
        this.issubmitenabled = false;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Scroll to the Assessment Details panel after a short delay
   * to allow Angular to render it once auditDataTitle is set.
   * 
   * Note: Using document.querySelector here for dynamically rendered content.
   * The details panel is conditionally rendered and not available at component init.
   */
  scrollToDetails() {
    setTimeout(() => {
      const el = document.querySelector('.details-panel') as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }

  GetAuditAssesment(i: number, auditid: number, serviceAreas: any, title: string, startdate: any, 
                     enddate: any, auditorid: string, auditeessid: any, status: string, 
                     plannedhour: number, actualhour: number, actualstartdate: any, actualenddate: any) {
    this.clearAll();
    this.IsSavedAuditsLoaded = false;

    this.plannedAudits.forEach(function (element, index) {
      if (index != i)
        element.iS_CHECKED = false;
      else
        element.iS_CHECKED = true;
    });
    
    this.auditDataTitle = '';
    this.getCheckListAuditData(auditid, serviceAreas, title, startdate, enddate, auditorid, 
                               auditeessid, status, plannedhour, actualhour, actualstartdate, actualenddate);
  }

  getDropDownParams() {
    this.service_getDropDownDataForAudit();
  }

  Service_GetPlannedAudits(custid: string, projid: string) {
    this.IsSavedAuditsLoaded = false;
    this.isLoading = true;
    this._appService.getPlannedAudits(custid, projid).subscribe({
      next: (data) => {
        this.originalPlannedAudits = data;
        if (data && data.length > 0 && this.role == enumRoles.Quality.toString()) {
          this.plannedAudits = data;
          let auditsIds = data.map((x: any) => x.id).join(',');
          this.getOpenFindingsCount(auditsIds);
        } else {
          this.plannedAudits = data;
        }
        this.pageIndex = 0;
        this.searchQuery = '';
        this.filteredAudits = [...this.plannedAudits];
        this.applyPage();

        if (this.input_auditid > 0) {
          var assessmentDetailsByAssessmentId = this.originalPlannedAudits.filter(x => x.id == this.input_auditid);
          if (assessmentDetailsByAssessmentId.length > 0) {
            this.IsSavedAuditsLoaded = false;
            assessmentDetailsByAssessmentId[0].iS_CHECKED = true;
            this.auditDataTitle = assessmentDetailsByAssessmentId[0].description;
            this.getCheckListAuditData(
              this.input_auditid, 
              assessmentDetailsByAssessmentId[0].servicE_AREA_ID, 
              this.auditDataTitle, 
              assessmentDetailsByAssessmentId[0].scheduleD_START_DATE, 
              assessmentDetailsByAssessmentId[0].duE_DATE, 
              assessmentDetailsByAssessmentId[0].auditoR_ID, 
              assessmentDetailsByAssessmentId[0].auditesS_ID, 
              assessmentDetailsByAssessmentId[0].status, 
              assessmentDetailsByAssessmentId[0].scheduleD_DURATION, 
              assessmentDetailsByAssessmentId[0].actuaL_DURATION, 
              assessmentDetailsByAssessmentId[0].actuaL_START_DATE, 
              assessmentDetailsByAssessmentId[0].actuaL_END_DATE
            );
          }
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
    this._appService.getOpenFindingsCount(auditIds).subscribe({
      next: (data) => {
        this.openFindings = data;
        if (this.plannedAudits && this.plannedAudits.length > 0) {
          this.IsSavedAuditsLoaded = true;
          this.applyPage();
        }
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  getFindingsCount(id: number): number {
    let count = this._util.getFindingsCount(this.openFindings, id, "total");
    return count;
  }

  checklistName: string = '';

  getCheckListAuditData(auditid: number, serviceareas: any, title: string, startdate: any, enddate: any, 
                        auditorid: string, auditeessid: any, status: string, plannedhour: number, 
                        actualhour: number, actualstartdate: any, actualenddate: any) {
    this.auditDataTitle = title;
    this.selectedAuditor = auditorid;
    this.selectedAuditees = auditeessid;
    this.plannedHours = plannedhour;
    this.actualHours = actualhour;
    this.startDate = startdate;
    this.endDate = enddate;
    this.actualstartDate = actualstartdate;
    this.actualendDate = actualenddate;
    this.selectedAuditId = auditid;

    if (serviceareas != undefined && serviceareas.length > 0)
      this.selectedServiceArea = serviceareas.map((x: any) => +x);
    else
      this.selectedServiceArea = this.serviceAreaNew.map(x => x.id);

    this.checklist = [];
    this.IsSubmitted = false;
    this.issubmitenabled = false;
    this.isDetailsLoading = true;

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

    this._appService.getCheckListDataForProjNew(data).subscribe({
      next: (data) => {
        this.checklist = data;
        this.isDetailsLoading = false;
        if (this.checklist.length > 0) {
          let record = this.checklist.find(x => x.mappeD_CHECKLIST == true);
          if (record != null)
            this.getMappedChecklistData(record);
          else
            this.getMappedChecklistData(this.checklist[0]);
        } else {
          this.showToast('No checklists generated for this Assessment', 'warn');
          return;
        }
      },
      error: (error) => {
        this.isDetailsLoading = false;
        this._util.serviceError(error);
      }
    });
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
    if (!this.startDate)
      this.startDate = new Date(this.checklistSummaryRec.planneD_AUDIT_START_DATE);
    if (!this.endDate)
      this.endDate = new Date(this.checklistSummaryRec.planneD_AUDIT_END_DATE);
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
                if (this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].findinG_DESCRIPTION != undefined &&
                    this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].findinG_DESCRIPTION.length > 0 &&
                    this.checkListDataNew[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l].issubmitted == false) {
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
      mappingRecord = this.maturityLevelMappings.find(x => 
        this.checklistScorePercentage >= x.loweR_BOUND_SCORE &&
        this.checklistScorePercentage <= x.uppeR_BOUND_SCORE
      );
      if (mappingRecord != null)
        this.checklistmaturitylevel = mappingRecord.leveL_TITLE;
      else
        this.checklistmaturitylevel = '';
    }
  }

  setChecklistData() {
    this.checkListDataNew = [];
    let submitflag = false;
    let record = this.checklist.find(x => x.checklisT_ID == this.selectedchecklist);
    if (record)
      this.getMappedChecklistData(record);
  }

  getEmployeeListFromproject() {
    this._appService.getAuditeeDetails(this.custId, this.projId).subscribe({
      next: (data) => {
        this.auditeesList = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  service_getDropDownDataForAudit() {
    let header = new HttpHeaders({ 
      'Accept': 'application/json', 
      'token': this._util.AppSettings.token 
    });
    let apiuri: string = environment.webapiuri + 'GetDropDownParamsForAudit';
    this._http.get(apiuri, { headers: header }).subscribe({
      next: (data) => {
        this.ddData = data;
        this.auditorList = (this.ddData as any).auditoR_LIST;
        this.serviceArea = (this.ddData as any).servicE_AREA;
        this.serviceAreaNew = (this.ddData as any).procesS_SERVICE_AREA_NEW;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
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
  }

  checkIfAny1MandatoryFindingentered(findings: ObservationModel[]): boolean {
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

  autoGrowTextZone(e: any) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 25) + "px";
  }

  /**
   * Helper method to check if checklist auditee component should be shown
   * Checks the deep nested structure safely
   */
  shouldShowChecklistAuditee(): boolean {
    return !!(
      this.checkListDataNew && 
      this.checkListDataNew.length > 0 && 
      this.checkListDataNew[0] &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0] &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0] &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0] &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints[0] &&
      this.checkListDataNew[0].checkpointS_BY_PROCESS_MODEL[0].checkpointS_BY_PROCESS_AREA[0].checkpointS_BY_PROCESS[0].checkpoints[0].issubmitted
    );
  }

  // ── Toast helper ──────────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error' | 'warn' = 'success') {
    const panelClass = type === 'success' ? ['snack-success']
                     : type === 'error'   ? ['snack-error']
                     : ['snack-warn'];
    const duration   = type === 'error' ? 4000 : 3000;
    this._snackBar.open(message, '✕', {
      duration,
      panelClass,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  // ── Get selected appraisee names for tooltip ──────────────────────────────
  getSelectedAppraiseeNames(): string {
    if (!this.selectedAuditees || this.selectedAuditees.length === 0) {
      return '';
    }
    const names = this.auditeesList
      ?.filter((a: any) => this.selectedAuditees.includes(a.emP_ID))
      .map((a: any) => a.frsT_NM)
      .join(', ');
    return names || '';
  }

  // ── Get selected checklist name for tooltip ───────────────────────────────
  getSelectedChecklistName(): string {
    if (!this.selectedchecklist || !this.checklist) {
      return '';
    }
    const selected = this.checklist.find((c: any) => c.checklisT_ID === this.selectedchecklist);
    return selected?.checklisT_NAME || '';
  }

  // ── Filter projects based on search text ──────────────────────────────────
  filterProjects(): void {
    const searchTerm = this.projectSearchText.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredProjNames = [...this.projNames];
    } else {
      this.filteredProjNames = this.projNames.filter(proj => 
        proj.proJ_NM?.toLowerCase().includes(searchTerm)
      );
    }
  }
}
