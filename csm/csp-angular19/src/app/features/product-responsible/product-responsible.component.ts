/**
 * ProductResponsibleComponent - Manage Product Responsible Person Mapping
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - View product responsible persons in a paginated, sortable table
 * - Add new product responsible mappings
 * - Edit existing mappings
 * - Delete mappings
 * - Filter by customer, portfolio, and product
 * - Management type selection (CUSTOMER, PROJECT, QUALITYSPOC, etc.)
 * - Dynamic responsible person dropdown based on management type
 * - Back button navigation (conditional)
 * 
 * Management Types:
 * - CUSTOMER / CUSTOMER CSAT QUARTERLY / CUSTOMER CSAT HALFYEARLY - Customer contacts
 * - QUALITYSPOC - QA employees
 * - PROJECT - Project list
 * - Others - Customer employees
 * 
 * Migration Notes:
 * - Converted to standalone component
 * - Used inject() pattern for dependency injection
 * - All logic preserved exactly from legacy
 * - All method names unchanged
 * - All styling preserved
 * - Added appearance="outline" to mat-form-fields
 */

import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Material Imports
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services and Utilities
import { AppsService } from '../../core/services/apps.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControl } from '../../shared/access-control';

// Models
import { EmpInfoModel } from '../../models/emp-info-model';

@Component({
  selector: 'app-product-responsible',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
    DialogYesNoComponent
  ],
  templateUrl: './product-responsible.component.html',
  styleUrl: './product-responsible.component.scss'
})
export class ProductResponsibleComponent implements OnInit {
  // Dependency Injection
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private _appservice = inject(AppsService);
  private _shared = inject(SharedService);
  private _util = inject(MyUtility);
  private changeDetectorRefs = inject(ChangeDetectorRef);
  public _access = inject(AccessControl);

  // ViewChild references
  @ViewChild('TABLE') table!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  // Input property
  @Input('IsBackButtonEnabled') IsBackButtonEnabled: boolean = true;

