import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaturityMockService } from '../../services/maturity-mock.service';
import { SessionService } from '../../services/session.service';
import { AssesseeService } from '../../services/assessee.service';
import { TechnologyDomain, MaturityParameter, MaturityRubric, FindingStatus } from '../../models/maturity.model';
import { Assessee } from '../../models/assessee.model';
import { statusPillClass } from '../../utils/status.util';
import { RUBRIC_LEVELS, rubricScoreKey } from '../../utils/rubric.util';

@Component({
  selector: 'app-domain-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './domain-review.component.html',
  styleUrl: './domain-review.component.scss',
})
export class DomainReviewComponent implements OnInit {
  domain?: TechnologyDomain;
  providers: string[] = [];
  activeProvider?: string;

  showReturnModal = false;
  returnComment = '';
  returnCommentError = '';
  actionMessage = '';
  showDefinitionsModal = false;
  selectedAssessees: Assessee[] = [];

  rubricLevels = RUBRIC_LEVELS;
  rubricModalParam: MaturityParameter | null = null;

  retargetingParam: MaturityParameter | null = null;
  retargetDate = '';
  retargetReason = '';
  retargetError = '';

  decidingRetargetParam: MaturityParameter | null = null;
  retargetDecisionComment = '';

  constructor(
    private route: ActivatedRoute,
    private maturityService: MaturityMockService,
    private session: SessionService,
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
    this.assesseeService.selectedAssessees$.subscribe((assessees) => (this.selectedAssessees = assessees));
  }

  canReview(): boolean {
    if (this.session.currentUser.role !== 'FunctionHead' || !this.domain) return false;
    return this.session.currentUser.allowedDomainIds.includes(this.domain.id);
  }

  assesseeNames(): string {
    return this.selectedAssessees.map((a) => a.name).join(', ');
  }

  /** Only one of the people the assessment is being conducted for (the selected Assessees) may accept/reject findings. */
  isAssessee(): boolean {
    const empId = localStorage.getItem('empid');
    return !!empId && this.selectedAssessees.some((a) => a.id === empId);
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
    if (!this.domain) return;
    this.maturityService.approveDomain(this.domain.id).subscribe(() => {
      this.actionMessage = 'Assessment approved.';
      if (this.domain) this.domain.status = 'Approved';
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
    if (!this.domain) return;
    this.maturityService.returnForRevision(this.domain.id, this.returnComment.trim()).subscribe(() => {
      if (this.domain) {
        this.domain.status = 'In Progress';
        this.domain.returnComment = this.returnComment.trim();
      }
      this.showReturnModal = false;
      this.actionMessage = 'Returned to COE SPOC for revision.';
    });
  }

  toggleSuspend(): void {
    if (!this.domain) return;
    const next = !this.domain.suspended;
    this.maturityService.setSuspended(this.domain.id, next).subscribe(() => {
      if (this.domain) this.domain.suspended = next;
      this.actionMessage = next ? 'Assessment suspended.' : 'Assessment resumed.';
    });
  }

  setFinding(param: MaturityParameter, status: FindingStatus): void {
    if (!this.domain) return;
    const next = param.findingStatus === status ? 'Pending' : status;
    this.maturityService.setFindingStatus(this.domain.id, param.id, next).subscribe(() => {
      param.findingStatus = next;
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
