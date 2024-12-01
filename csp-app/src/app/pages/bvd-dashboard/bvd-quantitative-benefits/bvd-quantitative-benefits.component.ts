import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BvdDashboardService } from '../services/bvd-dashboard.service';
import { BvdQuantitativeBenefitsDetailComponent } from '../bvd-quantitative-benefits-detail/bvd-quantitative-benefits-detail.component';


@Component({
  selector: 'app-bvd-quantitative-benefits',
  templateUrl: './bvd-quantitative-benefits.component.html',
  styleUrls: ['./bvd-quantitative-benefits.component.scss']
})
export class BvdQuantitativeBenefitsComponent implements OnInit {

  @Input('Value') Value: any[];
  @Input('ValueColumn') ValueColumn: any[];
  @Input('ValueStacked') ValueStacked: any[] = [];
  @Input('isDataEmpty') isDataEmpty: boolean;
  @Input('ValueBenefitDetaildata') benefitDetaildata : any;

  stackedData: any[];
  typeCategory = ['Idea','Continuous Improvement','Release','Service','Service Improvement','Innovation','Automation','Process Improvement'];
  @Output() uom = new EventEmitter<any>();
  constructor(private dialog:MatDialog,private _bvdService: BvdDashboardService, private _myUtil: myUtility) { }
  benefitValue: number
  graphData: any[] = [];
  columnGraphData: any[] = [];
  pieData: any[] = [];
  ideasCount: any[] = [];

  sum  = 0;
  UOM_Title = [];
  UOM_ID = 1;
//  yAxesTitle : string;
  selectedView = 'benefits';
  ideasByType: any[] = [];
  data2 : any[] = [];
 type:string;
 type1:string;
 type2:string;
 options: google.visualization.PieChartOptions;
 options1:  google.visualization.ColumnChartOptions ;
 options2: google.visualization.ColumnChartOptions;
 //view : google.visualization.DataView;
 columnNames = [];
 columnNames1 = [];
 columnNames2 = [];
 width : number;
 width1 : number;
 width2 : number;
height : number;
height1 : number;
height2: number;

  ngOnInit() {
    this.loadUOM();
    this.chartInit();
  }
  ngOnChanges() {
    this.loadPie();

    this.loadColumnGraph();
    this.loadStackedColumn();
  }
  chartInit()
  {
    this.type = 'PieChart';

  this.columnNames =
    ['benefit_Pillar', 'net_Benefits'];
  this.options = {

    backgroundColor: { fill: 'transparent' },
    pieHole: 0.5,
    legend: {
      position: 'right',
      alignment: 'center'
    },
    colors: ['#A7EAA0', '#7B7DD9', '#F5C540', '#78B5AC', '#FF7979'],
    sliceVisibilityThreshold: 0,
    pieSliceText: 'value',
    pieSliceTextStyle: {
      fontSize: 9,
      color: '#000000'
    },
    chartArea: {
      'width': '70%', 'height': '100%', 'bottom': 0, 'top': 0
    },
    tooltip: { trigger: 'focus' }
  };
  this.width = 450;
  this.height = 160;

  this.type1 = 'ColumnChart';
  this.width1 = 297;//320;
  this.height1 = 190;
  this.columnNames1 = ['months', 'net_Benefits',{ role: 'annotation'}];
  this.options1= {
    legend: { position: 'none' },
    vAxis: {title: "Cost In (USD) " , direction:1, slantedTextAngle:90 },
    //backgroundColor: '#F8F8F8',
      // chartArea: {
      //   'bottom': 0.5, 'top': 0.5
      // },
    bar: { groupWidth: 7 },
    tooltip: { trigger: 'focus' },
    backgroundColor: { fill: 'transparent' },


  };



  // Ideas stacked column chart

  this.type2 = 'ColumnChart';
  this.width2 = 410;
  this.height2 = 160;
  this.columnNames2 = ['status', 'Submitted','Execution','Implemented']
  // this.data2 = [
  //   ['Automation',0,0,0,0,0,0],
  //   ['Innovation',0,0,0,0,0,0],
  //   ['Improvement',0,0,0,0,0,0]
  // ]
  this.options2 = {
    legend: {
      position: 'right',
      alignment: 'center'
    },
    hAxis: {
      textStyle: {
        fontSize: 10
      },
      gridlines: {
        color: '#E5E5E5'
      },
      baselineColor: '#C1C1C1',
    },
    backgroundColor: { fill: 'transparent' },
    //backgroundColor: '#F8F8F8',
    series: [
      { color: '#77D3F5' },
      { color: '#FFD769' },
      { color: '#ACE8A4' },
      { color: '#D6B67A' }
    ],
    isStacked: true,
    tooltip: { trigger: 'focus' },
    vAxis:
      {
        baselineColor: '#C1C1C1',
        format:"0"
      },
    bar: { groupWidth: "30%" },

    chartArea: {
      'width': '50%',
      'height': '60%', //left: 25, top: 0, bottom: 5
    },
  };

  }



