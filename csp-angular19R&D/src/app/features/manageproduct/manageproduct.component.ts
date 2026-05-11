/**
 * ManageproductComponent - Manage Products for KPI
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - View products in a paginated, sortable table
 * - Add new products
 * - Edit existing products
 * - Delete products
 * - Filter by customer and portfolio (if portfolio enabled)
 * - Table filtering with custom filter component
 * - Product configuration with:
 *   - Product/Portfolio title
 *   - Service area type
 *   - Mode (product mode)
 *   - Tier (product tier with MTTR)
 *   - Service commencement flag and date
 * - Access control for edit/delete operations
 * 
 * Migration Notes:
 * - Converted to standalone component
 * - Used inject() pattern for dependency injection
 * - All logic preserved exactly from legacy
 * - All method names unchanged
 * - All styling preserved
 * - Added appearance="outline" to mat-form-fields
 */

import { Component, ElementRef, OnInit, ViewChild, inject, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Material Imports
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';

// Services and Utilities
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControl } from '../../shared/access-control';

// Components
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter.component';

@Component({
  selector: 'app-manageproduct',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    TableFilterComponent
  ],
  providers: [DatePipe, provideNativeDateAdapter()],
  templateUrl: './manageproduct.component.html',
  styleUrl: './manageproduct.component.scss'
})
export class ManageproductComponent implements OnInit {
  // Dependency Injection
  private datePipe = inject(DatePipe);
  public _util = inject(MyUtility);
  public sharedService = inject(SharedService);
  public _appService = inject(AppsService);
  public route = inject(ActivatedRoute);
  public dialog = inject(MatDialog);
  public _access = inject(AccessControl);

  // ViewChild references
  @ViewChild("TABLE") table!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    // This setter is preserved from legacy for compatibility
  }

  // Input property
  @Input('custId') custId: string = '';

  // Component Properties
  Customer: any[] = [];
  portfolioList: any[] = [];
  portId: any;
  productId: any;
  productlist: any[] = [];
  modeList: any[] = [];
  serviceAreaTypes: any[] = [];
  productTier: any[] = [];
  readmode: boolean = true;
  editmode: boolean = false;
  editItem: any = [];
  filterCriteria: any;
  filteredData: any;
  portfolioid: any;
  includePortfolio: boolean = false;
  private sub: any;
  dataSource!: MatTableDataSource<any>;
  
  displayedColumns: string[] = [
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

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.custId = params['custid'];
    });

    let portfolioCustomers: string = "";
    this._appService.GetDBConfigValue("PORTFOLIO_ENABLED_CUSTOMERS", -1, "").subscribe((data: any) => {
      portfolioCustomers = data;
      if (portfolioCustomers.includes(this.custId)) {
        this.includePortfolio = true;
      }
      this.getPortfolioDetails(this.custId);
    });

    this.getCustomerDetailsSummary(this.custId);
    this.getProductDropdownDetails();
  }

  getProductDropdownDetails(): void {
    this._appService.GetInitialDataForCRUDProduct().subscribe(
      (data: any) => {
        this.productTier = data['productTier'];
        this.modeList = data['productModes'];
        this.serviceAreaTypes = data['serviceAreas'];
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getCustomerDetailsSummary(custId: string): void {
    this._appService.GetCustomerList(localStorage.getItem("empid") || '', false).subscribe(
      (data: any) => {
        // Filter to get only the selected customer
        this.Customer = data.filter((c: any) => c.cusT_ID === custId);
        if (this.Customer.length === 0) {
          // If filter returns nothing, get all customers and let the dropdown work
          this.Customer = data;
        }
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getPortfolioDetails(custId: string): void {
    if (this.includePortfolio) {
      this._appService.GetPortfolioWithProductList(custId).subscribe(
        (data: any) => {
          this.portfolioList = data;
        },
        (error: any) => {
          this._util.serviceError(error);
        }
      );
    } else {
      this.getProductPortfolioMapping(99);
    }
  }

  getProductPortfolioMapping(portId: number): void {
    this.portfolioid = portId;
    this._appService.GetProductDetails(this.custId, portId).subscribe(
      (data: any) => {
        this.productlist = data;
        this.dataSource = new MatTableDataSource(this.productlist);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  Edit_onClick(): void {
    let editItem: any = {
      cust_Id: this.custId,
      producT_TITLE: '',
      portfoliO_ID: 99,
      servicE_COMMENCEMENT_DATE: null
    };
    this.EditRow_onClick(editItem);
  }

  EditRow_onClick(item: any): void {
    this.editItem = item;
    this.readmode = false;
    this.editmode = true;
  }

  Cancel_onClick(): void {
    this.editmode = false;
    this.readmode = true;
    this.dataSource = new MatTableDataSource(this.productlist);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.RefreshTable();
  }

  Filter_onChange($event: any): void {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.productlist);
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onSaveButtonClick(): void {
    if ((this.includePortfolio) && (this.editItem.portfoliO_ID == null || this.editItem.portfoliO_ID == undefined)) {
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

    this.UpdateProduct(this.editItem);
  }

  UpdateProduct(item: any): void {
    this._appService.AddUpdateProduct(item).subscribe(
      (data: any) => {
        alert("Data Saved Successfully");
        this.readmode = true;
        this.editmode = false;
        this.RefreshTable();
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  DeleteProduct(item: any): void {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to delete the record?',
      'Delete Product'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._appService.DeleteProduct(item).subscribe(
          (data: any) => {
            alert("Product deleted Successfully");
            this.readmode = true;
            this.editmode = false;
            this.RefreshTable();
          },
          (error: any) => {
            this._util.serviceError(error);
          }
        );
      }
    });
  }

  RefreshTable(): void {
    let portfolio: number = 99;
    this.includePortfolio ? portfolio = this.portfolioid : portfolio = 99;
    this.sharedService.callMethod();
    this._appService.GetProductDetails(this.custId, portfolio).subscribe(
      (data: any) => {
        this.productlist = data;
        this.dataSource = new MatTableDataSource(this.productlist);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  showAll($event: any): void {
    // Placeholder method from legacy - preserved for compatibility
  }
}
