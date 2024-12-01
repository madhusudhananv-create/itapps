import { Component, OnInit } from '@angular/core';
import { CustomerModel } from '../../../models/customer-model';
import { RasService } from '../ras.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  
  constructor(public _rasUtil:RasService) { }

  ngOnInit() {
  }
  customer_onChange($event) {
    this._rasUtil.selectedCustomer = $event;
  }
}
