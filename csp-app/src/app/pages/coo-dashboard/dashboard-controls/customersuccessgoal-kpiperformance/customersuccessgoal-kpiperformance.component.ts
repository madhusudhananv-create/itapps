import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatTableDataSource } from '@angular/material';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { debug } from 'util';
import { ChartsService } from '../../../../Services/charts.service';
import { List } from 'sp-pnp-js';
import { COODashboardCommon } from '../../coo-dashboard-common';
import { forEach } from '@angular/router/src/utils/collection';
import { CustomerProjectIds } from '../../../../models/customer-projects-model';
import { CloseComponentService } from '../../../../close-component.service';


@Component({
   selector: 'app-customersuccessgoal-kpiperformance',
   templateUrl: './customersuccessgoal-kpiperformance.component.html',
   styleUrls: ['./customersuccessgoal-kpiperformance.component.scss']
})
export class CustomerSuccessGoalKPIPerformanceComponent implements OnInit {
   progress: boolean;
   _dataModel: any;
   testhtml: string;
   AppSettingstoken: any;
   qStartDate: Date;
   qEndDate: Date; showMetrics = false;
   @Input() showCustomersuccessgoalkpiperformance: boolean = false;
   @Input() startDate: Date;
   @Input() endDate: Date;
   @Input() projIds: string[] = [];
   serviceAreaId: any;
   KPIIndex: any; isProdView = false;
   achievementPer: any;
   selGroupBy = '2';
   kpiId: any;
   goalName: any;
   headerName: any;
   goalData: any = [];
   allcust: boolean = false;
   allproj: boolean = false;
   Customerids: any;
   Projectids: any;
   startYear = new Date().getFullYear();

   constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _chartsService: ChartsService, public _util: myUtility, private _sanitizer: DomSanitizer, private close: CloseComponentService) {
      this.AppSettingstoken = localStorage.getItem('token');
   }

   ngOnInit() {

   }

   getCustomerAndProjects(event: CustomerProjectIds) {
      if (event.customer != undefined) this.Customerids = event.customer;
      if (event.project != undefined) this.Projectids = event.project;
   }

   changeDates() {
      let dates = this._util.getDatesForQuarter("CP", this.startYear)
      this.qStartDate = this._util.setLocaleDate(dates.startDate);
      this.qEndDate = this._util.setLocaleDate(dates.endDate);
   }
   onClose() {
      this.Reset();
      this.showCustomersuccessgoalkpiperformance = !this.showCustomersuccessgoalkpiperformance;
   }


   ShowKPIDetails(i) {
      if (i == this.KPIIndex)
         this.KPIIndex = -1
      else if (i != this.KPIIndex)
         this.KPIIndex = i;
   }

   showThumbsForKPI(val) {
      let achievePer = val.split('%')[0];
      if (val == '-') {
         return '-';
      }
      else if (Number(achievePer) >= Number(this.achievementPer)) {
         return 'Under Control';
      }
      else if (Number(achievePer) < Number(this.achievementPer)) {
         return 'Need Focus';
      }
   }

   changeGroupBy(selGroupBy) {
      this.selGroupBy = selGroupBy;
      this.GetCustomersuccessKPIPerformance(this.projIds, this._cooDashboardCommon.dashboardStartdate, this._cooDashboardCommon.dashboardEnddate, this.serviceAreaId = 0);
   }

   Apply() {
      this.projIds = this.Projectids;
      this.GetCustomersuccessKPIPerformance(this.projIds, this._cooDashboardCommon.dashboardStartdate, this._cooDashboardCommon.dashboardEnddate, this.serviceAreaId = 0);
   }

   Reset(): void {
      this.close.sendUpdate();
      this.selGroupBy = '2';

   }

   GetCustomersuccessKPIPerformance(projIds, startDate, endDate, goalId = 0) {
      this._cooDashboardCommon.progressPopup = true;
      this._cooDashboardCommon.goalDetails = [];
      this._cooDashboardService.getCustomersuccessKPIPerformance([this._cooDashboardCommon.selectedCustomerID], projIds, startDate, endDate, goalId, this.selGroupBy)
         .subscribe
         (
            data => {
               this._cooDashboardCommon.goalDetails = data;
               this._cooDashboardCommon.cssGoalDetails = data;
               this._cooDashboardCommon.progressPopup = false;
            },
            error => {
               this._cooDashboardCommon.progressPopup = false;
               this._util.serviceError(error);
            },
         );
   }

   getStatus(score1): SafeHtml {
      let ophtml = "";
      let score = Number.parseInt(score1.replace("%", "").trim());
      if (score >= 95) {
         ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;" src="../../../../../assets/images/up-arrow.png" /> Above Target`;
      }
      else if (score >= 85) {
         ophtml = `<img class="targetImg" style="height: 14px;margin-right: 5px;" src="../../../../../assets/images/target.png" /> On Target`;
      }
      else if (score >= 70) {
         ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;"  src="../../../../../assets/images/down-arrow.png" /> Below Target`;
      }
      else {
         ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;"  src="../../../../../assets/images/down-arrow.png" /> Needs Improvement`;

      } this.testhtml = ophtml;
      return this.transform(ophtml);
   }

   transform(value: any) {
      return this._sanitizer.bypassSecurityTrustHtml(value);
   }

   getclass(pers: string) {
      return pers.toLowerCase() + "Bar";
   }

}
