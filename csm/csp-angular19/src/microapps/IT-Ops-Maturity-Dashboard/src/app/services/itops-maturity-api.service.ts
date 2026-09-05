import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveWebApiUri } from '../utils/api-base.util';

export interface ItOpsDomainListRow {
  domainId: number;
  code: string;
  name: string;
  minRequiredScore: number | null;
}

/** One row per assessment the logged-in employee is personally assigned to (GetITOpsMyAssignments). */
export interface ItOpsMyAssignmentRow {
  assessmentId: number;
  assessmentMasterId: number;
  cycleLabel: string | null;
  domainId: number;
  domainCode: string | null;
  domainName: string | null;
  projectId: string | null;
  projectName: string | null;
  custId: string | null;
  accountName: string | null;
  status: string;
  /** Subset of 'Assessor' | 'Reviewer' | 'Assessee' - the roles THIS employee holds on THIS assessment. */
  roles: string[];
}

export interface ItOpsAssessmentInfo {
  assessmentId: number;
  domainId: number;
  domainCode: string;
  domainName: string;
  custId: string;
  coeSpocEmpId: string | null;
  coeSpocName: string | null;
  reviewerEmpId: string | null;
  reviewerName: string | null;
  assesseeEmpId: string | null;
  status: string;
  returnComment: string | null;
}

export interface ItOpsDomainTrackerRow {
  assessmentId: number;
  domainId: number;
  domainCode: string;
  domainName: string;
  coeSpocEmpId: string | null;
  coeSpocName: string | null;
  reviewerEmpId: string | null;
  reviewerName: string | null;
  status: string;
  paramCount: number;
  sumScores: number;
  maxPossible: number;
  averageScore: number | null;
  maturityPercent: number | null;
  maturityLevel: string | null;
}

export interface ItOpsExecutiveDashboard {
  sumOfScores: number;
  maxPossibleScore: number;
  averageScore: number | null;
  maturityPercent: number | null;
  maturityLevel: string | null;
  domainsCompleted: number;
  domainsInProgress: number;
  domainsNotStarted: number;
}

export interface ItOpsTopRiskRow {
  domainName: string;
  category: string;
  parameterName: string;
  currentScore: number | null;
  gap: number;
  recommendedAction: string | null;
}

export interface ItOpsParameterScoreRow {
  parameterId: number;
  category: string;
  parameterName: string;
  definition: string;
  level1_AdHoc: string;
  level2_Developing: string;
  level3_Defined: string;
  level4_Managed: string;
  level5_Optimized: string;
  minRequiredScore: number | null;
  scoreId: number | null;
  scoreValue: number | null;
  notes: string | null;
  findingId: number | null;
  findingStatus: string | null;
  findingRejectionComment: string | null;
  findingActionTaken: string | null;
}

export interface ItOpsEvidenceRow {
  id: number;
  fileName: string;
  contentType: string | null;
  createdDate: string;
}

/**
 * Real backend calls for the IT Ops Maturity COE SPOC assessment flow, backed
 * by ITOperationMaturityController in GAVS.AllocationSystem.WebApi (SQL Server) -
 * replaces the CSV-derived MaturityMockService for this flow.
 */
