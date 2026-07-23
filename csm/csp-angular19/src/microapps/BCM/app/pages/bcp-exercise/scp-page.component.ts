import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CriticalBusinessProcessComponent,
  CriticalBusinessProcessData,
} from '../../features/scp-wizard/section1/critical-business-process.component';
import {
  TimeImpactAnalysisComponent,
  TimeImpactAnalysisData,
} from '../../features/scp-wizard/section2/time-impact-analysis.component';
import {
  KeyPlanningParametersComponent,
  KeyPlanningParametersData,
} from '../../features/scp-wizard/section3/key-planning-parameters.component';
import {
  RtoValidationComponent,
  RtoValidationData,
} from '../../features/scp-wizard/section4/rto-validation.component';
import {
  CshComponent,
  CshData,
} from '../../features/scp-wizard/section5/csh.component';
import {
  MinimumOperationalRequirementComponent,
  MinimumOperationalRequirementData,
} from '../../features/scp-wizard/section6/minimum-operational-requirement.component';
import {
  BusinessRecoveryPlanComponent,
  BusinessRecoveryPlanData,
} from '../../features/scp-wizard/section7/business-recovery-plan.component';
import {
  ContactsInformationComponent,
  ContactsInformationData,
} from '../../features/scp-wizard/section8/contacts-information.component';
import {
  InformationSecurityComponent,
  InformationSecurityData
} from '../../features/scp-wizard/section9/information-security.component';


