import {
  Component,
  Inject,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivityServiceEntry } from './critical-business-process.component';

export interface DialogData {
  mode: 'add' | 'edit';
  serviceData: ActivityServiceEntry | null;
}

@Component({
  selector: 'bcp-add-service-dialog',
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
    MatAutocompleteModule,
  ],
  templateUrl: './add-service-dialog.component.html',
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

      .service-form {
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
export class AddServiceDialogComponent implements OnInit {
  serviceForm: FormGroup;
  activityServiceControl = new FormControl('');
  technologyControl = new FormControl('');
  
  /** Predefined ITSM services list */
  itsmServices: string[] = [
    'Incident Management',
    'Change Management',
    'Problem Management',
    'Service Request Management',
    'Asset Management',
    'Configuration Management',
    'Release Management',
    'Service Level Management',
    'Capacity Management',
    'Availability Management',
    'IT Service Continuity Management',
    'Knowledge Management',
    'Event Management',
    'Access Management',
    'Service Catalog Management',
    'Service Portfolio Management',
    'Financial Management for IT Services',
    'Supplier Management',
    'Service Desk',
    'Service Operations'
  ];

  /** Predefined technologies list */
  technologies: string[] = [
    'SAP',
    'Oracle',
    'Salesforce',
    'JAVA',
    '.NET',
    'Python',
    'JavaScript',
    'Angular',
    'React',
    'Node.js',
    'Microsoft Azure',
    'AWS',
    'Google Cloud',
    'Docker',
    'Kubernetes',
    'Jenkins',
    'GitLab',
    'GitHub',
    'Jira',
    'ServiceNow',
    'Remedy',
    'BMC Helix',
    'SQL Server',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Oracle Database',
    'IBM DB2',
    'Linux',
    'Windows Server',
    'VMware',
    'Hyper-V',
    'Citrix',
    'Active Directory',
    'LDAP',
    'SAML',
    'OAuth',
    'REST API',
    'SOAP',
    'Microservices',
    'DevOps',
    'Agile',
    'Scrum',
    'Kanban'
  ];

  /** Filtered activity services observable */
  filteredActivityServices$!: Observable<string[]>;
  
  /** Filtered technologies observable */
  filteredTechnologies$!: Observable<string[]>;
  
  // Getters for conditional field visibility (needed for OnPush change detection)
  get isRegulatoryYes(): boolean {
    return this.serviceForm.get('regulatory')?.value === 'Yes';
  }
  
  get isContractualYes(): boolean {
    return this.serviceForm.get('contractual')?.value === 'Yes';
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private cdr: ChangeDetectorRef
  ) {
    this.serviceForm = this.fb.group({
      activityService: ['', [Validators.required, Validators.maxLength(100)]],
      criticality: ['', Validators.required],
      contractual: ['', Validators.required],
      penaltyDetails: [''],
      customerImpact: ['', Validators.required],
      regulatory: ['', Validators.required],
      typeOfRegulatory: [[]],
      engagementPeriod: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      technology: ['', [Validators.required, Validators.maxLength(200)]],
      primaryDeliverySite: ['', Validators.required],
    });

    // Set up conditional validation
    this.setupConditionalValidation();
  }

  ngOnInit(): void {
    // Load existing data if editing
    if (this.data.serviceData) {
      this.serviceForm.patchValue(this.data.serviceData);
      this.activityServiceControl.setValue(this.data.serviceData.activityService || '');
      this.technologyControl.setValue(this.data.serviceData.technology || '');
      this.cdr.markForCheck();
    }

    // Setup autocomplete filtering for Activity/Service
    this.filteredActivityServices$ = this.activityServiceControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterActivityServices(value || ''))
    );

    // Setup autocomplete filtering for Technology
    this.filteredTechnologies$ = this.technologyControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTechnologies(value || ''))
    );

    // Sync form control with autocomplete control for Activity/Service
    this.activityServiceControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.serviceForm.get('activityService')?.setValue(value, { emitEvent: false });
      }
    });

    // Sync form control with autocomplete control for Technology
    this.technologyControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.serviceForm.get('technology')?.setValue(value, { emitEvent: false });
      }
    });

    // Watch for regulatory changes
    this.serviceForm.get('regulatory')?.valueChanges.subscribe((value) => {
      const typeOfRegulatoryControl = this.serviceForm.get('typeOfRegulatory');
      if (value === 'Yes') {
        typeOfRegulatoryControl?.setValidators([Validators.required]);
      } else {
        typeOfRegulatoryControl?.clearValidators();
        typeOfRegulatoryControl?.setValue([]);
      }
      typeOfRegulatoryControl?.updateValueAndValidity();
      this.cdr.markForCheck();
    });

    // Watch for contractual changes to trigger change detection
    this.serviceForm.get('contractual')?.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  /** Filter activity services based on input */
  private _filterActivityServices(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.itsmServices.filter(service => service.toLowerCase().includes(filterValue));
  }

  /** Filter technologies based on input */
  private _filterTechnologies(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.technologies.filter(tech => tech.toLowerCase().includes(filterValue));
  }

  /** Display function for Activity/Service autocomplete */
  displayActivityService(value: string): string {
    return value || '';
  }

  /** Display function for Technology autocomplete */
  displayTechnology(value: string): string {
    return value || '';
  }

  /** Handle Activity/Service selection */
  onActivityServiceSelected(event: any): void {
    const value = event.option?.value || '';
    this.serviceForm.get('activityService')?.setValue(value);
    this.cdr.markForCheck();
  }

  /** Handle Technology selection */
  onTechnologySelected(event: any): void {
    const value = event.option?.value || '';
    this.serviceForm.get('technology')?.setValue(value);
    this.cdr.markForCheck();
  }

  private setupConditionalValidation(): void {
    // Conditional validation will be handled in ngOnInit
  }

  onSave(): void {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;
      const serviceData: ActivityServiceEntry = {
        activityService: formValue.activityService,
        criticality: formValue.criticality,
        contractual: formValue.contractual,
        penaltyDetails: formValue.penaltyDetails || undefined,
        customerImpact: formValue.customerImpact,
        regulatory: formValue.regulatory,
        typeOfRegulatory: formValue.typeOfRegulatory?.length > 0 ? formValue.typeOfRegulatory : undefined,
        engagementPeriod: formValue.engagementPeriod,
        technology: formValue.technology,
        primaryDeliverySite: formValue.primaryDeliverySite,
      };
      this.dialogRef.close({ data: serviceData, action: 'save' });
    } else {
      this.serviceForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  onSaveAndAdd(): void {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;
      const serviceData: ActivityServiceEntry = {
        activityService: formValue.activityService,
        criticality: formValue.criticality,
        contractual: formValue.contractual,
        penaltyDetails: formValue.penaltyDetails || undefined,
        customerImpact: formValue.customerImpact,
        regulatory: formValue.regulatory,
        typeOfRegulatory: formValue.typeOfRegulatory?.length > 0 ? formValue.typeOfRegulatory : undefined,
        engagementPeriod: formValue.engagementPeriod,
        technology: formValue.technology,
        primaryDeliverySite: formValue.primaryDeliverySite,
      };
      this.dialogRef.close({ data: serviceData, action: 'saveAndAdd' });
    } else {
      this.serviceForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

