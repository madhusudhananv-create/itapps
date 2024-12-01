import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StaffingSummaryComponent} from '../staffing-summary/staffing-summary.component';
import {RiskDetailsComponent} from '../../controls/risk-details/risk-details.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardCustomerComponent } from './dashboard-customer/dashboard-customer.component';
import { DashboardPortfolioComponent } from './dashboard-portfolio/dashboard-portfolio.component';
import { DashboardProjectComponent } from './dashboard-project/dashboard-project.component';
import { DashboardCustomerMultipleComponent } from './dashboard-customer-multiple/dashboard-customer-multiple.component';
import { DashboardProjectMultipleComponent } from './dashboard-project-multiple/dashboard-project-multiple.component';
import { SharedModule } from '../../Shared/shared.module';
import { IssueDetailsComponent } from './dashboard-customer/issue-details/issue-details.component';
import { ActionItemsComponent } from './dashboard-customer/action-items/action-items.component';
import { IdeasDetailsComponent } from './dashboard-customer/ideas-details/ideas-details.component';
import { AddNotesComponent } from './dashboard-customer/add-notes/add-notes.component';
import { ProjectStatusComponent } from '../layout/project-status/project-status.component';
import { CSMDashboardComponent } from "../../pages/dashboard/csmdashboard/csmdashboard.component";
import { COODashboardComponent } from "../../pages/dashboard/coodashboard/coodashboard.component";
import { DashboardTopMgmtComponent } from './dashboard-top-mgmt/dashboard-top-mgmt.component';
import { DashboardprojectstatusComponent } from './dashboard-customer/dashboardprojectstatus/dashboardprojectstatus.component';
import { VoiceOfCustomerComponent } from './dashboard-customer/voice-of-customer/voice-of-customer.component';
import { StaffingSummaryDetailsComponent } from './dashboard-top-mgmt/staffing-summary-details/staffing-summary-details.component';
import { VocpopupComponent } from './dashboard-customer/voice-of-customer/vocpopup/vocpopup.component';
import { ServicedeliveryhealthComponent } from './dashboard-top-mgmt/servicedeliveryhealth/servicedeliveryhealth.component';
import { CSSNPSTrendComponent } from './dashboard-top-mgmt/css-nps-trend/css-nps-trend.component';
import { CSSNPSDetailsTableComponent } from './dashboard-top-mgmt/cssnpsdetails-table/cssnpsdetails-table.component';
import { KaizenBoardComponent } from './dashboard-top-mgmt/kaizen-board/kaizen-board.component';
import { IdeasPopupComponent } from './dashboard-top-mgmt/kaizen-board/ideas-popup/ideas-popup.component';
import { KPITrendComponent } from './dashboard-customer/kpitrend/kpitrend.component';
import { DashboardNavigationComponent } from './dashboard-navigation/dashboard-navigation.component';
import { BvdDashboardModule } from '../bvd-dashboard/bvd-dashboard.module';
import { ProductKpiDetailsComponent } from './dashboard-customer/product-kpi-details/product-kpi-details.component';
import { DashboardPreviousNextComponent } from './dashboard-previous-next/dashboard-previous-next.component';
import { DashboardCustomerPage2Component } from './dashboard-customer-page2/dashboard-customer-page2.component';
import { DashboardPremierComponent } from './dashboard-premier/dashboard-premier.component';
//import { CssdashboardPremierComponent } from './cssdashboard-premier/cssdashboard-premier.component';
import { CssdashboardComponent } from './cssdashboard/cssdashboard.component';
import { ViewCssDetailsComponent } from './cssdashboard/view-css-details/view-css-details.component';
import { CssdashboardFilterComponent } from './cssdashboard/cssdashboard-filter/cssdashboard-filter.component';
import { DashboardPortfolioAchievementDetailComponent } from './dashboard-premier/dashboard-portfolio-achievement-detail/dashboard-portfolio-achievement-detail.component';
import { ViewTrendChartComponent } from './dashboard-premier/view-trend-chart/view-trend-chart.component';
import { ChartModule } from 'angular-highcharts';
import { CssdashboardNextPage2Component } from './cssdashboard/cssdashboard-next-page2/cssdashboard-next-page2.component';
import { DashboardAssessmentFindingsComponent } from './dashboard-assessment-findings/dashboard-assessment-findings.component';
import { ViewAssessmentFindingDetailsComponent } from './dashboard-assessment-findings/view-assessment-finding-details/view-assessment-finding-details.component';
import { AchievementtrendComponent } from './dashboard-customer/Achievementtrend/Achievementtrend.component';
//import { ServiceImprovementPlanDetailsComponent } from './dashboard-premier/service-improvement-plan-details/service-improvement-plan-details.component';
import { DashboardEngagementLevelAchievementDetailComponent } from './dashboard-premier/dashboard-engagement-level-achievement-detail/dashboard-engagement-level-achievement-detail.component';
import { DashboardCustomerNextPageComponent } from './dashboard-customer-next-page/dashboard-customer-next-page.component';
import { DashboardSuccessJourneyComponent } from './dashboard-success-journey/dashboard-success-journey.component';
import { AppreciationWidgetSourceComponent } from '../../controls/appreciation-widget-source/appreciation-widget-source.component';
import { ProjectFileUploadComponent } from './project-file-upload/project-file-upload.component';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    BvdDashboardModule,
    ChartModule    ,

  ],
  declarations: [
    DashboardCustomerMultipleComponent,
    DashboardCustomerComponent,
    DashboardPortfolioComponent,
    DashboardProjectMultipleComponent,
    DashboardProjectComponent,
    IssueDetailsComponent,
    ActionItemsComponent,
    CSMDashboardComponent,
    COODashboardComponent,
    ProjectStatusComponent,
    IdeasDetailsComponent,
    AddNotesComponent,
    DashboardTopMgmtComponent,
    DashboardprojectstatusComponent,
    VoiceOfCustomerComponent,
    StaffingSummaryDetailsComponent,
    CSSNPSDetailsTableComponent,
    CSSNPSTrendComponent,
    VocpopupComponent,
    ServicedeliveryhealthComponent,
    KaizenBoardComponent,
    IdeasPopupComponent,
    KPITrendComponent,
    AchievementtrendComponent,
    DashboardNavigationComponent,
    ProductKpiDetailsComponent,
    DashboardPreviousNextComponent,
    DashboardCustomerPage2Component,
    DashboardPremierComponent,
    CssdashboardComponent,
    //CssdashboardPremierComponent,
    ViewCssDetailsComponent,
    CssdashboardFilterComponent,
    DashboardPortfolioAchievementDetailComponent,
    ViewTrendChartComponent,
    DashboardAssessmentFindingsComponent,
    ViewAssessmentFindingDetailsComponent,
    //ServiceImprovementPlanDetailsComponent,
    DashboardEngagementLevelAchievementDetailComponent,
    DashboardCustomerNextPageComponent,
    DashboardSuccessJourneyComponent,
    AppreciationWidgetSourceComponent,
    ProjectFileUploadComponent 

  ],
  entryComponents :[IssueDetailsComponent,VocpopupComponent, ActionItemsComponent, ProjectStatusComponent, IdeasDetailsComponent, AddNotesComponent, IdeasPopupComponent, KPITrendComponent, AchievementtrendComponent , ProductKpiDetailsComponent,ViewCssDetailsComponent,DashboardPortfolioAchievementDetailComponent,ViewTrendChartComponent,ViewAssessmentFindingDetailsComponent,DashboardEngagementLevelAchievementDetailComponent, AppreciationWidgetSourceComponent]
})
export class DashboardModule { }
