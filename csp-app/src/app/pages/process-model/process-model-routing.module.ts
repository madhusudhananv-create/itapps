import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProcessModelComponent } from '../../pages/process-model/process-model.component';
import { AuditPlanComponent } from '../../pages/process-model/audit-plan/audit-plan.component';
import { TaskComponent } from '../../pages/process-model/task/task.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { ProcessModelMainComponent } from './process-model-main/process-model-main.component';
import { TaskEventPageComponent } from './task/task-event-page/task-event-page.component';

const routes: Routes = [{
  path: '',
  component: ProcessModelComponent,
  children: [
    {
      path: 'auditplanner',
      component: AuditPlanComponent
    }
  ]
},
{ path: 'sqahelp', component: HelpPageComponent },
//{ path: 'planner', loadChildren: './pages/process-model/task/task.module#TaskModule' }
{ path: 'planner/:custid', component: TaskComponent },
{ path: 'viewtaskevents/:custid', component: TaskEventPageComponent },
{ path: 'viewtaskevents/:custid/:period', component: TaskEventPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessModelRoutingModule { }
