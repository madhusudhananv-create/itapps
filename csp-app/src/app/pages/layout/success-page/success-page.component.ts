
import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { myUtility } from '../../../Shared/myUtility';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AccessControl } from '../../../Shared/accessControl';
import { AppsService } from '../../../Services/apps.service';
import { ClientDetailsModel } from '../../../models/client-details-model';
import { FeedbackModel } from '../../../models/feedback-model';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss']
})
export class SuccessPageComponent implements OnInit {

  //@Input('SelectedData') SelectedData: any;
  readonlymode: boolean = true;
  editmode: boolean = false;
  today: Date;
  feedback: FeedbackModel;
  empid: string;

  private sub: any;
  input_customerid: string;

  clientGoals: any;
  clientId: any;


  //SelectedData: any = { type: 'project', project: this.dummyClient, client: this.dummyClient };

  SelectedData: any;


  constructor(private route: ActivatedRoute, private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, public _layoutService: LayoutService) {

    this.today = new Date();
  }

  ngOnInit() {
    this.feedback = new FeedbackModel;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];


    });


    this.empid = localStorage.getItem('empid');
    this.loadProjects(this.empid);

    this._layoutService.selectedCust = this.input_customerid;

    // console.log(this.empid);



  }


  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;

  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
  }


  GoalsSave_onClick(clientId: number, clientGoals: string) {

    this.SelectedData.client.client_Goals = clientGoals;

    this.service_updateOverview(clientId, this.SelectedData.client.client_RAG, this.SelectedData.client.client_Description, this.SelectedData.client.gavs_Description, clientGoals);


    alert('Successfully updated');
    this.readonlymode = true;
    this.editmode = false;

    this.clientGoals = clientGoals;

  }


  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }

  refreshData(data) {
    this.SelectedData.client.reports.push(this.getNewProcess(data));
  }

  getNewProcess(data) {
    let result = {
      createD_BY: data.CREATED_BY,
      createD_DATE: data.CREATED_DATE,
      filE_CONTENT: data.FILE_CONTENT,
      filE_EXTENSION: data.FILE_EXTENSION,
      filE_NAME: data.FILE_NAME,
      filE_NAME_SERVER: data.FILE_NAME_SERVER,
      filE_TYPE: data.FILE_TYPE,
      id: data.ID,
      isactive: data.ISACTIVE,
      customerR_ID: data.CUSTOMER_ID,
      publisH_DATE: data.PUBLISH_DATE,
      rag: data.RAG,
      reporT_TYPE: data.REPORT_TYPE,
      updateD_BY: data.UPDATED_BY,
      updateD_DATE: data.UPDATED_DATE,
    }
    return result;
  }


  dataUpdate: any;
  service_updateOverview(clientId, rag, clientDescription, gavsDescription, clientGoals) {
    let apiuri: string = environment.webapiuri + 'UpdateClient';



    this.dataUpdate = {
      CUSTOMER_ID: clientId,
      RAG: rag,
      CUSTOMER_DESCRIPTION: clientDescription,
      CUSTOMER_GOALS: clientGoals,
      GAVS_DESCRIPTION: gavsDescription,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });



  }


  loadProjects(empid) {
    let logintype: string = localStorage.getItem('logintype');
    //console.log(logintype);
    if (logintype === 'gavs')
      this.getEmployeeProjects(empid)
    else
      this.getCustomerProjects(empid)
  }

  receivedData: ClientDetailsModel[];


  getCustomerProjects(customerid) {

    this._appservice.getGetCSPDetails_Customer(customerid, new Date())
      .subscribe
      (
        data => {

          this.receivedData = data;
          this.SelectedData = { type: 'client', project: this.receivedData[0].projects[0], client: this.receivedData[0] };
          /* console.log(this.receivedData);
           console.log(this.SelectedData);*/
        }
        ,
        error => {

          this._util.serviceError(error);
        }
      );
  }


  getEmployeeProjects(empid) {
    this._appservice.getGetCSPDetails_Employee(empid, new Date(), this.input_customerid)
      .subscribe
      (
        data => {
          this.receivedData = data.filter(i => i.client_ID == this.input_customerid);
          this.SelectedData = {
            type: 'client', project: this.receivedData[0].projects[0],
            client: this.receivedData[0]
          };
          /* console.log("getEmployeeProjects");
           console.log(this.SelectedData.client);
           console.log(this.SelectedData.client.client_Goals);*/
          this.clientGoals = this.SelectedData.client.client_Goals;
          this.clientId = this.SelectedData.client.client_ID;

        }
        ,
        error => { this._util.serviceError(error); }
      );
  }



}
