import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../task/task.service';
import { TaskModel, AuditScheduleModel } from '../../../core/models/task-model';
import { ProcessModelService } from '../../process-model/process-model.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { ChecklistUserComponent } from '../checklist-user/checklist-user.component';
import { AuditPlanComponent } from '../../audit-plan/audit-plan.component';
import { TaskAddComponent } from '../../task-add/task-add.component';
import { ChecklistExecutionNewComponent } from '../checklist-execution-new/checklist-execution-new.component';
import { ObjectiveUserComponent } from '../objective-user/objective-user.component';
import { RiskUserComponent } from '../risk-user/risk-user.component';
import { ControlUserComponent } from '../control-user/control-user.component';
import { TestUserComponent } from '../test-user/test-user.component';
import { RequirementReferenceComponent } from '../requirement-reference/requirement-reference.component';
import { AuditExecutionComponent } from '../audit-execution/audit-execution.component';

@Component({
  selector: 'app-process-model-main',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    ChecklistUserComponent,
    AuditPlanComponent,
    TaskAddComponent,
    ChecklistExecutionNewComponent,
    ObjectiveUserComponent,
    RiskUserComponent,
    ControlUserComponent,
    TestUserComponent,
    RequirementReferenceComponent,
    AuditExecutionComponent
  ],
  templateUrl: './process-model-main.component.html',
  styleUrls: ['./process-model-main.component.scss']
})
export class ProcessModelMainComponent implements OnInit {
  tabIndex: any; // For checklist execution component

  constructor(public _util: MyUtility, public _access: AccessControl, public _taskService: TaskService, private _processService: ProcessModelService) { }

  ngOnInit() {
    // Only check access if user is logged in to prevent redirect loops
    if (this._util.IsLoggedIn()) {
      this._access.CheckValidAccess(42);
    } else {
      console.warn('User not logged in. Access check skipped for development/testing.');
    }
  }

  tabChange(event: any) {

    if (event.index === 0) {
      if (this._processService.stepper) {
        this._processService.stepper.selectedIndex = 0;
      }
    }
    else if (event.index === 1) {
      this._taskService.selectedTask = new TaskModel();
      this._taskService.auditSchedule = new AuditScheduleModel();
    }
  }
}
