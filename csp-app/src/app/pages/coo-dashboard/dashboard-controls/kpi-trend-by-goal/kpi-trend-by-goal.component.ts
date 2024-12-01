
import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { LayoutService } from '../../../layout/layout.service';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatOption, MatSelect } from '@angular/material';
import { ProjectModelNew } from '../../../../models/portfolio-model';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material';
import { MatIconModule } from '@angular/material';
import { MatInput } from '@angular/material/input';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { type } from 'os';
import { ChartsService } from '../../../../Services/charts.service';
import { COODashboardCommon } from '../../coo-dashboard-common';

@Component({
  selector: 'app-kpi-trend-by-goal',
  templateUrl: './kpi-trend-by-goal.component.html',
  styleUrls: ['./kpi-trend-by-goal.component.scss']
})
export class KPITrendByGoalComponent implements OnInit {
  progress: boolean;
  _dataModel: any;
  trendHighChart: any;
  prodId: any;
  viewBy: string; selectedProject: string;
  @Input() showkpitrendbygoal: boolean = false;  
  @Input() kpiId: number = 0;
  @Input() goalName: string = "";
  @Input() projIds:any= [];
  constructor(public _cooDashboardService: COODashboardService,public _cooDashboardCommon: COODashboardCommon, public _chartsService: ChartsService, public _util: myUtility) {

  }

  selectedPeriod = 'asToday';
  selectedValue: string = 'Quarter';
  range1: any[] = [2022, 2023];
  startYear = new Date().getFullYear();
  selectedCust: any;
  categories: any[];
  values: any[];
  Year: number;
  qStartDate: Date;
  qEndDate: Date;
  onClose() {
    this.showkpitrendbygoal = !this.showkpitrendbygoal;
  }
  ngOnInit(): void {
    if (this.kpiId > 0 && this.goalName != undefined && this.goalName != "") {
      this._cooDashboardCommon.progressPopup = false;
      if (this.viewBy == "") {
        this.viewBy = "By Expected Service Level";
      }
      this.Year = new Date().getFullYear();
      let dates = this._util.getDatesForQuarter("CP", this.Year);
      this.qStartDate = this._util.setLocaleDate(dates.startDate);
      this.qEndDate = this._util.setLocaleDate(dates.endDate);
      this.getTrendHighChartDetails();
    }
  }


  displayGraph() { 
    let selectedGraph = this.trendHighChart.filter(x => x.goalName == this.goalName.split('|')[0])[0].trendHighChart.filter(x => x.kpiId == this.kpiId)[0].trendHighChart;
    // const dialogConfig = new MatDialogConfig();
    // let dialogSendData = {
    //   'KPIId': kpiid,
    //   'GoalName': goalname,
    //   'ChartData': this.trendHighChart
    // }
    // dialogConfig.autoFocus = true;
    // dialogConfig.data = dialogSendData;
    // dialogConfig.height = "80%",
    //   dialogConfig.width = "65%"
    // const dialogRef = this.dialog.open(TrendHighChartComponent, dialogConfig);
    // dialogRef.updatePosition({ top: '30px' });
  }
  
  changeDates() {
    if(this.Year== undefined)
    this.Year= new Date().getFullYear()
    let dates = this._util.getDatesForQuarter('CP', this.Year)
    this.qStartDate = this._util.setLocaleDate(dates.startDate);
    this.qEndDate = this._util.setLocaleDate(dates.endDate); 
  }

  getTrendHighChartDetails() {
this.changeDates();
    let date: Date = new Date(this.qEndDate.getFullYear() + "-" + this.qEndDate.getMonth + '-01');
    // if (this._util.IsPremier(this._cooDashboardCommon.selectedCustomerID) && this.prodId != undefined) {
    //   this._chartsService.getTrendHighChartDetailsForProductKPI(this._cooDashboardCommon.selectedCustomerID,this.projIds, date, this._util.AppSettings.token, this.viewBy).subscribe(
    //     data => {
    //       if (data.length > 0) {
    //         for (let i = 0; i < data.length; i++) {
    //           if (data[i].trendHighChart.length > 0) {
    //             for (let j = 0; j < data[i].trendHighChart.length; j++) {
    //               data[i].trendHighChart[j].trendHighChart = new Chart(data[i].trendHighChart[j].trendHighChart);
    //             }

    //           }
    //         }
    //       }
    //       this.trendHighChart = data; this.displayGraph();
    //     }, error => {
    //       this._util.serviceError(error);
    //     }
    //   )
    // }
    // else {
      this._cooDashboardService.GetKPITrendTargetActualsByGoal([this._cooDashboardCommon.selectedCustomerID], this._cooDashboardCommon.selectedprojIds, this.qStartDate, this.qEndDate ).subscribe(
        data => {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              if (data[i].trendHighChart.length > 0) {
                for (let j = 0; j < data[i].trendHighChart.length; j++) {
                  data[i].trendHighChart[j].trendHighChart = new Chart(data[i].trendHighChart[j].trendHighChart);
                }

              }
            }
          }
          this.trendHighChart = data;
          this.displayGraph();
        },
        error => {
          this._util.serviceError(error);
        }
      )
    // }

  }

  Apply() {
    this.getTrendHighChartDetails();
  }
  Reset() {

  }

}
