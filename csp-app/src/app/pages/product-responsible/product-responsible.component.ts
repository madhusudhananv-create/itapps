import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { AccessControl } from '../../Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';
import { SharedService } from '../../Shared/shared.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { EmpInfoModel } from '../../models/emp-info-model';

@Component({
  selector: 'app-product-responsible',
  templateUrl: './product-responsible.component.html',
  styleUrls: ['./product-responsible.component.scss']
})
export class ProductResponsibleComponent implements OnInit {
  Customer: any[];
  portfolioList: any[];
  custId: any;
  portId: any;
  productId: any;
  productList: any[];
  result: any = [];
  dataSource = new MatTableDataSource(this.result);
  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['index', 'managemenT_TYPE', 'name', 'effectivE_FROM', 'action'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  editmode: boolean = false;
  readonlymode: boolean = true;
  editItem: any = [];
  addItem = new ProductResponsibleModel();
  QAEmployeeList: EmpInfoModel[];
  overallProductsList: any;
  customerEmployeeList: any;
  managementTypes: any;
  customerList: any;
  disableProduct: boolean = false;
  private sub: any;
  projectList: any[];
  allproj: boolean = true;
  isdisabled: boolean = false;
  includePortfolio: boolean = false;

  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @Input('IsBackButtonEnabled') IsBackButtonEnabled: boolean = true;
  constructor(private route: ActivatedRoute, private sharedService: SharedService, private _appservice: AppsService, private _shared: SharedService, private _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, public _access: AccessControl) { }

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
    this.getAllProjectsFromCustomer();
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

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.custId, this.allproj).subscribe(
      data => {
        this.projectList = data;
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

  getProductResponsibleSummary(productId) {
    this.isdisabled = true;
    if (productId != undefined && productId != "" && productId != null) {
      this._appservice.getproductResponsibleDetails(productId).subscribe(data => {
        this.result = data;
        this.RefreshTable(this.result);
        this.isdisabled = false;
      }, error => {
        this.isdisabled = false;
        this._util.serviceError(error);
      });
    }
    else {
      if (this.includePortfolio)
        alert("Please select the Portfolio and Product");
      else
        alert("Please select the Product");

    }
    this.isdisabled = false;
  }

  getAllProductsList() {
    this._appservice.GetProductListByCustId(this.custId).subscribe(data => {
      this.overallProductsList = data;
    }, error => { this._util.serviceError(error); });
  }

  getProductResponsibleManagementType() {
    this._appservice.getProductResponsibleManagementTypeDetails().subscribe(data => {
      this.managementTypes = data;

      // if (this.includePortfolio) {
      //   this.managementTypes = data;
      // }
      // else {
      //   this.managementTypes = data.filter(x => x.id != 6);
      // }
    }, error => { this._util.serviceError(error); });
  }

  getQASpocDetails() {
    this._appservice.GetQASpocDetails().subscribe(data => {
      this.QAEmployeeList = data;
    }, error => { this._util.serviceError(error); });
  }

  getEmployeeDetailsfromCustomer() {
    this._appservice.getEmployeeDetailsfromCustomer(this.custId).subscribe(data => {
      this.customerEmployeeList = data;
    }, error => { this._util.serviceError(error); });
  }

  getCustomerDetails() {
    this._appservice.getCustomerContacts(this.custId, localStorage.getItem('empid')).subscribe(data => {
      this.customerList = data;
      this.customerList.sort(function (a, b) { return a.contacT_NAME.localeCompare(b.contacT_NAME) });
    }, error => { this._util.serviceError(error); });
  }

  managementTypeChange(event: any) {
    this.editItem.name = null;
  }

  RefreshTable(data) {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource<any>(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please choose all the required fields");
      return;
    }
    this.editItem.producT_ID = this.overallProductsList.filter(x => x.producT_TITLE == this.editItem.producT_TITLE)[0].id;
    if (this.editItem.managemenT_TYPE == 'CUSTOMER' || this.editItem.managemenT_TYPE == 'CUSTOMER_CSAT') {
      this.editItem.emP_ID = this.customerList.filter(x => x.contacT_NAME == this.editItem.name)[0].contacT_EMAILID;
    }
    else if (this.editItem.managemenT_TYPE == 'QUALITYSPOC') {
      this.editItem.emP_ID = this.QAEmployeeList.filter(x => x.frsT_NM == this.editItem.name)[0].emP_ID;
    }
    else if (this.editItem.managemenT_TYPE == 'PROJECT') {
      this.editItem.projecT_ID = this.projectList.filter(x => x.proJ_NM == this.editItem.name)[0].proJ_ID;
    }
    else {
      this.editItem.emP_ID = this.customerEmployeeList.filter(x => x.name == this.editItem.name)[0].emP_ID;
    }
    this.editItem.managemenT_TYPE = this.managementTypes.filter(x => x.managemenT_TYPE == this.editItem.managemenT_TYPE)[0].id;
    this.addUpdateProductResponsible(this.editItem);
    if (this.productId != undefined) {
      this.getProductResponsibleSummary(this.productId);
    }
  }

  addUpdateProductResponsible(item) {
    this.addItem = new ProductResponsibleModel();
    if (item.id == undefined || item.id == 0 || item.id == null) {
      this.addItem.producT_ID = item.producT_ID;
      this.addItem.emP_ID = item.emP_ID;
      this.addItem.managemenT_TYPE = item.managemenT_TYPE;
      this.addItem.projecT_ID = item.projecT_ID;
    }
    else {
      this.addItem = item;
    }
    this.isdisabled = true;
    this._appservice.AddUpdateProductResponsible(this.addItem).subscribe(data => {
      alert("Data Saved Successfully");
      if (this.productId != undefined) {
        this.getProductResponsibleSummary(this.productId);
      }
      this.readonlymode = true;
      this.editmode = false;
      this.isdisabled = false;
      this.neweditItem();
    },
      (error) => {
        this.isdisabled = false;
        this._util.serviceError(error);
      })
  }

  Edit_onClick(flag: any = 0) {
    this.editmode = true;
    this.readonlymode = false;
    if (flag == 1) {
      this.disableProduct = true;
    }
    else {
      this.disableProduct = false;
    }
    this.getAllProductsList();
    this.getQASpocDetails();
    this.getProductResponsibleManagementType();
    this.getEmployeeDetailsfromCustomer();
    this.getCustomerDetails();
    this.RefreshTable(this.result);
  }

  EditRow_onClick(element) {
    this.editItem = Object.assign({}, element);
    this.Edit_onClick(1);
  }

  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.DeleteProductResponsible(element).subscribe(data => { }, error => { this._util.serviceError(error); },
        () => {
          alert("Deleted Successfully");
          this.getProductResponsibleSummary(this.productId);
        });
    }
    else {

    }
  }

  neweditItem() {
    this.editItem = new ProductResponsibleModel();
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.neweditItem();
    this.RefreshTable(this.result);
  }

}

export class ProductResponsibleModel {
  id: number;
  producT_ID: number;
  emP_ID: string;
  managemenT_TYPE: number;
  projecT_ID: string;
  createD_BY: String;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}
