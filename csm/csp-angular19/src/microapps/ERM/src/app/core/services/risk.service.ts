import { computed, Injectable, signal } from '@angular/core';
import {
  RiskRecord,
  type RiskLifecycleStatus,
  type RiskStrategyOption,
} from '../models/risk.model';
import { buildMockRisks } from '../data/mock-risks';
import {
  RISK_APPROVER_ROLES,
  type RiskApproverRole,
} from '../risk-approver.constants';
import {
  ERM_RISK_TRACKER_HEADERS,
  ERM_RISK_TRACKER_ROWS,
  type ErmRiskTrackerHeader,
  type ErmRiskTrackerRow,
} from '../data/erm-risk-tracker.generated';
import { ACTIVE_PROJECT_ACCOUNT_MAPPINGS } from '../data/active-project-accounts.generated';
import { BUSINESS_UNITS, ORG_FUNCTIONS } from '../risk-rating.constants';

export type HeaderDataMode = 'organization' | 'business-unit';

export type DashboardLens =
  | 'enterprise'
  | 'business-unit'
  | 'function'
  | 'account';

const TRACKER_EDIT_STORAGE_KEY = 'neurealm-existing-risk-edits';
export type TrackerEditMap = Record<string, Partial<Record<ErmRiskTrackerHeader, string>>>;
export type TrackerRowWithKey = ErmRiskTrackerRow & { readonly __rowKey: string };

function trackerRowKey(row: ErmRiskTrackerRow): string {
  return JSON.stringify(ERM_RISK_TRACKER_HEADERS.map((h) => row[h] ?? null));
}

function loadStoredTrackerEdits(): TrackerEditMap {
  try {
    const raw = localStorage.getItem(TRACKER_EDIT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as TrackerEditMap) : {};
  } catch {
    return {};
  }
}

function persistStoredTrackerEdits(edits: TrackerEditMap): void {
  localStorage.setItem(TRACKER_EDIT_STORAGE_KEY, JSON.stringify(edits));
}

function applyTrackerEdits(row: ErmRiskTrackerRow, edits: TrackerEditMap): ErmRiskTrackerRow {
  const rowEdits = edits[trackerRowKey(row)];
  if (!rowEdits) return row;
  const next = { ...row };
  for (const h of ERM_RISK_TRACKER_HEADERS) {
    if (rowEdits[h] !== undefined) {
      next[h] = rowEdits[h] ?? '';
    }
  }
  return next;
}

function applyTrackerEditsWithKey(row: ErmRiskTrackerRow, edits: TrackerEditMap): TrackerRowWithKey {
  const key = trackerRowKey(row);
  return { ...applyTrackerEdits(row, edits), __rowKey: key };
}

function textCell(v: unknown): string {
  return v == null ? '' : String(v).trim();
}

