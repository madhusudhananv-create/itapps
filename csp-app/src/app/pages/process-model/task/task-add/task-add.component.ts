import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { FormControl } from '@angular/forms';
import { TaskRecurrenceComponent } from '../../task/task-recurrence/task-recurrence.component';
import { TaskModel, RecurrenceModel, TaskTypeModel, TaskCategoryModel, Task_Audit_VM } from '../../../../models/task-model';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { RiskDetailsComponent } from '../../../../controls/risk-details/risk-details.component';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, NgModel, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Input } from '@angular/core';
import { TaskService } from '../task.service';
import { AuditScheduleModel } from '../../../../../app/models/audit-schedule-model';
import { EmpInfoModel } from '../../../../../app/models/emp-info-model';
import { ServiceAreaModelNew } from '../../../../../app/models/audit-checklist-based-model';
import { ServiceAreaProjectMappingModel } from '../../../../../app/models/service-area-project-mapping-model';
import { MatStepper } from '@angular/material/stepper';
import { ProcessModelService } from '../../process-model.service';
import { ChecklistExecutionComponent } from '../../checklist-execution/checklist-execution.component';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { AccessControl } from '../../../../Shared/accessControl';
import { CustomerProjectIds } from '../../../../models/customer-projects-model';
import { environment } from '../../../../../environments/environment';
// import { default as _rollupMoment} from 'moment';

//const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.scss'],

})
export class TaskAddComponent implements OnInit {
  @Input('task') inputTask: TaskModel;
  @Output() onSave: EventEmitter<string> = new EventEmitter<string>();
  TaskTypeList: TaskTypeModel[] = [];
  TaskCategoryList: TaskCategoryModel[] = [];
  collection = [{
    test1: "",
    test2: "",
    test3: "",
    test4: "",
  }]
  displayedColumns: string[] = ['position', 'Department', 'Reviewer', 'Audit', 'Step', 'Date'];
  dataSource = ELEMENT_DATA;
  name2: string;
  name3: string;
  show1: boolean = false;
  show2: boolean = false;
  show3: boolean = false;
  isLoaded: boolean = false;
  hours: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  minutes: number[] = [0, 15, 30, 45];

