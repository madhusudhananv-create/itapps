import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BvdDashboardComponent } from './bvd-dashboard.component';
import { IdeasListViewComponent } from '../bvd-entry/ideas-list-view/ideas-list-view.component';
import { BvdEntryComponent } from '../bvd-entry/bvd-entry.component';


const routes: Routes = [

    { path: '', component: BvdDashboardComponent },
    //{ path: 'cust/:customerid/:reset/listview/entry', component: BvdEntryComponent }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BvdDashboardRouting { }