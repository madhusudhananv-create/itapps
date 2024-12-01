import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatTableDataSource } from '@angular/material';
import { COODashboardCommon } from '../../coo-dashboard-common';

@Component({
   selector: 'app-customer-success-survey',
   templateUrl: './customer-success-survey.component.html',
   styleUrls: ['./customer-success-survey.component.scss']
})
export class CustomerSuccessSurveyComponent implements OnInit {
   progress: boolean;
   _dataModel: any;
   @Input() customerSuccessGoalScore: number;
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
   npsSocre: number = 0;
   noOfSurveys: number = 0;
   noOfResponded = "0(0%)";
   noOfYetToRespond = "0(0%)";
   surveyRating1 = "0(0%)";
   surveyRating2 = "0(0%)";
   surveyRating3 = "0(0%)";
   surveyRating4 = "0(0%)";
   surveyRating5 = "0(0%)";
   @Input() cssNpsChangeStr = "0% decrease";
   onClose() {

   }
   ngOnInit(): void {
      //this._cooDashboardCommon.customerSuccessGoalScore = this._cooDashboardCommon.overallHealthIndex;
      // this.getOverallHealthIndexTrend();
   }
   getSummary() {
      let d = this._cooDashboardCommon.customerSuccessSurvey;
      if (d != undefined && d != null) {
         if (d.csaT_SUMMARY != undefined && d.csaT_SUMMARY != null) {
            this.npsSocre = d.csaT_SUMMARY.npS_SCORE;
            this.noOfSurveys = d.csaT_SUMMARY.nO_OF_SURVEYS;
            this.noOfResponded = d.csaT_SUMMARY.nO_OF_RESPONDED == 0 ? d.csaT_SUMMARY.nO_OF_RESPONDED : d.csaT_SUMMARY.nO_OF_RESPONDED + "(" + Math.round((d.csaT_SUMMARY.nO_OF_RESPONDED / d.csaT_SUMMARY.nO_OF_SURVEYS) * 100) + "%)";
            this.noOfYetToRespond = d.csaT_SUMMARY.nO_OF_YET_TO_RESPOND == 0 ? d.csaT_SUMMARY.nO_OF_YET_TO_RESPOND : d.csaT_SUMMARY.nO_OF_YET_TO_RESPOND + "(" + Math.round((d.csaT_SUMMARY.nO_OF_YET_TO_RESPOND / d.csaT_SUMMARY.nO_OF_SURVEYS) * 100) + "%)";;
         }
         if (d.csat != null && d.csat != undefined && d.csat.length > 0) {
            this.surveyRating1 = this.getSurveyRating(d.csat, 1);
            this.surveyRating2 = this.getSurveyRating(d.csat, 2);
            this.surveyRating3 = this.getSurveyRating(d.csat, 3);
            this.surveyRating4 = this.getSurveyRating(d.csat, 4);
            this.surveyRating5 = this.getSurveyRating(d.csat, 5);
         }
         else {
            this.surveyRating1 = "0(0%)";
            this.surveyRating2 = "0(0%)";
            this.surveyRating3 = "0(0%)";
            this.surveyRating4 = "0(0%)";
            this.surveyRating5 = "0(0%)";
         }
      }
   }
   getSurveyRating(d, i) {
      if (d.length > 0) {
         let temp = d.filter(x => x.miN_SCORE == i);
         return temp.length + "(" + Math.round((temp.length / d.length) * 100) + "%)";
      }
      else
         return "0(0%)"
   }
   Apply() {
   }
   Reset() {

   }

}
