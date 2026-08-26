import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap, timer } from 'rxjs';
import { delayWhen, finalize } from 'rxjs/operators';
import { SessionService } from '../../services/session.service';
import { AssesseeService } from '../../services/assessee.service';
import { AccountService } from '../../services/account.service';
import { ItOpsMaturityApiService, ItOpsAssessmentInfo, ItOpsParameterScoreRow, ItOpsEvidenceRow } from '../../services/itops-maturity-api.service';
import { TechnologyDomain, MaturityParameter, MaturityRubric, FindingStatus, DomainStatus } from '../../models/maturity.model';
import { Assessee } from '../../models/assessee.model';
import { statusPillClass } from '../../utils/status.util';
import { RUBRIC_LEVELS, rubricScoreKey } from '../../utils/rubric.util';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

/** Maps the backend's ITOPS_ASSESSMENT.STATUS values onto this app's DomainStatus labels. */
const BACKEND_STATUS_MAP: Record<string, DomainStatus> = {
  NotStarted: 'Not Started',
  Draft: 'Draft',
  PendingReview: 'Pending Review',
  Approved: 'Approved',
  ReturnedForRevision: 'In Progress',
  Suspended: 'Draft',
  Closed: 'Approved',
};

/** Maps the backend's ITOPS_FINDING.STATUS values onto this app's simpler FindingStatus. */
const BACKEND_FINDING_STATUS_MAP: Record<string, FindingStatus> = {
  Accepted: 'Accepted',
  Rejected: 'Rejected',
};

@Component({
  selector: 'app-domain-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './domain-review.component.html',
  styleUrl: './domain-review.component.scss',
})
export class DomainReviewComponent implements OnInit {
  domain?: TechnologyDomain;
  /** True until the first load attempt settles, so the "not found" message never flashes while data is still in flight. */
  loading = true;
  providers: string[] = [];
  activeProvider?: string;

  /** Approve/Return are mutually exclusive on the same assessment - one shared flag disables both while either is in flight. */
  reviewing = false;
  decidingFindingId: number | null = null;

  /** Evidence attached to each finding's remediation action, keyed by findingId, loaded on demand. */
  evidenceByFindingId: Record<number, ItOpsEvidenceRow[]> = {};
  pendingEvidenceFiles: Record<number, File[]> = {};
  submittingActionId: number | null = null;

  showReturnModal = false;
  returnComment = '';
  returnCommentError = '';
  actionMessage = '';
  showDefinitionsModal = false;
  selectedAssessees: Assessee[] = [];

  rubricLevels = RUBRIC_LEVELS;
  rubricModalParam: MaturityParameter | null = null;

  rejectingParam: MaturityParameter | null = null;
  rejectComment = '';
  rejectCommentError = '';

  retargetingParam: MaturityParameter | null = null;
  retargetDate = '';
  retargetReason = '';
  retargetError = '';

  decidingRetargetParam: MaturityParameter | null = null;
  retargetDecisionComment = '';

  private assessmentId?: number;

  constructor(
    private route: ActivatedRoute,
    private session: SessionService,
    private assesseeService: AssesseeService,
    private accountService: AccountService,
    private api: ItOpsMaturityApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const domainCode = this.route.snapshot.paramMap.get('domainId');
    const account = this.accountService.selectedAccount;

    if (domainCode && account) {
      this.api
        .getOrCreateAssessment(domainCode, String(account.cusT_ID))
        .pipe(
          switchMap((assessment) =>
            forkJoin({
              assessment: of(assessment),
              parameters: this.api.getAssessmentParameters(assessment.assessmentId),
            }),
          ),
        )
        .subscribe({
          next: ({ assessment, parameters }) => {
            this.assessmentId = assessment.assessmentId;
            this.domain = this.toDomain(assessment, parameters);
            this.providers = [];
            this.activeProvider = undefined;
            this.loading = false;
            this.loadEvidenceForAcceptedFindings();
          },
          error: (err) => {
            console.error('IT Ops Maturity Dashboard: failed to load assessment for review', err);
            this.loading = false;
          },
        });
    } else {
      this.loading = false;
    }
    this.assesseeService.selectedAssessees$.subscribe((assessees) => (this.selectedAssessees = assessees));
  }

