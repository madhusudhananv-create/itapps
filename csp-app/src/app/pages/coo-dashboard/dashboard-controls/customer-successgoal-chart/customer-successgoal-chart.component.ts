import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatTableDataSource } from '@angular/material';
import { COODashboardCommon } from '../../coo-dashboard-common';

@Component({
   selector: 'app-customer-successgoal-chart',
   templateUrl: './customer-successgoal-chart.component.html',
   styleUrls: ['./customer-successgoal-chart.component.scss']
})
export class CustomerSuccessgoalChartComponent implements OnInit {
   progress: boolean;
   _dataModel: any;
   constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility) {

   }
   selectedQValue: string = 'Q1';
   @Input() chartStyle: string;
   @Input() YTMScore: number;
   @Input() LastQtrScore: number;
   @Input("customerSuccessGoalScore") customerSuccessGoalScore: number = 0;
   startYear = new Date().getFullYear();
   selectedCust: any;
   categories: any[];
   values: any[];

   onClose() {

   }
   ngOnInit(): void {
      this._cooDashboardCommon.customerSuccessGoalScore = this.customerSuccessGoalScore;
   }

   ngOnChanges() {
      this._cooDashboardCommon.customerSuccessGoalScore = this.customerSuccessGoalScore;
   }

   getChartStyle() {
      if (this.chartStyle != undefined) {
         return this.chartStyle;
      }
   }

   getrotatedeg() {
      let deg = 110;
      if (this._cooDashboardCommon.customerSuccessGoalScore != null && this._cooDashboardCommon.customerSuccessGoalScore != undefined) {
         deg = this._cooDashboardCommon.customerSuccessGoalScore == -1 || this._cooDashboardCommon.customerSuccessGoalScore == undefined || this._cooDashboardCommon.customerSuccessGoalScore == null ? 0 : this._cooDashboardCommon.customerSuccessGoalScore;
         if (deg == 50)
            deg = 0;
         else if (deg > 50)
            deg = (deg - 50) * 2.2;
         else if (deg < 50)
            deg = (-50 + deg) * (2.2);

         return deg + "deg";
      }
   }

   Apply() {
   }
   Reset() {

   }

}
