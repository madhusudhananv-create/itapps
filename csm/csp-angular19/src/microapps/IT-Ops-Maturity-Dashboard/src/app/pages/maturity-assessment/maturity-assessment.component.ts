import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, combineLatest, forkJoin, of, switchMap } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AssesseeService } from '../../services/assessee.service';
import { AccountService } from '../../services/account.service';
import { ItOpsMaturityApiService, ItOpsAssessmentInfo, ItOpsParameterScoreRow } from '../../services/itops-maturity-api.service';
import { TechnologyDomain, MaturityParameter, MaturityRubric, DomainStatus } from '../../models/maturity.model';
import { Assessee } from '../../models/assessee.model';
import { statusPillClass } from '../../utils/status.util';
import { RUBRIC_LEVELS, rubricScoreKey } from '../../utils/rubric.util';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

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

@Component({
  selector: 'app-maturity-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './maturity-assessment.component.html',
  styleUrl: './maturity-assessment.component.scss',
})
export class MaturityAssessmentComponent implements OnInit {
  domain?: TechnologyDomain;
  /** True until the first load attempt settles, so the "not found" message never flashes while data is still in flight. */
  loading = true;
  saveMessage = '';
  providers: string[] = [];
  activeProvider?: string;
  showSubmitModal = false;
  submitting = false;
  /** Keyed by parameter id, not a single shared string - an upload error on one question must not show under every other question's evidence box too. */
  evidenceErrors = new Map<string, string>();
  showDefinitionsModal = false;
  highlightParamId: string | null = null;
  selectedAssessees: Assessee[] = [];

  rubricLevels = RUBRIC_LEVELS;
  rubricModalParam: MaturityParameter | null = null;

  private assessmentId?: number;
  /** parameterId (numeric, as a string key matching MaturityParameter.id) -> ITOPS_PARAMETER.ID */
  private parameterIdByKey = new Map<string, number>();

