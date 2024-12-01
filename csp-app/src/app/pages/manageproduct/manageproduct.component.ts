import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Input } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { Router, RoutesRecognized } from '@angular/router';
import { SharedService } from '../../Shared/shared.service';
import { MatPaginator, MatTableDataSource, MatSort, MatTableModule, MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';
import { AccessControl } from '../../Shared/accessControl';
import { ActivatedRoute } from '@angular/router';




@Component({
  selector: 'app-manageproduct',
  templateUrl: './manageproduct.component.html',
  styleUrls: ['./manageproduct.component.scss']
})
export class ManageproductComponent implements OnInit {


  constructor(private datePipe: DatePipe, public _util: myUtility, public sharedService: SharedService, public _appService: AppsService, public route: ActivatedRoute, public dialog: MatDialog, public _access: AccessControl) { }
  Customer: any[] = [];
  portfolioList: any[];
  portId: any;
  productId: any;
  productlist: any[];
  modeList: any[];
  serviceAreaTypes: any[];
  productTier: any[];
  readmode: boolean = true;
  editmode: boolean = false;
  editItem: any = [];
  filterCriteria: any;
  filteredData: any;
  portfolioid: any;
  includePortfolio: boolean = false;
  private sub: any;
  dataSource: MatTableDataSource<any>;
  @ViewChild("TABLE") table: ElementRef;
  displayedColumns = [
    "sno",
    "productnm",
    "servicearea",
    "modetitle",
    "tier",
    "servicecommence",
    "servicecommencedate",
    "edit",
    "delete"
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    //this.dataSource.sort = sort;
  }

  @Input('custId') custId: string;
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.custId = params['custid'];
    });

    let portfolioCustomers = "";
    this._appService.GetDBConfigValueFields("PORTFOLIO_ENABLED_CUSTOMERS", -1, "").subscribe(data => {
      portfolioCustomers = data;
      if (portfolioCustomers.includes(this.custId)) {
        this.includePortfolio = true;
      }
      this.getPortfolioDetails(this.custId);
    });

    this.getCustomerDetailsSummary(this.custId);
    this.getProductDropdownDetails();
  }



  getProductDropdownDetails() {
    this._appService.GetInitialDataForCRUDProduct().subscribe(
      data => {
        this.productTier = data['productTier'];
        this.modeList = data['productModes'];
        this.serviceAreaTypes = data['serviceAreas'];

      },
      error => {
        this._util.serviceError(error);
      }
    )
  }
  getCustomerDetailsSummary(custId) {
    this._appService.GetCustomerDetails(custId).subscribe(
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
      this._appService.GetPortfolioWithProductList(custId).subscribe(data => {
        this.portfolioList = data;
      }, error => { this._util.serviceError(error); })
    }
    else {
      this.getProductPortfolioMapping(99);
    }
  }

  getProductPortfolioMapping(portId) {
    this.portfolioid = portId;
    this._appService.GetProductDetails(this.custId, portId).subscribe(
      data => {
        this.productlist = data;
        this.dataSource = new MatTableDataSource(this.productlist);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error => {
        this._util.serviceError(error);
      })
  }

  Edit_onClick() {
    let editItem: any = {
      cust_Id: this.custId,
      producT_TITLE: '',
      portfoliO_ID: 99,
      servicE_COMMENCEMENT_DATE: null
    }
    this.EditRow_onClick(editItem);
  }
  EditRow_onClick(item) {
    this.editItem = item;
    this.readmode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.editmode = false;
    this.readmode = true;
    this.dataSource = new MatTableDataSource(this.productlist);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.RefreshTable();
  }

  Filter_onChange($event) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.productlist);
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  onSaveButtonClick() {
    if ((this.includePortfolio) && this.editItem.portfoliO_ID == null || this.editItem.portfoliO_ID == undefined) {
      alert("Please select a portfolio");
      return;
    }
    if (this.editItem.producT_TITLE.trim() == '' || this.editItem.portfoliO_ID == undefined) {
      alert("Please enter product title");
      return;
    }
    if (this.editItem.servicE_AREA_TYPE_ID == null || this.editItem.servicE_AREA_TYPE_ID == undefined) {
      alert("Please select service area");
      return;
    }
    if (this.editItem.modE_ID == null || this.editItem.modE_ID == undefined) {
      alert("Please select product mode");
      return;
    }
    if (this.editItem.tieR_ID == null || this.editItem.tieR_ID == undefined) {
      alert("Please select product tier");
      return;
    }
    if (this.editItem.iS_SERVICE_COMMENCED == null || this.editItem.iS_SERVICE_COMMENCED == undefined) {
      alert("Please select yes or no for service commenced");
      return;
    }

    this.UpdateProduct(this.editItem)
  }
  UpdateProduct(item) {
    this._appService.AddUpdateProduct(item).subscribe(
      (data) => {
        alert("Data Saved Successfully");
        this.readmode = true;
        this.editmode = false;
        this.RefreshTable();
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  DeleteProduct(item) {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appService.DeleteProduct(item).subscribe(
        (data) => {
          alert("Product deleted Successfully");
          this.readmode = true;
          this.editmode = false;
          this.RefreshTable();
        },
        (error) => {
          this._util.serviceError(error);
        }
      );
    }
  }

  RefreshTable() {
    let portfolio = 99;
    this.includePortfolio ? portfolio = this.portfolioid : portfolio = 99;
    this.sharedService.callMethod();
    this._appService.GetProductDetails(this.custId, portfolio).subscribe(
      data => {
        this.productlist = data;
        this.dataSource = new MatTableDataSource(this.productlist);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  showAll($event) { }
}
