import { Component, OnInit } from '@angular/core';
import { myUtility } from '../Shared/myUtility';
import * as Highcharts from 'highcharts/highstock';
import * as highchartsHeatmap from 'highcharts/modules/heatmap.src'
import { AppsService } from '../Services/apps.service';
import { MatDialogRef } from '@angular/material';
import  More from 'highcharts/highcharts-more.src';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown.src';
import { ProjectModel } from '../models/ras/project-model';
Drilldown(Highcharts);
// Load the exporting module.

@Component({
  selector: 'app-csatdashboard',
  templateUrl: './csatdashboard.component.html',
  styleUrls: ['./csatdashboard.component.scss']
})
export class CsatdashboardComponent implements OnInit {
  trendChartDataNPS: any;
  heatMapData: any;
  projNm:ProjectModel[];
  ddyear: number[]
  selectedQuarter: string = "Q1";
  selectedYear: number;
  pieChartData: any;
  trendChartData:any;
  csatProjWise:any;
  chart1: any;
  chart2 :any;
  surveyData:any;
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 15;
  min = 0;
  showTicks = false;
  step = 5;
  value = 0;
  vertical = false;
  constructor(private _util: myUtility, private _appService: AppsService,private dialogRef: MatDialogRef<CsatdashboardComponent>) { }
  Highcharts = Highcharts;
  ngOnInit() {
    this.ddyear = this._util.Years(3);
    this.selectedYear = this._util.Year();
    this.getPieData()
    this.getTrendData()
    this.getNPSTrendData()
    this.getCSATforProj();
    this.getCSATHeatmap();
    this.GetProjName();
    this.getSurveyData()
    }
    ddChange()
    {
      this.getPieData()
      this.getCSATHeatmap();
      
    }
  getPieData() {
    this._appService.getPieDataforCSAT(this.selectedQuarter, this.selectedYear).subscribe(data => {
      this.pieChartData = data;
      if(this.pieChartData.lessThan2 != 0 ||  this.pieChartData.equalTo3 != 0 || this.pieChartData.equalto4 !=0 || this.pieChartData.equalto5 !=0)
      {
        this.LoadChart()
      } 
      else 
      this.chart1 = undefined;
    }, error => { this._util.serviceError(error); })
  }
  getChartData()
  {
    this.getPieData();
    this.getTrendData()
    this.getNPSTrendData()
    this.getCSATforProj();
    this.getCSATHeatmap();
    this.getSurveyData()
  }
  onInputChange(event)
  {
    this.value = event.value;
    this.getTrendData()
    this.getNPSTrendData()
    this.getSurveyData();
  }
  getTrendData() {
    this._appService.getTrendChartforCSAT(this.value, this.selectedYear).subscribe(data => {
      this.trendChartData = data;   
    }, error => { this._util.serviceError(error); })
  }
  getCSATHeatmap() {
    this._appService.getCSATHeatMap(this.selectedQuarter, this.selectedYear).subscribe(data => {
      this.heatMapData = data;   
    }, error => { this._util.serviceError(error); })
  }
  getSurveyData() {
    this._appService.getSurveyData(this.value, this.selectedYear).subscribe(data => {
      this.surveyData = data;   
    }, error => { this._util.serviceError(error); })
  }
  getNPSTrendData() {
    this._appService.getTrendChartforNPS(this.value, this.selectedYear).subscribe(data => {
      this.trendChartDataNPS = data;   
    }, error => { this._util.serviceError(error); })
  }
  getCSATforProj() {
    this._appService.getCSATforProj(this.selectedYear).subscribe(data => {
      this.csatProjWise = data;   
    }, error => { this._util.serviceError(error); })
  }
  GetProjName()
  {
    this._appService.getprojNMbyId().subscribe(data => {
      this.projNm = data; 
    }, error => { this._util.serviceError(error); })
  }
  GetProjNm(projId)
  {
    let b :ProjectModel;
    b = this.projNm.filter(t=>t.proJ_ID === projId)[0];
    return b.proJ_NM
  }
  LoadChart() {
    this.chart1 = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: this.GetCSATPeriod(this.selectedQuarter,this.selectedYear),
        style: {
          "fontFamily": "\"Lucida Grande\", \"Lucida Sans Unicode\", Verdana, Arial, Helvetica, sans-serif",
          "color": "#333333",
          "fontSize": "12px",
          "fontWeight": "bold",
          "fontStyle": "normal"
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: "{point.percentage:.1f} %",
            distance: 10,
          },
          showInLegend: true
        }
      },
      series: [{
        name: 'Brands',
        colorByPoint: true,
        data: [{
          name: 'Score <=2',
          y: this.pieChartData.lessThan2
        }, {
          name: 'Score = 3',
          y: this.pieChartData.equalTo3
        }, {
          name: 'Score = 4',
          y: this.pieChartData.equalto4
        }
          ,
        {
          name: 'Score = 5',
          y: this.pieChartData.equalto5
        }]
      }],
      legend: {
        "layout": "horizontal",
        // "align": "",
        // "vertical-align" :"bottom"
      },
      colors: [
        "rgb(251, 143, 115)",
        "rgb(254, 235, 132)",
        "rgb(177, 213, 126)",
        "rgb(153, 256, 256)",
      ],
      "credits": {
        "enabled": false
      },
    }
  }
  GetCSATPeriod(quarter , year)
  {
    var period = quarter +' '+year+'-'+((year%100) +1)+' '+"Customer Success Score Distribution";
    return period;
  }
  formatLabel(value: number | null) {
    if (value == 0) 
        return 'Q1';
    else  if (value == 5)
        return 'Q2';
    else if (value == 10) {
      return 'Q3';
    }
    else if(value ==15)
      return 'Q4'
    return value;
  }
  CancelOnClick() {
    this.dialogRef.close();
  }
  // chart1 = {
  //   chart: {
  //     plotBackgroundColor: null,
  //     plotBorderWidth: null,
  //     plotShadow: false,
  //     type: 'pie'
  //   },
  //   title: {
  //     text: 'Project Status',
  //     style: {
  //       "fontFamily": "\"Lucida Grande\", \"Lucida Sans Unicode\", Verdana, Arial, Helvetica, sans-serif",
  //       "color": "#333333",
  //       "fontSize": "14px",
  //       "fontWeight": "normal",
  //       "fontStyle": "normal"
  //     }
  //   },
  //   tooltip: {
  //     pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  //   },
  //   plotOptions: {
  //     pie: {
  //       allowPointSelect: true,
  //       cursor: 'pointer',
  //       dataLabels: {
  //         enabled: true,
  //         format: "{point.percentage:.1f} %",
  //         distance: 10,
  //       },
  //       showInLegend: true
  //     }
  //   },
  //   series: [{
  //     name: 'Brands',
  //     colorByPoint: true,
  //     data: [{
  //       name: 'Red',
  //       y: 1
  //       // sliced: true,
  //       // selected: true
  //     }, {
  //       name: 'Amber',
  //       y: 1
  //     }, {
  //       name: 'Green',
  //       y: 1
  //     }]
  //   }],
  //   legend: {
  //     "layout": "vertical",
  //     "align": "right",
  //     "verticalAlign": "middle"
  //   },
  //   colors: [
  //     "rgb(251, 143, 115)",
  //     "rgb(254, 235, 132)",
  //     "rgb(177, 213, 126)"
  //   ],
  //   "credits": {
  //     "enabled": false
  //   },
  // }
}

