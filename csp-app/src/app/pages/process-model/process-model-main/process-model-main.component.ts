import { Component, OnInit, Input } from '@angular/core';
import { TaskService } from '../task/task.service';
import { TaskModel } from '../../../models/task-model';
import { MatStepper } from '@angular/material';
import { AuditScheduleModel } from '../../../models/audit-schedule-model';
import { ProcessModelService } from '../process-model.service';
import { myUtility } from '../../../Shared/myUtility';
import { AccessControl } from '../../../Shared/accessControl';


@Component({
  selector: 'app-process-model-main',
  templateUrl: './process-model-main.component.html',
  styleUrls: ['./process-model-main.component.scss']
})
export class ProcessModelMainComponent implements OnInit {


  constructor(public _util: myUtility, public _access: AccessControl, public _taskService: TaskService, private _processService: ProcessModelService) { }

  ngOnInit() {
    this._access.CheckValidAccess(42);
  }

  tabChange(event) {

    if (event.index === 0) {
      this._processService.stepper.selectedIndex = 0;
    }
    else if (event.index === 1) {
      this._taskService.selectedTask = new TaskModel();
      this._taskService.auditSchedule = new AuditScheduleModel();
    }
  }
}
