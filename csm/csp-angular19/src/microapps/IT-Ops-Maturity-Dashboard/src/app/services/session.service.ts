import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CurrentUser, DomainSummary } from '../models/maturity.model';
import { getGdhEmailsForBusinessUnit } from '../utils/bu-head-map.util';

function loadInitialUser(): CurrentUser {
  const name = localStorage.getItem('displayname') || localStorage.getItem('empid') || 'Guest';
  // Role/email/allowed domains are resolved once account + domain data load
  // (see resolveIdentity()); NoAccess is the safe default until then.
  return { name, email: null, role: 'NoAccess', allowedDomainIds: [] };
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * CSM login display names carry a trailing disambiguation tag - either
 * dot-prefixed ("Veera Venkateswar Rao.A") or space-prefixed initials
 * ("Sreeraam AS") - that the assessment data's plain name field won't have.
 * Generates the raw name plus each single-suffix-stripped variant (never
 * both at once, and never more than one trailing word, so a real 3-word name
 * like "Veera Venkateswar Rao" can't be over-stripped down to 2 words) so
 * any of them can be checked against the domain's untouched name.
 */
export function nameMatchCandidates(name: string): string[] {
  const base = normalizeName(name);
  const candidates = new Set([base]);
  const dotStripped = base.replace(/\.[a-z0-9]{1,4}$/, '');
  candidates.add(dotStripped);
  const spaceStripped = base.replace(/\s[a-z0-9]{1,4}$/, '');
  candidates.add(spaceStripped);
  return Array.from(candidates);
}

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private userSubject = new BehaviorSubject<CurrentUser>(loadInitialUser());
  readonly user$ = this.userSubject.asObservable();

  get currentUser(): CurrentUser {
    return this.userSubject.value;
  }

  /**
   * Resolves role and the exact set of domains this identity may see/act on.
   * Preference order:
   *   0. Real EMP_ID match against DB-backed assignment data (coeSpocEmpId/reviewerEmpId) -
   *      exact and authoritative whenever the row came from the real API rather than the CSV mock.
   *   1. COE SPOC email match on any domain -> SPOC (restricted to those domains)
   *   2. Reviewer email match on any domain -> Function Head (restricted to those domains)
   *   3. Email is a configured GDH for this account's Business Unit -> GDH (business-level: all domains in this account)
   *   4. No match -> NoAccess (no domains shown)
   *
   * If email resolution comes back empty/unmatched (e.g. the employee-lookup
   * API isn't returning a row for this session yet), falls back to matching
   * the display name against the domain's plain COE SPOC/Reviewer name -
   * a looser secondary signal, kept in sync with role so the two never
   * disagree (unlike matching independently in each component).
   */
  resolveIdentity(domains: DomainSummary[], businessUnit: string | null, email: string | null, myEmpId: string | null = null): void {
    const emailNorm = normalizeEmail(email);
    const nameCandidates = nameMatchCandidates(this.currentUser.name);

    let spocIds = myEmpId ? domains.filter((d) => d.coeSpocEmpId === myEmpId).map((d) => d.id) : [];
    let reviewIds = myEmpId ? domains.filter((d) => d.reviewerEmpId === myEmpId).map((d) => d.id) : [];
    let isGdh = false;

    if (!spocIds.length && !reviewIds.length) {
      spocIds = domains.filter((d) => emailNorm && normalizeEmail(d.coeSpocEmail) === emailNorm).map((d) => d.id);
      reviewIds = domains.filter((d) => emailNorm && normalizeEmail(d.reviewerEmail) === emailNorm).map((d) => d.id);
      isGdh = !!emailNorm && getGdhEmailsForBusinessUnit(businessUnit).includes(emailNorm);
    }

    if (!spocIds.length && !reviewIds.length && !isGdh) {
      spocIds = domains.filter((d) => nameCandidates.includes(normalizeName(d.coeSpoc))).map((d) => d.id);
      reviewIds = domains.filter((d) => nameCandidates.includes(normalizeName(d.reviewer))).map((d) => d.id);
    }

    const role = spocIds.length ? 'SPOC' : reviewIds.length ? 'FunctionHead' : isGdh ? 'GDH' : 'NoAccess';
    const allowedDomainIds =
      role === 'SPOC' ? spocIds : role === 'FunctionHead' ? reviewIds : role === 'GDH' ? domains.map((d) => d.id) : [];

    this.userSubject.next({ ...this.currentUser, email, role, allowedDomainIds });
  }

  /** Records the resolved email without touching role/allowedDomainIds (used by pages that scope per-row instead of per-account, e.g. Reports). */
  setEmail(email: string | null): void {
    if (this.currentUser.email === email) return;
    this.userSubject.next({ ...this.currentUser, email });
  }

  /**
   * Same matching rules as resolveIdentity(), applied to a single
   * account-agnostic row (used by the Reports page, which spans many
   * accounts/business units at once instead of one resolved identity).
   */
  canSeeRow(row: { coeSpoc: string; reviewer: string; coeSpocEmail?: string; reviewerEmail?: string; businessUnit: string }): boolean {
    const emailNorm = normalizeEmail(this.currentUser.email);
    const nameCandidates = nameMatchCandidates(this.currentUser.name);

    const isSpoc = emailNorm ? normalizeEmail(row.coeSpocEmail) === emailNorm : nameCandidates.includes(normalizeName(row.coeSpoc));
    const isReviewer = emailNorm ? normalizeEmail(row.reviewerEmail) === emailNorm : nameCandidates.includes(normalizeName(row.reviewer));
    const isGdh = !!emailNorm && getGdhEmailsForBusinessUnit(row.businessUnit).includes(emailNorm);

    return isSpoc || isReviewer || isGdh;
  }
}
