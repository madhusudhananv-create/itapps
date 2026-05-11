import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { AppsService } from '../../core/services/apps.service';
import { ClientDetailsModel } from '../../models/client-details-model';
import { LayoutService } from '../layout/layout.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    NavbarNewComponent
  ],
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss']
})
export class SuccessPageComponent implements OnInit {

  @ViewChild('txtGoals') txtGoals!: ElementRef<HTMLTextAreaElement>;

  readonlymode: boolean = true;
  editmode: boolean = false;
  today: Date;
  empid: string = '';

  private sub: any;
  input_customerid: string = '';

  clientGoals: any;
  clientId: any;

  SelectedData: any;

  private route = inject(ActivatedRoute);
  public _access = inject(AccessControl);
  private _http = inject(HttpClient);
  public _util = inject(MyUtility);
  private _appservice = inject(AppsService);
  public _layoutService = inject(LayoutService);
  private _snackBar = inject(MatSnackBar);

  constructor() {
    this.today = new Date();
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
    });

    this.empid = localStorage.getItem('empid') || '';
    this.loadProjects(this.empid);

    this._layoutService.selectedCust = this.input_customerid;
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

    this._snackBar.open('Success goals updated successfully!', 'x', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
    
    this.readonlymode = true;
    this.editmode = false;

    this.clientGoals = clientGoals;
  }

  GetAuthHeader() {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers = headers.append('token', this._util.AppSettings.token);
    return headers;
  }

  refreshData(data: any) {
    this.SelectedData.client.reports.push(this.getNewProcess(data));
  }

  getNewProcess(data: any) {
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
  service_updateOverview(clientId: any, rag: any, clientDescription: any, gavsDescription: any, clientGoals: any) {
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
      .subscribe({
        next: (data) => { },
        error: (error) => { this._util.serviceError(error); }
      });
  }

  loadProjects(empid: string) {
    let logintype: string = localStorage.getItem('logintype') || '';
    if (logintype === 'gavs')
      this.getEmployeeProjects(empid)
    else
      this.getCustomerProjects(empid)
  }

  receivedData: ClientDetailsModel[] = [];

  getCustomerProjects(customerid: string) {
    this._appservice.getGetCSPDetails_Customer(customerid)
      .subscribe({
        next: (data) => {
          this.receivedData = data;
          if (this.receivedData && this.receivedData.length > 0 && this.receivedData[0].projects && this.receivedData[0].projects.length > 0) {
            this.SelectedData = { type: 'client', project: this.receivedData[0].projects[0], client: this.receivedData[0] };
          }
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
  }

  getEmployeeProjects(empid: string) {
    this._appservice.getGetCSPDetails_Employee(empid, new Date(), this.input_customerid)
      .subscribe({
        next: (data) => {
          this.receivedData = data.filter((i: any) => i.client_ID == this.input_customerid);
          if (this.receivedData && this.receivedData.length > 0 && this.receivedData[0].projects && this.receivedData[0].projects.length > 0) {
            this.SelectedData = {
              type: 'client', project: this.receivedData[0].projects[0],
              client: this.receivedData[0]
            };
            this.clientGoals = this.SelectedData.client.client_Goals;
            this.clientId = this.SelectedData.client.client_ID;
          }
        },
        error: (error) => { this._util.serviceError(error); }
      });
  }
}
