/**
 * BVD Quantitative Benefits Detail Dialog Component
 * Migrated from LEGACY-SOURCE/src/app/pages/bvd-dashboard/bvd-quantitative-benefits-detail
 * 
 * Displays detailed table of quantitative benefits with pagination
 * Shown as a modal dialog when user clicks "View More" on quantitative benefits
 * 
 * Migration Changes:
 * - Converted to standalone component for Angular 19
 * - Updated Material imports to new module structure
 * - Added proper typing for data interface
 * - Using modern ViewChild syntax with required: false
 * - Preserved all original styles and logic exactly
 */

import { Component, OnInit, OnChanges, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';

/**
 * Benefits interface - structure of each benefit row
 */
export interface Benefits {
  identified_Date: string;
  idea: string;
  area: string;
  responsible: string;
  net_Benefits: string;
}

/**
 * Dialog data interface
 */
export interface QuantitativeBenefitsDialogData {
  DetailsdataQuantitative: Benefits[];
}

@Component({
  selector: 'app-bvd-quantitative-benefits-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule
  ],
  templateUrl: './bvd-quantitative-benefits-detail.component.html',
  styleUrls: ['./bvd-quantitative-benefits-detail.component.scss']
})
export class BvdQuantitativeBenefitsDetailComponent implements OnInit, OnChanges {
  
  // Table configuration
  displayedColumns: string[] = ['identifiedDate', 'idea', 'area', 'responsible', 'savings'];
  dataSource = new MatTableDataSource<Benefits>();
  quantitativebenfits: Benefits[] = [];
  
  // ViewChild references for pagination and sorting
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: QuantitativeBenefitsDialogData,
    private dialog: MatDialogRef<BvdQuantitativeBenefitsDetailComponent>
  ) {
    // Constructor preserved from legacy
  }

  ngOnInit(): void {
    if (this.data != undefined) {
      this.quantitativebenfits = this.data.DetailsdataQuantitative;
      this.dataSource = new MatTableDataSource(this.quantitativebenfits);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource(this.quantitativebenfits);
  }

  /**
   * Close dialog
   */
  onClose(): void {
    this.dialog.close();
  }
}
