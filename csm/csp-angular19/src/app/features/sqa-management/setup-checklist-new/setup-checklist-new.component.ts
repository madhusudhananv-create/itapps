import { Component, OnInit, ViewChild, Input, EventEmitter, Output, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { WarningPopupComponent } from '../../../shared/components/warning-popup/warning-popup.component';
import { TableFilterComponent, FilterPreferenceModel } from '../../../shared/components/table-filter/table-filter.component';
import { ChecklistModel, PM_MATURITYLEVEL_MAPPING, AuditCheckListWeightage, AuditStatusList, ChecklistQuestionsModelNew } from '../../../models/checklist.model';
import { ProcessModelModel } from '../../../core/models/process-sqa-model';

@Component({
  selector: 'app-setup-checklist-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TableFilterComponent
  ],
  templateUrl: './setup-checklist-new.component.html',
  styleUrls: ['./setup-checklist-new.component.scss']
})
export class SetupChecklistNewComponent implements OnInit, AfterViewInit {
  bShowFilter: boolean = true;
  result: ChecklistModel[] = [];
  bAddNewChecklist: boolean = false;
  newChecklist: ChecklistModel = new ChecklistModel();
  ProcessModelList: ProcessModelModel[] = [];
  maturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  originalMaturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  weightage: AuditCheckListWeightage[] = [];
  originalweightage: AuditCheckListWeightage[] = [];
  showAddCategory: boolean = false;
  displayedColumns = ["index", "title", "description", "version", "effectivE_FROM", "procesS_MODEL_ID", "Action", "approve"];
  dataSource = new MatTableDataSource<ChecklistModel>(this.result);
  checklistList: ChecklistModel[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  findingsType: any[] = [];
  findingTypeValues: any[] = [];
  originalFindingValues: any[] = [];
  statusList: any[] = [];
  showStatusList: boolean = false;
  approversList: any[] = [];
  effectivE_FROM: Date = new Date();
  existingStatusList: any[] = [];
  selectedChoice: number = 2;
  isSaved: boolean = true;
  checklistUsedInAssessment: any[] = [];
  isWeightageDisabled: boolean = false;
  questionList: ChecklistQuestionsModelNew[] = [];
  isDisabled: boolean = false;
  @Input() isShowCreateChecklist: boolean = false;
  @Input() callSave: boolean = false;
  @Input() dataRecord: ChecklistModel = new ChecklistModel();
  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();
  
  // Status list properties
  statustitle: string = "";
  metStatusValues: AuditStatusList[] = [];
  nmetStatusValues: AuditStatusList[] = [];
  naStatusValues: AuditStatusList[] = [];
  disableStatusSave: boolean = false;

  // Filter properties
  filterCriteria: FilterPreferenceModel[] = [];

  specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
  numberPattern = /^[0-9\s]+$/;

  constructor(
    public _appservice: AppsService, 
    public _util: MyUtility,
    private dialog: MatDialog,
    public cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.Service_GetProcessModelList();
    this.Service_GetMaturiryLevel();
    this.service_getChecklistList();
    this.Service_GetAuditStatusList();
    this.Service_getApproversList();
    this.Service_getchecklistStatusList();
    this.Service_getFindingsTypeList();
    this.Service_GetWeightage();
  }

  ngOnChanges() {
    if (this.callSave) {
      this.newChecklist = this.dataRecord;
      this.btnSaveChecklist_Onclick();
      this.onChange.emit('0');
    }
    else if (this.isShowCreateChecklist && this.dataRecord != undefined && this.dataRecord != null) {
      this.newChecklist = this.dataRecord;
      if (this.newChecklist.effectivE_FROM != undefined && this.newChecklist.effectivE_FROM != null) {
        this.effectivE_FROM = new Date(this.newChecklist.effectivE_FROM.toString());
      }
      else {
        this.effectivE_FROM = new Date();
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Service Methods
  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe({
      next: (data: any) => {
        this.ProcessModelList = data;
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetMaturiryLevel() {
    this._appservice.getMaturityLevel().subscribe({
      next: (data: any) => {
        this.originalMaturityLevel = data;
        this.maturityLevel = data;
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetWeightage() {
    this._appservice.getWeightage().subscribe({
      next: (data: any) => {
        this.originalweightage = data;
        this.weightage = data;
        this.originalweightage.forEach(x => x.iS_CHECKED = true);
        this.weightage.forEach(x => x.iS_CHECKED = true);
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetWeightageForChecklist(checklistId: number) {
    this.weightage = [];
    this._appservice.getWeightageForChecklist(checklistId).subscribe({
      next: (data: any) => {
        this.weightage = data;
        if (this.weightage.length > 0) {
          var checklistSubmitted = this.weightage.filter(x => x.iS_USED_IN_SUMBITTED_ASSESSMENT);
          this.isWeightageDisabled = checklistSubmitted.length > 0 ? true : false;
        }
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_getChecklistQuestionList(checklistId: number) {
    this._appservice.getChecklistQuestionList(checklistId).subscribe({
      next: (data: any) => {
        this.questionList = data;
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetAuditStatusList() {
    this._appservice.getAuditStatusList().subscribe({
      next: (data: any) => {
        this.statusList = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_getChecklistList() {
    this._appservice.getChecklistList().subscribe({
      next: (data: any) => {
        this.checklistList = data;
        this.checklistList.forEach(x => x.iS_CHECKED = false);
        this.selectversion();
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_getApproversList() {
    this._appservice.getChecklistApproversList().subscribe({
      next: (data: any) => {
        this.approversList = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_getchecklistStatusList() {
    this._appservice.getAuditStatusList().subscribe({
      next: (data: any) => {
        this.existingStatusList = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_getFindingsTypeList() {
    this._appservice.getFindingsTypeList().subscribe({
      next: (data: any) => {
        this.findingsType = data.findingsType;
        this.originalFindingValues = data.findingTypeValues;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  getchecklistUsedInAssessment() {
    this._appservice.getChecklistUsedInAssessment().subscribe({
      next: (data: any) => {
        this.checklistUsedInAssessment = data;
        var checklistInUse = this.checklistUsedInAssessment.filter(x => x.checklisT_ID == this.newChecklist.id);
        this.isDisabled = checklistInUse.length > 0;
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  selectversion() {
    if (this.selectedChoice == 1) {
      this.result = this.checklistList;
    }
    else {
      // Get latest version - group by title
      this.checklistList.sort(function (a, b) {
        if (a.title < b.title) {
          return -1;
        }
        else if (a.title > b.title) {
          return 1;
        }
        else {
          if (a.version > b.version) {
            return -1;
          }
          else if (a.version < b.version) {
            return 1;
          }
          return 0;
        }
      });
      
      const set = new Set<string>();
      const output: ChecklistModel[] = [];
      for (let i = 0; i < this.checklistList.length; i++) {
        if (!set.has(this.checklistList[i].title)) {
          output.push(this.checklistList[i]);
          set.add(this.checklistList[i].title);
        }
      }
      
      output.sort((a, b) => a.effectivE_FROM > b.effectivE_FROM ? -1 : a.effectivE_FROM < b.effectivE_FROM ? 1 : 0);
      this.result = output;
    }
    
    // Reset filter criteria when changing version view
    this.filterCriteria = [];
    this.refreshTable(this.result);
  }

  btnAddNewStatusList() {
    this.showStatusList = !this.showStatusList;
    if (this.metStatusValues.length == 0)
      this.metStatusValues.push(new AuditStatusList());
    if (this.naStatusValues.length == 0)
      this.naStatusValues.push(new AuditStatusList());
    if (this.nmetStatusValues.length == 0)
      this.nmetStatusValues.push(new AuditStatusList());
  }

  addNewMetStatusRow() {
    const newRow = new AuditStatusList();
    this.metStatusValues.push(newRow);
  }

  addNewNMetStatusRow() {
    const newRow = new AuditStatusList();
    this.nmetStatusValues.push(newRow);
  }

  addNewNAStatusRow() {
    const newRow = new AuditStatusList();
    this.naStatusValues.push(newRow);
  }

  deleteNewMetStatusRow(index: number) {
    this.metStatusValues.splice(index, 1);
  }

  deleteNewNMetStatusRow(index: number) {
    this.nmetStatusValues.splice(index, 1);
  }

  deleteNewNAStatusRow(index: number) {
    this.naStatusValues.splice(index, 1);
  }

  saveStatusRecord() {
    // Validation 1: Check if status title is provided
    if (!this.statustitle || this.statustitle.length === 0) {
      this._util.showError('Please enter status title');
      return;
    }

    // Validation 2: Check if at least one valid Pass value exists
    let metStatusValidation = false;
    this.metStatusValues.forEach(
      function (status) {
        if (status.status && !isNaN(status.multiplier)) {
          metStatusValidation = true;
        }
      });

    if (!metStatusValidation) {
      this._util.showError('Please enter valid Pass value and multiplier');
      return;
    }

    // Validation 3: Check if at least one valid Fail value exists
    let nmetStatusValidation = false;
    this.nmetStatusValues.forEach(
      function (status) {
        if (status.status && !isNaN(status.multiplier)) {
          nmetStatusValidation = true;
        }
      });

    if (!nmetStatusValidation) {
      this._util.showError('Please enter valid Fail value and multiplier');
      return;
    }

    // Validation 4: Check if at least one valid N/A value exists
    let naStatusValidation = false;
    this.naStatusValues.forEach(
      function (status) {
        if (status.status && !isNaN(status.multiplier)) {
          naStatusValidation = true;
        }
      });

    if (!naStatusValidation) {
      this._util.showError('Please enter valid N/A value and multiplier');
      return;
    }

    // Validation 5: Check for duplicate status title
    let anyrec = this.existingStatusList.find(x => x.statuS_TITLE.trim() == this.statustitle.trim())
    if (anyrec != undefined) {
      this._util.showError('There is already an entry with the same name exists. Try using the same name or add a different status list name');
      return;
    }

    // Disable save button during API call
    this.disableStatusSave = true;

    if (this.statustitle != undefined && this.metStatusValues.length > 0) {
      this._appservice.addStatusValues(this.statustitle, this.metStatusValues, this.nmetStatusValues, this.naStatusValues).subscribe({
        next: (data: any) => {
          this.statusList.push(data);
          this._util.showSuccess('Status list added successfully');
          this.disableStatusSave = false;
          this.statustitle = "";
          this.metStatusValues = [];
          this.nmetStatusValues = [];
          this.naStatusValues = [];
          this.showStatusList = false;
        },
        error: (error: any) => {
          this._util.showError('There is an error in adding status list');
          this.disableStatusSave = false;
        }
      });
    }
  }

  onClickCancel() {
    this.showStatusList = false;
    this.statustitle = "";
    this.metStatusValues = [];
    this.nmetStatusValues = [];
    this.naStatusValues = [];
  }

  refreshTable(datasource: ChecklistModel[]) {
    this.dataSource = new MatTableDataSource(datasource);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  IsApprover(): boolean {
    const empid = localStorage.getItem('empid');
    const element = this.approversList.find(x => x == empid);
    return element !== undefined;
  }

  getProcessModelName(processmodelid: number): string {
    const element = this.ProcessModelList.find(x => x.id == processmodelid);
    return element !== undefined ? element.title : "";
  }

  getdecimalValue(value: number): number {
    const str = value.toString();
    return parseFloat(str);
  }

  checkAll(event: MatCheckboxChange) {
    this.result.forEach(x => {
      if (!x.iS_APPROVED) {
        x.iS_CHECKED = event.checked;
      }
    });
  }

  toggleCheck(event: MatCheckboxChange) {
    // Handle individual checkbox toggle
  }

  getLatestVersion(checklistList: ChecklistModel[]) {
    let uniqueTitles = [...new Set(checklistList.map(x => x.title))];
    let latestVersions: ChecklistModel[] = [];
    
    uniqueTitles.forEach(title => {
      let checklistsWithSameTitle = checklistList.filter(x => x.title === title);
      checklistsWithSameTitle.sort((a, b) => b.version - a.version);
      latestVersions.push(checklistsWithSameTitle[0]);
    });
    
    this.result = latestVersions;
  }

  loadApplicableMaturityLevel(processmodelid: number) {
    this.maturityLevel = this.originalMaturityLevel.filter(x => x.procesS_MODEL_ID == processmodelid);
  }

  filterValues() {
    this.findingTypeValues = this.originalFindingValues.filter(x => x.findingstypE_ID == this.newChecklist.findingstypE_ID);
  }

  btnAddNewCategory() {
    this.showAddCategory = !this.showAddCategory;
  }

  btnClearChecklist_Onclick() {
    this.newChecklist = new ChecklistModel();
    this.effectivE_FROM = new Date();
    this.isWeightageDisabled = false;
    this.isDisabled = false;
    this.weightage = this.originalweightage.map(x => ({...x}));
  }

  CancelOnClick() {
    this.showStatusList = false;
  }

  chkweighatgechange(event: MatCheckboxChange, weightageId: number) {
    const weightageItem = this.weightage.find(x => x.id == weightageId);
    if (!weightageItem) return;

    if (event.checked) {
      weightageItem.iS_CHECKED = true;
    }
    else {
      if (this.questionList.length > 0 && this.newChecklist.id > 0) {
        var weightageUsedinquestions = this.questionList.filter(x => x.weightagE_ID == weightageId);
        if (weightageUsedinquestions.length > 0) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = {
            Message: 'If you remove the weightage it will impact the checklist questions. Are you sure to remove?',
            isConfirmation: true,
            confirmText: 'Remove',
            cancelText: 'Cancel',
            title: 'Remove Weightage',
            icon: 'warning'
          };
          dialogConfig.hasBackdrop = true;
          dialogConfig.scrollStrategy = new NoopScrollStrategy();
          dialogConfig.panelClass = 'warning-popup-dialog';
          dialogConfig.backdropClass = 'warning-popup-backdrop';

          const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
          dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
              weightageItem.iS_CHECKED = false;
            }
            else {
              weightageItem.iS_CHECKED = true;
              event.source.checked = true;
            }
          });
          return;
        }
      }
      weightageItem.iS_CHECKED = false;
    }
  }

  EditRow_onClick(element: ChecklistModel) {
    this.newChecklist = { ...element };
    this.effectivE_FROM = new Date(this.newChecklist.effectivE_FROM.toString());
    this.loadApplicableMaturityLevel(this.newChecklist.procesS_MODEL_ID);
    this.Service_GetWeightageForChecklist(this.newChecklist.id);
    this.service_getChecklistQuestionList(this.newChecklist.id);
    this.getchecklistUsedInAssessment();
  }

  DeleteRow_onClick(element: ChecklistModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Are you sure you want to delete this checklist?',
      isConfirmation: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      title: 'Delete Checklist',
      icon: 'delete_forever',
      actionType: 'delete'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';

    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.service_deleteChecklist(element);
      }
    });
  }

  ReviseChecklist_onClick(element: ChecklistModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'This will create a new version of checkpoints. Do you want to continue?',
      isConfirmation: true,
      confirmText: 'Continue',
      cancelText: 'Cancel',
      title: 'Revise Checklist',
      icon: 'history'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';

    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        element.version = parseFloat((element.version + 0.01).toFixed(2));
        element.effectivE_FROM = new Date().toDateString();
        element.createD_DATE = new Date().toDateString();
        element.createD_BY = localStorage.getItem('empid') || '';
        element.updateD_BY = localStorage.getItem('empid') || '';
        element.updateD_DATE = new Date().toDateString();
        element.iS_APPROVED = false;
        this.service_reviseChecklist(element, element.id);
      }
    });
  }

  ApproveChecklist_onClick() {
    var checklists = this.checklistList.filter(x => x.iS_CHECKED == true);
    if (checklists.length === 0) {
      this._util.showWarning('Please select at least one checklist to approve');
      return;
    }
    this.service_approveChecklist(checklists);
  }

  btnSaveChecklist_Onclick() {
    if (!this.validateChecklist()) {
      return;
    }

    this.newChecklist.createD_DATE = new Date().toDateString();
    this.newChecklist.updateD_DATE = new Date().toDateString();
    // Convert effectivE_FROM to Date if it's a string, then to string
    const effectiveDate = typeof this.newChecklist.effectivE_FROM === 'string' 
      ? new Date(this.newChecklist.effectivE_FROM) 
      : this.newChecklist.effectivE_FROM;
    this.newChecklist.effectivE_FROM = this._util.setLocaleDate(effectiveDate).toDateString();

    if (this.newChecklist.id == 0 || this.newChecklist.id == undefined) {
      this.service_addChecklist(this.newChecklist);
    }
    else {
      this.service_updateChecklist(this.newChecklist);
    }
  }

  validateChecklist(): boolean {
    if (!this.newChecklist.title || this.newChecklist.title.trim() == "") {
      this._util.showError('Please enter title');
      return false;
    }
    if (!this.newChecklist.description || this.newChecklist.description.trim() == "") {
      this._util.showError('Please enter description');
      return false;
    }
    if (!this.newChecklist.version || this.newChecklist.version == 0) {
      this._util.showError('Please enter version');
      return false;
    }
    if (isNaN(this.newChecklist.version)) {
      this._util.showError('Please enter valid version');
      return false;
    }
    if (this.newChecklist.version.toString().length > 11) {
      this._util.showError('Please enter a version with less than 10 digits');
      return false;
    }
    if (!this.newChecklist.effectivE_FROM) {
      this._util.showError('Please enter effective date');
      return false;
    }
    if (this.newChecklist.maturitY_LEVEL) {
      if (!this.newChecklist.procesS_MODEL_ID || this.newChecklist.procesS_MODEL_ID == 0) {
        this._util.showError('Please select a process model');
        return false;
      }
      if (this.maturityLevel.length == 0) {
        this._util.showError("Maturity Level scores are not defined for the selected Process Model. Please define before proceeding.");
        return false;
      }
    }
    if (this.newChecklist.correctivE_ACTION_TRACKING) {
      if (isNaN(this.newChecklist.findingstypE_ID) || this.newChecklist.findingstypE_ID == null) {
        this._util.showError('Please select findings type');
        return false;
      }
    }
    if (isNaN(this.newChecklist.statuS_LIST_ID) || this.newChecklist.statuS_LIST_ID == null) {
      this._util.showError('Please choose a status list');
      return false;
    }
    if (this.newChecklist.iS_WEIGHTAGE_APPLICABLE) {
      if (this.weightage.length == this.weightage.filter(x => x.iS_CHECKED == false).length) {
        this._util.showError('Please choose the weightage');
        return false;
      }
    }
    if ((this.specialCharPattern.test(this.newChecklist.title)) || this.numberPattern.test(this.newChecklist.title)) {
      this._util.showError('Please enter alphanumeric values for title');
      return false;
    }
    if ((this.specialCharPattern.test(this.newChecklist.description)) || this.numberPattern.test(this.newChecklist.description)) {
      this._util.showError('Please enter alphanumeric values for description');
      return false;
    }
    return true;
  }

  btnSaveCopyChecklist_Onclick() {
    const currentDateTime = new Date().toLocaleString();
    const defaultTitle = `Copy~${currentDateTime} - ${this.newChecklist.title}`;
    
    this._util.showInputDialog(
      'Enter a title for the duplicated checklist',
      'Save the title as',
      defaultTitle,
      'Checklist Title',
      'Enter checklist title...'
    ).subscribe((checkistTitle: string | null) => {
      if (checkistTitle && checkistTitle.trim()) {
        this.service_saveChecklistCopy(this.newChecklist.id, checkistTitle.trim());
      }
    });
  }

  UpdateWeightageScores() {
    if (this.newChecklist.id == 0 || this.newChecklist.id == null) {
      this._util.showWarning("Please update weightage after checklist created");
      return;
    }

    this._appservice.UpdateWeightageForChecklist(this.weightage, this.newChecklist.id).subscribe({
      next: (data: any) => {
        this.weightage = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  service_addChecklist(newChecklist: ChecklistModel) {
    this.isSaved = false;
    this._appservice.addChecklist(newChecklist).subscribe({
      next: (data: any) => {
        if (data.id > 0) {
          this.isSaved = true;
          if (newChecklist.iS_WEIGHTAGE_APPLICABLE) {
            this.newChecklist.id = data.id;
            this.onChange.emit(data.id.toString());
            this.UpdateWeightageScores();
          }
          this._util.showSuccess('Checklist added successfully');
          this.btnClearChecklist_Onclick();
          this.service_getChecklistList();
        }
      }, 
      error: (error) => { 
        this._util.serviceError(error); 
        this.isSaved = true;
      }
    });
  }

  service_updateChecklist(checklistToUpdate: ChecklistModel) {
    this._appservice.updateChecklist(checklistToUpdate).subscribe({
      next: (data: any) => {
        if (checklistToUpdate.iS_WEIGHTAGE_APPLICABLE) {
          this.newChecklist.id = checklistToUpdate.id;
          this.UpdateWeightageScores();
        }
        this._util.showSuccess('Checklist updated successfully');
        this.btnClearChecklist_Onclick();
        this.service_getChecklistList();
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_deleteChecklist(checklistToDelete: ChecklistModel) {
    this._appservice.deleteChecklist(checklistToDelete).subscribe({
      next: (data: any) => {
        const index = this.checklistList.findIndex(c => c.id === checklistToDelete.id);
        if (index > -1) {
          this.checklistList.splice(index, 1);
          this.result = this.checklistList;
          this.refreshTable(this.result);
        }
        this._util.showSuccess('Checklist deleted successfully');
      }, 
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  service_reviseChecklist(element: ChecklistModel, oldchecklistid: number) {
    this._appservice.reviseChecklist(element, oldchecklistid).subscribe({
      next: (data: any) => {
        this._util.showSuccess('Checklist revised successfully');
        this.service_getChecklistList();
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_approveChecklist(checklists: ChecklistModel[]) {
    this._appservice.approveChecklist(checklists).subscribe({
      next: (data: any) => {
        this._util.showSuccess('Selected Checklists approved successfully');
        this.service_getChecklistList();
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_saveChecklistCopy(id: number, checkistTitle: string | null) {
    this._appservice.saveChecklistCopy(id.toString(), checkistTitle || '').subscribe({
      next: (data: any) => {
        this._util.showSuccess('Checklist copy saved successfully');
        this.service_getChecklistList();
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  // Filter functionality
  Filter_onChange($event: any) {
    // $event contains { data: filteredData, criteria: filterCriterias }
    let filteredData = $event.data || $event;
    this.filterCriteria = $event.criteria || [];
    
    // Update the data source with filtered data using refreshTable
    this.refreshTable(filteredData);
    
    // Go to first page after filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  showAll($event: any) {
    // Reset to show all data
    if ($event) {
      this.refreshTable(this.result);
      if (this.paginator) {
        this.paginator.firstPage();
      }
    }
  }
}
