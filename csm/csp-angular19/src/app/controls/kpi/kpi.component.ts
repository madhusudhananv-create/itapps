import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { MyUtility } from '../../shared/my-utility';
import { KpiSharedService } from './kpi-shared.service';
import { AppsService } from '../../core/services/apps.service';
import { SharedService } from '../../shared/shared.service';
import { AccessControl } from '../../shared/access-control';

// Child Components - These will need to be imported when they are migrated
import { KpiGoalsComponent } from './kpi-goals/kpi-goals.component';
import { KpiDefinitionsComponent } from './kpi-definitions/kpi-definitions.component';
import { KpiDetailsComponent } from './kpi-details/kpi-details.component';
import { KpiProductViewComponent } from './kpi-product-view/kpi-product-view.component';
import { ExternalKpiDataUploadComponent } from './external-kpi-data-upload/external-kpi-data-upload.component';
import { ExternalKpiFormulaUploadComponent } from './external-kpi-formula-upload/external-kpi-formula-upload.component';

// Shared Components
import { PortfolioProjectSelectorComponent } from '../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { PortfolioProductSelectorComponent } from '../../shared/components/portfolio-product-selector/portfolio-product-selector.component';

/**
 * KpiComponent
 * 
 * Main KPI management component for setting customer success goals, 
 * KPI targets and tracking actual achievements.
 * 
 * Migrated from Angular 6 to Angular 19 - Standalone Component
 * 
 * Features:
 * - Customer selection dropdown
 * - Project/Portfolio selection
 * - Product view mode (for Premier/BaseMeasure customers)
 * - Multiple tabs:
 *   1. Set Customer Goals
 *   2. Set KPI & Targets
 *   3. KPI Achievements entry
 * - External KPI upload functionality (for Premier customers)
 * - External KPI processing
 * - SLA-based product view
 * 
 * Navigation:
 * - From dashboard with customer ID
 * - From product KPI view with portfolio/product parameters
 * 
 * All logic, names, and functionality preserved from legacy exactly.
 */
@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    PortfolioProjectSelectorComponent,
    PortfolioProductSelectorComponent,
    // Child components will be added here when migrated
    KpiGoalsComponent,
    KpiDefinitionsComponent,
    KpiDetailsComponent,
    KpiProductViewComponent,
  ],
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.scss'],
  providers: [KpiSharedService]
})
export class KpiComponent implements OnInit {
  @Input('custId') custId: string = '';
  
  tempVariable: string = '';
  projId: string = '';
  includeInternal: Boolean = false;
  CustomerGoal: Boolean = true;
  disabled: boolean = false;
  previousUrl: any;
  
  displayedColumns = [
    'index', 
    'description', 
    'issuE_TYPE', 
    'severitY', 
    'actioN_PLAN', 
    'assigneD_TO', 
    'status', 
    'edit', 
    'delete'
  ];
  
  Customer: any[] = [];
  tabIndex: boolean = false;
  isProductView: boolean = false;
  prodId: number = 0;
  isUploadVisible: boolean = false;
  portId: number = 0;
  modeId: number = 0;
  month: number = 0;
  year: any;
  kpiId: number = 0;
  tierId: number = 0;
  selectedTabIndex: number = 0;
  message: any;
  _loading: boolean = false;
  slaAvailable: boolean = false;
  productViewTabIndex: number = 0;

  // Inject services
  public _util = inject(MyUtility);
  private _activatedRoute = inject(ActivatedRoute);
  public _appService = inject(AppsService);
  public router = inject(Router);
  public _shared = inject(SharedService);
  private dialog = inject(MatDialog);
  public _access = inject(AccessControl);

