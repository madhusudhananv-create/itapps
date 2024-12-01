import { Injectable } from '@angular/core';
import { TaskModel, TaskTypeModel, TaskCategoryModel, TaskGroupsModel, Task_Audit_VM } from '../../../models/task-model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { myUtility } from '../../../Shared/myUtility';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ServiceAreaProjectMappingModel, ServiceTowersProjectMappingModel } from '../../../models/service-area-project-mapping-model';
import { KeyValuePairModel } from '../../../models/key-value-pair-model';
import { AuditScheduleModel } from '../../../models/audit-schedule-model';
import { AppsService } from '../../../Services/apps.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  apiurl: string = '';
  apiurl_auth: string = '';
  selectedTask: TaskModel = new TaskModel();

  auditSchedule: AuditScheduleModel = new AuditScheduleModel();
  newTask: TaskModel = new TaskModel();
  params: KeyValuePairModel[] = [];
  taskGroups: TaskGroupsModel = new TaskGroupsModel();
  auditCategory: string[] = [];
  bProgress: boolean = false;
  plannedAuditsCount : number = 0;


  // Task_Audit_VM

  constructor(private _http: HttpClient, private _util: myUtility, private _appservice: AppsService) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;

    this._appservice.GetParametersByType('AUDIT_CATEGORY')
      .subscribe(
        data => {
          this.auditCategory = data.map(t => t.options);
        }, error => {
          this._util.serviceError(error);
        })

  }
  //Public variables
  TaskTypeList: TaskTypeModel[] = [];
  TaskCategoryList: TaskCategoryModel[] = [];
  EventList: TaskModel[] = [];
  serviceAreaProjectMappingList: ServiceTowersProjectMappingModel[] = [];
  //service calls
  LoadServiceAreaProjectMapping() {
    this.Service_GetServiceAreaProjectMapping(this.selectedTask.proJ_ID);
  }

  getTaskDetails() {
    this.bProgress = true;
    this.GetTaskDetails(this.params).subscribe(data => {
      this.taskGroups = data;

      let count = 0;

      for (const proj of this.taskGroups.projects) {
        for (const month of proj.groups) {
          for (const task of month.tasks) {
            if (task.status === 'PLANNED') {
              count++;
            }
          }
        }
      }
      this.plannedAuditsCount = count;
      this.bProgress = false;
    }, error => {
      this.bProgress = false;
      this._util.serviceError(error);
    });
  }

  isAuditTask() {
    if (this.selectedTask.tasK_TYPE_ID == undefined || this.selectedTask.tasK_CATEGORY_ID == undefined) return false;
    return this.selectedTask.tasK_TYPE_ID == 2 && this.auditCategory.filter(x => x == this.selectedTask.tasK_CATEGORY_ID.toString()).length > 0;
  }

  Service_GetServiceAreaProjectMapping(projectId) {
    this.getServiceTowersProjectMapping(projectId).subscribe(data => {
      this.serviceAreaProjectMappingList = data;
    }, error => { this._util.serviceError(error); });
  }
  getServiceTowersProjectMapping(
    projectId: string
  ): Observable<ServiceTowersProjectMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ServiceTowersProjectMappingModel[]>(
      this.apiurl + "/GetServiceTowersProjectMappingList?ProjectId=" + projectId,
      { headers: header }
    );
  }
  GetTaskTypeList(): Observable<TaskTypeModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    let result = this._http.get<TaskTypeModel[]>(this.apiurl + '/GetTaskTypeList', { headers: header });
    if (this.TaskTypeList.length == 0)
      result.subscribe(a => this.TaskTypeList = a);
    return result;
  }
  GetTaskCategoryList(): Observable<TaskCategoryModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    let result = this._http.get<TaskCategoryModel[]>(this.apiurl + '/GetTaskCategoryList', { headers: header });
    if (this.TaskCategoryList.length == 0)
      result.subscribe(a => this.TaskCategoryList = a);
    return result;
  }
  GetTaskCategoryListByTaskType(TaskTypeId, filterAuditCategories): Observable<TaskCategoryModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    return this._http.get<TaskCategoryModel[]>(this.apiurl + '/GetTaskCategoryListByTaskType?TaskTypeId=' 
    + TaskTypeId + "&filterAuditCategories=" + filterAuditCategories, { headers: header });
  }
  GetEventListByCategory(categoryId): Observable<TaskModel[]> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    var result = this._http.get<TaskModel[]>(this.apiurl + '/GetEventListByCategory?categoryId=' + categoryId, { headers: header });
    result.subscribe(a => this.EventList = a);
    return result;
  }

  GetAuditScheduleByTaskId(taskId): Observable<AuditScheduleModel> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    var result = this._http.get<AuditScheduleModel>(this.apiurl + '/GetAuditScheduleByTaskId?taskId=' + taskId, { headers: header });
    return result;
  }

  GetTaskDetailById(taskId): Observable<TaskModel> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    return this._http.get<TaskModel>(this.apiurl + '/GetTaskDetailById?taskId=' + taskId, { headers: header });
  }

  addTask(task: TaskModel): Observable<TaskModel> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.post<TaskModel>(this.apiurl + '/AddTask', task, { headers: header });
  }
  GetTaskDetailsByDateRange(startDate, endDate, customerId, projectId, taskCategory, selectView, range): Observable<TaskGroupsModel> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.get<TaskGroupsModel>(this.apiurl + '/GetTaskDetailsByDateRange?StartDate=' + startDate + '&EndDate=' + endDate +
      '&customerId=' + customerId + '&projectId=' + projectId + '&taskCategory=' + taskCategory + '&viewBy=' + selectView + '&viewType=' + range, { headers: header });
  }
  GetTaskDetails(params: KeyValuePairModel[]): Observable<TaskGroupsModel> {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.post<TaskGroupsModel>(this.apiurl + '/GetTaskDetails', params, { headers: header });
  }

  addTaskandAudit(taskAudit: Task_Audit_VM): Observable<Task_Audit_VM> {

    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
    return this._http.post<Task_Audit_VM>(this.apiurl + '/AddTaskandAudit', taskAudit, { headers: header });
  }

}
