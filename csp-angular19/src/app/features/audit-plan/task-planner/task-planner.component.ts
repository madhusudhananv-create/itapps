import { Component, ElementRef, OnInit, ViewChild, Input, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepper } from '@angular/material/stepper';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { TaskGroupsModel, TaskModel, TaskTypeModel, TaskCategoryModel, RecurrenceModel } from '../../../core/models/task-model';
import { TaskService } from '../../task/task.service';
import { DateSelectionModel } from '../../../core/models/date-selection-model';
import { AuditScheduleModel } from '../../../core/models/task-model';

@Component({
  selector: 'app-task-planner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './task-planner.component.html',
  styleUrls: ['./task-planner.component.scss']
})
export class TaskPlannerComponent implements OnInit {
  @Input() stepper!: MatStepper;
  
  TaskGroups: TaskGroupsModel = new TaskGroupsModel();
  TaskTypeList: TaskTypeModel[] = [];
  TaskCategoryList: TaskCategoryModel[] = [];
  masterTaskCategoryList: TaskCategoryModel[] = [];
  ProjectList: any[] = [];
  CustomerList: any[] = [];
  selectedTask: TaskModel = new TaskModel();
  selectedTaskType: number = 0;
  selectedTaskCategory: any = [];
  selectedProject: any = [];
  selectedCustomer: any = [];
  bShowSummary: boolean = false;
  selectedPeriod = "Yearly";
  currentYear: number = new Date().getFullYear();
  
  // Filters
  custIds: string = "-1";
  projIds: string[] = [];
  bShowDateSelection1: Boolean = false;
  bShowDateSelection2: Boolean = false;
  bShowKPIDetails: Boolean = false;
  DateSelection1: DateSelectionModel;
  DateSelection2: DateSelectionModel;
  selectedQuarter = "Q1";
  dates: any[] = [];
  startDate: any;
  endDate: any;
  months: any[] = [];
  selectedMonth: number = 0;
  selectView: string = "1";
  overallTaskDetails: any;
  masterProjectList: any[] = [];
  filteredProjectList: any[] = [];
  filteredCustomerList: any[] = [];
  filterAuditCategories: boolean = true;
  plannedAuditsCount: number = 0;
  
  // Flags to prevent infinite loops
  private isAutoSelecting: boolean = false;
  private isInitialLoad: boolean = true;
  private isTogglingIndividualOption: boolean = false;

  @ViewChild('TABLE') table!: ElementRef;
  @ViewChild('categorySearchInput') categorySearchInput!: ElementRef;
  @ViewChild('customerSearchInput') customerSearchInput!: ElementRef;
  @ViewChild('projectSearchInput') projectSearchInput!: ElementRef;
  @ViewChild('selectCustomer') selectCustomer!: MatSelect;
  @ViewChild('allCustomerSelected') allCustomerSelected!: MatOption;
  @ViewChild('selectProject') selectProject!: MatSelect;
  @ViewChild('allProjectSelected') allProjectSelected!: MatOption;
  @ViewChild('selectCategory') selectCategory!: MatSelect;
  @ViewChild('allCategorySelected') allCategorySelected!: MatOption;

  public _taskService = inject(TaskService);
  private _appService = inject(AppsService);
  private _util = inject(MyUtility);

  constructor() {
    this.DateSelection1 = new DateSelectionModel(this._util);
    this.DateSelection2 = new DateSelectionModel(this._util);
  }

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

  changeView(selectedView: string) {
    this._taskService.plannedAuditsCount = 0;
    if (selectedView != "" && selectedView != null && selectedView != undefined && selectedView != "0") {
      this.selectView = selectedView;
    }
    this.btnClear_OnClick();
  }

  showSummary(task: any) {
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
    this._taskService.taskGroups = null as any;
    this.service_GetTaskDetailsWithFilters();
  }

  getDayPart(date: any) {
    if (date === undefined || date == null) return "-";
    return formatDate(date, 'dd/MM', 'en-US');
  }

