import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardCustomerComponent } from './dashboard-customer/dashboard-customer.component';
import { DashboardPortfolioComponent } from './dashboard-portfolio/dashboard-portfolio.component';
import { DashboardProjectComponent } from './dashboard-project/dashboard-project.component';
import { DashboardCustomerMultipleComponent } from './dashboard-customer-multiple/dashboard-customer-multiple.component';
import { DashboardProjectMultipleComponent } from './dashboard-project-multiple/dashboard-project-multiple.component';
import { CSMDashboardComponent } from "../../pages/dashboard/csmdashboard/csmdashboard.component";
import { DashboardTopMgmtComponent } from './dashboard-top-mgmt/dashboard-top-mgmt.component';
import { DashboardNavigationComponent } from './dashboard-navigation/dashboard-navigation.component';
import { DashboardPremierComponent } from './dashboard-premier/dashboard-premier.component';
import { COODashboardComponent } from '../../pages/dashboard/coodashboard/coodashboard.component';

const routes: Routes = [
  { path: 'custm', component: DashboardCustomerMultipleComponent },
  { path: 'enterpriseview', component: DashboardTopMgmtComponent },
  { path: 'cust/:customerid/:reset', component: DashboardNavigationComponent },
  { path: 'csmdashboard', component: CSMDashboardComponent },
  { path: 'coodashboard', component: COODashboardComponent },
  { path: 'cust', component: DashboardCustomerComponent },
  { path: 'port/:customerid', component: DashboardPortfolioComponent },
  { path: 'projm', component: DashboardProjectMultipleComponent },
  { path: 'proj', component: DashboardProjectComponent },
  { path: 'cust/:customerid/:reset',component:DashboardNavigationComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class DashboardRoutingModule { } 
