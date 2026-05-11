/**
 * Checklist Auditee Component - Migrated from legacy
 * Handles CAPA (Corrective Action Preventive Action) workflow for audit findings
 * This is a simplified version - full implementation with 5-stage CAPA workflow to be completed
 */

import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { AccesscontrolManagementComponent } from '../../../components/accesscontrol-management/accesscontrol-management.component';

@Component({
  selector: 'app-checklist-auditee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressBarModule,
    AccesscontrolManagementComponent
  ],
  templateUrl: './checklist-auditee.component.html',
  styleUrls: ['./checklist-auditee.component.scss']
})
export class ChecklistAuditeeComponent implements OnInit {
  
  // Input properties from parent component
  @Input() checklistSummaryRec: any = {};
  @Input() checkListData: any[] = [];
  @Input() originalPlannedAudits: any[] = [];
  
  // Output event to notify parent of changes
  @Output() selectedChecklist: EventEmitter<any[]> = new EventEmitter<any[]>();
  
  // ViewChild reference for CAPA container scroll functionality
  @ViewChild('capaContainer', { static: false }) capaContainer!: ElementRef;
  
  // Component state
  checkListFindings: any[] = [];
  selectAll: boolean = false;
  disableAcceptReject: boolean = false;
  showCheck: boolean = false;
  showForQATeam: boolean = false;
  showForAuditor: boolean = false;
  dueDate: Date | null = null;
  date: any = new Date().toISOString().split('T')[0];
  auditeeResponses: any[] = [];
  
  // CAP workflow state
  viewCAPA: boolean = false;
  actionPlan: any = null;
  actionPlanQiestion: any = null;
  findingStatus: any = {};
  rootCauseIds: number[] = [];
  causeCollection: any[] = [];
  empInfo: any[] = [];
  selectedRow: number = -1;
  selectedQuest: number = -1;
  projSpocs: any = null;
  
  // CAP button states
  iscapsubmitbutton: boolean = false;
  iscapreviewbutton: boolean = false;
  isimplementbutton: boolean = false;
  isverficationbutton: boolean = false;
  
  // Loading states
  disablesubmittillSave: boolean = false;
  disabletillreviewSave: boolean = false;
  disabletillSaveImplement: boolean = false;
  disableTillSaveVerification: boolean = false;
  
  // Evidence mappings for stages 3 & 4
  stage3EvidenceMappings: any[] = [];
  stage4EvidenceMappings: any[] = [];
  capaVerifiedBy: string = '';
  isFileAction: boolean = false;

  // CAPA workflow flags (migrated from legacy)
  flag: boolean = false;
  rejectImp: boolean = false;
  submitcap: boolean = false;
  SelectedValue: any[] = [];
  SelectedValueImp: any[] = [];
  auditFindingCappa: any;
  project: string[] = [];
  
  // Max target date for CAP
  maxTargetDate: Date = new Date();
  
  // Access control
  projectId: string = '';
  custId: string = '';
  accessType: number = 0;
  showAccessRequestButton: boolean = false;
  resourceIds: number[] = [108, 109, 111];

