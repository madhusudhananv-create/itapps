import { Component, OnInit, Input } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel } from '../../../app/models/timesheet-model';
import { TimesheetTypeModel } from '../../models/date-range-model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  @Input('customerId') input_custId: string;
  timesheetType: TimesheetTypeModel = new TimesheetTypeModel();
  constructor(public _util: myUtility, private _appservice: AppsService, private _router: Router) { }

  ngOnInit() {
   
    if (this._util.IsPremier(this.input_custId))
      {
       
        this._router.navigateByUrl('/layout/timesheetnewhome/'+this.input_custId );
       // this._router.navigateByUrl(`/layout/timesheetnewhome/${this.input_custId}` );
        //this.router.navigateByUrl(`/dashboard/ProjectShipment/${this.prj}`);
      }
  }

  ngOnChanges() {
  }
  IsNYU() {
    if (this.input_custId == undefined)
      return false;
    else if (this.input_custId == "202100040"|| this.input_custId == "202100061")
      return true;
    else
      return false;
  }
  IsRole(role) {
    if (role === 'customer') {
      if (!this._util.IsGAVS())
        return true;
      else
        return false;
    }
    else if (role === 'pmo') {
      if (localStorage.getItem('empid') === '101425')
        return true;
      else
        return false;
    }
    else if (role === 'employee') {
      if (this._util.IsGAVS() && localStorage.getItem('empid') != '101425')
        return true;
      else
        return false;
    }
  }


}