@Component({
  selector: 'bcp-scp-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    CriticalBusinessProcessComponent,
    TimeImpactAnalysisComponent,
    KeyPlanningParametersComponent,
    RtoValidationComponent,
    CshComponent,
    MinimumOperationalRequirementComponent,
    BusinessRecoveryPlanComponent,
    ContactsInformationComponent,
    InformationSecurityComponent
  ],
  templateUrl: './scp-page.component.html',
  styles: [
    `
      .page-container {
        padding: 0.25rem;
        max-width: 100vw;
        margin: 0 auto;
        overflow: hidden;
        height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        display: flex;
        flex-direction: column;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;
        padding: 0.5rem 0;
        flex-shrink: 0;
        border-bottom: 2px solid #e0e0e0;
      }

      .page-header h1 {
        color: #2c3e50;
        font-size: 1.4rem;
        margin: 0;
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        flex: 1;
      }

      .project-name-banner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 3rem;
        background-color: #e3f2fd;
        border-radius: 8px;
        border: 1px solid #90caf9;
        color: #1976d2;
        font-weight: 500;
        font-size: 19px;
        white-space: nowrap;
      }

      .project-name-banner mat-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
      }

      .page-content {
        text-align: center;
        font-size: 1rem;
        color: #34495e;
        margin-bottom: 0.5rem;
        flex-shrink: 0;
      }

      /* Form styles */
      .form-container {
        margin-top: 0.25rem;
        width: 100%;
        max-width: 100vw;
        margin-left: auto;
        margin-right: auto;
        overflow: visible; /* allow natural scrolling */
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0; /* allow children to compute height correctly in flex */
      }

      .form-card {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        overflow: visible;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0; /* let content area size properly */
      }

      .form-stepper {
        margin-top: 0.25rem;
        width: 100%;
        overflow: visible;
        padding: 0;
        flex-shrink: 0;
      }

      .step-label {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: visible;
        min-width: 100px;
        max-width: 150px;
        font-weight: 500;
      }

      .step-label mat-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
        flex-shrink: 0;
      }

      .step-text {
        overflow: visible;
        text-overflow: clip;
        white-space: normal;
        flex: 1;
        min-width: 0;
      }

      /* Angular Material Stepper Overrides - Better Text Visibility */
      .mat-stepper-horizontal {
        overflow: visible !important;
        display: flex !important;
        flex-wrap: wrap !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      .mat-stepper-header,
      .mat-step-header {
        overflow: visible !important;
        min-width: 100px !important;
        max-width: 150px !important;
        flex-shrink: 0 !important;
        transition: all 0.3s ease;
      }

      /* Enhanced active step highlighting */
      .mat-step-header[aria-selected="true"],
      .mat-step-header.mat-step-header-selected {
        background-color: #e3f2fd !important;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
      }

      .mat-step-header[aria-selected="true"] .step-label,
      .mat-step-header.mat-step-header-selected .step-label {
        color: #1976d2 !important;
        font-weight: 600;
      }

      .mat-step-header[aria-selected="true"] .step-label mat-icon,
      .mat-step-header.mat-step-header-selected .step-label mat-icon {
        color: #1976d2 !important;
      }

      .mat-step-label,
      .mat-step-label-content {
        overflow: visible !important;
        max-width: 150px !important;
        min-width: 100px !important;
        white-space: nowrap !important;
        text-overflow: clip !important;
      }

      .mat-stepper-horizontal .mat-stepper-header-container {
        overflow: visible !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      /* Tooltip styling for truncated labels */
      .step-label {
        cursor: help;
        position: relative;
      }

      .step-label:hover {
        background-color: rgba(0, 0, 0, 0.04);
        border-radius: 4px;
        padding: 2px 4px;
      }

      .step-content {
        padding: 1rem 0;
        text-align: left;
        flex: 1;
        overflow: visible;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      /* Make the content area scrollable keeping actions visible */
      .mat-mdc-card-content, .mat-mdc-card-content .mat-card-content {
        overflow-x: auto; /* Fallback: allow internal scroll only if absolutely necessary */
        display: block;
        width: 100%;
      }

      .form-card .mat-mdc-card-content {
        flex: 1;
        overflow: auto; /* scroll within card if content exceeds viewport */
        padding: 1rem; /* breathing room above sticky footer */
      }

      .step-content p {
        color: #7f8c8d;
        margin-bottom: 2rem;
      }

      .placeholder-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 2px dashed #dee2e6;
      }

      .placeholder-content mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: #6c757d;
      }

      .placeholder-content p {
        color: #6c757d;
        font-style: italic;
        margin: 0;
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        border-top: 1px solid #e0e0e0;
        flex-shrink: 0;
        position: sticky; /* keep action bar visible */
        bottom: 0;
        background: rgba(255,255,255,0.98);
        backdrop-filter: blur(6px);
        z-index: 2;
      }

      .spacer {
        flex: 1;
      }

      .form-actions .mat-mdc-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-actions .mat-mdc-button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Submit for Review button styling */
      .form-actions button[color="accent"],
      .form-actions .submit-review-btn {
        background-color: #ff9800;
        color: white;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
        transition: all 0.2s ease;
        min-width: 180px;
        margin-right: 10px;
      }

      .form-actions button[color="accent"]:hover:not([disabled]),
      .form-actions .submit-review-btn:hover:not([disabled]) {
        background-color: #f57c00;
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
        transform: translateY(-1px);
      }

      .form-actions button[color="accent"][disabled],
      .form-actions .submit-review-btn[disabled] {
        background-color: rgba(255, 152, 0, 0.4);
        color: rgba(255, 255, 255, 0.7);
        cursor: not-allowed;
      }

      .form-card .mat-mdc-card-header {
        background-color: #f5f5f5;
        margin: 0;
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        overflow: visible;
        border-radius: 12px 12px 0 0;
      }

      .form-card .mat-mdc-card-title {
        width: 100%;
        margin: 0;
        padding: 0;
      }

      .card-title-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        gap: 1rem;
      }

      .title-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #2c3e50;
        font-size: 1.4rem;
        font-weight: 600;
      }

      .title-right {
        color: #7f8c8d;
        font-size: 0.85rem;
        font-weight: 400;
        font-style: italic;
        text-align: right;
        flex-shrink: 0;
      }

      .form-card .mat-mdc-card-subtitle {
        color: #7f8c8d;
        margin-top: 0.5rem;
        font-size: 1rem;
        font-weight: 400;
        background-color: transparent;
        padding: 0;
        border: none;
        box-shadow: none;
      }

      /* Large screens optimization */
      @media (max-width: 1200px) {
        .form-container {
          max-width: 1200px;
        }
      }

      @media (max-width: 1024px) {
        .form-container {
          max-width: 1000px;
        }

        .step-label {
          font-size: 0.85rem;
          gap: 0.25rem;
          min-width: 90px;
          max-width: 130px;
        }

        .step-label mat-icon {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }

        .mat-stepper-header,
        .mat-step-header {
          min-width: 90px !important;
          max-width: 130px !important;
        }

        .mat-step-label,
        .mat-step-label-content {
          max-width: 130px !important;
          min-width: 90px !important;
        }
      }

      /* Mobile responsive design */
      @media (max-width: 768px) {
        .page-container {
          padding: 0.25rem;
        }

        .page-header h1 {
          font-size: 1.4rem;
        }

        .step-content {
          padding: 1rem 0;
          min-height: 300px;
        }

        .placeholder-content {
          padding: 2rem 1rem;
        }

        .step-label {
          font-size: 0.8rem;
          gap: 0.2rem;
          min-width: 80px;
          max-width: 120px;
        }

        .step-label mat-icon {
          font-size: 0.9rem;
          width: 0.9rem;
          height: 0.9rem;
        }

        /* Force stepper to wrap on mobile */
        .mat-stepper-horizontal {
          flex-wrap: wrap !important;
          justify-content: center !important;
        }

        .mat-stepper-header,
        .mat-step-header {
          min-width: 80px !important;
          max-width: 120px !important;
          margin: 0.25rem !important;
        }

        .mat-step-label,
        .mat-step-label-content {
          max-width: 120px !important;
          min-width: 80px !important;
        }

        .form-actions {
          padding: 1rem;
          flex-direction: column;
          gap: 1rem;
        }

        .form-container {
          margin-top: 0.5rem;
        }

        .form-actions .mat-mdc-button {
          width: 100%;
          justify-content: center;
        }

        .spacer {
          display: none;
        }
      }

      /* Very small screens */
      @media (max-width: 480px) {
        .page-container {
          padding: 0.25rem;
        }

        .page-header h1 {
          font-size: 1.2rem;
        }

        .step-label {
          font-size: 0.7rem;
        }

        .step-label mat-icon {
          font-size: 0.9rem;
          width: 0.9rem;
          height: 0.9rem;
        }

        .form-card .mat-mdc-card-header {
          padding: 0.75rem 1rem;
        }

        .card-title-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .title-left {
          font-size: 1rem;
        }

        .title-right {
          font-size: 0.7rem;
          text-align: left;
          width: 100%;
        }
      }

      /* Stepper responsive adjustments */
      @media (max-width: 1200px) {
        .mat-step-header {
          min-width: 140px !important;
          max-width: 180px !important;
        }

        .step-label {
          min-width: 140px;
          max-width: 180px;
        }
      }

      @media (max-width: 1024px) {
        .mat-step-header {
          min-width: 120px !important;
          max-width: 160px !important;
        }

        .step-label {
          min-width: 120px;
          max-width: 160px;
        }
      }

      @media (max-width: 768px) {
        .mat-step-header {
          min-width: 100px !important;
          max-width: 140px !important;
        }

        .step-label {
          min-width: 100px;
          max-width: 140px;
          font-size: 0.75rem;
        }

        .step-label mat-icon {
          font-size: 0.9rem;
          width: 0.9rem;
          height: 0.9rem;
        }
      }

      @media (max-width: 600px) {
        .mat-step-header {
          min-width: 80px !important;
          max-width: 120px !important;
        }

        .step-label {
          min-width: 80px;
          max-width: 120px;
          font-size: 0.7rem;
        }

        .step-label mat-icon {
          font-size: 0.8rem;
          width: 0.8rem;
          height: 0.8rem;
        }
      }

      @media (max-width: 480px) {
        .mat-step-header {
          min-width: 60px !important;
          max-width: 100px !important;
        }

        .step-label {
          min-width: 60px;
          max-width: 100px;
          font-size: 0.65rem;
        }

        .step-label mat-icon {
          font-size: 0.7rem;
          width: 0.7rem;
          height: 0.7rem;
        }
      }

      /* Angular Material Stepper Overrides - Aggressive Fix */
      .mat-stepper-horizontal {
        overflow-x: auto !important;
        overflow-y: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        display: flex !important;
        flex-wrap: nowrap !important;
      }

      .mat-stepper-header {
        overflow: visible !important;
        flex-shrink: 0 !important;
        min-width: 150px !important;
        max-width: 250px !important;
        display: flex !important;
      }

      .mat-step-header {
        overflow: visible !important;
        min-width: 150px !important;
        max-width: 250px !important;
        flex-shrink: 0 !important;
        display: flex !important;
      }

      .mat-step-label {
        overflow: visible !important;
        white-space: nowrap !important;
        text-overflow: ellipsis !important;
        max-width: none !important;
        min-width: 120px !important;
        flex: 1 !important;
        display: flex !important;
        align-items: center !important;
      }

      .mat-step-label-content {
        overflow: visible !important;
        white-space: nowrap !important;
        text-overflow: ellipsis !important;
        max-width: none !important;
        flex: 1 !important;
        display: flex !important;
        align-items: center !important;
      }

      /* Override Material Design's default step label constraints */
      .mat-step-header .mat-step-label {
        max-width: none !important;
        overflow: visible !important;
        width: auto !important;
      }

      /* Ensure step headers don't shrink too much */
      .mat-stepper-horizontal .mat-stepper-header {
        flex-shrink: 0 !important;
        min-width: 150px !important;
        max-width: 250px !important;
      }

      /* Force step labels to be visible */
      .mat-step-header .mat-step-label .mat-step-label-content {
        overflow: visible !important;
        white-space: nowrap !important;
        max-width: none !important;
        width: auto !important;
      }

      /* Additional aggressive overrides */
      .mat-step-header .mat-step-label-selected .mat-step-label-content {
        overflow: visible !important;
        white-space: nowrap !important;
        max-width: none !important;
      }

      .mat-step-header .mat-step-label .mat-step-label-content .step-label {
        overflow: visible !important;
        white-space: nowrap !important;
        max-width: none !important;
        width: auto !important;
      }

      /* Tooltip styling */
      .step-label {
        cursor: help;
        position: relative;
      }

      .step-label:hover {
        background-color: rgba(0, 0, 0, 0.04);
        border-radius: 4px;
        padding: 2px 4px;
      }
/* Progress Bar Styles */
.progress-bar-container {
  height: 35px; /* Or whatever height you prefer */
  border: 1px solid #000000;
  border-radius: 2px;
  overflow: hidden; /* Important to keep the red bar inside the container */
  margin-bottom: 15px;
  margin-left: 240px;
}

.progress-bar-fill {
  height: 100%;
  /* Color is set dynamically via ngStyle in template */
  transition: width 0.3s ease-in-out, background-color 0.3s ease-in-out;
}

.workflow-header {
    font-size: 1.2em;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
}

.workflow-controls {
  display: flex;
  justify-content: flex-start; /* <--- Changed from space-between to snap button left */
  gap: 20px; /* Controls the small gap between the bar end and the button */
  margin-top: 35px;
  width: 100%;
  margin-left: -80px;
}

.status-details p {
    margin: 5px 0;
}

.progress-bar-wrapper {
  flex: 1; 
  position: relative;
  margin-top: 0;
}
.status-marker {
    position: absolute;
    top: -20px; /* Position above the bar */
    transform: translateX(-50%); /* Centers the marker text */
    font-size: 0.8em;
    color: #999; /* Inactive color */
    font-weight: normal;
    cursor: default;
    
    /* Add a tooltip library if you need complex hover text */
}
.status-marker.active {
    color: #000; /* Highlight active status text */
    font-weight: bold;
}
/* Ensure progress-bar-container has a defined height */

::ng-deep .mat-step-header .mat-step-icon-selected {
    background-color: red; 
 }
  /* Hides the default long horizontal bar */
::ng-deep .mat-horizontal-stepper-header-container {
  display: none !important;
}

/* Styles for your new Grid */
.custom-nav-grid {
  display: flex;
  padding: 13px;
  background: #f5f7fa;
  width: 100%;
}

.nav-item {
  /* Logic: 100% / 5 items = 20%. Minus gap space. */

  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 10px;
}

.nav-item:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

/* Active State (Blue) */
.nav-item.active {
  border-color: #3f51b5;
  background-color: #3f51b5;
  color: #ffffff;
  font-weight: 500;
}

/* Completed State (Green-ish text for icon) */
.nav-item.completed mat-icon { color: green; }

/* --- Tab-like Styling for Active Step --- */

/* 1. Add a border line below all steps to create the "tab bar" base */
.mat-stepper-horizontal {
  border-bottom: 1px solid #e0e0e0;
}

/* 2. Base style for all step headers (inactive state) */
.mat-step-header {
  border: 1px solid transparent; /* Maintain size */
  border-bottom: none; /* No bottom border for inactive */
  background-color: transparent; /* Blend with background */
  color: #757575; /* Grey text for inactive */
  border-radius: 4px 4px 0 0; /* Rounded top corners */
  margin-bottom: -1px; /* Overlap the container border */
  padding: 12px 24px; /* Adjust padding for a better tab look */
}

/* 3. Active step style - The "Tab" look */
.mat-step-header[aria-selected="true"],
.mat-step-header.mat-step-header-selected {
  background-color: #fff !important; /* White background */
  border: 1px solid #e0e0e0; /* Grey border on sides and top */
  border-bottom-color: transparent; /* No bottom border to blend with content */
  border-top: 3px solid #1976d2; /* Prominent blue top border */
  color: #1976d2 !important; /* Blue text */
  font-weight: bold;
  box-shadow: none; /* Remove default shadow */
  z-index: 2; /* Ensure it sits on top of the bottom line */
}

/* 4. Style the icon inside the active step */
.mat-step-header[aria-selected="true"] .mat-step-icon,
.mat-step-header.mat-step-header-selected .mat-step-icon {
  background-color: #1976d2;
  color: white;
}

/* 5. Style the label text inside the active step */
.mat-step-header[aria-selected="true"] .mat-step-label,
.mat-step-header.mat-step-header-selected .mat-step-label {
  color: #1976d2 !important;
}

/* 6. Optional: Hover effect for inactive tabs */
.mat-step-header:not([aria-selected="true"]):hover {
    background-color: #f5f5f5;
}
    .reset-btn {
  white-space: nowrap;
  flex-shrink: 0;
  height: 36px;
}
    `,
  ],
})
export class ScpPageComponent implements OnInit {
  // Form groups for each section
  section1Form: FormGroup;
  section2Form: FormGroup;
  section3Form: FormGroup;
  section4Form: FormGroup;
  section5Form: FormGroup;
  section6Form: FormGroup;
  section7Form: FormGroup;
  section8Form: FormGroup;
  section9Form: FormGroup;

