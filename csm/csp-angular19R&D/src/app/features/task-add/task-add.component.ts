import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { TaskService } from '../task/task.service';
import { TaskModel, TaskTypeModel, TaskCategoryModel, Task_Audit_VM, AuditScheduleModel } from '../../core/models/task-model';
import { AppsService } from '../../core/services/apps.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { MyUtility } from '../../shared/my-utility';
import { ProjectSelectorComponent } from '../../shared/components/project-selector/project-selector.component';
import { ProjectSelectorMultipleComponent } from '../../components/project-selector-multiple/project-selector-multiple.component';
import { EmployeeSearchComponent } from '../../components/employee-search/employee-search.component';

interface PriorityOption {
  value: string;
  viewValue: string;
}

interface StatusOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-task-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatIconModule,
    MatRadioModule,
    ProjectSelectorComponent,
    ProjectSelectorMultipleComponent,
    EmployeeSearchComponent,
    DialogYesNoComponent
  ],
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.scss']
})
export class TaskAddComponent implements OnInit, OnChanges {
  @Input() task?: TaskModel;
  @Output() onSave = new EventEmitter<TaskModel>();
  @Output() onCancel = new EventEmitter<void>();

  // Injected services
  public taskService = inject(TaskService);
  public _appService = inject(AppsService);
  public _util = inject(MyUtility);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  TaskTypeList: TaskTypeModel[] = [];
  TaskCategoryList: TaskCategoryModel[] = [];
  customerList: any[] = [];
  projectList: any[] = [];
  Auditors: any[] = [];
  Auditees: any[] = [];
  serviceAreaList: any[] = [];
  
  priority: PriorityOption[] = [
    { value: 'HIGH', viewValue: 'HIGH' },
    { value: 'MEDIUM', viewValue: 'MEDIUM' },
    { value: 'LOW', viewValue: 'LOW' }
  ];

  statusOptions: StatusOption[] = [
    { value: 'PLANNED', viewValue: 'PLANNED' },
    { value: 'IN PROGRESS', viewValue: 'IN PROGRESS' },
    { value: 'COMPLETED', viewValue: 'COMPLETED' },
    { value: 'CANCELLED', viewValue: 'CANCELLED' },
    { value: 'RE-SCHEDULE', viewValue: 'RE-SCHEDULE' }
  ];

  Weeks: any[] = [
    { value: 1, viewValue: 'First' },
    { value: 2, viewValue: 'Second' },
    { value: 3, viewValue: 'Third' },
    { value: 4, viewValue: 'Fourth' },
    { value: 5, viewValue: 'Last' }
  ];

  WeekDays: any[] = [
    { value: 'Monday', viewValue: 'Monday' },
    { value: 'Tuesday', viewValue: 'Tuesday' },
    { value: 'Wednesday', viewValue: 'Wednesday' },
    { value: 'Thursday', viewValue: 'Thursday' },
    { value: 'Friday', viewValue: 'Friday' },
    { value: 'Saturday', viewValue: 'Saturday' },
    { value: 'Sunday', viewValue: 'Sunday' }
  ];

  Months: any[] = [
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
    { value: 'December', viewValue: 'December' }
  ];

  isSubmit: boolean = true;
  isLoading: boolean = false;
  showMoreDetails: boolean = false;
  showServiceTower: boolean = false;
  allCust: boolean = false;
  allProj: boolean = true;
  tmpCustNM: string = '';
  tmpProjNM: string = '';
  eventStartDate: Date | undefined;
  eventEndDate: Date | undefined;
  Customerids: any;
  Projectids: any;
  taskAudit: Task_Audit_VM = new Task_Audit_VM();
  
  // Form data - Use taskService.selectedTask as per legacy
  get selectedTask(): TaskModel {
    return this.taskService.selectedTask;
  }

