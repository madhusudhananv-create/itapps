import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { PortfoliosModel, PortfoliosOwnersModel, PortfoliosOwnersProjectModel } from '../../../models/portfolio-model';
import { ContactsModel } from '../../../models/contacts-model';


@Component({
  selector: 'app-portfolio-ui',
  templateUrl: './portfolio-ui.component.html',
  styleUrls: ['./portfolio-ui.component.scss']
})
export class PortfolioUiComponent implements OnInit {

  portfolios : PortfoliosModel = new PortfoliosModel();
  portfoliosLoadData : PortfoliosModel[];  
  customerContactsData : ContactsModel[];
  portfoliosOwnerModel : PortfoliosOwnersModel[];
  portfoliosOwnersProjectModel : PortfoliosOwnersProjectModel[];
  //portfolio_id : number;
  selected_portfolio_id : number;
  selected_customerName: number;
    
  constructor(private _util: myUtility, private _appservice: AppsService) { } 
  
  ngOnInit() {
    this.LoadData();
  }
  LoadData() {
    this.service_getPorfoliosList();
    this.service_getCustomerContacts();
  }
  service_getPorfoliosList() {
    this._appservice.GetPortfoliosList().subscribe(data => {
      this.portfoliosLoadData = data;
    }, error => { this._util.serviceError(error); });
  }
  service_getCustomerContacts() {
    this._appservice.getAllCustomerContacts().subscribe(data => {
      this.customerContactsData = data;
    }, error => { this._util.serviceError(error); });
  }
  AddNewPortfolio(){
    if (this.portfolios.title == undefined || this.portfolios.title == "" ) {
      alert("Please Enter Portfolio Title");
    } 
    else {
      this.service_AddNewPortfolio(this.portfolios);
    }
  }

  AddPortfolioOwner(cust_contactData : ContactsModel){          
      this.service_AddNewPortfolio(this.portfolios);    
  }
  service_AddNewPortfolio(portfolioData : PortfoliosModel){
    this._appservice.AddNewPortfolio(portfolioData).subscribe(data => {  
      this.service_getPorfoliosList();
      if(data == null || data == undefined){
        alert("Portfolio Added Successfully");            
      }          
    }, error => { this._util.serviceError(error); });
  }

}
