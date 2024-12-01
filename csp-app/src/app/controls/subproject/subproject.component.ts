import { Component, OnInit } from '@angular/core';
import { AccessControl } from '../../Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { SubProjectModel } from '../../models/subproject-model';
import { ProjectResourceByEmpIdModel } from '../../models/emp-info-model';
import { SubProjectTaskModel } from '../../models/subproject-task-model';
import { Input } from '@angular/core';
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-subproject',
  templateUrl: './subproject.component.html',
  styleUrls: ['./subproject.component.scss']
})
export class SubprojectComponent implements OnInit {
  @Input('ProjectId') input_projectid: string;
  @Input('CustomerId') input_customerid: string;
  bShowAddSubProject = false;
  newSubProject: SubProjectModel = new SubProjectModel(0, '');
  subProjects: SubProjectModel[] = [];
  projectResource: ProjectResourceByEmpIdModel[] = [];
  projectTasks: SubProjectTaskModel[] = [];
  responsibilityList: any;
  filteredProjectTasks: SubProjectTaskModel[] = [];
  selectedSubProject: SubProjectTaskModel;
  SubProjectId: string = "0";
  iEditIndex = -1;

  constructor(private _access: AccessControl, private _util: myUtility, private _appservice: AppsService) { }

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
  GetSubProjectName(subprojecT_ID) {
    let subProjs = this.subProjects.filter(t => t.id === Number(subprojecT_ID));
    if (subProjs != undefined && subProjs.length > 0) {
      return subProjs[0].subprojecT_NM;
    }
  }
  //Task calls
  EditTask_onClick(id) {
    this.iEditIndex = id;
  }
  AddTask_onClick() {
    this.filteredProjectTasks.push(new SubProjectTaskModel(Number(this.input_customerid), this.input_projectid, localStorage.getItem('empid')));
    this.iEditIndex = this.filteredProjectTasks.length - 1;
  }
  DeleteTask_onClick(task: SubProjectTaskModel) {
    if (confirm("Do you want to delete this task?")) {
      this.filteredProjectTasks.splice(this.filteredProjectTasks.indexOf(task), 1);
      if (task.id > 0) {
        //service call
        task.isactive = false;
        this.service_UpdateProjectTask(task);

      }
    }
  }
  SaveTask_onClick(task: SubProjectTaskModel) {
    if (task.status == undefined || task.status == null) {
      alert("Please select Status");
      return;
    }
    if (task.description == undefined || task.description == null) {
      alert("Please enter Dscription");
      return;
    }
    if (task.completioN_PERCENT > 100) {
      task.completioN_PERCENT = 100;
      alert("Completion Percentage cannot be more than 100");
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
  SubProject_onChange(subproj) {
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
      alert("Please enter required fields");
      return;
    }
  }
  CancelSubProject_onclick() {
    this.newSubProject = new SubProjectModel(Number(this.input_customerid), this.input_projectid);
    this.bShowAddSubProject = false;
  }

  sanitizeTask(task) {

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
  service_GetProjectTask(projId) {
    this._appservice.getProjectTask(projId)
      .subscribe(data => {
        this.projectTasks = data;
        this.filteredProjectTasks = data;
        this.SubProjectFilter_onChange();
      }, error => {
        this._util.serviceError(error);
      });
  }
  service_UpdateProjectTask(task) {
    this.sanitizeTask(task);
    this._appservice.updateProjectTask(task)
      .subscribe(data => {
        this.service_GetProjectTask(this.input_projectid);
        if(task.isactive!=false)
        alert("Saved Successfully");
        else
        alert ("Deleted Successfully")
      }, error => {
        this._util.serviceError(error);
      });
  }
  service_GetProjectResource(ProjId: string) {
    this._appservice.getProjectResourceByProjId(ProjId).subscribe(data => {
      this.projectResource = data;
      if(this.projectResource.length == 1){
        this.newSubProject.owneR_ID = Number(this.projectResource[0].emP_ID);
      }
      this.projectResource.sort(function (a, b) { return a.frsT_NM.localeCompare(b.frsT_NM) });
    }, error => { this._util.serviceError(error); });
  }
  service_getSubProjectTaskResponsibilityList(custId: string, projId: string) {
    this._appservice.getSubProjectTaskResponsibilityList(custId, projId).subscribe(data => {
      this.responsibilityList = data;
      this.responsibilityList.sort(function (a, b) { return a.name.localeCompare(b.name) });
    }, error => { this._util.serviceError(error); });
  }
  service_GetSubProjects(projid) {
    this._appservice.GetSubProjects(projid)
      .subscribe(data => {
        this.subProjects = data;
        if (this.subProjects.length > 0)
          this.newSubProject = this.subProjects[0];
      }, error => {
        this._util.serviceError(error);
      });
  }
  service_AddSubProject(subproj) {
    this._appservice.AddSubProject(subproj)
      .subscribe(data => {
        alert("Updated Successfully");
        this.bShowAddSubProject = false;
        this.service_GetSubProjects(this.input_projectid);
        //this.newSubProject = subproj;
        //this.service_GetProjectTask(this.input_projectid)
      }, error => {
        this._util.serviceError(error);
      });
  }
}
