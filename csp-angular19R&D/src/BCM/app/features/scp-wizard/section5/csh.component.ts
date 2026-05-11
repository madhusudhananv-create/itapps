import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CriticalBusinessProcessData } from '../section1/critical-business-process.component';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MyUtility } from '../../../../../app/shared/my-utility';



export interface CshData {
  totalStaff: number;
  csh: number;
  extendedCsh?: number | null;
  pas: 'Work from home' | 'neurealm Site' | 'Non-neurealm Site' | '';
  siteName?: string;
  interSiteAgreement: 'Yes' | 'No' | 'NA' | '';
  id: number;
  activity: string;
}

@Component({
  selector: 'bcp-csh',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatTooltipModule, MatTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './csh.component.html',
  styleUrl: './csh.component.scss'
})
export class CshComponent implements OnInit {
  @Input() initialData?: CshData;
  @Input() mode: 'view' | 'edit' = 'edit';
  @Output() dataChange = new EventEmitter<CshData>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() recordDelete = new EventEmitter<number>();
  @Input() cshList: CshData[] = [];
  @Input() section1Data?: CriticalBusinessProcessData;
  @Output() staffMapChange = new EventEmitter<{ [activity: string]: number }>();

  cshForm: FormGroup;
  showExtendedWarning = false;
  editingRowId: number | null = null;  // Track which row is being edited
  displayedColumns: string[] = ['activity', 'totalStaff', 'csh', 'extendedCsh', 'pas', 'interSiteAgreement', 'action']; // Define table columns
  viewReady = true;
    private destroy$ = new Subject<void>();
  


  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private _util: MyUtility){
    this.cshForm = this.fb.group({
      id: [null], 
      activity: [''],
      totalStaff: [null, [Validators.required, Validators.min(0)]],
      csh: [null, [Validators.required, Validators.min(0)]],
      extendedCsh: [null, [Validators.min(0)]],
      pas: ['', Validators.required],
      siteName: [''],
      interSiteAgreement: ['', Validators.required]
    });

    // 1. **AUTOSAVE LOGIC** (Debounced for inputs)
        this.cshForm.valueChanges.pipe(
          debounceTime(500),
          takeUntil(this.destroy$)
        ).subscribe(() => {
          // Only attempt autosave if we are currently editing a row and the form is valid
          if (this.editingRowId !== null && this.cshForm.valid) {
            this.saveRow(true); // Call save with autosave=true
          }
        });
    
        // Emit changes
        this.cshForm.valueChanges.subscribe(()=>{
          this.validityChange.emit(this.cshForm.valid);
          if (this.cshForm.valid) this.dataChange.emit(this.serialize());
        });
  }

  ngOnInit(): void {
    if (this.initialData){
      this.cshForm.patchValue(this.initialData);
    }

    // Custom validation: CSH ≤ Total Staff
    this.cshForm.get('csh')?.valueChanges.subscribe(()=> this.validateCsh());
    this.cshForm.get('totalStaff')?.valueChanges.subscribe(()=> this.validateCsh());

    // Conditional required: siteName when PAS ≠ Work from home
    this.cshForm.get('pas')?.valueChanges.subscribe((val)=>{
      const siteCtrl = this.cshForm.get('siteName');
      if (val && val !== 'Work from home'){
        siteCtrl?.setValidators([Validators.required]);
      } else {
        siteCtrl?.clearValidators();
        siteCtrl?.setValue('');
      }
      siteCtrl?.updateValueAndValidity();
    });

    // Warning: Extended CSH < CSH (non-blocking)
    const ext = this.cshForm.get('extendedCsh');
    const csh = this.cshForm.get('csh');
    ext?.valueChanges.subscribe(()=> this.updateExtendedWarning());
    csh?.valueChanges.subscribe(()=> this.updateExtendedWarning());

    // Emit changes
    this.cshForm.valueChanges.subscribe(()=>{
      this.validityChange.emit(this.cshForm.valid);
      if (this.cshForm.valid){
        this.dataChange.emit(this.serialize());
      }
    });

    // Initial emit
    this.validityChange.emit(this.cshForm.valid);
    if (this.cshForm.valid){
      this.dataChange.emit(this.serialize());
    }
  }

  private serialize(): CshData{
    const formValues = this.cshForm.getRawValue();

    return {
      id: formValues.id ?? this.editingRowId ?? 0, 
      activity: formValues.activity ?? '',
      totalStaff: formValues.totalStaff ?? '',
      csh: formValues.csh ?? '',
      extendedCsh: formValues.extendedCsh ?? '',
      pas: formValues.pas ?? '',
      siteName: formValues.siteName ?? '',
      interSiteAgreement: formValues.interSiteAgreement ?? '',
    };
  }

  private validateCsh(): void{
    const total = Number(this.cshForm.get('totalStaff')?.value ?? 0);
    const csh = Number(this.cshForm.get('csh')?.value ?? 0);
    const cshCtrl = this.cshForm.get('csh');
    if (cshCtrl){
      if (!isNaN(total) && !isNaN(csh) && csh > total){
        cshCtrl.setErrors({ ...(cshCtrl.errors || {}), cshExceedsTotal: true });
      } else {
        if (cshCtrl.errors){
          const { cshExceedsTotal, ...rest } = cshCtrl.errors;
          cshCtrl.setErrors(Object.keys(rest).length ? rest : null);
        }
      }
    }
  }

  private updateExtendedWarning(): void{
    const ext = Number(this.cshForm.get('extendedCsh')?.value ?? 0);
    const csh = Number(this.cshForm.get('csh')?.value ?? 0);
    this.showExtendedWarning = !isNaN(ext) && !isNaN(csh) && ext > 0 && ext < csh;
  }

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
  editRow(row: CshData) {
    // If another row is currently being edited, cancel it first
    if (this.editingRowId !== null && this.editingRowId !== row.id) {
      this.cancelEdit();
    }
    this.editingRowId = row.id;
    this.cshForm.patchValue(row);
    this.cshForm.enable();
  }
  
    //Cancel function
  cancelEdit() {
    this.editingRowId = null;
    this.cshForm.reset();
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
        this.cshList = this.cshList.filter(r => r.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  //Save function
    saveRow(isAutosave: boolean = false) {

      if (this.cshForm.invalid) {
        // Prevent save if invalid, especially if manually triggered
        if (!isAutosave) { 
          this._util.showWarningPopup('Please fill in required fields.', 'Validation Error');
        }
        return;
        }
        const updatedData = this.cshForm.getRawValue() as CshData;
        const index = this.cshList.findIndex(x => x.id === this.editingRowId);
        if (index > -1) {
        // Create a new array reference for OnPush to detect the change
        const newList = [...this.cshList]; 
        newList[index] = updatedData;
        this.cshList = newList; // Update the Input array reference
  
        // Force change detection for Mat-Table due to OnPush
        this.cdr.detectChanges();
        const staffMap: { [activity: string]: number } = {};
        this.cshList.forEach(row => {
          staffMap[row.activity] = row.totalStaff;
        });
        this.staffMapChange.emit(staffMap);
  
        // If it was a manual save (not autosave), exit edit mode
        if (!isAutosave) {
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
  this.cshList = []; // Set data source to an empty array
  this.cshForm.disable();
  this.cdr.detectChanges();
    return; // Exit the function immediately
  }
  
  let nextId = 1;

  this.cshList = originalData.map((item: any, index: number) => ({
    id: nextId++,
    // 3. Optional: Remove the fallback in the activity field 
    //    if you prefer a blank cell over "Activity X" when data is partially empty.
    activity: item.activityService || item.name || '', 
    totalStaff: item.totalStaff || '', 
    csh: item.csh || '',
    extendedCsh: item.extendedCsh || '',
    pas: item.pas || '',
    siteName: item.siteName || '',
    interSiteAgreement: item.interSiteAgreement || ''
  }));
  
  // Disable the form initially when not editing
  this.cshForm.disable();

  // Force change detection (necessary for OnPush strategy)
  this.cdr.detectChanges();
}
}


