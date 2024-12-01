import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { isNumeric } from 'rxjs/internal/util/isNumeric';
import { AccessControl } from '../../../Shared/accessControl';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { KpiProductDetailViewComponent } from './kpi-product-detail-view/kpi-product-detail-view.component';
import { KpiActionPlanComponent } from '../kpi-action-plan/kpi-action-plan.component';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-kpi-product-view',
  templateUrl: './kpi-product-view.component.html',
  styleUrls: ['./kpi-product-view.component.scss']
})
export class KpiProductViewComponent implements OnInit {
  month = [];
  metricsDetail = [];
  additionalData = [];
  monthlyMetrics = [];
  quarterlyMetrics = [];
  releaseMetrics = [];
  showMonth: boolean = false;
  showQuarter: boolean = false;
  showRelease: boolean = false;
  @Input('tabIndex') tabChange: boolean;
  @Input('custId') custId: string;
  @Input('prodId') prodId: number;
  @Input('kpiId') kpiId: number;
  @Input('modeId') modeId: number;
  @Input('month') inputMonth: number;
  @Input('year') year: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource(this.metricsDetail);
  dataSource1 = new MatTableDataSource(this.metricsDetail);
  dataSource2 = new MatTableDataSource(this.metricsDetail);
  displayedColumns: string[] = ['reference', 'metrics', 'specLimit', 'expectedLevel', 'minLevel', 'actuals', 'slaStatus'];//select2
  displayedColumns1: string[] = ['reference', 'metrics', 'specLimit', 'expectedLevel', 'minLevel', 'actuals', 'slaStatus', 'period'];//select3
  displayedColumns2: string[] = ['reference', 'metrics', 'specLimit', 'expectedLevel', 'minLevel', 'actuals', 'slaStatus'];//select1
  kpi_actual: number;
  contractValue: string;
  riskPer: string;
  atRiskAmt: string;
  leftRiskAmt: string;
  isLoading: Boolean = false;
  freez: boolean = false;
  serviceModes = [];
  selectedMode: string;
  isCapaVisible: boolean = false;
  filterCriteria: any;
  filteredData: any;
  selectedModeTitle: string;
  addDatas: boolean = false;
  productName: string;
  includeExclusions: boolean = false;
  enableExclusion: boolean = false;
  sub: any;
  customerid: any;