function numCell(v: unknown): number {
  if (v == null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Parse sheet date strings to YYYY-MM-DD when possible. */
function parseTrackerYmd(raw: unknown): string {
  const s = textCell(raw);
  if (!s) return '';
  const isoTry = new Date(s);
  if (!Number.isNaN(isoTry.getTime())) {
    return isoTry.toISOString().slice(0, 10);
  }
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    if (!Number.isNaN(dt.getTime())) {
      return dt.toISOString().slice(0, 10);
    }
  }
  return '';
}

function trackerImplementationStatus(row: ErmRiskTrackerRow): string {
  return textCell(row['Current status of Risk Treatment implementation']);
}

function trackerRowToStatus(row: ErmRiskTrackerRow): RiskRecord['status'] {
  const st = trackerImplementationStatus(row).toLowerCase();
  if (st.includes('completed')) return 'closed';
  if (st.includes('closed')) return 'closed';
  return 'open';
}

function mapTrackerStrategy(raw: unknown): RiskStrategyOption {
  const s = textCell(raw).toLowerCase();
  if (s.includes('avoid')) return 'Risk Avoidance';
  if (s.includes('transfer')) return 'Risk Transfer';
  if (s.includes('accept')) return 'Risk Acceptance';
  return 'Risk Reduction';
}

/**
 * Maps an ERM Risk Tracker workbook row into {@link RiskRecord} so dashboard charts and KPIs
 * align with the Enterprise Risks register (not the separate mock portfolio).
 */
function riskRecordFromErmTrackerRow(row: ErmRiskTrackerRow): RiskRecord | null {
  const id = textCell(row['Risk ID']);
  if (!id) return null;

  const bu = textCell(row['Business Unit']) || 'Unassigned';
  const locationAccount = textCell(row['Location / Account Name']);
  const category = textCell(row['Risk Category']) || 'Uncategorized';

  const c0 = numCell(row['Current Consequences of the event when threat exploit vulnerabilities']);
  const l0 = numCell(row['Current Likelihood of threat exploiting vulnerability']);
  const inherentRating = c0 * l0;

  const rc = numCell(
    row['New estimated Consequences of the event when threat exploit vulnerabilities after risk treatment execution']
  );
  const rl = numCell(
    row['New estimated Likelihood of the of threat exploiting vulnerability after risk treatment']
  );
  const hadResidualNums = rc > 0 && rl > 0;
  const residualRating = hadResidualNums ? rc * rl : inherentRating;

  const status = trackerRowToStatus(row);
  const riskLifecycleStatus: RiskLifecycleStatus = status === 'closed' ? 'Closed' : 'Open';

  const identified = parseTrackerYmd(row['Risk Identified on (Date)']);
  const identificationDate = identified || '';
  const loggedAt = identified
    ? new Date(`${identified}T12:00:00.000Z`).toISOString()
    : new Date().toISOString();

  const targetClosure = parseTrackerYmd(row['Target date for Risk Treatment implementation (DD/MM/YYYY)']);

  const controlEffectiveness =
    inherentRating > 0
      ? Math.round(Math.min(100, Math.max(0, 100 * (1 - residualRating / inherentRating))))
      : 54;

  const description = textCell(row['Risk Description']);
  const title =
    description.length > 140 ? `${description.slice(0, 137)}...` : description || `Risk ${id}`;

  const riskApprover: RiskApproverRole = RISK_APPROVER_ROLES[0]!;

  return {
    id,
    title,
    description: description || title,
    businessImpact: textCell(row['Impact']),
    threat: textCell(row['Threat']),
    vulnerability: textCell(row['Vulnerabilities']),
    location: locationAccount || textCell(row['Support Function/ Business Unit']) || bu,
    riskRemediationPlan: textCell(row['Proposed Risk Remediation Plan']),
    personResponsibleRiskTreatment: textCell(
      row['Person responsible for Risk Treatment Plan & implementation']
    ),
    riskTreatmentCompletionDate: textCell(row['Risk Treatment Completion Date (DD/MM/YYYY)']),
    riskTreatmentImplementationStatus: trackerImplementationStatus(row),
    riskTreatmentEffectivenessStatus: textCell(row['Risk Treatment effectiveness status']),
    riskTreatmentEffectivenessVerifiedBy: textCell(row['Risk Treatment effectiveness Verified by']),
    riskTreatmentEffectivenessVerifiedDate: textCell(row['Risk Treatment effectiveness Verified date']),
    riskTreatmentEffectivenessComments: textCell(row['Comments']),
    nextRiskAssessmentDate: textCell(row['Next Risk Assessment Date']),
    category,
    businessUnit: bu,
    account: locationAccount,
    treatment: textCell(row['Proposed Risk Treatment Plan / Mitigation Plan']) || 'Treatment',
    consequence: c0,
    likelihood: l0,
    inherentRiskExposureUsd: null,
    inherentRating,
    residualConsequence: hadResidualNums ? rc : c0,
    residualLikelihood: hadResidualNums ? rl : l0,
    residualRiskExposureUsd: null,
    residualRating,
    identificationDate,
    riskIdentifiedBy: textCell(row['Risk Identified By']),
    owner: textCell(row['Risk Owner']),
    ownerEmail: '',
    riskApprover,
    riskApproverName: '',
    riskApproverEmail: '',
    status,
    riskLifecycleStatus,
    riskStrategy: mapTrackerStrategy(row['Risk Treatment Strategy']),
    targetClosureDate: targetClosure || identificationDate,
    orgFunction: bu,
    controlEffectiveness,
    loggedAt,
  };
}

@Injectable({ providedIn: 'root' })
export class RiskService {
  readonly risks = signal<RiskRecord[]>(buildMockRisks());
  readonly trackerEditMap = signal<TrackerEditMap>(loadStoredTrackerEdits());
  readonly trackerRowsWithKeys = computed(() =>
    ERM_RISK_TRACKER_ROWS.map((row) => applyTrackerEditsWithKey(row, this.trackerEditMap()))
  );
  readonly trackerRows = computed(() =>
    this.trackerRowsWithKeys().map(({ __rowKey: _rowKey, ...row }) => row)
  );

  /** Header toggle: full org vs narrowed to one BU. */
  readonly headerDataMode = signal<HeaderDataMode>('organization');
  readonly headerBusinessUnit = signal<string>(BUSINESS_UNITS[0]);

  /** Dashboard segmented views. */
  readonly dashboardLens = signal<DashboardLens>('enterprise');
  readonly dashboardBuFilter = signal<string>(BUSINESS_UNITS[0]);
  readonly dashboardFunctionFilter = signal<string>(ORG_FUNCTIONS[0]);
  readonly dashboardAccountFilter = signal<string>('ACC-1000');

  /** Distinct business units from mock register + ERM Risk Tracker import. */
  readonly businessUnits = computed(() => {
    const set = new Set<string>([...BUSINESS_UNITS]);
    for (const r of this.risks()) {
      if (r.businessUnit) set.add(r.businessUnit);
    }
    for (const row of this.trackerRows()) {
      const bu = row['Business Unit'];
      if (bu != null && String(bu).trim() !== '') {
        set.add(String(bu).trim());
      }
    }
    for (const row of ACTIVE_PROJECT_ACCOUNT_MAPPINGS) {
      if (row.businessUnit.trim()) {
        set.add(row.businessUnit.trim());
      }
    }
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  });

  /** ERM Risk Tracker rows filtered by header data scope (Business Unit column). */
  readonly headerScopedTrackerRowsWithKeys = computed(() => {
    const rows = this.trackerRowsWithKeys();
    if (this.headerDataMode() === 'organization') {
      return rows;
    }
    const bu = this.headerBusinessUnit().trim();
    return rows.filter((row) => {
      const v = row['Business Unit'];
      if (v === null || v === undefined) return false;
      return String(v).trim() === bu;
    });
  });

  /** ERM Risk Tracker rows filtered by header data scope (Business Unit column). */
  readonly headerScopedTrackerRows = computed(() =>
    this.headerScopedTrackerRowsWithKeys().map(({ __rowKey: _rowKey, ...row }) => row)
  );

  trackerRowKey(row: ErmRiskTrackerRow): string {
    return trackerRowKey(row);
  }

  patchTrackerRow(rowKey: string, values: Partial<Record<ErmRiskTrackerHeader, string>>): void {
    this.trackerEditMap.update((current) => {
      const next = {
        ...current,
        [rowKey]: values,
      };
      persistStoredTrackerEdits(next);
      return next;
    });
  }

  readonly accounts = computed(() => {
    const set = new Set<string>();
    for (const r of this.risks()) {
      if (r.account) set.add(r.account);
    }
    for (const row of ACTIVE_PROJECT_ACCOUNT_MAPPINGS) {
      if (row.account.trim()) set.add(row.account.trim());
    }
    return [...set].sort();
  });

  /** Fixed catalog for the Function lens dropdown (not derived from legacy row values). */
  readonly dashboardOrgFunctionOptions = computed(() => [...ORG_FUNCTIONS]);

  /**
   * Business units available to the Account lens, sourced from the active projects workbook
   * (Column L) plus the app's known BUs.
   */
  readonly dashboardAccountLensBuOptions = computed((): string[] => {
    if (this.dashboardLens() !== 'account') {
      return [];
    }
    const set = new Set<string>([...BUSINESS_UNITS]);
    for (const row of ACTIVE_PROJECT_ACCOUNT_MAPPINGS) {
      if (row.businessUnit.trim()) {
        set.add(row.businessUnit.trim());
      }
    }
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  });

  /** Accounts mapped to the selected BU in the active projects workbook (A→L). */
  readonly dashboardAccountOptionsForBu = computed((): string[] => {
    if (this.dashboardLens() !== 'account') {
      return [];
    }
    const bu = this.dashboardBuFilter().trim();
    const set = new Set<string>();
    for (const row of ACTIVE_PROJECT_ACCOUNT_MAPPINGS) {
      if (row.businessUnit.trim() === bu && row.account.trim()) {
        set.add(row.account.trim());
      }
    }
    if (!set.size) {
      for (const r of this.headerScopedRisks()) {
        if (r.businessUnit === bu && r.account) {
          set.add(r.account);
        }
      }
    }
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  });

  /** Risks after header scope (org vs BU-specific). */
  readonly headerScopedRisks = computed(() => {
    const all = this.risks();
    if (this.headerDataMode() === 'organization') {
      return all;
    }
    const bu = this.headerBusinessUnit();
    return all.filter((r) => r.businessUnit === bu);
  });

  /** Risks shown on the enterprise dashboard (lens + header scope). Matches Enterprise Risks (ERM Risk Tracker only — no mock portfolio). */
  readonly dashboardRisks = computed(() => {
    let list = this.headerScopedTrackerRows()
      .map((row) => riskRecordFromErmTrackerRow(row))
      .filter((r): r is RiskRecord => r != null);
    const lens = this.dashboardLens();
    if (lens === 'business-unit') {
      const bu = this.dashboardBuFilter();
      list = list.filter((r) => r.businessUnit === bu);
    }
    if (lens === 'function') {
      const fn = this.dashboardFunctionFilter();
      list = list.filter((r) => r.orgFunction === fn);
    }
    if (lens === 'account') {
      const acc = this.dashboardAccountFilter();
      const bu = this.dashboardBuFilter();
      list = list.filter((r) => r.account === acc && r.businessUnit === bu);
    }
    return list;
  });

  readonly dashboardStats = computed(() => {
    const list = this.dashboardRisks();
    const total = list.length;
    const open = list.filter((r) => r.status === 'open').length;
    const closed = list.filter((r) => r.status === 'closed').length;
    const openPct = total ? Math.round((open / total) * 1000) / 10 : 0;
    const closedPct = total ? Math.round((closed / total) * 1000) / 10 : 0;
    const exposure = list.reduce((s, r) => s + r.residualRating, 0);
    const avgInherent =
      total === 0
        ? 0
        : Math.round(
            (list.reduce((s, r) => s + r.inherentRating, 0) / total) * 10
          ) / 10;
    const avgResidual =
      total === 0
        ? 0
        : Math.round(
            (list.reduce((s, r) => s + r.residualRating, 0) / total) * 10
          ) / 10;
    const avgControl =
      total === 0
        ? 0
        : Math.round(
            (list.reduce((s, r) => s + r.controlEffectiveness, 0) / total) * 10
          ) / 10;
    return {
      total,
      open,
      closed,
      openPct,
      closedPct,
      exposure,
      avgInherent,
      avgResidual,
      avgControl,
    };
  });

  generateRiskId(): string {
    const existing = new Set(this.risks().map((r) => r.id));
    for (let i = 0; i < 50; i++) {
      const n = Math.floor(10000 + Math.random() * 90000);
      const id = String(n);
      if (!existing.has(id)) {
        return id;
      }
    }
    return String(Date.now()).slice(-5);
  }

  addRisk(row: RiskRecord): void {
    this.risks.update((list) => [row, ...list]);
  }

  /** Insert or replace by risk id (used for draft saves and submit after draft). */
  upsertRisk(row: RiskRecord): void {
    this.risks.update((list) => {
      const i = list.findIndex((r) => r.id === row.id);
      if (i >= 0) {
        const next = [...list];
        next[i] = row;
        return next;
      }
      return [row, ...list];
    });
  }

  setHeaderMode(mode: HeaderDataMode, bu?: string): void {
    this.headerDataMode.set(mode);
    if (bu) {
      this.headerBusinessUnit.set(bu);
    }
  }

  setDashboardLens(lens: DashboardLens): void {
    this.dashboardLens.set(lens);
    if (lens === 'function') {
      this.syncDashboardFunctionFilterToCatalog();
    }
  }

  /**
   * If the stored function filter is not in {@link ORG_FUNCTIONS}, reset to the first catalog entry.
   * Use after catalog changes, on dashboard load, or when switching to the Function lens.
   */
  syncDashboardFunctionFilterToCatalog(): void {
    const opts: readonly string[] = ORG_FUNCTIONS;
    const cur = this.dashboardFunctionFilter();
    if (opts.length && !opts.includes(cur)) {
      this.dashboardFunctionFilter.set(opts[0]!);
    }
  }

  /** Keeps {@link dashboardBuFilter} valid for the Account lens (account + BU filters). */
  syncDashboardBuForAccountLens(): void {
    if (this.dashboardLens() !== 'account') {
      return;
    }
    const opts = this.dashboardAccountLensBuOptions();
    const cur = this.dashboardBuFilter();
    if (opts.length && !opts.includes(cur)) {
      this.dashboardBuFilter.set(opts[0]!);
    }
    this.syncDashboardAccountForAccountLens();
  }

  /** Keeps the selected Account valid for the selected Account-lens BU. */
  syncDashboardAccountForAccountLens(): void {
    if (this.dashboardLens() !== 'account') {
      return;
    }
    const opts = this.dashboardAccountOptionsForBu();
    const cur = this.dashboardAccountFilter();
    if (opts.length && !opts.includes(cur)) {
      this.dashboardAccountFilter.set(opts[0]!);
    }
  }

  setDashboardBu(bu: string): void {
    this.dashboardBuFilter.set(bu);
    this.syncDashboardAccountForAccountLens();
  }

  setDashboardFunction(fn: string): void {
    this.dashboardFunctionFilter.set(fn);
  }

  setDashboardAccount(acc: string): void {
    this.dashboardAccountFilter.set(acc);
    this.syncDashboardBuForAccountLens();
  }
}
