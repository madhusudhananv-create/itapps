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
import { ActivityServiceEntry } from './business-recovery-plan.component';
import { FormsModule } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';

export interface DialogData {
  mode: 'add' | 'edit';
  serviceData: ActivityServiceEntry | null;
  activities: string[];
}

@Component({
  selector: 'bcp-add-activity-dialog',
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
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './add-activity.component.html',
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

      .dialog-actions .add-button {
        background-color: #3f51b5;
        color: white;
        margin-left: 0.5rem;
      }

      .checkbox-grid-container {
  padding: 10px 0;
}

.list-label {
  font-weight: 500;
  display: block;
  margin-bottom: 15px;
  color: rgba(0, 0, 0, 0.6);
}

/* The actual grid layout */
.grid-layout {
  display: grid;
  /* Creates 2 columns of equal width. Change '2' to '3' for more columns. */
  grid-template-columns: repeat(2, 1fr); 
  gap: 16px; /* Space between columns and rows */
}

.checkbox-item {
  display: flex;
  align-items: center;
}

/* Optional: Add a scroll area if the list of services is long */
.dialog-content {
  max-height: 400px;
  overflow-y: auto;
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
export class AddActivityDialogComponent implements OnInit {
  serviceForm: FormGroup;
  activityServiceControl = new FormControl('');
  
  selectedActivities: string[] = []; // Stores the user selection
  

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { itemServiceNames: string[] },
    private cdr: ChangeDetectorRef
  ) {
    this.serviceForm = this.fb.group({
      activityService: [''],
      
    });

    
  }

  ngOnInit(): void {
    // Load existing data if editing
    if (this.data.itemServiceNames) {
      this.serviceForm.patchValue(this.data.itemServiceNames);
      this.cdr.markForCheck();
    }
  }
  onCheckboxChange(event: any, activity: string) {
  if (event.checked) {
    // Add the activity if it's not already in the array
    if (!this.selectedActivities.includes(activity)) {
      this.selectedActivities.push(activity);
    }
  } else {
    // Remove the activity from the array
    this.selectedActivities = this.selectedActivities.filter(a => a !== activity);
  }
  
  // Optional: If you need to trigger change detection manually
  // this.cdr.markForCheck(); 
}

  onCancel(): void {
    this.dialogRef.close(null);
  }
  // Function to get unique Activity options from the current table data
onAdd() {
    // Pass the selected array back to the parent
    this.dialogRef.close(this.selectedActivities);
  }
  
}

