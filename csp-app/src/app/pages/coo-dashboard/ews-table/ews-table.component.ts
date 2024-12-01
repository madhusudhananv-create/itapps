
import { Component, OnInit,Output,ViewChild,EventEmitter,Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { LayoutService } from '../../layout/layout.service';
import { COODashboardService } from '../coo-dashboard.service';
import { MatOption, MatSelect, MatTabChangeEvent,MatPaginator } from '@angular/material';
import { ProjectModelNew } from '../../../models/portfolio-model';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource} from '@angular/material';
import { MatIconModule } from '@angular/material';
import {MatInput} from '@angular/material/input';
import { SharedService } from '../../../Shared/shared.service';
import { EWSDetailsModel } from '../../../models/ews-details-model';
import { COODashboardCommon } from '../coo-dashboard-common';
import { Router } from '@angular/router';



@Component({
  selector: 'app-ews-table',
  templateUrl: './ews-table.component.html',
  styleUrls: ['./ews-table.component.scss']
})
export class EwsTableComponent implements OnInit {
  filtered: Object[]
  projectdropdownValues=['All Accounts','Single Account','Clinical Support','Premier - FY21 - EQuIPP','Quarterly','Q1'];
  selectedProject:string="0000";
  selectedcus: any[];
  custID:string="0000";
  selectedPortfoliovalue:string="Clinical Support";
  selectedprojvalue:string="Premier - FY21 - EQuIPP";
  selectedViewVlaue:string='Quarterly';
  level:string='sponser';
  sponserrowcount:number =0;
  pmrowcount:number=0;
  burowcount:number=0;
  selectedQValue:string='Q1';
  projId:string;
  Customer = [];
  Project = [];
  Portfolio =[];
  PortID: string;
  allproj:boolean= true;
  @Input() isvisible=false;
  ddyear: number[]
  selectedQuarter: string;
  selectedYear: number;
  selectedIndex: number;
  filterapply:boolean = false;
  // //dataSource : MatTableDataSource<{ews : string , account : string , 
  //   portfolio:string,projects:string,severity:string}>;
selectedPeriod = 'asToday';
selectedValue:string ='Quarter';
displayedColumns: string[] = ['ews', 'account', 'portfolio','project','severity'];
startYear = new Date().getFullYear();
ewsData:any[]=[];
tempewsData:any[]=[];
filteredewsData:any[]=[];
dataSource = new MatTableDataSource(this.ewsData);
@ViewChild('ewspaginator') paginator: MatPaginator;
range1 = [];
AllAccounts:boolean=false;
Searchfilter:boolean = false;
filterValue:string;
custIDArray:string[]=[];
 data:any;
 isSelectedRow: any;
selectedCust  
  constructor(private _util: myUtility, private _appservice: AppsService, private _cooDashboardService: COODashboardService, private _cooDashboardCommon: COODashboardCommon,public _shared: SharedService
    ,private router: Router) { 


  }

  ngOnInit() {
    this.custID=this._shared.SelectedCustID;
    this.custIDArray = this._shared.selectedCustIDarray;
    this.LoadCustomer();
    for (let i = 0; i < 5; i++) {
      this.range1.push(this.startYear - i);
    }
    this.getEWSdata();
    this.ddyear = this._util.Years(3);
    this.selectedYear = this._util.Year();
    this.selectedQuarter = "lastQuarter";
    this.data=this._shared.SelectedCustID;

    if(this._shared.AllAccounts)
    {
     this.AllAccounts = true;
     this.service_getPortfolioDetails();

    }


   
  }
 
 
 LoadCustomer()  {
  let data=this._cooDashboardCommon.customerProjectsList;
  this.Customer = this._cooDashboardCommon.getUniqueCustIdNameFromList(data, "cusT_ID", "cusT_NM");
  this.Project = this._cooDashboardCommon.getUniqueCustIdNameFromList(data, "proJ_ID", "proJ_NM");

  // this._appservice.GetCustomerList(localStorage.getItem('empid')).subscribe(data => {
  //   this.Customer = data;
    
   
  //   if(this.Customer.length > 0)
  //   {
     
  //     this.custID=this._shared.SelectedCustID;
  //     this.custIDArray = this._shared.selectedCustIDarray;

  //     if(this._shared.AllAccounts)
  //     {
      
  //       let cust =this.Customer.filter(item => this._shared.selectedCustIDarray.includes(item));
  //       this.custID = this.Customer[0].cusT_ID;
  //      this.custID ="-1";
  //     }
  //     else
  //     {
  //       let cust =this.Customer.filter(x =>  this._shared.selectedCustIDarray.includes(x.cusT_ID) );
  //       this. Customer= this.Customer.filter(x =>  this._shared.selectedCustIDarray.includes(x.cusT_ID) );
  //       this.custID = this.Customer[0].cusT_ID;
  //     }

 
  //     this.LoadProject();
  
  //   }

  // }, (err) => { this._util.serviceError(err) })

 }


