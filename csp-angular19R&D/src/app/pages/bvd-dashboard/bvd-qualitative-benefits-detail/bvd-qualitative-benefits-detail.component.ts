import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Benefits interface - maintain exact structure from legacy
export interface Benefits {
  identifiedDate: string;
  benefit: string;
  savings: string;
  responsible: string;
  area: string;
  idea: string;
}

@Component({
  selector: 'app-bvd-qualitative-benefits-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './bvd-qualitative-benefits-detail.component.html',
  styleUrls: ['./bvd-qualitative-benefits-detail.component.scss']
})
export class BvdQualitativeBenefitsDetailComponent implements OnInit, AfterViewInit {
  
  displayedColumns: string[] = ['identifiedDate', 'idea', 'area', 'responsible', 'benefit'];
  dataSource = new MatTableDataSource<any>();
  qualitativeBenefits: any[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private dialog: MatDialogRef<BvdQualitativeBenefitsDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    
    if (this.data !== undefined && this.data !== null) {
      this.qualitativeBenefits = this.data.DetailsdataQualitative || [];
      this.dataSource = new MatTableDataSource(this.qualitativeBenefits);
    }
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
  
  onClose(): void {
    this.dialog.close();
  }
}
