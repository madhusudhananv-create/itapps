import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, NgModel, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { TaskRecurrenceComponent } from '../task/task-recurrence/task-recurrence.component';
import { TaskModel, RecurrenceModel, TaskTypeModel, TaskCategoryModel } from '../../../models/task-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { RiskDetailsComponent } from '../../../controls/risk-details/risk-details.component';

import { TaskService } from './task.service';
import { environment } from '../../../../environments/environment';
import { AuditScheduleModel } from '../../../models/audit-schedule-model';
import { ProcessModelService } from '../process-model.service';
import { LayoutService } from '../../layout/layout.service';
import { AccessControl } from '../../../../app/Shared/accessControl';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  mobileQuery: MediaQueryList;
  sub :any;
  custid:any;
  allCust: boolean = false;
  allProj: boolean = false;
  private _mobileQueryListener: () => void;
  
  constructor(private route: ActivatedRoute,private _processService: ProcessModelService , private _taskService: TaskService, public _util: myUtility, private _router: Router, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public _layoutService: LayoutService,private _appService: AppsService, public _access: AccessControl) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.service_GetTaskTypeList();
    this.service_GetTaskCategoryList();
    this.sub = this.route.params.subscribe(params => {
     this.custid = params['custid'];
      this._layoutService.selectedCust = this.custid;
    });
    // this._appService.GetDBConfigValue("ADDTASK_AllCustomers", -1, "").subscribe(data => {
    //   if (data.indexOf(localStorage.getItem('empid')) >= 0)
    //     this.allCust = true;
    //     this.allProj = true;
        
    // }); 
  }
  
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  logout() {
    if (confirm("Are you sure you want to log out?")) {
      if (this._util.IsGAVS()) {
        this.service_Logout();
        let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
        window.location.href = loginurl;
      }
      else {
        this.service_Logout();
        this._router.navigateByUrl('/login');
      }
    }
  }
  menuToggleStatus: boolean;
  
  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  tabChange(event)
  {
    if(event.index === 0)
    {
      this._processService.stepper.selectedIndex=0;
    }
    else if(event.index===1)
    {
       this._taskService.selectedTask= new TaskModel();
       this._taskService.auditSchedule = new AuditScheduleModel();
    }
  }

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
 

  service_GetTaskTypeList() {
    this._taskService.GetTaskTypeList().subscribe(data => {
      this._taskService.TaskTypeList = data;
      //this._taskService.TaskTypeList.unshift(new TaskTypeModel());
    }, error => { this._util.serviceError(error); });
  }
  service_GetTaskCategoryList() {
    this._taskService.GetTaskCategoryList().subscribe(data => {
      this._taskService.TaskCategoryList = data;
      //this._taskService.TaskCategoryList.unshift(new TaskCategoryModel());
    }, error => { this._util.serviceError(error); });
  }
  service_Logout() {

  }
}
