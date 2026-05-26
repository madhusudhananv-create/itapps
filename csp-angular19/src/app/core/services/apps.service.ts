import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// Import models
import type { 
  AppAccessControlsModel, 
  AppControlFeaturesModel,
  AccessRequestModel
} from '../../models/access-control.model';
import type { DashboardDetailsModel } from '../../models/dashboard-details.model';
import type { PortfolioModel, ProjectModelNew, ProductModelNew } from '../../models/portfolio.model';
import type { SqaChartParamsModel } from '../../models/sqa-project-reports-model';
import type { ScopeModel, modelRow, projectScopes } from '../../models/scope.model';
import { ServiceAreaModelNew } from '../../models/service-area.model';
import { ServiceTowersProjectMappingModel } from '../models/service-area-project-mapping-model';
import type { ProcessModel, ProcessDataModel } from '../../models/process-model';
import type { DeliveryDetailsModel } from '../../models/delivery-model';
import type { FeedbackModel } from '../models/feedback-model';
import { enumDateRange } from '../../shared/enum';
import { ChecklistExecutionViewModel, ChecklistNew, ProcessAreaModelNew, ProcessServiceAreaMapping, ProcessServiceAreaMappingList } from '../models/audit-checklist-based-model';
import { ProjectResourceByEmpIdModel } from '../../models/emp-info-model';
import { MyUtility } from '../../shared/my-utility';

// Re-export ServiceAreaModelNew for other components
export { ServiceAreaModelNew } from '../../models/service-area.model';

/**
 * AppsService - Main HTTP Communication Service
 * Migrated from Angular 6 to Angular 19
 * 
 * This service handles ALL API communication for the CSM application.
 * Contains ~200+ API methods for various modules.
 * 
 * Migration Changes:
 * - Updated to use HttpClient (already using in legacy)
 * - Added providedIn: 'root' for tree-shakeable providers
 * - Using inject() function for modern dependency injection
 * - RxJS operators already using pipeable style in legacy
 */
@Injectable({
  providedIn: 'root' // Tree-shakeable provider
})
export class AppsService {
  private http = inject(HttpClient);
  private _util = inject(MyUtility);
  
  // API URLs from environment
  private apiurl: string = environment.webapiuri || '';
  private apiurl_auth: string = environment.webapiuri_auth || '';

  // Feature flags
  KpiCalledFromNewDashboard: boolean = false;

