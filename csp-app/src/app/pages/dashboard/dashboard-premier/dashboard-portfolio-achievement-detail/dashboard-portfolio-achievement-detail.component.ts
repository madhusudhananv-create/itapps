import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ChartsService } from '../../../../Services/charts.service';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { DashboardService } from '../../dashboard.service';
import { ChartsModel } from '../../../../models/charts-model';
import { Chart } from 'angular-highcharts';
import { ViewTrendChartComponent } from '../view-trend-chart/view-trend-chart.component';

@Component({
  selector: 'app-dashboard-portfolio-achievement-detail',
  templateUrl: './dashboard-portfolio-achievement-detail.component.html',
  styleUrls: ['./dashboard-portfolio-achievement-detail.component.scss']
})
export class DashboardPortfolioAchievementDetailComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<DashboardPortfolioAchievementDetailComponent>, private _appservice: AppsService, public _util: myUtility, public _dashboardUtil: DashboardService, private _chartsService: ChartsService,
    public dialog2: MatDialog) { }
  portData: any[] = [];
  portDisplayIndex = -1;
  chartDisplayIndex = -1;
  portDetails: any[] = [];
  portDetailData: any[] = [];
  trendHighChart: any;
  isLoading: boolean = false;
  portStatus: string;
  custId : number;
  viewByAchievement : string;
  viewBy : string;
  includeExclusions : boolean;
  isTrendDisabled : boolean = false;
  ngOnInit() {
    if (this.data != null) {
      this.portData = this.data.porftolioWiseData;
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
  getTrendHighChartDetails(portId, kpiName) {
    let date: Date = new Date(this._dashboardUtil.filteR_YEAR + "-" + this._dashboardUtil.filteR_MONTH + '-01');
    this._chartsService.getTrendHighChartDetailsForPortfolio(this.custId, portId, kpiName, date, this._util.AppSettings.token, this.viewBy.trim()).subscribe(
      data => {
        //console.log("CHART DATA 1:",data)
        if (data.length > 0) {
          this.isTrendDisabled = true;
          for (let i = 0; i < data.length; i++) {
            if (data[i].trendHighChart.length > 0) {
              for (let j = 0; j < data[i].trendHighChart.length; j++) {
                data[i].trendHighChart[j].trendHighChart = new Chart(data[i].trendHighChart[j].trendHighChart);
              }
            }
          }
        }
        this.trendHighChart = data;
        //console.log("CHART DATA 2:", this.trendHighChart)
      }, error => { this._util.serviceError(error); }
      , () => {
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
        })

      })
      
  }


  setPortIndex(index, image: any, id) {
    this.portDetailData = this.portDetails.filter(x => x.portfoliO_ID == id)
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
    this._appservice.getPortfolioWiseKPIDetails(this.custId, this._dashboardUtil.filteR_MONTH, this._dashboardUtil.filteR_YEAR)
      .subscribe(data => {
        this.portDetails = data;        
        this.isLoading = false;
      }, (err) => { this._util.serviceError(err) })
  }
  getAchievement(portData) {
    let achievePercent;
    
    if(this.includeExclusions)    
      achievePercent = (((portData.exclusioN_MET_CRITICAL_KPI + portData.exclusioN_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100).toString();
    else
      achievePercent = (((portData.meT_CRITICAL_KPI + portData.meT_KEY_KPI) / portData.overalL_KPI_COUNT) * 100).toString();
    return achievePercent;
  }
  getMinAchievement(portData) {
    let achievePercent;
   
    if(this.includeExclusions)   
      achievePercent = (((portData.exclusioN_SECONDARY_MET_CRITICAL_KPI + portData.exclusioN_SECONDARY_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100).toString();
     else 
      achievePercent = (((portData.secondarY_MET_CRITICAL_KPI + portData.secondarY_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100).toString();
    return achievePercent;
  }

  getSLAStatus(d){
    if(this.viewByAchievement =='By Expected Service Level')
    return d.slA_STATUS;
    else return d.secondarY_SLA_STATUS;
  }
 
  getStatus(portData) {
    let achievePercent;

    if(this.includeExclusions)  
    {
        achievePercent = (((portData.exclusioN_MET_CRITICAL_KPI + portData.exclusioN_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100);
        if (portData.criticaL_KPI != portData.exclusioN_MET_CRITICAL_KPI) {
          return 'Need Focus';
        }
        else if ((portData.criticaL_KPI == portData.exclusioN_MET_CRITICAL_KPI) && achievePercent >= this.achievementPer) {
          return 'Under Control';
        }
        else if ((portData.criticaL_KPI == portData.exclusioN_MET_CRITICAL_KPI) && achievePercent < this.achievementPer) {
          return 'Need Focus';
        }
    }
    else
    {
        achievePercent = (((portData.meT_CRITICAL_KPI + portData.meT_KEY_KPI) / portData.overalL_KPI_COUNT) * 100);
        if (portData.criticaL_KPI != portData.meT_CRITICAL_KPI) {
          return 'Need Focus';
        }
        else if ((portData.criticaL_KPI == portData.meT_CRITICAL_KPI) && achievePercent >= this.achievementPer) {
          return 'Under Control';
        }
        else if ((portData.criticaL_KPI == portData.meT_CRITICAL_KPI) && achievePercent < this.achievementPer) {
          return 'Need Focus';
        }
    }
    
  }
  getMinStatus(portData) {
    let achievePercent;
    if(this.includeExclusions)
    {
          achievePercent = (((portData.exclusioN_MET_CRITICAL_KPI + portData.exclusioN_SECONDARY_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100);
          if (portData.criticaL_KPI != portData.exclusioN_MET_CRITICAL_KPI) {
            return 'Need Focus';
          }
          else if ((portData.criticaL_KPI == portData.exclusioN_MET_CRITICAL_KPI) && achievePercent >= this.achievementPer) {
            return 'Under Control';
          }
          else if ((portData.criticaL_KPI == portData.exclusioN_MET_CRITICAL_KPI) && achievePercent < this.achievementPer) {
            return 'Need Focus';
          }
    }
    else
    {
        achievePercent = (((portData.secondarY_MET_CRITICAL_KPI + portData.secondarY_MET_KEY_KPI) / portData.overalL_KPI_COUNT) * 100);
        if (portData.criticaL_KPI != portData.secondarY_MET_CRITICAL_KPI) {
          return 'Need Focus';
        }
        else if ((portData.criticaL_KPI == portData.secondarY_MET_CRITICAL_KPI) && achievePercent >= this.achievementPer) {
          return 'Under Control';
        }
        else if ((portData.criticaL_KPI == portData.secondarY_MET_CRITICAL_KPI) && achievePercent < this.achievementPer) {
          return 'Need Focus';
        }
    }    
  }
  achievementPer: string;
  getConfigResult() {
    this._appservice.GetDBConfigValue("ACCOUNT_HEALTH", -1, '').subscribe(data => {
      if (data != undefined || data != null || data != '') {
        this.achievementPer = data;
      }
    }, (err) => { this._util.serviceError(err) })
  }
  displayGraph(portId, kpiName) {
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