  // Inject ElementRef for DOM manipulation
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    public _access: AccessControl,
    private _appservice: AppsService,
    public _utility: MyUtility
  ) {}

  ngOnInit() {
    
    if (this.originalPlannedAudits && this.originalPlannedAudits.length > 0 && this.checklistSummaryRec) {
      const audit = this.originalPlannedAudits.find((x: any) => x.id == this.checklistSummaryRec.assessmenT_ID);
      if (audit) {
        this.dueDate = audit.duE_DATE;
      }
    }
    
    // Get all auditee responses
    this.getAllAuditeeResponses();

    // Load cause & root cause collection for CAP dropdown
    this.getCauses();

    this.getFindings();
  }

  /**
   * Get all auditee responses for findings — loads Accept/Reject status + remarks
   */
  getAllAuditeeResponses() {
    if (!this.checklistSummaryRec || !this.checklistSummaryRec.assessmenT_ID) {
      return;
    }

    this._appservice.getAllAuditeeResponses(this.checklistSummaryRec.assessmenT_ID).subscribe({
      next: (data: any) => {
        this.auditeeResponses = data || [];
        // Populate remarks from response data into each finding object
        this.setauditeeRemarks();
        // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.warn('Could not fetch auditee responses:', error);
        this.auditeeResponses = [];
      }
    });
  }

  /**
   * Populate remarks on each finding from the loaded auditeeResponses
   * Mirrors legacy setauditeeRemarks()
   */
  setauditeeRemarks() {
    this.checkListFindings.forEach((question: any) => {
      question.findings.forEach((find: any) => {
        const rec = this.auditeeResponses.find((x: any) => x.findinG_ID === find.id);
        if (rec !== undefined) {
          find.remarks = rec.remarks || '';
        }
      });
    });
  }

  /**
   * Get remarks for a finding from auditeeResponses (mirrors legacy getremarks)
   */
  getremarks(find: any): string {
    const rec = this.auditeeResponses.find((x: any) => x.findinG_ID === find.id);
    return rec ? (rec.remarks || '') : '';
  }

  /**
   * Extract findings from checklist data
   */
  getFindings() {
    this.checkListFindings = [];

    // Assign custId and projectId from checklistSummaryRec for file upload/download
    this.custId = this.checklistSummaryRec?.customeR_ID || '';
    this.projectId = this.checklistSummaryRec?.projecT_ID || '';

    if (!this.checkListData || this.checkListData.length === 0) {
      console.warn('No checklist data available');
      return;
    }

    // Extract all findings from the nested structure
    for (let i = 0; i < this.checkListData.length; i++) {
      for (let n = 0; n < this.checkListData[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
        for (let p = 0; p < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
          for (let j = 0; j < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; j++) {
            for (let k = 0; k < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints.length; k++) {
              const checkpoint = this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k];
              
              if (checkpoint.findings && checkpoint.findings.length > 0) {
                const findingsWithDescription = checkpoint.findings.filter((f: any) => 
                  f.findinG_DESCRIPTION && f.findinG_DESCRIPTION.trim().length > 0
                );
                
                if (findingsWithDescription.length > 0) {
                  // Initialize stage colors and other properties for each finding
                  const processedFindings = findingsWithDescription.map((f: any) => ({
                    ...f,
                    ischecked: false,
                    remarks: f.remarks || '',
                    addActionPlan: false,
                    // Parse stage colors - can be string or array
                    stagE_COLORS: this.parseStageColors(f.stagE_COLORS)
                  }));
                  
                  this.checkListFindings.push({
                    looK_FOR: checkpoint.looK_FOR,
                    findings: processedFindings
                  });
                }
              }
            }
          }
        }
      }
    }

    
    // Load stage colors from backend (updates stagE_COLORS on each finding)
    // then load auditee responses (sets remarks + acceptance status)
    this.getChecklistFindingStages();
    
    // Determine access rights
    const empId = localStorage.getItem('empid');
    this.determineAccessRights(empId);
  }

  /**
   * Initialize stage colors for a finding
   * Default: All stages red (pending) - #FF5969
   * Green when complete - #3AB376
   */
  initializeStageColors(finding: any): string[] {
    // Default: 4 stages all red (pending)
    const defaultColors = ['#FF5969', '#FF5969', '#FF5969', '#FF5969'];
    
    // Check if finding has acceptance status
    if (finding.auditeE_ACCEPTANCE_STATUS === 'Accept') {
      // First stage green if accepted
      return ['#3AB376', '#FF5969', '#FF5969', '#FF5969'];
    }
    
    return defaultColors;
  }

  /**
   * Parse stage colors - can be string (comma-separated) or array
   */
  parseStageColors(stageColors: any): string[] {
    if (!stageColors) {
      return this.getDefaultStageColors();
    }
    
    // If already an array, return it
    if (Array.isArray(stageColors)) {
      return stageColors;
    }
    
    // If string, split by comma
    if (typeof stageColors === 'string') {
      return stageColors.split(',').map(c => c.trim());
    }
    
    return this.getDefaultStageColors();
  }

  /**
   * Get default stage colors (all red = pending)
   */
  getDefaultStageColors(): string[] {
    return ['#FF5969', '#FF5969', '#FF5969', '#FF5969'];
  }

  /**
   * Get stage colors from backend.
   * Mirrors legacy exactly: send checkListFindings (grouped structure) to API,
   * API returns same structure with stagE_COLORS updated on each finding,
   * replace checkListFindings with the response, then load auditee responses.
   */
  getChecklistFindingStages() {
    if (!this.checkListFindings || this.checkListFindings.length === 0) {
      this.getAllAuditeeResponses();
      return;
    }

    this._appservice.getStageColor(this.checkListFindings).subscribe({
      next: (data: any) => {
        if (data && Array.isArray(data) && data.length > 0) {
          // Full replacement — legacy: this.checkListFindings = data
          // Re-attach runtime-only properties (ischecked, remarks) from current state
          data.forEach((group: any, gi: number) => {
            if (group.findings) {
              group.findings.forEach((f: any, fi: number) => {
                // Parse stage colors returned as string "color1,color2,..."
                f.stagE_COLORS = this.parseStageColors(f.stagE_COLORS);
                // Preserve runtime-only state from existing findings
                const existing = this.checkListFindings[gi]?.findings?.[fi];
                if (existing) {
                  f.ischecked = existing.ischecked ?? false;
                  f.remarks   = existing.remarks   ?? f.remarks ?? '';
                }
              });
            }
          });
          this.checkListFindings = data;
        }
        // After stage colors are set, load auditee responses (remarks + accept/reject)
        this.getAllAuditeeResponses();
      },
      error: (error: any) => {
        console.warn('Could not fetch stage colors, using defaults:', error);
        // Still load auditee responses even if stage colors fail
        this.getAllAuditeeResponses();
      }
    });
  }

  /**
   * Load project SPOCs and set role-based access flags.
   * Mirrors legacy getProjSpocs() exactly.
   *
   * Stage submit button visibility:
   *   Stage 1 (CAP Submission)    → Auditee  : showCheck || showForQATeam
   *   Stage 2 (CAP Review)        → Appraiser: showForAuditor || showForQATeam
   *   Stage 3 (Implementation)    → Auditee  : showCheck || showForQATeam
   *   Stage 4 (Verification)      → Appraiser: showForAuditor || showForQATeam
   *
   * Rules (from project SPOCs API):
   *   showCheck       = logged-in user is PM, DM, or is in auditeE_LIST
   *   showForQATeam   = logged-in user is in qA_HEAD list
   *   showForAuditor  = logged-in user matches auditoR_ID (Appraiser)
   */
  determineAccessRights(empId: any) {
    if (!this.checkListData || this.checkListData.length === 0) return;
    if (!this.checklistSummaryRec?.projecT_ID) return;

    this._appservice.getProjectSpocsByProjId(this.checklistSummaryRec.projecT_ID).subscribe({
      next: (data: any) => {
        this.projSpocs = data;

        // PM / DM → Auditee submit rights
        if (this.projSpocs != null) {
          if (empId === this.projSpocs.proJ_PM_EMP_ID || empId === this.projSpocs.proJ_DM_EMP_ID) {
            this.showCheck = true;
          }
        }

        // auditeE_LIST → Auditee submit rights (stages 1 & 3)
        if (this.checklistSummaryRec.auditeE_LIST != null) {
          if (this.checklistSummaryRec.auditeE_LIST.includes(empId)) {
            this.showCheck = true;
          }
        }

        // QA Head list → QA Team rights (all stages)
        if (this.projSpocs?.qA_HEAD != null) {
          const qaHeadArray = this.projSpocs.qA_HEAD.split(',');
          if (qaHeadArray.includes(empId)) {
            this.showForQATeam = true;
          }
        }

        // Auditor / Appraiser → Appraiser submit rights (stages 2 & 4)
        if (this.checklistSummaryRec.auditoR_ID != null) {
          if (this.checklistSummaryRec.auditoR_ID === empId) {
            this.showForAuditor = true;
          }
        }

        // Mirror legacy emitRequestChanges(): set accessType = 1 (View)
        this.accessType = 1;

        // Show access-request button only if user has no role
        this.showAccessRequestButton = !(this.showCheck || this.showForQATeam || this.showForAuditor);
      },
      error: (error: any) => {
        this._utility.serviceError(error);
      }
    });
  }

  /**
   * Select/deselect all findings
   */
  selectallFindings() {
    this.checkListFindings.forEach((question) => {
      question.findings.forEach((find: any) => {
        find.ischecked = this.selectAll;
      });
    });
  }

  /**
   * Scroll to a specific finding in the table
   */
  scrollToFinding(findingId: any) {
    if (!findingId) return;
    
    const findingRow = this.elementRef.nativeElement.querySelector('#finding-' + findingId);
    if (findingRow) {
      findingRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Close CAP view
      this.viewCAPA = false;
    }
  }

  /**
   * Save auditee/auditor response (Accept/Reject)
   * Determines if this is an auditor responding to a rejection or auditee initial response
   * Mirrors legacy SaveResponse() and SaveAuditorResponse() logic
   */
  SaveResponse(status: string) {
    this.disableAcceptReject = true;
    
    let selectedFindings: any[] = [];
    let findingIds: number[] = [];
    let isAuditorResponse = false;
    
    // Collect selected findings - check if any have 'Reject' status (auditor response scenario)
    this.checkListFindings.forEach((question) => {
      question.findings.forEach((find: any) => {
        if (find.ischecked) {
          const currentResponse = this.getAuditeeResponse(find.id);
          
          // If finding has 'Reject' status, this is auditor accepting/rejecting the rejection
          if (currentResponse === 'Reject') {
            isAuditorResponse = true;
            selectedFindings.push(find);
            findingIds.push(find.id);
          }
          // Include if: no response, null response, or 'Auditor Rejected'
          else if (!currentResponse || currentResponse === null || currentResponse === 'Auditor Rejected') {
            selectedFindings.push(find);
            findingIds.push(find.id);
          }
          // Include if previous response exists and it's not 'Accept'
          else if (currentResponse !== 'Accept' && find.ischecked) {
            selectedFindings.push(find);
            findingIds.push(find.id);
          }
        }
      });
    });

    if (selectedFindings.length === 0) {
      this._utility.showError('Please select a finding to accept/reject');
      this.disableAcceptReject = false;
      return;
    }

    // Validate remarks for rejection - only for findings with no previous response (auditor rejection)
    if (status === 'Reject' && isAuditorResponse) {
      for (let i = 0; i < this.checkListFindings.length; i++) {
        for (let j = 0; j < this.checkListFindings[i].findings.length; j++) {
          const finding = this.checkListFindings[i].findings[j];
          if (this.getAuditeeResponse(finding.id) === 'Reject') {
            if (finding.findinG_DESCRIPTION && finding.findinG_DESCRIPTION.trim().length > 0
                && finding.ischecked && (!finding.remarks || finding.remarks.length === 0)) {
              this._utility.showError('Please enter remarks for the findings to reject');
              this.disableAcceptReject = false;
              return;
            }
          }
        }
      }
    }
    // Validate remarks for rejection - for auditee rejecting findings
    else if (status === 'Reject' && !isAuditorResponse) {
      for (let i = 0; i < this.checkListFindings.length; i++) {
        for (let j = 0; j < this.checkListFindings[i].findings.length; j++) {
          const finding = this.checkListFindings[i].findings[j];
          if (!this.getAuditeeResponse(finding.id)) {
            if (finding.findinG_DESCRIPTION && finding.findinG_DESCRIPTION.trim().length > 0
                && finding.ischecked && (!finding.remarks || finding.remarks.length === 0)) {
              this._utility.showError('Please enter remarks for the findings to reject');
              this.disableAcceptReject = false;
              return;
            }
          }
        }
      }
    }

    // Prepare acceptance list - different labels for auditor vs auditee
    const acceptanceList: any[] = [];
    const remarkLabel = isAuditorResponse 
      ? ` Auditor Remarks(${this.date}): `  
      : ` Auditee Remarks(${this.date}): `;
      
    this.checkListFindings.forEach((question) => {
      question.findings.forEach((find: any) => {
        // For auditor: only process findings with 'Reject' status
        if (isAuditorResponse && find.ischecked && this.getAuditeeResponse(find.id) === 'Reject') {
          acceptanceList.push({
            findinG_ID: find.id,
            status: status,
            remarks: find.remarks ? find.remarks + remarkLabel : '',
            isactive: true,
            issubmitted: true  // Mark as submitted when auditor accepts/rejects
          });
        }
        // For auditee: Findings with no previous response
        else if (!isAuditorResponse && find.ischecked && !this.getAuditeeResponse(find.id)) {
          acceptanceList.push({
            findinG_ID: find.id,
            status: status,
            remarks: find.remarks ? find.remarks + remarkLabel : '',
            isactive: true,
            issubmitted: true
          });
        }
        // For auditee: Findings with previous response (not 'Accept')
        else if (!isAuditorResponse && find.ischecked && this.getAuditeeResponse(find.id) !== 'Accept') {
          acceptanceList.push({
            findinG_ID: find.id,
            status: status,
            remarks: find.remarks ? find.remarks + remarkLabel : '',
            isactive: true,
            issubmitted: true
          });
        }
      });
    });

    // Filter out invalid entries
    const filteredList = acceptanceList.filter(x => x.findinG_ID !== 0);


    // Call appropriate API based on who is responding
    const serviceCall = isAuditorResponse
      ? this._appservice.saveAuditorAcceptanceStatus(filteredList)  // Auditor endpoint
      : this._appservice.saveAuditeeAcceptanceStatus(filteredList); // Auditee endpoint

    serviceCall.subscribe({
      next: (data: any) => {
        this._utility.showSuccess('Status updated successfully');
        this.disableAcceptReject = false;

        // If auditor accepted rejection, mark as submitted
        if (isAuditorResponse && status === 'Accept') {
          this.updateSubmittedStatusForAcceptedRejections(findingIds, true);
          this.emitchanges();
        }
        // If status is Reject (auditee), mark as not submitted
        else if (!isAuditorResponse && status === 'Reject') {
          this.updateSubmittedStatusForAcceptedRejections(findingIds, false);
          this.emitchanges();
        }

        // Uncheck all findings
        this.checkListFindings.forEach((question: any) => {
          question.findings.forEach((f: any) => { f.ischecked = false; });
        });
        this.selectAll = false;

        // Rebuild findings list and refresh data (matches legacy flow exactly)
        this.getFindings();
      },
      error: (error: any) => {
        this._utility.serviceError(error);
        this.disableAcceptReject = false;
      }
    });
  }

  /**
   * Update submitted status for findings when auditor accepts/rejects
   */
  updateSubmittedStatusForAcceptedRejections(findingIds: number[], isSubmitted: boolean) {
    for (let i = 0; i < this.checkListData.length; i++) {
      for (let n = 0; n < this.checkListData[i].checkpointS_BY_PROCESS_MODEL.length; n++) {
        for (let p = 0; p < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA.length; p++) {
          for (let j = 0; j < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS.length; j++) {
            for (let k = 0; k < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints.length; k++) {
              for (let l = 0; l < this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings.length; l++) {
                const finding = this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].findings[l];
                if (findingIds.includes(finding.id)) {
                  this.checkListData[i].checkpointS_BY_PROCESS_MODEL[n].checkpointS_BY_PROCESS_AREA[p].checkpointS_BY_PROCESS[j].checkpoints[k].issubmitted = isSubmitted;
                  finding.issubmitted = isSubmitted;
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Emit changes to parent component
   */
  emitchanges() {
    this.selectedChecklist.emit(this.checkListData);
  }

  /**
   * Get auditee response status for a finding — mirrors legacy exactly
   */
  getAuditeeResponse(findingId: number): string | null {
    const rec = this.auditeeResponses.find((x: any) => x.findinG_ID === findingId);
    return rec ? rec.status : null;
  }

  /**
   * Check if CAP is disabled for a finding — mirrors legacy disableCap()
   */
  disableCap(findingId: number): boolean {
    const rec = this.auditeeResponses.find((x: any) => x.findinG_ID === findingId);
    return rec ? rec.disablE_CAPA : false;
  }

  /**
   * Get submitted status for finding — mirrors legacy getsubmittedstatus()
   */
  getsubmittedstatus(finding: any): boolean {
    const rec = this.auditeeResponses.find((x: any) => x.findinG_ID === finding.id);
    return rec ? (rec.issubmitted || false) : false;
  }

  /**
   * Check if all stage colors are green (complete)
   */
  isAllStagesGreen(stageColors: string[]): boolean {
    if (!stageColors || stageColors.length !== 4) return false;
    return stageColors[0] === '#3AB376' && 
           stageColors[1] === '#3AB376' && 
           stageColors[2] === '#3AB376' && 
           stageColors[3] === '#3AB376';
  }

  /**
   * Check if all stage colors are red (pending)
   */
  isAllStagesRed(stageColors: string[]): boolean {
    if (!stageColors || stageColors.length !== 4) return false;
    return stageColors[0] === '#FF5969' && 
           stageColors[1] === '#FF5969' && 
           stageColors[2] === '#FF5969' && 
           stageColors[3] === '#FF5969';
  }

  /**
   * Check if stage 1 is green and rest are red (auditee rejected, auditor pending)
   */
  isStage1GreenRestRed(stageColors: string[]): boolean {
    if (!stageColors || stageColors.length !== 4) return false;
    return stageColors[0] === '#3AB376' && 
           stageColors[1] === '#FF5969' && 
           stageColors[2] === '#FF5969' && 
           stageColors[3] === '#FF5969';
  }

  /**
   * Add action plan for a finding (CAPA workflow)
   */
  AddActionPlan(question: any, finding: any, questionIndex: number, findingIndex: number) {
    
    this.viewCAPA = true;
    this.rootCauseIds = [];
    this.stage3EvidenceMappings = [];
    this.stage4EvidenceMappings = [];
    
    this.actionPlan = finding;
    this.actionPlanQiestion = question;
    this.selectedRow = findingIndex;
    this.selectedQuest = questionIndex;
    
    // Get finding stages/status
    this.getFindingStatusdetails(finding);
    
    // Get project resources for responsibility assignment
    this.getProjResource();
    
    // Force change detection to render the CAPA section, then scroll
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.scrollToCapaContainer();
    }, 150);
  }

  /**
   * Helper method to scroll to CAPA container
   */
  private scrollToCapaContainer(): void {
    if (this.capaContainer && this.capaContainer.nativeElement) {
      this.capaContainer.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.warn('CAPA container element not found');
    }
  }

  /**
   * Get project resources (employees) for CAP responsibility assignment
   */
  getProjResource() {
    if (this.checkListData && this.checkListData.length > 0) {
      this._appservice.getProjectResourceByProjId(this.checklistSummaryRec.projecT_ID).subscribe({
        next: (data: any) => { this.empInfo = data; },
        error: (error: any) => { console.error('Error fetching project resources:', error); }
      });
    }
  }

  /**
   * Load cause & root cause grouped list for CAP dropdown
   * Mirrors legacy getCauses() — called on ngOnInit
   */
  getCauses() {
    this._appservice.getAuditCauses().subscribe({
      next: (data: any) => { this.causeCollection = data; },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  /**
   * Get finding status details (all CAP stages) — mirrors legacy exactly
   */
  getFindingStatusdetails(finding: any) {
    this.stage3EvidenceMappings = [];
    this.stage4EvidenceMappings = [];

    // Preserve any pending UI state before overwriting findingStatus
    const savedImplementations = (this.findingStatus?.caP_IMPLEMENTATION?.capa || [])
      .map((v: any) => ({
        rooT_CAUSE_ID: v.capadata?.rooT_CAUSE_ID ?? null,
        isimplemented: v.isimplemented,
        status: v.status
      }));
    const savedVerifications = (this.findingStatus?.caP_VERIFICATION?.capa || [])
      .map((v: any) => ({
        rooT_CAUSE_ID: v.capadata?.rooT_CAUSE_ID ?? null,
        isverified: v.isverified,
        isrejected: v.isrejected,
        remarks: v.remarks,
        recommendeD_ACTION: v.recommendeD_ACTION
      }));

    this._appservice.getFindingStatus(finding).subscribe({
      next: (data: any) => {
        this.findingStatus = data;

        // Stage 3 — Implementation evidence
        if (this.findingStatus.caP_IMPLEMENTATION?.capa) {
          this.stage3EvidenceMappings = [];
          this.findingStatus.caP_IMPLEMENTATION.capa.forEach((element: any) => {
            const saved = savedImplementations.find(
              (s: any) => element.capadata && s.rooT_CAUSE_ID === element.capadata.rooT_CAUSE_ID
            );
            if (saved) { element.isimplemented = saved.isimplemented; element.status = saved.status; }
            element.selectedFiles = [];
            if (element.capadata?.findinG_ID) {
              this._appservice.getAuditEvidence(element.capadata.findinG_ID, 3, element.capadata.rooT_CAUSE_ID)
                .subscribe({ next: (files: any) => { if (files) this.stage3EvidenceMappings = [...this.stage3EvidenceMappings, ...files]; } });
            }
          });
        }

        // Stage 4 — Verification evidence
        if (this.findingStatus.caP_VERIFICATION?.capa) {
          this.stage4EvidenceMappings = [];
          this.findingStatus.caP_VERIFICATION.capa.forEach((element: any) => {
            const saved = savedVerifications.find(
              (s: any) => element.capadata && s.rooT_CAUSE_ID === element.capadata.rooT_CAUSE_ID
            );
            if (saved) {
              element.isverified = saved.isverified;
              element.isrejected = saved.isrejected;
              element.remarks = saved.remarks;
              element.recommendeD_ACTION = saved.recommendeD_ACTION;
            }
            element.selectedFiles = [];
            if (element.capadata?.findinG_ID) {
              this._appservice.getAuditEvidence(element.capadata.findinG_ID, 4, element.capadata.rooT_CAUSE_ID)
                .subscribe({ next: (files: any) => { if (files) this.stage4EvidenceMappings = [...this.stage4EvidenceMappings, ...files]; } });
            }
          });
        }

        // Fill selected root cause IDs from existing CAPA submission
        if (this.findingStatus.capA_SUBMISSION?.capa?.length > 0) {
          this.FillSelectedCauses();
        }

        // Set max target date from acceptance date (legacy uses 1 month ahead, not 1 year)
        if (this.findingStatus.auditeE_ACCEPTANCE_STATUS != null) {
          const acceptedDate = new Date(this.findingStatus.auditeE_ACCEPTANCE_STATUS.auditeE_ACCEPTANCE.updateD_DATE);
          this.maxTargetDate = new Date(acceptedDate.getFullYear(), acceptedDate.getMonth() + 1, acceptedDate.getDate());
        }

        // If stage 4 has capa, fetch employee name of verifier
        if (this.findingStatus.caP_VERIFICATION?.capa?.length > 0) {
          const updatedBy = this.findingStatus.caP_VERIFICATION.capa[0].updateD_BY;
          if (updatedBy) {
            this._appservice.getEmpNameById(updatedBy).subscribe({
              next: (name: any) => { this.capaVerifiedBy = name; }
            });
          }
        }

        this.getChecklistFindingStages();
        this.updateCAPButtonStates();
        if (!this.isFileAction) {
          this.updateCAPButtonStates();
        }
        this.isFileAction = false;
      },
      error: (error: any) => {
        console.error('Error fetching finding status:', error);
        this.findingStatus = {
          capA_SUBMISSION: { capa: [], status: {} },
          capA_REVIEW: { capa: [], status: {} },
          caP_IMPLEMENTATION: { capa: [], status: {} },
          caP_VERIFICATION: { capa: [], status: {} },
          auditeE_ACCEPTANCE_STATUS: null
        };
      }
    });
  }

  /**
   * Fill selected causes from existing CAPA — mirrors legacy FillSelectedCauses()
   */
  FillSelectedCauses() {
    this.rootCauseIds = [];
    this.findingStatus.capA_SUBMISSION.capa.forEach((element: any) => {
      this.rootCauseIds.push(element.cappalist.rooT_CAUSE_ID);
    });
  }

  // -----------------------------------------------------------------------
  // CAPA Button-state helpers — exact mirrors of legacy
  // -----------------------------------------------------------------------
  disableCAPSubmitButton() {
    if (!this.findingStatus) return;
    if (this.findingStatus.capA_SUBMISSION.capa.length === 0)
      this.iscapsubmitbutton = false;
    else
      this.iscapsubmitbutton = !this.findingStatus.capA_SUBMISSION.capa.some((x: any) => !x.cappalist.issubmitted);
  }

  disableCAPReviewButton() {
    if (!this.findingStatus) return;
    if (this.findingStatus.capA_REVIEW.capa.length === 0) {
      this.iscapreviewbutton = false;
    } else {
      const flag = this.findingStatus.capA_REVIEW.capa.some((x: any) => !x.issubmitted);
      this.iscapreviewbutton = !flag;
    }
  }

  disableImplementButtonInReview() {
    if (!this.findingStatus) return;
    if (this.findingStatus.caP_IMPLEMENTATION.capa.length === 0) {
      this.isimplementbutton = false;
    } else {
      const stage3Status = this.findingStatus.caP_IMPLEMENTATION.status
        ? this.findingStatus.caP_IMPLEMENTATION.status.stagE_STATUS : null;
      this.isimplementbutton = (stage3Status === 'Corrective Action Plan Implemented');
    }
  }

  disableVerificationButton() {
    if (!this.findingStatus) return;
    if (this.findingStatus.caP_VERIFICATION.capa.length === 0) {
      this.isverficationbutton = false;
    } else {
      const stage4Status = this.findingStatus.caP_VERIFICATION.status
        ? this.findingStatus.caP_VERIFICATION.status.stagE_STATUS : null;
      this.isverficationbutton = (
        stage4Status === 'Corrective Action Plan Passed' ||
        stage4Status === 'Corrective Action Plan Failed' ||
        stage4Status === 'Corrective Action Implementation Verified'
      );
    }
  }

  // -----------------------------------------------------------------------
  // Update all button states at once (calls all four helpers)
  // -----------------------------------------------------------------------
  updateCAPButtonStates() {
    this.disableCAPSubmitButton();
    this.disableCAPReviewButton();
    this.disableImplementButtonInReview();
    this.disableVerificationButton();
  }

  // -----------------------------------------------------------------------
  // getSelectedVal — mirrors legacy exactly
  // -----------------------------------------------------------------------
  getSelectedVal() {
    if (!this.rootCauseIds || this.rootCauseIds.length === 0) {
      this.findingStatus.capA_SUBMISSION.capa = [];
      this._utility.showWarning('Please select at least one cause');
      return;
    }
    this._appservice.getAuditFindingsCappa(this.findingStatus, this.rootCauseIds, 1).subscribe({
      next: (data: any) => {
        this.auditFindingCappa = data;
        this.findingStatus.capA_SUBMISSION.capa = this.auditFindingCappa;
      },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  // -----------------------------------------------------------------------
  // Stage 1 — SaveCheckListCAPA — mirrors legacy exactly
  // -----------------------------------------------------------------------
  SaveCheckListCAPA(status: string) {
    if (!this.validateCAPAinputfields()) {
      this._utility.showWarning('Please input all the values for CAPA');
      return;
    }
    if (!this.validateRootcauseField()) {
      this._utility.showWarning('Please choose any one cause as Root cause');
      return;
    }
    this.saveCAPSubmissionData(status);
  }

  validateCAPAinputfields(): boolean {
    let flag = true;
    for (let i = 0; i < this.findingStatus.capA_SUBMISSION.capa.length; i++) {
      const c = this.findingStatus.capA_SUBMISSION.capa[i].cappalist;
      if (c.caP_TARGET_DATE == undefined || c.correctivE_ACTION_PLAN == undefined ||
          c.correction == undefined || c.plaN_FOR_EFFECTIVE_CAP == undefined) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  validateRootcauseField(): boolean {
    let flag = false;
    this.findingStatus.capA_SUBMISSION.capa.forEach((cap: any) => {
      if (cap.cappalist.isrootcause) flag = true;
    });
    return flag;
  }

  saveCAPSubmissionData(status: string) {
    this.findingStatus.capA_SUBMISSION.capa.forEach((element: any) => {
      element.cappalist.issubmitted = true;
      element.cappalist.findinG_ID = this.actionPlan.id;
      element.cappalist.caP_TARGET_DATE = this._utility.setLocaleDate(element.cappalist.caP_TARGET_DATE);
      if (element.cappalist.status !== 'Corrective Action Plan Approved')
        element.cappalist.status = status;
    });
    this.disablesubmittillSave = true;
    this._appservice.addFindingCAP(this.findingStatus).subscribe({
      next: (data: any) => {
        this.findingStatus = data;
        this.disablesubmittillSave = false;
        this.submitcap = true;
        this._utility.showSuccess('Submitted Successfully');
        this.getFindingStatusdetails(this.actionPlan);
      },
      error: (error: any) => {
        this._utility.serviceError(error);
        this.findingStatus.capA_SUBMISSION.capa.forEach((x: any) => x.cappalist.issubmitted = false);
        this.disablesubmittillSave = false;
      }
    });
  }

  // -----------------------------------------------------------------------
  // Stage 2 — SubmitCap (CAP Review) — mirrors legacy exactly
  // -----------------------------------------------------------------------
  SubmitCap() {
    this.flag = false;
    if (this.findingStatus.capA_REVIEW.capa.length > 0) {
      this.findingStatus.capA_REVIEW.capa.forEach((element: any) => {
        if (element.ischecked) {
          element.iscaprejected = false;
          element.iscapapproved = true;
          element.status = 'Corrective Action Plan Approved';
        } else {
          element.iscaprejected = true;
          element.iscapapproved = false;
          element.status = 'Corrective Action Plan Rejected';
        }
      });
      for (const element of this.findingStatus.capA_REVIEW.capa) {
        if (element.iscaprejected && (!element.remarks || element.remarks === '')) {
          this._utility.showWarning('Please enter remarks');
          this.flag = true;
          break;
        }
      }
      if (!this.flag) {
        this.disabletillreviewSave = true;
        this._appservice.addFindingCAPReviewDetails(this.findingStatus.capA_REVIEW.capa).subscribe({
          next: () => {
            this._utility.showSuccess('Submitted Successfully');
            this.disabletillreviewSave = false;
            this.getFindingStatusdetails(this.actionPlan);
            this.SelectedValue = [];
          },
          error: (error: any) => {
            this._utility.serviceError(error);
            if (this.findingStatus?.capA_REVIEW?.capa?.[0])
              this.findingStatus.capA_REVIEW.capa[0].issubmitted = false;
            this.disabletillreviewSave = false;
          }
        });
      }
    }
  }

  SendIdtoArray(s: any) {
    if (s.ischecked === true) {
      s.iscapapproved = true;
      s.iscaprejected = false;
      s.ischecked = true;
    } else {
      s.ischecked = false;
      s.iscapapproved = false;
      s.iscaprejected = true;
    }
  }

  // -----------------------------------------------------------------------
  // Stage 3 — ImplementCap — mirrors legacy exactly
  // -----------------------------------------------------------------------
  ImplementCap() {
    if (this.findingStatus.caP_IMPLEMENTATION.capa.length === 0) {
      this._utility.showWarning('Please select a Corrective Action Plan');
      return;
    }
    this.findingStatus.caP_IMPLEMENTATION.capa.forEach((element: any) => {
      if (element.isimplemented) {
        element.isimplemented = true;
        element.status = 'Corrective Action Plan Implemented';
      } else {
        element.isimplemented = false;
        element.status = 'Corrective Action Plan Not Implemented';
      }
    });
    this.disabletillSaveImplement = true;
    this._appservice.addFindingCAPImplementationDetails(this.findingStatus.caP_IMPLEMENTATION.capa).subscribe({
      next: () => {
        this._utility.showSuccess('Submitted Successfully');
        this.disabletillSaveImplement = false;
        this.getFindingStatusdetails(this.actionPlan);
        this.SelectedValueImp = [];
      },
      error: (error: any) => {
        this._utility.serviceError(error);
        this.isimplementbutton = false;
        this.disabletillSaveImplement = false;
      }
    });
  }

  // -----------------------------------------------------------------------
  // Stage 4 — VerifyCAPImplementation — mirrors legacy exactly
  // -----------------------------------------------------------------------
  VerifyCAPImplementation() {
    if (this.findingStatus.caP_VERIFICATION.capa.length === 0) {
      this._utility.showWarning('Please select a finding');
      return;
    }
    let missingEvidence = false;
    const missingEvidenceCause: string[] = [];

    this.findingStatus.caP_VERIFICATION.capa.forEach((element: any) => {
      if (element.isverified) {
        const stage3Files = (this.stage3EvidenceMappings || []).filter(
          (m: any) => m.stagE_ID === 3 && m.rootcausE_ID === element.capadata.rooT_CAUSE_ID
        );
        const existingStage4Files = (this.stage4EvidenceMappings || []).filter(
          (m: any) => m.stagE_ID === 4 && m.rootcausE_ID === element.capadata.rooT_CAUSE_ID
        );
        if (stage3Files.length === 0 && existingStage4Files.length === 0) {
          missingEvidenceCause.push(element.capadata.rooT_CAUSE);
          missingEvidence = true;
          return;
        }
        element.isverified = true;
        element.isrejected = false;
        element.status = 'Corrective Action Plan Passed';
      } else {
        this.rejectImp = true;
        element.isverified = false;
        element.isrejected = true;
        element.status = 'Corrective Action Plan Failed';
      }
    });

    if (missingEvidence) {
      this._utility.showWarning(
        `Evidence is mandatory for "${missingEvidenceCause.join(', ')}" because no evidence was provided during the Implementation Stage.`
      );
      return;
    }

    this.disableTillSaveVerification = true;
    this._appservice.addFindingCAPVerificationDetails(this.findingStatus.caP_VERIFICATION.capa).subscribe({
      next: () => {
        this._utility.showSuccess('Submitted Successfully');
        this.disableTillSaveVerification = false;
        this.getFindingStatusdetails(this.actionPlan);
        this.processCrispScore();
        this.SelectedValueImp = [];
      },
      error: (error: any) => {
        this._utility.serviceError(error);
        this.isverficationbutton = false;
        this.disableTillSaveVerification = false;
      }
    });
  }

  // -----------------------------------------------------------------------
  // Evidence — upload / download / delete — mirrors legacy exactly
  // -----------------------------------------------------------------------
  onFilesSelected(event: any, row: any, stageId: number) {
    if (!row.selectedFiles) row.selectedFiles = [];
    const files: File[] = Array.from(event.target.files);
    if (files.length === 0) return;

    const existingMappings = stageId === 3 ? this.stage3EvidenceMappings : this.stage4EvidenceMappings;
    const existingFileNames = (existingMappings || [])
      .filter((m: any) => m.rootcausE_ID === row.capadata.rooT_CAUSE_ID)
      .map((m: any) => m.filE_NAME.toLowerCase().trim());

    const selectedFileNames: string[] = [];
    const duplicateFiles: string[] = [];

    for (const file of files) {
      const fileName = file.name.toLowerCase().trim();
      if (existingFileNames.includes(fileName) || selectedFileNames.includes(fileName)) {
        duplicateFiles.push(file.name);
      } else {
        selectedFileNames.push(fileName);
      }
    }

    if (duplicateFiles.length > 0) {
      this._utility.showWarning(
        `The following file(s) already exist. Please upload a different file:\n${duplicateFiles.join(', ')}`
      );
      event.target.value = '';
      return;
    }

    row.isUploading = true;
    this.uploadAuditEvidence(
      files, row.capadata.findinG_ID, stageId, row.capadata.rooT_CAUSE_ID,
      () => { row.isUploading = false; row.selectedFiles = []; },
      () => { row.isUploading = false; row.selectedFiles = []; }
    );
    event.target.value = '';
  }

  uploadAuditEvidence(files: File[], findingId: number, stageId: number, rootCauseId: number,
                      onSuccess?: () => void, onError?: () => void) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    this._appservice.uploadProjectFile(0, this.custId, this.projectId, formData, findingId, stageId, rootCauseId)
      .subscribe({
        next: () => {
          this.isFileAction = true;
          this.getFindingStatusdetails(this.actionPlan);
          if (onSuccess) onSuccess();
        },
        error: (error: any) => {
          this._utility.serviceError(error);
          if (onError) onError();
        }
      });
  }

  downloadFile(doc: any) {
    const fileData = { FileName: doc.filE_NAME, FilePath: doc.filE_GUID, FileType: doc.filE_TYPE };
    this._appservice.downloadFile(fileData, this.custId, this.projectId).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = doc.filE_NAME;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  removeSavedEvidence(doc: any) {
    this._utility.showWarningConfirmation(
      'Are you sure you want to delete this evidence file?',
      'Delete Evidence File'
    ).subscribe((result: boolean) => {
      if (result === true) {
        const fileData = { ID: doc.id, FileName: doc.filE_NAME };
        this._appservice.deleteFile(fileData, this.custId, this.projectId).subscribe({
          next: () => {
            this._utility.showSuccess('Evidence deleted successfully');
            this.isFileAction = true;
            this.getFindingStatusdetails(this.actionPlan);
          },
          error: (error: any) => { this._utility.serviceError(error); }
        });
      }
    });
  }

  // -----------------------------------------------------------------------
  // processCrispScore — mirrors legacy exactly
  // -----------------------------------------------------------------------
  processCrispScore() {
    if (!this.dueDate) return;
    const dueDate = new Date(this.dueDate);
    if (this.checklistSummaryRec.projecT_ID != undefined &&
        this.checklistSummaryRec.projecT_ID != null &&
        this.checklistSummaryRec.projecT_ID !== '') {
      this.project.push(this.checklistSummaryRec.projecT_ID);
    }
    const month = dueDate.toLocaleString('default', { month: 'short' });
    const year  = dueDate.getFullYear();

    if (this.checklistSummaryRec.customeR_ID != null &&
        this.checklistSummaryRec.customeR_ID != undefined &&
        month != null && year != null) {
      this._appservice.ProcessCrispScoresForProject(
        this.checklistSummaryRec.customeR_ID, this.project, month, year
      ).subscribe({ error: () => {} });
    }
  }

  // -----------------------------------------------------------------------
  // Misc helpers
  // -----------------------------------------------------------------------
  getEmployeeName(empId: string): string {
    if (!this.empInfo || this.empInfo.length === 0) return '';
    const emp = this.empInfo.find((x: any) => x.emP_ID === empId);
    return emp ? emp.frsT_NM : '';
  }

  getRootCauseVal(isRootCause: boolean): string {
    return isRootCause ? 'Yes' : 'No';
  }

  clearrecommendedAction(st: any) {
    if (st.isverified) st.recommendeD_ACTION = null;
  }

  onActionPlanChange(finding: any, index: number) {
    if (finding.addActionPlan) {
      this.AddActionPlan({}, finding, 0, index);
    }
  }
}