  getEWSdata(){

    let ews: EWSDetailsModel = new EWSDetailsModel();
    ews.START_DATE =this. _cooDashboardCommon.dashboardStartdate;
    let enddate = this. _cooDashboardCommon.dashboardEnddate;
    enddate.setHours(enddate.getHours() + 6);
    ews.END_DATE=  enddate; 

    // if(this._shared.SelectedQuarter != undefined && this._shared.SelectedYear != undefined)
    // {

    //   const { startDate, endDate } = this.SetQuarterDates(this._shared.SelectedQuarter,this._shared.SelectedYear);
  
     
    //   ews.START_DATE=startDate;

    //   endDate.setHours(23);
    //   endDate.setMinutes(59);

    //   ews.END_DATE=endDate
    // }
    this.data=this._shared.SelectedCustID;
    ews.ALL_PROJECTS= this._shared.AllAccounts ;
    ews.PROJ_IDS= this._cooDashboardCommon.projectIds ;
    ews.CUST_ID= this.data;
    this._cooDashboardService.getEarlyWarningSignalDetails(ews).subscribe(data => {
      this.ewsData = data;
      this.dataSource = new MatTableDataSource(this.ewsData);
      this.tempewsData=data;
      this.setRowCountatTabChange();
      this.CheckPortfolio();
      this.dataSource.filter= this.level.trim().toLowerCase();
      this.dataSource.paginator=this.paginator;
  
    }, (err) => { this._util.serviceError(err) })


   
  }
  onClose() {
    this.isvisible=false;
  }
  ddCustomer_Onchange() {
    
    this.AllAccounts = false;
    if(this._util.IsPremier(this.custID) || this.custID=="-1")
    {
   
    this.AllAccounts = true;
    this.service_getPortfolioDetails(); 
    this.displayedColumns = ['ews', 'account', 'portfolio','project','severity'];
    }
    if(!this._util.IsPremier(this.custID) && this.AllAccounts == false)
    {
    this.PortID="-1";
     this.displayedColumns = ['ews', 'account','project','severity'];
    }

    this.LoadProject();
   // this.projId= "-1";
  }

  LoadProject() {
      if (this._cooDashboardCommon.customerProjectsList != null && this._cooDashboardCommon.customerProjectsList.length > 0) {
        let p = this._cooDashboardCommon.customerProjectsList.filter(x => this.custID.includes(x.cusT_ID));
        this.Project = this._cooDashboardCommon.getUniqueProjIdNameFromList(p, "proJ_ID", "proJ_NM").sort((n1, n2) => { return n1.proJ_NM.toLowerCase() > n2.proJ_NM.toLowerCase() ? 1 : -1 });;
       // this.selectallProjects();
        // setTimeout(() => {
        //   this.selectallProjects();
        // }, 500);
        return;
      }}

  onTabChange(event: MatTabChangeEvent) {
    
    const index = event.index;
    this.selectedIndex = index;
    this.applyFilter(index);
  }

  applyFilter(selectedTab:number) {
    
    if(selectedTab === 1)
    {
      this.level="buhead";
    }
    else if (selectedTab === 2)
    {
        this.level="pm";
    }
    else
    {
      this.level ="sponser";
    }
    
    if (this.Searchfilter == true && this.filterValue.length > 0)
    {

 
     this.tempewsData = this.filterArray(this.tempewsData);

     this.setRowCountatTabChange();
 
    }

   if(this.filterapply == false)
   {
   this. tempewsData =this.tempewsData.filter(x => x.level=== this.level);
 
   this.dataSource = new MatTableDataSource(this.tempewsData);
   
   }
   else{

   let tempewsfiltered= this.tempewsData;
   
   tempewsfiltered = tempewsfiltered.filter(x => x.level == this.level);
   this.dataSource = new MatTableDataSource(tempewsfiltered);
   }
  
   //search box change
  

   //search box change
   if(this.filterapply === false )
   {
   this.tempewsData=this.ewsData;
   }

    this.dataSource.paginator=this.paginator;
    this.data=this._shared.SelectedCustID;
   
  }
  
