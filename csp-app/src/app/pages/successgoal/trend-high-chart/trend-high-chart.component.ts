import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SuccessgoalComponent } from '../successgoal.component';
import { myUtility } from '../../../Shared/myUtility';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts/highstock';

@Component({
  selector: 'app-trend-high-chart',
  templateUrl: './trend-high-chart.component.html',
  styleUrls: ['./trend-high-chart.component.scss']
})
export class TrendHighChartComponent implements OnInit {

  graph : any
  getData : any

  constructor(private dialogRef: MatDialogRef<SuccessgoalComponent>,@Inject(MAT_DIALOG_DATA) public data: any, public _util :myUtility) { 
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
    this.graph = this.getData.ChartData.filter(x => x.goalName == this.getData.GoalName.split('|')[0])[0].trendHighChart.filter(x => x.kpiId == this.getData.KPIId)[0].trendHighChart;
  }

}
