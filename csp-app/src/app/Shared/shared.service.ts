import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { myUtility } from '../Shared/myUtility';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private methodCallSource = new Subject<void>();
  apiurl: string = '';
  apiurl_auth: string = '';
  savedportfolioId: number = 0;
  selectedPortfolios: number[] = [];
  selectedProjects: string[] = [];
  selectedProducts: string[]=[];
  //EWSCOmponent changes
  cooselectedProjects: string[]=[];
  AllAccounts:boolean=false;
  SelectedCustID:string;
  selectedCustIDarray:string[]=[];
  SelectedQuarter:number;
  StartDate:Date;
  EndDate:Date;
  SelectedYear:number;

  methodCalled$ = this.methodCallSource.asObservable();

  callMethod() {
    this.methodCallSource.next();
  }
 //EWSCOmponent changes
  constructor(private _http: HttpClient, private _util: myUtility) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }
  Logout(): Observable<any> {
    let token = this._util.AppSettings.token;
    this._util.empid('');
    this._util.displayname('');
    this._util.token('');
    let header = new HttpHeaders({ 
      'Accept': 'application/json', 
      'token': token ,
      empId: localStorage.getItem("empid")});
    return this._http.post<any>(this.apiurl + '/Logout', '', { headers: header });
  }

}
