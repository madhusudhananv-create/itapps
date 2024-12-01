import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { ClientDetailsModel } from '../../../models/client-details-model';
import { myUtility } from '../../../Shared/myUtility';
import { MatSidenav, MatButton } from '@angular/material';
import { LayoutService } from '../../layout/layout.service';
import { DashboardDetailsModel } from '../../../models/dashboard-details-model';
import { CustomerModel } from '../../../models/requirement-reference.model';

@Component({
  selector: 'app-customer-navigation',
  templateUrl: './customer-navigation.component.html',
  styleUrls: ['./customer-navigation.component.scss']
})
export class CustomerNavigationComponent implements OnInit {
  empid: string;
  //Customers: ClientDetailsModel[];
  SelectedData: any;
  show: boolean = true;
  @ViewChild('sidenav') sidenav: MatSidenav;
  //@Input() opencustNav : boolean;
  @Output() custId: EventEmitter<string> = new EventEmitter();
  @Output() projId: EventEmitter<any> = new EventEmitter();
  @Output() portfolioId: EventEmitter<number> = new EventEmitter();

  dashboardDetails : DashboardDetailsModel[] =[];
  customerList: CustomerModel[] = [];
  editIndex = -1;
  editPortfolioIndex = -1;
  isActive = -1;
  isProjActive = -1;
  isPortActive = -1;
  isPortProjActive = -1;
  isallActive: boolean = false;
  projIds: any[];
  constructor(public _layoutService: LayoutService, private _appservice: AppsService, public _util: myUtility) { }

  ngOnInit() {
    this.empid = localStorage.getItem('empid');
    this.loadProjects(this.empid);

  }



  loadProjects(empid) {

    this.getEmployeeProjects(empid)
  }

  service_GetDashboardDetails() {
    let customerIds: string[] = this._layoutService.custGroup.map(x => x.cusT_ID);
    this._appservice.GetDashboardDetailsByCustomerIds(customerIds).subscribe(data => {
      this.dashboardDetails = data;
      console.log(this.dashboardDetails)
    }, error => { this._util.serviceError(error); });
  }


  getEmployeeProjects(empid) {


    this._appservice.getCustomerPortfolioProjectsList(empid).subscribe(data => {
      this._layoutService.custGroup = data;
      this.service_GetDashboardDetails();
      //console.log(this._layoutService.custGroup)
    },
      error => { this._util.serviceError(error); }
    )
  }



  Client_OnClick(index, ID) {
    this.isProjActive = -1;
    this.isPortActive = -1;
    this.isPortProjActive = -1;
    this.isallActive = false;
    this.isActive = index;
    this.projId.emit();
    this.portfolioId.emit();
    this.custId.emit(ID)
  }
  // Portfolio_OnClick(index, ID, custID) {
  //     this.isProjActive = -1;
  //     this.isActive = -1;
  //     this.isPortProjActive = -1;
  //     this.isallActive = false;
  //     this.isPortActive = index;
  //     this.custId.emit(custID)
  //     this.portfolioId.emit(ID)
  //     this.projId.emit();

  // }

  Portfolio_OnClick(index, custID, portfolio) {
    this.isProjActive = -1;
    this.isActive = -1;
    this.isPortProjActive = -1;
    this.isallActive = false;
    this.isPortActive = index;
    this.custId.emit(custID)
    //this.portfolioId.emit(portfolio.portfoliO_ID)
    this.projIds = [];
    portfolio.projecT_INFO.forEach(element => {

      this.projIds.push(element.proJ_ID)
    });

    this.projId.emit(this.projIds)



  }



  Project_OnClick(index, projInfo, CustID) {
    this.isActive = -1;
    this.isPortActive = -1;
    this.isPortProjActive = -1;
    this.isallActive = false;
    this.isProjActive = index
    this.custId.emit(CustID);
    this.projIds = [];
    this.projIds.push(projInfo)
    this.projId.emit(this.projIds)
  }
  PortfolioProject_OnClick(index, projId, CustID, portId) {
    this.isActive = -1;
    this.isPortActive = -1;
    this.isallActive = false;
    this.isProjActive = -1;
    this.isPortProjActive = index;
    this.custId.emit(CustID);
    this.projIds = [];
    this.projIds.push(projId)
    this.projId.emit(this.projIds);


    //alert(CustID + ',' + portId + ',' + projId)
  }
  // allAccounts() {
  //   this.isActive = -1;
  //   this.isProjActive = -1;
  //   this.isPortActive = -1;
  //   this.isallActive = true;
  //   this.custName.emit('allAccounts')
  // }

  setProjectIndex(index, image: any) {
    this.editIndex = index;
  }
  setProjectIndex1() {
    this.editIndex = -1
  }
  setPortfolioIndex(index, image: any) {
    this.editPortfolioIndex = index;
  }
  setPortfolioIndex1() {
    this.editPortfolioIndex = -1;
  }

  getTitleByCustomerId(title, customerId) {
    let content: string = '';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.cusT_ID == customerId && t.proJ_ID == null && t.portfoliO_ID == null);
      if (details.length > 0) {
        content = details[0].content;
      }
      
    }
    
    return content;
  }

}