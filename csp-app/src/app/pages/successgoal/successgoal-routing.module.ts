import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuccessgoalComponent } from './successgoal.component';

const routes : Routes = [
    { path: 'goals/:custid/:projid', component: SuccessgoalComponent },
    { path: 'goals/:custid/:projid/:goalid', component: SuccessgoalComponent },
    { path: 'goals/:custid/:projid/:month/:year', component: SuccessgoalComponent },
    { path: 'goals/:custid/:projid/:goalid/:month/:year', component: SuccessgoalComponent },
    { path: 'metric/:custid/:prodid/:modeid/:month/:year', component: SuccessgoalComponent },  
    { path: 'metric/:custid/:prodid/:modeid/:month/:year/:flagValue/:capaStageId', component: SuccessgoalComponent },
    { path: 'metric/:custid/:prodid/:modeid/:month/:year/:d', component: SuccessgoalComponent }        
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class SuccessgoalRoutingModule { }