  // Section data
  section1Data?: CriticalBusinessProcessData;
  section1Valid: boolean = false;
  section2Data?: TimeImpactAnalysisData;
  section2Valid: boolean = false;
  section3Data?: KeyPlanningParametersData;
  section3Valid: boolean = false;
  section4Data?: RtoValidationData;
  section4Valid: boolean = false;
  section5Data?: CshData;
  section5Valid: boolean = false;
  section6Data?: MinimumOperationalRequirementData;
  section6Valid: boolean = false;
  section7Data?: BusinessRecoveryPlanData;
  section7Valid: boolean = false;
  section8Data?: ContactsInformationData;
  section8Valid: boolean = false;
  section9Data?: InformationSecurityData;
  section9Valid: boolean = false;

  // Query parameters
  accountId?: string;
  mode: 'view' | 'edit' = 'edit';
  account?: string;
  project?: string;
  businessUnit?: string;
  role?: string; // 'spoc', 'pm', 'csm'
  
  // SCP status - default to 'Draft', should be set from route or service
  scpStatus: 'Draft' | 'Reviewed' | 'Approved' | 'In Review' | 'Submitted for Review' | 'Submitted for Approval' = 'Draft';
  currentStatusText: string = 'Review Initiated';
  currentStepIndex: any;
  rtoFromSection3: { [activity: string]: string } = {};

// Define colors
readonly COLOR_DRAFT = '#bdbdbd';     // Gray
readonly COLOR_SUBMITFORREVIEW = '#FF0000'; // RED
readonly COLOR_REVIEWED  = '#FFBF00';    // Amber (Using the standard code)
readonly COLOR_APPROVED = '#43a047';  // Green

// Define the size of each step segment (must sum to 100)
readonly SEGMENT_DRAFT = 10; // 10%
readonly SEGMENT_SUBMITFORREVIEW = 20; // 20%
readonly SEGMENT_REVIEWED = 30; // 30%
readonly SEGMENT_APPROVED = 40; // 40% (Note: This is the size of the final segment)

staffMap: { [activity: string]: number } = {};  
private siteAddress: string = '456 Tech Park Ave, Suite 100, City, Country';
  private emergencyContact: string = 'Joe Smith - (555) 987-6543 / j.smith@example.com';

