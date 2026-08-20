import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { AssesseeService } from '../../services/assessee.service';
import { AccountService } from '../../services/account.service';
import { ItOpsMaturityApiService, ItOpsAssessmentInfo, ItOpsParameterScoreRow } from '../../services/itops-maturity-api.service';
import { TechnologyDomain, MaturityParameter, MaturityRubric, DomainStatus } from '../../models/maturity.model';
import { Assessee } from '../../models/assessee.model';
import { statusPillClass } from '../../utils/status.util';
import { RUBRIC_LEVELS, rubricScoreKey } from '../../utils/rubric.util';

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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './maturity-assessment.component.html',
  styleUrl: './maturity-assessment.component.scss',
})
export class MaturityAssessmentComponent implements OnInit {
  domain?: TechnologyDomain;
  saveMessage = '';
  providers: string[] = [];
  activeProvider?: string;
  showSubmitModal = false;
  evidenceError = '';
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
        .subscribe(({ assessment, parameters }) => {
          this.assessmentId = assessment.assessmentId;
          this.domain = this.toDomain(assessment, parameters);
          this.providers = [];
          this.activeProvider = undefined;
        });
    }

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
      };
    });

    return {
      id: assessment.domainCode,
      name: assessment.domainName,
      coeSpoc: assessment.coeSpocEmpId ?? '',
      reviewer: assessment.reviewerEmpId ?? '',
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

  onEvidenceSelected(event: Event, param: MaturityParameter): void {
    this.evidenceError = '';
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > MAX_EVIDENCE_BYTES) {
        this.evidenceError = `"${file.name}" exceeds the 10MB upload limit. Choose a smaller file.`;
        input.value = '';
        return;
      }
      param.evidenceFileName = file.name;
    }
  }

  removeEvidence(param: MaturityParameter): void {
    param.evidenceFileName = undefined;
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
        this.saveMessage = 'Draft saved.';
        if (this.domain && this.domain.status === 'Not Started') this.domain.status = 'Draft';
      });
    });
  }

  openSubmitModal(): void {
    if (!this.domain) return;
    const firstMissing = this.domain.parameters.find((p) => this.notesRequired(p));
    if (firstMissing) {
      this.saveMessage = 'Notes are required for every scored parameter.';
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
    if (!this.domain || !this.assessmentId) return;
    this.persistAllScores().subscribe(() => {
      this.api.submitAssessment(this.assessmentId!).subscribe(() => {
        this.saveMessage = 'Submitted for review. The Function Head has been notified.';
        if (this.domain) {
          this.domain.status = 'Pending Review';
        }
        this.showSubmitModal = false;
      });
    });
  }
}
