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
    if(this.data != null) {
      this.getData = this.data;
      this.LoadGraph();
    }
  }

  closeDialog()
  {
    this.dialogRef.close();
  }

  LoadGraph()
  {
    try {
      console.log('ChartData:', this.getData.ChartData);
      console.log('GoalName:', this.getData.GoalName);
      console.log('KPIId:', this.getData.KPIId);
      
      const goalName = this.getData.GoalName.split('|')[0];
      const kpiId = this.getData.KPIId;
      
      const goalData = this.getData.ChartData.filter((x: any) => x.goalName == goalName);
      console.log('Filtered goalData:', goalData);
      
      if (goalData && goalData.length > 0 && goalData[0].trendHighChart) {
        const kpiData = goalData[0].trendHighChart.filter((x: any) => x.kpiId == kpiId);
        console.log('Filtered kpiData:', kpiData);
        
        if (kpiData && kpiData.length > 0 && kpiData[0].trendHighChart) {
          // Get the raw Highcharts options
          let options = kpiData[0].trendHighChart;
          
          // Fix chart type if it's a number - convert to string
          if (options.chart && typeof options.chart.type === 'number') {
            const typeMap: any = {
              0: 'line',
              1: 'spline',
              2: 'area',
              3: 'column',
              4: 'bar',
              5: 'pie',
              6: 'scatter'
            };
            options.chart.type = typeMap[options.chart.type] || 'line';
            console.log('Converted chart type to:', options.chart.type);
          }
          
          this.chartOptions = options;
          console.log('Chart options set:', this.chartOptions);
        } else {
          console.error('No KPI data found for KPIId:', kpiId);
        }
      } else {
        console.error('No goal data found for goalName:', goalName);
      }
    } catch (error) {
      console.error('Error loading graph:', error);
    }
  }

}
