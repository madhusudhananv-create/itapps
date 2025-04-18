import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { TaskGroupsModel, TaskModel, TaskTypeModel, TaskCategoryModel, tasK_DETAILS, RecurrenceModel } from '../../../../models/task-model';
import { MatDialogConfig, MatDialog, MatStepper, MatSelect, MatOption } from '@angular/material';
import { TaskRecurrenceComponent } from '../task-recurrence/task-recurrence.component';
import { forEach } from '@angular/router/src/utils/collection';
import { Input } from '@angular/core';
import { TaskService } from '../task.service';
import { KeyValuePairModel } from '../../../../models/key-value-pair-model';
import { formatDate } from "@angular/common";
import { stringify } from '@angular/compiler/src/util';
import { format } from 'util';
import { DateSelectionModel } from '../../../../models/DateSelection-model';
import { AuditScheduleModel } from '../../../../models/audit-schedule-model';

@Component({
  selector: 'app-task-planner',
  templateUrl: './task-planner.component.html',
  styleUrls: ['./task-planner.component.scss']
})
export class TaskPlannerComponent implements OnInit {
  @Input('stepper') stepper: MatStepper;
  TaskGroups: TaskGroupsModel = new TaskGroupsModel();
  TaskTypeList: TaskTypeModel[] = [];
  TaskCategoryList: TaskCategoryModel[] = [];
  masterTaskCategoryList: TaskCategoryModel[] = [];
  ProjectList: any;
  CustomerList: any;
  selectedTask: TaskModel = new TaskModel();
  selectedTaskType: number = 0;
  selectedTaskCategory: any;
  selectedProject: any;
  selectedCustomer: any;
  bShowSummary: boolean = false;
  selectedPeriod = "Yearly";
  currentYear: number = new Date().getFullYear();
  //filters
  custIds: string = "-1";
  projIds: string[] = [];
  bShowDateSelection1: Boolean = false;
  bShowDateSelection2: Boolean = false;
  bShowKPIDetails: Boolean = false;
  DateSelection1 = new DateSelectionModel(this._util);
  DateSelection2 = new DateSelectionModel(this._util);
  selectedQuarter = "Q1";
  dates: any[];
  startDate: any;
  endDate: any;
  months: any[];
  selectedMonth: number;
  selectView: string = "1";
  overallTaskDetails: any;
  masterProjectList: any;
  filteredProjectList: any;
  filteredCustomerList: any;
  filterAuditCategories: boolean = true;
  @ViewChild('TABLE') table: ElementRef;
  plannedAuditsCount: number;
  @ViewChild('categorySearchInput') categorySearchInput: ElementRef;
  @ViewChild('customerSearchInput') customerSearchInput: ElementRef;
  @ViewChild('projectSearchInput') projectSearchInput: ElementRef;
  @ViewChild('selectCustomer') selectCustomer: MatSelect;
  @ViewChild('allCustomerSelected') allCustomerSelected: MatOption;
  @ViewChild('selectProject') selectProject: MatSelect;
  @ViewChild('allProjectSelected') allProjectSelected: MatOption;
  @ViewChild('selectCategory') selectCategory: MatSelect;
  @ViewChild('allCategorySelected') allCategorySelected: MatOption;

  constructor(public _taskService: TaskService, private _appService: AppsService, private _util: myUtility, public dialog: MatDialog) { }

  ngOnInit() {
    this.selectedMonth = this._util.MonthCurrNum();
    this.selectedQuarter = this._util.getQuarter(this.selectedMonth);
    this.getInputDates();
    this.service_GetTaskDetails();
    this.service_GetTaskTypeList();
    this.service_GetTaskCategoryListByTaskType(99);
    this.LoadCustomerByEmpId();
    this.LoadProjects();
  }

  getInputDates() {
    this.currentYear = new Date().getFullYear();
    if (new Date().getMonth() < 4) {
      this.currentYear = this.currentYear - 1;
    }
    this.months = this._util.getmonthsBasedonYear(this.currentYear);
    let std = new Date(this.currentYear, 3, 1, 0, 0, 0, 0);
    let edd = new Date(this.currentYear + 1, 2, 31, 23, 59, 59, 0);
    this.startDate = formatDate(std, 'dd-MMM-yyyy', 'en-US');
    this.endDate = formatDate(edd, 'dd-MMM-yyyy', 'en-US');
  }

