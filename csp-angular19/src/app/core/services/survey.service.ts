import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CssBatchModel } from '../../models/css-batch-model';
import { CssBatchCustomersModel, CssBatchCustomersExtendedModel } from '../../models/css-batch-customers-model';
import { CssCustomerVerificationModel } from '../../models/css-customer-verification-model';
import { CssBatchMonthlyModel } from '../../models/css-batch-monthly-model';
import { CssBatchCustomerMonthlyExtendedModel } from '../../models/css-batch-customers-monthly-model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiurl: string = environment.webapiuri || '';
  private apiurl_auth: string = environment.webapiuri_auth || '';
  
  constructor(private http: HttpClient) { }
  
  /**
   * Get authorization headers with token and empId
   * @param additionalHeaders Optional additional headers
   * @returns HttpHeaders with token and empId
   */
  private getAuthHeaders(additionalHeaders?: { [key: string]: string }): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    
    let headers: { [key: string]: string } = {
      'Accept': 'application/json',
      'token': token,
      'empId': empId
    };
    
    // Merge additional headers if provided
    if (additionalHeaders) {
      headers = { ...headers, ...additionalHeaders };
    }
    
    return new HttpHeaders(headers);
  }
  
  // TODO: Implement this method with actual API call
  Logout(): Observable<any> {
    return of({});
  }
  
  /**
   * Get CSS Batches
   * @param csmId CSM ID filter (empty string for all batches)
   * @returns Observable of CSS batch list
   */
  GetCSSBatches(csmId: string): Observable<CssBatchModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CssBatchModel[]>(
      `${this.apiurl}/GetCSSBatches?csmId=${csmId}`,
      { headers }
    );
  }
  
  /**
   * Get CSS Batch Customers
   * @param batchId Batch ID to get customers for
   * @returns Observable of CSS batch customer list
   */
  GetCSSBatchCustomers(batchId: number): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/GetCSSBatchCustomers?BatchId=${batchId}`,
      { headers }
    );
  }
  
  /**
   * Get CSM List
   * @returns Observable of CSM employee list with project mappings
   */
  GetCSMList(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCSMList`,
      { headers }
    );
  }

  /**
   * Get CSM List Distinct
   * Returns distinct CSM list (no duplicates)
   * Migrated from legacy survey.service.ts -> GetCSMListDistinct()
   * @returns Observable of distinct CSM employee list
   */
  GetCSMListDistinct(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.apiurl}/GetCSMListDistinct`,
      { headers }
    );
  }
  
  /**
   * Add CSS Batch
   * @param item Batch item to add
   * @returns Observable of created batch
   */
  AddCSSBatch(item: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.apiurl}/AddCSSBatch`,
      item,
      { headers }
    );
  }
  
  /**
   * Update Customer Contacts Verification
   * @param data Customer verification data
   * @returns Observable of update result
   */
  updateCustomerContactsVerification(data: CssBatchCustomersModel): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.apiurl}/updateCustomerContactsVerification`,
      data,
      { headers }
    );
  }
  
  /**
   * Send CSS Batch Verification Mails to CSM
   * @param batch Batch information
   * @param selectedIds Comma-separated customer IDs
   * @returns Observable of send result
   */
  SendCSSBatchVerification(batch: CssBatchModel, selectedIds: string): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders({ 'selectedIds': selectedIds });
    return this.http.post<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/SendCSSBatchVerification`,
      batch,
      { headers }
    );
  }
  
  /**
   * Send CSS Batch Survey Mails to Customers
   * @param batch Batch information
   * @param selectedIds Comma-separated customer IDs
   * @returns Observable of send result
   */
  SendCSSBatchSurveyMails(batch: CssBatchModel, selectedIds: string): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders({ 'selectedIds': selectedIds });
    return this.http.post<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/SendCSSBatchSurveyMails`,
      batch,
      { headers }
    );
  }
  
  /**
   * Send CSS Batch Reminder Mails to Customers
   * @param batch Batch information
   * @param selectedIds Comma-separated customer IDs
   * @returns Observable of send result
   */
  SendCSSBatchReminderMails(batch: CssBatchModel, selectedIds: string): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders({ 'selectedIds': selectedIds });
    return this.http.post<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/SendCSSBatchReminderMails`,
      batch,
      { headers }
    );
  }
  
  /**
   * Create Action Item for CSAT Non-Respondents
   * @param batchId Batch ID
   * @param selectedIds Comma-separated customer IDs
   * @param type CSAT type (e.g., "NonPremierCSAT")
   * @returns Observable of action item creation result
   */
  CreateActionItemForCSAT(batchId: number, selectedIds: string, type: string): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders({ 
      'selectedIds': selectedIds,
      'type': type 
    });
    return this.http.post<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/CreateActionItemForCSAT?batchId=${batchId}`,
      headers,
      { headers }
    );
  }
  
  /**
   * Refresh CSS Batch Customers (Regenerate List)
   * @param batchId Batch ID to refresh
   * @returns Observable of refreshed customer list
   */
  RefreshCSSBatchCustomers(batchId: number): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/RefreshCSSBatchCustomers?BatchId=${batchId}`,
      { headers }
    );
  }
  
  /**
   * Generate Missing Customer Contacts
   * @param batchId Batch ID to generate contacts for
   * @returns Observable of generation result
   */
  GenerateMissingCustomerContacts(batchId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.apiurl}/GenerateMissingCustomerContacts?batchId=${batchId}`,
      { headers }
    );
  }
  
  /**
   * Update CSS Link Validity (Activate/Reactivate Links)
   * @param batchId Batch ID
   * @param selectedIds Comma-separated customer IDs
   * @param type Type of operation (e.g., "batch")
   * @returns Observable of updated customer list
   */
  UpdateCssLinkValidity(batchId: number, selectedIds: string, type: string): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders({ 'selectedIds': selectedIds });
    return this.http.post<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/UpdateCssLinkValidity?batchId=${batchId}&type=${type}`,
      headers,
      { headers }
    );
  }

  /**
   * Get CSS Customer Verifications for a specific date range
   * @param starT_DATE Start date of the batch
   * @param enD_DATE End date of the batch
   * @param custId Customer ID filter (0 for all)
   * @returns Observable of customer verification list
   */
  GetCSSCustomerVerifications(starT_DATE: any, enD_DATE: any, custId: any): Observable<CssCustomerVerificationModel[]> {
    const headers = this.getAuthHeaders({
      'startDate': starT_DATE,
      'endDate': enD_DATE,
      'custId': custId
    });
    return this.http.get<CssCustomerVerificationModel[]>(
      `${this.apiurl}/GetCSSForVerification`,
      { headers }
    );
  }

  /**
   * Update Customer Contacts Verification List (Non-Premier)
   * @param cssCustomerVerifications List of customer verifications to update
   * @param csmAction Boolean indicating approve (true) or reject (false)
   * @param comments Rejection comments (empty for approval)
   * @returns Observable of updated customer verification list
   */
  UpdateCustomerContactsVerificationList(cssCustomerVerifications: any[], csmAction: any, comments: any): Observable<CssCustomerVerificationModel[]> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams().set('csmAction', csmAction);
    params = params.append('comments', comments);
    
    return this.http.post<CssCustomerVerificationModel[]>(
      `${this.apiurl}/UpdateCustomerContactsVerificationList`,
      cssCustomerVerifications,
      { headers, params }
    );
  }

  /**
   * Update Customer Contacts Verification List (Premier Customers)
   * @param cssCustomerVerifications List of customer verifications to update
   * @param csmAction Boolean indicating approve (true) or reject (false)
   * @param comments Rejection comments (empty for approval)
   * @returns Observable of updated customer verification list
   */
  UpdateCustomerContactsVerificationListPremier(cssCustomerVerifications: any[], csmAction: any, comments: any): Observable<CssCustomerVerificationModel[]> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams().set('csmAction', csmAction);
    params = params.append('comments', comments);
    
    return this.http.post<CssCustomerVerificationModel[]>(
      `${this.apiurl}/UpdateCustomerContactsVerificationListForPremier`,
      cssCustomerVerifications,
      { headers, params }
    );
  }

  /**
   * Get CSS Monthly Batches
   * @returns Observable of CSS monthly batch list
   */
  GetCSSMonthlyBatches(): Observable<CssBatchMonthlyModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CssBatchMonthlyModel[]>(
      `${this.apiurl}/GetCSSBatchesMonthly`,
      { headers }
    );
  }

  /**
   * Get CSS Batch Customers Monthly
   * @param batchId Batch ID to get customers for
   * @returns Observable of CSS batch customer monthly list
   */
  GetCSSBatchCustomersMonthly(batchId: number): Observable<CssBatchCustomerMonthlyExtendedModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CssBatchCustomerMonthlyExtendedModel[]>(
      `${this.apiurl}/GetCSSBatchCustomersMonthly?BatchId=${batchId}`,
      { headers }
    );
  }

  /**
   * Send CSS Batch Survey Mails Monthly
   * @param batch Batch information
   * @param selectedIds Comma-separated customer IDs
   * @returns Observable of send result
   */
  SendCSSBatchSurveyMailsMonthly(batch: CssBatchMonthlyModel, selectedIds: string): Observable<CssBatchCustomerMonthlyExtendedModel[]> {
    const headers = this.getAuthHeaders({ 'selectedIds': selectedIds });
    return this.http.post<CssBatchCustomerMonthlyExtendedModel[]>(
      `${this.apiurl}/SendCSSBatchSurveyMailsMonthly`,
      batch,
      { headers }
    );
  }

  /**
   * Refresh CSS Batch Customers Monthly (Regenerate List)
   * @param batchId Batch ID to refresh
   * @returns Observable of refreshed customer list
   */
  RefreshCSSBatchCustomersMonthly(batchId: number): Observable<CssBatchCustomerMonthlyExtendedModel[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CssBatchCustomerMonthlyExtendedModel[]>(
      `${this.apiurl}/RefreshCSSBatchCustomersMonthly?BatchId=${batchId}`,
      { headers }
    );
  }

  /**
   * Add CSS Batches Monthly
   * @param data Batch data to add
   * @returns Observable of add result
   */
  AddCSSBatchesMonthly(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.apiurl}/AddCSSBatchesMonthly`,
      data,
      { headers }
    );
  }

  /**
   * Update Customer Contacts Verification for Premier
   * @param data Verification data
   * @returns Observable of update result
   */
  updateCustomerContactsVerificationForPremier(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.apiurl}/UpdateCustomerContactsVerificationForPremier`,
      data,
      { headers }
    );
  }

  /**
   * Send CSS Batch Verification for Premier
   * @param batch Batch information
   * @param selectedIds Comma-separated customer IDs
   * @returns Observable of send result
   */
  SendCSSBatchVerificationForPremier(batch: CssBatchMonthlyModel, selectedIds: string): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders({ 'selectedIds': selectedIds });
    return this.http.post<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/SendCSSBatchVerificationForPremier`,
      batch,
      { headers }
    );
  }

  /**
   * Generate Missing Customer Contacts for Premier
   * @param batchId Batch ID to generate contacts for
   * @returns Observable of generation result
   */
  GenerateMissingCustomerContactsPremier(batchId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.apiurl}/GenerateMissingCustomerContactsPremier?batchId=${batchId}`,
      { headers }
    );
  }

  /**
   * Create Action Item for Premier CSAT
   * @param batchId Batch ID
   * @param selectedIds Comma-separated customer IDs
   * @param type CSAT type (e.g., "PremierCSAT")
   * @returns Observable of action item creation result
   */
  CreateActionItemForPremierCSAT(batchId: number, selectedIds: string, type: string): Observable<CssBatchCustomersExtendedModel[]> {
    const headers = this.getAuthHeaders({ 
      'selectedIds': selectedIds,
      'type': type 
    });
    return this.http.post<CssBatchCustomersExtendedModel[]>(
      `${this.apiurl}/CreateActionItemForCSAT?batchId=${batchId}`,
      headers,
      { headers }
    );
  }
}

