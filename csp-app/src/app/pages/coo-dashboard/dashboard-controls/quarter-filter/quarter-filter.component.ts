import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatTableDataSource } from '@angular/material';
import { OverallStatusPage1Component } from '../../tab-overall-status/overall-status-page1/overall-status-page1.component';
import { COODashboardCommon } from '../../coo-dashboard-common';

@Component({
   selector: 'app-quarter-filter',
   templateUrl: './quarter-filter.component.html',
   styleUrls: ['./quarter-filter.component.scss']
})
export class QuarterFilterComponent implements OnInit {
   progress: boolean;
   _dataModel: any;
   @Input() widgetname: string;
   selectedQPeriod: any;
   Year: number;
   qEndYear: number;
   qStartDate: Date;
   qEndDate: Date;
   qStartMonth: string;
   qEndMonth: string;
   constructor(public _cooDashboardService: COODashboardService,public _cooDashboardCommon: COODashboardCommon, public _util: myUtility, public _overallStatusPage1Component: OverallStatusPage1Component) {

   }
   selectedQValue: string = 'Q1';
   qStartYear = new Date().getFullYear();
   selectedCust: any;
   categories: any[];
   values: any[];

   onClose() {

   }
   ngOnInit(): void {
      this._cooDashboardCommon.selectedYearCss = this._util.Year();
      //this.top3Performing = 'NP';
      this.qEndYear = this.Year;
      this.qStartYear = this.Year;
      this.selectedQPeriod = "Q" + this._util.getCurrentQuarter();
      this._cooDashboardCommon.selectedQPeriodCss = this.selectedQPeriod;
      this.changeDates();
   }
   changeDates() {
      let dates = this._util.getDatesForQuarter(this._cooDashboardCommon.selectedQPeriodCss, this._cooDashboardCommon.selectedYearCss)
      this.qStartDate = this._util.setLocaleDate(dates.startDate);
      this.qEndDate = this._util.setLocaleDate(dates.endDate);
      this.qStartYear = this.qStartDate.getFullYear();
      this.qEndYear = this.qEndDate.getFullYear();
      this.qStartMonth = this._util.getMonthAbr(this.qStartDate.getMonth());
      this.qEndMonth = this._util.getMonthAbr(this.qEndDate.getMonth());
      this._cooDashboardCommon.qStartYear = this.qStartDate.getFullYear();
      this._cooDashboardCommon.qEndYear = this.qEndDate.getFullYear();
      this._cooDashboardCommon.qStartMonth = this._util.getMonthAbr(this.qStartDate.getMonth());
      this._cooDashboardCommon.qEndMonth = this._util.getMonthAbr(this.qEndDate.getMonth());
      
   }

   getDataForselectedQPeriod(qtr) {
      this._cooDashboardCommon.selectedQPeriodCss = qtr;
      this.changeDates();
      if (this.widgetname == "CustomerSuccessSurvey") {
         this._overallStatusPage1Component.getCustomerSuccessSurveyForDates(this.qStartDate, this.qEndDate);
      }
   }
   Apply() {
   }
   Reset() {

   }
}
