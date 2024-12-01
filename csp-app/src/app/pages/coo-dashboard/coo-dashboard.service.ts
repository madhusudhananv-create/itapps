import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { myUtility } from '../../Shared/myUtility';
import { environment } from '../../../environments/environment';
import { DashboardSearchParams, NameValuePair } from '../../models/coo-dashboard-model';
import { Chart } from 'angular-highcharts';
import { EWSDetailsModel } from '../../models/ews-details-model';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { COODashboardCommon } from './coo-dashboard-common';


@Injectable({
  providedIn: 'root'
})
export class COODashboardService {
  apiurl: string = "";
  apiurl_auth: string = "";

  constructor(private _util: myUtility, private _http: HttpClient, public _cooDashboardCommon: COODashboardCommon) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
    this._cooDashboardCommon.ViewId = 5;
    this._cooDashboardCommon.projectIds = this._util.getProjectListForUser();
    this._cooDashboardCommon.selectedQPeriodCss = "Q" + this._util.getCurrentQuarter();
    this._cooDashboardCommon.selectedQPeriodCsg = "Q" + this._util.getCurrentQuarter();
    this._cooDashboardCommon.selectedYearCss = this._cooDashboardCommon.date.getFullYear();
    this._cooDashboardCommon.selectedYearCsg = this._cooDashboardCommon.date.getFullYear();
  }
  getDashboardSearchParams(projectIds, startDate, endDate) {
    return this._cooDashboardCommon.getDashboardSearchParams(projectIds, startDate, endDate);
  }
  getEarlyWarningSignalCount(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetEarlyWarningSignalCount", data, { headers: header });
  }
  getKPIPerspectives(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);

    return this._http.post<any>(this.apiurl + "/GetKPIPerspectives", data, { headers: header });
  }
  getCSSTableForProjects(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetCSSTableForProjects", data, { headers: header });
  }


  getActionitemsDetailsForProjects(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetActionitemsDetailsForProjects", data, { headers: header });
  }
  getRisksDetailsForProjects(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetRisksDetailsForProjects", data, { headers: header });
  }

  getIssuesDetailsForProjects(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetIssuesDetailsForProjects", data, { headers: header });
  }

  getContractStatusDetailsForProjects(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetContractStatusDetailsForProjects", data, { headers: header });
  }
  getCSSNPSScoreForProjects(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetCSSNPSScoreForProjects", data, { headers: header });
  }
  getAchievementsByCustomerSuccessGoal(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetAchievementsByCustomerSuccessGoal", data, { headers: header });
  }

  getOverallAccountHealth(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetOverallAccountHealth", data, { headers: header });
  }


  getAccountOverallHealthForPeriod(projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetOverallAccountHealth", data, { headers: header });
  }

  getEarlyWarningSignalDetails(ews: EWSDetailsModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetEarlyWarningSignalDetails", ews, {
      headers: header,
    });
  }


  getSuccessGoalScore(projectIds: string[], startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = this.getDashboardSearchParams(projectIds, startDate, endDate);
    return this._http.post<any>(this.apiurl + "/GetSuccessGoalScore", data, {
      headers: header,
    });
  }

  getOverallHealthIndex(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetOverallHealthIndex", data, { headers: header });
  }

  getOverallHealthIndexTrend(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetOverallHealthIndexTrend", data, { headers: header });
  }

  getActionitemsForProjects(data, projIds): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    }); data.PROJ_IDS = projIds;
    return this._http.post<any[]>(this.apiurl + "/GetActionitemsForProjects", data, {
      headers: header,
    });
  }

  getRisksForProjects(data, projIds): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    data.PROJ_IDS = projIds;
    return this._http.post<any[]>(this.apiurl + "/GetRisksForProjects", data, {
      headers: header,
    });
  }

  getIssuesForProjects(data, projIds): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    // data.StarT_DATE= startDate;
    // data.enD_DATE= endDate;
    data.PROJ_IDS = projIds;
    return this._http.post<any[]>(this.apiurl + "/GetIssuesForProjects", data, {
      headers: header,
    });
  }

  getProjectTeamCountForProjects(data, projIds): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    data.PROJ_IDS = projIds;
    return this._http.post<any[]>(this.apiurl + "/GetProjectTeamCountForProjects", data, {
      headers: header,
    });
  }
  getCustomersuccessKPIPerformance(custID, projectIds, startDate, endDate, goalId, selGroupBy): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token,
      empId: localStorage.getItem("empid")
    });

    let data: DashboardSearchParams = new DashboardSearchParams();
    data.START_DATE = startDate; //new Date(date.getFullYear(), date.getMonth() - 6, 1);
    data.END_DATE = endDate;// new Date(date.getFullYear(), date.getMonth(), 0);
    data.PROJ_IDS = projectIds;
    data.CUST_ID = custID;
    data.GOAL_ID = goalId;

    return this._http.post<any[]>(this.apiurl + "/GetCustomersuccessKPIPerformance?groupBy=" + selGroupBy, data, {
      headers: header,
    });
  }

  GetKPITrendTargetActualsByGoal(custID, projectIds, startDate, endDate): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token,
      empId: localStorage.getItem("empid")
    });

    let data: DashboardSearchParams = new DashboardSearchParams();
    data.START_DATE = startDate; //new Date(date.getFullYear(), date.getMonth() - 6, 1);
    data.END_DATE = endDate;// new Date(date.getFullYear(), date.getMonth(), 0);
    data.PROJ_IDS = projectIds;
    data.CUST_ID = custID;
    return this._http.post<any[]>(this.apiurl + "/GetKPITrendTargetActualsByGoal", data, {
      headers: header,
    });
  }
  getProjectsFromProjectsByCustID(data, custID): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    data.CUST_ID = [custID];
    if (data.CUST_ID.length > 1)
      data.CUST_ID = custID;
    // data.PROJ_IDS = ["-1"];
    data.GOAL_ID = 0;
    return this._http.post<any[]>(this.apiurl + "/GetProjectsFromProjectsByCustID", data, {
      headers: header,
    });
  }


}
