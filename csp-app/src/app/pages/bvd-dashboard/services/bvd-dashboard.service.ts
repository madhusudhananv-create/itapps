import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';

@Injectable()
export class BvdDashboardService {
  apiurl: string = "";
  apiurl_auth: string = "";
  public dashboardStartdate: Date;
  public dashboardEnddate: Date;

  constructor(private _util: myUtility, private _http: HttpClient) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }

  getQualitativeBenefit(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetQualitativeBenefit", data, { headers: header });
  }

  getValuePieChart(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetValuePieChart", data, { headers: header });
  }

  getIdeaStatusCountsByType(data) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetIdeasStatusCountStackedChart", data, { headers: header });
  }

  getvalueColumnChart(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetValueColumnChart", data, { headers: header });
  }
  getUOM(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    if (localStorage.getItem("empid") != undefined && localStorage.getItem("empid") != null && localStorage.getItem("empid") != '')
      return this._http.get<any[]>(this.apiurl + "/GetAllUOM", { headers: header });
    
  }
  getQualitativeBenefitDetail(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetQualitativeBenefitDetail", data, { headers: header });
  }

  getQuantitativeBenefitsDetail(data): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetQuantitativeBenefitsDetail", data, { headers: header });
  }



}