  @ViewChild(CriticalBusinessProcessComponent) section1Component!: CriticalBusinessProcessComponent;
  @ViewChild(MinimumOperationalRequirementComponent) section6Component!: MinimumOperationalRequirementComponent;
  @ViewChild(BusinessRecoveryPlanComponent) section7Component!: BusinessRecoveryPlanComponent;

  // Inside your component class
customSteps = [
  { label: 'Critical Business Process', icon: 'business' },
  { label: 'Time Impact Analysis', icon: 'schedule' },
  { label: 'Key Planning Parameters', icon: 'settings' },
  { label: 'RTO Validation', icon: 'verified' },
  { label: 'Critical Support Headcount', icon: 'group' },
  { label: 'Minimum Operational Requirements', icon: 'checklist' },
  { label: 'Business Recovery Plan', icon: 'restore' },
  { label: 'Contacts Information', icon: 'contacts' },
  { label: 'Information Security', icon: 'security' }
];
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize form groups for each section
    this.section1Form = this.fb.group({
      // Section 1 fields will be added later
    });

    this.section2Form = this.fb.group({
      // Section 2 fields will be added later
    });

    this.section3Form = this.fb.group({
      // Section 3 fields will be added later
    });

    this.section4Form = this.fb.group({
      // Section 4 fields will be added later
    });

    this.section5Form = this.fb.group({
      // Section 5 fields will be added later
    });

    this.section6Form = this.fb.group({
      // Section 6 fields will be added later
    });

    this.section7Form = this.fb.group({
      // Section 7 fields will be added later
    });

    this.section8Form = this.fb.group({
      // Section 8 fields will be added later
    });

