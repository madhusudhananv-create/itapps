import { NgModule, ModuleWithProviders, Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./authentication/login/login.component";
import { ProjectComponent } from "./project/project.component";
import { OverviewComponent } from "./overview/overview.component";
import { ActivationComponent } from "./customer/activation/activation.component";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { PasswordforgotComponent } from "./authentication/passwordforgot/passwordforgot.component";
import { PasswordsetComponent } from "./authentication/passwordset/passwordset.component";
import { KpiComponent } from "./controls/kpi/kpi.component";
import { HighlightComponent } from "./project/maindashboard/highlight/highlight.component";
import { CrispComponent } from "./controls/crisp/crisp.component";
import { EwsystemComponent } from "./ewsystem/ewsystem.component";
import { GovernancedashboardComponent } from "./governancedashboard/governancedashboard.component";
import { LandingpageComponent } from "./authentication/landingpage/landingpage.component";
import { RoledetailsComponent } from "./roledetails/roledetails.component";
import { AccessControlComponent } from "./controls/access-control/access-control.component";
import { AccessControlProjectPageComponent } from "./controls/access-control-project-page/access-control-project-page.component";
import { CrispScoresEntryComponent } from "./controls/crisp/crisp-scores-entry/crisp-scores-entry.component";
import { GovernancePageComponent } from "./governancedashboard/governance-page/governance-page.component";
import { KpiPageComponent } from "./controls/kpi/kpi-page/kpi-page.component";
import { CustomerPageComponent } from "./customer/customer-page/customer-page.component";
import { AccessControlProjectComponent } from "./controls/access-control-project-page/access-control-project/access-control-project.component";
import { MinutesofmeetingComponent } from "./minutesofmeeting/minutesofmeeting.component";
import { SqaManagementPageComponent } from "./pages/sqa-management/sqa-management-page/sqa-management-page.component";
import { SurveyComponent } from "./customer/survey/survey.component";
//import { TableReportComponent } from './pages/table-report/table-report.component';
import { StaffingSummaryComponent } from "./pages/staffing-summary/staffing-summary.component";
import { ProjectsKPIComponent } from "./pages/ProjectsKPI/projects-kpi/projects-kpi.component";
//import { SurveySettingsPageComponent } from './pages/survey/survey-settings-page/survey-settings-page.component';
import { CiTrackerPageComponent } from "./pages/ci-tracker-page/ci-tracker-page.component";

import { FmeaManagementComponent } from './pages/fmea-management/fmea-management.component';
//import { CSMDashboardComponent } from "./pages/csm-dashboard/csm-dashboard.component";
//import { COODashboardComponent } from "./pages/coo-dashboard/coo-dashboard.component"
import { CiLeaderboardPageComponent } from "./pages/ci-leaderboard-page/ci-leaderboard-page.component";
import { SurveySettingsPageMonthlyComponent } from "./pages/survey/survey-settings-page-monthly/survey-settings-page-monthly.component";
import { NavbarMenuComponent } from "./components/navbar-menu/navbar-menu.component";
import { ConfigextComponentComponent } from "./pages/configext-component/configext-component.component";
import { RiskRepositoryComponent } from "./pages/risk-repository/risk-repository.component";
import { AuditqualitystandardsComponent } from "./pages/auditqualitystandards/auditqualitystandards.component";
import { SqaManagementUploadComponent } from "./pages/sqa-management/sqa-management-upload/sqa-management-upload.component";
import { GslabloginComponent } from "./authentication/gslablogin/gslablogin.component";
import { SurveySettingsComponent } from "./pages/survey/survey-settings/survey-settings.component";
import { SurveySettingsMonthlyComponent } from "./pages/survey/survey-settings-monthly/survey-settings-monthly.component";
import { SurveySettingsVerificationPageComponent } from "./pages/survey/survey-settings-verification-page/survey-settings-verification-page.component";

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
})
export class AppRoutingModule { }