  constructor(
    private route: ActivatedRoute,
    private assesseeService: AssesseeService,
    private accountService: AccountService,
    private api: ItOpsMaturityApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    // Subscribed, not a one-off snapshot read: the same route (assessment/:domainId)
    // is reused by Angular's default reuse strategy when navigating between two
    // "My Assignments" rows for the SAME domain (different project/cycle) - only
    // the assessmentId query param actually differs between them, so without this
    // subscription ngOnInit never runs again and the previously-loaded assessment
    // (however locked/submitted) just stays on screen.
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, queryParams]) => {
      const domainCode = params.get('domainId');
      const assessmentIdParam = queryParams.get('assessmentId');
      const account = this.accountService.selectedAccount;

      if (!domainCode || !account) {
        this.loading = false;
        return;
      }

      this.loading = true;
      // Reset per-assessment state left over from whatever was previously
      // loaded in this component instance (see the reuse-strategy note above).
      this.domain = undefined;
      this.assessmentId = undefined;
      this.saveMessage = '';
      this.evidenceErrors.clear();
      this.showSubmitModal = false;
      this.highlightParamId = null;
      this.evidenceUploading.clear();

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
            this.providers = [];
            this.activeProvider = undefined;
            this.loading = false;
            this.loadExistingEvidence();
          },
          error: (err) => {
            console.error('IT Ops Maturity Dashboard: failed to load assessment', err);
            this.loading = false;
          },
        });
    });

    this.assesseeService.selectedAssessees$.subscribe((assessees) => (this.selectedAssessees = assessees));
  }

  private toDomain(assessment: ItOpsAssessmentInfo, rows: ItOpsParameterScoreRow[]): TechnologyDomain {
    this.parameterIdByKey.clear();
    const parameters: MaturityParameter[] = rows.map((r) => {
      const key = String(r.parameterId);
      this.parameterIdByKey.set(key, r.parameterId);
      return {
        id: key,
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
      };
    });

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

  assesseeNames(): string {
    return this.selectedAssessees.map((a) => a.name).join(', ');
  }

  visibleParameters(): MaturityParameter[] {
    if (!this.domain) return [];
    if (!this.providers.length) return this.domain.parameters;
    return this.domain.parameters.filter((p) => p.provider === this.activeProvider);
  }

  openDefinitionsModal(): void {
    this.showDefinitionsModal = true;
  }

  closeDefinitionsModal(): void {
    this.showDefinitionsModal = false;
  }

  selectProvider(provider: string): void {
    this.activeProvider = provider;
  }

  isLocked(): boolean {
    return this.domain?.status === 'Pending Review' || this.domain?.status === 'Approved';
  }

  isBelowMinimum(param: MaturityParameter): boolean {
    return (
      typeof param.score === 'number' &&
      typeof param.minRequiredScore === 'number' &&
      param.score < param.minRequiredScore
    );
  }

  notesRequired(param: MaturityParameter): boolean {
    return param.score !== null && param.score !== undefined && !param.notes;
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

  closeRubricModal(): void {
    this.rubricModalParam = null;
  }

  selectScore(param: MaturityParameter, option: 'NA' | 1 | 2 | 3 | 4 | 5): void {
    if (this.isLocked()) return;
    param.score = option === 'NA' ? null : option;
  }

  isSelected(param: MaturityParameter, option: 'NA' | 1 | 2 | 3 | 4 | 5): boolean {
    if (option === 'NA') return param.score === null;
    return param.score === option;
  }

  progressCount(): { answered: number; total: number } {
    if (!this.domain) return { answered: 0, total: 0 };
    return {
      answered: this.domain.parameters.filter((p) => p.score !== null).length,
      total: this.domain.parameters.length,
    };
  }

  /**
   * Loads whatever evidence is already attached to each scored parameter, so
   * a returning visit shows every real uploaded file instead of an empty slot -
   * every parameter that already has a score row gets checked in one batch.
   */
  private loadExistingEvidence(): void {
    if (!this.domain) return;
    const withScore = this.domain.parameters.filter((p) => p.scoreId);
    if (!withScore.length) return;
    forkJoin(withScore.map((p) => this.api.getScoreEvidence(p.scoreId!))).subscribe((results) => {
      results.forEach((rows, i) => {
        withScore[i].evidenceFiles = rows.map((r) => ({ id: r.id, fileName: r.fileName }));
      });
    });
  }

  evidenceUploading = new Set<string>();

  /** Adds the picked file to the parameter's evidence list - does NOT replace whatever's already there, so several files can be attached to the same parameter. */
  onEvidenceSelected(event: Event, param: MaturityParameter): void {
    this.evidenceErrors.delete(param.id);
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    if (file.size > MAX_EVIDENCE_BYTES) {
      this.evidenceErrors.set(param.id, `"${file.name}" exceeds the 10MB upload limit. Choose a smaller file.`);
      input.value = '';
      return;
    }
    if (!this.assessmentId) return;

    this.evidenceUploading.add(param.id);
    // Evidence attaches to the parameter's SCORE_ID, which only exists once the
    // score has been saved at least once - if this is the first thing the
    // assessee does for this parameter, save it now (whatever score/notes are
    // currently entered, even none) to get a real id, then upload against that.
    const parameterId = this.parameterIdByKey.get(param.id);
    const ensureScoreId: Observable<number> = param.scoreId
      ? of(param.scoreId)
      : parameterId
        ? this.api
            .upsertScore(this.assessmentId, parameterId, typeof param.score === 'number' ? param.score : null, param.notes ?? '')
            .pipe(map((score) => score.id))
        : of(undefined as unknown as number);

    ensureScoreId
      .pipe(
        switchMap((scoreId) => {
          param.scoreId = scoreId;
          return this.api.uploadScoreEvidence(scoreId, file);
        }),
        finalize(() => {
          this.evidenceUploading.delete(param.id);
          input.value = ''; // clears the file input so picking the SAME filename again still fires a change event
        }),
      )
      .subscribe({
        next: (rows) => {
          const created = rows[0];
          param.evidenceFiles = [...param.evidenceFiles, { id: created?.id, fileName: created?.fileName ?? file.name }];
        },
        error: () => {
          this.evidenceErrors.set(param.id, `Could not upload "${file.name}". Please try again.`);
        },
      });
  }

  removeEvidence(param: MaturityParameter, evidence: { id: number; fileName: string }): void {
    this.api.deleteEvidence(evidence.id).subscribe({
      next: () => {
        param.evidenceFiles = param.evidenceFiles.filter((e) => e.id !== evidence.id);
      },
      error: () => this.toast.error('Could not remove the evidence file.', 'Please try again.'),
    });
  }

  downloadEvidence(evidence: { id: number; fileName: string }): void {
    this.api.downloadEvidence(evidence.id, evidence.fileName);
  }

  /** Persists every parameter that has a score and/or notes entered so far. */
  private persistAllScores(): Observable<unknown> {
    if (!this.assessmentId || !this.domain) return of(null);
    const toSave = this.domain.parameters.filter((p) => p.score !== null || p.notes);
    if (!toSave.length) return of(null);
    const calls: Observable<unknown>[] = toSave.map((p) => {
      const parameterId = this.parameterIdByKey.get(p.id);
      if (!parameterId) return of(null);
      return this.api.upsertScore(this.assessmentId!, parameterId, typeof p.score === 'number' ? p.score : null, p.notes ?? '');
    });
    return forkJoin(calls);
  }

  saveDraft(): void {
    if (!this.domain || !this.assessmentId) return;
    this.persistAllScores().subscribe(() => {
      this.api.saveDraft(this.assessmentId!).subscribe(() => {
        if (this.domain && this.domain.status === 'Not Started') this.domain.status = 'Draft';
        this.toast.success('Draft saved', `${this.domain?.name ?? 'This assessment'} was saved. You can pick up right where you left off.`);
      });
    });
  }

  openSubmitModal(): void {
    if (!this.domain) return;
    const firstMissing = this.domain.parameters.find((p) => this.notesRequired(p));
    if (firstMissing) {
      this.saveMessage = 'Notes are required for every scored parameter.';
      this.toast.error('Notes required', 'Add notes for every scored parameter before submitting for review.');
      this.scrollToParam(firstMissing);
      return;
    }
    this.showSubmitModal = true;
  }

  private scrollToParam(param: MaturityParameter): void {
    if (param.provider && param.provider !== this.activeProvider) {
      this.activeProvider = param.provider;
    }
    this.highlightParamId = param.id;
    setTimeout(() => {
      document.getElementById('param-' + param.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    setTimeout(() => {
      if (this.highlightParamId === param.id) {
        this.highlightParamId = null;
      }
    }, 2200);
  }

  closeSubmitModal(): void {
    this.showSubmitModal = false;
  }

  confirmSubmit(): void {
    if (!this.domain || !this.assessmentId || this.submitting) return;
    this.submitting = true;
    this.persistAllScores().subscribe({
      next: () => {
        this.api
          .submitAssessment(this.assessmentId!)
          .pipe(finalize(() => (this.submitting = false)))
          .subscribe({
            next: () => {
              if (this.domain) {
                this.domain.status = 'Pending Review';
              }
              this.showSubmitModal = false;
              this.toast.success(
                'Submitted for review',
                `${this.domain?.name ?? 'This assessment'} has been sent to ${this.domain?.reviewer || 'your reviewer'} for approval.`,
              );
            },
            error: () => this.toast.error('Submit failed', 'Something went wrong submitting this assessment. Please try again.'),
          });
      },
      error: () => {
        this.submitting = false;
        this.toast.error('Submit failed', 'Something went wrong submitting this assessment. Please try again.');
      },
    });
  }
}
