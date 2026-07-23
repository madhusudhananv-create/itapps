import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyUtility } from '../../../shared/my-utility';
import * as Highcharts from 'highcharts/highstock';
import { HighchartsChartComponent } from 'highcharts-angular';

@Component({
  selector: 'app-trend-high-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent],
  templateUrl: './trend-high-chart.component.html',
  styleUrls: ['./trend-high-chart.component.scss']
})
export class TrendHighChartComponent implements OnInit {

  chartOptions : Highcharts.Options | undefined;
  getData : any

  constructor(private dialogRef: MatDialogRef<any>,@Inject(MAT_DIALOG_DATA) public data: any, public _util: MyUtility) { 
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if(this.data != null)
      this.getData = this.data;
      this.LoadGraph();

  }

  closeDialog()
  {
    this.dialogRef.close();
  }

  LoadGraph()
  {
    this.chartOptions = this.getData.ChartData.filter((x: any) => x.goalName == this.getData.GoalName.split('|')[0])[0].trendHighChart.filter((x: any) => x.kpiId == this.getData.KPIId)[0].trendHighChart;
  }

}