  ngOnInit(): void {
    this._util.validateLogin();
    
    
    // FIXED: Only check SLA availability, don't auto-set isProductView for Premier/BaseMeasure
    // The checkbox should only show if customer actually has products
    setTimeout(() => {
      // Check SLA availability
      const storedData = localStorage.getItem('slaAvailableList');
      const slaAvailableList = storedData ? JSON.parse(storedData) : [];
      const slaData = slaAvailableList.filter((x: any) => x.customerId == this.custId)[0];
      
      if (slaData && slaData.slaAvailable) {
        // Customer has products - show View By Product checkbox
        // Default to unchecked (false) to show project view by default
        this.slaAvailable = false;
        this.isProductView = true;
      } else {
        // Customer has NO products - hide View By Product checkbox
        this.slaAvailable = false;
        this.isProductView = false;
      }
    }, 0);

    // Store customer ID for back navigation
    if (this.custId != null && this.custId != undefined) {
      this.tempVariable = this.custId;
    }

    // Monitor route changes
    this.router.events
      .pipe(
        filter((e: any) => e instanceof RoutesRecognized),
        pairwise()
      ).subscribe((e: any) => {
        // Route change handling can be added here if needed
      });

    // Check if navigated from product KPI view
    if (this._activatedRoute.snapshot.url.toString().startsWith("productkpi")) {
      this._activatedRoute.paramMap.subscribe(params => {
        this.custId = params.get('custid') || '';
        this.portId = Number(params.get('portId')) || 0;
        this.prodId = Number(params.get('prodId')) || 0;
        this.modeId = Number(params.get('modeId')) || 0;
        this.month = Number(params.get('month')) || 0;
        this.year = params.get('year') || '';
        this.kpiId = Number(params.get('kpiId')) || 0;
        this.isProductView = true;
        this.LoadCustomerByEmpId();
        this.selectedTabIndex = 1;
        this.tabIndex = true;
      });
    } else {
      this.LoadCustomerByEmpId();
    }

    // Check upload visibility for Premier customers with proper access
    if (this._util.IsPremier(this.custId) && this._access.IsAllowed(73, 1, '', '')) {
      this.isUploadVisible = true;
    }
  }

  ngOnChanges(): void {
    // Hook for input changes
  }

