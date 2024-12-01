import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../../Services/apps.service';
import { CustomerModel, ResourcesSummary } from '../../../models/customer-model';
import { DashboardService } from '../dashboard.service';
import { DashboardDetailsModel, SuccessGoalsScoresModel, SuccessGoalsScoresModelForAProject } from '../../../models/dashboard-details-model';
import { myUtility } from '../../../Shared/myUtility';
import {HighchartsChartComponent} from '../../../controls/highcharts-chart/highcharts-chart.component';

import * as Highcharts from 'highcharts/highstock';
import { ViewChild } from "@angular/core";
import { MatSelect, MatOption, MatSelectChange } from '@angular/material';
import { MatPaginator, MatTableDataSource, MatSort, MatDialogConfig, MatDialog } from '@angular/material';
import { CSSNPSDetailsModel } from '../../../models/css-nps-details-model';

@Component({
  selector: 'app-coodashboard',
  templateUrl: './coodashboard.component.html',
  styleUrls: ['./coodashboard.component.scss']
})
export class COODashboardComponent implements OnInit {


  Highcharts = Highcharts;
  private sub: any;
  customerid: string;
  customerids : string[] = [];
  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;
  dashboardDetails: DashboardDetailsModel[] = [];

  dataSource: MatTableDataSource<any>;

 



  displayedColumns = ['respondant_NAME', 'project_NAME', 'csS1', 'npS1','csS2', 'npS2','csS3', 'npS3','csS4', 'npS4'];   


  trendChartDataNPS: any;
  heatMapData : any;
  promotors : number = 0;
  passives   : number = 0;
  detractors : number = 0;

  pqPromotors : number = 0;
  pqPassives : number =0;
  pqDetractors : number = 0;

Propro : number = 0;
Propas : number = 0;
Prodet : number = 0;

Paspro : number = 0;
Paspas : number = 0;
Pasdet : number = 0;

Detpro : number = 0;
Detpas : number = 0;
Detdet : number = 0;

ddyear: number[];
custId: string[];
Customer : any[] = [];

lastQuarter : any;
currentQuarter : any;
currentYear : any;

cYear : number;

vcustomerids : string[];


  showQuarterSettings : boolean = false;
  showNPSTrendChart: boolean = false; 
  showNPSDetails : boolean = false;
  showCSSNPSTooltip : boolean = false;



  selectedOption = 'NeedFocus';
  bNeedFocus : boolean = true;


  perPropro : string;
  perPropas : string;
  perProdet : string;

  perPaspro : string;
  perPaspas : string;
  perPasdet : string;

  perDetpro : string;
  perDetpas : string;
  perDetdet : string;


  imgperPropro : string;
  imgperPropas : string;
  imgperProdet : string;

  imgperPaspro : string;
  imgperPaspas : string;
  imgperPasdet : string;

  imgperDetpro : string;
  imgperDetpas : string;
  imgperDetdet : string;


  CSATScoreData1 : number = 0;
  CSATScoreData2 : number = 0;
  CSATScoreData3 : number = 0;
  CSATScoreData4 : number = 0;

  csatMapData : any;

  @ViewChild('select') portselect: MatSelect;
  @ViewChild('allSelected') allSelected : MatOption;


  constructor(private route: ActivatedRoute,private _appservice: AppsService,public _util: myUtility) { }

  ngOnInit() {


      this.ddyear = this._util.Years(3);

      this.sub = this.route.params.subscribe(params => {

      this.LoadCustomer(true);

      this.service_LoadCustomerByEmpIdByCustomerId(this.customerid);

      this.allSelected.select();

      

      //this.getNPSTrendData();
      //this.getCSATHeatmap();
      
      
    

  });
  }


