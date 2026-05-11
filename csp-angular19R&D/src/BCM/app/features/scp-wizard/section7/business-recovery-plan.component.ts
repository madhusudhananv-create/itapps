import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { CriticalBusinessProcessData } from '../section1/critical-business-process.component';
import { AddActivityDialogComponent } from './add-activity.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MyUtility } from '../../../../../app/shared/my-utility';


export interface BusinessRecoveryPlanData {
  outageScenario: string;
  recoveryStrategy: string;
  customRecoveryStrategy?: string;
  comments?: string;
  id: number;
  activity: string;
}

export interface ActivityServiceEntry {
  /** Activity or service being provided */
  activity: string;
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

@Component({
  selector: 'bcp-business-recovery-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule, MatButtonModule, MatTooltipModule, MatTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './business-recovery-plan.component.html',
  styleUrl: './business-recovery-plan.component.scss'
})
export class BusinessRecoveryPlanComponent {
  
  @Input() initialData?: BusinessRecoveryPlanData;
  @Input() mode: 'view' | 'edit' = 'edit';
  @Output() dataChange = new EventEmitter<BusinessRecoveryPlanData>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() recordDelete = new EventEmitter<number>();
  @Input() section1Data?: CriticalBusinessProcessData;
  @Input() dataList: BusinessRecoveryPlanData[] = [];
  @Input() dataFromSection1?: any[] = [];
  viewReady = true;


  outageOptions = [
    'Facility/Site Disruption',
    'People unavailable',
    'Loss of IT Dependency',
    'Unable to Work Remotely',
    'Loss of (other) key dependency',
  ];

  strategyOptions = [
    'Work from alternate neurealm site (other city/same country)',
    'Other / Specify',
    'Cross Training',
    'Work from alternate neurealm site',
  ];

  

  brpForm: FormGroup;
  editingRowId: number | null = null;  // Track which row is being edited
  //dataList: BusinessRecoveryPlanData[] = [];
  displayedColumns: string[] = ['activity', 'outageScenario', 'recoveryStrategy', 'comments', 'action']; // Define table columns
  private destroy$: Subject<void> = new Subject<void>();