  constructor(public _util: myUtility, private _appservice: AppsService, public dialog: MatDialog,
    public _access: AccessControl, private route: ActivatedRoute) {
    if (this._access.IsAllowed(75, 1, '', ''))
      this.isCapaVisible = true;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.customerid = params['custid'];
    });

    let exclusionCustomers = "";
    this._appservice.GetDBConfigValueFields("EXCLUSION_ENABLED_CUSTOMERS", -1, "").subscribe(data => {
      exclusionCustomers = data;
      if (exclusionCustomers.includes(this.customerid)) {
        this.enableExclusion = true;
      }
    });

    let periodDetails = this._util.GetDefaultMonthForPremierSLA();

    this._util.tableMonth = periodDetails[0].Month;
    this._util.tableYear = periodDetails[0].Year;

    if (this.prodId != null) {
      this.getProductName(this.prodId);
    }



    if (this.tabChange && this.prodId != null && this.prodId != undefined && this.kpiId == null && this.kpiId == undefined) {
      this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
      this.LoadServiceModes();
    }
    else if (this.tabChange && this.prodId != null && this.prodId != undefined && this.kpiId != null && this.kpiId != undefined) {
      let d: Date = new Date(Number(this.year), Number(this.inputMonth - 1));
      let m = d.toLocaleString('en-us', { month: 'short' });
      this._util.tableYear = Number(this.year);
      this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
      this._util.tableMonth = this.month.filter(x => x.title == m)[0].title;
      this.LoadServiceModes();
    }
  }

  ngOnChanges() {
    if (this.tabChange && this.prodId != null && this.prodId != undefined && this.kpiId == null && this.kpiId == undefined) {
      this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
      this.LoadServiceModes();
      this.getProductName(this.prodId);
    }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  LoadData() {
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    this.isLoading = true;
    this._appservice.getKpiMetrics(this.prodId, this.selectedMode, d, true).subscribe(data => {
      this.metricsDetail = data;
      this.loadAdditionalData(this.metricsDetail);
      let isSubmitted = this.metricsDetail.filter(x => x.kpI_ACTUAL != null && x.iS_DRAFT == 0)
      if (isSubmitted.length == this.metricsDetail.length) {
        this.freez = true;
      }
      else {
        this.freez = false;
      }
      if (this.metricsDetail.length > 0) {
        this.showReleaseKPIs();
        this.showMonthly();
        this.showQuarterly();
      }
      this.isLoading = false;
    }, (err) => { this._util.serviceError(err) })
  }
  loadAdditionalData(metricsDetail) {
    this.addDatas = false;
    this._appservice.getKpiMetricsAdditionalData(metricsDetail).subscribe(data => {
      this.additionalData = data;
      this.metricsDetail.forEach((d) => {
        let addData = this.additionalData.filter(x => x.guid == d.guid)[0];
        if (addData != null && addData != undefined) {
          d.baseMeasureDataList = addData.baseMeasureDataList;
          d.exclusionBaseMeasureDataList = addData.exclusionBaseMeasureDataList;
          d.capaStage = addData.capaStage;
          d.iS_EXCLUSION = addData.iS_EXCLUSION;
          d.exclusioN_COMMENT = addData.exclusioN_COMMENT;
        }
      })
      this.addDatas = true;
    }, (err) => { this._util.serviceError(err) },
      () => {
        if (this.kpiId != null && this.kpiId != undefined)
          this.ViewCAPA(this.kpiId)
      })

  }
  SaveDetails(kpiDetails, status) {
    // if (this.selection.selected.length == 0) {
    //   alert("Please Select Metrics to Save");
    //   return;
    // }
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    //let sladetails = [];
    //let ids = this.selection.selected.map(x => x.kpI_ID);
    //kpiDetails.filter(x => x.kpI_ID == ids);

    // for (let j = 0; j < kpiDetails.length; j++) {
    //   for (let i = 0; i < ids.length; i++) {
    //     if (kpiDetails[j].kpI_ID == ids[i]) {
    //       sladetails.push(kpiDetails[j])
    //     }
    //   }
    // }
    for (let i = 0; i < kpiDetails.length; i++) {
      if (kpiDetails[i].iS_NOT_APPLICABLE) {
        kpiDetails[i].slA_STATUS = 'NA';
        kpiDetails[i].secondarY_SLA_STATUS = 'NA';
        kpiDetails[i].capaStage = null;
      }
    }

    let metrics = kpiDetails.filter(x => (x.kpI_ACTUAL == null || x.kpI_ACTUAL == '') && !x.iS_NOT_APPLICABLE);
    if (metrics.length == this.metricsDetail.length) {
      alert('Please fill KPI Achievements for the Metrics to Save.');
      return false;
    }



    // let isSubmitted = kpiDetails.filter(x => x.kpI_ACTUAL != null && x.iS_DRAFT == 0)
    // if (isSubmitted.length > 0) {
    //   for (var i = 0; i < isSubmitted.length; i++) {
    //     if (isSubmitted[i].iS_DRAFT == 0) {
    //       alert('Out of Selected,' + isSubmitted.length + ' Metrics have been already Submitted. Please Unselect Submitted Metrics and proceed with Save As Draft');
    //       //this.selection.clear();
    //       return false;
    //     }
    //   }
    // }

    if (confirm('On clicking Ok, Entered Service Level Metrics would be Saved As Draft and Would not be considered in Dashboard.')) {
      this.isLoading = true;
      this._appservice.AddKpiDetailsbyProduct(kpiDetails, d, status).subscribe(data => {
        alert("Data Saved Successfully");
        this.freez = false;
        this.LoadData();
        this.isLoading = false;
        // this.selection.clear();
      }, (err) => {
        this._util.serviceError(err);
        this.freez = false;
        this.LoadData();
        this.isLoading = false;
      })
    }
  }
  SubmitDetails(kpiDetails, status) {
    // if (this.selection.selected.length == 0) {
    //   alert("Please Select Metrics to Submit");
    //   return;
    // }

    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');

    //let sladetails = [];
    // let ids = this.selection.selected.map(x => x.kpI_ID);
    //kpiDetails.filter(x => x.kpI_ACTUAL != null && x.kpI_ID == ids);
    // for (let j = 0; j < kpiDetails.length; j++) {
    //   for (let i = 0; i < ids.length; i++) {
    //     if (kpiDetails[j].kpI_ID == ids[i]) {
    //       sladetails.push(kpiDetails[j])
    //     }
    //   }
    // }

    for (let i = 0; i < kpiDetails.length; i++) {
      if (kpiDetails[i].iS_NOT_APPLICABLE) {
        kpiDetails[i].slA_STATUS = 'NA';
        kpiDetails[i].secondarY_SLA_STATUS = 'NA';
        kpiDetails[i].capaStage = null;
      }
    }


    let actualNotMet = kpiDetails.filter(x => x.kpI_ACTUAL != null && this.checkIfCAPARequired(x));
    if (actualNotMet.length > 0) {
      for (var i = 0; i < actualNotMet.length; i++) {
        if (actualNotMet[i].capaStage.capA_SUBMISSION != null &&
          actualNotMet[i].capaStage.capA_SUBMISSION.capa != null &&
          actualNotMet[i].capaStage.capA_SUBMISSION.capa.length == 0 && this.checkIfCAPARequired(actualNotMet[i])) {
          kpiDetails.filter(x => x.kpI_ID == actualNotMet[i].kpI_ID)[0].iS_NOT_FILLED = true;
          alert('Please fill RCA and Action Plan for the Actual values where expected target was not met.');
          return false;
        }
      }
    }

    let metrics = kpiDetails.filter(x => (x.kpI_ACTUAL == null || x.kpI_ACTUAL == '') && !x.iS_NOT_APPLICABLE);

    if (metrics.length > 0) {

      for (let i = 0; i < metrics.length; i++) {
        kpiDetails.filter(x => x.kpI_ID == metrics[i].kpI_ID)[0].iS_NOT_FILLED = true;
      }

      this.dataSource = new MatTableDataSource(kpiDetails.filter(x => x.frequency == 'Monthly'));
      this.dataSource1 = new MatTableDataSource(kpiDetails.filter(x => x.frequency == 'Quarterly'));
      this.dataSource2 = new MatTableDataSource(kpiDetails.filter(x => x.frequency == 'Release'));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      alert('Please fill the values for highlighted KPIs and submit');
      return false;
    }



    if (confirm('On clicking Ok, Service Level Metrics for ' + this.productName + ' for ' + this._util.tableMonth + " " + this._util.tableYear + ' would be Submitted.')) {
      this.freez = true;
      this.isLoading = true;
      this._appservice.AddKpiDetailsbyProduct(kpiDetails, d, status).subscribe(data => {
        alert("Data Submitted Successfully");
        this.freez = true;
        this.LoadData();
        this.isLoading = false;
        //     this.selection.clear();
      }, (err) => {
        this._util.serviceError(err);
        this.freez = false;
        this.LoadData();
        this.isLoading = false;
      })
    }
  }
  reloadMonthlyKPITable() {

    this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    //let d: Date = this._util.setLocaleDate("1-" + this._util.tableMonth + "-" + this._util.tableYear);
    this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    this.freez = true;
    this.isLoading = true;
    this._appservice.getKpiMetrics(this.prodId, this.selectedMode, d, true).subscribe(data => {
      this.metricsDetail = data;
      this.loadAdditionalData(this.metricsDetail);
      let isSubmitted = this.metricsDetail.filter(x => x.kpI_ACTUAL != null && x.iS_DRAFT == 0)
      if (isSubmitted.length == this.metricsDetail.length) {
        this.freez = true;
      }
      else {
        this.freez = false;
      }
      this.showReleaseKPIs();
      this.showMonthly();
      this.showQuarterly();
      this.isLoading = false;
    }, (err) => { this._util.serviceError(err) })
  }
  getpenaltyApplicable(kpiId) {
    let serviceLevel
    if (kpiId != undefined || kpiId != null) {
      serviceLevel = this.metricsDetail.filter(x => x.kpI_ID == kpiId)[0].servicE_LEVEL;
      if (serviceLevel == 'Key Measurement')
        return 'NA'
      else
        return '$'
    }
  }
  getmeasurementforServiceLevel(kpiId) {
    let uom; let expectedLvl;
    if (this.metricsDetail.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.metricsDetail.filter(x => x.kpI_ID == kpiId)[0]!.uniT_OF_MEASUREMENT;
        expectedLvl = this.metricsDetail.filter(x => x.kpI_ID == kpiId)[0]!.expecteD_SERVICE_LEVEL;
        if (uom == '%' && expectedLvl != null)
          return expectedLvl + '%'
        else
          return expectedLvl;
      }
    }
  }
  getmeasurementforMinServiceLevel(kpiId) {
    let uom; let expectedLvl;
    if (this.metricsDetail.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.metricsDetail.filter(x => x.kpI_ID == kpiId)[0]!.uniT_OF_MEASUREMENT;
        expectedLvl = this.metricsDetail.filter(x => x.kpI_ID == kpiId)[0]!.minimuM_SERVICE_LEVEL;
        if (uom == '%' && expectedLvl != null)
          return expectedLvl + '%'
        else
          return expectedLvl;
      }
    }

  }
  showReleaseKPIs() {
    if (this.metricsDetail != undefined && this.metricsDetail.length > 0) {
      this.releaseMetrics = this.metricsDetail.filter(x => x.frequency == 'Release');
      if (this.releaseMetrics.length > 0) {
        this.showRelease = true;
        this.dataSource2 = new MatTableDataSource(this.releaseMetrics);
      }
      else {
        this.showRelease = false;
        this.dataSource2 = new MatTableDataSource(this.metricsDetail);
      }
    }
    else {
      this.showRelease = false;
      this.dataSource2 = new MatTableDataSource(this.metricsDetail);
    }
  }
  showMonthly() {
    if (this.metricsDetail != undefined && this.metricsDetail.length > 0) {
      this.monthlyMetrics = this.metricsDetail.filter(x => x.frequency == 'Monthly');
      if (this.monthlyMetrics.length > 0) {
        this.showMonth = true;
        setTimeout(() => {
          this.dataSource = new MatTableDataSource(this.monthlyMetrics);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      }
      else {
        this.showMonth = false;
        setTimeout(() => {
          this.dataSource = new MatTableDataSource(this.monthlyMetrics);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      }
    }
    else {
      this.showMonth = false;
      setTimeout(() => {
        this.dataSource = new MatTableDataSource(this.monthlyMetrics);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    }

  }
  showQuarterly() {
    if (this.metricsDetail != undefined && this.metricsDetail.length > 0) {
      this.quarterlyMetrics = this.metricsDetail.filter(x => x.frequency == 'Quarterly');
      if (this.quarterlyMetrics.length > 0) {
        this.showQuarter = true;
        this.dataSource1 = new MatTableDataSource(this.quarterlyMetrics);
      }
      else {
        this.showQuarter = false;
        this.dataSource1 = new MatTableDataSource(this.metricsDetail);
      }
    }
    else {
      this.showQuarter = false;
      this.dataSource1 = new MatTableDataSource(this.metricsDetail);
    }

  }
  getKpiActual(metricslist) {
    if (this.includeExclusions)
      return metricslist.kpI_ACTUAL;
    else return metricslist.exclusioN_KPI_ACTUAL;
  }

  getslaStatusforKPI(kpiDetail) {
    let status = this._util.GetSLAStatus(kpiDetail, this.includeExclusions);
    return status;
  }

  blurcalled(kpiId, actualEntered) {

    if (this.metricsDetail.length > 0) {
      let uom = this.metricsDetail.filter(x => x.kpI_ID == kpiId)[0].uniT_OF_MEASUREMENT;

      if (actualEntered == undefined || actualEntered == null || actualEntered == '') {
        return;
      }
      else {
        if (this.metricsDetail.filter(x => x.kpI_ID == kpiId)[0].hidE_UOM)
          return '';
        else
          return uom;
      }
    }
  }
  getperiod(frequency) {
    let m = this._util.getMonthNum(this._util.tableMonth);

    if (m == 3 || m == 4 || m == 5)
      return 'Q1 -' + this._util.tableYear
    else if (m == 6 || m == 7 || m == 8)
      return 'Q2 -' + this._util.tableYear
    else if (m == 9 || m == 10 || m == 11)
      return 'Q3 -' + this._util.tableYear
    else if (m == 0 || m == 1 || m == 2)
      return 'Q4 -' + (this._util.tableYear - 1)
  }
  LoadServiceModes() {
    this.isLoading = true;
    this._appservice.getAllServiceMode(this.prodId).subscribe(
      data => {
        this.serviceModes = data;
        if (data != null && data.length > 0) {
          if (this.modeId != null && this.modeId != undefined) {
            this.selectedMode = this.serviceModes.filter(x => x.id == this.modeId)[0].id
            this.selectedModeTitle = this.serviceModes.filter(x => x.id == this.modeId)[0].modE_TITLE
          }
          else {
            this.selectedMode = this.serviceModes.filter(x => x.id)[0].id;
            this.selectedModeTitle = this.serviceModes.filter(x => x.id == x.id)[0].modE_TITLE
          }
        }
        this.LoadData();
      }, (err) => { this._util.serviceError(err) }
    )
  }
  viewBaseMeasures(id) {
    let baseMeasures = [];
    baseMeasures = this.metricsDetail.filter(x => x.kpI_ID == id)[0].baseMeasureDataList;
    let baseMeasuresEx = [];
    baseMeasuresEx = this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusionBaseMeasureDataList;
    let isExclusion = this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_EXCLUSION;

    let exclusionComment = this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusioN_COMMENT;
    let isNA = this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_NOT_APPLICABLE;
    let remarks = this.metricsDetail.filter(x => x.kpI_ID == id)[0].remarks;
    let kpiActual = this.metricsDetail.filter(x => x.kpI_ID == id)[0].kpI_ACTUAL;
    let isDraft = this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_DRAFT;
    let isExNoData = this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_EX_NO_DATA;
    let exRemarks = this.metricsDetail.filter(x => x.kpI_ID == id)[0].exremarks;
    let detailId = this.metricsDetail.filter(x => x.kpI_ID == id)[0].detaiL_ID;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'kpiId': id,
      'baseMeasureData': baseMeasures,
      'remarks': remarks,
      'isNA': isNA,
      'isDraft': isDraft,
      'isExNoData': isExNoData,
      'exRemarks': exRemarks,
      'exclusionbaseMeasureData': baseMeasuresEx,
      'isExclusion': isExclusion,
      'exclusionComment': exclusionComment,
      'month': this._util.tableMonth,
      'year': this._util.tableYear,
      'detailId': detailId,
      'custId': this.custId,
      'productName': this.productName,
      'enableExclusion': this.enableExclusion
    }
    dialogConfig.maxWidth = "60%";
    dialogConfig.width = "60%";
    const dialogRef = this.dialog.open(KpiProductDetailViewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result != undefined && result.data != undefined && result.data != null && result.data != '' && (result.data.kpI_ACTUAL != undefined || result.data.kpI_ACTUAL != null)) {
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].kpI_ACTUAL = result.data.kpI_ACTUAL;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].slA_STATUS = result.data.slA_STATUS;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].secondarY_SLA_STATUS = result.data.secondarY_SLA_STATUS;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusioN_KPI_ACTUAL = result.data.exclusioN_KPI_ACTUAL;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusioN_SLA_STATUS = result.data.iS_EX_NO_DATA ? 'NA' : result.data.exclusioN_SLA_STATUS;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusioN_SECONDARY_SLA_STATUS = result.data.iS_EX_NO_DATA ? 'NA' : result.data.exclusioN_SECONDARY_SLA_STATUS;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].remarks = null;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_NOT_APPLICABLE = 0;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].capaStage = result.data[0] ? null : this.metricsDetail.filter(x => x.kpI_ID == id)[0].capaStage;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_EX_NO_DATA = result.data.iS_EX_NO_DATA;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].exremarks = result.data.exremarks;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_EXCLUSION = result.data.iS_EXCLUSION;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusioN_COMMENT = result.data.exclusioN_COMMENT;
        if (result.data.kpI_ACTUAL != null && result.data.kpI_ACTUAL != "") {
          this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_NOT_FILLED = false;
        }
        else {
          this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_NOT_FILLED = true;
        }
      }
      else if ((result.data == '' || result.data == undefined) && (kpiActual == '' || kpiActual == null)) {
        let baseData = this.metricsDetail.filter(x => x.kpI_ID == id)[0].baseMeasureDataList;
        if (baseData.length > 0) {
          for (let b of baseData) {
            if (b.numerator == '' || b.numerator == null) {
              this.metricsDetail.filter(x => x.kpI_ID == id)[0].kpI_ACTUAL = '';
              this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusioN_KPI_ACTUAL = '';
            }
          }
        }
      }
      else if (result.data[0] || result.data[3]) {
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].kpI_ACTUAL = '';
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].remarks = result.data[1];
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_NOT_APPLICABLE = result.data[0];
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_EXCLUSION = result.data[4];
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].slA_STATUS = result.data[2];
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].secondarY_SLA_STATUS = result.data[2];
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].capaStage = result.data[0] ? null : this.metricsDetail.filter(x => x.kpI_ID == id)[0].capaStage;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_EX_NO_DATA = result.data[5];
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusioN_SLA_STATUS = result.data[5] ? 'NA' : this.metricsDetail.filter(x => x.kpI_ID == id)[0].exclusioN_SLA_STATUS;
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].exremarks = result.data[6];
        if (!result.data[3] && !result.data[0] && result.data[3] != 'Not Met' && result.data.kpI_ACTUAL != null || result.data.kpI_ACTUAL != "") {
          this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_NOT_FILLED = false;
        }
        else {
          if ((result.data[0] || result.data[3]) && result.data[1])
            this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_NOT_FILLED = false;
          else
            this.metricsDetail.filter(x => x.kpI_ID == id)[0].iS_NOT_FILLED = true;
        }
      }
    })
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    //alert(charCode);
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
      return false;
    }
    return true;

  }

  ViewCAPA(id) {
    let kpiData = this.metricsDetail.filter(x => x.kpI_ID == id)[0];
    let date: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.data = {
      'editedRow': kpiData,
      'selectedPeriod': date,
      'customerId': this.custId
    }
    dialogRef.maxWidth = "100%";
    dialogRef.width = "99%";
    dialogRef.height = "70%";
    const dialog = this.dialog.open(KpiActionPlanComponent, dialogRef);
    dialog.afterClosed().subscribe(res => {
      let keys = "capaforKPI" + kpiData.kpI_ID;

      if (res != null && res != undefined && res.data != null && res.data != undefined) {
        this.metricsDetail.filter(x => x.kpI_ID == id)[0].capaStage = res.data;
      }
      else {
        res = localStorage.getItem(keys);
        if (res != undefined && res != null) {
          this.metricsDetail.filter(x => x.kpI_ID == id)[0].capaStage = JSON.parse(res);

        }
      }
      localStorage.removeItem(keys);
      this.kpiId = undefined;
      this.modeId = undefined;

    })
  }
  Filter_onChange($event) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;

    this.showMonth = false;
    this.showRelease = false;
    this.showQuarter = false;

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.metricsDetail);
    let monthly = this.filteredData.filter(x => x.frequency == 'Monthly');
    let quarterly = this.filteredData.filter(x => x.frequency == 'Quarterly');
    let release = this.filteredData.filter(x => x.frequency == 'Release');

    if (monthly.length > 0) {
      this.showMonth = true;
    }
    if (quarterly.length > 0) {
      this.showQuarter = true;
    }
    if (release.length > 0) {
      this.showRelease = true;
    }

    this.dataSource = new MatTableDataSource(monthly);
    this.dataSource1 = new MatTableDataSource(quarterly);
    this.dataSource2 = new MatTableDataSource(release);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  showAll($event) { }

  getProductName(prodId) {
    if (prodId == undefined || prodId == null) return;
    this._appservice.GetProductName(prodId).subscribe(
      data => {
        this.productName = data;
      }, error => { this._util.serviceError(error); }
    )
  }

  toggleExclusions(val) {
    this.includeExclusions = val;
  }

  checkIfCAPARequired(kpiDetails): boolean {
    let isExclusion = kpiDetails.iS_EXCLUSION;// this.includeExclusions; // kpiDetails.iS_EXCLUSION;
    if (!isExclusion) {
      if (kpiDetails.slA_STATUS == "Not Met")
        return true;
    }
    if (isExclusion) {
      if (kpiDetails.slA_STATUS == "Not Met" && kpiDetails.exclusioN_SLA_STATUS == "Not Met")
        return true;
      if (kpiDetails.slA_STATUS == "Met" && kpiDetails.exclusioN_SLA_STATUS == "Not Met")
        return true;
    }
    return false;
  }


  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource2.data.filter(x => x.iS_DRAFT != 0).length;
  //   return numSelected === numRows;
  // }

  // masterToggle() {
  //   this.isAllSelected() ?
  //     this.selection.clear() :
  //     this.dataSource2.data.filter(x => x.iS_DRAFT != 0).forEach(row => this.selection.select(row));
  // }
  // isAllSelected2() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource.data.filter(x => x.iS_DRAFT != 0).length;
  //   return numSelected === numRows;
  // }

  // masterToggle2() {
  //   this.isAllSelected2() ?
  //     this.selection.clear() :
  //     this.dataSource.data.filter(x => x.iS_DRAFT != 0).forEach(row => this.selection.select(row));
  // }
  // isAllSelected3() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource1.data.filter(x => x.iS_DRAFT != 0).length;
  //   return numSelected === numRows;
  // }

  // masterToggle3() {
  //   this.isAllSelected3() ?
  //     this.selection.clear() :
  //     this.dataSource1.data.filter(x => x.iS_DRAFT != 0).forEach(row => this.selection.select(row));
  // }
}

// export class slametricsDetail {
//   kpI_ID: number;
// }