  private toDomain(assessment: ItOpsAssessmentInfo, rows: ItOpsParameterScoreRow[]): TechnologyDomain {
    const parameters: MaturityParameter[] = rows.map((r) => ({
      id: String(r.parameterId),
      category: r.category,
      name: r.parameterName,
      definition: r.definition,
      rubric: {
        level1: r.level1_AdHoc,
        level2: r.level2_Developing,
        level3: r.level3_Defined,
        level4: r.level4_Managed,
        level5: r.level5_Optimized,
      } as MaturityRubric,
      minRequiredScore: r.minRequiredScore ?? undefined,
      score: (r.scoreValue as MaturityParameter['score']) ?? null,
      notes: r.notes ?? '',
      findingId: r.findingId ?? undefined,
      findingStatus: r.findingStatus ? BACKEND_FINDING_STATUS_MAP[r.findingStatus] ?? 'Pending' : undefined,
      findingRejectionComment: r.findingRejectionComment ?? undefined,
      findingActionTaken: r.findingActionTaken ?? undefined,
    }));

    return {
      id: assessment.domainCode,
      name: assessment.domainName,
      coeSpoc: assessment.coeSpocName ?? assessment.coeSpocEmpId ?? '',
      reviewer: assessment.reviewerName ?? assessment.reviewerEmpId ?? '',
      status: BACKEND_STATUS_MAP[assessment.status] ?? 'Not Started',
      parameters,
      returnComment: assessment.returnComment ?? undefined,
    };
  }

  canReview(): boolean {
    if (!this.domain) return false;
    return this.session.currentUser.reviewDomainIds.includes(this.domain.id);
  }

  assesseeNames(): string {
    return this.selectedAssessees.map((a) => a.name).join(', ');
  }

  /** Only one of the people the assessment is being conducted for (the selected Assessees) may accept/reject findings. */
  isAssessee(): boolean {
    const empId = localStorage.getItem('empid');
    return !!empId && this.selectedAssessees.some((a) => a.id === empId);
  }

  /** A score below 5 is automatically raised as a probable area of improvement (US-003). */
  isProbableFinding(param: MaturityParameter): boolean {
    return typeof param.score === 'number' && param.score < 5;
  }

  visibleParameters(): MaturityParameter[] {
    if (!this.domain) return [];
    if (!this.providers.length) return this.domain.parameters;
    return this.domain.parameters.filter((p) => p.provider === this.activeProvider);
  }

  selectProvider(provider: string): void {
    this.activeProvider = provider;
  }

  statusClass(status: string): string {
    return statusPillClass(status);
  }

  scoreKey(score: number | string): keyof MaturityRubric {
    return rubricScoreKey(score);
  }

  openRubricModal(param: MaturityParameter): void {
    this.rubricModalParam = param;
  }

  openDefinitionsModal(): void {
    this.showDefinitionsModal = true;
  }

  closeDefinitionsModal(): void {
    this.showDefinitionsModal = false;
  }

  closeRubricModal(): void {
    this.rubricModalParam = null;
  }

  isBelowMinimum(param: MaturityParameter): boolean {
    return (
      typeof param.score === 'number' &&
      typeof param.minRequiredScore === 'number' &&
      param.score < param.minRequiredScore
    );
  }

  approve(): void {
    if (!this.domain || !this.assessmentId || this.reviewing) return;
    this.reviewing = true;
    this.api
      .reviewAssessment(this.assessmentId, true)
      .pipe(finalize(() => (this.reviewing = false)))
      .subscribe({
        next: () => {
          this.actionMessage = 'Assessment approved.';
          if (this.domain) this.domain.status = 'Approved';
          this.toast.success('Assessment approved', `${this.domain?.name ?? 'This domain'} is now marked Approved.`);
        },
        error: () => this.toast.error('Approval failed', 'Something went wrong approving this assessment. Please try again.'),
      });
  }

  openReturnModal(): void {
    this.returnComment = '';
    this.returnCommentError = '';
    this.showReturnModal = true;
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
  }

