import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardFilterComponent } from '../../dashboard/dashboard-filter/dashboard-filter.component';

/**
 * CSM Dashboard Component
 * Migrated from Angular 6 to Angular 19
 * 
 * This is a simple wrapper component that contains the dashboard filter.
 * The dashboard filter handles customer/project/portfolio selection and
 * displays the appropriate dashboard content.
 */
@Component({
  selector: 'app-csm-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardFilterComponent
  ],
  templateUrl: './csm-dashboard.component.html',
  styleUrls: ['./csm-dashboard.component.scss'],
  host: {
    'style': 'display: block; margin: 0 !important; padding: 0 !important;'
  }
})
export class CsmDashboardComponent implements OnInit {
  /**
   * Controls the open/closed state of the dashboard
   * Used for sidebar toggle functionality
   */
  isOpened: boolean = true;

  constructor() { }

  ngOnInit(): void {
    // Component initialization
    // No additional logic required for this wrapper component
  }

  /**
   * Toggle the sidebar/menu state
   */
  toggle(): void {
    this.isOpened = !this.isOpened;
  }
}
