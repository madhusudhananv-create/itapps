import { Component, OnInit } from '@angular/core';
declare var require: any
import * as Highcharts from 'highcharts/highstock';
import * as highchartsPareto from 'highcharts/modules/pareto';
import { Input } from '@angular/core';
import { AccessControl } from '../../../Shared/accessControl';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';

const HC_exporting = require('highcharts/modules/exporting');
const HC_ExportData = require('highcharts/modules/export-data');
HC_exporting(Highcharts);
HC_ExportData(Highcharts);
highchartsPareto(Highcharts);

@Component({
  selector: 'app-dashboard-success-journey',
  templateUrl: './dashboard-success-journey.component.html',
  styleUrls: ['./dashboard-success-journey.component.scss']
})
export class DashboardSuccessJourneyComponent implements OnInit {

  constructor(private _access: AccessControl, private _util: myUtility, private _appservice: AppsService) { }
  @Input('custId') custId: string;
  projId: string;
  Projects: any[] = [];

  Highcharts = Highcharts;
  ngOnInit() {
    this.LoadProject();
    Highcharts.setOptions({
      exporting: {
        buttons: {
          contextButton: {
            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'downloadXLS']
          }
        }
      }
    })
    this.LoadTimelineChart();
  }
  ngOnChanges() {
    this.LoadProject();
  }
  LoadProject() {
    if (this._util.IsGAVS()) {
      this._appservice.GetCustomerProjectsNameWithCustNM(this.custId, localStorage.getItem('empid')).subscribe(data => {
        this.Projects = data;
        if (this.Projects.length > 0) {
          this.projId = this.Projects[0].proJ_ID
          this.LoadTimelineChart();
        }
      }, error => { this._util.serviceError(error); });
    }
    else {
      this._appservice.GetCustomerProjectsNameForClient(this.custId, localStorage.getItem('empid')).subscribe(data => {
        this.Projects = data;
        if (this.Projects.length > 0) {
          this.projId = this.Projects[0].proJ_ID
          this.LoadTimelineChart();
        }
      }, error => { this._util.serviceError(error); });
    }
  }

  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    this.LoadTimelineChart();
  }
  pickerOption;
  pickerYear;
  pickerStartDate: Date;
  pickerEndDate: Date;
  monthandyearpicker_onChange($event) {
    let obj: any = JSON.parse($event);
    this.pickerOption = obj.Option;
    this.pickerYear = obj.Year;
    this.pickerStartDate = obj.StartDate;
    this.pickerEndDate = obj.EndDate;
    //this.LoadData();
  }

  LoadTimelineChart() {
    this.chart3 = undefined;
    if (this.projId != undefined && this.projId != "")
      this.Service_GetTimelineChart();
    // else
    //   alert("Please select Customer and Project");
  }
  ddProject_onChange(){
    
  }
  Service_GetTimelineChart() {
    this._appservice.GetTimelineChart(this.custId, this.projId, this.pickerStartDate, this.pickerEndDate).subscribe(data => {
      this.chart3 = data;
    }, error => { this._util.serviceError(error); });
  }



  optFromInput = {
    "subtitle": { "text": "Highcharts chart" },
    "series": [{
      "type": "line",
      "data": [11, 2, 3]
    }, {
      "data": [5, 6, 7]
    }]
  };

  chart3;
  chart3a = {
    chart: {
      events: {
        //load: onChartLoad
      }
    },

    xAxis: {
      type: 'datetime',
      minTickInterval: 365 * 24 * 36e5,
      labels: {
        align: 'left'
      },
      plotBands: [{
        from: Date.UTC(2009, 10, 27),
        to: Date.UTC(2010, 11, 1),
        color: '#EFFFFF',
        label: {
          text: '<em>Offices:</em><br> Torstein\'s basement',
          style: {
            color: '#999999'
          },
          y: 180
        }
      }, {
        from: Date.UTC(2010, 11, 1),
        to: Date.UTC(2013, 9, 1),
        color: '#FFFFEF',
        label: {
          text: '<em>Offices:</em><br> Tomtebu',
          style: {
            color: '#999999'
          },
          y: 30
        }
      }, {
        from: Date.UTC(2013, 9, 1),
        to: Date.UTC(2014, 10, 27),
        color: '#FFEFFF',
        label: {
          text: '<em>Offices:</em><br> VikØrsta',
          style: {
            color: '#999999'
          },
          y: 30
        }
      }]

    },

    title: {
      text: 'Customer Success Journey Map'
    },

    tooltip: {
      style: {
        width: '250px'
      }
    },

    yAxis: [
      {
        max: 100,
        labels: {
          enabled: false
        },
        title: {
          text: ''
        },
        gridLineColor: 'rgba(0, 0, 0, 0.07)'
      },
      {
        allowDecimals: false,
        max: 15,
        labels: {
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        title: {
          text: 'Employees',
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        opposite: true,
        gridLineWidth: 0
      }],

    plotOptions: {
      series: {
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2
        },
        fillOpacity: 0.5
      },
      flags: {
        tooltip: {
          xDateFormat: '%B %e, %Y'
        }
      }
    },

    series: [{
      type: 'spline',
      id: 'google-trends',
      dashStyle: 'dash',
      name: 'Value Adds',
      data: [{ x: 1258322400000, /* November 2009 */ y: 0 }, { x: 1260961200000, y: 5 }, { x: 1263639600000, y: 7 }, { x: 1266188400000, y: 5 }, { x: 1268740800000, y: 6 }, { x: 1271368800000, y: 8 }, { x: 1274004000000, y: 11 }, { x: 1276639200000, y: 9 }, { x: 1279274400000, y: 12 }, { x: 1281952800000, y: 13 }, { x: 1284588000000, y: 17 }, { x: 1287223200000, y: 17 }, { x: 1289858400000, y: 18 }, { x: 1292497200000, y: 20 }, { x: 1295175600000, y: 20 }, { x: 1297724400000, y: 27 }, { x: 1300276800000, y: 32 }, { x: 1302904800000, y: 29 }, { x: 1305540000000, y: 34 }, { x: 1308175200000, y: 34 }, { x: 1310810400000, y: 36 }, { x: 1313488800000, y: 43 }, { x: 1316124000000, y: 44 }, { x: 1318759200000, y: 42 }, { x: 1321394400000, y: 47 }, { x: 1324033200000, y: 46 }, { x: 1326711600000, y: 50 }, { x: 1329303600000, y: 57 }, { x: 1331899200000, y: 54 }, { x: 1334527200000, y: 59 }, { x: 1337162400000, y: 62 }, { x: 1339797600000, y: 66 }, { x: 1342432800000, y: 61 }, { x: 1345111200000, y: 68 }, { x: 1347746400000, y: 67 }, { x: 1350381600000, y: 73 }, { x: 1353016800000, y: 63 }, { x: 1355655600000, y: 54 }, { x: 1358334000000, y: 67 }, { x: 1360882800000, y: 74 }, { x: 1363435200000, y: 81 }, { x: 1366063200000, y: 89 }, { x: 1368698400000, y: 83 }, { x: 1371333600000, y: 88 }, { x: 1373968800000, y: 86 }, { x: 1376647200000, y: 81 }, { x: 1379282400000, y: 83 }, { x: 1381917600000, y: 95 }, { x: 1384552800000, y: 86 }, { x: 1387191600000, y: 83 }, { x: 1389870000000, y: 89 }, { x: 1392418800000, y: 90 }, { x: 1394971200000, y: 94 }, { x: 1397599200000, y: 100 }, { x: 1400234400000, y: 100 }, { x: 1402869600000, y: 99 }, { x: 1405504800000, y: 99 }, { x: 1408183200000, y: 93 }, { x: 1410818400000, y: 97 }, { x: 1413453600000, y: 98 }],
      tooltip: {
        xDateFormat: '%B %Y',
        valueSuffix: ' % of best month'
      }
    }, {
      name: 'CSAT',
      id: 'csat',
      type: 'area',
      data: [[1257033600000, 2], [1259625600000, 3], [1262304000000, 2], [1264982400000, 3], [1267401600000, 4], [1270080000000, 4], [1272672000000, 4], [1275350400000, 4], [1277942400000, 5], [1280620800000, 7], [1283299200000, 6], [1285891200000, 9], [1288569600000, 10], [1291161600000, 8], [1293840000000, 10], [1296518400000, 13], [1298937600000, 15], [1301616000000, 14], [1304208000000, 15], [1306886400000, 16], [1309478400000, 22], [1312156800000, 19], [1314835200000, 20], [1317427200000, 32], [1320105600000, 34], [1322697600000, 36], [1325376000000, 34], [1328054400000, 40], [1330560000000, 37], [1333238400000, 35], [1335830400000, 40], [1338508800000, 38], [1341100800000, 39], [1343779200000, 43], [1346457600000, 49], [1349049600000, 43], [1351728000000, 54], [1354320000000, 44], [1356998400000, 43], [1359676800000, 43], [1362096000000, 52], [1364774400000, 52], [1367366400000, 56], [1370044800000, 62], [1372636800000, 66], [1375315200000, 62], [1377993600000, 63], [1380585600000, 60], [1383264000000, 60], [1385856000000, 58], [1388534400000, 65], [1391212800000, 52], [1393632000000, 72], [1396310400000, 57], [1398902400000, 70], [1401580800000, 63], [1404172800000, 65], [1406851200000, 65], [1409529600000, 89], [1412121600000, 100]],
      tooltip: {
        xDateFormat: '%B %Y',
        valueSuffix: ' % of best month'
      }

    }, {
      yAxis: 1,
      name: 'No. of Employees',
      id: 'employees',
      type: 'area',
      step: 'left',
      tooltip: {
        headerFormat: '<span style="font-size: 11px;color:#666">{point.x:%B %e, %Y}</span><br>',
        pointFormat: '{point.name}<br><b>{point.y}</b>',
        valueSuffix: ' employees'
      },
      data: [
        { x: Date.UTC(2009, 10, 1), y: 1, name: 'Torstein worked alone', image: 'Torstein' },
        { x: Date.UTC(2010, 10, 20), y: 2, name: 'Grethe joined', image: 'Grethe' },

        { x: Date.UTC(2011, 3, 1), y: 3, name: 'Erik joined', image: null },
        { x: Date.UTC(2011, 7, 1), y: 4, name: 'Gert joined', image: 'Gert' },
        { x: Date.UTC(2011, 7, 15), y: 5, name: 'Hilde joined', image: 'Hilde' },

        { x: Date.UTC(2012, 5, 1), y: 6, name: 'Guro joined', image: 'Guro' },
        { x: Date.UTC(2012, 8, 1), y: 5, name: 'Erik left', image: null },
        { x: Date.UTC(2012, 8, 15), y: 6, name: 'Anne Jorunn joined', image: 'AnneJorunn' },

        { x: Date.UTC(2013, 0, 1), y: 7, name: 'Hilde T. joined', image: null },
        { x: Date.UTC(2013, 7, 1), y: 8, name: 'Jon Arild joined', image: 'JonArild' },
        { x: Date.UTC(2013, 7, 20), y: 9, name: 'Øystein joined', image: 'Oystein' },
        { x: Date.UTC(2013, 9, 1), y: 10, name: 'Stephane joined', image: 'Stephane' },

        { x: Date.UTC(2014, 9, 1), y: 11, name: 'Anita joined', image: 'Anita' },
        { x: Date.UTC(2014, 10, 27), y: 11, name: ' ', image: null }
      ]

    }]
  }

  chart_timeline = {
    chart: {
      events: {
        //load: onChartLoad
      }
    },

    xAxis: {
      type: 'datetime',
      minTickInterval: 365 * 24 * 36e5,
      labels: {
        align: 'left'
      },
      plotBands: [
        {
          from: Date.UTC(2009, 10, 27),
          to: Date.UTC(2010, 11, 1),
          color: '#EFFFFF',
          label: {
            text: '<em>Offices:</em><br> Torstein\'s basement',
            style: {
              color: '#999999'
            },
            y: 180
          }
        },
        {
          from: Date.UTC(2010, 11, 1),
          to: Date.UTC(2013, 9, 1),
          color: '#FFFFEF',
          label: {
            text: '<em>Offices:</em><br> Tomtebu',
            style: {
              color: '#999999'
            },
            y: 30
          }
        },
        {
          from: Date.UTC(2013, 9, 1),
          to: Date.UTC(2014, 10, 27),
          color: '#FFEFFF',
          label: {
            text: '<em>Offices:</em><br> VikØrsta',
            style: {
              color: '#999999'
            },
            y: 30
          }
        }
      ]
    },
    title: {
      text: 'Highcharts and Highsoft timeline'
    },
    tooltip: {
      style: {
        width: '250px'
      }
    },
    yAxis: [
      {
        max: 100,
        labels: {
          enabled: false
        },
        title: {
          text: ''
        },
        gridLineColor: 'rgba(0, 0, 0, 0.07)'
      },
      {
        allowDecimals: false,
        max: 15,
        labels: {
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        title: {
          text: 'Employees',
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        opposite: true,
        gridLineWidth: 0
      }
    ],

    plotOptions: {
      series: {
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2
        },
        fillOpacity: 0.5
      },
      flags: {
        tooltip: {
          xDateFormat: '%B %e, %Y'
        }
      }
    },

    series: [
      {
        type: 'spline',
        id: 'google-trends',
        dashStyle: 'dash',
        name: 'Google search for <em>highcharts</em>',
        data: [{ x: 1258322400000, /* November 2009 */ y: 0 }, { x: 1260961200000, y: 5 }, { x: 1263639600000, y: 7 }, { x: 1266188400000, y: 5 }, { x: 1268740800000, y: 6 }, { x: 1271368800000, y: 8 }, { x: 1274004000000, y: 11 }, { x: 1276639200000, y: 9 }, { x: 1279274400000, y: 12 }, { x: 1281952800000, y: 13 }, { x: 1284588000000, y: 17 }, { x: 1287223200000, y: 17 }, { x: 1289858400000, y: 18 }, { x: 1292497200000, y: 20 }, { x: 1295175600000, y: 20 }, { x: 1297724400000, y: 27 }, { x: 1300276800000, y: 32 }, { x: 1302904800000, y: 29 }, { x: 1305540000000, y: 34 }, { x: 1308175200000, y: 34 }, { x: 1310810400000, y: 36 }, { x: 1313488800000, y: 43 }, { x: 1316124000000, y: 44 }, { x: 1318759200000, y: 42 }, { x: 1321394400000, y: 47 }, { x: 1324033200000, y: 46 }, { x: 1326711600000, y: 50 }, { x: 1329303600000, y: 57 }, { x: 1331899200000, y: 54 }, { x: 1334527200000, y: 59 }, { x: 1337162400000, y: 62 }, { x: 1339797600000, y: 66 }, { x: 1342432800000, y: 61 }, { x: 1345111200000, y: 68 }, { x: 1347746400000, y: 67 }, { x: 1350381600000, y: 73 }, { x: 1353016800000, y: 63 }, { x: 1355655600000, y: 54 }, { x: 1358334000000, y: 67 }, { x: 1360882800000, y: 74 }, { x: 1363435200000, y: 81 }, { x: 1366063200000, y: 89 }, { x: 1368698400000, y: 83 }, { x: 1371333600000, y: 88 }, { x: 1373968800000, y: 86 }, { x: 1376647200000, y: 81 }, { x: 1379282400000, y: 83 }, { x: 1381917600000, y: 95 }, { x: 1384552800000, y: 86 }, { x: 1387191600000, y: 83 }, { x: 1389870000000, y: 89 }, { x: 1392418800000, y: 90 }, { x: 1394971200000, y: 94 }, { x: 1397599200000, y: 100 }, { x: 1400234400000, y: 100 }, { x: 1402869600000, y: 99 }, { x: 1405504800000, y: 99 }, { x: 1408183200000, y: 93 }, { x: 1410818400000, y: 97 }, { x: 1413453600000, y: 98 }],
        tooltip: {
          xDateFormat: '%B %Y',
          valueSuffix: ' % of best month'
        }
      },
      {
        name: 'Revenue',
        id: 'revenue',
        type: 'area',
        data: [[1257033600000, 2], [1259625600000, 3], [1262304000000, 2], [1264982400000, 3], [1267401600000, 4], [1270080000000, 4], [1272672000000, 4], [1275350400000, 4], [1277942400000, 5], [1280620800000, 7], [1283299200000, 6], [1285891200000, 9], [1288569600000, 10], [1291161600000, 8], [1293840000000, 10], [1296518400000, 13], [1298937600000, 15], [1301616000000, 14], [1304208000000, 15], [1306886400000, 16], [1309478400000, 22], [1312156800000, 19], [1314835200000, 20], [1317427200000, 32], [1320105600000, 34], [1322697600000, 36], [1325376000000, 34], [1328054400000, 40], [1330560000000, 37], [1333238400000, 35], [1335830400000, 40], [1338508800000, 38], [1341100800000, 39], [1343779200000, 43], [1346457600000, 49], [1349049600000, 43], [1351728000000, 54], [1354320000000, 44], [1356998400000, 43], [1359676800000, 43], [1362096000000, 52], [1364774400000, 52], [1367366400000, 56], [1370044800000, 62], [1372636800000, 66], [1375315200000, 62], [1377993600000, 63], [1380585600000, 60], [1383264000000, 60], [1385856000000, 58], [1388534400000, 65], [1391212800000, 52], [1393632000000, 72], [1396310400000, 57], [1398902400000, 70], [1401580800000, 63], [1404172800000, 65], [1406851200000, 65], [1409529600000, 89], [1412121600000, 100]],
        tooltip: {
          xDateFormat: '%B %Y',
          valueSuffix: ' % of best month'
        }

      },
      {
        yAxis: 1,
        name: 'Highsoft employees',
        id: 'employees',
        type: 'area',
        step: 'left',
        tooltip: {
          headerFormat: '<span style="font-size: 11px;color:#666">{point.x:%B %e, %Y}</span><br>',
          pointFormat: '{point.name}<br><b>{point.y}</b>',
          valueSuffix: ' employees'
        },
        data: [
          { x: Date.UTC(2009, 10, 1), y: 1, name: 'Torstein worked alone', image: 'Torstein' },
          { x: Date.UTC(2010, 10, 20), y: 2, name: 'Grethe joined', image: 'Grethe' },
          { x: Date.UTC(2011, 3, 1), y: 3, name: 'Erik joined', image: null },
          { x: Date.UTC(2011, 7, 1), y: 4, name: 'Gert joined', image: 'Gert' },
          { x: Date.UTC(2011, 7, 15), y: 5, name: 'Hilde joined', image: 'Hilde' },
          { x: Date.UTC(2012, 5, 1), y: 6, name: 'Guro joined', image: 'Guro' },
          { x: Date.UTC(2012, 8, 1), y: 5, name: 'Erik left', image: null },
          { x: Date.UTC(2012, 8, 15), y: 6, name: 'Anne Jorunn joined', image: 'AnneJorunn' },
          { x: Date.UTC(2013, 0, 1), y: 7, name: 'Hilde T. joined', image: null },
          { x: Date.UTC(2013, 7, 1), y: 8, name: 'Jon Arild joined', image: 'JonArild' },
          { x: Date.UTC(2013, 7, 20), y: 9, name: 'Øystein joined', image: 'Oystein' },
          { x: Date.UTC(2013, 9, 1), y: 10, name: 'Stephane joined', image: 'Stephane' },
          { x: Date.UTC(2014, 9, 1), y: 11, name: 'Anita joined', image: 'Anita' },
          { x: Date.UTC(2014, 10, 27), y: 11, name: ' ', image: null }
        ]

      },
      {
        type: 'flags',
        name: 'Cloud',
        color: '#333333',
        shape: 'squarepin',
        y: -80,
        data: [
          { x: Date.UTC(2014, 4, 1), text: 'Highcharts Cloud Beta', title: 'Cloud', shape: 'squarepin' }
        ],
        showInLegend: false
      },
      {
        type: 'flags',
        name: 'Highmaps',
        color: '#333333',
        shape: 'squarepin',
        y: -55,
        data: [
          { x: Date.UTC(2014, 5, 13), text: 'Highmaps version 1.0 released', title: 'Maps' }
        ],
        showInLegend: false
      },
      {
        type: 'flags',
        name: 'Highcharts',
        color: '#333333',
        shape: 'circlepin',
        data: [
          { x: Date.UTC(2009, 10, 27), text: 'Highcharts version 1.0 released', title: '1.0' },
          { x: Date.UTC(2010, 6, 13), text: 'Ported from canvas to SVG rendering', title: '2.0' },
          { x: Date.UTC(2010, 10, 23), text: 'Dynamically resize and scale to text labels', title: '2.1' },
          { x: Date.UTC(2011, 9, 18), text: 'Highstock version 1.0 released', title: 'Stock', shape: 'squarepin' },
          { x: Date.UTC(2012, 7, 24), text: 'Gauges, polar charts and range series', title: '2.3' },
          { x: Date.UTC(2013, 2, 22), text: 'Multitouch support, more series types', title: '3.0' },
          { x: Date.UTC(2014, 3, 22), text: '3D charts, heatmaps', title: '4.0' }
        ],
        showInLegend: false
      },
      {
        type: 'flags',
        name: 'Events',
        color: '#333333',
        fillColor: 'rgba(255,255,255,0.8)',
        data: [
          { x: Date.UTC(2012, 10, 1), text: 'Highsoft won "Entrepeneur of the Year" in Sogn og Fjordane, Norway', title: 'Award' },
          { x: Date.UTC(2012, 11, 25), text: 'Packt Publishing published <em>Learning Highcharts by Example</em>. Since then, many other books are written about Highcharts.', title: 'First book' },
          { x: Date.UTC(2013, 4, 25), text: 'Highsoft nominated Norway\'s Startup of the Year', title: 'Award' },
          { x: Date.UTC(2014, 4, 25), text: 'Highsoft nominated Best Startup in Nordic Startup Awards', title: 'Award' }
        ],
        onSeries: 'revenue',
        showInLegend: false
      }

    ]
  };

  // // Add flags for important milestones. This requires Highstock.
  // if (Highcharts.seriesTypes.flags) {
  // options.series.push({
  //     type: 'flags',
  //     name: 'Cloud',
  //     color: '#333333',
  //     shape: 'squarepin',
  //     y: -80,
  //     data: [
  //         { x: Date.UTC(2014, 4, 1), text: 'Highcharts Cloud Beta', title: 'Cloud', shape: 'squarepin' }
  //     ],
  //     showInLegend: false
  // }, {
  //     type: 'flags',
  //     name: 'Highmaps',
  //     color: '#333333',
  //     shape: 'squarepin',
  //     y: -55,
  //     data: [
  //         { x: Date.UTC(2014, 5, 13), text: 'Highmaps version 1.0 released', title: 'Maps' }
  //     ],
  //     showInLegend: false
  // }, {
  //     type: 'flags',
  //     name: 'Highcharts',
  //     color: '#333333',
  //     shape: 'circlepin',
  //     data: [
  //         { x: Date.UTC(2009, 10, 27), text: 'Highcharts version 1.0 released', title: '1.0' },
  //         { x: Date.UTC(2010, 6, 13), text: 'Ported from canvas to SVG rendering', title: '2.0' },
  //         { x: Date.UTC(2010, 10, 23), text: 'Dynamically resize and scale to text labels', title: '2.1' },
  //         { x: Date.UTC(2011, 9, 18), text: 'Highstock version 1.0 released', title: 'Stock', shape: 'squarepin' },
  //         { x: Date.UTC(2012, 7, 24), text: 'Gauges, polar charts and range series', title: '2.3' },
  //         { x: Date.UTC(2013, 2, 22), text: 'Multitouch support, more series types', title: '3.0' },
  //         { x: Date.UTC(2014, 3, 22), text: '3D charts, heatmaps', title: '4.0' }
  //     ],
  //     showInLegend: false
  // }, {
  //     type: 'flags',
  //     name: 'Events',
  //     color: '#333333',
  //     fillColor: 'rgba(255,255,255,0.8)',
  //     data: [
  //         { x: Date.UTC(2012, 10, 1), text: 'Highsoft won "Entrepeneur of the Year" in Sogn og Fjordane, Norway', title: 'Award' },
  //         { x: Date.UTC(2012, 11, 25), text: 'Packt Publishing published <em>Learning Highcharts by Example</em>. Since then, many other books are written about Highcharts.', title: 'First book' },
  //         { x: Date.UTC(2013, 4, 25), text: 'Highsoft nominated Norway\'s Startup of the Year', title: 'Award' },
  //         { x: Date.UTC(2014, 4, 25), text: 'Highsoft nominated Best Startup in Nordic Startup Awards', title: 'Award' }
  //     ],
  //     onSeries: 'revenue',
  //     showInLegend: false
  // });
  // }


  ///////////////////////////////////////////////////////////////////////////////
  //////////////////////////// O T H E R   C H A R T S //////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  chart1 = {
    title: {
      text: 'Combination chart'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Plums']
    }
    ,
    plotOptions: {
      series: {
        cursor: 'pointer',
        events: {
          click: function (event) {
            alert(
              this.name + ' clicked\n' +
              event.xAxis[0].value + '\n' +
              // event.yAxis[0].value + '\n' +
              'Alt: ' + event.altKey + '\n' +
              'Control: ' + event.ctrlKey + '\n' +
              'Meta: ' + event.metaKey + '\n' +
              'Shift: ' + event.shiftKey
            );
          }
        }
      }
    },
    labels: {
      items: [{
        html: 'Total fruit consumption',
        style: {
          left: '50px',
          top: '18px',
          //color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
        }
      }]
    },
    series: [{
      type: 'column',
      name: 'Jane',
      data: [3, 2, 1, 3, 4]
    }, {
      type: 'column',
      name: 'John',
      data: [2, 3, 5, 7, 6]
    }, {
      type: 'column',
      name: 'Joe',
      data: [4, 3, 3, 9, 0]
    }, {
      type: 'spline',
      name: 'Average',
      data: [3, 2.67, 3, 6.33, 3.33],
      marker: {
        lineWidth: 2,
        lineColor: Highcharts.getOptions().colors[3],
        fillColor: 'white'
      }
    }, {
      type: 'pie',
      name: 'Total consumption',
      data: [{
        name: 'Jane',
        y: 13,
        color: Highcharts.getOptions().colors[0] // Jane's color
      }, {
        name: 'John',
        y: 23,
        color: Highcharts.getOptions().colors[1] // John's color
      }, {
        name: 'Joe',
        y: 19,
        color: Highcharts.getOptions().colors[2] // Joe's color
      }],
      center: [100, 80],
      size: 100,
      showInLegend: false,
      dataLabels: {
        enabled: false
      }
    }]
  };

  chart2 = {
    chart: {
      polar: false,
      type: 'line'
    },

    title: {
      text: 'Budget vs spending',
      x: -80
    },

    pane: {
      size: '80%'
    },

    xAxis: {
      categories: ['Sales', 'Marketing', 'Development', 'Customer Support',
        'Information Technology', 'Administration'],
      tickmarkPlacement: 'on',
      lineWidth: 0
    },

    yAxis: {
      //gridLineInterpolation: 'polygon',
      lineWidth: 0,
      min: 0
    },

    tooltip: {
      shared: true,
      pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
    },

    legend: {
      align: 'right',
      verticalAlign: 'top',
      y: 70,
      layout: 'vertical'
    },

    series: [{
      name: 'Allocated Budget',
      data: [43000, 19000, 60000, 35000, 17000, 10000],
      pointPlacement: 'on'
    }, {
      name: 'Actual Spending',
      data: [50000, 39000, 42000, 31000, 26000, 14000],
      pointPlacement: 'on'
    }]
  };

  chart4 = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Browser market shares in January, 2018'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    series: [{
      name: 'Brands',
      colorByPoint: true,
      data: [{
        name: 'Chrome',
        y: 61.41,
        sliced: true,
        selected: true
      }, {
        name: 'Internet Explorer',
        y: 11.84
      }, {
        name: 'Firefox',
        y: 10.85
      }, {
        name: 'Edge',
        y: 4.67
      }, {
        name: 'Safari',
        y: 4.18
      }, {
        name: 'Other',
        y: 7.05
      }]
    }]
  }

  chart5 = {
    "chart": {
      "type": "column",
      "polar": false
    },
    "plotOptions": {
      "series": {
        "dataLabels": {
          "enabled": true,
          formatter: function () {
            if (this.y > 0)
              return this.y;
          }
        },
        "animation": false
      }
    },
    "title": {
      "text": "My Chart"
    },

    yAxis: {
      title: {}
    },
    xAxis: {
      categories: ['Apr', 'May', 'June', 'July', 'Aug']
    },
    "subtitle": {
      "text": "My Untitled Chart"
    },
    "exporting": {},

    "series": [
      {
        type: 'column',
        "name": "SOFTWARE",
        "turboThreshold": 0,
        data: [45, 28, 36, 7, 5]
      },
      {
        type: 'column',
        "name": "DATABASE",
        "turboThreshold": 0,
        data: [3, 45, 12, 0, 0]
      },
      {
        type: 'column',
        "name": "ACCOUNT",
        "turboThreshold": 1,
        data: [9, 11, 0, 0, 0]
      },
      {
        type: 'column',
        "name": "HARDWARE",
        "turboThreshold": 1,
        data: [5, 3, 3, 0, 0]
      },
      {
        type: 'column',
        "name": "NETWORK",
        "turboThreshold": 1,
        data: [1, 4, 0, 1, 1]
      },
      {
        type: 'column',
        "name": "INTERNET",
        data: [1, 5, 0, 0, 0]
      },
      {
        type: 'column',
        "name": "SECURITY",
        "turboThreshold": 1,
        data: [1, 2, 1, 0, 0]
      },
      {
        type: 'column',
        "name": "TELECOM",
        "turboThreshold": 1,
        data: [2, 1, 0, 0, 0]
      },
      {
        type: 'column',
        "name": "INTRANET",
        data: [1, 1, 0, 1, 0]
      },
      {
        type: 'column',
        "name": "EMAIL",
        "turboThreshold": 1,
        data: [0, 0, 2, 0, 0]
      }
    ]
  }

  pareto = {
    "chart": { "type": "column", "renderTo": "container" }, "title": { "text": "Pareto Chart" }, "tooltip": { "shared": true }, "xAxis": { "categories": ["Server", "SAP", "Server", "SAP", "G-Apps", "Password Reset", "Other", "Password Reset", "Other", "User Administration", "User Administration", "Hardware", "Hardware", "Alerts", "G-Apps", "Telecom", "Vendor Dependent", "Telecom", "Vendor Dependent", "Alerts"], "crosshair": true }, "yAxis": [{ "title": { "text": "" } }, { "title": { "text": "" }, "minPadding": 0, "maxPadding": 0, "max": 100, "min": 0, "opposite": true, "labels": { "format": "{value}%" } }], "series": [{ "type": "pareto", "name": "pareto", "yAxis": 1, "zIndex": 10, "baseSeries": 1 }, { "type": "column", "name": "Category", "zIndex": 2, "data": [253.0, 172.0, 138.0, 137.0, 110.0, 97.0, 88.0, 77.0, 63.0, 45.0, 44.0, 41.0, 38.0, 38.0, 34.0, 32.0, 30.0, 27.0, 22.0, 12.0] }]
  }

}
