import { Component, OnInit, ChangeDetectorRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerModel } from '../../../models/customer-model';
import { AccessControl } from '../../../shared/access-control';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { MediaMatcher } from '@angular/cdk/layout';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { DashboardDetailsModel, SuccessGoalsScoresModel, SuccessGoalsScoresModelForAProject } from '../../../models/dashboard-details-model';
import { PortfolioModel, ProjectModelNew } from '../../../models/portfolio-model';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../../services/dashboard.service';
import { BasePage } from '../../../shared/basepage';
import { ChartsService } from '../../../services/charts.service';
import { HighlightsModel } from '../../../models/highlights-model';
import { SharedService } from '../../../shared/shared.service';
import { AddNotesComponent } from '../../../features/dashboard/dashboard-customer/add-notes/add-notes.component';
// TODO: Create these components or comment out if not yet migrated
// import { ProductKpiDetailsComponent } from '../../dashboard/dashboard-customer/product-kpi-details/product-kpi-details.component';
import { DashboardPortfolioAchievementDetailComponent } from './dashboard-portfolio-achievement-detail/dashboard-portfolio-achievement-detail.component';
import { DashboardEngagementLevelAchievementDetailComponent } from './dashboard-engagement-level-achievement-detail/dashboard-engagement-level-achievement-detail.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { ChartType } from 'angular-google-charts';


@Component({
  selector: 'app-dashboard-premier',
  templateUrl: './dashboard-premier.component.html',
  styleUrls: ['./dashboard-premier.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    GoogleChartsModule
  ]
})
export class DashboardPremierComponent extends BasePage implements OnInit, OnChanges {
  sMonth!: string;
  iYear!: number;
  cColor!: string;
  vColor!: string;
  pColor!: string;
  qColor!: string;
  projectHealthHigh!: any[];
  projectHealthMed!: any[];
  projectHealthLow!: any[];
  healthScoresColor!: any[];
  healthScoresOverall!: any[];
  overallScore!: string;
  performance!: string;
  compliance!: string;
  value!: string;
  quality!: string;
  empId!: string;
  progress: boolean = false;
  customerid!: string;
  reset: boolean = false;
  mobileQuery!: MediaQueryList;
  private _mobileQueryListener!: () => void;
  count: number = 0;
  legend: boolean = false;
  SelectedWeek: number = 0;
  highlights: any;
  menuToggleStatus!: boolean;
  tempScoresArray!: SuccessGoalsScoresModel[];
  tempHealthScoresOverall: any[] = [];
  customerList: CustomerModel[] = [];
  selectedCustomer!: CustomerModel;
  dashboardDetails: DashboardDetailsModel[] = [];
  projectScores: SuccessGoalsScoresModel[] = [];
  successGoalScores!: SuccessGoalsScoresModelForAProject[];
  portfolioList: PortfolioModel[] = []
  showFilter!: boolean;
  showSuccessGoalFilter: boolean = false;
  showProdFilter: boolean = false;
  showQualityHelp: boolean = false;
  showPerformanceHelp: boolean = false;
  showValueHelp: boolean = false;
  showComplianceHelp: boolean = false;
  financialYearRange!: string;
  achievementPer!: string;
  currentDate: Date = new Date();
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  notes!: HighlightsModel[];
  noProjectFlag: boolean = false;
  radioItems: any[] = ['By Expected Service Level', 'By Minimum Service Level'];
  model = { option: 'By Expected Service Level' };
  selectedPortfolio: number = 0;

  @ViewChild('mySel') projectSelect!: MatSelect;
  sub: any;
  showtooltip: boolean = false;
  @Input('portArray') portArray: any[] = [];
  @Input('projectArray') projArray: any[] = [];
  @Input('productArray') prodArray: any[] = [];
  productScores!: any[];
  engagementKPI!: any[];
  tempScoresProdArray: any[] = [];
  healthData: any[] = [];
  healthStatusData: any[] = [];
  pieData: any[] = [];
  productCAPACount!: any[];
  includeExclusions: boolean = false;
  viewBy: string = 'By Expected Service Level';
  isSelectedRow!: string;
  enableExclusion: boolean = false;
  calcualtiondifferedKPI: any;
  auditsbystatus!: any[];
  interval: any;
  
