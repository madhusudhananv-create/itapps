import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';
import { COODashboardService } from '../../../../services/coo-dashboard.service';

@Component({
  selector: 'app-customer-successgoal-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-successgoal-chart.component.html',
  styleUrl: './customer-successgoal-chart.component.scss'
})
export class CustomerSuccessgoalChartComponent implements OnInit, OnChanges {
  @Input() chartStyle: string = 'mediumchart';
  @Input() YTMScore: number = 0;
  @Input() LastQtrScore: number = 0;
  @Input() customerSuccessGoalScore: number = 0;

  public _cooDashboardCommon!: COODashboardCommon;

  constructor(
    private _cooDashboardService: COODashboardService
  ) {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
  }

  ngOnInit(): void {
    this._cooDashboardCommon.customerSuccessGoalScore = this.customerSuccessGoalScore;
    this._cooDashboardCommon.LastQtrScore = this.LastQtrScore;
    this._cooDashboardCommon.YTMScore = this.YTMScore;
  }

  ngOnChanges(): void {
    this._cooDashboardCommon.customerSuccessGoalScore = this.customerSuccessGoalScore;
    this._cooDashboardCommon.LastQtrScore = this.LastQtrScore;
    this._cooDashboardCommon.YTMScore = this.YTMScore;
  }

  getChartStyle(): string {
    if (this.chartStyle !== undefined) {
      return this.chartStyle;
    }
    return 'mediumchart';
  }

  getrotatedeg(): string {
    let deg = 110;
    const score = this._cooDashboardCommon.customerSuccessGoalScore;
    
    if (score !== null && score !== undefined && score !== -1) {
      deg = score;
      
      if (deg === 50) {
        deg = 0;
      } else if (deg > 50) {
        deg = (deg - 50) * 2.2;
      } else if (deg < 50) {
        deg = (-50 + deg) * 2.2;
      }
      
      return deg + 'deg';
    }
    
    return '0deg';
  }

  getDisplayScore(): number {
    const score = this._cooDashboardCommon.customerSuccessGoalScore;
    return score === -1 ? 0 : score;
  }
}
