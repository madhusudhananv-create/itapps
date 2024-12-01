import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SharedModule } from '../../Shared/shared.module';
import { MinutesOfMeetingComponent } from './minutes-of-meeting/minutes-of-meeting.component';
import { IdeasPageComponent } from './ideas-page/ideas-page.component';
import { DeliveryPageComponent } from './delivery-page/delivery-page.component';
import { TimesheetPageComponent } from './timesheet-page/timesheet-page.component';
import { SuccessPageComponent } from './success-page/success-page.component';

import { OverviewPageComponent } from './overview-page/overview-page.component';
import { ContactsPageComponent } from './contacts-page/contacts-page.component';
import { BestPracticesPageComponent } from './best-practices-page/best-practices-page.component';
import { PortfolioProjectSelectorComponent } from '../../controls/portfolio-project-selector/portfolio-project-selector.component';
import { SharedService } from '../../Shared/shared.service';
import { LessonsLearnedPageComponent } from './lessons-learned-page/lessons-learned-page.component';
import { MatDatepickerModule, MatTabsModule } from '@angular/material';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerObjectivesPageComponent } from './customer-objectives-page/customer-objectives-page.component';
import { CustomerObjectivesSectionComponent } from './customer-objectives-page/customer-objectives-section/customer-objectives-section.component';
import { PeoplePageComponent } from './people-page/people-page.component';
import { ProcessPageComponent } from './process-page/process-page.component';
import { QaassessmentdetailsComponent } from './qaassessmentdetails/qaassessmentdetails.component';
import { ProjectMigrationPageComponent } from './project-migration-page/project-migration-page.component';
// import { FMEAPageComponent } from './fmea-page/fmea-page.component';
import { AssessmentstatusComponent } from './assessmentstatus/assessmentstatus.component';
import { FeedbackPageComponent } from './feedback-page/feedback-page.component';
import { ProjectDataConfigurationComponent } from './project-data-configuration-page/project-data-configuration-page.component';
import { ApprovalPopupComponent } from './project-data-configuration-page/approval-popup/approval-popup.component';
import { ChecklistAssessmentPageComponent } from './checklist-assessment-page/checklist-assessment-page.component';
import { ProcessModelModule } from '../process-model/process-model.module';
import { ChecklistFindingsPageComponent } from './checklist-findings-page/checklist-findings-page.component';
import { ChecklistFindingsSectionComponent } from './checklist-findings-page/checklist-findings-section/checklist-findings-section.component';
import { MandatoryTrainingReportComponent } from './mandatory-training-report/mandatory-training-report.component';
import { CrispReportComponent } from './crisp-report/crisp-report.component';
import { FmeaProjectSetupComponent } from './fmea-project-setup/fmea-project-setup.component';
import { ProjectSpecificFailuresComponent } from './fmea-project-setup/project-specific-failures/project-specific-failures.component';
import { FailureAssessmentComponent } from './fmea-project-setup/failure-assessment/failure-assessment.component';
import { ViewCsatComponent } from './view-csat/view-csat.component';
import { DatePipe } from "@angular/common";
import { AppreciationComponent } from './appreciation/appreciation.component';
import { ProductResponsibleComponent } from '../product-responsible/product-responsible.component';
import { ManageKpiProductEntryComponent } from '../manage-kpi-product-entry/manage-kpi-product-entry.component';
import { ManageproductComponent } from '../manageproduct/manageproduct.component';
import { ManageKpiMetricsComponent } from '../manage-kpi-metrics/manage-kpi-metrics.component';
import { MasterKpiComponent } from '../master-kpi/master-kpi.component';
import { EntityBaseInfoComponent } from './entity-base-info/entity-base-info.component';

//import { ChecklistFindingsSectionComponent } from './checklist-findings-page/checklist-findings-section/checklist-findings-section.component';
//import { LessonsLearnedPageComponent } from './lessons-learned-page/lessons-learned-page.component';



//import {ProjectSelectorMultipleComponent} from '../../controls/project-selector-multiple/project-selector-multiple.component';
//import { AppModule } from '../../app.module';


@NgModule({
  imports: [
    CommonModule,
    LayoutRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatDialogModule,
    ProcessModelModule,
    MatTabsModule
  ],

  declarations: [LayoutComponent, MinutesOfMeetingComponent,
    IdeasPageComponent, DeliveryPageComponent, TimesheetPageComponent, SuccessPageComponent,
    OverviewPageComponent, ContactsPageComponent, BestPracticesPageComponent, LessonsLearnedPageComponent,
    CustomerObjectivesPageComponent, CustomerObjectivesSectionComponent, PeoplePageComponent, ProcessPageComponent,
    QaassessmentdetailsComponent, ProjectMigrationPageComponent, AssessmentstatusComponent, FeedbackPageComponent,
    ProjectDataConfigurationComponent, ApprovalPopupComponent, ChecklistAssessmentPageComponent,
    ChecklistFindingsPageComponent, ChecklistFindingsSectionComponent, MandatoryTrainingReportComponent,
    CrispReportComponent, FmeaProjectSetupComponent, ProjectSpecificFailuresComponent, FailureAssessmentComponent,
    ViewCsatComponent, AppreciationComponent, ProductResponsibleComponent, ManageKpiProductEntryComponent, ManageproductComponent,
    ManageKpiMetricsComponent, MasterKpiComponent, EntityBaseInfoComponent],


  entryComponents: [ApprovalPopupComponent, MasterKpiComponent,EntityBaseInfoComponent],
  // providers : [PortfolioProjectSelectorComponent]
  providers: [DatePipe,
  {provide: MAT_DIALOG_DATA, useValue: {}}]
})
export class LayoutModule { }
