import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { Subscription } from 'rxjs';

// Services
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { SharedData } from '../../../shared/shared-data';
import { MenuToggleService } from '../../../core/services/menu-toggle.service';

// Enums
import { enumRoles } from '../../../shared/enum';

// Components
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
import { DashboardCustomerComponent } from '../dashboard-customer/dashboard-customer.component';
import { MenuComponent } from '../../../components/menu/menu.component';
import { DashboardPreviousNextComponent } from '../dashboard-previous-next/dashboard-previous-next.component';
import { BvdDashboardComponent } from '../../../pages/bvd-dashboard/bvd-dashboard.component';
import { CssdashboardComponent } from '../../../pages/cssdashboard/cssdashboard.component';
import { DashboardAssessmentFindingsComponent } from '../../../pages/dashboard/dashboard-assessment-findings/dashboard-assessment-findings.component';
import { RiskchartComponent } from '../../../controls/risk-chart/risk-chart.component';

/**
 * Dashboard Navigation Component
 * Migrated from Angular 6 to Angular 19 standalone
 * 
 * Main navigation component that displays different dashboard tabs based on:
 * - SLA availability
 * - User role
 * - Access control permissions
 * 
 * Tabs include:
 * - Operational Dashboard
 * - Business Value Dashboard
 * - CSAT Insights
 * - QA Governance
 * - Risk Dashboard
 */
@Component({
  selector: 'app-dashboard-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    NavbarNewComponent,
    DashboardCustomerComponent,
    MenuComponent,
    DashboardPreviousNextComponent,
    BvdDashboardComponent,
    CssdashboardComponent,
    DashboardAssessmentFindingsComponent,
    RiskchartComponent
  ],
  templateUrl: './dashboard-navigation.component.html',
  styleUrls: ['./dashboard-navigation.component.scss']
})
export class DashboardNavigationComponent implements OnInit, OnDestroy {
  // Dependency Injection
  private readonly route = inject(ActivatedRoute);
  public readonly _util = inject(MyUtility);
  public readonly _access = inject(AccessControl);
  public readonly sharedData = inject(SharedData);
  private readonly menuToggleService = inject(MenuToggleService);

  // Component State
  menuToggleStatus: boolean = false;
  customerid: string = '';
  reset: boolean = false;
  role: string = '';
  ShowMenu: boolean = true;
  slaAvailable: boolean = false;
  chartsMonthly: any; // For risk chart input

  // Subscriptions
  private sub?: Subscription;
  private menuToggleSub?: Subscription;

  ngOnInit(): void {
    
    // Subscribe to menu toggle events from navbar
    this.menuToggleSub = this.menuToggleService.menuToggle$.subscribe(
      (value: boolean) => {
        this.menuToggleStatus = value;
      }
    );
    
    // Subscribe to route parameters
    this.sub = this.route.params.subscribe(params => {
      this.customerid = params['customerid'] || '';
      this.reset = params['reset'] !== undefined ? params['reset'] === 'true' : false;
      this.role = localStorage.getItem('role') || '';
    });

    // Check if SLA is available for this customer
    const storedData = localStorage.getItem('slaAvailableList');
    if (storedData) {
      try {
        const slaAvailableList = JSON.parse(storedData);
        if (Array.isArray(slaAvailableList) && slaAvailableList.length > 0) {
          const slaInfo = slaAvailableList.find(x => x.customerId === this.customerid);
          if (slaInfo) {
            this.slaAvailable = slaInfo.slaAvailable;
          }
        }
      } catch (error) {
        console.error('Error parsing slaAvailableList from localStorage:', error);
      }
    }

    // Set default reset value if not provided
    if (this.reset === undefined) {
      this.reset = true;
    }

    // Show menu for GAVS users, hide for Customer role
    // Menu is used to toggle dashboard options
    this.ShowMenu = this.role !== enumRoles.Customer.toString();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.menuToggleSub) {
      this.menuToggleSub.unsubscribe();
    }
  }

  /**
   * Handle menu toggle change from navbar
   * @param value Menu toggle status
   */
  onMenuToggleChange(value: boolean): void {
    this.menuToggleStatus = value;
  }
}