  confirmReturn(): void {
    if (!this.returnComment.trim()) {
      this.returnCommentError = 'A comment explaining the rejection is required.';
      return;
    }
    if (!this.domain || !this.assessmentId || this.reviewing) return;
    this.reviewing = true;
    const comment = this.returnComment.trim();
    this.api
      .reviewAssessment(this.assessmentId, false, comment)
      .pipe(finalize(() => (this.reviewing = false)))
      .subscribe({
        next: () => {
          if (this.domain) {
            this.domain.status = 'In Progress';
            this.domain.returnComment = comment;
          }
          this.showReturnModal = false;
          this.actionMessage = 'Returned to COE SPOC for revision.';
          this.toast.info('Returned for revision', `${this.domain?.name ?? 'This domain'} was sent back to the COE SPOC.`);
        },
        error: () => this.toast.error('Return failed', 'Something went wrong returning this assessment. Please try again.'),
      });
  }

  /** Suspend/Resume has no backend endpoint yet - kept as a local-only UI toggle for now. */
  toggleSuspend(): void {
    if (!this.domain) return;
    this.domain.suspended = !this.domain.suspended;
    this.actionMessage = this.domain.suspended ? 'Assessment suspended.' : 'Assessment resumed.';
  }

  /** US-006: Assessee accepts a finding, or opens the mandatory-justification modal to reject it. */
  setFinding(param: MaturityParameter, status: FindingStatus): void {
    if (!param.findingId || this.decidingFindingId) return;
    if (status === 'Rejected') {
      this.openRejectModal(param);
      return;
    }
    this.decidingFindingId = param.findingId;
    this.api
      .decideFinding(param.findingId, true)
      .pipe(finalize(() => (this.decidingFindingId = null)))
      .subscribe({
        next: () => {
          param.findingStatus = 'Accepted';
          param.findingRejectionComment = undefined;
          this.toast.success('Finding accepted', `"${param.name}" has been accepted.`);
        },
        error: () => this.toast.error('Action failed', 'Something went wrong accepting this finding. Please try again.'),
      });
  }

  openRejectModal(param: MaturityParameter): void {
    this.rejectingParam = param;
    this.rejectComment = param.findingRejectionComment ?? '';
    this.rejectCommentError = '';
  }

  closeRejectModal(): void {
    this.rejectingParam = null;
  }

  confirmReject(): void {
    if (!this.rejectComment.trim()) {
      this.rejectCommentError = 'A comment explaining the rejection is required.';
      return;
    }
    const param = this.rejectingParam;
    if (!param || !param.findingId || this.decidingFindingId) return;
    this.decidingFindingId = param.findingId;
    const comment = this.rejectComment.trim();
    this.api
      .decideFinding(param.findingId, false, comment)
      .pipe(finalize(() => (this.decidingFindingId = null)))
      .subscribe({
        next: () => {
          param.findingStatus = 'Rejected';
          param.findingRejectionComment = comment;
          this.toast.info('Finding rejected', `"${param.name}" has been rejected with your justification.`);
          this.rejectingParam = null;
        },
        error: () => this.toast.error('Action failed', 'Something went wrong rejecting this finding. Please try again.'),
      });
  }

  private loadEvidenceForAcceptedFindings(): void {
    const acceptedFindingIds = (this.domain?.parameters ?? [])
      .filter((p) => p.findingStatus === 'Accepted' && p.findingId)
      .map((p) => p.findingId as number);
    acceptedFindingIds.forEach((id) => this.loadEvidence(id));
  }

  loadEvidence(findingId: number): void {
    this.api.getFindingEvidence(findingId).subscribe((rows) => (this.evidenceByFindingId[findingId] = rows));
  }

  evidenceFor(param: MaturityParameter): ItOpsEvidenceRow[] {
    return param.findingId ? this.evidenceByFindingId[param.findingId] ?? [] : [];
  }

  evidenceDownloadUrl(evidenceId: number): string {
    return this.api.evidenceDownloadUrl(evidenceId);
  }

  onActionEvidenceSelected(event: Event, param: MaturityParameter): void {
    if (!param.findingId) return;
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const files = Array.from(input.files);
    const maxBytes = 10 * 1024 * 1024;
    const tooLarge = files.find((f) => f.size > maxBytes);
    if (tooLarge) {
      this.toast.error('File too large', `"${tooLarge.name}" exceeds the 10MB upload limit.`);
      input.value = '';
      return;
    }
    this.pendingEvidenceFiles[param.findingId] = [...(this.pendingEvidenceFiles[param.findingId] ?? []), ...files];
    input.value = '';
  }

  pendingEvidenceFor(param: MaturityParameter): File[] {
    return param.findingId ? this.pendingEvidenceFiles[param.findingId] ?? [] : [];
  }