  /**
   * Helper method to create HTTP headers with authentication
   */
  private getHeaders(token?: string): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': token || localStorage.getItem('token') || '',
      'Content-Type': 'application/json'
    });
  }

  constructor() {
    // No parameters needed - using inject() for dependencies
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get authorization headers with token
   * @returns HttpHeaders with token
   */
  private getAuthHeaders(): HttpHeaders {
    // DEBUG: Get ALL localStorage data for inspection
    const allLocalStorageData: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allLocalStorageData[key] = localStorage.getItem(key);
      }
    }
    
    const token = localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    
    // DEBUG: Log token status for troubleshooting
    if (!token || token === '') {
      console.error('⚠️ getAuthHeaders() called but token is empty!', {
        hasToken: !!token,
        tokenValue: token,
        hasEmpId: !!empId,
        empId: empId,
        localStorageKeys: Object.keys(allLocalStorageData),
        localStorageCount: localStorage.length,
        fullLocalStorage: allLocalStorageData,
        stackTrace: new Error().stack
      });
    }
    
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      'empId': empId
    });
  }

  /**
   * Get authorization headers with draft status
   * Used for KPI save operations to indicate draft vs submitted status
   * @param status - Draft status (0 = submitted, 1 = draft)
   * @returns HttpHeaders with token and isDraft flag
   */
  private getAuthHeadersWithDraft(status: number): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      'empId': empId,
      'isDraft': status.toString()
    });
  }

  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  /**
   * Forgot Password - Send reset email
   * @param emailid User email address
   */
  forgotPassword(emailid: string): Observable<any> {
    return this.http.get(
      `${this.apiurl_auth}/PasswordForgot?EmailId=${emailid}`
    );
  }

  /**
   * Authenticate with token
   * @param token Authentication token
   */
  authenticatewithtoken(token: string): Observable<any> {
    return this.http.get(
      `${this.apiurl_auth}/AuthenticateToken?Token=${token}`,
      { observe: 'response' }
    );
  }

  /**
   * Set new password
   * @param authdata Authentication data with new password
   */
  setPassword(authdata: any): Observable<any> {
    return this.http.post(`${this.apiurl_auth}/SetPassword`, authdata);
  }

  /**
   * Verify activation code
   * @param authdata Activation code data
   */
  verifyActivationCode(authdata: any): Observable<any> {
    return this.http.post(
      `${this.apiurl_auth}/VeriftyActivationCode`,
      authdata
    );
  }

  /**
   * Logout current user
   * Calls logout API with current token
   * Note: LocalStorage should be cleared by the calling component AFTER API call succeeds
   */
  logout(): Observable<any> {
    // Get current token from localStorage
    const token = localStorage.getItem('token') || '';
    
    // Create headers with ONLY the token (matching legacy implementation)
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': token
    });
    
    // Make API call - DO NOT clear localStorage here
    // The component will clear it after successful response
    return this.http.post<any>(
      `${this.apiurl}/Logout`,
      '',
      { headers }
    );
  }

  // ============================================
  // ACCESS CONTROL METHODS
  // ============================================

  /**
   * Get all access controls
   */
  getAccessControls(): Observable<AppAccessControlsModel[]> {
    return this.http.get<AppAccessControlsModel[]>(
      `${this.apiurl}/GetAccessControls`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get control features for the application
   */
  getAppControlFeatures(): Observable<AppControlFeaturesModel[]> {
    return this.http.get<AppControlFeaturesModel[]>(
      `${this.apiurl}/GetControlFeatures`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get access controls by role ID
   * @param roleId Role ID to fetch controls for
   */
  getAccessControlsByRoleId(roleId: number): Observable<AppAccessControlsModel[]> {
    return this.http.get<AppAccessControlsModel[]>(
      `${this.apiurl}/GetAccessControlsByRoleId?RoleId=${roleId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get access controls by employee ID
   * @param empId Employee ID
   */
  getAccessControlsByEmpId(empId: string): Observable<AppAccessControlsModel[]> {
    return this.http.get<AppAccessControlsModel[]>(
      `${this.apiurl}/GetAccessControlsByEmpId?EmpId=${empId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get customer access controls
   * @param emailId Customer email
   * @param projid Project ID
   */
  getCustomerAccessControls(
    emailId: string,
    projid: number
  ): Observable<AppAccessControlsModel[]> {
    return this.http.get<AppAccessControlsModel[]>(
      `${this.apiurl}/GetCustomerAccessControls?EmailId=${emailId}&ProjId=${projid}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================
  // CUSTOMER MANAGEMENT METHODS
  // ============================================

  /**
   * Get customer list for employee
   * Used immediately after login to populate customer dropdown
   * Migrated from legacy apps.service.ts -> GetCustomerList()
   * 
   * @param empid Employee ID
   * @param isToFindSLA Whether to include SLA availability info
   * @returns Observable of customer list with IDs and SLA info
   */
  getCustomerList(empid: string, isToFindSLA: boolean): Observable<any[]> {
    // First check if customer list is already in localStorage
    const custIds = localStorage.getItem('CustomerIds');
    if (custIds && custIds.trim() !== '') {
      try {
        const cached = JSON.parse(custIds);
        return new Observable<any[]>(observer => {
          observer.next(cached);
          observer.complete();
        });
      } catch (error) {
        console.error('Error parsing cached customer list:', error);
      }
    }

    // Fetch from API if not cached
    const empId = empid || localStorage.getItem('empid') || '';
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerIds?EmpId=${empId}&istoFindSLA=${isToFindSLA}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get customer by ID
   * @param customerId Customer ID
   */
  getCustomerById(customerId: string): Observable<any> {
    return this.http.get(`${this.apiurl}/Customer/${customerId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get customer list by employee ID (simplified version)
   * @param empId Employee ID
   */
  getCustomerListByEmpId(empId: string): Observable<any> {
    return this.http.get(`${this.apiurl}/Customer/GetByEmpId/${empId}?IsToFindSLA=false`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get dashboard details for a customer
   * Used by dashboard components to display customer overview
   * 
   * @param customerId Customer ID
   * @returns Observable of dashboard details
   */
  getDashboardDetailsByCustomerId(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetDashboardDetails?CustomerId=${customerId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get dashboard details for multiple customers
   * Uses POST method to send array of customer IDs
   * @param customerIds Array of customer IDs
   * @returns Observable of dashboard details
   */
  getDashboardDetailsByCustomerIds(customerIds: string[]): Observable<DashboardDetailsModel[]> {
    return this.http.post<DashboardDetailsModel[]>(
      `${this.apiurl}/GetDashboardDetails`,
      customerIds,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Refresh dashboard details manually
   * @returns Observable of refreshed data
   */
  refreshDashboardDetails(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/RefreshDashboardDetails`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Achievement Trend By Month Line
   * Gets achievement trend data for line chart display
   * Migrated from legacy apps.service.ts -> GetAchievementTrendByMonthLine()
   * 
   * IMPORTANT: Backend ignores START_DATE and recalculates it based on database config
   * Backend expects UPPERCASE property names (CUST_ID, PROJ_ID, START_DATE, END_DATE)
   * 
   * @param custId Customer ID
   * @param projid Project ID or array of project IDs
   * @param startdate Start date for trend data (sent but backend recalculates)
   * @param enddate End date for trend data - THIS IS USED BY BACKEND
   * @returns Observable of achievement trend chart data
   */
  GetAchievementTrendByMonthLine(
    custId: string,
    projid: string | string[],
    startdate: Date,
    enddate: Date
  ): Observable<any> {
    // Backend expects UPPERCASE property names to match C# model
    const data = {
      CUST_ID: custId,
      PROJ_ID: projid,
      START_DATE: startdate.toISOString(),  // ISO format for proper deserialization
      END_DATE: enddate.toISOString()
    };
    
    return this.http.post<any>(
      `${this.apiurl}/GetAchievementTrendByMonthLine`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Update client/customer RAG status
   * @param clientData Client data with RAG updates
   * @returns Observable of update result
   */
  updateClient(clientData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/UpdateClient`,
      clientData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Tasks and Events Summary for dashboard
   * Migrated from legacy apps.service.ts -> GetTasksEventsSummary()
   * 
   * @param customerId Customer ID
   * @param empId Employee ID
   * @returns Observable of tasks/events summary data
   */
  getTasksEventsSummary(customerId: string, empId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetTasksEventsSummary?customerId=${customerId}&empId=${empId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Success Goal Scores for a specific period
   * Migrated from legacy apps.service.ts -> getSuccessGoalScoreForAPeriod()
   * 
   * Returns project scores, success goal scores, and health scores for the specified month/year
   * 
   * @param customerId Customer ID
   * @param month Month name (e.g., "Jan", "Feb", etc.)
   * @param year Year as string
   * @param bLastUpdated Whether to get last updated scores
   * @returns Observable with project scores and success goal data
   */
  getSuccessGoalScoreForAPeriod(
    customerId: string,
    month: string,
    year: string,
    bLastUpdated: boolean
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiurl}/GetSuccessGoalScoreForAPeriod?CustomerId=${customerId}&Month=${month}&Year=${year}&bLastUpdated=${bLastUpdated}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Success Goal Scores For Project
   * Gets project-level success goal scores for a customer
   * Migrated from legacy apps.service.ts -> GetSuccessGoalScoresForProject()
   * @param customerId Customer ID
   * @returns Observable of success goal scores array
   */
  getSuccessGoalScoresForProject(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetSuccessGoalScoresForProject?CustomerId=${customerId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Success Goal Score For A Period (New Version)
   * Gets success goal scores for a date range (used by CSM Dashboard)
   * Migrated from legacy apps.service.ts -> getSuccessGoalScoreForAPeriodNew()
   * 
   * IMPORTANT: When bLastUpdated=true, backend finds the most recent month with data
   * and returns that month/year in the response. This handles cases where current
   * month has no KPI data yet (e.g., showing April data when May filter is selected)
   * 
   * @param custId - Customer ID
   * @param fromDate - Start date (Date string format)
   * @param toDate - End date (Date string format)
   * @param bLastUpdated - If true, backend returns most recent month with data
   * @returns Observable of success goal scores with month/year adjusted by backend
   */
  getSuccessGoalScoreForAPeriodNew(
    custId: string,
    fromDate: string,
    toDate: string,
    bLastUpdated: boolean
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiurl}/GetSuccessGoalScoreForAPeriodNew?CustomerId=${custId}&fromDate=${fromDate}&toDate=${toDate}&bLastUpdated=${bLastUpdated}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Update project RAG status
   * @param ragData RAG data for project
   * @returns Observable of update result
   */
  updateRags(ragData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/Rags`,
      ragData,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get last updated date for a project
   * @param projId Project ID
   * @returns Observable of last update date
   */
  getLastUpdatedDate(projId: string): Observable<Date> {
    return this.http.get<Date>(
      `${this.apiurl}/GetLastUpdatedDate?ProjId=${projId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Check if any project allocations are expiring soon
   * Returns comma-separated list of project names expiring within 10 days
   * @returns Observable of expiring project names string
   */
  checkProjectAllocationExpiry(): Observable<string> {
    return this.http.post<string>(
      `${this.apiurl}/CheckProjectAllocationExpiry`,
      '',
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Refresh dashboard details automatically (for auto-refresh scenarios)
   * @returns Observable of refreshed dashboard data
   */
  refreshDashboardDetailsAuto(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/RefreshDashboardDetailsAuto`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get RAG status from score
   * @param score Numeric score to convert to RAG
   * @returns Observable of RAG color string
   */
  getRagFromScore(score: number): Observable<string> {
    return this.http.get<string>(
      `${this.apiurl}/GetRagFromScore?score=${score}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get project name by project ID
   * @param projId Project ID
   * @returns Observable of project name string
   */
  getProjectName(projId: string): Observable<string> {
    return this.http.get<string>(
      `${this.apiurl}/GetProjectName?ProjId=${projId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get portfolio name by project ID
   * @param projId Project ID
   * @returns Observable of portfolio name
   */
  getPortfolioName(projId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiurl}/GetPortfolioName?ProjId=${projId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================
  // CUSTOMER FEEDBACK METHODS
  // ============================================

  /**
   * Get feedbacks for a customer
   * Migrated from legacy apps.service.ts -> getFeedbacks()
   * 
   * @param customerId Customer ID
   * @returns Observable of feedback array
   */
  getFeedbacks(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/Feedback?CustomerId=${customerId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Add new feedback for a customer
   * Migrated from legacy apps.service.ts -> addFeedback()
   * 
   * @param feedback Feedback model data
   * @returns Observable of created feedback
   */
  addFeedback(feedback: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/AddFeedback`,
      feedback,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Update existing feedback
   * Migrated from legacy apps.service.ts -> updateFeedback()
   * 
   * @param feedback Feedback model data
   * @returns Observable of updated feedback
   */
  updateFeedback(feedback: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiurl}/UpdateFeedback`,
      feedback,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================
  // RISK MANAGEMENT METHODS
  // ============================================

  /**
   * Get risk details by project ID
   * @param projId Project ID
   * @returns Observable of risk models array
   */
  getRiskDetailsByProject(projId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskDetailsByProject?ProjectId=${projId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk details by customer ID
   * Migrated from legacy apps.service.ts -> GetRiskDetailsByCustomerId()
   * @param customerId Customer ID
   * @param allProjects Include all projects flag
   * @returns Observable of extended risk models array
   */
  getRiskDetailsByCustomerId(customerId: string, allProjects: boolean): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskDetailsByCustomerId?customerId=${customerId}&allproj=${allProjects}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk details by customer ID (Capital case version for compatibility)
   * @param custid Customer ID
   * @param allproj Include all projects flag
   * @returns Observable of extended risk models array
   */
  GetRiskDetailsByCustomerId(custid: string, allproj: boolean): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskDetailsByCustomerId?customerId=${custid}&allproj=${allproj}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risks by customer ID, probability, and impact
   * @param customerId Customer ID
   * @param probability Probability scale
   * @param impact Impact scale
   * @returns Observable of risk models array
   */
  getRisk(customerId: string, probability: number, impact: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRisk?CustomerId=${customerId}&Impact=${impact}&Probability=${probability}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get all risks by customer ID
   * @param customerId Customer ID
   * @returns Observable of risk models array
   */
  getRiskByCustomerId(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskByCustomerId?CustomerId=${customerId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Delete/update risk
   * @param risk Risk model data
   * @returns Observable of updated risk model
   */
  deleteRisk(risk: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/Risk`,
      risk,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk area chart data for a project
   * @param projId Project ID
   * @returns Observable of risk area chart data
   */
  getRiskAreaItem(projId: string): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.apiurl}/GetRiskAreaChart`,
      projId,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk by ID (version 2)
   * @param riskId Risk ID
   * @returns Observable of risk string
   */
  getRisk2ById(riskId: number): Observable<string> {
    return this.http.get<string>(
      `${this.apiurl}/GetRisk2ById?RiskId=${riskId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risks from repository filtered by project service towers
   * Migrated from legacy apps.service.ts -> getRiskFromRepository()
   * @param customerId Customer ID
   * @param projectId Project ID
   * @returns Observable of repository risks array
   */
  getRiskFromRepository(customerId: string, projectId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskFromRepository?customerId=${customerId}&projectId=${projectId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Add multiple risks from repository to project
   * Migrated from legacy apps.service.ts -> addRiskList()
   * @param riskList Array of risk objects to add
   * @returns Observable of response
   */
  addRiskList(riskList: any[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/AddRiskList`,
      riskList,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk objectives mapping data
   * @returns Observable of risk objective mapping data array
   */
  getRiskObjectivesMappingData(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskObjectivesMappingData`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk category 1 list
   * @returns Observable of risk categories
   */
  getRiskCategory1List(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskCategory1List`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk category 2 list by category 1 ID
   * @param risk1Id Risk category 1 ID
   * @returns Observable of risk category 2 array
   */
  getRiskCategory2List(risk1Id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskCategory2List?RiskId1=${risk1Id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk category 3 list by category 2 ID
   * @param risk2Id Risk category 2 ID
   * @returns Observable of risk category 3 array
   */
  getRiskCategory3List(risk2Id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskCategory3List?RiskId2=${risk2Id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get risk owners list
   * @returns Observable of risk owners array
   */
  getRiskOwnersList(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskOwnersList`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================
  // ISSUE MANAGEMENT METHODS
  // ============================================

  /**
   * Get issues by customer ID
   * @param customerId Customer ID
   * @returns Observable of issue models array
   */
  getIssuesByCustomerId(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetIssuesByCustomerId?CustomerId=${customerId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get all issues for customer
   * @param customerId Customer ID
   * @param allProjects Include all projects flag
   * @returns Observable of issue data
   */
  getAllIssuesForCustomer(customerId: string, allProjects: boolean): Observable<any> {
    return this.http.get<any>(
      `${this.apiurl}/GetAllIssuesForCustomerId?CustomerId=${customerId}&ProjFlag=${allProjects}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get issue area chart data for a project
   * @param projId Project ID
   * @returns Observable of issue area chart data
   */
  getIssueAreaItem(projId: string): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.apiurl}/GetIssueAreaChart`,
      projId,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================
  // TASKS & EVENTS METHODS
  // ============================================

  /**
   * Get tasks and events details
   * @param customerId Customer ID
   * @param allProjects Include all projects flag
   * @param period Time period filter
   * @returns Observable of tasks/events details array
   */
  getTasksEventsDetails(
    customerId: string,
    allProjects: boolean,
    period: string
  ): Observable<any[]> {
    const empId = localStorage.getItem('empid') || '';
    return this.http.get<any[]>(
      `${this.apiurl}/GetTasksEventsDetails?customerId=${customerId}&empId=${empId}&projectId=proj&eventTypeId=0&period=${period}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get action items details
   * @param customerId Customer ID
   * @param allProjects Include all projects flag
   * @param viewBy View filter
   * @returns Observable of action items data
   */
  getActionItemsDetails(
    customerId: string,
    allProjects: boolean,
    viewBy: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiurl}/GetActionItemsDetails?CustomerId=${customerId}&Projflag=${allProjects}&viewBy=${viewBy}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get action items for a specific risk
   * @param projectId Project ID
   * @param riskId Risk ID
   * @returns Observable of action items
   */
  getActionItemsForRisk(projectId: string, riskId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiurl}/GetActionItemsDetailsforRisk?projectId=${projectId}&riskId=${riskId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================
  // FINDINGS & AUDIT METHODS
  // ============================================

  /**
   * Get all findings for customer
   * @param findingModel Finding filter model
   * @returns Observable of findings by type array
   */
  getAllFindingsForCustomer(findingModel: any): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.apiurl}/GetAllFindingsForCustomer`,
      findingModel,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get entity general information
   * @param entity Entity data
   * @param entityType Type of entity
   * @returns Observable of entity info
   */
  getEntityGeneralInfo(entity: any, entityType: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/GetEntityGeneralInfo?entityType=${entityType}`,
      entity,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get project team count
   * @param projId Project ID
   * @returns Observable of team count data
   */
  getProjectTeamCount(projId: string): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.apiurl}/GetProjectTeamCount`,
      projId,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================
  // PORTFOLIO & PROJECT MAPPING METHODS
  // ============================================

  /**
   * Get all portfolio list
   * Migrated from legacy apps.service.ts -> GetPortfolioList()
   * @returns Observable of portfolio list
   */
  getPortfolioList(): Observable<PortfolioModel[]> {
    return this.http.get<PortfolioModel[]>(
      `${this.apiurl}/GetPortfolioList`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get project portfolio mapping
   * Migrated from legacy apps.service.ts -> getProjectPortfolioMapping()
   * @param custid Customer ID
   * @param allproj Whether to load all projects (boolean)
   * @returns Observable of portfolio-project mapping
   */
  getProjectPortfolioMapping(custid: string, allproj: boolean): Observable<ProjectModelNew[]> {
    return this.http.get<ProjectModelNew[]>(
      `${this.apiurl}/GetAllPortfolioProjectList?custid=${custid}&AllProjects=${allproj}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get all projects for a customer
   * Migrated from legacy apps.service.ts -> getAllProjectsForCustomer()
   * @param custid Customer ID
   * @returns Observable of all projects for the customer
   */
  getAllProjectsForCustomer(custid: string): Observable<any[]> {
    const headers = this.getAuthHeaders().set('custid', custid);
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllProjectsForCustomer?CustomerId=${custid}`,
      { headers }
    );
  }

  /**
   * Get customer projects by name
   * Migrated from legacy apps.service.ts -> GetCustomerProjectsName()
   * @param custid Customer ID
   * @param allproj Whether to load all projects
   * @returns Observable of customer project list
   */
  getCustomerProjectsName(custid: string, allproj: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    if (allproj) {
      return this.http.get<any[]>(
        `${this.apiurl}/GetCustomerProjectsName?CustomerId=${custid}`,
        { headers }
      );
    } else {
      return this.http.get<any[]>(
        `${this.apiurl}/GetCustomerProjectsName?CustomerId=${custid}&AllProjects=${allproj}`,
        { headers }
      );
    }
  }

  /**
   * Get product list for a customer and portfolio
   * Migrated from legacy apps.service.ts -> GetProductList()
   * @param custId Customer ID
   * @param portId Portfolio ID (0 for all)
   * @returns Observable of product list
   */
  getProductList(custId: string, portId: number): Observable<ProductModelNew[]> {
    return this.http.get<ProductModelNew[]>(
      `${this.apiurl}/GetProductList?custId=${custId}&portId=${portId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Save Auditor Acceptance Status
   * Saves the auditor's acceptance/rejection status for findings
   * Migrated from legacy apps.service.ts -> saveAuditorAcceptanceStatus()
   * @param auditorStatus Array of auditor acceptance status records
   * @returns Observable of API response
   */
  saveAuditorAcceptanceStatus(auditorStatus: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}/SaveAuditorAcceptanceStatus`,
      auditorStatus,
      { headers }
    );
  }

  /**
   * Get Customer Projects Name With Customer Name
   * Gets project list for a customer including customer name (for GAVS users)
   * Migrated from legacy apps.service.ts -> GetCustomerProjectsNameWithCustNM()
   * @param custId Customer ID
   * @param empId Employee ID
   * @returns Observable of project list with customer name
   */
  GetCustomerProjectsNameWithCustNM(custId: string, empId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerProjectsName?CustomerId=${custId}&EmpId=${empId}`,
      { headers }
    );
  }

  /**
   * Get Customer Projects Name For Client
   * Gets project list for a customer (for client users)
   * Migrated from legacy apps.service.ts -> GetCustomerProjectsNameForClient()
   * @param custId Customer ID
   * @param emailId Email ID of the user
   * @returns Observable of project list
   */
  GetCustomerProjectsNameForClient(custId: string, emailId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerProjectsNameForClient?CustomerId=${custId}&EmailId=${emailId}`,
      { headers }
    );
  }

  /**
   * Get Success Journey Parameters
   * Gets configuration parameters for success journey charts
   * @param custId Customer ID
   * @returns Observable of parameters object
   */
  GetSuccessJourneyParameters(custId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetSuccessJourneyParameters/${custId}`,
      { headers }
    );
  }

  /**
   * Get Success Journey Charts
   * Gets all chart data for success journey visualization
   * @param model Model containing custId, projectId, month, year, parameters
   * @returns Observable of chart data array
   */
  GetSuccessJourneyCharts(model: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetSuccessJourneyCharts`,
      model,
      { headers }
    );
  }

  /**
   * Get Success Goals Scores
   * Gets success goal scores for a specific period
   * @param custId Customer ID
   * @param month Month number
   * @param year Year number
   * @returns Observable of scores object
   */
  GetSuccessGoalsScores(custId: string, month: number, year: number): Observable<any> {
    const headers = this.getHeaders();
    const model = { custId, month, year };
    return this.http.post<any>(
      `${this.apiurl}/GetSuccessGoalsScores`,
      model,
      { headers }
    );
  }

  /**
   * Get Timeline Chart Data
   * Gets timeline chart data for customer success journey visualization
   * Migrated from legacy apps.service.ts -> GetTimelineChart()
   * @param custId Customer ID
   * @param projId Project ID
   * @param startDate Start date for timeline
   * @param endDate End date for timeline
   * @returns Observable of timeline chart data
   */
  GetTimelineChart(custId: string, projId: string, startDate: Date | null, endDate: Date | null): Observable<any> {
    const headers = this.getHeaders();
    const params = `CustId=${custId}&ProjId=${projId}&StartDate=${startDate || ''}&EndDate=${endDate || ''}`;
    return this.http.get<any>(
      `${this.apiurl}/GetTimelineChart?${params}`,
      { headers }
    );
  }

  /**
   * Get Identified By employees for BVD Dashboard
   * Migrated from legacy apps.service.ts -> getIdentifiedBy()
   * @param custId Customer ID
   * @returns Observable of employee list
   */
  getIdentifiedBy(custId: string): Observable<ProjectResourceByEmpIdModel[]> {
    // Use getAuthHeaders() for consistent token handling
    return this.http.get<ProjectResourceByEmpIdModel[]>(
      `${this.apiurl}/GetIdentifiedBy?custId=${custId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // TODO: Add 492+ additional methods from legacy apps.service.ts as they are needed by migrated components

  /**
   * Get Product List By Customer ID
   * Gets all products for a customer (not filtered by portfolio)
   * Migrated from legacy apps.service.ts -> GetProductListByCustId()
   * @param custId Customer ID
   * @returns Observable of product list
   */
  GetProductListByCustId(custId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetProductListByCustId?CustId=${custId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Product Responsible Details
   * Gets responsible persons mapped to a product
   * Migrated from legacy apps.service.ts -> getproductResponsibleDetails()
   * @param productId Product ID
   * @returns Observable of product responsible list
   */
  getproductResponsibleDetails(productId: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetProductResponsibleDetails?productId=${productId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Employee Details From Customer
   * Gets list of employees associated with a customer
   * Migrated from legacy apps.service.ts -> getEmployeeDetailsfromCustomer()
   * @param customerId Customer ID
   * @returns Observable of employee list
   */
  getEmployeeDetailsfromCustomer(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetEmployeeDetailsFromCustomer?customerId=${customerId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Product Responsible Management Type Details
   * Gets list of management types for product responsible mapping
   * (e.g., CUSTOMER, PROJECT, QUALITYSPOC, etc.)
   * Migrated from legacy apps.service.ts -> getProductResponsibleManagementTypeDetails()
   * @returns Observable of management type list
   */
  getProductResponsibleManagementTypeDetails(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetProductResponsibleManagementTypeDetails`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Add or Update Product Responsible
   * Saves product responsible person mapping
   * Migrated from legacy apps.service.ts -> AddUpdateProductResponsible()
   * @param addItem Product responsible model to save
   * @returns Observable with result message
   */
  AddUpdateProductResponsible(addItem: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/AddUpdateProductResponsible`,
      addItem,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Delete Product Responsible
   * Deletes a product responsible person mapping
   * Migrated from legacy apps.service.ts -> DeleteProductResponsible()
   * @param item Product responsible item to delete
   * @returns Observable with result message
   */
  DeleteProductResponsible(item: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/DeleteProductResponsible`,
      item,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Customer Contacts
   * Gets list of customer contacts
   * Migrated from legacy apps.service.ts -> getCustomerContacts()
   * @param custId Customer ID
   * @param empId Employee ID
   * @returns Observable of customer contact list
   */
  getCustomerContacts(custId: string, empId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerContacts?CustomerId=${custId}&EmpId=${empId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get All Service Modes
   * Gets list of service modes for a product
   * Migrated from legacy apps.service.ts -> getAllServiceMode()
   * @param prodId Product ID
   * @returns Observable of service mode list
   */
  getAllServiceMode(prodId: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetServiceLevelModes?prodId=${prodId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Product Service Area
   * Gets list of service areas for products
   * Migrated from legacy apps.service.ts -> getProductServiceArea()
   * @returns Observable of service area list
   */
  getProductServiceArea(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetProductServiceArea`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Service Reference
   * Gets list of service references for KPI metrics
   * Migrated from legacy apps.service.ts -> getServiceReference()
   * @returns Observable of service reference list
   */
  getServiceReference(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetServiceReference`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get Service Level
   * Gets list of service levels
   * Migrated from legacy apps.service.ts -> getServiceLevel()
   * @returns Observable of service level list
   */
  getServiceLevel(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetServiceLevel`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get All KPI By Mode ID
   * Gets KPIs for a specific mode, service level, and product
   * Migrated from legacy apps.service.ts -> getAllKpiByModeId()
   * @param modeId Service mode ID
   * @param lvlId Service level ID
   * @param productId Product ID
   * @returns Observable of KPI list
   */
  getAllKpiByModeId(modeId: any, lvlId: any, productId: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllKpiByModeId?modeId=${modeId}&serviceLevelId=${lvlId}&prodId=${productId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Delete KPI For Product
   * Deletes a KPI mapping for a product
   * Migrated from legacy apps.service.ts -> deleteKpiForProduct()
   * @param kpiId KPI ID to delete
   * @returns Observable with result
   */
  deleteKpiForProduct(kpiId: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiurl}/DeleteKPIForProduct?kpiId=${kpiId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================
  // TODO: ADD REMAINING METHODS PROGRESSIVELY
  // ============================================
  // The legacy service has ~150+ methods remaining for:
  // - Project Management (detailed)
  // - KPI Management  
  // - Reports
  // - Quality/SQA
  // - Timesheet
  // - Assessment/Audit (detailed)
  // - CSAT
  // - User Management
  // - etc.
  //
  // These will be migrated as we work on each feature module.
  // Current status: 63+ methods migrated (~32% complete)
  // ============================================

  /**
   * Get Project CAPA Count
   * Gets the CAPA (Corrective and Preventive Action) count by stages for all projects
   * Used in Service Improvement Plan widget on dashboard
   * Migrated from legacy apps.service.ts -> GetProjectCAPACount()
   * 
   * @param custid Customer ID
   * @param month Month name as string (e.g., "Jan", "Feb", "Mar")
   * @param year Year as number (e.g., 2024)
   */
  GetProjectCAPACount(custid: string, month: string, year: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectCAPACount?customerId=${custid}&month=${month}&year=${year}`,
      { headers }
    );
  }

  /**
   * Get Notes for Customer
   * Gets key highlights/notes for a customer
   * Used in Key Highlights widget on dashboard
   * Migrated from legacy apps.service.ts -> getNotesForCustomer()
   */
  getNotesForCustomer(custid: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetNotesForCustomer?CustomerId=${custid}`,
      { headers }
    );
  }

  /**
   * Get Project Forecast for Customer
   * Gets project start/end forecast for next 3 months
   * Used in Contract Status widget on dashboard
   * Migrated from legacy apps.service.ts -> getProjectForeCastForCustomer()
   */
  getProjectForeCastForCustomer(custid: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetProjectForeCastForCustomer?CustomerId=${custid}`,
      { headers }
    );
  }

  // ============================================
  // REPORTS METHODS
  // ============================================

  /**
   * Get All Stored Procedures for Reports
   * Migrated from legacy apps.service.ts -> getAllSps()
   */
  getAllSps(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiurl}/GetAllSps`, { headers });
  }

  /**
   * Get Stored Procedure Parameters
   * @param sid Stored Procedure ID
   * Migrated from legacy apps.service.ts -> getSpParams()
   */
  getSpParams(sid: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetSpParams?SpId=${sid}`,
      { headers }
    );
  }

  /**
   * Display Stored Procedure Data
   * @param params Parameters for the stored procedure
   * @param spname Stored Procedure name
   * Migrated from legacy apps.service.ts -> displaySpData()
   */
  displaySpData(params: any[], spname: string): Observable<any[]> {
    const token = localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      'empId': empId,
      'spname': spname
    });
    
    return this.http.post<any[]>(
      `${this.apiurl}/GetSpData`,
      params,
      { headers }
    );
  }

  /**
   * Get Report Details (parameter config for CSS Download Report)
   * @param isMonthly Whether survey is monthly or quarterly
   * Migrated from legacy layout.service.ts -> getReportdetails()
   */
  getReportDetails(isMonthly: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetReportDetails?isMonthly=${isMonthly}`,
      { headers }
    );
  }

  /**
   * Get Report Stored Procedure Name for CSS Download Report
   * @param isMonthly Whether survey is monthly or quarterly
   * Migrated from legacy layout.service.ts -> getRportSpName()
   */
  getReportSpName(isMonthly: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetReportSpName?isMonthly=${isMonthly}`,
      { headers }
    );
  }

  /**
   * Get All Products List
   * Migrated from legacy apps.service.ts -> GetAllProductList()
   */
  GetAllProductList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetAllProductList`, { headers });
  }

  /**
   * Get Portfolio With Product List
   * @param custId Customer ID
   * Migrated from legacy apps.service.ts -> GetPortfolioWithProductList()
   */
  GetPortfolioWithProductList(custId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetPortfolioWithProductList?customerId=${custId}`,
      { headers }
    );
  }

  /**
   * Get Product Details for Customer and Portfolio
   * @param custId Customer ID
   * @param portId Portfolio ID
   * Migrated from legacy apps.service.ts -> GetProductDetails()
   */
  GetProductDetails(custId: string, portId: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProductDetails?custId=${custId}&portId=${portId}`,
      { headers }
    );
  }

  /**
   * Get Initial Data for CRUD Product (dropdowns: tiers, modes, service areas)
   * Migrated from legacy apps.service.ts -> GetInitialDataForCRUDProduct()
   */
  GetInitialDataForCRUDProduct(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetInitialDataForCRUDProduct`,
      { headers }
    );
  }

  /**
   * Add or Update Product
   * @param item Product item to add/update
   * Migrated from legacy apps.service.ts -> AddUpdateProduct()
   */
  AddUpdateProduct(item: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateProduct`,
      item,
      { headers }
    );
  }

  /**
   * Delete Product
   * @param item Product item to delete
   * Migrated from legacy apps.service.ts -> DeleteProduct()
   */
  DeleteProduct(item: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteProduct`,
      item,
      { headers }
    );
  }

  /**
   * Get Checklist List
   * Migrated from legacy apps.service.ts -> getChecklistList()
   */
  getChecklistList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetChecklistList`, { headers });
  }

  /**
   * Get Maturity Level
   * Migrated from legacy apps.service.ts -> getMaturityLevel()
   */
  getMaturityLevel(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetMaturityLevel`, { headers });
  }

  /**
   * Get Checklist Approvers List
   * Migrated from legacy apps.service.ts -> getChecklistApproversList()
   */
  getChecklistApproversList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetChecklistApproversList`, { headers });
  }

  /**
   * Get Findings Type List
   * Migrated from legacy apps.service.ts -> getFindingsTypeList()
   */
  getFindingsTypeList(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiurl}/GetFindingsTypeList`, { headers });
  }

  /**
   * Get Weightage
   * Migrated from legacy apps.service.ts -> getWeightage()
   */
  getWeightage(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetWeightage`, { headers });
  }

  /**
   * Add Status Values
   * Migrated from legacy apps.service.ts -> addStatusValues()
   * Creates a new checklist status list with Pass, Fail, and N/A values
   */
  addStatusValues(
    statusTitle: string,
    metstatusValues: any[],
    nmetstatusValues: any[],
    nastatusValues: any[]
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const data = {
      Statusheader: statusTitle,
      MetStatusValues: metstatusValues,
      NotMetStatusValues: nmetstatusValues,
      NAStatusValues: nastatusValues,
    };
    return this.http.post<any>(`${this.apiurl}/AddChecklistStatusList`, data, { headers });
  }

  /**
   * Get Weightage For Checklist
   * @param checklistId Checklist ID
   * Migrated from legacy apps.service.ts -> getWeightageForChecklist()
   */
  getWeightageForChecklist(checklistId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetWeightageForChecklist?checklistId=${checklistId}`, { headers });
  }

  /**
   * Update Weightage For Checklist
   * @param weightage Weightage data
   * @param checklistId Checklist ID
   * Migrated from legacy apps.service.ts -> UpdateWeightageForChecklist()
   */
  UpdateWeightageForChecklist(weightage: any, checklistId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const headersWithChecklistId = headers.set('checklistId', checklistId.toString());
    return this.http.post<any>(`${this.apiurl}/UpdateWeightageForChecklist`, weightage, { headers: headersWithChecklistId });
  }

  /**
   * Get Audit Status List
   * Migrated from legacy apps.service.ts -> getAuditStatusList()
   */
  getAuditStatusList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetAuditStatusList`, { headers });
  }

  /**
   * Get Checklist Question List
   * @param checklistId Checklist ID
   * Migrated from legacy apps.service.ts -> getChecklistQuestionList()
   */
  getChecklistQuestionList(checklistId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(`${this.apiurl}/GetChecklistQuestionList`, checklistId, { headers });
  }

  /**
   * Get Question Category
   * Retrieve all question categories
   * Migrated from legacy apps.service.ts -> getQuestionCategory()
   */
  getQuestionCategory(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiurl}/GetQuestionCategory`, { headers });
  }

  /**
   * Get Preview Checklist
   * @param checklistId Checklist ID
   * Migrated from legacy apps.service.ts -> GetPreviewChecklist()
   */
  GetPreviewChecklist(checklistId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetPreviewChecklist?ChecklistId=${checklistId}`, { headers });
  }

  /**
   * Verify Checklist In Audit
   * @param checklistId Checklist ID
   * Migrated from legacy apps.service.ts -> VerifyChecklistInAudit()
   */
  VerifyChecklistInAudit(checklistId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/VerifyChecklistInAudit?checklistid=${checklistId}`, { headers });
  }

  /**
   * Add Checklist Question
   * @param question Question data
   * @param processId Process ID
   * @param processAreaId Process Area ID
   * @param serviceAreaId Service Area ID
   * Migrated from legacy apps.service.ts -> AddChecklistQuestion()
   */
  AddChecklistQuestion(
    question: any,
    processId: number,
    processAreaId: number,
    serviceAreaId: number
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const data = {
      procesS_ID: processId,
      servicE_AREA_ID: serviceAreaId,
      procesS_AREA_ID: processAreaId,
      question: question,
    };
    return this.http.post<any>(`${this.apiurl}/AddChecklistQuestion`, data, { headers });
  }

  /**
   * Update Checklist Question
   * @param question Question data
   * @param processId Process ID
   * @param processAreaId Process Area ID
   * @param serviceAreaId Service Area ID
   * Migrated from legacy apps.service.ts -> UpdateChecklistQuestion()
   */
  UpdateChecklistQuestion(
    question: any,
    processId: number,
    processAreaId: number,
    serviceAreaId: number
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const data = {
      procesS_ID: processId,
      servicE_AREA_ID: serviceAreaId,
      procesS_AREA_ID: processAreaId,
      question: question,
    };
    return this.http.post<any>(`${this.apiurl}/UpdateChecklistQuestion`, data, { headers });
  }

  /**
   * Delete Checklist Question
   * @param question Question input data
   * Migrated from legacy apps.service.ts -> DeleteChecklistQuestion()
   */
  DeleteChecklistQuestion(question: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/DeleteChecklistQuestion`, question, { headers });
  }

  /**
   * Get Weightage For All Checklist
   * Retrieve weightage for all checklists
   * Migrated from legacy apps.service.ts -> getWeightageForAllChecklist()
   */
  getWeightageForAllChecklist(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetWeightageForAllChecklist`, { headers });
  }

  /**
   * Add Checklist
   * @param checklist Checklist data
   * Migrated from legacy apps.service.ts -> addChecklist()
   */
  addChecklist(checklist: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/AddChecklist`, checklist, { headers });
  }

  /**
   * Update Checklist
   * @param checklist Checklist data
   * Migrated from legacy apps.service.ts -> updateChecklist()
   */
  updateChecklist(checklist: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/UpdateChecklist`, checklist, { headers });
  }

  /**
   * Delete Checklist
   * @param checklist Checklist data
   * Migrated from legacy apps.service.ts -> deleteChecklist()
   */
  deleteChecklist(checklist: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/DeleteChecklist`, checklist, { headers });
  }

  /**
   * Revise Checklist
   * @param checklist New checklist data
   * @param oldchecklistid Old checklist ID
   * Migrated from legacy apps.service.ts -> reviseChecklist()
   */
  reviseChecklist(checklist: any, oldchecklistid: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/ReviseChecklist?ChecklistId=${oldchecklistid}`, checklist, { headers });
  }

  /**
   * Approve Checklist
   * @param checklists Array of checklists to approve
   * Migrated from legacy apps.service.ts -> approveChecklist()
   */
  approveChecklist(checklists: any[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(`${this.apiurl}/ApproveChecklist`, checklists, { headers });
  }

  /**
   * Save Checklist Copy
   * @param checklistId Checklist ID
   * @param title New title
   * Migrated from legacy apps.service.ts -> saveChecklistCopy()
   */
  saveChecklistCopy(checklistId: string, title: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    const params = { checklistId, title };
    return this.http.get<any[]>(`${this.apiurl}/SaveChecklistCopy`, { headers, params });
  }

  /**
   * Get Checklist Used In Assessment
   * Migrated from legacy apps.service.ts -> getChecklistUsedInAssessment()
   */
  getChecklistUsedInAssessment(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiurl}/GetChecklistUsedInAssessment`, { headers });
  }

  /**
   * Get All Checklists
   * @param includeMerged Whether to include merged checklists
   * Migrated from legacy apps.service.ts -> getAllChecklists()
   */
  getAllChecklists(includeMerged: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetChecklistList?includeMerged=${includeMerged}`, { headers });
  }

  /**
   * Get Multi Checklist Preview
   * @param checklistIds Array of checklist IDs to preview
   * Migrated from legacy apps.service.ts -> getMultiChecklistPreview()
   */
  getMultiChecklistPreview(checklistIds: number[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(`${this.apiurl}/GetMultiChecklistPreview`, checklistIds, { headers });
  }

  /**
   * Create New Multi Checklist
   * @param checklistIds Array of checklist IDs to merge
   * @param title Title for the new merged checklist
   * Migrated from legacy apps.service.ts -> createNewMultiChecklist()
   */
  createNewMultiChecklist(checklistIds: number[], title: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const requestData = { title };
    return this.http.post<any>(`${this.apiurl}/CreateNewMultiChecklist`, checklistIds, { 
      headers, 
      params: requestData 
    });
  }

  /**
   * Save New Multi Checklist
   * @param checklistData Checklist data to save
   * @param checklistId Checklist ID
   * Migrated from legacy apps.service.ts -> saveNewMultiChecklist()
   */
  saveNewMultiChecklist(checklistData: any, checklistId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    const requestData = { checklistId: checklistId.toString() };
    return this.http.post<any[]>(`${this.apiurl}/SaveNewMultiChecklist`, checklistData, { 
      headers, 
      params: requestData 
    });
  }

  // ============================================
  // PROCESS AREA METHODS
  // ============================================

  /**
   * Get Process Area List
   * Migrated from legacy apps.service.ts -> getProcessAreaList()
   */
  getProcessAreaList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetProcessAreaList`, { headers });
  }

  /**
   * Add Process Area
   * Migrated from legacy apps.service.ts -> AddProcessAreaNew()
   */
  AddProcessAreaNew(processArea: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/AddProcessAreaNew`, processArea, { headers });
  }

  /**
   * Update Process Area
   * Migrated from legacy apps.service.ts -> UpdateProcessArea()
   */
  UpdateProcessArea(processArea: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/UpdateProcessAreaNew`, processArea, { headers });
  }

  /**
   * Delete Process Area
   * Migrated from legacy apps.service.ts -> DeleteProcessArea()
   */
  DeleteProcessArea(processArea: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/DeleteProcessArea`, processArea, { headers });
  }

  /**
   * Delete Process Area (Soft Delete with ISACTIVE flag)
   * Uses new endpoint that sets ISACTIVE = false instead of hard delete
   * Added for soft delete functionality
   */
  DeleteProcessAreaNew(processArea: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/DeleteProcessAreaNew`, processArea, { headers });
  }

  /**
   * Get Process List
   * Migrated from legacy apps.service.ts -> getProcessList()
   */
  getProcessList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetProcessList`, { headers });
  }

  /**
   * Get Process Area By Service Area ID
   * @param serviceAreaId Service Area ID
   * Migrated from legacy apps.service.ts -> GetProcessAreaByServiceAreaIdNew()
   */
  GetProcessAreaByServiceAreaIdNew(serviceAreaId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProcessAreafromServiceIdNew?ServiceAreaId=${serviceAreaId}`,
      { headers }
    );
  }

  /**
   * Get Process By Process Area
   * @param processAreaId Process Area ID
   * Migrated from legacy apps.service.ts -> GetProcessByProcessArea()
   */
  GetProcessByProcessArea(processAreaId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/GetProcessByProcessArea`,
      processAreaId,
      { headers }
    );
  }

  /**
   * Get Process By Service Area
   * @param serviceAreaId Service Area ID
   * Migrated from legacy apps.service.ts -> GetProcessByServiceArea()
   */
  GetProcessByServiceArea(serviceAreaId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProcessByServiceArea?ServiceAreaId=${serviceAreaId}`,
      { headers }
    );
  }

  // ============================================================================
  // PROCESS OBJECTIVE MANAGEMENT API METHODS
  // Added: March 18, 2026 - For Objective User Component
  // ============================================================================

  /**
   * Get all Process Objective Mappings
   * Returns mappings between objectives and processes
   * Migrated from legacy apps.service.ts -> getAllProcessObjectiveMapping()
   */
  getAllProcessObjectiveMapping(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllProcessObjectiveMapping`,
      { headers }
    );
  }

  /**
   * Get Objectives List
   * Returns all available objectives
   * Migrated from legacy apps.service.ts -> getObjectivesList()
   */
  getObjectivesList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetObjectivesList`,
      { headers }
    );
  }

  /**
   * Add New Objective
   * @param objective Objective object to add
   * Migrated from legacy apps.service.ts -> AddObjectiveNew()
   */
  AddObjectiveNew(objective: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddObjectiveNew`,
      objective,
      { headers }
    );
  }

  /**
   * Update Process Objective Mapping
   * Maps an objective to multiple processes
   * @param objective The objective to map
   * @param processes Array of processes to map to
   * Migrated from legacy apps.service.ts -> UpdateProcessObjectiveMapping()
   */
  UpdateProcessObjectiveMapping(objective: any, processes: any[]): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = {
      PROCESS_MODEL_OBJECTIVES_NEW: objective,
      PROCESS: processes
    };
    return this.http.post<any>(
      `${this.apiurl}/UpdateProcessObjectiveMapping`,
      payload,
      { headers }
    );
  }

  /**
   * Get Processes by Objective ID
   * Returns all processes mapped to a specific objective
   * @param objectiveId Objective ID
   * Migrated from legacy apps.service.ts -> GetProcessByObjective()
   */
  GetProcessByObjective(objectiveId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProcessByObjective?ObjectiveId=${objectiveId}`,
      { headers }
    );
  }

  // ============================================================================
  // PROCESS RISK MANAGEMENT API METHODS
  // Added: March 18, 2026 - For Risk User Component
  // ============================================================================

  /**
   * Get all Process Model Risks
   * Returns all defined risks
   * Migrated from legacy apps.service.ts -> GetProcessModelRisksNew()
   */
  GetProcessModelRisksNew(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProcessModelRisksNew`,
      { headers }
    );
  }

  /**
   * Get Risk Category Level 1 List
   * Returns all level 1 risk categories
   * Migrated from legacy apps.service.ts -> GetRiskCategory1List()
   */
  GetRiskCategory1List(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskCategory1List`,
      { headers }
    );
  }

  /**
   * Get All Risk Category Level 2 List
   * Returns all level 2 risk categories
   * Migrated from legacy apps.service.ts -> GetAllRiskCategory2List()
   */
  GetAllRiskCategory2List(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllRiskCategory2List`,
      { headers }
    );
  }

  /**
   * Get Risk Category Level 2 List by Level 1
   * Returns filtered level 2 categories based on level 1 selection
   * @param level1Id Level 1 category ID
   * Migrated from legacy apps.service.ts -> GetRiskCategory2List()
   */
  GetRiskCategory2List(level1Id: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskCategory2List?RiskId1=${level1Id}`,
      { headers }
    );
  }

  /**
   * Get All Risk Category Level 3 List
   * Returns all level 3 risk categories
   * Migrated from legacy apps.service.ts -> GetAllRiskCategory3List()
   */
  GetAllRiskCategory3List(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllRiskCategory3List`,
      { headers }
    );
  }

  /**
   * Get Risk Category Level 3 List by Level 2
   * Returns filtered level 3 categories based on level 2 selection
   * @param level2Id Level 2 category ID
   * Migrated from legacy apps.service.ts -> GetRiskCategory3List()
   */
  GetRiskCategory3List(level2Id: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskCategory3List?RiskId2=${level2Id}`,
      { headers }
    );
  }

  /**
   * Get Risk Owners List
   * Returns all available risk owners
   * Migrated from legacy apps.service.ts -> GetRiskOwnersList()
   */
  GetRiskOwnersList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskOwnersList`,
      { headers }
    );
  }

  /**
   * Get Risk-Objective Mapping Data
   * Returns all risk-objective mappings
   * Migrated from legacy apps.service.ts -> GetRiskObjectivesMappingData()
   */
  GetRiskObjectivesMappingData(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetRiskObjectivesMappingData`,
      { headers }
    );
  }

  /**
   * Get Objectives by Service Area ID
   * Returns objectives filtered by service area
   * @param serviceAreaId Service Area ID
   * Migrated from legacy apps.service.ts -> GetObjectivesByServiceAreaId()
   */
  GetObjectivesByServiceAreaId(serviceAreaId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetObjectivesByServiceAreaId?ServiceAreaId=${serviceAreaId}`,
      { headers }
    );
  }

  /**
   * Update Risk and Risk-Objective Mapping
   * Updates or creates a risk and maps it to objectives
   * @param objectives Array of objectives to map
   * @param risk Risk object to update/create
   * Migrated from legacy apps.service.ts -> UpdateRiskAndRiskObjMapping()
   */
  UpdateRiskAndRiskObjMapping(objectives: any[], risk: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = {
      PROCESS_MODEL_OBJECTIVES_NEW: objectives,
      PROCESS_MODEL_RISKS_NEW: risk
    };
    return this.http.post<any>(
      `${this.apiurl}/UpdateRiskAndRiskObjMapping`,
      payload,
      { headers }
    );
  }

  // ========================================
  // CONTROL USER API METHODS (14 methods)
  // ========================================

  /**
   * Get All Control Categories
   * Retrieves all control categories
   * @returns Observable of control categories
   * Migrated from legacy apps.service.ts -> getAllControlCategories()
   */
  getAllControlCategories(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetAllControlCategories`,
      { headers }
    );
  }

  /**
   * Get All Control References
   * Retrieves all control references
   * @returns Observable of control references
   * Migrated from legacy apps.service.ts -> getAllControlReferences()
   */
  getAllControlReferences(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetAllControlReferences`,
      { headers }
    );
  }

  /**
   * Add Control Category
   * Creates a new control category
   * @param category Control category object to add
   * @returns Observable of updated categories list
   * Migrated from legacy apps.service.ts -> addControlCategory()
   */
  addControlCategory(category: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddControlCategory`,
      category,
      { headers }
    );
  }

  /**
   * Add Control Reference
   * Creates a new control reference
   * @param reference Control reference object to add
   * @returns Observable of updated references list
   * Migrated from legacy apps.service.ts -> addControlReference()
   */
  addControlReference(reference: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddControlReference`,
      reference,
      { headers }
    );
  }

  /**
   * Get Control Category By Model ID
   * Retrieves control categories for a specific process model
   * @param id Process model ID
   * @returns Observable of control categories
   * Migrated from legacy apps.service.ts -> getControlCategoryByModelId()
   */
  getControlCategoryByModelId(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetControlCategoryByModelId?ModelId=${id}`,
      { headers }
    );
  }

  /**
   * Get Control Reference By Category ID
   * Retrieves control references for a specific control category
   * @param categoryid Control category ID
   * @returns Observable of control references
   * Migrated from legacy apps.service.ts -> GetControlReferenceByCategoryId()
   */
  GetControlReferenceByCategoryId(categoryid: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetControlReferenceByCategoryId?CategoryId=${categoryid}`,
      { headers }
    );
  }

  /**
   * Get Classifications
   * Retrieves all control classifications
   * @returns Observable of classifications
   * Migrated from legacy apps.service.ts -> getClassifications()
   */
  getClassifications(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetClassifications`,
      { headers }
    );
  }

  /**
   * Get Control Risks Mapping Data
   * Retrieves all controls with their mapped risks
   * @returns Observable of control-risks mapping data
   * Migrated from legacy apps.service.ts -> getControlRisksMappingData()
   */
  getControlRisksMappingData(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetControlRisksMappingData`,
      { headers }
    );
  }

  /**
   * Add Control And Risks Mapping
   * Creates a new control and maps it to risks
   * @param control Control object to add
   * @param risks Array of risks to map to the control
   * @returns Observable of created mapping
   * Migrated from legacy apps.service.ts -> addControlAndRisksMapping()
   */
  addControlAndRisksMapping(control: any, risks: any[]): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = {
      control: control,
      risks: risks
    };
    return this.http.post<any>(
      `${this.apiurl}/AddControlAndRisksMapping`,
      payload,
      { headers }
    );
  }

  /**
   * Update Control And Risks Mapping
   * Updates an existing control and its risk mappings
   * @param element Control-risks mapping object to update
   * @returns Observable of updated mapping
   * Migrated from legacy apps.service.ts -> updateControlAndRisksMapping()
   */
  updateControlAndRisksMapping(element: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateControlAndRisksMapping`,
      element,
      { headers }
    );
  }

  /**
   * Get Status Of Control
   * Checks if a control can be deleted (checks for dependencies)
   * @param id Control ID
   * @returns Observable of boolean status
   * Migrated from legacy apps.service.ts -> getStatusOfControl()
   */
  getStatusOfControl(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetStatusOfControl`,
      id,
      { headers }
    );
  }

  /**
   * Delete Control Risks Mapping
   * Deletes a control and its risk mappings
   * @param id Control ID to delete
   * @returns Observable of deletion result
   * Migrated from legacy apps.service.ts -> deleteControlRisksmapping()
   */
  deleteControlRisksmapping(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(
      `${this.apiurl}/DeleteControlRisksmapping?id=${id}`,
      { headers }
    );
  }

  /**
   * Delete Control Test Mapping By Control ID
   * Deletes control-test mappings for a specific control
   * @param controlid Control ID
   * @returns Observable of deletion result
   * Migrated from legacy apps.service.ts -> deleteControlTestMappingByControlId()
   */
  deleteControlTestMappingByControlId(controlid: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(
      `${this.apiurl}/DeleteControlTestMappingByControlId?controlid=${controlid}`,
      { headers }
    );
  }

  // ========================================
  // TEST USER API METHODS (5 methods)
  // ========================================

  /**
   * Get Tests Control Data
   * Retrieves all tests with their mapped controls
   * @returns Observable of test-control mappings
   * Migrated from legacy apps.service.ts -> getTestsControlData()
   */
  getTestsControlData(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetTestsControlData`,
      { headers }
    );
  }

  /**
   * Get Control List
   * Retrieves all controls for test mapping
   * @returns Observable of controls list
   * Migrated from legacy apps.service.ts -> getControlList()
   */
  getControlList(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetControlList`,
      { headers }
    );
  }

  /**
   * Add Test Controls
   * Creates a new test and maps it to controls
   * @param element Test-control mapping object
   * @returns Observable of created mapping
   * Migrated from legacy apps.service.ts -> addTestControls()
   */
  addTestControls(element: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddTestControls`,
      element,
      { headers }
    );
  }

  /**
   * Update Test Controls
   * Updates an existing test and its control mappings
   * @param element Test-control mapping object to update
   * @returns Observable of updated mapping
   * Migrated from legacy apps.service.ts -> updateTestControls()
   */
  updateTestControls(element: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateTestControls`,
      element,
      { headers }
    );
  }

  /**
   * Delete Test Controls
   * Deletes a test and its control mappings
   * @param deletedata Test-control mapping object to delete
   * @returns Observable of deletion result
   * Migrated from legacy apps.service.ts -> deleteTestControls()
   */
  deleteTestControls(deletedata: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteTestControls`,
      deletedata,
      { headers }
    );
  }

  // ==================== Requirement Reference APIs ====================

  /**
   * Get Requirement Reference Status List
   * Fetches all available requirement statuses
   * @returns Observable of status list
   * Migrated from legacy apps.service.ts -> getStatusList()
   */
  getStatusList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetRequirementReferenceStatusList`,
      { headers }
    );
  }

  /**
   * Get Requirement Categories
   * Fetches all requirement categories
   * @returns Observable of category list
   * Migrated from legacy apps.service.ts -> getCategories()
   */
  getCategories(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetCategories`,
      { headers }
    );
  }

  /**
   * Get Applicability Levels
   * Fetches requirement applicability level options
   * @returns Observable of applicability levels
   * Migrated from legacy apps.service.ts -> getApplicabilityLevels()
   */
  getApplicabilityLevels(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetApplicabilityLevels`,
      { headers }
    );
  }

  /**
   * Get Requirement References
   * Fetches requirement references with filtering
   * @param requirementModel Filter criteria (dates, customer, projects)
   * @returns Observable of requirement references
   * Migrated from legacy apps.service.ts -> getReqReference()
   */
  getReqReference(requirementModel: any): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}GetReqReference`,
      requirementModel,
      { headers }
    );
  }

  /**
   * Get Requirement Stages
   * Fetches stage history for a requirement
   * @param reqId Requirement ID
   * @returns Observable of stage status list
   * Migrated from legacy apps.service.ts -> getReqStages()
   */
  getReqStages(reqId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetReqStageStatus?reqID=${reqId}`,
      { headers }
    );
  }

  /**
   * Add Requirement Reference
   * Creates a new requirement reference
   * @param data Requirement reference object
   * @returns Observable of creation result
   * Migrated from legacy apps.service.ts -> AddRequirementRef (via HTTP POST)
   */
  AddRequirementRef(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}AddRequirementRef`,
      data,
      { headers }
    );
  }

  /**
   * Update Requirement Reference
   * Updates an existing requirement reference
   * @param data Requirement reference object with updates
   * @returns Observable of update result
   * Migrated from legacy apps.service.ts -> UpdateRequirementRef (via HTTP POST)
   */
  UpdateRequirementRef(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}UpdateRequirementRef`,
      data,
      { headers }
    );
  }

  /**
   * Delete Requirement Reference
   * Deletes a requirement reference
   * @param data Requirement reference object to delete
   * @returns Observable of deletion result
   * Migrated from legacy apps.service.ts -> DeleteRequirementReference (via HTTP POST)
   */
  DeleteRequirementReference(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}DeleteRequirementReference`,
      data,
      { headers }
    );
  }

  // ==================== End Requirement Reference APIs ====================

  /**
   * Add SQA Risk
   * Creates a new risk
   * @param risk Risk object to add
   * Migrated from legacy apps.service.ts -> addSQARisk()
   */
  addSQARisk(risk: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddSQARisk`,
      risk,
      { headers }
    );
  }

  /**
   * Update SQA Risk
   * Updates an existing risk
   * @param risk Risk object to update
   * Migrated from legacy apps.service.ts -> updateSQARisk()
   */
  updateSQARisk(risk: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateSQARisk`,
      risk,
      { headers }
    );
  }

  /**
   * Get Status of Risk
   * Checks if a risk can be deleted
   * @param riskId Risk ID
   * Migrated from legacy apps.service.ts -> getStatusOfRisk()
   */
  getStatusOfRisk(riskId: number): Observable<boolean> {
    const headers = this.getAuthHeaders();
    return this.http.post<boolean>(
      `${this.apiurl}/GetStatusOfRisk`,
      riskId,
      { headers }
    );
  }

  /**
   * Delete Risk-Objective Mapping
   * Removes a risk-objective mapping
   * @param mapdata Mapping data to delete
   * Migrated from legacy apps.service.ts -> deleteRiskObjectiveMapping()
   */
  deleteRiskObjectiveMapping(mapdata: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteRiskObjectiveMapping`,
      mapdata,
      { headers }
    );
  }

  /**
   * Delete Risk-Control Mapping by Risk ID
   * Removes all control mappings for a risk
   * @param riskId Risk ID
   * Migrated from legacy apps.service.ts -> deleteRiskControlMappingByRiskId()
   */
  deleteRiskControlMappingByRiskId(riskId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(
      `${this.apiurl}/DeleteRiskControlMappingByRiskId?RiskId=${riskId}`,
      { headers }
    );
  }


  /**
   * Get Process Checklist Mapping List
   * @param processId Process ID
   * Migrated from legacy apps.service.ts -> GetProcessChecklistMappingList()
   */
  GetProcessChecklistMappingList(processId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProcessChecklistMappingList?ProcessId=${processId}`,
      { headers }
    );
  }

  /**
   * Get Process Checklist Questions Mapping List
   * @param checklistId Checklist ID
   * @param processId Process ID
   * @param processAreaId Process Area ID
   * @param serviceAreaId Service Area ID
   * Migrated from legacy apps.service.ts -> GetProcessChecklistQuestionsMappingList()
   */
  GetProcessChecklistQuestionsMappingList(
    checklistId: number,
    processId: number,
    processAreaId: number,
    serviceAreaId: number
  ): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProcessChecklistQuestionsMappingList?ChecklistId=${checklistId}&ProcessId=${processId}&ProcessAreaId=${processAreaId}&ServiceAreaId=${serviceAreaId}`,
      { headers }
    );
  }

  /**
   * Update Process Checklist Questions Mapping
   * @param mapping Array of process checklist questions mappings
   * Migrated from legacy apps.service.ts -> UpdateProcessChecklistQuestionsMapping()
   */
  UpdateProcessChecklistQuestionsMapping(mapping: any[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/UpdateProcessChecklistQuestionsMapping`,
      mapping,
      { headers }
    );
  }

  /**
   * Update Process
   * Migrated from legacy apps.service.ts -> UpdateProcess()
   */
  UpdateProcess(process: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/UpdateProcessNew`, process, { headers });
  }

  /**
   * Delete Process
   * Migrated from legacy apps.service.ts -> DeleteProcess()
   */
  DeleteProcess(process: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/DeleteProcess`, process, { headers });
  }

  /**
   * Delete Process (Soft Delete with ISACTIVE flag)
   * Uses new endpoint that sets ISACTIVE = false instead of hard delete
   * Added for soft delete functionality
   */
  DeleteProcessNew(process: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiurl}/DeleteProcessNew`, process, { headers });
  }

  /**
   * Get All Process Model Reference List
   * Migrated from legacy apps.service.ts -> getAllProcessModelReferenceList()
   */
  getAllProcessModelReferenceList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiurl}/GetAllProcessModelReferenceList`, { headers });
  }

  // ============================================
  // CSAT CONFIGURATION METHODS
  // ============================================

  /**
   * Get Employee Info
   * Migrated from legacy apps.service.ts -> getEmpInfo()
   */
  getEmpInfo(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/EmpInfo`,
      { headers }
    );
  }

  /**
   * Get Employee Name by ID
   * @param empId Employee ID
   * Migrated from legacy apps.service.ts -> getEmpNameById()
   */
  getEmpNameById(empId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetEmpNameById?EmpId=${empId}`,
      { headers }
    );
  }

  /**
   * Get Contacts for Customer
   * @param customerId Customer ID
   * Migrated from legacy apps.service.ts -> getContacts()
   */
  getContacts(customerId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/Contacts?CustomerId=${customerId}`,
      { headers }
    );
  }

  /**
   * Add Contact
   * @param contacts Contact data
   * Migrated from legacy apps.service.ts -> addContacts()
   */
  addContacts(contacts: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/Contacts`,
      contacts,
      { headers }
    );
  }

  /**
   * Update Contact
   * @param contacts Contact data
   * Migrated from legacy apps.service.ts -> updateContacts()
   */
  updateContacts(contacts: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateContacts`,
      contacts,
      { headers }
    );
  }

  /**
   * Delete Contact
   * @param contacts Contact data
   * Migrated from legacy apps.service.ts -> deleteContacts()
   */
  deleteContacts(contacts: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteContacts`,
      contacts,
      { headers }
    );
  }

  /**
   * Get Contact Roles
   * Migrated from legacy apps.service.ts -> getContactRoles()
   */
  getContactRoles(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetContactRoles`,
      { headers }
    );
  }

  /**
   * Get Appreciation Details
   * @param customerId Customer ID
   * @param allproj Include all projects flag
   * Migrated from legacy apps.service.ts -> getAppreciationDetails()
   */
  getAppreciationDetails(customerId: string, allproj: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetAppreciationDetails?custId=${customerId}&Projflag=${allproj}`,
      { headers }
    );
  }

  /**
   * Update Appreciation
   * @param appreciationDtls Appreciation details
   * Migrated from legacy apps.service.ts -> updateAppreciation()
   */
  updateAppreciation(appreciationDtls: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateAppreciation`,
      appreciationDtls,
      { headers }
    );
  }

  /**
   * Delete Appreciation
   * @param appreciationDtls Appreciation details
   * Migrated from legacy apps.service.ts -> deleteAppreciation()
   */
  deleteAppreciation(appreciationDtls: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteAppreciation`,
      appreciationDtls,
      { headers }
    );
  }

  /**
   * Get Auditee Details
   * @param customerId Customer ID
   * @param projectId Project ID
   * @param includeCustomer Include customer flag
   * Migrated from legacy apps.service.ts -> getAuditeeDetails()
   */
  getAuditeeDetails(customerId: string, projectId: string, includeCustomer: boolean = true): Observable<any[]> {
    const headers = this.getAuthHeaders();
    // Use HttpParams for proper parameter encoding (Angular 19 best practice)
    const params = new HttpParams()
      .set('CustomerId', customerId)
      .set('ProjectId', projectId)
      .set('includeCustomer', String(includeCustomer));
    
    return this.http.get<any[]>(
      `${this.apiurl}/GetAuditeeDetails`,
      { headers, params }
    );
  }

  /**
   * Get Auditor List by Certified Standards
   * @param customerId Customer ID
   * @param projectId Project ID
   * Returns list of auditors for the specified customer and project
   * Migrated from legacy apps.service.ts -> getAuditorListNew()
   */
  getAuditorListNew(customerId: string, projectId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAuditorListByCertifiedStandards?CustomerId=${customerId}&ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Get Dropdown Options
   * @param dropdownName Name of the dropdown
   * Migrated from legacy apps.service.ts -> getDropdownOptions()
   */
  getDropdownOptions(dropdownName: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetDropdownOptions?dropdownName=${dropdownName}`,
      { headers }
    );
  }

  /**
   * Get Active Current Batch
   * Migrated from legacy apps.service.ts -> getActiveCurrentBatch()
   */
  getActiveCurrentBatch(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetCurrentActiveBatch`,
      { headers }
    );
  }

  /**
   * Get CSAT List for DP
   * @param dpId Delivery Partner ID
   * @param batchId Batch ID
   * Migrated from legacy apps.service.ts -> getCSATListforDP()
   */
  getCSATListforDP(dpId: string, batchId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCSATListForDP?dpId=${dpId}&batchId=${batchId}`,
      { headers }
    );
  }

  /**
   * Get Customer Projects for Migration
   * @param customerId Customer ID
   * @param needClosed Include closed projects flag
   * Migrated from legacy apps.service.ts -> GetCustomerProjectsForMigration()
   */
  GetCustomerProjectsForMigration(customerId: string, needClosed: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerProjectsForMigration?customerId=${customerId}&needClosed=${needClosed}`,
      { headers }
    );
  }

  /**
   * Migrate Project Data
   * @param oldProjectId Old Project ID
   * @param newProjectId New Project ID
   * Migrated from legacy apps.service.ts -> MigrateProjectData()
   */
  MigrateProjectData(oldProjectId: string, newProjectId: string): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.get<string>(
      `${this.apiurl}/MigrateProjectData?oldProjectId=${oldProjectId}&newProjectId=${newProjectId}`,
      { headers }
    );
  }

  /**
   * Save CSAT List for DP
   * @param projectList List of projects
   * @param dpId Delivery Partner ID
   * @param batchId Batch ID
   * Migrated from legacy apps.service.ts -> saveCSATListForDP()
   */
  saveCSATListForDP(projectList: any[], dpId: string, batchId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/SaveCSATListForDP?dpId=${dpId}&batchId=${batchId}`,
      projectList,
      { headers }
    );
  }

  /**
   * Get CSAT Contact List for DP
   * @param dpId Delivery Partner ID
   * @param batchId Batch ID
   * Migrated from legacy apps.service.ts -> getCSATContactListForDP()
   */
  getCSATContactListForDP(dpId: string, batchId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCSATContactListForDP?dpId=${dpId}&batchId=${batchId}`,
      { headers }
    );
  }

  /**
   * Get Overall Preconnect Data
   * @param batchCustomerId Batch Customer ID
   * Migrated from legacy apps.service.ts -> getOverallPreconnectData()
   */
  getOverallPreconnectData(batchCustomerId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetOverallPreconnectData?batchCustomerId=${batchCustomerId}`,
      { headers }
    );
  }

  /**
   * Save Preconnect Survey Data
   * @param presurveyData Presurvey data
   * Migrated from legacy apps.service.ts -> savePreconnectSurveyData()
   */
  savePreconnectSurveyData(presurveyData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/SavePreconnectSurveyData`,
      presurveyData,
      { headers }
    );
  }

  /**
   * Get Project Settings (Master Configuration)
   * Migrated from legacy apps.service.ts -> getProjectSettings()
   */
  getProjectSettings(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllProjectConfigurationSettings`,
      { headers }
    );
  }

  /**
   * Get Project Configuration Data
   * @param projectId Project ID
   * Migrated from legacy apps.service.ts -> getProjectConfigurationData()
   */
  getProjectConfigurationData(projectId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectConfigurationData?projID=${projectId}`,
      { headers }
    );
  }

  /**
   * Get Contact List for Customer IDs
   * @param custIds Array of customer IDs
   * Migrated from legacy apps.service.ts -> getContactListForCustIds()
   */
  getContactListForCustIds(custIds: string[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/GetContactListForCustIds`,
      custIds,
      { headers }
    );
  }

  /**
   * Save CSAT Contact List for DP
   * @param cssBatchData CSAT batch data
   * @param dpId Delivery Partner ID
   * @param batchId Batch ID
   * Migrated from legacy apps.service.ts -> saveCSATContactListForDP()
   */
  saveCSATContactListForDP(cssBatchData: any[], dpId: string, batchId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/SaveCSATContactListForDP?dpId=${dpId}&batchId=${batchId}`,
      cssBatchData,
      { headers }
    );
  }

  // ============================================
  // ACCESS CONTROL PROJECT METHODS
  // ============================================

  /**
   * Get Project Resource by Employee ID
   * @param empId Employee ID
   * Migrated from legacy apps.service.ts -> getProjectResourceByEmpId()
   */
  getProjectResourceByEmpId(empId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectResourceByEmpId?EmpId=${empId}`,
      { headers }
    );
  }

  /**
   * Send Request for Edit Resource Access
   * @param controlIds Array of resource/control IDs requesting access to
   * @param feature Feature name for the access request
   * @param empId Employee ID of the requester
   * @param accessType Access level type (1=View, 2=Edit, etc.)
   * @param custId Customer ID
   * @param projId Project ID
   * Migrated from legacy apps.service.ts -> sendRequestAccess()
   */
  sendRequestAccess(controlIds: number[], feature: string, empId: string, accessType: any, custId: string, projId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    const requestBody = {
      empId: empId,
      feature: feature,
      custId: custId,
      projId: projId,
      accessType: accessType
    };
    return this.http.post<any[]>(
      `${this.apiurl}/RequestEditResourceAccess`,
      controlIds,
      { headers, params: requestBody }
    );
  }

  /**
   * Save Approve or Reject Request Access
   * @param accessRequestData Access request data including status and reason
   * Migrated from legacy apps.service.ts -> saveApproveRejectRequestAccess()
   */
  saveApproveRejectRequestAccess(accessRequestData: any): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/ApproveOrRejectEditResourceAccess`,
      accessRequestData,
      { headers }
    );
  }

  /**
   * Get Project Resource by Project ID
   * @param projId Project ID
   * Migrated from legacy apps.service.ts -> getProjectResourceByProjId()
   */
  getProjectResourceByProjId(projId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectResourceByProjectId?ProjId=${projId}`,
      { headers }
    );
  }

  /**
   * Get Project SPOCs by Project ID
   * Returns PM, DM, QA Head and other SPOC details used for CAPA access control.
   * Migrated from legacy apps.service.ts -> getProjectSpocsByProjId()
   */
  getProjectSpocsByProjId(projId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetProjectSpocsByProjectId?projId=${projId}`,
      { headers }
    );
  }

  /**
   * Get Project Resources by Project IDs (Array)
   * Get project resources for multiple project IDs
   * Migrated from legacy apps.service.ts -> getProjectResourcebyProjIds(projIds)
   */
  getProjectResourcebyProjIds(projIds: string[]): Observable<any[]> {
    let headers = this.getAuthHeaders();
    headers = headers.set('projIds', projIds.join(','));
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectResourceByProjIds`,
      { headers }
    );
  }

  /**
   * Add Project Resource
   * @param pr Project Resource Model
   * Migrated from legacy apps.service.ts -> addProjectResource()
   */
  addProjectResource(pr: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddProjectResource`,
      pr,
      { headers }
    );
  }

  /**
   * Delete Project Resource
   * @param pr Project Resource Model
   * Migrated from legacy apps.service.ts -> deleteProjectResource()
   */
  deleteProjectResource(pr: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteProjectResource`,
      pr,
      { headers }
    );
  }

  /**
   * Check if Resource Already Exists by Dates
   * @param projectId Project ID
   * @param empId Employee ID
   * @param startDate Start Date
   * @param endDate End Date
   * Migrated from legacy apps.service.ts -> checkIfResourceAlreadyExistsByDates()
   */
  checkIfResourceAlreadyExistsByDates(projectId: string, empId: string, startDate: any, endDate: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const customHeaders = headers.append('projectid', projectId)
      .append('empid', empId.toString())
      .append('startDate', startDate)
      .append('endDate', endDate);
    return this.http.get<any>(
      `${this.apiurl}/checkIfResourceAlreadyExistsByDates`,
      { headers: customHeaders }
    );
  }

  /**
   * Get Project End Date by Project ID
   * @param projectId Project ID
   * Migrated from legacy apps.service.ts -> GetProjEndDateByProjId()
   */
  GetProjEndDateByProjId(projectId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetProjEndDate?projectid=${projectId}`,
      { headers }
    );
  }

  /**
   * Get RAS Customer List
   * Migrated from legacy apps.service.ts -> GetRASCustomerList()
   */
  GetRASCustomerList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerList`,
      { headers }
    );
  }

  /**
   * Get Customer Projects Name
   * @param custId Customer ID
   * @param allProj Include all projects flag
   * Migrated from legacy apps.service.ts -> GetCustomerProjectsName()
   */
  GetCustomerProjectsName(custId: string, allProj: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    const empId = localStorage.getItem('empid') || '';
    
    if (allProj) {
      return this.http.get<any[]>(
        `${this.apiurl}/GetCustomerProjectsName?CustomerId=${custId}`,
        { headers }
      );
    } else {
      return this.http.get<any[]>(
        `${this.apiurl}/GetCustomerProjectsName?CustomerId=${custId}&EmpId=${empId}&AllProj=${allProj}`,
        { headers }
      );
    }
  }

  /**
   * Get All Customer Projects Name
   * Returns all projects across all customers
   * Migrated from legacy apps.service.ts -> GetAllCustomerProjectsName()
   */
  GetAllCustomerProjectsName(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllCustomerProjectsName`,
      { headers }
    );
  }

  /**
   * Get Project Data Configuration Values
   * @param settingVal Setting value
   * @param custId Customer ID
   * @param projId Project ID
   * Migrated from legacy apps.service.ts -> GetProjectDataConfigurationValues()
   */
  GetProjectDataConfigurationValues(settingVal: string, custId: string, projId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectDataConfigurationValues?settingVal=${settingVal}&custid=${custId}&projId=${projId}`,
      { headers }
    );
  }

  /**
   * Add New Project
   * @param newProject New Project Model
   * Migrated from legacy apps.service.ts -> addNewProject()
   */
  addNewProject(newProject: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddNewProject`,
      newProject,
      { headers }
    );
  }

  /**
   * Process PSA Requests
   * Admin function to process PSA requests
   * Migrated from legacy apps.service.ts -> ProcessPSARequests()
   */
  ProcessPSARequests(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/ProcessPSARequests`,
      "",
      { headers }
    );
  }

  /**
   * Process CRISP Scores for Period
   * @param month Month
   * @param year Year
   * @param regenerate Regenerate flag
   * Migrated from legacy apps.service.ts -> ProcessCrispScoresForPeriod()
   */
  ProcessCrispScoresForPeriod(month: string, year: string, regenerate: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/ProcessCrispScoresForPeriod?Month=${month}&Year=${year}&regenerate=${regenerate}`,
      { headers }
    );
  }

  /**
   * Process CRISP Scores for Period for PM
   * @param month Month
   * @param year Year
   * Migrated from legacy apps.service.ts -> ProcessCrispScoresForPeriodPM()
   */
  ProcessCrispScoresForPeriodPM(month: string, year: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/ProcessCrispScoresForPeriodForPM?Month=${month}&Year=${year}`,
      { headers }
    );
  }

  /**
   * Process C Score for Period
   * @param month Month
   * @param year Year
   * @param regenerate Regenerate flag
   * Migrated from legacy apps.service.ts -> ProcessCScoreForPeriod()
   */
  ProcessCScoreForPeriod(month: string, year: string, regenerate: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/ProcessCScoreForPeriod?Month=${month}&Year=${year}`,
      { headers }
    );
  }

  /**
   * General Method
   * Admin general purpose method
   * Migrated from legacy apps.service.ts -> GeneralMethod()
   */
  GeneralMethod(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GeneralMethod`,
      { headers }
    );
  }

  /**
   * Logout
   * Clear user session and logout
   * Migrated from legacy apps.service.ts -> Logout()
   */
  Logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/Logout`,
      "",
      { headers }
    );
  }

  // ============================================
  // CONFIGURATION EXT METHODS
  // ============================================

  /**
   * Get Configuration EXT Details
   * Retrieve all configuration key-value pairs
   * Migrated from legacy apps.service.ts -> getConfigextDetails()
   */
  getConfigextDetails(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetConfigDetails`,
      { headers }
    );
  }

  /**
   * Add/Update Configuration EXT
   * @param item Configuration item to save
   * Migrated from legacy apps.service.ts -> AddUpdateConfigext()
   */
  AddUpdateConfigext(item: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateConfiguration`,
      item,
      { headers }
    );
  }

  /**
   * Delete Configuration
   * @param item Configuration item to delete
   * Migrated from legacy apps.service.ts -> DeleteConfiguration()
   */
  DeleteConfiguration(item: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteConfiguration`,
      item,
      { headers }
    );
  }

  /**
   * Get Multiple Customers Project Names
   * @param custId Customer ID (passed in headers)
   * @param allproj Load all projects flag
   * Migrated from legacy apps.service.ts -> GetMultipleCustomersProjectNames()
   * Legacy behavior:
   * - Passes custId in HTTP headers
   * - If allproj is true: Call without query parameters
   * - If allproj is false: Call with EmpId query parameter
   */
  GetMultipleCustomersProjectNames(custId: string, allproj: boolean): Observable<any[]> {
    const token = localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    
    // Create headers with custId (matching legacy implementation)
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      'empId': empId,
      'custid': custId
    });
    
    if (allproj) {
      // Load all projects without query parameters
      return this.http.get<any[]>(
        `${this.apiurl}/GetMultipleCustomersProjectNames`,
        { headers }
      );
    } else {
      // Load projects filtered by EmpId in query parameter
      return this.http.get<any[]>(
        `${this.apiurl}/GetMultipleCustomersProjectNames?EmpId=${empId}`,
        { headers }
      );
    }
  }

  // ============================================
  // RISK REPOSITORY METHODS
  // ============================================

  /**
   * Get Service Area List
   * Retrieve all service towers/areas
   * Migrated from legacy apps.service.ts -> getServiceAreaList()
   */
  getServiceAreaList(): Observable<ServiceAreaModelNew[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ServiceAreaModelNew[]>(
      `${this.apiurl}/GetServiceAreaList`,
      { headers }
    );
  }

  /**
   * Get Service Towers Project Mapping
   * Retrieve service tower mappings for a specific project
   * Used by KPI Definitions and other components to load project service areas
   * Migrated from legacy apps.service.ts -> getServiceTowersProjectMapping()
   * 
   * @param projectId - Project ID
   * @returns Observable<ServiceTowersProjectMappingModel[]> - Array of service tower mappings
   */
  getServiceTowersProjectMapping(projectId: string): Observable<ServiceTowersProjectMappingModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ServiceTowersProjectMappingModel[]>(
      `${this.apiurl}/GetServiceTowersProjectMappingList?ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Get Overall KPI Master List
   * Returns all KPI definitions from master list for selection dropdown
   * Migrated from legacy apps.service.ts -> getOverallKPIList()
   * Expected properties: kpI_ID, kpI_NAME, formula, numeratordescription, denominatordescription, slA_TARGET_UNIT_OF_MEASUREMENT
   */
  getOverallKPIList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetOverallKPIList`,
      { headers }
    );
  }

  // =================================================================
  // PROJECT SCOPE METHODS
  // =================================================================

  /**
   * Get Project Scope By Project ID
   * Retrieve project scope information including objectives, deliverables, etc.
   * Migrated from legacy apps.service.ts -> getProjectScopeByProjId()
   * @param projid Project ID
   * @returns Observable of ScopeModel
   */
  getProjectScopeByProjId(projid: string): Observable<ScopeModel> {
    const headers = this.getAuthHeaders();
    return this.http.get<ScopeModel>(
      `${this.apiurl}/GetProjectScope?ProjectId=${projid}`,
      { headers }
    );
  }

  /**
   * Get Project In-Scope Details
   * Retrieve in-scope service areas for a project
   * Migrated from legacy apps.service.ts -> GetProjectInScope()
   * @param projectId Project ID
   * @returns Observable of modelRow array
   */
  GetProjectInScope(projectId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectInScope?ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Delete In-Scope Service Area
   * Remove an in-scope service area from project
   * Migrated from legacy apps.service.ts -> DeleteInScope()
   * @param r modelRow to delete
   * @returns Observable of any
   */
  DeleteInScope(r: modelRow): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteInScope`,
      r,
      { headers }
    );
  }

  /**
   * Update Project Scope
   * Save/update project scope and in-scope details
   * Migrated from legacy apps.service.ts -> updateScope()
   * @param scope projectScopes object containing scope and in-scope details
   * @returns Observable of projectScopes
   */
  updateScope(scope: projectScopes): Observable<projectScopes> {
    const headers = this.getAuthHeaders();
    return this.http.post<projectScopes>(
      `${this.apiurl}/UpdateScope`,
      scope,
      { headers }
    );
  }

  // ============================================
  // People Page API Methods
  // ============================================

  /**
   * Get Project People By Project ID
   * Retrieves people/resource information for a project
   * Migrated from legacy apps.service.ts -> getProjectPeopleByProjId()
   */
  getProjectPeopleByProjId(projid: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetProjectPeople?ProjectId=${projid}`,
      { headers }
    );
  }

  /**
   * Update People
   * Updates people/resource information including RAG and challenges
   * Migrated from legacy people-page.component.ts -> service_updatePeople()
   */
  updatePeople(projectId: string, rag: string, challenges: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const dataUpdate = {
      PROJECT_ID: projectId,
      RAG: rag,
      RESOURCE_CHALLENGES: challenges,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    };
    return this.http.post<any>(
      `${this.apiurl}/UpdatePeople`,
      dataUpdate,
      { headers }
    );
  }

  /**
   * Update Resource Title
   * Updates the title/role of a resource in a project
   * Migrated from legacy apps.service.ts -> updateResourceTitle()
   */
  updateResourceTitle(emp: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateResourceTitle`,
      emp,
      { headers }
    );
  }

  /**
   * Get New Resource
   * Retrieves updated resource list for a project
   * Migrated from legacy apps.service.ts -> getNewResource()
   */
  getNewResource(projectid: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetNewResource?ProjectId=${projectid}`,
      { headers }
    );
  }

  /**
   * Get Project RAGs By Project ID
   * Retrieves RAG status information for all project components
   * Migrated from legacy apps.service.ts -> getProjectRagsByProjId()
   */
  getProjectRagsByProjId(projid: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetProjectRags?ProjectId=${projid}`,
      { headers }
    );
  }

  // ============================================
  // PROCESS PAGE METHODS
  // ============================================

  /**
   * Get Process New
   * Retrieves process/report data with types and dropdown data
   * Migrated from legacy apps.service.ts -> getProcessNew()
   */
  getProcessNew(projId: string): Observable<ProcessDataModel> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProcessDataModel>(
      `${this.apiurl}/GetProcessNew?ProjId=${projId}`,
      { headers }
    );
  }

  /**
   * Get Project Process By Project ID
   * Retrieves process/report information for a project
   * Migrated from legacy apps.service.ts -> getProjectProcessByProjId()
   */
  getProjectProcessByProjId(projid: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetProjectProcess?ProjectId=${projid}`,
      { headers }
    );
  }

  /**
   * Delete Process
   * Deletes a process report
   * Migrated from legacy apps.service.ts -> deleteProcess()
   */
  deleteProcess(report: ProcessModel): Observable<ProcessModel> {
    const headers = this.getAuthHeaders();
    return this.http.post<ProcessModel>(
      `${this.apiurl}/DeleteProcessReport`,
      report,
      { headers }
    );
  }

  // ============================================
  // DELIVERY PAGE METHODS
  // ============================================

  /**
   * Get Delivery
   * Retrieves delivery/weekly status data for a project
   * Migrated from legacy apps.service.ts -> getDelivery()
   */
  getDelivery(projectid: string, publishdate: string, range: enumDateRange): Observable<DeliveryDetailsModel> {
    const headers = this.getAuthHeaders()
      .append('PROJ_ID', projectid)
      .append('PUBLISH_DATE', publishdate)
      .append('DATE_RANGE', range.toString());

    return this.http.get<DeliveryDetailsModel>(
      `${this.apiurl}/Delivery?projId=${projectid}&publishDate=${publishdate}&range=${range.toString()}`,
      { headers }
    );
  }

  /**
   * Get All Risk From Repository
   * Retrieve all risks from the risk repository
   * Migrated from legacy apps.service.ts -> GetAllRiskFromRepository()
   */
  GetAllRiskFromRepository(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllRiskFromRepository`,
      { headers }
    );
  }

  /**
   * Add or Update Risk Repository
   * @param item Risk repository item to add/update
   * Migrated from legacy apps.service.ts -> AddUpdateRiskRepo()
   */
  AddUpdateRiskRepo(item: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddUpdateRiskRepository`,
      item,
      { headers }
    );
  }

  /**
   * Delete Risk From Repository
   * @param item Risk repository item to delete
   * Migrated from legacy apps.service.ts -> DeleteRiskFromRepository()
   */
  DeleteRiskFromRepository(item: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteRiskFromRepository`,
      item,
      { headers }
    );
  }

  // ============================================
  // SUBPROJECT METHODS
  // ============================================

  /**
   * Get Project Tasks
   * Retrieve all tasks for a project
   * Migrated from legacy apps.service.ts -> getProjectTask()
   */
  getProjectTask(projId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectTask?ProjId=${projId}`,
      { headers }
    );
  }

  /**
   * Get SubProject Task Responsibility List
   * Retrieve responsibility list for subproject tasks
   * Migrated from legacy apps.service.ts -> getSubProjectTaskResponsibilityList()
   */
  getSubProjectTaskResponsibilityList(custId: string, projId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetSubProjectTaskResponsibilityList?custId=${custId}&projId=${projId}`,
      { headers }
    );
  }

  /**
   * Get SubProjects
   * Retrieve all subprojects for a project
   * Migrated from legacy apps.service.ts -> GetSubProjects()
   */
  GetSubProjects(projectid: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetSubProjects?ProjectId=${projectid}`,
      { headers }
    );
  }

  /**
   * Add SubProject
   * Add a new subproject
   * Migrated from legacy apps.service.ts -> AddSubProject()
   */
  AddSubProject(subproject: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddSubProject`,
      subproject,
      { headers }
    );
  }

  /**
   * Update Project Task
   * Update an existing project task
   * Migrated from legacy apps.service.ts -> updateProjectTask()
   */
  updateProjectTask(tasks: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateProjectTasks`,
      tasks,
      { headers }
    );
  }

  // ============================================
  // LESSONS LEARNED METHODS
  // ============================================

  /**
   * Get Lessons Learnt by Project ID
   * Retrieve all lessons learnt for a project with dropdown data
   * Migrated from legacy apps.service.ts -> getLessonLearntbyProjId()
   */
  getLessonLearntbyProjId(projId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetLessonLearnt?ProjId=${projId}`,
      { headers }
    );
  }

  /**
   * Delete Lesson Learnt
   * Delete a lesson learnt record
   * Migrated from legacy apps.service.ts -> deleteLessonLearnt()
   */
  deleteLessonLearnt(element: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteLessonLearnt`,
      element,
      { headers }
    );
  }

  // ============================================
  // AUDITOR QUALITY STANDARDS METHODS
  // ============================================

  /**
   * Get Audit Quality Standard Controls
   * Retrieve all auditor qualified standards
   * Migrated from legacy apps.service.ts -> GetAuditQualityStandardControls()
   */
  GetAuditQualityStandardControls(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAuditorQualifiedStandardSummary`,
      { headers }
    );
  }

  /**
   * Get QA Spoc Details
   * Retrieve QA SPOC employee details
   * Migrated from legacy apps.service.ts -> GetQASpocDetails()
   */
  GetQASpocDetails(): Observable<EmpInfoModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<EmpInfoModel[]>(
      `${this.apiurl}/GetQASpocDetails`,
      { headers }
    );
  }

  // ============================================
  // BEST PRACTICES METHODS
  // ============================================

  /**
   * Get Best Practices by Project ID
   * Returns best practices, dropdown data for service areas, process areas, processes, industry verticals, etc.
   * Migrated from legacy apps.service.ts -> getBestPracticesbyProjId(projId)
   */
  getBestPracticesbyProjId(projId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetBestPractices?ProjId=${projId}`,
      { headers }
    );
  }

  /**
   * Get All Best Practices For Customer
   * Get all best practices for a customer (optionally all projects)
   * Migrated from legacy apps.service.ts -> getAllBestPracticesForCustomer(CustId, allproj)
   */
  getAllBestPracticesForCustomer(custId: string, allproj: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    if (custId == undefined) {
      return new Observable(observer => observer.error('Customer ID is undefined'));
    }
    return this.http.get<any>(
      `${this.apiurl}/GetAllBestPracticesForCustomer?Custid=${custId}&ProjFlag=${allproj}`,
      { headers }
    );
  }

  /**
   * Delete Best Practices
   * Delete a best practice record
   * Migrated from legacy apps.service.ts -> deleteBestPractices(element)
   */
  deleteBestPractices(element: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteBestPractice`,
      element,
      { headers }
    );
  }

  /**
   * Get Best Practices From Description
   * Search best practices by process area for filtering
   * Migrated from legacy apps.service.ts -> getBestPracticesFromDescription(processArea)
   */
  getBestPracticesFromDescription(processArea: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetBestPracticesByDescription?ProcessArea=${processArea}`,
      { headers }
    );
  }

  /**
   * Send Mail To CSM
   * Send email notification to CSM about best practice
   * Migrated from legacy apps.service.ts -> sendMailToCSM(projectId, customerId, bestPractice)
   */
  sendMailToCSM(projectId: string, customerId: string, bestPractice: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/SendMailToCSM?ProjId=${projectId}&CustId=${customerId}`,
      bestPractice,
      { headers }
    );
  }

  /**
   * Get All Customer Names and Employee Names
   * Get combined list of customer names and employee names for autocomplete
   * Migrated from legacy apps.service.ts -> getAllCustomerNamesEmpNames()
   */
  getAllCustomerNamesEmpNames(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<string[]>(
      `${this.apiurl}/GetAllCustomerNamesEmpNames`,
      { headers }
    );
  }

  /**
   * Get Customer Portfolio Projects List
   * Get customer/portfolio/project hierarchy for an employee
   * Migrated from legacy apps.service.ts -> getCustomerPortfolioProjectsList(empid, allproj)
   */
  getCustomerPortfolioProjectsList(empid: string, allproj: boolean = false): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerPortfolioProjectList?EmpId=${empid}&ProjFlag=${allproj}`,
      { headers }
    );
  }

  /**
   * Get Best Practice Matrix
   * Retrieve best practices matrix data filtered by parameters
   * Migrated from legacy apps.service.ts -> getBestPracticeMatrix()
   */
  getBestPracticeMatrix(status: string, serviceArea: string, processArea: string, deptId: number, start: string, end: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetBestPracticeMatrix?Status=${status}&ServiceArea=${serviceArea}&ProcessArea=${processArea}&DeptId=${deptId}&StartDate=${start}&EndDate=${end}`,
      { headers }
    );
  }

  /**
   * Add Best Practices By Matrix
   * Bulk update best practices status from matrix view
   * Migrated from legacy apps.service.ts -> addBestPracticesByMattrix()
   */
  addBestPracticesByMattrix(matrixdata: any, statusChange: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || '',
      'status': statusChange
    });
    return this.http.post<any[]>(
      `${this.apiurl}/AddBestPracticeByMatrix`,
      matrixdata,
      { headers }
    );
  }

  /**
   * Get All Projects Name
   * Retrieve all project names
   * Migrated from legacy apps.service.ts -> getAllProjectsName()
   */
  getAllProjectsName(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllProjsName`,
      { headers }
    );
  }

  /**
   * Get Process Model
   * Retrieve all process models
   * Migrated from legacy apps.service.ts -> getProcessModel()
   */
  getProcessModel(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetProcessModel`,
      { headers }
    );
  }

  /**
   * Get All Process Process Model Mapping
   * Retrieve all process to process model mappings
   * Migrated from legacy apps.service.ts -> GetAllProcessProcessModelMapping()
   */
  GetAllProcessProcessModelMapping(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllProcessProcessModelMapping`,
      { headers }
    );
  }

  /**
   * Get All Process List
   * Retrieve all processes with complete details
   * Migrated from legacy apps.service.ts -> getAllProcessList()
   */
  getAllProcessList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllProcessList`,
      { headers }
    );
  }

  /**
   * Update Process Mapping
   * Maps a list of processes to a process model
   * Migrated from legacy apps.service.ts -> UpdateProcessMapping()
   * @param processModel  The process model to map to
   * @param processList   The list of processes being mapped
   */
  UpdateProcessMapping(processModel: any, processList: any[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    const data = { process: processList, procesS_MODEL: processModel };
    return this.http.post<any[]>(
      `${this.apiurl}/UpdateProcessMapping`,
      data,
      { headers }
    );
  }

  /**
   * Add Process Model
   * Create a new process model
   * @param model Process model to create
   */
  addProcessModel(model: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddProcessModel`,
      model,
      { headers }
    );
  }

  /**
   * Update Process Model
   * Update an existing process model
   * @param model Process model to update
   */
  updateProcessModel(model: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateProcessModel`,
      model,
      { headers }
    );
  }

  /**
   * Delete Process Model
   * Delete a process model
   * @param model Process model to delete
   */
  deleteProcessModel(model: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteProcessModel`,
      model,
      { headers }
    );
  }

  /**
   * Delete Process Model Process Mapping
   * Delete mappings related to a process model
   * @param id Process model ID
   */
  deleteProcessModelProcessMapping(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteProcessModelProcessMapping`,
      { id },
      { headers }
    );
  }

  /**
   * Add Process Area
   * Create a new process area
   * @param area Process area to create
   */
  addProcessArea(area: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddProcessArea`,
      area,
      { headers }
    );
  }

  /**
   * Update Process Area
   * Update an existing process area
   * @param area Process area to update
   */
  updateProcessArea(area: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateProcessArea`,
      area,
      { headers }
    );
  }

  /**
   * Delete Process Area
   * Delete a process area
   * @param area Process area to delete
   */
  deleteProcessArea(area: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteProcessArea`,
      area,
      { headers }
    );
  }

  /**
   * Add Process
   * Create a new process
   * @param process Process to create
   */
  addProcesses(process: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddProcesses`,
      process,
      { headers }
    );
  }

  /**
   * Update Process
   * Update an existing process
   * @param process Process to update
   */
  updateProcesses(process: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateProcesses`,
      process,
      { headers }
    );
  }

  /**
   * Delete Process
   * Delete a process
   * @param process Process to delete
   */
  deleteProcesses(process: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteProcesses`,
      process,
      { headers }
    );
  }

  /**
   * Get Process Area For Model and SA
   * Get process areas filtered by model ID and service area ID
   * @param modelId Process model ID
   * @param serviceAreaId Service area ID
   */
  getProcessAreaForModelandSA(modelId: number, serviceAreaId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetProcessAreaForModelandSA`,
      { modelId, serviceAreaId },
      { headers }
    );
  }

  /**
   * Get Process SQA
   * Get processes for a specific area
   * @param areaId Process area ID
   */
  getProcessSQA(areaId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetProcessSQA`,
      { areaId },
      { headers }
    );
  }

  /**
   * Update Auditor
   * Add or update auditor qualified standards
   * @param item Auditor qualified standard item
   * Migrated from legacy apps.service.ts -> UpdateAuditor()
   */
  UpdateAuditor(item: AuditQualifiedStandardModel): Observable<AuditQualifiedStandardModel> {
    const headers = this.getAuthHeaders();
    return this.http.post<AuditQualifiedStandardModel>(
      `${this.apiurl}/UpdateAuditor`,
      item,
      { headers }
    );
  }

  /**
   * Delete auditor quality standard
   */
  DeleteAuditor(item: AuditQualifiedStandardModel): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteAuditor`,
      item,
      { headers }
    );
  }

  // ============================================
  // BENCHMARK KPI METHODS
  // ============================================

  /**
   * Get Global KPI Category Details Across Project
   * Retrieve benchmark KPI data across projects
   * @param reqobj Request object with filters
   * Migrated from legacy apps.service.ts -> GetGlobalKPICategoryDetailsAcrossProject()
   */
  GetGlobalKPICategoryDetailsAcrossProject(reqobj: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetGlobalKPICategoryDetailsAcrossProject`,
      reqobj,
      { headers }
    );
  }

  /**
   * Get Consolidated Project Wise KPI Details
   * Retrieve summary KPI data by customer and project
   * @param reqobj Request object with filters
   * Migrated from legacy apps.service.ts -> GetConsolidatedProjectWiseKPIDetails()
   */
  GetConsolidatedProjectWiseKPIDetails(reqobj: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetConsolidatedProjectWiseKPIDetails`,
      reqobj,
      { headers }
    );
  }

  /**
   * Get Global KPI Categories
   * Retrieve all global KPI categories grouped by perspective
   * Migrated from legacy apps.service.ts -> GetGlobalKpiCategories()
   */
  GetGlobalKpiCategories(): Observable<GlobalKpiCategoryModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<GlobalKpiCategoryModel[]>(
      `${this.apiurl}/GetGlobalKPICategories`,
      { headers }
    );
  }

  // ============================================
  // API METHODS - CI Leaderboard
  // ============================================

  /**
   * Get CI Tracker data with new parameter model
   * Used by CI Leaderboard page
   * Migrated from legacy apps.service.ts -> GetCITrackerNew()
   */
  GetCITrackerNew(ciTrackerParameterModel: any): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}GetCITracker`,
      ciTrackerParameterModel,
      { headers }
    );
  }

  /**
   * Get database configuration value by key
   * Used for dynamic configuration settings
   * Migrated from legacy apps.service.ts -> GetDBConfigValue()
   */
  GetDBConfigValue(key: string, cust_id: number, proj_id: string): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.get<string>(
      `${this.apiurl}GetDBConfig?key=${key}&custId=${cust_id}&projId=${proj_id}`,
      { headers }
    );
  }

  /**
   * Get Idea Improvement Types
   * Returns list of CI categories (Automation, Innovation, Improvement, etc.)
   * Migrated from legacy bvd-entry.service.ts -> getIdeaImprovementTypes()
   */
  getIdeaImprovementTypes(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetIdeaImprovementTypes`,
      { headers }
    );
  }

  /**
   * Get Unit of Measurement list
   * Returns list of UOMs (Cost in $, Effort in Hours, etc.)
   * Migrated from legacy bvd-dashboard.service.ts -> getUOM()
   */
  getUOM(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetAllUOM`,
      { headers }
    );
  }

  /**
   * Get Customer List
   * Returns list of customers for the logged-in user
   * Migrated from legacy apps.service.ts -> GetCustomerList()
   */
  GetCustomerList(empid: string, isToFindSLA: boolean): Observable<any[]> {
    empid = localStorage.getItem("empid") || '';
    const headers = this.getAuthHeaders();

    const custIds = localStorage.getItem('CustomerIds');
    if (custIds != undefined && custIds != null && custIds != '') {
      const raw = JSON.parse(custIds);
      return new Observable<any[]>(a => a.next(raw));
    } else {
      return this.http.get<any[]>(
        `${this.apiurl}/GetCustomerIds?EmpId=${empid}&istoFindSLA=${isToFindSLA}`,
        { headers }
      );
    }
  }

  /**
   * Get Multiple Customers Project Names Single
   * Returns projects for a specific customer (single customer mode)
   * Migrated from legacy apps.service.ts -> GetMultipleCustomersProjectNamesSingle()
   */
  GetMultipleCustomersProjectNamesSingle(custid: string, allproj: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    const empid = localStorage.getItem("empid") || '';

    if (allproj) {
      return this.http.get<any[]>(
        `${this.apiurl}/GetMultipleCustomersProjectNamesSingle?CustId=${custid}`,
        { headers }
      );
    } else {
      return this.http.get<any[]>(
        `${this.apiurl}/GetMultipleCustomersProjectNamesSingle?EmpId=${empid}&CustId=${custid}`,
        { headers }
      );
    }
  }

  /**
   * Get SQA Report Types
   * Returns list of SQA report types for a project
   * Migrated from legacy apps.service.ts -> GetSQAReportTypes()
   */
  GetSQAReportTypes(projectid: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetSQAReportTypes?ProjectId=${projectid}`,
      { headers }
    );
  }

  /**
   * Get Analyzed Insights
   * Returns analyzed compliance insights for a project within a date range
   * Migrated from legacy apps.service.ts -> GetAnalyzedInsights()
   */
  GetAnalyzedInsights(
    custId: string,
    projId: string,
    dumpType: string,
    startDate: Date,
    endDate: Date
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetAnalyzedInsights?CustomerId=${custId}&ProjectId=${projId}&ReportType=${dumpType}&StartDate=${startDate.toDateString()}&EndDate=${endDate.toDateString()}`,
      { headers }
    );
  }

  /**
   * Get Insight Details
   * Returns detailed compliance information for specific row IDs
   * Migrated from legacy apps.service.ts -> getInsightDetails()
   */
  getInsightDetails(element: string[]): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetComplianceDetailsforInsights`,
      element,
      { headers }
    );
  }

  // ============================================
  // SQA DATA UPLOAD & STRUCTURE MANAGEMENT
  // ============================================

  /**
   * Get SQA File Structure
   * Returns the structure/schema of an uploaded SQA file
   * Migrated from legacy apps.service.ts -> GetSQAFileStructure()
   */
  GetSQAFileStructure(filename: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetSQAFileStructure?FileName=${filename}`,
      { headers }
    );
  }

  /**
   * Get Report Type Structure
   * Returns the database structure/schema for a specific report type
   * Migrated from legacy apps.service.ts -> GetReportTypeStructure()
   */
  GetReportTypeStructure(reportTypeId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetSQAReportStructure?ReportId=${reportTypeId}`,
      { headers }
    );
  }

  /**
   * Update Report Type Structure
   * Updates the field mappings and structure for a report type
   * Migrated from legacy apps.service.ts -> UpdateReportTypeStructure()
   */
  UpdateReportTypeStructure(structures: any[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/UpdateSQAReportStructure`,
      structures,
      { headers }
    );
  }

  /**
   * Add SQA Report Structure
   * Creates a new report structure from uploaded file
   * Migrated from legacy apps.service.ts -> AddSQAReportStructure()
   */
  AddSQAReportStructure(reportStruct: any[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}AddSQAReportStructure`,
      reportStruct,
      { headers }
    );
  }

  /**
   * Get Project Charts
   * Returns configured charts for a project
   * Migrated from legacy apps.service.ts -> GetProjectCharts()
   */
  GetProjectCharts(projectid: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectCharts?ProjectId=${projectid}`,
      { headers }
    );
  }

  /**
   * Get SQA Charts Parameters
   * Returns chart configuration parameters for SQA project charts
   * Migrated from legacy apps.service.ts -> GetSQAChartsParams()
   */
  GetSQAChartsParams(
    projectid: string,
    startdate: Date,
    enddate: Date,
    chartUser: string,
    category: string,
    subcategory: string
  ): Observable<SqaChartParamsModel[]> {
    const token = localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      'empId': empId,
      'ProjectId': projectid,
      'startdate': startdate.toLocaleDateString(),
      'enddate': enddate.toLocaleDateString(),
      'chartUser': chartUser,
      'category': category,
      'subcategory': subcategory,
    });
    
    return this.http.post<SqaChartParamsModel[]>(
      `${this.apiurl}/GetSQAChartsParams`,
      "",
      { headers }
    );
  }

  /**
   * Get SQA Chart From Parameters
   * Generates a chart based on provided parameters
   * Migrated from legacy apps.service.ts -> GetSQAChartFromParams()
   */
  GetSQAChartFromParams(params: SqaChartParamsModel): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetSQAChartFromParams`,
      params,
      { headers }
    );
  }

  /**
   * Get Parameters By Type
   * Returns parameters/options for a specific parameter type (e.g., dropdown values)
   * Migrated from legacy apps.service.ts -> GetParametersByType()
   */
  GetParametersByType(type: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetParametersByType?type=${type}`,
      { headers }
    );
  }

  /**
   * Get Parameters By Types (Multiple)
   * Returns parameters for multiple parameter types at once
   * Migrated from legacy apps.service.ts -> GetParametersByTypes()
   */
  GetParametersByTypes(types: string[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/GetParametersByTypes`,
      types,
      { headers }
    );
  }

  // ============================================
  // FILE UPLOAD METHODS
  // ============================================

  /**
   * Add SQA Temp File
   * Uploads a new SQA data file (creates temporary structure)
   * Uses FormData for file upload with custom headers
   * Migrated from legacy component -> service_AddFile()
   */
  AddSQATempFile(
    formData: FormData,
    custId: string,
    projId: string,
    dataDumpName: string,
    dataDumpType: string,
    createdBy: string
  ): Observable<any[]> {
    // Create headers with custom metadata
    const headers = new HttpHeaders({
      'CUSTOMER_ID': custId,
      'PROJECT_ID': projId,
      'DATA_DUMP_NAME': dataDumpName,
      'DATA_DUMP_TYPE': dataDumpType,
      'CREATED_BY': createdBy,
      'token': localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || ''
    });

    return this.http.post<any[]>(
      `${this.apiurl}/AddSQATempFile`,
      formData,
      { headers }
    );
  }

  /**
   * Upload SQA Report File
   * Uploads SQA data file for an existing report type
   * Uses FormData for file upload with custom headers
   * Migrated from legacy component -> service_UploadFile()
   */
  UploadSQAReportFile(
    formData: FormData,
    custId: string,
    projId: string,
    dataDumpName: string,
    reportId: string,
    dataDumpType: string,
    createdBy: string
  ): Observable<any[]> {
    // Create headers with custom metadata
    const headers = new HttpHeaders({
      'CUSTOMER_ID': custId,
      'PROJECT_ID': projId,
      'DATA_DUMP_NAME': dataDumpName,
      'REPORT_ID': reportId,
      'DATA_DUMP_TYPE': dataDumpType,
      'CREATED_BY': createdBy,
      'token': localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || ''
    });

    return this.http.post<any[]>(
      `${this.apiurl}/UploadSQAReportFile`,
      formData,
      { headers }
    );
  }

  // ============================================
  // SQA CHART MANAGEMENT
  // ============================================

  /**
   * Get SQA Project Chart
   * Generates a chart based on provided parameters
   * Migrated from legacy apps.service.ts -> GetSQAProjectChart()
   */
  GetSQAProjectChart(params: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetSQAProjectChart`,
      params,
      { headers }
    );
  }

  /**
   * Add SQA Project Chart
   * Adds a new chart configuration to a project
   * Migrated from legacy apps.service.ts -> AddSQAProjectChart()
   */
  AddSQAProjectChart(params: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddProjectChart`,
      params,
      { headers }
    );
  }

  /**
   * Update SQA Project Chart
   * Updates an existing chart configuration
   * Migrated from legacy apps.service.ts -> UpdateSQAProjectChart()
   */
  UpdateSQAProjectChart(params: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateProjectChart`,
      params,
      { headers }
    );
  }

  /**
   * Delete SQA Project Chart
   * Removes a chart configuration from a project
   * Migrated from legacy apps.service.ts -> DeleteSQAProjectChart()
   */
  DeleteSQAProjectChart(params: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteProjectChart`,
      params,
      { headers }
    );
  }

  /**
   * Delete SQA Chart Filter
   * Removes a filter from a chart configuration
   * Migrated from legacy apps.service.ts -> DeleteSQAChartFilter()
   */
  DeleteSQAChartFilter(filter: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteSQAChartFilter`,
      filter,
      { headers }
    );
  }

  // ============================================
  // CSP DETAILS / SIDEBAR METHODS
  // ============================================

  /**
   * Get CSP Details for Customer
   * Retrieve client and project details for a customer
   * Migrated from legacy apps.service.ts -> getGetCSPDetails_Customer()
   */
  getGetCSPDetails_Customer(customerEmailId: string): Observable<any[]> {
    const token = localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    const date = new Date();
    
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      'empId': empId
    });
    
    return this.http.get<any[]>(
      `${this.apiurl}/GetCCSPDetails?CustomerEmailid=${customerEmailId}&CurrentDate=${date.toDateString()}`,
      { headers }
    );
  }

  /**
   * Get CSP Details for Employee
   * Retrieve client and project details for an employee
   * Migrated from legacy apps.service.ts -> getGetCSPDetails_Employee()
   */
  getGetCSPDetails_Employee(empid: string, date?: Date, clientId?: string): Observable<any[]> {
    const token = localStorage.getItem('token') || '';
    const empIdFromStorage = localStorage.getItem('empid') || '';
    const currentDate = date || new Date();
    const custId = clientId || '';
    
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      'empId': empIdFromStorage
    });
    
    return this.http.get<any[]>(
      `${this.apiurl}/GetCSPDetails?EmpId=${empid}&CurrentDate=${currentDate.toDateString()}&customerId=${custId}`,
      { headers }
    );
  }

  // ============================================
  // CUSTOMER SATISFACTION SURVEY (CSS) METHODS
  // ============================================

  /**
   * Get CSS Survey Questions
   * Retrieves survey questions and customer/project details for a specific survey code
   * Used by customer-facing survey form (public access via email link)
   * Migrated from legacy apps.service.ts -> GetCSSSurveyQuestions()
   * 
   * @param code - Survey GUID from email invitation link
   * @param showQualitativeFeedback - Whether to include qualitative feedback questions
   * @param showCSSFields - Whether to include CSS-specific fields (meeting date, CSM notification)
   * @returns Observable of BatchCustomerAndQuestions with survey data
   */
  GetCSSSurveyQuestions(
    code: string, 
    showQualitativeFeedback: boolean, 
    showCSSFields: boolean
  ): Observable<any> {
    const headers = new HttpHeaders({
      Accept: "application/json"
      // Note: No token/empId headers - this is a public endpoint accessed by customers
    });
    
    // Ensure boolean values are not undefined (default to false)
    const qualitativeFeedback = showQualitativeFeedback ?? false;
    const cssFields = showCSSFields ?? false;
    
    return this.http.get<any>(
      `${this.apiurl_auth}/GetCSSSurveyQuestions?Code=${code}&showQualitativeFeedback=${qualitativeFeedback}&showCSSFields=${cssFields}`,
      { headers }
    );
  }

  /**
   * Save CSS Survey Answers
   * Submits or saves as draft the customer satisfaction survey responses
   * Used by customer-facing survey form
   * Migrated from legacy apps.service.ts -> SaveCSSSurveyAnswers()
   * 
   * @param replies - BatchCustomerAndQuestions object containing all survey answers
   * @param empId - Employee ID (for internal CSM filling survey, empty for customers)
   * @param saveAsDraft - true to save as draft, false to submit final
   * @param meetingDate - Meeting date (if showCSSFields is true)
   * @param isCSMNotified - Whether CSM should be notified (if showCSSFields is true)
   * @returns Observable of BatchCustomerAndQuestions with updated data
   */
  SaveCSSSurveyAnswers(
    replies: any,
    empId: string,
    saveAsDraft: boolean,
    meetingDate: Date | undefined,
    isCSMNotified: boolean
  ): Observable<any> {
    const headers = new HttpHeaders({ 
      Accept: "application/json" 
    });
    
    let formattedMeetingDate: string | undefined;
    if (meetingDate != null && meetingDate != undefined) {
      formattedMeetingDate = meetingDate.toISOString();
    }

    return this.http.post<any>(
      `${this.apiurl_auth}/SaveCSSSurveyAnswers?empId=${empId}&saveAsDraft=${saveAsDraft}&isCSMNotified=${isCSMNotified}&meetingDate=${formattedMeetingDate}`,
      replies,
      { headers }
    );
  }

  // ============================================
  // MASTER KPI METHODS
  // ============================================

  /**
   * Get All KPI Master List
   * Retrieves the complete list of master KPIs available for selection
   * Used by master-kpi dialog component to show available KPIs
   * Migrated from legacy apps.service.ts -> getAllKpiMasterList()
   * 
   * @returns Observable<any[]> - Array of master KPI objects
   */
  getAllKpiMasterList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllKpiMasterData`,
      { headers }
    );
  }

  /**
   * Add KPI List
   * Adds selected KPIs from master list to a product
   * Used by master-kpi dialog component after user selects KPIs
   * Migrated from legacy apps.service.ts -> addKpiList()
   * 
   * @param selectedKPI - Array of selected KPI objects with mapped IDs
   * @returns Observable<any[]> - Result of the add operation
   */
  addKpiList(selectedKPI: any[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/AddKpiList`,
      selectedKPI,
      { headers }
    );
  }

  // ============================================
  // KPI GOALS METHODS (Customer Goals - Tab 1)
  // ============================================

  /**
   * Get KPI Goals
   * Retrieves all customer goals for a specific project
   * Used by KpiGoalsComponent to display goals table
   * Migrated from legacy apps.service.ts -> GetKpiGoals()
   * 
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @returns Observable<any[]> - Array of KPI goal objects
   */
  GetKpiGoals(customerId: string, projectId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetKPIGoals?CustomerId=${customerId}&ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Add KPI Goal
   * Creates a new customer goal
   * Used by KpiGoalsComponent when user saves a new goal
   * Migrated from legacy apps.service.ts -> AddKpiGoal()
   * 
   * @param goal - KPI goal object with all properties
   * @returns Observable<any> - Created goal with generated ID
   */
  AddKpiGoal(goal: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddKPIGoal`,
      goal,
      { headers }
    );
  }

  /**
   * Update KPI Goal
   * Updates an existing customer goal
   * Used by KpiGoalsComponent when user edits a goal
   * Migrated from legacy apps.service.ts -> UpdateKpiGoal()
   * 
   * @param goal - KPI goal object with updated properties
   * @returns Observable<any> - Updated goal
   */
  UpdateKpiGoal(goal: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateKPIGoal`,
      goal,
      { headers }
    );
  }

  /**
   * Update KPI Definition
   * Updates an existing KPI definition with targets
   * Used by KpiDefinitionsComponent when user edits a KPI
   * Migrated from legacy apps.service.ts -> UpdateKpiDefinition()
   * 
   * @param definition - KPI definition object with updated properties
   * @returns Observable<any> - Updated KPI definition
   */
  UpdateKpiDefinition(definition: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateKPI`,
      definition,
      { headers }
    );
  }

  /**
   * Delete KPI Goal
   * Deletes an existing customer goal
   * Used by KpiGoalsComponent when user confirms deletion
   * Migrated from legacy apps.service.ts -> DeleteKpiGoal()
   * 
   * @param goal - KPI goal object to delete
   * @returns Observable<any> - Delete operation result
   */
  DeleteKpiGoal(goal: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteKPIGoal`,
      goal,
      { headers }
    );
  }

  /**
   * Get KPI Definitions
   * Retrieves all KPI definitions for a specific customer and project
   * Used by KpiDefinitionsComponent to display KPIs table
   * Migrated from legacy apps.service.ts -> GetKpiDefinitions()
   * 
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @returns Observable<any[]> - Array of KPI definition objects
   */
  GetKpiDefinitions(customerId: string, projectId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetKPIDefinitions?CustomerId=${customerId}&ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Get KPI Definitions By Goal
   * Retrieves KPI definitions filtered by a specific goal
   * Used by KpiDefinitionsComponent when a goal is selected
   * Migrated from legacy apps.service.ts -> GetKpiDefinitionsByGoal()
   * 
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param goalId - Goal ID to filter by
   * @returns Observable<any[]> - Array of KPI definition objects for the goal
   */
  GetKpiDefinitionsByGoal(customerId: string, projectId: string, goalId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetKPIDefinitionsByGoal?CustomerId=${customerId}&ProjectId=${projectId}&GoalId=${goalId}`,
      { headers }
    );
  }

  /**
   * Add KPI Definition
   * Creates a new KPI definition with targets
   * Used by KpiDefinitionsComponent when user adds a new KPI
   * Migrated from legacy apps.service.ts -> AddKpiDefinition()
   * 
   * @param definition - KPI definition object with targets
   * @returns Observable<any> - Created KPI definition
   */
  AddKpiDefinition(definition: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddKPI`,
      definition,
      { headers }
    );
  }

  /**
   * Delete KPI Definition
   * Deletes an existing KPI definition and its targets
   * Used by KpiDefinitionsComponent when user deletes a KPI
   * Migrated from legacy apps.service.ts -> DeleteKpiDefinition()
   * 
   * @param definition - KPI definition object to delete
   * @returns Observable<any> - Delete operation result
   */
  DeleteKpiDefinition(definition: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteKPI`,
      definition,
      { headers }
    );
  }

  /**
   * Delete KPI Target
   * Deletes a specific KPI target period
   * Used by KpiDefinitionsComponent when user deletes a target period
   * Migrated from legacy apps.service.ts -> DeleteKpiTarget()
   * 
   * @param kpitarget - KPI target object to delete (with kpi_ID property)
   * @returns Observable<any> - Delete operation result
   */
  DeleteKpiTarget(kpitarget: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteKPITarget`,
      kpitarget,
      { headers }
    );
  }

  /**
   * Get Audit Causes (Root Causes)
   * Retrieves list of root causes for CAPA (Corrective Action Plan)
   * Used by KpiActionPlanComponent for root cause selection dropdown
   * Migrated from legacy apps.service.ts -> getAuditCauses()
   * 
   * @returns Observable<any> - Array of root cause objects with id and name
   */
  getAuditCauses(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetAuditCauses`,
      { headers }
    );
  }

  /**
   * Get Audit Findings CAPA
   * Retrieves CAPA structure for selected root causes
   * Used by KpiActionPlanComponent when user selects causes from dropdown
   * Migrated from legacy apps.service.ts -> getAuditFindingsCappa()
   * 
   * @param auditcapa - Audit finding stage object
   * @param causeIds - Array of selected cause IDs
   * @param isFromFinding - Whether called from finding (0 = from KPI)
   * @returns Observable<any> - Array of CAPA items for selected causes
   */
  getAuditFindingsCappa(auditcapa: any, causeIds: any[], isFromFinding: number): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token,
      'empId': localStorage.getItem('empid') || '0',
      'causeIds': (causeIds && causeIds.length > 0) ? causeIds.toString() : '0',
      'isFromFinding': isFromFinding.toString()
    });
    return this.http.post<any>(
      `${this.apiurl}/GetAuditFindingCappas`,
      auditcapa,
      { headers }
    );
  }

  /**
   * Get CAPA Stages for KPI
   * Retrieves all CAPA stages (Submission, Review, Customer Approval, Implementation, Verification) for a KPI
   * Used by KpiActionPlanComponent to load the 5-stage CAPA workflow
   * Migrated from legacy apps.service.ts -> getCAPAStagesForKPI()
   * 
   * @param kpiDetailsId - KPI Detail ID
   * @returns Observable<any> - AuditFindingStage object with all 5 stages and their CAPA data
   */
  getCAPAStagesForKPI(kpiDetailsId: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetCAPAStagesForKPI?kpiDetailId=${kpiDetailsId}`,
      { headers }
    );
  }

  /**
   * Add CAPA for KPI (Stage 1 - Submission)
   * Submits or resubmits CAPA submission data for a KPI
   * Used by KpiActionPlanComponent.SaveCheckListCAPA() to save CAPA submission
   * Migrated from legacy apps.service.ts -> addCAPAForKPI()
   * 
   * @param capaStatus - AuditFindingStage object with CAPA submission data
   * @param selectedPeriod - Selected period for the KPI
   * @returns Observable<any> - Updated AuditFindingStage object
   */
  addCAPAForKPI(capaStatus: any, selectedPeriod: any): Observable<any> {
    const headers = this.getAuthHeadersWithPeriod(selectedPeriod);
    return this.http.post<any>(
      `${this.apiurl}/AddCAPAForKPI`,
      capaStatus,
      { headers }
    );
  }

  /**
   * Add CAPA Review Details for KPI (Stage 2 - Review)
   * Approves or rejects CAPA submissions during review stage
   * Used by KpiActionPlanComponent.SubmitCap() to save review decisions
   * Migrated from legacy apps.service.ts -> addCAPReviewDetailsForKPI()
   * 
   * @param capReviewDetails - Array of CAPA review items with approval/rejection status
   * @param selectedPeriod - Selected period for the KPI
   * @returns Observable<any> - Response data
   */
  addCAPReviewDetailsForKPI(capReviewDetails: any, selectedPeriod: any): Observable<any> {
    const headers = this.getAuthHeadersWithPeriod(selectedPeriod);
    return this.http.post<any>(
      `${this.apiurl}/addCAPReviewDetailsForKPI`,
      capReviewDetails,
      { headers }
    );
  }

  /**
   * Add CAPA Approval by Customer (Stage 3 - Customer Approval)
   * Records customer approval or rejection of CAPA
   * Used by KpiActionPlanComponent.CapApprovedByCustomer() to save customer approval
   * Migrated from legacy apps.service.ts -> addCAPAApprovalByCustomer()
   * 
   * @param capApprovedByCustomerDetails - Array of CAPA items with customer approval status
   * @param selectedPeriod - Selected period for the KPI
   * @returns Observable<any> - Response data
   */
  addCAPAApprovalByCustomer(capApprovedByCustomerDetails: any, selectedPeriod: any): Observable<any> {
    const headers = this.getAuthHeadersWithPeriod(selectedPeriod);
    return this.http.post<any>(
      `${this.apiurl}/AddCAPAApprovalByCustomer`,
      capApprovedByCustomerDetails,
      { headers }
    );
  }

  /**
   * Add CAPA Approval by QA Spoc (Stage 3 - QA Approval)
   * Records QA Spoc approval or rejection of CAPA
   * Used by KpiActionPlanComponent.CapApprovedByQASpoc() to save QA approval
   * Migrated from legacy apps.service.ts -> addCAPAApprovalByQASpoc()
   * 
   * @param capApprovedByQASpocDetails - Array of CAPA items with QA approval status
   * @param selectedPeriod - Selected period for the KPI
   * @returns Observable<any> - Response data
   */
  addCAPAApprovalByQASpoc(capApprovedByQASpocDetails: any, selectedPeriod: any): Observable<any> {
    const headers = this.getAuthHeadersWithPeriod(selectedPeriod);
    return this.http.post<any>(
      `${this.apiurl}/AddCAPAApprovalByQASpoc`,
      capApprovedByQASpocDetails,
      { headers }
    );
  }

  /**
   * Add CAPA Implementation Details for KPI (Stage 4 - Implementation)
   * Records implementation status of approved CAPA
   * Used by KpiActionPlanComponent.ImplementCap() to save implementation status
   * Migrated from legacy apps.service.ts -> addCAPImplementationDetailsForKPI()
   * 
   * @param capImplementationDetails - Array of CAPA items with implementation status
   * @param selectedPeriod - Selected period for the KPI
   * @returns Observable<any> - Response data
   */
  addCAPImplementationDetailsForKPI(capImplementationDetails: any, selectedPeriod: any): Observable<any> {
    const headers = this.getAuthHeadersWithPeriod(selectedPeriod);
    return this.http.post<any>(
      `${this.apiurl}/AddCAPImplementationDetailsForKPI`,
      capImplementationDetails,
      { headers }
    );
  }

  /**
   * Add CAPA Verification Details for KPI (Stage 5 - Verification)
   * Records verification status (Passed/Failed) of implemented CAPA
   * Used by KpiActionPlanComponent.VerifyCAPImplementation() to save verification results
   * Migrated from legacy apps.service.ts -> addCAPVerificationDetailsForKPI()
   * 
   * @param capVerificationDetails - Array of CAPA items with verification status
   * @param selectedPeriod - Selected period for the KPI
   * @returns Observable<any> - Response data
   */
  addCAPVerificationDetailsForKPI(capVerificationDetails: any, selectedPeriod: any): Observable<any> {
    const headers = this.getAuthHeadersWithPeriod(selectedPeriod);
    return this.http.post<any>(
      `${this.apiurl}/AddCAPVerificationDetailsForKPI`,
      capVerificationDetails,
      { headers }
    );
  }

  /**
   * Get Auth Headers with Period
   * Helper method to create headers with selectedPeriod header
   * Used by all CAPA workflow API methods
   * 
   * @param selectedPeriod - Selected period for the KPI
   * @returns HttpHeaders with auth headers + selectedPeriod
   */
  private getAuthHeadersWithPeriod(selectedPeriod: any): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token,
      'empId': localStorage.getItem('empid') || '',
      'selectedPeriod': selectedPeriod != null ? selectedPeriod.toString() : ''
    });
  }

  /**
   * Get Product Manager by Product ID
   * Retrieves list of product managers/responsible employees for a given product
   * Used by KpiActionPlanComponent to populate responsible employee dropdown in CAPA workflow
   * Migrated from legacy apps.service.ts -> getProductManagerByProductId()
   * 
   * @param prodId - Product ID
   * @returns Observable<any[]> - Array of employee info objects
   */
  getProductManagerByProductId(prodId: any): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProductManagerByProduct?prodId=${prodId}`,
      { headers }
    );
  }

  /**
   * Get Customer CAPA Approval Status
   * Retrieves list of possible customer CAPA approval statuses
   * Used by KpiActionPlanComponent to populate customer approval status dropdown
   * Migrated from legacy apps.service.ts -> getCustomerCAPAApprovalStatus()
   * 
   * @returns Observable<any[]> - Array of approval status objects
   */
  getCustomerCAPAApprovalStatus(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerCAPAApprovalStatus`,
      { headers }
    );
  }

  /**
   * Check if CAPA Approval is Allowed
   * Checks if the current user is allowed to approve CAPA for a given product and KPI
   * Used by KpiActionPlanComponent to enable/disable review buttons
   * Migrated from legacy apps.service.ts -> IsCAPAApprovalAllowed()
   * 
   * @param prodId - Product ID
   * @param selectedPeriod - Selected period for the KPI
   * @param kpiDetailsId - KPI Detail ID
   * @returns Observable<any[]> - Array indicating approval permission
   */
  IsCAPAApprovalAllowed(prodId: any, selectedPeriod: any, kpiDetailsId: any): Observable<any[]> {
    const headers = this.getAuthHeadersWithPeriod(selectedPeriod);
    return this.http.get<any[]>(
      `${this.apiurl}/IsCAPAApprovalAllowed?prodId=${prodId}&selectedPeriod=${selectedPeriod}&kpiDetailsId=${kpiDetailsId}`,
      { headers }
    );
  }

  // ============================================
  // KPI DETAILS METHODS (KPI Achievements - Tab 3)
  // ============================================

  /**
   * Get KPI Details Monthly and Weekly
   * Retrieves KPI details for monthly, quarterly, and weekly KPIs for a specific date
   * Used by KpiDetailsComponent to load all three KPI tables (monthly/quarterly/weekly)
   * Migrated from legacy apps.service.ts -> getKPIDetailsMonthlyandWeekly()
   * 
   * @param custId - Customer ID
   * @param projId - Project ID
   * @param date - Date string in format 'YYYY-MM-DD'
   * @returns Observable<any[]> - Array of KPI detail objects with actuals and targets
   */
  getKPIDetailsMonthlyandWeekly(custId: string, projId: string, date: string): Observable<any[]> {
    if (date !== "Invalid Date") {
      const headers = this.getAuthHeaders();
      return this.http.get<any[]>(
        `${this.apiurl}/GetKPIDetailsMonthlyAndWeekly?CustomerId=${custId}&ProjectId=${projId}&date=${date}`,
        { headers }
      );
    } else {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
  }

  /**
   * Get KPI Additional Data
   * Retrieves additional data for KPIs (base measures, CAPA info, etc.)
   * Used by KpiDetailsComponent to load base measure and CAPA links
   * Migrated from legacy apps.service.ts -> getKpiAdditionalData()
   * 
   * @param detail - KPI detail objects array
   * @returns Observable<any> - Additional data including base measures and CAPA
   */
  getKpiAdditionalData(detail: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetKpiAdditionalData`,
      detail,
      { headers }
    );
  }

  /**
   * Get Color for KPI
   * Calculates SLA status color based on actual vs target
   * Used by KpiDetailsComponent to color-code KPI achievements (Red/Orange/Green/Blue)
   * Migrated from legacy apps.service.ts -> getColorforKPI()
   * 
   * @param kpiActual - KPI actual value object with achievement data
   * @param kpiId - KPI ID for target lookup
   * @returns Observable<any> - Color code and SLA status (Met/Not Met)
   */
  getColorforKPI(kpiActual: any, kpiId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetColorforKPI?kpiActual=${kpiActual}&kpiId=${kpiId}`,
      { headers }
    );
  }

  /**
   * Add KPI Details
   * Saves KPI achievements (actuals) for monthly, quarterly, and weekly KPIs
   * Used by KpiDetailsComponent when user saves all KPI actuals
   * Migrated from legacy apps.service.ts -> AddKpiDetails()
   * 
   * @param detail - KPI detail array with all actuals to save
   * @returns Observable<any> - Save operation result
   */
  AddKpiDetails(detail: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddKPIDetails`,
      detail,
      { headers }
    );
  }

  /**
   * Get KPI Metrics for Product View
   * Retrieves KPI metrics for a specific product, mode, and date
   * Used by KpiProductViewComponent to load all KPIs for the selected period
   * Migrated from legacy apps.service.ts -> getKpiMetrics()
   * 
   * @param prodId - Product ID
   * @param modeId - Service mode ID (integer)
   * @param date - Date string in format 'YYYY-MMM-01'
   * @param shouldLoadAdditionalData - Flag to include additional data
   * @returns Observable<any[]> - Array of KPI metric objects
   */
  getKpiMetrics(prodId: number, modeId: number, date: string, shouldLoadAdditionalData: boolean): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetKpiMetrics?prodId=${prodId}&modeId=${modeId}&date=${date}&shouldLoadAdditionalData=${shouldLoadAdditionalData}`,
      { headers }
    );
  }

  /**
   * Get KPI Metrics Additional Data for Product View
   * Retrieves detailed base measure data, exclusion data, and CAPA info for product KPIs
   * Used by KpiProductViewComponent to load base measures and CAPA links
   * Migrated from legacy apps.service.ts -> getKpiMetricsAdditionalData()
   * 
   * @param detail - Array of KPI metric objects
   * @returns Observable<any> - Additional data with base measures and CAPA
   */
  getKpiMetricsAdditionalData(detail: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetKpiMetricsAdditionalData`,
      detail,
      { headers }
    );
  }

  /**
   * Get KPI Achievement Percentage
   * Calculates KPI achievement percentage based on base measure values
   * Used by KpiProductDetailViewComponent when saving base measures
   * Migrated from legacy apps.service.ts -> getKpiAchievement()
   * 
   * @param detail - Array of base measure data with numerator/denominator
   * @param kpiId - KPI identifier
   * @returns Observable<any> - Achievement calculation result
   */
  getKpiAchievement(detail: any, kpiId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetKpiAchievementPercentage?kpiId=${kpiId}`,
      detail,
      { headers }
    );
  }

  /**
   * Get External KPI Data By Base Measure
   * Retrieves detailed drill-down data for numerator/denominator values
   * Used for Excel export from KpiProductDetailViewComponent
   * Migrated from legacy apps.service.ts -> GetExternalKPIDataByBaseMeasure()
   * 
   * @param kpiDetailsId - KPI detail identifier
   * @returns Observable<any[]> - Array of drill-down records
   */
  GetExternalKPIDataByBaseMeasure(kpiDetailsId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetExternalKPIDataByBaseMeasure?kpiDetailsId=${kpiDetailsId}`,
      { headers }
    );
  }

  /**
   * Add KPI Details by Product
   * Saves KPI achievements for product-based view (with draft/submit status)
   * Used by KpiProductViewComponent when user saves/submits KPI actuals
   * Migrated from legacy apps.service.ts -> AddKpiDetailsbyProduct()
   * 
   * @param detail - KPI detail object with all actuals to save
   * @param date - Date string for the KPI period
   * @param status - Draft status (0 = submitted, 1 = draft)
   * @returns Observable<any> - Save operation result
   */
  AddKpiDetailsbyProduct(detail: any, date: string, status: number): Observable<any> {
    const headers = this.getAuthHeadersWithDraft(status);
    return this.http.post<any>(
      `${this.apiurl}/AddKpiDetailsByProduct?date=${date}`,
      detail,
      { headers }
    );
  }

  /**
   * Get DB Config Value Fields (Array)
   * Retrieves database configuration values for a specific key (returns array/comma-separated string)
   * Used by KpiProductViewComponent to check exclusion-enabled customers
   * Migrated from legacy apps.service.ts -> GetDBConfigValueFields()
   * 
   * @param key - Configuration key (e.g., "EXCLUSION_ENABLED_CUSTOMERS")
   * @param cust_id - Customer ID (-1 for global config)
   * @param proj_id - Project ID ("" for customer-level config)
   * @returns Observable<string> - Configuration value (comma-separated string)
   */
  getDBConfigValueFields(key: string, cust_id: number, proj_id: string): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.get<string>(
      `${this.apiurl}/GetDBConfigArrayValues?key=${key}&custId=${cust_id}&projId=${proj_id}`,
      { headers }
    );
  }

  /**
   * Get Product Name
   * Retrieves the product name for a given product ID
   * Used by KpiProductViewComponent to display product name in header
   * Migrated from legacy apps.service.ts -> GetProductName()
   * 
   * @param prodId - Product ID
   * @returns Observable<string> - Product name
   */
  getProductName(prodId: number): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.get<string>(
      `${this.apiurl}/GetProductName?prodId=${prodId}`,
      { headers }
    );
  }

  /**
   * Revert Product KPI Details
   * Reverts KPI details for a product to a previous state
   * Used by successgoal component for KPI management
   * Migrated from legacy apps.service.ts -> revertProductKPIDetails()
   * 
   * @param prodId - Product ID
   * @param month - Month to revert
   * @param year - Year to revert
   * @returns Observable<any> - Result of revert operation
   */
  revertProductKPIDetails(prodId: number, month: string, year: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/RevertProductKPIDetails?prodId=${prodId}&month=${month}&year=${year}`,
      { headers }
    );
  }

  /**
   * Get Overall Service Metrics for a Period
   * Retrieves aggregated service metrics for a customer across a specific month/year
   * Used by successgoal component for product scores display
   * Migrated from legacy apps.service.ts -> getOverallServiceMetricsForAPeriod()
   * 
   * @param custId - Customer ID
   * @param month - Month name
   * @param year - Year
   * @returns Observable<any> - Array of service metrics
   */
  getOverallServiceMetricsForAPeriod(custId: string, month: string, year: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetOverallServiceMetricsForAPeriod?customerId=${custId}&Month=${month}&Year=${year}`,
      { headers }
    );
  }

  /**
   * Get Employee Roles for Product
   * Retrieves employee role information for a specific product
   * Used by successgoal component to determine reviewer permissions
   * Migrated from legacy apps.service.ts -> getEmployeeRolesForProduct()
   * 
   * @param productId - Product ID
   * @returns Observable<any> - Employee role data
   */
  getEmployeeRolesForProduct(productId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetEmployeeRolesForProduct?productId=${productId}`,
      { headers }
    );
  }

  /**
   * Send KPI Details Review Feedback
   * Sends KPI metrics to customers for review
   * Used by successgoal component to submit metrics for customer feedback
   * Migrated from legacy apps.service.ts -> sendKPIDetailsReviewFeedback()
   * 
   * @param productId - Product ID
   * @param date - Period date
   * @returns Observable<any> - Result of send operation
   */
  sendKPIDetailsReviewFeedback(productId: number, date: string): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || '',
      'requestdate': date
    });
    return this.http.get<any>(
      `${this.apiurl}/SendKPIReviewFeedback?productId=${productId}&period=${date}`,
      { headers }
    );
  }

  /**
   * Update SLA Rejection
   * Updates SLA rejection status and comments
   * Used by successgoal component for SLA rejection workflow
   * Migrated from legacy apps.service.ts -> updateSLARejection()
   * 
   * @param detail - SLA rejection details
   * @param date - Request date
   * @returns Observable<any> - Updated rejection data
   */
  updateSLARejection(detail: any, date: string): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || '',
      'requestdate': date
    });
    return this.http.post<any>(
      `${this.apiurl}/UpdateSLARejection`,
      detail,
      { headers }
    );
  }

  /**
   * Send Review Feedback
   * Sends review feedback for KPI metrics
   * Used by successgoal component for review feedback workflow
   * Migrated from legacy apps.service.ts -> sendReviewFeedback()
   * 
   * @param detail - Review feedback details
   * @param productId - Product ID
   * @param date - Request date
   * @returns Observable<any> - Feedback submission result
   */
  sendReviewFeedback(detail: any, productId: number, date: string): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || '',
      'requestdate': date
    });
    return this.http.post<any>(
      `${this.apiurl}/SendKPIReviewFeedback?productId=${productId}&period=${date}`,
      detail,
      { headers }
    );
  }

  /**
   * Process External KPIs
   * Processes uploaded external KPI data for a customer
   * Used by KpiComponent when user clicks "Process External KPIs" button
   * Migrated from legacy apps.service.ts -> ProcessExternalKPIs()
   * 
   * @param custId - Customer ID (string or number)
   * @param date - Processing date string
   * @returns Observable<any> - Processing result message
   */
  ProcessExternalKPIs(custId: string | number, date: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/ProcessExternalKPIs?custId=${custId}&date=${date}`,
      { headers }
    );
  }

  // ============================================
  // CHECKLIST ASSESSMENT / AUDIT METHODS
  // ============================================

  /**
   * Enable Checklist Status
   * Updates the checklist status (enable/disable) for audit execution
   * Used by checklist-assessment-page to enable/disable checklist
   * Migrated from legacy apps.service.ts -> enableChecklistStatus()
   * 
   * @param checklist - Checklist object with status information
   * @returns Observable<any> - Result of status update
   */
  enableChecklistStatus(checklist: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/EnableChecklistStatus`,
      checklist,
      { headers }
    );
  }

  /**
   * Get CC List For Checklist
   * Retrieves list of employees to be CC'd on audit checklist emails
   * Used by checklist-assessment-page for email notification recipients
   * Migrated from legacy apps.service.ts -> getCCListForChecklist()
   * 
   * @param projectId - Customer ID
   * @returns Observable<EmpInfoModel[]> - Array of employee information
   */
  getCCListForChecklist(projectId: string): Observable<EmpInfoModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<EmpInfoModel[]>(
      `${this.apiurl}/GetCCListForChecklist?&custId=${projectId}`,
      { headers }
    );
  }

  /**
   * Get Planned Audits
   * Retrieves list of planned audits for a customer/project
   * Used by checklist-assessment-page to load available audits
   * Migrated from legacy apps.service.ts -> getPlannedAudits()
   * 
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @returns Observable<any[]> - Array of planned audit objects
   */
  getPlannedAudits(customerId: string, projectId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetPlannedAudits?CustomerId=${customerId}&ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Get Audit Details
   * Retrieves test details and audit data for audit execution
   * Used by audit-execution component to load tests and evaluation data
   * Migrated from legacy apps.service.ts -> getAuditDetails()
   * 
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param serviceareas - Array of service area IDs
   * @param title - Audit title
   * @param startdate - Audit start date
   * @param enddate - Audit end date
   * @param auditorname - Auditor employee ID
   * @param auditeenames - Array of auditee employee IDs
   * @returns Observable<any> - Object with testS_VIEW_MODELS and audiT_DATA arrays
   */
  getAuditDetails(
    customerId: string,
    projectId: string,
    serviceareas: number[],
    title: string,
    startdate: Date,
    enddate: Date,
    auditorname: number,
    auditeenames: number[]
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const data = {
      custid: customerId,
      projid: projectId,
      serviceareas: serviceareas,
      audittitle: title,
      startdate: startdate,
      enddate: enddate,
      auditorname: auditorname,
      auditessname: auditeenames
    };
    return this.http.post<any>(
      `${this.apiurl}/GetAuditDetails`,
      data,
      { headers }
    );
  }

  /**
   * Get Dropdown Parameters for Audit
   * Retrieves dropdown options for audit execution (auditors, test results, status controls, etc.)
   * Used by audit-execution component to populate form dropdowns
   * Migrated from legacy audit-execution component -> service_getDropDownDataForAudit()
   * 
   * @returns Observable<any> - Object with dropdown arrays (auditoR_LIST, tesT_RESULTS, statuS_CONTROLS, etc.)
   */
  getDropDownParamsForAudit(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetDropDownParamsForAudit`,
      { headers }
    );
  }

  /**
   * Save Audit Execution Details
   * Saves test evaluation results for audit execution
   * Used by audit-execution component to persist audit findings
   * Migrated from legacy audit-execution component -> service_SaveAuditExecData()
   * 
   * @param auditData - Array of audit execution model objects with test evaluations
   * @returns Observable<any> - Saved audit data
   */
  saveAuditExecDetails(auditData: any[]): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/SaveAuditExecDetails`,
      auditData,
      { headers }
    );
  }

  /**
   * Send Audit Execution Mail
   * Sends email report to auditee with audit results
   * Used by audit-execution component to email audit reports
   * Migrated from legacy audit-execution component -> service_SendMailToAuditee()
   * 
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param auditStartDate - Audit start date
   * @param auditorName - Auditor employee ID
   * @param auditeeName - Array of auditee employee IDs
   * @param auditTitle - Audit title
   * @returns Observable<any> - Email send response
   */
  sendAuditExecutionMail(
    customerId: string,
    projectId: string,
    auditStartDate: Date,
    auditorName: number,
    auditeeName: number[],
    auditTitle: string
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const data = {
      customeR_ID: customerId,
      projecT_ID: projectId,
      audiT_START_DATE: auditStartDate,
      auditoR_NAME: auditorName,
      auditeE_NAME: auditeeName,
      audiT_TITLE: auditTitle
    };
    return this.http.post<any>(
      `${this.apiurl}/SendAuditExecutionMail`,
      data,
      { headers }
    );
  }

  /**
   * Get Open Findings Count
   * Retrieves count of open findings for given audit IDs
   * Used by checklist-assessment-page to display finding counts
   * Migrated from legacy apps.service.ts -> getOpenFindingsCount()
   * 
   * @param auditIds - Comma-separated audit IDs
   * @returns Observable<any> - Object with finding counts
   */
  getOpenFindingsCount(auditIds: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetOpenFindings?auditIds=${auditIds}`,
      { headers }
    );
  }

  /**
   * Get Checklist Data For Project New
   * Retrieves checklist questions/checkpoints for audit execution
   * Used by checklist-assessment-page to load checklist structure
   * Migrated from legacy apps.service.ts -> getCheckListDataForProjNew()
   * 
   * @param auditData - Audit information object
   * @returns Observable<ChecklistNew[]> - Array of checklist structures
   */
  getCheckListDataForProjNew(auditData: any): Observable<ChecklistNew[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<ChecklistNew[]>(
      `${this.apiurl}/GetCheckPointsByAudit`,
      auditData,
      { headers }
    );
  }

  /**
   * Save Audit Checklist Details
   * Saves audit checklist execution details (answers, scores, findings)
   * Used by checklist-assessment-page to save and submit audit results
   * Migrated from legacy apps.service.ts -> SaveAuditChecklistDetails()
   * 
   * @param checklistDatanew - ChecklistExecutionViewModel with all audit data
   * @returns Observable<ChecklistExecutionViewModel> - Saved checklist data
   */
  SaveAuditChecklistDetails(
    checklistDatanew: ChecklistExecutionViewModel
  ): Observable<ChecklistExecutionViewModel> {
    const headers = this.getAuthHeaders();
    return this.http.post<ChecklistExecutionViewModel>(
      `${this.apiurl}/SaveAuditChecklistDetails`,
      checklistDatanew,
      { headers }
    );
  }

  /**
   * Revert checklist assessment data
   * Migrated from legacy apps.service.ts -> revertChecklistAssessmentData()
   * Used for re-submitting assessment after rejection
   * @param plannedAuditData Data with audit details and status
   * @returns Observable of result
   */
  revertChecklistAssessmentData(plannedAuditData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/RevertChecklistAssessmentData`,
      plannedAuditData,
      { headers }
    );
  }

  /**
   * Get customer ID list for checklist
   * Migrated from legacy apps.service.ts -> getCustomerIdForChecklist()
   * Used to get CC and To list based on selected customers
   * @param customerIds Comma-separated customer IDs
   * @returns Observable of employee list
   */
  getCustomerIdForChecklist(customerIds: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCustomerIdForChecklist?customerIds=${customerIds}`,
      { headers }
    );
  }

  /**
   * Resubmit checklist assessment
   * Migrated from legacy apps.service.ts -> resubmitChecklistAssessment()
   * Used to request re-submission of completed assessment
   * @param plannedAudit Planned audit data with comments and status
   * @returns Observable of result
   */
  resubmitChecklistAssessment(plannedAudit: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/ResubmitChecklistAssessment`,
      plannedAudit,
      { headers }
    );
  }

  /**
   * Get mandatory finding types by ID
   * Migrated from legacy apps.service.ts -> getMandatoryFindingTypeById()
   * Used to validate mandatory findings for failed status
   * @param findingTypeId Finding type ID
   * @returns Observable of finding type list
   */
  getMandatoryFindingTypeById(findingTypeId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetMandatoryFindingTypeById?findingTypeId=${findingTypeId}`,
      { headers }
    );
  }

  /**
   * Download file service
   * Migrated from legacy apps.service.ts -> service_DowloadFile()
   * Used to download PDF reports for assessments
   * @param type File type (e.g., 'assessment')
   * @param custId Customer ID
   * @param projId Project ID
   * @param auditId Audit/Assessment ID
   * @returns Observable of Blob for file download
   */
  service_DowloadFile(type: string, custId: string, projId: string, auditId: number): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.apiurl}DownloadFile?category=${type}&custId=${custId}&projectId=${projId}&id=${auditId}`,
      { headers, responseType: 'blob' }
    );
  }
  /**
   * Save auditee acceptance status for findings
   * Migrated from legacy apps.service.ts -> SaveAuditeeAcceptanceStatus()
   * Used by checklist-auditee component for accepting/rejecting findings
   * @param acceptanceList Array of finding acceptance data
   */
  saveAuditeeAcceptanceStatus(acceptanceList: any[]): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.apiurl}/SaveAuditeeAcceptanceStatus`,
      acceptanceList,
      { headers }
    );
  }

  /**
   * Get all auditee responses for an assessment
   * Migrated from legacy apps.service.ts -> getAllAuditeeResponses()
   * Returns acceptance status + remarks for each finding in the assessment
   * @param assessmentId The assessment ID to fetch responses for
   */
  getAllAuditeeResponses(assessmentId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetAllAuditeeResponses?assessmentId=${assessmentId}`,
      { headers }
    );
  }

  /**
   * Get Finding Status Details (all CAPA stages for a finding)
   * Migrated from legacy apps.service.ts -> getFindingStatus()
   * Returns AuditFindingStage with capA_SUBMISSION, capA_REVIEW,
   * caP_IMPLEMENTATION, caP_VERIFICATION, auditeE_ACCEPTANCE_STATUS
   * @param finding The finding object (ObservationModel) to load status for
   */
  getFindingStatus(finding: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetFindingStatusDetails`,
      finding,
      { headers }
    );
  }

  /**
   * Get Audit Evidence files for a finding at a given CAPA stage
   * Migrated from legacy apps.service.ts -> getAuditEvidence()
   * @param findingId The finding ID
   * @param stageId  The CAPA stage (3 = Implementation, 4 = Verification)
   * @param rootCauseId The root cause ID
   */
  getAuditEvidence(findingId: number, stageId: number, rootCauseId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetAuditEvidence?findingId=${findingId}&stageId=${stageId}&rootCauseId=${rootCauseId}`,
      { headers }
    );
  }

  /**
   * Save/Submit CAP for a Finding (Stage 1 - Submission)
   * Migrated from legacy -> service_saveCAPDetailsForFinding() -> POST /AddFindingCAP
   * @param findingStatus The full AuditFindingStage object
   */
  addFindingCAP(findingStatus: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddFindingCAP`,
      findingStatus,
      { headers }
    );
  }

  /**
   * Save CAP Review Details for a Finding (Stage 2 - Review)
   * Migrated from legacy -> service_saveCapReviewDetailsforFinding() -> POST /AddFindingCAPReviewDetails
   * @param capaReviewList capA_REVIEW.capa array
   */
  addFindingCAPReviewDetails(capaReviewList: any[]): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddFindingCAPReviewDetails`,
      capaReviewList,
      { headers }
    );
  }

  /**
   * Save CAP Implementation Details for a Finding (Stage 3 - Implementation)
   * Migrated from legacy -> service_saveCapImplementationDetailsforFinding() -> POST /AddFindingCAPImplementationDetails
   * @param capaImplList caP_IMPLEMENTATION.capa array
   */
  addFindingCAPImplementationDetails(capaImplList: any[]): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddFindingCAPImplementationDetails`,
      capaImplList,
      { headers }
    );
  }

  /**
   * Save CAP Verification Details for a Finding (Stage 4 - Verification)
   * Migrated from legacy -> service_saveCapVerificationDetailsforFinding() -> POST /AddFindingCAPVerificationDetails
   * @param capaVerifList caP_VERIFICATION.capa array
   */
  addFindingCAPVerificationDetails(capaVerifList: any[]): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddFindingCAPVerificationDetails`,
      capaVerifList,
      { headers }
    );
  }

  /**
   * Upload audit evidence files for a CAPA stage
   * Migrated from legacy uploadProjectFile() -> POST /UploadFile
   * @param folderId Folder identifier (can be null for CAPA evidence)
   * @param customerId Customer ID
   * @param projectId Project ID
   * @param formData FormData containing the file(s)
   * @param findingId Finding ID for the evidence
   * @param stageId CAPA stage ID (3 = Implementation, 4 = Verification)
   * @param rootCauseId Root cause ID associated with the finding
   */
  uploadProjectFile(folderId: any, customerId: string, projectId: string,
                    formData: FormData, findingId?: number, stageId?: number, rootCauseId?: number): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid') || '',
    });
    let url = `${this.apiurl}/UploadFile?customerId=${customerId}&projectId=${projectId}`;
    if (folderId !== undefined && folderId !== null) {
      url += `&folderId=${folderId}`;
    }
    if (findingId !== undefined && findingId !== null) {
      url += `&findingId=${findingId}`;
    }
    if (stageId !== undefined && stageId !== null) {
      url += `&stageId=${stageId}`;
    }
    if (rootCauseId !== undefined && rootCauseId !== null) {
      url += `&rootCauseId=${rootCauseId}`;
    }
    return this.http.post<any>(url, formData, { headers });
  }

  /**
   * Download a saved evidence file for CAPA
   * Migrated from legacy downloadFile() -> POST /DownloadFile
   * @param fileData Object containing FileName, FilePath, FileType
   * @param customerId Customer ID
   * @param projectId Project ID
   */
  downloadFile(fileData: any, customerId: string, projectId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid') || '',
    });
    return this.http.post(
      `${this.apiurl}/DownloadFile?customerId=${customerId}&projectId=${projectId}`,
      fileData,
      { headers, responseType: 'blob' }
    );
  }

  /**
   * Delete a saved evidence file for CAPA
   * Migrated from legacy deleteFile() -> POST /DeleteFile
   * @param fileData Object containing ID, FileName
   * @param customerId Customer ID
   * @param projectId Project ID
   */
  deleteFile(fileData: any, customerId: string, projectId: string): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid') || '',
    });
    return this.http.post<any>(
      `${this.apiurl}/DeleteFile?customerId=${customerId}&projectId=${projectId}`,
      fileData,
      { headers }
    );
  }

  /**
   * Get stage colors for findings (CAPA workflow stages)
   * Migrated from legacy apps.service.ts -> GetStageColor()
   * Returns array of findings with stage color information
   * @param findings Array of findings to get stage colors for
   */
  getStageColor(findings: any[]): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.apiurl}/GetStageColor`,
      findings,
      { headers }
    );
  }

  // ============================================
  // PROCESS SERVICE AREA MAPPING METHODS
  // ============================================

  /**
   * Get Service Area Process Mapping
   * Migrated from legacy apps.service.ts -> getServiceAreaProcessMapping()
   * Used by process-service-area-mapping component
   * @returns Observable of process service area mappings
   */
  getServiceAreaProcessMapping(): Observable<ProcessServiceAreaMapping[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProcessServiceAreaMapping[]>(
      `${this.apiurl}/GetServiceAreaProcessMapping`,
      { headers }
    );
  }

  /**
   * Get All Process List By Service Area
   * Migrated from legacy apps.service.ts -> getAllProcessListByServiceArea()
   * Used by process-service-area-mapping component for viewing mappings
   * @returns Observable of process service area mapping list
   */
  getAllProcessListByServiceArea(): Observable<ProcessServiceAreaMappingList[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProcessServiceAreaMappingList[]>(
      `${this.apiurl}/GetAllProcessListByServiceArea`,
      { headers }
    );
  }

  /**
   * Add Service Area New
   * Migrated from legacy apps.service.ts -> AddServiceAreaNew()
   * Creates a new service tower
   * @param serviceArea Service area model to add
   * @returns Observable of created service area
   */
  AddServiceAreaNew(serviceArea: ServiceAreaModelNew): Observable<ServiceAreaModelNew> {
    const headers = this.getAuthHeaders();
    return this.http.post<ServiceAreaModelNew>(
      `${this.apiurl}/AddServiceAreaNew`,
      serviceArea,
      { headers }
    );
  }

  /**
   * Update Service Area New
   * Migrated from legacy apps.service.ts -> UpdateServiceAreaNew()
   * Updates an existing service tower
   * @param serviceArea Service area model to update
   * @returns Observable of updated service area
   */
  UpdateServiceAreaNew(serviceArea: ServiceAreaModelNew): Observable<ServiceAreaModelNew> {
    const headers = this.getAuthHeaders();
    return this.http.post<ServiceAreaModelNew>(
      `${this.apiurl}/UpdateServiceAreaNew`,
      serviceArea,
      { headers }
    );
  }

  /**
   * Delete Service Area New
   * Migrated from legacy apps.service.ts -> DeleteServiceAreaNew()
   * Deletes a service tower
   * @param serviceArea Service area model to delete
   * @returns Observable of deleted service area
   */
  DeleteServiceAreaNew(serviceArea: ServiceAreaModelNew): Observable<ServiceAreaModelNew> {
    const headers = this.getAuthHeaders();
    return this.http.post<ServiceAreaModelNew>(
      `${this.apiurl}/DeleteServiceAreaNew`,
      serviceArea,
      { headers }
    );
  }

  /**
   * Update Process Service Area Mapping
   * Migrated from legacy apps.service.ts -> UpdateProcessServiceAreaMapping()
   * Maps processes to a service tower
   * @param serviceArea Service area to map to
   * @param processList List of processes to map
   * @returns Observable of process models
   */
  UpdateProcessServiceAreaMapping(
    serviceArea: ServiceAreaModelNew,
    processList: ProcessModelNew[]
  ): Observable<ProcessModelNew[]> {
    const headers = this.getAuthHeaders();
    const data = { process: processList, procesS_SERVICE_AREA_NEW: serviceArea };
    return this.http.post<ProcessModelNew[]>(
      `${this.apiurl}/UpdateProcessServiceAreaMapping`,
      data,
      { headers }
    );
  }


  /**
   * Get Service Towers Inscope Mapping List
   * Migrated from legacy apps.service.ts -> getServiceTowersInscopeMappingList()
   * Gets list of in-scope service towers for a project
   * @param projectId Project ID
   * @returns Observable of service towers inscope mapping
   */
  getServiceTowersInscopeMappingList(projectId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetServiceTowersInscopeMappingList?ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Add Service Area Project Mapping
   * Migrated from legacy apps.service.ts -> addServiceAreaProjectMapping()
   * Maps a service tower to a project
   * @param mapping Service area project mapping data
   * @returns Observable of service area project mapping
   */
  addServiceAreaProjectMapping(mapping: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddServiceAreaProjectMapping`,
      mapping,
      { headers }
    );
  }

  /**
   * Delete Service Area Project Mapping
   * Migrated from legacy apps.service.ts -> DeleteServiceAreaProjectMapping()
   * Removes a service tower from a project
   * @param serviceArea Service area mapping to delete
   * @returns Observable of deleted service area mapping
   */
  DeleteServiceAreaProjectMapping(serviceArea: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteServiceAreaProjectMapping`,
      serviceArea,
      { headers }
    );
  }

  /**
   * Get Process By Service Area Grouped
   * Migrated from legacy apps.service.ts -> GetProcessByServiceAreaGrouped()
   * Gets processes grouped by service area, process model, and process area
   * @param serviceAreaId Service Area ID
   * @returns Observable of processes grouped by service area
   */
  GetProcessByServiceAreaGrouped(serviceAreaId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/GetProcessByServiceArea`,
      serviceAreaId,
      { headers }
    );
  }

  /**
   * Get Project Service Area Process Mapping
   * Migrated from legacy apps.service.ts -> GetProjectServiceAreaProcessMapping()
   * Gets process mappings for a project and service area
   * @param projId Project ID
   * @param serviceAreaId Service Area ID
   * @returns Observable of project service area process mappings
   */
  GetProjectServiceAreaProcessMapping(projId: string, serviceAreaId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProjectServiceAreaProcessMapping?ProjectId=${projId}&ServiceAreaId=${serviceAreaId}`,
      { headers }
    );
  }

  /**
   * Service Update Project Service Area Process Mapping
   * Migrated from legacy apps.service.ts -> Service_UpdateProjectServiceAreaProcessMapping()
   * Updates process mappings for a project and service area
   * @param mapping Array of project service area process mappings
   * @returns Observable of updated mappings
   */
  Service_UpdateProjectServiceAreaProcessMapping(mapping: any[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/UpdateProjectServiceAreaProcessMapping`,
      mapping,
      { headers }
    );
  }

  /**
   * Get Findings For Project
   * Migrated from legacy apps.service.ts -> GetFindingsForProject()
   * Gets findings for a project and service area (used to disable process selection if findings exist)
   * @param projId Project ID
   * @param serviceAreaId Service Area ID
   * @returns Observable of project findings
   */
  GetFindingsForProject(projId: string, serviceAreaId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetFindingsForProject?projId=${projId}&serviceAreaId=${serviceAreaId}`,
      { headers }
    );
  }

  /**
   * Get Process Model List
   * Migrated from legacy apps.service.ts -> getProcessModelList()
   * Gets list of all process models (CMMI, ITSM, etc.)
   * @returns Observable of process model list
   */
  getProcessModelList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetProcessModelList`,
      { headers }
    );
  }

  /**
   * Get Service Area for Model
   * Migrated from legacy apps.service.ts -> getServiceAreaforModel()
   * Gets service areas applicable for a process model
   * @param processModel Process model ID or array of IDs
   * @returns Observable of service areas
   */
  getServiceAreaforModel(processModel: any): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/GetServiceAreaforModel`,
      processModel,
      { headers }
    );
  }

  /**
   * Get Applicable Process Area for Service ID
   * Migrated from legacy apps.service.ts -> getApplicableProcessAreaforServiceId()
   * Gets applicable process areas for service tower IDs
   * @param serviceIds Array of service tower IDs
   * @returns Observable of applicable process areas
   */
  getApplicableProcessAreaforServiceId(serviceIds: string[]): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/GetApplicableProcessAreaforServiceId`,
      serviceIds,
      { headers }
    );
  }

  /**
   * Get Process Model Description
   * Migrated from legacy apps.service.ts -> getProcessModelDescription()
   * Gets process model description with service areas and processes
   * @param customerId Customer ID
   * @param projectId Project ID
   * @param serviceArea Service Area
   * @returns Observable of process model description
   */
  getProcessModelDescription(customerId: string, projectId: string, serviceArea: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetProcessModelDescription?CustomerId=${customerId}&ProjectId=${projectId}`,
      serviceArea,
      { headers }
    );
  }

  // ============================================
  // API METHODS - Filter Preferences
  // ============================================

  /**
   * Get filter preferences for a table
   * Migrated from legacy apps.service.ts -> GetFilterPreferences()
   * Used by risk-page and other components for dynamic filtering
   * @param tableName Name of the table to get preferences for
   * @returns Observable of filter preference models
   */
  GetFilterPreferences(tableName: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}/GetFilterPreferences`,
      tableName,
      { headers }
    );
  }

  // ============================================
  // CSS DASHBOARD METHODS
  // ============================================

  /**
   * Get Accounts For CSAT Dashboard
   * Retrieves customer/account list for CSS dashboard filters
   * Migrated from legacy apps.service.ts -> getAccountsForCSATDashboard()
   * Used by cssdashboard-filter component
   * @param allCust Whether user has access to all customers
   * @returns Observable of customer account data with business units
   */
  getAccountsForCSATDashboard(allCust: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetAccountsForCSATDashboard?isHaveAllCustomerAccess=${allCust}`,
      { headers }
    );
  }

  /**
   * Get Business Units
   * Retrieves all business units for multi-select dropdown
   * Migrated from legacy apps.service.ts -> getBusinessUnits()
   * Used by risk-chart component
   * @returns Observable of business units array
   */
  getBusinessUnits(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetBusinessUnits`,
      { headers }
    );
  }

  /**
   * Get Risk Chart Data
   * Retrieves risk matrix data for dashboard
   * Migrated from legacy charts.service.ts -> getRiskChart()
   * Used by MyUtility service -> GetRiskChart()
   * @param riskDashboardInputs Risk dashboard filter inputs
   * @returns Observable of risk chart data
   */
  getRiskChartData(riskDashboardInputs: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetRiskChartData`,
      riskDashboardInputs,
      { headers }
    );
  }

  /**
   * Get Trend Chart for NPS Period-wise
   * Retrieves NPS trend data for specified period
   * Migrated from legacy apps.service.ts -> getTrendChartforNPSPeriodwise()
   * Used by cssdashboard component
   * @param csatdashboardinputs Dashboard filter inputs
   * @returns Observable of NPS trend chart data
   */
  getTrendChartforNPSPeriodwise(csatdashboardinputs: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetNPSForPeriod`,
      csatdashboardinputs,
      { headers }
    );
  }

  /**
   * Get Survey Data Period-wise
   * Retrieves CSAT survey response data for specified period
   * Migrated from legacy apps.service.ts -> getSurveyDataPeriodwise()
   * Used by cssdashboard-css-table component
   * @param csatdashboardinputs Dashboard filter inputs
   * @returns Observable of survey response data
   */
  getSurveyDataPeriodwise(csatdashboardinputs: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetCSATSurveyResponseForPeriod`,
      csatdashboardinputs,
      { headers }
    );
  }

  /**
   * Get CSAT Heat Map For Period
   * Retrieves CSS/NPS heatmap matrix data
   * Migrated from legacy apps.service.ts -> getCSATHeatMapForPeriod()
   * Used by cssdashboard-css-table component
   * @param csatdashboardinputs Dashboard filter inputs
   * @returns Observable of heatmap data
   */
  getCSATHeatMapForPeriod(csatdashboardinputs: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetHeatMapForCSATPeriod`,
      csatdashboardinputs,
      { headers }
    );
  }

  /**
   * Get Response Category Data
   * Retrieves response category data for CSS dashboard
   * Migrated from legacy apps.service.ts -> getResponseCategoryData()
   * Used by cssdashboard-css-table component
   * @param csatdashboardinputs Dashboard filter inputs
   * @returns Observable of response category data
   */
  getResponseCategoryData(csatdashboardinputs: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetResponseCategoryData`,
      csatdashboardinputs,
      { headers }
    );
  }

  /**
   * Get Trend Chart for CSAT
   * Retrieves CSAT trend data for multiple quarters
   * Migrated from legacy apps.service.ts -> getTrendChartforCSAT()
   * Used by cssdashboard component for main trend chart
   * @param number Slider value (number of quarters)
   * @param year Year
   * @returns Observable of CSAT trend data
   */
  getTrendChartforCSAT(number: number, year: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetCSATForMultipleQuarter?Slider=${number}&Year=${year}`,
      { headers }
    );
  }

  /**
   * Get Trend Chart for NPS
   * Retrieves NPS trend data for multiple quarters
   * Migrated from legacy apps.service.ts -> getTrendChartforNPS()
   * Used by cssdashboard component
   * @param number Slider value (number of quarters)
   * @param year Year
   * @returns Observable of NPS trend data
   */
  getTrendChartforNPS(number: number, year: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetNPSForMultipleQuarter?Slider=${number}&Year=${year}`,
      { headers }
    );
  }

  /**
   * Get Question-Wise Rating For CSAT Insight
   * Retrieves detailed question-wise ratings for CSAT insights page
   * Migrated from legacy apps.service.ts -> getQuestionWiseRatingForCSATInsight()
   * Used by cssdashboard-next-page2 component
   * @param csatdashboardinputs Dashboard filter inputs
   * @param shouldLoadTrendWiseData Whether to load trend data
   * @returns Observable of question-wise rating data
   */
  getQuestionWiseRatingForCSATInsight(
    csatdashboardinputs: any,
    shouldLoadTrendWiseData: boolean
  ): Observable<any> {
    const headers = this.getAuthHeaders().append(
      'shouldLoadTrendWiseData',
      shouldLoadTrendWiseData.toString()
    );
    return this.http.post<any>(
      `${this.apiurl}/GetQuestionWiseRatingForCSATInsight`,
      csatdashboardinputs,
      { headers }
    );
  }

  /**
   * Get CSS View Details
   * Retrieves detailed CSS view data for View Details dialog
   * Migrated from legacy apps.service.ts -> getCSSViewDetails()
   * Used by view-css-details component
   * @param csatdashboardinputs Dashboard filter inputs
   * @returns Observable of CSS detail data
   */
  getCSSViewDetails(csatdashboardinputs: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetCSSViewDetails`,
      csatdashboardinputs,
      { headers }
    );
  }

  // ============================================
  // QA GOVERNANCE DASHBOARD METHODS
  // ============================================

  /**
   * Get finding types for assessment findings QA deck
   * Retrieves available finding types (Strength, Weakness, Opportunity, Threat)
   * Migrated from legacy apps.service.ts -> getFindingTypeForAssessmentFindingsQADeck()
   * Used by dashboard-assessment-findings component
   * @returns Observable of finding types
   */
  getFindingTypeForAssessmentFindingsQADeck(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/getFindingTypeForAssessmentFindingsQADeck`,
      { headers }
    );
  }

  /**
   * Get assessment finding chart data
   * Retrieves chart data based on selected filters and axes
   * Migrated from legacy apps.service.ts -> getAssessmentFindingChartData()
   * Used by dashboard-assessment-findings component
   * @param qagovernancedashboardinputs QA governance dashboard filter inputs
   * @returns Observable of chart data (Highcharts configuration)
   */
  getAssessmentFindingChartData(qagovernancedashboardinputs: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetAssessmentFindingChartData`,
      qagovernancedashboardinputs,
      { headers }
    );
  }

  /**
   * Get assessment findings view details
   * Retrieves detailed assessment findings with customer and project breakdown
   * Migrated from legacy apps.service.ts -> getAssessmentFindingsViewDetails()
   * Used by view-assessment-finding-details dialog component
   * @param qagovernancedashboardinputs QA governance dashboard filter inputs
   * @returns Observable of detailed assessment findings
   */
  getAssessmentFindingsViewDetails(qagovernancedashboardinputs: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/GetAssessmentFindingDetails`,
      qagovernancedashboardinputs,
      { headers }
    );
  }

  // ============================================
  // CRISP REPORT METHODS
  // ============================================

  /**
   * Get CRISP Project Summary
   * Retrieves CRISP scores summary for selected projects
   * Migrated from legacy apps.service.ts -> GetCrispProjectSummary()
   * Used by crisp-report component
   * @param projectIds Array of project IDs
   * @param month Month (e.g., "Nov")
   * @param year Year (e.g., 2020)
   * @returns Observable of CRISP project summary data
   */
  GetCrispProjectSummary(
    projectIds: string[],
    month: string,
    year: number
  ): Observable<any> {
    const empid = localStorage.getItem('empid') || '';
    const headers = this.getAuthHeaders()
      .append('projectIds', projectIds.join(','))
      .append('empId', empid);
    
    return this.http.get<any>(
      `${this.apiurl}/GetCrispProjectSummary?EmpId=${empid}&month=${month}&year=${year}`,
      { headers }
    );
  }

  /**
   * Get CRISP Details (New)
   * Retrieves detailed CRISP validation data for a project
   * Migrated from legacy apps.service.ts -> GetCrispDetailsNew()
   * Used by crisp-report component
   * @param projectId Project ID
   * @param month Month (e.g., "Nov")
   * @param year Year (e.g., 2020)
   * @returns Observable of CRISP detail data
   */
  GetCrispDetailsNew(
    projectId: string,
    month: string,
    year: number
  ): Observable<any> {
    const empid = localStorage.getItem('empid') || '';
    const headers = this.getAuthHeaders()
      .append('projectIds', projectId)
      .append('empId', empid);
    
    return this.http.get<any>(
      `${this.apiurl}/GetCrispDetails?month=${month}&year=${year}`,
      { headers }
    );
  }

  /**
   * Process CRISP Scores For Project
   * Recalculates CRISP scores for selected projects
   * Migrated from legacy apps.service.ts -> ProcessCrispScoresForProject()
   * Used by crisp-report component (Recalculate button)
   * @param custId Customer ID
   * @param projIds Array of project IDs
   * @param month Month (e.g., "Nov")
   * @param year Year (e.g., 2020)
   * @returns Observable of processing result
   */
  ProcessCrispScoresForProject(
    custId: string,
    projIds: string[],
    month: string,
    year: number
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<any>(
      `${this.apiurl}/ProcessCrispScoresForProject?custId=${custId}&Month=${month}&Year=${year}`,
      projIds,
      { headers }
    );
  }

  /**
   * Get Project CSAT URL
   * Retrieves the CSAT survey URL for a specific project
   * Migrated from legacy apps.service.ts -> GetProjectCsatURL()
   * Used by crisp-report component (opens CSAT in new tab)
   * @param projId Project ID
   * @param month Month (e.g., "Nov")
   * @param year Year (e.g., 2020)
   * @returns Observable of CSAT URL string
   */
  GetProjectCsatURL(
    projId: string,
    month: string,
    year: number
  ): Observable<string> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<string>(
      `${this.apiurl}/GetProjectCsatURL?projId=${projId}&Month=${month}&Year=${year}`,
      { headers }
    );
  }

  // ============================================================================
  // Innovation / Ideas API Methods
  // Migrated from LEGACY-SOURCE/src/app/Services/apps.service.ts
  // ============================================================================

  /**
   * Get all ideas/innovations for a customer
   * Migrated from legacy getIdeasDetails()
   */
  getIdeasDetails(customerId: string, allproj: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetIdeasDetails?CustomerId=${customerId}&Projflag=${allproj}`,
      { headers }
    );
  }

  /**
   * Add a new innovation/idea
   * Migrated from legacy addInnovation()
   */
  addInnovation(innovation: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/AddInnovation`,
      innovation,
      { headers }
    );
  }

  /**
   * Update an existing innovation/idea
   * Migrated from legacy updateInnovation()
   */
  updateInnovation(innovation: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateInnovation`,
      innovation,
      { headers }
    );
  }

  /**
   * Delete an innovation/idea
   * Migrated from legacy deleteInnovation()
   */
  deleteInnovation(innovation: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/DeleteInnovation`,
      innovation,
      { headers }
    );
  }

  /**
   * Get process area for a project (for ideas form)
   * Migrated from legacy getProcessArea()
   */
  getProcessArea(projId: string): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<string[]>(
      `${this.apiurl}/GetProcessArea?ProjId=${projId}`,
      { headers }
    );
  }

  /**
   * Get ideas/innovations filtered by process area (similar ideas panel)
   * Migrated from legacy getIdeasFromProcessArea()
   */
  getIdeasFromProcessArea(processArea: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetIdeasByProcessArea?ProcessArea=${processArea}`,
      { headers }
    );
  }

  /**
   * Get GAVS service list for innovation checkboxes
   * Migrated from legacy getGavsServices()
   */
  getGavsServices(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetGavsServices`,
      { headers }
    );
  }

  // ============================================================================
  // Ideas Innovation Matrix API Methods
  // Migrated from LEGACY-SOURCE/src/app/Services/apps.service.ts
  // ============================================================================

  /**
   * Get all ideas/innovations for the matrix view
   * Migrated from legacy getAllIdeasInnovations()
   */
  getAllIdeasInnovations(processarea: string, deptId: number, startDate: Date, endDate: Date, type: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(
      `${this.apiurl}/GetAllIdeasInnovations?ProcessArea=${processarea}&DeptId=${deptId}&StartDate=${startDate.toDateString()}&EndDate=${endDate.toDateString()}&IdeaType=${type}`,
      { headers }
    );
  }

  /**
   * Get idea/innovation types (category dropdown)
   * Migrated from legacy getIdeatype()
   */
  getIdeatype(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<string[]>(
      `${this.apiurl}/GetIdeaType`,
      { headers }
    );
  }

  /**
   * Get IMS process areas
   * Migrated from legacy getProcessAreaIMS()
   */
  getProcessAreaIMS(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<string[]>(
      `${this.apiurl}/GetProcessAreaIMS`,
      { headers }
    );
  }

  /**
   * Get ADM process areas
   * Migrated from legacy getProcessAreaADM()
   */
  getProcessAreaADM(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<string[]>(
      `${this.apiurl}/GetProcessAreaADM`,
      { headers }
    );
  }

  /**
   * Save selected innovations via matrix (bulk status update)
   * Migrated from legacy addInnovationsByMattrix()
   */
  addInnovationsByMattrix(matrixdata: any, statusChange: string): Observable<any[]> {
    const headers = this.getAuthHeaders().set('status', statusChange);
    return this.http.post<any[]>(
      `${this.apiurl}/AddInnovationsByMatrix`,
      matrixdata,
      { headers }
    );
  }

  /**
   * Get mandatory training compliance data
   * Migrated from legacy GetMandatoryTrainingDetails()
   * API: GET /GetMandatoryTrainingData
   */
  GetMandatoryTrainingDetails(
    startDate: string,
    endDate: string,
    custId: string,
    projId: string[]
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiurl}/GetMandatoryTrainingData?starDate=${startDate}&endDate=${endDate}&custId=${custId}&projIds=${projId}`,
      { headers: this.getAuthHeaders() }
    );
  }


  updateEmpInfo(EmpInfoDetailedModel: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiurl}/UpdateEmpInfoDetails`,
      EmpInfoDetailedModel,
      { headers }
    );
}
}