  ddTaskType_OnChange() {
    this.service_GetTaskCategoryListByTaskType(this.selectedTaskType);
  }

  ddCustomer_OnChange() {
    // Don't process change during initial load to prevent clearing selections
    if (this.isInitialLoad && !this.isAutoSelecting) {
      return;
    }
    
    // Don't process when toggling individual options - just let the UI update naturally
    if (this.isTogglingIndividualOption) {
      return;
    }
    
    // Store current project selections (excluding "All" option)
    const previouslySelectedProjects = this.selectedProject.filter((p: any) => p !== -1);
    
    // Check if masterProjectList is available
    if (!this.masterProjectList || this.masterProjectList.length === 0) {
      console.warn('ddCustomer_OnChange - masterProjectList is empty or undefined');
      this.ProjectList = [];
      this.filteredProjectList = [];
      return;
    }
    
    // Get actual customer IDs (exclude the "All" option which has value -1)
    const actualCustomerIds = this.selectedCustomer.filter((id: any) => id !== -1);
    
    // Filter projects based on selected customers
    if (!this.selectedCustomer || this.selectedCustomer.length === 0 || 
        (this.selectedCustomer.length === 1 && this.selectedCustomer[0] === "-1") ||
        actualCustomerIds.length === 0) {
      // Show all projects if no customer selected or "All" selected
      this.ProjectList = [...this.masterProjectList];
      this.filteredProjectList = [...this.masterProjectList];
    } else {
      // Filter projects by selected customer IDs (excluding -1)
      this.ProjectList = this.masterProjectList.filter((t: any) => {
        const matches = actualCustomerIds.includes(t.cusT_ID);
        return matches;
      });
      this.filteredProjectList = [...this.ProjectList];
    }

    // Auto-select all filtered projects (only during auto-selection, not manual user interaction)
    if (this.isAutoSelecting) {
      // Clear all project selections
      this.selectedProject = [];
      if (this.selectProject && this.selectProject.options) {
        this.selectProject.options.forEach((item: MatOption) => item.deselect());
      }
      if (this.allProjectSelected) {
        this.allProjectSelected.deselect();
      }
      
      setTimeout(() => {
        if (this.ProjectList && this.ProjectList.length > 0) {
          // Select all filtered projects
          this.selectedProject = this.ProjectList.map((p: any) => p.proJ_ID);
          this.selectedProject.unshift(-1);
          
          // Give Angular time to render the new options in the DOM
          setTimeout(() => {
            // Select the "All" option and all project options in the UI
            if (this.allProjectSelected && this.selectProject) {
              this.allProjectSelected.select();
              
              // Programmatically select all project options in the UI
              this.selectProject.options.forEach((item: MatOption) => {
                if (item.value === -1 || this.selectedProject.includes(item.value)) {
                  item.select();
                }
              });
            }
          }, 150);
        }
      }, 100);
    } else {
      // Manual user interaction - preserve valid selections
      // Don't modify selectedProject immediately - let Angular render the new filtered list first
      
      setTimeout(() => {
        // Now that the new project list is rendered, preserve valid selections
        const filteredProjectIds = this.ProjectList.map((p: any) => p.proJ_ID);
        
        // Keep only projects that are still in the filtered list
        const validSelections = previouslySelectedProjects.filter((projId: any) => 
          filteredProjectIds.includes(projId)
        );
        
        if (this.selectProject && this.selectProject.options) {
          // Update the UI selections
          this.selectProject.options.forEach((item: MatOption) => {
            if (item.value !== -1 && validSelections.includes(item.value)) {
              item.select();
            } else if (item.value !== -1) {
              item.deselect();
            }
          });
          
          // Update the model after UI is set
          this.selectedProject = [...validSelections];
          
          // Check if all projects are selected
          if (this.selectedProject.length === this.ProjectList.length && 
              this.ProjectList.length > 0 && 
              this.allProjectSelected) {
            this.selectedProject.unshift(-1);
            this.allProjectSelected.select();
          } else if (this.allProjectSelected) {
            this.allProjectSelected.deselect();
          }
        }
      }, 100);
    }
  }

