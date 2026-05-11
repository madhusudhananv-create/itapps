import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CriticalBusinessProcessData } from '../section1/critical-business-process.component';
import { AddKeyPlanningParameterDialogComponent } from './add-key-planning-parameter-dialog.component';
import { MyUtility } from '../../../../../app/shared/my-utility';


/**
 * Interface representing the data structure for Key Planning Parameters form
 * Matches BCP Design Doc V1.2 Section 4.3
 */
export interface KeyPlanningParametersData {
  /** Configurable Item - who is responsible for Backup and Restore */
  configurableItem: string;
  /** Backup Frequency - schedule for backups */
  backupFrequency?: string;
  /** Is Backup at Offsite - dropdown: NA, Yes, No */
  isBackupAtOffsite?: string;
  /** Recovery Point Objective in minutes */
  rpo: number;
  /** Type of Business - text field for business type */
  typeOfBusiness?: string;
  /** RTO Guidance source */
  rtoGuidance: string;
  /** Minimum SLA in HH:MM format */
  minimumSLA: string;
  /** MTPD - Maximum Tolerable Period of Disruption in HH:MM format */
  mtpd?: string;
  /** Recovery Time Objective in HH:MM format */
  rto: string;
  /** Final Recovery Priority - text field */
  finalRecoveryPriority?: string;
  /** Minimum Business Continuity Objectives */
  mbco: string;
  id: number;
  activity: string;
}

@Component({
  selector: 'bcp-key-planning-parameters',
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
    MatTableModule,
    MatDialogModule,
  ],
  templateUrl: './key-planning-parameters.component.html',
  styleUrl: './key-planning-parameters.component.scss'
})
/**
 * Component for managing Key Planning Parameters (RTO/RPO) form data
 * Implements reactive forms with validation, RTO < MTPD validation, and conditional requirements
 */
export class KeyPlanningParametersComponent implements OnInit, OnChanges, OnDestroy {
  /** Initial data to populate the form */
  @Input() initialData?: KeyPlanningParametersData;
  /** MTPD value from Section 2 for validation */
  @Input() mtpdFromSection2?: string;
  /** Mode of operation - 'view' or 'edit' */
  @Input() mode: 'view' | 'edit' = 'edit';
  /** Emits form data when valid */
  @Output() dataChange = new EventEmitter<KeyPlanningParametersData>();
  /** Emits form validity status */
  @Output() validityChange = new EventEmitter<boolean>();

  ///Form to table & section 1 data
    @Output() recordDelete = new EventEmitter<number>();
    @Input() section1Data?: CriticalBusinessProcessData;
    @Input() kpcList: KeyPlanningParametersData[] = [];
    viewReady = true;
    @Output() rtoFromSection3 = new EventEmitter<{ [activity: string]: string }>();

  

  /** Reactive form group for all form controls */
  kppForm: FormGroup;
  /** Flag to show RTO < Minimum SLA warning */
  showRTOLessThanSLAWarning = false;
editingRowId: number | null = null;
  displayedColumns: string[] = ['activity', 'configurableItem', 'backupFrequency', 'isBackupAtOffsite', 'isBackupAtOffsite', 'rpo', 'typeOfBusiness','rtoGuidance','minimumSLA','mtpd','rto','finalRecoveryPriority','mbco','actions']; // Define table columns

  
  /** Subject to handle component destruction for unsubscribing */
  private destroy$ = new Subject<void>();

