import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AppsService } from '../../core/services/apps.service';
import { ClientDetailsModel } from '../../models/client-details-model';
import { ProcessModel } from '../../models/process-model';
import { MyUtility } from '../../shared/my-utility';
import { environment } from '../../../environments/environment';
import { Configuration } from '../../core/services/app.configuration';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  
  receivedData: ClientDetailsModel[] = [];
  SelectedData: any;
  EditCustIndex: number = -1;
  EditCustId: number = -1;
  EditProjIndex: number = -1;
  EditProjId: number = -1;

  dummyProject: any;
  dummyClient: any;

  constructor(
    public _util: MyUtility,
    private router: Router,
    private http: HttpClient,
    private _service: AppsService,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private _configuration: Configuration
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.loadProjects(this._util.AppSettings.empid);
    this.InitializeDummyData();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  Project_OnClick(CLIENT_ID: any, PROJ_ID: any) {
    this.receivedData.forEach((client: any) => {
      if (client.client_ID == CLIENT_ID) {
        client.projects.forEach((proj: any) => {
          if (proj.proJ_ID == PROJ_ID) {
            this.SelectedData = { type: 'Project', project: proj, client: client };
          }
        });
      }
    });
  }

  Client_OnClick(CLIENT_ID: any) {
    this.receivedData.forEach((client: any) => {
      if (client.client_ID == CLIENT_ID) {
        this.SelectedData = { type: 'Client', project: client.projects[0], client: client };
      }
    });
  }

  OverallStatus_onClick(event: any) {
    if (event.detail >= 2) {
      this._util.showInfo("Double Click");
    }
  }

  EditCust_onClick(index: number, id: number) {
    this.EditCustIndex = index;
    this.EditCustId = id;
  }

  IsReadonlyCust(i: number, id: number) {
    if (this.EditCustId == id && this.EditCustIndex == i)
      return false;
    else
      return true;
  }

  SaveCust_onClick(client: any, ragValue: string) {
    client.client_RAG = ragValue;
    this.service_updateClientRag(client, ragValue);
    this.CancelCust_onClick();
  }

  CancelCust_onClick() {
    this.EditCustId = -1;
    this.EditCustIndex = -1;
  }

  EditProj_onClick(index: number, projid: number) {
    this.EditProjIndex = index;
    this.EditProjId = projid;
  }

  IsReadonlyProj(i: number, projid: number) {
    if (this.EditProjId == projid && this.EditProjIndex == i)
      return false;
    else
      return true;
  }

  SaveProj_onClick(proj: any, ragValue: string) {
    proj.proJ_RAG = ragValue;
    this.service_updateRags(proj.proJ_ID, 'Overall', ragValue);
    this.CancelProj_onClick();
  }

  CancelProj_onClick() {
    this.EditProjId = -1;
    this.EditProjIndex = -1;
  }

  loadProjects(empid: any) {
    if (this._util.AppSettings.logintype === 'gavs') {
      this.getEmployeeProjects(empid);
    }
    else {
      this.getCustomerProjects(this._util.AppSettings.customerid);
    }
  }

  getEmployeeProjects(empid: any) {
    this._service.getGetCSPDetails_Employee(empid).subscribe((res: any) => {
      this.receivedData = res;
      if (this.receivedData.length > 0) {
        this.Client_OnClick(this.receivedData[0].client_ID);
      }
    });
  }

  getCustomerProjects(customerid: any) {
    this._service.getGetCSPDetails_Customer(customerid).subscribe((res: any) => {
      this.receivedData = res;
      if (this.receivedData.length > 0) {
        this.Client_OnClick(this.receivedData[0].client_ID);
      }
    });
  }

  GetAuthHeader() {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer ' + this._util.AppSettings.token);
    return headers;
  }

  service_updateClientRag(client: any, rag: any) {
    let url = this._configuration.ServerWithApiUrl + "UpdateClient";
    let headers = this.GetAuthHeader();
    let body = JSON.stringify(client);
    
    this.http.post(url, body, { headers: headers }).subscribe((res: any) => {
    });
  }

  service_updateRags(projId: any, category: any, rag: any) {
    let url = this._configuration.ServerWithApiUrl + "Rags/" + projId + "/" + category + "/" + rag;
    let headers = this.GetAuthHeader();
    
    this.http.post(url, {}, { headers: headers }).subscribe((res: any) => {
    });
  }

  InitializeDummyData() {
    this.dummyProject = {
      "proJ_ID": -1,
      "proJ_NM": "Loading...",
      "proJ_RAG": "green",
      "rags": [
        {
          "category": "Overall",
          "rag": "green"
        },
        {
          "category": "Scope",
          "rag": "green"
        },
        {
          "category": "Schedule",
          "rag": "green"
        },
        {
          "category": "Budget",
          "rag": "green"
        },
        {
          "category": "Quality",
          "rag": "green"
        },
        {
          "category": "Resource",
          "rag": "green"
        },
        {
          "category": "Delivery",
          "rag": "green"
        },
        {
          "category": "Risk",
          "rag": "green"
        },
        {
          "category": "Issue",
          "rag": "green"
        }
      ],
      "scope": {
        "scopE_ID": 0,
        "proJ_ID": 0,
        "scopE_DESC": "Loading...",
        "scopE_RAG": "green",
        "scopE_DATE": null
      },
      "deliveryDetails": {
        "deliverY_ID": 0,
        "proJ_ID": 0,
        "deliverY_DESC": "Loading...",
        "deliverY_RAG": "green",
        "deliverY_DATE": null,
        "deliverY_END_DATE": null
      },
      "people": {
        "peoplE_ID": 0,
        "proJ_ID": 0,
        "peoplE_DESC": "Loading...",
        "peoplE_RAG": "green",
        "peoplE_DATE": null
      },
      "process": [
        {
          "procesS_ID": -1,
          "proJ_ID": -1,
          "statuS_DESC": "Loading...",
          "taG_COLOR": "green",
          "budgeT_VAR": "0",
          "budgeT_RAG": "green",
          "schedulE_VAR": "0",
          "schedulE_RAG": "green",
          "qualitY_VAR": "0",
          "qualitY_RAG": "green",
          "resourcE_VAR": "0",
          "resourcE_RAG": "green",
          "deliverY_VAR": "0",
          "deliverY_RAG": "green",
          "risK_CNT": 0,
          "issuE_CNT": 0,
          "vA_CNT": 0,
          "aI_CNT": 0,
          "procesS_DATE": null
        }
      ],
      "risk": [
        {
          "risK_ID": -1,
          "proJ_ID": -1,
          "risK_DESC": "Loading...",
          "risK_RAG": "green",
          "risK_DATE": null
        }
      ],
      "issue": [
        {
          "issuE_ID": -1,
          "proJ_ID": -1,
          "issuE_DESC": "Loading...",
          "issuE_RAG": "green",
          "issuE_DATE": null
        }
      ],
      "valueadds": [
        {
          "valuE_ID": -1,
          "proJ_ID": -1,
          "valuE_DESC": "Loading...",
          "valuE_RAG": "green",
          "valuE_DATE": null
        }
      ],
      "actionitems": [
        {
          "aI_ID": -1,
          "proJ_ID": -1,
          "aI_DESC": "Loading...",
          "aI_RAG": "green",
          "aI_DATE": null
        }
      ]
    };

    this.dummyClient = {
      "client_ID": -1,
      "client_NM": "Loading...",
      "client_RAG": "green",
      "projects": [this.dummyProject]
    };

    this.SelectedData = { type: 'Project', project: this.dummyProject, client: this.dummyClient };
  }
}
