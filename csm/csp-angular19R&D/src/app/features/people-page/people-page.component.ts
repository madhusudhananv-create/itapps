import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { enumRoles } from '../../shared/enum';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { ProjectsModel } from '../../models/projects.model';
import { PeopleModel } from '../../models/people.model';

/**
 * People Page Component
 * Displays project team members with their roles and allows editing
 * Migrated from LEGACY-SOURCE/src/app/pages/layout/people-page/
 * 
 * Features:
 * - Project selector dropdown
 * - RAG status for people/resources
 * - Resource challenges field
 * - Team member cards with photos
 * - Edit resource titles/roles
 * - Customer Success Manager highlighting
 * 
 * Migration Changes:
 * - Converted to standalone component
 * - Updated to use modern Angular 19 patterns
 * - All business logic preserved exactly from legacy
 */
@Component({
  selector: 'app-people-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatPaginatorModule,
    NavbarNewComponent
  ],
  templateUrl: './people-page.component.html',
  styleUrls: ['./people-page.component.scss']
})
export class PeoplePageComponent implements OnInit {

  private sub: any;
  input_projectid!: string;
  input_customerid!: string;
  _loading: boolean = true;
  showdetails: boolean = false;
  projNames: ProjectsModel[] = [];
  allproj: boolean = false;
  empid!: string;
  ngtest!: string;
  input: any;
  @Input('inputrag') input_rag: any;
  dataSource: any;
  txtChallenges: any;
  readonlymode: boolean = true;
  editmode: boolean = false;
  editPeople: boolean = false;
  EditAllowed = true;
  displayedColumns = ['index', 'title', 'emP_Name', 'onsite', 'offshore'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    //this.dataSource.paginator = this.paginator;
  }

  constructor(
    private route: ActivatedRoute,
    public _access: AccessControl,
    public _util: MyUtility,
    private _appservice: AppsService,
    public _layoutService: LayoutService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (
      role == enumRoles.BUHeadIMS.toString() ||
      role == enumRoles.PMO.toString() ||
      role == enumRoles.Quality.toString()
    )
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.getAllProjectsFromCustomer();
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe({
      next: (data) => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          this.input_projectid = this.projNames[0].proJ_ID;
          this.onProjectChange();
        }
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  //People section code

  SubmitForm(forminput: any) {
    if (!forminput.valid) {
      this.showToast('Please enter required fields', 'error');
      return;
    }
    let s: PeopleModel = new PeopleModel();
    s.projecT_ID = this.input_projectid;
    s.resourcE_CHALLENGES = forminput.value.txtChallenges;
    s.updateD_BY = localStorage.getItem('empid') || '';
    s.updateD_DATE = new Date();
    this._util.updateRAG(this.input_rag, 'people', forminput.value.ragSelected);
    this.service_updatePeople(this.input_projectid, forminput.value.ragSelected, s.resourcE_CHALLENGES);
    this.readonlymode = true;
    this.editmode = false;
    this.showToast('People information saved successfully', 'success');
  }

  EditPeopleIndex!: number;
  EditEmpID!: string;

  EditPeople_onClick(index: number, id: string) {
    this.EditPeopleIndex = index;
    this.EditEmpID = id;
  }

  IsReadonlyCust(i: number, id: string) {
    return true;
    if (this.EditPeopleIndex === i && this.EditEmpID === id)
      return false;
    else
      return true;
  }

  SavePeople_onClick(emp: any) {
    this._appservice.updateResourceTitle(emp).subscribe({
      next: (data) => {
        this.getNewTitle();
        this.showToast('Resource title updated successfully', 'success');
      },
      error: (error) => {
        this._util.serviceError(error);
        this.showToast('Failed to update resource title', 'error');
      }
    });
    this.EditPeopleIndex = null!;
    this.EditEmpID = null!;
  }

  CancelPeople_onClick() {
    this.EditPeopleIndex = null!;
    this.EditEmpID = null!;
    this.showToast('Edit cancelled', 'info');
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

  getNewTitle() {
    if (this.input != null && this.input.resource.length > 0) {
      this._appservice.getNewResource(this.input_projectid).subscribe({
        next: (data) => {
          this.input.resource = data;
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
    }
  }

  //**********************************************
  //service methods
  //**********************************************
  dataUpdate: any;
  fdate: any;
  private _peopleLoaded: boolean = false;
  private _ragsLoaded: boolean = false;

  service_updatePeople(projid: string, rag: string, challenges: string) {
    this._appservice.updatePeople(projid, rag, challenges).subscribe({
      next: (data) => { },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  //**********************************************

  getProjectPeopleByProjId(projectID: string) {
    this._appservice.getProjectPeopleByProjId(projectID).subscribe({
      next: (data) => {
        this.input = data;
        this._peopleLoaded = true;
        this.checkAndShowDetails();
      },
      error: (error) => {
        this._util.serviceError(error);
        this._peopleLoaded = true;
        this.checkAndShowDetails();
      }
    });
  }

  getProjectRagsByProjId(projectID: string) {
    this._appservice.getProjectRagsByProjId(projectID).subscribe({
      next: (data) => {
        this.input_rag = data;
        this._ragsLoaded = true;
        this.checkAndShowDetails();
      },
      error: (error) => {
        this._util.serviceError(error);
        this._ragsLoaded = true;
        this.checkAndShowDetails();
      }
    });
  }

  private checkAndShowDetails() {
    if (this._peopleLoaded && this._ragsLoaded) {
      this.showdetails = true;
      this._loading = false;
    }
  }

  onProjectChange() {
    this._loading = true;
    this.showdetails = false;
    this._peopleLoaded = false;
    this._ragsLoaded = false;
    this.getProjectPeopleByProjId(this.input_projectid);
    this.getProjectRagsByProjId(this.input_projectid);
  }
}
