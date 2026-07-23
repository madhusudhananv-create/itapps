import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup } from '@angular/forms';
import { ProcessModelService } from '../process-model/process-model.service';
import { TaskPlannerComponent } from './task-planner/task-planner.component';
import { TaskAddComponent } from '../task-add/task-add.component';
import { ExecuteComponent } from './execute/execute.component';
import { TaskModel } from '../../core/models/task-model';
import { TaskService } from '../task/task.service';

@Component({
  selector: 'app-audit-plan',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    TaskPlannerComponent,
    TaskAddComponent,
    ExecuteComponent
  ],
  templateUrl: './audit-plan.component.html',
  styleUrls: ['./audit-plan.component.scss']
})
export class AuditPlanComponent implements OnInit {
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  allCust: boolean = false;
  allProj: boolean = false;

  @ViewChild('stepper') stepper!: MatStepper;

  private _processService = inject(ProcessModelService);
  private _taskService = inject(TaskService);

  /**
   * Get selected task from service - always returns current task
   */
  get selectedTask(): TaskModel | undefined {
    return this._taskService.selectedTask;
  }

  constructor() { }

  ngOnInit() {
    this._processService.stepper = this.stepper;
  }

  handleTaskSave(task: TaskModel) {
    // Here you would typically call a service to save the task
    // Then move to the next step
    this.stepper.next();
  }

  handleTaskCancel() {
    // Go back to planner step
    this.stepper.previous();
  }
}
