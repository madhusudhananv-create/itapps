import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from './../../../../Services/apps.service';
import { CustomerModel, ResourcesSummary } from '../../../../models/customer-model';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { DashboardDetailsModel, SuccessGoalsScoresModel, SuccessGoalsScoresModelForAProject } from '../../../../models/dashboard-details-model';
import { myUtility } from '../../../../Shared/myUtility';
import {HighchartsChartComponent} from './../../../../controls/highcharts-chart/highcharts-chart.component';

import * as Highcharts from 'highcharts/highstock';
import * as highchartsHeatmap from 'highcharts/modules/heatmap.src'
import { ViewChild } from "@angular/core";
import { MatSelect, MatOption, MatSelectChange } from '@angular/material';
import { MatPaginator, MatTableDataSource, MatSort, MatDialogConfig, MatDialog } from '@angular/material';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-css-nps-trend',
  templateUrl: './css-nps-trend.component.html',
  styleUrls: ['./css-nps-trend.component.scss']
})
export class CSSNPSTrendComponent implements OnInit {
  PropasDataSource: MatTableDataSource<{
  }>;
  PaspasDataSource: MatTableDataSource<{
  }>;

  ProdetDataSource: MatTableDataSource<{
  }>;

  PasdetDataSource: MatTableDataSource<{
  }>;

  PasproDataSource :MatTableDataSource<{
  }>;

  DetproDataSource : MatTableDataSource<{
  }>;

  AllProjectsByNPSScore : MatTableDataSource<{
  }>;


  ProdetCategory : string;
  PasdetCategory : string;
  PasproCategory : string;
  DetproCategory : string;
  PaspasCategory : string;
  
  AllProjectsByNPSScoreCategory : string;



  ProdetisDataAvailable : boolean = false;
  PasdetisDataAvailable : boolean = false;
  PasproisDataAvailable : boolean = false;
  DetproisDataAvailable : boolean = false;
  PaspasisDataAvailable : boolean = false;

  AllProjectsByNPSScoreisDataAvailable : boolean = false;


  ProdetNoData : string;
  PasdetNoData : string;
  PasproNoData : string;
  DetproNoData : string;
  PaspasNoData : string;

  AllProjectsByNPSScoreNoData : string;



  Highcharts = Highcharts;
  private sub: any;
  customerid: string;
  customerids : string[] = [];
  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;
  dashboardDetails: DashboardDetailsModel[] = [];

  dataSource: MatTableDataSource<any>;
  
  displayedColumns = ['respondant_NAME', 'project_NAME', 'csS1', 'npS1','csS2', 'npS2','csS3', 'npS3','csS4', 'npS4'];   

  trendChartData : any;

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

  showNPSScoreHelp : boolean = false;

  showCSATTrendChart : boolean = false;



  selectedOption = 'NeedFocus';
  bNeedFocus : boolean = true;

  bNetPromoterScore : boolean = false;


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

  NPSScore : number = 0;



  CSATScoreData1 : number = 0;
  CSATScoreData2 : number = 0;
  CSATScoreData3 : number = 0;
  CSATScoreData4 : number = 0;

  csatMapData : any;

  @ViewChild('select') portselect: MatSelect;
  @ViewChild('allSelected') allSelected : MatOption;
  
  CurrentYear : any;
  
  
  
  
  constructor(private route: ActivatedRoute,private _appservice: AppsService,public _util: myUtility) { }

  ngOnInit() {

   
     this.ddyear = this._util.Years(3);

     var DateObj = new Date();

      this.CurrentYear =  DateObj.getFullYear();

      

      this.sub = this.route.params.subscribe(params => {

      this.LoadCustomer(true);

      this.service_LoadCustomerByEmpIdByCustomerId(this.customerid);

      this.getNPSTrendData();

      this.getTrendData();

      //this.allSelected.select();

      //google.visualization.events.addListener(this.vwchart, 'select', this.selectHandler);

      });


  }


  //selectHandler()
  //{
  //  console.log("hello");
  //}

  getTrendData() {
    this._appservice.getTrendChartforCSAT(15, this.CurrentYear).subscribe(data => {
      this.trendChartData = data;   
    }, error => { this._util.serviceError(error); })
  }



