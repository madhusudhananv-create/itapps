import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { OverallStatusPage1Component } from './overall-status-page1/overall-status-page1.component';

@Component({
  selector: 'app-tab-overall-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    OverallStatusPage1Component
  ],
  templateUrl: './tab-overall-status.component.html',
  styleUrl: './tab-overall-status.component.scss'
})
export class TabOverallStatusComponent implements OnInit {
  menuToggleStatus: boolean = false;
  selectedPeriod: string = 'asToday';
  selectedCust: string = '';
  selectedProj: any[] = [];
  selectedPortfolio: number[] = [];
  empid: string = '';
  customerId: string = '';
  projId: string[] = [];
  portId: number[] = [];
  customers: any[] = [];
  projects: any[] = [];
  portfolioList: any[] = [];
  projectList: any[] = [];
  portfolioprojectMap: any[] = [];
  selectedDateType: string = '1';
  loading: boolean = false;
  isChecked: boolean = false;

  @ViewChild('allSelected') allSelected!: MatOption;
  @ViewChild('projectSelect') projectSelect!: MatSelect;
  @ViewChild('portSelect') portselect!: MatSelect;
  @ViewChild(OverallStatusPage1Component) overallStatusPage1!: OverallStatusPage1Component;

  @Output() toggle: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    this.empid = localStorage.getItem('empid') || '';
  }
  
  /**
   * Public method to trigger data loading in child component
   * Called from dashboard-filter when Apply is clicked
   */
  loadData(): void {
    if (this.overallStatusPage1) {
      this.overallStatusPage1.loadDashboardData();
    }
  }
}
