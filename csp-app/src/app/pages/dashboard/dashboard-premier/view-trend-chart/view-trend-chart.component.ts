import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { myUtility } from '../../../../Shared/myUtility';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts/highstock';
@Component({
  selector: 'app-view-trend-chart',
  templateUrl: './view-trend-chart.component.html',
  styleUrls: ['./view-trend-chart.component.scss']
})
export class ViewTrendChartComponent implements OnInit {
  graph: any
  getData: any
  constructor(private dialogRef: MatDialogRef<ViewTrendChartComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public _util: myUtility) { }

  ngOnInit() {
    
    if (this.data != null) {
      this.getData = this.data;

      if (this.getData.portfolioId == null) {
        this.LoadGraphForEnagagment()
      }
      else {
        this.LoadGraph();
      }

    }

  }
  closeDialog() {
    this.dialogRef.close();
  }

  LoadGraph() {
    this.graph = this.getData.ChartData.filter(x => x.goalName == this.getData.kpiName.split('|')[0])[0].trendHighChart.filter(x => x.kpiId == this.getData.portfolioId)[0].trendHighChart;
  }

  LoadGraphForEnagagment() {
    this.graph = this.getData.ChartData[0].trendHighChart[0].trendHighChart;
  }
}
