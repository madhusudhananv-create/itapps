import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskRoutingModule } from './task-routing.module';
import { SharedModule } from '../../../Shared/shared.module';
import { TaskService } from './task.service';
import { MatDatepickerModule } from '@angular/material';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

// import { TaskComponent } from '../../../pages/process-model/task/task.component';
// import { TaskPlannerComponent } from '../../../pages/process-model/task/task-planner/task-planner.component';
// import { TaskRecurrenceComponent } from '../../../pages/process-model/task/task-recurrence/task-recurrence.component';
// import { TaskAddComponent } from '../../../pages/process-model/task/task-add/task-add.component';
// import { TaskSchedulerComponent } from '../../../pages/process-model/task/task-scheduler/task-scheduler.component';
// import { TaskExecutionComponent } from '../../../pages/process-model/task/task-execution/task-execution.component';
// import { TaskViewComponent } from '../../../pages/process-model/task/task-view/task-view.component';

@NgModule({
  imports: [],
  providers: [
    
  ]
})

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TaskRoutingModule,
    MatDatepickerModule, MatMomentDateModule
  ],
  declarations: [
    // TaskComponent,
    // TaskPlannerComponent,
    // TaskRecurrenceComponent,
    // TaskSchedulerComponent,
    // TaskAddComponent,
    // TaskExecutionComponent,
    // TaskViewComponent
  ],
  providers: [
    TaskService,
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ]
})
export class TaskModule { }
