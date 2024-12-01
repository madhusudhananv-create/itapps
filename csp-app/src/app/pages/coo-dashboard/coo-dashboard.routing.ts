import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IdeasListViewComponent } from '../bvd-entry/ideas-list-view/ideas-list-view.component';
import { COODashboardComponent } from './coo-dashboard.component';

const routes: Routes = [
    {path:'',component:COODashboardComponent},
    {path:'listview',component:IdeasListViewComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})

export class COODashboardRouting { }