    this.section9Form = this.fb.group({
      // Section 9 fields will be added later
    });
  }

  ngOnInit(): void {

    this.siteAddress = localStorage.getItem('siteAddress') || this.siteAddress;
    this.emergencyContact = localStorage.getItem('emergencyContact') || this.emergencyContact;
    // Read query parameters
    this.route.queryParams.subscribe(params => {
      this.accountId = params['accountId'];
      this.mode = params['mode'];
      this.account = params['account'];
      this.project = params['project'];
      this.businessUnit = params['businessUnit'];
      this.role = params['role']; // 'spoc', 'pm', 'csm'
      
      // Read SCP status from query params if available
      // Status can be: 'Draft', 'Reviewed', 'Approved', or 'In Review'
      // Default to 'Draft' if not specified (new SCP creation)
      if (params['status']) {
        this.scpStatus = params['status'] as 'Draft' | 'Reviewed' | 'Approved' | 'In Review' | 'Submitted for Review' | 'Submitted for Approval';
      } else {
        // Default to Draft for new SCPs or when status is not specified
        this.scpStatus = 'Draft';
      }

      // Initialize section1Data with project information
      if (this.project) {
        this.section1Data = {
          projectName: this.project,
          services: [{
          activityService: '',
          criticality: '',
          contractual: '',
          penaltyDetails: '',
          customerImpact: '',
          regulatory: '',
          typeOfRegulatory: [],
          engagementPeriod: 0,
          technology: '',
          primaryDeliverySite: ''
          }]
        };
      }
      
      // Trigger change detection for OnPush strategy
      this.cdr.markForCheck();
    });
  }

  goBack(stepper: any): void {
    stepper.previous();
  }
  handleRtoFromSection3(map: { [activity: string]: string }) {
    this.rtoFromSection3 = map;
  }

  goNext(stepper: any): void {
    if(this.currentStepIndex === undefined){
      this.section1Data = this.section1Component.getSection1Data();
    }
    if(this.currentStepIndex === 4){
      this.section6Component.fillFromSection1(this.section1Data!);
    }
    if(this.currentStepIndex === 5){
      this.section7Component.fillFromSection1(this.section1Data!);
    }
    stepper.next();
  }

  canProceed(): boolean {
    // Validate based on current step index
    switch (this.currentStepIndex) {
      case 0:
        return this.section1Valid;
      case 1:
        return this.section2Valid;
      case 2:
        return this.section3Valid;
      case 3:
        return this.section4Valid;
      case 4:
        return this.section5Valid;
      case 5:
        return this.section6Valid;
      case 6:
        return this.section7Valid;
      case 7:
        return this.section8Valid;
      case 8:
        return this.section9Valid;
      default:
        return true;
    }
  }

  // Section 1 event handlers
  onSection1DataChange(data: CriticalBusinessProcessData): void {
    this.section1Data = data;
    //this.section1DataForSection6 = data;
  }

  onSection1ValidityChange(isValid: boolean): void {
    this.section1Valid = isValid;
  }

  // Section 2 event handlers
  onSection2DataChange(data: TimeImpactAnalysisData): void {
    this.section2Data = data;
  }

  onSection2ValidityChange(isValid: boolean): void {
    this.section2Valid = isValid;
  }

  // Section 3 event handlers
  onSection3DataChange(data: KeyPlanningParametersData): void {
    this.section3Data = data;
  }

  onSection3ValidityChange(isValid: boolean): void {
    this.section3Valid = isValid;
  }

  // Section 4 event handlers
  onSection4DataChange(data: RtoValidationData): void {
    this.section4Data = data;
  }

  onSection4ValidityChange(isValid: boolean): void {
    this.section4Valid = isValid;
  }

  onStepChange(event: any): void {
    this.currentStepIndex = event.selectedIndex;
  }

  // Section 5 event handlers
  onSection5DataChange(data: CshData): void {
    this.section5Data = data;
    //this.totalStaffForSection5 = data.totalStaff;
  }
  onStaffMapChange(map: { [activity: string]: number }) {
  this.staffMap = map;
}

  onSection5ValidityChange(isValid: boolean): void {
    this.section5Valid = isValid;
  }

  // Section 6 event handlers
  onSection6DataChange(data: MinimumOperationalRequirementData): void {
    this.section6Data = data;
  }

  onSection6ValidityChange(isValid: boolean): void {
    this.section6Valid = isValid;
  }

  // Section 7 event handlers
  onSection7DataChange(data: BusinessRecoveryPlanData): void {
    this.section7Data = data;
  }

  onSection7ValidityChange(isValid: boolean): void {
    this.section7Valid = isValid;
  }

  // Section 8 event handlers
  onSection8DataChange(data: ContactsInformationData): void {
    this.section8Data = data;
  }

  onSection8ValidityChange(isValid: boolean): void {
    this.section8Valid = isValid;
  }

  // Section 9 event handlers
  onSection9DataChange(data: InformationSecurityData): void {
    this.section9Data = data;
  } 

