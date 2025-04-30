import "../polyfills";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
import { HttpClientModule } from "@angular/common/http";
import { NgxPaginationModule } from "ngx-pagination";
import { AppRoutingModule } from "./app-routing.module";
import { CONST_ROUTING } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MenuComponent } from "./menu.component";
import { ProjectComponent } from "./project/project.component";
import { ScopeComponent } from "./project/tabs/scope/scope.component";
import { DeliveryComponent } from "./project/tabs/delivery/delivery.component";
import { PeopleComponent } from "./project/tabs/people/people.component";
import { ProcessComponent } from "./project/tabs/process/process.component";
import { RiskComponent } from "./project/tabs/risk/risk.component";
import { IssueComponent } from "./project/tabs/issue/issue.component";
import { ValueaddsComponent } from "./project/tabs/valueadds/valueadds.component";
import { ActionitemComponent } from "./project/tabs/actionitem/actionitem.component";
//import { RiskchartComponent } from "./controls/risk-chart/risk-chart.component";
import { RiskDetailsComponent } from "./controls/risk-details/risk-details.component";
import { LoginComponent } from "./authentication/login/login.component";
import { ActivationComponent } from "./customer/activation/activation.component";

//Controls
import { Tab } from "./controls/tab/tab";
import { Tabs } from "./controls/tab/tabs";
import {
  FileSelectDirective,
  FileDropDirective,
  FileUploader,
} from "ng2-file-upload/ng2-file-upload";
import { CdkTableModule } from "@angular/cdk/table";
//Model
import { Configuration } from "./services/app.configuration";
import { myUtility } from "./Shared/myUtility";

import { Ng4LoadingSpinnerModule } from "ng4-loading-spinner";
//Navigation
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { FooterComponent } from "./components/footer/footer.component";

//Tab references
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

//import { Ng2GoogleChartsModule } from 'ng2-google-charts';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatChipsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatGridListModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTreeModule,
  MatIconModule,
  MatDatepickerModule,

} from "@angular/material";

// Google charts Reference
import { GoogleChartsModule } from "angular-google-charts";

import { AppsService } from "./Services/apps.service";
import { ScopeModel } from "./models/scope-model";
import { InviteComponent } from "./customer/invite/invite.component";
import { DialogYesNoComponent } from "./controls/dialog-yes-no/dialog-yes-no.component";
import { MatspinnerComponent } from "./controls/matspinner/matspinner.component";
import { FeedbackComponent } from "./customer/feedback/feedback.component";
import { ContactsComponent } from "./customer/contacts/contacts.component";
import { InnovationComponent } from "./project/tabs/innovation/innovation.component";
import { SuccessComponent } from "./project/tabs/success/success.component";
import { RouterModule } from "@angular/router";
import { PasswordsetComponent } from "./authentication/passwordset/passwordset.component";
import { PasswordforgotComponent } from "./authentication/passwordforgot/passwordforgot.component";
import { MaindashboardComponent } from "./project/maindashboard/maindashboard.component";
import { ChartsCtrl } from "./controls/charts";
//import { ChartsModule } from 'ng2-charts';
import { ChartsService } from "./Services/charts.service";
import * as Highcharts from "highcharts";
import * as highchartsPareto from "highcharts/modules/pareto";
import * as highchartsParallel from "highcharts/modules/parallel-coordinates";

import { ChartModule } from "angular-highcharts";
import { HighchartsChartComponent } from "./controls/highcharts-chart/highcharts-chart.component";

