import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { AccessControl } from '../../Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';
import { SharedService } from '../../Shared/shared.service';
import { MatDialog, MatDialogConfig, MatPaginator, MatSort, MatStepper, MatTableDataSource } from '@angular/material';
import { GlobalKpiCategoryModel } from '../../models/global-kpi-category-model';
import { ServiceTowersProjectMappingModel } from '../../models/service-area-project-mapping-model';
import { MasterKpiComponent } from '../master-kpi/master-kpi.component';

@Component({
  selector: 'app-manage-kpi-metrics',
  templateUrl: './manage-kpi-metrics.component.html',
  styleUrls: ['./manage-kpi-metrics.component.scss']
})

export class ManageKpiMetricsComponent implements OnInit {
  private sub: any;
  Customer: any[];
  allproj: boolean = true;
  portfolioList: any[];
  isdisabled: boolean = false;
  showTable: boolean = false;
  result: any[];
  productList: any[];
  portId: any;
  productId: any;
  serviceModes: any;
  selectedMode: any;
  selectedModetitle: any;
  serviceLevel: any;
  selectedLevel: any;
  tierId: any;
  kpiDefinitions: any[] = [];
  includePortfolio: boolean = false;
  dataSource = new MatTableDataSource(this.kpiDefinitions);
  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['reference', 'kpiname', 'description', 'serviceArea', 'serviceType', 'sla', 'frequency', 'expectedLevel', 'minLevel', 'action'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  serviceArea: any;
  GlobalCategories: GlobalKpiCategoryModel[] = [];
  reference: any;
  serviceAreaProjectMappingList: ServiceTowersProjectMappingModel[] = [];
  @Input('custId') custId: string;

  constructor(private route: ActivatedRoute, private sharedService: SharedService, private _appservice: AppsService, private _shared: SharedService, private _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, private _access: AccessControl,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.custId = params['custid'];
    });

    let portfolioCustomers = "";
    this._appservice.GetDBConfigValueFields("PORTFOLIO_ENABLED_CUSTOMERS", -1, "").subscribe(data => {
      portfolioCustomers = data;
      if (portfolioCustomers.includes(this.custId)) {
        this.includePortfolio = true;
      }     
      this.getPortfolioDetails(this.custId);
    });

