import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AppsService } from './../../../../Services/apps.service';
import { myUtility } from './../../../../Shared/myUtility';
import {enumRoles} from '../../../../Shared/enum';
import { filter } from 'rxjs/operators';
import { DashboardDetailsModel } from '../../../../models/dashboard-details-model';
import { CustomerModel, ResourcesSummary } from '../../../../models/customer-model';


@Component({
  selector: 'app-staffing-summary-details',
  templateUrl: './staffing-summary-details.component.html',
  styleUrls: ['./staffing-summary-details.component.scss']
})
export class StaffingSummaryDetailsComponent implements OnInit {


  //@Input() type2;
  //@Input() width2;
  //@Input() height2;
  //@Input() columnNames2;
  //@Input() data2; 
  //@Input() options2;

  //@Input() type3;
  //@Input() width3;
  //@Input() height3;
  //@Input() columnNames3;
  //@Input() data3; 
  //@Input() options3;

  public dashboardDetails: DashboardDetailsModel[] = [];
  
  customerid: string;
  customerids : string[] = [];
  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;
  width3: number;
  height3: number;


  constructor(private _appService : AppsService, private _myUtil : myUtility) { }

  ngOnInit() {
    this._myUtil.determineCustIdsBasedOnRole();
    //this._myUtil.CustomerIds = [202100061,0,202100021,202100011,202100062]; 
    this.service_LoadCustomerByEmpIdByCustomerId(this.customerid);
    this.service_GetDashboardDetails();     
    
  }


  service_LoadCustomerByEmpIdByCustomerId(customerid) {
    this._appService.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      
      
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
        //this.customerids = [202100062,202100065];
        this.customerids = this.customerList.map(t => t.cusT_ID);        
        //this.custId = this.customerids;      
        //this.vcustomerids = this.customerids;    
        this._myUtil.CustomerIds = this.customerids;
      }
    }
    
    , error => { this._myUtil.serviceError(error); });

    
  }


  service_GetDashboardDetails() {
    
       
    this._appService.GetDashboardDetailsByCustomerIds(this._myUtil.CustomerIds).subscribe(data => {    
      this.dashboardDetails = data;
      
    
      
    }, error => {
      this._myUtil.serviceError(error); 
                },

    () => {
            this.populateChartValues();
            this.fillGraphStaffSummaryPie();             
          }
    );
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


  getGraphValue_customer(title) {
    let iValue = 0;
    var sValue = this.getTitleByCustomer(title);

    if (sValue != '-')
      sValue = sValue.replace("%", "");
    else
      sValue = '0';

    if (sValue != undefined)
      iValue = Number(sValue);
    return iValue;
  }

  populateChartValues()
  {
    
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

      this.width3 = 150;
      this.height3 = 250;
      this.columnNames3 = ['Status', 'Onsite', { 'role': 'annotation' }, 'Offshore', { 'role': 'annotation' }];
      this.type3 = 'ColumnChart';

      
  }

  // Start - Staffing Summary 


//-------------------------------------
  //Staffing Summary - Pie Chart
  //-------------------------------------
  


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
      
      this._myUtil.CustomerIds.forEach((element ,index) => {
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


    // Start - Billing Summary - column Chart


  type3 = 'ColumnChart';
  data3: any[] =
    [
      ['Non-Billable', 20, '20', 20, '20'],
      ['Billable', 20, '20', 20, '20']
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


     // End - Billing Summary - column Chart


     // Start -  Staffing Summary


  type2 = 'PieChart';
  data2: any[] = [
    ['Offshore', 50],
    ['Onsite', 50]
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



  // End - Staffing Summary 
}
