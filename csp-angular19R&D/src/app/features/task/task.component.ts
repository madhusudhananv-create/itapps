import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';

import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { AuditPlanComponent } from '../audit-plan/audit-plan.component';
import { TaskAddComponent } from '../task-add/task-add.component';
import { TaskService } from './task.service';
import { MyUtility } from '../../shared/my-utility';
import { ProcessModelService } from '../process-model/process-model.service';
import { LayoutService } from '../layout/layout.service';
import { AccessControl } from '../../shared/access-control';
import { AppsService } from '../../core/services/apps.service';
import { environment } from '../../../environments/environment';
import { TaskModel, AuditScheduleModel } from '../../core/models/task-model';

/**
 * Task Component - Main container for Task Planner
 * Manages task planning, viewing, and event management
 */
@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatSidenavModule,
    MatProgressBarModule,
    RouterModule,
    NavbarNewComponent,
    AuditPlanComponent,
    TaskAddComponent
  ],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit, OnDestroy {
  // Injected dependencies
  private route = inject(ActivatedRoute);
  private _processService = inject(ProcessModelService);
  private _taskService = inject(TaskService);
  public _util = inject(MyUtility);
  private _router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private media = inject(MediaMatcher);
  public _layoutService = inject(LayoutService);
  private _appService = inject(AppsService);
  public _access = inject(AccessControl);

  // Properties
  mobileQuery: MediaQueryList;
  sub: any;
  custid: any;
  allCust: boolean = false;
  allProj: boolean = false;
  menuToggleStatus: boolean = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  private _mobileQueryListener: () => void;

  constructor() {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  /**
   * Component initialization
   */
  ngOnInit() {
    
    this.service_GetTaskTypeList();
    this.service_GetTaskCategoryList();
    
    this.sub = this.route.params.subscribe(params => {
      this.custid = params['custid'];
      this._layoutService.selectedCust = this.custid;
    });

    // Commented in legacy - keeping for reference
    // this._appService.GetDBConfigValue("ADDTASK_AllCustomers", -1, "").subscribe(data => {
    //   if (data.indexOf(localStorage.getItem('empid')) >= 0) {
    //     this.allCust = true;
    //     this.allProj = true;
    //   }
    // });
  }

  /**
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /**
   * Logout handler
   */
  logout() {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to log out?',
      'Logout'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        if (this._util.IsGAVS()) {
          this.service_Logout();
          let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
          window.location.href = loginurl;
        } else {
          this.service_Logout();
          this._router.navigateByUrl('/login');
        }
      }
    });
  }

  /**
   * Menu toggle change handler
   */
  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  /**
   * Tab change handler
   */
  tabChange(event: any) {
    if (event.index === 0) {
      this._processService.stepper.selectedIndex = 0;
    } else if (event.index === 1) {
      this._taskService.selectedTask = new TaskModel();
      this._taskService.auditSchedule = new AuditScheduleModel();
    }
  }

  /**
   * Get task type list from service
   */
  service_GetTaskTypeList() {
    this._taskService.GetTaskTypeList().subscribe({
      next: (data) => {
        this._taskService.TaskTypeList = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Get task category list from service
   */
  service_GetTaskCategoryList() {
    this._taskService.GetTaskCategoryList().subscribe({
      next: (data) => {
        this._taskService.TaskCategoryList = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Logout service call
   */
  service_Logout() {
    // Logout logic implementation
  }

  /**
   * Handle task save from standalone Add Event/Task tab
   */
  handleTaskSave(task: TaskModel): void {
    
    // addTask handles both create and update operations
    this._taskService.addTask(task).subscribe({
      next: (response: TaskModel) => {
        const message = task.id && task.id > 0 ? 'Task updated successfully!' : 'Task created successfully!';
        this._util.showSuccessPopup(message, 'Success');
        // Optionally switch back to View Planner tab
        // this.selectedTabIndex = 0;
      },
      error: (error: any) => {
        console.error('Error saving task:', error);
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Handle task cancel from standalone Add Event/Task tab
   */
  handleTaskCancel(): void {
    // Optionally switch back to View Planner tab
    // this.selectedTabIndex = 0;
  }
}
