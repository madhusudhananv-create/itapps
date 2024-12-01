import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { DeliveryModel, DeliveryDetailsModel } from '../../../models/delivery-model';
import { AppsService } from '../../../Services/apps.service';
import { enumDateRange } from '../../../Shared/enum';
import { AccessControl } from '../../../Shared/accessControl';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss']
})
export class DeliveryComponent implements OnInit {
  @Input() input: DeliveryDetailsModel;
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  @Input('CustomerId') input_customerid: string;
  initialDt: Date = new Date();
  _loading:boolean = false;
  selectedOption = '4Quadrant';
  bShow4Quadrant = true;
  constructor(private _access:AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this._util.updateRAG(this.input_rag, 'delivery', this.input.delivery.rag);
    let emptydt = new Date('0001-01-01T00:00:00');
    if ((new Date(this.input.delivery.publisH_DATE)).toDateString() != emptydt.toDateString()) {
      this.initialDt = new Date(this.input.delivery.publisH_DATE);
    }
  }

  ngOnChanges() {
    this._util.updateRAG(this.input_rag, 'delivery', this.input.delivery.rag);
    let emptydt = new Date('0001-01-01T00:00:00');
    if ((new Date(this.input.delivery.publisH_DATE)).toDateString() != emptydt.toDateString()) {
      this.initialDt = new Date(this.input.delivery.publisH_DATE);
    }
  }

  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  Save_onClick(rag, achieved, milestone, risks, support) {
    if (rag === "" || rag === null) {
      alert ("Please select RAG");
      return;
    }
    this.input.delivery.rag = rag;
    this.input.delivery.lastweeK_ACHIEVED = achieved;
    this.input.delivery.nextweeK_MILESTONE = milestone;
    this.input.delivery.riskS_ISSUES = risks;
    this.input.delivery.customeR_SUPPORT = support;
    this.input.delivery.publisH_DATE = this.input.daterange.startDate;
    this._util.updateRAG(this.input_rag, 'delivery', rag);
    this.service_updateDelivery(this.input_projectid, rag, achieved, milestone, risks, support);
    this.readonlymode = true;
    this.editmode = false;
  }
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
  }
  onValChange(val) {
    this.selectedOption = val;
    if (val === '4Quadrant')
      this.bShow4Quadrant = true
    else
      this.bShow4Quadrant = false;
  }
  //**********************************************
  // General Methods
  //**********************************************
  LoadData(range:enumDateRange) {
    this._loading = true;
    this._appservice.getDelivery(this.input_projectid, new Date(this.input.daterange.startDate).toDateString(), range)
      .subscribe(data => {
        this._loading = false;
      this.input.delivery.lastweeK_ACHIEVED = data.delivery.lastweeK_ACHIEVED;
      this.input.delivery.nextweeK_MILESTONE = data.delivery.nextweeK_MILESTONE;
      this.input.delivery.riskS_ISSUES=data.delivery.riskS_ISSUES;
      this.input.delivery.customeR_SUPPORT= data.delivery.customeR_SUPPORT;
      this.input.daterange.startDate = data.daterange.startDate;
      this.input.daterange.endDate = data.daterange.endDate;
      this._util.updateRAG(this.input_rag, 'delivery', data.delivery.rag);

    }, error => { 
      this._loading = false;
      this._util.serviceError(error); 
    });
  }
  PreviousWeek() {
    this.LoadData(enumDateRange.PreviousWeek );
  }
  NextWeek() {
    this.LoadData(enumDateRange.NextWeek);
  }
  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {   
    let headers = new Headers({ 'Accept': 'application/json' });
         headers.append('token', this._util.AppSettings.token);
         headers.append('empid', localStorage.getItem('empid'));
         return headers;
  }
  dataUpdate: any;
  service_updateDelivery(projid, rag, achieved, milestone, risks, support) {
    let apiuri: string = environment.webapiuri + 'UpdateDelivery';
    
    this.dataUpdate = {
      PROJECT_ID: projid,
      RAG: rag,
      LASTWEEK_ACHIEVED: achieved,
      NEXTWEEK_MILESTONE: milestone,
      RISKS_ISSUES: risks,
      CUSTOMER_SUPPORT: support,
      PUBLISH_DATE: this.input.daterange.startDate,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
}
