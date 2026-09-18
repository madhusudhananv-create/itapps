import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map } from 'rxjs';
import {
  TechnologyDomain,
  DomainSummary,
  TopRisk,
  EnterpriseSummary,
  ReportRow,
  AssessmentStatus,
  DueStatus,
  FindingStatus,
  maturityLevelFromScore,
} from '../models/maturity.model';

const DAY_MS = 24 * 60 * 60 * 1000;
const DRAFT_WARN_DAYS = 15;
const DRAFT_CRITICAL_DAYS = 30;
const NO_UPDATE_DAYS = 30;
const LONG_DATED_DAYS = 60;

function hashSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * COE SPOC / Reviewer email addresses, transcribed verbatim from the source
 * spreadsheet. Domains omitted here (or with an undefined side) don't have a
 * confirmed email yet - matching simply won't succeed for that person/domain
 * until it's provided.
 */
const DOMAIN_EMAILS: Record<string, { coeSpocEmail?: string; reviewerEmail?: string }> = {
  windows: { coeSpocEmail: 'sreeraam.sundarababu@neurealm.com', reviewerEmail: 'sreeraam.sundarababu@neurealm.com' },
  linux: { reviewerEmail: 'nirmalkumar.t@neurealm.com' },
  vmware: { coeSpocEmail: 'sreeraam.sundarababu@neurealm.com', reviewerEmail: 'sreeraam.sundarababu@neurealm.com' },
  'citrix-vdi': { reviewerEmail: 'nirmalkumar.t@neurealm.com' },
  network: { coeSpocEmail: 'mohamedyasar.ghani@neurealm.com', reviewerEmail: 'ravisankar.b@neurealm.com' },
  'hyperconverged-infra': { coeSpocEmail: 'veera.v@neurealm.com', reviewerEmail: 'sreeraam.sundarababu@neurealm.com' },
  database: { coeSpocEmail: 'nithilraj.p@neurealm.com', reviewerEmail: 'nirmalkumar.t@neurealm.com' },
  cloud: { coeSpocEmail: 'parthasarathy.kannan@neurealm.com', reviewerEmail: 'omkumar.m@neurealm.com' },
  'storage-backup': { coeSpocEmail: 'veera.v@neurealm.com', reviewerEmail: 'nirmalkumar.t@neurealm.com' },
  noc: { coeSpocEmail: 'abarna.selvaraj@neurealm.com', reviewerEmail: 'ravisankar.b@neurealm.com' },
  servicedesk: { coeSpocEmail: 'santhosh.s@neurealm.com', reviewerEmail: 'ganesh.k@neurealm.com' },
  euc: { coeSpocEmail: 'santhosh.s@neurealm.com', reviewerEmail: 'nirmalkumar.t@neurealm.com' },
  itsm: { coeSpocEmail: 'gouri.mahendru@neurealm.com', reviewerEmail: 'ganesh.k@neurealm.com' },
  'dr-bc': { coeSpocEmail: 'veera.v@neurealm.com', reviewerEmail: 'ravisankar.b@neurealm.com' },
};

function backfillDomainEmails(domain: TechnologyDomain): TechnologyDomain {
  const emails = DOMAIN_EMAILS[domain.id];
  if (!emails) return domain;
  return {
    ...domain,
    coeSpocEmail: domain.coeSpocEmail ?? emails.coeSpocEmail,
    reviewerEmail: domain.reviewerEmail ?? emails.reviewerEmail,
  };
}

/** Backfills demo values for fields that don't exist in the source spreadsheet
 * (target date, last-updated, suspended flag) with a deterministic spread per
 * domain, so the same domain always renders the same demo state across reloads. */
function backfillDomainMeta(domain: TechnologyDomain): TechnologyDomain {
  if (domain.targetDate && domain.lastUpdated) return domain;
  const seed = hashSeed(domain.id);
  const now = Date.now();

  const daysSinceUpdate = seed % 75; // 0-74 days ago
  const lastUpdated = domain.lastUpdated ?? new Date(now - daysSinceUpdate * DAY_MS).toISOString();

  const targetOffsetDays = (seed % 90) - 45; // -45..+44 days relative to today
  const targetDate = domain.targetDate ?? new Date(now + targetOffsetDays * DAY_MS).toISOString();

  return { ...domain, lastUpdated, targetDate, suspended: domain.suspended ?? false };
}

