import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';

@Component({
  selector: 'app-customer-success-survey',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule
  ],
  templateUrl: './customer-success-survey.component.html',
  styleUrl: './customer-success-survey.component.scss'
})
export class CustomerSuccessSurveyComponent implements OnInit {
  @Input() cssNpsChangeStr: string = '0% decrease';

  public _cooDashboardCommon!: COODashboardCommon;
  successScore: number = 0;
  npsSocre: number = 0;
  noOfSurveys: number = 0;
  noOfResponded: string = '0(0%)';
  noOfYetToRespond: string = '0(0%)';
  surveyRating1: string = '0(0%)';
  surveyRating2: string = '0(0%)';
  surveyRating3: string = '0(0%)';
  surveyRating4: string = '0(0%)';
  surveyRating5: string = '0(0%)';

  constructor() {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
  }

  ngOnInit(): void {
    this.getSummary();
  }

  getSummary(): void {
    const d = this._cooDashboardCommon.customerSuccessSurvey;
    
    if (d) {
      if (d.csaT_SUMMARY) {
        this.npsSocre = d.csaT_SUMMARY.npS_SCORE;
        this.noOfSurveys = d.csaT_SUMMARY.nO_OF_SURVEYS;
        this.noOfResponded = d.csaT_SUMMARY.nO_OF_RESPONDED == 0 
          ? String(d.csaT_SUMMARY.nO_OF_RESPONDED)
          : d.csaT_SUMMARY.nO_OF_RESPONDED + '(' + Math.round((d.csaT_SUMMARY.nO_OF_RESPONDED / d.csaT_SUMMARY.nO_OF_SURVEYS) * 100) + '%)';
        this.noOfYetToRespond = d.csaT_SUMMARY.nO_OF_YET_TO_RESPOND == 0
          ? String(d.csaT_SUMMARY.nO_OF_YET_TO_RESPOND)
          : d.csaT_SUMMARY.nO_OF_YET_TO_RESPOND + '(' + Math.round((d.csaT_SUMMARY.nO_OF_YET_TO_RESPOND / d.csaT_SUMMARY.nO_OF_SURVEYS) * 100) + '%)';
        this.getCustomerSuccessScore(d.csaT_SUMMARY.nO_OF_SURVEYS, d.csat);
      }
      if (d.csat && d.csat.length > 0) {
        this.surveyRating1 = this.getSurveyRating(d.csat, 1);
        this.surveyRating2 = this.getSurveyRating(d.csat, 2);
        this.surveyRating3 = this.getSurveyRating(d.csat, 3);
        this.surveyRating4 = this.getSurveyRating(d.csat, 4);
        this.surveyRating5 = this.getSurveyRating(d.csat, 5);
      } else {
        this.surveyRating1 = '0(0%)';
        this.surveyRating2 = '0(0%)';
        this.surveyRating3 = '0(0%)';
        this.surveyRating4 = '0(0%)';
        this.surveyRating5 = '0(0%)';
      }
    }
  }

  getCustomerSuccessScore(totalSurveys: number, d: any[]): void {
    if (d && d.length > 0) {
      const positiveRatingsCount = d.filter(x => x.miN_SCORE === 4 || x.miN_SCORE === 5).length;
      this.successScore = Math.round((positiveRatingsCount / totalSurveys) * 100);
    }
  }

  getSurveyRating(d: any[], i: number): string {
    if (d.length > 0) {
      const temp = d.filter(x => x.miN_SCORE == i);
      return temp.length + '(' + Math.round((temp.length / d.length) * 100) + '%)';
    }
    return '0(0%)';
  }
}