  getColor(severity: string) 
  {
    
   if(severity === 'High')
   {
    return '#fe3f3f';
   }
  
   else if(severity=== 'Medium')
   {
    return '#e4c05e';
   }
  
   else 
   {
    return '#79bd73';
   }
   
  }
  selectedPeriod_OnChange() {

  }

  OnFilter()
  {
  
  
  this.filterapply = true;
  this.tempewsData= this.ewsData;


if(this.projId != "-1")
{

 
  this.tempewsData= this.tempewsData.filter(x => x.project_ID === this.projId);


}

if(this.PortID != "-1" ) 
{
  
  const portvalue= this.Portfolio.find(x => x.id == this.PortID).title;
 
  this.tempewsData=this.tempewsData.filter(x =>  x.portfolio == portvalue );
}

if(this.custID != "-1")
{

  
  this.tempewsData=this.tempewsData.filter(x =>  x.cust_ID == this.custID );
  

}
  
 
  this.applyFilter(this.selectedIndex);
  this.setRowCountatTabChange ();
  
}

  OnReset()
  {
   this.filterapply = false;
   this.tempewsData=this.ewsData;
   this.setRowCountatTabChange();
   this.applyFilter(this.selectedIndex);   
   this.dataSource.paginator=this.paginator;
   this.custID="-1";
   this.projId="-1";
   this.PortID="-1";
   this.AllAccounts = true;
   this.displayedColumns=['ews', 'account', 'portfolio','project','severity'];
  }

  getColumnWidth(column: any): string {
  
    if (this._util.IsPremier(this.custID) || this.AllAccounts) {
      return '20%';
    } else {
      return '25%';
    }
    
  }

  service_getPortfolioDetails()
  {
    this._appservice.GetPortfolioList().subscribe(data => {
      this.Portfolio = data;
      if(! this._shared.AllAccounts)
      {
      this.PortID= this.Portfolio[0].id;
      }

      if(this.AllAccounts)
      {

        this.PortID= "-1";
      }
    }, error => { this._util.serviceError(error); }
   

    )
  }

  setRowCountatTabChange ()
  {


    this.sponserrowcount=this.tempewsData.filter(x => x.level=== "sponser").length;
    this.burowcount = this.tempewsData.filter(x => x.level=== "buhead").length;
    this.pmrowcount = this.tempewsData.filter(x => x.level=== "pm").length;

  }

  SetQuarterDates(quarter:number,year:number)
  {

    let startDate, endDate;
    switch (quarter) {
      case 1:
        startDate = new Date(year , 3, 1); // april 1st
        endDate = new Date(year, 5, 30); // June 30th
        break;
      case 2:
        startDate = new Date(year, 6, 1); // july 1st
        endDate = new Date(year, 8, 30); // Sep 30th
        break;
      case 3:
   
        startDate = new Date(year, 9, 1); // Oct 1st
        endDate = new Date(year, 11, 31); // Dece 31st
        break;
      case 4:
        startDate = new Date(year, 0, 1); // Jan01
        endDate = new Date(year, 2, 31); // March 31st
        break;
      default:
        throw new Error('Invalid quarter value');
    }
    
    return { startDate, endDate };

  }

  CheckPortfolio()
  {
    this.AllAccounts= this._shared.AllAccounts;
   
   

    if(!this._util.IsPremier(this.custID) && this.AllAccounts == false)
    {

     this.displayedColumns = ['ews', 'account','project','severity'];
    }

   else
   {
    this.service_getPortfolioDetails();

   }
  

  }

  applyFilter1(event) {
   
  
    
    this.filterValue= (event.target as HTMLInputElement).value;
  
    let temp12=this.tempewsData.includes(this.filterValue);

    if(this.filterValue.trim().length > 0)
    {
      this.Searchfilter = true;
    }
    else
    {

      this.setRowCountatTabChange();
    }
  
    //this.dataSource.filter = (event.target as HTMLInputElement).value;
    this.applyFilter(this.selectedIndex);
    //this.setRowCountatTabChange();

    //const filteredArray = this.tempewsData.filter(obj => Object.values(obj).every(val => val.includes(s)));
  
   
  }

  filterArray(originalArray: any[]): any[] {

    return originalArray.filter(obj =>
    Object.values(obj).some(val =>
    val.toString().toLowerCase().includes(this.filterValue.toLowerCase())
    )
    );
    }

    navigateToDetails(row: any) {
      this.isSelectedRow = row;
      this.router.navigate(['/layout/issues', row.cust_ID]);
    }

  

}
