import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../layout.service';
import { ActivatedRoute } from '@angular/router';
import { AccessControl } from '../../../Shared/accessControl';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { ClientDetailsModel } from '../../../models/client-details-model';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-overview',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.scss']
})
export class OverviewPageComponent implements OnInit {

  readonlymode: boolean = true;
  editmode: boolean = false;
  empid: string;    
  clientId : any;
  SelectedData: any ;
  
  private sub: any;
  input_customerid: string;


  ClientDescription : any;
  GavsDescription : any;
  ClientRAG : any;
  ClientNM : any;
  companyName = environment.company_name;
  constructor(private route: ActivatedRoute, private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, public _layoutService: LayoutService) { 

    
  }

  ngOnInit() {


     this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];

});

    this.empid = localStorage.getItem('empid');    
    this.loadProjects(this.empid);

    this._layoutService.selectedCust = this.input_customerid;
    
//console.log(this.input_customerid);   

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


  getEmployeeProjects(empid) {
    this._appservice.getGetCSPDetails_Employee(empid, new Date(),  this.input_customerid)
      .subscribe
      (
      data => {
        this.receivedData = data;
        let clientData = this.receivedData.filter(x=>x.client_ID ==  this._layoutService.selectedCust)[0];
        this.SelectedData = { type: 'client', project: clientData.projects[0], client: clientData };
           
        this.clientId = this.SelectedData.client.clientId;
        this.ClientDescription = this.SelectedData.client.client_Description;
        this.GavsDescription = this.SelectedData.client.gavs_Description;
        this.ClientRAG = this.SelectedData.client.client_RAG;
        this.ClientNM = this.SelectedData.client.client_NM;
      }
      ,
      error => { this._util.serviceError(error); }
      );
  }
  
  
  getCustomerProjects(customerid) {
    
    this._appservice.getGetCSPDetails_Customer(customerid, new Date())
      .subscribe
      (
      data => {
        
        this.receivedData = data;
        this.SelectedData = { type: 'client', project: this.receivedData[0].projects[0], client: this.receivedData[0] };
        
      }
      ,
      error => {
        
        this._util.serviceError(error);
      }
      );
  }


  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
  }


  Save_onClick(clientId: number, rag: string, clientDesc: string, gavsDesc: string) {
    this.SelectedData.client.client_RAG = rag;
    this.SelectedData.client.client_Description = clientDesc;
    this.SelectedData.client.gavs_Description = gavsDesc;

    this.service_updateOverview(clientId, rag, clientDesc, gavsDesc, this.SelectedData.client.client_Goals);
    alert('Successfully updated');
    this.readonlymode = true;
    this.editmode = false;

    this.ClientDescription = clientDesc;
    this.GavsDescription = gavsDesc;

  }

  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }


  dataUpdate: any;
  service_updateOverview(clientId, rag, clientDescription, gavsDescription, clientGoals) {
    let apiuri: string = environment.webapiuri + 'UpdateClient';
    
    

    this.dataUpdate = {
      CUSTOMER_ID: this.input_customerid,
      RAG: rag,
      CUSTOMER_DESCRIPTION: clientDescription,
      CUSTOMER_GOALS: clientGoals,
      GAVS_DESCRIPTION: gavsDescription,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error);  });

    

  }




}