  changeView(selectedView) {
    this._taskService.plannedAuditsCount = 0;
    if (selectedView != "" && selectedView != null && selectedView != undefined && selectedView != 0) {
      this.selectView = selectedView;
    }
    this.btnClear_OnClick();
  }

  showSummary(task) {
    this.bShowSummary = true;
    this.selectedTask = task;
  }
  closeDialog() {
    this.bShowSummary = false;
  }
  changePeriod() {
    let range = this.selectedPeriod.substring(0, 1);
    if (range != "W") {
      if (range == 'Y') {
        this.startDate = new Date('1-Apr-' + this.currentYear);
        this.endDate = new Date('31-Mar-' + (this.currentYear + 1));
      }
      else if (range == 'Q') {
        this.dates = this._util.getDatesBasedOnQuarter(this.selectedQuarter, this.currentYear, this.selectedQuarter, this.startDate, this.endDate);
        this.startDate = this.dates[0].fromDate;
        this.endDate = this.dates[0].toDate;
      }
      else if (range == 'M') {
        this.getDatesOfTheMonth();
      }
    }
  }

  
  btnClear_OnClick() {
    const currentDate = new Date();
    this.currentYear = currentDate.getFullYear() - (currentDate.getMonth() < 4 ? 1 : 0);

    // Reset selections
    this.selectedTaskType = 0;
    this.selectedTaskCategory = 0;
    this.selectedTask = new TaskModel();
    this.selectedCustomer = [];
    this.selectedProject = [];
    this.ProjectList = [];
    this.filteredProjectList = [];

    // Deselect options in UI
    if (this.selectCustomer && this.selectCustomer.options) {
        this.selectCustomer.options.forEach(function (item) {
            item.deselect();
        });
    }
    
    if (this.selectProject && this.selectProject.options) {
        this.selectProject.options.forEach(function (item) {
            item.deselect();
        });
    }

    // Deselect "Select All" options
    if (this.allCustomerSelected) {
        this.allCustomerSelected.deselect();
    }
    
    if (this.allProjectSelected) {
        this.allProjectSelected.deselect();
    }

    // Fetch task details and update categories
    this.service_GetTaskDetails();
    this.selectAllCategory();
}


  MovePreviousYear() {
    this.currentYear--;
    this.changePeriod();
  }
  MoveNextYear() {
    this.currentYear++;
    this.changePeriod();
  }

  getOverallTaskDetails() {
    this._taskService.taskGroups = null;
    this.service_GetTaskDetailsWithFilters();
  }

  getDayPart(date) {
    if (date === undefined || date == null) return "-";
    return formatDate(date, 'dd/MM', 'en-US');
  }
  ddTaskType_OnChange() {
    this.service_GetTaskCategoryListByTaskType(this.selectedTaskType);
  }

  ddCustomer_OnChange() {
    this.selectedProject = [];
    if (this.selectedCustomer == "-1") {
      this.ProjectList = this.masterProjectList;
    }
    else {
      this.ProjectList = this.masterProjectList.filter(t => this.selectedCustomer.includes(t.cusT_ID));
      this.filteredProjectList = this.ProjectList;
    }
  }

  ExportToExcel() {
    let name = 'Task'
    this._util.exportToExcel(this.table.nativeElement, name)
  }

  toggleSelectionForCustomer() {
    if (this.allCustomerSelected.selected)
      this.selectCustomer.options.forEach((item: MatOption) => item.select());
    else
      this.selectCustomer.options.forEach((item: MatOption) => item.deselect());
  }

