import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatStepper } from '@angular/material';
import { map, startWith } from 'rxjs/operators';
import { AppsService } from '../../Services/apps.service';
import { Observable } from 'rxjs/internal/Observable';
import { myUtility } from '../../Shared/myUtility';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { CssProjectSelectionListModel } from '../../models/css-project-selection-list-model';
import { EmpInfoModel } from '../../models/emp-info-model';
import { RatingCriteriaRemarksComponent } from '../rating-criteria-remarks/rating-criteria-remarks.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

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
  @ViewChild('confirmationDialog') confirmationDialogTemplate: TemplateRef<any>
  filteredStep1List: any[] = [];
  isStep1Completed: boolean = false;
  isLoading: boolean = false;
  isReset = false;


  constructor(
    private _formBuilder: FormBuilder,
    private _cdRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _appservice: AppsService,
    private route: ActivatedRoute,
    public _util: myUtility,
    public dialog: MatDialog
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
    this.isLoading = true;
    this._appservice.getActiveCurrentBatch().subscribe(data => {
      this.batchCycles = data;
      this.selectedBatchCycle = this.batchCycles.batch_name;
      this.batchId = this.batchCycles.batch_id;

      this._appservice.getDropdownOptions('REJECTION_REASON').subscribe((options: any[]) => {
        this.rejectionReasons = options.map(opt => opt.dD_TEXT);

        this._appservice.getCSATListforDP(this.dpId, this.batchId).subscribe(csatData => {
          this.csatList = csatData;
          this.loadProjects();
          this.isLoading = false;
        });
      }, error => {
        console.error('Error fetching rejection reasons', error);
        this.isLoading = false;
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
    this.step1ProjectList.forEach(proj => {
      if (this.projectSelection.isSelected(proj)) {
        proj.reasonNotChosen = this.bulkReasonProject;
        proj.chosen = 'No';
        proj.isValid = true;
      }
    });
  }




  goForwardStep1(stepper: MatStepper) {

    let isReasonMissing = false;

    const customerStatus: { [key: string]: { headcount: number, hasSelectedYes: boolean } } = {};

    this.step1ProjectList.forEach(proj => {
      proj.isValid = true;

      if (proj.chosen === 'Yes') {
        proj.reasonNotChosen = '';
      }
      else if (proj.chosen === 'No' && !proj.reasonNotChosen) {
        proj.isValid = false;
        isReasonMissing = true;
      }
      const id = proj.custId;

      if (!customerStatus[id]) {
        customerStatus[id] = {
          headcount: proj.accountHeadcount || 0,
          hasSelectedYes: false
        };
      }

      if (proj.chosen === 'Yes') {
        customerStatus[id].hasSelectedYes = true;
      }
    });

    // --- Validation Part 1: Missing Reasons ---
    if (isReasonMissing) {
      this.showWarningPopup("Please provide reason Chosen for PCSAT as No");
      return;
    }

    // --- Validation Part 2: Headcount Rule ---
    for (const id in customerStatus) {
      if (customerStatus.hasOwnProperty(id)) {
        const data = customerStatus[id];

        // THE RULE: If HC >= 10 AND they have ZERO 'Yes' projects
        if (data.headcount >= 10 && !data.hasSelectedYes) {
          this.showWarningPopup(
            "Please select at least one project for PCSAT survey for Account headcount >= 10. For excluding the account from H2 PCSAT please obtain approval from the GDH and share it with DEX Team"
          );
          return;
        }
      }
    }


    const hasSelectedProjects = this.step1ProjectList.some(p => p.chosen === 'Yes');

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

      this.isStep1Completed = hasSelectedProjects;

      if (!hasSelectedProjects) {
        // --- SCENARIO: ALL NO ---
        this.step1Form.setErrors({ 'noProjectsSelected': true });
        this._cdRef.detectChanges();

        this.showWarningPopup("Data saved successfully.");
        // DO NOT navigate. Step 2 will now be locked.

      } else {
        // --- SCENARIO: AT LEAST ONE YES ---
        this.step1Form.setErrors(null);
        this._cdRef.detectChanges();
        this.showWarningPopup("Data saved successfully.");
        stepper.next();
        this.loadValidationData();
      }

    },
      (error) => { console.error('Error saving project selection', error); }
    );
  }

  // --- STEP 2 ---

  loadValidationData() {
    this.isLoading = true;
    this._appservice.getCSATContactListForDP(this.dpId, this.batchId).subscribe(
      (data: any[]) => {
        this.validationData = data.map(row => {

          //const projValues = this.step1ProjectList.find(p => p.projId === row.proJ_ID);

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
            isValid: true
          };
        });

        this.uniqueCustIds = Array.from(new Set(this.validationData.map(v => v.custId)));
        const step1CustIds = this.projectSelection.selected.map(p => p.custId);
        const combinedCustIds = Array.from(new Set([...this.uniqueCustIds, ...step1CustIds]));
        if (combinedCustIds.length > 0) {
          this._appservice.getContactListForCustIds(combinedCustIds).subscribe((contacts: any[]) => {
            this.allRespondents = contacts;
            this.isLoading = false;
          });
        }
        else {
          this.isLoading = false;
        }

      },
      (error) => {
        console.error('Error fetching validation list', error);
        this.isLoading = false;
      }
    );
  }
  onProjectStatusChange(proj: any) {
    if (proj.chosen === 'Yes') {
      proj.reasonNotChosen = '';
      proj.isValid = true;
    }
  }

  getStep1SelectedProjects() {
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
    row.csatSpoc = '';
    row.csatSpocEmail = '';
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
      const allRowData = (
        (proj.account || '') + ' ' +
        (proj.name || '') + ' ' +
        (proj.headcount || '') + ' ' +
        (proj.projectStatus || '') + ' ' +
        (proj.chosen || '') + ' ' +
        (proj.reasonNotChosen || '')
      ).toLowerCase();
      return allRowData.includes(filterValue);
    });
  }

  clearFilter() {
    this.searchText = '';
    this.filteredStep1List = [...this.step1ProjectList];
  }
  validateScore(row: any) {
    if (this.isReset) {
      return;
    }

    if (row.predictedScore > 5) {
      this.isReset = true;
      this.showWarningPopup("Predicted score cannot be more than 5");
      row.predictedScore = 5;
      setTimeout(() => {
        this.isReset = false;
      }, 100);
    }
    else if (row.predictedScore < 1) {
      this.isReset = true;
      this.showWarningPopup("Predicted score cannot be less than 1");
      row.predictedScore = 1;
      setTimeout(() => {
        this.isReset = false;
      }, 100);
    }
  }
  refreshContacts() {
    const dialogRef = this.showConfirmationDialog(
      true,
      "Confirm Refresh",
      "Any unsaved changes in the grid might be lost if you proceed.\n\nAre you sure you want to refresh the contacts list?"
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      // 2. Proceed with Refresh Logic
      const step2CustIds = this.validationData.map(v => v.custId);
      const step1CustIds = this.projectSelection.selected.map(p => p.custId);

      const combinedCustIds = Array.from(new Set([...step2CustIds, ...step1CustIds]));

      if (combinedCustIds.length > 0) {
        this._appservice.getContactListForCustIds(combinedCustIds).subscribe(
          (contacts: any[]) => {
            this.allRespondents = contacts;
            this.showWarningPopup("Respondents list refreshed successfully!");
          },
          (error) => {
            console.error("Error refreshing contacts", error);
            this.showWarningPopup("Failed to refresh contacts. Please try again.");
          }
        );
      } else {
        this.showWarningPopup("No customers selected to refresh.");
      }
    });
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
    const remainingRows = this.validationData.filter((r, i) =>
      i !== index && r.projectId === projectId
    );

    if (remainingRows.length === 0) {
      const dialogRef = this.showConfirmationDialog(
        true,
        "Confirm Delete",
        "Removing this row will deselect project '" + (rowToDelete.project) + "' in the project selection. Are you sure?"
      );

      dialogRef.afterClosed().subscribe((result) => {
        if (!result) return;

        // Find the project in Step 1 and update its status
        const step1Proj = this.step1ProjectList.find(p => p.projId === projectId);
        if (step1Proj) {
          step1Proj.chosen = 'No';
          step1Proj.reasonNotChosen = '';
          step1Proj.isValid = false;
        }

        // Remove the row from the Step 2 view
        this.validationData.splice(index, 1);


        setTimeout(() => {
          // Go to Step 1
          this.stepper.selectedIndex = 0;
        }, 100);
      });
    } else {
      this.validationData.splice(index, 1);
    }
  }

  saveFinalList() {

    const unsavedRows = this.validationData.filter(r => r.isEditing);
    if (unsavedRows.length > 0) {
      this.showWarningPopup("You have rows in edit mode. Please save or cancel them before submitting.");
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
      this.showWarningPopup("Mandatory fields are missing in some rows. Please correct them before submitting.");
      return;
    }
    this.isLoading = true;

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
        this.showWarningPopup("Data saved successfully.");
        this.isLoading = false;
        this.loadValidationData();
      },
      (err) => {
        // Error Handling
        console.error("Save Error:", err);
        if (err.error && err.error.message) {
          this.showWarningPopup(err.error.message);
          this.isLoading = false;
        } else if (typeof err.error === 'string') {
          this.showWarningPopup(err.error);
          this.isLoading = false;
        } else {
          this.showWarningPopup("An error occurred while saving. Please check the console for details.");
          this.isLoading = false;
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

  showWarningPopup(message: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
    }
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    this.dialog.open(RatingCriteriaRemarksComponent, dialogConfig);
  }
  showConfirmationDialog(dialogSuccess: boolean, dialogHeading: string, dialogMessage: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogSuccess: dialogSuccess,
      dialogHeading: dialogHeading,
      dialogMessage: dialogMessage,
    }
    dialogConfig.width = '500px';
    dialogConfig.height = '180px';
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    return this.dialog.open(this.confirmationDialogTemplate, dialogConfig);

  }

}