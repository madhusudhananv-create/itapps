import { Component, OnInit } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';
import * as Highcharts from 'highcharts/highstock';
//import * as HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { AppsService } from '../../Services/apps.service';
import { KpiDetailsExtendedModel, TreeHealthReportCustomer } from '../../models/kpi-details-extended-model';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { KpiChartsComponent } from '../popup/kpi-charts/kpi-charts.component';
import { DateSelectionModel } from '../../models/DateSelection-model';
declare var require: any
const HC_exporting = require('highcharts/modules/exporting');
const HC_ExportData = require('highcharts/modules/export-data');
//HighchartsSolidGauge(Highcharts);

@Component({
  selector: 'app-portfoliodashboard',
  templateUrl: './portfoliodashboard.component.html',
  styleUrls: ['./portfoliodashboard.component.scss']
})
export class PortfoliodashboardComponent implements OnInit {
  Highcharts = Highcharts;
  constructor(public _util: myUtility, private _appService: AppsService, public dialog: MatDialog) { }
  chart8: any;
  lineChartData: any;
  HealthReportDetailed: KpiDetailsExtendedModel[] = [];
  TreeHealthReport: TreeHealthReportCustomer[] = []
  KPIDetails_PIEDrildown: any[] = [];
  pieChartData: any
  qualityChart: any;
  complianceChart: any;
  performanceChart: any;
  overallChart: any;
  overallChartPie: any;
  valueChart: any;
  overAllpieChart: any;
  OverallScoreGaugeChart: any;
  custIds: string = "-1";
  projIds: string[] = [];
  bShowDateSelection1: Boolean = false;
  bShowDateSelection2: Boolean = false;
  bShowKPIDetails: Boolean = false;
  DateSelection1 = new DateSelectionModel(this._util);
  DateSelection2 = new DateSelectionModel(this._util);
  KPIDetailsHeading: string = "";