onSection9ValidityChange(isValid: boolean): void {
    this.section9Valid = isValid;
  } 
  /**
   * Checks if all 8 sections are completed and valid
   * @returns True if all sections are valid, false otherwise
   */
  areAllSectionsComplete(): boolean {
    return (
      this.section1Valid &&
      this.section2Valid &&
      this.section3Valid &&
      this.section4Valid &&
      this.section5Valid &&
      this.section6Valid &&
      this.section7Valid &&
      this.section8Valid &&
      this.section9Valid
    );
  }

  /**
   * Gets tooltip text for Submit for Review button
   * @returns Tooltip message explaining button state
   */
  getSubmitForReviewTooltip(): string {
    if (this.mode === 'view') {
      return 'Cannot submit in view mode';
    }
    
    if (!this.areAllSectionsComplete()) {
      const incompleteSections: string[] = [];
      if (!this.section1Valid) incompleteSections.push('1');
      if (!this.section2Valid) incompleteSections.push('2');
      if (!this.section3Valid) incompleteSections.push('3');
      if (!this.section4Valid) incompleteSections.push('4');
      if (!this.section5Valid) incompleteSections.push('5');
      if (!this.section6Valid) incompleteSections.push('6');
      if (!this.section7Valid) incompleteSections.push('7');
      if (!this.section8Valid) incompleteSections.push('8');
      if (!this.section9Valid) incompleteSections.push('9');

      
      return `Please complete all 9 sections before submitting for review. Missing: ${incompleteSections.join(', ')}`;
    }
    
    return 'Submit SCP for PM review. Workflow: BCP Coordinator → PM Review → CSM Approval → Approved (Downloadable)';
  }

  /**
   * Checks if download is allowed based on SCP approval status
   * Download is only allowed when SCP status is 'Approved'
   * Per US-1.15: Export SCP as PDF/DOCX - should only be available after PM review and CSM approval
   * @returns True if status is 'Approved', false otherwise
   */
  isDownloadAllowed(): boolean {
    return this.scpStatus === 'Approved';
  }

  /**
   * Gets tooltip text for download button
   * @returns Tooltip message explaining download availability
   */
  getDownloadTooltip(): string {
    if (this.isDownloadAllowed()) {
      return 'Download SCP document (PDF/DOCX)';
    }
    
    if (this.scpStatus === 'Draft') {
      return 'SCP must be reviewed by PM and approved by CSM before download. Current status: Draft';
    }
    
    if (this.scpStatus === 'Reviewed' || this.scpStatus === 'In Review') {
      return 'SCP must be approved by CSM before download. Current status: Reviewed';
    }
    
    return 'Download not available. SCP must be approved before download.';
  }

  /**
   * Downloads the SCP document as DOCX
   * Per US-1.15 and related stories (US-1.11, US-1.13, US-1.14):
   * - SCP can only be downloaded when status is 'Approved'
   * - Approval requires: Draft → Reviewed (PM) → Approved (CSM)
   */
  downloadSCP(): void {
    // Validate that SCP is approved before allowing download
    if (!this.isDownloadAllowed()) {
      const statusMessage = this.getStatusMessage();
      this.snackBar.open(
        `Download not available: ${statusMessage}`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // Proceed with download
    const html = this.buildSCPDocumentHtml();
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const project = this.project || 'SCP';
    a.href = url;
    a.download = `${project}-Service-Continuity-Plan.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    
    // Show success message
    this.snackBar.open(
      'SCP document downloaded successfully',
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Submits the SCP for PM review
   * Per US-1.11: Submit for Review (Draft → Reviewed)
   * Workflow: BCP Coordinator fills all 8 sections → Submit for Review → Status changes to Reviewed (orange)
   * - Status changes to Reviewed (orange)
   * - Audit captures user, timestamp, and comments
   * - Only available when all 8 sections are complete and status is Draft
   * - Only BCP Coordinator/SPOC can submit for review
   * - Once submitted, SCP becomes visible to PM in their review dashboard
   */
  submitForReview(): void {
    // Validate that all sections are complete
    if (!this.areAllSectionsComplete()) {
      this.snackBar.open(
        'Please complete all 9 sections before submitting for review.',
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    // Validate that status is Draft
    if (this.scpStatus !== 'Draft') {
      this.snackBar.open(
        `Cannot submit. Current status is ${this.scpStatus}. Only Draft SCPs can be submitted for review.`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // Validate mode
    if (this.mode === 'view') {
      this.snackBar.open(
        'Cannot submit in view mode. Please switch to edit mode.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // TODO: Here you would typically:
    // 1. Call a service to update the SCP status to 'Reviewed' or 'In Review'
    // 2. Create an audit entry with user, timestamp, and comments
    // 3. Notify the PM about the submission
    // For now, we'll update the local status and URL query params
    
    // Update status to 'In Review' (visible to PM) - per US-1.11, status transitions to Reviewed
    // Using 'In Review' to distinguish from PM-reviewed status which is 'Reviewed'
    const newStatus: 'Draft' | 'Reviewed' | 'Approved' | 'In Review' = 'In Review';
    this.scpStatus = newStatus;
    
    // Update URL with new status so it persists in navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.route.snapshot.queryParams,
        status: newStatus
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    
    // Trigger change detection for OnPush strategy
    this.cdr.markForCheck();
    
    // Show success message with navigation option
    const snackBarRef = this.snackBar.open(
      'SCP submitted for PM review successfully! Status changed to In Review. The SCP is now visible in PM Review Dashboard.',
      'View PM Dashboard',
      {
        duration: 8000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      }
    );

    // Add action to navigate to PM review dashboard
    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/bcm/scp/pm/review']);
    });

    // TODO: In a real implementation, you would:
    // - Save all section data to the backend
    // - Update SCP status in database to 'In Review' or 'Reviewed'
    // - Create audit log entry with user, timestamp, and comments
    // - Send notification to PM
    // - Refresh the page or update status from backend response
  }

  /**
   * Submits the SCP for CSM approval
   * Per US-1.13: Submit for Approval (Reviewed → Approved)
   * Only PM can initiate; status transitions recorded
   * Note: Status remains 'Reviewed' but is marked as reviewed by PM and ready for CSM approval
   */
  submitForApproval(): void {
    // Validate role - only PM can submit for approval
    if (this.role !== 'pm') {
      this.snackBar.open(
        'Only Project Managers can submit SCPs for CSM approval.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // Validate status - must be Reviewed (submitted by SPOC for PM review)
    if (this.scpStatus !== 'Reviewed' && this.scpStatus !== 'In Review') {
      this.snackBar.open(
        `Cannot submit. Current status is ${this.scpStatus}. Only Reviewed SCPs (submitted by BCP Coordinator) can be submitted for CSM approval.`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // TODO: Call service to:
    // - Update SCP to mark it as reviewed by PM and ready for CSM approval
    // - Status remains 'Reviewed' but with PM review flag/comments
    // - Make it visible in CSM approval dashboard
    // - Create audit log entry
    
    // Show success message
    this.snackBar.open(
      'SCP submitted for CSM approval successfully. CSM will review and approve the document.',
      'Close',
      {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      }
    );

    // Update status to remain Reviewed but ready for CSM
    // In real implementation, backend would track PM review status separately
    // For now, status stays 'Reviewed' and CSM dashboard filters for PM-reviewed items
    this.cdr.markForCheck();

    // Optionally redirect to PM dashboard
    // this.router.navigate(['/scp/pm/review']);
  }

  /**
   * Approves the SCP
   * Per US-1.14: Approve (Final Approved)
   * Workflow: PM submits for approval → CSM reviews → Approves → Status set to Approved (green)
   * - Status set to Approved (green)
   * - Form becomes read-only for non-admin roles
   * - Download button becomes enabled
   * - Only CSM can approve
   */
  approveScp(): void {
    // Validate role
    if (this.role !== 'csm') {
      this.snackBar.open(
        'Only Customer Success Managers can approve SCPs.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // Update status to Approved
    this.scpStatus = 'Approved';
    
    // Trigger change detection for OnPush strategy
    this.cdr.markForCheck();
    
    // Show success message
    this.snackBar.open(
      'SCP approved successfully! Status changed to Approved. Document is now available for download.',
      'Close',
      {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      }
    );

    // TODO: Call service to:
    // - Update SCP status in database to 'Approved'
    // - Create audit log entry
    // - Lock form for edits (make read-only)
    // - Notify stakeholders
  }

  /**
   * Gets a user-friendly status message for display
   * @returns Status message explaining current workflow state
   */
  private getStatusMessage(): string {
    switch (this.scpStatus) {
      case 'Draft':
        return 'SCP is in Draft status. Please submit for PM review first, then await CSM approval.';
      case 'Reviewed':
      case 'In Review':
        return 'SCP has been reviewed by PM. Please wait for CSM approval to download.';
      default:
        return 'SCP must be approved by CSM before download.';
    }
  }

  private buildSection(title: string, content: string): string {
    return `
      <h2 class="heading-1">${title}</h2>
      <div style="margin:8px 0 16px 0;">${content}</div>
    `;
  }

  private buildKeyValTable(rows: Array<[string, string | number | undefined | null]>): string {
    const tr = rows
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
      .map(([k, v]) => `<tr><td style="font-weight:600;padding:6px;border:1px solid #ddd;">${k}</td><td style="padding:6px;border:1px solid #ddd;">${this.escape(String(v))}</td></tr>`) 
      .join('');
    return `<table style="width:100%;border-collapse:collapse;margin:6px 0 12px 0;">${tr}</table>`;
  }

  private buildList(items: string[], title?: string): string {
    if (!items || !items.length) return '';
    const li = items.map(i => `<li>${this.escape(i)}</li>`).join('');
    return `${title ? `<div style=\"font-weight:600;margin-top:6px;\">${title}</div>` : ''}<ul>${li}</ul>`;
  }

  private buildSCPDocumentHtml(): string {
    const neurealmLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
    const documentStyles = `
        font-family: Arial, sans-serif;
        line-height: 1.5;
        font-size: 11pt;
    `;
    const styles = `
        <style>
            @page { margin: 1in; }
            @page :right{ @bottom-right { content: "Page " counter(page); font-size: 9pt; color: #555} }
            body { font-family: 'Gabarito'; line-height: 1.4; color: #000; }
            .page { page-break-after: always; }
            .page-start { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
            .center { text-align: center; }

            /* Cover PAGE */
            .cover-image { width: 150px; height: auto; margin-bottom: 20px; }
            .cover-title { font-size: 28pt; font-weight: semi-bold; color: #e5002b; }
            .cover-subtitle { font-size: 16pt; margin-top: 10px; }

            /* Header */
            .header { width: 100%; border-bottom: 1.5pt solid #000; margin-bottom: 20px; }
            .heading-text { font-size: 10pt; font-weight: semi-bold; color: #000; vertical-align: bottom; }
            .header-logo { text-align: right; vertical-align: bottom; }
            .logo-img { width: 120px; height: auto; }

            
            /* Table Formatting [cite: 22, 23] */
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th { background-color: #283372; color: white; padding: 8px; border: 1px solid black; text-align: center; font-weight: semi-bold; font-size: 10pt; }
            td { padding: 8px; border: 1px solid #ccc; vertical-align: top; }

            /* Confidential */
            .confidential-box { border: 2px solid #000; margin-top: 20px; }
            .confidential-box th { background-color: #e5002b; color: white; font-size: 16pt; font-weight: semi-bold; }
            .confidential-box td { font-size: 10pt; color: black; background-color: #f9f9f9; padding: 12px; }

            /* footer */
            .footer { margin-top: 40px; font-size: 9pt; color: #000; text-align: center; }

        </style>
    `;
    //page context
    const page = (content: string) => `
        <div class="page page-start">
            ${headerContent}
            ${content}
            ${footerContent}
          </div>`;

    // THE HEADER [Matching your uploaded image]
  const headerContent = `
    <table class="header">
      <tr>
        <td class="header-text">Service Continuity Plan</td>
        <td class="header-logo">
          <img src="${neurealmLogoBase64}" class="logo-img" alt="Neurealm">
        </td>
      </tr>
    </table>
  `;

   // THE FOOTER [Matching your uploaded image]
  const footerContent = `
    <div class="footer">
       ${new Date().getFullYear()} Neurealm Private Limited. All rights reserved.
    </div>
  `;

   // 2. COVER PAGE [cite: 1, 2, 4, 5]
    const coverPage = `
        <div class="page center">
            <img src="${neurealmLogoBase64}" class="cover-image" />
            <div class="cover-title">Service Continuity Plan (SCP)</div>
            <div class="cover-subtitle">${this.escape(this.project || 'HEADLINE')}</div>
            <div style="margin-top: 100px;">
                <strong>Author Name:</strong> ${this.escape('User Name')}<br>
                <strong>Version:</strong> 1.0<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
            <img src="${neurealmLogoBase64}" class="logo-img" style="margin-top:50px;"/>
        </div>
    `;

    // 3. DOCUMENT HISTORY & CONFIDENTIALITY [cite: 6, 7, 8]
    const historySection = page(`
        <h3>Document History</h3>
        <table class="no-break">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Version</th>
                    <th>Summary of Changes</th>
                    <th>Author</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${new Date().toLocaleDateString()}</td>
                    <td>1.0</td>
                    <td>Initial Plan Generation</td>
                    <td>System User</td>
                </tr>
            </tbody>
        </table>

        <table>
            <tr>
                <th>Site Address</th>
                <th>Emergency Contacts</th>
            </tr>
            <tr>
                <td>${this.siteAddress}</td>
                <td>${this.emergencyContact}</td>
            </tr>
        </table>

        <table class="confidential-box">
            <thead>
                <tr>
                    <th>Statement of Confidentiality</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                    <p>This artefact and/or document and/or presentation is strictly confidential and it contains proprietary information of Neurealm Private Limited (formerly known as GAVS Technologies Private Limited) and its affiliates (Neurealm) intended only for recipients of Neurealm. The recipient acknowledges and agrees that: (i) this artefact and/or document is not intended to be distributed (ii) the recipient does not have the right to implement, copy, reproduce, fax, print, publicly divulge, or further distribute it, in whole or in part in any form, without seeking the express written permission from Neurealm. Any unauthorized use of the contents of this artefact and/or document and/or presentation in any manner whatsoever, is strictly prohibited. The artefact and/or document and/or presentation represents Neurealm's current product offerings and best practices which are subject to change without notice. Please note that Neurealm collaborates in relation to some of its offerings.
                    <br/>
                      All third-party trademarks used herein belong to their respective owners and may be protected by law. This artefact and/or document and/or presentation only refers to such trademarks under the doctrines of nominative and descriptive fair usage to illustrate and explain concepts without implying violation of any legal constraints. If any improper activity is suspected, all available information may be used by  Neurealm  for lawful purposes and to seek appropriate remedies.  Neurealm complies with applicable privacy laws and regulations. Recipients are advised to handle the information contained in this Material in accordance with relevant privacy and data protection laws.
                    </p></td>
                </tr>
            </tbody>
        </table>

        <div class="page-break"></div>
    `);
    

    // Section 1
    let s1 = '<i>No data</i>';
    if (this.section1Data) {
      let section1Html = `<h3>Project Name: ${this.escape(this.section1Data.projectName)}</h3>`;
      
      if (this.section1Data.services && this.section1Data.services.length > 0) {
        const services = this.section1Data.services;
        services.forEach((service, index) => {
          section1Html += `<h4>Service ${index + 1}</h4>`;
          section1Html += this.buildKeyValTable([
            ['Activity / Service', service.activityService],
            ['Criticality', service.criticality],
            ['Contractual', service.contractual],
            ['Penalty Details', service.penaltyDetails || '-'],
            ['Customer Impact', service.customerImpact],
            ['Regulatory', service.regulatory],
            ['Type of Regulatory', (service.typeOfRegulatory || []).join(', ') || '-'],
            ['Engagement Period (months)', service.engagementPeriod],
            ['Technology', service.technology],
            ['Primary Delivery Site', service.primaryDeliverySite],
          ]);
          if (index < services.length - 1) {
            section1Html += '<hr style="margin: 1.5rem 0;" />';
          }
        });
      } else {
        section1Html += '<p><i>No services added</i></p>';
      }
      
      s1 = section1Html;
    }

    // Section 2
    const s2 = this.section2Data ? this.buildKeyValTable([
      ['Impact A', this.section2Data.impactA],
      ['Impact B', this.section2Data.impactB],
      ['Impact C', this.section2Data.impactC],
      ['Impact D', this.section2Data.impactD],
      ['MTPD', this.section2Data.mtpd],
      ['Explain Dependency', this.section2Data.explainDependency],
    ]) : '<i>No data</i>';

    // Section 3
    const s3 = this.section3Data ? this.buildKeyValTable([
      ['Configurable Item', this.section3Data.configurableItem],
      ['RPO (minutes)', this.section3Data.rpo],
      ['RTO Guidance', this.section3Data.rtoGuidance],
      ['Minimum SLA', this.section3Data.minimumSLA],
      ['RTO', this.section3Data.rto],
      ['MBCO', this.section3Data.mbco],
    ]) : '<i>No data</i>';

    // Section 4
    const s4 = this.section4Data ? this.buildKeyValTable([
      ['Evacuation', (this.section4Data as any).evacuation],
      ['BCP Invocation', (this.section4Data as any).bcpInvocation],
      ['Call Tree', (this.section4Data as any).callTree],
      ['Travel / Work Handover', (this.section4Data as any).travelWorkHandover],
      ['Work Resumption', (this.section4Data as any).workResumption],
      ['TCRT', (this.section4Data as any).tcrt],
      ['Residual RTO', (this.section4Data as any).residualRto],
      ['RTO Met', (this.section4Data as any).rtoMet ? 'Yes' : 'No'],
    ]) : '<i>No data</i>';

    // Section 5
    const s5 = this.section5Data ? this.buildKeyValTable([
      ['Total Staff', this.section5Data.totalStaff],
      ['CSH', this.section5Data.csh],
      ['Extended CSH', this.section5Data.extendedCsh ?? ''],
      ['PAS', this.section5Data.pas],
      ['Site Name', this.section5Data.siteName ?? ''],
      ['Inter-Site Agreement', this.section5Data.interSiteAgreement],
    ]) : '<i>No data</i>';

    // Section 6
    const s6 = this.section6Data ? `
      ${this.buildList(this.section6Data.operational || [], 'Operational Requirements')}
      ${this.buildList(this.section6Data.resource || [], 'Resource Requirements')}
    ` : '<i>No data</i>';

    // Section 7
    const s7 = this.section7Data ? this.buildKeyValTable([
      ['Outage Scenario', this.section7Data.outageScenario],
      ['Recovery Strategy', this.section7Data.recoveryStrategy],
      ['Custom Recovery Strategy', this.section7Data.customRecoveryStrategy ?? ''],
      ['Comments', this.section7Data.comments ?? ''],
    ]) : '<i>No data</i>';

    // Section 8
    const s8 = this.section8Data ? `
      ${this.buildList((this.section8Data.projectContacts || []).map(c => `${c.businessUnit} | ${c.name} | ${c.role} | ${c.email} | ${c.phone}`), 'Project Contacts')}
      ${this.buildKeyValTable([
        ['Authority To Invoke Account BRP', this.section8Data.authorityToInvokeBrpUrl],
        ['Account Contacts Internal/External', this.section8Data.accountContactsUrl],
        ['Critical Support Headcount Details', this.section8Data.cshDetailsUrl],
      ])}
    ` : '<i>No data</i>';

    const body = [
      this.buildSection('1. Critical Business Process', s1),
      this.buildSection('2. Time Impact Analysis (MTPD)', s2),
      this.buildSection('3. Key Planning Parameters (RTO/RPO)', s3),
      this.buildSection('4. RTO Validation Calculations', s4),
      this.buildSection('5. Critical Support Headcount (CSH)', s5),
      this.buildSection('6. Minimum Operational Requirement', s6),
      this.buildSection('7. Business Recovery Plan', s7),
      this.buildSection('8. Contacts Information', s8),
    ].join('');

    // 5. BLANK END PAGE 
    const endPage = `
        <div class="page-break"></div>
        <div style="text-align: center; margin-top: 200pt; color: #ccc;">
            <div class="body-text">This is the end page. Leave this page blank.</div>
        </div>
    `;
    return `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}</head><body>${coverPage}${historySection}${body}${endPage}</body></html>`;
  }

  private escape(v: string): string {
    return v.replace(/[&<>]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[s] as string));
  }

  get workflowStatusGradient(): string {
    const split1 = this.SEGMENT_DRAFT; // 10%
    const split2 = this.SEGMENT_DRAFT + this.SEGMENT_SUBMITFORREVIEW; // 30%
    const split3 = this.SEGMENT_DRAFT + this.SEGMENT_SUBMITFORREVIEW + this.SEGMENT_REVIEWED; // 60%
    // The bar is always 100% wide.

    switch (this.scpStatus) {
        case 'Draft':
            // 0-30% Gray, 30%-100% Transparent
            return `linear-gradient(
                to right,
                ${this.COLOR_DRAFT} 0%,
                ${this.COLOR_DRAFT} ${split1}%,
                transparent ${split1}%,
                transparent 100%
            )`;

        case 'Submitted for Review':
        case 'In Review': {
            return `linear-gradient(
                to right,
                ${this.COLOR_SUBMITFORREVIEW} 0%,
                ${this.COLOR_SUBMITFORREVIEW} ${split2}%,
                transparent ${split2}%,
                transparent 100%
            )`;
        }
        
        case 'Reviewed':
        case 'Submitted for Approval': // Assuming Reviewed/Submitted for Approval also fills the bar to 100%
        {
          return `linear-gradient(
                to right,
                ${this.COLOR_REVIEWED} 0%,
                ${this.COLOR_REVIEWED} ${split3}%,
                transparent ${split3}%,
                transparent 100%
            )`;
        }
        case 'Approved':
         {
             // 0-30% Gray, 30%-60% Amber, 60%-100% Green (Final status)
            return `linear-gradient(
                to right,
                ${this.COLOR_APPROVED} 0%,
                ${this.COLOR_APPROVED} 100%
            )`;
        }
        default:
            return 'none';
    }
  }

  resetWorkflow() {
    this.scpStatus = 'Draft';
    this.cdr.markForCheck();
  }

  navigateBack() {
    this.router.navigate(['/bcm/scp']);
  }
}