  service_LoadCustomerByEmpIdByCustomerId(customerid) {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      
      
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
        //this.customerids = [202100062,202100065];
        this.customerids = this.customerList.map(t => t.cusT_ID);
        this.Customer = this.customerList;
        this.custId = this.customerids;
        
       // this.custId = this.customerids

      
      this.vcustomerids = this.customerids;

      //this.custId = this.vcustomerids.map(function(e){if(e > 0) return e.toString()});
      

              
        //this.customerid = this.selectedCustomer.cusT_ID;
        this.service_GetDashboardDetails();

        this.getNPSScoreDataRange();

     //   this.getHighlightsForCurrentMonth();
        // if (this._dashboardUtil.CSG_FilterMonth == undefined) {
        //   this._dashboardUtil.CSG_FilterMonth = this._util.Month();
        //   this._dashboardUtil.CSG_FilterYear = this._util.Year();
        //   this.service_getSuccessGoalScoresForProject(this.selectedCustomer.cusT_ID);
        // }
        // else
        //this.loadSuccessGoalForPeriod(this.reset);
      }
    }
    
    , error => { this._util.serviceError(error); });

    
  }


  service_GetDashboardDetails() {
    this._appservice.GetDashboardDetailsByCustomerIds(this.customerids).subscribe(data => {
      this.dashboardDetails = data;


      
      this.fillGraphDetails();
    }, error => {
      this._util.serviceError(error); 
    });
  }


  fillGraphDetails() {
    
    this.fillGraphStaffSummaryPie();
    this.fillGraphBillingSummaryColumn();
    
  }


  //-------------------------------------
  //Staffing Summary - Pie Chart
  //-------------------------------------
  type2 = 'PieChart';
  data2: any[] = [
    ['Offshore', 0],
    ['Onsite', 0]
  ]
  columnNames2 = ['Offshore', 'Onsite'];
  width2 = 250;
  height2 = 150;
  options2: google.visualization.PieChartOptions = {
    colors: ['#54b8e8', '#3ab376'],
    chartArea: { 'width': '100%', 'height': '80%' },
    legend: {
      position: 'bottom', alignment: 'center', textStyle: {
        fontSize: 9, bold: true
      }
    },
    tooltip: {       trigger: 'selection'     },  
    pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 16 }
  }; 


  fillGraphStaffSummaryPie() {
    this.data2 = [];
    //this.data2.push(["Offshore", this.getGraphValue_customer('OFFSHORE_TOTAL')]);
    //this.data2.push(["Onsite", this.getGraphValue_customer('ONSITE_TOTAL')]);

    this.data2.push(["Offshore", this.getGraphValue_AllCustomers('OFFSHORE_TOTAL')]);
    this.data2.push(["Onsite", this.getGraphValue_AllCustomers('ONSITE_TOTAL')]);

   
    
  }



  getGraphValue_AllCustomers(title)
  {
      let iValue = 0;
      
      this.customerids.forEach((element ,index) => {
         iValue +=  this.getGraphValue_customerTC(title,element);
        });   


      return iValue;
  }



  getGraphValue_customerTC(title,element) {
    let iValue = 0;
    let sValue = this.getTitleByCustomerTC(title,element);

    if (sValue != '-')
      sValue = sValue.replace("%", "");
    else
      sValue = '0';

    if (sValue != undefined)
      iValue = Number(sValue);
    return iValue;
  }


  getGraphValue_customer(title) {
    let iValue = 0;
    let sValue = this.getTitleByCustomer(title);

    if (sValue != '-')
      sValue = sValue.replace("%", "");
    else
      sValue = '0';

    if (sValue != undefined)
      iValue = Number(sValue);
    return iValue;
  }


  

  

  getTitleByCustomerTC(title,customerId) {
    let content: string = '';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null && t.cusT_ID == customerId);
      
      if (details.length > 0) {
        content = details[0].content;
      }
    }    

    return content;
  }
 


  getTitleByCustomer(title) {
    let content: string = '';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null);
      
      
      
      if (details.length > 0) {
        content = details[0].content;
      }
    }

   

    return content;
  }


  //Billing Summary - column Chart
  type3 = 'ColumnChart';
  height3 = 150;
  width3 = 250;
  data3: any[] =
    [
      ['Non-Billable', 0, '0', 0, '0'],
      ['Billable', 0, '0', 0, '0']
    ];
  columnNames3 = ['Status', 'Onsite', { 'role': 'annotation' }, 'Offshore', { 'role': 'annotation' }];
  options3: google.visualization.ColumnChartOptions
    = {
      legend: {
        position: 'bottom',
        alignment: 'center',
        textStyle: {
          fontName: 'Helvetica',
          fontSize: 12
        }
      },
      width: 250,
      height: 150,
      vAxis: {
        ticks: [],
        baselineColor: '#FFFFFF'
      },
      annotations: {
        textStyle: {
          fontSize: 16
        },
        alwaysOutside: true,
      },

      bar: { groupWidth: "70%", },
      colors: ['#3ab376', '#54b8e8'],

      chartArea: {
        'width': '70%', 'height': '70%', left: 10, top: 0
      },
    };
  //-------------------------------------
  fillGraphBillingSummaryColumn() {
    this.data3 = [];
    this.data3.push([
      "Non-Billable",
      this.getGraphValue_customer('ONSITE_NON_BILLABLE'),
      this.getGraphValue_customer('ONSITE_NON_BILLABLE'),
      this.getGraphValue_customer('OFFSHORE_NON_BILLABLE'),
      this.getGraphValue_customer('OFFSHORE_NON_BILLABLE')]);
    this.data3.push([
      "Billable",
      this.getGraphValue_customer('ONSITE_BILLABLE'),
      this.getGraphValue_customer('ONSITE_BILLABLE'),
      this.getGraphValue_customer('OFFSHORE_BILLABLE'),
      this.getGraphValue_customer('OFFSHORE_BILLABLE')]);
  }

  // NPS Trend Data...

  getNPSTrendData() {  
    
    
    this._appservice.getTrendChartforNPS(15, "2019").subscribe(data => {
      this.trendChartDataNPS = data;   
      
      
    }, error => { this._util.serviceError(error); })
  }

  getNPSScoreDataRange()
  {
    
    

    var vEndYear : number;    
    vEndYear = this.currentYear - 1999;    
    
    //var vQuarter1 = this.lastQuarter + " " + this.cYear + "-" + vEndYear;
    //var vQuarter2 = this.currentQuarter + " " + this.cYear + "-" + vEndYear;
    
     var vQuarter1 = "";
     var vQuarter2 = "";
    
    this._appservice.getNPSScoreDataRange("NetPromotorScore-ViewDetails",vQuarter1,vQuarter2,this.custId).subscribe(data => {    
    this.heatMapData = data;        
        
     

     this.currentQuarter = this.heatMapData.currentQuarter;
     this.lastQuarter = this.heatMapData.lastQuarter;

      this.promotors = this.heatMapData.promotors;
      this.passives = this.heatMapData.passives;
      this.detractors = this.heatMapData.detractors;

      this.pqPromotors = this.heatMapData.pqPromotors;
      this.pqPassives = this.heatMapData.pqPassives;
      this.pqDetractors = this.heatMapData.pqDetractors;

      this.Propro = this.heatMapData.propro;
      

      this.Propas = this.heatMapData.propas;
      this.Prodet = this.heatMapData.prodet;

      this.Paspro = this.heatMapData.paspro;
      this.Paspas = this.heatMapData.paspas;
      this.Pasdet = this.heatMapData.pasdet;

      this.Detpro = this.heatMapData.detpro;
      this.Detpas = this.heatMapData.detpas;
      this.Detdet = this.heatMapData.detdet;          

      
       this.perPropro =  this.getPercentage(this.pqPromotors,this.promotors);
       this.perPropas =  this.getPercentage(this.pqPromotors,this.passives);
       this.perProdet =  this.getPercentage(this.pqPromotors,this.detractors);

       this.perPaspro =  this.getPercentage(this.pqPassives,this.promotors);
       this.perPaspas =  this.getPercentage(this.pqPassives,this.passives);
       this.perPasdet =  this.getPercentage(this.pqPassives,this.detractors);

       this.perDetpro = this.getPercentage(this.pqDetractors,this.promotors);
       this.perDetpas = this.getPercentage(this.pqDetractors,this.passives);
       this.perDetdet = this.getPercentage(this.pqDetractors,this.detractors);
       
      
       this.imgperPropro =  this.getPerImage(this.pqPromotors,this.promotors);
       this.imgperPropas =  this.getPerImage(this.pqPromotors,this.passives);
       this.imgperProdet =  this.getPerImage(this.pqPromotors,this.detractors);

       this.imgperPaspro =  this.getPerImage(this.pqPassives,this.promotors);
       this.imgperPaspas =  this.getPerImage(this.pqPassives,this.passives);
       this.imgperPasdet =  this.getPerImage(this.pqPassives,this.detractors);

       this.imgperDetpro = this.getPerImage(this.pqDetractors,this.promotors);
       this.imgperDetpas = this.getPerImage(this.pqDetractors,this.passives);
       this.imgperDetdet = this.getPerImage(this.pqDetractors,this.detractors);

       this.CSATScoreData1 = 0;
       this.CSATScoreData2 = 0;
       this.CSATScoreData3 = 0;
       this.CSATScoreData4 = 0;


      
      
       
       this.csatMapData = this.heatMapData.listCSATScoreDetails.filter((CSATViewDetails) => CSATViewDetails.csatScore ==1);

       for(var i = 0; i < this.csatMapData.length; i++)
       {  
          var csat = this.csatMapData[i];  
          this.CSATScoreData1 += (csat.csatCount);  
       }

      this.csatMapData = this.heatMapData.listCSATScoreDetails.filter((CSATViewDetails) => CSATViewDetails.csatScore ==2);
      
      for(var i = 0; i < this.csatMapData.length; i++)
       {  
          var csat = this.csatMapData[i];  
          this.CSATScoreData2 += (csat.csatCount);  
       }

       this.csatMapData = this.heatMapData.listCSATScoreDetails.filter((CSATViewDetails) => CSATViewDetails.csatScore ==3);

       for(var i = 0; i < this.csatMapData.length; i++)
       {  
          var csat = this.csatMapData[i];  
          this.CSATScoreData3 += (csat.csatCount);  
       }

       this.csatMapData = this.heatMapData.listCSATScoreDetails.filter((CSATViewDetails) => CSATViewDetails.csatScore ==4);

       for(var i = 0; i < this.csatMapData.length; i++)
       {  
          var csat = this.csatMapData[i];  
          this.CSATScoreData4 += (csat.csatCount);  
       }




      
      this.fillNetPromoterScorePieChart();
      this.fillCSATScorePieChart();


      //this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.npsType==score);
      this.dataSource =  this.heatMapData.listNPSViewDetails;

      var source  = this.getSpecificNPSScore('Paspas');
      this.dataSource = new MatTableDataSource(source);

      

    }, error => {  

      this._util.serviceError(error); })
  }


  getNPScoreDataDetails() {


    var vEndYear : number;    
    vEndYear = this.currentYear - 1999;    
    
    var vQuarter1 = this.lastQuarter + " " + this.cYear + "-" + vEndYear;
    var vQuarter2 = this.currentQuarter + " " + this.cYear + "-" + vEndYear;

       this._appservice.getNPScoreDataDetails("NetPromotorScore-ViewDetails",vQuarter1,vQuarter2,this.custId).subscribe(data => {    
       this.heatMapData = data;         
       

       
    });
  }


  getCSATHeatmap() {
    //this._appservice.getCSATHeatMap("Q1", "2019").subscribe(data => {
      this._appservice.getNPScoreData("Current").subscribe(data => {    
      this.heatMapData = data;         
         
            

      this.lastQuarter = this.heatMapData.lastQuarter.substring(0,2);
      this.currentQuarter = this.heatMapData.currentQuarter.substring(0,2);
      this.currentYear = this.heatMapData.currentQuarter.substring(3,7);
      this.cYear = this.currentYear;
      
      

      this.vcustomerids = this.customerids;

      //this.custId = this.vcustomerids.map(function(e){return e.toString()});
      

     
      //this.getNPSScoreDataRange();
      //this.getNPScoreDataDetails();

      
      
      

    }, error => { this._util.serviceError(error); })
  }

  onValChange(val) {
    this.selectedOption = val;
    if (val === 'NeedFocus')
      this.bNeedFocus = true
    else
      this.bNeedFocus = false;
  }  


  getSpecificNPSScore(score : string)
  {
     
     
     var source = this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.npsType==score);
     //this.dataSource = new MatTableDataSource(source);
     return source;

  }


  getSpecificCSSNPSScores(ID : any)  {     
     
     return this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.id==ID);
  }

  


  closePopup(popupName : string) {    
    if(popupName=="NPSTrendChart")
      this.showNPSTrendChart = false;

    if(popupName=="QuarterSettings")
      this.showQuarterSettings = false;

      if(popupName=="showNPSDetails")
        this.showNPSDetails = false;


     if(popupName=="showCSSNPSTooltip")
        this.showCSSNPSTooltip = false;
      
  }



  LoadCustomer(allcust: boolean) {
    this._appservice.GetRASCustomerList().subscribe(data => {
      this.Customer = data;
      
      
      
      if (this.Customer.length > 0 && this.custId != undefined) {
        this.ddCustomer_Onchange();
      }
      else if (this.Customer.length > 0 && this.custId != undefined) {
        this.custId = this.Customer[0].releasE_ID;        
        this.ddCustomer_Onchange();
      }
    }, error => { this._util.serviceError(error); });
  }


  ddCustomer_Onchange() {
    //this.LoadProject();

    this.getNPSScoreDataRange();
  }


  btnCancel()
  {       
       this.closePopup('QuarterSettings');       
  }


  btnApply()
  {
       this.getNPSScoreDataRange();
       this.closePopup('QuarterSettings');
       
  }

  getPerImage(FirstValue : any, SecondValue : any)
  {
    var resultValue : number = 0;
     var endResult : string = "nochange";
     resultValue = FirstValue - SecondValue;
     if(resultValue > 0)
      endResult ="increase";
     if(resultValue < 0)
      endResult ="decrease";    

     

     return endResult;

  }


  getPercentage(FirstValue : any, SecondValue : any)
  {
     var resultValue : number = 0;
     var endResult : string;
     resultValue = Math.abs(FirstValue - SecondValue);

     if(resultValue > 0 && FirstValue > 0)
     {
          resultValue = (resultValue / FirstValue) * 100;
          resultValue = Math.ceil(resultValue);     
          endResult = resultValue.toString() + "%";
     }
     else 
     {
        endResult = "_";
     }

    

    return endResult;
     
  }


  toggleSelection()
  {
      if(this.allSelected.selected)       
        this.portselect.options.forEach((item : MatOption) => item.select());
      else
        this.portselect.options.forEach((item : MatOption) => item.deselect());
      
  }

  fillCSATScorePieChart() {    

    this.data1 = [];    
    this.data1.push(["<=2", this.CSATScoreData1]);
    this.data1.push(["3", this.CSATScoreData2]);
    this.data1.push(["4", this.CSATScoreData3]);
    this.data1.push(["5", this.CSATScoreData4]);
    this.data1.push([null, this.CSATScoreData1 + this.CSATScoreData2 + this.CSATScoreData3 + this.CSATScoreData4]);
  }



  fillNetPromoterScorePieChart() {    

    this.data5 = [];    
    this.data5.push(["Promoters", this.promotors + this.pqPromotors]);
    this.data5.push(["Passives", this.passives + this.pqPassives]);
    this.data5.push(["Detractors", this.detractors + this.pqDetractors]);
    this.data5.push([null, this.promotors + this.pqPromotors + this.passives + this.pqPassives + this.detractors + this.pqDetractors]);
  }
 

  
  passedPosition : google.visualization.ChartLegendPosition = 'right';
  type5 = 'PieChart';
  width5 = 100;
  height5 = 100;
  columnNames5 = ['Title', 'Value'];
  data5 = [
    ['Promoters', 30],
    ['Passives', 50],
    ['Detractors', 20],
    [null,100]
  ];
  options5: google.visualization.PieChartOptions
    = {
      legend: {
        position : this.passedPosition,
        alignment:'center'        
      },
      pieHole: 0.5,
      pieStartAngle: 270,
      sliceVisibilityThreshold: 0,
      height: 200,
      width: 200,
      pieSliceText: 'value',
      tooltip: {       trigger: 'selection'     },  
      colors: ['#2AB67F', '#FF6F14','#FF5969'],
      chartArea: {
        'width': '100%',
        'height': '150px', bottom: 0, top: 0
      },
      slices: {
        3: {
          color: 'transparent',
          enableInteractivity: false
        }
      },
    };


  //passedPosition : google.visualization.ChartLegendPosition = 'right';
  type1 = 'PieChart';
  width1 = 200;
  height1 = 200;
  columnNames1 = ['Title', 'Value'];
  data1 = [
    ['<=2', 30],
    ['3', 50],
    ['4', 20],
    ['5', 20],
    [null,100]
  ];
  options1: google.visualization.PieChartOptions
    = {
      legend: {
        position : this.passedPosition,
        alignment:'center'       
      },
      pieHole: 0.5,
      pieStartAngle: 270,
      sliceVisibilityThreshold: 0,
      height: 200,
      width: 200,
      pieSliceText: 'value',
      tooltip: {       trigger: 'selection'     },  
      colors: ['#FF5969', '#FF6F14','#4DDEA3','#2AB67F'],
      chartArea: {
        'width': '100%',
        'height': '200px', bottom: 0, top: 0
      },
      slices: {
        4: {
          color: 'transparent',
          enableInteractivity: false
        }
      },
    };
  
  
}
