import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CustomerModel } from '../../../models/customer-model';
import { AccessControl } from '../../../Shared/accessControl';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { MediaMatcher } from '@angular/cdk/layout';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { PortfolioModel } from '../../../models/portfolio-model';
import { DashboardDetailsModel, AllPortfolioDetails } from '../../../models/dashboard-details-model';
import { forEach } from '@angular/router/src/utils/collection';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard-portfolio',
  templateUrl: './dashboard-portfolio.component.html',
  styleUrls: ['./dashboard-portfolio.component.scss']
})
export class DashboardPortfolioComponent implements OnInit {
  progress: boolean = false;
  private sub: any;
  customerid: string;
  allportfolioData: AllPortfolioDetails[] = [];
  projectCount: number;
  dashboardDetails: DashboardDetailsModel[] = [];
  projectsCountArray: number[] = [];
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  count: number = 0;
  legend: boolean = false;

  portfolioList: PortfolioModel[] = []

  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;
  menuToggleStatus: boolean;

  constructor(private route: ActivatedRoute, private _router: Router, public _access: AccessControl, private _appservice: AppsService, public _util: myUtility, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  //Timer --------------------------
  timeLeft: number = 60;
  interval;
  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
      else {
        this.timeLeft = 60;
        this.service_GetDashboardDetails();
      }
    }, 1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  //Timer --------------------------
  fillerNav = Array(50).fill(0).map((_, i) => `Nav Item ${i + 1}`);

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.customerid = params['customerid'];
    });
    if (this.customerid != undefined) {
      this.service_LoadCustomerByEmpIdByCustomerId(this.customerid);
    }
  }
  fillGraphDetails() {
    this.fillCrispGraph();
  }
  fillCrispGraph() {
    for (let p of this.portfolioList) {
      p.crispGraphData = this.getGraphData(p.id);
    }
  }
  //---------------------------------------------
  //Graph
  type1 = 'PieChart';
  data1: any[] = [
    ['rating_1_2', 5],
    ['rating_3', 5],
    ['rating_4', 5],
    ['rating_5', 5],
    ['rating_none', 5],
  ]
  columnNames1 = ['Ratings', 'Count'];
  width1 = 120;
  height1 = 50;
  options1: google.visualization.PieChartOptions = {
    colors: ['red', '#ff6f00', '#5adb9a', '#3ab376', '#a9a9a9'],
    chartArea: { 'width': '100%', 'height': '80%', top: 0, bottom: 0, left: 10 },
    legend: {
      position: 'none'
    },
    pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 8 }
  };

  getGraphData(id) {
    //let titles: string[] = ['CSS_P_1_2', 'CSS_P_3', 'CSS_P_4', 'CSS_P_5', 'CSS_P_0'];
    let data: any[] = [];
    data.push(["Rating < 3", this.getGraphValue_portfolio('CSS_P_1_2', id)]);
    data.push(["Rating 3", this.getGraphValue_portfolio('CSS_P_3', id)]);
    data.push(["Rating 4", this.getGraphValue_portfolio('CSS_P_4', id)]);
    data.push(["Rating 5", this.getGraphValue_portfolio('CSS_P_5', id)]);
    data.push(["Survery not taken", this.getGraphValue_portfolio('CSS_P_0', id)]);
    // for (let t of titles) {
    //   data.push([
    //     t,
    //     this.getGraphValue_portfolio(t, id)
    //   ]);
    // }
    return data;
  }


  //---------------------------------------------
  getTitleByCustomer(title) {
    let content: string = '';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null);
      if (details.length > 0) {
        content = details[0].content;
      }
    }
    return content;
  }
  getColorByCustomer(title) {
    let content: string = '';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null);
      if (details.length > 0) {
        content = details[0].color;
      }
    }
    return content;
  }
  getTitleByPortfolio(title, portfolio) {
    let content: string = '-';
    if (this.dashboardDetails != undefined) {
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
  today() {
    return new Date();
  }
  getColorByPortfolio(title, portfolio) {
    let content: string = '-';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.portfoliO_ID == portfolio);
      if (details.length > 0) {
        content = details[0].color;
      }
    }
    return content;
  }
  service_GetDashboardDetails() {
    this._appservice.GetDashboardDetailsbyCustomerId(this.selectedCustomer.cusT_ID).subscribe(data => {
      this.dashboardDetails = data;
      this.fillGraphDetails();
    }, error => { this._util.serviceError(error); });
  }



  getGraphValue_customer(title) {
    let iValue = 0;
    let sValue = this.getTitleByCustomer(title);
    if (sValue != undefined)
      iValue = Number(sValue);
    return iValue;
  }


  service_getAllPortfolioDetails(portfolioList, dashboardDetails) {
    this._appservice.getAllPortfolioDetails(portfolioList, dashboardDetails).subscribe(data => {
      this.allportfolioData = data;
//console.log("alldata" + this.allportfolioData);
    }, error => { this._util.serviceError(error); }
    );
  }
  service_getPortfolioDetails() {
    this._appservice.GetPortfolioList().subscribe(data => {
      this.portfolioList = data;
    }, error => { this._util.serviceError(error); },
      () => this.service_GetDashboardDetails());
  }
  getProjectsCount(portfolioId: number) {
    this._appservice.getProjectsCount(portfolioId).subscribe(data => {
      this.projectCount = data;
    }, error => { this._util.serviceError(error); });

    return this.projectCount;
  }
  // IsPremier() {
  //   if (this.selectedCustomer.cusT_ID == 202100062)
  //     return true;
  //   else
  //     return false
  // }
  Refresh_Onclick() {
    this.service_refreshDashboardDetails();
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
  service_LoadCustomerByEmpIdByCustomerId(customerid) {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
        this.startTimer();
        this.service_getPortfolioDetails();
      }
    }, error => { this._util.serviceError(error); });
  }

  //**********************************************
  // Initiali
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
  service_Logout() {
    this._appservice.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }
}
