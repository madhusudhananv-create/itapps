import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

import { myUtility } from '../../Shared/myUtility';
import { environment } from '../../../environments/environment';
import { CssBatchModel } from '../../models/css-batch-model';
import { CssBatchCustomersExtendedModel } from '../../models/css-batch-customers-model';
import { CSMList } from '../../pages/survey/survey-settings/survey-settings.component';
import { CssBatchMonthlyModel } from '../../models/css-batch-monthly-model';
import { CssBatchCustomerMonthlyExtendedModel } from '../../models/css-batch-customers-monthly-model';
import { CssCustomerVerificationModel } from '../../models/css-customer-verification-model';


@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  apiurl: string = '';
  apiurl_auth: string = '';
  constructor(private _http: HttpClient, private _util: myUtility) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }
  UpdateCssLinkValidity(batchId: number, selectedIds: string,type :string): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'selectedIds': selectedIds });
    return this._http.post<CssBatchCustomersExtendedModel[]>(this.apiurl + '/UpdateCssLinkValidity?batchId='+batchId+"&type="+type,header, { headers: header });
  }
  SendCSSBatchVerification(batch: CssBatchModel, selectedIds: string): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'selectedIds': selectedIds });
    return this._http.post<CssBatchCustomersExtendedModel[]>(this.apiurl + '/SendCSSBatchVerification', batch, { headers: header });
  }

  SendCSSBatchVerificationForPremier(batch: CssBatchMonthlyModel, selectedIds: string): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'selectedIds': selectedIds });
    return this._http.post<CssBatchCustomersExtendedModel[]>(this.apiurl + '/SendCSSBatchVerificationForPremier', batch, { headers: header });
  }

  SendCSSBatchSurveyMails(batch: CssBatchModel, selectedIds: string): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'selectedIds': selectedIds });
    return this._http.post<CssBatchCustomersExtendedModel[]>(this.apiurl + '/SendCSSBatchSurveyMails', batch, { headers: header });
  }

  SendCSSBatchReminderMails(batch: CssBatchModel, selectedIds: string): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'selectedIds': selectedIds });
    return this._http.post<CssBatchCustomersExtendedModel[]>(this.apiurl + '/SendCSSBatchReminderMails', batch, { headers: header });
  }
  CreateActionItemForCSAT(batchId: number, selectedIds: string, CSAT): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'selectedIds': selectedIds, 'type': CSAT});
    return this._http.post<CssBatchCustomersExtendedModel[]>(this.apiurl + "/CreateActionItemForCSAT?batchId=" + batchId, header ,{ headers: header });
  }
  CreateActionItemForPremierCSAT(batchId: number, selectedIds: string, premierCSAT): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'selectedIds': selectedIds, 'type': premierCSAT});
    return this._http.post<CssBatchCustomersExtendedModel[]>(this.apiurl + "/CreateActionItemForCSAT?batchId=" + batchId, header, { headers: header });
  }
  GetCSSBatches(csmId: string): Observable<CssBatchModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<CssBatchModel[]>(this.apiurl + '/GetCSSBatches?csmId=' + csmId, { headers: header });
  }
  RefreshCSSBatchCustomers(batchid: number): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<CssBatchCustomersExtendedModel[]>(this.apiurl + '/RefreshCSSBatchCustomers?BatchId=' + batchid, { headers: header });
  }

  GenerateMissingCustomerContacts(batchid: number): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<any>(this.apiurl + '/GenerateMissingCustomerContacts?batchId=' + batchid, { headers: header });
  }
  GetCSSBatchCustomers(batchid: number): Observable<CssBatchCustomersExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<CssBatchCustomersExtendedModel[]>(this.apiurl + '/GetCSSBatchCustomers?BatchId=' + batchid, { headers: header });
  }
  GetCSMList(): Observable<CSMList[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<CSMList[]>(this.apiurl + '/GetCSMList', { headers: header });
  }

  GetCSMListDistinct(): Observable<CSMList[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<CSMList[]>(this.apiurl + '/GetCSMListDistinct', { headers: header });
  }

  GetCSMListByCustomerIds(custIds: String): Observable<CSMList[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.post<CSMList[]>(this.apiurl + '/GetCSMListByCustomerIds', custIds, { headers: header });
  }

  // monthly start
  GetCSSMonthlyBatches(): Observable<CssBatchMonthlyModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<CssBatchMonthlyModel[]>(this.apiurl + '/GetCSSBatchesMonthly', { headers: header });
  }
  GetCSSBatchCustomersMonthly(batchid: number): Observable<CssBatchCustomerMonthlyExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<CssBatchCustomerMonthlyExtendedModel[]>(this.apiurl + '/GetCSSBatchCustomersMonthly?BatchId=' + batchid, { headers: header });
  }

  SendCSSBatchSurveyMailsMonthly(batch: CssBatchMonthlyModel, selectedIds: string): Observable<CssBatchCustomerMonthlyExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'selectedIds': selectedIds });
    return this._http.post<CssBatchCustomerMonthlyExtendedModel[]>(this.apiurl + '/SendCSSBatchSurveyMailsMonthly', batch, { headers: header });
  }
  RefreshCSSBatchCustomersMonthly(batchid: number): Observable<CssBatchCustomerMonthlyExtendedModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<CssBatchCustomerMonthlyExtendedModel[]>(this.apiurl + '/RefreshCSSBatchCustomersMonthly?BatchId=' + batchid, { headers: header });
  }
  AddCSSBatchesMonthly(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid')
    });
    return this._http.post<any>(this.apiurl + '/AddCSSBatchesMonthly', data, { headers: header });
  }

  // monthly end

  AddCSSBatch(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid')
    });
    return this._http.post<any>(this.apiurl + '/AddCSSBatch', data, { headers: header });
  }

  updateCustomerContactsVerification(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid')
    });
    return this._http.post<any>(this.apiurl + '/UpdateCustomerContactsVerification', data, { headers: header });
  }

  updateCustomerContactsVerificationForPremier(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid')
    });
    return this._http.post<any>(this.apiurl + '/UpdateCustomerContactsVerificationForPremier', data, { headers: header });
  }

  Logout(): Observable<any> {
    let token = this._util.AppSettings.token;
    this._util.empid('');
    this._util.displayname('');
    this._util.token('');
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': token });
    return this._http.post<any>(this.apiurl + '/Logout', '', { headers: header });
  }

  GetCSSCustomerVerifications(starT_DATE:any,enD_DATE: any, custId:any): Observable<CssCustomerVerificationModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid')});
    
    header = header.append('startDate', starT_DATE);
    header = header.append('endDate', enD_DATE);
    header = header.append('custId', custId);
    
    return this._http.get<CssCustomerVerificationModel[]>(this.apiurl + '/GetCSSForVerification', { headers: header });
  }

  UpdateCustomerContactsVerificationList(cssCustomerVerifications:any[],csmAction:any, comments:any): Observable<CssCustomerVerificationModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid')});  

    let params = new HttpParams().set('csmAction', csmAction); 
    params = params.append('comments', comments); 
    return this._http.post<CssCustomerVerificationModel[]>(this.apiurl + '/UpdateCustomerContactsVerificationList',cssCustomerVerifications, { headers: header ,params:params});
  }
  
}
