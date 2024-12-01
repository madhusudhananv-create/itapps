import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { CustomerModel } from '../../../models/customer-model';
import { RasService } from '../ras.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  @Output() onClick: EventEmitter<CustomerModel> = new EventEmitter<CustomerModel>();
  selectedCustomer: CustomerModel;
  customers: CustomerModel[];
  constructor(public _rasUtil:RasService, private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
  }
  LoadData() {
    this.service_getCustomerList();
  }
  Customer_OnClick(customer: CustomerModel) {
    this._rasUtil.selectedCustomer = customer;
    //this.emitChanges();
  }
  service_getCustomerList() {
    this._appservice.GetRASCustomerList().subscribe(data => {
      this.customers = data;
    }, error => { this._util.serviceError(error); });
  }
  emitChanges() {
    this.onClick.emit(this.selectedCustomer);
  }
}

//'{"customer": ' + this.custId + ', "project": "' + this.projId + '"}'
