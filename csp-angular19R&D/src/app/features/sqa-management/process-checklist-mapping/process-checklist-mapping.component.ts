import { Component, OnInit, ViewChild, Input, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

import { UtilityService } from '../../../core/services/utility.service';
import { AppsService } from '../../../core/services/apps.service';
import { ServiceAreaModelNew } from '../../../models/service-area.model';
import { ChecklistModel, ProcessChecklistMappingModel, ChecklistQuestionsModelNew, ProcessChecklistQuestionsMappingModel, PM_MATURITYLEVEL_MAPPING, AuditCheckListWeightage } from '../../../models/checklist.model';
import { DropdownFilterComponent } from '../../../shared/components/dropdown-filter/dropdown-filter.component';
import { PreviewPopupComponent } from './preview-popup/preview-popup.component';
import { MyUtility } from '../../../shared/my-utility';

// Temporary models until properly migrated
export class ProcessAreaModelNew {
  id!: number;
  title!: string;
  description!: string;
  createD_BY: string = localStorage.getItem('empid') || '';
  createD_DATE: Date = new Date();
  updateD_BY: string = localStorage.getItem('empid') || '';
  updateD_DATE: Date = new Date();
  isactive: boolean = true;
  servicE_AREA_ID!: number;
}

export class ProcessModelNew {
  id!: number;
  title!: string;
  description!: string;
  createD_BY: string = localStorage.getItem('empid') || '';
  createD_DATE: Date = new Date();
  updateD_BY: string = localStorage.getItem('empid') || '';
  updateD_DATE: Date = new Date();
  isactive: boolean = true;
  procesS_AREA_ID!: number;
  bSelected: boolean = false;
}

@Component({
  selector: 'app-process-checklist-mapping',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DatePipe,
    DropdownFilterComponent
  ],
  templateUrl: './process-checklist-mapping.component.html',
  styleUrls: ['./process-checklist-mapping.component.scss']
})
export class ProcessChecklistMappingComponent implements OnInit, AfterViewInit {

  bAddNewServiceArea: Boolean = false;
  selectedProcess!: ProcessModelNew;
  selectedProcessArea: ProcessAreaModelNew = new ProcessAreaModelNew();
  selectedServiceArea: ServiceAreaModelNew = new ServiceAreaModelNew();
  processModelDescription!: string;
  ProcessAreaList: ProcessAreaModelNew[] = [];
  OriginalProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessList: ProcessModelNew[] = [];
  checklistList: ChecklistModel[] = [];
  processChecklistMapping: ProcessChecklistMappingModel[] = [];

  displayedColumns = ["index", "displaY_ORDER", "description", "weightagE_ID", "globaL_PERSPECTIVE_ID", "effectivE_FROM", "edit"];
  ServiceAreaList!: ServiceAreaModelNew[];
  OriginalServiceAreaList!: ServiceAreaModelNew[];
  checklistQuestions!: ChecklistQuestionsModelNew[];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild("paginator") paginator!: MatPaginator;
  category: any[] = [];
  processChecklistQuestionMapping!: ProcessChecklistQuestionsMappingModel[];
  selectedChecklist: ChecklistModel = new ChecklistModel();
  hideMaturity!: boolean;
  hideWeightage!: boolean;
  questionList: ChecklistQuestionsModelNew[] = [];
  weightage: AuditCheckListWeightage[] = [];
  originalweightage: AuditCheckListWeightage[] = [];
  originalMaturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  maturityLevel!: PM_MATURITYLEVEL_MAPPING[];
  effectivefrom = new Date();
  checklistinAudit: any[] = [];
  selectedChoice: string = 'latestVersion';
  originalChecklistList!: ChecklistModel[];
  isPreviewChecklistClicked: boolean = false;
  checklistWithVersion: any[] = [];
  @Input() refreshChecklists: number = 0;
  iEditIndex = -1;