  getNPSTrendData() {  
    
    
    this._appservice.getTrendChartforNPS(15, this.CurrentYear).subscribe(data => {
      this.trendChartDataNPS = data;   
      
      
    }, error => { this._util.serviceError(error); })
  }




service_LoadCustomerByEmpIdByCustomerId(customerid) {
    
    this._util.determineCustIdsBasedOnRole().subscribe(
      data => {
        this.customerids = data;
        this.custId = this.customerids;

        

        this.vcustomerids = this.customerids;

        this.service_GetDashboardDetails();

        this.getNPSScoreDataRange();
      },
      (error) => {}
    )

    
  }


  service_GetDashboardDetails() {
    this._appservice.GetDashboardDetailsByCustomerIds(this.customerids).subscribe(data => {
      this.dashboardDetails = data;


      
      //this.fillGraphDetails();
    }, error => {
      this._util.serviceError(error); 
    });
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

      
       this.perPropro =  this.getPercentage(this.Propro,this.pqPromotors);
       this.perPropas =  this.getPercentage(this.Propas,this.pqPromotors);
       this.perProdet =  this.getPercentage(this.Prodet,this.pqPromotors);

       this.perPaspro =  this.getPercentage(this.Paspro,this.pqPassives);
       this.perPaspas =  this.getPercentage(this.Paspas,this.pqPassives);
       this.perPasdet =  this.getPercentage(this.Pasdet,this.pqPassives);

       this.perDetpro = this.getPercentage(this.Detpro,this.pqDetractors);
       this.perDetpas = this.getPercentage(this.Detpas,this.pqDetractors);
       this.perDetdet = this.getPercentage(this.Detdet,this.pqDetractors);
       
      
       this.imgperPropro =  this.getPerImage(this.Propro,this.pqPromotors,"Propro");
       this.imgperPropas =  this.getPerImage(this.Propas,this.pqPromotors,"Propas");
       this.imgperProdet =  this.getPerImage(this.Prodet,this.pqPromotors,"Prodet");

       this.imgperPaspro =  this.getPerImage(this.Paspro,this.pqPassives,"Paspro");
       this.imgperPaspas =  this.getPerImage(this.Paspas,this.pqPassives,"Paspas");
       this.imgperPasdet =  this.getPerImage(this.Pasdet,this.pqPassives,"Pasdet");

       this.imgperDetpro = this.getPerImage(this.Detpro,this.pqDetractors,"Detpro");
       this.imgperDetpas = this.getPerImage(this.Detpas,this.pqDetractors,"Detpas");
       this.imgperDetdet = this.getPerImage(this.Detdet,this.pqDetractors,"Detdet");


      this.NPSScore = Math.ceil(((this.promotors - this.detractors) / (this.promotors + this.passives + this.detractors)) * 100);


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

      this.fillvwCSATScorePieChart();


      //this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.npsType==score);
      //this.dataSource =  this.heatMapData.listNPSViewDetails;

      //var source  = this.getSpecificNPSScore('Paspas');
      //this.dataSource = new MatTableDataSource(source);

      
      
      //this.PropasDataSource = new MatTableDataSource(this.getSpecificNPSScore('Propas'));
      this.ProdetDataSource = new MatTableDataSource(this.getSpecificNPSScore('Prodet'));
      this.PasdetDataSource = new MatTableDataSource(this.getSpecificNPSScore('Pasdet'));  


      this.PasproDataSource = new MatTableDataSource(this.getSpecificNPSScore('Paspro'));
      this.DetproDataSource = new MatTableDataSource(this.getSpecificNPSScore('Detpro'));
      this.PaspasDataSource = new MatTableDataSource(this.getSpecificNPSScore('Paspas'));
      

      
      

    }, error => { // console.log(error); 
      this._util.serviceError(error); })
  }


  getNPScoreDataDetails() {


    var vEndYear : number;    
    vEndYear = this.currentYear - 1999;    
    
    var vQuarter1 = this.lastQuarter + " " + this.cYear + "-" + vEndYear;
    var vQuarter2 = this.currentQuarter + " " + this.cYear + "-" + vEndYear;

       this._appservice.getNPScoreDataDetails("NetPromotorScore-ViewDetails",vQuarter1,vQuarter2,this.custId).subscribe(data => {    
       //this.heatMapData = data;         
       

       
    });
  }


  getCSATHeatmap() {
    //this._appservice.getCSATHeatMap("Q1", "2019").subscribe(data => {
      this._appservice.getNPScoreData("Current").subscribe(data => {    
      //this.heatMapData = data;         
         
            

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
    
    this.bNetPromoterScore = false;

    this.selectedOption = val;
    
    if (val === 'NeedFocus')
      this.bNeedFocus = true
    else
      this.bNeedFocus = false;
  }  


  getSpecificNPSScore(score : string)
  {
     
     
     var source = this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.npsType==score);     
     
    

     switch (score) {
       case "Prodet":
            this.ProdetCategory = "Promoters to Detractors";
            if(source.length > 0) this.ProdetisDataAvailable = true;
            this.ProdetNoData = "There are no Promoters who have been changed to Detractors in this period";
         break;
      
       case "Pasdet":
            this.PasdetCategory = "Passives to Detractors";
            if(source.length > 0) this.PasdetisDataAvailable = true;
            this.PasdetNoData = "There are no Passives who have been changed to Detractors in this period";
         break;

       case "Paspro":
            this.PasproCategory = "Passives to Promoters";
            if(source.length > 0) this.PasproisDataAvailable = true;
            this.PasproNoData = "There are no Passives who have been changed to Promoters in this period";
         break;
      
       case "Detpro":
            this.DetproCategory = "Detractors to Promoters";
            if(source.length > 0) this.DetproisDataAvailable = true;
            this.DetproNoData = "There are no Detractors who have been changed to Promoters in this period";
         break;

       case "Paspas":
            this.PaspasCategory = "Passives to Passives";
            if(source.length > 0) this.PaspasisDataAvailable = true;
            this.PaspasNoData = "There are no Detractors who have been changed to Promoters in this period";
         break;
       
     
       default:         break;
     }
    
     
     return source;

  }


  getSpecificCSSNPSScores(ID : any)  {     
     
     return this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.id==ID);
  }

  getNPSScores(Type : string)  {          
     
    //return this.heatMapData.listNPSScoreDetails.filter(x => x.npsScore < 7);
    var source;

    //  if(Type == "Detractors")
    //   source = this.heatMapData.listNPSScoreDetails.filter((listNPSScoreDetails) => listNPSScoreDetails.npsScore < 7);
     
    //  if(Type == "Passives")
    //   source =  this.heatMapData.listNPSScoreDetails.filter((listNPSScoreDetails) => listNPSScoreDetails.npsScore == 7 && listNPSScoreDetails.npsScore == 8);

    //  if(Type == "Promoters")
    //   source =  this.heatMapData.listNPSScoreDetails.filter((listNPSScoreDetails) => listNPSScoreDetails.npsScore == 9 && listNPSScoreDetails.npsScore == 10);
  
    //  if(Type == "")
    //    source =  this.heatMapData.listNPSScoreDetails;      

       

    //    return source;
  
  }




  getAllProjectsByNPSScore(npsScore : number)
  {
    var source = this.heatMapData.listAllProjectsByNPSScore.filter((NPSViewDetails) => NPSViewDetails.npS4==npsScore);     
     //console.log("getAllProjectsByNPSScore " + npsScore, source);

      this.AllProjectsByNPSScoreCategory = "";
      if(source.length > 0) this.AllProjectsByNPSScoreisDataAvailable = true;
      this.AllProjectsByNPSScoreNoData = "No Records";

      this.AllProjectsByNPSScore = source;
      this.bNetPromoterScore = true;
  }
  


  closePopup(popupName : string) {    
    if(popupName=="NPSTrendChart")
      this.showNPSTrendChart = false;

    if(popupName=="QuarterSettings")
      this.showQuarterSettings = false;

      if(popupName=="showNPSDetails")
        this.showNPSDetails = false;

      if(popupName=="showCSATTrendChart")
        this.showCSATTrendChart = false;


     if(popupName=="showCSSNPSTooltip")
        this.showCSSNPSTooltip = false;

     if(popupName=="showNPSScoreHelp")
        this.showNPSScoreHelp = false;


      
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

  getPerImage(FirstValue : any, SecondValue : any, status : string)
  {
    var resultValue : number = 0;
     var endResult : string = "nochange";
     var endImgPath : string = "nochange";
     resultValue = FirstValue - SecondValue;
     if(resultValue > 0)
      endResult ="increase";
     if(resultValue < 0)
      endResult ="decrease";    
     if(resultValue == 0)
      endResult = "nochange";      

      if(FirstValue == 0)
         endResult = "nochange";


      if(endResult == "increase" && status=="Propro")
          endImgPath = "increasegreen";
      if(endResult == "decrease" && status=="Propro")
          endImgPath = "decreasered";

      if(endResult == "increase" && status=="Propas")
          endImgPath = "increasered";
      if(endResult == "decrease" && status=="Propas")
          endImgPath = "decreasegreen";

      if(endResult == "increase" && status=="Prodet")
          endImgPath = "increasered";
      if(endResult == "decrease" && status=="Prodet")
          endImgPath = "decreasegreen";      


      if(endResult == "increase" && status=="Paspro")
          endImgPath = "increasegreen";
      if(endResult == "decrease" && status=="Paspro")
          endImgPath = "decreasered";

      
      if(endResult == "increase" && status=="Paspas")
          endImgPath = "increasered";
      if(endResult == "decrease" && status=="Paspas")
          endImgPath = "decreasegreen";


      if(endResult == "increase" && status=="Pasdet")
          endImgPath = "increasered";
      if(endResult == "decrease" && status=="Pasdet")
          endImgPath = "decreasegreen";


      if(endResult == "increase" && status=="Detpro")
          endImgPath = "increasegreen";
      if(endResult == "decrease" && status=="Detpro")
          endImgPath = "decreasered";

      if(endResult == "increase" && status=="Detpas")
          endImgPath = "increasered";
      if(endResult == "decrease" && status=="Detpas")
          endImgPath = "decreasegreen";

      if(endResult == "increase" && status=="Detdet")
          endImgPath = "increasered";
      if(endResult == "decrease" && status=="Detdet")
          endImgPath = "decreasegreen";



     return endImgPath;

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
        endResult = "";
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
  
  fillvwCSATScorePieChart() {    

    this.vwdata1 = [];    
    this.vwdata1.push(["<=2", this.CSATScoreData1]);
    this.vwdata1.push(["3", this.CSATScoreData2]);
    this.vwdata1.push(["4", this.CSATScoreData3]);
    this.vwdata1.push(["5", this.CSATScoreData4]);
    
  }


  fillNetPromoterScorePieChart() {    

    this.data5 = [];    
    //this.data5.push(["Promoters", this.promotors + this.pqPromotors]);
    //this.data5.push(["Passives", this.passives + this.pqPassives]);
    //this.data5.push(["Detractors", this.detractors + this.pqDetractors]);
    //this.data5.push([null, this.promotors + this.pqPromotors + this.passives + this.pqPassives + this.detractors + this.pqDetractors]);
  
    this.data5.push(["Promoters", this.promotors]);
    this.data5.push(["Passives", this.passives]);
    this.data5.push(["Detractors", this.detractors]);
    this.data5.push([null, this.promotors + this.passives +  this.detractors]);

}
 

  
  passedPosition : google.visualization.ChartLegendPosition = 'right';
  type5 = 'PieChart';
  width5 = 100;
  height5 = 50;
  columnNames5 = ['Title', 'Value'];
  data5 = [
    ['Promoters', 30],
    ['Passives', 30],
    ['Detractors', 30],
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
      height: 150,
      width: 200,
      pieSliceText: 'value',
      tooltip: {       trigger: 'selection'     },  
      colors: ['#2AB67F', '#FF6F14','#FF5969'],
      chartArea: {
        'width': '100%',
        'height': '100px', bottom: 0, top: 0
      },
      slices: {
        3: {
          color: 'transparent',
          enableInteractivity: false
        }
      },
    };


  //var passedPosition : google.visualization.ChartLegendPosition = 'right';

  
  
  

  type1 = 'PieChart';
  width1 = 200;
  height1 = 50;
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
      height: 150,
      width: 200,
      pieSliceText: 'value',
      tooltip: {       trigger: 'selection'     },  
      colors: ['#FF5969', '#FF6F14','#4DDEA3','#2AB67F'],
      chartArea: {
        'width': '100%',
        'height': '100px', bottom: 0, top: 0
      },
      slices: {
        4: {
          color: 'transparent',
          enableInteractivity: false
        }
      },
      
    };
  
  vwtype1 = 'PieChart';
  vwwidth1 = 200;
  vwheight1 = 50;
  vwcolumnNames1 = ['Title', 'Value'];
  vwdata1 = [
    ['<=2', 30],
    ['3', 50],
    ['4', 20],
    ['5', 20]
    
  ];
  vwoptions1: google.visualization.PieChartOptions
    = {
      legend: {
        position : 'none'              
      },            
      is3D:true,      
      height: 150,
      width: 200,
      pieSliceText: 'value',
      colors: ['#FF5969', '#FF6F14','#4DDEA3','#2AB67F'],
      chartArea: {
        'width': '100%',
        'height': '100%'
      },
      
    };

    
}
