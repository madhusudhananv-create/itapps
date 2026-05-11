import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BvdEntryService } from './services/bvd-entry.service';
import { MatStepper } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { IdeaEntryComponent } from './idea-entry/idea-entry.component';
import { IdeaBenefitEntryComponent } from './idea-benefit-entry/idea-benefit-entry.component';
import { ImplementationPlanComponent } from './implementation-plan/implementation-plan.component';
import { IdeaReviewApproveComponent } from './idea-review-approve/idea-review-approve.component';
import { ImplementationComponent } from './implementation/implementation.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bvd-entry',
  templateUrl: './bvd-entry.component.html',
  styleUrls: ['./bvd-entry.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    NavbarNewComponent,
    IdeaEntryComponent,
    IdeaBenefitEntryComponent,
    ImplementationPlanComponent,
    IdeaReviewApproveComponent,
    ImplementationComponent
  ]
})
export class BvdEntryComponent implements OnInit, AfterViewInit {

  menuToggleStatus: boolean = false;
  isIdeaSubmitted: boolean = false;
  customerid: number = 0;
  reset: string = '';
  private _pendingStepIndex: number = -1;  // step to jump to after view init
  @ViewChild('stepper') stepper!: MatStepper;
  
  constructor(
    public _bvdEntry: BvdEntryService,
    private route: ActivatedRoute
  ) {
  }

  ngAfterViewInit() {
    // If a step jump was queued (from queryParam), execute it now that the stepper is ready
    if (this._pendingStepIndex >= 0) {
      this._jumpToStep(this._pendingStepIndex);
    }
  }

  /** Mark all steps up to targetIndex as completed, then set selectedIndex */
  private _jumpToStep(targetIndex: number) {
    setTimeout(() => {
      if (!this.stepper) return;
      // Mark steps 0 through targetIndex-1 as interacted + completed so linear stepper allows jump
      this.stepper.steps.forEach((step, i) => {
        if (i < targetIndex) {
          step.completed = true;
          step.interacted = true;
        }
      });
      this.stepper.selectedIndex = targetIndex;
    }, 300);
  }

  ngOnInit() {
    // Read route params and store them for child components
    this.route.params.subscribe(params => {
      this.customerid = params['customerid'] ? +params['customerid'] : 0;
      this.reset = params['reset'] || '';
      
      // Store in service so child components can access them
      this._bvdEntry.customerid = this.customerid;
      this._bvdEntry.reset = this.reset;
    });

    // Read query params — used when navigating from "View Idea" or mail link
    this.route.queryParams.subscribe(params => {

      const ideaId = params['Ideaid'] ? +params['Ideaid'] : 0;
      const viewType = params['isvieworapproveorreject'] || '';
      const customerid = params['customerid'] ? +params['customerid'] : 0;

      if (customerid > 0) {
        this._bvdEntry.customerid = customerid;
        this.customerid = customerid;
      }

      if (ideaId > 0) {
        this._bvdEntry.ideA_ID = ideaId;

        // If "view" mode (from View Idea click or mail link), jump to Review step (Step 4, index 3)
        if (viewType === 'view' || viewType === 'approve' || viewType === 'reject') {
          // Queue the step jump — will be executed in ngAfterViewInit or immediately if already initialised
          this._pendingStepIndex = 3;
          if (this.stepper) {
            this._jumpToStep(3);
          }
        }
      }
    });
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  getCurrentIndex(index: number) {
    
    // Use setTimeout to ensure stepper is ready
    setTimeout(() => {
      if (this.stepper) {
        const newIndex = index - 1; // Subtract 1 because index is 0-based
        this.stepper.selectedIndex = newIndex;
      } else {
        console.error('Stepper is not available!');
      }
    }, 100);
  }
}