import { KpiComponent } from "./controls/kpi/kpi.component";
import { KpiGoalsComponent } from "./controls/kpi/kpi-goals/kpi-goals.component";
import { KpiDefinitionsComponent } from "./controls/kpi/kpi-definitions/kpi-definitions.component";
import {
  KpiDetailsComponent,
  KPIDetailsPopUp,
} from "./controls/kpi/kpi-details/kpi-details.component";
import { KpiProductViewComponent } from './controls/kpi/kpi-product-view/kpi-product-view.component';
import { HighlightComponent } from "./project/maindashboard/highlight/highlight.component";
import { CrispComponent } from "./controls/crisp/crisp.component";
import { CrispCategoryComponent } from "./controls/crisp/crisp-category/crisp-category.component";
import { CrispCriteriaComponent } from "./controls/crisp/crisp-criteria/crisp-criteria.component";
import { EwsystemComponent } from "./ewsystem/ewsystem.component";
import { GovernancedashboardComponent } from "./governancedashboard/governancedashboard.component";
import { CrispValidationsComponent } from "./controls/crisp/crisp-validations/crisp-validations.component";
import { CrispScoresValidationsComponent } from "./controls/crisp/crisp-scores-validations/crisp-scores-validations.component";
import { IssuedetailewsComponent } from "./ewsystem/issuedetailews/issuedetailews.component";
import { NeedfocusIssueComponent } from "./project/maindashboard/needfocus-issue/needfocus-issue.component";
import { CompliancedetailsComponent } from "./governancedashboard/compliancedetails/compliancedetails.component";
import { CsmAccessCountComponent } from "./controls/csm-access-count/csm-access-count.component";
import { CrispSummaryComponent } from "./controls/crisp/crisp-summary/crisp-summary.component";
import { CrispSummaryProjectsComponent } from "./controls/crisp/crisp-summary-projects/crisp-summary-projects.component";
import { CrispDialogComponent } from "./controls/crisp/crisp-dialog/crisp-dialog.component";
import { CrispDialogValidationsComponent } from "./controls/crisp/crisp-dialog-validations/crisp-dialog-validations.component";
import { LandingpageComponent } from "./authentication/landingpage/landingpage.component";
import { CrispProjectStatusChartComponent } from "./controls/crisp/crisp-project-status-chart/crisp-project-status-chart.component";
import { CsatDetailsComponent } from "./governancedashboard/csat-details/csat-details.component";
import { RoledetailsComponent } from "./roledetails/roledetails.component";
import { AccessControl } from "./Shared/accessControl";
import { AccessControlScreenComponent } from "./controls/access-control/access-control-screen/access-control-screen.component";
import { ProjforecastDetailsComponent } from "./governancedashboard/projforecast-details/projforecast-details.component";
import { AccessControlComponent } from "./controls/access-control/access-control.component";
import { AccessControlRoleComponent } from "./controls/access-control/access-control-role/access-control-role.component";
import { AccessControlEmployeeComponent } from "./controls/access-control/access-control-employee/access-control-employee.component";
import { AccessControlCustomerComponent } from "./controls/access-control/access-control-customer/access-control-customer.component";
import { ProjectSelectorMultipleComponent } from "./controls/project-selector-multiple/project-selector-multiple.component";
import { AppServiceOthers } from "./Services/apps.service.other";
import { CrispScoresEntryComponent } from "./controls/crisp/crisp-scores-entry/crisp-scores-entry.component";
import { GovernancePageComponent } from "./governancedashboard/governance-page/governance-page.component";
import { KpiPageComponent } from "./controls/kpi/kpi-page/kpi-page.component";
import { AccessControlProjectPageComponent } from "./controls/access-control-project-page/access-control-project-page.component";
import { AccessControlProjectComponent } from "./controls/access-control-project-page/access-control-project/access-control-project.component";
import { CustomerPageComponent } from "./customer/customer-page/customer-page.component";
import { MinutesofmeetingComponent } from "./minutesofmeeting/minutesofmeeting.component";
//import { ProjectListComponent } from './controls/ras/project-list/project-list.component';
import { SqaManagementPageComponent } from "./pages/sqa-management/sqa-management-page/sqa-management-page.component";
import { SqaManagementUploadComponent } from "./pages/sqa-management/sqa-management-upload/sqa-management-upload.component";
import { SqaManagementSetupComponent } from "./pages/sqa-management/sqa-management-setup/sqa-management-setup.component";
import { SqaManagementViewchartsComponent } from "./pages/sqa-management/sqa-management-viewcharts/sqa-management-viewcharts.component";
import { AccessControlProjectResourceComponent } from "./controls/access-control-project-page/access-control-project-resource/access-control-project-resource.component";
import { RiskClickDetailComponent } from "./project/tabs/risk/risk-click-detail/risk-click-detail.component";
import { TimesheetComponent } from "./controls/timesheet/timesheet.component";
import { TimesheetCustomerComponent } from "./controls/timesheet/timesheet-customer/timesheet-customer.component";
import { TimesheetEmployeeComponent } from "./controls/timesheet/timesheet-employee/timesheet-employee.component";
import { BestPracticesComponent } from "./project/tabs/best-practices/best-practices.component";
import { LessonsLearnedComponent } from "./project/tabs/lessons-learned/lessons-learned.component";
import { TimesheetTeamComponent } from "./controls/timesheet/timesheet-team/timesheet-team.component";
import { TimesheetReportsComponent } from "./controls/timesheet/timesheet-reports/timesheet-reports.component";
import { TimesheetReportsHistoricalComponent } from "./controls/timesheet/timesheet-report-historical/timesheet-reports-historical.component";
import { BestpracticeMatrixComponent } from "./bestpractice-matrix/bestpractice-matrix.component";
import { IdeasInnovationMatrixComponent } from "./ideas-innovation-matrix/ideas-innovation-matrix.component";
import { DataAnalysisComponent } from "./project/tabs/data-analysis/data-analysis.component";
import { CsatdashboardComponent } from "./csatdashboard/csatdashboard.component";
import { TimesheetManagerComponent } from "./controls/timesheet/timesheet-manager/timesheet-manager.component";
import { KaizenDashboardComponent } from "./project/kaizen-dashboard/kaizen-dashboard.component";
import { GrcsystemComponent } from "./grcsystem/grcsystem.component";
import { ComplianceInsightsComponent } from "./pages/sqa-management/sqa-management-upload/compliance-insights/compliance-insights.component";
import { ProjectLayoutComponent } from "./containers/project-layout/project-layout.component";
import { SubprojectComponent } from "./controls/subproject/subproject.component";
// import { CsatdashboardComponent } from './csatdashboard/csatdashboard.component';
import { EmployeeWiseComponentInfoComponent } from "./pages/sqa-management/sqa-management-upload/employee-wise-component-info/employee-wise-component-info.component";
import { ProjectSelectorSingletomultipleComponent } from "./controls/project-selector-singletomultiple/project-selector-singletomultiple.component";
//import { SurveyComponent } from "./customer/survey/survey.component";
import { StaffingSummaryComponent } from "./pages/staffing-summary/staffing-summary.component";
import { ProjectDetailComponent } from "./pages/staffing-summary/project-detail/project-detail.component";
import { PortfoliodashboardComponent } from "./governancedashboard/portfoliodashboard/portfoliodashboard.component";
import { KpiChartsComponent } from "./governancedashboard/popup/kpi-charts/kpi-charts.component";
import { SharedModule } from "./Shared/shared.module";
import { MaterialModule } from "./Shared/material.module";
//import { TableFilterComponent } from './controls/table-filter/table-filter.component';
import { TimesheetCustomerForapprovalComponent } from "./controls/timesheet/timesheet-customer-forapproval/timesheet-customer-forapproval.component";
import { createComponent } from "@angular/compiler/src/core";
import { ComponentsModule } from "./components/components.module";
import { NavbarNewComponent } from "../app/components/navbar-new/navbar-new.component";
import { LayoutModule } from "@angular/cdk/layout";
import { OverviewComponent } from "../app/overview/overview.component";
import { PortfolioProjectSelectorComponent } from "./controls/portfolio-project-selector/portfolio-project-selector.component";
import { SharedService } from "./Shared/shared.service";
import { EnterpriseIssuesEscalationsComponent } from "./controls/enterprise-issues-escalations/enterprise-issues-escalations.component";
import { EnterpriseServiceDeliveryHealthComponent } from "./controls/enterprise-service-delivery-health/enterprise-service-delivery-health.component";
import { EnterpriseCssComponent } from "./controls/enterprise-css/enterprise-css.component";
import { EnterpriseNpsComponent } from "./controls/enterprise-nps/enterprise-nps.component";
import { ProjectsKPIComponent } from "./pages/ProjectsKPI/projects-kpi/projects-kpi.component";
// import { DaterangeComponent, DATERANGE_SCROLL_STRATEGY_PROVIDER } from './controls/daterange/daterange.component';
// import { DaterangeInputDirective } from './directives/daterange-input.directive';
// import { DaterangeContentComponent } from './controls/daterange-content/daterange-content.component';
// import { DaterangeToggleComponent } from './controls/daterange-toggle/daterange-toggle.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { CiTrackerPageComponent } from './pages/ci-tracker-page/ci-tracker-page.component';
import { FmeaManagementComponent } from './pages/fmea-management/fmea-management.component';
import { CiLeaderboardPageComponent } from "./pages/ci-leaderboard-page/ci-leaderboard-page.component";
import { SurveySettingsPageMonthlyComponent } from "./pages/survey/survey-settings-page-monthly/survey-settings-page-monthly.component";
import { SurveySettingsMonthlyComponent } from "./pages/survey/survey-settings-monthly/survey-settings-monthly.component";
import { PortfolioProductSelectorComponent } from './controls/portfolio-product-selector/portfolio-product-selector.component';
import { KpiProductDetailViewComponent } from './controls/kpi/kpi-product-view/kpi-product-detail-view/kpi-product-detail-view.component';
import { BvdDashboardModule } from "./pages/bvd-dashboard/bvd-dashboard.module";
import { KpiFileUploadComponent } from './controls/kpi/kpi-file-upload/kpi-file-upload.component';
import { KpiActionPlanComponent } from './controls/kpi/kpi-action-plan/kpi-action-plan.component';
import { ProductKpiDisputeComponent } from './controls/kpi/kpi-product-view/product-kpi-dispute/product-kpi-dispute.component';
import { COODashboardModule } from "./pages/coo-dashboard/coo-dashboard.module";
import { ConfigextComponentComponent } from './pages/configext-component/configext-component.component';
//import {RiskRepositoryComponent} from './pages/risk-repository/risk-repository.component';
import { AuditqualitystandardsComponent } from './pages/auditqualitystandards/auditqualitystandards.component';
import { CssbatchPopupComponent } from "./pages/survey/cssbatch-popup/cssbatch-popup.component";
import { ExternalKpiDataUploadComponent } from "./controls/kpi/external-kpi-data-upload/external-kpi-data-upload.component";
import { ExternalKpiFormulaUploadComponent } from "./controls/kpi/external-kpi-formula-upload/external-kpi-formula-upload.component";

