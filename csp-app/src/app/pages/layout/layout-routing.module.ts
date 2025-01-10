import { PeoplePageComponent } from './people-page/people-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../../pages/layout/layout.component';
import { RiskPageComponent } from '../../pages/layout/risk-page/risk-page.component';
import { IssuesPageComponent } from '../../pages/layout/issues-page/issues-page.component';
import { ActionItemsPageComponent } from './action-items-page/action-items-page.component';
import { MinutesOfMeetingComponent } from './minutes-of-meeting/minutes-of-meeting.component';
import { ProjectSelectorMultipleComponent } from '../../controls/project-selector-multiple/project-selector-multiple.component';
import { IdeasPageComponent } from './ideas-page/ideas-page.component';
import { DeliveryPageComponent } from './delivery-page/delivery-page.component';
import { FormsModule } from '@angular/forms';
import { TimesheetPageComponent } from '../layout/timesheet-page/timesheet-page.component';
import { SuccessPageComponent } from './success-page/success-page.component';
import { OverviewPageComponent } from './overview-page/overview-page.component';
import { ContactsPageComponent } from './contacts-page/contacts-page.component';
import { BestPracticesPageComponent } from './best-practices-page/best-practices-page.component';
import { TimesheetPageNewComponent } from './timesheet-page-new/timesheet-page-new.component';
import { TimesheetHomeComponent } from './timesheet-page-new/timesheet-home/timesheet-home.component';
import { TimesheetReportsHomeComponent } from './timesheet-page-new/timesheet-reports-home/timesheet-reports-home.component';
import { CustomerObjectivesPageComponent } from './customer-objectives-page/customer-objectives-page.component';
import { ProcessPageComponent } from './process-page/process-page.component';
import { LessonsLearnedPageComponent } from './lessons-learned-page/lessons-learned-page.component';
import { QaassessmentdetailsComponent } from './qaassessmentdetails/qaassessmentdetails.component';
import { ProjectMigrationPageComponent } from './project-migration-page/project-migration-page.component'
// import { FMEAPageComponent } from './fmea-page/fmea-page.component'
import { AssessmentstatusComponent } from './assessmentstatus/assessmentstatus.component';
import { FeedbackPageComponent } from './feedback-page/feedback-page.component';
import { ProjectDataConfigurationComponent } from './project-data-configuration-page/project-data-configuration-page.component';
import { ChecklistAssessmentPageComponent } from './checklist-assessment-page/checklist-assessment-page.component';
import { ChecklistFindingsPageComponent } from './checklist-findings-page/checklist-findings-page.component';
import { MandatoryTrainingReportComponent } from './mandatory-training-report/mandatory-training-report.component';
import { CrispReportComponent } from './crisp-report/crisp-report.component';
import { FmeaProjectSetupComponent } from './fmea-project-setup/fmea-project-setup.component';

import { ViewCsatComponent } from './view-csat/view-csat.component';
import { ChecklistExecutionNewComponent } from '../process-model/checklist-execution-new/checklist-execution-new.component';
import { AppreciationComponent } from './appreciation/appreciation.component';
import { ProductResponsibleComponent } from '../product-responsible/product-responsible.component';
import { ManageKpiProductEntryComponent } from '../manage-kpi-product-entry/manage-kpi-product-entry.component';



