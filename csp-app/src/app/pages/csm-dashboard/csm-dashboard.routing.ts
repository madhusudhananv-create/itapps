import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IdeasListViewComponent } from '../bvd-entry/ideas-list-view/ideas-list-view.component';
import { CSMDashboardComponent } from './csm-dashboard.component';
import { CssFeedbackComponent } from './css-feedback/css-feedback.component';

const routes: Routes = [
    {path:'',component:CSMDashboardComponent},
    {path:'cssfeedback',component:CssFeedbackComponent},
    {path:'listview',component:IdeasListViewComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})

export class CSMDashboardRouting { }