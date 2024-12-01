import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RASPageComponent } from '../../pages/raspage/raspage.component';
import { CustomerComponent } from '../../pages/raspage/customer/customer.component';
import { EmployeeComponent } from '../../pages/raspage/employee/employee.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { PortfolioUiComponent } from './portfolio-ui/portfolio-ui.component';

const routes: Routes = [
  {
    path: '',
    component: RASPageComponent,
    children: [
      {
        path: 'employee',
        component: EmployeeComponent
      },
      {
        path: 'customer',
        component: CustomerComponent,        
      },
      { 
        // path: 'project/:custid/:projid/:projname',       
        path: 'project/:projid',
        component: ProjectDetailsComponent,        
      },
      {        
        path: 'addproject',
        component: ProjectDetailsComponent,        
      },
      {        
        path: 'portfolios',
        component: PortfolioUiComponent,        
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RASPageRoutingModule { }
