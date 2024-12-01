import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { myUtility } from '../../Shared/myUtility';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StaffingSharedService {

  apiurl: string = '';
  apiurl_auth: string = '';
  constructor(private _http: HttpClient, private _util: myUtility) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }
  //Staffing Summary
  GetStaffingSummaryReport(custId: string, isBilledReport?: string): Observable<any[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'custId': custId, 'isBillingRpt': isBilledReport });
    return this._http.get<any[]>(this.apiurl + '/GetStaffingSummaryReport?=' + custId + '&isBillingRpt=' + isBilledReport, { headers: header });
  }
  GetStaffingAssignedProjects(custId: string, projId?: string): Observable<any[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'custId': custId, 'projectId': projId });
    return this._http.get<any[]>(this.apiurl + '/GetStaffingAssignedProjects?custId=' + custId + '&projectId=' + projId, { headers: header });
  }
  GetStaffingProjectSummary(custId: string, projId?: string): Observable<any[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'custId': custId, 'projectId': projId });
    return this._http.get<any[]>(this.apiurl + '/GetStaffingProjectSummary?custId=' + custId +'&projectId=' + projId, { headers: header });
  }
  GetStaffingProjectDetails(projId: string): Observable<any[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'projId': projId });
    return this._http.get<any[]>(this.apiurl + '/GetStaffingProjectDetails?projId=' +projId, { headers: header });
  }
  GetStaffingAssignedProjectDetails(projId: string): Observable<any[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid'), 'projId': projId });
    return this._http.get<any[]>(this.apiurl + '/GetStaffingAssignedProjectDetails?projId=' +projId, { headers: header });
  }
}
