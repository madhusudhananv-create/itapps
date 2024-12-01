import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppsService } from '../../Services/apps.service';
import { environment } from '../../../environments/environment';
import { ClientDetailsModel } from '../../models/client-details-model';
import { Configuration } from '../../services/app.configuration';
import { myUtility } from '../../Shared/myUtility';
import { ProcessModel } from '../../models/process-model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  // constructor() { }

  // ngOnInit() {
  // }


  mobileQuery: MediaQueryList;
  webapiuri: String = "";
  canedit: any;
  token: string;
  empid: string;
  displayname: string;
  projectid: string;
  private _mobileQueryListener: () => void;
  constructor(private _router: Router, private _http: Http, private _appservice: AppsService, private _config: Configuration, private _util: myUtility, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnInit() {
    this.webapiuri = environment.webapiuri;
    this.canedit = localStorage.getItem('canedit');
    this.empid = localStorage.getItem('empid');
    this.displayname = localStorage.getItem('displayname');
    this.token = localStorage.getItem('token');
    this._util.validateLogin();
    this.loadProjects(this.empid);
  }
  //**********************************************
  // Events
  //**********************************************
  Project_OnClick(CLIENT_ID, PROJ_ID) {
    for (let c of this.receivedData) {
      if (c.client_ID == CLIENT_ID) {
        for (let p of c.projects) {
          if (p.proJ_ID == PROJ_ID) {
            this.SelectedData = { type: 'project', project: p, client: c };
          }
        }
      }
    }
  }
  Client_OnClick(CLIENT_ID) {
    //alert(this._config.ApiServer);
    for (let c of this.receivedData) {
      if (c.client_ID == CLIENT_ID) {
        this.SelectedData = { type: 'client', project: c.projects[0], client: c };
      }
    }
  }
  OverallStatus_onClick(event) {
    alert("double click");
  }
  //**********************************************
  // General Methods
  //**********************************************
  _readonly: boolean = true;
  IsEditAllowed() {
    if (this.canedit === 'true')
      return true;
    else
      return false;
  }
  //----------------------------------------
  EditCustIndex: number;
  EditCustId: string;
  EditCust_onClick(index, id) {
    this.EditCustIndex = index;
    this.EditCustId = id;
  }
  IsReadonlyCust(i, id) {
    if (this.EditCustIndex === i && this.EditCustId === id)
      return false;
    else
      return true;
  }
  SaveCust_onClick(client, ragValue) {
    client.client_RAG = ragValue;
    this.service_updateClientRag(client, ragValue)
    this.EditCustIndex = null;
    this.EditCustId = null;
  }
  CancelCust_onClick() {
    this.EditCustIndex = null;
    this.EditCustId = null;
  }
  //----------------------------------------
  EditProjIndex: number;
  EditProjId: string;
  EditProj_onClick(index, projid) {
    this.EditProjIndex = index;
    this.EditProjId = projid;
  }
  IsReadonlyProj(i, projid) {
    if (this.EditProjIndex === i && this.EditProjId === projid)
      return false;
    else
      return true;
  }
  SaveProj_onClick(proj, ragValue) {
    proj.proJ_RAG = ragValue;
    this.service_updateRags(proj.proJ_ID, 'project', ragValue)
    this.EditProjIndex = null;
    this.EditProjId = null;
  }
  CancelProj_onClick() {
    this.EditProjIndex = null;
    this.EditProjId = null;
  }
  //--------------------------------------


  // validateLogin() {
  //   this.empid = localStorage.getItem('empid');
  //   this.token = localStorage.getItem('token');
  //   if (this.empid === "" || this.empid === null) {
  //     alert("Please login again");
  //     this._router.navigateByUrl('/login');
  //   }
  // }
  loadProjects(empid) {
    let logintype: string = localStorage.getItem('logintype');
    if (logintype === 'gavs')
      this.getEmployeeProjects(empid)
    else
      this.getCustomerProjects(empid)
  }


  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
  errorMessage: string;
  receivedData: ClientDetailsModel[];

  getEmployeeProjects(empid) {
    this._appservice.getGetCSPDetails_Employee(empid, new Date(), '')
      .subscribe
      (
        data => {
          this.receivedData = data;
          this.SelectedData = { type: 'client', project: this.receivedData[0].projects[0], client: this.receivedData[0] };
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
        error => { this._util.serviceError(error); }
      );
  }
  dataUpdate: any;
  fdate: any;

  service_updateClientRag(client, rag) {
    let apiuri: string = this.webapiuri + 'UpdateClient';

    this.dataUpdate = {
      CUSTOMER_ID: client.client_ID,
      CUSTOMER_NAME: client.client_NM,
      RAG: rag,
      CUSTOMER_DESCRIPTION: client.client_Description,
      GAVS_DESCRIPTION: client.gavs_Description,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }

    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //---------------------
  service_updateRags(projId, category, rag) {
    let apiuri: string = this.webapiuri + 'Rags';
    this.dataUpdate = {
      PROJECT_ID: projId,
      CATEGORY: category,
      RAG: rag,
      PUBLISHED_ON: new Date(),
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  // Initialize data
  //**********************************************

  dummyProject: any = {
    "proJ_ID": "201P000185-01",
    "proJ_NM": "Loding client details...",
    "proJ_RAG": "green",
    "PUBLISHED_ON": "2018-01-17T00:00:00",
    "details": {
      "rags": [
        {
          "id": 1,
          "projecT_ID": "201P000185-01",
          "category": "project",
          "rag": "green",
          "createD_BY": "100365",
          "createD_DATE": "2018-01-17T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-01-17T00:00:00",
          "isactive": true
        },
        {
          "id": 3,
          "projecT_ID": "201P000185-01",
          "category": "scope",
          "rag": "green",
          "createD_BY": "100365",
          "createD_DATE": "2018-01-17T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-01-17T00:00:00",
          "isactive": true
        },
        {
          "id": 4,
          "projecT_ID": "201P000185-01",
          "category": "delivery",
          "rag": "green",
          "createD_BY": "100365",
          "createD_DATE": "2018-01-17T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-01-17T00:00:00",
          "isactive": true
        },
        {
          "id": 5,
          "projecT_ID": "201P000185-01",
          "category": "people",
          "rag": "green",
          "createD_BY": "100365",
          "createD_DATE": "2018-01-17T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-01-17T00:00:00",
          "isactive": true
        },
        {
          "id": 6,
          "projecT_ID": "201P000185-01",
          "category": "process",
          "rag": "green",
          "createD_BY": "100365",
          "createD_DATE": "2018-01-17T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-01-17T00:00:00",
          "isactive": true
        },
        {
          "id": 7,
          "projecT_ID": "201P000185-01",
          "category": "risk",
          "rag": "green",
          "createD_BY": "100365",
          "createD_DATE": "2018-01-17T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-01-17T00:00:00",
          "isactive": true
        },
        {
          "id": 8,
          "projecT_ID": "201P000185-01",
          "category": "valueadds",
          "rag": "green",
          "createD_BY": "100365",
          "createD_DATE": "2018-01-17T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-01-17T00:00:00",
          "isactive": true
        }
      ],
      "scope": {
        "id": 1,
        "projecT_ID": "201P000185-01",
        "rag": "green",
        "description": "",
        "technologY_USED": "",
        "scope": "",
        "createD_BY": "100365",
        "createD_DATE": "2017-01-02T00:00:00",
        "updateD_BY": "100365",
        "updateD_DATE": "2017-01-02T00:00:00",
        "isactive": true
      },
      "deliveryDetails": {
        "delivery": {
          "id": 2,
          "projecT_ID": "201P000185-01",
          "rag": "red",
          "lastweeK_ACHIEVED": "",
          "nextweeK_MILESTORE": "",
          "riskS_ISSUES": "lastweek",
          "customeR_SUPPORT": "next week",
          "publisH_DATE": new Date(),
          "createD_BY": "100365",
          "createD_DATE": "2018-01-02T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-01-02T00:00:00",
          "isactive": true
        },
        "daterange": {
          startDate: new Date(),
          endDate: new Date(),
        }
      },
      "people": {
        "projecT_PEOPLE": {
          "id": 1,
          "projecT_ID": "201P000185-01",
          "rag": "orange",
          "resourcE_CHALLENGES": "No issues with resource",
          "createD_BY": "100365",
          "createD_DATE": "2018-01-02T00:00:00",
          "updateD_BY": "100248",
          "updateD_DATE": "2018-01-01T00:00:00",
          "isactive": true
        },
        "resource": [
          {
            "title": "",
            "onsite": "",
            "offshore": ""
          },
          {
            "title": "Associate Manager Software Devlopment",
            "onsite": 0,
            "offshore": 1
          }
        ]
      },
      process:
        [new ProcessModel]
      ,
      "risk": [{
        "id": 1,
        "projecT_ID": "201P000185-01",
        "rag": "orange",
        "description": "Environment setup is delayed",
        "impact": "Q3 release would get affected",
        "probabilitY_SCALE": 1,
        "impacT_SCALE": 2,
        "owner": "Client",
        "area": "",
        "identifieD_BY": "",
        "identifieD_DATE": "",
        "risK_TREATMENT_STRATEGY": "",
        "status": "",
        "actioN_TAKEN": "raised in scrum call",
        "createD_BY": "100365",
        "createD_DATE": "2018-01-03T00:00:00",
        "updateD_BY": "100365",
        "updateD_DATE": "2018-01-03T00:00:00",
        "isactive": true
      }],
      "issue": [
        {
          "id": 2,
          "projecT_ID": "206P000020-01",
          "rag": "green",
          "description": "issue ",
          "issuE_TYPE": "resource",
          "severity": "high",
          "actioN_PLAN": "yet to decide",
          "assigneD_TO": "roop",
          "identifieD_BY": "",
          "identifieD_DATE": "2018-02-02T00:00:00",
          "targeT_DATE": "2018-02-02T00:00:00",
          "status": "wip",
          "createD_BY": "100365",
          "createD_DATE": "2018-02-02T00:00:00",
          "updateD_BY": "100365",
          "updateD_DATE": "2018-02-02T00:00:00",
          "isactive": true
        }
      ],
      "valueadds": [{
        "id": 1,
        "projecT_ID": "201P000185-01",
        "rag": "green",
        "description": "Test automation",
        "benefits": "1 hour is reduced for every iteration release",
        "status": "wip",
        "createD_BY": "100365",
        "createD_DATE": "2018-01-03T00:00:00",
        "updateD_BY": "100365",
        "updateD_DATE": "2018-01-03T00:00:00",
        "isactive": true
      }],
      "actionitems": [{
        "id": 0,
        "projecT_ID": '',
        "rag": 'green',
        "description": "description",
        "source": "source",
        "priority": "priority",
        "identifieD_DATE": new Date(),
        "targeT_DATE": new Date(),
        "status": "status",
        "completioN_DATE": new Date(),
        "comments": "comments",
        "createD_BY": "100365",
        "createD_DATE": new Date(),
        "updateD_BY": "100365",
        "updateD_DATE": new Date()
      }]

    }
  }

  dummyClient: any = {
    "client_ID": 202100013,
    "client_NM": "Karcher North America Inc",
    "client_RAG": "GREEN",
    "client_Description": "Karcher - global provider of cleaning technology",
    "gavs_Description": "GAVS’ services include automation led infrastructure services, enabled by smart machines, DevOps & predictive analytics. Our focus is to reduce incidents through automation to improve user experience by 10X",
    "projects": [this.dummyProject]
  }

  SelectedData: any = { type: 'project', project: this.dummyProject, client: this.dummyClient };

}