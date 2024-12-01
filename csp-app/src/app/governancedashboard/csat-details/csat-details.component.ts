import { Component, OnInit ,Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { forEach } from '@angular/router/src/utils/collection';
import { CustomerModel } from '../../models/customer-model';


@Component({
  selector: 'app-csat-details',
  templateUrl: './csat-details.component.html',
  styleUrls: ['./csat-details.component.scss']
})
export class CsatDetailsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private _appService:AppsService,private _util:myUtility) { }
  customername:string[];
  customerid : string[]=[];
  ngOnInit() {
    this.GetCustName();
  }
  GetCustName()
  {
    let i;
    for(i=0; i < this.data.info.length ;i++)
    {
      this.customerid[i] = this.data.info[i].customeR_ID;
    }
      this._appService.getCustomerName(this.customerid).subscribe(data => {
        this.customername = data;
      }
    , error => { this._util.serviceError(error); });
  }
}
