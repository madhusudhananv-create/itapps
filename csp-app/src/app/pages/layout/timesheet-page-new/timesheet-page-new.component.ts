
import { Component, OnInit , Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LayoutService } from '../layout.service';
import { ActivatedRoute } from '@angular/router';
import { TimesheetComponent } from '../../../../app/controls/timesheet/timesheet.component'
import { myUtility } from '../../../Shared/myUtility';

@Component({
  selector: 'app-timesheet-page-new',
  templateUrl: './timesheet-page-new.component.html',
  styleUrls: ['./timesheet-page-new.component.scss']
})
export class TimesheetPageNewComponent implements OnInit {
  private sub: any;
  input_customerid: string;


  constructor(public _util: myUtility,private route: ActivatedRoute, public _layoutService: LayoutService) { }  

  ngOnInit() {    
    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });
  }  
}