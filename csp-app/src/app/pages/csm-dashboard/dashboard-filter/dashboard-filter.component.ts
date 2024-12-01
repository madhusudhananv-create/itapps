import { Component, OnInit,Output,ViewChild,EventEmitter } from '@angular/core';
import {FormControl} from '@angular/forms';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { LayoutService } from '../../layout/layout.service';
import { CSMDashboardService } from '../csmdashboard.service';
import { MatOption, MatSelect } from '@angular/material';
import { ProjectModelNew } from '../../../models/portfolio-model';



@Component({
  selector: 'app-dashboard-filter',
  templateUrl: './dashboard-filter.component.html',
  styleUrls: ['./dashboard-filter.component.scss']
})
export class DashboardFilterComponent implements OnInit {
 
  menuToggleStatus: boolean;
  selectedPeriod = 'asToday';
  selectedCust  : string;
  selectedProj : any[] = [];
  selectedPortfolio : number[] ;
  empid: string;
  customerId : string;
  projId : string[];
  portId : number[];
  customers: any[] = [];  
  projects: any[] = [];
  portfolioList: any[];
  projectList : any[]=[];
  portfolioprojectMap: ProjectModelNew[] = [];
  loading: boolean = false;
  @ViewChild('allSelected') allSelected : MatOption;
  @ViewChild('projectSelect') projectSelect : MatSelect;
  @ViewChild('portSelect') portselect: MatSelect;
  isChecked : boolean = false;
  @Output() toggle: EventEmitter<any> = new EventEmitter();
  constructor(private _appservice: AppsService, private _csmdashboardService:CSMDashboardService,public _util: myUtility) { 
     
  }

  ngOnInit() {
    this.empid = localStorage.getItem('empid');
    this.loadProjects(this.empid);
    //this.selectedCust.push('allAccounts')
  }

 

  loadProjects(empid) {
    this.getCustomerList(empid)
}
//    getEmployeeProjects(empid) {
//     this._appservice.getCustomerPortfolioProjectsList(empid).subscribe(data => {
//     this._layoutService.custGroup = data;
//     console.log(this._layoutService.custGroup)
//   },
//     error => { this._util.serviceError(error); }
//   )
// }

getCustomerList(empId) {
  this._appservice.GetCustomerList(empId, false).subscribe(data => {
    this.customers = data;
   console.log("CUSTOMERS:", this.customers)
    if(this.customers.length > 0)
    {
      this.selectedCust = this.customers.filter(x => x.cusT_ID)[0].cusT_ID;
      this.getProjects();
      
      console.log("SelectedCust:",this.selectedCust);
      if(this._util.IsPremier(this.selectedCust)){
        this.service_getPortfolioDetails();
      }
      //  else
      //  {
        
      //}
    }
   // console.log(this.selectedCust)
  }, (err) => { this._util.serviceError(err) })
}

service_getPortfolioDetails() {
  this._appservice.GetPortfolioList().subscribe(data => {
    this.portfolioList = data;
    this.selectedPortfolio = this.portfolioList.map(p => p.id);
    if(this.selectedPortfolio.length == this.portfolioList.length)
      this.selectedPortfolio.push(-1);
  }, error => { this._util.serviceError(error); },
  () => { this.service_getProjectPortfolioMapping(); }
  )
}
service_getProjectPortfolioMapping(){
  
  this._appservice.getProjectPortfolioMapping(this.selectedCust, this._util.ShouldLoadAllProjects()).subscribe(
    data => {
      this.portfolioprojectMap = data;
    },
    error => { this._util.serviceError(error); },
    () => {
        this.getProjectListForPremier(this.selectedPortfolio);
        this.allSelected.select();
        this.toggleSelection();
    }
  )
}
getProjectListForPremier(portId : number[]){
this.projects = [];
portId.forEach(element => {
  let array = this.portfolioprojectMap.filter(y => y.portfolio_id == element);
  this.projects.push(...array); 
});

this.projects.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);
this.selectedProj = this.projects.map(x => x.proj_id);

this.projId = this.selectedProj
if(this.selectedProj.length == this.projects.length)
  this.selectedProj.push('-1');
}
getProjects() {
    
  if (this.selectedCust == null || this.selectedCust == undefined)
    return;
  //console.log(this.selectedCust)
  this._appservice.getAllProjectsForCustomer(this.selectedCust).subscribe(data => {
    this.projects = data;
    this.selectedProj = this.projects.map(p => p.proJ_ID);
    if(this.selectedProj.length == this.projects.length)
      this.selectedProj.push('-1');
    this.customerId = this.selectedCust;   
    this.projId = this.selectedProj
    this.loading =true;
  }, (err) => { this._util.serviceError(err) })
}

tosslePerProjectAll() {
    
    
  if(this.allSelected.selected){
    this.projectSelect.options.forEach((item: MatOption) => item.select());
  }
  else{
    this.projectSelect.options.forEach((item: MatOption) => item.deselect());
  }
}
toggleSelection() {
  if (this.allSelected.selected)
    this.portselect.options.forEach((item: MatOption) => item.select());
  else
    this.portselect.options.forEach((item: MatOption) => item.deselect());
}
tosslePerProject(){
     
  if(this.allSelected.selected){
      this.allSelected.deselect();
      return false;
   }
   
      if(this.selectedProj.length == this.projects.length)
        {
          this.allSelected.select();
         }
   
 }
 tosslePerOne() {
  if (this.allSelected.selected) {
    this.allSelected.deselect();
    return false;
  }
  if (this.selectedPortfolio.length == this.portfolioList.length)
    this.allSelected.select();
  
}
 onMenuToggleChange(value: boolean) {
  this.menuToggleStatus = value;
}

selectedCust_OnChange(event){

if(this._util.IsPremier(event)){
  this.service_getPortfolioDetails();
}
this.getProjects();
//this.customerId = event;
}
 portfolio_OnChange(portId){
   
   this.getProjectListForPremier(portId)
   this.portId = portId;
    }

selectedProjects_OnChange(projId){
  
  this.projId = projId
 }

}


