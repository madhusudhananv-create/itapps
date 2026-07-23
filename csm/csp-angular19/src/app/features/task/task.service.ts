import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { 
  TaskModel, 
  TaskTypeModel, 
  TaskCategoryModel, 
  TaskGroupsModel, 
  Task_Audit_VM,
  AuditScheduleModel 
} from '../../core/models/task-model';
import { MyUtility } from '../../shared/my-utility';
import { environment } from '../../../environments/environment';
import { ServiceTowersProjectMappingModel } from '../../core/models/service-area-project-mapping-model';
import { KeyValuePairModel } from '../../core/models/key-value-pair-model';
import { AppsService } from '../../core/services/apps.service';

/**
 * Task Service - Handles all task-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Injected dependencies
  private _http = inject(HttpClient);
  private _util = inject(MyUtility);
  private _appservice = inject(AppsService);

  // API URLs
  apiurl: string = '';
  apiurl_auth: string = '';

  // Public properties
  selectedTask: TaskModel = new TaskModel();
  auditSchedule: AuditScheduleModel = new AuditScheduleModel();
  newTask: TaskModel = new TaskModel();
  params: KeyValuePairModel[] = [];
  taskGroups: TaskGroupsModel = new TaskGroupsModel();
  auditCategory: string[] = [];
  bProgress: boolean = false;
  plannedAuditsCount: number = 0;

  TaskTypeList: TaskTypeModel[] = [];
  TaskCategoryList: TaskCategoryModel[] = [];
  EventList: TaskModel[] = [];
  serviceAreaProjectMappingList: ServiceTowersProjectMappingModel[] = [];

  constructor() {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;

    // Only load audit categories if user is logged in
    // This prevents 401 errors when accessing pages without authentication
    if (this._util.IsLoggedIn()) {
      this._appservice.GetParametersByType('AUDIT_CATEGORY').subscribe({
        next: (data) => {
          this.auditCategory = data.map(t => t.options);
        },
        error: (error) => {
          // Only show error if it's not an auth issue
          if (error.status !== 401) {
            this._util.serviceError(error);
          } else {
            console.warn('Cannot load audit categories - user not authenticated');
          }
        }
      });
    } else {
      console.warn('TaskService: User not logged in. Skipping audit category load for development/testing.');
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token,
      'empId': localStorage.getItem('empid') || ''
    });
  }

  /**
   * Load service area project mapping
   */
  LoadServiceAreaProjectMapping() {
    this.Service_GetServiceAreaProjectMapping(this.selectedTask.proJ_ID);
  }

  /**
   * Get task details with progress tracking
   */
  getTaskDetails() {
    this.bProgress = true;
    this.GetTaskDetails(this.params).subscribe({
      next: (data) => {
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
      },
      error: (error) => {
        this.bProgress = false;
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Check if task is an audit task
   */
  isAuditTask(): boolean {
    if (this.selectedTask.tasK_TYPE_ID == undefined || this.selectedTask.tasK_CATEGORY_ID == undefined) {
      return false;
    }
    return this.selectedTask.tasK_TYPE_ID == 2 && 
           this.auditCategory.filter(x => x == this.selectedTask.tasK_CATEGORY_ID.toString()).length > 0;
  }

  /**
   * Get service area project mapping
   */
  Service_GetServiceAreaProjectMapping(projectId: any) {
    this.getServiceTowersProjectMapping(projectId).subscribe({
      next: (data) => {
        this.serviceAreaProjectMappingList = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get service towers project mapping list
   */
  getServiceTowersProjectMapping(projectId: string): Observable<ServiceTowersProjectMappingModel[]> {
    const headers = this.getAuthHeaders();
    return this._http.get<ServiceTowersProjectMappingModel[]>(
      `${this.apiurl}/GetServiceTowersProjectMappingList?ProjectId=${projectId}`,
      { headers }
    );
  }

  /**
   * Get task type list
   */
  GetTaskTypeList(): Observable<TaskTypeModel[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token
    });
    return this._http.get<TaskTypeModel[]>(`${this.apiurl}/GetTaskTypeList`, { headers });
  }

  /**
   * Get task category list
   */
  GetTaskCategoryList(): Observable<TaskCategoryModel[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token
    });
    return this._http.get<TaskCategoryModel[]>(`${this.apiurl}/GetTaskCategoryList`, { headers });
  }

  /**
   * Get task category list by task type
   */
  GetTaskCategoryListByTaskType(TaskTypeId: any, filterAuditCategories: any): Observable<TaskCategoryModel[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token
    });
    return this._http.get<TaskCategoryModel[]>(
      `${this.apiurl}/GetTaskCategoryListByTaskType?TaskTypeId=${TaskTypeId}&filterAuditCategories=${filterAuditCategories}`,
      { headers }
    );
  }

  /**
   * Get event list by category
   */
  GetEventListByCategory(categoryId: any): Observable<TaskModel[]> {
    const headers = this.getAuthHeaders();
    const result = this._http.get<TaskModel[]>(
      `${this.apiurl}/GetEventListByCategory?categoryId=${categoryId}`,
      { headers }
    );
    result.subscribe(a => this.EventList = a);
    return result;
  }

  /**
   * Get audit schedule by task ID
   */
  GetAuditScheduleByTaskId(taskId: any): Observable<AuditScheduleModel> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token
    });
    return this._http.get<AuditScheduleModel>(
      `${this.apiurl}/GetAuditScheduleByTaskId?taskId=${taskId}`,
      { headers }
    );
  }

  /**
   * Get task detail by ID
   */
  GetTaskDetailById(taskId: any): Observable<TaskModel> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'token': this._util.AppSettings.token
    });
    return this._http.get<TaskModel>(
      `${this.apiurl}/GetTaskDetailById?taskId=${taskId}`,
      { headers }
    );
  }

  /**
   * Add new task
   */
  addTask(task: TaskModel): Observable<TaskModel> {
    const headers = this.getAuthHeaders();
    return this._http.post<TaskModel>(`${this.apiurl}/AddTask`, task, { headers });
  }

  /**
   * Get task details by date range
   */
  GetTaskDetailsByDateRange(
    startDate: any,
    endDate: any,
    customerId: any,
    projectId: any,
    taskCategory: any,
    selectView: any,
    range: any
  ): Observable<TaskGroupsModel> {
    const headers = this.getAuthHeaders();
    return this._http.get<TaskGroupsModel>(
      `${this.apiurl}/GetTaskDetailsByDateRange?StartDate=${startDate}&EndDate=${endDate}&customerId=${customerId}&projectId=${projectId}&taskCategory=${taskCategory}&viewBy=${selectView}&viewType=${range}`,
      { headers }
    );
  }

  /**
   * Get task details with parameters
   */
  GetTaskDetails(params: KeyValuePairModel[]): Observable<TaskGroupsModel> {
    const headers = this.getAuthHeaders();
    return this._http.post<TaskGroupsModel>(`${this.apiurl}/GetTaskDetails`, params, { headers });
  }

  /**
   * Add task and audit together
   */
  addTaskandAudit(taskAudit: Task_Audit_VM): Observable<Task_Audit_VM> {
    const headers = this.getAuthHeaders();
    return this._http.post<Task_Audit_VM>(`${this.apiurl}/AddTaskandAudit`, taskAudit, { headers });
  }
}
