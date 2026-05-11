import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';
import { COODashboardService } from '../../../../services/coo-dashboard.service';

@Component({
  selector: 'app-kpi-perspectives-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule
  ],
  templateUrl: './kpi-perspectives-widget.component.html',
  styleUrl: './kpi-perspectives-widget.component.scss'
})
export class KpiPerspectivesWidgetComponent implements OnInit, OnChanges {
  @Input() customerSuccessGoalScore: number = 0;

  public _cooDashboardCommon!: COODashboardCommon;

  constructor(
    private _cooDashboardService: COODashboardService
  ) {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
  }

  ngOnInit(): void {
    this._cooDashboardCommon.customerSuccessGoalScore = this.customerSuccessGoalScore;
  }

  ngOnChanges(): void {
    this._cooDashboardCommon.customerSuccessGoalScore = this.customerSuccessGoalScore;
  }

  getclass(perspective: string): string {
    return perspective.toLowerCase() + 'Bar';
  }

  getDisplayScore(): number {
    const score = this._cooDashboardCommon.customerSuccessGoalScore;
    return score === -1 ? 0 : score;
  }
}
