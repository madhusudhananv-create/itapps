import { Component, OnInit, OnChanges, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { SubProjectModel } from '../../models/subproject-model';
import { ProjectResourceByEmpIdModel } from '../../models/emp-info-model';
import { SubProjectTaskModel } from '../../models/subproject-task-model';

@Component({
  selector: 'app-subproject',
  templateUrl: './subproject.component.html',
  styleUrls: ['./subproject.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule,
    DialogYesNoComponent
  ]
})
export class SubprojectComponent implements OnInit, OnChanges {
  @Input('ProjectId') input_projectid: string = '';
  @Input('CustomerId') input_customerid: string = '';
  bShowAddSubProject = false;
  newSubProject: SubProjectModel = new SubProjectModel(0, '');
  subProjects: SubProjectModel[] = [];
  projectResource: ProjectResourceByEmpIdModel[] = [];
  projectTasks: SubProjectTaskModel[] = [];
  responsibilityList: any;
  filteredProjectTasks: SubProjectTaskModel[] = [];
  selectedSubProject: SubProjectTaskModel | undefined;
  SubProjectId: string = "0";
  iEditIndex = -1;

  public _access = inject(AccessControl);
  public _util = inject(MyUtility);
  private _appservice = inject(AppsService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.LoadTask()
    if (this.input_projectid != undefined && this.input_projectid != '')
      this.service_getSubProjectTaskResponsibilityList(this.input_customerid, this.input_projectid);
    this.service_GetProjectResource(this.input_projectid);
    this.service_GetSubProjects(this.input_projectid)
  }
  ngOnChanges() {
    this.LoadTask()
    if (this.input_projectid != undefined && this.input_projectid != '')
      this.service_GetProjectResource(this.input_projectid);
    this.service_GetSubProjects(this.input_projectid)
    this.newSubProject = new SubProjectModel(0, '');
  }
  LoadTask() {
    this.service_GetProjectTask(this.input_projectid);
  }
  //General Methods
  SubProjectFilter_onChange() {
    if (this.SubProjectId === "0")
      this.filteredProjectTasks = this.projectTasks;
    else
      this.filteredProjectTasks = this.projectTasks.filter(t => t.subprojecT_ID === Number(this.SubProjectId));
  }
  GetSubProjectName(subprojecT_ID: number) {
    let subProjs = this.subProjects.filter(t => t.id === Number(subprojecT_ID));
    if (subProjs != undefined && subProjs.length > 0) {
      return subProjs[0].subprojecT_NM;
    }
    return '';
  }
  //Task calls
  EditTask_onClick(id: number) {
    this.iEditIndex = id;
  }
  AddTask_onClick() {
    this.filteredProjectTasks.push(new SubProjectTaskModel(Number(this.input_customerid), this.input_projectid, localStorage.getItem('empid') || ''));
    this.iEditIndex = this.filteredProjectTasks.length - 1;
  }
  DeleteTask_onClick(task: SubProjectTaskModel) {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Do you want to delete this task?'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.filteredProjectTasks.splice(this.filteredProjectTasks.indexOf(task), 1);
        if (task.id > 0) {
          //service call
          task.isactive = false;
          this.service_UpdateProjectTask(task);
        }
      }
    });
  }
  SaveTask_onClick(task: SubProjectTaskModel) {
    if (task.status == undefined || task.status == null) {
      this._util.showWarningPopup("Please select Status", "Validation Error");
      return;
    }
    if (task.description == undefined || task.description == null) {
      this._util.showWarningPopup("Please enter Description", "Validation Error");
      return;
    }
    if (task.completioN_PERCENT > 100) {
      task.completioN_PERCENT = 100;
      this._util.showWarningPopup("Completion Percentage cannot be more than 100", "Validation Error");
    }
    else {
      this.service_UpdateProjectTask(task);
      this.iEditIndex = -1;
    }
  }
  CancelTask_onClick() {
    this.iEditIndex = -1;
  }
  //subproject calls
  SubProject_onChange(subproj: SubProjectModel) {
    //this.newSubProject = subproj;
  }
  AddSubProject_onClick() {
    this.newSubProject = new SubProjectModel(Number(this.input_customerid), this.input_projectid);
    this.bShowAddSubProject = true;
  }
  SaveSubProject_onclick() {
    if (this.newSubProject.subprojecT_NM != undefined && this.newSubProject.objectives != undefined &&
        this.newSubProject.owneR_ID != undefined && this.newSubProject.subprojecT_NM != "" && 
        this.newSubProject.objectives != "" && this.newSubProject.owneR_ID != null) {
      this.service_AddSubProject(this.newSubProject);
    }
    else {
      this._util.showWarningPopup("Please enter required fields", "Validation Error");
      return;
    }
  }
  CancelSubProject_onclick() {
    this.newSubProject = new SubProjectModel(Number(this.input_customerid), this.input_projectid);
    this.bShowAddSubProject = false;
  }

  sanitizeTask(task: SubProjectTaskModel) {

    if (task.expecteD_START_DATE != undefined && task.expecteD_START_DATE != null)
      task.expecteD_START_DATE = this._util.setLocaleDate(task.expecteD_START_DATE);
    if (task.expecteD_END_DATE != undefined && task.expecteD_END_DATE != null)
      task.expecteD_END_DATE = this._util.setLocaleDate(task.expecteD_END_DATE);
    if (task.actuaL_START_DATE != undefined && task.actuaL_START_DATE != null)
      task.actuaL_START_DATE = this._util.setLocaleDate(task.actuaL_START_DATE);
    if (task.actuaL_END_DATE != undefined && task.actuaL_END_DATE != null)
      task.actuaL_END_DATE = this._util.setLocaleDate(task.actuaL_END_DATE);
  }
  //Service calls
  service_GetProjectTask(projId: string) {
    this._appservice.getProjectTask(projId)
      .subscribe({
        next: (data) => {
          this.projectTasks = data;
          this.filteredProjectTasks = data;
          this.SubProjectFilter_onChange();
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
  }
  service_UpdateProjectTask(task: SubProjectTaskModel) {
    this.sanitizeTask(task);
    this._appservice.updateProjectTask(task)
      .subscribe({
        next: (data) => {
          this.service_GetProjectTask(this.input_projectid);
          if(task.isactive!=false)
            this._util.showSuccessPopup("Saved Successfully", "Success");
          else
            this._util.showSuccessPopup("Deleted Successfully", "Success");
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
  }
  service_GetProjectResource(ProjId: string) {
    this._appservice.getProjectResourceByProjId(ProjId).subscribe({
      next: (data) => {
        this.projectResource = data;
        if(this.projectResource.length == 1){
          this.newSubProject.owneR_ID = Number(this.projectResource[0].emP_ID);
        }
        this.projectResource.sort(function (a, b) { return a.frsT_NM.localeCompare(b.frsT_NM) });
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }
  service_getSubProjectTaskResponsibilityList(custId: string, projId: string) {
    this._appservice.getSubProjectTaskResponsibilityList(custId, projId).subscribe({
      next: (data) => {
        this.responsibilityList = data;
        this.responsibilityList.sort(function (a: any, b: any) { return a.name.localeCompare(b.name) });
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }
  service_GetSubProjects(projid: string) {
    this._appservice.GetSubProjects(projid)
      .subscribe({
        next: (data) => {
          this.subProjects = data;
          if (this.subProjects.length > 0)
            this.newSubProject = this.subProjects[0];
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
  }
  service_AddSubProject(subproj: SubProjectModel) {
    this._appservice.AddSubProject(subproj)
      .subscribe({
        next: (data) => {
          this._util.showSuccessPopup("Updated Successfully", "Success");
          this.bShowAddSubProject = false;
          this.service_GetSubProjects(this.input_projectid);
          //this.newSubProject = subproj;
          //this.service_GetProjectTask(this.input_projectid)
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
  }
}
