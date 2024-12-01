import { Component, OnInit, Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import * as Highcharts from 'highcharts/highstock';

@Component({
  selector: 'app-crisp-project-status-chart',
  templateUrl: './crisp-project-status-chart.component.html',
  styleUrls: ['./crisp-project-status-chart.component.scss']
})
export class CrispProjectStatusChartComponent implements OnInit {
  Highcharts = Highcharts;
  //chart1: any;
  ragCounts: ProjectStatusRAGCount = new ProjectStatusRAGCount();
  @Input('ProjectIds') projectIds: string[];
  @Input('month') month: string;
  @Input('year') year: number;
  constructor(private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
  }
  ngOnChanges() {
    this.LoadData();
  }
  LoadData() {
    this.service_getCrispProjectStatusChart(this.projectIds, this.month, this.year);
  }
  service_getCrispProjectStatusChart(ProjectIds, month, year) {
    this._appservice.GetCrispProjectStatus(ProjectIds, month, year).subscribe(data => {
      this.ragCounts = data;
      this.LoadChart();
    }, error => { this._util.serviceError(error); });
  }
  LoadChart() {
    this.chart1 = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Project Status',
        style: {
          "fontFamily": "\"Lucida Grande\", \"Lucida Sans Unicode\", Verdana, Arial, Helvetica, sans-serif",
          "color": "#333333",
          "fontSize": "14px",
          "fontWeight": "normal",
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
          name: 'Red',
          y: this.ragCounts.red
          // sliced: true,
          // selected: true
        }, {
          name: 'Amber',
          y: this.ragCounts.amber
        }, {
          name: 'Green',
          y: this.ragCounts.green
        }]
      }],
      legend: {
        "layout": "vertical",
        "align": "right",
        "verticalAlign": "middle"
      },
      colors: [
        "rgb(251, 143, 115)",
        "rgb(254, 235, 132)",
        "rgb(177, 213, 126)"
      ],
      "credits": {
        "enabled": false
      },
    }
  }

  chart1 = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Project Status',
      style: {
        "fontFamily": "\"Lucida Grande\", \"Lucida Sans Unicode\", Verdana, Arial, Helvetica, sans-serif",
        "color": "#333333",
        "fontSize": "14px",
        "fontWeight": "normal",
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
        name: 'Red',
        y: this.ragCounts.red
        // sliced: true,
        // selected: true
      }, {
        name: 'Amber',
        y: this.ragCounts.amber
      }, {
        name: 'Green',
        y: this.ragCounts.green
      }]
    }],
    legend: {
      "layout": "vertical",
      "align": "right",
      "verticalAlign": "middle"
    },
    colors: [
      "rgb(251, 143, 115)",
      "rgb(254, 235, 132)",
      "rgb(177, 213, 126)"
    ],
    "credits": {
      "enabled": false
    },
  }
}

export class ProjectStatusRAGCount {
  red: number = 0;
  amber: number = 0;
  green: number = 0;
}
