import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { ChartsModel } from '../../models/charts-model';
import { Chart } from 'angular-highcharts';
import { TrendHighChartComponent } from './trend-high-chart/trend-high-chart.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ChartsService } from '../../services/charts.service';
import { SelectionModel } from '@angular/cdk/collections';
import { KpiActionPlanComponent } from '../../controls/kpi/kpi-action-plan/kpi-action-plan.component';
import { AccessControl } from '../../shared/access-control';
import { ServiceTowersProjectMappingModel } from '../../core/models/service-area-project-mapping-model';
import { ServiceAreaModelNew } from '../../core/models/audit-checklist-based-model';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter.component';

// Interface for cell details in the goal table
interface CellDetail {
  text?: string;
  rowSpan?: number;
  colSpan?: number;
  color?: string;
  toolTip?: string;
  celltype?: string;
  
  [key: string]: any; // Allow additional properties
}

// Interface for goal details
interface GoalDetail {
  kpiArea?: string;
  goal?: string;
  details?: CellDetail[][];
  [key: string]: any; // Allow additional properties
}

@Component({
  selector: 'app-successgoal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSidenavModule,
    NavbarNewComponent,
    TableFilterComponent
  ],
  templateUrl: './successgoal.component.html',
  styleUrls: ['./successgoal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SuccessgoalComponent implements OnInit {

  graph: any;
  private sub: any;
  input_projId!: string;
  input_custId!: string;
  mobileQuery!: MediaQueryList;
  chartsMonthly!: ChartsModel;
  private _mobileQueryListener!: () => void;
  KPIIndex: number = -1;
  graphIndex: number = -1;
  index: number = 0;
  OpenFilter: boolean = false;
  year: any;
  month: any;
  projectName: string = '';
  productName: string = '';
  goalid!: number;
  filteredIndex!: number;
  goalDetails: any;
  trendHighChart: any;
  tableMonth: any;
  tableYear: any;
  headerName: string = "Service Tower";
  selGroupBy: string = "1";
  isProdView: boolean = false;
  showMetrics: boolean = false;
  includeBaseMeasure: boolean = false;
  includeExclusions: boolean = false;
  productScores: any[] = [];
  kpiId: any;
  commentPlaceHolder: string = "Enter comments for Rejection";
  selection = new SelectionModel<any>(true, []);
  selectionKPI = new SelectionModel<any>(true, []);
  serviceAreaProjectMappingList: ServiceTowersProjectMappingModel[] = [];
  serviceAreaList: ServiceAreaModelNew[] = [];
  selSeviceTower: any[] | null = null;
  resetYear: any;
  resetMonth: any;
  flagValue: any;
  capaStageId: any;
  employeeRole: any;
  constructor(private route: ActivatedRoute, private _chartsService: ChartsService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private _appService: AppsService, public _util: MyUtility, public dialog: MatDialog, private router: Router, public _access: AccessControl) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.AppSettings.empid = localStorage.getItem('empid') || '';
    this.AppSettings.displayname = localStorage.getItem('displayname') || '';
    this.AppSettings.token = localStorage.getItem('token') || '';
    this.AppSettings.logintype = localStorage.getItem('logintype') || '';
    this.AppSettings.role = localStorage.getItem('role') || '';
    //if (this._access.IsAllowed(84, 1, '', ''))
    this.isPM = true;

    if (!this._access.IsAllowed(83, 2, '', '') && this.isPM)
      this.commentPlaceHolder = "Enter comments for update SLA Rejection";

    if (this._access.IsAllowed(102, 1, '', ''))
      this.commentPlaceHolder = "Enter review feedback";

  }

  public AppSettings = {
    empid: '',
    displayname: '',
    token: '',
    role: '',
    access: '',
    logintype: '',
    customerid: ''
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  prodId!: number;
  modeId!: number;
  metricsDetail: any[] = [];
  additionalData: any[] = [];
  kpiDetail: any[] = [];
  dataSource = new MatTableDataSource(this.kpiDetail);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns1 = ['select', 'reference', 'kpiname', 'frequency', 'expectedtarget', 'mintarget', 'actual', 'expstatus', 'minstatus', 'trend', 'capa', 'isaccepted', 'isRejected'];
  filterCriteria: any;
  filteredData: any;
  isDraft: boolean = false;
  viewBy: string = '';
  isPM: boolean = false;
  slaAvailable: boolean = false;
  enableExclusion: boolean = false;

  @ViewChild('apptablefilter') apptablefilter: any;
  ngOnInit() {
    this.viewBy = window.localStorage.getItem("viewBy") || '';
    if (this.viewBy == "") {
      this.viewBy = "By Expected Service Level";
    }

    window.localStorage.setItem("viewBy", "");
    this.sub = this.route.params.subscribe(params => {
      this.input_projId = params['projid'];
      this.input_custId = params['custid'];
      this.tableMonth = params['month'];
      this.tableYear = params['year'];
      this.resetYear = this.tableYear;
      this.resetMonth = this.tableMonth
      this.goalid = params['goalid'];
      this.prodId = params['prodid'];
      this.modeId = params['modeid'];
      this.isDraft = params['d'];
      this.flagValue = params['flagValue'];
      this.capaStageId = params['capaStageId'];
      var getIncludeExclusions = window.localStorage.getItem("includeExclusions");
      if (getIncludeExclusions == "true") this.includeExclusions = true;
      window.localStorage.setItem("includeExclusions", "");
    });

    let exclusionCustomers = "";
    this._appService.getDBConfigValueFields("EXCLUSION_ENABLED_CUSTOMERS", -1, "").subscribe(
      (data: string) => {
        exclusionCustomers = data;
        if (exclusionCustomers.includes(this.input_custId)) {
          this.enableExclusion = true;
          this.includeExclusions = true;
        }
        else {
          this.includeExclusions = false;
        }
      },
      (error: any) => {
        // Handle error silently - this is not critical for page functionality
        console.warn('Failed to load exclusion config:', error);
        this.enableExclusion = false;
        this.includeExclusions = false;
      }
    );
    
    const storedData = localStorage.getItem('slaAvailableList');
    const slaAvailableList = storedData ? JSON.parse(storedData) : [];
    this.slaAvailable = slaAvailableList.length > 0 && slaAvailableList.filter((x: any) => x.customerId == this.input_custId)[0].slaAvailable;

    if (this.slaAvailable && this.prodId != undefined && !this.isDraft) {
      this.isProdView = true;
      this.Service_GetServiceAreaList();
      this.getProductName(this.prodId);
      this.loadProductDetails();
      this.loadOverallDetails();
      this.getTrendHighChartDetails();
      this.Service_GetServiceAreaProjectMapping();
      this.getEmployeeRolesForProduct();
    }
    else if (this.isDraft) {
      this.getProductName(Number(this.prodId));
      
      const dialogRef = this._util.showWarningConfirmation(
        `Are you sure want to revert for ${this.tableMonth} ${this.tableYear}`,
        'Revert Metrics'
      );
      
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          this._appService.revertProductKPIDetails(this.prodId, this.tableMonth, this.tableYear).subscribe((data: any) => {
            alert("Metrics have been Updated as Draft Status");
            this.router.navigate(['/serviceleveldashboard/cust', this.input_custId, false])
          }, error => {
            this._util.serviceError(error);
          });
        } else {
          this.Service_GetServiceAreaList();
          this.loadProductDetails();
          this.loadOverallDetails();
          this.getTrendHighChartDetails();
          this.Service_GetServiceAreaProjectMapping();
        }
      });
    }
    else {

      this.Service_GetServiceAreaList();
      this.isProdView = false;
      this.getConfigResult();
      this.reloadKPITable();
      this.getTrendHighChartDetails();
      this.getProjectName();
      this.Service_GetServiceAreaProjectMapping();
    }
  }

  getTrendHighChartDetails() {

    let date: Date = new Date(this.tableYear + "-" + this.tableMonth + '-01');
    if (this._util.IsPremier(this.input_custId) && this.prodId != undefined) {
      this._chartsService.getTrendHighChartDetailsForProductKPI(this.input_custId, String(this.prodId), date, this._util.AppSettings.token, this.viewBy).subscribe(
        (data: any) => {
          // Don't wrap in Chart() - highcharts-chart component needs raw options
          this.trendHighChart = data;
        }, error => {
          this._util.serviceError(error);
        }
      )
    }
    else {
      this._chartsService.getTrendHighChartDetails(this.input_custId, this.input_projId, date, this._util.AppSettings.token).subscribe(
        (data: any) => {
          // Don't wrap in Chart() - highcharts-chart component needs raw options
          this.trendHighChart = data;
        },
        error => {
          this._util.serviceError(error);
        }
      )
    }

  }


  getSelectedGoal() {
    let filteredArray = this.goalDetails.goals.slice(1);

    for (var i = 0; i < filteredArray.length; i++) {
      if (filteredArray[i].goal.split('|')[1] == this.goalid) {
        this.filteredIndex = i;
        break;
      }
    }

    if (this.filteredIndex != null || this.filteredIndex != undefined)
      this.ShowKPIDetails(this.filteredIndex);
  }

  ngAfterViewInit() {
    if (this._util.tableMonth != undefined)
      this.month = this._util.tableMonth;
    if (this._util.tableYear != undefined)
      this.year = this._util.tableYear;
    if (this.flagValue == 'true') {
      this.apptablefilter.ngOnInit();
      this.apptablefilter.selectedFilterPref = {
        datA_TYPE: "number",
        displaY_NAME: "Service Level Status",
        include: true,
        tablE_NAME: "KPI",
        values: [
          { id: 1, name: 'Met' },
          { id: 2, name: 'Not Met' }
        ],
        searchString: 2,
        searchStringValue: "Not Met",
        fielD_NAME: "exclusioN_SLA_STATUS"
      }
    }
  }


  resetFilterValues() {
    if (this.month != undefined && this.year != undefined) {
      this._util.tableMonth = this.month;
      this._util.tableYear = this.year;
      this.tableMonth = this.resetMonth;
      this.tableYear = this.resetYear;
      this.selSeviceTower = null;

    }
  }

  closeNav() {
    this.OpenFilter = false;
  }

  getDashbaord(custID: string) {

    if (this._util.btnCalledFromNewCSMDashboard == false) {
      this.router.navigate(['/newdashboard/cust', custID, false])
    }
    else {
      localStorage.removeItem('selectedCustomer')
      localStorage.setItem('selectedCustomer', custID)
      this.router.navigate(['/csm-dashboard'])
    }
  }

  ShowKPIDetails(i: number) {
    if (i == this.KPIIndex)
      this.KPIIndex = -1
    else if (i != this.KPIIndex)
      this.KPIIndex = i;
  }

  showGraphDetails(i: number) {
    if (i == this.graphIndex)
      this.graphIndex = -1
    else if (i != this.graphIndex)
      this.graphIndex = i;
  }

  displayGraph(kpiid: any, goalname: any) {
    console.log('displayGraph called with:', { kpiid, goalname });
    console.log('trendHighChart data:', this.trendHighChart);
    
    if (!this.trendHighChart || this.trendHighChart.length === 0) {
      console.error('No trend chart data available');
      alert('No trend data available. Please try refreshing the page.');
      return;
    }

    const dialogConfig = new MatDialogConfig();
    let dialogSendData = {
      'KPIId': kpiid,
      'GoalName': goalname,
      'ChartData': this.trendHighChart
    }
    dialogConfig.autoFocus = true;
    dialogConfig.data = dialogSendData;
    dialogConfig.height = "80%",
      dialogConfig.width = "65%"
    const dialogRef = this.dialog.open(TrendHighChartComponent, dialogConfig);
    dialogRef.updatePosition({ top: '30px' });
  }

  reloadKPITable() {
    this.OpenFilter = false;
    this.goalDetails = undefined;
    let d = "1-" + this.tableMonth + "-" + this.tableYear;
    this.GetTable(this.input_custId, this.input_projId, d);
  }
  reloadProdKPITable() {
    this.OpenFilter = false;
    this.metricsDetail = [];
    this.kpiDetail = [];
    this.loadProductDetails();
    this.loadOverallDetails();
  }

  GetTable(client_ID: string, proj_ID: string, date: string) {
    let serviceTowers = null;
    if (this.selGroupBy == "1" && (this.selSeviceTower != null && this.selSeviceTower != undefined))
      serviceTowers = this.selSeviceTower.join(",");
    this._chartsService.getTableSuccess(this.selGroupBy, client_ID, proj_ID, date, 'Monthly', serviceTowers || '', this.AppSettings.token || '')
      .subscribe
      (
        (data: any) => {
          this.goalDetails = data;
        }
        ,
        (error: any) => {
          this._util.serviceError(error);
        },
        () => {
          if (this.goalid != undefined && this.goalDetails.goals != undefined)
            this.getSelectedGoal();
        }
      );
  }
  achievementPer: number = 80;
  showThumbsForKPI(val: any): string {
    let achievePer = val.split('%')[0];
    if (val == '-') {
      return '-';
    }
    else if (Number(achievePer) >= Number(this.achievementPer)) {
      return 'Under Control';
    }
    else if (Number(achievePer) < Number(this.achievementPer)) {
      return 'Need Focus';
    }
    return '-';
  }

  getProjectName() {
    this._appService.getProjectName(this.input_projId).subscribe({
      next: (data: string) => {
        this.projectName = data
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }
  getProductName(prodId: number) {
    this._appService.getProductName(prodId).subscribe({
      next: (data: string) => {
        this.productName = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    })
  }
  getSLAStatus(definitions: any): string {
    if (this.includeExclusions) {
      if (definitions.exclusioN_SLA_STATUS == null || definitions.exclusioN_SLA_STATUS === '') {
        return definitions.slA_STATUS;
      }
      else {
        return definitions.exclusioN_SLA_STATUS;
      }
    }
    else
      return definitions.slA_STATUS;
  }

  getSecondarySLAStatus(definitions: any): string {
    if (this.includeExclusions) {
      if (definitions.exclusioN_SECONDARY_SLA_STATUS == null || definitions.exclusioN_SECONDARY_SLA_STATUS === '') {
        return definitions.secondarY_SLA_STATUS;
      }
      else {
        return definitions.exclusioN_SECONDARY_SLA_STATUS;
      }
    }
    else
      return definitions.secondarY_SLA_STATUS;
  }

  getColorforKPI(kpiDetail: any): string {
    let status = this._util.GetSLAStatus(kpiDetail, this.includeExclusions);
    if (this.includeExclusions) {
      status = kpiDetail.exclusioN_SLA_STATUS;
      if (status == null || status == undefined || status === '') {
        status = kpiDetail.slA_STATUS;
        return 'black';
      }
      else {
        status = kpiDetail.exclusioN_SLA_STATUS;
        return 'orange';
      }
    }
    return 'black';
  }

  getslaStatusforKPI(kpiDetail: any): string {
    let status = this._util.GetSLAStatus(kpiDetail, this.includeExclusions);
    if (status == 'Not Met') {
      status = kpiDetail.exclusioN_SLA_STATUS;
      if (status == 'Met') {
        return 'NA'
      }
      else {
        status = kpiDetail.slA_STATUS;
      }
    }
    else if (status == null || status == undefined || status === '') {
      status = kpiDetail.slA_STATUS;
    }
    else {
      status = kpiDetail.exclusioN_SLA_STATUS;
    }
    return status;
  }

  getActuals(kpiDetail: any): string {
    let actual = '';
    let uom = kpiDetail.uniT_OF_MEASUREMENT;
    let isNoData = kpiDetail.iS_NO_DATA;
    let hideUom = kpiDetail.hidE_UOM;

    if (!this.includeExclusions)
      actual = kpiDetail.kpI_ACTUAL;
    else {
      actual = kpiDetail.exclusioN_KPI_ACTUAL;
      if (actual == null || actual == '') {
        let commonActual = kpiDetail.kpI_ACTUAL;
        if (commonActual != null && commonActual != '') {
          return commonActual + ' ' + (uom == 'Number' || hideUom ? '' : uom);
        }
        else {
          if (isNoData) {
            return "NT";
          }
          else {
            return "NA";
          }
        }
      }
    }
    if (actual != null && actual != '')
      return actual + ' ' + (uom == 'Number' || hideUom ? '' : uom);
    else
      if (isNoData) {
        return "NT";
      }
      else {
        return "NA";
      }
  }

  isDisabled: Boolean = false;
  isLoading: Boolean = false;

  loadProductDetails() {
    this.isDisabled = true;
    this.isLoading = true;
    this.metricsDetail = [];
    let d: string = (this.tableYear + '-' + this.tableMonth + '-01');
    this._appService.getKpiMetrics(this.prodId, this.modeId, d, false).subscribe({
      next: async (data: any) => {
        this.metricsDetail = data;
        if (this.flagValue == 'true' && this.capaStageId == -1) {
          this.metricsDetail = data;
        }
        else if (this.flagValue == 'true') {
          this.metricsDetail = data.filter((x: any) => x.capA_STAGE_ID == this.capaStageId);
          if (this.metricsDetail.length == 0) {
            this.metricsDetail = data;
          }
        }
        else {
          this.metricsDetail = data;
        }
        await this.loadAdditionalData(this.metricsDetail);
        if (this.flagValue == 'true') {
          setTimeout(() => {
            this.apptablefilter.tbnAddFilter_OnClick()
          }, 2000);
        }
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.isDisabled = false;
        this.isLoading = false;
      }
    })
  }
  loadProductDetailsGrid() {
    this.kpiDetail = [];
    if (this.metricsDetail.length > 0) {
      let i = 0;
      for (let ele of this.metricsDetail) {
        i++;
        //if (ele.kpI_ACTUAL != '' && ele.kpI_ACTUAL != null) {
        if (ele.iS_DRAFT == 0 || ele.frequency == 'Quarterly') {
          if (ele.kpI_ACTUAL == '' || ele.kpI_ACTUAL == null) {
            if (ele.iS_NO_DATA) {
              ele.slA_STATUS = 'NT';
              ele.secondarY_SLA_STATUS = 'NT';
            }
            else {
              ele.slA_STATUS = 'NA';
              ele.secondarY_SLA_STATUS = 'NA';
            }
          }
          if (ele.slA_Rejection_data == null) {
            var t: any = { "slA_REJECTION_KPI_DETAILS": { "comment": "", statuS_ID: 0, "kpI_DETAILS_ID": i, "rejectioN_ID": i } };
            ele.slA_Rejection_data = t;
          }
          if (ele.kpI_DETAILS_COMMENT == null) {
            var t: any = { "comment": "" };
            ele.kpI_DETAILS_COMMENT = t;
          }
          ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["comment1"] = ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["comment"];
          ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["comment"] = "";
          ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["statuS_ID1"] = ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["statuS_ID"];
          ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["statuS_ID"] = 0;
          this.kpiDetail.push(ele);
        }
        // if (ele.slA_Rejection_data == null) {
        //   var t: any = { "slA_REJECTION_KPI_DETAILS": { "comment": "",statuS_ID:0, "kpI_DETAILS_ID": i, "rejectioN_ID": i } };
        //   ele.slA_Rejection_data = t;
        // }
        //  ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["comment1"] = ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["comment"] ;
        //  ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["comment"] = "";
        //  ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["statuS_ID1"]=ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["statuS_ID"];
        //  ele.slA_Rejection_data["slA_REJECTION_KPI_DETAILS"]["statuS_ID"]=0;
        // this.kpiDetail.push(ele);
      }
      if (this.kpiDetail.length > 0) {
        this.showMetrics = false;
        this.kpiDetail.forEach(i => {
          this.additionalData.forEach(j => {
            if (i.detaiL_ID == j.detaiL_ID) {
              i.exclusioN_COMMENT = j.exclusioN_COMMENT;
            }
          });
        })
        this.dataSource = new MatTableDataSource(this.kpiDetail);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isDisabled = false;
        this.isLoading = false;
      }
      else {
        this.showMetrics = true;
        this.isDisabled = false;
        this.isLoading = false;
      }
    }
    else {
      this.showMetrics = true;
      this.isDisabled = false;
      this.isLoading = false;
    }
  }

  getBaseMeasureData(val: any): any {
    if (this.includeExclusions)
      return val.exclusionBaseMeasureDataList;
    else return val.baseMeasureDataList;
  }
  async loadAdditionalData(metricsDetail: any) {
    this._appService.getKpiMetricsAdditionalData(metricsDetail).subscribe({
      next: (data: any) => {
        this.additionalData = data;
        this.metricsDetail.forEach((d: any) => {
          let addData = this.additionalData.filter((x: any) => x.guid == d.guid)[0];
          if (addData != null && addData != undefined) {
            d.baseMeasureDataList = addData.baseMeasureDataList
            d.exclusionBaseMeasureDataList = addData.exclusionBaseMeasureDataList
            d.capaStage = addData.capaStage
            d.slA_Rejection_data = addData.slA_Rejection_data
            d.kpI_DETAILS_COMMENT = addData.kpI_DETAILS_COMMENT
          }
        })
        this.loadProductDetailsGrid();

      },
      error: (error: any) => this._util.serviceError(error)
    })
  }
  loadOverallDetails() {
    this.getConfigResult()
    this._appService.getOverallServiceMetricsForAPeriod(this.input_custId, this.tableMonth, this.tableYear).subscribe(
      (data: any) => {
        this.productScores = data.filter((x: any) => x.producT_ID == this.prodId);

      }, (err: any) => { this._util.serviceError(err) }
    )
  }

  showStatusForProduct(data: any): string {
    let status = this._util.showThumbsForProduct(data, this.includeExclusions, this.achievementPer, 'By Expected Service Level');
    return status;
  }

  getConfigResult() {
    this._appService.GetDBConfigValue("ACCOUNT_HEALTH", -1, '').subscribe((data: string) => {
      if (data != undefined || data != null || data != '') {
        this.achievementPer = Number(data);
      }
    }, (err: any) => { this._util.serviceError(err) })
  }

  getmeasurementforServiceLevel(kpiId: number): string | undefined {
    let uom; let expectedLvl;
    if (this.kpiDetail.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        const kpi = this.kpiDetail.filter((x: any) => x.kpI_ID == kpiId)[0];
        if (kpi) {
          uom = kpi.uniT_OF_MEASUREMENT;
          expectedLvl = kpi.expecteD_SERVICE_LEVEL;
          if (uom == '%')
            return expectedLvl + '%'
          else if (uom == 'Number')
            return expectedLvl + ' per product'
        }
      }
    }
    return undefined;
  }
  changeGroupBy(headerName: string, selGroupBy: string): void {
    if (headerName != "" && headerName != null)
      this.headerName = headerName.replace("View by ", "");
    this.selGroupBy = selGroupBy;
    this.reloadKPITable();
  }
  getmeasurementforMinServiceLevel(kpiId: number): string | undefined {
    let uom; let expectedLvl;
    if (this.kpiDetail.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        const kpi = this.kpiDetail.filter((x: any) => x.kpI_ID == kpiId)[0];
        if (kpi) {
          uom = kpi.uniT_OF_MEASUREMENT;
          expectedLvl = kpi.minimuM_SERVICE_LEVEL;
          if (uom == '%')
            return expectedLvl + '%'
          else if (uom == 'Number')
            return expectedLvl + ' per product'
        }
      }
    }
    return undefined;
  }

  toggleExclusions(val: boolean) {
    this.includeExclusions = val;
    this.filterData();
  }

  Filter_onChange($event: any) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    if (this.filterCriteria.length == 0) {
      this.flagValue = false;
      this.loadProductDetails();
    }
    this.filterData();
  }

  showAll($event: any) { }

  filterData() {
    let serviceLevelStatusFilter = this.filterCriteria.filter((x: any) => x.displaY_NAME == 'Service Level Status')[0];
    if (serviceLevelStatusFilter != undefined && serviceLevelStatusFilter != null) {
      if (this.includeExclusions)
        serviceLevelStatusFilter.fielD_NAME = 'exclusioN_SLA_STATUS';
      else
        serviceLevelStatusFilter.fielD_NAME = 'slA_STATUS';
    }

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.kpiDetail);
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  ViewCAPA(id: number) {
    let kpiData: any = [];
    localStorage.setItem('iscapametricview', 'true');
    let date: string = (this.tableYear + "-" + this.tableMonth + '-01');
    kpiData = this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0];
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.data = {
      'editedRow': kpiData,
      'selectedPeriod': date
    }
    dialogRef.maxWidth = "100%";
    dialogRef.width = "99%";
    dialogRef.height = "70%";
    const dialog = this.dialog.open(KpiActionPlanComponent, dialogRef);
    dialog.afterClosed().subscribe((res: any) => {
      if (res != null && res != undefined && res.data != null && res.data != undefined) {
        const metric = this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0];
        if (metric) metric.capaStage = res.data;
      }
      else {
        res = localStorage.getItem("capaforKPI");
        if (res != null && res != undefined) {
          const metric = this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0];
          if (metric) metric.capaStage = JSON.parse(res);
          localStorage.removeItem("capaforKPI");
        }
      }
      this.kpiId = undefined;
      this.modeId = undefined!;
    })
  }
  Service_GetServiceAreaProjectMapping() {
    this.serviceAreaProjectMappingList = undefined!;
    if (this.input_projId != undefined) {
      this._appService.getServiceTowersProjectMapping(this.input_projId).subscribe({
        next: (data: any) => {
          this.serviceAreaProjectMappingList = data;
        },
        error: (error: any) => { this._util.serviceError(error); }
      });
    }
  }
  Service_GetServiceAreaList() {
    this._appService.getServiceAreaList().subscribe({
      next: (data: any) => {
        this.serviceAreaList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }
  GetServiceAreaName(id: number): string | undefined {
    let sa = this.serviceAreaList.filter((t: any) => t.id == id);
    if (sa.length > 0) {
      return sa[0].title;
    }
    else
      return undefined;
  }
  showBaseMeasures(val: boolean) {
    if (val)
      this.includeBaseMeasure = true;
    else
      this.includeBaseMeasure = false;
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  isAllKPISelected() {
    const numSelected = this.selectionKPI.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterKPIToggle() {
    this.isAllKPISelected() ?
      this.selectionKPI.clear() :
      this.dataSource.data.forEach(row => this.selectionKPI.select(row));
  }

  updateSLARejection() {
    let date: String = (this.tableYear + '-' + this.tableMonth + '-01');
    if (this.isValidInputs()) {
      const dialogRef = this._util.showWarningConfirmation(
        'Are you sure want to update SLA Rejection for the selected SLA(s)?',
        'Update SLA Rejection'
      );
      
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          let selectedSLA = this.selection.selected;
          let selection = selectedSLA.filter(x => x.slA_Rejection_data);
          let rejectedSLA: any = [];
          if (selectedSLA.length > 0) {
            for (let sla of selectedSLA) {
              let rej = sla["slA_Rejection_data"];
              rejectedSLA.push({ rejectioN_COMMENTS: rej["rejectioN_COMMENTS"], slA_REJECTION_KPI_DETAILS: rej["slA_REJECTION_KPI_DETAILS"] });
            }
            this.submitSLAForRejections(rejectedSLA, date, "The selected SLA(s) rejection updated scuccessfully and mail has been sent to concerned persons.");
          }
        }
      });
    }
  }

  rejectSLA() {
    let date: String = (this.tableYear + '-' + this.tableMonth + '-01');
    if (this.isValidInputs()) {
      const dialogRef = this._util.showWarningConfirmation(
        'Are You sure You want to reject selected SLA(s)?',
        'Reject SLAs'
      );
      
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          let selectedSLA = this.selection.selected;
          let selection = selectedSLA.filter(x => x.slA_Rejection_data);
          let rejectedSLA: any = [];
          if (selectedSLA.length > 0) {
            for (let sla of selectedSLA) {
              let rej = sla["slA_Rejection_data"];
              //if(rej ==null)
              //rej={"slA_Rejection_data":{"slA_REJECTION_KPI_DETAILS":{"statuS_ID":1}},"rejectioN_COMMENTS":}
              rej["slA_REJECTION_KPI_DETAILS"]["statuS_ID"] = 1;
              rej["slA_REJECTION_KPI_DETAILS"]["kpI_DETAILS_ID"] = sla["detaiL_ID"];
              rejectedSLA.push({ rejectioN_COMMENTS: rej["rejectioN_COMMENTS"], slA_REJECTION_KPI_DETAILS: rej["slA_REJECTION_KPI_DETAILS"] });
            }
            this.submitSLAForRejections(rejectedSLA, date, "The selected SLA(s) rejected successfully and mail has been sent to concerned persons.");
          }
        }
      });
    }
  }

  getEmployeeRolesForProduct() {
    this.isLoading = true;
    this._appService.getEmployeeRolesForProduct(this.prodId).subscribe((data: any) => {
      this.employeeRole = data;
      this.isLoading = false;
    }, (err: any) => { this._util.serviceError(err); this.isLoading = false; })
  }

  onProductClick(prod: any): void {
    // Update the selected product ID and mode
    this.prodId = prod.producT_ID;
    this.modeId = prod.modE_ID;
    
    // Load detailed metrics for the selected product
    this.getProductName(this.prodId);
    this.loadProductDetails();
    this.getEmployeeRolesForProduct();
  }

  sendSLAToCustomer() {
    this.isLoading = true;
    let date: string = (this.tableYear + '-' + this.tableMonth + '-01');
    
    const dialogRef = this._util.showWarningConfirmation(
      'Are You sure You want to send all SLA metrics to the customer?',
      'Send SLA Metrics'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.isLoading = false;
        this._appService.sendKPIDetailsReviewFeedback(this.prodId, date).subscribe((data: any) => {
          this.isLoading = false;
          this.reloadProdKPITable();
        }, (err: any) => { this._util.serviceError(err); this.isLoading = false; })
      }
    });
  }

  sendReviewFeedback() {
    let date: String = (this.tableYear + '-' + this.tableMonth + '-01');
    if (this.isValidInputsForReviewFeedback()) {
      const dialogRef = this._util.showWarningConfirmation(
        'Are You sure You want to submit the Review Comments for the selected SLA(s)?',
        'Submit Review Comments'
      );
      
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          let selectedSLA = this.selection.selected;
          let reviewedSLA: any = [];
          let productId: any;
          if (selectedSLA.length > 0) {
            for (let sla of selectedSLA) {
              let review = sla["kpI_DETAILS_COMMENT"];
              review["kpI_DETAILS_ID"] = sla["detaiL_ID"];
              productId = sla["producT_ID"];
              reviewedSLA.push(review);
            }
            this.sendForReviewFeedback(reviewedSLA, productId, date, "The selected SLA(s) Review Comments submitted successfully and mail has been sent to concerned persons.");
          }
        }
      });
    }
  }

  isValidInputsForReviewFeedback() {
    let flag = true;
    let selectedSLA = this.selection.selected;
    if (selectedSLA.length == 0) {
      alert("Please select alteast one sla to send for review.");
      flag = false;
    }
    if (selectedSLA.length > 0) {
      for (let sla of selectedSLA) {
        if (sla["kpI_DETAILS_COMMENT"]["comment"] == "" || sla["kpI_DETAILS_COMMENT"]["comment"] == null || sla["kpI_DETAILS_COMMENT"]["comment"] == undefined) {
          alert("Please " + this.commentPlaceHolder);
          flag = false;
        }
      }
    }
    return flag;
  }


  isValidInputs() {
    let flag = true;
    let selectedSLA = this.selection.selected;
    if (selectedSLA.length == 0) {
      alert("Please select alteast one sla to reject.");
      flag = false;
    }

    if (selectedSLA.length > 0) {
      for (let sla of selectedSLA) {
        let rej = sla["slA_Rejection_data"];
        if (rej["slA_REJECTION_KPI_DETAILS"]["statuS_ID"] != 2 && (rej["slA_REJECTION_KPI_DETAILS"]["comment"] == "" || rej["slA_REJECTION_KPI_DETAILS"]["comment"] == undefined || rej["slA_REJECTION_KPI_DETAILS"]["comment"] == null)) {
          alert("Please " + this.commentPlaceHolder);
          flag = false;
          break;
        }
        if (this.isPM && !this._access.IsAllowed(83, 2, '', '')) {
          if (rej["slA_REJECTION_KPI_DETAILS"]["statuS_ID"] == 0 || rej["slA_REJECTION_KPI_DETAILS"]["statuS_ID"] == undefined || rej["slA_REJECTION_KPI_DETAILS"]["statuS_ID"] == null) {
            alert("please select Accept/Deny .");
            flag = false;
            break;
          }
        }
      }
    }
    return flag;
  }

  submitSLAForRejections(slaRejectionData: any, date: any, msg: string) {
    this.isLoading = true;
    this._appService.updateSLARejection(slaRejectionData, date).subscribe((data: any) => {
      this.isLoading = false;
      this.reloadProdKPITable();
      alert(msg); this.clear();
    }, (err: any) => { this._util.serviceError(err); this.isLoading = false; })
  }

  sendForReviewFeedback(reviewedSLA: any, productId: any, date: any, msg: string) {
    this.isLoading = true;
    // Commented out missing  method - needs to be restored in AppsService
    // this._appService.sendReviewFeedback(reviewedSLA, productId, date).subscribe((data: any) => {
    //   this.isLoading = false;
    //   this.reloadProdKPITable();
    //   alert(msg); this.clear();
    // }, (err: any) => { this._util.serviceError(err); this.isLoading = false; })
    this.isLoading = false;
    alert('sendReviewFeedback method needs to be restored in AppsService');
  }
  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    // k >= 65 && k <= 90 || // A-Z
    //         k >= 97 && k <= 122 || // a-z
    //         k >= 48 && k <= 57; // 0-9 keyCode=49,

    if (charCode == 40 || charCode == 41 || charCode == 44 || charCode == 46 || charCode == 20 || charCode == 188 || charCode == 32 || charCode == 8 || (charCode >= 44 && charCode <= 57) || charCode >= 97 && charCode <= 122 || charCode >= 65 && charCode <= 90 || charCode == 32) {
      return true;
    }
    return false;
  }

  clear() {
    this.selection.clear();
  }
  getrejectStatus(statusId: number): string {
    let status = "";
    if (statusId == 1)
      status = "Rejected By Customer";
    else if (statusId == 2)
      status = "Rejection Accepted";
    else if (statusId == 3)
      status = "Rejection Not Accepted";
    return status == "" ? "" : "(" + status + ")";
  }

  // Helper methods to provide type safety for template access
  getGoalDetails(): GoalDetail[] {
    return this.goalDetails as GoalDetail[];
  }

  asGoalDetail(item: any): GoalDetail {
    return item as GoalDetail;
  }

  asCellDetail(item: any): CellDetail {
    return item as CellDetail;
  }

  asCellDetailArray(item: any): CellDetail[] {
    return item as CellDetail[];
  }
}