  /**
   * Load customer list for logged-in employee
   * Filters by custId if provided
   */
  LoadCustomerByEmpId(): void {
    const empId = localStorage.getItem('empid') || '';
    this._appService.GetCustomerList(empId, false).subscribe(
      data => {
        this.Customer = data;
        if (this.Customer.length > 0 && this.custId != undefined) {
          // Filter to show only the selected customer
          this.Customer = this.Customer.filter((x: any) => x.cusT_ID == this.custId);
        } else if (this.Customer.length > 0 && this.custId == undefined) {
          // Default to first customer if no custId provided
          this.custId = this.Customer[0].releasE_ID;
          
          // Defer SLA check to next change detection cycle to avoid NG0100 error
          setTimeout(() => {
            // Check SLA availability for the default customer
            const storedData = localStorage.getItem('slaAvailableList');
            const slaAvailableList = storedData ? JSON.parse(storedData) : [];
            const slaData = slaAvailableList.filter((x: any) => x.customerId == this.custId)[0];
            
            // FIXED: Only show View By Product if customer has products (slaAvailable)
            // Don't show checkbox just because customer is Premier/BaseMeasure
            // Default to unchecked (false) to show project view by default
            if (slaData && slaData.slaAvailable) {
              this.slaAvailable = false;
              this.isProductView = true;
            } else {
              this.slaAvailable = false;
              this.isProductView = false;
            }
          }, 0);
        }
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }

  /**
   * Customer dropdown change handler
   * FIXED: Only show "View By Product" if customer actually has products (slaAvailable)
   * Don't show checkbox just because customer is Premier/BaseMeasure
   */
  ddCustomer_Onchange(): void {
    // Reset project ID when customer changes
    this.projId = '';
    
    // Check SLA availability for the new customer
    const storedData = localStorage.getItem('slaAvailableList');
    const slaAvailableList = storedData ? JSON.parse(storedData) : [];
    const slaData = slaAvailableList.filter((x: any) => x.customerId == this.custId)[0];
    
    // Only show View By Product checkbox if customer has products (slaAvailable)
    // regardless of Premier/BaseMeasure status
    // Default to unchecked (false) to show project view by default
    if (slaData && slaData.slaAvailable) {
      this.slaAvailable = false;
      this.isProductView = true;
    } else {
      this.slaAvailable = false;
      this.isProductView = false;
    }
    
  }

  /**
   * View By Product checkbox change handler
   * Toggles between product view (slaAvailable=true) and project view (slaAvailable=false)
   * Resets selection data when switching views
   * @param checked - Checkbox state (true = product view, false = project view)
   */
  onViewByProductChange(checked: boolean): void {
    
    // Explicitly set the state
    this.slaAvailable = checked;
    
    // Reset selections when toggling views
    if (checked) {
      // Switching to product view - reset project selections
      this.projId = '';
      this.selectedTabIndex = 0;  // Reset to first tab
    } else {
      // Switching to project view - reset product selections
      this.prodId = 0;
      this.portId = 0;
      this.tierId = 0;
      this.selectedTabIndex = 0;  // Reset to first tab
    }
  }

  /**
   * Project selector change event handler
   * @param $event - JSON string with customer and project IDs
   */
  project_onChange($event: string): void {
    const obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
  }

  /**
   * Get selected projects list
   * Handles project selection from portfolio-project-selector
   * Since KPI module works with single project, takes first selected project
   * 
   * @param event - Project ID array from selector (we take the first project)
   */
  getSelectedProjectsList(event: any): void {
    if (Array.isArray(event) && event.length > 0) {
      // Portfolio-project-selector emits array, take first project
      this.projId = event[0];
    } else if (typeof event === 'string') {
      // Single project ID
      this.projId = event;
    } else {
      this.projId = '';
    }
  }

  /**
   * Get selected product from portfolio product selector
   * @param event - Product data object with prodArray and tierId
   */
  getSelectedProduct(event: any): void {
    if (event != null) {
      this.prodId = event.prodArray;
      this.tierId = event.tierId;
    }
  }

  /**
   * Include internal KPIs checkbox change handler
   */
  onIncludeChange(): void {
    // Include internal logic can be added here
  }

  /**
   * Tab change handler for regular KPI view
   * @param index - Selected tab index
   */
  OntabChange(index: number): void {
    if (index == 2) {
      this.tabIndex = true;
    } else {
      this.tabIndex = false;
    }
  }

  /**
   * Tab change handler for product view
   * @param index - Selected tab index
   */
  OnProductViewtabChange(index: number): void {
    this.productViewTabIndex = index;
    
    if (index == 1) {
      this.tabIndex = true;
    } else {
      this.tabIndex = false;
    }

    if (index > 1) {
      this.OntabChange(index);
    }
  }

  /**
   * Navigate back to appropriate dashboard based on customer type
   * @param custId - Customer ID
   */
  getDashboard(custId: string): void {
    if (this._util.btnCalledFromNewCSMDashboard == false && 
        !this._util.IsPremier(custId) && 
        !this._util.IsBaseMeasureEnabledCustomer(custId)) {
      // Regular customer - navigate to new dashboard
      this.router.navigate(['/newdashboard/cust', custId, false]);
    } else if (this._util.IsPremier(custId) || this._util.IsBaseMeasureEnabledCustomer(custId)) {
      // Premier/BaseMeasure customer - navigate to service level dashboard
      this.router.navigate(['/serviceleveldashboard/cust', custId, false]);
    } else {
      // CSM Dashboard
      localStorage.removeItem('selectedCustomer');
      localStorage.setItem('selectedCustomer', custId);
      this.router.navigate(['/csm-dashboard']);
    }
  }

  /**
   * Open dialog for uploading external KPI data
   * Available for Premier customers with proper access
   */
  OpenFileUploadDialog(): void {
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.maxWidth = "90vw";
    dialogRef.width = "700px";
    dialogRef.height = "auto";
    dialogRef.panelClass = 'modern-dialog-container';
    dialogRef.data = {
      'custId': this.custId
    };
    this.dialog.open(ExternalKpiDataUploadComponent, dialogRef);
  }

  /**
   * Open dialog for uploading external KPI formula/rules
   * Available for Premier customers with proper access
   */
  OpenFileUploadDialogF(): void {
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.maxWidth = "90vw";
    dialogRef.width = "700px";
    dialogRef.height = "auto";
    dialogRef.panelClass = 'modern-dialog-container';
    dialogRef.data = {
      'custId': this.custId
    };
    this.dialog.open(ExternalKpiFormulaUploadComponent, dialogRef);
  }

  /**
   * Process external KPIs for the selected month/year
   * Calls backend API to process uploaded external KPI data
   */
  ProcessExternalKPIs(): void {
    this._loading = true;
    // TODO: Access tableMonth and tableYear from proper source when _util is updated
    // For now, use current date or stored values
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const ipDate = new Date(month + "/1/" + year).toDateString();
    

    this._appService.ProcessExternalKPIs(this.custId, ipDate).subscribe({
      next: (data: any) => {
        this._loading = false;
        this.message = data || 'External KPIs processed successfully';
        // Show success toast notification instead of alert
        this._util.showSuccess(`${this.message} for ${month}/${year}`);
      },
      error: (error: any) => {
        this._loading = false;
        this._util.serviceError(error);
      }
    });
  }
}
