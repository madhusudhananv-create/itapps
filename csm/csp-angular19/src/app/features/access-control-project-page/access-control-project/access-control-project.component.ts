import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select'; // Angular Material Dropdown

import { EmpInfoModel, ProjectResourceByEmpIdModel, ProjectResourceModel } from '../../../models/emp-info.model';
import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { DialogYesNoComponent } from '../../../controls/dialog-yes-no/dialog-yes-no.component';
import { ProjectSelectorComponent } from '../../../shared/components/project-selector/project-selector.component';
import { AccessControl } from '../../../shared/access-control';
import { AddProjectsModel } from '../../../models/projects.model';

/**
 * Access Control Project Component (Resource wise Projects)
 * Allows assigning projects to resources
 */
@Component({
  selector: 'app-access-control-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatTableModule,
    MatSelectModule, 
    ProjectSelectorComponent,
    DialogYesNoComponent
  ],
  templateUrl: './access-control-project.component.html',
  styleUrls: ['./access-control-project.component.scss']
})
export class AccessControlProjectComponent implements OnInit {
  @ViewChild(ProjectSelectorComponent) _projectSelector!: ProjectSelectorComponent;
  custId: string = '';
  projId: string = '';
  isBillable: boolean = false;
  isProjResource: boolean = false;
  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  projectResource: ProjectResourceByEmpIdModel[] = [];
  filteredOptions: Observable<EmpInfoModel[]>;
  dataSource: ProjectResourceByEmpIdModel[] = [];
  displayedColumns = ['cusT_NM', 'proJ_NM', 'curR_INDC', 'bilL_FLG', 'starT_DATE', 'enD_DATE', 'delete'];

  startdate: any = new Date().toISOString().split('T')[0];
  enddate: any = new Date();
  year: number = new Date().getFullYear();
  crispMonth: string = '';
  crispYear: string = "2024";
  errorStr: string = "";
  isCreateAccessDisabled: boolean = true;
  AddNewProjectObj: any;

  // Configuration properties for UI state rules and role dropdown lookup array
  rolesList: any[] = [];
  selectedRoleId: number = 0;
  isDetailsLoaded: boolean = false; // Controls dropdown display initialization state