// ============================================
// MODELS - Risk Repository
// ============================================

/**
 * Service Area Model
 * Represents a service tower/area
 */
// ============================================
// MODELS - Auditor Quality Standards
// ============================================

/**
 * Employee Info Model
 * Basic employee information
 */
export interface EmpInfoModel {
  emP_ID?: string;
  frsT_NM: string;
  middlE_NM?: string;
  lasT_NM?: string;
  emaiL_ID?: string;
  title?: string;
  emP_CSP_ROLE?: string;
  csM_TITLE_ID?: number;
  projecT_ID?: string;
  empid?: string;
  isselected?: boolean;
}

/**
 * Process Model New
 * Process model information
 */
export interface ProcessModelNew {
  id: number;
  procesS_AREA_ID?: number;
  title: string;
  description?: string;
  procesS_MODEL_REFERENCE_LIST?: number[];
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  isactive?: boolean;
  bSelected?: boolean;
  show_in_Master?: boolean;
}

/**
 * Audit Qualified Standard Model
 * Auditor qualification and standards mapping
 */
export interface AuditQualifiedStandardModel {
  id?: number;
  emP_ID?: string;
  qualifieD_STANDARDS?: number;
  procesS_MODEL_ID?: string;
  procesS_MODEL?: string; // Comma-separated process model names from API
  effectivE_FROM?: Date;
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  isactive?: boolean;
  title?: string[]; // Array of process model titles for form
  frsT_NM?: string; // Employee name from API
}

// ============================================
// MODELS - Benchmark KPI
// ============================================

/**
 * Global KPI Category Model
 * Represents KPI categories grouped by perspective
 */
export interface GlobalKpiCategoryModel {
  perspective?: string;
  category?: Array<{
    id: number;
    shorT_DESC: string;
    [key: string]: any;
  }>;
}