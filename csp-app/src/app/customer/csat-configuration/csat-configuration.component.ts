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
  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private _formBuilder: FormBuilder,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _appservice: AppsService,
    private route: ActivatedRoute,
    public _util: myUtility
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
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
  }

  isAllProjectsSelected() {
    return this.projectSelection.selected.length === this.step1ProjectList.length;
  }

  masterToggleProjects() {
    // Only toggles checkboxes. Does NOT change 'chosen' status or reasons.
    if (this.isAllProjectsSelected()) {
      this.projectSelection.clear();
    } else {
      this.step1ProjectList.forEach(p => {
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

  goForwardStep1(stepper: MatStepper) {
    let isFormValid = true;

    // 1. Check if at least one project is 'Yes' (Global check)
    // const noProjectsWithHeadcount = this.step1ProjectList.filter(p => p.chosen === 'No'
    //    && p.accountHeadcount >= 10);
    // if (noProjectsWithHeadcount.length === 0) {
    //   alert("Please select at least one project for PCSAT with headcount >= 10");
    // }

    // 2. Validate Row-by-Row
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
        alert("Please select at least one project for PCSAT with headcount >= 10");
      }

    });

    // 3. Trigger Alert if validation failed
    if (!isFormValid) {
      alert("Select reason for No");
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

    this._appservice.saveCSATListForDP(saveCSATData, this.dpId, this.batchId).subscribe((response) => {
      stepper.next();
      this.loadValidationData();
    },
      (error) => { console.error('Error saving project selection', error); }
    );
  }
  // --- STEP 2 ---

  loadValidationData() {
    this._appservice.getCSATContactListForDP(this.dpId, this.batchId).subscribe(
      (data: any[]) => {
        this.validationData = data.map(row => ({
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
      ISACTIVE: true
    }));

    this._appservice.saveCSATContactListForDP(payload, this.dpId, this.batchId).subscribe(res => {
      alert("Saved successfully!");
      this.loadValidationData();
    }, err => console.error(err));
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