  constructor(
    public _util: MyUtility,
    public _appservice: AppsService,
    public _access: AccessControl,
    private dialog: MatDialog
  ) {
    if (this._access.IsAllowed(39, 2, '', '')) { 
      this.isCreateAccessDisabled = false;
    }
    
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith<string | EmpInfoModel>(''),
        map(value => typeof value === 'string' ? value : value?.frsT_NM || ''),
        map(name => name ? this._filter(name) : this.empinfo.slice())
      );
  }

  ngOnInit() {
    this.LoadData();
    this.LoadRolesLookup(); 
    
    // Reset layout condition flag on search initialization
    this.myControl.valueChanges.subscribe(() => {
      this.isDetailsLoaded = false;
    });

    if (this._util.getMonthAbr(new Date().getMonth()) == "Jan") {
      this.crispMonth = "Dec";
    }
    else
      this.crispMonth = this._util.getMonthAbr(new Date().getMonth() - 1);

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith<string | EmpInfoModel>(''),
        map(value => typeof value === 'string' ? value : value?.frsT_NM || ''),
        map(name => name ? this._filter(name) : this.empinfo.slice())
      );
  }

  private _filter(value: string): EmpInfoModel[] {
    const filterValue = value.toLowerCase();
    return this.empinfo.filter(option => option.frsT_NM.toLowerCase().includes(filterValue));
  }

  displayFn(user?: EmpInfoModel): string {
    return user ? user.frsT_NM : '';
  }

  LoadData() {
    this.service_GetEmpInfo();
  }

  LoadRolesLookup() {
    this.rolesList = [
      { id: 1, name: 'Customer Success Manager' },
      { id: 2, name: 'Project Manager' },
      { id: 3, name: 'Team Member' },
      { id: 4, name: 'BU – Head IMS' },
      { id: 5, name: 'Customer' },
      { id: 6, name: 'PMO' },
      { id: 7, name: 'Quality' },
      { id: 8, name: 'Finance' },
      { id: 9, name: 'Functional Manager' },
      { id: 10, name: 'HR' },
      { id: 11, name: 'Account Manager' },
      { id: 12, name: 'Marketing' },
      { id: 13, name: 'GSLab' }
    ];
  }

  AddProject_OnClick() {
    if (this._access.IsAllowed(39, 2, '', '') && this.projId && this.myControl.value != null && this.myControl.value != "") {
      let pr: ProjectResourceModel = new ProjectResourceModel();
      pr.proJ_ID = this.projId;
      pr.emP_ID = this.myControl.value.emP_ID || '';
      pr.bilL_FLG = this.isProjResource === false ? false : this.isBillable;
      pr.curR_INDC = this.isProjResource === true ? 'Y' : 'N';
      pr.createD_BY = localStorage.getItem("empid") || '';
      pr.starT_DATE = this.startdate;
      pr.enD_DATE = this.enddate;
      this.service_checkIfResourceAlreadyExistsByDates(pr);
    }
    else {
      this._util.showWarningPopup("Please choose Resource Name, Customer and Project");
      return;
    }
  }

  // Modified: Explicitly handles displaying dropdown block on verification success
  GetDetails_Onclick() {
    if (this.myControl.value != null && this.myControl.value != "") {
      const selectedResource = this.myControl.value;
      this.service_GetProjectResourceByEmpId(selectedResource.emP_ID);
      
      // Map row elements and flip validation flag
      this.selectedRoleId = selectedResource.csM_TITLE_ID || 0;
      this.isDetailsLoaded = true; 
    }
    else {
      this._util.showWarningPopup("Please enter Resource Name");
      this.isDetailsLoaded = false;
      return;
    }
  }

  // Updates parameters via direct single object binding target mapping parameters
  UpdateResourceAdminDetails_OnClick() {
    if (this.myControl.value != null && this.myControl.value != "") {
      const empId = this.myControl.value.emP_ID;
      


      this._appservice.updateEmpInfo(empId, this.selectedRoleId).subscribe({
        next: (data) => {
          this._util.showSuccessPopup("Resource changes saved successfully!");
          this.myControl.value.csM_TITLE_ID = this.selectedRoleId;
        },
        error: (error) => { this._util.serviceError(error); }
      });
    }
  }

  DeleteRow_onClick(element: ProjectResourceByEmpIdModel): void {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete the record?'
      }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._appservice.deleteProjectResource(element).subscribe({
          next: (data) => {
            this.service_GetProjectResourceByEmpId(this.myControl.value.emP_ID);
          },
          error: (error) => {
            this._util.serviceError(error);
          }
        });
      }
    });
  }

  EditRow_onClick(element: ProjectResourceByEmpIdModel): void {
    this.startdate = element.starT_DATE;
    this.enddate = element.enD_DATE;
    this.isProjResource = element.curR_INDC;
    this.isBillable = element.bilL_FLG;
    this._projectSelector.custId = element.cusT_ID;
    this._projectSelector.projId = element.proJ_ID;
  }

  service_AddProjectResource(pr: ProjectResourceModel) {
    this._appservice.addProjectResource(pr).subscribe({
      next: (data) => {
        this.service_GetProjectResourceByEmpId(this.myControl.value.emP_ID);
        this._util.showSuccessPopup("Project added successfully");
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  service_checkIfResourceAlreadyExistsByDates(prm: ProjectResourceModel) {
    this._appservice.checkIfResourceAlreadyExistsByDates(prm.proJ_ID, prm.emP_ID, prm.starT_DATE, prm.enD_DATE).subscribe({
      next: (data) => {
        if (data == null && this.errorStr == "") {
          this.service_AddProjectResource(prm);
          this.errorStr = "";
        }
      },
      error: (error) => {
        this._util.serviceError(error);
        this.errorStr = error.error;
        this._util.showWarningPopup(this.errorStr);
        this.errorStr = "";
      }
    });
  }

  ProcessPSA() {
    this._appservice.ProcessPSARequests().subscribe({
      next: (e) => { this._util.showSuccessPopup("done!"); },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  ProcessCrisp() {
    this._appservice.ProcessCrispScoresForPeriod(this.crispMonth, this.crispYear.toString(), true).subscribe({
      next: (e) => { this._util.showSuccessPopup("done!"); },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  ProcessExternalKPI() { }

  ProcessC() {
    this._appservice.ProcessCScoreForPeriod(this.crispMonth, this.year.toString(), true).subscribe({
      next: (e) => { this._util.showSuccessPopup("done!"); },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  ProcessCrispPM() {
    this._appservice.ProcessCrispScoresForPeriodPM(this.crispMonth, this.year.toString()).subscribe({
      next: (e) => { this._util.showSuccessPopup("done!"); },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  CreateNewProject() {
    this.AddNewProjectObj = new AddProjectsModel();
    this.AddNewProjectObj.proJ_ID = '201P000291-10';
    this.AddNewProjectObj.proJ_NM = 'test project Startup Audit';
    this.AddNewProjectObj.proJ_ALIAS_NM = '';
    this.AddNewProjectObj.cusT_ID = '201100010';
    this.AddNewProjectObj.proJ_PM_EMP_ID = '102802';
    this.AddNewProjectObj.createD_BY = '102802';
    this._appservice.addNewProject(this.AddNewProjectObj).subscribe({
      next: (data) => {
        this._util.showSuccessPopup("Project Added Successfully");
      },
      error: (error) => {
        this._util.serviceError(error);
        var getError = JSON.stringify(error);
        var getErrorJson = JSON.parse(getError);
        var getExactError = getErrorJson.error;

        if (getExactError.includes("Violation") && getExactError.includes("UNIQUE KEY") && 
            getExactError.includes("PROJ_NM") && getExactError.includes("Cannot insert duplicate key in object 'dbo.PROJECT'")) {
        }
        else if (getExactError.includes("Violation") && getExactError.includes("PRIMARY KEY constraint") && getExactError.includes("PROJECT_PK") && getExactError.includes("Cannot insert duplicate key in object 'dbo.PROJECT")) {
        }
      }
    });
  }

  GeneralMethod() {
    this._appservice.GeneralMethod().subscribe({
      next: (e) => { this._util.showSuccessPopup("done!"); },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetEmpInfo() {
    this._appservice.getEmpInfo().subscribe({
      next: (data) => { this.empinfo = data; },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetProjectResourceByEmpId(EmpId: string) {
    this._appservice.getProjectResourceByEmpId(EmpId).subscribe({
      next: (data) => {
        let tmpstrtDate: any;   
        let tmpEndDate: any;

        data.forEach((element: any) => {
          tmpstrtDate = element.starT_DATE;
          element.starT_DATE = tmpstrtDate.split('T')[0];

          tmpEndDate = element.enD_DATE;
          element.enD_DATE = tmpEndDate.split('T')[0];
        });

        this.projectResource = data;
        this.dataSource = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  project_onChange($event: string) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    this.service_GetProjEndDateByProjId(this.projId);
  }

  service_GetProjEndDateByProjId(pid: string) {
    this._appservice.GetProjEndDateByProjId(pid).subscribe({
      next: (data) => {
        let tmpEndDate: any = data.enD_DATE;          
        this.enddate = tmpEndDate.split('T')[0];
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }
}