function computeSummary(domain: TechnologyDomain): DomainSummary {
  const scored = domain.parameters.filter((p) => typeof p.score === 'number') as (typeof domain.parameters[number] & { score: number })[];
  const averageScore = scored.length
    ? Math.round((scored.reduce((sum, p) => sum + p.score, 0) / scored.length) * 100) / 100
    : null;
  const maturityPercent = averageScore !== null ? Math.round((averageScore / 5) * 100) : null;
  const maturityLevel = averageScore !== null ? maturityLevelFromScore(averageScore) : null;
  const paramCount = domain.parameters.length;
  const sumScores = scored.reduce((sum, p) => sum + p.score, 0);
  const maxPossible = paramCount * 5;

  return {
    id: domain.id,
    name: domain.name,
    coeSpoc: domain.coeSpoc,
    coeSpocEmail: domain.coeSpocEmail,
    reviewer: domain.reviewer,
    reviewerEmail: domain.reviewerEmail,
    status: domain.status,
    averageScore,
    maturityPercent,
    maturityLevel,
    paramCount,
    sumScores,
    maxPossible,
  };
}

function computeTopRisks(domains: TechnologyDomain[]): TopRisk[] {
  const risks: TopRisk[] = [];
  for (const domain of domains) {
    for (const param of domain.parameters) {
      if (typeof param.score === 'number') {
        const gap = 5 - param.score;
        risks.push({
          domain: domain.name,
          category: param.category,
          parameter: param.name,
          currentScore: param.score,
          gap,
          recommendation:
            gap > 0
              ? `Advance "${param.name}" from level ${param.score} toward level ${param.score + 1} practices.`
              : `"${param.name}" is already at level 5 - maintain current practices.`,
        });
      }
    }
  }
  return risks.sort((a, b) => b.gap - a.gap);
}

export function computeEnterpriseSummary(summaries: DomainSummary[]): EnterpriseSummary {
  const totalParamCount = summaries.reduce((sum, s) => sum + s.paramCount, 0);
  const totalSumScores = summaries.reduce((sum, s) => sum + s.sumScores, 0);
  const totalMaxPossible = summaries.reduce((sum, s) => sum + s.maxPossible, 0);
  const overallAverageScore = totalParamCount ? Math.round((totalSumScores / totalParamCount) * 100) / 100 : 0;
  const overallMaturityPercent = Math.round((overallAverageScore / 5) * 100);

  return {
    overallAverageScore,
    overallMaturityPercent,
    overallMaturityLevel: overallAverageScore > 0 ? maturityLevelFromScore(overallAverageScore) : 'Not Started',
    domainsCompleted: summaries.filter((s) => s.status === 'Approved').length,
    domainsInProgress: summaries.filter((s) => s.status === 'Draft' || s.status === 'In Progress' || s.status === 'Pending Review').length,
    domainsNotStarted: summaries.filter((s) => s.status === 'Not Started').length,
    totalParamCount,
    totalSumScores,
    totalMaxPossible,
  };
}

export function computeAssessmentStatus(domain: TechnologyDomain): AssessmentStatus {
  if (domain.suspended) return 'Suspended';
  return domain.status === 'Approved' ? 'Closed' : 'Open';
}

export function computeDueStatus(domain: TechnologyDomain, assessmentStatus: AssessmentStatus): DueStatus {
  if (assessmentStatus !== 'Open' || !domain.targetDate) return null;
  return new Date(domain.targetDate).getTime() < Date.now() ? 'Past Due' : 'On Target';
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
}