  //Form validation
  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private dialog: MatDialog, private _util: MyUtility) {
    this.brpForm = this.fb.group({
      id: [null], 
      activity: [''],
      outageScenario: ['', Validators.required],
      recoveryStrategy: ['', Validators.required],
      customRecoveryStrategy: [''],
      comments: ['']
    });

    // 1. **AUTOSAVE LOGIC** (Debounced for inputs)
    this.brpForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Only attempt autosave if we are currently editing a row and the form is valid
      if (this.editingRowId !== null && this.brpForm.valid) {
        this.saveRow(true); // Call save with autosave=true
      }
    });

    // Conditional required for custom strategy
    this.brpForm.get('recoveryStrategy')?.valueChanges.subscribe(val => {
      const ctrl = this.brpForm.get('customRecoveryStrategy');
      if (val === 'Other / Specify') {
        ctrl?.setValidators([Validators.required]);
      } else {
        ctrl?.clearValidators();
        ctrl?.setValue('');
      }
      ctrl?.updateValueAndValidity();
    });

    // Emit changes
    this.brpForm.valueChanges.subscribe(()=>{
      this.validityChange.emit(this.brpForm.valid);
      if (this.brpForm.valid) this.dataChange.emit(this.serialize());
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.brpForm.patchValue(this.initialData);
    }
    this.validityChange.emit(this.brpForm.valid);
    if (this.brpForm.valid) this.dataChange.emit(this.serialize());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['section1Data']?.currentValue && this.viewReady) {

      this.fillFromSection1(changes['section1Data']?.currentValue);
    }
  }

  private serialize(): BusinessRecoveryPlanData {
    const formValues = this.brpForm.getRawValue();
    return {
        // Ensure ID is present. Use form value if it exists, otherwise use 0/null.
        id: formValues.id ?? this.editingRowId ?? 0, 
        activity: formValues.activity ?? '',
        outageScenario: formValues.outageScenario ?? '',
        recoveryStrategy: formValues.recoveryStrategy ?? '',
        customRecoveryStrategy: formValues.customRecoveryStrategy ?? '',
        comments: formValues.comments ?? '',
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Called when Edit button is clicked
  editRow(row: BusinessRecoveryPlanData) {
    // If another row is currently being edited, cancel it first
    if (this.editingRowId !== null && this.editingRowId !== row.id) {
      this.cancelEdit();
    }
    this.editingRowId = row.id;
    this.brpForm.patchValue(row);
    this.brpForm.enable();
  }

  //Save function
  saveRow(isAutosave: boolean = false) {

    if (this.brpForm.invalid) {
      // Prevent save if invalid, especially if manually triggered
      if (!isAutosave) { 
        this._util.showWarningPopup('Please fill in required fields.', 'Validation Error');
      }
      return;
      }
      const updatedData = this.brpForm.getRawValue() as BusinessRecoveryPlanData;
      const index = this.dataList.findIndex(x => x.id === this.editingRowId);
      if (index > -1) {
      // Create a new array reference for OnPush to detect the change
      const newList = [...this.dataList]; 
      newList[index] = updatedData;
      this.dataList = newList; // Update the Input array reference

      // Force change detection for Mat-Table due to OnPush
      this.cdr.detectChanges();

      // If it was a manual save (not autosave), exit edit mode
      if (!isAutosave) {
        this.editingRowId = null;
      }
    }
  }

  //Cancel function
  cancelEdit() {
    this.editingRowId = null;
    this.brpForm.reset();
    this.cdr.detectChanges(); // Force view update after state change
  }

  //Delete function
  deleteRow(id: number) {
    this._util.showWarningConfirmation(
      'Are you sure you want to delete this record?',
      'Delete Record'
    ).subscribe((result: boolean) => {
      if (result === true) {
        this.recordDelete.emit(id);
        // Remove from local list to update view
        this.dataList = this.dataList.filter(r => r.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  // Fill data from Section 1
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
  this.dataList = []; // Set data source to an empty array
  this.brpForm.disable();
  this.cdr.detectChanges();
    return; // Exit the function immediately
  }
      this.dataList = originalData.map((item: any, index: number) => ({
        id: index + 1, // Use index + 1 for a simple temporary ID
        activity: item.activityService || item.name || `Activity ${index + 1}`, // Assuming activityService is the field
        outageScenario: item.outageScenario || '', // Initialize with empty string
        recoveryStrategy: item.recoveryStrategy || '', // Initialize with empty string
        customRecoveryStrategy: '',
        comments: ''
      }));
    // Disable the form initially when not editing
    this.brpForm.disable(); 

    // Force change detection because we changed an Input property (dataList) in code
    this.cdr.detectChanges();
  }
  /**
     * Opens a modal dialog to add a new service entry
     * @param event - Click event to prevent default form submission
     */
    openAddActivityDialog(event?: Event): void {
          // Prevent form submission and event bubbling
          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }   
          const allActivities = this.dataList.map(row => row.activity);
          const uniqueActivities = [...new Set(allActivities)];
          const dialogRef = this.dialog.open(AddActivityDialogComponent, {
                  width: '800px',
                  maxWidth: '95vw',
                  maxHeight: '90vh',
                  disableClose: false,
                  autoFocus: false,
                  hasBackdrop: true,
                  panelClass: 'add-service-dialog',
                  data: {
                    itemServiceNames: uniqueActivities
                  }
                });
          dialogRef.afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        this.addNewRows(result);
      }
    });
              
        }
      

addNewRows(selectedActivities: string[]) {
  let updatedData = [...this.dataList];

  selectedActivities.forEach(selectedActivities => {
    // a. Create the new row object for this activity.
    const newRow = {
      id: Date.now() + Math.random(), // Generate a unique ID
      activity: selectedActivities,  // The service name from the selection
      outageScenario: '',             // Start empty
      recoveryStrategy: '',           // Start empty
      comments: '',                   // Start empty
      isEditMode: true                // Optional: Open the new row in edit mode
    };

    let insertIndex = -1;

    // Iterate backwards to find the last occurrence efficiently.
    for (let i = updatedData.length - 1; i >= 0; i--) {
      if (updatedData[i].activity === selectedActivities) {
        insertIndex = i;
        break; // Stop once the last occurrence is found
      }
    }

    // c. Insert the new row into the array.
    if (insertIndex !== -1) {
      updatedData.splice(insertIndex + 1, 0, newRow);
    } else {
      updatedData.push(newRow);
    }
  });

  this.dataList = updatedData;
  this.cdr.detectChanges(); // Force table to update
}
}