@Injectable({ providedIn: 'root' })
export class ItOpsMaturityApiService {
  private readonly apiurl = resolveWebApiUri();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
    });
  }

  getDomainList(): Observable<ItOpsDomainListRow[]> {
    return this.http.get<ItOpsDomainListRow[]>(`${this.apiurl}GetITOpsDomainList`, { headers: this.getHeaders() });
  }

  /**
   * The landing page's "My Assignments" list - every assessment this employee
   * is personally on as Assessor / Reviewer / Assessee, one row per assessment.
   */
  getMyAssignments(empId: string): Observable<ItOpsMyAssignmentRow[]> {
    return this.http.get<ItOpsMyAssignmentRow[]>(
      `${this.apiurl}GetITOpsMyAssignments?empId=${encodeURIComponent(empId)}`,
      { headers: this.getHeaders() },
    );
  }

  getDomainTracker(custId: string, projectId?: string, assessmentMasterId?: number): Observable<ItOpsDomainTrackerRow[]> {
    const projectParam = projectId ? `&projectId=${encodeURIComponent(projectId)}` : '';
    const cycleParam = assessmentMasterId ? `&assessmentMasterId=${assessmentMasterId}` : '';
    return this.http.get<ItOpsDomainTrackerRow[]>(
      `${this.apiurl}GetITOpsDomainTracker?custId=${encodeURIComponent(custId)}${projectParam}${cycleParam}`,
      { headers: this.getHeaders() },
    );
  }

  /** Dashboard's account picker: only accounts that actually have an IT Ops assessment (a cycle has run against one of their projects), not every CSM customer. Narrowed to one cycle when given. */
  getAccountsWithAssessments(assessmentMasterId?: number): Observable<{ cusT_ID: string; cusT_NM: string }[]> {
    const cycleParam = assessmentMasterId ? `?assessmentMasterId=${assessmentMasterId}` : '';
    return this.http.get<{ cusT_ID: string; cusT_NM: string }[]>(
      `${this.apiurl}GetITOpsAccountsWithAssessments${cycleParam}`,
      { headers: this.getHeaders() },
    );
  }

  /** Dashboard's project picker, once an account is chosen: only that account's projects that have an assessment, narrowed to one cycle when given. */
  getProjectsWithAssessments(custId: string, assessmentMasterId?: number): Observable<{ projectId: string; projectName: string }[]> {
    const cycleParam = assessmentMasterId ? `&assessmentMasterId=${assessmentMasterId}` : '';
    return this.http.get<{ projectId: string; projectName: string }[]>(
      `${this.apiurl}GetITOpsProjectsWithAssessments?custId=${encodeURIComponent(custId)}${cycleParam}`,
      { headers: this.getHeaders() },
    );
  }

  /** Dashboard's Cycle dropdown - every assessment cycle, newest first. */
  getCycleList(): Observable<{ id: number; cycleLabel: string; status: string }[]> {
    return this.http.get<{ id: number; cycleLabel: string; status: string }[]>(
      `${this.apiurl}GetITOpsCycleList`,
      { headers: this.getHeaders() },
    );
  }

  /** Whether this employee has been granted the Dashboard Viewer role (Configure Roles) - the account/project-wide Dashboard is locked behind this, separate from ordinary module access. */
  getHasDashboardAccess(empId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiurl}GetITOpsHasDashboardAccess?empId=${encodeURIComponent(empId)}`,
      { headers: this.getHeaders() },
    );
  }

  getExecutiveSummary(custId: string): Observable<ItOpsExecutiveDashboard> {
    return this.http.get<ItOpsExecutiveDashboard>(
      `${this.apiurl}GetITOpsExecutiveSummary?custId=${encodeURIComponent(custId)}`,
      { headers: this.getHeaders() },
    );
  }

  getTopRisks(custId: string, take = 100, projectId?: string, assessmentMasterId?: number): Observable<ItOpsTopRiskRow[]> {
    const projectParam = projectId ? `&projectId=${encodeURIComponent(projectId)}` : '';
    const cycleParam = assessmentMasterId ? `&assessmentMasterId=${assessmentMasterId}` : '';
    return this.http.get<ItOpsTopRiskRow[]>(
      `${this.apiurl}GetITOpsTopRisks?custId=${encodeURIComponent(custId)}&take=${take}${projectParam}${cycleParam}`,
      { headers: this.getHeaders() },
    );
  }

  /**
   * `assessmentId`, when known (from "My Assignments", where each row already
   * carries the exact assessment it represents), opens that assessment
   * specifically - otherwise this resolves/creates the domain+account's
   * assessment in whichever cycle is currently open, which is ambiguous once
   * more than one project/cycle exists for the same domain+account.
   */
  getOrCreateAssessment(domainCode: string, custId: string, assessmentId?: number): Observable<ItOpsAssessmentInfo> {
    const idParam = assessmentId ? `&assessmentId=${assessmentId}` : '';
    return this.http.get<ItOpsAssessmentInfo>(
      `${this.apiurl}GetOrCreateITOpsAssessment?domainCode=${encodeURIComponent(domainCode)}&custId=${encodeURIComponent(custId)}${idParam}`,
      { headers: this.getHeaders() },
    );
  }

  getAssessmentParameters(assessmentId: number): Observable<ItOpsParameterScoreRow[]> {
    return this.http.get<ItOpsParameterScoreRow[]>(
      `${this.apiurl}GetITOpsAssessmentParameters?assessmentId=${assessmentId}`,
      { headers: this.getHeaders() },
    );
  }

  /** Returns the saved score row (including its id) - callers that need the id for evidence upload should use this response rather than assuming one already exists. */
  upsertScore(assessmentId: number, parameterId: number, scoreValue: number | null, notes: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(
      `${this.apiurl}UpsertITOpsScore`,
      { AssessmentId: assessmentId, ParameterId: parameterId, ScoreValue: scoreValue, Notes: notes },
      { headers: this.getHeaders() },
    );
  }

  // ---- Evidence (per-parameter score, and per-finding - both key off SCORE_ID server-side) ----

  getScoreEvidence(scoreId: number): Observable<ItOpsEvidenceRow[]> {
    return this.http.get<ItOpsEvidenceRow[]>(`${this.apiurl}GetITOpsScoreEvidence?scoreId=${scoreId}`, {
      headers: this.getHeaders(),
    });
  }

  /** Multipart upload, same mechanism as CAPA audit evidence (saved via the shared FILE_DATA table server-side). */
  uploadScoreEvidence(scoreId: number, file: File): Observable<ItOpsEvidenceRow[]> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const headers = new HttpHeaders({
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
      // No Content-Type here - HttpClient/the browser set the multipart boundary automatically for FormData.
    });
    return this.http.post<ItOpsEvidenceRow[]>(`${this.apiurl}UploadITOpsScoreEvidence?scoreId=${scoreId}`, formData, { headers });
  }

  deleteEvidence(evidenceId: number): Observable<unknown> {
    return this.http.post(`${this.apiurl}DeleteITOpsEvidence?evidenceId=${evidenceId}`, null, { headers: this.getHeaders() });
  }

  /** Downloads and saves the file client-side (the endpoint needs the same token/empId headers as every other call, so a plain <a href> can't hit it directly). */
  downloadEvidence(evidenceId: number, fileName: string): void {
    this.http
      .get(`${this.apiurl}DownloadITOpsEvidence?evidenceId=${evidenceId}`, { headers: this.getHeaders(), responseType: 'blob' })
      .subscribe((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'evidence';
        link.click();
        URL.revokeObjectURL(url);
      });
  }

  saveDraft(assessmentId: number): Observable<unknown> {
    return this.http.post(`${this.apiurl}SaveITOpsAssessmentDraft?assessmentId=${assessmentId}`, null, {
      headers: this.getHeaders(),
    });
  }

  submitAssessment(assessmentId: number): Observable<unknown> {
    return this.http.post(`${this.apiurl}SubmitITOpsAssessment?assessmentId=${assessmentId}`, null, {
      headers: this.getHeaders(),
    });
  }

  /** US-005: Reviewer approves the assessment, or returns it for revision (Comment mandatory on return). */
  reviewAssessment(assessmentId: number, approve: boolean, comment?: string): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}ReviewITOpsAssessment?assessmentId=${assessmentId}`,
      { Approve: approve, Comment: comment ?? null },
      { headers: this.getHeaders() },
    );
  }

  /** Assessee accepts/rejects a probable-improvement-area finding; Comment is mandatory when rejecting. */
  decideFinding(findingId: number, accept: boolean, comment?: string): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}DecideITOpsFinding?findingId=${findingId}`,
      { Accept: accept, Comment: comment ?? null },
      { headers: this.getHeaders() },
    );
  }

  /** Assessee records/updates remediation progress on an accepted finding - can be called repeatedly. */
  updateFindingAction(findingId: number, actionTaken: string): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}UpdateITOpsFindingAction?findingId=${findingId}`,
      { ActionTaken: actionTaken },
      { headers: this.getHeaders() },
    );
  }

  getFindingEvidence(findingId: number): Observable<ItOpsEvidenceRow[]> {
    return this.http.get<ItOpsEvidenceRow[]>(`${this.apiurl}GetITOpsFindingEvidence?findingId=${findingId}`, {
      headers: this.getHeaders(),
    });
  }

  /** Multipart upload - no Content-Type header, the browser sets the multipart boundary itself. */
  uploadFindingEvidence(findingId: number, files: File[]): Observable<ItOpsEvidenceRow[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return this.http.post<ItOpsEvidenceRow[]>(`${this.apiurl}UploadITOpsFindingEvidence?findingId=${findingId}`, formData, {
      headers: new HttpHeaders({
        token: localStorage.getItem('token') || '',
        empId: localStorage.getItem('empid') || '',
      }),
    });
  }

  evidenceDownloadUrl(evidenceId: number): string {
    return `${this.apiurl}DownloadITOpsEvidence?evidenceId=${evidenceId}`;
  }
}
