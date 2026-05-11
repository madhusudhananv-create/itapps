import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

import { AppsService } from '../../../core/services/apps.service';

/**
 * Master KPI Dialog Component
 * 
 * Dialog component for selecting and adding KPIs from master list to a product.
 * Displays a filterable table of master KPIs with checkbox selection.
 * 
 * Migration Notes:
 * - Migrated from Angular 6 to Angular 19 standalone component
 * - Updated to use inject() for dependency injection
 * - Material Dialog pattern with MAT_DIALOG_DATA injection
 * - SelectionModel for multi-select checkbox functionality
 * - Uses table-filter component for filtering capabilities
 * 
 * Dialog Data:
 * - customerId: Customer ID for the KPI assignment
 * - productId: Product ID for the KPI assignment
 * - modeId: Mode ID for the KPI assignment
 * 
 * Workflow:
 * 1. Dialog opens with master KPI list
 * 2. User selects KPIs via checkboxes
 * 3. Clicks Add button to add selected KPIs to product
 * 4. Dialog closes and returns selected data to parent
 */
@Component({
  selector: 'app-master-kpi',
  templateUrl: './master-kpi.component.html',
  styleUrls: ['./master-kpi.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule
  ]
})
export class MasterKpiComponent implements OnInit {
  // Inject dependencies using modern inject() function
  private appService = inject(AppsService);
  private dialogRef = inject(MatDialogRef<MasterKpiComponent>);
  public data = inject(MAT_DIALOG_DATA);

  // ViewChild references for table features
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Component properties
  kpiList: any[] = [];
  dataSource = new MatTableDataSource<any>(this.kpiList);
  isLoading: boolean = false;

  // Table configuration
  displayedColumns = [
    'isSelected',
    'index',
    'reference',
    'kpiname',
    'serviceArea',
    'serviceType',
    'sla',
    'frequency',
    'expectedLevel',
    'minLevel'
  ];

  // Selection model for checkboxes (multi-select enabled)
  selection = new SelectionModel<any>(true, []);

  // Dialog data properties
  customerId: string = '';
  productId: string = '';
  modeId: string = '';

  /**
   * Component Initialization
   * Extracts dialog data and loads master KPI list
   */
  ngOnInit() {
    // Extract data from dialog injection
    this.customerId = this.data.customerId || '';
    this.productId = this.data.productId || '';
    this.modeId = this.data.modeId || '';

    // Load master KPI list
    this.getAllKPIList();
  }

  /**
   * Load Master KPI List
   * Fetches all available KPIs from master list
   */
  getAllKPIList() {
    this.isLoading = true;
    this.appService.getAllKpiMasterList().subscribe({
      next: (data) => {
        this.kpiList = data;
        this.RefreshTable();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading master KPI list:', error);
        alert('Error loading master KPI list. Please try again.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Add Selected KPIs
   * Validates selection, maps required IDs, and calls API to add KPIs
   */
  AddKPI() {
    const selectedKPI = this.selection.selected;

    // Validate at least one KPI is selected
    if (selectedKPI.length === 0) {
      alert('Please select at least one KPI.');
      return;
    }

    // Map required IDs to each selected KPI
    for (let kpi of selectedKPI) {
      kpi['customeR_ID'] = this.customerId;
      kpi['projecT_ID'] = '0';  // Default project ID
      kpi['goaL_ID'] = '0';     // Default goal ID
      kpi['modE_ID'] = this.modeId;
      kpi['producT_ID'] = this.productId;
    }

    // Call API to add KPIs
    this.addKpiList(selectedKPI);
  }

  /**
   * Add KPI List to Product
   * Makes API call to save selected KPIs
   * 
   * @param selectedKPI - Array of selected KPI objects with mapped IDs
   */
  addKpiList(selectedKPI: any[]) {
    this.isLoading = true;
    this.appService.addKpiList(selectedKPI).subscribe({
      next: (data) => {
        this.isLoading = false;
        alert('KPI added successfully');
        this.clear();
        // Close dialog and return selected data to parent
        this.dialogRef.close({ data: selectedKPI });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error adding KPI:', error);
        alert('Error adding KPI. Please try again.');
      }
    });
  }

  /**
   * Clear Selection
   * Clears all checkbox selections
   */
  clear() {
    this.selection.clear();
  }

  /**
   * Refresh Table
   * Updates MatTableDataSource with current data
   * Connects paginator and sort after data update
   */
  RefreshTable() {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource(this.kpiList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  /**
   * Get Formatted Expected Service Level
   * Returns service level with appropriate unit of measurement
   * 
   * @param kpiId - KPI Master ID to look up
   * @returns Formatted service level string (e.g., "99.5%", "5 per product")
   */
  getmeasurementforServiceLevel(kpiId: string): string {
    const kpi = this.kpiList.find(k => k.kpI_MASTER_ID === kpiId);
    if (!kpi) return '';

    const expectedLvl = kpi.expecteD_SERVICE_LEVEL || '';
    const uom = kpi.uoM || '';

    if (uom === '%') {
      return expectedLvl + '%';
    } else if (uom === 'Number') {
      return expectedLvl + ' per product';
    } else {
      return expectedLvl;
    }
  }

  /**
   * Get Formatted Minimum Service Level
   * Returns minimum service level with appropriate unit of measurement
   * 
   * @param kpiId - KPI Master ID to look up
   * @returns Formatted minimum service level string (e.g., "95%", "3 per product")
   */
  getmeasurementforMinServiceLevel(kpiId: string): string {
    const kpi = this.kpiList.find(k => k.kpI_MASTER_ID === kpiId);
    if (!kpi) return '';

    const minLvl = kpi.minimuM_SERVICE_LEVEL || '';
    const uom = kpi.uoM || '';

    if (uom === '%') {
      return minLvl + '%';
    } else if (uom === 'Number') {
      return minLvl + ' per product';
    } else {
      return minLvl;
    }
  }

  /**
   * Handle Table Filter Change
   * Applies filter to table data source
   * 
   * @param event - Filter event from table-filter component
   */
  Filter_onChange(event: any) {
    this.dataSource = event;
  }

  /**
   * Show All Records
   * Placeholder method for showing all records (called by table-filter)
   * 
   * @param event - Event from table-filter component
   */
  showAll(event: any) {
    // Empty method - can be implemented if needed for clearing filters
  }

  /**
   * Cancel Button Click
   * Closes dialog without saving
   */
  Cancel_onClick() {
    this.dialogRef.close();
  }
}