  // Component Properties
  Customer: any[] = [];
  portfolioList: any[] = [];
  custId: any;
  portId: any;
  productId: any;
  productList: any[] = [];
  result: any = [];
  dataSource = new MatTableDataSource(this.result);
  displayedColumns: string[] = ['index', 'managemenT_TYPE', 'name', 'effectivE_FROM', 'action'];
  editmode: boolean = false;
  readonlymode: boolean = true;
  editItem: any = [];
  addItem = new ProductResponsibleModel();
  QAEmployeeList: EmpInfoModel[] = [];
  overallProductsList: any;
  customerEmployeeList: any;
  managementTypes: any;
  customerList: any;
  disableProduct: boolean = false;
  private sub: any;
  projectList: any[] = [];
  allproj: boolean = true;
  isdisabled: boolean = false;
  includePortfolio: boolean = false;

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.custId = params['custid'];
    });

    let portfolioCustomers: string = "";
    this._appservice.GetDBConfigValue("PORTFOLIO_ENABLED_CUSTOMERS", -1, "").subscribe((data: any) => {
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

  private showToast(message: string, type: 'success' | 'warn' | 'error'): void {
    const panelClass: Record<string, string[]> = {
      success: ['toast-success'],
      warn:    ['toast-warn'],
      error:   ['toast-error'],
    };
    const duration: Record<string, number> = {
      success: 3000,
      warn:    3000,
      error:   4000,
    };
    this._snackBar.open(message, '✕', {
      duration: duration[type],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: panelClass[type],
    });
  }

  getCustomerDetailsSummary(custId: string): void {
    this._appservice.GetCustomerList(localStorage.getItem("empid") || '', false).subscribe(
      (data: any) => {
        // Filter to get only the selected customer
        this.Customer = data.filter((c: any) => c.cusT_ID === custId);
        if (this.Customer.length === 0) {
          // If filter returns nothing, get all customers
          this.Customer = data;
        }
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getAllProjectsFromCustomer(): void {
    this._appservice.GetCustomerProjectsName(this.custId, this.allproj).subscribe(
      (data: any) => {
        this.projectList = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getPortfolioDetails(custId: string): void {
    if (this.includePortfolio) {
      this._appservice.GetPortfolioWithProductList(custId).subscribe(
        (data: any) => {
          this.portfolioList = data;
        },
        (error: any) => {
          this._util.serviceError(error);
        }
      );
    } else {
      this._appservice.getProductList(custId, 0).subscribe(
        (data: any) => {
          this.productList = data;
        },
        (error: any) => {
          this._util.serviceError(error);
        }
      );
    }
  }

  getProductPortfolioMapping(portId: number): void {
    this._appservice.getProductList(this.custId, portId).subscribe(
      (data: any) => {
        this.productList = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getProductResponsibleSummary(productId: any): void {
    this.isdisabled = true;
    if (productId != undefined && productId != "" && productId != null) {
      this._appservice.getproductResponsibleDetails(productId).subscribe(
        (data: any) => {
          this.result = data;
          this.RefreshTable(this.result);
          this.isdisabled = false;
        },
        (error: any) => {
          this.isdisabled = false;
          this._util.serviceError(error);
        }
      );
    } else {
      if (this.includePortfolio)
        this.showToast('Please select the Portfolio and Product', 'error');
      else
        this.showToast('Please select the Product', 'error');
    }
    this.isdisabled = false;
  }

  getAllProductsList(): void {
    this._appservice.GetProductListByCustId(this.custId).subscribe(
      (data: any) => {
        this.overallProductsList = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getProductResponsibleManagementType(): void {
    this._appservice.getProductResponsibleManagementTypeDetails().subscribe(
      (data: any) => {
        this.managementTypes = data;
        // if (this.includePortfolio) {
        //   this.managementTypes = data;
        // }
        // else {
        //   this.managementTypes = data.filter(x => x.id != 6);
        // }
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getQASpocDetails(): void {
    this._appservice.GetQASpocDetails().subscribe(
      (data: any) => {
        this.QAEmployeeList = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getEmployeeDetailsfromCustomer(): void {
    this._appservice.getEmployeeDetailsfromCustomer(this.custId).subscribe(
      (data: any) => {
        this.customerEmployeeList = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getCustomerDetails(): void {
    this._appservice.getCustomerContacts(this.custId, localStorage.getItem('empid') || '').subscribe(
      (data: any) => {
        this.customerList = data;
        this.customerList.sort(function (a: any, b: any) {
          return a.contacT_NAME.localeCompare(b.contacT_NAME);
        });
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  managementTypeChange(event: any): void {
    this.editItem.name = null;
  }

  RefreshTable(data: any): void {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource<any>(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  SubmitForm(isValid: boolean): void {
    if (!isValid) {
      this.showToast('Please choose all the required fields', 'error');
      return;
    }
    this.editItem.producT_ID = this.overallProductsList.filter((x: any) => x.producT_TITLE == this.editItem.producT_TITLE)[0].id;
    if (this.editItem.managemenT_TYPE == 'CUSTOMER' || this.editItem.managemenT_TYPE == 'CUSTOMER CSAT QUARTERLY'
      || this.editItem.managemenT_TYPE == 'CUSTOMER CSAT HALFYEARLY') {
      this.editItem.emP_ID = this.customerList.filter((x: any) => x.contacT_NAME == this.editItem.name)[0].contacT_EMAILID;
    } else if (this.editItem.managemenT_TYPE == 'QUALITYSPOC') {
      this.editItem.emP_ID = this.QAEmployeeList.filter((x: any) => x.frsT_NM == this.editItem.name)[0].emP_ID;
    } else if (this.editItem.managemenT_TYPE == 'PROJECT') {
      this.editItem.projecT_ID = this.projectList.filter((x: any) => x.proJ_NM == this.editItem.name)[0].proJ_ID;
    } else {
      this.editItem.emP_ID = this.customerEmployeeList.filter((x: any) => x.name == this.editItem.name)[0].emP_ID;
    }
    this.editItem.managemenT_TYPE = this.managementTypes.filter((x: any) => x.managemenT_TYPE == this.editItem.managemenT_TYPE)[0].id;
    this.addUpdateProductResponsible(this.editItem);
    if (this.productId != undefined) {
      this.getProductResponsibleSummary(this.productId);
    }
  }

  addUpdateProductResponsible(item: any): void {
    this.addItem = new ProductResponsibleModel();
    if (item.id == undefined || item.id == 0 || item.id == null) {
      this.addItem.producT_ID = item.producT_ID;
      this.addItem.emP_ID = item.emP_ID;
      this.addItem.managemenT_TYPE = item.managemenT_TYPE;
      this.addItem.projecT_ID = item.projecT_ID;
    } else {
      this.addItem = item;
    }
    this.isdisabled = true;
    this._appservice.AddUpdateProductResponsible(this.addItem).subscribe(
      (data: any) => {
        this.showToast('Saved successfully', 'success');
        if (this.productId != undefined) {
          this.getProductResponsibleSummary(this.productId);
        }
        this.readonlymode = true;
        this.editmode = false;
        this.isdisabled = false;
        this.neweditItem();
      },
      (error: any) => {
        this.isdisabled = false;
        this.showToast('Something went wrong', 'error');
      }
    );
  }

  Edit_onClick(flag: any = 0): void {
    this.editmode = true;
    this.readonlymode = false;
    if (flag == 1) {
      this.disableProduct = true;
    } else {
      this.disableProduct = false;
    }
    this.getAllProductsList();
    this.getQASpocDetails();
    this.getProductResponsibleManagementType();
    this.getEmployeeDetailsfromCustomer();
    this.getCustomerDetails();
    this.RefreshTable(this.result);
  }

  EditRow_onClick(element: any): void {
    this.editItem = Object.assign({}, element);
    this.Edit_onClick(1);
  }

  DeleteRow_onClick(element: any): void {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete the record?'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._appservice.DeleteProductResponsible(element).subscribe(
          (data: any) => { },
          (error: any) => {
            this.showToast('Something went wrong', 'error');
          },
          () => {
            this.showToast('Deleted successfully', 'warn');
            this.getProductResponsibleSummary(this.productId);
          }
        );
      }
    });
  }

  neweditItem(): void {
    this.editItem = new ProductResponsibleModel();
  }

  Cancel_onClick(): void {
    this.readonlymode = true;
    this.editmode = false;
    this.neweditItem();
    this.RefreshTable(this.result);
  }
}

export class ProductResponsibleModel {
  id?: number;
  producT_ID?: number;
  emP_ID?: string;
  managemenT_TYPE?: number;
  projecT_ID?: string;
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  isactive?: boolean;
}
