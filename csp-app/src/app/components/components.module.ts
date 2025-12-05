import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { ModuleWithProviders } from '@angular/core';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MaterialModule } from '../Shared/material.module';
import { ProjectSelectorComponent } from '../controls/project-selector/project-selector.component';
import { MonthandyearpickerComponent } from '../controls/monthandyearpicker/monthandyearpicker.component';
import { EmployeeSearchComponent } from './employee-search/employee-search.component';
import { NavbarNewComponent } from './navbar-new/navbar-new.component';
import { TableFilterComponent } from '../controls/table-filter/table-filter.component';
import { ProjectSelectorMultipleComponent } from '../controls/project-selector-multiple/project-selector-multiple.component';
import { MenuComponent } from './menu/menu.component';
import { SubprojectComponent } from '../controls/subproject/subproject.component';
import { TimesheetComponent } from '../controls/timesheet/timesheet.component';
import { TimesheetCustomerComponent } from '../controls/timesheet/timesheet-customer/timesheet-customer.component';
import { TimesheetEmployeeComponent } from '../controls/timesheet/timesheet-employee/timesheet-employee.component';
import { TimesheetTeamComponent } from '../controls/timesheet/timesheet-team/timesheet-team.component';
import { TimesheetReportsComponent } from '../controls/timesheet/timesheet-reports/timesheet-reports.component';
import { TimesheetReportsHistoricalComponent } from '../controls/timesheet/timesheet-report-historical/timesheet-reports-historical.component';
import { TimesheetManagerComponent } from '../controls/timesheet/timesheet-manager/timesheet-manager.component';
import { TimesheetCustomerForapprovalComponent } from '../controls/timesheet/timesheet-customer-forapproval/timesheet-customer-forapproval.component';
import { TimesheetPageNewComponent } from '../pages/layout/timesheet-page-new/timesheet-page-new.component';
import { MatButtonModule, MatDatepickerModule, MatInputModule, MatDialogModule } from '@angular/material';
import { PortfolioProjectSelectorComponent } from '../controls/portfolio-project-selector/portfolio-project-selector.component';
import{ PortfolioProjectSelectorSingleComponent} from '../controls/portfolio-project-selector-single/portfolio-project-selector-single.component';
import { EnterpriseIssuesEscalationsComponent } from '../controls/enterprise-issues-escalations/enterprise-issues-escalations.component';
import { EnterpriseServiceDeliveryHealthComponent } from '../controls/enterprise-service-delivery-health/enterprise-service-delivery-health.component';
import { EnterpriseCssComponent } from '../controls/enterprise-css/enterprise-css.component';
import { EnterpriseNpsComponent } from '../controls/enterprise-nps/enterprise-nps.component';
import {HighchartsChartComponent} from '../controls/highcharts-chart/highcharts-chart.component';
import { HeaderComponent } from '../pages/header/header.component';
import { TimesheetReportsHomeComponent } from '../pages/layout/timesheet-page-new/timesheet-reports-home/timesheet-reports-home.component';
import { TimesheetHomeComponent } from '../pages/layout/timesheet-page-new/timesheet-home/timesheet-home.component';
import { NgPipesModule } from 'ngx-pipes';
import { TimesheetDialogPopupComponent } from '../pages/layout/timesheet-page-new/timesheet-dialog-popup/timesheet-dialog-popup.component';
import { SurveyComponent } from '../customer/survey/survey.component';
import { StarRatingComponent } from '../customer/star-rating/star-rating.component';
import { ViewTemplateComponent } from '../controls/view-template/view-template.component';
import { AccesscontrolManagementComponent } from './accesscontrol-management/accesscontrol-management.component';
import{NewpageComponent} from './newpage/newpage.component';
//import { PortfolioProjectFilterComponent } from './portfolio-project-filter/portfolio-project-filter.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    NgPipesModule,
    MatDialogModule
    //NavbarComponent,
    //NavbarMenuComponent,
    //SidebarComponent
  ],
  exports: [
    NavbarComponent,
    NavbarNewComponent,
    NavbarMenuComponent,
    ProjectSelectorComponent,
    MonthandyearpickerComponent,
    EmployeeSearchComponent,
    TableFilterComponent,
    ProjectSelectorMultipleComponent,
    HighchartsChartComponent,
    PortfolioProjectSelectorComponent,
    PortfolioProjectSelectorSingleComponent,
    MenuComponent,
    SubprojectComponent,    
    TimesheetComponent,
    TimesheetCustomerComponent,
    TimesheetEmployeeComponent, 
    TimesheetTeamComponent,
    TimesheetReportsHistoricalComponent,
    TimesheetManagerComponent,
    TimesheetCustomerForapprovalComponent,
    TimesheetPageNewComponent,
    TimesheetReportsHomeComponent,
    TimesheetHomeComponent,
    HeaderComponent,
    EnterpriseIssuesEscalationsComponent, 
    EnterpriseServiceDeliveryHealthComponent,
     EnterpriseCssComponent, 
     EnterpriseNpsComponent,
     SurveyComponent,StarRatingComponent,
     ViewTemplateComponent,
     AccesscontrolManagementComponent,
     NewpageComponent
    // SidebarComponent
  ],
  declarations: [
    NavbarComponent,
    NavbarNewComponent,
    NavbarMenuComponent,
    ProjectSelectorComponent,
    MonthandyearpickerComponent,
    EmployeeSearchComponent,
    TableFilterComponent,
    ProjectSelectorMultipleComponent,
    PortfolioProjectSelectorComponent,
    HighchartsChartComponent,
    PortfolioProjectSelectorSingleComponent,
    MenuComponent,
    SubprojectComponent,
    TimesheetComponent,
    TimesheetCustomerComponent,
    TimesheetEmployeeComponent,
    TimesheetPageNewComponent,
    TimesheetReportsHomeComponent,
    TimesheetHomeComponent,
    TimesheetEmployeeComponent,
    HeaderComponent,
    TimesheetTeamComponent,
    TimesheetReportsComponent,
    TimesheetReportsHistoricalComponent,
    TimesheetManagerComponent,
    TimesheetCustomerForapprovalComponent,
    EnterpriseIssuesEscalationsComponent, 
    EnterpriseServiceDeliveryHealthComponent,
     EnterpriseCssComponent, 
     EnterpriseNpsComponent,
     TimesheetDialogPopupComponent,
     SurveyComponent,StarRatingComponent,
     ViewTemplateComponent,
     AccesscontrolManagementComponent,
     NewpageComponent
    //PortfolioProjectFilterComponent
  ],
  entryComponents: [
    TimesheetDialogPopupComponent
  ]  
})
export class ComponentsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ComponentsModule,
      providers: [
        NavbarComponent,
        NavbarNewComponent,
        NavbarMenuComponent,
        ProjectSelectorComponent,
        MonthandyearpickerComponent,
        EmployeeSearchComponent,
        TableFilterComponent,
        SubprojectComponent,
        AccesscontrolManagementComponent,
        NewpageComponent
      ]
    };
  }
}
