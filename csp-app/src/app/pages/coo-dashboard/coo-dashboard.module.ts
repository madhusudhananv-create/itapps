import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core'
import { HTTP_INTERCEPTORS } from '@angular/common/http';
//import { TokenInterceptor } from './services/token-interceptor';
import { COODashboardRouting } from './coo-dashboard.routing';
import { SharedModule } from '../../Shared/shared.module';
import { COODashboardComponent } from './coo-dashboard.component';
import { DashboardSidenavComponent } from './dashboard-sidenav/dashboard-sidenav.component';
import { DashboardFilterComponent } from './dashboard-filter/dashboard-filter.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { COODashboardService } from './coo-dashboard.service';
import { TabOverallStatusComponent } from './tab-overall-status/tab-overall-status.component';
import { OverallStatusPage1Component } from './tab-overall-status/overall-status-page1/overall-status-page1.component';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'angular-highcharts';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { EwsTableComponent } from './ews-table/ews-table.component';
import { OverallHealthTrendComponent } from './dashboard-controls/overall-health-trend/overall-health-trend.component';
import { AccountHealthViewdetailsComponent } from './dashboard-controls/account-health-viewdetails/account-health-viewdetails.component';
import { DashboardSearchParams } from '../../models/coo-dashboard-model';
import { OverallDashboardStatusComponent } from './overall-dashboard-status/overall-dashboard-status.component';
import { CustomerSuccessgoalChartComponent } from './dashboard-controls/customer-successgoal-chart/customer-successgoal-chart.component';
import { KpiPerspectivesWidgetComponent } from './dashboard-controls/kpi-perspectives-widget/kpi-perspectives-widget.component';
import { CustomerSuccessGoalKPIPerformanceComponent } from './dashboard-controls/customersuccessgoal-kpiperformance/customersuccessgoal-kpiperformance.component';
import { AchievementByCustomerSuccessGoalComponent } from './dashboard-controls/achievementby-customersuccessgoal/achievementby-customersuccessgoal.component';
import { KPITrendByGoalComponent } from './dashboard-controls/kpi-trend-by-goal/kpi-trend-by-goal.component';
import { IssueProgressStatusComponent } from '../csm-dashboard/csm-customer-dashboard/issue-progress-status/issue-progress-status.component';
import { CustomerSuccessSurveyComponent } from './dashboard-controls/customer-success-survey/customer-success-survey.component';
import { QuarterFilterComponent } from './dashboard-controls/quarter-filter/quarter-filter.component';
import { CSSViewdetailsComponent } from './dashboard-controls/css-viewdetails/css-viewdetails.component';
import { Top3PerformingComponent } from './dashboard-controls/top3-performing/top3-performing.component';
import { ContractStatusViewdetailsComponent } from './dashboard-controls/contract-status-viewdetails/contract-status-viewdetails.component';
import { ActionitemsViewdetailsComponent } from './dashboard-controls/actionitems-viewdetails/actionitems-viewdetails.component';
import { RiskIssueViewdetailsComponent } from './dashboard-controls/risk-issue-viewdetails/risk-issue-viewdetails.component';
import { SearchableMultiselectDropdownComponent } from '../../controls/searchable-multiselect-dropdown/searchable-multiselect-dropdown.component';
import { RiskchartControlComponent } from '../../controls/risk-chart-control/risk-chart-control.component';
import { DashboardModule } from '../dashboard/dashboard.module';
//import { ProjectSelectorSingletomultipleComponent } from '../../controls/project-selector-singletomultiple/project-selector-singletomultiple.component';
import { TableFilterComponent } from '../../controls/table-filter/table-filter.component';

//import { ProjectSelectorMultipleComponent } from "../../controls/project-selector-multiple/project-selector-multiple.component";

@NgModule({
    imports: [
        CommonModule,
        COODashboardRouting,
        SharedModule,DashboardModule,
        FormsModule, ChartModule
    ],
    declarations: [
        COODashboardComponent,
        DashboardSidenavComponent,
        DashboardFilterComponent,
        DashboardMainComponent,
        TabOverallStatusComponent,
        OverallStatusPage1Component,
        EwsTableComponent, OverallHealthTrendComponent, AccountHealthViewdetailsComponent, OverallDashboardStatusComponent,
        CustomerSuccessgoalChartComponent, KpiPerspectivesWidgetComponent, AchievementByCustomerSuccessGoalComponent
        , CustomerSuccessGoalKPIPerformanceComponent, KPITrendByGoalComponent, CustomerSuccessSurveyComponent, QuarterFilterComponent,
        CSSViewdetailsComponent, Top3PerformingComponent, ContractStatusViewdetailsComponent, RiskIssueViewdetailsComponent, ActionitemsViewdetailsComponent,
        SearchableMultiselectDropdownComponent,
        //ProjectSelectorSingletomultipleComponent
    ],
    entryComponents: [COODashboardComponent, RiskchartControlComponent, OverallDashboardStatusComponent]
    , schemas:[  CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
        { provide: MatBottomSheet },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
        { provide: MatBottomSheetRef }, OverallStatusPage1Component, AccountHealthViewdetailsComponent, OverallHealthTrendComponent, KPITrendByGoalComponent,
        CSSViewdetailsComponent, Top3PerformingComponent, ContractStatusViewdetailsComponent,
        RiskIssueViewdetailsComponent, ActionitemsViewdetailsComponent, CustomerSuccessGoalKPIPerformanceComponent
        , SearchableMultiselectDropdownComponent, TableFilterComponent
    ], 
    exports: [MatBottomSheetModule, RiskchartControlComponent]
})

export class COODashboardModule { }