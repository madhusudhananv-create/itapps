import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardSearchParams } from '../models/coo-dashboard-model';

@Injectable({
  providedIn: 'root'
})
export class COODashboardService {
  private apiurl: string;

  constructor(private http: HttpClient) {
    // Remove trailing slash if present to avoid double slashes in URLs
    this.apiurl = environment.webapiuri.replace(/\/$/, '');
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || ''
    });
  }

  /**
   * Get overall account health
   */
  getOverallAccountHealth(params: DashboardSearchParams): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetOverallAccountHealth`,
      params,
      { headers }
    );
  }

  /**
   * Get account overall health for specific period
   * Note: This uses the same endpoint as getOverallAccountHealth
   */
  getAccountOverallHealthForPeriod(
    projectIds: string[],
    startDate: Date,
    endDate: Date
  ): Observable<any> {
    const headers = this.getHeaders();
    const params = {
      PROJ_IDS: projectIds,
      START_DATE: startDate,
      END_DATE: endDate
    };
    return this.http.post<any>(
      `${this.apiurl}/GetOverallAccountHealth`,
      params,
      { headers }
    );
  }

  /**
   * Get early warning signal count
   */
  getEarlyWarningSignalCount(params: DashboardSearchParams): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(
      `${this.apiurl}/GetEarlyWarningSignalCount`,
      params,
      { headers }
    );
  }

  /**
   * Get overall health index
   */
  getOverallHealthIndex(params: DashboardSearchParams): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(
      `${this.apiurl}/GetOverallHealthIndex`,
      params,
      { headers }
    );
  }

  /**
   * Get success goal score
   */
  getSuccessGoalScore(
    projectIds: string[],
    startDate: Date,
    endDate: Date
  ): Observable<number> {
    const headers = this.getHeaders();
    const params = {
      PROJ_IDS: projectIds,
      START_DATE: startDate,
      END_DATE: endDate
    };
    return this.http.post<number>(
      `${this.apiurl}/GetSuccessGoalScore`,
      params,
      { headers }
    );
  }

  /**
   * Get KPI perspectives
   */
  getKPIPerspectives(
    projectIds: string[],
    startDate: Date,
    endDate: Date
  ): Observable<any> {
    const headers = this.getHeaders();
    const params = {
      PROJ_IDS: projectIds,
      START_DATE: startDate,
      END_DATE: endDate
    };
    return this.http.post<any>(
      `${this.apiurl}/GetKPIPerspectives`,
      params,
      { headers }
    );
  }

  /**
   * Get CSS table for projects
   */
  getCSSTableForProjects(
    projectIds: string[],
    startDate: Date,
    endDate: Date
  ): Observable<any> {
    const headers = this.getHeaders();
    const params = {
      PROJ_IDS: projectIds,
      START_DATE: startDate,
      END_DATE: endDate
    };
    return this.http.post<any>(
      `${this.apiurl}/GetCSSTableForProjects`,
      params,
      { headers }
    );
  }

  /**
   * Get CSS NPS score for projects
   */
  getCSSNPSScoreForProjects(
    projectIds: string[],
    startDate: Date,
    endDate: Date
  ): Observable<number> {
    const headers = this.getHeaders();
    const params = {
      PROJ_IDS: projectIds,
      START_DATE: startDate,
      END_DATE: endDate
    };
    return this.http.post<number>(
      `${this.apiurl}/GetCSSNPSScoreForProjects`,
      params,
      { headers }
    );
  }

  /**
   * Get overall health index trend
   */
  getOverallHealthIndexTrend(
    projectIds: string[],
    startDate: Date,
    endDate: Date
  ): Observable<any[]> {
    const headers = this.getHeaders();
    const params = {
      PROJ_IDS: projectIds,
      START_DATE: startDate,
      END_DATE: endDate
    };
    return this.http.post<any[]>(
      `${this.apiurl}/GetOverallHealthIndexTrend`,
      params,
      { headers }
    );
  }
}
