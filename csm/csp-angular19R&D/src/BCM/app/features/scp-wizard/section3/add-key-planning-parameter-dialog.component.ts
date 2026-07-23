import {
  Component,
  Inject,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { KeyPlanningParametersData } from './key-planning-parameters.component';

export interface KPPDialogData {
  mode: 'add' | 'edit';
  parameterData: KeyPlanningParametersData | null;
  mtpdFromSection2?: string;
  availableActivities?: string[];
}

@Component({
  selector: 'bcp-add-key-planning-parameter-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './add-key-planning-parameter-dialog.component.html',
  styles: [
    `
      .dialog-container {
        display: flex;
        flex-direction: column;
        max-height: 90vh;
      }

      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #2c3e50;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        border-bottom: 1px solid #e0e0e0;
      }

      h2[mat-dialog-title] mat-icon {
        color: #1976d2;
      }

      .dialog-content {
        padding: 1.5rem;
        overflow-y: auto;
        max-height: calc(90vh - 150px);
      }

      .parameter-form {
        width: 100%;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .mat-mdc-form-field {
        width: 100%;
      }

      .dialog-actions {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e0e0e0;
        background-color: #fafafa;
        margin: 0;
      }

      .dialog-actions button {
        margin-left: 0.5rem;
      }

      .dialog-actions button mat-icon {
        margin-right: 0.25rem;
      }

      .dialog-actions button[color="accent"] {
        background-color: #ff9800;
        color: white;
      }

      .dialog-actions button[color="accent"]:hover:not([disabled]) {
        background-color: #f57c00;
      }

      .error-field .mat-mdc-text-field-wrapper {
        background-color: #ffebee;
      }

      .rto-mtpd-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background-color: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 4px;
        color: #1565c0;
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }

      .rto-mtpd-info mat-icon {
        color: #1976d2;
      }

      .rto-warning {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        color: #856404;
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }

      .rto-warning mat-icon {
        color: #f57c00;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }

        h2[mat-dialog-title] {
          font-size: 1.25rem;
          padding: 1rem;
        }

        .dialog-content {
          padding: 1rem;
        }

        .dialog-actions {
          padding: 1rem;
          flex-direction: column-reverse;
        }

        .dialog-actions button {
          width: 100%;
          margin: 0.25rem 0;
        }
      }
    `,
  ],
})
export class AddKeyPlanningParameterDialogComponent implements OnInit {
  parameterForm: FormGroup;
  
  /** Time format pattern for HH:MM validation */
  private readonly timePattern = /^([0-9]|[0-5][0-9]):([0-5][0-9])$/;
  
  /** Flag to show RTO < Minimum SLA warning */
  showRTOLessThanSLAWarning = false;

  // Getters for conditional field visibility (needed for OnPush change detection)
  get isBackupAtOffsiteYes(): boolean {
    return this.parameterForm.get('isBackupAtOffsite')?.value === 'Yes';
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddKeyPlanningParameterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KPPDialogData,
    private cdr: ChangeDetectorRef
  ) {
    this.parameterForm = this.fb.group({
      id: [null],
      activity: ['', [Validators.required, Validators.maxLength(100)]],
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

    // Set up conditional validation
    this.setupConditionalValidation();
    
    // Set up RTO validation
    this.setupRTOValidation();
  }

  ngOnInit(): void {
    // Load existing data if editing
    if (this.data.parameterData) {
      const dataToPatch = { ...this.data.parameterData };
      // Use MTPD from Section 2 if available, otherwise use the data's MTPD
      if (this.data.mtpdFromSection2) {
        dataToPatch.mtpd = this.data.mtpdFromSection2;
      }
      this.parameterForm.patchValue(dataToPatch);
      this.cdr.markForCheck();
    } else if (this.data.mtpdFromSection2) {
      // Set MTPD from Section 2 for new entries
      this.parameterForm.patchValue({ mtpd: this.data.mtpdFromSection2 });
    }
  }

  private setupConditionalValidation(): void {
    // Watch for isBackupAtOffsite changes
    this.parameterForm.get('isBackupAtOffsite')?.valueChanges.subscribe((value) => {
      const backupFrequencyControl = this.parameterForm.get('backupFrequency');
      if (value === 'Yes') {
        backupFrequencyControl?.setValidators([Validators.required]);
      } else {
        backupFrequencyControl?.clearValidators();
        backupFrequencyControl?.setValue('');
      }
      backupFrequencyControl?.updateValueAndValidity();
      this.cdr.markForCheck();
    });
  }

  private setupRTOValidation(): void {
    // Watch for RTO and MTPD changes
    this.parameterForm.get('rto')?.valueChanges.subscribe(() => {
      this.validateRTOAgainstMTPD();
      this.checkRTOAgainstSLA();
    });

    this.parameterForm.get('mtpd')?.valueChanges.subscribe(() => {
      this.validateRTOAgainstMTPD();
    });

    this.parameterForm.get('minimumSLA')?.valueChanges.subscribe(() => {
      this.checkRTOAgainstSLA();
    });
  }

  private validateRTOAgainstMTPD(): void {
    const rto = this.parameterForm.get('rto')?.value;
    const mtpd = this.parameterForm.get('mtpd')?.value || this.data.mtpdFromSection2;

    if (!rto || !mtpd) {
      return;
    }

    const rtoMinutes = this.parseTime(rto);
    const mtpdMinutes = this.parseTime(mtpd);

    if (rtoMinutes !== null && mtpdMinutes !== null) {
      if (rtoMinutes >= mtpdMinutes) {
        this.parameterForm.get('rto')?.setErrors({ rtoExceedsMTPD: true });
      } else {
        // Clear the error if it exists
        const currentErrors = this.parameterForm.get('rto')?.errors;
        if (currentErrors && currentErrors['rtoExceedsMTPD']) {
          delete currentErrors['rtoExceedsMTPD'];
          const newErrors = Object.keys(currentErrors).length === 0 ? null : currentErrors;
          this.parameterForm.get('rto')?.setErrors(newErrors);
        }
      }
      this.parameterForm.get('rto')?.updateValueAndValidity();
      this.cdr.markForCheck();
    }
  }

  private checkRTOAgainstSLA(): void {
    const rto = this.parameterForm.get('rto')?.value;
    const minimumSLA = this.parameterForm.get('minimumSLA')?.value;

    if (!rto || !minimumSLA) {
      this.showRTOLessThanSLAWarning = false;
      return;
    }

    const rtoMinutes = this.parseTime(rto);
    const slaMinutes = this.parseTime(minimumSLA);

    if (rtoMinutes !== null && slaMinutes !== null) {
      this.showRTOLessThanSLAWarning = rtoMinutes >= slaMinutes;
      this.cdr.markForCheck();
    } else {
      this.showRTOLessThanSLAWarning = false;
    }
  }

  private parseTime(timeString: string): number | null {
    if (!timeString || !this.timePattern.test(timeString)) {
      return null;
    }
    
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onSave(): void {
    if (this.parameterForm.valid) {
      const formValue = this.parameterForm.value;
      const parameterData: KeyPlanningParametersData = {
        id: formValue.id || 0,
        activity: formValue.activity,
        configurableItem: formValue.configurableItem,
        backupFrequency: formValue.backupFrequency || undefined,
        isBackupAtOffsite: formValue.isBackupAtOffsite || undefined,
        rpo: formValue.rpo,
        typeOfBusiness: formValue.typeOfBusiness || undefined,
        rtoGuidance: formValue.rtoGuidance,
        minimumSLA: formValue.minimumSLA,
        mtpd: formValue.mtpd || this.data.mtpdFromSection2 || undefined,
        rto: formValue.rto,
        finalRecoveryPriority: formValue.finalRecoveryPriority || undefined,
        mbco: formValue.mbco
      };
      this.dialogRef.close({ data: parameterData, action: 'save' });
    } else {
      this.parameterForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  onSaveAndAdd(): void {
    if (this.parameterForm.valid) {
      const formValue = this.parameterForm.value;
      const parameterData: KeyPlanningParametersData = {
        id: formValue.id || 0,
        activity: formValue.activity,
        configurableItem: formValue.configurableItem,
        backupFrequency: formValue.backupFrequency || undefined,
        isBackupAtOffsite: formValue.isBackupAtOffsite || undefined,
        rpo: formValue.rpo,
        typeOfBusiness: formValue.typeOfBusiness || undefined,
        rtoGuidance: formValue.rtoGuidance,
        minimumSLA: formValue.minimumSLA,
        mtpd: formValue.mtpd || this.data.mtpdFromSection2 || undefined,
        rto: formValue.rto,
        finalRecoveryPriority: formValue.finalRecoveryPriority || undefined,
        mbco: formValue.mbco
      };
      this.dialogRef.close({ data: parameterData, action: 'saveAndAdd' });
    } else {
      this.parameterForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

