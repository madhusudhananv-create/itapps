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
  fileSizeBytes: number;
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

  getDomainTracker(custId: string): Observable<ItOpsDomainTrackerRow[]> {
    return this.http.get<ItOpsDomainTrackerRow[]>(
      `${this.apiurl}GetITOpsDomainTracker?custId=${encodeURIComponent(custId)}`,
      { headers: this.getHeaders() },
    );
  }

  getExecutiveSummary(custId: string): Observable<ItOpsExecutiveDashboard> {
    return this.http.get<ItOpsExecutiveDashboard>(
      `${this.apiurl}GetITOpsExecutiveSummary?custId=${encodeURIComponent(custId)}`,
      { headers: this.getHeaders() },
    );
  }

  getTopRisks(custId: string, take = 100): Observable<ItOpsTopRiskRow[]> {
    return this.http.get<ItOpsTopRiskRow[]>(
      `${this.apiurl}GetITOpsTopRisks?custId=${encodeURIComponent(custId)}&take=${take}`,
      { headers: this.getHeaders() },
    );
  }

  getOrCreateAssessment(domainCode: string, custId: string): Observable<ItOpsAssessmentInfo> {
    return this.http.get<ItOpsAssessmentInfo>(
      `${this.apiurl}GetOrCreateITOpsAssessment?domainCode=${encodeURIComponent(domainCode)}&custId=${encodeURIComponent(custId)}`,
      { headers: this.getHeaders() },
    );
  }

  getAssessmentParameters(assessmentId: number): Observable<ItOpsParameterScoreRow[]> {
    return this.http.get<ItOpsParameterScoreRow[]>(
      `${this.apiurl}GetITOpsAssessmentParameters?assessmentId=${assessmentId}`,
      { headers: this.getHeaders() },
    );
  }

  upsertScore(assessmentId: number, parameterId: number, scoreValue: number | null, notes: string): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}UpsertITOpsScore`,
      { AssessmentId: assessmentId, ParameterId: parameterId, ScoreValue: scoreValue, Notes: notes },
      { headers: this.getHeaders() },
    );
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
