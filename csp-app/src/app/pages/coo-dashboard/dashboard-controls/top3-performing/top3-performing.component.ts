import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatTableDataSource } from '@angular/material';
import { NameValuePair } from '../../../../models/coo-dashboard-model';
import { COODashboardCommon } from '../../coo-dashboard-common';

@Component({
   selector: 'app-top3-performing',
   templateUrl: './top3-performing.component.html',
   styleUrls: ['./top3-performing.component.scss']
})
export class Top3PerformingComponent implements OnInit {
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
   top3Accounts: NameValuePair[];
   top3Portfolios: NameValuePair[];
   top3Projects: NameValuePair[];
   top3AccountsCsg: NameValuePair[];
   top3PortfoliosCsg: NameValuePair[];
   top3ProjectsCsg: NameValuePair[];
   @Input() top3Performing: string = "P";
   nonPerformDataAccounts: any;
   nonPerformDataPortfolios: any;
   nonPerformDataProjects: any;
   performDataAccounts: any;
   performDataPortfolios: any;
   performDataProjects: any;
   constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility) {

   }
   selectedQValue: string = 'Q1';
   qStartYear = new Date().getFullYear();
   selectedCust: any;
   categories: any[];
   values: any[];

   onClose() {

   }
   ngOnInit(): void {
      this.top3Performing = "P";
      this.Year = this._util.Year();
      this.qEndYear = this.Year;
      this.qStartYear = this.Year;
      this.selectedQPeriod = "Q" + this._util.getCurrentQuarter();
      this.changeDates();
   }
   changeDates() {
      let dates = this._util.getDatesForQuarter(this.selectedQPeriod, this.Year)
      this.qStartDate = this._util.setLocaleDate(dates.startDate);
      this.qEndDate = this._util.setLocaleDate(dates.endDate);
      this.qStartYear = this.qStartDate.getFullYear();
      this.qEndYear = this.qEndDate.getFullYear();
      this.qStartMonth = this._util.getMonthAbr(this.qStartDate.getMonth());
      this.qEndMonth = this._util.getMonthAbr(this.qEndDate.getMonth());
   }

   binddata(widgetname) {
      if (this.widgetname == "CustomerSuccessSurvey" || widgetname == "CustomerSuccessSurvey") {
         let d = this._cooDashboardCommon.customerSuccessSurvey.customerSuccessScoresResults;
         let performDataAccounts = [];
         let performDataPortfolios = [];
         let performDataProjects = [];
         let nonPerformDataAccounts = [];
         let nonPerformDataPortfolios = [];
         let nonPerformDataProjects = [];
         if (d.cusT_CSAT != undefined) {
            let custd = d.cusT_CSAT;
            custd.forEach(function (value) {
               if (value.nps == 100) {
                  performDataAccounts.push(new NameValuePair(value.cusT_NAME, value.nps));
               }
               else {
                  nonPerformDataAccounts.push(new NameValuePair(value.cusT_NAME, value.nps));
               }
            });
            let portd = d.portfoliO_CSAT;
            portd.forEach(function (value) {
               if (value.nps == 100) {
                  performDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.nps));
               }
               else {
                  nonPerformDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.nps));
               }
            });
            let projd = d.projecT_CSAT;
            projd.forEach(function (value) {
               if (value.nps == 100) {
                  performDataProjects.push(new NameValuePair(value.proJ_NAME, value.nps));
               }
               else {
                  nonPerformDataProjects.push(new NameValuePair(value.proJ_NAME, value.nps));
               }
            });
            this.performDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts), true);// this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts));// performDataAccounts.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
            this.performDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataPortfolios), true);
            this.performDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataProjects), true); //performDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
            this.nonPerformDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataAccounts));  //nonPerformDataAccounts.sort((n1, n2) => { return n1.value - n2.value; })//;.slice(0, 3);
            this.nonPerformDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataPortfolios)); // nonPerformDataPortfolios.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
            this.nonPerformDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataProjects)); // nonPerformDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
            if (this.performDataAccounts == undefined || this.performDataAccounts.length == 0) {
               this.performDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts), true);// this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts));// performDataAccounts.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
               this.performDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataPortfolios), true);
               this.performDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataProjects), true); //performDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
               this.nonPerformDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataAccounts));  //nonPerformDataAccounts.sort((n1, n2) => { return n1.value - n2.value; })//;.slice(0, 3);
               this.nonPerformDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataPortfolios)); // nonPerformDataPortfolios.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
               this.nonPerformDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataProjects)); // nonPerformDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
            }
         }
      }
   }
   loaddata(widgetname) {
      this.binddata(widgetname);
      this.ontop3PerformingChange(this.top3Performing);
   }
   getDataForselectedQPeriod(qtr) {
      this.selectedQPeriod = qtr;
      this.changeDates();
   }
   Apply() {
   }
   Reset() {

   }

   ontop3PerformingChange(event) {
      this.top3Performing = event;
      this.binddata("");
      this._cooDashboardCommon.top3CSSAccounts = [];
      this._cooDashboardCommon.top3CSSPortfolios = [];
      this._cooDashboardCommon.top3CSSProjects = [];

      if (this.top3Performing == "NP") {
         if (this.nonPerformDataAccounts != undefined && this.nonPerformDataAccounts != null)
            this._cooDashboardCommon.top3CSSAccounts = this.nonPerformDataAccounts.slice(0, 3);
         if (this.nonPerformDataPortfolios != undefined && this.nonPerformDataPortfolios != null)
            this._cooDashboardCommon.top3CSSPortfolios = this.nonPerformDataPortfolios.slice(0, 3);
         if (this.nonPerformDataProjects != undefined && this.nonPerformDataProjects != null)
            this._cooDashboardCommon.top3CSSProjects = this.nonPerformDataProjects.slice(0, 3);
      }
      else {
         if (this.performDataAccounts != undefined && this.performDataAccounts != null)
            this._cooDashboardCommon.top3CSSAccounts = this.performDataAccounts.slice(0, 3);
         if (this.performDataPortfolios != undefined && this.performDataPortfolios != null)
            this._cooDashboardCommon.top3CSSPortfolios = this.performDataPortfolios.slice(0, 3)
         if (this.performDataProjects != undefined && this.performDataProjects != null)
            this._cooDashboardCommon.top3CSSProjects = this.performDataProjects.slice(0, 3);
      }
   }
   OntabChange() {

   }
}
