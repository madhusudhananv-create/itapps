import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { ClientDetailsModel } from '../../models/client-details-model';
import { environment } from '../../../environments/environment';

/**
 * Overview Page Component
 * Displays customer overview with client and company descriptions
 * 
 * Features:
 * - View customer overview information
 * - Edit client description and GAVS description
 * - Save updates to customer overview
 * - Back navigation to dashboard
 * 
 * Migrated from Angular 6 to Angular 19
 * All business logic, names, and styles preserved exactly from legacy
 * UI modernized following MASTER_UI_UPGRADE_PROMPT.md
 */
@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
    NavbarNewComponent
  ],
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.scss']
})
export class OverviewPageComponent implements OnInit {

  @ViewChild('txtClient') txtClient!: ElementRef;
  @ViewChild('txtGavs') txtGavs!: ElementRef;

  readonlymode: boolean = true;
  editmode: boolean = false;
  empid: string = '';    
  clientId: any;
  SelectedData: any;
  
  private sub: any;
  input_customerid: string = '';

  ClientDescription: any;
  GavsDescription: any;
  ClientRAG: any;
  ClientNM: any;
  companyName = environment.company_name;

  constructor(
    private route: ActivatedRoute, 
    public _access: AccessControl, 
    private _http: HttpClient, 
    private _util: MyUtility, 
    private _appservice: AppsService, 
    public _layoutService: LayoutService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
    });

    this.empid = localStorage.getItem('empid') || '';    
    this.loadProjects(this.empid);

    this._layoutService.selectedCust = this.input_customerid;
  }

  loadProjects(empid: string) {
    let logintype: string = localStorage.getItem('logintype') || '';
    if (logintype === 'gavs')
      this.getEmployeeProjects(empid);
    else
      this.getCustomerProjects(empid);
  }

  receivedData: ClientDetailsModel[] = [];

  getEmployeeProjects(empid: string) {
    this._appservice.getGetCSPDetails_Employee(empid, new Date(), this.input_customerid)
      .subscribe(
        data => {
          this.receivedData = data;
          let clientData = this.receivedData.filter(x => x.client_ID == this._layoutService.selectedCust)[0];
          if (clientData && clientData.projects && clientData.projects.length > 0) {
            this.SelectedData = { type: 'client', project: clientData.projects[0], client: clientData };
               
            this.clientId = this.SelectedData.client.clientId;
            this.ClientDescription = this.SelectedData.client.client_Description;
            this.GavsDescription = this.SelectedData.client.gavs_Description;
            this.ClientRAG = this.SelectedData.client.client_RAG;
            this.ClientNM = this.SelectedData.client.client_NM;
          }
        },
        error => { this._util.serviceError(error); }
      );
  }
  
  getCustomerProjects(customerid: string) {
    this._appservice.getGetCSPDetails_Customer(customerid)
      .subscribe(
        data => {
          this.receivedData = data;
          if (this.receivedData && this.receivedData.length > 0 && this.receivedData[0].projects && this.receivedData[0].projects.length > 0) {
            this.SelectedData = { type: 'client', project: this.receivedData[0].projects[0], client: this.receivedData[0] };
          }
        },
        error => {
          this._util.serviceError(error);
        }
      );
  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.showToast('Edit mode enabled', 'info');
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.showToast('Changes cancelled', 'info');
  }

  Save_onClick(clientId: number, rag: string, clientDesc: string, gavsDesc: string) {
    if (!clientDesc || !gavsDesc) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    this.SelectedData.client.client_RAG = rag;
    this.SelectedData.client.client_Description = clientDesc;
    this.SelectedData.client.gavs_Description = gavsDesc;

    this.service_updateOverview(clientId, rag, clientDesc, gavsDesc, this.SelectedData.client.client_Goals);
    
    this.readonlymode = true;
    this.editmode = false;

    this.ClientDescription = clientDesc;
    this.GavsDescription = gavsDesc;
  }

  // Toast notification helper method
  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const panelClass = type === 'success' ? ['toast-success'] :
                      type === 'error' ? ['toast-error'] :
                      type === 'warning' ? ['toast-warning'] :
                      ['toast-info'];

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: panelClass
    });
  }

  GetAuthHeader() {
    const token = localStorage.getItem('token') || '';
    const empId = localStorage.getItem('empid') || '';
    
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': token,
      'empId': empId
    });
  }

  dataUpdate: any;

  service_updateOverview(clientId: any, rag: string, clientDescription: string, gavsDescription: string, clientGoals: any) {
    let apiuri: string = environment.webapiuri + 'UpdateClient';

    this.dataUpdate = {
      CUSTOMER_ID: this.input_customerid,
      RAG: rag,
      CUSTOMER_DESCRIPTION: clientDescription,
      CUSTOMER_GOALS: clientGoals,
      GAVS_DESCRIPTION: gavsDescription,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    };

    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe({
        next: (data) => {
          this.showToast('Overview updated successfully', 'success');
        },
        error: (error) => {
          this._util.serviceError(error);
          this.showToast('Failed to update overview', 'error');
        }
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