  onUOMChange() {

    this.uom.emit(this.UOM_ID)
  }




  loadColumnGraph() {

    var title  = this.UOM_Title.filter(x => x.id == this.UOM_ID)
    this.columnGraphData = [];
    for (var row of this.ValueColumn) {
      this.columnGraphData.push([row.months, row.net_Benefits,row.net_Benefits])
    }
    if(title.length > 0)
    this.options1.vAxis.title =  this.UOM_Title.filter(x => x.id == this.UOM_ID)[0].title;
  }

  loadPie() {
    this.graphData = [];

    for (var row of this.Value) {

      this.graphData.push([row.benefit_Pillar, row.net_Benefits])
    }

    this.getPieValue();

  }



  loadStackedColumn() {
    this.stackedData = [];
    this.ideasCount = [];

    //console.log(this.ValueStacked);

    for (let i = 0; i < this.typeCategory.length; i++) {
      var rec = this.ValueStacked.find(x => x.improvement_Type == this.typeCategory[i]);

      var title = this.typeCategory[i];
      if (rec != null) {
        this.stackedData.push([title, rec.submitted,rec.execution, rec.implemented]);
        this.ideasCount.push([title, (rec.submitted + rec.implemented + rec.execution)])
      }
      else {
      //  this.stackedData.push([title, 0, 0, 0]);
      // this.ideasCount.push([title, 0]);
      }
    }
    // console.log("Count:",this.ideasCount)
  }

  getPieValue() {
    let pillarArr = [["People", 0], ["Process", 0], ["Technology", 0], ["Facilities", 0], ["Assets", 0]];

    var UOM_Key = [{ key: 1, Name: "$" }, { key: 2, Name: "Nos" },{key: 3, Name: "%"},{key: 4, Name: "Mins"},{ key: 5, Name: "No" }, { key: 6, Name: "Hrs" },{key: 7, Name: "No"}]
    var UOM_Value = UOM_Key.find(x1 => x1.key == this.UOM_ID).Name;
    this.pieData = [];
    this.pieData = pillarArr;

    // console.log("PIE DATA:",this.pieData)
    // console.log("GRAPH DATA:",this.graphData)
    pillarArr.forEach((x, i) => {

      this.graphData.forEach((y) => {
        if (x[0] === y[0]) {
          this.pieData[i][1] = y[1];
        }

      });
      this.pieData[i][0] = (UOM_Value == "$" ? "$" + this.pieData[i][1] + " - " +  this.pieData[i][0] : this.pieData[i][1] + " " + UOM_Value + " - " +this.pieData[i][0])
    });


  }

  loadUOM() {
    this._bvdService.getUOM().subscribe(data => {
      this.UOM_Title = data;
      this.UOM_ID = this.UOM_Title[0].id;
      this.options1.vAxis.title = this.UOM_Title[0].title;
      //console.log(this.UOM_Title)
    }, (err) => { this._myUtil.serviceError(err) })

  }

  openView()
  {
    //console.log(this.benefitDetaildata);
    const dialogConfig = new MatDialogConfig();
     dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'DetailsdataQuantitative' : this.benefitDetaildata
    }
    dialogConfig.maxWidth = '75%'
    dialogConfig.width = "100vw"
    //dialogConfig.height = '500px'
     const dialogRef = this.dialog.open(BvdQuantitativeBenefitsDetailComponent,dialogConfig);
     dialogRef.afterClosed().subscribe(res => {});
  }
}
