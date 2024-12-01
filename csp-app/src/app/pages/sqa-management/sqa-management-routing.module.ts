import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SqaManagementPageComponent } from './sqa-management-page/sqa-management-page.component';

const routes: Routes = [{
  path: '',
  component: SqaManagementPageComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SqaManagementRoutingModule { }
