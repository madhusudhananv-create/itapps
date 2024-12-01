import { Component, OnInit , Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LayoutService } from '../layout.service';
import { ActivatedRoute } from '@angular/router';
import { TimesheetComponent } from '../../../../app/controls/timesheet/timesheet.component'

@Component({
  selector: 'app-timesheet-page',
  templateUrl: './timesheet-page.component.html',
  styleUrls: ['./timesheet-page.component.scss']
})
export class TimesheetPageComponent implements OnInit {
  private sub: any;
  input_customerid: string;
  //@Input() customerId ;
  
  //constructor(private route: ActivatedRoute, private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, private _layoutService: LayoutService) { }  
  constructor(private route: ActivatedRoute, public _layoutService: LayoutService) { }  

  ngOnInit() {    
    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });    

  }


}