  /** Time format pattern for HH:MM validation */
  private readonly timePattern = /^([0-9]|[0-5][0-9]):([0-5][0-9])$/;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private _util: MyUtility
  ) {
    this.kppForm = this.fb.group({
      id: [null], 
      activity: [''],
      configurableItem: ['', Validators.required],
      backupFrequency: [''],
      isBackupAtOffsite: [''],
      rpo: [null, [Validators.required, Validators.min(0)]],
      typeOfBusiness: [''],
      rtoGuidance: ['', Validators.required],
      minimumSLA: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      mtpd: ['', Validators.pattern(this.timePattern)],
      rto: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      finalRecoveryPriority: [''],
      mbco: ['', [Validators.required, Validators.maxLength(500)]]
    });

    // Emit changes when kpcList changes
    // Note: Form is now only used for validation, not for data entry
  }

  /**
   * Handles input property changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section1Data']?.currentValue && this.viewReady) {

      this.fillFromSection1(changes['section1Data']?.currentValue);
    }
    // Update MTPD when it changes from Section 2
    if (changes['mtpdFromSection2']) {
      if (this.mtpdFromSection2) {
        this.kppForm.get('mtpd')?.setValue(this.mtpdFromSection2, { emitEvent: false });
      }
      // Re-validate RTO against new MTPD
      this.validateRTOAgainstMTPD();
      this.cdr.markForCheck();
    }
    
    // Update initial data if provided
    if (changes['initialData'] && this.initialData) {
      // Don't override MTPD if it comes from Section 2
      const mtpdValue = this.mtpdFromSection2 || this.initialData.mtpd;
      const dataToPatch = { ...this.initialData };
      if (mtpdValue) {
        dataToPatch.mtpd = mtpdValue;
      }
      if (this.editingRowId !== null) {
        return;
        /* const initialData = this.kpcList.find(
          (item) => item.id === this.editingRowId
        );

        if (initialData) {
          this.kppForm.patchValue(initialData);
        } */
      }else{
        this.kppForm.patchValue(dataToPatch);
      }
        this.cdr.markForCheck();
    }
    
  }

  /**
   * Initializes the component and sets up form validation
   */
  ngOnInit(): void {

    
    // Load initial data if provided
    if (this.initialData) {
      this.kppForm.patchValue(this.initialData);
    }

    // Set MTPD from Section 2 if provided (takes precedence over initial data)
    if (this.mtpdFromSection2) {
      this.kppForm.get('mtpd')?.setValue(this.mtpdFromSection2, { emitEvent: false });
    }

    // Set up conditional validation for Backup Frequency
    this.setupConditionalValidation();

    // Set up RTO < MTPD validation
    this.setupRTOValidation();

    // Emit initial validity
    this.validityChange.emit(this.kppForm.valid);
    if (this.kppForm.valid) this.dataChange.emit(this.serialize());

    // Watch for form changes - auto-save with debouncing
    this.kppForm.valueChanges
      .pipe(
        debounceTime(500), // Auto-save after 500ms of inactivity
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.validityChange.emit(this.kppForm.valid);
        // Auto-save when form is valid
        /* if (this.kppForm.valid) {
          this.onFormChange();
        } */
      });
  }

  private serialize(): KeyPlanningParametersData {
      const formValues = this.kppForm.getRawValue();
      return {
          // Ensure ID is present. Use form value if it exists, otherwise use 0.
          id: formValues.id ?? 0, 
          activity: formValues.activity ?? '',
          configurableItem: formValues.configurableItem ?? '',
          backupFrequency: formValues.backupFrequency ?? '',
          isBackupAtOffsite: formValues.isBackupAtOffsite ?? '', 
          rpo: formValues.rpo ?? '',
          typeOfBusiness: formValues.typeOfBusiness ?? '',
          rtoGuidance: formValues.rtoGuidance ?? '',
          minimumSLA: formValues.minimumSLA ?? '',
          mtpd: formValues.mtpd || this.mtpdFromSection2 || undefined,
          rto: formValues.rto ?? '',
          finalRecoveryPriority: formValues.finalRecoveryPriority ?? '',
          mbco: formValues.mbco ?? ''
      };
    }
  /**
   * Cleanup subscriptions on component destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sets up conditional validation for Backup Frequency
   * When "Is Backup at Offsite" = "Yes", Backup Frequency becomes required
   * @private
   */
  private setupConditionalValidation(): void {
    this.kppForm.get('isBackupAtOffsite')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const backupFrequencyControl = this.kppForm.get('backupFrequency');
        if (value === 'Yes') {
          backupFrequencyControl?.setValidators([Validators.required]);
        } else {
          backupFrequencyControl?.clearValidators();
        }
        backupFrequencyControl?.updateValueAndValidity();
        this.cdr.markForCheck();
      });
  }

  /**
   * Sets up RTO validation against MTPD
   * @private
   */
  private setupRTOValidation(): void {
    // Watch for RTO and MTPD changes
    this.kppForm.get('rto')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateRTOAgainstMTPD();
        this.checkRTOAgainstSLA();
      });

    this.kppForm.get('mtpd')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateRTOAgainstMTPD();
      });

    this.kppForm.get('minimumSLA')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkRTOAgainstSLA();
      });
  }

  /**
   * Validates RTO is less than MTPD
   * @private
   */
  private validateRTOAgainstMTPD(): void {
    const rto = this.kppForm.get('rto')?.value;
    const mtpd = this.kppForm.get('mtpd')?.value || this.mtpdFromSection2;

    if (!rto || !mtpd) {
      return;
    }

    const rtoMinutes = this.parseTime(rto);
    const mtpdMinutes = this.parseTime(mtpd);

    if (rtoMinutes !== null && mtpdMinutes !== null) {
      if (rtoMinutes >= mtpdMinutes) {
        this.kppForm.get('rto')?.setErrors({ rtoExceedsMTPD: true });
      } else {
        // Clear the error if it exists
        const currentErrors = this.kppForm.get('rto')?.errors;
        if (currentErrors && currentErrors['rtoExceedsMTPD']) {
          delete currentErrors['rtoExceedsMTPD'];
          const newErrors = Object.keys(currentErrors).length === 0 ? null : currentErrors;
          this.kppForm.get('rto')?.setErrors(newErrors);
        }
      }
      this.kppForm.get('rto')?.updateValueAndValidity();
    }
  }

  /**
   * Checks if RTO is less than Minimum SLA (non-blocking warning)
   * @private
   */
  private checkRTOAgainstSLA(): void {
    const rto = this.kppForm.get('rto')?.value;
    const minimumSLA = this.kppForm.get('minimumSLA')?.value;

    if (!rto || !minimumSLA) {
      this.showRTOLessThanSLAWarning = false;
      return;
    }

    const rtoMinutes = this.parseTime(rto);
    const slaMinutes = this.parseTime(minimumSLA);

    if (rtoMinutes !== null && slaMinutes !== null) {
      this.showRTOLessThanSLAWarning = rtoMinutes >= slaMinutes;
    } else {
      this.showRTOLessThanSLAWarning = false;
    }
  }

  /**
   * Parses HH:MM time string to minutes for comparison
   * @param timeString - Time in HH:MM format
   * @returns Minutes as number or null if invalid
   * @private
   */
  private parseTime(timeString: string): number | null {
    if (!timeString || !this.timePattern.test(timeString)) {
      return null;
    }
    
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Handles form value changes and emits data when form is valid
   */
  onFormChange(): void {
    // Emit validity status
    this.validityChange.emit(this.isSectionValid());
    
    // Emit the entire list if valid
    if (this.isSectionValid() && this.kpcList.length > 0) {
      // Note: The parent component should handle the kpcList directly
      // This is kept for backward compatibility
      this.cdr.markForCheck();
    }
  }

  /**
   * Saves the current section data if form is valid
   * @deprecated Auto-save is now handled automatically via form valueChanges
   * This method is kept for backward compatibility if needed
   */
  saveSection(): void {
    if (this.kppForm.valid) {
      this.onFormChange();
    } else {
      // Mark all fields as touched to show validation errors
      this.kppForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  /**
   * Gets the current form data if valid
   * @returns Form data or null if invalid
   */
  getFormData(): KeyPlanningParametersData | null {
    if (this.kppForm.valid) {
      return this.kppForm.value as KeyPlanningParametersData;
    }
    return null;
  }

  /**
   * Checks if the form is currently valid
   * @returns True if form is valid, false otherwise
   */
  isFormValid(): boolean {
    return this.kppForm.valid;
  }

  /**
   * Opens a modal dialog to add a new parameter entry
   * @param event - Click event to prevent default form submission
   */
  addParameter(event?: Event): void {
    // Prevent form submission and event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Prevent action if in view mode
    if (this.mode === 'view') {
      console.warn('Cannot add parameter in view mode');
      return;
    }

    // Get available activities (may be empty, which is fine - user can enter manually)
    const availableActivities = this.getAvailableActivities();

    // Check if dialog service is available
    if (!this.dialog) {
      console.error('MatDialog service is not available');
      this._util.showWarningPopup('Dialog service is not available. Please refresh the page.', 'Service Error');
      return;
    }

    try {
      const dialogRef = this.dialog.open(AddKeyPlanningParameterDialogComponent, {
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: false,
        hasBackdrop: true,
        panelClass: 'add-parameter-dialog',
        data: {
          mode: 'add',
          parameterData: null,
          mtpdFromSection2: this.mtpdFromSection2,
          availableActivities: availableActivities
        }
      });


      dialogRef.afterClosed().subscribe((result: { data?: KeyPlanningParametersData; action: 'save' | 'saveAndAdd' } | null) => {
        if (result && result.data) {
          // Generate a new ID if needed
          const newId = this.kpcList.length > 0 
            ? Math.max(...this.kpcList.map(p => p.id || 0)) + 1 
            : 1;
          
          const newParameter: KeyPlanningParametersData = {
            ...result.data,
            id: result.data.id || newId
          };
          
          // Create a new array reference for OnPush to detect the change
          this.kpcList = [...this.kpcList, newParameter];
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Emit data change
          this.onFormChange();
          
          // If "Save and Add New" was clicked, open the dialog again
          if (result.action === 'saveAndAdd') {
            // Small delay to ensure UI updates
            setTimeout(() => {
              this.addParameter();
            }, 100);
          }
        }

      });
    } catch (error) {
      console.error('Error opening dialog:', error);
      // Show user-friendly error message
      this._util.showWarningPopup('Unable to open the Add Parameter dialog. Please check the console for details.', 'Dialog Error');
    }
  }

  /**
   * Opens a modal dialog to edit an existing parameter entry
   * @param row - The parameter data to edit
   * @param event - Click event to prevent propagation
   */
  editParameter(row: KeyPlanningParametersData, event?: Event): void {
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

    // Check if dialog service is available
    if (!this.dialog) {
      console.error('MatDialog service is not available');
      this._util.showWarningPopup('Dialog service is not available. Please refresh the page.', 'Service Error');
      return;
    }

    try {
      const availableActivities = this.getAvailableActivities();
      
      const dialogRef = this.dialog.open(AddKeyPlanningParameterDialogComponent, {
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: false,
        hasBackdrop: true,
        panelClass: 'add-parameter-dialog',
        data: {
          mode: 'edit',
          parameterData: row,
          mtpdFromSection2: this.mtpdFromSection2,
          availableActivities: availableActivities
        }
      });

      dialogRef.afterClosed().subscribe((result: { data?: KeyPlanningParametersData; action: 'save' } | null) => {
        if (result && result.data) {
          const index = this.kpcList.findIndex(x => x.id === row.id);
          if (index > -1) {
            // Create a new array reference for OnPush to detect the change
            const newList = [...this.kpcList];
            newList[index] = result.data;
            this.kpcList = newList;
            
            // Force change detection
            this.cdr.detectChanges();
            
            // Emit data change
            this.onFormChange();
          }
        }
        const rtoMap = Object.fromEntries(this.kpcList.map(item => [item.activity, item.rto]));
        this.rtoFromSection3.emit(rtoMap);
      });
    } catch (error) {
      console.error('Error opening dialog:', error);
      this._util.showWarningPopup('Unable to open the Edit Parameter dialog. Please check the console for details.', 'Dialog Error');
    }
  }

  /**
   * Deletes a parameter entry
   * @param id - ID of the parameter to delete
   * @param event - Click event to prevent propagation
   */
  deleteRow(id: number, event?: Event): void {
    // Prevent event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this._util.showWarningConfirmation(
      'Are you sure you want to delete this record?',
      'Delete Record'
    ).subscribe((result: boolean) => {
      if (result === true) {
        this.recordDelete.emit(id);
        // Remove from local list to update view
        this.kpcList = this.kpcList.filter(r => r.id !== id);
        this.cdr.detectChanges();
        
        // Emit data change
        this.onFormChange();
      }
    });
  }

  /**
   * Gets available activities from Section 1 data
   * @returns Array of activity/service names
   */
  private getAvailableActivities(): string[] {
    if (!this.section1Data || !this.section1Data.services || this.section1Data.services.length === 0) {
      return [];
    }
    
    return this.section1Data.services
      .map((service: any) => service.activityService)
      .filter((activity: string) => activity && activity.trim() !== '');
  }

  /**
   * Checks if there are available activities to add parameters for
   * @returns True if activities are available
   */
  hasAvailableActivities(): boolean {
    return this.getAvailableActivities().length > 0;
  }

  /**
   * Checks if the section is valid
   * @returns True if section is valid
   */
  isSectionValid(): boolean {
    if (!this.kpcList || this.kpcList.length === 0) {
      return false;
    }
    
    // Check if all required fields are filled for each parameter
    return this.kpcList.every(param => {
      return param.activity &&
             param.configurableItem &&
             param.rpo !== null && param.rpo !== undefined &&
             param.rtoGuidance &&
             param.minimumSLA &&
             param.rto &&
             param.mbco;
    });
  }
  
  /**
   * Fill data from Section 1
   */
  fillFromSection1(data: any) {
      let originalData = data.services || data;
const allFieldsEmpty = Object.values(originalData[0]).every(val =>
  val === "" ||
  (typeof val === "string" && val.trim() === "") ||
  val === null ||
  val === undefined ||
  val === 0 ||
  (Array.isArray(val) && val.length === 0)
);

const isValid = !(originalData.length === 1 && allFieldsEmpty);
//  Ensure originalData is a non-empty array
      if (!Array.isArray(originalData) || originalData.length === 0 || !isValid) {
        this.kpcList = []; // Set data source to an empty array
        this.kppForm.disable(); 
        this.cdr.detectChanges(); 
        return; // Exit the function immediately
      }
      let nextId = 1;

      this.kpcList = originalData.map((item: any, index: number) => ({
          id: index + 1, // Use index + 1 for a simple temporary ID
          activity: item.activityService || item.name || `Activity ${index + 1}`, // Assuming activityService is the field
          configurableItem: item.configurableItem || '',
          backupFrequency: item.backupFrequency || '',
          isBackupAtOffsite: item.isBackupAtOffsite || '',  
          rpo: item.rpo || null,
          typeOfBusiness: item.typeOfBusiness || '',
          rtoGuidance: item.rtoGuidance || '',
          minimumSLA: item.minimumSLA || '',
          mtpd: this.mtpdFromSection2 || item.mtpd || '',
          rto: item.rto || '',
          finalRecoveryPriority: item.finalRecoveryPriority || '',
          mbco: item.mbco || ''
      }));
      
      // Disable the form initially when not editing
      this.kppForm.disable(); 
  
      // Force change detection because we changed an Input property (kpcList) in code
      this.cdr.detectChanges();
    }
  
}
