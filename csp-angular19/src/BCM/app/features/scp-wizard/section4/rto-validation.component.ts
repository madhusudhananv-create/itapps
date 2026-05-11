import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { CriticalBusinessProcessData } from '../section1/critical-business-process.component';
import { MyUtility } from '../../../../../app/shared/my-utility';


export interface RtoValidationData {
  evacuation: string;       // HH:MM
  bcpInvocation: string;    // HH:MM
  callTree: string;         // HH:MM
  travelWorkHandover: string; // HH:MM
  workResumption: string;   // HH:MM
  tcrt: string;             // HH:MM auto-calc
  residualRto: string;      // HH:MM auto-calc (RTO - TCRT) may be negative prefixed with '-'
  rtoMet: boolean;          // auto
  id: number;
  activity: string;
}

@Component({
  selector: 'bcp-rto-validation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatTooltipModule, MatTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rto-validation.component.html',
styleUrl: './rto-validation.component.scss'
})
export class RtoValidationComponent implements OnInit, OnDestroy {
  @Input() initialData?: RtoValidationData;
  @Input() rtoFromSection3: { [activity: string]: string } = {}; // HH:MM
  @Input() mode: 'view' | 'edit' = 'edit';
  @Input() rtoList: RtoValidationData[] = [];
  @Input() section1Data?: CriticalBusinessProcessData;
  //@Input() dataFromSection1?: any[] = [];

  @Output() dataChange = new EventEmitter<RtoValidationData>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() recordDelete = new EventEmitter<number>();


  rtoForm: FormGroup;
  rtoMet = false;
  isResidualNegative = false;
  editingRowId: number | null = null;  // Track which row is being edited
  displayedColumns: string[] = ['activity', 'evacuation', 'bcpInvocation', 'callTree', 'travelWorkHandover', 'workResumption', 'residualRto', 'rtoMet', 'action']; // Define table columns
  viewReady = true;


  /** Subject to handle component destruction for unsubscribing */
  private destroy$ = new Subject<void>();

