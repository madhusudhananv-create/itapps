import { Injectable } from '@angular/core';
import { cusT_GROUP } from '../../models/customer-portfolio-project-model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { myUtility } from '../../Shared/myUtility';
import { environment } from '../../../environments/environment';
import { FailureAssessment } from '../../models/fmea/fm-project-mapping';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  apiurl: string = "";
  apiurl_auth: string = "";
  approvedMappings: FailureAssessment[] = [];

  constructor(private _util: myUtility, private _http: HttpClient, ) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }

  public selectedCust: string;
  public selectedProj: string;
  public custGroup: cusT_GROUP[];

  GetProjectSpecificFailures(data) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.post<any[]>(
      this.apiurl +
      "/GetProjectSpecificFailures", data, { headers }
    );
  }

  UpdateProjectFailure(data) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.post<any[]>(
      this.apiurl +
      "/UpdateProjectFailure", data, { headers }
    );
  }

  GetRatingFactors(ratingType) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.get<any[]>(
      this.apiurl + "/GetRatingFactors?ratingType=" + ratingType, { headers }
    );
  }

  DeleteProjectFailure(id) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.get<any[]>(
      this.apiurl + "/DeleteProjectFailure?failureId=" + id, { headers }
    );
  }

  ApproveSelected(data) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.post<any[]>(
      this.apiurl + "/ApproveSelected", data, { headers }
    );
  }
  GetAllCustomerUser(custId,projId,isMonthly): Observable<any[]>{
    const header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.get<any[]>(
      this.apiurl + "/GetAllCustomerUser?customerId=" + custId +"&projId=" + projId + "&isMonthly=" +isMonthly, { headers:header }
    );
  }
  getSurveyGuid(surveyParam): Observable<any>{
    const header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.post<any>(
      this.apiurl + "/GetSurveyGuid",surveyParam,{headers : header}
  );
  }
  getReportdetails(isMonthly):Observable<any[]>{
    const header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.get<any[]>(this.apiurl + "/GetReportDetails?isMonthly="+ isMonthly,{headers:header});
  }

  getRportSpName(isMonthly):Observable<any>{
    const header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.get<any>(this.apiurl + "/GetReportSpName?isMonthly="+ isMonthly,{headers:header});
  }

  downloadReport(surveyParam):Observable<any>{
    const header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    })
    return this._http.post<any>(
      this.apiurl + "/DownlaodReport",surveyParam,{headers : header}
    )}


}
