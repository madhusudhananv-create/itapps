import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';
import { Highcharts } from '../../../highcharts-init';

@Component({
  selector: 'app-cssdashboard-css-table',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule
  ],
  templateUrl: './cssdashboard-css-table.component.html',
  styleUrl: './cssdashboard-css-table.component.scss'
})
export class CssdashboardCssTableComponent implements OnInit {

  trendChartDataNPS: any;
  trendChartDataNPSInPercentage: any;
  surveyQuestions: any;
  heatMapData: any;
  projNm: any;
  ddyear: number[] = [];
  selectedQuarter: string = "Q1";
  selectedYear: number = 0;
  pieChartData: any;
  trendChartData: any;
  csatProjWise: any;
  chart1: any;
  chart2: any;
  surveyData: any;
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
  customer: any = [];
  startDate = new Date();
  endDate = new Date();
  @Input("isLoaded") isLoaded?: boolean;
  @Input("cssDashboardInputs") cssDashboardInputs: CssdashboardInputs = new CssdashboardInputs();
  _loading: boolean = false;

  private _util = inject(MyUtility);
  private _appService = inject(AppsService);

  Highcharts = Highcharts;

  ngOnInit() {
    // Initialization handled in ngOnChanges
  }

  openSurveyFeedback(url: string) {
    window.open(url, '_blank');
  }

  ngOnChanges() {
    this.getCSATHeatmap1();
  }

  getCSATHeatmap1() {
    if (this.cssDashboardInputs != null && this.cssDashboardInputs != undefined) {
      // Don't call API if dates are empty or invalid
      if (!this.cssDashboardInputs.StarT_DATE || !this.cssDashboardInputs.enD_DATE || 
          this.cssDashboardInputs.StarT_DATE === "" || this.cssDashboardInputs.enD_DATE === "") {
        return;
      }
      
      this._loading = true;
      if ((this.cssDashboardInputs.csM_IDs != null && this.cssDashboardInputs.csM_IDs != undefined) ||
        (this.cssDashboardInputs.customeR_IDS != null && this.cssDashboardInputs.customeR_IDS != undefined)) {
        this._appService.getCSATHeatMapForPeriod(this.cssDashboardInputs).subscribe({
          next: (data: any) => {
            this.heatMapData = data;
            this._loading = false;
          },
          error: (error: any) => { this._util.serviceError(error); this._loading = false; }
        })
      }
    }
  }

  getSurveyData1() {
    if (this.cssDashboardInputs != null && this.cssDashboardInputs != undefined) {
      // Don't call API if dates are empty or invalid
      if (!this.cssDashboardInputs.StarT_DATE || !this.cssDashboardInputs.enD_DATE || 
          this.cssDashboardInputs.StarT_DATE === "" || this.cssDashboardInputs.enD_DATE === "") {
        return;
      }
      
      this._loading = true;
      this.surveyData = undefined;
      this._appService.getSurveyDataPeriodwise(this.cssDashboardInputs).subscribe({
        next: (data: any) => {
          this.surveyData = data;
          this._loading = false;
        },
        error: (error: any) => { this._util.serviceError(error); this._loading = false; }
      })
    }
  }

  getNPSTrendDataInPercentage() {
    if (this.cssDashboardInputs != null && this.cssDashboardInputs != undefined) {
      // Don't call API if dates are empty or invalid
      if (!this.cssDashboardInputs.StarT_DATE || !this.cssDashboardInputs.enD_DATE || 
          this.cssDashboardInputs.StarT_DATE === "" || this.cssDashboardInputs.enD_DATE === "") {
        return;
      }
      
      this._loading = true;
      this.trendChartDataNPSInPercentage = undefined;
      this._appService.getResponseCategoryData(this.cssDashboardInputs).subscribe({
        next: (data: any) => {
          this.trendChartDataNPSInPercentage = data;
          this._loading = false;
        },
        error: (error: any) => { this._util.serviceError(error); this._loading = false; }
      })
    }
  }

  bindCSATInputs() {
    // Inputs are bound via @Input decorator
  }
}
