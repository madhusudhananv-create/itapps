import { Component, Input, OnInit, ViewChild, AfterViewInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { TableFilterComponent } from '../../../shared/components/table-filter/table-filter.component';
import { KpiActionPlanComponent } from '../kpi-action-plan/kpi-action-plan.component';
import { KpiProductDetailViewComponent } from './kpi-product-detail-view/kpi-product-detail-view.component';

@Component({
  selector: 'app-kpi-product-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatRadioModule, 
    MatProgressBarModule, MatTooltipModule, MatIconModule, TableFilterComponent],
  templateUrl: './kpi-product-view.component.html',
  styleUrls: ['./kpi-product-view.component.scss']
})
export class KpiProductViewComponent implements OnInit, AfterViewInit, OnChanges {
  month: any[] = [];
  metricsDetail: any[] = [];
  additionalData: any[] = [];
  monthlyMetrics: any[] = [];
  quarterlyMetrics: any[] = [];
  releaseMetrics: any[] = [];
  @Input('tabIndex') tabChange: boolean = false;
  @Input('custId') custId: string = '';
  @Input('prodId') prodId: number = 0;
  @Input('modeId') modeId: number = 0;
  @Input('kpiId') kpiId: number = 0;
  @Input('month') monthChanged: number = 0;
  @Input('year') yearChanged: number = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataSource1: MatTableDataSource<any> = new MatTableDataSource();
  dataSource2: MatTableDataSource<any> = new MatTableDataSource();
  selectedMode: number = 0;
  productName: string = '';
  displayedColumns: string[] = ['reference', 'metrics', 'specLimit', 'expectedLevel', 'minLevel', 'actuals', 'slaStatus'];
  displayedColumns1: string[] = ['reference', 'metrics', 'specLimit', 'expectedLevel', 'minLevel', 'actuals', 'slaStatus'];
  displayedColumns2: string[] = ['reference', 'metrics', 'specLimit', 'expectedLevel', 'minLevel', 'actuals', 'slaStatus'];
  selectedModeTitle: string = '';
  leftRiskAmt: string = '';
  isLoading: boolean = false;
  freez: boolean = false;
  serviceModes: any[] = [];
  filteredData: any[] = [];
  filterCriteria: any[] = [];
  addDatas: boolean = false;
  showMonth: boolean = false;
  showRelease: boolean = false;
  showQuarter: boolean = false;
  includeExclusions: boolean = false;
  enableExclusion: boolean = false;
  isCapaVisible: boolean = false;

  constructor(
    public _appservice: AppsService,
    public _util: MyUtility,
    public myAccessControl: AccessControl,
    public _access: AccessControl,
    public dialog: MatDialog,
    public _route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    
    // Check if exclusion is enabled for this customer
    this._appservice.getDBConfigValueFields("EXCLUSION_ENABLED_CUSTOMERS", -1, "").subscribe((data: string) => {
      let exclusionCustomers = data;
      if (exclusionCustomers && exclusionCustomers.includes(this.custId)) {
        this.enableExclusion = true;
      }
    });

    this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    
    // Load data if prodId is already set (initial load)
    if (this.prodId != null && this.prodId != undefined && this.prodId != 0) {
      this.getProductName(this.prodId);
      this.LoadServiceModes();
    }
  }

