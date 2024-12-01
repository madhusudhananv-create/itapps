import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { myUtility } from '../../Shared/myUtility';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  apiurl: string = '';
  apiurl_auth: string = '';
  constructor(private _http: HttpClient, public _util: myUtility,) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
   }
   GetReport(): Observable<any[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.post<any[]>(this.apiurl + '/GetReports', '', { headers: header });
  }

  Logout(): Observable<any> {
    let token = this._util.AppSettings.token;
    this._util.empid('');
    this._util.displayname('');
    this._util.token('');
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': token });
    return this._http.post<any>(this.apiurl + '/Logout', '', { headers: header });
  }
}
