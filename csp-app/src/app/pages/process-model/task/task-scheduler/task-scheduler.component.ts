import { Component, OnInit } from '@angular/core';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { EmpInfoModel } from '../../../../models/emp-info-model';
import { ServiceAreaProjectMappingModel } from '../../../../models/service-area-project-mapping-model';
import { ServiceAreaModelNew } from '../../../../models/audit-checklist-based-model';
import { AuditScheduleModel } from '../../../../models/audit-schedule-model';
import { Input } from '@angular/core';
import { TaskModel } from '../../../../models/task-model';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-scheduler',
  templateUrl: './task-scheduler.component.html',
  styleUrls: ['./task-scheduler.component.scss']
})
export class TaskSchedulerComponent implements OnInit {
  auditSchedule: AuditScheduleModel = new AuditScheduleModel();
  auditTitles: string[] = [];
  hours: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  minutes: number[] = [0, 15, 30, 45];
  Auditors: EmpInfoModel[] = [];
  Auditees: EmpInfoModel[] = [];
  serviceAreaList: ServiceAreaModelNew[] = [];
  serviceAreaProjectMappingList: ServiceAreaProjectMappingModel[] = [];
  taskCategory: string;

  dthours;
  dtminutes;
  dtampm;

  audiT_DATE;
  constructor(public _taskService: TaskService, private _appService: AppsService, private _util: myUtility) { }

  ngOnInit() {
    this.service_getAuditorList()
    this.Service_getServiceAreaList();
  }
  ngOnchanges() {
  }
  getTaskTypeName(taskTypeId) {
    let taskType = this._taskService.TaskTypeList.filter(t => t.id == taskTypeId)
    if (taskType.length > 0)
      return taskType[0].title;
    else
      return '';
  }
  getTaskCategoryName(taskCategoryId) {
    if(this._taskService.TaskCategoryList.length==0)
    {
      this._taskService.GetTaskCategoryList();
    }
    let taskCategory = this._taskService.TaskCategoryList.filter(t => t.id == taskCategoryId)
    if (taskCategory.length > 0)
      return taskCategory[0].title;
    else
      return '';
  }
  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.auditSchedule.cusT_ID = obj.customer;
    this.auditSchedule.proJ_ID = obj.project;
    this.service_getAuditeeDetails(this.auditSchedule.cusT_ID, this.auditSchedule.proJ_ID);
    //this.Service_GetServiceAreaProjectMapping(this.auditSchedule.proJ_ID);
  }
  SaveRow_onClick() {
    let dt = this.auditSchedule.scheduleD_DATE.toDateString();
    dt = dt + " " + this.dthours + ":" + this.dtminutes + " " + this.dtampm
    this.auditSchedule.scheduleD_DATE = new Date(dt);
    this.service_addAuditSchedule(this.auditSchedule);
    //
  }
  GetServiceAreaTitle(id) {
    let weight = this.serviceAreaList.filter(t => t.id == id)
    if (weight.length > 0)
      return weight[0].title;
    else
      return '';
  }
  service_getAuditorList() {
    this._appService.getAuditorList().subscribe(data => {
      this.Auditors = data;
    }, error => { this._util.serviceError(error); });
  }
  service_getAuditeeDetails(customerId, projectId) {
    this._appService.getAuditeeDetails(customerId, projectId).subscribe(data => {
      this.Auditees = data;
    }, error => { this._util.serviceError(error); });
  }
  Service_getServiceAreaList() {
    this._appService.getServiceAreaList().subscribe(data => {
      this.serviceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_addAuditSchedule(auditSchedule) {
    this._appService.addAuditSchedule(auditSchedule).subscribe(data => {
      this.auditSchedule = data;
    }, error => { this._util.serviceError(error); });
  }
}
