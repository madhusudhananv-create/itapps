import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { myUtility } from './myUtility';
import { ModuleWithProviders } from '@angular/core';
import { SharedService } from './shared.service';
import { MaterialModule } from './material.module';
import { ComponentsModule } from '../components/components.module';
import { GoogleChartsModule } from 'angular-google-charts';
//import { CssdashboardComponent } from '../pages/dashboard/cssdashboard/cssdashboard.component';
import { RiskchartComponent } from '../controls/risk-chart/risk-chart.component';
import { RiskchartControlComponent } from '../controls/risk-chart-control/risk-chart-control.component';
import { CssDashboardCSSTableComponent } from '../pages/dashboard/cssdashboard/cssdashboard-css-table/cssdashboard-css-table.component';
import { QSPOCPopupComponent } from '../pages/dashboard/qspoc-popup/qspoc-popup.component';
import { CssdashboardNextPage1Component } from '../pages/dashboard/cssdashboard/cssdashboard-next-page1/cssdashboard-next-page1.component';
import { CssdashboardNextPage2Component } from '../pages/dashboard/cssdashboard/cssdashboard-next-page2/cssdashboard-next-page2.component';
import { DropdownFilterComponent } from '../pages/dropdown-filter/dropdown-filter.component';
import { ActionItemsPageComponent } from '../pages/layout/action-items-page/action-items-page.component';
import { MatDialogModule } from '@angular/material/dialog';
import { IssuesPageComponent } from '../pages/layout/issues-page/issues-page.component';
import { RiskPageComponent } from '../pages/layout/risk-page/risk-page.component';
import { RiskPopupComponent } from '../pages/layout/risk-popup/risk-popup.component';
import { RiskTreatmentPopupComponent } from '../pages/layout/risk-treatment-popup/risk-treatment-popup.component';
import { RiskActionItemsComponent } from '../pages/layout/risk-action-items/risk-action-items.component';
import { RiskRepositoryComponent } from '../pages/layout/risk-repository/risk-repository.component';
import { RiskStatementGuidelineComponent } from '../pages/layout/risk-statement-guideline/risk-statement-guideline.component';
import { SurveySettingsComponent } from '../pages/survey/survey-settings/survey-settings.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ComponentsModule,
    GoogleChartsModule,
    MatDialogModule,
  ],
  exports: [
    MaterialModule,
    ComponentsModule,
    GoogleChartsModule,
    //CssdashboardComponent,
    RiskchartComponent,
    RiskchartControlComponent,
    RiskStatementGuidelineComponent,
    CssDashboardCSSTableComponent, QSPOCPopupComponent,
    DropdownFilterComponent,
    CssdashboardNextPage1Component, RiskPageComponent, RiskPopupComponent, RiskTreatmentPopupComponent,
    RiskActionItemsComponent, RiskRepositoryComponent,
    CssdashboardNextPage2Component, ActionItemsPageComponent, IssuesPageComponent, SurveySettingsComponent
  ],
  declarations: [RiskchartComponent, RiskchartControlComponent,RiskStatementGuidelineComponent, CssDashboardCSSTableComponent, QSPOCPopupComponent,
    DropdownFilterComponent, ActionItemsPageComponent, IssuesPageComponent, RiskPageComponent, RiskPopupComponent,
    CssdashboardNextPage1Component, RiskTreatmentPopupComponent, RiskActionItemsComponent, RiskRepositoryComponent,
    CssdashboardNextPage2Component, SurveySettingsComponent],
  entryComponents: [
    ActionItemsPageComponent, IssuesPageComponent, RiskPageComponent,RiskStatementGuidelineComponent, RiskPopupComponent, RiskRepositoryComponent,
    RiskTreatmentPopupComponent, RiskActionItemsComponent, SurveySettingsComponent
  ]

})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        myUtility,
        SharedService,
        MaterialModule,
        ComponentsModule,
        GoogleChartsModule,
        MatDialogModule
      ]
    };
  }
}
