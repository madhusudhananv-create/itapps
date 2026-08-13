import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaturityMockService } from '../../services/maturity-mock.service';
import { AssesseeService } from '../../services/assessee.service';
import { TechnologyDomain, MaturityParameter, MaturityRubric } from '../../models/maturity.model';
import { Assessee } from '../../models/assessee.model';
import { statusPillClass } from '../../utils/status.util';
import { RUBRIC_LEVELS, rubricScoreKey } from '../../utils/rubric.util';

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

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
  selectedAssessee: Assessee | null = null;

  rubricLevels = RUBRIC_LEVELS;
  rubricModalParam: MaturityParameter | null = null;

  constructor(
    private route: ActivatedRoute,
    private maturityService: MaturityMockService,
    private assesseeService: AssesseeService,
  ) {}

  ngOnInit(): void {
    const domainId = this.route.snapshot.paramMap.get('domainId');
    if (domainId) {
      this.maturityService.getDomain(domainId).subscribe((domain) => {
        this.domain = domain;
        if (domain) {
          this.providers = Array.from(new Set(domain.parameters.map((p) => p.provider).filter((p): p is string => !!p)));
          this.activeProvider = this.providers[0];
        }
      });
    }
    this.assesseeService.selectedAssessee$.subscribe((assessee) => (this.selectedAssessee = assessee));
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

  saveDraft(): void {
    if (!this.domain) return;
    this.maturityService.saveDraft(this.domain.id).subscribe(() => {
      this.saveMessage = 'Draft saved.';
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
    if (!this.domain) return;
    this.maturityService.submitForReview(this.domain.id).subscribe(() => {
      this.saveMessage = 'Submitted for review. The Function Head has been notified.';
      if (this.domain) {
        this.domain.status = 'Pending Review';
      }
      this.showSubmitModal = false;
    });
  }
}
