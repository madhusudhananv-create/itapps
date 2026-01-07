import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatStepper } from '@angular/material';
import { map, startWith } from 'rxjs/operators';
import { AppsService } from '../../Services/apps.service';
import { Observable } from 'rxjs/internal/Observable';
import { myUtility } from '../../Shared/myUtility';
import { ActivatedRoute } from '@angular/router';
import { CssProjectSelectionListModel } from '../../models/css-project-selection-list-model';
import { EmpInfoModel } from '../../models/emp-info-model';

@Component({
  selector: 'app-csat-configuration',
  templateUrl: './csat-configuration.component.html',
  styleUrls: ['./csat-configuration.component.scss']
})
export class CsatConfigurationComponent implements OnInit {

  csatList: CssProjectSelectionListModel[] = [];
  configurationData: any = {};
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  step1Form: FormGroup;
  batchCycles: any;
  selectedBatchCycle = '';
  batchId: number;
  rejectionReasons: string[] = [];
  allSpocs: any[] = [];
  allRespondents: any[] = [];
  step1ProjectList: any[] = [];
  validationData: any[] = [];
  dpId: string = localStorage.getItem('empid');
  bulkReasonProject = '';
  uniqueCustIds: any[] = [];
  projectSelection = new SelectionModel<any>(true, []);
  filteredOptions: Observable<EmpInfoModel[]>;
  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  searchText: string;
  @ViewChild('stepper') stepper: MatStepper;
  filteredStep1List: any[] = [];
  isStep1Completed: boolean = false;


  constructor(
    private _formBuilder: FormBuilder,
    private _cdRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _appservice: AppsService,
    private route: ActivatedRoute,
    public _util: myUtility
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this._cdRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.step1Form = this._formBuilder.group({ valid: [''] });
    this.bindMasterData();
    this.LoadData();
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
    this._appservice.getEmpInfo().subscribe(data => {
      this.empinfo = data;
    }, error => { this._util.serviceError(error); });
  }

