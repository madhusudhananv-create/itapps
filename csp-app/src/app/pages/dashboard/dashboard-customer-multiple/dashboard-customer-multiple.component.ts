import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { MediaMatcher } from '@angular/cdk/layout';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../../environments/environment';
import { AccessControl } from '../../../Shared/accessControl';
import { AppsService } from '../../../Services/apps.service';
import { Configuration } from '../../../services/app.configuration';
import { myUtility } from '../../../Shared/myUtility';
import { CustomerModel } from '../../../models/customer-model';
import { DashboardDetailsModel } from '../../../models/dashboard-details-model';
import { DashboardService } from '../../../pages/dashboard/dashboard.service';
import { SharedData } from '../../../Shared/sharedData';
import { DomainConfigService } from '../../../Services/app.domain.config';


@Component({
  selector: 'app-dashboard-customer-multiple',
  templateUrl: './dashboard-customer-multiple.component.html',
  styleUrls: ['./dashboard-customer-multiple.component.scss']
})
export class DashboardCustomerMultipleComponent implements OnInit {
  progress: boolean = false;
  dashboardDetails: DashboardDetailsModel[] = [];
  dashboardDetailsCustomerLevel: DashboardDetailsModel[] = [];
  private sub: any;
  mobileQuery: MediaQueryList;
  webapiuri: String = "";
  canedit: any;
  count: number = 0;
  token: string;
  empid: string;
  displayname: string;
  projectid: string;
  oauth: string;
  shouldRun: true;
  legend: boolean = false;
  updateddate: Date;
  private _mobileQueryListener: () => void;

  customerList: CustomerModel[] = [];