//import { RiskchartComponent } from "./controls/risk-chart/risk-chart.component";


//import { CSMDashboardComponent } from "./pages/csm-dashboard/csm-dashboard.component";
//import { CustomerNavigationComponent } from "./pages/csm-dashboard/customer-navigation/customer-navigation.component";
//import { DashboardNavComponent } from "./pages/csm-dashboard/dashboard-nav/dashboard-nav.component";
//import { DashboardSidenavComponent } from "./pages/csm-dashboard/dashboard-sidenav/dashboard-sidenav.component";
//import { SideNavService } from "./pages/csm-dashboard/service/side-nav.service";



//import {TableReportComponent} from './'

import { QSPOCPopupComponent } from "./pages/dashboard/qspoc-popup/qspoc-popup.component";
import { ProjectFileUploadComponent } from "./pages/dashboard/project-file-upload/project-file-upload.component";
import { DropdownFilterComponent } from './pages/dropdown-filter/dropdown-filter.component';
import { RiskRepositoryComponent } from './pages/risk-repository/risk-repository.component';
import { SharedData } from "./Shared/sharedData";
import {  GoogleLoginProvider, SocialLoginModule } from "angularx-social-login";
import { environment } from "../environments/environment";
import { RatingCriteriaRemarksComponent } from "./customer/rating-criteria-remarks/rating-criteria-remarks.component";
import { GslabloginComponent } from './authentication/gslablogin/gslablogin.component';
import { assessmentUtility } from "./Shared/assessmentUtility";
import { SurveySettingsVerificationPageComponent } from "./pages/survey/survey-settings-verification-page/survey-settings-verification-page.component";
import { DomainConfigService } from "./Services/app.domain.config";
//import { googleEnvironment } from "../environments/google";


