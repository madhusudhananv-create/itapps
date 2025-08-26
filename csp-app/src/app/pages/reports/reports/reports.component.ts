import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ReportsService } from '../reports.service';
import { AppsService } from '../../../Services/apps.service';
import { CommonModule } from '@angular/common';
import { myUtility } from '../../../Shared/myUtility';
import { ConsoleListener } from 'sp-pnp-js/lib/pnp';
import { ReportsSPParamsModel, ReportsSPDetailsModel } from '../../../models/report-model';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { isBoolean } from 'util';
import { CustomerProjectsListModel } from '../../../models/customer-projects-model';
import { PremierProductsListModel } from '../../../models/premier-portfolio-products';
import { PortfoliosModel } from '../../../models/portfolio-model';
import { ChecklistModel } from '../../../models/checklist-model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  displayedColumns: string[]; // = ['emP_ID', 'frsT_NM', 'empL_TYPE'];
  FinalTabData: any[] = [];
  AllSps: ReportsSPDetailsModel[] = [];
  selectedSP: ReportsSPDetailsModel = new ReportsSPDetailsModel();
  selectedCustomer: CustomerProjectsListModel;
  Customers: any[] = [];
  Checklist: ChecklistModel[] = [];
  @ViewChild('TABLE') table: ElementRef;
  constructor(private _util: myUtility, private _appservice: AppsService) { }
  dataSource = new MatTableDataSource(this.FinalTabData);
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginatorTable') paginator: MatPaginator;
  isdisabled: boolean = false;
  selectedProduct: PremierProductsListModel;
  products: PremierProductsListModel[] = [];
  selectedPort: PortfoliosModel;
  portfolio: PortfoliosModel[] = [];
  checklist: ChecklistModel[] = [];
  selectedChecklist: ChecklistModel;
  filteredCustomerIds: string = '';
  ngAfterViewInit() {
    this.datasource = new MatTableDataSource(this.FinalTabData);
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  ngOnInit() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false)
      .subscribe
      (
        data => {
          this.filteredCustomerIds = data.map(c => c.cusT_ID).join(',');
          let all = new CustomerProjectsListModel();
          all.cusT_ID = "0";
          all.cusT_NM = "All";
          //data.fill(all, 0, 1);
          this.Customers = [all, ...data];
        });
    this._appservice.GetAllProductList().subscribe(data => {
      let all = new PremierProductsListModel();
      all.id = 0;
      all.producT_TITLE = "All";
      data.unshift(all);
      this.products = data;
    });
    this._appservice.GetPortfolioWithProductList("").subscribe(data => {
      let allPortfolio = new PortfoliosModel();
      allPortfolio.id = 0;
      allPortfolio.title = "All";
      data.unshift(allPortfolio)
      this.portfolio = data;
    });
    this._appservice.getChecklistList().subscribe(data => {
      this.checklist = data;
      this.checklist = this.checklist.sort((a, b) => {
        if (a.title < b.title) { return -1; }
        if (a.title > b.title) { return 1; }
      })
    });
    this.GetData();
  }



  paramData: ReportsSPParamsModel[] = [];
  paramInputs: any[];
  dt: any;
  datasource;

  inputTypeNumber: boolean = false;
  inputTypeString: boolean = false;
  inputTypeDate: boolean = false;
  validationSuccessCount: number = 0;
  isValidationSuccess: boolean = false;
  showDisplayButton: boolean = false;

  isCustomerIdVisible() {

    // if(this.selectedSP != undefined)
    //   alert(   this.selectedSP.id);
    return this.selectedSP != undefined && this.selectedSP.id == 14;
  }

  GetData() {
    this.service_getdata();
  }

  // GetCurrentSpNameById(sid): string {
  //   let currentSP = this.AllSps.find(sp => sp.spid == sid);
  //   return currentSP.procedureName;

  // }

  bindData() {
    if (this.paramData.length == 0)
      this.service_dispSPResult(this.paramData, this.selectedSP.sP_NAME);
    else if (this.validateParameters()) {



      this.service_dispSPResult(this.paramData, this.selectedSP.sP_NAME);
    }
  }
  validateParameters(): Boolean {

    let isValid: boolean = true;
    this.paramData.forEach(x => {
      if (x.paraM_TYPE == "CUSTOMERID" && this.selectedCustomer != undefined && this.selectedCustomer != null) {
        if (this.selectedCustomer.cusT_NM === 'All') {
          x.paraM_VALUE = this.filteredCustomerIds;
        } else {
          x.paraM_VALUE = this.selectedCustomer.cusT_ID.toString();
        }
      }
      else if (x.paraM_TYPE == "PRODUCTID" && this.selectedProduct != undefined && this.selectedProduct != null) {
        x.paraM_VALUE = this.selectedProduct.id.toString();
      }
      else if (x.paraM_TYPE == "PORTFOLIOID" && this.selectedPort != undefined && this.selectedPort != null) {
        x.paraM_VALUE = this.selectedPort.id.toString();
      }
      else if (x.paraM_TYPE == "CHECKLIST" && this.selectedChecklist != undefined && this.selectedChecklist != null) {
        x.paraM_VALUE = this.selectedChecklist.id.toString();
      }
    });
    for (let i = 0; i < this.paramData.length; i++) {

      if (this.paramData[i].paraM_NAME == undefined || this.paramData[i].paraM_VALUE == undefined) {
        isValid = false;
        alert("Please provide valid value for " + this.paramData[i].paraM_NAME.toString())
        break;
      }
    }

    return isValid;
  }

  updateTable() {
    this.dataSource = new MatTableDataSource(this.FinalTabData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ExportTOExcel() {
    if (this.table.nativeElement.textContent != "") {
      let getdate = new Date();
      let fileName = `${this.selectedSP.sP_DISPLAY_NAME}_${getdate.toLocaleString()}`;
      this._util.exportToExcel(this.table.nativeElement, fileName);
    }
    else {
      alert("No records for the selected report");
    }
  }

  service_getdata() {
    this._appservice.getAllSps().subscribe(data => {
      this.AllSps = data;
    },
      error => { this._util.serviceError(error); });
  }
  service_getAllparamsbyId() {
    this.isdisabled = true;
    this.showDisplayButton = true;

    this.inputTypeDate = false;
    this.inputTypeNumber = false;
    this.inputTypeString = false;
    this.selectedCustomer = null;
    this._appservice.getSpParams(this.selectedSP.id).subscribe(data => {

      this.paramData = data;
      this.paramData.forEach(x => {
        if (x.paraM_TYPE == "CUSTOMERID") {
          x.paraM_VALUE = null;
        }
      });
      this.isdisabled = false;
    },
      error => {
        this.isdisabled = false;
        this._util.serviceError(error);
      });
  }
  service_dispSPResult(paramData, spname) {
    this.FinalTabData = [];
    this.displayedColumns = [];
    this.isdisabled = true;
    this._appservice.displaySpData(paramData, spname).subscribe(data => {
     
      this.FinalTabData = data;
      if (this.FinalTabData.length > 0) {
        this.displayedColumns = Object.keys(this.FinalTabData[0]);
        this.updateTable();
      }
      this.isdisabled = false;
    },
      error => {
        this.isdisabled = false;
        this._util.serviceError(error);
      });
  }
}
