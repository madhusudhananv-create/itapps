import { Component, OnInit, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { CustomerModel } from '../../../models/customer-model';
import { AccessControl } from '../../../Shared/accessControl';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { MediaMatcher } from '@angular/cdk/layout';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { DashboardDetailsModel, SuccessGoalsScoresModel, SuccessGoalsScoresModelForAProject } from '../../../models/dashboard-details-model';
import { PortfolioModel, ProjectModelNew } from '../../../models/portfolio-model';
import { ActivatedRoute } from '@angular/router';
import { MatDialogConfig, MatDialog, MatSelect } from '@angular/material';
import { DashboardService } from '../../dashboard/dashboard.service';
import { basepage } from '../../../Shared/basepage';
import { ChartsService } from '../../../../app/Services/charts.service';
import { HighlightsModel } from '../../../models/highlights-model';
import { SharedService } from '../../../Shared/shared.service';
import { AddNotesComponent } from '../../dashboard/dashboard-customer/add-notes/add-notes.component';
// import { KPITrendComponent } from './kpitrend/kpitrend.component';
import { ProductKpiDetailsComponent } from '../../dashboard/dashboard-customer/product-kpi-details/product-kpi-details.component';
import { DashboardPortfolioAchievementDetailComponent } from './dashboard-portfolio-achievement-detail/dashboard-portfolio-achievement-detail.component';
import { DashboardEngagementLevelAchievementDetailComponent } from './dashboard-engagement-level-achievement-detail/dashboard-engagement-level-achievement-detail.component';


@Component({
  selector: 'app-dashboard-premier',
  templateUrl: './dashboard-premier.component.html',
  styleUrls: ['./dashboard-premier.component.scss']
})
export class DashboardPremierComponent extends basepage implements OnInit {
  sMonth: string;
  iYear: number;
  cColor: string;
  vColor: string;
  pColor: string;
  qColor: string;
  projectHealthHigh: any[];
  projectHealthMed: any[];
  projectHealthLow: any[];
  healthScoresColor: any[];
  healthScoresOverall: any[];
  overallScore: string;
  performance: string;
  compliance: string;
  value: string;
  quality: string;
  empId: string;
  progress: boolean = false;
  customerid: string;
  reset: boolean = false;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  count: number = 0;
  legend: boolean = false;
  SelectedWeek: number = 0;
  highlights: any;
  menuToggleStatus: boolean;
  tempScoresArray: SuccessGoalsScoresModel[];
  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;
  dashboardDetails: DashboardDetailsModel[] = [];
  projectScores: SuccessGoalsScoresModel[] = [];
  successGoalScores: SuccessGoalsScoresModelForAProject[];
  portfolioList: PortfolioModel[] = []
  showFilter: boolean;
  showSuccessGoalFilter: boolean = false;
  showProdFilter: boolean = false;
  showQualityHelp: boolean = false;
  showPerformanceHelp: boolean = false;
  showValueHelp: boolean = false;
  showComplianceHelp: boolean = false;
  financialYearRange: string;
  achievementPer: string;
  currentDate: Date = new Date();
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  notes: HighlightsModel[];
  noProjectFlag: boolean = false;
  radioItems: any[] = ['By Expected Service Level', 'By Minimum Service Level'];
  model = { option: 'By Expected Service Level' };
  selectedPortfolio: number = 0;

  @ViewChild('mySel') projectSelect: MatSelect;
  sub: any;
  showtooltip: boolean = false;
  @Input('portArray') portArray: any[] = [];
  @Input('projectArray') projArray: any[] = [];
  @Input('productArray') prodArray: any[] = [];
  productScores: any[];
  engagementKPI: any[];
  tempScoresProdArray: any[] = [];
  healthData: any[] = [];
  healthStatusData: any[] = [];
  pieData: any[] = [];
  productCAPACount: any[];
  includeExclusions: boolean = false;
  viewBy: string = 'By Expected Service Level';
  isSelectedRow: string;
  enableExclusion: boolean = false;
  calcualtiondifferedKPI: any;

  constructor(public _dashboardUtil: DashboardService, private route: ActivatedRoute, private _router: Router, public _access: AccessControl, private _appservice: AppsService, public _util: myUtility, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public dialog: MatDialog,
    public _chartsService: ChartsService, private _shared: SharedService, private _appService: AppsService) {
    super();
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    window.localStorage.setItem("viewBy", this.viewBy);

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.customerid = params['customerid'];
      this.reset = params['reset'];
    });

    if (this.reset == undefined)
      this.reset = true;

    let exclusionCustomers = "";
    this._appService.GetDBConfigValueFields("EXCLUSION_ENABLED_CUSTOMERS", -1, "").subscribe(data => {
      exclusionCustomers = data;
      if (exclusionCustomers.includes(this.customerid)) {
        this.enableExclusion = true;
        this.includeExclusions = true;
      }
      else {
        this.includeExclusions = false;
      }
    });

    this._appService.GetDBConfigValueFields("KPI_LESS_THAN_EXPECTED_SERVICE_LEVEL", this.customerid, "").subscribe(data => {
      this.calcualtiondifferedKPI = data;
    });

    let periodDetails = this._util.GetDefaultMonthForPremierSLA();
    this._dashboardUtil.filteR_MONTH = this._dashboardUtil.lasT_FILTERED_MONTH == "" ? periodDetails[0].Month : this._dashboardUtil.lasT_FILTERED_MONTH;
    this._dashboardUtil.filteR_YEAR = this._dashboardUtil.lasT_FILTERED_YEAR == 0 ? periodDetails[0].Year : this._dashboardUtil.lasT_FILTERED_YEAR;

    this.service_getPortfolioDetails();
    if (this.customerid == undefined && this.selectedCustomer == undefined) {
      this.service_LoadCustomerByEmpId();
    }
    else if (this.customerid != undefined) {
      this.service_LoadCustomerByEmpIdByCustomerId(this.customerid);
    }

  }

  ngOnChanges() {
    this.filterProductList();
  }

  ngAfterViewInit() {
    this.SelectedWeek = 0;
  }

  auditsbystatus: any[];

  resetValues() {
    this._shared.selectedPortfolios = [];
    this._shared.selectedProjects = [];
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  changKPIflag() {
    this._appservice.KpiCalledFromNewDashboard = true;
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
  //Timer --------------------------
  fillerNav = Array(50).fill(0).map((_, i) => `Nav Item ${i + 1}`);

  closeNav() {
    this.showSuccessGoalFilter = false;
  }
  closeProdNav() {
    this.showProdFilter = false;
  }

  closePopup(popupName: string) {
    if (popupName == "QualityHelp")
      this.showQualityHelp = false;
    if (popupName == "PerformanceHelp")
      this.showPerformanceHelp = false;
    if (popupName == "ValueHelp")
      this.showValueHelp = false;
    if (popupName == "ComplianceHelp")
      this.showComplianceHelp = false;
  }


  IsPremier() {
    return this._util.IsPremier(this.selectedCustomer.cusT_ID);
    if (this.selectedCustomer.cusT_ID == '202100062')
      return true;
    else
      return false
  }
  Refresh_Onclick() {
    this.service_refreshDashboardDetails();
  }

  service_refreshDashboardDetails() {
    this.progress = true;
    this._appservice.RefreshDashboardDetails().subscribe(() => {
      this.progress = false;
      this.service_GetDashboardDetails();
    }, error => {
      this.progress = false;
      this._util.serviceError(error);
    });
  }

  service_getSuccessGoalScoresForProject(customerid) {
    this._appservice.GetSuccessGoalScoresForProject(customerid).subscribe(data => {
      this.projectScores = data;
    }, error => { this._util.serviceError(error); },
      () => {
        if (this.projectScores.length == 1) {
          this._util.GetCharts(this.projectScores[0].cusT_ID, this.projectScores[0].proJ_ID);
        }
      }
    );
  }

  getSelectedProjectsList(event) {
    this.projArray = event;
    this.applyFilter();
  }
  getSelectedProdList(event) {
    this.prodArray = event;
    this.filterProductList();
  }
  applyFilter() {
    this.filterProjectList1();
  }


  filterProjectList1() {
    this.projectScores = this.tempScoresArray;
    if (this.projArray.length > 0 && this.projectScores != undefined)
      this.projectScores = this.projectScores.filter(f => this.projArray.includes(f.proJ_ID));
  }
  filterProductList() {
    this.productScores = this.tempScoresProdArray;
    if (this.prodArray.length > 0 && this.productScores != undefined)
      this.productScores = this.productScores.filter(f => this.prodArray.includes(f.producT_ID));
    this.countOfProds = this.productScores.length

  }

  filterPortfolioWise(portfolioid: number) {
    this._shared.savedportfolioId = portfolioid;
    this.filterProjectList(portfolioid);

  }

  filterProjectList(id) {
    if (id == 0)
      this.projectScores = this.tempScoresArray;
    else if (this.tempScoresArray != null || this.tempScoresArray != undefined) {
      this.projectScores = this.tempScoresArray.filter(x => x.portfoliO_ID == id);

      if (this.projectScores.length == 0)
        this.noProjectFlag = true;
    }
  }

  IsProjectEmpty() {
    return this.noProjectFlag == true
  }

  service_getPortfolioDetails() {
    this._appservice.GetPortfolioList().subscribe(data => {
      this.portfolioList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList[0];
        this.customerid = this.selectedCustomer.cusT_ID;
        this.service_GetDashboardDetails();
        this.loadSuccessGoalForPeriod(this.reset);

      }
    });
  }
  service_LoadCustomerByEmpIdByCustomerId(customerid) {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
        this.customerid = this.selectedCustomer.cusT_ID;
        this.service_GetDashboardDetails();
        this.loadSuccessGoalForPeriod(this.reset);
      }
    }, error => { this._util.serviceError(error); });
  }

  service_GetDashboardDetails() {
    this._appservice.GetDashboardDetailsbyCustomerId(this.selectedCustomer.cusT_ID).subscribe(data => {
      this.dashboardDetails = data;

    }, error => {
      this._util.serviceError(error);
    }, () => {
      this.fillGraphDetails();
    });
  }
  btnApplyMultiProjects_OnClick() {
    this.reset = false;
    this.loadSuccessGoalForPeriod(this.reset);
    this.SelectedWeek = 0
  }
  btnApplySingleProject_OnClick() {
    this.reset = false;
    this.loadSuccessGoalForPeriod(this.reset);
    this.showSuccessGoalFilter = false;
    this.SelectedWeek = 0;
  }
  btnApplySingleProd_OnClick() {
    this.reset = false;
    this.loadSuccessGoalForPeriod(this.reset);
    this.showProdFilter = false;
    this._dashboardUtil.lasT_FILTERED_MONTH = this._dashboardUtil.filteR_MONTH;
    this._dashboardUtil.lasT_FILTERED_YEAR = this._dashboardUtil.filteR_YEAR;
  }
  countOfProds: number = 0;
  overallProdCount: number = 0;
  overallPortCount: number = 0;
  loadSuccessGoalForPeriod(bLastUpdated: boolean) {
    this.countOfProds = 0;
    this.overallProdCount = 0;
    this.overallPortCount = 0;
    this.getConfigResult();

    this._appservice.GetServiceMetricsDashboardDataPortfolioWise(this.selectedCustomer.cusT_ID, this._dashboardUtil.filteR_MONTH, this._dashboardUtil.filteR_YEAR, bLastUpdated).subscribe(
      data => {
        this.healthScoresOverall = data.portfoliO_WISE_KPI;
        this.healthScoresOverall.forEach(ele => {
          this.overallProdCount = this.overallProdCount + ele.producT_COUNT;
        })
        this.overallPortCount = this.healthScoresOverall.length;
        this.loadAccountHealth(this.healthScoresOverall);
      }, error => {
        this._util.serviceError(error);
      });
    this._appservice.GetServiceMetricsDashboardDataProductWise(this.selectedCustomer.cusT_ID, this._dashboardUtil.filteR_MONTH, this._dashboardUtil.filteR_YEAR, bLastUpdated).subscribe(
      data => {
        this.productScores = data.producT_WISE_KPI;
        this.engagementKPI = !this.includeExclusions ? data.engagemenT_WISE_KPI.filter(x => x.kpI_NUMERATOR != null) : data.engagemenT_WISE_KPI.filter(x => x.kpI_NUMERATOR != null || x.exclusioN_KPI_NUMERATOR != null);
        this.tempScoresProdArray = data.producT_WISE_KPI;
        this._dashboardUtil.filteR_MONTH = data.month;
        this._dashboardUtil.filteR_YEAR = data.year;
        this.temp = data.highlights;
        let temp = data.highlights.filter((i: any) => {
          return i.week == 0
        })
        this.highlights = temp;
        this.temp = data.highlights;

        this.productCAPACount = data.producT_WISE_CAPA_DETAILS
        this.countOfProds = this.productScores.length;
        if (this.prodArray != undefined && this.prodArray.length > 0 && this.productScores != null) {
          this.productScores = this.productScores.filter(f => this.prodArray.includes(f.producT_ID));
        }
      }, error => {
        this._util.serviceError(error);
      }, () => {
        this.showProdFilter = false;
        if (this._shared.selectedProducts != undefined && this._shared.selectedProducts.length > 0) {
          this.getSelectedProdList(this._shared.selectedProducts)
        }
      }
    )
  }

  showThumbs(data) {
    let portfolioStatus = this._util.showThumbsForProduct(data, this.includeExclusions, this.achievementPer, this.viewBy);
    return portfolioStatus;
  }

  showStatusForProduct(data) {
    let status = this._util.showThumbsForProduct(data, this.includeExclusions, this.achievementPer, this.viewBy);
    return status;
  }

  loadAccountHealth(acntHealth) {
    let uCount = 0; let nCount = 0;
    let arr = [["Need Focus", 0], ["Under Control", 0]];
    this.pieData = [];
    this.healthData = [];
    this.pieData = arr;
    if (acntHealth != null && acntHealth != undefined) {
      for (let data of acntHealth) {
        let status = this._util.showThumbsForProduct(data, this.includeExclusions, this.achievementPer, this.viewBy);
        if (status == "Under Control") {
          uCount = uCount + 1;
          this.healthData.push(['Under Control', uCount]);
        }
        else if (status == "Need Focus") {
          nCount = nCount + 1;
          this.healthData.push(['Need Focus', nCount]);
        }
      }

      arr.forEach((x, i) => {
        this.healthData.forEach((y) => {
          if (x[0] === y[0]) {
            this.pieData[i][1] = y[1];
          }
        })
      })
    }
  }
  
  getConfigResult() {
    this._appservice.GetDBConfigValue("ACCOUNT_HEALTH", -1, '').subscribe(data => {
      if (data != undefined || data != null || data != '') {
        this.achievementPer = data;
      }
    }, (err) => { this._util.serviceError(err) })
  }
  temp: any = [];
  weekChange(event: any) {
    setTimeout(() => {
      this.highlights = [];
      this.highlights = this.temp.filter(i => {
        return (i.week == event)
      })
    }, 500);
  }


  showKPINotesForCustomer(custid) {
    this._appservice.getNotesForCustomer(custid)
      .subscribe
      (
        data => {
          this.notes = data;
          this.notes.forEach((i: any) => {
            i.tempmonth = i.publisH_DATE + " " + i.week
          })
          this.notes.sort((x: any, y: any): number => {
            if (x.tempmonth > y.tempmonth) return -1;
            if (x.tempmonth < y.tempmonth) return 1;
            return 0;
          });
          this.openKPINotes();
        }
        ,
        error => {
          this._util.serviceError(error);
        }
      );
  }

  openKPINotes() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'notes': this.notes,
      'custid': this.selectedCustomer.cusT_ID
    },
      dialogConfig.maxWidth = "100%";
    dialogConfig.height = "100%";
    dialogConfig.width = "100vw";
    dialogConfig.panelClass = "myPanel";
    const dialogRef = this.dialog.open(AddNotesComponent, dialogConfig);

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
    this._appservice.Logout().subscribe(() => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }


  fillGraphDetails() {
    if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0 && this._shared.selectedProducts != undefined && this._shared.selectedProducts.length > 0)
      this.applyFilter();
    else {
      this._appservice.getAllProjectsForCustomer(this.customerid).subscribe(data => {
        this.projArray = data.map(x => x.proJ_ID);
        this.applyFilter();
      })

      //  this.fillGraphIdeasColumn();
      //  this.fillGraphStaffSummaryPie();
      //  this.fillGraphBillingSummaryColumn();
      //  this.fillGraphProjectStatusSemicircleDonoughtChart();
      //  this.fillGraphActionsItemsCircleDonoughtChart();
      //  this.fillGraphIssuesCircleDonoughtChart();
      //  this.fillGraphRisksCircleDonoughtChart();
      //  this.fillGraphCleverQualitySemicircleDonoughtChart();
      //  this.fillQAAuditStatus();
      //  this.fillQAFindingsSummary();
      //  this.fillQAFindingsByTime();
      //  this.fillQAFindingsByStage();
      //  this.fillQAOverallComplianceScore();
      //  this.fillQAComplianceScoreByProcessModel();
    }
  }


  openDialog(status, kpiName, viewBy) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'kpiName': kpiName,
      'status': status,
      'custId': this.customerid,
      'month': this._dashboardUtil.filteR_MONTH,
      'year': this._dashboardUtil.filteR_YEAR,
      'viewBy': viewBy
    }
    dialogConfig.maxWidth = "50%";
    dialogConfig.height = "auto";
    dialogConfig.width = "50%";
    const dialogRef = this.dialog.open(ProductKpiDetailsComponent, dialogConfig);
  }
  getAchievement(metProd, notMetProd) {
    let achievement = 0;
    if (metProd > 0 || notMetProd > 0)
      achievement = ((metProd / (metProd + notMetProd) * 100))//(((metProd+notMetProd)/metProd)*100)
    return achievement.toFixed(2);
  }


  getAchievementStatus(kpiname, expected, actual) {
    let achievement = '';

    if (actual != null) {
      let kpiExist = this.calcualtiondifferedKPI.includes(kpiname);
      if (kpiExist) {

        if (actual <= expected) {
          achievement = 'Met'
        }
        else {
          achievement = 'Not Met'
        }
      }
      else {
        if (actual >= expected) {
          achievement = 'Met'
        }
        else {
          achievement = 'Not Met'
        }
      }
    }

    return achievement;
  }

  healthPie = 'PieChart';
  healthColumn = ['Title', 'value1'];
  healthWidth = 450;
  healthHeight = 180;
  healthOptions: google.visualization.PieChartOptions = {
    backgroundColor: { fill: 'transparent' },
    pieHole: 0.5,
    colors: ['#FFB100', '#3ab376'],
    chartArea: {
      'width': '70%', 'height': '100%', 'bottom': 0, 'top': 0
    },
    sliceVisibilityThreshold: 0,
    legend: {
      position: 'right', alignment: 'center', textStyle: {
        fontSize: 11, bold: false
      }
    },
    tooltip: { trigger: 'focus' },
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 14, color: '#000000', fontName: 'Proxima Nova' }
  };
  loadAccountHealthWithStatus(acntHealth, status) {
    let achievePercent;
    this.healthStatusData = [];
    for (let data of acntHealth) {
      achievePercent = (((data.meT_CRITICAL_KPI + data.meT_KEY_KPI) / data.overalL_KPI_COUNT) * 100)
      if ((data.criticaL_KPI == data.meT_CRITICAL_KPI) && achievePercent >= this.achievementPer && status == "Under Control") {
        this.healthStatusData.push(data);
      }
      else if ((data.criticaL_KPI != data.meT_CRITICAL_KPI && status == "Need Focus")) {
        this.healthStatusData.push(data);
      }
      else if ((data.criticaL_KPI == data.meT_CRITICAL_KPI) && achievePercent < this.achievementPer && status == "Need Focus") {
        this.healthStatusData.push(data);
      }

    }
    return this.healthStatusData;

  }
  openPopUp(healthScoresOverall, status) {
    let portStatus = ''
    portStatus = status[0];
    if (portStatus != undefined && portStatus != null && portStatus != 'A') {
      healthScoresOverall = this.loadAccountHealthWithStatus(healthScoresOverall, portStatus)
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'porftolioWiseData': healthScoresOverall,
      'custId': this.customerid,
      'viewBy': this.viewBy,
      'includeExlcusions': this.includeExclusions
    }
    dialogConfig.maxWidth = "90%";
    dialogConfig.height = "auto";
    dialogConfig.width = "90%";
    const dialogRef = this.dialog.open(DashboardPortfolioAchievementDetailComponent, dialogConfig);
  }
  changeServiceLevel(event) {
    this.viewBy = event;
    this.loadAccountHealth(this.healthScoresOverall);
    window.localStorage.setItem("viewBy", this.viewBy);
  }

  viewEngagementLevelDetails() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'engagementlevelDetails': this.engagementKPI,
      'viewBy': this.viewBy,
      'custId': this.customerid,
      'includeExclusions': this.includeExclusions,
      'date': this._dashboardUtil.filteR_YEAR + this._dashboardUtil.filteR_MONTH + "01"

    }
    dialogConfig.maxWidth = "90%";
    dialogConfig.height = "auto";
    dialogConfig.width = "90%";
    const dialogRef = this.dialog.open(DashboardEngagementLevelAchievementDetailComponent, dialogConfig);
  }

  toggleExclusions(val) {
    this.loadAccountHealth(this.healthScoresOverall);
    this.includeExclusions = val;
    window.localStorage.setItem("includeExclusions", val);
  }


}
