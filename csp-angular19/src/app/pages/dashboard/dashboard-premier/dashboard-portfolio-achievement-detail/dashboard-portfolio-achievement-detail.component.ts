import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartsService } from '../../../../services/charts.service';
import { AppsService } from '../../../../services/apps.service';
import { MyUtility } from '../../../../shared/my-utility';
import { DashboardService } from '../../../../services/dashboard.service';
import { ChartsModel } from '../../../../models/charts-model';
import { ViewTrendChartComponent } from '../view-trend-chart/view-trend-chart.component';

@Component({
  selector: 'app-dashboard-portfolio-achievement-detail',
  templateUrl: './dashboard-portfolio-achievement-detail.component.html',
  styleUrls: ['./dashboard-portfolio-achievement-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ]
})
export class DashboardPortfolioAchievementDetailComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<DashboardPortfolioAchievementDetailComponent>, private _appservice: AppsService, public _util: MyUtility, public _dashboardUtil: DashboardService, private _chartsService: ChartsService,
    public dialog2: MatDialog) { }
  portData: any[] = [];
  portDisplayIndex = -1;
  chartDisplayIndex = -1;
  portDetails: any[] = [];
  portDetailData: any[] = [];
  trendHighChart: any;
  isLoading: boolean = false;
  portStatus!: string;
  custId!: number;
  viewByAchievement!: string;
  viewBy!: string;
  includeExclusions!: boolean;
  isTrendDisabled : boolean = false;
  ngOnInit() {
    if (this.data != null) {
      this.portData = this.data.porftolioWiseData || [];
      this.portData = this.portData.sort((a, b) => (b.meT_CRITICAL_KPI + b.meT_KEY_KPI) - (a.meT_CRITICAL_KPI  + a.meT_KEY_KPI));
      this.custId = this.data.custId;
      this.viewByAchievement = this.data.viewBy;
      this.viewBy = this.viewByAchievement.replace('By','')
      this.includeExclusions = this.data.includeExlcusions;
      this.getConfigResult();
      this.loadDetails();
    }
  }
  onClose() {
    this.dialog.close();
  }
  getTrendHighChartDetails(portId: any, kpiName: any) {
    let date: Date = new Date(this._dashboardUtil.filteR_YEAR + "-" + this._dashboardUtil.filteR_MONTH + '-01');
    this._chartsService.getTrendHighChartDetailsForPortfolio(String(this.custId), portId, kpiName, date, this._util.AppSettings.token, this.viewBy.trim()).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.isTrendDisabled = true;
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
      error: (error: any) => { this._util.serviceError(error); },
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
        dialogRef.afterClosed().subscribe(result => {
          this.isTrendDisabled = false;
        });
      }
    });
      
  }


  setPortIndex(index: any, image: any, id: any) {
    this.portDetailData = this.portDetails.filter((x: any) => x.portfoliO_ID == id)
    if (this.portDisplayIndex == index) {
      this.portDisplayIndex = -1;
      image.src = '/assets/images/plus.svg';
    }
    else {
      this.portDisplayIndex = index
      image.src = '/assets/images/minus.png';
    }
  }
  loadDetails() {
    this.isLoading = true;
    // TODO: Add getPortfolioWiseKPIDetails method to AppsService when needed
    console.warn('getPortfolioWiseKPIDetails not yet implemented in AppsService');
    // this._appservice.getPortfolioWiseKPIDetails(this.custId, this._dashboardUtil.filteR_MONTH, this._dashboardUtil.filteR_YEAR)
    //   .subscribe((data: any) => {
    //     this.portDetails = data;        
    //     this.isLoading = false;
    //   }, (err: any) => { this._util.serviceError(err) })
    this.isLoading = false;
  }
  getAchievement(portData: any) {
    let achievePercent;
    
    if(this.includeExclusions)    
      achievePercent = (((portData.exclusioN_MET_CRITICAL_KPI + portData.exclusioN_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100).toString();
    else
      achievePercent = (((portData.meT_CRITICAL_KPI + portData.meT_KEY_KPI) / portData.overalL_KPI_COUNT) * 100).toString();
    return achievePercent;
  }
  getMinAchievement(portData: any) {
    let achievePercent;
   
    if(this.includeExclusions)   
      achievePercent = (((portData.exclusioN_SECONDARY_MET_CRITICAL_KPI + portData.exclusioN_SECONDARY_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100).toString();
     else 
      achievePercent = (((portData.secondarY_MET_CRITICAL_KPI + portData.secondarY_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100).toString();
    return achievePercent;
  }

  getSLAStatus(d: any){
    if(this.viewByAchievement =='By Expected Service Level')
    return d.slA_STATUS;
    else return d.secondarY_SLA_STATUS;
  }
 
  getStatus(portData: any): string {
    let achievePercent;

    if(this.includeExclusions)  
    {
        achievePercent = (((portData.exclusioN_MET_CRITICAL_KPI + portData.exclusioN_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100);
        if (portData.criticaL_KPI != portData.exclusioN_MET_CRITICAL_KPI) {
          return 'Need Focus';
        }
        else if ((portData.criticaL_KPI == portData.exclusioN_MET_CRITICAL_KPI) && achievePercent >= Number(this.achievementPer)) {
          return 'Under Control';
        }
        else if ((portData.criticaL_KPI == portData.exclusioN_MET_CRITICAL_KPI) && achievePercent < Number(this.achievementPer)) {
          return 'Need Focus';
        }
    }
    else
    {
        achievePercent = (((portData.meT_CRITICAL_KPI + portData.meT_KEY_KPI) / portData.overalL_KPI_COUNT) * 100);
        if (portData.criticaL_KPI != portData.meT_CRITICAL_KPI) {
          return 'Need Focus';
        }
        else if ((portData.criticaL_KPI == portData.meT_CRITICAL_KPI) && achievePercent >= Number(this.achievementPer)) {
          return 'Under Control';
        }
        else if ((portData.criticaL_KPI == portData.meT_CRITICAL_KPI) && achievePercent < Number(this.achievementPer)) {
          return 'Need Focus';
        }
    }
    return 'Need Focus'; // Default return
  }
  getMinStatus(portData: any): string {
    let achievePercent;
    if(this.includeExclusions)
    {
          achievePercent = (((portData.exclusioN_MET_CRITICAL_KPI + portData.exclusioN_SECONDARY_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100);
          if (portData.criticaL_KPI != portData.exclusioN_MET_CRITICAL_KPI) {
            return 'Need Focus';
          }
          else if ((portData.criticaL_KPI == portData.exclusioN_MET_CRITICAL_KPI) && achievePercent >= Number(this.achievementPer)) {
            return 'Under Control';
          }
          else if ((portData.criticaL_KPI == portData.exclusioN_MET_CRITICAL_KPI) && achievePercent < Number(this.achievementPer)) {
            return 'Need Focus';
          }
    }
    else
    {
        achievePercent = (((portData.secondarY_MET_CRITICAL_KPI + portData.secondarY_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100);
        if (portData.criticaL_KPI != portData.secondarY_MET_CRITICAL_KPI) {
          return 'Need Focus';
        }
        else if ((portData.criticaL_KPI == portData.secondarY_MET_CRITICAL_KPI) && achievePercent >= Number(this.achievementPer)) {
          return 'Under Control';
        }
        else if ((portData.criticaL_KPI == portData.secondarY_MET_CRITICAL_KPI) && achievePercent < Number(this.achievementPer)) {
          return 'Need Focus';
        }
    }
    return 'Need Focus'; // Default return
  }
  achievementPer!: string;
  getConfigResult() {
    this._appservice.GetDBConfigValue("ACCOUNT_HEALTH", -1, '').subscribe((data: any) => {
      if (data != undefined || data != null || data != '') {
        this.achievementPer = data;
      }
    }, (err: any) => { this._util.serviceError(err) })
  }
  displayGraph(portId: any, kpiName: any) {
    this.isTrendDisabled = true;
    this.getTrendHighChartDetails(portId, kpiName);
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.autoFocus = true;
    // dialogConfig.data = {
    // 'portfolioId':portId,
    // 'kpiName':kpiName,
    // 'ChartData': this.trendHighChart
    // }
    // dialogConfig.maxWidth = "90%";
    // dialogConfig.height = "auto";
    // dialogConfig.width = "90%";
    // const dialogRef = this.dialog2.open(ViewTrendChartComponent, dialogConfig);    
  }
}
