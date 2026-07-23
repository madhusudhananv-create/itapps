import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';
import { COODashboardService } from '../../../../services/coo-dashboard.service';
import { KpiRagStatusService } from '../../../../shared/kpi-rag-status.service';

interface GoalDetail {
  goal?: string;
  kpiArea?: string;
  details?: any[][];
}

@Component({
  selector: 'app-customersuccessgoal-kpiperformance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatRadioModule,
    MatTooltipModule
  ],
  templateUrl: './customersuccessgoal-kpiperformance.component.html',
  styleUrl: './customersuccessgoal-kpiperformance.component.scss'
})
export class CustomersuccessgoalKpiperformanceComponent implements OnInit {
  @Input() showCustomersuccessgoalkpiperformance: boolean = false;
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() projIds: string[] = [];

  public _cooDashboardCommon!: COODashboardCommon;
  selGroupBy: string = '2';
  KPIIndex: number = -1;
  showMetrics: boolean = false;
  isProdView: boolean = false;
  
  // Local state
  progressPopup: boolean = false;
  goalDetails: GoalDetail[] = [];

  constructor(
    private _cooDashboardService: COODashboardService,
    private _sanitizer: DomSanitizer,
    private ragStatusService: KpiRagStatusService
  ) {}

  ngOnInit(): void {
    // Initialize if needed
  }

  onClose(): void {
    this.Reset();
    this.showCustomersuccessgoalkpiperformance = false;
  }

  ShowKPIDetails(i: number): void {
    if (i === this.KPIIndex) {
      this.KPIIndex = -1;
    } else {
      this.KPIIndex = i;
    }
  }

  changeGroupBy(selGroupBy: string): void {
    this.selGroupBy = selGroupBy;
    if (this._cooDashboardCommon) {
      this.GetCustomersuccessKPIPerformance(
        this.projIds,
        this._cooDashboardCommon.dashboardStartdate,
        this._cooDashboardCommon.dashboardEnddate,
        0
      );
    }
  }

  Apply(): void {
    if (this._cooDashboardCommon) {
      this.GetCustomersuccessKPIPerformance(
        this.projIds,
        this._cooDashboardCommon.dashboardStartdate,
        this._cooDashboardCommon.dashboardEnddate,
        0
      );
    }
  }

  Reset(): void {
    this.selGroupBy = '2';
  }

  GetCustomersuccessKPIPerformance(
    projIds: string[],
    startDate: Date,
    endDate: Date,
    goalId: number
  ): void {
    this.progressPopup = true;
    this.goalDetails = [];
    
    // Simulated API call - replace with actual service call when available
    // this._cooDashboardService
    //   .getCustomersuccessKPIPerformance(
    //     [this._cooDashboardCommon.selectedCustomerID],
    //     projIds,
    //     startDate,
    //     endDate,
    //     goalId,
    //     this.selGroupBy
    //   )
    //   .subscribe({
    //     next: (data: any) => {
    //       this.goalDetails = data;
    //       this.progressPopup = false;
    //     },
    //     error: (error: any) => {
    //       this.progressPopup = false;
    //       console.error('Error loading KPI performance:', error);
    //     }
    //   });
    
    // Temporary: Set empty data
    setTimeout(() => {
      this.goalDetails = [];
      this.progressPopup = false;
    }, 500);
  }

  /**
   * Get status based on score percentage
   * Now uses centralized RAG status service with predefined benchmarks
   * Automatically color-codes: Red/Amber/Green/Blue based on performance
   */
  getStatus(score1: string): SafeHtml {
    let ophtml = '';
    const scoreStr = score1.replace('%', '').trim();
    const score = Number.parseInt(scoreStr);

    // Get color code from RAG status service based on predefined benchmarks
    const colorCode = this.ragStatusService.getColorByPercentage(score);
    const statusLabel = this.ragStatusService.getStatusLabel(colorCode);
    
    // Map color codes to visual indicators
    if (colorCode === this.ragStatusService.RAG_COLORS.BLUE) {
      ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;" src="assets/images/up-arrow.png" /> ${statusLabel}`;
    } else if (colorCode === this.ragStatusService.RAG_COLORS.GREEN) {
      ophtml = `<img class="targetImg" style="height: 14px;margin-right: 5px;" src="assets/images/target.png" /> ${statusLabel}`;
    } else if (colorCode === this.ragStatusService.RAG_COLORS.AMBER) {
      ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;" src="assets/images/down-arrow.png" /> ${statusLabel}`;
    } else {
      ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;" src="assets/images/down-arrow.png" /> ${statusLabel}`;
    }

    return this.transform(ophtml);
  }

  /**
   * SECURITY NOTE: bypassSecurityTrustHtml is used here for hardcoded HTML containing image tags.
   * This is safe because:
   * 1. HTML is hardcoded (not from user input)
   * 2. Contains only static asset paths
   * 3. No dynamic content or JavaScript
   * 
   * Consider refactoring to use [src] binding instead of innerHTML for better security.
   */
  transform(value: string): SafeHtml {
    // Validate that value only contains expected safe patterns
    const hasOnlyImages = /^<img[^>]*src="assets\/images\/[a-z-]+\.png"[^>]*\/>.*$/.test(value);
    if (!hasOnlyImages) {
      console.warn('⚠️ Unexpected HTML content in transform():', value);
    }
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }

  getclass(pers: string): string {
    return pers.toLowerCase() + 'Bar';
  }
}
