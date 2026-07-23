import { Component, OnInit, Input, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MyUtility } from '../../../shared/my-utility';
import { BvdDashboardService } from '../services/bvd-dashboard.service';
import { BvdQualitativeBenefitsDetailComponent } from '../bvd-qualitative-benefits-detail/bvd-qualitative-benefits-detail.component';

@Component({
  selector: 'app-bvd-qualitative-benefits',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './bvd-qualitative-benefits.component.html',
  styleUrls: ['./bvd-qualitative-benefits.component.scss']
})
export class BvdQualitativeBenefitsComponent implements OnInit, OnDestroy {

  private dialog = inject(MatDialog);
  private _bvdService = inject(BvdDashboardService);
  private _util = inject(MyUtility);

  @Input('ValueBenefitdata') benefitdata: any;
  @Input('ValueBenefitDetaildata') benefitDetaildata: any;

  graphData: any;

  ngOnInit(): void {
    this.graphData = undefined;
    this.graphData = this.benefitdata;
  }

  ngOnChanges(): void {
    this.graphData = undefined;
    this.graphData = this.benefitdata;
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  openDialog(): void {
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = false;
    dialogConfig.hasBackdrop = true;
    dialogConfig.width = '950px';
    dialogConfig.maxWidth = '95vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'bvd-qualitative-benefits-dialog';
    dialogConfig.data = {
      'DetailsdataQualitative': this.benefitDetaildata
    };
    
    
    const dialogRef = this.dialog.open(BvdQualitativeBenefitsDetailComponent, dialogConfig);
    dialogRef.afterClosed().subscribe({
      next: (res) => { 
      }
    });
  }

  // ── UI helpers ────────────────────────────────────────────────
  private readonly _pillarKeywords: { key: string; label: string; color: string }[] = [
    { key: 'people',    label: 'People',     color: 'blue'   },
    { key: 'process',   label: 'Process',    color: 'green'  },
    { key: 'technolog', label: 'Technology', color: 'orange' },
    { key: 'finance',   label: 'Finance',    color: 'purple' },
    { key: 'customer',  label: 'Customer',   color: 'teal'   },
  ];

  getBenefitColorClass(title: string): string {
    if (!title) return 'default';
    const t = title.toLowerCase();
    const match = this._pillarKeywords.find(p => t.includes(p.key));
    return match ? match.color : 'default';
  }

  getPillarLabel(title: string): string {
    if (!title) return '';
    const t = title.toLowerCase();
    const match = this._pillarKeywords.find(p => t.includes(p.key));
    return match ? match.label : '';
  }
}
