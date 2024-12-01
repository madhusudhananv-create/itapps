import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HighlightsModel } from '../models/highlights-model';
import { ChartsModel } from '../models/charts-model';
import { environment } from '../../environments/environment';
import { Notes } from '../models/notes';
import { CustomerProjectsListModel } from '../models/customer-projects-model';


@Injectable()
export class ChartsService {
  apiurl: string = '';
  apiurl_auth: string = '';
  constructor(private _http: HttpClient) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }

  getNotesForCustomer(customerid, token): Observable<Notes[]> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<Notes[]>(this.apiurl + '/GetNotesForCustomer?CustomerId=' + customerid, { headers: header });
  }

  getHighlights(customerid, projectid, token): Observable<HighlightsModel[]> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<HighlightsModel[]>(this.apiurl + '/GetHighlights?CustomerId=' + customerid + '&ProjectId=' + projectid, { headers: header });
  }

  getHighlightsByDate(customerid, projectid, date, period, token): Observable<HighlightsModel[]> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<HighlightsModel[]>(this.apiurl + '/GetHighlightsByDate?CustomerId=' + customerid + '&ProjectId=' + projectid + '&CurrentDate=' + date + '&Period=' + period, { headers: header });
  }
  getCharts(customerid, projectid, date, period, token): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(this.apiurl + '/GetCharts?CustomerId=' + customerid + '&ProjectId=' + projectid + '&CurrentDate=' + date.toDateString() + '&Period=' + period, { headers: header });
  }

  getRiskChart(riskDashboardInputs, token): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.post<any>(this.apiurl + "/GetRiskChartData",riskDashboardInputs,{ headers: header }
    );
  }

  getGoalDetails(customerid, projectid, date, period, token): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(this.apiurl + '/GetSuccessGoalAndKPIDetails?CustomerId=' + customerid + '&ProjectId=' + projectid + '&CurrentDate=' + date.toDateString() + '&Period=' + period, { headers: header });
  }

  getTrendHighChartDetails(customerid, projectid, date, token): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(this.apiurl + '/GetTrendHighChartsGroup?CustomerId=' + customerid + '&ProjectId=' + projectid + '&CurrentDate=' + date.toDateString(), { headers: header });
  }
  getTrendHighChartDetailsForProductKPI(customerId, prodId, date, token, viewBy): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(this.apiurl + '/GetTrendHighChartsGroupForProduct?customerId='
      + customerId + '&prodId=' + prodId + '&CurrentDate=' + date.toDateString() + '&viewBy=' + viewBy, { headers: header });
  }
  getTrendHighChartDetailsForPortfolio(customerId, portId, KpiName, date, token, viewBy): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(this.apiurl + '/GetTrendHighChartDetailsForPortfolio?customerId=' + customerId + '&portId=' + portId + '&kpiName=' + KpiName + '&CurrentDate=' + date.toDateString() + '&viewBy=' + viewBy, { headers: header });
  }

  getTrendHighChartDetailsForEngagement(customerId, KpiName, date, token, viewBy): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(this.apiurl + '/GetTrendHighChartDetailsForEngagement?customerId=' + customerId + '&kpiName=' + KpiName + '&currentDate=' + date.toDateString() + '&viewBy=' + viewBy, { headers: header });
  }

  getTable(customerid, projectid, date, period, token): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });

    return this._http.get<any>(this.apiurl + '/GetTable?CustomerId=' + customerid + '&ProjectId=' + projectid + '&CurrentDate=' + date + '&Period=' + period, { headers: header });
  }

  getTableSuccess(selGroupBy, customerid, projectid, date, period, selSeviceTower, token): Observable<any> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    }); 
    if (selGroupBy == "1")
      return this._http.get<any>(this.apiurl + '/GetSuccessGoalsGroupByServiceTower?CustomerId=' + customerid + '&ProjectId=' + projectid + '&CurrentDate=' + date + '&Period=' + period + '&serviceTowerId=' + selSeviceTower, { headers: header });
    else if (selGroupBy == "3")
      return this._http.get<any>(this.apiurl + '/GetSuccessGoalsGroupByKPI?CustomerId=' + customerid + '&ProjectId=' + projectid + '&CurrentDate=' + date + '&Period=' + period + '&serviceTowerId=' + selSeviceTower, { headers: header });
    else if (selGroupBy == "2")
      return this._http.get<any>(this.apiurl + '/GetTable?CustomerId=' + customerid + '&ProjectId=' + projectid + '&CurrentDate=' + date + '&Period=' + period + '&serviceTowerId=' + selSeviceTower, { headers: header });

  }
  getTaggedCustomerIds(empid, token): Observable<string[]> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });

    return this._http.get<string[]>(this.apiurl + '/GetTaggedCustomerIds?EmpId=' + empid, { headers: header });
  }

  getCustomerId(empid, token): Observable<string[]> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });

    return this._http.get<string[]>(this.apiurl + '/GetCustomerIdOfACustomer?EmpId=' + empid, { headers: header });
  }

  getAllCustomerIds(token): Observable<string[]> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });

    return this._http.get<string[]>(this.apiurl + '/GetAllCustomerIds', { headers: header });
  }

  getCustomerProjectsList(empid, token, allproj): Observable<CustomerProjectsListModel[]> {
    let header = new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      empId: localStorage.getItem("empid")
    });

    return this._http.get<CustomerProjectsListModel[]>(this.apiurl + '/GetCustomerProjectList?EmpId=' + empid + '&AllProj=' + allproj, { headers: header });
  }

}