  top1 = new FormControl();
  topping1: string[] = [];
  Customer = new FormControl();
  CustomerList: string[] = ['option1', 'option2', 'option3', 'option4', 'option5', 'option6'];
  Project = new FormControl();
  ProjectList: string[] = ['optional', 'Selection customer', 'option3', 'option4', 'option5', 'option6'];
  Project2 = new FormControl();
  ProjectList2: string[] = ['1', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  Project3 = new FormControl();
  ProjectList3: string[] = ['Before', 'After'];
  auditTitles: string[] = [];
  Auditors: EmpInfoModel[] = [];
  Auditees: EmpInfoModel[] = [];
  serviceAreaList: ServiceAreaModelNew[] = [];
  serviceAreaProjectMappingList: ServiceAreaProjectMappingModel[] = [];

  selectedTaskType: string;
  allCust: Boolean = false;
  allProj: Boolean = false;

  taskAudit: Task_Audit_VM = new Task_Audit_VM();
  selectedTask: TaskModel = new TaskModel();
  isSubmit: boolean = true;
  eventStartDate: Date;
  eventEndDate: Date;
  tmpCustNM: string;
  tmpProjNM: string;
  isReScheduled: boolean = false;
  Customerids: any;
  Projectids: any;
  showServiceTower: boolean = false;
  filterAuditCategories: boolean = false;

  constructor(public _access: AccessControl, public _taskService: TaskService, private _appService: AppsService, public _util: myUtility, public dialog: MatDialog, private _processService: ProcessModelService) {
    if (this._access.IsAllowed(810, 1, '', ''))
      this.allCust = true;
    this.allProj = true;
  }

  ngOnInit() {
    this.service_GetTaskTypeList();
    this.service_GetTaskCategoryListByTaskType(99, this.filterAuditCategories);
    this.Service_getServiceAreaList();

  }

  ngOnChanges() {
    if (this._taskService.selectedTask.cusT_ID != undefined && this._taskService.selectedTask.cusT_ID != null
      && this._taskService.selectedTask.proJ_ID != undefined && this._taskService.selectedTask.proJ_ID != null) {
      this.service_getAuditeeDetails(this._taskService.selectedTask.cusT_ID, this._taskService.selectedTask.proJ_ID);
    }
    if (this._taskService.selectedTask.status != null && this._taskService.selectedTask.status != undefined)
      this.StatusChange(this._taskService.selectedTask.status)
    var empId = localStorage.getItem('empid');
    this._appService.GetDBConfigValue("ADDTASK_AllCustomers", -1, "").subscribe(data => {
      if (data.indexOf(empId) >= 0)
        this.allCust = true;
      else
        this.allCust = false;
    });
  }

  getCustomerAndProjects(event: CustomerProjectIds) {
    if (event.customer != undefined) {
      this.Customerids = event.customer;
    }
    if (event.project != undefined) {
      this.Projectids = event.project;
    }
  }

  tmpCustId;
  tmpProjId;
  project_onChange($event) {
    if (this._taskService.selectedTask.isAllDisabled) return;
    let obj: any = JSON.parse($event);
    if (obj == undefined || obj == null) return;
    this.tmpCustId = obj.customer;
    this.tmpProjId = obj.project;
    this.tmpCustNM = obj.customerName;
    this.tmpProjNM = obj.projectName;
    this._taskService.selectedTask.cusT_ID = obj.customer;
    this._taskService.selectedTask.proJ_ID = obj.project;
    this._taskService.selectedTask.proJ_NM = obj.projectName;
    this._taskService.selectedTask.cusT_NM = obj.customerName;
    //todo: add if here
    this._taskService.auditSchedule.cusT_ID = obj.customer;
    this._taskService.auditSchedule.proJ_ID = obj.project;

    this.service_getAuditorList(this._taskService.auditSchedule.cusT_ID, this._taskService.auditSchedule.proJ_ID);
    this.service_getAuditeeDetails(this._taskService.auditSchedule.cusT_ID, this._taskService.auditSchedule.proJ_ID);
    this._taskService.Service_GetServiceAreaProjectMapping(this._taskService.selectedTask.proJ_ID);
    if (this._taskService.selectedTask.status != null && this._taskService.selectedTask.status != undefined)
      this.StatusChange(this._taskService.selectedTask.status)
  }
  intialize() {

  }
  getMinDate(): Date {
    return this._taskService.selectedTask.scheduleD_START_DATE ? this._taskService.selectedTask.scheduleD_START_DATE : new Date();
  }

  getActualMinDate(): Date {
    return this._taskService.selectedTask.actuaL_START_DATE ? this._taskService.selectedTask.actuaL_START_DATE : new Date();
  }

  employeeSearch_onChange($event) {
    let obj = $event;
    this._taskService.selectedTask.assigneD_TO = obj;
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this._taskService.selectedTask.recurrence;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "800px";
    dialogConfig.height = "600px";

    const dialogRef = this.dialog.open(TaskRecurrenceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  toggleShow() {

    this._taskService.selectedTask.isMoredetailsShown = !this._taskService.selectedTask.isMoredetailsShown;
    if (this._taskService.selectedTask.isMoredetailsShown) {
      this._taskService.selectedTask.moreText = "Less Details....";
    }
    else {
      this._taskService.selectedTask.moreText = "More Details..."
    }
  }

  getMoreText() {
    return this._taskService.selectedTask.moreText;
  }

  StatusChange(value: string) {
    if (value.toLowerCase() == "re-schedule")
      this.isReScheduled = true;
    else
      this.isReScheduled = false;
  }

  SaveRow_onClick(status) {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (status) {
      this.taskAudit.iS_SUBMIT = false;
      this._taskService.selectedTask.iS_DRAFT = true;
    }
    else {
      this.taskAudit.iS_SUBMIT = true;
      this._taskService.selectedTask.iS_DRAFT = false;
    }

    if (this._taskService.selectedTask.seT_RECURRENCE) {
      this._taskService.selectedTask.recurrence.starT_DATE = this._util.setLocaleDate(this._taskService.selectedTask.recurrence.starT_DATE);
      this._taskService.selectedTask.recurrence.enD_DATE = this._util.setLocaleDate(this._taskService.selectedTask.recurrence.enD_DATE);

      const startDate = new Date(this._taskService.selectedTask.recurrence.starT_DATE);
      startDate.setMonth(startDate.getMonth() + 1);

      this._taskService.selectedTask.scheduleD_START_DATE = this._taskService.selectedTask.recurrence.starT_DATE;
      this._taskService.selectedTask.duE_DATE = startDate;
    }
    else {
      if (this._taskService.selectedTask.scheduleD_START_DATE != null)
        this._taskService.selectedTask.scheduleD_START_DATE = this._util.setLocaleDate(this._taskService.selectedTask.scheduleD_START_DATE);
      this._taskService.selectedTask.duE_DATE = this._util.setLocaleDate(this._taskService.selectedTask.duE_DATE);
      this._taskService.selectedTask.recurrence = null;
    }
    if (this._taskService.selectedTask.actuaL_START_DATE != null)
      this._taskService.selectedTask.actuaL_START_DATE = this._util.setLocaleDate(this._taskService.selectedTask.actuaL_START_DATE);
    if (this._taskService.selectedTask.actuaL_END_DATE != null)
      this._taskService.selectedTask.actuaL_END_DATE = this._util.setLocaleDate(this._taskService.selectedTask.actuaL_END_DATE);

    if (this._taskService.selectedTask.tasK_TYPE_ID == 1) {
      if (this._taskService.selectedTask.assigneD_TO == undefined || this._taskService.selectedTask.assigneD_TO == null)
        this._taskService.selectedTask.assigneD_TO = this._taskService.selectedTask.owner;
    }

    if ((specialCharPattern.test(this._taskService.selectedTask.description)) || numberPattern.test(this._taskService.selectedTask.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }
    if ((specialCharPattern.test(this._taskService.selectedTask.requiremenT_REFERENCE)) || numberPattern.test(this._taskService.selectedTask.requiremenT_REFERENCE)) {
      alert('Please enter alphanumeric or numeric values along with special characters for requirement reference');
      return;
    }
    if ((specialCharPattern.test(this._taskService.auditSchedule.comments)) || numberPattern.test(this._taskService.auditSchedule.comments)) {
      alert('Please enter alphanumeric or numeric values along with special characters for comments');
      return;
    }
    if (this._taskService.selectedTask.status == 'CANCELLED') {
      if (this._taskService.selectedTask.reasoN_FOR_CANCEL == null || this._taskService.selectedTask.reasoN_FOR_CANCEL == undefined || this._taskService.selectedTask.reasoN_FOR_CANCEL == "") {
        alert('Please enter reason for cancellation');
        return;
      }
    }
    if (this.IsValidForm()) {
      this.service_AddTask(this._taskService.selectedTask);
    }
  }

  Cancel_onClick() {
    this._taskService.selectedTask = new TaskModel();
    this._taskService.auditSchedule = new AuditScheduleModel();
    this._processService.stepper.selectedIndex = 0;
    this._taskService.selectedTask.isEmpSelVisible = false;
    this._processService.stepper.previous();
    this._processService.stepper.previous();
  }

  emitChanges() {
    this.onSave.emit('test');
  }

  reminder_OnClick() {

  }
  ddTaskType_OnChange() {
    this._taskService.selectedTask.isTask = this._taskService.selectedTask.tasK_TYPE_ID == 2;
    this.service_GetTaskCategoryListByTaskType(this._taskService.selectedTask.tasK_TYPE_ID, this.filterAuditCategories);
    this.ddCategory_OnChange();
  }

  ddCategory_OnChange() {
    if (this._taskService.selectedTask.tasK_CATEGORY_ID != undefined && this._taskService.selectedTask.tasK_CATEGORY_ID != null)
      this.taskAudit.tasK_CATEGORY_TITLE = this.TaskCategoryList.filter((item) => item.id === this._taskService.selectedTask.tasK_CATEGORY_ID)[0].title;
    this._taskService.selectedTask.parenT_EVENT_ID = 0;
    if (this._taskService.selectedTask.tasK_TYPE_ID == 2 && this._taskService.selectedTask.tasK_CATEGORY_ID != undefined)
      this._taskService.GetEventListByCategory(this._taskService.selectedTask.tasK_CATEGORY_ID).subscribe(x => {
        var empId = localStorage.getItem('empid');
        this._taskService.EventList = this._taskService.EventList.filter(e => e.owner == empId || e.assigneD_TO == empId);
      });
    this._taskService.selectedTask.isAudit = this._taskService.isAuditTask();
  }

  isDisabled() {
    return this._taskService.selectedTask != undefined && this._taskService.selectedTask.id > 0 &&
      this._taskService.selectedTask.iS_DRAFT;
  }

  changeResponsible() {
    if (!this._taskService.selectedTask.isAllDisabled)
      this._taskService.selectedTask.isEmpSelVisible = true;
  }

  GetServiceAreaTitle(id) {
    let weight = this.serviceAreaList.filter(t => t.id == id)
    if (weight.length > 0)
      return weight[0].title;
    else
      return '';
  }

  eventChange() {
    let event = this._taskService.EventList.filter(a => a.id == this._taskService.selectedTask.parenT_EVENT_ID)[0];
    if (event != null && event != undefined) {
      if (this._taskService.selectedTask.seT_RECURRENCE) {
        this.eventStartDate = event.recurrence.starT_DATE;
        this.eventEndDate = event.recurrence.enD_DATE;
      }
      else {
        // if(this._taskService.selectedTask.scheduleD_START_DATE == undefined || this._taskService.selectedTask.scheduleD_START_DATE == null)
        this._taskService.selectedTask.scheduleD_START_DATE = event.scheduleD_START_DATE;
        //if(this._taskService.selectedTask.duE_DATE == undefined || this._taskService.selectedTask.duE_DATE == null)
        this._taskService.selectedTask.duE_DATE = event.duE_DATE;
        this.eventStartDate = event.scheduleD_START_DATE;
        this.eventEndDate = event.duE_DATE;
      }
    }
  }

  recurrenceCheck(val) {
    this._taskService.selectedTask.isMoredetailsShown = true;
    if (!this._taskService.selectedTask.seT_RECURRENCE) {

      this._taskService.selectedTask.recurrence.starT_DATE = this._taskService.selectedTask.scheduleD_START_DATE;
      this._taskService.selectedTask.recurrence.enD_DATE = this._taskService.selectedTask.duE_DATE;
    }
    else {
      this._taskService.selectedTask.scheduleD_START_DATE = this._taskService.selectedTask.recurrence.starT_DATE;
      this._taskService.selectedTask.duE_DATE = this._taskService.selectedTask.recurrence.enD_DATE;
    }
  }

  isTaskSubmissionDisabled() {
    if ((!this.isSubmit || this._taskService.selectedTask.status === 'COMPLETED') && this._taskService.selectedTask.tasK_CATEGORY_ID != 16) {
      return true;
    }
    else {
      return false;
    }
  }

  getStatusDisabled(item) {
    //add other applicable types
    if (this._taskService.selectedTask.tasK_CATEGORY_ID == 16) {
      if (this._taskService.selectedTask.status === 'COMPLETED' || this._taskService.selectedTask.status === 'CANCELLED') {
        return true;
      } else return false;
    }

    if (this._taskService.selectedTask.status === 'COMPLETED' || this._taskService.selectedTask.status === 'CANCELLED') {
      return true;
    }

    if (item.value == 'CANCELLED' || item.value == 'RE-SCHEDULE') return false;
    return true;
  }

  IsValidForm(): boolean {
    var empId = localStorage.getItem('empid');
    if (this.Auditees.length == 0)
      if (this._taskService.selectedTask.cusT_ID != undefined && this._taskService.selectedTask.cusT_ID != null
        && this._taskService.selectedTask.proJ_ID != undefined && this._taskService.selectedTask.proJ_ID != null)
        this.service_getAuditeeDetails(this._taskService.selectedTask.cusT_ID, this._taskService.selectedTask.proJ_ID);

    if (this._taskService.selectedTask.owner != empId && this._taskService.selectedTask.assigneD_TO != empId) {
      alert("Only the owner or responsible person can edit the task details.");
      return false;
    }
    let curDate = new Date();
    let isValid: boolean = false;
    if (this._taskService.selectedTask.tasK_TYPE_ID == undefined) { alert("Please select Type"); return false; }
    else if (this._taskService.selectedTask.tasK_CATEGORY_ID == undefined) { alert("Please select Category"); return false; }
    else if ((this._taskService.selectedTask.description == undefined || this._taskService.selectedTask.description == null) && this._taskService.selectedTask.iS_DRAFT == false) { alert("Please enter Description"); return false; }
    else if (this._taskService.selectedTask.scheduleD_START_DATE == undefined || this._taskService.selectedTask.scheduleD_START_DATE == null) { alert("Please select scheduled start date"); return false; }
    else if (this._taskService.selectedTask.seT_RECURRENCE && (this._taskService.selectedTask.recurrence.starT_DATE == undefined || this._taskService.selectedTask.recurrence.enD_DATE == undefined)) { alert("Please set start date and end date for recurring Event/Task"); return false; }
    else if (this._taskService.selectedTask.cusT_ID == undefined && !this.showServiceTower) { alert(`Please select a Customer. If Customer not applicable select ${environment.company_name} Internal.`); return false; }
    else
      isValid = true;

    if (this.showServiceTower) {
      if ((this.Customerids.length == 0 || this.Projectids.length == 0 || this.Projectids == undefined || this.Customerids == undefined)) {
        alert(`Please select a Customer and Project. If Customer not applicable select ${environment.company_name} Internal.`);
        return false;
      }
    }

    if (this._taskService.selectedTask.isAudit && !this._taskService.selectedTask.isAllDisabled && this._taskService.selectedTask.tasK_TYPE_ID == 2 && !this.showServiceTower && this._taskService.selectedTask.iS_DRAFT == false) {
      if (this._taskService.auditSchedule.auditoR_EMP_ID == undefined) { alert("Please select an Appraiser"); return false; }
      if (this._taskService.auditSchedule.auditeE_EMP_ID == undefined) { alert("Please select an Appraisee"); return false; }
    }
    if (this._taskService.selectedTask.status.toLowerCase() == "re-schedule") {
      if (this._taskService.selectedTask.reschedulE_DATE == null) { alert("Please enter Re-Scheduled Date"); return false; };
      if (this._taskService.selectedTask.reschedulE_REASON == null || this._taskService.selectedTask.reschedulE_REASON == "") { alert("Please enter Reason for Re-schedule"); return false; };
      if (this._taskService.selectedTask.reschedulE_REQUESTER == null) { alert("Please select Requester"); return false; }
    }
    // var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    // if (!(date_regex.test(this._taskService.selectedTask.duE_DATE.toString()))) {
    //   isValid= false;
    // }
    //angular.isDate(this._taskService.selectedTask.duE_DATE);
    // if (this._taskService.selectedTask.duE_DATE < new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0, 0))
    // {
    //   alert("Due Date cannot be in the past");
    //   isValid = false;
    // }

    // if (this._taskService.selectedTask.scheduleD_START_DATE != undefined && new Date( this._taskService.selectedTask.duE_DATE) < new Date(this._taskService.selectedTask.scheduleD_START_DATE))
    // {
    //       alert("Due Date should not be prior to Scheduled start date.");
    //       isValid = false;
    // }

    // if (!this._taskService.selectedTask.seT_RECURRENCE && this._taskService.selectedTask.scheduleD_START_DATE != undefined &&
    //   this._taskService.selectedTask.scheduleD_START_DATE != null &&
    //   this._taskService.selectedTask.scheduleD_START_DATE < new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0, 0)) {
    //   alert("Start Date cannot be in the past 1");
    //   isValid = false;
    // }

    // if (this._taskService.selectedTask.seT_RECURRENCE && this._taskService.selectedTask.recurrence.starT_DATE != undefined &&
    //   this._taskService.selectedTask.recurrence.starT_DATE != null &&
    //   new Date(this._taskService.selectedTask.recurrence.starT_DATE) < new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0, 0)) {
    //   alert("Start Date cannot be in the past");
    //   isValid = false;
    // }


    if (!this._taskService.selectedTask.seT_RECURRENCE && this._taskService.selectedTask.scheduleD_START_DATE != null && this._taskService.selectedTask.scheduleD_START_DATE != undefined
      && this._taskService.selectedTask.duE_DATE != null && this._taskService.selectedTask.duE_DATE != undefined) {
      if (new Date(this._taskService.selectedTask.scheduleD_START_DATE) > new Date(this._taskService.selectedTask.duE_DATE)) {
        alert("Please enter Scheduled Start Date less than or equal to Due Date");
        isValid = false;
      }
    }

    if (this._taskService.selectedTask.seT_RECURRENCE && this._taskService.selectedTask.recurrence.starT_DATE != null && this._taskService.selectedTask.recurrence.starT_DATE != undefined
      && this._taskService.selectedTask.recurrence.enD_DATE != null && this._taskService.selectedTask.recurrence.enD_DATE != undefined) {
      if (new Date(this._taskService.selectedTask.recurrence.starT_DATE) > new Date(this._taskService.selectedTask.recurrence.enD_DATE)) {
        alert("Please enter Start Date less than or equal to Due Date");
        isValid = false;
      }
    }

    if (this._taskService.selectedTask.actuaL_START_DATE != null && this._taskService.selectedTask.actuaL_START_DATE != undefined
      && this._taskService.selectedTask.actuaL_END_DATE != null && this._taskService.selectedTask.actuaL_END_DATE != undefined) {
      if (new Date(this._taskService.selectedTask.actuaL_START_DATE) > new Date(this._taskService.selectedTask.actuaL_END_DATE)) {
        alert("Please enter Actual Start Date less than or equal to Due Date");
        isValid = false;
      }
    }

    //validations for events linked
    if (this._taskService.selectedTask.isTask && this._taskService.selectedTask.parenT_EVENT_ID > 0) {
      let event = this._taskService.EventList.filter(a => a.id == this._taskService.selectedTask.parenT_EVENT_ID)[0];

      if (event != null && event != undefined) {
        if (event.scheduleD_START_DATE != undefined && this._taskService.selectedTask.scheduleD_START_DATE != undefined
          && new Date(this._taskService.selectedTask.scheduleD_START_DATE) < new Date(event.scheduleD_START_DATE)) {
          isValid = false;
          alert("Task Scheduled Start Date cannot be before Event Start Date");
        }

        if (new Date(this._taskService.selectedTask.duE_DATE) > new Date(event.duE_DATE)) {
          isValid = false;
          alert("Task Due Date cannot be after Event Due Date");
        }
      }

    }
    //validations for assigned to
    //   if(this._taskService.selectedTask.assigneD_TO!=null && this._taskService.selectedTask.tasK_TYPE_ID==2 && !this._taskService.isAuditTask())
    //   {
    //      let allowed = this.Auditees.filter(x=>x.emP_ID.toString()  == this._taskService.selectedTask.assigneD_TO) ;
    //      if(allowed.length==0)
    //      {
    //         isValid= false;
    //     alert("Event/Task cannot be assigned to a resource not belonging to Project")

    //   }
    // }
    //all validations for recurrence tasks
    if (this._taskService.selectedTask.seT_RECURRENCE) {
      // if(this._taskService.selectedTask.scheduleD_START_DATE == undefined)
      // {
      //   isValid= false;
      //   alert("Scheduled Start Date is mandatory for Recurrent task")
      // }
      // if(this._taskService.selectedTask.scheduleD_START_DATE!= undefined
      //   && this._taskService.selectedTask.recurrence.starT_DATE!=undefined
      //   && new Date(this._taskService.selectedTask.recurrence.starT_DATE.getFullYear(),
      //   this._taskService.selectedTask.recurrence.starT_DATE.getMonth(), this._taskService.selectedTask.recurrence.starT_DATE.getDay())
      //   < new Date(this._taskService.selectedTask.scheduleD_START_DATE.getFullYear(),
      //   this._taskService.selectedTask.scheduleD_START_DATE.getMonth(), this._taskService.selectedTask.scheduleD_START_DATE.getDay()))
      //   {
      //       isValid=false;
      //       alert("Recurring Start date cannot be before Scheduled Start Date");

      //   }
      if (this._taskService.selectedTask.recurrence != null) {
        let rec = this._taskService.selectedTask.recurrence;
        if (this._taskService.selectedTask.recurrence.frequency == "Daily") {
          if (!rec.dailY_IS_MONDAY && !rec.dailY_IS_TUESDAY && !rec.dailY_IS_WEDNESDAY && !rec.dailY_IS_THURSDAY
            && !rec.dailY_IS_FRIDAY && !rec.dailY_IS_SATURDAY && !rec.dailY_IS_SUNDAY) {
            alert("Please select day option to continue.")
            isValid = false;
          }
        }
        else if (this._taskService.selectedTask.recurrence.frequency == "Weekly") {
          if (rec.weeklY_SELECTED_DAY == undefined || rec.weeklY_SELECTED_DAY == null) {
            alert("Please select day option to continue");
            isValid = false;
          }
        }
        else if (this._taskService.selectedTask.recurrence.frequency == "Fortnightly") {
          if (rec.fortnightlY_SELECTED_DAY == undefined || rec.fortnightlY_SELECTED_DAY == null) {
            alert("Please select day option to continue");
            isValid = false;
          }
        }
        else if (this._taskService.selectedTask.recurrence.frequency == "Monthly") {
          if ((rec.monthlY_SELECTED_DAY == undefined || rec.monthlY_SELECTED_DAY == null)
            || (rec.monthlY_SKIP_DAYS == undefined || rec.monthlY_SKIP_DAYS == null)) {
            alert("Please select day option to continue");
            isValid = false;
          }
        }
        else if (this._taskService.selectedTask.recurrence.frequency == "Quarterly") {
          if ((rec.quarterlY_SELECTED_DAY == undefined || rec.quarterlY_SELECTED_DAY == null)
            || (rec.quarterlY_SKIP_DAYS == undefined || rec.quarterlY_SKIP_DAYS == null)) {
            alert("Please select day option to continue");
            isValid = false;
          }
        }
        else if (this._taskService.selectedTask.recurrence.frequency == "HalfYearly") {
          if ((rec.biannuaL_FIRST_SKIP_DAYS == undefined || rec.biannuaL_FIRST_SKIP_DAYS == null)
            || (rec.biannuaL_FIRST_SELECTED_DAY == undefined || rec.biannuaL_FIRST_SELECTED_DAY == null)) {
            alert("Please select day option to continue");
            isValid = false;
          }
        }
        else if (this._taskService.selectedTask.recurrence.frequency == "Annual") {
          if ((rec.annuaL_SELECTED_DAY == undefined || rec.annuaL_SELECTED_DAY == null)
            || (rec.annuaL_SKIP_DAYS == undefined || rec.annuaL_SKIP_DAYS == null)) {
            alert("Please select day option to continue");
            isValid = false;
          }
        }
      }
    }

    return isValid;
  }

  service_GetTaskTypeList() {
    this._taskService.GetTaskTypeList().subscribe(data => {
      this.TaskTypeList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_GetTaskCategoryListByTaskType(taskTypeId, filterAuditCategories) {
    this._taskService.GetTaskCategoryListByTaskType(taskTypeId, filterAuditCategories).subscribe(data => {
      this.TaskCategoryList = data;
    }, error => { this._util.serviceError(error); });
  }

  service_AddTask(task: TaskModel) {
    let obj = new CustObj();
    this.taskAudit.task = this._taskService.selectedTask;
    this.taskAudit.audit = this._taskService.auditSchedule;
    this.taskAudit.audit.cusT_ID = this._taskService.selectedTask.cusT_ID;
    this.taskAudit.audit.proJ_ID = this._taskService.selectedTask.proJ_ID;
    if (this.showServiceTower) {
      this.taskAudit.proJ_IDS = [];
      if (this.Projectids[0] != "-1") {
        this.taskAudit.proJ_IDS = this.Projectids;
      }
      else {
        this.Projectids.splice(0, 1);
        this.taskAudit.proJ_IDS = this.Projectids;
      }
    }
    this.taskAudit.proJ_NM = this._taskService.selectedTask.proJ_NM;
    this.taskAudit.audit.scheduleD_DATE = this._taskService.selectedTask.duE_DATE;
    this.taskAudit.audit.title = this._taskService.selectedTask.description;
    this.taskAudit.audit.scheduleD_DURATION = 0;
    this.taskAudit.audit.actuaL_DURATION = 0;
    this.taskAudit.isAudit = this._taskService.isAuditTask();
    this.taskAudit.reasoN_FOR_CANCEL = this._taskService.selectedTask.reasoN_FOR_CANCEL
    this.isSubmit = false;
    if (this.taskAudit.task.status.toLowerCase() != "re-schedule") {
      this.taskAudit.task.reschedulE_DATE = null;
      this.taskAudit.task.reschedulE_REASON = null;
      this.taskAudit.task.reschedulE_REQUESTER = null;
    } else {
      this._taskService.selectedTask.reschedulE_DATE = this._util.setLocaleDate(this._taskService.selectedTask.reschedulE_DATE);
    }
    if (this._taskService.selectedTask.tasK_CATEGORY_ID != undefined && this._taskService.selectedTask.tasK_CATEGORY_ID != null)
      this.taskAudit.tasK_CATEGORY_TITLE = this.TaskCategoryList.filter((item) => item.id === this._taskService.selectedTask.tasK_CATEGORY_ID)[0].title;
    this._taskService.addTaskandAudit(this.taskAudit).subscribe(data => {
      if (this._taskService.selectedTask.tasK_TYPE_ID == 2)
        alert("Task saved successfully");
      else if (this._taskService.selectedTask.tasK_TYPE_ID == 1)
        alert("Event saved successfully");
      this._taskService.selectedTask = new TaskModel();
      this._taskService.auditSchedule = new AuditScheduleModel();
      this._processService.stepper.selectedIndex = 0;
      this._taskService.selectedTask.isEmpSelVisible = false;
      this.isSubmit = true;
      this.showSingleSelect();
      this.project_onChange(null);
    }, error => { this._util.serviceError(error); this.isSubmit = true });
  }

  dthours;
  dtminutes;
  dtampm;

  emitChangesnew(obj) {
    console.log("output event triggered");
  }

  SaveAudit(taskid: number) {
    this._taskService.auditSchedule.cusT_ID = this._taskService.selectedTask.cusT_ID;
    this._taskService.auditSchedule.proJ_ID = this._taskService.selectedTask.proJ_ID;
    if (this.showServiceTower) {
      this.taskAudit.proJ_IDS = [];
      if (this.Projectids[0] != "-1") {
        this.taskAudit.proJ_IDS = this.Projectids;
      }
      else {
        this.Projectids.splice(0, 1);
        this.taskAudit.proJ_IDS = this.Projectids;
      }
    }
    this._taskService.auditSchedule.scheduleD_DATE = this._taskService.selectedTask.duE_DATE;
    this._taskService.auditSchedule.title = this._taskService.selectedTask.description;
    this._taskService.auditSchedule.tasK_ID = taskid;
    this._taskService.auditSchedule.scheduleD_DURATION = 0;
    this._taskService.auditSchedule.actuaL_DURATION = 0;
    this.service_addAuditSchedule(this._taskService.auditSchedule);
  }

  showMultiSelect() {
    this.showServiceTower = true;
  }

  showSingleSelect() {
    this.showServiceTower = false;
  }

  service_getAuditorList(customerId, projectId) {
    this._appService.getAuditorListNew(customerId, projectId).subscribe(data => {
      this.Auditors = data;
    }, error => { this._util.serviceError(error); });
  }
  service_getAuditeeDetails(customerId, projectId) {
    this._appService.getAuditeeDetails(customerId, projectId, false).subscribe(data => {
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
      this._taskService.auditSchedule = data;
    }, error => { this._util.serviceError(error); });
  }

  ChangeFrequency() {
    //alert("change Frequency");
  }

  IsDisabled(frequency) {
    if (this._taskService.selectedTask.recurrence.frequency != frequency)
      return true;
  }
  Weeks: keyValuePair[] = [
    { value: 1, viewValue: 'First' },
    { value: 2, viewValue: 'Second' },
    { value: 3, viewValue: 'Third' },
    { value: 4, viewValue: 'Fourth' },
    { value: 5, viewValue: 'Last' }
  ];

  WeekDays: Tool[] = [
    { value: 'Monday', viewValue: 'Monday' },
    { value: 'Tuesday', viewValue: 'Tuesday' },
    { value: 'Wednesday', viewValue: 'Wednesday' },
    { value: 'Thursday', viewValue: 'Thursday' },
    { value: 'Friday', viewValue: 'Friday' },
    { value: 'Saturday', viewValue: 'Saturday' },
    { value: 'Sunday', viewValue: 'Sunday' }
  ];
  Months: Tool[] = [
    { value: 'January', viewValue: 'January' },
    { value: 'February', viewValue: 'February' },
    { value: 'March', viewValue: 'March' },
    { value: 'April', viewValue: 'April' },
    { value: 'May', viewValue: 'May' },
    { value: 'June', viewValue: 'June' },
    { value: 'July', viewValue: 'July' },
    { value: 'August', viewValue: 'August' },
    { value: 'September', viewValue: 'September' },
    { value: 'October', viewValue: 'October' },
    { value: 'November', viewValue: 'November' },
    { value: 'December', viewValue: 'December' },
  ];
  priority: Tool[] = [
    { value: 'HIGH', viewValue: 'HIGH' },
    { value: 'MEDIUM', viewValue: 'MEDIUM' },
    { value: 'LOW', viewValue: 'LOW' }
  ];
  users2: Tool[] = [
    { value: 'option1-0', viewValue: 'option1' }

  ];
  users3: Tool[] = [
    { value: 'Rulelevel-0', viewValue: 'Rulelevel' },
    { value: 'Individuallevel -0', viewValue: 'Individuallevel ' }

  ];
  status: Tool[] = [
    { value: 'PLANNED', viewValue: 'PLANNED' },
    // { value: 'SCHEDULED', viewValue: 'SCHEDULED' },
    { value: 'IN PROGRESS', viewValue: 'IN PROGRESS' },
    { value: 'COMPLETED', viewValue: 'COMPLETED' },
    // { value: 'WAITING FOR OTHER PROCESS', viewValue: 'WAITING FOR OTHER PROCESS' },
    { value: 'CANCELLED', viewValue: 'CANCELLED' },
    { value: 'RE-SCHEDULE', viewValue: 'RE-SCHEDULE' }
  ];

  category: keyValuePair[] = [
    { value: 1, viewValue: 'Monthly Audit ' },
    { value: 2, viewValue: 'Health Check' }
  ];
}
const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, Department: '', Reviewer: '', Audit: '', Step: '', Date: '' },
  { position: 2, Department: '', Reviewer: '', Audit: '', Step: '', Date: '' },
  { position: 3, Department: '', Reviewer: '', Audit: '', Step: '', Date: '' },

];

export interface Tool {
  value: string;
  viewValue: string;

}
export interface keyValuePair {
  value: number;
  viewValue: string;
}

export interface PeriodicElement {
  Department: string;
  position: number;
  Reviewer: string;
  Audit: string;
  Step: string;
  Date: string;

}

export class CustObj {
  custid: string;
  projid: string;
}
