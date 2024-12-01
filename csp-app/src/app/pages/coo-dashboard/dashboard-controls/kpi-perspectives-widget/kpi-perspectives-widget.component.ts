import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatTableDataSource } from '@angular/material';
import { COODashboardCommon } from '../../coo-dashboard-common';

@Component({
   selector: 'app-kpi-perspectives-widget',
   templateUrl: './kpi-perspectives-widget.component.html',
   styleUrls: ['./kpi-perspectives-widget.component.scss']
})
export class KpiPerspectivesWidgetComponent implements OnInit {
   progress: boolean;
   _dataModel: any;
   @Input("customerSuccessGoalScore") customerSuccessGoalScore: number;
   constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility) {

   }
   selectedQValue: string = 'Q1';
   @Input() isvisible = false;
   range1: any[] = [2022, 2023];
   startYear = new Date().getFullYear();
   selectedCust: any;
   categories: any[];
   values: any[];
   overallScore: string;
   performance: string;
   compliance: string;
   value: string;
   quality: string;
   performanceBar: string = "80";
   qualityBar: string = "79";
   compilanceBar: string = "56";
   valueBar: string = "45";

   onClose() {

   }
   ngOnInit(): void {
      this._cooDashboardCommon.customerSuccessGoalScore = this.customerSuccessGoalScore;
   }

   ngOnChanges() {
      this._cooDashboardCommon.customerSuccessGoalScore = this.customerSuccessGoalScore;
   }

   getclass(pers: string) {
      return pers.toLowerCase() + "Bar";
   }

   getrotatedeg() {
      let deg = 110;
      if (this._cooDashboardCommon.customerSuccessGoalScore != null && this._cooDashboardCommon.customerSuccessGoalScore != undefined) {
         deg = this._cooDashboardCommon.customerSuccessGoalScore == -1 ? 0 : this._cooDashboardCommon.customerSuccessGoalScore;
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
