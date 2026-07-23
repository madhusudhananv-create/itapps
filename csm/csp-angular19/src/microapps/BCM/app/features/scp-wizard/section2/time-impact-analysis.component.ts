import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CriticalBusinessProcessData } from '../section1/critical-business-process.component';
import { MyUtility } from '../../../../../../app/shared/my-utility';


/**
 * Interface representing the data structure for Time Impact Analysis form
 */
export interface TimeImpactAnalysisData {
  /** Impact A (Insignificant) time in HH:MM format */
  impactA: string;
  /** Impact A rating */
  impactARating: string;
  /** Impact B (Medium) time in HH:MM format */
  impactB: string;
  /** Impact B rating */
  impactBRating: string;
  /** Impact C (High) time in HH:MM format */
  impactC: string;
  /** Impact C rating */
  impactCRating: string;
  /** Impact D (Very High) time in HH:MM format */
  impactD: string;
  /** Impact D rating */
  impactDRating: string;
  /** MTPD (Maximum Tolerable Period of Disruption) time in HH:MM format */
  mtpd: string;
  /** Explanation for dependency */
  explainDependency: string;
  id: number;
  activity: string;
}

@Component({
  selector: 'bcp-time-impact-analysis',
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
    FormsModule,
    MatTableModule
  ],
  templateUrl: './time-impact-analysis.component.html',
  styleUrl: './time-impact-analysis.component.scss'
})
/**
 * Component for managing Time Impact Analysis form data
 * Implements reactive forms with validation and MTPD auto-calculation
 */
export class TimeImpactAnalysisComponent implements OnInit, OnDestroy {
  /** Initial data to populate the form */
  @Input() initialData?: TimeImpactAnalysisData;
  /** Mode of operation - 'view' or 'edit' */
  @Input() mode: 'view' | 'edit' = 'edit';
  /** Emits form data when valid */
  @Output() dataChange = new EventEmitter<TimeImpactAnalysisData>();
  /** Emits form validity status */
  @Output() validityChange = new EventEmitter<boolean>();

  /** Reactive form group for all form controls */
  tiaForm: FormGroup;
  /** Flag to show consistency warning */
  showConsistencyWarning = false;

  ///Form to table & section 1 data
  @Output() recordDelete = new EventEmitter<number>();
  @Input() section1Data?: CriticalBusinessProcessData;
  @Input() tiaList: TimeImpactAnalysisData[] = [];
  viewReady = true;
  displayedColumns: string[] = ['activity', 'impactA', 'impactB', 'impactC', 'impactD', 'mtpd', 'dependency', 'action'];
  editingRowId: number | null = null;  // Track which row is being edited
  impactRatings: string[] = ['No Impact', 'Neurealm & Customer', 'Neurealm Impact', 'Neurealm Financial Impact', 'Reputational Impact', 'Legal & Regulatory'];

  /** Previous Impact D value to track auto-updates */
  private previousImpactD: string = '';

  /** Subject to handle component destruction for unsubscribing */
  private destroy$ = new Subject<void>();