  customerTosslePerOne() {
    if (this.allCustomerSelected.selected) {
      this.allCustomerSelected.deselect();
      return false;
    }
    let count = 0;
    this.selectCustomer.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.CustomerList.length == count)
      this.allCustomerSelected.select();
  }

  toggleSelectionForProject() {
    if (this.allProjectSelected.selected)
      this.selectProject.options.forEach((item: MatOption) => item.select());
    else
      this.selectProject.options.forEach((item: MatOption) => item.deselect());
  }

  projectTosslePerOne() {
    if (this.allProjectSelected.selected) {
      this.allProjectSelected.deselect();
      return false;
    }
    let count = 0;
    this.selectProject.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.ProjectList.length == count)
      this.allProjectSelected.select();
  }

  toggleSelectionForCategory() {
    if (this.allCategorySelected.selected)
      this.selectCategory.options.forEach((item: MatOption) => item.select());
    else
      this.selectCategory.options.forEach((item: MatOption) => item.deselect());
  }

  categoryTosslePerOne() {
    if (this.allCategorySelected.selected) {
      this.allCategorySelected.deselect();
      return false;
    }
    let count = 0;
    this.selectCategory.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.TaskCategoryList.length == count)
      this.allCategorySelected.select();
  }

  Task_OnClick(task) {
    this._taskService.GetEventListByCategory(task.tasK_CATEGORY_ID);
    this._taskService.selectedTask = task;
    this._taskService.selectedTask.cusT_ID = task.cusT_ID;
    this._taskService.selectedTask.proJ_ID = task.proJ_ID;
    this._taskService.selectedTask.proJ_NM = task.proJ_NM;
    this._taskService.selectedTask.cusT_NM = task.cusT_NM;
    this._taskService.GetTaskDetailById(this._taskService.selectedTask.id).subscribe(a => {
      var empId = localStorage.getItem('empid');
      if (a.recurrence == undefined)
        a.recurrence = new RecurrenceModel();
      this._taskService.selectedTask = a;
      this._taskService.selectedTask.isNew = false;
      this._taskService.selectedTask.isTask = this._taskService.selectedTask.tasK_TYPE_ID === 2;
      this._taskService.selectedTask.isAudit = this._taskService.isAuditTask();
      let owner = this._taskService.selectedTask.owner == empId;
      let assigned = this._taskService.selectedTask.assigneD_TO == empId;
      if (this._taskService.selectedTask.status != null) {
        this._taskService.selectedTask.statuS_PREV = this._taskService.selectedTask.status;
        this._taskService.selectedTask.reschedulE_DATE_PREV = this._taskService.selectedTask.reschedulE_DATE;
        this._taskService.selectedTask.reschedulE_REASON_PREV = this._taskService.selectedTask.reschedulE_REASON;
        this._taskService.selectedTask.reschedulE_REQUESTER_PREV = this._taskService.selectedTask.reschedulE_REQUESTER;
      }
      this._taskService.selectedTask.isAllDisabled = this._taskService.selectedTask.status === "COMPLETED" || (!owner && !assigned);
      this._taskService.selectedTask.isOwner = owner;
      this._taskService.selectedTask.moreText = "More Details...";
      this._taskService.LoadServiceAreaProjectMapping();

      if (this._taskService.selectedTask.owner != undefined) {
        this._appService.getEmpNameById(this._taskService.selectedTask.owner).subscribe(
          data => {
            this._taskService.selectedTask.ownerName = data;
          },
          error => { this._util.serviceError(error); }
        )
      }

      if (this._taskService.selectedTask.assigneD_TO != undefined) {
        this._appService.getEmpNameById(this._taskService.selectedTask.assigneD_TO).subscribe(
          data => {
            this._taskService.selectedTask.empName = data;
          },
          error => { this._util.serviceError(error); }
        )
      }

      if (this._taskService.isAuditTask()) {
        this._taskService.GetAuditScheduleByTaskId(this._taskService.selectedTask.id).subscribe(a => {
          if (a == undefined) {
            this._taskService.auditSchedule = new AuditScheduleModel();
            this._taskService.auditSchedule.tasK_ID = this._taskService.selectedTask.id;
          }
          else
            this._taskService.auditSchedule = a
        });
      }
      else {
        this._taskService.auditSchedule = new AuditScheduleModel();
      }
    });

    if (task.status == "PLANNED") {
      this.stepper.next();
    }
    else if (task.status == "SCHEDULED") {
      this.stepper.next();
    }
    else if (task.status == "COMPLETED" || task.status == "IN PROGRESS") {
      this.stepper.next();
    }
    else {
      this.stepper.next();
    }
  }

  html = '<span class="btn btn-danger">Your HTML here</span>';
  getStatusAbr(str) {
    return str.charAt(0);
  }
  getStatusColor(str) {
    let sColor = "grey";
    if (str == "PLANNED")
      sColor = "rgb(148, 148, 249)";
    else if (str == "SCHEDULED")
      sColor = "orange"
    else if (str == "IN PROGRESS")
      sColor = "#30b8cc"
    else if (str == "COMPLETED")
      sColor = "#45cc45"
    return sColor;
  }
  getTooltip(task: tasK_DETAILS) {
    return task.status + " - " + task.tasK_CATEGORY + " - " + task.description;
  }
  getDateColor(str) {
    return this.getStatusColor(str);
  }
  service_GetTaskDetailsWithFilters() {
    this._taskService.params = [];
    this._taskService.params.push({ key: "StartDate", value: this.startDate });
    this._taskService.params.push({ key: "EndDate", value: this.endDate });
    if (this.selectedTaskType != 0 && this.selectedTaskType != undefined && this.selectedTaskType != null) {
      this._taskService.params.push({ key: "TASK_TYPE_ID", value: this.selectedTaskType.toString() });
    }
    if (this.selectedTaskCategory != 0 && this.selectedTaskCategory != undefined && this.selectedTaskCategory != null) {
      this._taskService.params.push({ key: "TASK_CATEGORY_ID", value: this.selectedTaskCategory.toString() });
    }
    else {
      alert("Please select Task Category");
      return false;
    }
    if (this.selectedCustomer.length > 0 && this.selectedCustomer != undefined && this.selectedCustomer != null) {
      this._taskService.params.push({ key: "CUST_ID", value: this.selectedCustomer.toString() });
    }
    else {
      alert("Please select any customer");
      return false;
    }
    if (this.selectedProject.length > 0 && this.selectedProject != undefined && this.selectedProject != null) {
      this._taskService.params.push({ key: "PROJ_ID", value: this.selectedProject.toString() });
      this._taskService.params.push({ key: "Range", value: this.selectedPeriod.substring(0, 1) });
      this._taskService.params.push({ key: "VIEW_BY", value: this.selectView.toString() });
    }
    else {
      alert("Please select any project");
      return false;
    }
    if (this.selectView == "1" && this._taskService.params.length >= 7 && this._taskService.params != null
      && this._taskService.params != undefined) {
      this._taskService.getTaskDetails();
    }
    else if (this.selectView == "2") {
      this.getTaskDetails();
    }
  }

  QuarterChange() {
    this.changePeriod();
  }

  MonthChange() {
    this.changePeriod();
  }

  getTaskDetails() {
    this._taskService.bProgress = true;
    this._taskService.GetTaskDetails(this._taskService.params).subscribe(data => {
      this.overallTaskDetails = data;
      this.calcListPlannedCount(this.overallTaskDetails);
      this._taskService.bProgress = false;
    }, error => {
      this._taskService.bProgress = false;
      this._util.serviceError(error);
    });
  }

  service_GetTaskDetails() {
    this._taskService.bProgress = true;
    let range = "Y";
    this.getInputDates();
    if (!this.selectedCustomer) {
      this.selectedCustomer = [];
    }

    // Clear project list if no customer is selected
    if (this.selectedCustomer.length === 0) {
      this.ProjectList = [];
    }
    this._taskService.GetTaskDetailsByDateRange(this.startDate, this.endDate, "-1", "-1", "-1", this.selectView, range).subscribe(data => {
      if (this.selectView == "1") {
        this._taskService.taskGroups = data;
        this.TaskGroups = data;
        let count = 0;

        for (const proj of this._taskService.taskGroups.projects) {
          for (const month of proj.groups) {
            for (const task of month.tasks) {
              if (task.status === 'PLANNED') {
                count++;
              }
            }
          }
        }
        this._taskService.plannedAuditsCount = count;

        //filter by Task Type
        if (this.selectedTaskType != undefined && this.selectedTaskType != 0) {
          for (let p of this._taskService.taskGroups.projects) {
            for (let q of p.groups) {
              q.tasks = q.tasks.filter(t => t.tasK_TYPE_ID === this.selectedTaskType);
            }
            p.groups = p.groups.filter(t => t.tasks.length > 0);
          }
          this._taskService.taskGroups.projects = this._taskService.taskGroups.projects.filter(t => t.groups.length > 0);


        }
        //filter by Task category
        if (this.selectedTaskCategory != undefined && this.selectedTaskCategory != 0) {
          for (let p of this._taskService.taskGroups.projects) {
            for (let q of p.groups) {
              q.tasks = q.tasks.filter(t => t.tasK_CATEGORY_ID === this.selectedTaskCategory);
            }
            p.groups = p.groups.filter(t => t.tasks.length > 0);
          }
          this._taskService.taskGroups.projects = this._taskService.taskGroups.projects.filter(t => t.groups.length > 0);
        }
      }
      else {
        this.overallTaskDetails = data;
        this.calcListPlannedCount(this.overallTaskDetails)
      }
      this._taskService.bProgress = false;
    }, error => {
      this._taskService.bProgress = false;
      this._util.serviceError(error);
    });
  }
  calcListPlannedCount(overallTaskDetails) {
    let count = 0;
    for (const proj of overallTaskDetails) {
      if (proj.audiT_STATUS === 'PLANNED') {
        count++;
      }
    }
    this._taskService.plannedAuditsCount = count;
  }

  LoadCustomerByEmpId() {
    const storedData = localStorage.getItem('slaAvailableList');
    const slaAvailableList = storedData ? JSON.parse(storedData) : [];

    this.CustomerList = slaAvailableList
      .map(t => ({ customerId: t.customerId, customerName: t.customerName }))
      .sort((a, b) => a.customerName.localeCompare(b.customerName))
      .filter((thing, i, arr) => {
        return arr.findIndex(t => t.customerId === thing.customerId && t.customerName === thing.customerName) === i;
      });
    this.filteredCustomerList = this.CustomerList;
  }

  LoadProjects() {
    this._appService.GetAllCustomerProjectsName().subscribe(data => {
      this.ProjectList = data;
      this.masterProjectList = data;
      this.filteredProjectList = data;
    }, error => { this._util.serviceError(error); });
  }

  service_GetTaskTypeList() {
    this._taskService.GetTaskTypeList().subscribe(data => {
      this.TaskTypeList = data;
      this.TaskTypeList.unshift(new TaskTypeModel());
    }, error => { this._util.serviceError(error); });
  }

  service_GetTaskCategoryListByTaskType(taskTypeId) {
    this._taskService.GetTaskCategoryListByTaskType(taskTypeId, this.filterAuditCategories).subscribe(data => {
      this.TaskCategoryList = data;
      this.masterTaskCategoryList = data;
      this.selectAllCategory();
    }, error => { this._util.serviceError(error); });
  }

  getDatesOfTheMonth() {
    this.startDate = new Date(this.currentYear, this.selectedMonth, 1);
    let nextMonth = Number.parseInt(this.selectedMonth.toString()) + 1;
    this.endDate = new Date(this.currentYear, nextMonth, 0);
  }

  resetCategoryFilterValue(opened: boolean) {
    this.categorySearchInput.nativeElement.value = '';
    this.applyFilterForCategory(this.categorySearchInput.nativeElement.value);
    if (this.allCategorySelected.selected) {
      this.selectCategory.options.forEach((item: MatOption) => item.select());
    }
    else {
      this.categoryTosslePerOne();
    }
  }
  selectAllCategory() {
    this.allCategorySelected.select();
    if (this.allCategorySelected.selected) {
      this.selectCategory.value = [-1];
      this.allCategorySelected.select();
      this.selectCategory.options.forEach((item: MatOption) => item.select());
    }
  }
  applyFilterForCategory(value: string) {
    let filteredCategory = [];
    if (this.masterTaskCategoryList != null && this.masterTaskCategoryList.length > 0 && this.masterTaskCategoryList != undefined) {
      filteredCategory = this.masterTaskCategoryList.filter(item => item.title.toLowerCase().includes(value.toLowerCase()));
    }
    this.TaskCategoryList = filteredCategory;
  }

  resetCustomerFilterValue(opened: boolean) {
    this.customerSearchInput.nativeElement.value = '';
    this.applyFilterForCustomer(this.customerSearchInput.nativeElement.value);
    this.customerTosslePerOne();
  }

  applyFilterForCustomer(value: string) {
    let filteredCustomer = [];
    if (this.filteredCustomerList != null && this.filteredCustomerList.length > 0 && this.filteredCustomerList != undefined) {
      filteredCustomer = this.filteredCustomerList.filter(item => item.customerName.toLowerCase().includes(value.toLowerCase()));
      this.CustomerList = filteredCustomer;
    }
  }

  resetProjectFilterValue(opened: boolean) {
    this.projectSearchInput.nativeElement.value = '';
    this.applyFilterForProject(this.projectSearchInput.nativeElement.value);
    this.projectTosslePerOne();
  }

  applyFilterForProject(value: string) {
    let filteredProject = [];
    if (!value) {
      this.ProjectList = this.filteredProjectList;
    }
    else {
      if (this.masterProjectList != null && this.masterProjectList.length > 0 && this.masterProjectList != undefined) {
        filteredProject = this.masterProjectList.filter(item => item.proJ_NM.toLowerCase().includes(value.toLowerCase()));
        this.ProjectList = filteredProject;
      }
    }
  }
}