  ngAfterViewInit() {
    // Connect paginator and sort with proper timing
    setTimeout(() => {
      if (this.paginator && this.dataSource) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort && this.dataSource) {
        this.dataSource.sort = this.sort;
      }
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    
    // Check if prodId has changed (including first change)
    if (changes['prodId']) {
      const newProdId = changes['prodId'].currentValue;
      const oldProdId = changes['prodId'].previousValue;
      
      // Only load if we have a valid new prodId and it's different from the old one
      if (newProdId != null && newProdId != undefined && newProdId != 0 && newProdId !== oldProdId) {
        this.getProductName(newProdId);
        this.LoadServiceModes();
        return; // Exit early to avoid duplicate loading
      } else {
      }
    }
    
    if (this.tabChange) {
      this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
      if (this.prodId != null && this.prodId != undefined && this.prodId != 0) {
        this.getProductName(this.prodId);
        this.LoadServiceModes();
      }
    }
    if (this.monthChanged != 0) {
      if (this.prodId != null && this.prodId != undefined && this.prodId != 0) {
        this.getProductName(this.prodId);
        this.LoadServiceModes();
      }
    }
    if (this.yearChanged != 0) {
      this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
      if (this.prodId != null && this.prodId != undefined && this.prodId != 0) {
        this.getProductName(this.prodId);
        this.LoadServiceModes();
      }
    }
  }

  // Optimized LoadData with parallel API calls using forkJoin
  LoadData() {
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    
    if (!this.selectedMode) {
      console.error('LoadData: selectedMode is not set! Cannot load KPI data.');
      this.isLoading = false;
      return;
    }
    
    this.isLoading = true;
    const startTime = performance.now();
    
    this._appservice.getKpiMetrics(this.prodId, this.selectedMode, d.toString(), true).subscribe((data: any) => {
      this.metricsDetail = data;
      
      // Only load additional data if there are metrics
      if (this.metricsDetail && this.metricsDetail.length > 0) {
        this.loadAdditionalData(this.metricsDetail);
        
        let isSubmitted = this.metricsDetail.filter((x: any) => x.kpI_ACTUAL != null && x.iS_DRAFT == 0);
        if (isSubmitted.length == this.metricsDetail.length) {
          this.freez = true;
        } else {
          this.freez = false;
        }
        
        this.showReleaseKPIs();
        this.showMonthly();
        this.showQuarterly();
      } else {
        console.warn('LoadData: No KPI metrics returned from API');
        this.isLoading = false;
      }
      
      const endTime = performance.now();
    }, (err: any) => { 
      console.error('LoadData: Error loading KPI metrics', err);
      this._util.serviceError(err);
      this.isLoading = false;
    });
  }

  loadAdditionalData(metricsDetail: any) {
    this.addDatas = false;
    const additionalDataStartTime = performance.now();
    
    this._appservice.getKpiMetricsAdditionalData(metricsDetail).subscribe({
      next: (data: any) => {
        this.additionalData = data;
        
        this.metricsDetail.forEach((d: any) => {
          let addData = this.additionalData.filter((x: any) => x.guid == d.guid)[0];
          if (addData != null && addData != undefined) {
            d.baseMeasureDataList = addData.baseMeasureDataList;
            d.exclusionBaseMeasureDataList = addData.exclusionBaseMeasureDataList;
            d.capaStage = addData.capaStage;
            d.iS_EXCLUSION = addData.iS_EXCLUSION;
            d.exclusioN_COMMENT = addData.exclusioN_COMMENT;
          }
          d.isClicked = false;
          d.isediting = true;
        });
        this.addDatas = true;
        
        const additionalDataEndTime = performance.now();
        
        // Turn off loading after all data is loaded and merged
        this.isLoading = false;
      },
      error: (err: any) => { 
        console.error('loadAdditionalData: Error loading additional data', err);
        this._util.serviceError(err);
        this.isLoading = false; // Turn off loading on error
      },
      complete: () => {
        if (this.kpiId != null && this.kpiId != undefined && this.kpiId != 0) {
          this.ViewCAPA(this.kpiId);
        } else {
        }
      }
    });
  }
  // TODO: AddKpiDetailsbyProduct service method needs to be implemented
  SaveDetails(kpiDetails: any, status: any): any {
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');

    if (kpiDetails.length == 0) {
      this._util.showWarningPopup('No data to Save. Please Refresh and Try Again', 'No Data');
      return false;
    }

    let metrics = kpiDetails.filter((x: any) => (x.kpI_ACTUAL == null || x.kpI_ACTUAL == '') && !x.iS_NOT_APPLICABLE);
    if (metrics.length == this.metricsDetail.length) {
      this._util.showWarningPopup('Please fill KPI Achievements for the Metrics to Save.', 'Validation Error');
      return false;
    }

    const dialogRef = this._util.showWarningConfirmation(
      'Entered Service Level Metrics would be Saved As Draft and Would not be considered in Dashboard.',
      'Save As Draft'
    );
    
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.isLoading = true;
        this._appservice.AddKpiDetailsbyProduct(kpiDetails, d.toString(), status).subscribe((data: any) => {
        this._util.showSuccessPopup("Data Saved Successfully", "Success");
        this.freez = false;
        this.LoadData();
        this.isLoading = false;
      }, (err: any) => {
        this._util.serviceError(err);
        this.freez = false;
        this.LoadData();
        this.isLoading = false;
      })
      }
    });
    return true;
  }
  // TODO: AddKpiDetailsbyProduct service method needs to be implemented
  SubmitDetails(kpiDetails: any, status: any): any {
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');

    if (kpiDetails.length == 0) {
      this._util.showWarningPopup('No data to Submit. Please Refresh and Try Again', 'No Data');
      return false;
    }


    let actualNotMet = kpiDetails.filter((x: any) => x.kpI_ACTUAL != null && this.checkIfCAPARequired(x));
    if (actualNotMet.length > 0) {
      for (var i = 0; i < actualNotMet.length; i++) {
        if (actualNotMet[i].capaStage.capA_SUBMISSION != null &&
          actualNotMet[i].capaStage.capA_SUBMISSION.capa != null &&
          actualNotMet[i].capaStage.capA_SUBMISSION.capa.length == 0 && this.checkIfCAPARequired(actualNotMet[i])) {
          kpiDetails.filter((x: any) => x.kpI_ID == actualNotMet[i].kpI_ID)[0].iS_NOT_FILLED = true;
        }
      }
    }

    let metrics = kpiDetails.filter((x: any) => (x.kpI_ACTUAL == null || x.kpI_ACTUAL == '') && !x.iS_NOT_APPLICABLE);

    if (metrics.length > 0) {

      for (let i = 0; i < metrics.length; i++) {
        kpiDetails.filter((x: any) => x.kpI_ID == metrics[i].kpI_ID)[0].iS_NOT_FILLED = true;
      }

      this.dataSource = new MatTableDataSource(kpiDetails.filter((x: any) => x.frequency == 'Monthly'));
      this.dataSource1 = new MatTableDataSource(kpiDetails.filter((x: any) => x.frequency == 'Quarterly'));
      this.dataSource2 = new MatTableDataSource(kpiDetails.filter((x: any) => x.frequency == 'Release'));

      // Reconnect paginator after updating dataSource
      setTimeout(() => {
        if (this.paginator && this.dataSource) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort && this.dataSource) {
          this.dataSource.sort = this.sort;
        }
      }, 0);

      this._util.showWarningPopup('Please fill KPI Achievements for all the Metrics marked in Red to Submit.', 'Validation Error');
      return false;
    }

    const dialogRef = this._util.showWarningConfirmation(
      `Service Level Metrics for ${this.productName} for ${this._util.tableMonth} ${this._util.tableYear} would be Submitted.`,
      'Submit KPI'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.freez = true;
        this.isLoading = true;
        this._appservice.AddKpiDetailsbyProduct(kpiDetails, d.toString(), status).subscribe((data: any) => {
          this._util.showSuccessPopup("Data Submitted Successfully", "Success");
          this.freez = true;
          this.LoadData();
          this.isLoading = false;
        }, (err: any) => {
          this._util.serviceError(err);
          this.freez = false;
          this.LoadData();
          this.isLoading = false;
        });
      }
    });
    return true;
  }

  // TODO: getKpiMetrics service method needs to be implemented
  Refresh() {
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    this.isLoading = true;
    this._appservice.getKpiMetrics(this.prodId, this.selectedMode, d.toString(), true).subscribe((data: any) => {
      this.metricsDetail = data;
      this.loadAdditionalData(this.metricsDetail);
      
      let isSubmitted = this.metricsDetail.filter((x: any) => x.kpI_ACTUAL != null && x.iS_DRAFT == 0);
      if (isSubmitted.length == this.metricsDetail.length) {
        this.freez = true;
      } else {
        this.freez = false;
      }
      
      // Show different frequency tables
      this.showReleaseKPIs();
      this.showMonthly();
      this.showQuarterly();
      
      this.isLoading = false;
    }, (err: any) => {
      console.error('Refresh: Error loading KPI data', err);
      this._util.serviceError(err);
      this.isLoading = false;
    });
  }

  getpenaltyApplicable(kpiId: any): string {
    let serviceLevel
    if (kpiId != undefined || kpiId != null) {
      serviceLevel = this.metricsDetail.filter((x: any) => x.kpI_ID == kpiId)[0].servicE_LEVEL;
      if (serviceLevel == 'Key Measurement')
        return 'NA'
      else
        return '$'
    }
    return 'NA';
  }
  getmeasurementforServiceLevel(kpiId: any): any {
    let uom; let expectedLvl;
    if (this.metricsDetail.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.metricsDetail.filter((x: any) => x.kpI_ID == kpiId)[0]!.uniT_OF_MEASUREMENT;
        expectedLvl = this.metricsDetail.filter((x: any) => x.kpI_ID == kpiId)[0]!.expecteD_SERVICE_LEVEL;

        if (uom == '%')
          return expectedLvl + uom;
        else
          return expectedLvl;
      }
    }
    return null;
  }
  getmeasurementforMinServiceLevel(kpiId: any): any {
    let uom; let expectedLvl;
    if (this.metricsDetail.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.metricsDetail.filter((x: any) => x.kpI_ID == kpiId)[0]!.uniT_OF_MEASUREMENT;
        expectedLvl = this.metricsDetail.filter((x: any) => x.kpI_ID == kpiId)[0]!.minimuM_SERVICE_LEVEL;

        if (uom == '%')
          return expectedLvl + uom;
        else
          return expectedLvl;
      }
    }
    return null;

  }
  
  showReleaseKPIs() {
    if (this.metricsDetail != undefined && this.metricsDetail.length > 0) {
      this.releaseMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Release');
      this.showRelease = this.releaseMetrics.length > 0;
      this.dataSource2 = new MatTableDataSource(this.showRelease ? this.releaseMetrics : [] as any[]);
    } else {
      this.showRelease = false;
      this.dataSource2 = new MatTableDataSource([] as any[]);
    }
  }
  
  showMonthly() {
    if (this.metricsDetail != undefined && this.metricsDetail.length > 0) {
      this.monthlyMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Monthly');
      this.showMonth = this.monthlyMetrics.length > 0;
      
      // Direct assignment without setTimeout for better performance
      this.dataSource = new MatTableDataSource(this.monthlyMetrics);
      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort) this.dataSource.sort = this.sort;
    } else {
      this.showMonth = false;
      this.dataSource = new MatTableDataSource([] as any[]);
    }
  }
  
  showQuarterly() {
    if (this.metricsDetail != undefined && this.metricsDetail.length > 0) {
      this.quarterlyMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Quarterly');
      this.showQuarter = this.quarterlyMetrics.length > 0;
      this.dataSource1 = new MatTableDataSource(this.showQuarter ? this.quarterlyMetrics : [] as any[]);
    } else {
      this.showQuarter = false;
      this.dataSource1 = new MatTableDataSource([] as any[]);
    }
  }

  getKpiActual(metricslist: any): any {
    if (this.includeExclusions)
      return metricslist.kpI_ACTUAL;
    else return metricslist.exclusioN_KPI_ACTUAL;
  }

  getslaStatusforKPI(kpiDetail: any): string {
    let status = this._util.GetSLAStatus(kpiDetail, this.includeExclusions);
    return status;
  }

  blurcalled(kpiId: any, actualEntered: any): any {

    if (this.metricsDetail.length > 0) {
      let uom = this.metricsDetail.filter((x: any) => x.kpI_ID == kpiId)[0].uniT_OF_MEASUREMENT;

      if (actualEntered == undefined || actualEntered == null || actualEntered == '') {
        return;
      }
      else {
        if (this.metricsDetail.filter((x: any) => x.kpI_ID == kpiId)[0].hidE_UOM)
          return '';
        else
          return uom;
      }
    }
    return null;
  }
  getperiod(frequency: any): string {
    let m = this._util.getMonthNum(this._util.tableMonth);

    if (m == 3 || m == 4 || m == 5)
      return 'Q1 -' + this._util.tableYear
    else if (m == 6 || m == 7 || m == 8)
      return 'Q2 -' + this._util.tableYear
    else if (m == 9 || m == 10 || m == 11)
      return 'Q3 -' + this._util.tableYear
    else if (m == 0 || m == 1 || m == 2)
      return 'Q4 -' + (this._util.tableYear - 1)
    return '';
  }
  LoadServiceModes() {
    this.isLoading = true;
    this._appservice.getAllServiceMode(this.prodId).subscribe(
      (data: any) => {
        this.serviceModes = data;
        
        if (data != null && data.length > 0) {
          // If modeId is provided, try to find that specific mode
          if (this.modeId != null && this.modeId != undefined && this.modeId != 0) {
            const selectedMode = this.serviceModes.find((x: any) => x.id == this.modeId);
            if (selectedMode) {
              this.selectedMode = selectedMode.id;
              this.selectedModeTitle = selectedMode.modE_TITLE;
            } else {
              console.warn('LoadServiceModes: Mode with id', this.modeId, 'not found, falling back to first mode');
              // Fall back to first mode if requested mode not found
              const firstMode = this.serviceModes[0];
              if (firstMode) {
                this.selectedMode = firstMode.id;
                this.selectedModeTitle = firstMode.modE_TITLE;
              }
            }
          }
          else {
            // No modeId provided, select first mode
            const firstMode = this.serviceModes[0];
            if (firstMode) {
              this.selectedMode = firstMode.id;
              this.selectedModeTitle = firstMode.modE_TITLE;
            } else {
              console.error('LoadServiceModes: serviceModes[0] is undefined!');
            }
          }
        } else {
          console.warn('LoadServiceModes: No service modes available - data is', data);
        }
        
        // Only call LoadData if we have a valid selectedMode
        if (this.selectedMode) {
          this.LoadData();
        } else {
          console.error('LoadServiceModes: Cannot load data - no valid mode selected');
          this.isLoading = false;
          this._util.showWarningPopup('No service modes are available for this product. Please configure service modes first or contact support.', 'No Service Modes');
        }
      }, (err: any) => { 
        console.error('LoadServiceModes: Error loading service modes', err);
        this._util.serviceError(err);
        this.isLoading = false;
      }
    )
  }
  viewBaseMeasures(id: any) {
    
    // Find the KPI detail using type coercion
    const kpiDetail = this.metricsDetail.find((x: any) => x.kpI_ID == id);
    
    if (!kpiDetail) {
      console.error('viewBaseMeasures: KPI not found for ID:', id);
      this._util.showWarningPopup('KPI details not found. Please refresh and try again.', 'KPI Not Found');
      return;
    }
    
    // Extract data from the KPI detail
    const baseMeasures = kpiDetail.baseMeasureDataList || [];
    const baseMeasuresEx = kpiDetail.exclusionBaseMeasureDataList || [];
    const isExclusion = kpiDetail.iS_EXCLUSION;
    const exclusionComment = kpiDetail.exclusioN_COMMENT;
    const isNA = kpiDetail.iS_NOT_APPLICABLE;
    const remarks = kpiDetail.remarks;
    const kpiActual = kpiDetail.kpI_ACTUAL;
    const isDraft = kpiDetail.iS_DRAFT;
    const isExNoData = kpiDetail.iS_EX_NO_DATA;
    const exRemarks = kpiDetail.exremarks;
    const detailId = kpiDetail.detaiL_ID;
    const baseMeasureValId = kpiDetail.basemeasurE_VAL_ID;
    
    
    // Open the dialog component
    const dialogConfig = {
      autoFocus: true,
      width: "1000px",
      maxWidth: "95vw",
      height: "auto",
      maxHeight: "90vh",
      panelClass: 'kpi-base-measure-dialog',
      data: {
        kpiId: id,
        baseMeasureData: baseMeasures,
        remarks: remarks,
        isNA: isNA,
        isDraft: isDraft,
        isNoData: isExNoData,
        exRemarks: exRemarks,
        exclusionBaseMeasureData: baseMeasuresEx,
        isExclusion: isExclusion,
        exclusionComment: exclusionComment,
        month: this._util.tableMonth,
        year: this._util.tableYear,
        kpiDetailId: detailId,
        baseMeasureValId: baseMeasureValId,
        custId: this.custId,
        productName: this.productName,
        enableExclusion: this.enableExclusion,
        isKPIProcessEnabledCustomer: true
      }
    };
    
    const dialogRef = this.dialog.open(KpiProductDetailViewComponent, dialogConfig);
    
    dialogRef.afterClosed().subscribe((result: any) => {
      
      if (result != undefined && result.data != undefined && result.data != null && result.data != '' && (result.data.kpI_ACTUAL != undefined || result.data.kpI_ACTUAL != null)) {
        
        // Update metricsDetail array directly (legacy approach)
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].kpI_ACTUAL = result.data.kpI_ACTUAL;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].slA_STATUS = result.data.slA_STATUS;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].secondarY_SLA_STATUS = result.data.secondarY_SLA_STATUS;
        
        // CRITICAL FIX: When iS_EXCLUSION is false, populate exclusioN_KPI_ACTUAL with kpI_ACTUAL
        // This ensures the field displays correctly when includeExclusions template flag is true
        if (!result.data.iS_EXCLUSION && (result.data.exclusioN_KPI_ACTUAL == null || result.data.exclusioN_KPI_ACTUAL == undefined)) {
          this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exclusioN_KPI_ACTUAL = result.data.kpI_ACTUAL;
        } else {
          this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exclusioN_KPI_ACTUAL = result.data.exclusioN_KPI_ACTUAL;
        }
        
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exclusioN_SLA_STATUS = result.data.iS_EX_NO_DATA ? 'NA' : result.data.exclusioN_SLA_STATUS;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exclusioN_SECONDARY_SLA_STATUS = result.data.iS_EX_NO_DATA ? 'NA' : result.data.exclusioN_SECONDARY_SLA_STATUS;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].remarks = result.data.remarks || null;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_NOT_APPLICABLE = result.data.iS_NOT_APPLICABLE || 0;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].capaStage = result.data[0] ? null : this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].capaStage;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_EX_NO_DATA = result.data.iS_EX_NO_DATA;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exremarks = result.data.exremarks;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_EXCLUSION = result.data.iS_EXCLUSION;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exclusioN_COMMENT = result.data.exclusioN_COMMENT;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].baseMeasureDataList = result.data.kpiData || this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].baseMeasureDataList;
        
        if (result.data.kpI_ACTUAL != null && result.data.kpI_ACTUAL != "") {
          this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_NOT_FILLED = false;
        } else {
          this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_NOT_FILLED = true;
        }
        
        
        // Re-filter arrays and update data sources with new object references for change detection
        this.monthlyMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Monthly').map((item: any) => ({...item}));
        this.releaseMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Release').map((item: any) => ({...item}));
        this.quarterlyMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Quarterly').map((item: any) => ({...item}));
        
        // Update MatTableDataSource with new data
        if (this.showMonth && this.dataSource) {
          this.dataSource.data = [...this.monthlyMetrics];
        }
        if (this.showRelease && this.dataSource2) {
          this.dataSource2.data = [...this.releaseMetrics];
        }
        if (this.showQuarter && this.dataSource1) {
          this.dataSource1.data = [...this.quarterlyMetrics];
        }
        
        // Force change detection to update the UI immediately
        this.cdr.detectChanges();
        
        // Additional force refresh - mark for check to ensure all bindings update
        this.cdr.markForCheck();
        
      }
      else if ((result.data == '' || result.data == undefined) && (kpiDetail.kpI_ACTUAL == '' || kpiDetail.kpI_ACTUAL == null)) {
        let baseData = this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].baseMeasureDataList;
        if (baseData.length > 0) {
          for (let b of baseData) {
            if (b.numerator == '' || b.numerator == null) {
              this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].kpI_ACTUAL = '';
              this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exclusioN_KPI_ACTUAL = '';
            }
          }
        }
        // Update data sources with new object references
        this.monthlyMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Monthly').map((item: any) => ({...item}));
        this.releaseMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Release').map((item: any) => ({...item}));
        this.quarterlyMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Quarterly').map((item: any) => ({...item}));
        if (this.showMonth && this.dataSource) this.dataSource.data = [...this.monthlyMetrics];
        if (this.showRelease && this.dataSource2) this.dataSource2.data = [...this.releaseMetrics];
        if (this.showQuarter && this.dataSource1) this.dataSource1.data = [...this.quarterlyMetrics];
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
      else if (result.data[0] || result.data[3]) {
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].kpI_ACTUAL = '';
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].remarks = result.data[1];
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_NOT_APPLICABLE = result.data[0];
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_EXCLUSION = result.data[4];
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].slA_STATUS = result.data[2];
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].secondarY_SLA_STATUS = result.data[2];
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].capaStage = result.data[0] ? null : this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].capaStage;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_EX_NO_DATA = result.data[5];
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exclusioN_SLA_STATUS = result.data[5] ? 'NA' : this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exclusioN_SLA_STATUS;
        this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].exremarks = result.data[6];
        if (!result.data[3] && !result.data[0] && result.data[3] != 'Not Met' && result.data.kpI_ACTUAL != null || result.data.kpI_ACTUAL != "") {
          this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_NOT_FILLED = false;
        } else {
          if ((result.data[0] || result.data[3]) && result.data[1])
            this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_NOT_FILLED = false;
          else
            this.metricsDetail.filter((x: any) => x.kpI_ID == id)[0].iS_NOT_FILLED = true;
        }
        // Update data sources with new object references
        this.monthlyMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Monthly').map((item: any) => ({...item}));
        this.releaseMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Release').map((item: any) => ({...item}));
        this.quarterlyMetrics = this.metricsDetail.filter((x: any) => x.frequency == 'Quarterly').map((item: any) => ({...item}));
        if (this.showMonth && this.dataSource) this.dataSource.data = [...this.monthlyMetrics];
        if (this.showRelease && this.dataSource2) this.dataSource2.data = [...this.releaseMetrics];
        if (this.showQuarter && this.dataSource1) this.dataSource1.data = [...this.quarterlyMetrics];
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      } else {
      }
    });
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ViewCAPA(id: any) {
    
    if (this.metricsDetail && this.metricsDetail.length > 0) {
    }
    
    // Try to find with type coercion (== instead of ===)
    const kpiDetail = this.metricsDetail.find((x: any) => x.kpI_ID == id);
    
    if (!kpiDetail) {
      console.error('ViewCAPA: KPI not found. Searched for:', id, 'in metricsDetail:', this.metricsDetail);
      
      // Check if data is loaded
      if (!this.metricsDetail || this.metricsDetail.length === 0) {
        console.warn('ViewCAPA: No KPI data loaded yet. Try refreshing the page.');
        this._util.showWarningPopup('KPI data is not loaded yet. Please wait for the page to fully load and try again.', 'Data Not Loaded');
      } else {
        console.warn('ViewCAPA: KPI ID not found in loaded data.');
        this._util.showWarningPopup('KPI details not found for ID: ' + id + '. Please check the KPI list.', 'KPI Not Found');
      }
      return;
    }


    const dialogRef = this.dialog.open(KpiActionPlanComponent, {
      width: '90%',
      maxWidth: '1400px',
      height: '90vh',
      data: {
        editedRow: kpiDetail,
        customerId: this.custId,
        kpI_ID: id,
        selectedPeriod: new Date(this._util.tableYear, this._util.getMonthNum(this._util.tableMonth), 1),
        kpiData: [kpiDetail]
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.data) {
        // Update the CAPA stage data
        const index = this.metricsDetail.findIndex((x: any) => x.kpI_ID == id);
        if (index !== -1) {
          this.metricsDetail[index].capaStage = result.data;
        }
      }
      this.Refresh();
    });
  }

  Filter_onChange($event: any) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;

    this.showMonth = false;
    this.showRelease = false;
    this.showQuarter = false;

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.metricsDetail);
    let monthly = this.filteredData.filter((x: any) => x.frequency == 'Monthly');
    let quarterly = this.filteredData.filter((x: any) => x.frequency == 'Quarterly');
    let release = this.filteredData.filter((x: any) => x.frequency == 'Release');

    if (monthly.length > 0) {
      this.dataSource = new MatTableDataSource(monthly);
      this.showMonth = true;
    }
    if (quarterly.length > 0) {
      this.dataSource1 = new MatTableDataSource(quarterly);
      this.showQuarter = true;
    }
    if (release.length > 0) {
      this.dataSource2 = new MatTableDataSource(release);
      this.showRelease = true;
    }
    
    // Reconnect paginator and sort after updating dataSources
    setTimeout(() => {
      if (this.paginator && this.dataSource) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort && this.dataSource) {
        this.dataSource.sort = this.sort;
      }
    }, 0);
  }
  showAll($event: any) { }

  getProductName(prodId: any) {
    if (prodId == undefined || prodId == null) return;
    this._appservice.getProductName(prodId).subscribe({
      next: (data: any) => {
        this.productName = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    })
  }

  toggleExclusions(val: any) {
    this.includeExclusions = val;
  }

  reloadMonthlyKPITable() {
    this.Refresh();
  }

  checkIfCAPARequired(kpiDetails: any): boolean {
    let isExclusion = kpiDetails.iS_EXCLUSION;
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

}