  ExportToExcel() {
    let name = 'Task';
    this._util.exportToExcel(this.table.nativeElement, name);
  }

  toggleSelectionForCustomer() {
    if (this.allCustomerSelected.selected) {
      this.selectCustomer.options.forEach((item: MatOption) => item.select());
    } else {
      this.selectCustomer.options.forEach((item: MatOption) => item.deselect());
    }
    // Trigger customer change to update project list
    this.ddCustomer_OnChange();
  }

  customerTosslePerOne() {
    // Don't process during initial load unless auto-selecting
    if (this.isInitialLoad && !this.isAutoSelecting) {
      return false;
    }
    
    // Set flag to prevent ddCustomer_OnChange from interfering
    this.isTogglingIndividualOption = true;
    
    if (this.allCustomerSelected.selected) {
      this.allCustomerSelected.deselect();
      this.isTogglingIndividualOption = false;
      return false;
    }
    
    let count = 0;
    this.selectCustomer.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    
    if (this.CustomerList.length == count) {
      this.allCustomerSelected.select();
    }
    
    // Reset flag after a short delay to allow selection to complete
    setTimeout(() => {
      this.isTogglingIndividualOption = false;
    }, 50);
    
    // Don't call ddCustomer_OnChange here - let it be triggered by selectionChange event when dropdown closes
    return true;
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
    return true;
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
    return true;
  }