  private readonly timePattern = /^([0-9]|[0-5][0-9]):([0-5][0-9])$/;

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private _util: MyUtility) {
    this.rtoForm = this.fb.group({
      id: [null], 
      activity: [''],
      evacuation: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      bcpInvocation: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      callTree: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      travelWorkHandover: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      workResumption: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      tcrt: [''],
      residualRto: ['']
    });

    // 1. **AUTOSAVE LOGIC** (Debounced for inputs)
    this.rtoForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Only attempt autosave if we are currently editing a row and the form is valid
      if (this.editingRowId !== null && this.rtoForm.valid) {
        this.saveRow(true); // Call save with autosave=true
      }
    });

    // Emit changes
    this.rtoForm.valueChanges.subscribe(()=>{
      this.validityChange.emit(this.rtoForm.valid);
      if (this.rtoForm.valid) this.dataChange.emit(this.serialize());
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.rtoForm.patchValue(this.initialData);
    }

    // Recalculate on any change - auto-save with debouncing
    this.rtoForm.valueChanges
      .pipe(
        debounceTime(500), // Auto-save after 500ms of inactivity
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.recalculate();
        this.validityChange.emit(this.rtoForm.valid);
        if (this.rtoForm.valid) {
          this.dataChange.emit(this.serialize());
        }
      });

    // Initial calc
    this.recalculate();
    this.validityChange.emit(this.rtoForm.valid);
    if (this.rtoForm.valid) {
      this.dataChange.emit(this.serialize());
    }
  }

  private serialize(): RtoValidationData {
    const formValues = this.rtoForm.getRawValue();
    return {
      id: formValues.id ?? this.editingRowId ?? 0, 
      activity: formValues.activity ?? '',
      evacuation: formValues.evacuation ?? '',
      bcpInvocation: formValues.bcpInvocation ?? '',
      callTree: formValues.callTree ?? '',
      travelWorkHandover: formValues.travelWorkHandover ?? '',
      workResumption: formValues.workResumption ?? '',
      tcrt: formValues.tcrt ?? '',
      residualRto: formValues.residualRto ?? '',
      rtoMet: this.rtoMet
    };
  }

  private recalculate(): void {
    const a = this.parseTime(this.rtoForm.get('evacuation')?.value);
    const b = this.parseTime(this.rtoForm.get('bcpInvocation')?.value);
    const c = this.parseTime(this.rtoForm.get('callTree')?.value);
    const d = this.parseTime(this.rtoForm.get('travelWorkHandover')?.value);
    const e = this.parseTime(this.rtoForm.get('workResumption')?.value);

    const total = a + b + c + d + e; // total minutes used
    const tcrt = this.minutesToHHMM(total);
    this.rtoForm.get('tcrt')?.setValue(tcrt, { emitEvent: false });

    // FIX: Only perform residual calculation if Section 3 RTO is actually present
    const activity = this.rtoForm.get('activity')?.value;
    const section3RtoHHMM = activity ? this.rtoFromSection3[activity] : undefined;
    if (section3RtoHHMM) {
        const section3RtoMin = this.parseTime(section3RtoHHMM);
        const residual = section3RtoMin - total; 

        this.isResidualNegative = residual < 0; // Negative if we used more time than allowed
        this.rtoMet = residual >= 0; // Met if we are equal to or under the limit
        
        const residualDisplay = this.minutesToHHMM(Math.abs(residual));
        const formattedResidual = (residual < 0 ? '-' : '') + residualDisplay;
        this.rtoForm.get('residualRto')?.setValue(formattedResidual, { emitEvent: false });
    } else {
        // Fallback state if Section 3 data hasn't arrived yet
        this.rtoMet = false;
        this.rtoForm.get('residualRto')?.setValue('Waiting for Section 3...', { emitEvent: false });
    }
    
    this.cdr.markForCheck(); // Ensure the UI updates with the new rtoMet status
}

  private parseTime(value: string | null | undefined): number {
    if (!value) return 0;
    const parts = value.split(':');
    if (parts.length !== 2) return 0;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  }

  private minutesToHHMM(total: number): string {
    if (total < 0) total = 0;
    const h = Math.floor(total / 60);
    const m = total % 60;
    const hStr = h.toString();
    const mStr = m.toString().padStart(2, '0');
    return `${hStr}:${mStr}`;
  }

  /**
   * Cleanup subscriptions on component destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
if (changes['section1Data']?.currentValue && this.viewReady) {

      this.fillFromSection1(changes['section1Data']?.currentValue);
    }
  }

  // Called when Edit button is clicked
  editRow(row: RtoValidationData) {
    // If another row is currently being edited, cancel it first
    if (this.editingRowId !== null && this.editingRowId !== row.id) {
      this.cancelEdit();
    }
    this.editingRowId = row.id;
    //this.recalculate();
    this.rtoForm.patchValue(row);
    this.rtoForm.enable();
  }
  
    //Cancel function
  cancelEdit() {
    this.editingRowId = null;
    this.rtoForm.reset();
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
        this.rtoList = this.rtoList.filter(r => r.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  //Save function
    saveRow(isAutosave: boolean = false) {

      if (this.rtoForm.invalid) {
        // Prevent save if invalid, especially if manually triggered
        if (!isAutosave) { 
          this._util.showWarningPopup('Please fill in required fields.', 'Validation Error');
        }
        return;
        }
        const updatedData = this.rtoForm.getRawValue() as RtoValidationData;
        const index = this.rtoList.findIndex(x => x.id === this.editingRowId);
        if (index > -1) {
        // Create a new array reference for OnPush to detect the change
        const newList = [...this.rtoList]; 
        newList[index] = updatedData;
        this.rtoList = newList; // Update the Input array reference
        
        // Force change detection for Mat-Table due to OnPush
        this.cdr.detectChanges();
  
        // If it was a manual save (not autosave), exit edit mode
        if (!isAutosave) {
          //this.recalculate();
          this.editingRowId = null;
        }
      }
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
  this.rtoList = []; // Set data source to an empty array
  this.rtoForm.disable();
  this.cdr.detectChanges();
    return; // Exit the function immediately
  }
  
  let nextId = 1;

  this.rtoList = originalData.map((item: any, index: number) => ({
    id: nextId++,
    // 3. Optional: Remove the fallback in the activity field 
    //    if you prefer a blank cell over "Activity X" when data is partially empty.
    activity: item.activityService || item.name || '', 
    evacuation: item.evacuation || '', 
    bcpInvocation: item.bcpInvocation || '',
    callTree: item.callTree || '',
    travelWorkHandover: item.travelWorkHandover || '',
    workResumption: item.workResumption || '',
    tcrt: item.tcrt || '0:00',
    residualRto: item.residualRto || '0:00',
    rtoMet: item.rtoMet || false,
  }));

  // Disable the form initially when not editing
  this.rtoForm.disable();

  // Force change detection (necessary for OnPush strategy)
  this.cdr.detectChanges();
}
}