const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'risk/:custid',
        component: RiskPageComponent
      },
      {
        path: 'risk/:custid/:projid/:riskid',
        component: RiskPageComponent
      },
      {
        path: 'risk/:custid/:projid',
        component: RiskPageComponent
      },
      {
        path: 'issues/:custid',
        component: IssuesPageComponent
      },
      {
        path: 'actionitems/:custid',
        component: ActionItemsPageComponent
      },
      {
        path: 'actionitems/:custid/:projid/:iscss',
        component: ActionItemsPageComponent
      },
      {
        path: 'actionitems/:custid/:iscss',
        component: ActionItemsPageComponent
      },
      {
        path: 'actionitems/:custid/:projid/:batchCustomerId/:isapprovereject',
        component: ActionItemsPageComponent
      },
      {
        path: 'qasummary/:custid',
        component: QaassessmentdetailsComponent
      },
      {
        path: 'assessment/:custid',
        component: AssessmentstatusComponent
      },
      {
        path: 'ideas/:custid',
        component: IdeasPageComponent
      },
      {
        path: 'ideas/:custid/:ideasid',
        component: IdeasPageComponent
      },
      {
        path: 'mom',
        component: MinutesOfMeetingComponent
      },
      {
        path: 'delivery/:custid',
        component: DeliveryPageComponent
      },
      {
        path: 'delivery/:custid/:projid',
        component: DeliveryPageComponent
      },
      {
        path: 'timesheet/:custid',
        component: TimesheetPageComponent
      },
      {
        path: 'timesheetnewhome/:custid',
        component: TimesheetHomeComponent
      },
      {
        path: 'timesheetnewreports/:custid',
        component: TimesheetReportsHomeComponent
      },
      // {
      //   path: 'timesheetnew/:custid',
      //   component : TimesheetPageNewComponent
      // },
      {
        path: 'successgoals/:custid',
        component: SuccessPageComponent
      },
      {
        path: 'overview/:custid',
        component: OverviewPageComponent
      },

      {
        path: 'contacts/:custid',
        component: ContactsPageComponent
      },

      // {
      //   path: 'llearnt/:custid',
      //   component : LessonsLearnedPageComponent
      // }
      {
        path: 'best-practices/:custid',
        component: BestPracticesPageComponent
      },


      {
        path: 'customerobjectivesnew/:custid',
        component: CustomerObjectivesPageComponent
      },

      {
        path: 'people/:custid',
        component: PeoplePageComponent
      },

      {
        path: 'process/:custid',
        component: ProcessPageComponent
      },

      {
        path: 'lessons-learnt/:custid',
        component: LessonsLearnedPageComponent
      },

      {
        path: 'projectmigration/:custid',
        component: ProjectMigrationPageComponent
      },

      {
        path: 'fmea/:custid',
        component: FmeaProjectSetupComponent
      },

      {
        path: 'feedback-page/:custid',
        component: FeedbackPageComponent
      },

      {
        path: 'projectdataconfiguration/:custid',
        component: ProjectDataConfigurationComponent
      },

      {
        path: 'checklistassessment/:custid',
        component: ChecklistAssessmentPageComponent
      },

      {
        path: 'checklistfindings/:custid',
        component: ChecklistFindingsPageComponent
      },
      {
        path: 'checklistfindings/:custid/:projid',
        component: ChecklistFindingsPageComponent
      },
      {
        path: 'mandatorytrainingreport/:custid',
        component: MandatoryTrainingReportComponent

      },
      {
        path: 'mandatorytrainingreport/:custid/:projid/:year/:month',
        component: MandatoryTrainingReportComponent

      },
      {
        path: 'crisp-report/:custid',
        component: CrispReportComponent
      },

      {
        path: 'crisp-report/:custid/:projid/:year/:month',
        component: CrispReportComponent
      },

      {
        path: "projectdataconfigurationApproval/:custid/:projid/:settingid/:isApproveReject",
        component: ProjectDataConfigurationComponent
      },
      {
        path: 'checklistfindings/:custid/:projid/:auditid',
        component: ChecklistExecutionNewComponent
      },
      {
        path: 'checklistfindings/:custid/:projid/:auditid/:isfromdashboard',
        component: ChecklistExecutionNewComponent
      },
      {
        path: 'checklistfindings/:resubmit/:custid/:projid/:auditid/:isApproveReject',
        component: ChecklistExecutionNewComponent
      },
      {
        path: 'surveyfeedback/:custid',
        component: ViewCsatComponent
      },
      {
        path: 'surveyfeedback/:custid/:projid/:frequencytype/:frequency/:year/:respondedid',
        component: ViewCsatComponent
      },
      {
        path: 'surveyfeedback/:custid/:frequencytype/:frequency/:year/:respondedid',
        component: ViewCsatComponent
      },
      {
        path: 'qasummary/:custid/:isFindingByTime',
        component: QaassessmentdetailsComponent
      },
      {
        path: 'qasummary/:custid',
        component: QaassessmentdetailsComponent
      },
      {
        path: 'qasummary/:custid/:frommonth/:fromyear/:tomonth/:toyear/:findingstatus/:findingtype/:isfromqagoverance',
        component: QaassessmentdetailsComponent
      },
      {
        path: 'qasummary/:custid/:projid/:frommonth/:fromyear/:tomonth/:toyear/:findingstatus/:findingtype/:isfromqagoverance',
        component: QaassessmentdetailsComponent
      },
      {
        path: 'qasummary/:custid/:projid/:asssessmentid/:findingid/:isauditor/:acceptval',
        component: QaassessmentdetailsComponent
      },
      {
        path: 'appreciation/:custid',
        component: AppreciationComponent
      },
      {
        path: "productresponsible/:custid",
        component: ProductResponsibleComponent,
      },
      {
        path: "managekpiproduct/:custid",
        component: ManageKpiProductEntryComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
