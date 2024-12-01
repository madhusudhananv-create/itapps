import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { myUtility } from '../../../Shared/myUtility';
import { AccessControl } from '../../../Shared/accessControl';
import { enumRoles } from '../../../Shared/enum';
import { SharedData } from '../../../Shared/sharedData';

@Component({
  selector: 'app-dashboard-navigation',
  templateUrl: './dashboard-navigation.component.html',
  styleUrls: ['./dashboard-navigation.component.scss'],

})
export class DashboardNavigationComponent implements OnInit {
  menuToggleStatus: boolean;
  customerid: string;
  reset: boolean = false;
  sub: any;
  role: string;
  ShowMenu: boolean = true;
  slaAvailable: boolean = false;

  constructor(private route: ActivatedRoute, public _util: myUtility, public _access: AccessControl, public sharedData: SharedData) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.customerid = params['customerid'];
      this.reset = params['reset'];
      this.role = localStorage.getItem('role');

    });

    const storedData = localStorage.getItem('slaAvailableList');
    const slaAvailableList = storedData ? JSON.parse(storedData) : [];
    if (slaAvailableList.length > 0) {
      this.slaAvailable = slaAvailableList.filter(x => x.customerId == this.customerid)[0].slaAvailable;
    }
    if (this.reset == undefined)
      this.reset = true;
    if (this.role == enumRoles.Customer.toString()) {
      this.ShowMenu = false;
    }

  }

  ngOnChanges() {

  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

}
