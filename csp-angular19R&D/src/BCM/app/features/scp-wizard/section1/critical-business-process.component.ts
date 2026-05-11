import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { AddServiceDialogComponent } from './add-service-dialog.component';
import { MyUtility } from '../../../../../app/shared/my-utility';

/**
 * Interface representing a single Activity/Service entry
 */
export interface ActivityServiceEntry {
  /** Activity or service being provided */
  activityService: string;
  /** Criticality level of the process */
  criticality: string;
  /** Whether there are contractual obligations */
  contractual: string;
  /** Optional penalty details for contractual obligations */
  penaltyDetails?: string;
  /** Whether there is customer impact */
  customerImpact: string;
  /** Whether regulatory compliance is required */
  regulatory: string;
  /** Types of regulatory compliance (conditional) */
  typeOfRegulatory?: string[];
  /** Engagement period in months */
  engagementPeriod: number;
  /** Technologies used */
  technology: string;
  /** Primary delivery site location */
  primaryDeliverySite: string;
}

/**
 * Interface representing the data structure for Critical Business Process form
 */
export interface CriticalBusinessProcessData {
  /** Project name (auto-filled from CSM) */
  projectName: string;
  /** Array of Activity/Service entries */
  services: ActivityServiceEntry[];
}

@Component({
  selector: 'bcp-critical-business-process',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatTableModule,
  ],
  templateUrl: './critical-business-process.component.html',
  styles: [
    `
      .section-card {
        margin: 0;
        max-width: 100%;
        box-shadow: none;
        border-radius: 0;
        height: auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }


      .section-card .mat-mdc-card-subtitle {
        color: #7f8c8d;
        margin-top: 0.25rem;
        text-align: center;
        font-size: 0.9rem;
        font-weight: 400;
        background-color: transparent;
        padding: 0;
        border: none;
        box-shadow: none;
      }

      .form-container {
        max-width: 100%;
        margin: 0 auto;
        padding: 1rem 1rem 0 1rem;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .form-flex {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
        justify-content: flex-start;
        flex: 1;
        overflow: hidden;
        padding-top: 0.5rem;
      }

      .form-field {
        display: flex;
        flex-direction: column;
      }

      .form-field.full-width {
        grid-column: 1 / -1;
      }

      .form-field.half-width {
        grid-column: span 1;
      }

      .form-field.third-width {
        grid-column: span 1;
      }

      .full-width {
        width: 100%;
        max-width: 100%;
      }

      .mat-mdc-form-field {
        width: 100%;
        max-width: 100%;
        margin-bottom: 0.75rem;
      }

      /* Ensure form field labels are properly visible */
      .mat-mdc-form-field .mat-mdc-form-field-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 0.25rem;
      }

      /* Improve form field spacing */
      .mat-mdc-form-field .mat-mdc-text-field-wrapper {
        margin-top: 0.5rem;
      }


      .section-actions {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.75rem;
        border-top: 1px solid #e0e0e0;
        background-color: #fafafa;
        gap: 1rem;
        flex-shrink: 0;
      }

      .spacer {
        flex: 1;
      }

      .validation-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        margin-left: 1rem;
      }

      .validation-status.success {
        color: #4caf50;
      }

      .validation-status:not(.success) {
        color: #f44336;
      }

      /* Form field styling */
      .mat-mdc-form-field {
        margin-bottom: 0.5rem;
      }

      .mat-mdc-form-field .mat-mdc-text-field-wrapper {
        background-color: #fff;
      }

      /* Better spacing for form fields */
      .mat-mdc-form-field .mat-mdc-form-field-infix {
        padding: 0.75rem 0;
      }

      .mat-mdc-form-field .mat-mdc-form-field-label {
        font-weight: 500;
      }

      /* Improved input field appearance */
      .mat-mdc-form-field .mat-mdc-text-field-wrapper .mat-mdc-form-field-flex {
        align-items: center;
      }

      /* Add Service Button Container */
      .add-service-container {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1.5rem;
        padding: 0;
      }

      .add-service-btn {
        position: relative !important;
        z-index: 1000 !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        min-width: 140px;
        display: inline-flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }

      .add-service-btn:not([disabled]):hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
        background-color: #1565c0 !important;
      }

      .add-service-btn:not([disabled]):active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .add-service-btn[disabled] {
        pointer-events: none !important;
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }

      .services-table-container {
        margin-top: 0;
        overflow-x: auto;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        background: white;
        position: relative;
      }

      .services-table {
        width: 100%;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
      }

      .services-table th {
        background-color: #f5f5f5;
        color: #2c3e50;
        font-weight: 600;
        font-size: 0.875rem;
        padding: 1rem 0.75rem;
        text-align: left;
        border-bottom: 2px solid #e0e0e0;
        white-space: nowrap;
        position: sticky;
        top: 0;
        z-index: 1;
      }

      .services-table td {
        padding: 0.75rem;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.875rem;
        color: #2c3e50;
        word-wrap: break-word;
        max-width: 200px;
      }

      .text-muted {
        color: #6c757d;
        font-style: italic;
      }

      .services-table tr:hover {
        background-color: #f8f9fa;
      }

      .services-table tr:last-child td {
        border-bottom: none;
      }

      .actions-cell {
        display: flex !important;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;
        min-width: 100px;
        position: relative !important;
        z-index: 100 !important;
        pointer-events: auto !important;
      }

      .actions-cell button,
      .actions-cell .edit-btn,
      .actions-cell .delete-btn,
      .actions-cell button.mat-mdc-icon-button {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        min-height: 36px !important;
        position: relative !important;
        z-index: 10000 !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        display: inline-flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 2px !important;
        padding: 0 !important;
        flex-shrink: 0 !important;
      }

      .actions-cell button mat-icon,
      .actions-cell .edit-btn mat-icon,
      .actions-cell .delete-btn mat-icon {
        pointer-events: none !important;
      }

      .actions-cell button:not([disabled]):hover,
      .actions-cell .edit-btn:not([disabled]):hover,
      .actions-cell .delete-btn:not([disabled]):hover,
      .actions-cell button.mat-mdc-icon-button:not([disabled]):hover {
        transform: scale(1.1) !important;
        opacity: 0.9 !important;
        background-color: rgba(0, 0, 0, 0.04) !important;
      }

      .actions-cell button:not([disabled]):active,
      .actions-cell .edit-btn:not([disabled]):active,
      .actions-cell .delete-btn:not([disabled]):active {
        transform: scale(0.95) !important;
      }

      .actions-cell button[disabled],
      .actions-cell .edit-btn[disabled],
      .actions-cell .delete-btn[disabled] {
        pointer-events: none !important;
        opacity: 0.4 !important;
        cursor: not-allowed !important;
      }

      /* Ensure table cells don't block button clicks */
      .services-table td.actions-cell {
        pointer-events: auto !important;
        position: relative;
        z-index: 50;
      }

      .services-table tr {
        position: relative;
      }

      .services-table tr td:not(.actions-cell) {
        pointer-events: auto;
      }

      /* Override any Material table styles that might block clicks */
      .services-table .mat-mdc-cell.actions-cell {
        pointer-events: auto !important;
        position: sticky !important;
        z-index: 100 !important;
        overflow: visible !important;
      }

      .services-table .mat-mdc-cell.actions-cell * {
        pointer-events: auto !important;
      }

      .services-table .mat-mdc-cell.actions-cell button {
        pointer-events: auto !important;
        position: sticky !important;
        z-index: 10000 !important;
      }

      /* Ensure buttons are not blocked by Material's ripple effect */
      ::ng-deep .services-table .mat-mdc-icon-button {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 10000 !important;
      }

      ::ng-deep .services-table .mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
        pointer-events: none !important;
      }

      ::ng-deep .services-table .mat-mdc-icon-button .mat-ripple-element {
        pointer-events: none !important;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #6c757d;
        background-color: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 8px;
      }

      .empty-state mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0;
        font-size: 1rem;
      }

      /* Responsive design */
      @media (max-width: 1200px) {
        .form-flex {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
      }

      @media (max-width: 1024px) {
        .section-card {
          margin: 0.5rem auto;
        }

        .form-container {
          padding: 0 1rem;
        }

        .form-flex {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
      }

      @media (max-width: 768px) {
        .form-flex {
          grid-template-columns: 1fr;
          gap: 0.75rem;
          padding-top: 0.25rem;
        }

        .section-card {
          margin: 0.25rem;
        }

        .form-container {
          padding: 0.75rem 0.75rem 0 0.75rem;
        }


        .section-actions {
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
        }

        .spacer {
          display: none;
        }

        .validation-status {
          font-size: 0.8rem;
          margin-left: 0;
        }
      }

      @media (max-width: 480px) {
        .form-flex {
          gap: 0.75rem;
        }

        .section-card {
          margin: 0.125rem;
        }

        .form-container {
          padding: 0 0.5rem;
        }

        .section-card .mat-mdc-card-header {
          padding: 0.5rem 0.75rem;
        }

        .section-card .mat-mdc-card-title {
          font-size: 0.9rem;
        }

        .section-actions {
          padding: 0.75rem;
        }
      }
    `,
  ],
})
/**
 * Component for managing Critical Business Process form data
 * Implements reactive forms with validation and conditional logic
 */
