import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
//import { TokenInterceptor } from './services/token-interceptor';
import { CSMDashboardRouting } from './csm-dashboard.routing';
import { SharedModule } from '../../Shared/shared.module';
import { CSMDashboardComponent } from './csm-dashboard.component';
import { DashboardNavComponent } from './dashboard-nav/dashboard-nav.component';
import { CustomerNavigationComponent } from './customer-navigation/customer-navigation.component';
import { DashboardSidenavComponent } from './dashboard-sidenav/dashboard-sidenav.component';
import { DashboardFilterComponent } from './dashboard-filter/dashboard-filter.component';

import { CsmCustomerDashboardComponent } from './csm-customer-dashboard/csm-customer-dashboard.component';
import { CssFeedbackComponent } from './css-feedback/css-feedback.component';
import { CsmNotificationsComponent } from './csm-notifications/csm-notifications.component';
import { TakeSurveyFeedbackComponent } from './css-feedback/take-survey-feedback/take-survey-feedback.component';
import { CSMDashboardService } from './csmdashboard.service';
import { BvdDashboardModule } from '../bvd-dashboard/bvd-dashboard.module';
import { KPITrendComponent } from '../dashboard/dashboard-customer/kpitrend/kpitrend.component';
import { IdeasPopupComponent } from '../dashboard/dashboard-top-mgmt/kaizen-board/ideas-popup/ideas-popup.component';
import { AddNotesComponent } from '../dashboard/dashboard-customer/add-notes/add-notes.component';
import { IdeasDetailsComponent } from '../dashboard/dashboard-customer/ideas-details/ideas-details.component';
import { ProjectStatusComponent } from '../layout/project-status/project-status.component';
import { ActionItemsComponent } from '../dashboard/dashboard-customer/action-items/action-items.component';
import { VocpopupComponent } from '../dashboard/dashboard-customer/voice-of-customer/vocpopup/vocpopup.component';
import { IssueDetailsComponent } from '../dashboard/dashboard-customer/issue-details/issue-details.component';
import { DashboardModule } from '../dashboard/dashboard.module';
import { BvdEntryModule } from '../bvd-entry/bvd-entry.module';
import { RiskchartComponent } from '../../controls/risk-chart/risk-chart.component';
import { IssueProgressStatusComponent } from './csm-customer-dashboard/issue-progress-status/issue-progress-status.component';

@NgModule({
    imports: [
        CommonModule,
        CSMDashboardRouting,
        SharedModule,
        BvdDashboardModule,
        DashboardModule,
        BvdEntryModule
        
    ],
    declarations:[
        CSMDashboardComponent,
        DashboardNavComponent,
        CustomerNavigationComponent,
        DashboardNavComponent,
        DashboardSidenavComponent,
        DashboardFilterComponent,
        CssFeedbackComponent,
        CsmCustomerDashboardComponent,
        CsmNotificationsComponent,
        TakeSurveyFeedbackComponent,
        IssueProgressStatusComponent
    ],
    entryComponents :[IssueDetailsComponent,VocpopupComponent, ActionItemsComponent, ProjectStatusComponent, IdeasDetailsComponent, AddNotesComponent, IdeasPopupComponent, KPITrendComponent,RiskchartComponent,IssueProgressStatusComponent]
})

export class CSMDashboardModule { }