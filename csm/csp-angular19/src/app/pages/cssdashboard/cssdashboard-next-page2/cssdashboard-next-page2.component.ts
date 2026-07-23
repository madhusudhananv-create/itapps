import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HighchartsChartComponent } from 'highcharts-angular';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { Highcharts } from '../../../highcharts-init';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';
import { inject } from '@angular/core';

@Component({
  selector: 'app-cssdashboard-next-page2',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressBarModule, MatCheckboxModule, HighchartsChartComponent],
  templateUrl: './cssdashboard-next-page2.component.html',
  styleUrl: './cssdashboard-next-page2.component.scss'
})
export class CssdashboardNextPage2Component implements OnInit, OnChanges {
  
  private _util = inject(MyUtility);
  private _appService = inject(AppsService);

  @Input("allCust") allCust: Boolean = false;
  @Input("customerId") customerId?: string;
  @Input("fromDate") fromDate?: Date;
  @Input("toDate") toDate?: Date;
  @Input("customerIds") customerIds?: string;
  @Input("frequency") frequency?: string;
  @Input("trendQuarter") trendQuarter?: number;
  customerList!: CssdashboardInputs;
  surveyQuestions: any;
  chart1: any;
  chart2: any;
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 15;
  min = 0;
  showTicks = false;
  step = 5;
  value = 0;
  vertical = false;
  stackLabels = true;
  showTrendData = false;
  _loading = false;

  Highcharts = Highcharts;

  ngOnInit() {
  }

  ngOnChanges() {
    if(this.trendQuarter == 2) {
      this.showTrendData = true;
    } else {
      this.showTrendData = false;
    }
    
    this.bindCSATInputs();
    this.getSurveyQuestions(this.showTrendData);
  }

  bindCSATInputs() {
    if (!this.fromDate || !this.toDate) {
      return;
    }
    let obj = new CssdashboardInputs();
    obj.StarT_DATE = this.fromDate.toDateString();
    obj.enD_DATE = this.toDate.toDateString();
    obj.customeR_IDS = this.customerIds || '';
    obj.frequency = this.frequency || '';
    this.customerList = obj;
  }

  getSurveyQuestions(shouldLoadTrendWiseData: boolean) {
    if (!this.customerList) {
      return;
    }
    this._loading = true;
    this._appService.getQuestionWiseRatingForCSATInsight(this.customerList, shouldLoadTrendWiseData).subscribe({
      next: (data: any) => {
        this.surveyQuestions = data;
        this._loading = false;
      },
      error: (error: any) => { this._util.serviceError(error); this._loading = false; }
    })
  }

  loadTrendWiseData(event: any) {
    this._loading = true;
    this.getSurveyQuestions(event.checked);
  }
}
