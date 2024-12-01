import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditPlanComponent } from './audit-plan/audit-plan.component';
import { ChecklistAuditeeComponent } from './checklist-auditee/checklist-auditee.component';
import { ChecklistExecutionComponent } from './checklist-execution/checklist-execution.component';
import { ChecklistFindingsComponent } from './checklist-execution/checklist-findings/checklist-findings.component';
import { ChecklistUserComponent } from './checklist-user/checklist-user.component';
import { ControlUserComponent } from './control-user/control-user.component';
import { CreateComponent } from './create/create.component';
import { ObjectiveUserComponent } from './objective-user/objective-user.component';
import { ProcessAreaComponent } from './process-area/process-area.component';
import { ProcessChecklistMappingComponent } from './process-checklist-mapping/process-checklist-mapping.component';
import { ProcessModelComponent } from './process-model.component';
import { ProcessModelMainComponent } from './process-model-main/process-model-main.component';
import { ProcessModelProjectComponent } from './process-model-project/process-model-project.component';
import { ProcessModelRoutingModule } from './process-model-routing.module';
import { ProcessModelService } from '../../pages/process-model/process-model.service';
import { ProcessProcessModelMappingComponent } from './process-process-model-mapping/process-process-model-mapping.component';
import { ProcessServiceAreaMappingComponent } from './process-service-area-mapping/process-service-area-mapping.component';
import { PspdComponent } from './pspd/pspd.component';
import { RiskUserComponent } from './risk-user/risk-user.component';
import { ServiceAreaComponent } from './service-area/service-area.component';
import { SetupchecklistComponent } from './setup-checklist/setup-checklist.component';
import { SetupTabsComponent } from './setup-tabs/setup-tabs.component';
import { SharedModule } from '../../Shared/shared.module';
import { TestUserComponent } from './test-user/test-user.component';
import { AuditExecutionComponent } from './audit-execution/audit-execution.component';
import { TaskComponent } from './task/task.component';
import { TaskPlannerComponent } from './task/task-planner/task-planner.component';
import { TaskRecurrenceComponent } from './task/task-recurrence/task-recurrence.component';
import { TaskAddComponent } from './task/task-add/task-add.component';
import { TaskExecutionComponent } from './task/task-execution/task-execution.component';
import { AuditReportComponent } from './audit-execution/audit-report/audit-report.component';
import { ProjectProcessConfigComponent } from './project-process-config/project-process-config.component';
import { TaskViewComponent } from './task/task-view/task-view.component';
import { TaskSchedulerComponent } from './task/task-scheduler/task-scheduler.component';
import { MatDialogModule, MatFormFieldModule } from '@angular/material';
import { SetupChecklistNewComponent } from './setup-checklist-new/setup-checklist-new.component';
import { PreviewPopupComponent } from './process-checklist-mapping/preview-popup/preview-popup.component';
import { RequirementReferenceComponent } from './requirement-reference/requirement-reference.component';
import { ProcessProcessModelViewComponent } from './process-process-model-view/process-process-model-view.component';
import { ChecklistExecutionNewComponent } from './checklist-execution-new/checklist-execution-new.component';
import { ChecklistFindingsNewComponent } from './checklist-execution-new/checklist-findings-new/checklist-findings-new.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { TaskEventPageComponent } from './task/task-event-page/task-event-page.component';

@NgModule({
  imports: [
    CommonModule,
    ProcessModelRoutingModule,
    MatFormFieldModule,
    SharedModule,
    MatDialogModule
  ],
  declarations: [
    AuditExecutionComponent,
    AuditPlanComponent,
    AuditReportComponent,
    ChecklistAuditeeComponent,
    ChecklistExecutionComponent,
    ChecklistFindingsComponent,
    ChecklistUserComponent,
    ControlUserComponent,
    ControlUserComponent,
    CreateComponent,
    ObjectiveUserComponent,
    ProcessAreaComponent,
    ProcessChecklistMappingComponent,
    ProcessModelComponent,
    ProcessModelMainComponent,
    ProcessModelProjectComponent,
    ProcessProcessModelMappingComponent,
    ProcessServiceAreaMappingComponent,
    ProjectProcessConfigComponent,
    PspdComponent,
    RiskUserComponent,
    ServiceAreaComponent,
    SetupchecklistComponent,
    SetupTabsComponent,
    TestUserComponent,
    TaskComponent,
    TaskPlannerComponent,
    TaskRecurrenceComponent,
    TaskSchedulerComponent,
    TaskAddComponent,
    TaskExecutionComponent,
    TaskViewComponent,
    SetupChecklistNewComponent,
    PreviewPopupComponent,
    RequirementReferenceComponent,
    ProcessProcessModelViewComponent,
    ChecklistExecutionNewComponent,
    ChecklistFindingsNewComponent,
    HelpPageComponent,
    TaskEventPageComponent
  ],
  providers: [
    ProcessModelService
  ],
  entryComponents: [
    AuditReportComponent,
    ChecklistFindingsComponent,
    PreviewPopupComponent,
    ChecklistFindingsNewComponent,
    ChecklistExecutionNewComponent
  ],
  exports: [ChecklistAuditeeComponent]
})

export class ProcessModelModule { }