function buildReportRow(domain: TechnologyDomain, accountName: string, businessUnit: string): ReportRow {
  const summary = computeSummary(domain);
  const assessmentStatus = computeAssessmentStatus(domain);
  const dueStatus = computeDueStatus(domain, assessmentStatus);
  const lastUpdated = domain.lastUpdated ?? new Date().toISOString();
  const daysSinceUpdate = daysSince(lastUpdated);

  let findingsAccepted = 0;
  let findingsRejected = 0;
  let findingsPending = 0;
  for (const param of domain.parameters) {
    if (!param.notes) continue;
    const status: FindingStatus = param.findingStatus ?? 'Pending';
    if (status === 'Accepted') findingsAccepted++;
    else if (status === 'Rejected') findingsRejected++;
    else findingsPending++;
  }

  return {
    accountName,
    businessUnit,
    domainId: domain.id,
    domainName: domain.name,
    coeSpoc: domain.coeSpoc,
    reviewer: domain.reviewer,
    coeSpocEmail: domain.coeSpocEmail,
    reviewerEmail: domain.reviewerEmail,
    assessmentStatus,
    dueStatus,
    targetDate: domain.targetDate ?? null,
    lastUpdated,
    daysSinceUpdate,
    draftOver15Days: (domain.status === 'Draft' || domain.status === 'In Progress') && daysSinceUpdate > DRAFT_WARN_DAYS,
    draftOver30Days: (domain.status === 'Draft' || domain.status === 'In Progress') && daysSinceUpdate > DRAFT_CRITICAL_DAYS,
    noManagementUpdate: daysSinceUpdate > NO_UPDATE_DAYS,
    longDated: daysSinceUpdate > LONG_DATED_DAYS,
    findingsAccepted,
    findingsRejected,
    findingsPending,
    averageScore: summary.averageScore,
    maturityPercent: summary.maturityPercent,
  };
}

@Injectable({ providedIn: 'root' })
export class MaturityMockService {
  private domains$: Observable<TechnologyDomain[]>;

  constructor(private http: HttpClient) {
    this.domains$ = this.http
      .get<{ domains: TechnologyDomain[] }>('data/maturity-data.json')
      .pipe(
        map((res) => res.domains.map(backfillDomainMeta).map(backfillDomainEmails)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
  }

  private getDomains(): Observable<TechnologyDomain[]> {
    return this.domains$;
  }

  getDomainSummaries(): Observable<DomainSummary[]> {
    return this.getDomains().pipe(map((domains) => domains.map(computeSummary)));
  }

  getEnterpriseSummary(): Observable<EnterpriseSummary> {
    return this.getDomains().pipe(map((domains) => computeEnterpriseSummary(domains.map(computeSummary))));
  }

  getTopRisks(): Observable<TopRisk[]> {
    return this.getDomains().pipe(map((domains) => computeTopRisks(domains)));
  }

  getDomain(id: string): Observable<TechnologyDomain | undefined> {
    return this.getDomains().pipe(map((domains) => domains.find((d) => d.id === id)));
  }

  getReportRows(accountName: string, businessUnit: string): Observable<ReportRow[]> {
    return this.getDomains().pipe(map((domains) => domains.map((d) => buildReportRow(d, accountName, businessUnit))));
  }

  saveDraft(domainId: string): Observable<boolean> {
    return this.getDomain(domainId).pipe(
      map((domain) => {
        if (domain) {
          domain.status = 'Draft';
          domain.lastUpdated = new Date().toISOString();
        }
        return true;
      })
    );
  }

  submitForReview(domainId: string): Observable<boolean> {
    return this.getDomain(domainId).pipe(
      map((domain) => {
        if (domain) {
          domain.status = 'Pending Review';
          domain.returnComment = undefined;
          domain.lastUpdated = new Date().toISOString();
        }
        return true;
      })
    );
  }

  approveDomain(domainId: string): Observable<boolean> {
    return this.getDomain(domainId).pipe(
      map((domain) => {
        if (domain) {
          domain.status = 'Approved';
          domain.returnComment = undefined;
          domain.lastUpdated = new Date().toISOString();
        }
        return true;
      })
    );
  }

  returnForRevision(domainId: string, comment: string): Observable<boolean> {
    return this.getDomain(domainId).pipe(
      map((domain) => {
        if (domain) {
          domain.status = 'In Progress';
          domain.returnComment = comment;
          domain.lastUpdated = new Date().toISOString();
        }
        return true;
      })
    );
  }

  setSuspended(domainId: string, suspended: boolean): Observable<boolean> {
    return this.getDomain(domainId).pipe(
      map((domain) => {
        if (domain) domain.suspended = suspended;
        return true;
      }),
    );
  }

  setFindingStatus(domainId: string, paramId: string, status: FindingStatus): Observable<boolean> {
    return this.getDomain(domainId).pipe(
      map((domain) => {
        const param = domain?.parameters.find((p) => p.id === paramId);
        if (param) param.findingStatus = status;
        return true;
      }),
    );
  }
}