export class CriticalBusinessProcessComponent implements OnInit, OnDestroy, OnChanges {
  /** Initial data to populate the form */
  @Input() initialData?: CriticalBusinessProcessData;
  /** Mode of operation - 'view' or 'edit' */
  @Input() mode: 'view' | 'edit' = 'edit';
  /** Emits form data when valid */
  @Output() dataChange = new EventEmitter<CriticalBusinessProcessData>();
  /** Emits form validity status */
  @Output() validityChange = new EventEmitter<boolean>();

  /** Reactive form group for all form controls */
  cbpForm: FormGroup;

  /** Table columns to display */
  displayedColumns: string[] = [
    'activityService',
    'criticality',
    'contractual',
    'penaltyDetails',
    'customerImpact',
    'regulatory',
    'typeOfRegulatory',
    'engagementPeriod',
    'technology',
    'primaryDeliverySite',
    'actions'
  ];
  
  /** Subject to handle component destruction for unsubscribing */
  private destroy$ = new Subject<void>();
  
  /** Track which service indices have validation set up to avoid duplicates */
  private validationSetupIndices = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private _util: MyUtility
  ) {
    this.cbpForm = this.fb.group({
      services: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    });
  }

  /**
   * Gets the services FormArray
   */
  get servicesArray(): FormArray {
    return this.cbpForm.get('services') as FormArray;
  }

  /**
   * Creates a new service form group with all required fields
   * @returns FormGroup for a single service entry
   */
  private createServiceFormGroup(): FormGroup {
    return this.fb.group({
      activityService: ['', [Validators.required, Validators.maxLength(100)]],
      criticality: ['', Validators.required],
      contractual: ['', Validators.required],
      penaltyDetails: [''], // Optional field
      customerImpact: ['', Validators.required],
      regulatory: ['', Validators.required],
      typeOfRegulatory: [[]], // Conditional validation applied in setupServiceConditionalValidation
      engagementPeriod: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      technology: ['', [Validators.required, Validators.maxLength(200)]],
      primaryDeliverySite: ['', Validators.required],
    });
  }

  /**
   * Gets a form control from a specific service entry
   * @param index - Index of the service in the FormArray
   * @param controlName - Name of the control to retrieve
   * @returns AbstractControl or null
   */
  getServiceControl(index: number, controlName: string): AbstractControl | null {
    const serviceGroup = this.servicesArray.at(index) as FormGroup;
    return serviceGroup ? serviceGroup.get(controlName) : null;
  }

  /**
   * Opens a modal dialog to add a new service entry
   * @param event - Click event to prevent default form submission
   */
  addService(event?: Event): void {
    // Prevent form submission and event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Prevent action if in view mode
    if (this.mode === 'view') {
      return;
    }

    // Check if dialog service is available
    if (!this.dialog) {
      console.error('MatDialog service is not available');
      this._util.showWarningPopup('Dialog service is not available. Please refresh the page.', 'Service Error');
      return;
    }

    try {
      const dialogRef = this.dialog.open(AddServiceDialogComponent, {
        width: '800px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: false,
        hasBackdrop: true,
        panelClass: 'add-service-dialog',
        data: {
          mode: 'add',
          serviceData: null
        }
      });


      dialogRef.afterClosed().subscribe((result: { data?: ActivityServiceEntry; action: 'save' | 'saveAndAdd' } | null) => {
        if (result && result.data) {
          const newService = this.createServiceFormGroup();
          newService.patchValue(result.data, { emitEvent: false });
          this.servicesArray.push(newService);
          // Setup conditional validation BEFORE marking as touched
          this.setupServiceConditionalValidation(this.servicesArray.length - 1);
          // Mark form and service as touched to trigger validation
          this.cbpForm.markAsTouched();
          newService.markAllAsTouched();
          // Force validation update on all controls
          this.cbpForm.updateValueAndValidity({ emitEvent: false });
          newService.updateValueAndValidity({ emitEvent: false });
          // Update validation status
          this.updateSectionValidity();
          
          this.onFormChange(); // Trigger form change to save
          this.cdr.markForCheck();
          
          // If "Save and Add New" was clicked, open the dialog again
          if (result.action === 'saveAndAdd') {
            // Small delay to ensure UI updates
            setTimeout(() => {
              this.addService();
            }, 100);
          }
        }
      });
    } catch (error) {
      console.error('Error opening dialog:', error);
      // Show user-friendly error message
      this._util.showWarningPopup('Unable to open the Add Service dialog. Please check the console for details.', 'Dialog Error');
    }
  }

  /**
   * Opens a modal dialog to edit an existing service entry
   * @param index - Index of the service to edit in the FormArray
   * @param event - Click event to prevent propagation
   */
  editService(index: number, event?: Event): void {
    // Prevent event bubbling immediately
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    // Prevent action if in view mode
    if (this.mode === 'view') {
      return;
    }

    // Validate index
    if (index === null || index === undefined || isNaN(index) || index < 0) {
      console.error('Invalid index provided:', index);
      this._util.showWarningPopup('Invalid service index. Please try again.', 'Validation Error');
      return;
    }

    // Check bounds
    if (index >= this.servicesArray.length) {
      console.error('Index out of bounds:', index, 'Array length:', this.servicesArray.length);
      this._util.showWarningPopup('Service not found. Please refresh and try again.', 'Not Found');
      return;
    }

    const serviceGroup = this.servicesArray.at(index) as FormGroup;
    if (!serviceGroup) {
      console.error('Service group not found at index:', index);
      this._util.showWarningPopup('Service data not found. Please try again.', 'Data Error');
      return;
    }

    const serviceData: ActivityServiceEntry = {
      activityService: serviceGroup.get('activityService')?.value || '',
      criticality: serviceGroup.get('criticality')?.value || '',
      contractual: serviceGroup.get('contractual')?.value || '',
      penaltyDetails: serviceGroup.get('penaltyDetails')?.value || undefined,
      customerImpact: serviceGroup.get('customerImpact')?.value || '',
      regulatory: serviceGroup.get('regulatory')?.value || '',
      typeOfRegulatory: serviceGroup.get('typeOfRegulatory')?.value || [],
      engagementPeriod: serviceGroup.get('engagementPeriod')?.value || null,
      technology: serviceGroup.get('technology')?.value || '',
      primaryDeliverySite: serviceGroup.get('primaryDeliverySite')?.value || '',
    };

    try {
      const dialogRef = this.dialog.open(AddServiceDialogComponent, {
        width: '800px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: false,
        hasBackdrop: true,
        panelClass: 'add-service-dialog',
        data: {
          mode: 'edit',
          serviceData: serviceData
        }
      });

      dialogRef.afterClosed().subscribe((result: { data?: ActivityServiceEntry; action: 'save' | 'saveAndAdd' } | null) => {
        if (result && result.data) {
          serviceGroup.patchValue(result.data, { emitEvent: false });
          // Re-setup conditional validation to apply validators based on new values (force setup)
          this.setupServiceConditionalValidation(index, true);
          // Mark form and service as touched to trigger validation
          this.cbpForm.markAsTouched();
          serviceGroup.markAllAsTouched();
          // Force validation update on all controls
          this.cbpForm.updateValueAndValidity({ emitEvent: false });
          serviceGroup.updateValueAndValidity({ emitEvent: false });
          // Update validation status
          this.updateSectionValidity();
          this.onFormChange(); // Trigger form change to save
          this.cdr.markForCheck();
        }
      });
    } catch (error) {
      console.error('Error opening edit dialog:', error);
      this._util.showWarningPopup('Unable to open the edit dialog. Please try again.', 'Dialog Error');
    }
  }

  /**
   * Gets the data source for the services table
   * Filters out empty/incomplete entries (entries without activityService)
   * @returns Array of service entries with index
   */
  getServicesDataSource(): Array<ActivityServiceEntry & { _index: number }> {
    const result: Array<ActivityServiceEntry & { _index: number }> = [];
    
    this.servicesArray.controls.forEach((control, index) => {
      const serviceGroup = control as FormGroup;
      const activityService = serviceGroup.get('activityService')?.value || '';
      
      // Only include entries that have an activityService value
      if (activityService && activityService.trim() !== '') {
        const typeOfRegulatoryValue = serviceGroup.get('typeOfRegulatory')?.value;
        result.push({
          _index: index,
          activityService: activityService,
          criticality: serviceGroup.get('criticality')?.value || '',
          contractual: serviceGroup.get('contractual')?.value || '',
          penaltyDetails: serviceGroup.get('penaltyDetails')?.value || undefined,
          customerImpact: serviceGroup.get('customerImpact')?.value || '',
          regulatory: serviceGroup.get('regulatory')?.value || '',
          typeOfRegulatory: Array.isArray(typeOfRegulatoryValue) && typeOfRegulatoryValue.length > 0 
            ? typeOfRegulatoryValue 
            : undefined,
          engagementPeriod: serviceGroup.get('engagementPeriod')?.value || null,
          technology: serviceGroup.get('technology')?.value || '',
          primaryDeliverySite: serviceGroup.get('primaryDeliverySite')?.value || '',
        });
      }
    });
    
    return result;
  }

  /**
   * Removes a service entry from the form
   * @param index - Index of the service to remove in the FormArray
   * @param event - Click event to prevent propagation
   */
  removeService(index: number, event?: Event): void {
    // Prevent event bubbling immediately
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    // Prevent action if in view mode
    if (this.mode === 'view') {
      return;
    }

    // Validate index
    if (index === null || index === undefined || isNaN(index) || index < 0) {
      console.error('Invalid index provided:', index);
      this._util.showWarningPopup('Invalid service index. Please try again.', 'Validation Error');
      return;
    }

    // Check bounds - use actual FormArray length, not filtered data source
    if (index >= this.servicesArray.length) {
      console.error('Index out of bounds:', index, 'Array length:', this.servicesArray.length);
      this._util.showWarningPopup('Service not found. Please refresh and try again.', 'Not Found');
      return;
    }

    const serviceGroup = this.servicesArray.at(index) as FormGroup;
    if (!serviceGroup) {
      console.error('Service group not found at index:', index);
      this._util.showWarningPopup('Service data not found. Please try again.', 'Data Error');
      return;
    }

    // Get the activity service name for confirmation message
    const activityService = serviceGroup.get('activityService')?.value || 'this service';
    const currentServicesCount = this.getServicesDataSource().length;
    
    // Show warning message before deletion
    let confirmMessage = `Are you sure you want to delete "${activityService}"?\n\nThis action cannot be undone.`;
    
    // If this is the last service, add additional warning
    if (currentServicesCount <= 1) {
      confirmMessage = `WARNING: This is the last service entry!\n\nAre you sure you want to delete "${activityService}"?\n\nAt least one service entry is required. If you delete this, you will need to add a new service entry.`;
    }
    
    // Confirm deletion with warning
    this._util.showWarningConfirmation(
      confirmMessage,
      'Delete Service'
    ).subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return; // User cancelled
      }

      // Check if we have at least one service after deletion
      if (currentServicesCount > 1) {
        // Remove the service from FormArray
        this.servicesArray.removeAt(index);
        
        // Remove from validation setup tracking
        this.validationSetupIndices.delete(index);
        
        // Re-index remaining services in tracking
        const indicesToUpdate = Array.from(this.validationSetupIndices).filter(i => i > index);
        this.validationSetupIndices.clear();
        indicesToUpdate.forEach(oldIdx => this.validationSetupIndices.add(oldIdx - 1));
        
        // Update validation status after deletion
        this.cbpForm.updateValueAndValidity();
        this.updateSectionValidity();
        this.onFormChange(); // Trigger form change to save
        this.cdr.markForCheck();
      } else {
        // Even if confirmed, ask for final confirmation for the last service
        this._util.showWarningConfirmation(
          `This is the LAST service entry. Deleting it will leave the form empty.\n\nAre you absolutely sure you want to delete "${activityService}"?`,
          'Final Confirmation'
        ).subscribe((finalConfirm: boolean) => {
          if (finalConfirm) {
            this.servicesArray.removeAt(index);
            
            // Remove from validation setup tracking
            this.validationSetupIndices.delete(index);
            
            // Re-index remaining services in tracking
            const indicesToUpdate = Array.from(this.validationSetupIndices).filter(i => i > index);
            this.validationSetupIndices.clear();
            indicesToUpdate.forEach(oldIdx => this.validationSetupIndices.add(oldIdx - 1));
            
            // Update validation status after deletion
            this.cbpForm.updateValueAndValidity();
            this.updateSectionValidity();
            this.onFormChange(); // Trigger form change to save
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  /**
   * Initializes the component and sets up form validation
   */
  ngOnInit(): void {
    // Load initial data if provided
    if (this.initialData) {
      this.loadInitialData(this.initialData);
    }

    // Enable/disable form controls based on mode
    this.updateFormControlsState();

    // Set up conditional validation for all services
    this.setupAllServicesConditionalValidation();

    // Mark form as touched if there are services (so validation message can show)
    if (this.servicesArray.length > 0) {
      this.cbpForm.markAsTouched();
      this.servicesArray.controls.forEach(control => {
        const serviceGroup = control as FormGroup;
        serviceGroup.markAllAsTouched();
      });
    }
    this.cbpForm.valueChanges
      .pipe(
        debounceTime(500), 
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // This subscription will run whenever any control in the form changes.
        this.updateSectionValidity(); // Updates validityChange output
        
        // This is the primary function that calls dataChange.emit()
        if (this.cbpForm.valid) {
          this.onFormChange(); 
        }
      });

    // Force validation update
    this.cbpForm.updateValueAndValidity({ emitEvent: false });
    this.servicesArray.controls.forEach(control => {
      const serviceGroup = control as FormGroup;
      serviceGroup.updateValueAndValidity({ emitEvent: false });
    });

    // Use setTimeout to ensure validation runs after all setup is complete
    setTimeout(() => {
      // Force validation update again after a brief delay
      this.cbpForm.updateValueAndValidity({ emitEvent: false });
      this.servicesArray.controls.forEach(control => {
        const serviceGroup = control as FormGroup;
        serviceGroup.updateValueAndValidity({ emitEvent: false });
      });
      // Emit initial validity - check if all services are valid
      const isValid = this.isSectionValid();
      this.validityChange.emit(isValid);
      this.cdr.markForCheck();
    }, 100);

    // Watch for form changes - auto-save with debouncing
    this.cbpForm.valueChanges
      .pipe(
        debounceTime(500), // Auto-save after 500ms of inactivity
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Check if all services are valid
        const allServicesValid = this.servicesArray.controls.every(control => {
          const serviceGroup = control as FormGroup;
          return serviceGroup.valid;
        });
        const formValid = this.cbpForm.valid && allServicesValid && this.servicesArray.length > 0;
        this.validityChange.emit(formValid);
        // Auto-save when form is valid
        if (formValid) {
          this.onFormChange();
        }
      });
  }

  /**
   * Updates form controls state based on mode
   * @private
   */
  private updateFormControlsState(): void {
    if (this.mode === 'view') {
      this.cbpForm.disable({ emitEvent: false });
    } else {
      this.cbpForm.enable({ emitEvent: false });
    }
    this.cdr.markForCheck();
  }

  /**
   * Angular lifecycle hook - called when input properties change
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] && this.cbpForm) {
      this.updateFormControlsState();
    }
  }

  /**
   * Loads initial data into the form
   * @param data - Initial data to load
   * @private
   */
  private loadInitialData(data: CriticalBusinessProcessData): void {
    // Clear existing services and validation tracking
    while (this.servicesArray.length > 0) {
      this.servicesArray.removeAt(0);
    }
    this.validationSetupIndices.clear();

    // Add services from initial data
    if (data.services && data.services.length > 0) {
      data.services.forEach((service, index) => {
        const serviceGroup = this.createServiceFormGroup();
        serviceGroup.patchValue(service, { emitEvent: false });
        this.servicesArray.push(serviceGroup);
        this.servicesArray.removeAt(0);
        // Set up conditional validation for each service immediately
        this.setupServiceConditionalValidation(index);
        // Mark service as touched
        serviceGroup.markAllAsTouched();
      });
    }
    // Don't add empty service if no initial data - let user add via "Add Service" button

    // Force validation update on all services
    this.servicesArray.controls.forEach(control => {
      const serviceGroup = control as FormGroup;
      serviceGroup.updateValueAndValidity({ emitEvent: false });
    });
    
    // Update form validity
    this.cbpForm.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Cleanup subscriptions on component destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sets up conditional validation for all services
   * @private
   */
  private setupAllServicesConditionalValidation(): void {
    for (let i = 0; i < this.servicesArray.length; i++) {
      this.setupServiceConditionalValidation(i);
    }
  }

  /**
   * Sets up conditional validation rules for a specific service
   * @param index - Index of the service in the FormArray
   * @param forceSetup - Force setup even if already set up (for edits)
   * @private
   */
  private setupServiceConditionalValidation(index: number, forceSetup: boolean = false): void {
    const serviceGroup = this.servicesArray.at(index) as FormGroup;
    if (!serviceGroup) return;

    // Skip if already set up (unless forcing for edits)
    if (!forceSetup && this.validationSetupIndices.has(index)) {
      // Still apply initial validation based on current value
      this.applyInitialConditionalValidation(serviceGroup);
      return;
    }

    // Set up conditional validation for Type of Regulatory
    const regulatoryControl = serviceGroup.get('regulatory');
    const typeOfRegulatoryControl = serviceGroup.get('typeOfRegulatory');

    if (regulatoryControl && typeOfRegulatoryControl) {
      // Apply initial validation based on current value
      this.applyInitialConditionalValidation(serviceGroup);

      // Watch for future changes
      regulatoryControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((regulatory) => {
          if (regulatory === 'Yes') {
            typeOfRegulatoryControl.setValidators([Validators.required]);
          } else {
            typeOfRegulatoryControl.clearValidators();
            typeOfRegulatoryControl.setValue([]);
          }
          typeOfRegulatoryControl.updateValueAndValidity();
          this.updateSectionValidity();
          this.cdr.markForCheck();
        });
    }

    // Watch for validity changes in the service form group to update validation
    serviceGroup.statusChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateSectionValidity();
        this.cdr.markForCheck();
      });

    // Mark this index as set up
    this.validationSetupIndices.add(index);
  }

  /**
   * Applies initial conditional validation based on current regulatory value
   * @param serviceGroup - The service form group
   * @private
   */
  private applyInitialConditionalValidation(serviceGroup: FormGroup): void {
    const regulatoryControl = serviceGroup.get('regulatory');
    const typeOfRegulatoryControl = serviceGroup.get('typeOfRegulatory');

    if (regulatoryControl && typeOfRegulatoryControl) {
      const currentRegulatory = regulatoryControl.value;
      if (currentRegulatory === 'Yes') {
        typeOfRegulatoryControl.setValidators([Validators.required]);
        typeOfRegulatoryControl.updateValueAndValidity();
      } else {
        typeOfRegulatoryControl.clearValidators();
        if (!typeOfRegulatoryControl.value || typeOfRegulatoryControl.value.length === 0) {
          typeOfRegulatoryControl.setValue([]);
        }
        typeOfRegulatoryControl.updateValueAndValidity();
      }
    }
  }

  /**
   * Updates and emits the section validity status
   * @private
   */
  private updateSectionValidity(): void {
    const isValid = this.isSectionValid();
    this.validityChange.emit(isValid);
    if (isValid) {
      this.onFormChange();
    }
    this.logInvalidControls(this.cbpForm);
  }

  /**
   * Handles form value changes and emits data when form is valid
   */
  onFormChange(): void {
    if (this.cbpForm.valid) {
      const services: ActivityServiceEntry[] = this.servicesArray.controls.map((control) => {
        const serviceGroup = control as FormGroup;
        return {
          activityService: serviceGroup.get('activityService')?.value || '',
          criticality: serviceGroup.get('criticality')?.value || '',
          contractual: serviceGroup.get('contractual')?.value || '',
          penaltyDetails: serviceGroup.get('penaltyDetails')?.value || undefined,
          customerImpact: serviceGroup.get('customerImpact')?.value || '',
          regulatory: serviceGroup.get('regulatory')?.value || '',
          typeOfRegulatory: serviceGroup.get('typeOfRegulatory')?.value || [],
          engagementPeriod: serviceGroup.get('engagementPeriod')?.value || null,
          technology: serviceGroup.get('technology')?.value || '',
          primaryDeliverySite: serviceGroup.get('primaryDeliverySite')?.value || '',
        };
      });

      const formData: CriticalBusinessProcessData = {
        projectName: this.initialData?.projectName || '', // Keep projectName from initial data
        services: services,
      };
      this.dataChange.emit(formData);
      
    }
  }

  /**
   * Saves the current section data if form is valid
   * @deprecated Auto-save is now handled automatically via form valueChanges
   * This method is kept for backward compatibility if needed
   */
  saveSection(): void {
    if (this.cbpForm.valid) {
      this.onFormChange();
    } else {
      // Mark all fields as touched to show validation errors
      this.cbpForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  /**
   * Gets the current form data if valid
   * @returns Form data or null if invalid
   */
  getFormData(): CriticalBusinessProcessData | null {
    if (this.cbpForm.valid) {
      return this.cbpForm.value as CriticalBusinessProcessData;
    }
    return null;
  }

  /**
   * Checks if the form is currently valid
   * @returns True if form is valid, false otherwise
   */
  isFormValid(): boolean {
    return this.cbpForm.valid;
  }

  /**
   * Checks if the entire section is valid
   * Validates that form is valid, all services are valid, and at least one service exists
   * @returns True if section is complete and valid, false otherwise
   */
  isSectionValid(): boolean {
    if (this.servicesArray.length === 0) {
      return false;
    }
    
    // Check if form array itself is valid
    if (!this.cbpForm.valid) {
      return false;
    }
    
    // Check each service form group
    const allServicesValid = this.servicesArray.controls.every(control => {
      const serviceGroup = control as FormGroup;
      if (!serviceGroup.valid) {
        // Log which service is invalid for debugging
        const invalidControls: string[] = [];
        Object.keys(serviceGroup.controls).forEach(key => {
          const ctrl = serviceGroup.get(key);
          if (ctrl && !ctrl.valid) {
            invalidControls.push(`${key}: ${JSON.stringify(ctrl.errors)}`);
          }
        });
        if (invalidControls.length > 0) {
        }
        return false;
      }
      return true;
    });
    
    return allServicesValid;
  }

  logInvalidControls(form: FormGroup | FormArray): void {
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    
    // Check main form controls - recursive logging removed for production
    if (control instanceof FormGroup || control instanceof FormArray) {
      if (control.invalid) {
        this.logInvalidControls(control); // Recurse into FormGroups/FormArrays
      }
    }
  });
}
  getSection1Data(){
    return this.servicesArray.value;
  }
}