  removePendingEvidence(param: MaturityParameter, file: File): void {
    if (!param.findingId) return;
    this.pendingEvidenceFiles[param.findingId] = this.pendingEvidenceFor(param).filter((f) => f !== file);
  }

  /** Assessee submits their remediation progress note plus any newly attached evidence in one action. */
  submitActionUpdate(param: MaturityParameter): void {
    if (!param.findingId || this.submittingActionId) return;
    const actionTaken = (param.findingActionTaken ?? '').trim();
    if (!actionTaken) {
      this.toast.error('Action required', 'Describe the action taken before submitting.');
      return;
    }
    const findingId = param.findingId;
    this.submittingActionId = findingId;
    // Force the disabled/spinner state to paint immediately, in case the request
    // resolves fast enough (e.g. local dev) that zone.js's normal change-detection
    // tick would otherwise coalesce the disable and the re-enable into one frame.
    this.cdr.detectChanges();

    this.api
      .updateFindingAction(findingId, actionTaken)
      .pipe(
        switchMap(() => {
          const files = this.pendingEvidenceFor(param);
          return files.length ? this.api.uploadFindingEvidence(findingId, files) : of([]);
        }),
        // A same-machine request can resolve in a handful of milliseconds -
        // hold the disabled/spinner state for at least this long so the click
        // reads as "doing something" instead of appearing to do nothing.
        delayWhen(() => timer(400)),
        finalize(() => (this.submittingActionId = null)),
      )
      .subscribe({
        next: () => {
          param.findingActionTaken = actionTaken;
          this.pendingEvidenceFiles[findingId] = [];
          this.loadEvidence(findingId);
          this.toast.success('Action update submitted', `Your progress on "${param.name}" has been shared with the COE SPOC and Reviewer.`);
        },
        error: () => this.toast.error('Submit failed', 'Something went wrong submitting this action update. Please try again.'),
      });
  }

  /** The Reviewer (one level up from the Assessee) decides pending retarget requests. */
  canDecideRetarget(param: MaturityParameter): boolean {
    return this.canReview() && param.findingRetargetStatus === 'Requested';
  }

  /** A retarget may be requested once a finding is accepted and isn't already pending/decided. */
  canRequestRetarget(param: MaturityParameter): boolean {
    return (
      this.isAssessee() &&
      param.findingStatus === 'Accepted' &&
      (!param.findingRetargetStatus || param.findingRetargetStatus === 'None' || param.findingRetargetStatus === 'Rejected')
    );
  }

  openRetargetModal(param: MaturityParameter): void {
    this.retargetingParam = param;
    this.retargetDate = param.findingRetargetRequestedDate ?? param.findingTargetDate ?? '';
    this.retargetReason = '';
    this.retargetError = '';
  }

  closeRetargetModal(): void {
    this.retargetingParam = null;
  }

  confirmRetarget(): void {
    if (!this.retargetDate) {
      this.retargetError = 'A revised target date is required.';
      return;
    }
    if (!this.retargetReason.trim()) {
      this.retargetError = 'A reason for the retarget request is required.';
      return;
    }
    if (!this.retargetingParam) return;
    const param = this.retargetingParam;
    param.findingRetargetStatus = 'Requested';
    param.findingRetargetRequestedDate = this.retargetDate;
    param.findingRetargetReason = this.retargetReason.trim();
    param.findingRetargetDecisionComment = undefined;
    this.retargetingParam = null;
    this.actionMessage = 'Retarget request sent for approval.';
  }

  openRetargetDecisionModal(param: MaturityParameter): void {
    this.decidingRetargetParam = param;
    this.retargetDecisionComment = '';
  }

  closeRetargetDecisionModal(): void {
    this.decidingRetargetParam = null;
  }

  decideRetarget(approve: boolean): void {
    if (!this.decidingRetargetParam) return;
    const param = this.decidingRetargetParam;
    param.findingRetargetStatus = approve ? 'Approved' : 'Rejected';
    param.findingRetargetDecisionComment = this.retargetDecisionComment.trim() || undefined;
    if (approve && param.findingRetargetRequestedDate) {
      param.findingTargetDate = param.findingRetargetRequestedDate;
    }
    this.decidingRetargetParam = null;
    this.actionMessage = approve ? 'Retarget approved.' : 'Retarget rejected.';
  }
}
