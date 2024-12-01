import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { IdeaEntryComponent } from './idea-entry/idea-entry.component';
import { IdeaBenefitSummaryComponent } from './idea-benefit-summary/idea-benefit-summary.component'
import { BvdEntryRouting } from './bvd-entry.routing';
import { IdeaBenefitEntryComponent } from './idea-benefit-entry/idea-benefit-entry.component';
import { BvdEntryComponent } from './bvd-entry.component';
import { ImplementationPlanComponent } from './implementation-plan/implementation-plan.component';
import { SharedModule } from '../../Shared/shared.module';
//import { TokenInterceptor } from './services/token-interceptor';
import { BvdSimilarideasComponent } from './bvd-similarideas/bvd-similarideas.component';
import { IdeasListViewComponent } from './ideas-list-view/ideas-list-view.component';
import { BvdEntryService } from './services/bvd-entry.service';
import { IdeaReviewApproveComponent } from './idea-review-approve/idea-review-approve.component';
import { ImplementationComponent } from './implementation/implementation.component';
import { BvdIdeasListComponent } from './bvd-ideas-list/bvd-ideas-list.component';
import { BvdImplementaionScheduleComponent } from './bvd-implementaion-schedule/bvd-implementaion-schedule.component';
import { BvdStepperComponent } from './bvd-stepper/bvd-stepper.component';
// import { IdeaFileAttachmentComponent } from './idea-file-attachment/idea-file-attachment.component';
 
//import { MatAutocompleteModule,MatButtonModule,MatChipsModule,MatDialogModule,MatFormFieldModule,MatGridListModule,MatInputModule,MatListModule,MatNativeDateModule,MatProgressSpinnerModule,MatSlideToggleModule,MatSnackBarModule,MatTreeModule,MatIconModule,MatDatepickerModule } from "@angular/material";


@NgModule({
    imports: [
        CommonModule,
        BvdEntryRouting,
        SharedModule,
        HttpClientModule
    ],
    declarations: [
        BvdEntryComponent,
        IdeaEntryComponent,
        IdeaBenefitSummaryComponent,
        IdeaBenefitEntryComponent,
        ImplementationPlanComponent,
        BvdSimilarideasComponent,
        IdeasListViewComponent,
        IdeaReviewApproveComponent,
        ImplementationComponent,
        BvdIdeasListComponent,
        BvdImplementaionScheduleComponent,
        BvdStepperComponent
        // ,IdeaFileAttachmentComponent
    ],
    providers: [  BvdEntryService]

})
export class BvdEntryModule { }
