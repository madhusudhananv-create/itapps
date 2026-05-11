import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MyUtility } from '../../../../shared/my-utility';
import { ChartsService } from '../../../../services/charts.service';
import { ViewTrendChartComponent } from '../view-trend-chart/view-trend-chart.component';
import { AppsService } from '../../../../services/apps.service';

@Component({
  selector: 'app-dashboard-engagement-level-achievement-detail',
  templateUrl: './dashboard-engagement-level-achievement-detail.component.html',
  styleUrls: ['./dashboard-engagement-level-achievement-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class DashboardEngagementLevelAchievementDetailComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _appService: AppsService,
    private dialog: MatDialogRef<DashboardEngagementLevelAchievementDetailComponent>, private _chartsService: ChartsService, public _util: MyUtility, public dialog2: MatDialog) { }

  engagementKPI!: any[];
  viewBy!: string;
  custId!: string;
  trendHighChart: any;
  isLoading: boolean = false;
  includeExclusions!: boolean;
  date!: Date;
  calcualtiondifferedKPI: any;

  ngOnInit() {
    if (this.data != null) {
      this.engagementKPI = this.data.engagementlevelDetails;
      this.viewBy = this.data.viewBy;
      this.custId = this.data.custId;
      this.includeExclusions = Boolean(this.data.includeExclusions);
      this.date = new Date(this.data.date);
    }
    
    this._appService.GetDBConfigValueFields("KPI_LESS_THAN_EXPECTED_SERVICE_LEVEL", this.custId, "").subscribe((data: any) => {
      this.calcualtiondifferedKPI = data;   
    });
  }

  onClose() {
    this.dialog.close();
  }


  getAchievementStatus(kpiname: any, expected: any, actual: any) {
    let achievement = '';  
    
    if (actual != null) {
      let kpiExist = this.calcualtiondifferedKPI.includes(kpiname);

      if (kpiExist) {
      
        if (actual <= expected) {
          achievement = 'Met'
        }
        else {
          achievement = 'Not Met'
        }
      }
      else {
        if (actual >= expected) {
          achievement = 'Met'
        }
        else {
          achievement = 'Not Met'
        }
      }
    }

    return achievement;
  }

  getTrendHighChartDetails(kpiName: any) {

    let portId = null;
    this.isLoading = true;
    this._chartsService.getTrendHighChartDetailsForEngagement(this.custId, kpiName, this.date, this._util.AppSettings.token, this.viewBy).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].trendHighChart.length > 0) {
              for (let j = 0; j < data[i].trendHighChart.length; j++) {
                // trendHighChart is already a Highcharts options object
                // No need to wrap it in Chart constructor
              }
            }
          }
        }
        this.trendHighChart = data;
      },
      error: (error: any) => { this._util.serviceError(error); this.isLoading = false;},
      complete: () => {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
          'portfolioId': portId,
          'kpiName': kpiName,
          'ChartData': this.trendHighChart
        }
        dialogConfig.maxWidth = "90%";
        dialogConfig.height = "auto";
        dialogConfig.width = "90%";
        const dialogRef = this.dialog2.open(ViewTrendChartComponent, dialogConfig);
      }
    });
      this.isLoading = false;
  }

  displayGraph(kpiName: any) {
    this.getTrendHighChartDetails(kpiName);
  }


}
