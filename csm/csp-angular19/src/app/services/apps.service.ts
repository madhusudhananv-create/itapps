/**
 * Apps Service - Migrated for dashboard-premier component
 * 
 * This service contains the 11 methods required by dashboard-premier component.
 * Other methods (499+) from the 9,621-line legacy service will be migrated as needed.
 * 
 * @see DASHBOARD_PREMIER_STEP_D_APPSSERVICE_ANALYSIS.md for full analysis
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerModel } from '../models/customer-model';
import { PortfolioModel, ProjectModelNew } from '../models/portfolio-model';
import { DashboardDetailsModel, SuccessGoalsScoresModel } from '../models/dashboard-details-model';

@Injectable({ providedIn: 'root' })
export class AppsService {
  private http = inject(HttpClient);
  private apiurl = environment.webapiuri;
  public KpiCalledFromNewDashboard: boolean = false;

  /**
   * Helper method to create HTTP headers with authentication
   */
  private getHeaders(token?: string): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': token || localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || ''
    });
  }

  // ==================== CONFIGURATION METHODS ====================

  /**
   * Get database configuration value
   * @param key - Configuration key
   * @param customerId - Customer ID (-1 for global)
   * @param param - Additional parameter (proj_id)
   * @returns Observable of configuration value
   */
  GetDBConfigValue(key: string, customerId: number, param: string): Observable<string> {
    const headers = this.getHeaders();
    return this.http.get<string>(
      `${this.apiurl}GetDBConfig?key=${key}&custId=${customerId}&projId=${param}`,
      { headers }
    );
  }

  /**
   * Get database configuration array values
   * @param key - Configuration key
   * @param customerId - Customer ID (-1 for global)
   * @param param - Additional parameter (proj_id)
   * @returns Observable of configuration values array
   */
  GetDBConfigValueFields(key: string, customerId: number | string, param: string): Observable<string> {
    const headers = this.getHeaders();
    return this.http.get<string>(
      `${this.apiurl}GetDBConfigArrayValues?key=${key}&custId=${customerId}&projId=${param}`,
      { headers }
    );
  }

  // ==================== DASHBOARD DATA METHODS ====================

  /**
   * Refresh dashboard details for all customers
   * @returns Observable of refreshed dashboard data
   */
  RefreshDashboardDetails(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}RefreshDashboardDetails`,
      { headers }
    );
  }

  /**
   * Get dashboard details for a specific customer
   * @param customerId - Customer ID
   * @returns Observable of dashboard details
   */
  GetDashboardDetailsbyCustomerId(customerId: string): Observable<DashboardDetailsModel[]> {
    const headers = this.getHeaders();
    return this.http.get<DashboardDetailsModel[]>(
      `${this.apiurl}GetDashboardDetails?CustomerId=${customerId}`,
      { headers }
    );
  }

  /**
   * Get success goal scores for a project/customer
   * @param customerId - Customer ID
   * @returns Observable of success goal scores
   */
  GetSuccessGoalScoresForProject(customerId: any): Observable<SuccessGoalsScoresModel[]> {
    const headers = this.getHeaders();
    return this.http.get<SuccessGoalsScoresModel[]>(
      `${this.apiurl}GetSuccessGoalScoresForProject?CustomerId=${customerId}`,
      { headers }
    );
  }

  /**
   * Get service metrics dashboard data organized by portfolio
   * @param customerId - Customer ID
   * @param month - Month filter
   * @param year - Year filter
   * @param lastUpdated - Include only last updated data
   * @returns Observable of portfolio-wise metrics
   */
  GetServiceMetricsDashboardDataPortfolioWise(
    customerId: string,
    month: string,
    year: number | string,
    lastUpdated: boolean
  ): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetServiceMetricsDashboardDataPortfolioWise?CustomerId=${customerId}&Month=${month}&Year=${year}&bLastUpdated=${lastUpdated}`,
      { headers }
    );
  }

  /**
   * Get service metrics dashboard data organized by product
   * @param customerId - Customer ID
   * @param month - Month filter
   * @param year - Year filter
   * @param lastUpdated - Include only last updated data
   * @returns Observable of product-wise metrics
   */
  GetServiceMetricsDashboardDataProductWise(
    customerId: string,
    month: string,
    year: number | string,
    lastUpdated: boolean
  ): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetServiceMetricsDashboardDataProductWise?CustomerId=${customerId}&Month=${month}&Year=${year}&bLastUpdated=${lastUpdated}`,
      { headers }
    );
  }

  // ==================== CUSTOMER & PORTFOLIO METHODS ====================

  /**
   * Get list of customers for an employee
   * @param empId - Employee ID
   * @param isToFindSLA - Flag to filter SLA customers
   * @returns Observable of customer list
   */
  GetCustomerList(empId: any, isToFindSLA: boolean): Observable<CustomerModel[]> {
    // Use empId from localStorage as fallback
    const employeeId = empId || localStorage.getItem('empid') || '';
    const headers = this.getHeaders();

    // Check for cached customer IDs
    const cachedCustomerIds = localStorage.getItem('CustomerIds');
    if (cachedCustomerIds) {
      try {
        const customerData = JSON.parse(cachedCustomerIds);
        return new Observable<CustomerModel[]>(observer => {
          observer.next(customerData);
          observer.complete();
        });
      } catch (error) {
        console.warn('Failed to parse cached CustomerIds, fetching from API', error);
      }
    }

    // Fetch from API
    return this.http.get<CustomerModel[]>(
      `${this.apiurl}GetCustomerIds?EmpId=${employeeId}&istoFindSLA=${isToFindSLA}`,
      { headers }
    );
  }

  /**
   * Get list of all portfolios
   * @returns Observable of portfolio list
   */
  GetPortfolioList(): Observable<PortfolioModel[]> {
    const headers = this.getHeaders();
    return this.http.get<PortfolioModel[]>(
      `${this.apiurl}GetPortfolioList`,
      { headers }
    );
  }

  /**
   * Get all projects for a specific customer
   * @param customerId - Customer ID
   * @returns Observable of project list
   */
  getAllProjectsForCustomer(customerId: number | string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': localStorage.getItem('token') || '',
      'empId': localStorage.getItem('empid') || '',
      'custid': String(customerId)
    });
    
    return this.http.get<any[]>(
      `${this.apiurl}GetAllProjectsForCustomer?CustomerId=${customerId}`,
      { headers }
    );
  }

  // ==================== PROJECT MANAGEMENT METHODS ====================

  /**
   * Get project heads by project ID
   * @param projectId - Project ID
   * @returns Observable of project head details
   */
  GetProjectHeadsByID(projectId: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetProjectHeadsByID?projectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Update project details (QA SPOC, certification scope, ISO standards)
   * @param params - Update parameters
   * @returns Observable of update result
   */
  UpdateProjectDetails(params: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}UpdateProjectDetails`,
      params,
      { headers }
    );
  }

  /**
   * Get project details (QA list, certification scopes, ISO standards)
   * @returns Observable of project details
   */
  GetProjectDetails(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetProjectInputDetails`,
      { headers }
    );
  }

  /**
   * Get project certification scope
   * @returns Observable of certification scope data
   */
  getProjectCertificationScope(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetAllProjectCertificationScopes`,
      { headers }
    );
  }

  // ==================== AUTHENTICATION METHODS ====================

  /**
   * Logout current user
   * Clears local storage and notifies backend
   * @returns Observable of logout result
   */
  Logout(): Observable<any> {
    const token = localStorage.getItem('token') || '';
    
    // Clear local storage
    localStorage.removeItem('empid');
    localStorage.removeItem('displayname');
    localStorage.removeItem('token');
    
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': token
    });
    
    return this.http.post<any>(
      `${this.apiurl}Logout`,
      '',
      { headers }
    );
  }

  // ==================== STUB METHODS (Not needed by dashboard-premier) ====================
  // These methods are placeholders for future migration if other components need them

  /**
   * @deprecated Use ChartsService.getNotesForCustomer() instead
   * This method exists in ChartsService with full implementation
   */
  getNotesForCustomer(customerId: any): Observable<any> {
    console.warn('AppsService.getNotesForCustomer - Use ChartsService.getNotesForCustomer() instead');
    return new Observable(observer => observer.next([]));
  }

  // ==================== ACTION ITEMS PAGE METHODS ====================

  /**
   * Get action items details for a customer
   * @param customerId - Customer ID
   * @param allproj - Include all projects flag
   * @param viewBy - View by parameter (1 for default view)
   * @returns Observable of action items array
   */
  getActionItemsDetails(customerId: string, allproj: boolean, viewBy: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetActionItemsDetails?CustomerId=${customerId}&Projflag=${allproj}&viewBy=${viewBy}`,
      { headers }
    );
  }

  /**
   * Get customer projects name
   * @param custid - Customer ID
   * @param allproj - Include all projects flag
   * @returns Observable of projects array
   */
  GetCustomerProjectsName(custid: string, allproj: boolean): Observable<any[]> {
    const headers = this.getHeaders();
    if (allproj) {
      return this.http.get<any[]>(
        `${this.apiurl}GetCustomerProjectsName?CustomerId=${custid}`,
        { headers }
      );
    } else {
      return this.http.get<any[]>(
        `${this.apiurl}GetCustomerProjectsName?CustomerId=${custid}&EmpId=${localStorage.getItem('empid')}&AllProj=${allproj}`,
        { headers }
      );
    }
  }

  /**
   * Get portfolio name for a project
   * @param projId - Project ID
   * @returns Observable of portfolio name
   */
  getPortfolioName(projId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetPortfolioName?ProjId=${projId}`,
      { headers }
    );
  }

  /**
   * Get auditee details for a customer/project
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @param includeCustomer - Include customer flag (default: true)
   * @returns Observable of employee info array
   */
  getAuditeeDetails(customerId: string, projectId: string, includeCustomer: boolean = true): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetAuditeeDetails?CustomerId=${customerId}&ProjectId=${projectId}&includeCustomer=${includeCustomer}`,
      { headers }
    );
  }

  /**
   * Delete action item
   * @param actionitem - Action item object to delete
   * @returns Observable of deleted action item
   */
  deleteActionItem(actionitem: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}Actionitem`,
      actionitem,
      { headers }
    );
  }

  /**
   * Get customer portfolio project list
   * @param empid - Employee ID
   * @param allproj - Include all projects flag (default: false)
   * @returns Observable of portfolio projects array
   */
  getCustomerPortfolioProjectsList(empid: string, allproj: boolean = false): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetCustomerPortfolioProjectList?EmpId=${empid}&ProjFlag=${allproj}`,
      { headers }
    );
  }

  /**
   * Get portfolio lead for project (used for update to customer permission check)
   * @param projectId - Project ID
   * @returns Observable of portfolio lead array
   */
  service_UpdateTocustomer(projectId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetPortfolioLeadForProject?projectId=${projectId}`,
      { headers }
    );
  }

  // ==================== MINUTES OF MEETING (MOM) METHODS ====================

  /**
   * Get Minutes of Meeting list by date
   * @param date - Date string in format "MMM YYYY" (e.g., "Jan 2024")
   * @param custId - Customer ID
   * @returns Observable of MoM list
   */
  getMomsWithDate(date: string, custId: number): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetMoMsWithDate?date=${date}&custId=${custId}`,
      { headers }
    );
  }

  /**
   * Get MoM details by MoM ID
   * @param momId - MoM ID
   * @param projectId - Project ID
   * @param isGAVS - Is GAVS user
   * @returns Observable of MoM details
   */
  GetMoMbyMoMId(momId: number, projectId: number, isGAVS: boolean): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetMoMbyMoMId?momId=${momId}&projectId=${projectId}&isGAVS=${isGAVS}`,
      { headers }
    );
  }

  /**
   * Get project resources by project IDs
   * @param projectIds - Array of project IDs
   * @returns Observable of project resources
   */
  getProjectResourcebyProjIds(projectIds: number[]): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}GetProjectResourcebyProjIds`,
      projectIds,
      { headers }
    );
  }

  /**
   * Get project resources by project ID
   * @param projId - Project ID
   * @returns Observable of project resources
   */
  getProjectResourceByProjId(projId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetProjectResourceByProjectId?ProjId=${projId}`,
      { headers }
    );
  }

  /**
   * Get employee name by employee ID
   * @param empId - Employee ID
   * @returns Observable of employee name
   */
  getEmpNameById(empId: number): Observable<string> {
    const headers = this.getHeaders();
    return this.http.get<string>(
      `${this.apiurl}GetEmpNameById?empId=${empId}`,
      { headers }
    );
  }

  /**
   * Add new MoM details
   * @param data - MoM data object
   * @returns Observable of response
   */
  addMOMDetails(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}AddMOMDetails`,
      data,
      { headers }
    );
  }

  /**
   * Update existing MoM details
   * @param data - MoM data object
   * @returns Observable of response
   */
  updateMoMDetails(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}UpdateMOMDetails`,
      data,
      { headers }
    );
  }

  // ==================== RISK-PAGE METHODS ====================

  /**
   * Get risk details by customer ID
   * @param custid - Customer ID
   * @param allproj - Include all projects flag
   * @returns Observable of risk details with edit permissions
   */
  GetRiskDetailsByCustomerId(custid: string, allproj: boolean): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetRiskDetailsByCustomerId?customerId=${custid}&allproj=${allproj}`,
      { headers }
    );
  }

  /**
   * Add new risk
   * @param risk - Risk model data
   * @returns Observable of created risk
   */
  addRisk(risk: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}AddRisk`,
      risk,
      { headers }
    );
  }

  /**
   * Update existing risk
   * @param risk - Risk model data
   * @returns Observable of response
   */
  updateRisk(risk: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}UpdateRisk`,
      risk,
      { headers }
    );
  }

  /**
   * Delete risk
   * @param risk - Risk to delete
   * @returns Observable of response
   */
  deleteRisk(risk: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}Risk`,
      risk,
      { headers }
    );
  }

  /**
   * Load overall risks data
   * @returns Observable of response
   */
  loadOverAllRisksData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}LoadOverAllRisksData`,
      { headers }
    );
  }

  /**
   * Get risks from repository for a specific project
   * @param customerId - Customer ID
   * @param projectId - Project ID
   * @returns Observable of repository risks filtered by project service towers
   */
  getRiskFromRepository(customerId: string, projectId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetRiskFromRepository?customerId=${customerId}&projectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Add multiple risks from repository to project
   * @param riskList - Array of risk objects to add
   * @returns Observable of response
   */
  addRiskList(riskList: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}AddRiskList`,
      riskList,
      { headers }
    );
  }

  /**
   * Get risk location list
   * @returns Observable of risk locations
   */
  GetRiskLocation(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetRiskLocation`,
      { headers }
    );
  }

  /**
   * Get risk category list
   * @returns Observable of risk categories
   */
  GetRiskCategory(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetRiskCategory`,
      { headers }
    );
  }

  /**
   * Get risk ISO mapping list
   * @returns Observable of ISO mappings
   */
  GetRiskIsoMappingList(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetRiskIsoMappingList`,
      { headers }
    );
  }

  /**
   * Get ISO standard list
   * @returns Observable of ISO standards
   */
  GetIsoStandardList(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetIsoStandardList`,
      { headers }
    );
  }

  /**
   * Get ISO standard project mapping list
   * @param projId - Project ID
   * @returns Observable of project ISO mappings
   */
  GetIsoStandardProjectMappingList(projId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetIsoStandardProjectMappingList?projId=${projId}`,
      { headers }
    );
  }

  /**
   * Get project detail for edit
   * @param projectId - Project ID
   * @returns Observable of project data
   */
  GetProjectDetailForEdit(projectId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetProjectDetailForEdit?projectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Add action item for risk
   * @param actionItem - Action item to add
   * @returns Observable of response
   */
  addActionitem(actionItem: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}AddActionitemNew`,
      actionItem,
      { headers }
    );
  }

  /**
   * Update action item for risk
   * @param actionItem - Action item to update
   * @returns Observable of response
   */
  updateActionitemforRisk(actionItem: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}UpdateActionitemforRisk`,
      actionItem,
      { headers }
    );
  }

  /**
   * Delete action item for risk
   * @param actionItem - Action item to delete
   * @returns Observable of response
   */
  deleteActionItemforRisk(actionItem: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}DeleteActionItemforRisk`,
      actionItem,
      { headers }
    );
  }

  /**
   * Get action items for risk
   * @param projectId - Project ID
   * @param riskId - Risk ID
   * @returns Observable of action items
   */
  getActionItemsforRisk(projectId: string, riskId: number): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetActionItemsDetailsforRisk?projectId=${projectId}&riskId=${riskId}`,
      { headers }
    );
  }

  // ==================== ISSUE METHODS ====================

  /**
   * Get all issues for customer
   * @param customerId - Customer ID
   * @param allProjects - Flag to include all projects
   * @returns Observable of issues with projects
   */
  getAllIssuesForCustomer(customerId: string, allProjects: boolean): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetAllIssuesForCustomerId?CustomerId=${customerId}&ProjFlag=${allProjects}`,
      { headers }
    );
  }

  /**
   * Add new issue
   * @param issue - Issue to add
   * @returns Observable of created issue
   */
  addIssue(issue: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}AddIssue`,
      issue,
      { headers }
    );
  }

  /**
   * Update existing issue
   * @param issue - Issue to update
   * @returns Observable of updated issue
   */
  updateIssue(issue: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}UpdateIssue`,
      issue,
      { headers }
    );
  }

  /**
   * Delete issue
   * @param issue - Issue to delete
   * @returns Observable of response
   */
  deleteIssue(issue: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}Issue`,
      issue,
      { headers }
    );
  }

  /**
   * Get employee information
   * @returns Observable of employee info
   */
  getEmpInfo(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}EmpInfo`,
      { headers }
    );
  }

  // ==================== NOTES MANAGEMENT METHODS ====================

  /**
   * Add new note (highlight)
   * @param notes - Note object to add
   * @returns Observable of added note
   */
  addNote(notes: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}AddNotes`,
      notes,
      { headers }
    );
  }

  /**
   * Update existing note
   * @param notes - Note object to update
   * @returns Observable of updated note
   */
  updateNote(notes: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}UpdateNotes`,
      notes,
      { headers }
    );
  }

  /**
   * Delete note
   * @param notes - Note object to delete
   * @returns Observable of response
   */
  deleteNotes(notes: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}DeleteNotes`,
      notes,
      { headers }
    );
  }

  // ==================== ASSESSMENT METHODS ====================

  /**
   * Get assessment details for a customer
   * @param custId - Customer ID
   * @param month - Month number (1-12)
   * @param year - Year
   * @returns Observable of assessment details
   */
  GetAssessmentDetails(custId: string, month: number, year: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetAssessmentDetails?customerId=${custId}&month=${month}&year=${year}`,
      { headers }
    );
  }

  /**
   * Get assessment findings by time (age)
   * @param custId - Customer ID
   * @param projIds - Array of project IDs
   * @returns Observable of findings data with values and column names
   */
  getAssessmentFindingsByTime(custId: string, projIds: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}GetAssessmentFindingsByTime?custId=${custId}&projIds=${JSON.stringify(projIds)}`,
      { headers }
    );
  }

  /**
   * Get project portfolio mapping
   * @param custid - Customer ID
   * @param allproj - Whether to load all projects
   * @returns Observable of portfolio-project mapping
   */
  getProjectPortfolioMapping(custid: string, allproj: boolean): Observable<ProjectModelNew[]> {
    const headers = this.getHeaders();
    return this.http.get<ProjectModelNew[]>(
      `${this.apiurl}GetAllPortfolioProjectList?custid=${custid}&AllProjects=${allproj}`,
      { headers }
    );
  }

  /**
   * Get audits/assessments by status
   * @param assessmentModel - Assessment filter model with custId, startDate, endDate
   * @returns Observable of task array (audits/assessments)
   */
  GetAuditsByStatus(assessmentModel: AssessmentModel): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}GetAuditsByStatus`,
      assessmentModel,
      { headers }
    );
  }

  /**
   * Get all findings for customer
   * @param findingmodel - Finding filter model with custId, dates, projectId
   * @returns Observable of findings grouped by type
   */
  getAllFindingsForCustomer(findingmodel: any): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}GetAllFindingsForCustomer`,
      findingmodel,
      { headers }
    );
  }

  /**
   * Save auditee acceptance status
   * @param auditeeStatus - Array of auditee acceptance records
   * @returns Observable of save result
   */
  saveAuditeeAcceptanceStatus(auditeeStatus: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}SaveAuditeeAcceptanceStatus`,
      auditeeStatus,
      { headers }
    );
  }

  /**
   * Save auditor acceptance status
   * @param auditorStatus - Array of auditor acceptance records
   * @returns Observable of save result
   */
  saveAuditorAcceptanceStatus(auditorStatus: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}SaveAuditorAcceptanceStatus`,
      auditorStatus,
      { headers }
    );
  }

  // ==================== QA GOVERNANCE DASHBOARD METHODS ====================

  /**
   * Get finding types for assessment findings QA deck
   * @returns Observable of finding types
   */
  getFindingTypeForAssessmentFindingsQADeck(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}getFindingTypeForAssessmentFindingsQADeck`,
      { headers }
    );
  }

  /**
   * Get assessment finding chart data
   * @param qagovernancedashboardinputs - QA governance dashboard inputs
   * @returns Observable of chart data
   */
  getAssessmentFindingChartData(qagovernancedashboardinputs: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}GetAssessmentFindingChartData`,
      qagovernancedashboardinputs,
      { headers }
    );
  }

  /**
   * Get assessment findings view details
   * @param qagovernancedashboardinputs - QA governance dashboard inputs
   * @returns Observable of assessment finding details
   */
  getAssessmentFindingsViewDetails(qagovernancedashboardinputs: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiurl}GetAssessmentFindingsViewDetails`,
      qagovernancedashboardinputs,
      { headers }
    );
  }

  // ==================== SERVICE AREA & PROCESS METHODS ====================

  /**
   * Get service areas for project
   * @param projectId - Project ID
   * @returns Observable of service area list
   */
  getServiceAreaProjectMapping(projectId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetServiceAreasForProject?projid=${projectId}`,
      { headers }
    );
  }

  /**
   * Get process areas by service area ID
   * @param serviceAreaId - Service area ID
   * @returns Observable of process area list
   */
  GetProcessAreaByServiceAreaIdNew(serviceAreaId: number): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}GetProcessAreafromServiceIdNew?ServiceAreaId=${serviceAreaId}`,
      { headers }
    );
  }

  /**
   * Get processes by process area
   * @param processAreaId - Process area ID
   * @returns Observable of process list
   */
  GetProcessByProcessArea(processAreaId: number): Observable<any[]> {
    const headers = this.getHeaders();
    // Send as JSON body with proper Content-Type
    return this.http.post<any[]>(
      `${this.apiurl}GetProcessByProcessArea`,
      processAreaId,
      { 
        headers: headers.set('Content-Type', 'application/json')
      }
    );
  }

  /**
   * Get customer project list by employee ID
   * @param empid - Employee ID
   * @returns Observable of customer projects list
   */
  GetCustomerProjectsList(empid?: string): Observable<any[]> {
    const headers = this.getHeaders();
    const employeeId = empid || localStorage.getItem('empid') || '';
    return this.http.get<any[]>(
      `${this.apiurl}GetCustomerProjectList?EmpId=${employeeId}`,
      { headers }
    );
  }

  /**
   * Get customer project list for specific project IDs
   * @param projIds - Comma-separated project IDs
   * @returns Observable of customer projects list
   */
  GetCustomerProjectListForProjIds(projIds: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.post<any[]>(
      `${this.apiurl}GetCustomerProjectListForProjIds`,
      projIds,
      { headers }
    );
  }

  /**
   * Get business units list
   * @returns Observable of business units array
   */
  getBusinessUnits(): Observable<string[]> {
    const headers = this.getHeaders();
    return this.http.get<string[]>(
      `${this.apiurl}GetBusinessUnits`,
      { headers }
    );
  }

  // ==================== KPI EXTERNAL DATA PROCESSING ====================

  /**
   * Process external KPI data for a customer
   * @param custId - Customer ID
   * @param date - Processing date
   * @returns Observable with processing result message
   */
  ProcessExternalKPIs(custId: number, date: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiurl}ProcessExternalKPIs?custId=${custId}&date=${date}`,
      { headers }
    );
  }

  // TODO: Add 492+ additional methods as other components are migrated
}

/**
 * Assessment Model
 * Used for filtering assessments by customer and date range
 */
export class AssessmentModel {
  cusT_ID: string = '';
  starT_DATE: string = '';
  enD_DATE: string = '';
}