  constructor(
    private _util: UtilityService, 
    private _appservice: AppsService, 
    public dialog: MatDialog,
    private myUtil: MyUtility
  ) { }

  ngOnInit() {
    this.service_getChecklistList();
    this.Service_GetServiceAreaList();
    this.getCategory();
    this.getWeightageForAllChecklist();
    this.Service_GetMaturiryLevel();
    // Note: ProcessAreaList and ProcessList will be populated via cascading filters
    // when Service Tower is selected
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshChecklists']) {
      this.service_getChecklistList();
    }
  }

  Service_GetChecklistQuestionsList() {
    this._appservice.getChecklistQuestionList(-1).subscribe({
      next: (data) => {
        this.checklistQuestions = data;
        this.refreshTable(this.checklistQuestions);
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_VerifyChecklistInAudit() {
    this._appservice.VerifyChecklistInAudit(this.selectedChecklist.id).subscribe({
      next: (data) => {
        this.checklistinAudit = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  displayColumnsList() {
    if (this.selectedChecklist.maturitY_LEVEL)
      this.hideMaturity = false;
    else
      this.hideMaturity = true;

    if (this.selectedChecklist.iS_WEIGHTAGE_APPLICABLE)
      this.hideWeightage = false;
    else
      this.hideWeightage = true;
  }

  getCategory() {
    this._appservice.getQuestionCategory().subscribe({
      next: (data) => {
        this.category = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  selectversion() {
    if (this.selectedChoice == 'latestVersion') {
      this.getLatestVersion();
    }
    else {
      this.checklistList = [...this.originalChecklistList];
      this.MapChecklistWithVersion();
    }
  }

  getLatestVersion() {
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
    var set = new Set<string>();
    var output = [];
    for (var i = 0; i < this.checklistList.length; i++) {
      if (!set.has(this.checklistList[i].title)) {
        output.push(this.checklistList[i]);
        set.add(this.checklistList[i].title);
      }
    }

    output.sort((a, b) => a.effectivE_FROM > b.effectivE_FROM ? -1 : a.effectivE_FROM < b.effectivE_FROM ? 1 : 0);
    this.checklistList = [...output];
    this.MapChecklistWithVersion();
  }

  MapChecklistWithVersion() {
    this.checklistWithVersion = this.checklistList.map(item => ({
      id: item.id,
      version: item.version,
      title: `${item.title} ${item.version} - ${item.effectivE_FROM.substring(0, 10)}`,
      description: item.description,
      effectivE_FROM: item.effectivE_FROM,
      maturitY_LEVEL: item.maturitY_LEVEL,
      createD_BY: item.createD_BY,
      createD_DATE: item.createD_DATE,
      updateD_BY: item.updateD_BY,
      updateD_DATE: item.updateD_DATE,
      isactive: item.isactive,
      bSelected: item.bSelected,
      iS_WEIGHTAGE_APPLICABLE: item.iS_WEIGHTAGE_APPLICABLE,
      procesS_MODEL_ID: item.procesS_MODEL_ID,
      statuS_LIST_ID: item.statuS_LIST_ID,
      iS_APPROVED: item.iS_APPROVED,
      iS_CHECKED: item.iS_CHECKED,
      correctivE_ACTION_TRACKING: item.correctivE_ACTION_TRACKING,
      findingstypE_ID: item.findingstypE_ID,
      updateD_NAME: item.updateD_NAME,
      findingtypE_VALUE: item.findingtypE_VALUE,
    }));
  }

  getChecklistName(checklistid: number) {
    let element = this.checklistList.find(x => x.id == checklistid);
    if (element != undefined)
      return element.title;
    else
      return "";
  }

  previewChecklistData: any[] = [];
  isLoadingPreview: boolean = false;
  
  PreviewChecklist() {
    if (this.selectedChecklist === undefined || this.selectedChecklist.id == undefined || this.selectedChecklist.id == 0) {
      this.myUtil.showWarning("Please select a checklist to preview");
      return;
    }
    
    this.isLoadingPreview = true;
    const startTime = performance.now();
    
    this._appservice.GetPreviewChecklist(this.selectedChecklist.id).subscribe({
      next: (data) => {
        const fetchEndTime = performance.now();
        const fetchDuration = ((fetchEndTime - startTime) / 1000).toFixed(2);
        
        this.previewChecklistData = data;
        this.isLoadingPreview = false;
        
        this.openPopup();
      },
      error: (error) => { 
        const errorTime = performance.now();
        const duration = ((errorTime - startTime) / 1000).toFixed(2);
        this.isLoadingPreview = false;
        this._util.serviceError(error); 
      }
    });
  }

  openPopup() {
    if (!this.previewChecklistData || this.previewChecklistData.length === 0) {
      this.myUtil.showWarning('No preview data available for this checklist.');
      return;
    }
    
    try {
      // Open dialog immediately - rendering will be chunked inside the component
      const dialogRef = this.dialog.open(PreviewPopupComponent, {
        data: {
          previewData: this.previewChecklistData,
          checklistName: this.selectedChecklist.title,
          version: this.selectedChecklist.version,
          effectivE_FROM: this.selectedChecklist.effectivE_FROM,
          iS_WEIGHTAGE_APPLICABLE: this.selectedChecklist.iS_WEIGHTAGE_APPLICABLE,
          iS_MATURITY_APPLICABLE: this.selectedChecklist.maturitY_LEVEL,
        },
        width: '90vw',
        height: '90vh',
        maxWidth: '90vw',
        maxHeight: '90vh',
        panelClass: 'preview-dialog',
        disableClose: false,
        autoFocus: false,
        restoreFocus: false,
        hasBackdrop: true
      });
      
      dialogRef.afterClosed().subscribe(result => {
      });
    } catch (error) {
      console.error('Error opening dialog:', error);
      this.myUtil.showError('Error opening preview dialog. Check console for details.');
    }
  }

  getglobalCategoryName(categoryid: number) {
    let element = this.category.find(x => x.id == categoryid);
    if (element != undefined)
      return element.shorT_DESC;
    else
      return "";
  }

  refreshTable(dataSource: any) {
    this.dataSource = new MatTableDataSource(dataSource);
    this.dataSource.paginator = this.paginator;
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe({
      next: (data) => {
        this.ServiceAreaList = data;
        this.OriginalServiceAreaList = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  ddServiceAreaChange($event: any) {
    this.selectedServiceArea = $event;
    this.Service_GetProcessAreaForServiceArea();
    this.selectedProcessArea = new ProcessAreaModelNew();
    this.ProcessAreaList = [];
    this.ProcessList = [];
    this.selectedProcess = new ProcessModelNew();
  }

  Service_GetProcessAreaForServiceArea() {
    this.ProcessAreaList = [];
    this._appservice.GetProcessAreaByServiceAreaIdNew(this.selectedServiceArea.id).subscribe({
      next: (data) => {
        this.ProcessAreaList = data;
        this.OriginalProcessAreaList = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  SaveRows_onClick() {
    let mapping: ProcessChecklistQuestionsMappingModel[] = [];
    for (let chk of this.questionList) {
      let map: ProcessChecklistQuestionsMappingModel = new ProcessChecklistQuestionsMappingModel();
      map.questioN_ID = chk.id;
      map.procesS_ID = this.selectedProcess.id;
      map.checklisT_ID = this.selectedChecklist.id;
      mapping.push(map);
    }
    this.service_UpdateProcessQuestionMapping(mapping);
  }

  ddProcessAreaChange($event: any) {
    this.selectedProcessArea = $event;
    this.Service_GetProcessByProcessArea(this.selectedProcessArea.id);
    this.ProcessList = [];
    this.selectedProcess = new ProcessModelNew();
  }

  ddProcessChange($event: any) {
    this.selectedProcess = $event;
    if (this.selectedChecklist == undefined || this.selectedChecklist.id == undefined || this.selectedChecklist.id == 0) {
      this.myUtil.showWarning("Please select a Checklist");
      return;
    }

    if (this.selectedServiceArea == undefined || this.selectedServiceArea.id == undefined || this.selectedServiceArea.id <= 0) {
      this.myUtil.showWarning('Please select a service Tower, process area and then process');
      return;
    }
    if (this.selectedProcessArea == undefined || this.selectedProcessArea.id == undefined || this.selectedProcessArea.id <= 0) {
      this.myUtil.showWarning('Please select process area and then process');
      return;
    }
    if (this.selectedProcess == undefined || this.selectedProcess.id == undefined || this.selectedProcess.id <= 0) {
      this.myUtil.showWarning('Please select process');
      return;
    }

    this.Service_GetProcessChecklistQuestionsMappingList(
      this.selectedChecklist.id,
      this.selectedProcess.id, 
      this.selectedProcessArea.id, 
      this.selectedServiceArea.id
    );
  }

  getProcessArea(id: number) {
    let processA: ProcessAreaModelNew[] = this.ProcessAreaList.filter(t => t.id == id);
    if (processA != null && processA != undefined && processA.length > 0) {
      return processA[0].title;
    }
    return '';
  }

  Service_GetProcessByProcessArea(processAreaId: number) {
    this.ProcessList = [];
    this._appservice.GetProcessByProcessArea(processAreaId).subscribe({
      next: (data) => {
        this.ProcessList = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessByServiceArea(processModelId: number) {
    this._appservice.GetProcessByServiceArea(processModelId).subscribe({
      next: (data) => {
        // Process mapping logic
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe({
      next: (data) => {
        this.ProcessList = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_UpdateProcessServiceAreaMapping(serviceArea: ServiceAreaModelNew, processList: ProcessModelNew[]) {
    this._appservice.UpdateProcessServiceAreaMapping(serviceArea, processList).subscribe({
      next: (data) => {
        // Success handling
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessChecklistMappingList(processId: number) {
    this._appservice.GetProcessChecklistMappingList(processId).subscribe({
      next: (data) => {
        this.processChecklistMapping = data;
        let ids: number[] = this.processChecklistMapping.map(x => x.checklisT_ID);
        var filteredProcess = this.checklistList.filter(function (itm) {
          return ids.indexOf(itm.id) > -1;
        });
        filteredProcess.forEach((el) => { el.bSelected = true; });
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessChecklistQuestionsMappingList(checklistId: number, processId: number, processAreaId: number, serviceAreaId: number) {
    this._appservice.GetProcessChecklistQuestionsMappingList(checklistId, processId, processAreaId, serviceAreaId).subscribe({
      next: (data) => {
        this.questionList = data;
        this.refreshTable(this.questionList);
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe({
      next: (data) => {
        this.ProcessAreaList = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_UpdateProcessArea(processArea: ProcessAreaModelNew) {
    this._appservice.UpdateProcessArea(processArea).subscribe({
      next: (data) => {
        this.Service_GetProcessAreaList();
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_getChecklistList() {
    this._appservice.getChecklistList().subscribe({
      next: (data) => {
        this.checklistList = data;
        this.originalChecklistList = data;
        this.MapChecklistWithVersion();
        this.selectedChoice = 'latestVersion';
        this.selectversion();
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_UpdateProcessQuestionMapping(mapping: ProcessChecklistQuestionsMappingModel[]) {
    this._appservice.UpdateProcessChecklistQuestionsMapping(mapping).subscribe({
      next: (data) => {
        this.myUtil.showSuccess('Process Questions Mapping done Successfully');
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  ClearInputs() {
    this.selectedProcessArea = new ProcessAreaModelNew();
    this.selectedProcess = new ProcessModelNew();
    this.selectedServiceArea = new ServiceAreaModelNew();
    this.ServiceAreaList = this.OriginalServiceAreaList;
    this.ProcessAreaList = [];
    this.ProcessList = [];
    this.selectedChecklist = new ChecklistModel();
    this.questionList = [];
    this.dataSource = new MatTableDataSource(this.questionList);
  }

  Service_GetMaturiryLevel() {
    this._appservice.getMaturityLevel().subscribe({
      next: (data) => {
        this.originalMaturityLevel = data;
        this.maturityLevel = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  ddChecklistChange($event: any) {
    this.selectedChecklist = $event;
    this.maturityLevel = this.originalMaturityLevel.filter(x => x.procesS_MODEL_ID == this.selectedChecklist.procesS_MODEL_ID);
    if (this.selectedChecklist.iS_WEIGHTAGE_APPLICABLE) {
      this.weightage = this.originalweightage.filter(x => x.checklisT_ID == this.selectedChecklist.id);
      if (this.weightage.length == 0) {
        this.myUtil.showWarning("Weightage is not available for checklist. Please update.");
      }
    }
    this.displayColumnsList();
    this.questionList = [];
    this.dataSource = new MatTableDataSource(this.questionList);
  }

  btnAddQuestion_Onclick() {
    this.checklistinAudit = [];
    this.Service_VerifyChecklistInAudit();

    if (this.selectedChecklist == undefined || this.selectedChecklist.id == undefined || this.selectedChecklist.id == 0) {
      this.myUtil.showWarning("Please select a Checklist to add question");
      return;
    }
    if (this.selectedServiceArea == undefined || this.selectedServiceArea.id == undefined || this.selectedServiceArea.id <= 0) {
      this.myUtil.showWarning('Please select a service Tower');
      return;
    }
    if (this.selectedProcessArea == undefined || this.selectedProcessArea.id == undefined || this.selectedProcessArea.id <= 0) {
      this.myUtil.showWarning('Please select process area and then process');
      return;
    }
    if (this.selectedProcess == undefined || this.selectedProcess.id == undefined || this.selectedProcess.id <= 0) {
      this.myUtil.showWarning('Please select process');
      return;
    }
    if (this.checklistinAudit != undefined && this.checklistinAudit.length > 0) {
      this.myUtil.showWarning("Checklist being used in Audit, new questions cannot be added. Please revise the checklist and then add questions.");
      return;
    }

    this.displayColumnsList();
    this.iEditIndex = this.questionList.length;
    let question = new ChecklistQuestionsModelNew();
    question.checklisT_ID = this.selectedChecklist.id;
    question.id = 0;
    this.questionList.push(question);
    this.dataSource = new MatTableDataSource(this.questionList);
  }

  EditRow_onClick(row: any, id: number) {
    this.iEditIndex = id;
  }

  SaveRow_onClick(row: ChecklistQuestionsModelNew) {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    row.effectivE_FROM = this.effectivefrom.toDateString();
    if (row.title == undefined) {
      this.myUtil.showWarning("Please enter question title");
      return;
    }
    if (row.displaY_ORDER == undefined) {
      this.myUtil.showWarning('Please enter display order for the question');
      return;
    }
    if (this.selectedChecklist.iS_WEIGHTAGE_APPLICABLE) {
      if (row.weightagE_ID == undefined) {
        this.myUtil.showWarning('Please choose the weightage.');
        return;
      }
    }
    if ((specialCharPattern.test(row.title)) || numberPattern.test(row.title)) {
      this.myUtil.showWarning('Please enter alphanumeric or numeric values along with special characters for question title');
      return;
    }

    if (row.id == undefined || row.id == 0)
      this.service_addChecklistQuestion(row);
    else
      this.service_UpdateChecklistQuestion(row);
    this.iEditIndex = -1;
  }

  CancelEdit_onClick(row: any) { 
    this.iEditIndex = -1; 
  }

  DeleteRow_onClick(row: ChecklistQuestionsModelNew) {
    if (row.id === undefined || row.id === 0) {
      this.questionList.splice(this.questionList.indexOf(row), 1);
      this.dataSource = new MatTableDataSource(this.questionList);
    }
    else {
      let newRow = new ChecklistQuestionInput();
      newRow.checklisT_ID = this.selectedChecklist.id;
      newRow.procesS_AREA_ID = this.selectedProcessArea.id;
      newRow.servicE_AREA_ID = this.selectedServiceArea.id;
      newRow.procesS_ID = this.selectedProcess.id;
      newRow.questioN_ID = row.id;
      this.service_DeleteChecklistQuestion(newRow);
    }
  }

  service_DeleteChecklistQuestion(question: ChecklistQuestionInput) {
    this._appservice.DeleteChecklistQuestion(question).subscribe({
      next: (data) => {
        this.myUtil.showSuccess('Question Deleted Successfully');
        this.Service_GetProcessChecklistQuestionsMappingList(
          this.selectedChecklist.id, 
          this.selectedProcess.id, 
          this.selectedProcessArea.id, 
          this.selectedServiceArea.id
        );
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_getChecklistQuestionList(checklistId: number) {
    this._appservice.getChecklistQuestionList(checklistId).subscribe({
      next: (data) => {
        this.questionList = data;
        this.dataSource = new MatTableDataSource(this.questionList);
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  GetWeightageTitle(id: number) {
    let weight = this.weightage.filter(t => t.id == id);
    if (weight.length > 0)
      return weight[0].weightagE_TITLE + '(' + weight[0].weightagE_SCORE + ')';
    else
      return '';
  }

  GetCategoryTitle(id: number) {
    let cat = this.category.filter(t => t.id == id);
    if (cat.length > 0)
      return cat[0].shorT_DESC;
    else
      return '';
  }

  GetWeightageScore(id: number) {
    let weight = this.weightage.filter(t => t.id == id);
    if (weight.length > 0)
      return weight[0].weightagE_SCORE;
    else
      return '';
  }

  getWeightageForAllChecklist() {
    this._appservice.getWeightageForAllChecklist().subscribe({
      next: (data) => {
        this.originalweightage = data;
        this.weightage = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  getMaturityLevelTitle(id: number) {
    let element = this.originalMaturityLevel.find(x => x.maturitY_LEVEL_ID == id);
    if (element != undefined)
      return element.leveL_TITLE;
    else
      return "";
  }

  service_UpdateChecklistQuestion(question: ChecklistQuestionsModelNew) {
    this._appservice.UpdateChecklistQuestion(
      question, 
      this.selectedProcess.id, 
      this.selectedProcessArea.id, 
      this.selectedServiceArea.id
    ).subscribe({
      next: (data) => {
        this.Service_GetProcessChecklistQuestionsMappingList(
          this.selectedChecklist.id, 
          this.selectedProcess.id, 
          this.selectedProcessArea.id, 
          this.selectedServiceArea.id
        );
        this.myUtil.showSuccess('Question Updated Successfully');
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_addChecklistQuestion(question: ChecklistQuestionsModelNew) {
    this._appservice.AddChecklistQuestion(
      question, 
      this.selectedProcess.id, 
      this.selectedProcessArea.id, 
      this.selectedServiceArea.id
    ).subscribe({
      next: (data) => {
        this.myUtil.showSuccess('Question Added Successfully');
        this.Service_GetProcessChecklistQuestionsMappingList(
          this.selectedChecklist.id, 
          this.selectedProcess.id, 
          this.selectedProcessArea.id, 
          this.selectedServiceArea.id
        );
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }
}

export class ChecklistQuestionInput {
  questioN_ID!: number;
  checklisT_ID!: number;
  servicE_AREA_ID!: number;
  procesS_AREA_ID!: number;
  procesS_ID!: number;
}