  constructor(public _dashboardUtil: DashboardService, public _access: AccessControl, private route: ActivatedRoute, private _router: Router, private _http: Http, private _appservice: AppsService, private _config: Configuration, public _util: myUtility, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private _spinner: Ng4LoadingSpinnerService, public sharedData: SharedData, public domainConfig: DomainConfigService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.webapiuri = environment.webapiuri;
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  fillerNav = Array(50).fill(0).map((_, i) => `Nav Item ${i + 1}`);

  ngOnInit() {
    this.empid = localStorage.getItem('empid');
    this.service_LoadCustomerByEmpId();
    
    //this._appservice.RefreshDashboardDetailsAuto().subscribe(a => { console.log("Dashboard Update") }, error => { });


    // this.startTimer();
  }

  ResetFilter(custId, slaAvailable) {
    if (!slaAvailable)
      this._router.navigate(['/newdashboard/cust', custId, true]);
    else
      this._router.navigate(['/serviceleveldashboard/cust', custId, true])
    this._dashboardUtil.csG_FILTER_MONTH = this._util.Month();
    this._dashboardUtil.csG_FILTER_YEAR = this._util.Year();
  }

  //Timer --------------------------
  timeLeft: number = 600;
  interval;
  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
      else {
        this.timeLeft = 600;
        this.service_GetDashboardDetails();
      }
    }, 1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
  }
  //Timer --------------------------
  //---------------------------------------------
  Refresh_Onclick() {
    this.service_refreshDashboardDetails();
  }
  getTitleByCustomer(title) {
    let content: string = '';
    // if (this.dashboardDetails != undefined) {
    //   let details: DashboardDetailsModel[] = [];
    //   details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null);
    //   if (details.length > 0) {
    //     content = details[0].content;
    //   }
    // }
    return content;
  }
  getColorByCustomer(title) {
    let content: string = '';
    if (this.dashboardDetailsCustomerLevel != undefined && this.dashboardDetailsCustomerLevel != null && this.dashboardDetailsCustomerLevel.length >0) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetailsCustomerLevel.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null);
      if (details.length > 0) {
        content = details[0].color;
      }
    }
    return content;
  }
  getTitleByCustomerId(title, customerId) {
    let content: string = '';
    if (this.dashboardDetailsCustomerLevel != undefined && this.dashboardDetailsCustomerLevel != null && this.dashboardDetailsCustomerLevel.length >0) {
      let details: DashboardDetailsModel[] = [];
      var firstLevel = this.dashboardDetailsCustomerLevel.filter(t =>   t.cusT_ID == customerId);
      details = firstLevel.filter(t => t.title == title  );
      if (details.length > 0) {
        content = details[0].content;
      }
    }
    return content;
  }
  getColorByCustomerId(title, customerId) {
    let content: string = '';
    if (this.dashboardDetailsCustomerLevel != undefined && this.dashboardDetailsCustomerLevel != null && this.dashboardDetailsCustomerLevel.length >0) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetailsCustomerLevel.filter(t => t.title == title && t.cusT_ID == customerId && t.proJ_ID == null && t.portfoliO_ID == null);
      if (details.length > 0) {
        content = details[0].color;
      }
    }
    return content;
  }
  getTitleByPortfolio(title, portfolio) {
    let content: string = '-';
    if (this.dashboardDetails != undefined && this.dashboardDetails != null && this.dashboardDetails.length >0) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.portfoliO_ID == portfolio);
      if (details.length > 0) {
        content = details[0].content;
      }
    }
    return content;
  }
  getGraphValue_portfolio(title, id) {
    let iValue = 0;
    let sValue = this.getTitleByPortfolio(title, id);
    if (sValue != undefined && sValue != "-")
      iValue = Number(sValue);
    else
      iValue = 0;
    return iValue;
  }
  //--------------------


  Authenticate1(oauth) {
    this._appservice.authenticatewithtoken(oauth).
      subscribe(response => {
      }, error => {
        this._util.serviceError(error);
      });
  }
  createAuthorizationHeader(headers: Headers, username, password) {
    headers.append('Authorization', 'Basic ' +
      btoa(username + ':' + password));
  }


  //**********************************************
  // Events
  //**********************************************

  ClientBG: string;
  getClientBG(ID) {
    if (this.ClientBG == undefined) {
      this.ClientBG = ID;
    }
    if (this.ClientBG === ID)
      //return '#F3F4F8';
      return '#e3e3e5';
    else
      return 'white';

  }
  ProjectBG: string;
  getProjectBG(ID) {
    if (this.ProjectBG === ID)
      //return '#e4e3e3';
      return '#c6ddf9'; //'#c4c2c2';
    else
      return 'white';
  }
  GetLastUpdateDate(proJ_ID) {
    this._appservice.getLastUpdatedDate(proJ_ID).subscribe(data => { this.updateddate = data; }, error => { this._util.serviceError(error); });
  }
  getProjectColor(ID) {
    if (this.ProjectBG === ID)
      //return '#e4e3e3';
      return 'black'; //'#c4c2c2';
    else
      return '#6b6969';
  }

  OverallStatus_onClick(event) {
    alert("double click");
  }
  //**********************************************
  // General Methods
  //**********************************************
  _readonly: boolean = true;
  IsEditAllowed() {
    if (this.canedit === 'true')
      return true;
    else
      return false;
  }
  //----------------------------------------
  EditCustIndex: number;
  EditCustId: string;
  EditCust_onClick(index, id) {
    this.EditCustIndex = index;
    this.EditCustId = id;
  }
  IsReadonlyCust(i, id) {
    if (this.EditCustIndex === i && this.EditCustId === id)
      return false;
    else
      return true;
  }
  SaveCust_onClick(client, ragValue) {
    client.client_RAG = ragValue;
    this.service_updateClientRag(client, ragValue)
    this.EditCustIndex = null;
    this.EditCustId = null;
  }
  CancelCust_onClick() {
    this.EditCustIndex = null;
    this.EditCustId = null;
  }
  //----------------------------------------
  EditProjIndex: number;
  EditProjId: string;
  EditProj_onClick(index, projid) {
    this.EditProjIndex = index;
    this.EditProjId = projid;
  }
  IsReadonlyProj(i, projid) {
    if (this.EditProjIndex === i && this.EditProjId === projid)
      return false;
    else
      return true;
  }
  SaveProj_onClick(proj, ragValue) {
    proj.proJ_RAG = ragValue;
    this.service_updateRags(proj.proJ_ID, 'project', ragValue)
    this.EditProjIndex = null;
    this.EditProjId = null;
  }
  CancelProj_onClick() {
    this.EditProjIndex = null;
    this.EditProjId = null;
  }
  //--------------------------------------

  today() {
    return new Date();
  }
  // validateLogin() {
  //   this.empid = localStorage.getItem('empid');
  //   this.token = localStorage.getItem('token');
  //   if (this.empid === "" || this.empid === null) {
  //     alert("Please login again");
  //     this._router.navigateByUrl('/login');
  //   }
  // }



  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
  errorMessage: string;

  dataUpdate: any;
  fdate: any;

  service_updateClientRag(client, rag) {
    this.webapiuri = environment.webapiuri;
    let apiuri: string = this.webapiuri + 'UpdateClient';

    this.dataUpdate = {
      CUSTOMER_ID: client.client_ID,
      CUSTOMER_NAME: client.client_NM,
      RAG: rag,
      CUSTOMER_DESCRIPTION: client.client_Description,
      CUSTOMER_GOALS: client.client_Goals,
      GAVS_DESCRIPTION: client.gavs_Description,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }

    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //---------------------
  service_updateRags(projId, category, rag) {
    this.webapiuri = environment.webapiuri;
    let apiuri: string = this.webapiuri + 'Rags';
    this.dataUpdate = {
      PROJECT_ID: projId,
      CATEGORY: category,
      RAG: rag,
      PUBLISHED_ON: new Date(),
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  // Initialize data
  //**********************************************
  ShowSideNav() {
    if (window.screen.width > 600) {
      this._util.ShowSideNav = true;
    }
    else {
      this._util.ShowSideNav = false;
    }
  }
  enablestatus() {
    if (this.count == 0) {
      this.legend = true;
      this.count = this.count + 1;
    }
    else {
      this.legend = false;
      this.count = 0
    }
  }
  logout() {
    if (confirm("Are you sure you want to log out?")) {
      if (this._util.IsGAVS()) {
        this.service_Logout();
        let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
        window.location.href = loginurl;
      }
      else {
        this.service_Logout();
        this._router.navigateByUrl('/login');
      }
    }
  }

  //**********************************************
  //service methods
  //**********************************************
  service_GetDashboardDetails() {
    let customerIds: string[] = this.customerList.map(x => x.cusT_ID);
    this._appservice.GetDashboardDetailsByCustomerIds(customerIds).subscribe(data => {
      this.dashboardDetails = data;
      this.dashboardDetailsCustomerLevel = data.filter(x=>x.proJ_ID == null);
      this._appservice.CheckProjectAllocationExpiry().subscribe(e => {

        if (e != "") {
          alert("The following projects (" + e + ") or allocation to these projects are about to end within the next ten days.  In case the project/allocation end date is not extended in the PSA system, all those project team members will not be able to access (including view) the projects in the CSM Platform. Please review and extend the allocation end date appropriately in the PSA system. In case these projects are about to end then ignore this message. ");
  
        }
      });
    }, error => { this._util.serviceError(error); });
  }
  service_LoadCustomerByEmpId() {
    let istoFindSLA = true;
    this._appservice.GetCustomerList(localStorage.getItem('empid'), istoFindSLA).subscribe(data => {
      this.customerList = data;
      localStorage.setItem('CustomerIds', JSON.stringify(data));
      localStorage.setItem('slaAvailableList', JSON.stringify(data.map(x => ({ customerId: x.cusT_ID, customerName: x.cusT_NM, slaAvailable: x.iS_SLA_AVAILABLE }))));

      if (data.length === 0) {
        alert("Customer Accounts are visible here based on your allocation in respective projects in PSA. Looks like there are no active allocations or all the projects you are allocated to have ended. Please take it up with your manager and get allocated in required projects for you to manage them in the CSM Platform. Please send an email to WFM@" + environment.domain_name + "for allocation or extending the allocation.");
      }
      this.service_GetDashboardDetails();
    }, error => { this._util.serviceError(error); });
  }
  service_refreshDashboardDetails() {
    this.progress = true;
    this._appservice.RefreshDashboardDetails().subscribe(data => {
      this.progress = false;
      this.service_GetDashboardDetails();
    }, error => {
      this.progress = false;
      this._util.serviceError(error);
    });
  }
  service_Logout() {
    this._appservice.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
      localStorage.setItem('CustomerIds', "");
    }, error => { this._util.serviceError(error); });
  }
}
