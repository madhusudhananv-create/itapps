import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, forkJoin, of, switchMap, timer } from 'rxjs';
import { delayWhen, finalize } from 'rxjs/operators';
import { SessionService } from '../../services/session.service';
import { AccountService } from '../../services/account.service';
import { ItOpsMaturityApiService, ItOpsAssessmentInfo, ItOpsParameterScoreRow, ItOpsEvidenceRow } from '../../services/itops-maturity-api.service';
import { TechnologyDomain, MaturityParameter, MaturityRubric, FindingStatus, DomainStatus } from '../../models/maturity.model';
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
  Closed: 'Closed',
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
  /** findingId -> the action-taken text last successfully saved, so Submit Update can stay disabled once there's nothing new to send (not just while the request is in flight). */
  private lastSavedActionTaken = new Map<number, string>();

  showReturnModal = false;
  returnComment = '';
  returnCommentError = '';
  actionMessage = '';
  showDefinitionsModal = false;
  /** This assessment's own assignees (not the account-wide selection - a project's assessment shows only who's actually assigned to it). */
  assesseeNamesList: string[] = [];
  private assesseeEmpIds: string[] = [];
  private reviewerEmpIds: string[] = [];
  /** Where "Back" goes - the Dashboard by default, or My Assignments when opened from there (?from=assignments). */
  backLink = '/';

  rubricLevels = RUBRIC_LEVELS;
  rubricModalParam: MaturityParameter | null = null;

  rejectingParam: MaturityParameter | null = null;
  rejectComment = '';
  rejectCommentError = '';

  private assessmentId?: number;

  constructor(
    private route: ActivatedRoute,
    private session: SessionService,
    private accountService: AccountService,
    private api: ItOpsMaturityApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Subscribed, not a one-off snapshot read - see the identical note on
    // MaturityAssessmentComponent.ngOnInit: the same route is reused by
    // Angular's default reuse strategy when navigating between two "My
    // Assignments" rows for the SAME domain (different project/cycle), and
    // only the assessmentId query param actually differs between them.
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, queryParams]) => {
      const domainCode = params.get('domainId');
      const assessmentIdParam = queryParams.get('assessmentId');
      const account = this.accountService.selectedAccount;
      this.backLink = queryParams.get('from') === 'assignments' ? '/my-assignments' : '/';

      if (!domainCode || !account) {
        this.loading = false;
        return;
      }

      this.loading = true;
      this.domain = undefined;
      this.assessmentId = undefined;
      this.assesseeNamesList = [];
      this.assesseeEmpIds = [];
      this.reviewerEmpIds = [];
      this.evidenceByFindingId = {};
      this.pendingEvidenceFiles = {};
      this.lastSavedActionTaken.clear();

      this.api
        .getOrCreateAssessment(domainCode, String(account.cusT_ID), assessmentIdParam ? Number(assessmentIdParam) : undefined)
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
            // Seed with whatever was already saved, so a finding loaded with its
            // action-taken note already filled in starts with Submit Update
            // correctly disabled - not re-submittable until the text actually changes.
            for (const param of this.domain.parameters) {
              if (param.findingId) this.lastSavedActionTaken.set(param.findingId, param.findingActionTaken ?? '');
            }
            this.assesseeNamesList = assessment.assesseeNames ?? [];
            this.assesseeEmpIds = assessment.assesseeEmpIds ?? [];
            this.reviewerEmpIds = assessment.reviewerEmpIds ?? (assessment.reviewerEmpId ? [assessment.reviewerEmpId] : []);
            this.providers = [];
            this.activeProvider = undefined;
            this.loading = false;
            this.loadEvidenceForAcceptedFindings();
            this.loadParameterEvidence();
          },
          error: (err) => {
            console.error('IT Ops Maturity Dashboard: failed to load assessment for review', err);
            this.loading = false;
          },
        });
    });
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
      scoreId: r.scoreId ?? undefined,
      evidenceFiles: [],
      findingId: r.findingId ?? undefined,
      findingStatus: r.findingStatus ? BACKEND_FINDING_STATUS_MAP[r.findingStatus] ?? 'Pending' : undefined,
      findingRejectionComment: r.findingRejectionComment ?? undefined,
      findingActionTaken: r.findingActionTaken ?? undefined,
      findingAssesseeName: r.assesseeName ?? undefined,
      findingDisputeComment: r.disputeComment ?? undefined,
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

  /**
   * Whether this employee may Approve/Return this specific assessment.
   * Checked against the assessment's OWN reviewer assignment first - the
   * session-wide identity resolution (session.currentUser.reviewDomainIds)
   * only ever runs from the Dashboard's account-scoped data load, so it's
   * still unresolved ('NoAccess') for anyone who reached this page via My
   * Assignments -> Needs Review, which is the normal path now. Falls back to
   * the session check too, so a GDH-level reviewer (whole-business-unit
   * authority, not personally listed as this assessment's Reviewer) still
   * works whenever that session state happens to already be resolved.
   */
  canReview(): boolean {
    if (!this.domain) return false;
    const empId = localStorage.getItem('empid');
    if (empId && this.reviewerEmpIds.includes(empId)) return true;
    return this.session.currentUser.reviewDomainIds.includes(this.domain.id);
  }

  /** Approve/Return only make sense while the assessment is actually awaiting this reviewer's decision - once acted on (Approved/Returned), the buttons must disappear rather than stay clickable on an already-decided assessment. */
  canTakeReviewAction(): boolean {
    return this.canReview() && this.domain?.status === 'Pending Review';
  }

  assesseeNames(): string {
    return this.assesseeNamesList.join(', ');
  }

  /** Only one of the people this assessment is being conducted for (its own assignees) may accept/reject findings. */
  isAssessee(): boolean {
    const empId = localStorage.getItem('empid');
    return !!empId && this.assesseeEmpIds.includes(empId);
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
    // Accept/Reject is a one-time decision - once already decided (or closed/reopened by
    // the assessor), it can only be re-offered by the backend resetting it back to Pending.
    if (!param.findingId || this.decidingFindingId || param.findingStatus !== 'Pending') return;
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
          // A fresh rejection supersedes any earlier dispute reply - that response was about
          // the previous rejection, not this one.
          param.findingDisputeComment = undefined;
          this.toast.info('Finding rejected', `"${param.name}" has been rejected with your justification.`);
          this.rejectingParam = null;
        },
        error: () => this.toast.error('Action failed', 'Something went wrong rejecting this finding. Please try again.'),
      });
  }

  /** The Notes and Evidence readout shows every file the assessee attached to each parameter's score, same evidence set the scoring screen manages. */
  private loadParameterEvidence(): void {
    const withScore = (this.domain?.parameters ?? []).filter((p) => p.scoreId);
    if (!withScore.length) return;
    forkJoin(withScore.map((p) => this.api.getScoreEvidence(p.scoreId!))).subscribe((results) => {
      results.forEach((rows, i) => {
        withScore[i].evidenceFiles = rows.map((r) => ({ id: r.id, fileName: r.fileName }));
      });
    });
  }

  private loadEvidenceForAcceptedFindings(): void {
    const acceptedFindingIds = (this.domain?.parameters ?? [])
      .filter((p) => (p.findingStatus === 'Accepted' || p.findingStatus === 'Closed') && p.findingId)
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

  /** For a parameter's own evidence (as opposed to a finding's action-update evidence, downloaded via evidenceDownloadUrl above). */
  downloadEvidenceFile(evidence: { id: number; fileName: string }): void {
    this.api.downloadEvidence(evidence.id, evidence.fileName);
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

  /** Submit Update should only be clickable while there's actually something new to send - not while a submit is already in flight, and not again for text that's already been saved with no new evidence attached. */
  canSubmitActionUpdate(param: MaturityParameter): boolean {
    if (!param.findingId || this.submittingActionId === param.findingId) return false;
    const current = (param.findingActionTaken ?? '').trim();
    if (!current) return false;
    if (this.pendingEvidenceFor(param).length) return true;
    return current !== (this.lastSavedActionTaken.get(param.findingId) ?? '');
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
          // An accepted finding is fully resolved as soon as its action-taken description is
          // submitted - no separate assessor sign-off needed, unlike a rejection.
          param.findingStatus = 'Closed';
          this.lastSavedActionTaken.set(findingId, actionTaken);
          this.pendingEvidenceFiles[findingId] = [];
          this.loadEvidence(findingId);
          this.toast.success('Finding closed', `Your action on "${param.name}" has been recorded and shared with the COE SPOC and Reviewer.`);
        },
        error: () => this.toast.error('Submit failed', 'Something went wrong submitting this action update. Please try again.'),
      });
  }

}