const appRoutes: Routes = [
  //full : makes sure the path is absolute path
 // { path: "", redirectTo: "login", pathMatch: "full" },
  // { path: "login", redirectTo: "login" },
  // { path: "login/:gslab", redirectTo: "login/:gslab" },
  { path: "forgotpassword", component: PasswordforgotComponent },
  { path: "CustomerSuccessSurvey/:code", component: SurveyComponent },
  { path: "setpassword/:email/:code", component: PasswordsetComponent },
  { path: "project", component: ProjectComponent },
  { path: "project/:projectid", component: ProjectComponent },
  { path: "overview", component: OverviewComponent },
  { path: "landingpage", component: LandingpageComponent },
  // { path: "dashboard", component: DashboardComponent },
  //{ path: 'newdashboard', component: DashboardMultipleCustomerComponent },
  { path: "", component: LoginComponent },
  { path: "governancedashboard/:year/:month/:custid/:projid", component: GovernancePageComponent },
  { path: "governancedashboard/:year/:month/:custid", component: GovernancePageComponent },
  { path: "governancedashboard", component: GovernancePageComponent },
  { path: "login", component: LoginComponent },
  { path: "login/:gslab",  component: LoginComponent },
  { path: "activation/:email/:code", component: ActivationComponent },
  {
    path: "activation/:email/:code",
    redirectTo: "activation/:email/:code",
    pathMatch: "full",
  },
  { path: "customerinvite", component: CustomerPageComponent },
  { path: "projectsKPI", component: ProjectsKPIComponent },
  { path: "crispsettings", component: CrispComponent },
  { path: "staffingSummary/:custid", component: StaffingSummaryComponent },
  { path: "crispscores", component: CrispScoresEntryComponent },
  { path: "accesscontrol", component: AccessControlComponent },
  { path: "accesscontrolproj", component: AccessControlProjectPageComponent },
  { path: "configext", component: ConfigextComponentComponent },
  { path: "riskrepository", component: RiskRepositoryComponent },
  //{ path: 'sqamanagement', component: SqaManagementPageComponent },
  { path: "kpi/:custid", component: KpiPageComponent },
  { path: "productkpi/:custid/:portId/:prodId/:modeId/:month/:year/:kpiId", component: KpiPageComponent },
  { path: "highlight/:custId/:projId", component: HighlightComponent },
  { path: "roledetail", component: RoledetailsComponent },
  { path: "mom", component: MinutesofmeetingComponent },
  { path: "auditqualitystandards", component: AuditqualitystandardsComponent },

  {
    path: "newdashboard",
    loadChildren: "./pages/dashboard/dashboard.module#DashboardModule",
  },
  {
    path: "serviceleveldashboard",
    loadChildren: "./pages/dashboard/dashboard.module#DashboardModule",
  },
  {
    path: 'csm-dashboard',
    //component:CSMDashboardComponent
    loadChildren: "./pages/csm-dashboard/csm-dashboard.module#CSMDashboardModule"
  },
  {
    path: 'coo-dashboard',
    //component:COODashboardComponent
    loadChildren: "./pages/coo-dashboard/coo-dashboard.module#COODashboardModule"
  },

  {
    path: "successgoal",
    loadChildren: "./pages/successgoal/successgoal.module#SuccessgoalModule",
  },
  { path: "ras", loadChildren: "./pages/raspage/raspage.module#RASPageModule" },
  { path: "css", loadChildren: "./pages/survey/survey.module#SurveyModule" },
  { path: "cssverification", component: SurveySettingsVerificationPageComponent },
  {
    path: "css/:batchid/:recordid/:isApproveReject",
    component: SurveySettingsComponent
  },
  { path: "cssmonthly", component: SurveySettingsPageMonthlyComponent },
  {
    path: "cssmonthly/:batchid/:recordid/:isApproveReject",
    component: SurveySettingsMonthlyComponent
  },
  {
    path: "reports",
    loadChildren: "./pages/reports/reports.module#ReportsModule",
  },
  {
    path: "sqamanagement",
    loadChildren:
      "./pages/process-model/process-model.module#ProcessModelModule",
  },
  { path: "layout", loadChildren: "./pages/layout/layout.module#LayoutModule" },

  { path: "citracker", component: CiTrackerPageComponent },

  { path: "cileaderboard", component: CiLeaderboardPageComponent },

  { path: "fmeamanagement", component: FmeaManagementComponent },
  {
    path: "complianceinsights",
    component: SqaManagementUploadComponent
  },
  {
    path: "gslablogin",
    component: GslabloginComponent
  },

  // otherwise redirect to home
  //{ path: '**', redirectTo: '' }

];
export const CONST_ROUTING: ModuleWithProviders = RouterModule.forRoot(
  appRoutes
);
