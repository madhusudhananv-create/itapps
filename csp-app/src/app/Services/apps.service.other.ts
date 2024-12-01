import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs/Observable";
import { AppControlsModel } from "../models/access-control-model";
import { CSMTitlesModel } from "../models/csm-titles-model";

@Injectable()
export class AppServiceOthers {
    apiurl: string = '';
    apiurl_auth: string = '';
    constructor(private _http: HttpClient) {
        this.apiurl = environment.webapiuri;
        this.apiurl_auth = environment.webapiuri_auth;
    }

    getAppControls(token): Observable<AppControlsModel[]> {
        let header = new HttpHeaders({ 'Accept': 'application/json', 'token': token });
        return this._http.get<AppControlsModel[]>(this.apiurl + '/GetAppControls', { headers: header });
    }
    getAppRoles(token): Observable<CSMTitlesModel[]> {
        let header = new HttpHeaders({ 'Accept': 'application/json', 'token': token });
        return this._http.get<CSMTitlesModel[]>(this.apiurl + '/GetCSMTitles', { headers: header });
    }
    
  getBaseMeasureEnabledCustomers(token): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetBaseMeasureEnabledCustomers",
      { headers: header }
    );
  }

  getKPIProcessEnabledCustomers(token): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetKPIProcessEnabledCustomers",
      { headers: header }
    );
  }
  getAllProjectIdsForUser(token): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token:  token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllProjectIdsForUser",   {
      headers: header,
    });
  }

}
