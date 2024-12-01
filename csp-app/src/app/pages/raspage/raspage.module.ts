import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RASPageRoutingModule } from './raspage-routing.module';
import { RASPageComponent } from './raspage.component';
import { CustomerComponent } from './customer/customer.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ResourceDetailsComponent } from './resource-details/resource-details.component';
import { SharedModule } from '../../Shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EmployeeComponent } from './employee/employee.component';
import { CustomerModel } from '../../models/customer-model';
import { PortfolioUiComponent } from './portfolio-ui/portfolio-ui.component';

@NgModule({
  imports: [
    CommonModule,
    RASPageRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [
    RASPageComponent,
    CustomerComponent,
    CustomerListComponent,
    CustomerDetailsComponent,
    ProjectDetailsComponent,
    ProjectListComponent,
    ResourceDetailsComponent,
    EmployeeComponent,
    PortfolioUiComponent,
  ]
})
export class RASPageModule {
  
}
