import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { resolveWebApiUri } from '../utils/api-base.util';
import { ReportRow, AssessmentStatus, DueStatus } from '../models/maturity.model';

const SP_DISPLAY_NAME = 'IT Ops Maturity - Domain Assessment Report';
const LOG_PREFIX = 'IT Ops Maturity Dashboard [Report]:';

interface ReportSpDetail {
  id: number;
  sP_NAME?: string;
  SP_NAME?: string;
  sP_DISPLAY_NAME?: string;
  SP_DISPLAY_NAME?: string;
  ID?: number;
}

interface ReportSpParam {
  id?: number;
  ID?: number;
  reporT_SP_ID?: number;
  REPORT_SP_ID?: number;
  paraM_NAME?: string;
  PARAM_NAME?: string;
  paraM_TYPE?: string;
  PARAM_TYPE?: string;
  paraM_VALUE?: string | null;
  PARAM_VALUE?: string | null;
}

function readSpName(d: ReportSpDetail): string {
  return d.sP_NAME ?? d.SP_NAME ?? '';
}

function readSpDisplayName(d: ReportSpDetail): string {
  return d.sP_DISPLAY_NAME ?? d.SP_DISPLAY_NAME ?? '';
}

function readSpId(d: ReportSpDetail): number {
  return d.id ?? d.ID ?? 0;
}

function setParamValue(p: ReportSpParam, value: string): ReportSpParam {
  const updated = { ...p };
  if ('paraM_VALUE' in updated) updated.paraM_VALUE = value;
  if ('PARAM_VALUE' in updated) updated.PARAM_VALUE = value;
  return updated;
}

/** Reads a raw SP result-row field, tolerating whatever casing Json.NET's camelCase
 * naming strategy produces for a plain (non-acronym) alias - e.g. "AverageScore"
 * always becomes "averageScore", never "AVERAGESCORE" or similar - but this stays
 * defensive against either casing since the exact serializer behavior for
 * DataTable rows (as opposed to typed DTOs) isn't guaranteed here. */
function read(row: any, ...keys: string[]): any {
  for (const key of keys) {
    if (row[key] !== undefined) return row[key];
  }
  return undefined;
}

function toAssessmentStatus(value: any): AssessmentStatus {
  return value === 'Suspended' || value === 'Closed' ? value : 'Open';
}

function toDueStatus(value: any): DueStatus {
  return value === 'Past Due' || value === 'On Target' ? value : null;
}

function toBool(value: any): boolean {
  return value === true || value === 1 || value === '1';
}

function toNumber(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toNullableNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toIsoOrNull(value: any): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function mapRow(row: any): ReportRow {
  return {
    accountName: read(row, 'account', 'Account') ?? '',
    businessUnit: read(row, 'businessUnit', 'BusinessUnit') ?? 'Unknown',
    domainId: String(read(row, 'domainId', 'DomainId') ?? read(row, 'domainCode', 'DomainCode') ?? ''),
    domainName: read(row, 'domainName', 'DomainName') ?? '',
    coeSpoc: read(row, 'coeSpoc', 'CoeSpoc') ?? '',
    reviewer: read(row, 'reviewer', 'Reviewer') ?? '',
    coeSpocEmail: read(row, 'coeSpocEmail', 'CoeSpocEmail') ?? undefined,
    reviewerEmail: read(row, 'reviewerEmail', 'ReviewerEmail') ?? undefined,
    assessmentStatus: toAssessmentStatus(read(row, 'assessmentStatus', 'AssessmentStatus')),
    dueStatus: toDueStatus(read(row, 'dueStatus', 'DueStatus')),
    targetDate: toIsoOrNull(read(row, 'targetDate', 'TargetDate')),
    lastUpdated: toIsoOrNull(read(row, 'lastUpdated', 'LastUpdated')) ?? new Date().toISOString(),
    daysSinceUpdate: toNumber(read(row, 'daysSinceUpdate', 'DaysSinceUpdate')),
    draftOver15Days: toBool(read(row, 'draftOver15Days', 'DraftOver15Days')),
    draftOver30Days: toBool(read(row, 'draftOver30Days', 'DraftOver30Days')),
    noManagementUpdate: toBool(read(row, 'noManagementUpdate', 'NoManagementUpdate')),
    longDated: toBool(read(row, 'longDated', 'LongDated')),
    findingsAccepted: toNumber(read(row, 'findingsAccepted', 'FindingsAccepted')),
    findingsRejected: toNumber(read(row, 'findingsRejected', 'FindingsRejected')),
    findingsPending: toNumber(read(row, 'findingsPending', 'FindingsPending')),
    averageScore: toNullableNumber(read(row, 'averageScore', 'AverageScore')),
    maturityPercent: toNullableNumber(read(row, 'maturityPercent', 'MaturityPercent')),
  };
}

/**
 * Real backend data for the Reports page - follows the same resolve-params-
 * then-execute pattern every other CSM report uses (AllSysController's
 * GetAllSps/GetSpParams/GetSpData), but against this module's own dedicated
 * GetITOpsReportSps/GetITOpsReportParams/GetITOpsReportData endpoints and its
 * own ITOPS_REPORT_SP_DETAILS/ITOPS_REPORT_PARAMS tables (see
 * ITOperationMaturity_Report_Tables.sql/_Report_SP.sql), kept isolated from
 * the shared/global reporting tables instead of the CSV-backed MaturityMockService.
 */
@Injectable({ providedIn: 'root' })
export class ItOpsReportApiService {
  private readonly apiurl = resolveWebApiUri();

  constructor(private http: HttpClient) {}

  private getHeaders(extra?: Record<string, string>): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
      ...extra,
    });
  }

  getReportRows(): Observable<ReportRow[]> {
    return this.http.get<ReportSpDetail[]>(`${this.apiurl}GetITOpsReportSps`, { headers: this.getHeaders() }).pipe(
      switchMap((sps) => {
        const detail = (sps ?? []).find((d) => readSpDisplayName(d) === SP_DISPLAY_NAME);
        if (!detail) {
          console.error(`${LOG_PREFIX} "${SP_DISPLAY_NAME}" is not registered in ITOPS_REPORT_SP_DETAILS - run ITOperationMaturity_Report_Tables.sql then _Report_SP.sql.`);
          return of([]);
        }
        return this.http
          .get<ReportSpParam[]>(`${this.apiurl}GetITOpsReportParams?spId=${readSpId(detail)}`, { headers: this.getHeaders() })
          .pipe(
            switchMap((params) => {
              const filledParams = (params ?? []).map((p) => setParamValue(p, '-1'));
              return this.http.post<any[]>(`${this.apiurl}GetITOpsReportData`, filledParams, {
                headers: this.getHeaders({ spname: readSpName(detail) }),
              });
            }),
          );
      }),
      map((rows) => (rows ?? []).map(mapRow)),
      catchError((err) => {
        console.error(`${LOG_PREFIX} Failed to load report data`, err);
        return of([]);
      }),
    );
  }
}
