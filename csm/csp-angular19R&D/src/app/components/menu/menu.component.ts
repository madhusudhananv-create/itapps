import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';

/**
 * Menu Component
 * Migrated from Angular 6 to Angular 19 standalone
 * 
 * Side navigation menu that appears when menu icon is clicked in navbar
 * Shows different menu items based on access control permissions
 * 
 * Menu Items:
 * - Overview
 * - Project Scope
 * - People
 * - Process
 * - Delivery
 * - Success Goals
 * - Voice of Customer
 * - Lessons Learnt
 * - Best Practices
 * - Feedback
 * - Appreciation
 * - Manage KPI Products
 * - Contacts
 * - Planner
 * - Project Data Migration
 * - CRISP
 * - Checklist Assessment
 * - Assessment Findings
 * - FMEA Project Setup
 * - Project Data Configuration
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  // Injected services
  public _access = inject(AccessControl);
  public _util = inject(MyUtility);

  // Input properties
  @Input('custid') custid: string = '';

  // Component state
  isBaseMeasureEnabled: boolean = false;
  customerName: string = '';

  ngOnInit(): void {
    // Check if called from CSM Dashboard
    if (window.location.pathname.indexOf("csm-dashboard") > -1) {
      this._util.btnCalledFromNewCSMDashboard = true;
    } else {
      this._util.btnCalledFromNewCSMDashboard = false;
    }

    // Check if base measure is enabled for this customer
    this.isBaseMeasureEnabled = this._util.IsBaseMeasureEnabledCustomer(this.custid);

    // Resolve customer name from slaAvailableList stored in localStorage
    this.customerName = this.resolveCustomerName();
  }

  /**
   * Look up the human-readable customer name for the current custid.
   * Falls back to custid if not found.
   */
  resolveCustomerName(): string {
    try {
      const stored = localStorage.getItem('slaAvailableList');
      if (stored) {
        const list: { customerId: string; customerName: string }[] = JSON.parse(stored);
        const match = list.find(x => x.customerId === this.custid);
        if (match?.customerName) return match.customerName;
      }
    } catch { /* ignore parse errors */ }
    return this.custid; // fallback to ID if name unavailable
  }
}
