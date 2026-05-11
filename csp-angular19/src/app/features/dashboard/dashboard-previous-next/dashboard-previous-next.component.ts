import { Component, Input, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

// Services
import { MyUtility } from '../../../shared/my-utility';
import { SharedService } from '../../../shared/shared.service';
import { AppsService } from '../../../services/apps.service';

// Models
import { CustomerModel } from '../../../models/customer-model';

// Components
import { DashboardPremierComponent } from '../../../pages/dashboard/dashboard-premier/dashboard-premier.component';
import { DashboardCustomerPage2Component } from '../dashboard-customer-page2/dashboard-customer-page2.component';
import { DashboardCustomerNextPageComponent } from '../dashboard-customer-next-page/dashboard-customer-next-page.component';
import { DashboardSuccessJourneyComponent } from '../dashboard-success-journey/dashboard-success-journey.component';
import { PortfolioProjectSelectorComponent } from '../../../shared/components/portfolio-project-selector/portfolio-project-selector.component';

/**
 * Dashboard Previous-Next Component
 * Migrated from Angular 6 to Angular 19 standalone
 * 
 * Wrapper component for multi-page dashboard navigation
 * Shows different dashboard views based on currIndex:
 * - Index 0: Dashboard Premier (SLA/Service Level Dashboard)
 * - Index 1: Dashboard Customer Page 2
 * - Index 2: Dashboard Customer Next Page
 * - Index 3: Dashboard Success Journey
 * 
 * Passes filtered portfolio, project, and product arrays to child components
 */
@Component({
  selector: 'app-dashboard-previous-next',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DashboardPremierComponent,
    DashboardCustomerPage2Component,
    DashboardCustomerNextPageComponent,
    DashboardSuccessJourneyComponent,
    PortfolioProjectSelectorComponent
  ],
  templateUrl: './dashboard-previous-next.component.html',
  styleUrls: ['./dashboard-previous-next.component.scss']
})
export class DashboardPreviousNextComponent implements OnInit, OnDestroy, AfterViewInit {
  // Dependency Injection
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly _util = inject(MyUtility);
  public readonly _shared = inject(SharedService);
  private readonly _appservice = inject(AppsService);

  // Inputs
  @Input('currIndex') currIndex: number = 0;

  // Component State
  showFilter: boolean = false;
  customerId: string = '';
  selectedCustomer?: CustomerModel;
  customerList: CustomerModel[] = [];
  customerName: string = '';
  reset: boolean = false;
  
  // Current date for dashboard components
  currentMonth: string = '';
  currentYear: number = new Date().getFullYear();
  
  // Arrays passed to child dashboard components
  portArray: number[] = [];
  projArray: any[] = [];
  prodArray: any[] = [];

  // Subscriptions
  private sub?: Subscription;

  ngOnInit(): void {
    
    // Initialize current month and year
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.currentMonth = monthNames[now.getMonth()];
    this.currentYear = now.getFullYear();
    
    // Subscribe to route parameters
    this.sub = this.route.params.subscribe(params => {
      const newCustomerId = params['customerid'];
      this.reset = params['reset'];

      // Only reload if customer changed
      if (this.customerId !== newCustomerId) {
        this.customerId = newCustomerId;
        
        if (this.reset == undefined) {
          this.reset = true;
        }

        // Load customer data
        if (this.customerId != undefined && this.customerId != null) {
          this.service_LoadCustomerByEmpIdByCustomerId(this.customerId);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Load shared filter selections if available
    if (this._shared.selectedPortfolios != undefined && this._shared.selectedPortfolios.length > 0) {
      this.portArray = this._shared.selectedPortfolios;
    }

    if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0) {
      this.projArray = this._shared.selectedProjects;
    }

    if (this._shared.selectedProducts != undefined && this._shared.selectedProducts.length > 0) {
      this.prodArray = this._shared.selectedProducts;
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /**
   * Navigate to previous dashboard page
   */
  onPrev(): void {
    if (this.currIndex > 0) {
      this.currIndex--;
    }
  }

  /**
   * Navigate to next dashboard page
   */
  onNext(): void {
    if (this.currIndex < 3) {
      this.currIndex++;
    }
  }

  /**
   * Load customer details by ID
   * @param customerId Customer ID to load
   */
  service_LoadCustomerByEmpIdByCustomerId(customerId: string): void {
    const empId = localStorage.getItem('empid') || '';
    
    this._appservice.GetCustomerList(empId, false).subscribe({
      next: (data: CustomerModel[]) => {
        this.customerList = data;
        const customer = this.customerList.find(t => t.cusT_ID === customerId);
        
        if (customer) {
          this.selectedCustomer = customer;
          this.customerName = customer.cusT_NM;
        }
      },
      error: (error) => {
        console.error('Error loading customer:', error);
      }
    });
  }

  /**
   * Handle project selection from filter
   * @param event Selected projects array
   */
  getSelectedProjectsList(event: any[]): void {
    this.projArray = event;
    this._shared.selectedProjects = event;
    // Also update portfolios as they may have changed
    this.portArray = this._shared.selectedPortfolios;
  }

  /**
   * Handle product selection from filter
   * @param event Selected products array
   */
  getSelectedProdList(event: any[]): void {
    this.prodArray = event;
    this._shared.selectedProducts = event;
    // Also update portfolios as they may have changed
    this.portArray = this._shared.selectedPortfolios;
  }
}
