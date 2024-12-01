import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-top-mgmt',
  templateUrl: './dashboard-top-mgmt.component.html',
  styleUrls: ['./dashboard-top-mgmt.component.scss']
})
export class DashboardTopMgmtComponent implements OnInit {
  menuToggleStatus: boolean;
  showContentMenu: boolean;

  // Project Status data :

   type5 = 'PieChart';
   width5 = 170;
   height5 = 85;
   columnNames5 = ['status', 'count'];
   data5 = [
    ['To Start', 20],
    ['To End', 30],
    [null, 50]
  ];
   options5: google.visualization.PieChartOptions
    = {
      legend: {
        position:  <google.visualization.ChartLegendPosition> "bottom",
        alignment:
          'center',
      },
      pieHole: 0.6,
      pieStartAngle: 270,
      sliceVisibilityThreshold: 0,
      height: 160,
      width: 175,
      pieSliceText: 'value',
      pieSliceTextStyle : {
        fontSize : 11
      },
      tooltip: { trigger: 'selection'     },  
      colors: ['#3AB376', '#FF5969'],
      chartArea: {
        'width': '100%',
        'height' : '80%',
        top: 15,
      },
      
      slices: {
        2: {
          color: 'transparent',
          enableInteractivity: false
        }
      },
    };
  
    // Voice of customer data :

    type = 'AreaChart';
    data = [
      ["0", 20],
      ["20", 20],
      ["40", 20],
      ["60", 20]
    ];
    columnNames = ['Day', 'issues count'];
    options : google.visualization.AreaChartOptions = { 
      legend : "none",
      pointSize : 5,
      colors: ['#FF0000'],
      
    };
    width = 288;
    height = 122;

    // data for kaizen board

    type1 = 'ColumnChart';
    columnNames1 = ['status', 'Total', { 'role': 'annotation' }, { 'role': 'style' }];
    data1 =   [
      ['Completed', 30, '30', '#3ab376'],
      ['In Progress', 20, '20', '#ff6f00'],
    ]
    options1 : google.visualization.ColumnChartOptions = {
      legend: {
        position: 'none',
      },
      width: 180,
      height: 130,
      enableInteractivity: false,
      hAxis: {
        textStyle: {
          fontSize: 9
        }
      },
      vAxis:
        {
          gridlines: {
            color: '#ebedf1'
          },
          baselineColor: '#FFFFFF',
        },
      bar: { groupWidth: "50%" },
      annotations: {
        alwaysOutside: false
      },
      chartArea: {
        'width': '70%',
        'height': '80%', left: 25, top: 10
      },
    }; 
    width1 = 180;
    height1 = 110


  constructor() { }

  ngOnInit() {
    if (window.location.pathname == '/newdashboard/enterpriseview') {
      this.showContentMenu = true;
    }
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

}
