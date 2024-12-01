import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BvdEntryComponent } from './bvd-entry.component';
import { IdeasListViewComponent } from './ideas-list-view/ideas-list-view.component';

const routes: Routes = [
    { path: 'cust/:customerid/:reset/listview/entry', component: BvdEntryComponent, pathMatch: "full" },
    { path: 'cust/:customerid/:reset/listview', component: IdeasListViewComponent, pathMatch: "full" },
    { path: 'cust/:customerid/:reset/listview/:Ideaid',component:IdeasListViewComponent,pathMatch:"full"},
    { path: 'allcust/listview',component:IdeasListViewComponent,pathMatch:"full"},
    { path: 'allcust/listview/:customerid/:projid/:Ideaid/:isvieworapproveorreject',component:IdeasListViewComponent,pathMatch:"full"}

    
    // { path: 'premier/cust/:customerid/:reset/listview', component: IdeasListViewComponent, pathMatch: "full" },
    // { path: 'premier/cust/:customerid/:reset/listview/entry', component: BvdEntryComponent, pathMatch: "full" }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BvdEntryRouting { }
