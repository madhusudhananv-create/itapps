import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportsService } from '../reports.service';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ReportsSPParamsModel, ReportsSPDetailsModel } from '../../../models/report.model';
import { CustomerProjectsListModel } from '../../../models/customer-projects.model';
import { PremierProductsListModel } from '../../../models/premier-portfolio-products.model';
import { PortfoliosModel } from '../../../models/portfolio.model';
import { ChecklistModel } from '../../../models/checklist.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  displayedColumns: string[] = [];
  FinalTabData: any[] = [];
  AllSps: ReportsSPDetailsModel[] = [];
  selectedSP: ReportsSPDetailsModel = new ReportsSPDetailsModel();
  selectedCustomer!: CustomerProjectsListModel;
  Customers: any[] = [];
  Checklist: ChecklistModel[] = [];
  
  @ViewChild('TABLE') table!: ElementRef;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paginatorTable') paginator!: MatPaginator;
  
  dataSource = new MatTableDataSource(this.FinalTabData);
  datasource: any;
  isdisabled: boolean = false;
  selectedProduct!: PremierProductsListModel;
  products: PremierProductsListModel[] = [];
  selectedPort!: PortfoliosModel;
  portfolio: PortfoliosModel[] = [];
  checklist: ChecklistModel[] = [];
  selectedChecklist!: ChecklistModel;
  filteredCustomerIds: string = '';
  filteredChecklistIds: string = '';
  showNoDataMessage: boolean = false;
  paramData: ReportsSPParamsModel[] = [];
  paramInputs: any;
  dt: any;
  inputTypeNumber: boolean = false;
  inputTypeString: boolean = false;
  inputTypeDate: boolean = false;
  validationSuccessCount: number = 0;
  isValidationSuccess: boolean = false;
  showDisplayButton: boolean = false;
  reportSearchText: string = '';
  customerSearchText: string = '';

  constructor(
    private _util: MyUtility, 
    private _appservice: AppsService
  ) { }

  ngAfterViewInit() {
    this.datasource = new MatTableDataSource(this.FinalTabData);
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  ngOnInit() {
    this._appservice.getCustomerList(localStorage.getItem('empid') || '', false)
      .subscribe({
        next: (data: any[]) => {
          this.filteredCustomerIds = data.map(c => c.cusT_ID).join(',');
          const all = new CustomerProjectsListModel();
          all.cusT_ID = "0";
          all.cusT_NM = "All";
          this.Customers = [all, ...data];
        }
      });

    this._appservice.GetAllProductList().subscribe({
      next: (data: any[]) => {
        const all = new PremierProductsListModel();
        all.id = 0;
        all.producT_TITLE = "All";
        data.unshift(all);
        this.products = data;
      }
    });

    this._appservice.GetPortfolioWithProductList("").subscribe({
      next: (data: any[]) => {
        const allPortfolio: any = {
          id: 0,
          title: "All"
        };
        data.unshift(allPortfolio);
        this.portfolio = data;
      }
    });

    this._appservice.getChecklistList().subscribe({
      next: (data: any[]) => {
        this.filteredChecklistIds = data.map(c => c.id).join(',');
        const allChecklist = new ChecklistModel();
        allChecklist.id = 0;
        allChecklist.title = "All";
        allChecklist.version = 0;
        this.checklist = data;
        this.checklist = this.checklist.sort((a, b) => {
          if (a.title < b.title) { return -1; }
          if (a.title > b.title) { return 1; }
          return 0;
        });
        this.checklist.unshift(allChecklist);
        this.selectedChecklist = allChecklist;
      }
    });

    this.GetData();
  }

  isCustomerIdVisible(): boolean {
    return this.selectedSP != undefined && this.selectedSP.id == 14;
  }

  getFilteredReports(): ReportsSPDetailsModel[] {
    if (!this.reportSearchText || this.reportSearchText.trim() === '') {
      return this.AllSps;
    }
    const searchLower = this.reportSearchText.toLowerCase().trim();
    return this.AllSps.filter(report => 
      report.sP_DISPLAY_NAME?.toLowerCase().includes(searchLower)
    );
  }

  getFilteredCustomers(): CustomerProjectsListModel[] {
    if (!this.customerSearchText || this.customerSearchText.trim() === '') {
      return this.Customers;
    }
    const searchLower = this.customerSearchText.toLowerCase().trim();
    return this.Customers.filter(customer => 
      customer.cusT_NM?.toLowerCase().includes(searchLower)
    );
  }

  GetData() {
    this.service_getdata();
  }

  bindData() {
    if (this.paramData.length == 0) {
      this.service_dispSPResult(this.paramData, this.selectedSP.sP_NAME);
    } else if (this.validateParameters()) {
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
        if (this.selectedChecklist.id == 0) {
          x.paraM_VALUE = this.filteredChecklistIds;
        } else {
          x.paraM_VALUE = this.selectedChecklist.id.toString();
        }
      }
    });

    for (let i = 0; i < this.paramData.length; i++) {
      if (this.paramData[i].paraM_NAME == undefined || this.paramData[i].paraM_VALUE == undefined) {
        isValid = false;
        alert("Please provide valid value for " + this.paramData[i].paraM_NAME.toString());
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
      const getdate = new Date();
      const fileName = `${this.selectedSP.sP_DISPLAY_NAME}_${getdate.toLocaleString()}`;
      this._util.exportToExcel(this.table.nativeElement, fileName);
    } else {
      alert("No records for the selected report");
    }
  }

  service_getdata() {
    this._appservice.getAllSps().subscribe({
      next: (data: any[]) => {
        this.AllSps = data;
      },
      error: (error: any) => { 
        this._util.serviceError(error); 
      }
    });
  }

  service_getAllparamsbyId() {
    this.isdisabled = true;
    this.showDisplayButton = true;
    this.FinalTabData = [];
    this.displayedColumns = [];
    this.updateTable();
    this.showNoDataMessage = false;
    this.inputTypeDate = false;
    this.inputTypeNumber = false;
    this.inputTypeString = false;
    
    if (this.Customers.length > 0) {
      this.selectedCustomer = this.Customers[0];
    }

    this._appservice.getSpParams(this.selectedSP.id).subscribe({
      next: (data: any[]) => {
        this.paramData = data;
        this.paramData.forEach(x => {
          if (x.paraM_TYPE == "CUSTOMERID") {
            x.paraM_VALUE = '';
          }
        });
        this.isdisabled = false;
      },
      error: (error: any) => {
        this.isdisabled = false;
        this._util.serviceError(error);
      }
    });
  }

  service_dispSPResult(paramData: ReportsSPParamsModel[], spname: string) {
    this.FinalTabData = [];
    this.displayedColumns = [];
    this.isdisabled = true;
    this.showNoDataMessage = false;

    this._appservice.displaySpData(paramData, spname).subscribe({
      next: (data: any[]) => {
        this.FinalTabData = data || [];
        if (this.FinalTabData.length > 0) {
          this.displayedColumns = Object.keys(this.FinalTabData[0]);
        } else {
          this.displayedColumns = [];
        }
        this.updateTable();
        this.isdisabled = false;
        this.showNoDataMessage = true;
      },
      error: (error: any) => {
        this.isdisabled = false;
        this.FinalTabData = [];
        this.updateTable();
        this.showNoDataMessage = true;
        this._util.serviceError(error);
      }
    });
  }
}
