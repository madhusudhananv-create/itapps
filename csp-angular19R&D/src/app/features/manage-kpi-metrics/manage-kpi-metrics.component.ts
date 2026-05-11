/**
 * ManageKpiMetricsComponent - Configure KPI Metrics for Products
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - View KPI metrics for products in a paginated, sortable table
 * - Filter by customer, portfolio, product, mode, and service level
 * - Add new KPI metrics via dialog
 * - Delete existing KPI metrics
 * - Display expected and minimum service levels with proper units
 * - Portfolio support (conditional)
 * - Tier display
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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services and Utilities
import { AppsService, GlobalKpiCategoryModel } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControl } from '../../shared/access-control';

// Models
// Note: Models imported from AppsService

// Components
import { MasterKpiComponent } from '../../pages/manage-kpi-product/master-kpi/master-kpi.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-manage-kpi-metrics',
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
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './manage-kpi-metrics.component.html',
  styleUrl: './manage-kpi-metrics.component.scss'
})
export class ManageKpiMetricsComponent implements OnInit {
  // Dependency Injection
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private _appservice = inject(AppsService);
  private _shared = inject(SharedService);
  private _util = inject(MyUtility);
  private changeDetectorRefs = inject(ChangeDetectorRef);
  public _access = inject(AccessControl);
  public dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // ViewChild references
  @ViewChild('TABLE') table!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  // Input property
  @Input('custId') custId: string = '';

  // Component Properties
  private sub: any;
  Customer: any[] = [];
  allproj: boolean = true;
  portfolioList: any[] = [];
  isdisabled: boolean = false;
  showTable: boolean = false;
  result: any[] = [];
  productList: any[] = [];
  portId: any;
  productId: any;
  serviceModes: any[] = [];
  selectedMode: any;
  selectedModetitle: any;
  serviceLevel: any[] = [];
  selectedLevel: any;
  tierId: any;
  kpiDefinitions: any[] = [];
  includePortfolio: boolean = false;
  dataSource = new MatTableDataSource(this.kpiDefinitions);
  displayedColumns: string[] = ['reference', 'kpiname', 'description', 'serviceArea', 'serviceType', 'sla', 'frequency', 'expectedLevel', 'minLevel', 'action'];
  serviceArea: any[] = [];
  GlobalCategories: GlobalKpiCategoryModel[] = [];
  reference: any[] = [];
  // Note: serviceAreaProjectMappingList not used in this component, removed

  ngOnInit(): void {
    // Get custId from route params if available, otherwise use Input property
    this.sub = this.route.params.subscribe(params => {
      if (params['custid']) {
        this.custId = params['custid'];
      }
    });

    // If custId is still not set, it should come from the Input property
    if (!this.custId) {
      console.warn('manage-kpi-metrics: custId not available from route or input');
      return;
    }

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
  }

  LoadProductData(productId: any): void {
    if (productId != undefined && productId != "" && productId != null) {
      this.loadProductModes(productId);
      this.loadServiceArea();
      this.service_GetGlobalKpiCategories();
      this.loadReference();
    } else {
      if (this.includePortfolio)
        this._util.showWarningPopup("Please select the Portfolio and Product", "Validation Error");
      else
        this._util.showWarningPopup("Please select the Product", "Validation Error");
    }
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

  loadProductModes(prodId: any): void {
    this.isdisabled = true;
    this._appservice.getAllServiceMode(prodId).subscribe(
      (data: any) => {
        this.serviceModes = data;
        if (data.length > 0) {
          this.selectedMode = this.serviceModes.filter((x: any) => x.modE_TITLE)[0].id;
          this.selectedModetitle = this.serviceModes.filter((x: any) => x.modE_TITLE)[0].modE_TITLE;
        }
        this.loadServiceLevel();
        this.isdisabled = false;
      },
      (err: any) => {
        this.isdisabled = false;
        this._util.serviceError(err);
      }
    );
  }

  loadServiceArea(): void {
    this._appservice.getProductServiceArea().subscribe(
      (data: any) => {
        this.serviceArea = data;
      },
      (err: any) => {
        this._util.serviceError(err);
      }
    );
  }

  loadReference(): void {
    this._appservice.getServiceReference().subscribe(
      (data: any) => {
        this.reference = data;
      },
      (err: any) => {
        this._util.serviceError(err);
      }
    );
  }

  service_GetGlobalKpiCategories(): void {
    this._appservice.GetGlobalKpiCategories().subscribe(
      (data: any) => {
        this.GlobalCategories = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  loadServiceLevel(): void {
    this.isdisabled = true;
    this._appservice.getServiceLevel().subscribe(
      (data: any) => {
        this.serviceLevel = data;
        if (data.length > 0) {
          this.selectedLevel = this.serviceLevel.filter((x: any) => x.servicE_LEVEL)[0].id;
          this.ddlevel_Onchange(this.selectedLevel);
        }
        this.isdisabled = false;
      },
      (err: any) => {
        this.isdisabled = false;
        this._util.serviceError(err);
      }
    );
  }

  ddlevel_Onchange(lvlid: any): void {
    this.isdisabled = true;
    if (this.selectedMode != undefined) {
      this._appservice.getAllKpiByModeId(this.selectedMode, lvlid, this.productId).subscribe(
        (data: any) => {
          this.kpiDefinitions = data;
          if (this.kpiDefinitions.length > 0) {
            this.tierId = this.kpiDefinitions.filter((x: any) => x.tier)[0].tier;
            this.showTable = true;
          } else {
            this.showTable = false;
          }
          this.RefreshTable(this.kpiDefinitions);
          this.isdisabled = false;
        },
        (err: any) => {
          this.isdisabled = false;
          this._util.serviceError(err);
        }
      );
    }
  }

  getmeasurementforServiceLevel(kpiId: any): string {
    let uom: string = '';
    let expectedLvl: any = '';
    if (this.kpiDefinitions.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        const kpi = this.kpiDefinitions.filter((x: any) => x.kpI_ID == kpiId)[0];
        if (kpi) {
          uom = kpi.uniT_OF_MEASUREMENT;
          expectedLvl = kpi.expecteD_SERVICE_LEVEL;
          if (uom == '%')
            return expectedLvl + '%';
          else if (uom == 'Number')
            return expectedLvl + ' per product';
          else
            return expectedLvl;
        }
      }
    }
    return '';
  }

  getmeasurementforMinServiceLevel(kpiId: any): string {
    let uom: string = '';
    let expectedLvl: any = '';
    if (this.kpiDefinitions.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        const kpi = this.kpiDefinitions.filter((x: any) => x.kpI_ID == kpiId)[0];
        if (kpi) {
          uom = kpi.uniT_OF_MEASUREMENT;
          expectedLvl = kpi.minimuM_SERVICE_LEVEL;
          if (uom == '%')
            return expectedLvl + '%';
          else if (uom == 'Number')
            return expectedLvl + ' per product';
          else
            return expectedLvl;
        }
      }
    }
    return '';
  }

  DeleteRow_onClick(element: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete KPI Metric',
        message: 'Are you sure you want to delete this KPI metric? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._appservice.deleteKpiForProduct(element.kpI_ID).subscribe(
          (data: any) => {
            this.showToast('Deleted successfully', 'warn');
            this.LoadProductData(this.productId);
          },
          (error: any) => {
            this._util.serviceError(error);
            this.showToast('Something went wrong', 'error');
          }
        );
      }
    });
  }

  addKPI(): void {
    if (this.productId != undefined && this.productId != "" && this.productId != null) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = true;
      dialogConfig.width = "90%";
      dialogConfig.height = "90%";
      dialogConfig.data = {
        customerId: this.custId,
        productId: this.productId,
        modeId: this.selectedMode
      };
      const dialogRef = this.dialog.open(MasterKpiComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((result: any) => {
        this.LoadProductData(this.productId);
      });
    } else {
      if (this.includePortfolio)
        this.showToast('Please select the Portfolio and Product', 'warn');
      else
        this.showToast('Please select the Product', 'warn');
    }
  }

  showToast(message: string, type: 'success' | 'warn' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: type === 'error' ? 4000 : 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`]
    });
  }

  RefreshTable(data: any): void {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource<any>(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
}