  bindMasterData() {
    this._appservice.getActiveCurrentBatch().subscribe(data => {
      this.batchCycles = data;
      this.selectedBatchCycle = this.batchCycles.batch_name;
      this.batchId = this.batchCycles.batch_id;

      this._appservice.getDropdownOptions('REJECTION_REASON').subscribe((options: any[]) => {
        this.rejectionReasons = options.map(opt => opt.dD_TEXT);

        this._appservice.getCSATListforDP(this.dpId, this.batchId).subscribe(csatData => {
          this.csatList = csatData;
          this.loadProjects();
        });
      }, error => {
        console.error('Error fetching rejection reasons', error);
      });
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
        Spoc: dbRow.csaT_SPOC,
        SpocEmail: dbRow.csaT_SPOC_EMAIL,
        chosen: dbRow.iS_SELECTED ? 'Yes' : 'No',
        reasonNotChosen: '',
        isValid: true,
        executionType: dbRow.executioN_TYPE,
        engagementType: dbRow.engagamenT_TYPE
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
    this.filteredStep1List = [...this.step1ProjectList];
  }

  // Update this helper too for the checkbox state
  isAllProjectsSelected() {
    if (this.filteredStep1List.length === 0) return false;
    return this.filteredStep1List.every(p => this.projectSelection.isSelected(p));
  }

  masterToggleProjects() {
    // Check if all VISIBLE projects are selected
    const allVisibleSelected = this.filteredStep1List.every(p => this.projectSelection.isSelected(p));

    if (allVisibleSelected) {
      this.projectSelection.clear();
    } else {
      // Select only the visible filtered rows
      this.filteredStep1List.forEach(p => {
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



  // REPLACE your goForwardStep1 function with this exact code
  goForwardStep1(stepper: MatStepper) {
    let isFormValid = true;

    // --- Validation Logic ---
    this.step1ProjectList.forEach(proj => {
      proj.isValid = true;
      if (proj.chosen === 'No' && !proj.reasonNotChosen) {
        proj.isValid = false; 
        isFormValid = false;
      }
      if(proj.chosen === 'No' && proj.accountHeadcount >= 10 && !proj.reasonNotChosen) {
          proj.isValid = false;
          alert("Please select at least one project for PCSAT with headcount >= 10");
          isFormValid = false;
      }
    });

    if (!isFormValid) {
      alert("Select reason for No"); 
      return;
    }

    // --- LOGIC: Check for 'Yes' Projects ---
    const hasSelectedProjects = this.step1ProjectList.some(p => p.chosen === 'Yes');

    // --- Prepare Save Payload ---
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

    // --- Save API Call ---
    this._appservice.saveCSATListForDP(saveCSATData, this.dpId, this.batchId).subscribe((response) => {
      
      // Update our manual flag
      this.isStep1Completed = hasSelectedProjects;

      if (!hasSelectedProjects) {
        // --- SCENARIO: ALL NO ---
        
        // 1. Manually FAIL the form validation.
        // This is the secret trick. Even if fields are filled, we tell the form it is invalid.
        this.step1Form.setErrors({ 'noProjectsSelected': true });

        // 2. Trigger UI Update
        this._cdRef.detectChanges();

        alert("Data saved successfully.");
        // DO NOT navigate. Step 2 will now be locked.

      } else {
        // --- SCENARIO: AT LEAST ONE YES ---
        
        // 1. Clear errors so the form is Valid
        this.step1Form.setErrors(null);
        
        // 2. Trigger UI Update
        this._cdRef.detectChanges();

        // 3. Navigate
        stepper.next();
        this.loadValidationData();
      }

    },
      (error) => { console.error('Error saving project selection', error); }
    );
  }

  // --- STEP 2 ---

  loadValidationData() {
    this._appservice.getCSATContactListForDP(this.dpId, this.batchId).subscribe(
      (data: any[]) => {
        this.validationData = data.map(row => {

          // 1. Find the matching project from Step 1 List
          const projValues = this.step1ProjectList.find(p => p.projId === row.proJ_ID);

          return {
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
            executionType: projValues ? projValues.executionType : '',
            engagementType: projValues ? projValues.engagementType : ''
          };
        });

        this.uniqueCustIds = Array.from(new Set(this.validationData.map(v => v.custId)));
        const step1CustIds = this.projectSelection.selected.map(p => p.custId);
        const combinedCustIds = Array.from(new Set([...this.uniqueCustIds, ...step1CustIds]));
        if (combinedCustIds.length > 0) {
          this._appservice.getContactListForCustIds(combinedCustIds).subscribe((contacts: any[]) => {
            this.allRespondents = contacts;
          });
        }
      },
      (error) => {
        console.error('Error fetching validation list', error);
      }
    );
  }


  getStep1SelectedProjects() {
    // Return projects marked as 'Yes' in the dropdown
    return this.step1ProjectList.filter(p => p.chosen === 'Yes');
  }

  addValidationRow() {
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


  applyFilter() {
  // 1. Get clean search text
  const filterValue = (this.searchText || '').toLowerCase().trim();

  // 2. If empty, reset to show everything
  if (!filterValue) {
    this.filteredStep1List = [...this.step1ProjectList];
    return;
  }

  // 3. Filter Logic
  this.filteredStep1List = this.step1ProjectList.filter(proj => {
    // Create a single string containing ALL data for this row
    // We add '' to force numbers (like headcount) to become strings
    const allRowData = (
      (proj.account || '') + ' ' + 
      (proj.name || '') + ' ' + 
      (proj.headcount || '') + ' ' +   // This handles the number 10
      (proj.projectStatus || '') + ' ' + 
      (proj.chosen || '') + ' ' + 
      (proj.reasonNotChosen || '')
    ).toLowerCase();

    // Check if the search text exists anywhere in that string
    return allRowData.includes(filterValue);
  });
}

  clearFilter() {
    this.searchText = '';
    this.filteredStep1List = [...this.step1ProjectList];
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
    if (!row.respondentName ||
      row.predictedScore === null || row.predictedScore === undefined || row.predictedScore === '' ||
      !row.csatSpoc
    ) {
      return false;
    }
    return true;
  }

  saveRow(row: any) {
    if (!this.isRowValid(row)) {
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

  deleteRow(index: number) {
    const rowToDelete = this.validationData[index];
    const projectId = rowToDelete.projectId;

    // 1. Check if this is the LAST row for this specific project
    const remainingRows = this.validationData.filter((r, i) =>
      i !== index && r.projectId === projectId
    );

    // 2. If it is the last row, we are effectively deselecting the project
    if (remainingRows.length === 0) {
      const confirmDelete = confirm(
        `Removing this row will deselect project "${rowToDelete.project}" from PCSAT.\n\nYou will be redirected to Step 1 to provide a mandatory rejection reason.`
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
        // alert(`Project "${rowToDelete.project}" has been unchecked. Please select a reason (highlighted in red) and click Save.`);
      }, 100);

    } else {
      // If other rows exist for this project, just delete this single row
      this.validationData.splice(index, 1);
    }
  }

saveFinalList() {

    const unsavedRows = this.validationData.filter(r => r.isEditing);
    if (unsavedRows.length > 0) {
      alert("You have rows in edit mode. Please save or cancel them before submitting.");
      return;
    }

    let hasError = false;
    this.validationData.forEach(row => {
      if (!this.isRowValid(row)) {
        hasError = true;
        row.isValid = false;
      }
    });

    if (hasError) {
      alert("Mandatory fields are missing in some rows. Please correct them before submitting.");
      return;
    }

    // 2. Prepare Payload
    const payload = this.validationData.map(row => ({
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
      IS_VERIFIED: true
    }));

    // 3. Save Call with Error Handling
    this._appservice.saveCSATContactListForDP(payload, this.dpId, this.batchId).subscribe(
      (res) => {
        // Success
        alert("Saved successfully!");
        this.loadValidationData();
      },
      (err) => {
        // Error Handling
        console.error("Save Error:", err);
        if (err.error && err.error.message) {
          alert(err.error.message);
        } else if (typeof err.error === 'string') {
          alert(err.error);
        } else {
          alert("An error occurred while saving. Please check the console for details.");
        }
      }
    );
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

}