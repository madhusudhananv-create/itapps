
import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { DeliveryModel, DeliveryDetailsModel, DateRangeModel } from '../../../models/delivery-model';
import { AppsService } from '../../../Services/apps.service';
import { enumDateRange, enumRoles } from '../../../Shared/enum';
import { AccessControl } from '../../../Shared/accessControl';
import { LayoutService } from '../layout.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectsModel } from '../../../models/projects-model';

@Component({
  selector: 'app-delivery-page',
  templateUrl: './delivery-page.component.html',
  styleUrls: ['./delivery-page.component.scss']
})
export class DeliveryPageComponent implements OnInit {
  private sub: any;
  input: DeliveryDetailsModel;
  input_rag: any = 'delivery';
  input_projectid: string;
  input_customerid: string;
  initialDt: Date = new Date();
  _loading: boolean = false;
  selectedOption = 'Task';
  bShow4Quadrant = false;
  startdate: Date = new Date();
  projNames: ProjectsModel[];
  allproj: boolean = false;
  showdetails: boolean = false;

  constructor(private route: ActivatedRoute, private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, public _layoutService: LayoutService) { }

  ngOnInit() {

    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;

      if (params['projid'] != undefined && params['projid'] != null) {
        this.input_projectid = params['projid'];
        this._layoutService.selectedProj = this.input_projectid;
      }
    });

    this.input = new DeliveryDetailsModel();
    this.input.delivery = new DeliveryModel();
    this.input.daterange = new DateRangeModel();
    this.input.daterange.startDate = new Date();
    this.getAllProjectsFromCustomer();
    // this._util.updateRAG(this.input_rag, 'delivery', this.input.delivery.rag);
    // let emptydt = new Date('0001-01-01T00:00:00');
    // if ((new Date(this.input.delivery.publisH_DATE)).toDateString() != emptydt.toDateString()) {
    //   this.initialDt = new Date(this.input.delivery.publisH_DATE);
    // }

  }

  ngOnChanges() {
    // this._util.updateRAG(this.input_rag, 'delivery', this.input.delivery.rag);
    // let emptydt = new Date('0001-01-01T00:00:00');
    // if ((new Date(this.input.delivery.publisH_DATE)).toDateString() != emptydt.toDateString()) {
    //   this.initialDt = new Date(this.input.delivery.publisH_DATE);
    // }
  }

  onProjectChange() {

    this.input.daterange.startDate = new Date();
    this.LoadData(enumDateRange.Weekly);

    // this._util.updateRAG(this.input_rag, 'delivery', this.input.delivery.rag);
    // let emptydt = new Date('0001-01-01T00:00:00');
    // if ((new Date(this.input.delivery.publisH_DATE)).toDateString() != emptydt.toDateString()) {
    //   this.initialDt = new Date(this.input.delivery.publisH_DATE);
    // }

  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          if (this._layoutService.selectedProj != undefined && this._layoutService.selectedProj != null) {
            this.input_projectid = this._layoutService.selectedProj;
            this.showdetails = true;
            this.onProjectChange();
            this._layoutService.selectedProj = null;
          }
          else {
            this.input_projectid = this.projNames[0].proJ_ID;
            this.showdetails = true;
            this.onProjectChange();
          }
        }

      },
      error => {
        this._util.serviceError(error);
      }
    )
  }


  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  Save_onClick(rag, achieved, milestone, risks, support) {
    if (rag === "" || rag === null) {
      alert("Please select RAG");
      return;
    }
    this.input.delivery.rag = rag;
    this.input.delivery.lastweeK_ACHIEVED = achieved;
    this.input.delivery.nextweeK_MILESTONE = milestone;
    this.input.delivery.riskS_ISSUES = risks;
    this.input.delivery.customeR_SUPPORT = support;
    this.input.delivery.publisH_DATE = this.input.daterange.startDate;
    //this._util.updateRAG(this.input.delivery.rag, 'delivery', rag);
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
    if (val === '4Quadrant') {
      this.bShow4Quadrant = true

    }
    else {
      this.bShow4Quadrant = false;

    }


  }
  //**********************************************
  // General Methods
  //**********************************************
  LoadData(range: enumDateRange) {
    this._loading = true;

    this._appservice.getDelivery(this.input_projectid, new Date(this.input.daterange.startDate).toDateString(), range)
      .subscribe(data => {
        this._loading = false;
        this.input.delivery.lastweeK_ACHIEVED = data.delivery.lastweeK_ACHIEVED;
        this.input.delivery.nextweeK_MILESTONE = data.delivery.nextweeK_MILESTONE;
        this.input.delivery.riskS_ISSUES = data.delivery.riskS_ISSUES;
        this.input.delivery.customeR_SUPPORT = data.delivery.customeR_SUPPORT;
        this.input.delivery.rag = data.delivery.rag;
        this.input_rag = data.delivery.rag;
        this.input.daterange.startDate = data.daterange.startDate;
        this.input.daterange.endDate = data.daterange.endDate;
        //this._util.updateRAG(this.input_rag, 'delivery', data.delivery.rag);
        this.showdetails = true;
      }, error => {
        this._loading = false;
        this._util.serviceError(error);
      });
  }
  PreviousWeek() {
    this.LoadData(enumDateRange.PreviousWeek);
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
    headers.append('empId', localStorage.getItem('empid'));
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
