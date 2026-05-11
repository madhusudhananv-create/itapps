import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyUtility } from '../../../../shared/my-utility';
import * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';

@Component({
  selector: 'app-view-trend-chart',
  templateUrl: './view-trend-chart.component.html',
  styleUrls: ['./view-trend-chart.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    HighchartsChartComponent
  ]
})
export class ViewTrendChartComponent implements OnInit {
  chartOptions: Highcharts.Options = {};
  graph: any;
  getData: any;
  
  constructor(
    private dialogRef: MatDialogRef<ViewTrendChartComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public _util: MyUtility
  ) { }

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
    this.graph = this.getData.ChartData.filter((x: any) => x.goalName == this.getData.kpiName.split('|')[0])[0].trendHighChart.filter((x: any) => x.kpiId == this.getData.portfolioId)[0].trendHighChart;
    this.chartOptions = this.graph;
  }

  LoadGraphForEnagagment() {
    this.graph = this.getData.ChartData[0].trendHighChart[0].trendHighChart;
    this.chartOptions = this.graph;
  }
}