// export function getAuthServiceConfigs() {
//   let config = new getAuthServiceConfigs(
//     [
//       {
//         id: GoogleLoginProvider.PROVIDER_ID,
//         provider: new GoogleLoginProvider(environment.googleClientId)
//       },
//     ]);
//   return config;
// }

@NgModule({
  exports: [
    CdkTableModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTreeModule
  ],
  declarations: [GslabloginComponent],

})

export class DemoMaterialModule { }

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    HttpModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    DemoMaterialModule,
    MaterialModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    CONST_ROUTING,
    Ng4LoadingSpinnerModule.forRoot(),
    ChartModule,
    NgxPaginationModule,
    NgxPaginationModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    GoogleChartsModule,
    ComponentsModule,
    LayoutModule,
    MatMomentDateModule,
    BvdDashboardModule,
    COODashboardModule,
    SocialLoginModule


  ],
  //Ng2GoogleChartsModule,
  declarations: [
    AppComponent,
    MenuComponent,
    ProjectComponent,
    LoginComponent,
    LandingpageComponent,
    MaindashboardComponent,
    OverviewComponent,
    ActivationComponent,
    ScopeComponent,
    DeliveryComponent,
    PeopleComponent,
    ProcessComponent,
    RiskComponent,
    IssueComponent,
    ValueaddsComponent,
    //RiskchartComponent,
    SidebarComponent,
    FooterComponent,
    ActionitemComponent,
    InnovationComponent,
    SuccessComponent,
    InviteComponent,
    Tab,
    Tabs,
    DialogYesNoComponent,
    MatspinnerComponent,
    FeedbackComponent,
    ContactsComponent,
    PasswordsetComponent,
    PasswordforgotComponent,
    RiskDetailsComponent,
    KpiPageComponent,
    KpiComponent,
    KpiProductViewComponent,
    KpiProductDetailViewComponent,
    KpiGoalsComponent,
    KpiDefinitionsComponent,
    KpiDetailsComponent,
    RiskDetailsComponent,
    //RiskchartComponent,
    HighlightComponent,
    CrispComponent,
    CrispCategoryComponent,
    CrispCriteriaComponent,
    EwsystemComponent,
    GovernancedashboardComponent,
    CrispValidationsComponent,
    CrispSummaryComponent,
    CrispSummaryProjectsComponent,
    CrispDialogComponent,
    CrispDialogValidationsComponent,
    CrispProjectStatusChartComponent,
    CrispScoresEntryComponent,
    CrispScoresValidationsComponent,
    IssuedetailewsComponent,
    NeedfocusIssueComponent,
    CompliancedetailsComponent,
    AccessControlScreenComponent,
    AccessControlComponent,
    AccessControlRoleComponent,
    AccessControlEmployeeComponent,
    AccessControlCustomerComponent,
    AccessControlProjectComponent,
    AccessControlProjectResourceComponent,
    ProjforecastDetailsComponent,
    MinutesofmeetingComponent,
    AccessControlProjectComponent,
    AccessControlProjectPageComponent,
    ProjforecastDetailsComponent,
    GovernancePageComponent,
    CustomerPageComponent,
    SqaManagementPageComponent,
    SqaManagementUploadComponent,
    SqaManagementSetupComponent,
    SqaManagementViewchartsComponent,
    RiskClickDetailComponent,
    BestPracticesComponent,
    LessonsLearnedComponent,
    BestpracticeMatrixComponent,
    DataAnalysisComponent,
    IdeasInnovationMatrixComponent,
    KPIDetailsPopUp,
    CsatdashboardComponent,
    KaizenDashboardComponent,
    GrcsystemComponent,
    ComplianceInsightsComponent,
    EmployeeWiseComponentInfoComponent,
    ProjectLayoutComponent,
    KpiChartsComponent,
    PortfoliodashboardComponent,
    ProjectSelectorSingletomultipleComponent,
    PortfolioProductSelectorComponent,
    //SurveyComponent,
    StaffingSummaryComponent,
    ProjectDetailComponent,
    RoledetailsComponent,
    CsatDetailsComponent,
    CsmAccessCountComponent,
    //, TableFilterComponent
    //, TableReportComponent,
    ProjectsKPIComponent,
    CiTrackerPageComponent,
    FmeaManagementComponent,
    CiLeaderboardPageComponent,
    SurveySettingsPageMonthlyComponent,
    SurveySettingsMonthlyComponent,
    SurveySettingsVerificationPageComponent,
    KpiFileUploadComponent, ExternalKpiDataUploadComponent,
    ExternalKpiFormulaUploadComponent,
    KpiActionPlanComponent,
    ProductKpiDisputeComponent,
    ProductKpiDisputeComponent,
    AuditqualitystandardsComponent,
    ConfigextComponentComponent,
    RiskRepositoryComponent,
    CssbatchPopupComponent,
    RatingCriteriaRemarksComponent
  ],
  exports: [StaffingSummaryComponent, ProjectSelectorSingletomultipleComponent],
  bootstrap: [AppComponent],
  providers: [
    Configuration,
    myUtility,
    assessmentUtility,
    AppsService,
    AppServiceOthers,
    HttpClientModule,
    ChartsCtrl,
    ChartsService,
    AccessControl,
    SharedService,
    SharedData,
     DomainConfigService,
      {
        provide: 'SocialAuthServiceConfig',
        useValue: {
          autoLogin: false,
          providers: [
            {
              id: GoogleLoginProvider.PROVIDER_ID,
              provider: new GoogleLoginProvider(
               environment.gavsGoogleClientId
              )
            } ,
          ]}
        } ,

     
         
  ],
  entryComponents: [
    RiskDetailsComponent,
    //RiskchartComponent,
    IssuedetailewsComponent,
    NeedfocusIssueComponent,
    CompliancedetailsComponent,
    CrispDialogComponent,
    CrispDialogValidationsComponent,
    CsatDetailsComponent,
    ProjforecastDetailsComponent,
    MinutesofmeetingComponent,
    RiskClickDetailComponent,
    BestpracticeMatrixComponent,
    IdeasInnovationMatrixComponent,
    KPIDetailsPopUp,
    CsatdashboardComponent,
    EmployeeWiseComponentInfoComponent,
    KpiChartsComponent,
    ProjectDetailComponent,
    KpiProductDetailViewComponent,
    KpiFileUploadComponent, ExternalKpiDataUploadComponent,
    ExternalKpiFormulaUploadComponent,
    KpiActionPlanComponent,
    ProductKpiDisputeComponent,
    CssbatchPopupComponent,
    QSPOCPopupComponent,
    ProjectFileUploadComponent,
    DropdownFilterComponent,
    RatingCriteriaRemarksComponent
    //DaterangeContentComponent
  ], //You need to add dynamically created components to entryComponents inside your @NgModule
})


export class AppModule { }
//platformBrowserDynamic().bootstrapModule(AppModule);
