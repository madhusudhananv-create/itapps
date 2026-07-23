import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  SimpleChanges,
} from "@angular/core";
import {
  CriticalBusinessProcessData,
  ActivityServiceEntry,
} from "../section1/critical-business-process.component";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormsModule,
  AbstractControl,
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";

export interface MinimumOperationalRequirementData {
  operational: any[];
  resource: any[];
}

@Component({
  selector: "bcp-minimum-operational-requirement",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,


  templateUrl: './minimum-operational-requirement.component.html',
  styleUrl: './minimum-operational-requirement.component.scss'
  // --- STYLES END ---
})
export class MinimumOperationalRequirementComponent
  implements OnInit, OnDestroy
{
  // Auto-save logic: called on value changes
  private autoSaveSubscription: any;

  @Input() section1Data?: CriticalBusinessProcessData;
  @Input() initialData?: MinimumOperationalRequirementData;
  @Input() mode: "view" | "edit" = "edit";
  // Total staff count N from Section 5
  //@Input() totalStaffFromSection5?: number;
  @Output() dataChange = new EventEmitter<any>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Input() dataFromSection1?: any[] = [];
  viewReady = true;
  operationalDisplayedColumns: string[] = [
    "project",
    "operationalRequirement",
    "count",
    "actions",
  ];
  resourceDisplayedColumns: string[] = [
    "project",
    "resourceRequirement",
    "count",
    "actions",
  ];

  operationalTableData: any[] = [];
  resourceTableData: any[] = [];

  allActivities: string[] = [];
  @Input() totalStaffMap: { [activity: string]: number } = {};
  morForm: FormGroup;
  private destroy$ = new Subject<void>();

  operationalOptions = [
    "Logical Access",
    "Operating hours",
    "Physical Access to alterante location",
    "Recovery facility security details",
    "Restricted Access Provisions for Delivery Floor",
    "Technology platforms used in platforms",
    "Workarounds",
    "Travel arrangements to recovery site",
    "VISA requirements",
    "Intranet",
    "Training/knowledge transfer",
    "Skills - Development",
    "Skills - Support",
    "Skills - Technology",
    "Skills - Testing",
    "Skills - Project Management",
    "Software â€“ Apps required for recovery",
    "Other/specify",
  ];

  resourceOptions = [
    "Hardware (Shredder, Laptops)",
    "Network VPN",
    "Network Remote Access",
    "Network Special Requirement(specify)",
    "Secure Tokens (RSA, OTP)",
    "Work Area IP Ports",
    "Work Area Seats",
    "Internet Mobile Connection, Data Cards",
    "Other/specify",
  ];

  // Search controls for checkbox lists
  operationalSearchControl = new FormControl('');
  resourceSearchControl = new FormControl('');

  // Tooltip maps
  private operationalTooltipMap: { [key: string]: string } = {
    'Logical Access': 'System and application access permissions',
    'Physical Access': 'Access to physical facilities and locations',
    'Physical Access to alterante location': 'Access to alternate recovery location',
    'Operating hours': 'Required operational hours for recovery',
    'Recovery facility security details': 'Security requirements at recovery facility',
    'Restricted Access Provisions for Delivery Floor': 'Access restrictions on delivery floor',
    'Technology platforms used in platforms': 'Technology systems needed for operations',
    'Workarounds': 'Manual workarounds when systems are unavailable',
    'Travel arrangements to recovery site': 'Travel logistics to recovery site',
    'VISA requirements': 'Visa and travel documentation requirements',
    'Intranet': 'Internal network access requirements',
    'Training/knowledge transfer': 'Training needed for recovery operations',
    'Skills - Development': 'Development skills required',
    'Skills - Support': 'Support skills required',
    'Skills - Technology': 'Technology skills required',
    'Skills - Testing': 'Testing skills required',
    'Skills - Project Management': 'Project management skills required',
    'Software – Apps required for recovery': 'Software applications needed for recovery',
    'Other/specify': 'Other operational requirements',
  };

  private resourceTooltipMap: { [key: string]: string } = {
    'Hardware (Shredder, Laptops)': 'Physical hardware equipment needed',
    'Network VPN': 'VPN access for remote connectivity',
    'Network Remote Access': 'Remote access infrastructure',
    'Network Special Requirement(specify)': 'Special network requirements',
    'Secure Tokens (RSA, OTP)': 'Security authentication tokens',
    'Work Area IP Ports': 'Network ports at work area',
    'Work Area Seats': 'Physical seating at recovery location',
    'Internet Mobile Connection, Data Cards': 'Mobile internet connectivity',
    'Other/specify': 'Other resource requirements',
  };

  get filteredOperationalOptions(): string[] {
    const search = (this.operationalSearchControl.value || '').toLowerCase();
    if (!search) return this.operationalOptions;
    return this.operationalOptions.filter(opt => opt.toLowerCase().includes(search));
  }

  get filteredResourceOptions(): string[] {
    const search = (this.resourceSearchControl.value || '').toLowerCase();
    if (!search) return this.resourceOptions;
    return this.resourceOptions.filter(opt => opt.toLowerCase().includes(search));
  }

  isOperationalSelected(option: string): boolean {
    const current: string[] = this.morForm.get('operational')?.value || [];
    return current.includes(option);
  }

  toggleOperationalOption(option: string, checked: boolean): void {
    const control = this.morForm.get('operational');
    const current: string[] = control?.value ? [...control.value] : [];
    if (checked) {
      if (!current.includes(option)) current.push(option);
    } else {
      const idx = current.indexOf(option);
      if (idx > -1) current.splice(idx, 1);
    }
    control?.setValue(current);
    control?.markAsTouched();
  }

  removeOperationalItem(option: string): void {
    this.toggleOperationalOption(option, false);
  }

  clearOperationalSearch(): void {
    this.operationalSearchControl.setValue('');
  }

  isResourceSelected(option: string): boolean {
    const current: string[] = this.morForm.get('resource')?.value || [];
    return current.includes(option);
  }

  toggleResourceOption(option: string, checked: boolean): void {
    const control = this.morForm.get('resource');
    const current: string[] = control?.value ? [...control.value] : [];
    if (checked) {
      if (!current.includes(option)) current.push(option);
    } else {
      const idx = current.indexOf(option);
      if (idx > -1) current.splice(idx, 1);
    }
    control?.setValue(current);
    control?.markAsTouched();
  }

  removeResourceItem(option: string): void {
    this.toggleResourceOption(option, false);
  }

  clearResourceSearch(): void {
    this.resourceSearchControl.setValue('');
  }

  getOperationalTooltip(option: string): string {
    return this.operationalTooltipMap[option] || option;
  }

  getResourceTooltip(option: string): string {
    return this.resourceTooltipMap[option] || option;
  }

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.morForm = this.fb.group({
      operational: [[], Validators.required],
      resource: [[]],
    });
  }

  /** * Adds a new row of the SAME activity below the index row.
   */
  private addNewRowForActivity(
    index: number,
    dataSource: any[],
    requirementField: "operationalRequirement" | "resourceRequirement",
  ): void {
    const rowToDuplicate = dataSource[index];
    const activityName = rowToDuplicate.project;

    /* if (!this.canAddNewRow(dataSource, activityName)) {
      console.warn(`Cannot add row for ${activityName}. Limit reached by row count or staff allocation.`);
      return;
    } */

    const newRow = {
      project: activityName,
      [requirementField]: [],
      otherOperationalText: "",
      otherResourceText: "",
      count: 1, // Defaulting count to 1 for new rows
      isEditing: true,
      isNewRow: false,
      countError: null as string | null,
    };

    // Insert the new row directly after the row being acted upon
    const tempArray = [...dataSource];
    tempArray.splice(index + 1, 0, newRow);

    // Reassign data source to trigger change detection
    if (dataSource === this.operationalTableData) {
      this.operationalTableData = tempArray;
    } else {
      this.resourceTableData = tempArray;
    }

    this.validateCount(newRow);
    this.morForm.updateValueAndValidity();
    this.validityChange.emit(this.morForm.valid);
    this.cdr.detectChanges();
  }

  // Operational Table Action (Add Row)
  addRowForOperational(index: number) {
    this.addNewRowForActivity(
      index,
      this.operationalTableData,
      "operationalRequirement",
    );
  }

  // Resource Table Action (Add Row)
  addRowForResource(index: number) {
    this.addNewRowForActivity(
      index,
      this.resourceTableData,
      "resourceRequirement",
    );
  }

  // --- LIFECYCLE AND VALIDATION ---

  private validateMinimumRequirements(
    control: AbstractControl,
  ): { [key: string]: any } | null {
    // Debug log for troubleshooting validity

    // 1. Check Operational Data Validity
    const isOperationalDataValid =
      this.operationalTableData.length > 0 &&
      this.operationalTableData.every(
        (row) =>
          row.operationalRequirement &&
          (Array.isArray(row.operationalRequirement)
            ? row.operationalRequirement.length > 0
            : row.operationalRequirement) &&
          !row.countError,
      );

    // 2. Check Resource Data Validity
    const isResourceDataValid =
      this.resourceTableData.length > 0 &&
      this.resourceTableData.every(
        (row) =>
          row.resourceRequirement &&
          (Array.isArray(row.resourceRequirement)
            ? row.resourceRequirement.length > 0
            : row.resourceRequirement) &&
          !row.countError,
      );

    // 3. Validate all counts against Total Staff (copied from existing code)
    const allCountsValid = [
      ...this.operationalTableData,
      ...this.resourceTableData,
    ].every((row) => {
      if (
        this.totalStaffMap[row.project] !== undefined &&
        this.totalStaffMap[row.project] !== null
      ) {
        const count = Number(row.count);
        const totalStaff = Number(this.totalStaffMap[row.project]);
        return isNaN(count) || isNaN(totalStaff) || count <= totalStaff;
      }
      return true;
    });

    if (!isOperationalDataValid || !isResourceDataValid || !allCountsValid) {
      console.warn("Section 6 validity failed:", {
        isOperationalDataValid,
        isResourceDataValid,
        allCountsValid,
      });
      return {
        minimumRequired:
          "Requires at least one selected requirement in all rows of both tables and valid counts.",
      };
    }

    return null;
  }

  ngOnInit(): void {
    if (
      this.section1Data &&
      this.section1Data.services &&
      this.section1Data.services.length > 0
    ) {
      this.allActivities = this.section1Data.services.map(
        (service: ActivityServiceEntry) => service.activityService,
      );
    } else {
      this.allActivities = ["Autofill from section 1"];
    }

    // Load initial data into form controls if provided
    if (this.initialData) {
      this.morForm.get('operational')?.setValue(this.initialData.operational || []);
      this.morForm.get('resource')?.setValue(this.initialData.resource || []);
    } else {
      this.morForm.get('operational')?.setValue([]);
      this.morForm.get('resource')?.setValue([]);
    }

    this.initializeTableData(
      this.operationalTableData,
      "operationalRequirement",
    );
    this.initializeTableData(this.resourceTableData, "resourceRequirement");

    //this.morForm.setValidators(this.validateMinimumRequirements.bind(this));

    this.morForm.updateValueAndValidity();
    //this.validityChange.emit(this.morForm.valid);

    // Subscribe to search control changes
    this.operationalSearchControl.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());

    this.resourceSearchControl.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());

    // Auto-save: subscribe to value changes and call saveSection
    this.autoSaveSubscription = this.morForm.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.saveSection();
      });
  }

  // Auto-save logic: save section and emit data/validity
  /* saveSection(): void {
    this.morForm.updateValueAndValidity();
    if (this.morForm.valid) {
      this.dataChange.emit(this.serialize());
      this.validityChange.emit(true);
    } else {
      // Mark all as touched to show errors
      Object.values(this.morForm.controls).forEach(control => control.markAsTouched());
      this.validityChange.emit(false);
    }
    this.cdr.markForCheck();
  } */

  saveSection() {
  const { operationalRequirements = [], resourceRequirements = [] } =
    this.serialize() || {};

  let isValid = true;


  if (
    !operationalRequirements.length ||
    !resourceRequirements.length
  ) {
    isValid = false;
  }

  const isValidArray = (arr: any[], requiredFields: string[]) => {
    return arr.every(item =>
      requiredFields.every(field =>
        item[field] !== null &&
        item[field] !== undefined &&
        item[field] !== ''
      )
    );
  };


  if (isValid) {
    const operationalValid = isValidArray(
      operationalRequirements,
      ['operationalRequirement', 'count']
    );

    const resourceValid = isValidArray(
      resourceRequirements,
      ['resourceRequirement', 'count']
    );

    isValid = operationalValid && resourceValid;
  }


  this.validityChange.emit(isValid);

  if (!isValid) {
    console.warn('Validation failed');
    return;
  }


}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.viewReady = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["section1Data"]?.currentValue && this.viewReady) {
      this.fillFromSection1(changes["section1Data"]?.currentValue);
    }
    // Handle changes to totalStaffMap - revalidate all counts
    if (changes["totalStaffMap"]) {
      // Revalidate limits for Add buttons and status display
      this.cdr.markForCheck();

      // Revalidate count inputs
      [...this.operationalTableData, ...this.resourceTableData].forEach(
        (row) => {
          this.validateCount(row);
        },
      );
      this.morForm.updateValueAndValidity();
      this.validityChange.emit(this.morForm.valid);
    }
  }

  private initializeTableData(
    dataSource: any[],
    requirementField: string,
  ): void {
    dataSource.splice(0, dataSource.length);

    // Filter the services array to only include entries where 'activityService' has content
    const actualServices =
      this.section1Data?.services?.filter((service: ActivityServiceEntry) =>
        service.activityService?.trim(),
      ) || []; // Use empty array if nothing is found/filtered out

    const hasActualData = actualServices.length > 0;

    /* const hasSection1Data = this.section1Data && 
                          this.section1Data.services && 
                          this.section1Data.services.length > 0; */

    if (hasActualData) {
      dataSource.push(
        ...this.section1Data!.services!.map((service: ActivityServiceEntry) => {
          const row = {
            project: service.activityService,
            [requirementField]: [],
            otherOperationalText: "",
            otherResourceText: "",
            count: 0, // Initial count set to 0
            isEditing: true,
            countError: null as string | null,
          };
          this.validateCount(row);
          return row;
        }),
      );
    }

    this.morForm.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  // Operational Table Delete
  deleteRow(index: number) {
    const tempArray = [...this.operationalTableData];
    tempArray.splice(index, 1);
    this.operationalTableData = tempArray;

    this.morForm.updateValueAndValidity();
    this.validityChange.emit(this.morForm.valid);
    this.cdr.detectChanges();
  }

  // Resource Table Delete
  deleteResourceRow(index: number) {
    const tempArray = [...this.resourceTableData];
    tempArray.splice(index, 1);
    this.resourceTableData = tempArray;

    this.morForm.updateValueAndValidity();
    this.validityChange.emit(this.morForm.valid);
    this.cdr.detectChanges();
  }

  // These are not used in the new UI but are kept for completeness in the file
  toggleEditMode(row: any) {
    row.isEditing = !row.isEditing;
    this.morForm.updateValueAndValidity();
    this.validityChange.emit(this.morForm.valid);
    this.cdr.markForCheck();
  }
  editRow(index: number) {
    this.toggleEditMode(this.operationalTableData[index]);
  }
  editResourceRow(index: number) {
    this.toggleEditMode(this.resourceTableData[index]);
  }

  validateCount(row: any): void {
    const count = Number(row.count);
    const allowedCount = this.totalStaffMap[row.project] || 0;
    if (allowedCount !== undefined && !isNaN(count) && count > allowedCount) {
      // Validation 1: Individual row count must be <= Total Staff
      row.countError = `Count cannot exceed Total Staff (${allowedCount} for ${row.project})`;
    } else {
      row.countError = null;
    }

    // No explicit check for sum of counts here, as form validator handles that globally,
    // but the template logic updates based on the sum immediately via the change detection cycle.

    this.morForm.updateValueAndValidity();
    this.validityChange.emit(this.morForm.valid);
    this.cdr.markForCheck();
  }

  private serialize(): any {
    return {
      operational: this.morForm.get('operational')?.value || [],
      resource: this.morForm.get('resource')?.value || [],
      operationalRequirements: this.operationalTableData,
      resourceRequirements: this.resourceTableData,
    };
  }

  fillFromSection1(data: any) {
    let originalData = data.services || data;
    const allFieldsEmpty = Object.values(originalData[0]).every(
      (val) =>
        val === "" ||
        (typeof val === "string" && val.trim() === "") ||
        val === null ||
        val === undefined ||
        val === 0 ||
        (Array.isArray(val) && val.length === 0),
    );

    const isValid = !(originalData.length === 1 && allFieldsEmpty);
    //  Ensure originalData is a non-empty array
    if (!Array.isArray(originalData) || originalData.length === 0 || !isValid) {
      this.operationalTableData = [];
      this.resourceTableData = []; // Set data source to an empty array
      this.morForm.disable();
      this.cdr.detectChanges();
      return; // Exit the function immediately
    }

    let nextId = 1;

    this.operationalTableData = originalData.map((item: any, index: number) => {
      const row = {
        project: item.activityService,
        operationalRequirement: [],
        otherOperationalText: "",
        count: 1,
        isEditing: true,
        countError: null as string | null,
      };
      this.validateCount(row);
      return row;
    });
    this.morForm.updateValueAndValidity();
    this.validityChange.emit(this.morForm.valid);
    this.cdr.markForCheck();

    this.resourceTableData = originalData.map((item: any, index: number) => {
      const row = {
        project: item.activityService,
        resourceRequirement: [],
        otherResourceText: "",
        count: 1,
        isEditing: true,
        countError: null as string | null,
      };
      this.validateCount(row);
      return row;
    });
    this.morForm.updateValueAndValidity();
    this.validityChange.emit(this.morForm.valid);
    this.cdr.markForCheck();
  }

  public validateDuplicateRequirement(
    row: any,
    dataSource: any[],
    requirementField: string,
  ): void {
    const selectedRequirement = row[requirementField];
    const activityName = row.project;

    if (!selectedRequirement || selectedRequirement.length === 0) {
      row.duplicateError = null;
      return;
    }

    // Check if the requirement is already used in another row for the same activity
    const isDuplicate = dataSource.some((otherRow) => {
      // 1. Must be a different row instance
      // 2. Must be the same activity
      // 3. Must have the same selected requirement value
      return (
        otherRow !== row &&
        otherRow.project === activityName &&
        otherRow[requirementField] === selectedRequirement
      );
    });

    if (isDuplicate) {
      row.duplicateError =
        "This requirement has already been assigned to this activity.";
    } else {
      row.duplicateError = null;
    }

    this.morForm.updateValueAndValidity();
    this.validityChange.emit(this.morForm.valid);
    this.cdr.markForCheck();
  }
}
