import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Material Design Imports
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services & Models
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { environment } from '../../../environments/environment';
import { enumDateRange, enumRoles } from '../../shared/enum';
import { DeliveryModel, DeliveryDetailsModel, DateRangeModel } from '../../models/delivery-model';
import { ProjectsModel } from '../../models/projects-model';

// Navbar Component
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

// Subproject Component
import { SubprojectComponent } from '../../controls/subproject/subproject.component';

/**
 * Delivery Page Component
 * Migrated from Angular 6 to Angular 19
 * 
 * Features:
 * - Weekly status reporting (4 Quadrant view)
 * - Sub-projects management
 * - RAG status tracking
 * - Accomplishments, milestones, risks, and intervention tracking
 * - Previous/Next week navigation
 * 
 * Migration Notes:
 * - Converted to standalone component
 * - Replaced Http with HttpClient
 * - All logic preserved exactly from legacy
 * - All method names unchanged
 * - All styling preserved
 */
@Component({
  selector: 'app-delivery-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatSelectModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    NavbarNewComponent,
    SubprojectComponent
  ],
  templateUrl: './delivery-page.component.html',
  styleUrls: ['./delivery-page.component.scss']
})
export class DeliveryPageComponent implements OnInit {

  private route = inject(ActivatedRoute);
  public _access = inject(AccessControl);
  private _http = inject(HttpClient);
  public _util = inject(MyUtility);
  private _appservice = inject(AppsService);
  public _layoutService = inject(LayoutService);

  private sub: any;
  input: DeliveryDetailsModel = new DeliveryDetailsModel();
  input_rag: any = 'delivery';
  input_projectid: string = '';
  input_customerid: string = '';
  initialDt: Date = new Date();
  _loading: boolean = false;
  selectedOption = 'Task';
  bShow4Quadrant = false;
  startdate: Date = new Date();
  projNames: ProjectsModel[] = [];
  allproj: boolean = false;
  showdetails: boolean = false;

  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataUpdate: any;
  selectedRag: string = '';

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
  }

  ngOnChanges() {
    // Legacy code preserved
  }

  onProjectChange(projectId?: string) {
    // If projectId is passed from the event, use it; otherwise use the bound value
    const projId = projectId || this.input_projectid;
    
    
    if (!projId || projId === '') {
      console.error('ERROR: Project ID is empty or undefined!');
      console.error('  - projNames array:', this.projNames);
      console.error('  - projNames length:', this.projNames?.length);
      return;
    }
    
    // Update the bound value if we got it from the event
    if (projectId) {
      this.input_projectid = projectId;
    }
    
    this.input.daterange!.startDate = new Date();
    this.LoadData(enumDateRange.Weekly);
  }

  getAllProjectsFromCustomer() {
    
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          
          if (this._layoutService.selectedProj != undefined && this._layoutService.selectedProj != null && this._layoutService.selectedProj != '') {
            this.input_projectid = this._layoutService.selectedProj;
            this.showdetails = true;
            this.onProjectChange();
            this._layoutService.selectedProj = '';
          }
          else {
            this.input_projectid = this.projNames[0].proJ_ID!;
            this.showdetails = true;
            this.onProjectChange();
          }
        } else {
          console.warn('No projects found for customer');
        }
      },
      error => {
        console.error('Error getting projects:', error);
        this._util.serviceError(error);
      }
    )
  }

  Save_onClick(rag: string, achieved: string, milestone: string, risks: string, support: string) {
    if (rag === "" || rag === null) {
      alert("Please select RAG");
      return;
    }
    this.input.delivery!.rag = rag;
    this.input.delivery!.lastweeK_ACHIEVED = achieved;
    this.input.delivery!.nextweeK_MILESTONE = milestone;
    this.input.delivery!.riskS_ISSUES = risks;
    this.input.delivery!.customeR_SUPPORT = support;
    this.input.delivery!.publisH_DATE = this.input.daterange!.startDate;
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

  onValChange(val: string) {
    this.selectedOption = val;
    if (val === '4Quadrant') {
      this.bShow4Quadrant = true;
    }
    else {
      this.bShow4Quadrant = false;
    }
  }

  //**********************************************
  // General Methods
  //**********************************************
  LoadData(range: enumDateRange) {
    
    if (!this.input_projectid || this.input_projectid === '') {
      console.error('ERROR: Cannot load data - input_projectid is empty!');
      this._loading = false;
      return;
    }
    
    this._loading = true;

    this._appservice.getDelivery(this.input_projectid, new Date(this.input.daterange!.startDate!).toDateString(), range)
      .subscribe(data => {
        this._loading = false;
        this.input.delivery!.lastweeK_ACHIEVED = data.delivery!.lastweeK_ACHIEVED;
        this.input.delivery!.nextweeK_MILESTONE = data.delivery!.nextweeK_MILESTONE;
        this.input.delivery!.riskS_ISSUES = data.delivery!.riskS_ISSUES;
        this.input.delivery!.customeR_SUPPORT = data.delivery!.customeR_SUPPORT;
        this.input.delivery!.rag = data.delivery!.rag;
        this.input_rag = data.delivery!.rag;
        this.input.daterange!.startDate = data.daterange!.startDate;
        this.input.daterange!.endDate = data.daterange!.endDate;
        this.showdetails = true;
      }, error => {
        console.error('ERROR loading delivery data:', error);
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
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers = headers.append('token', this._util.AppSettings.token);
    headers = headers.append('empId', localStorage.getItem('empid') || '');
    return headers;
  }

  service_updateDelivery(projid: string, rag: string, achieved: string, milestone: string, risks: string, support: string) {
    let apiuri: string = environment.webapiuri + 'UpdateDelivery';
    this.dataUpdate = {
      PROJECT_ID: projid,
      RAG: rag,
      LASTWEEK_ACHIEVED: achieved,
      NEXTWEEK_MILESTONE: milestone,
      RISKS_ISSUES: risks,
      CUSTOMER_SUPPORT: support,
      PUBLISH_DATE: this.input.daterange!.startDate,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
}
