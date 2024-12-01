import { Component, OnInit, Input } from '@angular/core';
import { AccessControl } from '../../../app/Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  @Input('custid') custid: string;
  isBaseMeasureEnabled: boolean = false;
  constructor(public _access: AccessControl, public _util : myUtility) { }

  ngOnInit() {
    if(window.location.pathname.indexOf("csm-dashboard")>-1)
     {
          this._util.btnCalledFromNewCSMDashboard = true;
     }
    else{
      this._util.btnCalledFromNewCSMDashboard = false;
    }
    this.isBaseMeasureEnabled = this._util.IsBaseMeasureEnabledCustomer(this.custid);
  }

}
