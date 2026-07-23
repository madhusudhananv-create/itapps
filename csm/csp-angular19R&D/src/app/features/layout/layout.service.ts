import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyUtility } from '../../shared/my-utility';
import { environment } from '../../../environments/environment';

// TODO: Import these models when they are migrated
// import { cusT_GROUP } from '../../models/customer-portfolio-project-model';
// import { FailureAssessment } from '../../models/fmea/fm-project-mapping';

// Temporary type definitions until models are migrated
export interface cusT_GROUP {
  [key: string]: any;
}

export interface FailureAssessment {
  [key: string]: any;
}

/**
 * Layout Service
 * Provides shared services for layout-related components
 * 
 * Features:
 * - Manages selected customer and project
 * - FMEA (Failure Mode and Effects Analysis) operations
 * - Customer user management
 * - Survey operations
 * 
 * Migrated from Angular 6 to Angular 19
 * All business logic preserved exactly from legacy
 */
@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  apiurl: string = "";
  apiurl_auth: string = "";
  approvedMappings: FailureAssessment[] = [];

  public selectedCust: string = '';
  public selectedProj: string = '';
  public custGroup: cusT_GROUP[] = [];

  constructor(private _util: MyUtility, private _http: HttpClient) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }

  GetProjectSpecificFailures(data: any) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid") || '',
    });
    return this._http.post<any[]>(
      this.apiurl + "/GetProjectSpecificFailures", 
      data, 
      { headers }
    );
  }

  UpdateProjectFailure(data: any) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid") || '',
    });
    return this._http.post<any[]>(
      this.apiurl + "/UpdateProjectFailure", 
      data, 
      { headers }
    );
  }

  GetRatingFactors(ratingType: string) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid") || '',
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetRatingFactors?ratingType=" + ratingType, 
      { headers }
    );
  }

  DeleteProjectFailure(id: any) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid") || '',
    });
    return this._http.get<any[]>(
      this.apiurl + "/DeleteProjectFailure?failureId=" + id, 
      { headers }
    );
  }

  ApproveSelected(data: any) {
    const headers = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid") || '',
    });
    return this._http.post<any[]>(
      this.apiurl + "/ApproveSelected", 
      data, 
      { headers }
    );
  }

  GetAllCustomerUser(custId: string, projId: string, isMonthly: boolean, startDate: string, endDate: string): Observable<any[]> {
    const header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid") || '',
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetAllCustomerUser?customerId=" + custId + "&projId=" + projId + "&isMonthly=" + isMonthly + "&startDate=" + startDate + "&endDate=" + endDate, 
      { headers: header }
    );
  }

  getSurveyGuid(surveyParam: any): Observable<any> {
    const header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid") || '',
    });
    return this._http.post<any>(
      this.apiurl + "/GetSurveyGuid", 
      surveyParam, 
      { headers: header }
    );
  }
}