  // Required by BasePage - must be declared as protected override
  protected override router: Router;
  protected override dialog: MatDialog;

  constructor(public _dashboardUtil: DashboardService, private route: ActivatedRoute, private _router: Router, public _access: AccessControl, private _appservice: AppsService, public _util: MyUtility, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private _dialog: MatDialog,
    public _chartsService: ChartsService, private _shared: SharedService, private _appService: AppsService) {
    super();
    // Initialize router and dialog from injected dependencies
    this.router = this._router;
    this.dialog = this._dialog;
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    window.localStorage.setItem("viewBy", this.viewBy);

  }

  override ngOnInit() {
    // Scroll to top of page when component loads
    window.scrollTo(0, 0);
    
    this.sub = this.route.params.subscribe(params => {
      this.customerid = params['customerid'];
      this.reset = params['reset'];
    });

    if (this.reset == undefined)
      this.reset = true;

    let exclusionCustomers = "";
    this._appService.GetDBConfigValueFields("EXCLUSION_ENABLED_CUSTOMERS", -1, "").subscribe((data: any) => {
      exclusionCustomers = data;
      if (exclusionCustomers.includes(this.customerid)) {
        this.enableExclusion = true;
        this.includeExclusions = true;
      }
      else {
        this.includeExclusions = false;
      }
    });

    this._appService.GetDBConfigValueFields("KPI_LESS_THAN_EXPECTED_SERVICE_LEVEL", this.customerid, "").subscribe((data: any) => {
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

  ngOnChanges(changes: SimpleChanges) {
    // Reapply filters when input arrays change
    if (changes['projArray'] || changes['prodArray']) {
      this.filterHealthScores();
      this.filterProductList();
    }
  }

  ngAfterViewInit() {
    // Ensure page is at top after view initialization
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.SelectedWeek = 0;
  }

  // Duplicate removed - already declared at line 123

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
  // Duplicate removed - already declared at line 124
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
    this._appservice.RefreshDashboardDetails().subscribe({
      next: () => {
        this.progress = false;
        this.service_GetDashboardDetails();
      },
      error: (error: any) => {
        this.progress = false;
        this._util.serviceError(error);
      }
    });
  }

  service_getSuccessGoalScoresForProject(customerid: any) {
    this._appservice.GetSuccessGoalScoresForProject(customerid).subscribe({
      next: (data: any) => {
        this.projectScores = data;
      },
      error: (error: any) => { this._util.serviceError(error); },
      complete: () => {
        if (this.projectScores.length == 1) {
          this._util.GetCharts(this.projectScores[0].cusT_ID, this.projectScores[0].proJ_ID);
        }
      }
    });
  }

  getSelectedProjectsList(event: any) {
    this.projArray = event;
    this.applyFilter();
  }
  getSelectedProdList(event: any) {
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

  filterHealthScores() {
    
    if (this.tempHealthScoresOverall && this.tempHealthScoresOverall.length > 0) {
      this.healthScoresOverall = [...this.tempHealthScoresOverall];
      
      // Apply project filter if projArray has items (excluding "All" marker)
      if (this.projArray && this.projArray.length > 0) {
        // Filter out the "-1" (All) marker to get actual project IDs
        const actualProjects = this.projArray.filter(id => id !== '-1');
        
        // Only apply filter if specific projects are selected (not "All")
        if (actualProjects.length > 0 && actualProjects.length < this.tempHealthScoresOverall.length) {
          
          this.healthScoresOverall = this.healthScoresOverall.filter((f: any) => {
            const matches = actualProjects.includes(f.proJ_ID) || actualProjects.includes(String(f.proJ_ID));
            return matches;
          });
          
        } else {
        }
      }
      
      // Recalculate counts
      this.overallProdCount = 0;
      this.healthScoresOverall.forEach(ele => {
        this.overallProdCount = this.overallProdCount + ele.producT_COUNT;
      });
      this.overallPortCount = this.healthScoresOverall.length;
      
      // Reload account health chart
      this.loadAccountHealth(this.healthScoresOverall);
    }
  }

  filterPortfolioWise(portfolioid: number) {
    this._shared.savedportfolioId = portfolioid;
    this.filterProjectList(portfolioid);

  }

  filterProjectList(id: any) {
    if (id == 0)
      this.projectScores = this.tempScoresArray;
    else if (this.tempScoresArray != null || this.tempScoresArray != undefined) {
      this.projectScores = this.tempScoresArray.filter((x: any) => x.portfoliO_ID == id);

      if (this.projectScores.length == 0)
        this.noProjectFlag = true;
    }
  }

  IsProjectEmpty() {
    return this.noProjectFlag == true
  }

  service_getPortfolioDetails() {
    this._appservice.GetPortfolioList().subscribe({
      next: (data: any) => {
        this.portfolioList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }
  service_LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe((data: any) => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList[0];
        this.customerid = this.selectedCustomer.cusT_ID;
        this.service_GetDashboardDetails();
        this.loadSuccessGoalForPeriod(this.reset);

      }
    });
  }
  service_LoadCustomerByEmpIdByCustomerId(customerid: any) {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe({
      next: (data: any) => {
        this.customerList = data;
        if (this.customerList.length > 0) {
          this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
          this.customerid = this.selectedCustomer.cusT_ID;
          this.service_GetDashboardDetails();
          this.loadSuccessGoalForPeriod(this.reset);
        }
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  service_GetDashboardDetails() {
    this._appservice.GetDashboardDetailsbyCustomerId(this.selectedCustomer.cusT_ID).subscribe({
      next: (data: any) => {
        this.dashboardDetails = data;

      },
      error: (error: any) => {
        this._util.serviceError(error);
      },
      complete: () => {
        this.fillGraphDetails();
      }
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

    this._appservice.GetServiceMetricsDashboardDataPortfolioWise(this.selectedCustomer.cusT_ID, this._dashboardUtil.filteR_MONTH, this._dashboardUtil.filteR_YEAR, bLastUpdated).subscribe({
      next: (data: any) => {
        this.tempHealthScoresOverall = data.portfoliO_WISE_KPI;
        this.healthScoresOverall = [...data.portfoliO_WISE_KPI];
        
        // Apply project filter if projArray is provided and has items
        if (this.projArray != undefined && this.projArray.length > 0 && this.healthScoresOverall != null) {
          // Filter out the "-1" (All) marker to get actual project IDs
          const actualProjects = this.projArray.filter(id => id !== '-1');
          
          // Only apply filter if specific projects are selected (not "All")
          if (actualProjects.length > 0 && actualProjects.length < this.tempHealthScoresOverall.length) {
            this.healthScoresOverall = this.healthScoresOverall.filter((f: any) => 
              actualProjects.includes(f.proJ_ID) || actualProjects.includes(String(f.proJ_ID))
            );
          }
        }
        
        this.overallProdCount = 0;
        this.healthScoresOverall.forEach(ele => {
          this.overallProdCount = this.overallProdCount + ele.producT_COUNT;
        })
        this.overallPortCount = this.healthScoresOverall.length;
        this.loadAccountHealth(this.healthScoresOverall);
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
    this._appservice.GetServiceMetricsDashboardDataProductWise(this.selectedCustomer.cusT_ID, this._dashboardUtil.filteR_MONTH, this._dashboardUtil.filteR_YEAR, bLastUpdated).subscribe({
      next: (data: any) => {
        this.productScores = data.producT_WISE_KPI;
        this.engagementKPI = !this.includeExclusions ? data.engagemenT_WISE_KPI.filter((x: any) => x.kpI_NUMERATOR != null) : data.engagemenT_WISE_KPI.filter((x: any) => x.kpI_NUMERATOR != null || x.exclusioN_KPI_NUMERATOR != null);
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
      },
      error: (error: any) => {
        this._util.serviceError(error);
      },
      complete: () => {
        this.showProdFilter = false;
        if (this._shared.selectedProducts != undefined && this._shared.selectedProducts.length > 0) {
          this.getSelectedProdList(this._shared.selectedProducts)
        }
      }
    })
  }

  showThumbs(data: any) {
    let portfolioStatus = this._util.showThumbsForProduct(data, this.includeExclusions, this.achievementPer, this.viewBy);
    return portfolioStatus;
  }

  showStatusForProduct(data: any) {
    let status = this._util.showThumbsForProduct(data, this.includeExclusions, this.achievementPer, this.viewBy);
    return status;
  }

  loadAccountHealth(acntHealth: any) {
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
    this._appservice.GetDBConfigValue("ACCOUNT_HEALTH", -1, '').subscribe((data: any) => {
      if (data != undefined || data != null || data != '') {
        this.achievementPer = data;
      }
    }, (err: any) => { this._util.serviceError(err) })
  }
  temp: any = [];
  weekChange(event: any) {
    setTimeout(() => {
      this.highlights = [];
      this.highlights = this.temp.filter((i: any) => {
        return (i.week == event)
      })
    }, 500);
  }


  showKPINotesForCustomer(custid: any) {
    this._chartsService.getNotesForCustomer(custid)
      .subscribe({
        next: (data: any) => {
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
        },
        error: (error: any) => {
          console.error('Error fetching notes:', error);
          this._util.serviceError(error);
        }
      });
  }

  openKPINotes() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'notes': this.notes,
      'custid': this.selectedCustomer.cusT_ID
    };
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
    const dialogRef = this._util.showWarningConfirmation("Are you sure you want to log out?", "Confirm Logout");
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
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
    });
  }

  service_Logout() {
    this._appservice.Logout().subscribe({
      next: () => {
        this._util.empid('');
        this._util.displayname('');
        this._util.token('');
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }


  fillGraphDetails() {
    if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0 && this._shared.selectedProducts != undefined && this._shared.selectedProducts.length > 0)
      this.applyFilter();
    else {
      this._appservice.getAllProjectsForCustomer(this.customerid).subscribe((data: any) => {
        this.projArray = data.map((x: any) => x.proJ_ID);
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


  openDialog(status: any, kpiName: any, viewBy: any) {
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
    // TODO: Migrate ProductKpiDetailsComponent
    // const dialogRef = this.dialog.open(ProductKpiDetailsComponent, dialogConfig);
    console.warn('ProductKpiDetailsComponent not yet migrated');
  }
  getAchievement(metProd: any, notMetProd: any) {
    let achievement = 0;
    if (metProd > 0 || notMetProd > 0)
      achievement = ((metProd / (metProd + notMetProd) * 100))//(((metProd+notMetProd)/metProd)*100)
    return achievement.toFixed(2);
  }


  getAchievementStatus(kpiname: any, expected: any, actual: any) {
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

  healthPie: ChartType = ChartType.PieChart;
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
  loadAccountHealthWithStatus(acntHealth: any, status: any) {
    let achievePercent;
    this.healthStatusData = [];
    for (let data of acntHealth) {
      achievePercent = (((data.meT_CRITICAL_KPI + data.meT_KEY_KPI) / data.overalL_KPI_COUNT) * 100)
      if ((data.criticaL_KPI == data.meT_CRITICAL_KPI) && achievePercent >= Number(this.achievementPer) && status == "Under Control") {
        this.healthStatusData.push(data);
      }
      else if ((data.criticaL_KPI != data.meT_CRITICAL_KPI && status == "Need Focus")) {
        this.healthStatusData.push(data);
      }
      else if ((data.criticaL_KPI == data.meT_CRITICAL_KPI) && achievePercent < Number(this.achievementPer) && status == "Need Focus") {
        this.healthStatusData.push(data);
      }

    }
    return this.healthStatusData;

  }
  openPopUp(healthScoresOverall: any, status: any) {
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
  changeServiceLevel(event: any) {
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

  toggleExclusions(val: any) {
    this.loadAccountHealth(this.healthScoresOverall);
    this.includeExclusions = val;
    window.localStorage.setItem("includeExclusions", val);
  }

  /**
   * Open Product KPI Trend Screen
   * Shows KPI trend data for a specific product
   * @param productId - The ID of the product to show trend for
   */
  openProductKPITrendScreen(productId: number): void {
    // Navigate to success goal metric page to view product KPI trends
    // This provides detailed KPI performance metrics and trends for the selected product
    this.router.navigate([
      '/successgoal/metric',
      this.selectedCustomer.cusT_ID,
      productId,
      1, // mode ID
      this._dashboardUtil.filteR_MONTH,
      this._dashboardUtil.filteR_YEAR
    ]);
  }
}