    this.sharedService.methodCalled$.subscribe(() => {
      this.getProductPortfolioMapping(0);
    });
    this.getCustomerDetailsSummary(this.custId);
  }

  LoadProductData(productId) {
    if (productId != undefined && productId != "" && productId != null) {
      this.loadProductModes(productId);
      this.loadServiceArea();
      this.service_GetGlobalKpiCategories();
      this.loadReference();
    }
    else {
      if (this.includePortfolio)
        alert("Please select the Portfolio and Product");
      else
        alert("Please select the Product");
    }
  }

  getCustomerDetailsSummary(custId) {
    this._appservice.GetCustomerDetails(custId).subscribe(
      data => {
        this.Customer = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getPortfolioDetails(custId) {
    if (this.includePortfolio) {
      this._appservice.GetPortfolioWithProductList(custId).subscribe(data => {
        this.portfolioList = data;
      }, error => { this._util.serviceError(error); })
    }
    else {
      this._appservice.GetProductList(custId, 0).subscribe(data => {
        this.productList = data;
      }, error => { this._util.serviceError(error); });
    }
  }

  getProductPortfolioMapping(portId) {
    this._appservice.GetProductList(this.custId, portId).subscribe(data => {
      this.productList = data;
    }, error => { this._util.serviceError(error); });
  }

  loadProductModes(prodId) {
    this.isdisabled = true;
    this._appservice.getAllServiceMode(prodId).subscribe(data => {
      this.serviceModes = data;
      if (data.length > 0) {
        this.selectedMode = this.serviceModes.filter(x => x.modE_TITLE)[0].id;
        this.selectedModetitle = this.serviceModes.filter(x => x.modE_TITLE)[0].modE_TITLE;
      }
      this.loadServiceLevel();
      this.isdisabled = false;
    }, (err) => {
      this.isdisabled = false;
      this._util.serviceError(err)
    })
  }

  loadServiceArea() {
    this._appservice.getProductServiceArea().subscribe(data => {
      this.serviceArea = data;
    }, (err) => { this._util.serviceError(err) })
  }

  loadReference() {
    this._appservice.getServiceReference().subscribe(data => {
      this.reference = data;
    }, (err) => { this._util.serviceError(err) })
  }

  service_GetGlobalKpiCategories() {
    this._appservice.GetGlobalKpiCategories().subscribe(data => {
      this.GlobalCategories = data;
    }, error => { this._util.serviceError(error); });
  }

  loadServiceLevel() {
    this.isdisabled = true;
    this._appservice.getServiceLevel().subscribe(data => {
      this.serviceLevel = data;
      if (data.length > 0) {
        this.selectedLevel = this.serviceLevel.filter(x => x.servicE_LEVEL)[0].id;
        this.ddlevel_Onchange(this.selectedLevel);
      }
      this.isdisabled = false;
    }, (err) => {
      this.isdisabled = false;
      this._util.serviceError(err)
    })
  }

  ddlevel_Onchange(lvlid) {
    this.isdisabled = true;
    if (this.selectedMode != undefined) {
      this._appservice.getAllKpiByModeId(this.selectedMode, lvlid, this.productId).subscribe(data => {
        this.kpiDefinitions = data;
        if (this.kpiDefinitions.length > 0) {
          this.tierId = this.kpiDefinitions.filter(x => x.tier)[0].tier;
          this.showTable = true;
        }
        else {
          this.showTable = false;
        }
        this.RefreshTable(this.kpiDefinitions);
        this.isdisabled = false;
      }, (err) => {
        this.isdisabled = false;
        this._util.serviceError(err)
      })
    }
  }

  getmeasurementforServiceLevel(kpiId) {
    let uom; let expectedLvl;
    if (this.kpiDefinitions.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.kpiDefinitions.filter(x => x.kpI_ID == kpiId)[0]!.uniT_OF_MEASUREMENT;
        expectedLvl = this.kpiDefinitions.filter(x => x.kpI_ID == kpiId)[0]!.expecteD_SERVICE_LEVEL;
        if (uom == '%')
          return expectedLvl + '%'
        else if (uom == 'Number')
          return expectedLvl + ' per product'
        else
          return expectedLvl
      }
    }
  }

  getmeasurementforMinServiceLevel(kpiId) {
    let uom; let expectedLvl;
    if (this.kpiDefinitions.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.kpiDefinitions.filter(x => x.kpI_ID == kpiId)[0]!.uniT_OF_MEASUREMENT;
        expectedLvl = this.kpiDefinitions.filter(x => x.kpI_ID == kpiId)[0]!.minimuM_SERVICE_LEVEL;
        if (uom == '%')
          return expectedLvl + '%'
        else if (uom == 'Number')
          return expectedLvl + ' per product'
        else
          return expectedLvl
      }
    }
  }

  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteKpiForProduct(element.kpI_ID).subscribe(data => {
        alert("Deleted Successfully");
        this.LoadProductData(this.productId);
      }, error => { this._util.serviceError(error); });
    }
    else {

    }
  }

  addKPI() {
    if (this.productId != undefined && this.productId != "" && this.productId != null) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = true;
      dialogConfig.width = "90%";
      dialogConfig.height = "90%";
      dialogConfig.data = {
        customerId: this.custId,
        productId: this.productId,
        modeId: this.selectedMode
      }
      const dialogRef = this.dialog.open(MasterKpiComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        this.LoadProductData(this.productId);
      })
    }
    else {
      if (this.includePortfolio)
        alert("Please select the Portfolio and Product");
      else
        alert("Please select the Product");
    }
  }

  RefreshTable(data) {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource<any>(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }


}