  Task_OnClick(task: any) {
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
        );
      }

      if (this._taskService.selectedTask.assigneD_TO != undefined) {
        this._appService.getEmpNameById(this._taskService.selectedTask.assigneD_TO).subscribe(
          data => {
            this._taskService.selectedTask.empName = data;
          },
          error => { this._util.serviceError(error); }
        );
      }

      if (this._taskService.isAuditTask()) {
        this._taskService.GetAuditScheduleByTaskId(this._taskService.selectedTask.id).subscribe(a => {
          if (a == undefined) {
            this._taskService.auditSchedule = new AuditScheduleModel();
            this._taskService.auditSchedule.tasK_ID = this._taskService.selectedTask.id;
          }
          else
            this._taskService.auditSchedule = a;
        });
      }
      else {
        this._taskService.auditSchedule = new AuditScheduleModel();
      }

      // Navigate to Step 2 (Manage Event/Task) in the stepper
      this.stepper.next();
    });
  }

  getStatusAbr(str: string) {
    return str.charAt(0);
  }

  getStatusColor(str: string) {
    let sColor = "grey";
    if (str == "PLANNED")
      sColor = "rgb(148, 148, 249)";
    else if (str == "SCHEDULED")
      sColor = "orange";
    else if (str == "IN PROGRESS")
      sColor = "#30b8cc";
    else if (str == "COMPLETED")
      sColor = "#45cc45";
    return sColor;
  }

  getTooltip(task: any) {
    return task.status + " - " + task.tasK_CATEGORY + " - " + task.description;
  }

  getDateColor(str: string) {
    return this.getStatusColor(str);
  }

  service_GetTaskDetailsWithFilters() {
    this._taskService.params = [];
    this._taskService.params.push({ key: "StartDate", value: this.startDate });
    this._taskService.params.push({ key: "EndDate", value: this.endDate });
    
    if (this.selectedTaskType != 0 && this.selectedTaskType != undefined && this.selectedTaskType != null) {
      this._taskService.params.push({ key: "TASK_TYPE_ID", value: this.selectedTaskType.toString() });
    }
    
    // Check if task category is selected (array must have items)
    if (this.selectedTaskCategory && this.selectedTaskCategory.length > 0) {
      this._taskService.params.push({ key: "TASK_CATEGORY_ID", value: this.selectedTaskCategory.toString() });
    }
    else {
      alert("Please select Task Category");
      return false;
    }
    
    // Check if customer is selected (array must have items)
    if (this.selectedCustomer && this.selectedCustomer.length > 0) {
      this._taskService.params.push({ key: "CUST_ID", value: this.selectedCustomer.toString() });
    }
    else {
      alert("Please select any customer");
      return false;
    }
    
    // Check if project is selected (array must have items)
    if (this.selectedProject && this.selectedProject.length > 0) {
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
    
    return true;
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

        // Filter by Task Type
        if (this.selectedTaskType != undefined && this.selectedTaskType != 0) {
          for (let p of this._taskService.taskGroups.projects) {
            for (let q of p.groups) {
              q.tasks = q.tasks.filter((t: any) => t.tasK_TYPE_ID === this.selectedTaskType);
            }
            p.groups = p.groups.filter((t: any) => t.tasks.length > 0);
          }
          this._taskService.taskGroups.projects = this._taskService.taskGroups.projects.filter((t: any) => t.groups.length > 0);
        }
        
        // Filter by Task category
        if (this.selectedTaskCategory != undefined && this.selectedTaskCategory != 0) {
          for (let p of this._taskService.taskGroups.projects) {
            for (let q of p.groups) {
              q.tasks = q.tasks.filter((t: any) => t.tasK_CATEGORY_ID === this.selectedTaskCategory);
            }
            p.groups = p.groups.filter((t: any) => t.tasks.length > 0);
          }
          this._taskService.taskGroups.projects = this._taskService.taskGroups.projects.filter((t: any) => t.groups.length > 0);
        }
      }
      else {
        this.overallTaskDetails = data;
        this.calcListPlannedCount(this.overallTaskDetails);
      }
      this._taskService.bProgress = false;
    }, error => {
      this._taskService.bProgress = false;
      this._util.serviceError(error);
    });
  }

  calcListPlannedCount(overallTaskDetails: any) {
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
      .map((t: any) => ({ customerId: t.customerId, customerName: t.customerName }))
      .sort((a: any, b: any) => a.customerName.localeCompare(b.customerName))
      .filter((thing: any, i: number, arr: any[]) => {
        return arr.findIndex((t: any) => t.customerId === thing.customerId && t.customerName === thing.customerName) === i;
      });
    this.filteredCustomerList = this.CustomerList;
    
    // Auto-select all customers on initial load
    setTimeout(() => {
      this.selectAllCustomers();
    }, 100);
  }

  LoadProjects() {
    this._appService.GetAllCustomerProjectsName().subscribe((data: any) => {
      this.ProjectList = data || [];
      this.masterProjectList = data || [];
      this.filteredProjectList = data || [];
      
      // Auto-select all projects on initial load only
      if (this.isInitialLoad) {
        // Increased delay to ensure DOM has rendered the options
        setTimeout(() => {
          this.selectAllProjects();
          
          // Verify selection after attempting
          setTimeout(() => {
            // Automatically trigger data load after selections are made (ONLY on initial load)
            setTimeout(() => {
              // Only load data if all required selections are ready
              if (this.selectedTaskCategory && this.selectedTaskCategory.length > 0 &&
                  this.selectedCustomer && this.selectedCustomer.length > 0 &&
                  this.selectedProject && this.selectedProject.length > 0) {
                this.getOverallTaskDetails();
                // Mark initial load as complete
                this.isInitialLoad = false;
              }
            }, 400);
          }, 100);
        }, 250);
      }
    }, error => { 
      this._util.serviceError(error); 
    });
  }

  service_GetTaskTypeList() {
    this._taskService.GetTaskTypeList().subscribe(data => {
      this.TaskTypeList = data;
      this.TaskTypeList.unshift(new TaskTypeModel());
    }, error => { 
      this._util.serviceError(error); 
    });
  }

  service_GetTaskCategoryListByTaskType(taskTypeId: number) {
    this._taskService.GetTaskCategoryListByTaskType(taskTypeId, this.filterAuditCategories).subscribe(data => {
      this.TaskCategoryList = data;
      this.masterTaskCategoryList = data;
      // Auto-select all categories with delay to ensure ViewChild is ready
      setTimeout(() => {
        this.selectAllCategory();
      }, 100);
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
    if (this.allCategorySelected && this.selectCategory) {
      this.allCategorySelected.select();
      if (this.allCategorySelected.selected) {
        this.selectCategory.value = [-1];
        this.allCategorySelected.select();
        this.selectCategory.options.forEach((item: MatOption) => item.select());
        // Update selected category array
        this.selectedTaskCategory = this.TaskCategoryList.map((c: any) => c.id);
        this.selectedTaskCategory.unshift(-1);
      }
    }
  }

  selectAllCustomers() {
    if (this.allCustomerSelected && this.selectCustomer) {
      this.allCustomerSelected.select();
      if (this.allCustomerSelected.selected) {
        this.selectCustomer.value = [-1];
        this.allCustomerSelected.select();
        this.selectCustomer.options.forEach((item: MatOption) => item.select());
        // Update selected customer array
        this.selectedCustomer = this.CustomerList.map((c: any) => c.customerId);
        this.selectedCustomer.unshift(-1);
        
        // Set flag to indicate this is auto-selection, not user interaction
        this.isAutoSelecting = true;
        
        // Trigger customer change to update project list
        this.ddCustomer_OnChange();
        
        // Reset flag after a longer delay to account for async selectionChange events
        setTimeout(() => {
          this.isAutoSelecting = false;
        }, 2000);  // Increased from 500ms to 2000ms
      }
    }
  }

  selectAllProjects() {
    if (this.allProjectSelected && this.selectProject) {
      this.allProjectSelected.select();
      if (this.allProjectSelected.selected) {
        this.selectProject.value = [-1];
        this.allProjectSelected.select();
        this.selectProject.options.forEach((item: MatOption) => item.select());
        // Update selected project array
        this.selectedProject = this.ProjectList.map((p: any) => p.proJ_ID);
        this.selectedProject.unshift(-1);
      }
    }
  }

  applyFilterForCategory(value: string) {
    let filteredCategory: any[] = [];
    if (this.masterTaskCategoryList != null && this.masterTaskCategoryList.length > 0 && this.masterTaskCategoryList != undefined) {
      filteredCategory = this.masterTaskCategoryList.filter(item => item.title.toLowerCase().includes(value.toLowerCase()));
    }
    this.TaskCategoryList = filteredCategory;
  }

  resetCustomerFilterValue(opened: boolean) {
    // Don't process during initial load to prevent interfering with auto-selection
    if (this.isInitialLoad && !opened) {
      return;
    }
    
    this.customerSearchInput.nativeElement.value = '';
    this.applyFilterForCustomer(this.customerSearchInput.nativeElement.value);
    
    // Only call customerTosslePerOne if not during initial load
    if (!this.isInitialLoad || this.isAutoSelecting) {
      this.customerTosslePerOne();
    }
    
    // When dropdown closes, trigger project filtering after ensuring flag is reset
    if (!opened && !this.isInitialLoad) {
      setTimeout(() => {
        this.isTogglingIndividualOption = false; // Ensure flag is reset
        this.ddCustomer_OnChange();
      }, 100);
    }
  }

  applyFilterForCustomer(value: string) {
    let filteredCustomer = [];
    if (this.filteredCustomerList != null && this.filteredCustomerList.length > 0 && this.filteredCustomerList != undefined) {
      filteredCustomer = this.filteredCustomerList.filter((item: any) => item.customerName.toLowerCase().includes(value.toLowerCase()));
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
        filteredProject = this.masterProjectList.filter((item: any) => item.proJ_NM.toLowerCase().includes(value.toLowerCase()));
        this.ProjectList = filteredProject;
      }
    }
  }
}