  ngOnInit() {
    this.DateSelection2.checkedValue = 'finacialYear';
    this.GetStartandEndDate(this.DateSelection1);
    this.GetStartandEndDate(this.DateSelection2);
    this.LoadData1(this.DateSelection1);
    this.LoadData2(this.DateSelection2);
  }
  LoadData1(DateSelection: DateSelectionModel) {
    if (DateSelection.endDate < DateSelection.startDate) {
      alert("End Date cannot be greater than Start Date");
      return;
    }
    this.GetDisplayPeriod(DateSelection);
    
    this.OverallScoreGaugeChart = undefined;
    this.overAllpieChart = undefined;
    this.performanceChart = undefined;
    this.qualityChart = undefined;
    this.complianceChart = undefined;
    this.valueChart = undefined;
    this.pieChartData = undefined;

    if (DateSelection.startDate == undefined || DateSelection.endDate == undefined) {
      alert("Please provide Start and End Period");
    }
    else {
      this.Service_GetHealthReportDetailedProject(this.custIds.toString(), this.projIds, DateSelection.startDate, DateSelection.endDate);
      this.service_GetHealthReportDetailedPie(this.custIds.toString(), this.projIds, DateSelection.startDate, DateSelection.endDate)
      this.Service_GetHealthReportOverallPie(this.custIds.toString(), this.projIds, DateSelection.startDate, DateSelection.endDate)
    }
  }
  LoadData2(DateSelection) {
    if (DateSelection.endDate < DateSelection.startDate) {
      alert("End Date cannot be greater than Start Date");
      return;
    }
    this.GetDisplayPeriod(DateSelection);
    
    this.overallChart = undefined;
    this.lineChartData = undefined;
    if (DateSelection.startDate == undefined || DateSelection.endDate == undefined) {
      alert("Please provide Start and End Period");
    }
    else {
      this.Service_GetHealthReportOverallLine(this.custIds.toString(), this.projIds, DateSelection.startDate, DateSelection.endDate)
      this.service_GetHealthReportMonthlyLine(this.custIds.toString(), this.projIds, DateSelection.startDate, DateSelection.endDate)
    }
  }
  GetDisplayPeriod(DateSelection) {
    if (DateSelection.checkedValue === 'currentMonth') {
      DateSelection.period = DateSelection.selectedStartMonth + " " + DateSelection.selectedStartYear.toString();
    }
    else {
      DateSelection.period = DateSelection.selectedStartMonth + " " + DateSelection.selectedStartYear.toString();
      DateSelection.period += " - " + DateSelection.selectedEndMonth + " " + DateSelection.selectedEndYear.toString();
    }
    DateSelection.period = DateSelection.period
  }
  getPiedataOverall() {
    this._appService.getPieDataForPortfolio().subscribe(
      data => {
        this.chart8 = data;
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }

  showKpiCharts(col) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      custId: col.data.custId,
      projId: col.data.projId,
      startDate: this.DateSelection1.startDate,
      endDate: this.DateSelection1.endDate
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(KpiChartsComponent, dialogConfig);
    dialogRef.updatePosition({ top: '10px' });
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  project_onChange(event) {
    this.projIds = [];
    this.custIds = event.customer;
    this.projIds = event.project;
    //this.LoadData()
  }

  GetStartandEndDate(DateSelection) { 
    if (DateSelection.checkedValue == "currentMonth") {
      DateSelection.selectedStartMonth = this._util.Month();
      DateSelection.selectedStartYear = this._util.Year();

      DateSelection.selectedEndMonth = this._util.Month();
      DateSelection.selectedEndYear = this._util.Year();

      DateSelection.startDate = new Date(DateSelection.selectedStartYear, this._util.MonthCurrNum()-1, 1)
      DateSelection.endDate = new Date(DateSelection.selectedStartYear, this._util.MonthCurrNum(), 1)
    }
    else if (DateSelection.checkedValue == "finacialYear") {
      if (new Date().getMonth() <= 3) {
        DateSelection.selectedStartMonth = this._util.getMonthAbr(3);
        DateSelection.selectedStartYear = (new Date().getFullYear()) - 1;
        DateSelection.selectedEndMonth = this._util.getMonthAbr(2);
        DateSelection.selectedEndYear = (new Date().getFullYear());
        DateSelection.startDate = new Date(DateSelection.selectedStartYear, 3, 1);
        DateSelection.endDate = new Date(DateSelection.selectedEndYear, 2, 1);
      }
      else {
        DateSelection.selectedStartMonth = this._util.getMonthAbr(3);
        DateSelection.selectedStartYear = (new Date().getFullYear());
        DateSelection.selectedEndMonth = this._util.getMonthAbr(2);
        DateSelection.selectedEndYear = (new Date().getFullYear()) + 1;
        DateSelection.startDate = new Date(DateSelection.selectedStartYear, 3, 1);
        DateSelection.endDate = new Date(DateSelection.selectedEndYear, 2, 1);
      }
    }
    else if (DateSelection.checkedValue == "checkByMonth") 
    {
      DateSelection.startDate = new Date(DateSelection.selectedStartYear, this._util.getMonthNum(DateSelection.selectedStartMonth), 1);
      DateSelection.endDate = new Date(DateSelection.selectedEndYear, this._util.getMonthNum(DateSelection.selectedEndMonth), 1);
    }
  }
  // saveDates() {

  //   this.startDate = new Date(this.selectedStartYear, this._util.getMonthNum(this.selectedStartMonth), 1);
  //   if (this.checkedValue == "currentMonth")
  //     this.endDate = new Date(this.selectedEndYear, this._util.getMonthNum(this.selectedStartMonth), 1);
  //   else
  //     this.endDate = new Date(this.selectedEndYear, this._util.getMonthNum(this.selectedEndMonth), 1);
  // }
  saveDates(DateSelection) {
    DateSelection.startDate = new Date(DateSelection.selectedStartYear, this._util.getMonthNum(DateSelection.selectedStartMonth), 1);
    if (DateSelection.checkedValue == "currentMonth")
      DateSelection.endDate = new Date(DateSelection.selectedStartYear, this._util.getMonthNum(DateSelection.selectedStartMonth), 1);
    else
      DateSelection.endDate = new Date(DateSelection.selectedEndYear, this._util.getMonthNum(DateSelection.selectedEndMonth), 1);
  }
  assignCharts() {
    this.pieChartData.forEach(element => {
      if (element.title.text == "Quality")
        this.qualityChart = element;
      else if (element.title.text == "Compliance")
        this.complianceChart = element;
      else if (element.title.text == "Value")
        this.valueChart = element;
      else if (element.title.text == "Performance")
        this.performanceChart = element;
      else if (element.title.text == "Overall Health Index")
        this.overAllpieChart = element;
    });
    this.SetClickEvent(this.overAllpieChart);
    this.SetClickEvent(this.complianceChart);
    this.SetClickEvent(this.valueChart);
    this.SetClickEvent(this.performanceChart);
    this.SetClickEvent(this.qualityChart);
  }
  SetClickEvent(PieChart) {
    if (PieChart != undefined) {
      PieChart.plotOptions.series.events.click = (event) => this.callExternalFunction(event);
    }
  }
  selectedChartTitle: string;
  selectedChartY: number;
  selectedChartColor: string;
  kpiDetails: any[];
  callExternalFunction(obj) {
    this.selectedChartTitle = obj.point.options.name;
    this.selectedChartY = obj.point.y;
    this.selectedChartColor = obj.point.color;
    this.bShowKPIDetails = true; // !this.bShowKPIDetails;
    this.service_GetKPIDetailsTable(this.custIds.toString(), this.projIds, this.DateSelection1.startDate, this.DateSelection1.endDate, this.selectedChartTitle, this.selectedChartColor)

  }
  ShowDateSelection1() {
    this.bShowDateSelection1 = !this.bShowDateSelection1;
  }
  ShowDateSelection2() {
    this.bShowDateSelection2 = !this.bShowDateSelection2;
  }
  CloseDateSelection1() {
    this.bShowDateSelection1 = false;
  }
  CloseDateSelection2() {
    this.bShowDateSelection2 = false;
  }
  CloseKPIDetails() {
    this.bShowKPIDetails = false;
  }
  service_GetKPIDetailsTable(custId: string, projIds: string[], startdate: Date, enddate: Date, perspective: string, color: string) {
    this._appService.GetKpiDetailsTable(custId, projIds, startdate.toDateString(), enddate.toDateString(), perspective, color).subscribe(data => {
      this.KPIDetails_PIEDrildown = data;
    }, error => { this._util.serviceError(error); });
  }
  Service_GetHealthReportDetailedProject(custId: string, projIds: string[], startdate: Date, enddate: Date) {
    this._appService.GetHealthReportDetailedProject(custId, projIds, startdate.toDateString(), enddate.toDateString()).subscribe(data => {
      this.TreeHealthReport = data;
    }, error => { this._util.serviceError(error); });
  }
  Service_GetHealthReportOverallLine(custId: string, projIds: string[], startdate: Date, enddate: Date) {
    this._appService.GetHealthReportOverallLine(custId, projIds, startdate.toDateString(), enddate.toDateString()).subscribe(data => {
      this.overallChart = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetHealthReportOverallPie(custId: string, projIds: string[], startdate: Date, enddate: Date) {
    this._appService.GetHealthReportOverallPie(custId, projIds, startdate.toDateString(), enddate.toDateString()).subscribe(data => {
      this.OverallScoreGaugeChart = data;
      //this.overallChartPie = data;
      //this.getPieChart();
    }, error => { this._util.serviceError(error); });
  }

  service_GetHealthReportDetailedPie(custId: string, projIds: string[], startdate: Date, enddate: Date) {
    this._appService.GetHealthReportDetailedPie(custId, projIds, startdate.toDateString(), enddate.toDateString()).subscribe(data => {
      this.pieChartData = data;
      this.assignCharts();
    }, error => { this._util.serviceError(error); });
  }
  service_GetHealthReportMonthlyLine(custId: string, projIds: string[], startdate: Date, enddate: Date) {
    this._appService.GetHealthReportMonthlyLine(custId, projIds, startdate.toDateString(), enddate.toDateString()).subscribe(data => {
      this.lineChartData = data;
    }, error => { this._util.serviceError(error); });
  }
  
  // getPieChart() {
  //   this.OverallScoreGaugeChart = {
  //     chart: {
  //       type: 'solidgauge'
  //     },
  //     title: {
  //       text: 'Overall Health Index',
  //       style: {
  //         fontSize: '15px'
  //       }
  //     },
  //     credits: {
  //       enabled: false
  //     },
  //     pane: {
  //       startAngle: 0,
  //       endAngle: 360,
  //       background: [
  //         { 
  //           outerRadius: '112%',
  //           innerRadius: '88%',
  //           backgroundColor: '#CDE2F8',
  //           borderWidth: 0
  //         },
  //       ]
  //     },
  //     yAxis: {
  //       min: 0,
  //       max: 100,
  //       lineWidth: 0,
  //       tickPositions: []
  //     },
  //     plotOptions: {
  //       pie: { size: 80 },
  //       solidgauge: {
  //         linecap: 'round',
  //         stickyTracking: false,
  //         rounded: true
  //       },
  //     },
  //     series: [{
  //       name: 'Overall Health Index',
  //       data: [{
  //         color: '#7CB5EC',
  //         radius: '112%',
  //         innerRadius: '88%',
  //         y: Number(this.overallChartPie)
  //       }],
  //       dataLabels: {
  //         enabled: true,
  //         borderWidth: 0,
  //         valueSuffix: ' %',
  //         y: -15,
  //         style: { background: 'red', color: 'black', fontSize: '200%', fontWeight: 'bold', textOutline: '1px contrast' },
  //         format: '{point.y}%'
  //       }
  //     }]
  //   };
  // }
}

