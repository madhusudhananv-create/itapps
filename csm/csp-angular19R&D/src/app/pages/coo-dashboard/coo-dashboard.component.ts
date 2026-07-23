import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardFilterComponent } from './dashboard-filter/dashboard-filter.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { CustomerProjectIds } from '../../models/customer-project-ids.model';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

@Component({
  selector: 'app-coo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardFilterComponent,
    DashboardMainComponent,
    NavbarNewComponent
  ],
  templateUrl: './coo-dashboard.component.html',
  styleUrl: './coo-dashboard.component.scss'
})
export class COODashboardComponent implements OnInit {
  isOpened = true;
  projId: string[] = [];
  custId: string[] = [];

  @ViewChild(DashboardMainComponent) dashboardMain!: DashboardMainComponent;

  constructor() {
  }

  ngOnInit(): void {
  }

  toggle(): void {
    this.isOpened = !this.isOpened;
  }

  onFilterChange(model: CustomerProjectIds): void {
    this.custId = model.CustomerIds;
    this.projId = model.ProjectIds;
    
    // Trigger data load in dashboard main when filters change
    if (this.dashboardMain && this.dashboardMain.tabOverallStatus) {
      this.dashboardMain.tabOverallStatus.loadData();
    }
  }
}
