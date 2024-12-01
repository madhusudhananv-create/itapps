import { Injectable } from '@angular/core';
import { CustomerModel } from '../../models/customer-model';

@Injectable({
  providedIn: 'root'
})
export class RasService {

  constructor() { }
  selectedCustomer: CustomerModel = new CustomerModel();
}