  /** Time format pattern for HH:MM validation */
  private readonly timePattern = /^([0-9]|[0-5][0-9]):([0-5][0-9])$/;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _util: MyUtility
  ) {
    this.tiaForm = this.fb.group({
      id: [null],
      activity: [''],
      impactA: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      impactARating: ['', Validators.required],
      impactB: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      impactBRating: ['', Validators.required],
      impactC: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      impactCRating: ['', Validators.required],
      impactD: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      impactDRating: ['', Validators.required],
      mtpd: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      explainDependency: ['']
    });
    // 1. **AUTOSAVE LOGIC** (Debounced for inputs)
    this.tiaForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Only attempt autosave if we are currently editing a row and the form is valid
      if (this.editingRowId !== null && this.tiaForm.valid) {
        this.saveRow(true); // Call save with autosave=true
      }
    });
    // Emit changes
    this.tiaForm.valueChanges.subscribe(() => {
      this.validityChange.emit(this.tiaForm.valid);
      if (this.tiaForm.valid) this.dataChange.emit(this.serialize());
    });
  }

  /**
   * Initializes the component and sets up form validation
   */
  ngOnInit(): void {
    // Load initial data if provided
    if (this.initialData) {
      this.tiaForm.patchValue(this.initialData);
      // Initialize previous Impact D value
      if (this.initialData.impactD) {
        this.previousImpactD = this.initialData.impactD;
      }
    }

    // Set up MTPD auto-calculation
    this.setupMTPDCalculation();

    // Set up consistency checking
    this.setupConsistencyCheck();

    // Emit initial validity
    this.validityChange.emit(this.tiaForm.valid);
    if (this.tiaForm.valid) this.dataChange.emit(this.serialize());

    // Watch for form changes - auto-save with debouncing
    this.tiaForm.valueChanges
      .pipe(
        debounceTime(500), // Auto-save after 500ms of inactivity
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.validityChange.emit(this.tiaForm.valid);
        // Auto-save when form is valid
        if (this.tiaForm.valid) {
          this.onFormChange();
        }
      });
  }

  /**
   * Cleanup subscriptions on component destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sets up MTPD auto-calculation from Impact D
   * Defaults to Impact D, allows selection from Impact C only
   * @private
   */
  private setupMTPDCalculation(): void {
    // Auto-calculate MTPD when Impact D changes (if not manually changed by user)
    this.tiaForm.get('impactD')?.valueChanges.subscribe(impactD => {
      if (impactD && this.tiaForm.get('impactD')?.valid) {
        const currentMTPD = this.tiaForm.get('mtpd')?.value;

        // Only auto-update if MTPD is currently equal to previous Impact D or empty
        // Don't auto-update if user has manually set it to Impact C
        if (!currentMTPD || currentMTPD === this.previousImpactD) {
          this.tiaForm.get('mtpd')?.setValue(impactD, { emitEvent: false });
        }

        // Update previous value
        this.previousImpactD = impactD;
      }
    });

    // Allow user to manually set MTPD to Impact C
    // Set up validation when user manually changes MTPD
    this.tiaForm.get('mtpd')?.valueChanges.subscribe(() => {
      this.validateMTPD();
    });

    // Set up conditional validation for Explain Dependency
    this.tiaForm.get('mtpd')?.valueChanges.subscribe(() => {
      this.validateExplainDependency();
    });
  }

  /**
   * Validates MTPD can only be D or C
   * @private
   */
  private validateMTPD(): void {
    const mtpd = this.tiaForm.get('mtpd')?.value;
    const impactD = this.tiaForm.get('impactD')?.value;
    const impactC = this.tiaForm.get('impactC')?.value;

    if (mtpd && impactD && impactC) {
      const mtpdMinutes = this.parseTime(mtpd);
      const impactDMinutes = this.parseTime(impactD);
      const impactCMinutes = this.parseTime(impactC);

      if (mtpdMinutes !== null && impactDMinutes !== null && impactCMinutes !== null) {
        // MTPD must be either D or C
        if (mtpdMinutes !== impactDMinutes && mtpdMinutes !== impactCMinutes) {
          this.tiaForm.get('mtpd')?.setErrors({ invalidMTPD: true });
        } else if (this.tiaForm.get('mtpd')?.hasError('invalidMTPD')) {
          this.tiaForm.get('mtpd')?.setErrors(null);
          this.tiaForm.get('mtpd')?.updateValueAndValidity();
        }
      }
    }
  }

  /**
   * Validates Explain Dependency is required when MTPD differs from D
   * @private
   */
  private validateExplainDependency(): void {
    const mtpd = this.tiaForm.get('mtpd')?.value;
    const impactD = this.tiaForm.get('impactD')?.value;
    const explainDependencyControl = this.tiaForm.get('explainDependency');

    if (mtpd && impactD && mtpd !== impactD) {
      explainDependencyControl?.setValidators([Validators.required]);
    } else {
      explainDependencyControl?.clearValidators();
    }

    explainDependencyControl?.updateValueAndValidity();
  }

  /**
   * Sets up consistency checking for A ≤ B ≤ C ≤ D sequence
   * @private
   */
  private setupConsistencyCheck(): void {
    const timeFields = ['impactA', 'impactB', 'impactC', 'impactD'];

    timeFields.forEach(field => {
      this.tiaForm.get(field)?.valueChanges.subscribe(() => {
        this.checkConsistency();
      });
    });
  }

  /**
   * Checks if times follow A ≤ B ≤ C ≤ D sequence
   * @private
   */
  private checkConsistency(): void {
    const impactA = this.parseTime(this.tiaForm.get('impactA')?.value);
    const impactB = this.parseTime(this.tiaForm.get('impactB')?.value);
    const impactC = this.parseTime(this.tiaForm.get('impactC')?.value);
    const impactD = this.parseTime(this.tiaForm.get('impactD')?.value);

    if (impactA !== null && impactB !== null && impactC !== null && impactD !== null) {
      this.showConsistencyWarning = !(impactA <= impactB && impactB <= impactC && impactC <= impactD);
    } else {
      this.showConsistencyWarning = false;
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
    if (this.tiaForm.valid) {
      const formData: TimeImpactAnalysisData = {
        id: this.tiaForm.get('id')?.value,
        activity: this.tiaForm.get('activity')?.value,
        impactA: this.tiaForm.get('impactA')?.value,
        impactARating: this.tiaForm.get('impactARating')?.value,
        impactB: this.tiaForm.get('impactB')?.value,
        impactBRating: this.tiaForm.get('impactBRating')?.value,
        impactC: this.tiaForm.get('impactC')?.value,
        impactCRating: this.tiaForm.get('impactCRating')?.value,
        impactD: this.tiaForm.get('impactD')?.value,
        impactDRating: this.tiaForm.get('impactDRating')?.value,
        mtpd: this.tiaForm.get('mtpd')?.value,
        explainDependency: this.tiaForm.get('explainDependency')?.value
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
    if (this.tiaForm.valid) {
      this.onFormChange();
    } else {
      // Mark all fields as touched to show validation errors
      this.tiaForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  /**
   * Gets the current form data if valid
   * @returns Form data or null if invalid
   */
  getFormData(): TimeImpactAnalysisData | null {
    if (this.tiaForm.valid) {
      return this.tiaForm.value as TimeImpactAnalysisData;
    }
    return null;
  }

  /**
   * Checks if the form is currently valid
   * @returns True if form is valid, false otherwise
   */
  isFormValid(): boolean {
    return this.tiaForm.valid;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section1Data']?.currentValue && this.viewReady) {

      this.fillFromSection1(changes['section1Data']?.currentValue);
    }
  }
  private serialize(): TimeImpactAnalysisData {
    const formValues = this.tiaForm.getRawValue();
    return {
      // Ensure ID is present. Use form value if it exists, otherwise use 0/null.
      id: formValues.id ?? this.editingRowId ?? 0,
      activity: formValues.activity ?? '',
      impactA: formValues.impactA ?? '',
      impactARating: formValues.impactARating ?? '',
      impactB: formValues.impactB ?? '',
      impactBRating: formValues.impactBRating ?? '',
      impactC: formValues.impactC ?? '',
      impactCRating: formValues.impactCRating ?? '',
      impactD: formValues.impactD ?? '',
      impactDRating: formValues.impactDRating ?? '',
      mtpd: formValues.mtpd ?? '',
      explainDependency: formValues.explainDependency ?? ''
    };
  }
  // Called when Edit button is clicked
  editRow(row: TimeImpactAnalysisData) {
    // If another row is currently being edited, cancel it first
    if (this.editingRowId !== null && this.editingRowId !== row.id) {
      this.cancelEdit();
    }
    this.editingRowId = row.id;
    this.tiaForm.patchValue(row);
    this.tiaForm.enable();
  }

  //Save function
  saveRow(isAutosave: boolean = false) {

    if (this.tiaForm.invalid) {
      // Prevent save if invalid, especially if manually triggered
      if (!isAutosave) {
        this._util.showWarningPopup('Please fill in required fields.', 'Validation Error');
      }
      return;
    }
    const updatedData = this.tiaForm.getRawValue() as TimeImpactAnalysisData;
    const index = this.tiaList.findIndex(x => x.id === this.editingRowId);
    if (index > -1) {
      // Create a new array reference for OnPush to detect the change
      const newList = [...this.tiaList];
      newList[index] = updatedData;
      this.tiaList = newList; // Update the Input array reference

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
    this.tiaForm.reset();
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
        this.tiaList = this.tiaList.filter(r => r.id !== id);
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
      this.tiaList = []; // Set data source to an empty array
      this.tiaForm.disable();
      this.cdr.detectChanges();
      return; // Exit the function immediately
    }

    let nextId = 1;
    this.tiaList = originalData.map((item: any, index: number) => ({
      id: item.id || nextId++,
      activity: item.activityService || `Activity ${index + 1}`,
      impactA: item.impactA || '',
      impactARating: item.impactARating || '',
      impactB: item.impactB || '',
      impactBRating: item.impactBRating || '',
      impactC: item.impactC || '',
      impactCRating: item.impactCRating || '',
      impactD: item.impactD || '',
      impactDRating: item.impactDRating || '',
      mtpd: item.mtpd || '',
      explainDependency: item.explainDependency || ''
    }));
    // Disable the form initially when not editing
    this.tiaForm.disable();

    // Force change detection because we changed an Input property (kpcList) in code
    this.cdr.detectChanges();
  }

}
