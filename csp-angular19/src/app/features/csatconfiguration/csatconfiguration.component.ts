import { Component, OnInit, ViewChild, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, map, startWith } from 'rxjs';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { CssProjectSelectionListModel } from '../../models/css-project-selection-list-model';
import { EmpInfoModel } from '../../models/emp-info-model';
import { WarningPopupComponent, WarningPopupData } from '../../shared/components/warning-popup/warning-popup.component';
// NavbarNewComponent removed - not needed in standalone component with modern routing

@Component({
  selector: 'app-csatconfiguration',
  templateUrl: './csatconfiguration.component.html',
  styleUrls: ['./csatconfiguration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatCheckboxModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    NavbarNewComponent
  ]
})
export class CsatconfigurationComponent implements OnInit {
  csatList: CssProjectSelectionListModel[] = [];
  configurationData: any = {};
  step1Form!: FormGroup; // Definite assignment assertion - initialized in ngOnInit
  batchCycles: any;
  selectedBatchCycle = '';
  batchId: number = 0;
  rejectionReasons: string[] = [];
  allSpocs: any[] = [];
  allRespondents: any[] = [];
  step1ProjectList: any[] = [];
  filteredProjectList: any[] = [];
  searchText: string = '';
  validationData: any[] = [];
  originalValidationData: any[] = []; // Track original data for change detection
  deletedRecords: any[] = []; // Track deleted records
  validationSearchText: string = '';
  isLoading: boolean = false;
  dpId: string = localStorage.getItem('empid') || '';
  bulkReasonProject = '';
  uniqueCustIds: any[] = [];
  projectSelection = new SelectionModel<any>(true, []);
  filteredOptions: Observable<EmpInfoModel[]> = new Observable();
  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  private isReset: boolean = false;

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(
    private _formBuilder: FormBuilder,
    private _appservice: AppsService,
    public _util: MyUtility,
    media: MediaMatcher,
    private _cdRef: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this._cdRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  /**
   * Show warning popup instead of alert
   */
  showWarning(message: string, title: string = 'Warning', icon: string = 'warning'): void {
    this.dialog.open(WarningPopupComponent, {
      width: '400px',
      data: {
        Message: message,
        title: title,
        icon: icon,
        isConfirmation: false
      } as WarningPopupData
    });
  }

  /**
   * Show confirmation popup and return user's choice
   */
  showConfirmation(message: string, title: string = 'Confirm', icon: string = 'help_outline'): Promise<boolean> {
    const dialogRef = this.dialog.open(WarningPopupComponent, {
      width: '450px',
      data: {
        Message: message,
        title: title,
        icon: icon,
        isConfirmation: true,
        confirmText: 'OK',
        cancelText: 'Cancel'
      } as WarningPopupData
    });

    return dialogRef.afterClosed().toPromise().then(result => result === true);
  }

  ngOnInit() {
    this.step1Form = this._formBuilder.group({ valid: [''] });
    this.bindMasterData();
    this.LoadData();
  }

  onStepChange(event: any) {
    // Auto-save any currently editing row in validation step before changing steps
    const currentlyEditingRow = this.validationData.find(r => r.isEditing);
    if (currentlyEditingRow && this.isRowValid(currentlyEditingRow)) {
      this.saveRow(currentlyEditingRow);
    }
    
    if (event.selectedIndex === 1) {
      const hasSelectedProjects = this.step1ProjectList.some(p => p.chosen === 'Yes');    
      if (hasSelectedProjects && this.validationData.length === 0) {
        this.loadValidationData();
      }
    }
  }

  getFilteredSpocs(row: any): any[] {
    const searchText = row.csatSpoc;
    if (!searchText) {
      return this.empinfo;
    }
    const filterValue = (typeof searchText === 'string')
      ? searchText.toLowerCase()
      : (searchText.emaiL_ID ? searchText.emaiL_ID.toLowerCase() : '');
    // Filter the list where Email contains the typed text
    return this.empinfo.filter(option =>
      option.emaiL_ID && option.emaiL_ID.toLowerCase().includes(filterValue)
    );
  }

  LoadData() {
    this.service_GetEmpInfo();
  }

  service_GetEmpInfo() {
    this._appservice.getEmpInfo().subscribe({
      next: (data) => {
        this.empinfo = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  bindMasterData() {
    this.isLoading = true;
    this._appservice.getActiveCurrentBatch().subscribe({
      next: (data) => {
        this.batchCycles = data;
        this.selectedBatchCycle = this.batchCycles.batch_name;
        this.batchId = this.batchCycles.batch_id;

        this._appservice.getDropdownOptions('REJECTION_REASON').subscribe({
          next: (options: any[]) => {
            this.rejectionReasons = options.map(opt => opt.dD_TEXT);

            this._appservice.getCSATListforDP(this.dpId, this.batchId).subscribe({
              next: (csatData) => {
                this.csatList = csatData;
                this.loadProjects();
                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error fetching CSAT list', error);
                this.isLoading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error fetching rejection reasons', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error fetching batch cycles', error);
        this.isLoading = false;
      }
    });
  }

  // --- STEP 1 ---
  loadProjects() {
    this.step1ProjectList = [];
    this.projectSelection.clear();

    this.csatList.forEach(dbRow => {
      const isSelectedInDb = (dbRow.iS_SELECTED === true);
      const newProj = {
        custId: dbRow.cusT_ID,
        projId: dbRow.proJ_ID,
        account: dbRow.cusT_NM,
        accountHeadcount: dbRow.accounT_HEAD_COUNT,
        name: dbRow.proJ_NM,
        headcount: dbRow.projecT_HEAD_COUNT,
        projectStatus: dbRow.proJ_STATUS,
        executionType: dbRow.executioN_TYPE,
        engagementType: dbRow.engagamenT_TYPE,
        Spoc: dbRow.csaT_SPOC,
        SpocEmail: dbRow.csaT_SPOC_EMAIL,
        chosen: dbRow.iS_SELECTED ? 'Yes' : 'No',
        reasonNotChosen: '',
        isValid: true,
      };

      if (isSelectedInDb) {
        // Set view to Yes, but do NOT auto-select the checkbox (checkbox is for bulk tools now)
        newProj.chosen = 'Yes';
      } else {
        newProj.chosen = 'No';
        if (dbRow.reason) {
          newProj.reasonNotChosen = dbRow.reason;
        }
      }
      this.step1ProjectList.push(newProj);
    });
    
    // Initialize filtered list with all projects
    this.filteredProjectList = [...this.step1ProjectList];
  }

  isAllProjectsSelected() {
    return this.filteredProjectList.length > 0 && 
           this.projectSelection.selected.length === this.filteredProjectList.length;
  }

  masterToggleProjects() {
    // Only toggles checkboxes. Does NOT change 'chosen' status or reasons.
    if (this.isAllProjectsSelected()) {
      // Deselect all filtered projects
      this.filteredProjectList.forEach(p => {
        this.projectSelection.deselect(p);
      });
    } else {
      // Select all filtered projects
      this.filteredProjectList.forEach(p => {
        this.projectSelection.select(p);
      });
    }
  }

  toggleProjectSelection(proj: any) {
    // Only toggles the checkbox for bulk operations.
    // Does NOT auto-change 'Yes'/'No' dropdown.
    this.projectSelection.toggle(proj);
  }

  clearStep1() {
    this.projectSelection.clear();
    this.step1ProjectList.forEach(proj => {
      proj.reasonNotChosen = '';
      proj.chosen = 'No';
      proj.isValid = true;
    });
    this.bulkReasonProject = '';
  }

  applyFilter() {
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredProjectList = [...this.step1ProjectList];
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredProjectList = this.step1ProjectList.filter(proj => {
      return (
        (proj.account && proj.account.toLowerCase().includes(searchLower)) ||
        (proj.name && proj.name.toLowerCase().includes(searchLower)) ||
        (proj.projectStatus && proj.projectStatus.toLowerCase().includes(searchLower)) ||
        (proj.executionType && proj.executionType.toLowerCase().includes(searchLower)) ||
        (proj.engagementType && proj.engagementType.toLowerCase().includes(searchLower)) ||
        (proj.reasonNotChosen && proj.reasonNotChosen.toLowerCase().includes(searchLower))
      );
    });
  }

  clearFilter() {
    this.searchText = '';
    this.filteredProjectList = [...this.step1ProjectList];
  }

  applyBulkReasonProject() {
    if (!this.bulkReasonProject) return;

    // Apply reason to SELECTED (Checked) projects
    // And set their status to "No"
    this.step1ProjectList.forEach(proj => {
      if (this.projectSelection.isSelected(proj)) {
        proj.reasonNotChosen = this.bulkReasonProject;
        proj.chosen = 'No';
        proj.isValid = true;
      }
    });
  }

  goForwardStep1(stepper: MatStepper) {
    let isFormValid = true;
    let hasHighHeadcountNoSelection = false;

    // Validate Row-by-Row
    this.step1ProjectList.forEach(proj => {
      // Reset validity initially so previous errors clear if fixed
      proj.isValid = true;

      // Check: If Chosen is 'No' AND Reason is empty
      if (proj.chosen === 'No' && !proj.reasonNotChosen) {
        proj.isValid = false; // This triggers the RED highlight on the Reason column
        isFormValid = false;  // This flags the whole form as invalid
      }
      if (proj.chosen === 'No' && proj.accountHeadcount >= 10 && !proj.reasonNotChosen) {
        proj.isValid = false;
        hasHighHeadcountNoSelection = true;
      }
    });

    // Show warning for high headcount projects with no selection (only once)
    if (hasHighHeadcountNoSelection) {
      this.showWarning(
        "Please select at least one project for PCSAT with headcount >= 10",
        "Validation Error",
        "error"
      );
      return;
    }

    // Trigger Warning if validation failed
    if (!isFormValid) {
      this.showWarning(
        "Select reason for No",
        "Missing Information",
        "warning"
      );
      return; // Stops execution. UI updates immediately after this returns.
    }

    // --- Proceed to Save if Valid ---

    // Prepare Save Payload
    const projectsToSave = this.step1ProjectList.filter(proj =>
      proj.chosen === 'Yes' || (proj.chosen === 'No' && proj.reasonNotChosen)
    );

    const saveCSATData = projectsToSave.map(proj => {
      const isChosen = (proj.chosen === 'Yes');
      return {
        ID: 0,
        BATCH_ID: this.batchId,
        CUST_ID: proj.custId,
        PROJ_ID: proj.projId,
        DP_ID: this.dpId,
        IS_SELECTED: isChosen,
        REASON: isChosen ? null : proj.reasonNotChosen,
        ISACTIVE: true
      };
    });

    this._appservice.saveCSATListForDP(saveCSATData, this.dpId, this.batchId).subscribe({
      next: (response) => {
        stepper.next();
        this.loadValidationData();
      },
      error: (error) => {
        console.error('Error saving project selection', error);
      }
    });
  }

  // --- STEP 2 ---
  loadValidationData(skipFiltering: boolean = false) {
    this.isLoading = true;
    this._appservice.getCSATContactListForDP(this.dpId, this.batchId).subscribe({
      next: (data: any[]) => {
        console.log('Raw data from API:', data);
        
        let filteredData = data;
        
        // Only filter by step1ProjectList when initially loading, not after save
        if (!skipFiltering) {
          // Get list of project IDs that were chosen as 'Yes' in Step 1
          const selectedProjectIds = this.step1ProjectList
            .filter(p => p.chosen === 'Yes')
            .map(p => p.projId);
          
          console.log('Selected Project IDs:', selectedProjectIds);
          console.log('Step1 Project List:', this.step1ProjectList);
          
          // Filter validation data to only include projects chosen as 'Yes'
          filteredData = data.filter(row => 
            selectedProjectIds.includes(row.proJ_ID)
          );
        }
        
        console.log('Filtered data:', filteredData);
        
        this.validationData = filteredData.map(row => ({
          id: row.id,
          batchId: row.batcH_ID,
          custId: row.cusT_ID,
          projectId: row.proJ_ID,
          project: row.projecT_NAME || row.proJ_NM,
          respondentName: row.displaY_NAME,
          emailId: row.emaiL_ID,
          role: row.contacT_ROLE,
          predictedScore: row.predicteD_SCORE,
          reasonPrediction: row.predicteD_REASON,
          csatSpoc: row.spoc,
          csatSpocEmail: row.spoc_EMAIL,
          remarks: row.remarks || row.comments,
          isEditing: false,
          isNew: false,
          isValid: true,
          executionType: row.executioN_TYPE,
          engagementType: row.engagemenT_TYPE
        }));

        // Store deep copy of original data for change detection
        this.originalValidationData = JSON.parse(JSON.stringify(this.validationData));
        // Reset deleted records when loading fresh data
        this.deletedRecords = [];

        this.uniqueCustIds = Array.from(new Set(this.validationData.map(v => v.custId)));
        const step1CustIds = this.projectSelection.selected.map(p => p.custId);
        const combinedCustIds = Array.from(new Set([...this.uniqueCustIds, ...step1CustIds]));
        
        if (combinedCustIds.length > 0) {
          this._appservice.getContactListForCustIds(combinedCustIds).subscribe({
            next: (contacts: any[]) => {
              this.allRespondents = contacts;
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error fetching contacts', error);
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching validation list', error);
        this.isLoading = false;
      }
    });
  }

  getStep1SelectedProjects() {
    // Return projects marked as 'Yes' in the dropdown
    return this.step1ProjectList.filter(p => p.chosen === 'Yes');
  }

  /**
   * Handler when project status (Yes/No) changes
   * If Yes is selected, clear and disable the reason field
   */
  onProjectStatusChange(proj: any) {
    if (proj.chosen === 'Yes') {
      proj.reasonNotChosen = '';
      proj.isValid = true;
    }
  }

  addValidationRow() {
    // Auto-save any currently editing row if it's valid
    const currentlyEditingRow = this.validationData.find(r => r.isEditing);
    if (currentlyEditingRow && this.isRowValid(currentlyEditingRow)) {
      this.saveRow(currentlyEditingRow);
    }
    
    const newRow = {
      id: 0,
      batchId: this.batchId,
      projectObj: null,
      projectId: 0,
      custId: '',
      project: '',
      respondentName: '',
      emailId: '',
      role: '',
      predictedScore: null,
      reasonPrediction: '',
      csatSpoc: '',
      csatSpocEmail: '',
      remarks: '',
      isEditing: true,
      isNew: true,
      isValid: true,
      executionType: '',
      engagementType: '',
      _originalData: null
    };
    this.validationData.unshift(newRow);
  }

  onNewRowProjectSelected(row: any, project: any) {
    row.project = project.name;
    row.projectId = project.projId;
    row.custId = project.custId;
    row.csatSpoc = project.Spoc || '';
    row.csatSpocEmail = project.SpocEmail || '';
    row.respondentName = '';
    row.emailId = '';
    row.role = '';
  }

  getFilteredRespondents(row: any): any[] {
    if (!row.custId) return [];
    let relevantContacts = this.allRespondents.filter(c => c.customeR_ID === row.custId);
    const searchText = row.respondentName;
    if (!searchText || typeof searchText !== 'string') return relevantContacts;
    const filterValue = searchText.toLowerCase();
    return relevantContacts.filter(c =>
      (c.contacT_NAME && c.contacT_NAME.toLowerCase().includes(filterValue)) ||
      (c.contacT_EMAILID && c.contacT_EMAILID.toLowerCase().includes(filterValue))
    );
  }

  onRespondentSelected(row: any, event: any) {
    const selectedContact = event.option.value;
    row.respondentName = selectedContact.contacT_NAME;
    row.emailId = selectedContact.contacT_EMAILID;
    row.role = selectedContact.contacT_ROLE;
  }

  onSpocSelected(row: any, event: any) {
    const selectedEmp = event.option.value;
    if (selectedEmp) {
      row.csatSpoc = selectedEmp.email || selectedEmp.emaiL_ID || '';
    }
  }

  onSpocChange(row: any, newValue: any) {
    if (row._confirmedSpocName && newValue !== row._confirmedSpocName) {
      row.csatSpocEmail = '';
      row._confirmedSpocName = null;
    }
    if (!newValue || newValue === '') {
      row.csatSpocEmail = '';
      row._confirmedSpocName = null;
    }
  }

  editRow(row: any) {
    // Auto-save any currently editing row if it's valid
    const currentlyEditingRow = this.validationData.find(r => r.isEditing && r !== row);
    if (currentlyEditingRow && this.isRowValid(currentlyEditingRow)) {
      this.saveRow(currentlyEditingRow);
    }
    
    row.isEditing = true;
    row.isValid = true;
    row._originalData = { ...row };
  }

  cancelEdit(row: any) {
    if (row.isNew) {
      const index = this.validationData.indexOf(row);
      if (index > -1) {
        this.validationData.splice(index, 1);
      }
      return;
    }
    if (row._originalData) {
      Object.assign(row, row._originalData);
      delete row._originalData;
    }
    row.isEditing = false;
    row.isValid = true;
  }

  isRowValid(row: any): boolean {
    // Check mandatory fields first
    if (!row.respondentName ||
      row.predictedScore === null || row.predictedScore === undefined || row.predictedScore === '' ||
      !row.csatSpoc
    ) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if row has duplicate project + respondent combination
   */
  hasDuplicate(row: any): boolean {
    if (!row.emailId) return false;
    
    const duplicate = this.validationData.find(r => 
      r !== row && 
      r.projectId === row.projectId && 
      r.emailId && 
      r.emailId === row.emailId
    );
    
    return !!duplicate;
  }

  /**
   * Auto-save row when all mandatory fields are filled
   */
  autoSaveRow(row: any): void {
    if (this.isRowValid(row)) {
      row.isValid = true;
      row.isEditing = false;
      row.isNew = false;
      if (row._originalData) {
        delete row._originalData;
      }
    }
  }

  saveRow(row: any) {
    // First check mandatory fields
    if (!this.isRowValid(row)) {
      row.isValid = false;
      return;
    }
    
    // Then check for duplicate project + respondent combination
    if (this.hasDuplicate(row)) {
      this.showWarning(
        `This combination of Project and Respondent already exists in the table. Please select a different respondent.`,
        "Duplicate Entry",
        "error"
      );
      row.isValid = false;
      return;
    }
    
    row.isValid = true;
    row.isEditing = false;
    row.isNew = false;
    if (row._originalData) {
      delete row._originalData;
    }
  }

  async deleteRow(index: number) {
    // Auto-save any currently editing row if it's valid (before deletion)
    const currentlyEditingRow = this.validationData.find(r => r.isEditing && this.validationData.indexOf(r) !== index);
    if (currentlyEditingRow && this.isRowValid(currentlyEditingRow)) {
      this.saveRow(currentlyEditingRow);
    }
    
    const rowToDelete = this.validationData[index];
    const projectId = rowToDelete.projectId;

    // 1. Check if this is the LAST row for this specific project
    const remainingRows = this.validationData.filter((r, i) =>
      i !== index && r.projectId === projectId
    );

    // 2. If it is the last row, we are effectively deselecting the project
    if (remainingRows.length === 0) {
      const confirmDelete = await this.showConfirmation(
        `Removing this row will deselect project "${rowToDelete.project}" from PCSAT.\n\nYou will be redirected to Step 1 to provide a mandatory rejection reason.`,
        'Confirm Deletion',
        'warning'
      );

      if (!confirmDelete) return;

      // 3. Find the project in Step 1 and update its status
      const step1Proj = this.step1ProjectList.find(p => p.projId === projectId);
      if (step1Proj) {
        step1Proj.chosen = 'No';          // Mark as No
        step1Proj.reasonNotChosen = '';   // Clear reason (force selection)
        step1Proj.isValid = false;        // Mark invalid to trigger RED highlight in Step 1
      }

      // 4. Remove the row from the Step 2 view
      this.validationData.splice(index, 1);

      // 5. Navigate back to Step 1 so user can select the reason
      setTimeout(() => {
        this.stepper.selectedIndex = 0; // Go to Step 1
      }, 100);

    } else {
      // If other rows exist for this project, just delete this single row
      // Track deletion if the row has an ID (existing record in database)
      if (rowToDelete.id > 0) {
        this.deletedRecords.push(rowToDelete);
      }
      this.validationData.splice(index, 1);
    }
  }

  saveFinalList() {
    // Auto-save any currently editing row if it's valid before final submission
    const currentlyEditingRow = this.validationData.find(r => r.isEditing);
    if (currentlyEditingRow && this.isRowValid(currentlyEditingRow)) {
      this.saveRow(currentlyEditingRow);
    }
    
    // Validate all rows and build error message with specifics
    let hasError = false;
    const invalidRows: string[] = [];
    
    this.validationData.forEach((row, index) => {
      const missingFields: string[] = [];
      
      if (!row.respondentName) missingFields.push('Respondent');
      if (row.predictedScore === null || row.predictedScore === undefined || row.predictedScore === '') {
        missingFields.push('Prediction Score');
      }
      if (!row.csatSpoc) missingFields.push('CSAT SPOC');
      
      if (missingFields.length > 0) {
        hasError = true;
        row.isValid = false;
        row.isEditing = true; // Keep in edit mode to show errors
        invalidRows.push(`Row ${index + 1} (${row.project}): ${missingFields.join(', ')}`);
      } else {
        row.isValid = true;
      }
    });
    
    if (hasError) {
      const errorMessage = invalidRows.length <= 5 
        ? `Please fill mandatory fields:\n\n${invalidRows.join('\n')}`
        : `${invalidRows.length} rows have missing mandatory fields. Please scroll through the table and fill:\n- Respondent\n- Prediction Score\n- CSAT SPOC`;
      
      this.showWarning(
        errorMessage,
        "Missing Mandatory Fields",
        "error"
      );
      return;
    }

    this.isLoading = true;

    // Detect modified records (new or changed)
    const modifiedRecords = this.validationData.filter(row => {
      if (row.id === 0 || row.isNew) {
        return true; // New record
      }
      // Find original record
      const original = this.originalValidationData.find(orig => orig.id === row.id);
      if (!original) return true; // Shouldn't happen, but treat as new
      
      // Check if any field changed
      return (
        row.respondentName !== original.respondentName ||
        row.emailId !== original.emailId ||
        row.predictedScore !== original.predictedScore ||
        row.reasonPrediction !== original.reasonPrediction ||
        row.csatSpoc !== original.csatSpoc ||
        row.csatSpocEmail !== original.csatSpocEmail ||
        (row.remarks || '') !== (original.remarks || '')
      );
    });

    // Prepare payload for modified records
    const modifiedPayload = modifiedRecords.map(row => ({
      ID: row.id,
      BATCH_ID: row.batchId,
      CUST_ID: row.custId,
      PROJ_ID: row.projectId,
      DISPLAY_NAME: row.respondentName,
      EMAIL_ID: row.emailId,
      PREDICTED_SCORE: row.predictedScore,
      PREDICTED_REASON: row.reasonPrediction,
      SPOC: row.csatSpoc,
      SPOC_EMAIL: row.csatSpocEmail,
      REMARKS: row.remarks,
      ISACTIVE: true,
      IS_VERIFIED: true,
      STATUS: 'CREATED'
    }));

    // Prepare payload for deleted records
    const deletedPayload = this.deletedRecords.map(row => ({
      ID: row.id,
      BATCH_ID: row.batchId,
      CUST_ID: row.custId,
      PROJ_ID: row.projectId,
      DISPLAY_NAME: row.respondentName,
      EMAIL_ID: row.emailId,
      PREDICTED_SCORE: row.predictedScore,
      PREDICTED_REASON: row.reasonPrediction,
      SPOC: row.csatSpoc,
      SPOC_EMAIL: row.csatSpocEmail,
      REMARKS: row.remarks,
      ISACTIVE: false
    }));

    // Only call API if there are changes
    if (modifiedPayload.length === 0 && deletedPayload.length === 0) {
      this.showWarning(
        "No changes detected. Nothing to save.",
        "No Changes",
        "info"
      );
      this.isLoading = false;
      return;
    }

    this._appservice.saveCSATContactListForDP(modifiedPayload, deletedPayload, this.dpId, this.batchId).subscribe({
      next: (res) => {
        this.showWarning(
          "Data saved successfully.",
          "Success",
          "check_circle"
        );
        this.isLoading = false;
        // Skip filtering when reloading after save - show all active records
        this.loadValidationData(true);
      },
      error: (err) => {
        console.error("Save Error:", err);
        let errorMessage = "An error occurred while saving. Please check the console for details.";
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        }
        this.showWarning(errorMessage, "Error", "error");
        this.isLoading = false;
      }
    });
  }

  displayRespondentFn(respondent: any): string {
    return respondent && respondent.contacT_NAME ? respondent.contacT_NAME : respondent;
  }

  displayFn(user: any): string {
    if (!user) return '';
    if (typeof user === 'string') {
      return user;
    }
    return user.emaiL_ID ? user.emaiL_ID : '';
  }

  clearValidationSearch(): void {
    this.validationSearchText = '';
  }

  refreshValidationData(): void {
    this.loadValidationData();
  }

  async refreshContacts(): Promise<void> {
    // 1. Show Confirmation Dialog
    const confirmRefresh = await this.showConfirmation(
      "Any unsaved changes in the grid might be lost if you proceed.\n\nAre you sure you want to refresh the contacts list?",
      "Confirm Refresh",
      "help_outline"
    );
    
    if (!confirmRefresh) return;

    // 2. Proceed with Refresh Logic
    this.isLoading = true;
    
    const step2CustIds = this.validationData.map(v => v.custId);
    const step1CustIds = this.projectSelection.selected.map(p => p.custId);
    const combinedCustIds = Array.from(new Set([...step2CustIds, ...step1CustIds]));
    
    if (combinedCustIds.length > 0) {
      this._appservice.getContactListForCustIds(combinedCustIds).subscribe({
        next: (contacts: any[]) => {
          this.allRespondents = contacts;
          this.isLoading = false;
          this.showWarning(
            'Respondents list refreshed successfully!',
            'Success',
            'check_circle'
          );
        },
        error: (error) => {
          console.error('Error refreshing contacts', error);
          this.isLoading = false;
          this.showWarning(
            'Failed to refresh contacts. Please try again.',
            'Error',
            'error'
          );
        }
      });
    } else {
      this.isLoading = false;
      this.showWarning(
        'No customers selected to refresh.',
        'Information',
        'info'
      );
    }
  }

  validateScore(row: any): void {
    if (this.isReset) {
      return;
    }

    if (row.predictedScore > 5) {
      this.isReset = true;
      this.showWarning("Predicted score cannot be more than 5", "Validation Error", "warning");
      row.predictedScore = 5;
      setTimeout(() => {
        this.isReset = false;
      }, 100);
    }
    else if (row.predictedScore < 1) {
      this.isReset = true;
      this.showWarning("Predicted score cannot be less than 1", "Validation Error", "warning");
      row.predictedScore = 1;
      setTimeout(() => {
        this.isReset = false;
      }, 100);
    }
  }

  getFilteredValidationData(): any[] {
    if (!this.validationSearchText || this.validationSearchText.trim() === '') {
      return this.validationData;
    }
    
    const searchLower = this.validationSearchText.toLowerCase();
    return this.validationData.filter(row => {
      return (
        (row.project && row.project.toLowerCase().includes(searchLower)) ||
        (row.respondentName && row.respondentName.toLowerCase().includes(searchLower)) ||
        (row.respondentRole && row.respondentRole.toLowerCase().includes(searchLower)) ||
        (row.respondentEmail && row.respondentEmail.toLowerCase().includes(searchLower)) ||
        (row.csatSpoc && row.csatSpoc.toLowerCase().includes(searchLower)) ||
        (row.csatSpocEmail && row.csatSpocEmail.toLowerCase().includes(searchLower)) ||
        (row.remarks && row.remarks.toLowerCase().includes(searchLower)) ||
        (row.executionType && row.executionType.toLowerCase().includes(searchLower)) ||
        (row.engagementType && row.engagementType.toLowerCase().includes(searchLower))
      );
    });
  }

  downloadPCSATReadyReckoner(): void {
    // PCSAT Ready Reckoner document download
    // This opens the document in a new tab or downloads it based on browser settings
    const documentUrl = '/assets/documents/PCSAT_Ready_Reckoner.pdf';
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = documentUrl;
    link.target = '_blank';
    link.download = 'PCSAT_Ready_Reckoner.pdf';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
