/**
 * Charts Service
 * Migrated from Angular 6 to Angular 19
 * 
 * Provides chart data, highlights, and notes for the CSM dashboard
 * 
 * Migration Changes:
 * - Updated to Angular 19 inject() pattern
 * - Removed RxJS 'add' imports (deprecated)
 * - Updated Observable imports from 'rxjs'
 * - Added proper type annotations
 * - Modernized HTTP headers
 * - Added error handling
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Model imports
import { HighlightsModel } from '../models/highlights-model';
import { ChartsModel } from '../models/charts-model';

// TODO: Migrate these models when needed
// import { Notes } from '../models/notes';
// import { CustomerProjectsListModel } from '../models/customer-projects-model';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  private http = inject(HttpClient);
  private apiurl: string = environment.webapiuri;
  private apiurl_auth: string = environment.webapiuri_auth;

  /**
   * Create HTTP headers with authentication token
   * @param token - Authentication token
   * @returns HttpHeaders with token and empId
   */
  private getHeaders(token?: string): HttpHeaders {
    const authToken = token || localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': authToken,
      'empId': empId
    });
  }

  /**
   * Get notes for a customer
   * @param customerId - Customer ID
   * @param token - Optional authentication token
   */
  getNotesForCustomer(customerId: string, token?: string): Observable<any[]> {
    const headers = this.getHeaders(token);
    return this.http.get<any[]>(
      `${this.apiurl}/GetNotesForCustomer?CustomerId=${customerId}`,
      { headers }
    );
  }

  /**
   * Get highlights for customer and project
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param token - Optional authentication token
   */
  getHighlights(customerId: string, projectId: string, token?: string): Observable<HighlightsModel[]> {
    const headers = this.getHeaders(token);
    return this.http.get<HighlightsModel[]>(
      `${this.apiurl}/GetHighlights?CustomerId=${customerId}&ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Get highlights by date range
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param date - Current date
   * @param period - Period filter
   * @param token - Optional authentication token
   */
  getHighlightsByDate(
    customerId: string,
    projectId: string,
    date: Date | string,
    period: string,
    token?: string
  ): Observable<HighlightsModel[]> {
    const headers = this.getHeaders(token);
    return this.http.get<HighlightsModel[]>(
      `${this.apiurl}/GetHighlightsByDate?CustomerId=${customerId}&ProjectId=${projectId}&CurrentDate=${date}&Period=${period}`,
      { headers }
    );
  }

  /**
   * Get charts data for customer and project
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param date - Current date
   * @param period - Period filter
   * @param token - Optional authentication token
   */
  getCharts(
    customerId: any,
    projectId: any,
    date: Date,
    period: string,
    token?: string
  ): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get<any>(
      `${this.apiurl}/GetCharts?CustomerId=${customerId}&ProjectId=${projectId}&CurrentDate=${date.toDateString()}&Period=${period}`,
      { headers }
    );
  }

  /**
   * Get risk chart data
   * @param riskDashboardInputs - Risk dashboard input parameters
   * @param token - Optional authentication token
   */
  getRiskChart(riskDashboardInputs: any, token?: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.post<any>(
      `${this.apiurl}/GetRiskChartData`,
      riskDashboardInputs,
      { headers }
    );
  }

  /**
   * Get success goal and KPI details
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param date - Current date
   * @param period - Period filter
   * @param token - Optional authentication token
   */
  getGoalDetails(
    customerId: string,
    projectId: string,
    date: Date,
    period: string,
    token?: string
  ): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get<any>(
      `${this.apiurl}/GetSuccessGoalAndKPIDetails?CustomerId=${customerId}&ProjectId=${projectId}&CurrentDate=${date.toDateString()}&Period=${period}`,
      { headers }
    );
  }

  /**
   * Get trend high chart details
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param date - Current date
   * @param token - Optional authentication token
   */
  getTrendHighChartDetails(
    customerId: string,
    projectId: string,
    date: Date,
    token?: string
  ): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get<any>(
      `${this.apiurl}/GetTrendHighChartsGroup?CustomerId=${customerId}&ProjectId=${projectId}&CurrentDate=${date.toDateString()}`,
      { headers }
    );
  }

  /**
   * Get trend high chart details for product KPI
   * @param customerId - Customer ID
   * @param prodId - Product ID
   * @param date - Current date
   * @param token - Optional authentication token
   * @param viewBy - View by filter
   */
  getTrendHighChartDetailsForProductKPI(
    customerId: string,
    prodId: string,
    date: Date,
    token: string,
    viewBy: string
  ): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get<any>(
      `${this.apiurl}/GetTrendHighChartsGroupForProduct?customerId=${customerId}&prodId=${prodId}&CurrentDate=${date.toDateString()}&viewBy=${viewBy}`,
      { headers }
    );
  }

  /**
   * Get trend high chart details for portfolio
   * @param customerId - Customer ID
   * @param portId - Portfolio ID
   * @param kpiName - KPI name
   * @param date - Current date
   * @param token - Optional authentication token
   * @param viewBy - View by filter
   */
  getTrendHighChartDetailsForPortfolio(
    customerId: string,
    portId: string,
    kpiName: string,
    date: Date,
    token: string,
    viewBy: string
  ): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get<any>(
      `${this.apiurl}/GetTrendHighChartDetailsForPortfolio?customerId=${customerId}&portId=${portId}&kpiName=${kpiName}&CurrentDate=${date.toDateString()}&viewBy=${viewBy}`,
      { headers }
    );
  }

  /**
   * Get trend high chart details for engagement
   * @param customerId - Customer ID
   * @param kpiName - KPI name
   * @param date - Current date
   * @param token - Optional authentication token
   * @param viewBy - View by filter
   */
  getTrendHighChartDetailsForEngagement(
    customerId: string,
    kpiName: string,
    date: Date,
    token: string,
    viewBy: string
  ): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get<any>(
      `${this.apiurl}/GetTrendHighChartDetailsForEngagement?customerId=${customerId}&kpiName=${kpiName}&currentDate=${date.toDateString()}&viewBy=${viewBy}`,
      { headers }
    );
  }

  /**
   * Get table data
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param date - Current date
   * @param period - Period filter
   * @param token - Optional authentication token
   */
  getTable(
    customerId: string,
    projectId: string,
    date: Date | string,
    period: string,
    token?: string
  ): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get<any>(
      `${this.apiurl}/GetTable?CustomerId=${customerId}&ProjectId=${projectId}&CurrentDate=${date}&Period=${period}`,
      { headers }
    );
  }

  /**
   * Get table data for success goals grouped by various criteria
   * @param selGroupBy - Group by selection (1=ServiceTower, 2=Table, 3=KPI)
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param date - Current date
   * @param period - Period filter
   * @param selServiceTower - Service tower ID
   * @param token - Optional authentication token
   */
  getTableSuccess(
    selGroupBy: string,
    customerId: string,
    projectId: string,
    date: Date | string,
    period: string,
    selServiceTower: string,
    token?: string
  ): Observable<any> {
    const headers = this.getHeaders(token);
    
    let endpoint = '';
    if (selGroupBy === '1') {
      endpoint = `/GetSuccessGoalsGroupByServiceTower?CustomerId=${customerId}&ProjectId=${projectId}&CurrentDate=${date}&Period=${period}&serviceTowerId=${selServiceTower}`;
    } else if (selGroupBy === '3') {
      endpoint = `/GetSuccessGoalsGroupByKPI?CustomerId=${customerId}&ProjectId=${projectId}&CurrentDate=${date}&Period=${period}&serviceTowerId=${selServiceTower}`;
    } else if (selGroupBy === '2') {
      endpoint = `/GetTable?CustomerId=${customerId}&ProjectId=${projectId}&CurrentDate=${date}&Period=${period}&serviceTowerId=${selServiceTower}`;
    }
    
    return this.http.get<any>(`${this.apiurl}${endpoint}`, { headers });
  }

  /**
   * Get tagged customer IDs for an employee
   * @param empId - Employee ID
   * @param token - Optional authentication token
   */
  getTaggedCustomerIds(empId: string, token?: string): Observable<string[]> {
    const headers = this.getHeaders(token);
    return this.http.get<string[]>(
      `${this.apiurl}/GetTaggedCustomerIds?EmpId=${empId}`,
      { headers }
    );
  }

  /**
   * Get customer ID for an employee
   * @param empId - Employee ID
   * @param token - Optional authentication token
   */
  getCustomerId(empId: string, token?: string): Observable<string[]> {
    const headers = this.getHeaders(token);
    return this.http.get<string[]>(
      `${this.apiurl}/GetCustomerIdOfACustomer?EmpId=${empId}`,
      { headers }
    );
  }

  /**
   * Get all customer IDs
   * @param token - Optional authentication token
   */
  getAllCustomerIds(token?: string): Observable<string[]> {
    const headers = this.getHeaders(token);
    return this.http.get<string[]>(
      `${this.apiurl}/GetAllCustomerIds`,
      { headers }
    );
  }

  /**
   * Get customer projects list
   * @param empId - Employee ID
   * @param token - Optional authentication token
   * @param allProj - Include all projects flag
   */
  getCustomerProjectsList(empId: string, token: string, allProj: boolean): Observable<any[]> {
    const headers = this.getHeaders(token);
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerProjectList?EmpId=${empId}&AllProj=${allProj}`,
      { headers }
    );
  }
}

