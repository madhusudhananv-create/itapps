import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportspageComponent } from './reports-page/reportspage.component';

const routes: Routes = [
  {
  path: '',
  component: ReportspageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
