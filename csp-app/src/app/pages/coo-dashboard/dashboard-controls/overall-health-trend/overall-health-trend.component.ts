
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
import { COODashboardCommon } from '../../coo-dashboard-common';

@Component({
   selector: 'app-overall-health-trend',
   templateUrl: './overall-health-trend.component.html',
   styleUrls: ['./overall-health-trend.component.scss']
})
export class OverallHealthTrendComponent implements OnInit {
   progress: boolean;
   _dataModel: any;
   constructor(public _coodashboardService: COODashboardService,public _cooDashboardCommon: COODashboardCommon, public _util: myUtility) {

   }

   projectdropdownValues = ['All Accounts', 'Single Account', 'Clinical Support', 'Premier - FY21 - EQuIPP', 'Quarterly', 'Q1'];
   selectedProject: string = "All Accounts";
   selectedPortfoliovalue: string = "Clinical Support";
   selectedprojvalue: string = "Premier - FY21 - EQuIPP";
   selectedViewVlaue: string = 'Quarterly';
   selectedQValue: string = 'Q1';
   @Input() isvisible = false;
   dataSource: MatTableDataSource<{
      ews: string, account: string,
      portfolio: string, projects: string, severity: string
   }>;
   selectedPeriod = 'asToday';
   selectedValue: string = 'Quarter';
   range1: any[] = [2022, 2023];
   startYear = new Date().getFullYear();
   selectedCust: any;
   categories: any[];
   values: any[];
   initArea() {
      const area = new Chart({
         chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false,
            type: 'area'
         },
         title: {
            text: ''
            , style: "font-size: 9px;"
         },
         subtitle: {
            style: {
               position: 'absolute',
               right: '0px',
               bottom: '10px'
            }
         },
         legend: {
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: {
               fontSize: '10px',
            },
            // itemStyle: 'font-size:10px',
            backgroundColor: '#ffffff',
         },

         xAxis: {
            categories: this.categories,
            tickmarkPlacement: 'on',
            title: {
               // enabled: false
            }
         },
         yAxis: {
            title: {
               text: 'in%',

            },
            labels: {
               enabled: true,
               // formatter: function () {
               //     return '{point.y}%';
               // }
            }
         }, tooltip: {
            enabled: true,
            pointFormat: '<b> : {point.y:,.0f}</b>'
            ,
         },
         plotOptions: {
            area: {
               stacking: 'normal',
               lineColor: '#a1a1a1',
               lineWidth: .8,
               fillOpacity: .8,
               dataLabels: {
                  enabled: true,
                  //    formatter: function () {
                  //       return  this.value;
                  //   }

               },
               //     tooltip : {

               //    pointFormat:  'fdg'
               //    ,  
               // },  
               marker: {
                  enabled: true,
                  symbol: 'circle',
                  radius: 2,
                  lineWidth: 0.8,
                  lineColor: '#e1e1e1'
               }
            },
         },
         credits: {
            enabled: true,

         },
         series: [
            // {
            // name: 'Ideas & Innovations',
            // data: [23,34, 14,23, 36,11,54,34, 66,54,36],
            // color: '#7af7ae00'
            // , 
            //          }, 
            // {
            //    name: 'Employee Count',
            //    data: [52, 37, 14,24, 34,13,44,32, 52,32,45]
            //    ,color:'#acf9f3'
            // }, 
            {
               name: 'Values',
               data: this.values,// [23,30,45,54,78,54,17,45,29,35,67],
               color: '#7af7ae'
            },
         ],
      });
      this._cooDashboardCommon.areaChart = area;
   }

   onClose() {
      this.isvisible = !this.isvisible;
   }
   ngOnInit(): void {
      this._cooDashboardCommon.progressPopup = false;
      // this.getOverallHealthIndexTrend();
   }

   async getOverallHealthIndexTrend() {
      this._cooDashboardCommon.progressPopup = true;
      // this._cooDashboardCommon.progress = true; 
      this._coodashboardService.getOverallHealthIndexTrend(this._cooDashboardCommon.LoadParams()).subscribe(data => {
         this._cooDashboardCommon.progressPopup = false;
         //  this._cooDashboardCommon.progress = false; 
         // this._cooDashboardCommon.overallHealthIndex = data;
         this.categories = data.xAxis.categories;
         this.values = data.series[0].data;
         this.initArea();
      }, error => {
         //   this._cooDashboardCommon.progress = false;
         this._util.serviceError(error);
      });
   }

   Apply() {
      this.getOverallHealthIndexTrend();
   }
   Reset() {

   }

}