  ngOnInit(): void {
    // Initialize "More Details" section as collapsed by default
    if (this.taskService.selectedTask.isMoredetailsShown === undefined) {
      this.taskService.selectedTask.isMoredetailsShown = false;
      this.taskService.selectedTask.moreText = "More Details...";
    }
    
    // Load task types and categories from API
    this.service_GetTaskTypeList();
    this.service_GetTaskCategoryListByTaskType(99, false);
    this.Service_getServiceAreaList();
    
    // Load customers if user has permission
    const empId = localStorage.getItem('empid') || '';
    this._appService.GetDBConfigValue("ADDTASK_AllCustomers", -1, "").subscribe(data => {
      if (data.indexOf(empId) >= 0) {
        this.allCust = true;
      } else {
        this.allCust = false;
      }
    });
    
    // Load employee name for new task (assigneD_TO defaults to current user)
    if (this.taskService.selectedTask.assigneD_TO && !this.taskService.selectedTask.empName) {
      this._appService.getEmpNameById(this.taskService.selectedTask.assigneD_TO).subscribe({
        next: (data) => {
          this.taskService.selectedTask.empName = data;
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
    }
    
    // Set isAudit flag immediately for audit type tasks (type 2)
    // Use == instead of === to handle both string and number values from dropdown
    if (this.taskService.selectedTask.tasK_TYPE_ID == 2) {
      this.taskService.selectedTask.isAudit = true;
      this.cdr.detectChanges();
    }
    
    // Load audit dropdowns data on init when customer and project are available
    if (this.taskService.selectedTask.cusT_ID != undefined && this.taskService.selectedTask.cusT_ID != null
      && this.taskService.selectedTask.proJ_ID != undefined && this.taskService.selectedTask.proJ_ID != null) {
      this.service_getAuditeeDetails(this.taskService.selectedTask.cusT_ID, this.taskService.selectedTask.proJ_ID);
      this.service_getAuditorList(this.taskService.selectedTask.cusT_ID, this.taskService.selectedTask.proJ_ID);
      this.taskService.Service_GetServiceAreaProjectMapping(this.taskService.selectedTask.proJ_ID);
    }
    
    // Load audit schedule if editing existing audit task
    if (this.taskService.selectedTask.id && 
        this.taskService.selectedTask.isAudit && 
        this.taskService.selectedTask.tasK_TYPE_ID === 2) {
      this.loadAuditSchedule(this.taskService.selectedTask.id);
    }
    
    // Apply status change effects if status is set
    if (this.taskService.selectedTask.status != null && this.taskService.selectedTask.status != undefined) {
      this.StatusChange(this.taskService.selectedTask.status);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set isAudit flag immediately when task type changes to 2
    // Use == instead of === to handle both string and number values
    if (this.taskService.selectedTask.tasK_TYPE_ID == 2) {
      this.taskService.selectedTask.isAudit = true;
      this.cdr.detectChanges();
    }
    
    // Load audit schedule if editing existing audit task
    if (this.taskService.selectedTask.id && 
        this.taskService.selectedTask.isAudit && 
        this.taskService.selectedTask.tasK_TYPE_ID === 2) {
      this.loadAuditSchedule(this.taskService.selectedTask.id);
    }
    
    // Load audit dropdowns data when customer and project are set
    if (this.taskService.selectedTask.cusT_ID != undefined && this.taskService.selectedTask.cusT_ID != null
      && this.taskService.selectedTask.proJ_ID != undefined && this.taskService.selectedTask.proJ_ID != null) {
      this.service_getAuditeeDetails(this.taskService.selectedTask.cusT_ID, this.taskService.selectedTask.proJ_ID);
      this.service_getAuditorList(this.taskService.selectedTask.cusT_ID, this.taskService.selectedTask.proJ_ID);
      
      // Load Service Tower list for the project
      this.taskService.Service_GetServiceAreaProjectMapping(this.taskService.selectedTask.proJ_ID);
    }
    if (this.taskService.selectedTask.status != null && this.taskService.selectedTask.status != undefined) {
      this.StatusChange(this.taskService.selectedTask.status);
    }
    
    // Load employee name for "Responsible for Execution" field
    if (this.taskService.selectedTask.assigneD_TO != undefined && this.taskService.selectedTask.assigneD_TO != null) {
      this._appService.getEmpNameById(this.taskService.selectedTask.assigneD_TO).subscribe({
        next: (data) => {
          this.taskService.selectedTask.empName = data;
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
    }
  }

  loadAuditSchedule(taskId: number): void {
    this.taskService.GetAuditScheduleByTaskId(taskId).subscribe({
      next: (data: any) => {
        if (data) {
          this.taskService.auditSchedule = data;
        }
      },
      error: (error: any) => {
        console.error('Error loading audit schedule:', error);
      }
    });
  }

  service_GetTaskTypeList(): void {
    this.taskService.GetTaskTypeList().subscribe({
      next: data => {
        this.TaskTypeList = data;
      },
      error: error => { 
        this._util.serviceError(error); 
      }
    });
  }

  service_GetTaskCategoryListByTaskType(taskTypeId: number, filterAuditCategories: boolean): void {
    this.taskService.GetTaskCategoryListByTaskType(taskTypeId, filterAuditCategories).subscribe({
      next: data => {
        this.TaskCategoryList = data;
      },
      error: error => { 
        this._util.serviceError(error); 
      }
    });
  }

  Service_getServiceAreaList(): void {
    this._appService.getServiceAreaList().subscribe({
      next: data => {
        this.serviceAreaList = data;
      },
      error: error => { 
        this._util.serviceError(error); 
      }
    });
  }

  service_getAuditorList(customerId: any, projectId: any): void {
    this._appService.getAuditorListNew(customerId, projectId).subscribe({
      next: (data: any) => {
        this.Auditors = data;
      },
      error: (error: any) => { 
        this._util.serviceError(error); 
      }
    });
  }

  service_getAuditeeDetails(customerId: any, projectId: any): void {
    this._appService.getAuditeeDetails(customerId, projectId, false).subscribe({
      next: data => {
        this.Auditees = data;
      },
      error: error => { 
        this._util.serviceError(error); 
      }
    });
  }

  ddTaskType_OnChange(): void {
    this.taskService.selectedTask.isTask = this.taskService.selectedTask.tasK_TYPE_ID == 2;
    // Set isAudit flag - use == to handle both string and number values from dropdown
    if (this.taskService.selectedTask.tasK_TYPE_ID == 2) {
      this.taskService.selectedTask.isAudit = true;
      this.cdr.detectChanges();
    } else {
      this.taskService.selectedTask.isAudit = false;
    }
    this.service_GetTaskCategoryListByTaskType(this.taskService.selectedTask.tasK_TYPE_ID, false);
    this.ddCategory_OnChange();
  }

  ddCategory_OnChange(): void {
    if (this.taskService.selectedTask.tasK_CATEGORY_ID != undefined && this.taskService.selectedTask.tasK_CATEGORY_ID != null) {
      const category = this.TaskCategoryList.find((item) => item.id === this.taskService.selectedTask.tasK_CATEGORY_ID);
      if (category) {
        this.taskAudit.tasK_CATEGORY_TITLE = category.title;
      }
    }
    this.taskService.selectedTask.parenT_EVENT_ID = 0;
    if (this.taskService.selectedTask.tasK_TYPE_ID == 2 && this.taskService.selectedTask.tasK_CATEGORY_ID != undefined) {
      this.taskService.GetEventListByCategory(this.taskService.selectedTask.tasK_CATEGORY_ID).subscribe(x => {
        const empId = localStorage.getItem('empid');
        this.taskService.EventList = this.taskService.EventList.filter(e => e.owner == empId || e.assigneD_TO == empId);
      });
    }
    // Set isAudit flag - use == to handle both string and number values
    if (this.taskService.selectedTask.tasK_TYPE_ID == 2) {
      this.taskService.selectedTask.isAudit = true;
      this.cdr.detectChanges();
    } else {
      this.taskService.selectedTask.isAudit = this.taskService.isAuditTask();
    }
  }

  eventChange(): void {
    const event = this.taskService.EventList.filter(a => a.id == this.taskService.selectedTask.parenT_EVENT_ID)[0];
    if (event != null && event != undefined) {
      if (this.taskService.selectedTask.seT_RECURRENCE) {
        this.eventStartDate = event.recurrence.starT_DATE;
        this.eventEndDate = event.recurrence.enD_DATE;
      } else {
        this.taskService.selectedTask.scheduleD_START_DATE = event.scheduleD_START_DATE;
        this.taskService.selectedTask.duE_DATE = event.duE_DATE;
        this.eventStartDate = event.scheduleD_START_DATE;
        this.eventEndDate = event.duE_DATE;
      }
    }
  }

  onTaskTypeChange(): void {
    this.ddTaskType_OnChange();
  }

  onCategoryChange(): void {
    this.ddCategory_OnChange();
  }

  toggleMoreDetails(): void {
    this.taskService.selectedTask.isMoredetailsShown = !this.taskService.selectedTask.isMoredetailsShown;
    if (this.taskService.selectedTask.isMoredetailsShown) {
      this.taskService.selectedTask.moreText = "Less Details....";
    } else {
      this.taskService.selectedTask.moreText = "More Details...";
    }
    this.showMoreDetails = this.taskService.selectedTask.isMoredetailsShown;
  }

  getMoreText(): string {
    return this.taskService.selectedTask.moreText || 'More Details...';
  }

  StatusChange(value: string): void {
    // No implementation needed in component, just declaration for template
  }

  onStatusChange(status: string): void {
    this.taskService.selectedTask.status = status;
  }

  project_onChange($event: any): void {
    if (this.taskService.selectedTask.isAllDisabled) return;
    let obj: any = JSON.parse($event);
    if (obj == undefined || obj == null) return;
    this.tmpCustNM = obj.customerName;
    this.tmpProjNM = obj.projectName;
    this.taskService.selectedTask.cusT_ID = obj.customer;
    this.taskService.selectedTask.proJ_ID = obj.project;
    this.taskService.selectedTask.proJ_NM = obj.projectName;
    this.taskService.selectedTask.cusT_NM = obj.customerName;
    
    this.taskService.auditSchedule.cusT_ID = obj.customer;
    this.taskService.auditSchedule.proJ_ID = obj.project;

    this.service_getAuditorList(this.taskService.auditSchedule.cusT_ID, this.taskService.auditSchedule.proJ_ID);
    this.service_getAuditeeDetails(this.taskService.auditSchedule.cusT_ID, this.taskService.auditSchedule.proJ_ID);
    this.taskService.Service_GetServiceAreaProjectMapping(this.taskService.selectedTask.proJ_ID);
    if (this.taskService.selectedTask.status != null && this.taskService.selectedTask.status != undefined) {
      this.StatusChange(this.taskService.selectedTask.status);
    }
  }

  getCustomerAndProjects(event: any): void {
    if (event.customer != undefined) {
      this.Customerids = event.customer;
    }
    if (event.project != undefined) {
      this.Projectids = event.project;
    }
  }

  showMultiSelect(): void {
    this.showServiceTower = true;
  }

  showSingleSelect(): void {
    this.showServiceTower = false;
  }

  changeResponsible(): void {
    if (!this.taskService.selectedTask.isAllDisabled) {
      this.taskService.selectedTask.isEmpSelVisible = true;
    }
  }

  employeeSearch_onChange($event: any): void {
    let obj = $event;
    this.taskService.selectedTask.assigneD_TO = obj;
  }

  GetServiceAreaTitle(id: number): string {
    let weight = this.serviceAreaList.filter(t => t.id == id);
    if (weight.length > 0) {
      return weight[0].title;
    } else {
      return '';
    }
  }

  getAppraiserName(empId: string): string {
    if (!empId) return '';
    const auditor = this.Auditors.find(emp => emp.emP_ID === empId);
    return auditor ? auditor.frsT_NM : '';
  }

  getAppraiseeName(empId: string): string {
    if (!empId) return '';
    const auditee = this.Auditees.find(emp => emp.emP_ID === empId);
    return auditee ? auditee.frsT_NM : '';
  }

  recurrenceCheck(val: boolean): void {
    this.taskService.selectedTask.isMoredetailsShown = true;
    if (!this.taskService.selectedTask.seT_RECURRENCE) {
      if (this.taskService.selectedTask.scheduleD_START_DATE) {
        this.taskService.selectedTask.recurrence.starT_DATE = this.taskService.selectedTask.scheduleD_START_DATE;
      }
      if (this.taskService.selectedTask.duE_DATE) {
        this.taskService.selectedTask.recurrence.enD_DATE = this.taskService.selectedTask.duE_DATE;
      }
    } else {
      this.taskService.selectedTask.scheduleD_START_DATE = this.taskService.selectedTask.recurrence.starT_DATE;
      this.taskService.selectedTask.duE_DATE = this.taskService.selectedTask.recurrence.enD_DATE;
    }
  }

  IsDisabled(frequency: string): boolean {
    if (this.taskService.selectedTask.recurrence.frequency != frequency) {
      return true;
    }
    return false;
  }

  /**
   * Convert a date to local noon (12:00) to avoid UTC timezone day-shift issues.
   * Using noon ensures the correct calendar date is preserved when the value is
   * serialized to JSON and interpreted by the server regardless of timezone offset.
   */
  private fixDate(dateValue: any): Date {
    const d = new Date(dateValue);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  }

  getMinDate(): Date {
    return this.taskService.selectedTask.scheduleD_START_DATE ? this.taskService.selectedTask.scheduleD_START_DATE : new Date();
  }

  getActualMinDate(): Date {
    return this.taskService.selectedTask.actuaL_START_DATE ? this.taskService.selectedTask.actuaL_START_DATE : new Date();
  }

  validateForm(): boolean {
    return this.IsValidForm();
  }

  IsValidForm(): boolean {
    const empId = localStorage.getItem('empid') || '';
    
    if (this.Auditees.length == 0) {
      if (this.taskService.selectedTask.cusT_ID != undefined && this.taskService.selectedTask.cusT_ID != null
        && this.taskService.selectedTask.proJ_ID != undefined && this.taskService.selectedTask.proJ_ID != null) {
        this.service_getAuditeeDetails(this.taskService.selectedTask.cusT_ID, this.taskService.selectedTask.proJ_ID);
      }
    }

    if (this.taskService.selectedTask.owner != empId && this.taskService.selectedTask.assigneD_TO != empId) {
      this._util.showWarningPopup("Only the owner or responsible person can edit the task details.");
      return false;
    }
    
    let isValid: boolean = false;
    if (this.taskService.selectedTask.tasK_TYPE_ID == undefined) { 
      this._util.showWarningPopup("Please select Type"); 
      return false; 
    } else if (this.taskService.selectedTask.tasK_CATEGORY_ID == undefined) { 
      this._util.showWarningPopup("Please select Category"); 
      return false; 
    } else if ((this.taskService.selectedTask.description == undefined || this.taskService.selectedTask.description == null) 
      && this.taskService.selectedTask.iS_DRAFT == false) { 
      this._util.showWarningPopup("Please enter Description"); 
      return false; 
    } else if (this.taskService.selectedTask.scheduleD_START_DATE == undefined || this.taskService.selectedTask.scheduleD_START_DATE == null) { 
      this._util.showWarningPopup("Please select scheduled start date"); 
      return false; 
    } else if (this.taskService.selectedTask.seT_RECURRENCE && 
      (this.taskService.selectedTask.recurrence.starT_DATE == undefined || this.taskService.selectedTask.recurrence.enD_DATE == undefined)) { 
      this._util.showWarningPopup("Please set start date and end date for recurring Event/Task"); 
      return false; 
    } else if (this.taskService.selectedTask.cusT_ID == undefined && !this.showServiceTower) { 
      this._util.showWarningPopup(`Please select a Customer.`); 
      return false; 
    } else {
      isValid = true;
    }

    if (this.showServiceTower) {
      if ((this.Customerids.length == 0 || this.Projectids.length == 0 || this.Projectids == undefined || this.Customerids == undefined)) {
        this._util.showWarningPopup(`Please select a Customer and Project.`);
        return false;
      }
    }

    // Validate Appraiser & Appraisees for audit tasks
    if (this.taskService.selectedTask.isAudit && !this.taskService.selectedTask.isAllDisabled && 
        this.taskService.selectedTask.tasK_TYPE_ID == 2 && !this.showServiceTower && 
        this.taskService.selectedTask.iS_DRAFT == false) {
      if (this.taskService.auditSchedule.auditoR_EMP_ID == undefined) {
        this._util.showWarningPopup("Please select an Appraiser");
        return false;
      }
      if (this.taskService.auditSchedule.auditeE_EMP_ID == undefined || 
          (Array.isArray(this.taskService.auditSchedule.auditeE_EMP_ID) && this.taskService.auditSchedule.auditeE_EMP_ID.length == 0)) {
        this._util.showWarningPopup("Please select an Appraisee");
        return false;
      }
    }

    if (this.taskService.selectedTask.status.toLowerCase() == "re-schedule") {
      if (this.taskService.selectedTask.reschedulE_DATE == null) { this._util.showWarningPopup("Please enter Re-Scheduled Date"); return false; }
      if (this.taskService.selectedTask.reschedulE_REASON == null || this.taskService.selectedTask.reschedulE_REASON == "") { this._util.showWarningPopup("Please enter Reason for Re-schedule"); return false; }
      if (this.taskService.selectedTask.reschedulE_REQUESTER == null) { this._util.showWarningPopup("Please select Requester"); return false; }
    }

    if (!this.taskService.selectedTask.seT_RECURRENCE && this.taskService.selectedTask.scheduleD_START_DATE != null && this.taskService.selectedTask.scheduleD_START_DATE != undefined
      && this.taskService.selectedTask.duE_DATE != null && this.taskService.selectedTask.duE_DATE != undefined) {
      if (new Date(this.taskService.selectedTask.scheduleD_START_DATE) > new Date(this.taskService.selectedTask.duE_DATE)) {
        this._util.showWarningPopup("Please enter Scheduled Start Date less than or equal to Due Date");
        isValid = false;
      }
    }

    if (this.taskService.selectedTask.seT_RECURRENCE && this.taskService.selectedTask.recurrence.starT_DATE != null && this.taskService.selectedTask.recurrence.starT_DATE != undefined
      && this.taskService.selectedTask.recurrence.enD_DATE != null && this.taskService.selectedTask.recurrence.enD_DATE != undefined) {
      if (new Date(this.taskService.selectedTask.recurrence.starT_DATE) > new Date(this.taskService.selectedTask.recurrence.enD_DATE)) {
        this._util.showWarningPopup("Please enter Start Date less than or equal to Due Date");
        isValid = false;
      }
    }

    if (this.taskService.selectedTask.actuaL_START_DATE != null && this.taskService.selectedTask.actuaL_START_DATE != undefined
      && this.taskService.selectedTask.actuaL_END_DATE != null && this.taskService.selectedTask.actuaL_END_DATE != undefined) {
      if (new Date(this.taskService.selectedTask.actuaL_START_DATE) > new Date(this.taskService.selectedTask.actuaL_END_DATE)) {
        this._util.showWarningPopup("Please enter Actual Start Date less than or equal to Due Date");
        isValid = false;
      }
    }

    if (this.taskService.selectedTask.isTask && this.taskService.selectedTask.parenT_EVENT_ID > 0) {
      let event = this.taskService.EventList.filter(a => a.id == this.taskService.selectedTask.parenT_EVENT_ID)[0];
      if (event != null && event != undefined) {
        if (event.scheduleD_START_DATE != undefined && this.taskService.selectedTask.scheduleD_START_DATE != undefined
          && new Date(this.taskService.selectedTask.scheduleD_START_DATE) < new Date(event.scheduleD_START_DATE)) {
          isValid = false;
          this._util.showWarningPopup("Task Scheduled Start Date cannot be before Event Start Date");
        }
        if (new Date(this.taskService.selectedTask.duE_DATE) > new Date(event.duE_DATE)) {
          isValid = false;
          this._util.showWarningPopup("Task Due Date cannot be after Event Due Date");
        }
      }
    }

    // Recurrence validations
    if (this.taskService.selectedTask.seT_RECURRENCE && this.taskService.selectedTask.recurrence != null) {
      let rec = this.taskService.selectedTask.recurrence;
      if (this.taskService.selectedTask.recurrence.frequency == "Daily") {
        if (!rec.dailY_IS_MONDAY && !rec.dailY_IS_TUESDAY && !rec.dailY_IS_WEDNESDAY && !rec.dailY_IS_THURSDAY
          && !rec.dailY_IS_FRIDAY && !rec.dailY_IS_SATURDAY && !rec.dailY_IS_SUNDAY) {
          this._util.showWarningPopup("Please select day option to continue.");
          isValid = false;
        }
      } else if (this.taskService.selectedTask.recurrence.frequency == "Weekly") {
        if (rec.weeklY_SELECTED_DAY == undefined || rec.weeklY_SELECTED_DAY == null) {
          this._util.showWarningPopup("Please select day option to continue");
          isValid = false;
        }
      } else if (this.taskService.selectedTask.recurrence.frequency == "Fortnightly") {
        if (rec.fortnightlY_SELECTED_DAY == undefined || rec.fortnightlY_SELECTED_DAY == null) {
          this._util.showWarningPopup("Please select day option to continue");
          isValid = false;
        }
      } else if (this.taskService.selectedTask.recurrence.frequency == "Monthly") {
        if ((rec.monthlY_SELECTED_DAY == undefined || rec.monthlY_SELECTED_DAY == null)
          || (rec.monthlY_SKIP_DAYS == undefined || rec.monthlY_SKIP_DAYS == null)) {
          this._util.showWarningPopup("Please select day option to continue");
          isValid = false;
        }
      } else if (this.taskService.selectedTask.recurrence.frequency == "Quarterly") {
        if ((rec.quarterlY_SELECTED_DAY == undefined || rec.quarterlY_SELECTED_DAY == null)
          || (rec.quarterlY_SKIP_DAYS == undefined || rec.quarterlY_SKIP_DAYS == null)) {
          this._util.showWarningPopup("Please select day option to continue");
          isValid = false;
        }
      } else if (this.taskService.selectedTask.recurrence.frequency == "HalfYearly") {
        if ((rec.biannuaL_FIRST_SKIP_DAYS == undefined || rec.biannuaL_FIRST_SKIP_DAYS == null)
          || (rec.biannuaL_FIRST_SELECTED_DAY == undefined || rec.biannuaL_FIRST_SELECTED_DAY == null)) {
          this._util.showWarningPopup("Please select day option to continue");
          isValid = false;
        }
      } else if (this.taskService.selectedTask.recurrence.frequency == "Annual") {
        if ((rec.annuaL_SELECTED_DAY == undefined || rec.annuaL_SELECTED_DAY == null)
          || (rec.annuaL_SKIP_DAYS == undefined || rec.annuaL_SKIP_DAYS == null)) {
          this._util.showWarningPopup("Please select day option to continue");
          isValid = false;
        }
      }
    }

    return isValid;
  }

  SaveRow_onClick(isDraft: boolean): void {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;
    
    if (isDraft) {
      this.taskAudit.iS_SUBMIT = false;
      this.taskService.selectedTask.iS_DRAFT = true;
    } else {
      this.taskAudit.iS_SUBMIT = true;
      this.taskService.selectedTask.iS_DRAFT = false;
    }

    if (this.taskService.selectedTask.seT_RECURRENCE) {
      this.taskService.selectedTask.recurrence.starT_DATE = this.fixDate(this.taskService.selectedTask.recurrence.starT_DATE);
      this.taskService.selectedTask.recurrence.enD_DATE = this.fixDate(this.taskService.selectedTask.recurrence.enD_DATE);

      const startDate = new Date(this.taskService.selectedTask.recurrence.starT_DATE);
      startDate.setMonth(startDate.getMonth() + 1);
      
      this.taskService.selectedTask.scheduleD_START_DATE = this.taskService.selectedTask.recurrence.starT_DATE;
      this.taskService.selectedTask.duE_DATE = startDate;
    } else {
      if (this.taskService.selectedTask.scheduleD_START_DATE != null) {
        this.taskService.selectedTask.scheduleD_START_DATE = this.fixDate(this.taskService.selectedTask.scheduleD_START_DATE);
      }
      this.taskService.selectedTask.duE_DATE = this.fixDate(this.taskService.selectedTask.duE_DATE);
      // Reset recurrence to new empty instance instead of null
      this.taskService.selectedTask.recurrence = new TaskModel().recurrence;
    }
    
    if (this.taskService.selectedTask.actuaL_START_DATE != null) {
      this.taskService.selectedTask.actuaL_START_DATE = this.fixDate(this.taskService.selectedTask.actuaL_START_DATE);
    }
    if (this.taskService.selectedTask.actuaL_END_DATE != null) {
      this.taskService.selectedTask.actuaL_END_DATE = this.fixDate(this.taskService.selectedTask.actuaL_END_DATE);
    }

    if (this.taskService.selectedTask.tasK_TYPE_ID == 1) {
      if (this.taskService.selectedTask.assigneD_TO == undefined || this.taskService.selectedTask.assigneD_TO == null) {
        this.taskService.selectedTask.assigneD_TO = this.taskService.selectedTask.owner;
      }
    }

    // Convert scheduled duration to integer to fix API error
    if (this.taskService.selectedTask.scheduleD_DURATION) {
      this.taskService.selectedTask.scheduleD_DURATION = Math.floor(this.taskService.selectedTask.scheduleD_DURATION);
    }
    if (this.taskService.selectedTask.actuaL_DURATION) {
      this.taskService.selectedTask.actuaL_DURATION = Math.floor(this.taskService.selectedTask.actuaL_DURATION);
    }

    // Convert audit schedule durations to integer to fix API error
    if (this.taskService.auditSchedule.scheduleD_DURATION) {
      this.taskService.auditSchedule.scheduleD_DURATION = Math.floor(this.taskService.auditSchedule.scheduleD_DURATION);
    }
    if (this.taskService.auditSchedule.actuaL_DURATION) {
      this.taskService.auditSchedule.actuaL_DURATION = Math.floor(this.taskService.auditSchedule.actuaL_DURATION);
    }

    if ((specialCharPattern.test(this.taskService.selectedTask.description)) || numberPattern.test(this.taskService.selectedTask.description)) {
      this._util.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }
    if ((specialCharPattern.test(this.taskService.selectedTask.requiremenT_REFERENCE)) || numberPattern.test(this.taskService.selectedTask.requiremenT_REFERENCE)) {
      this._util.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for requirement reference');
      return;
    }
    if ((specialCharPattern.test(this.taskService.auditSchedule.comments)) || numberPattern.test(this.taskService.auditSchedule.comments)) {
      this._util.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for comments');
      return;
    }
    if (this.taskService.selectedTask.status == 'CANCELLED') {
      if (this.taskService.selectedTask.reasoN_FOR_CANCEL == null || this.taskService.selectedTask.reasoN_FOR_CANCEL == undefined || this.taskService.selectedTask.reasoN_FOR_CANCEL == "") {
        this._util.showWarningPopup('Please enter reason for cancellation');
        return;
      }
    }

    if (this.IsValidForm()) {
      this.service_AddTask(this.taskService.selectedTask);
    }
  }

  service_AddTask(task: TaskModel): void {
    this.taskAudit.task = this.taskService.selectedTask;
    this.taskAudit.audit = this.taskService.auditSchedule;
    this.taskAudit.audit.cusT_ID = this.taskService.selectedTask.cusT_ID;
    this.taskAudit.audit.proJ_ID = this.taskService.selectedTask.proJ_ID;
    
    if (this.showServiceTower) {
      this.taskAudit.proJ_IDS = [];
      if (this.Projectids[0] != "-1") {
        this.taskAudit.proJ_IDS = this.Projectids;
      } else {
        this.Projectids.splice(0, 1);
        this.taskAudit.proJ_IDS = this.Projectids;
      }
    }
    
    this.taskAudit.proJ_NM = this.taskService.selectedTask.proJ_NM;
    this.taskAudit.audit.scheduleD_DATE = this.taskService.selectedTask.duE_DATE;
    this.taskAudit.audit.title = this.taskService.selectedTask.description;
    
    // Preserve existing durations or set to 0 if not set (already converted to int above)
    if (!this.taskAudit.audit.scheduleD_DURATION) {
      this.taskAudit.audit.scheduleD_DURATION = 0;
    }
    if (!this.taskAudit.audit.actuaL_DURATION) {
      this.taskAudit.audit.actuaL_DURATION = 0;
    }
    
    this.taskAudit.isAudit = this.taskService.isAuditTask();
    this.taskAudit.reasoN_FOR_CANCEL = this.taskService.selectedTask.reasoN_FOR_CANCEL;
    
    this.isSubmit = false;
    
    if (this.taskAudit.task.status.toLowerCase() != "re-schedule") {
      this.taskAudit.task.reschedulE_DATE = null;
      this.taskAudit.task.reschedulE_DATE_PREV = null;
      this.taskAudit.task.reschedulE_REASON = "";
      this.taskAudit.task.reschedulE_REQUESTER = null;
    } else {
      if (this.taskService.selectedTask.reschedulE_DATE) {
        const d = new Date(this.taskService.selectedTask.reschedulE_DATE);
        // Legacy uses Date.UTC(year, month, day) to avoid timezone offset shifting the date.
        // e.g. In IST (UTC+5:30), local midnight serializes as previous day in UTC to the API.
        // Applying Date.UTC here only for reschedulE_DATE, not via setLocaleDate (to avoid affecting other dates).
        this.taskService.selectedTask.reschedulE_DATE = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      }
    }
    
    if (this.taskService.selectedTask.tasK_CATEGORY_ID != undefined && this.taskService.selectedTask.tasK_CATEGORY_ID != null) {
      const category = this.TaskCategoryList.find((item) => item.id === this.taskService.selectedTask.tasK_CATEGORY_ID);
      if (category) {
        this.taskAudit.tasK_CATEGORY_TITLE = category.title;
      }
    }
    
    this.taskService.addTaskandAudit(this.taskAudit).subscribe(data => {
      if (this.taskService.selectedTask.tasK_TYPE_ID == 2) {
        this._util.showWarningPopup("Task saved successfully", "Success");
      } else if (this.taskService.selectedTask.tasK_TYPE_ID == 1) {
        this._util.showWarningPopup("Event saved successfully", "Success");
      }
      this.taskService.selectedTask = new TaskModel();
      this.taskService.auditSchedule = new AuditScheduleModel();
      this.taskService.selectedTask.isEmpSelVisible = false;
      this.isSubmit = true;
      this.showSingleSelect();
    }, error => { 
      this._util.serviceError(error); 
      this.isSubmit = true; 
    });
  }

  onSaveClick(): void {
    this.SaveRow_onClick(false);
  }

  onSaveAsDraftClick(): void {
    this.SaveRow_onClick(true);
  }

  onCancelClick(): void {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Confirm Cancel',
        message: 'Are you sure you want to cancel? Any unsaved changes will be lost.'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.Cancel_onClick();
      }
    });
  }

  Cancel_onClick(): void {
    this.taskService.selectedTask = new TaskModel();
    this.taskService.auditSchedule = new AuditScheduleModel();
    this.taskService.selectedTask.isEmpSelVisible = false;
    this.onCancel.emit();
  }

  onResetClick(): void {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Confirm Reset',
        message: 'Are you sure you want to reset the form?'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.taskService.selectedTask = new TaskModel();
        this.showMoreDetails = false;
      }
    });
  }

  onCustomerChange(): void {
    // Reset project when customer changes
    this.taskService.selectedTask.proJ_ID = '';
    this.projectList = [];
    
  }

  openMultipleProjectSelection(): void {
    this.showMultiSelect();
  }

  // Helper method to get owner display name
  getOwnerDisplayName(): string {
    if (!this.taskService.selectedTask.isNew) {
      return this.taskService.selectedTask.ownerName || '';
    } else {
      return this._util.AppSettings.displayname || '';
    }
  }

  // Helper method to check if responsible for execution should be shown
  shouldShowResponsibleForExecution(): boolean {
    return (!this.taskService.isAuditTask() || !!this.taskService.selectedTask.owner) &&
           (!!this.taskService.selectedTask.isOwner || !!this.taskService.selectedTask.assigneD_TO);
  }

  // Helper to get label for responsible section
  getResponsibleLabel(): string {
    if (this.taskService.selectedTask.isOwner || this.taskService.selectedTask.assigneD_TO) {
      return 'Responsible for Execution:';
    }
    return '';
  }

  // Check if a status option should be disabled
  getStatusDisabled(item: StatusOption): boolean {
    // Special handling for category 16
    if (this.taskService.selectedTask.tasK_CATEGORY_ID == 16) {
      if (this.taskService.selectedTask.status === 'COMPLETED' || 
          this.taskService.selectedTask.status === 'CANCELLED') {
        return true;
      } else {
        return false;
      }
    }

    // If task is completed or cancelled, disable all changes
    if (this.taskService.selectedTask.status === 'COMPLETED' || 
        this.taskService.selectedTask.status === 'CANCELLED') {
      return true;
    }

    // Only allow CANCELLED and RE-SCHEDULE to be selected
    if (item.value == 'CANCELLED' || item.value == 'RE-SCHEDULE') {
      return false;
    }
    
    return true;
  }
}
