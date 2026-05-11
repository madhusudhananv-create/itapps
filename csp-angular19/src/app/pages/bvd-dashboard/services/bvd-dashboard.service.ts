import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MyUtility } from '../../../shared/my-utility';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BvdDashboardService {
  private _util = inject(MyUtility);
  private _http = inject(HttpClient);

  apiurl: string = "";
  apiurl_auth: string = "";
  public dashboardStartdate: Date;
  public dashboardEnddate: Date;

  constructor() {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
    
    // Initialize with current year dates by default
    const currentYear = new Date().getFullYear();
    this.dashboardStartdate = new Date(currentYear, 0, 1); // January 1
    this.dashboardEnddate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31
  }

  /**
   * Helper to create auth headers consistently
   * ALWAYS uses localStorage to avoid signal timing issues
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: "application/json",
      token: localStorage.getItem("token") || "",
      empId: localStorage.getItem("empid") || "",
    });
  }

  getQualitativeBenefit(data: any): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/GetQualitativeBenefit", 
      data, 
      { headers: this.getAuthHeaders() }
    );
  }

  getValuePieChart(data: any): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/GetValuePieChart", 
      data, 
      { headers: this.getAuthHeaders() }
    );
  }

  getIdeaStatusCountsByType(data: any): Observable<any[]> {
    return this._http.post<any[]>(
      this.apiurl + "/GetIdeasStatusCountStackedChart", 
      data, 
      { headers: this.getAuthHeaders() }
    );
  }

  getvalueColumnChart(data: any): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/GetValueColumnChart", 
      data, 
      { headers: this.getAuthHeaders() }
    );
  }

  getUOM(): Observable<any[]> {
    const empId = localStorage.getItem("empid");
    if (empId && empId !== '') {
      return this._http.get<any[]>(
        this.apiurl + "/GetAllUOM", 
        { headers: this.getAuthHeaders() }
      );
    }
    return new Observable<any[]>();
  }

  getQualitativeBenefitDetail(data: any): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/GetQualitativeBenefitDetail", 
      data, 
      { headers: this.getAuthHeaders() }
    );
  }

  getQuantitativeBenefitsDetail(data: any): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/GetQuantitativeBenefitsDetail", 
      data, 
      { headers: this.getAuthHeaders() }
    );
  }
}
