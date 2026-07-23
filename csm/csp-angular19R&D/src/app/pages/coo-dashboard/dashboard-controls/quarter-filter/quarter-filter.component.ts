import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';
import { COODashboardService } from '../../../../services/coo-dashboard.service';
import { AppsService } from '../../../../services/apps.service';

@Component({
  selector: 'app-quarter-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quarter-filter.component.html',
  styleUrl: './quarter-filter.component.scss'
})
export class QuarterFilterComponent implements OnInit {
  @Input() widgetname: string = '';
  @Output() quarterChanged = new EventEmitter<{startDate: Date, endDate: Date}>();

  selectedQPeriod: string = 'Q1';
  Year: number = new Date().getFullYear();
  qEndYear: number = new Date().getFullYear();
  qStartYear: number = new Date().getFullYear();
  qStartDate!: Date;
  qEndDate!: Date;
  qStartMonth: string = '';
  qEndMonth: string = '';

  public _cooDashboardCommon!: COODashboardCommon;

  constructor(
    private _cooDashboardService: COODashboardService,
    private _appService: AppsService
  ) {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
  }

  ngOnInit(): void {
    this._cooDashboardCommon.selectedYearCsg = new Date().getFullYear();
    this.qEndYear = this.Year;
    this.qStartYear = this.Year;
    this.selectedQPeriod = 'Q' + this.getCurrentQuarter();
    this._cooDashboardCommon.selectedQPeriodCsg = this.selectedQPeriod;
    this.changeDates();
  }

  getCurrentQuarter(): number {
    const now = new Date();
    const month = now.getMonth() + 1;
    if (month >= 4 && month <= 6) return 1;
    else if (month >= 7 && month <= 9) return 2;
    else if (month >= 10 && month <= 12) return 3;
    else return 4;
  }

  changeDates(): void {
    const dates = this.getDatesForQuarter(
      this._cooDashboardCommon.selectedQPeriodCsg,
      this._cooDashboardCommon.selectedYearCsg
    );
    this.qStartDate = this.setLocaleDate(dates.startDate);
    this.qEndDate = this.setLocaleDate(dates.endDate);
    this.qStartYear = this.qStartDate.getFullYear();
    this.qEndYear = this.qEndDate.getFullYear();
    this.qStartMonth = this.getMonthAbr(this.qStartDate.getMonth());
    this.qEndMonth = this.getMonthAbr(this.qEndDate.getMonth());
  }

  getDataForselectedQPeriod(qtr: string): void {
    this._cooDashboardCommon.selectedQPeriodCsg = qtr;
    this.changeDates();
    
    // Emit event to parent component
    this.quarterChanged.emit({
      startDate: this.qStartDate,
      endDate: this.qEndDate
    });
  }

  getDatesForQuarter(quarter: string, year: number): { startDate: string, endDate: string } {
    let startDate = '';
    let endDate = '';
    
    switch (quarter) {
      case 'Q1':
        startDate = `${year}-04-01`;
        endDate = `${year}-06-30`;
        break;
      case 'Q2':
        startDate = `${year}-07-01`;
        endDate = `${year}-09-30`;
        break;
      case 'Q3':
        startDate = `${year}-10-01`;
        endDate = `${year}-12-31`;
        break;
      case 'Q4':
        startDate = `${year + 1}-01-01`;
        endDate = `${year + 1}-03-31`;
        break;
      case 'YT':
        startDate = `${year}-04-01`;
        endDate = new Date().toISOString().split('T')[0];
        break;
      default:
        startDate = `${year}-04-01`;
        endDate = `${year}-06-30`;
    }
    
    return { startDate, endDate };
  }

  setLocaleDate(dateString: string): Date {
    return new Date(dateString);
  }

  getMonthAbr(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
  }
}
