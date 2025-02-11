import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ChecklistModel, PM_MATURITYLEVEL_MAPPING, AuditCheckListWeightage, AuditStatusList, ChecklistQuestionsModelNew } from './../../../models/checklist-model';
import { AppsService } from './../../../Services/apps.service';
import { ProcessModelNew } from './../../../models/audit-checklist-based-model';
import { myUtility } from './../../../Shared/myUtility';
import { MatTableDataSource, MatSelect, MatCheckboxChange, MatCheckbox, MatSort, MatIcon } from '@angular/material';
import { ProcessModelService } from './../process-model.service';
import { L } from '@angular/core/src/render3';

@Component({
  selector: 'app-setup-checklist-new',
  templateUrl: './setup-checklist-new.component.html',
  styleUrls: ['./setup-checklist-new.component.scss']
})
export class SetupChecklistNewComponent implements OnInit {
  bShowFilter: boolean = true;
  result: any[] = [];
  bAddNewChecklist: boolean;
  newChecklist: ChecklistModel = new ChecklistModel();
  ProcessModelList: ProcessModelNew[] = [];
  maturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  originalMaturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  weightage: AuditCheckListWeightage[] = [];
  originalweightage: AuditCheckListWeightage[] = [];
  showAddCategory: boolean;
  displayedColumns = ["index", "title", "description", "version", "effectivE_FROM", "procesS_MODEL_ID", "Action", "approve"];
  // dataSource: MatTableDataSource<ChecklistModel> = new MatTableDataSource<this.>();
  dataSource = new MatTableDataSource(this.result);
  checklistList: ChecklistModel[] = [];
  @ViewChild("paginator") paginator;
  @ViewChild(MatSort) sort: MatSort;
  findingsType: any[] = [];
  findingTypeValues: any[] = [];

  originalFindingValues: any[] = [];
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild("modelSelect") modelSelect: MatSelect
  newWeightageRec: AuditCheckListWeightage = new AuditCheckListWeightage();
  statusList: any[];
  showStatusList: boolean;
  statustitle: string = "";
  metStatusValues: AuditStatusList[] = [];
  nmetStatusValues: AuditStatusList[] = [];
  naStatusValues: AuditStatusList[] = [];
  isApproveClicked: boolean = false;
  @ViewChild('AllChecked') AllChecked: MatCheckbox;
  approversList: any[] = [];
  effectivE_FROM: Date = new Date();
  existingStatusList: any[] = [];
  disableStatusSave: boolean;
  Findingsid: number;

  selectedChoice: number = 2
  isSaved: boolean = true;
  errorStr: string = "";
  filterCriteria: any;
  weightageId: number;

  checklistUsedInAssessment: any[] = [];
  isWeightageDisabled: boolean = false;
  questionList: ChecklistQuestionsModelNew[] = [];
  isDisabled: boolean = false;
  //isChecklistAdded: boolean = false;
  //selectedWeightage : AuditCheckListWeightage[] = [];
  //@ViewChild('WeightageChecked') WeightageChecked: MatCheckbox;

  constructor(public _appservice: AppsService, public _util: myUtility, public _processService: ProcessModelService, public cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    //debugger;
    this.Service_GetProcessModelList();
    this.Service_GetMaturiryLevel();
    this.service_getChecklistList();
    this.Service_GetAuditStatusList();
    this.Service_getApproversList();
    this.Service_getchecklistStatusList();
    this.Service_getFindingsTypeList();
    this.Service_GetWeightage();
    //this.Service_GetChecklistUsedInSubmitAssessment();
    // this.metStatusValues.push(new AuditStatusList());
    // this.naStatusValues.push(new AuditStatusList());
    // this.nmetStatusValues.push(new AuditStatusList());

  }
  CancelOnClick() {
    this.showStatusList = false;
  }

  deleteNewMetStatusRow(index) {
    this.metStatusValues.splice(index, 1);
  }

  deleteNewNMetStatusRow(index) {
    this.nmetStatusValues.splice(index, 1);
  }

  deleteNewNAStatusRow(index) {
    this.naStatusValues.splice(index, 1);
  }

  Service_getFindingsTypeList() {
    this._appservice.getFindingsTypeList().subscribe(data => {
      this.findingsType = data.findingsType;
      //  this.findingTypeValues = data.findingTypeValues;
      this.originalFindingValues = data.findingTypeValues;
    })
  }

  filterValues() {
    this.findingTypeValues = this.originalFindingValues.filter(x => x.findingstypE_ID == this.newChecklist.findingstypE_ID);
  }

  Service_getchecklistStatusList() {
    this._appservice.getAuditStatusList().subscribe(data => {
      this.existingStatusList = data;
    },
      (error) => { this._util.serviceError(error) })
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  btnClearChecklist_Onclick() {
    this.newChecklist = new ChecklistModel();
    this.effectivE_FROM = new Date();
    this.isWeightageDisabled = false;
    this.isDisabled = false;
    this.weightage = this.originalweightage;
  }

  Service_getApproversList() {
    this._appservice.getChecklistApproversList().subscribe(data => {
      this.approversList = data;
    },
      (error) => { this._util.serviceError(error) });
  }

  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe(data => {
      this.ProcessModelList = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetAuditStatusList() {
    this._appservice.getAuditStatusList().subscribe(data => {
      this.statusList = data;
    },
      (error) => { this._util.serviceError(error) })
  }

  service_getChecklistList() {
    this._appservice.getChecklistList().subscribe(data => {
      this.checklistList = data;
      this.selectversion();
      this.checklistList.forEach(x => x.iS_CHECKED = false);
      this._processService.checklists = this.checklistList;
      //this.refreshTable(this.checklistList);
      this.result = this.checklistList;
    }, error => { this._util.serviceError(error); });
  }
  selectversion() {

    if (this.selectedChoice == 2) {
      this.getLatestVersion(this.checklistList);
    }
    else {
      this.checklistList.sort((a, b) => a.effectivE_FROM > b.effectivE_FROM ? -1 : a.effectivE_FROM < b.effectivE_FROM ? 1 : 0);
      this.result = this.checklistList;
      this.refreshTable(this.checklistList);
    }

    this.refreshTable(this._util.ApplyCriteriaRange(this.filterCriteria, this.result));

  }

  getLatestVersion(checklist: ChecklistModel[]) {
    checklist.sort(function (a, b) {
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
    for (var i = 0; i < checklist.length; i++) {
      if (!set.has(checklist[i].title)) {
        output.push(checklist[i]);
        set.add(checklist[i].title);
      }

    }


    output.sort((a, b) => a.effectivE_FROM > b.effectivE_FROM ? -1 : a.effectivE_FROM < b.effectivE_FROM ? 1 : 0);
    this.result = output;
    this.refreshTable(output);
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

  refreshTable(datasource) {
    this.dataSource = new MatTableDataSource(datasource);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  IsApprover() {
    let empid = localStorage.getItem('empid');
    let element = this.approversList.find(x => x == empid);
    if (element != undefined)
      return true;
    else
      return false;
  }

  getProcessModelName(processmodelid) {
    let element = this.ProcessModelList.find(x => x.id == processmodelid);
    if (element != undefined)
      return element.title;
    else
      return "";
  }

  getdecimalValue(value: number) {
    let str = value.toString();
    return parseFloat(str);
  }

  addNewMetStatusRow() {
    let newRow = new AuditStatusList();
    this.metStatusValues.push(newRow);
  }

  addNewNMetStatusRow() {
    let newRow = new AuditStatusList();
    this.nmetStatusValues.push(newRow);
  }

  addNewNAStatusRow() {
    let newRow = new AuditStatusList();
    this.naStatusValues.push(newRow);
  }


  saveStatusRecord() {
    // let metstatusArray
    // // = this.metStatusValues.split(',');
    // let nmetstatusArray
    // // = this.nmetStatusValues.split(',');
    // let nastatusArray
    // // = this.naStatusValues.split(',');

    // if (this.statustitle == undefined || this.metStatusValues.length == 0 || this.nmetStatusValues.length == 0 || this.naStatusValues.length == 0) {
    //   alert('Please enter all/appropriate Status Title and Value');
    //   return;
    // }
    if (!this.statustitle || this.statustitle.length === 0) {
      alert('Please enter status title');
      return;
    }

    let metStatusValidation = false;
    this.metStatusValues.forEach(
      function (status) {
        if (status.status && !isNaN(status.multiplier)) {
          metStatusValidation = true;
        }
      });

    if (!metStatusValidation) {
      alert('Please enter valid Pass value and multiplier');
      return;
    }

    let nmetStatusValidation = false;
    this.nmetStatusValues.forEach(
      function (status) {
        if (status.status && !isNaN(status.multiplier)) {
          nmetStatusValidation = true;
        }
      });

    if (!nmetStatusValidation) {
      alert('Please enter valid Fail value and multiplier');
      return;
    }

    let naStatusValidation = false;
    this.naStatusValues.forEach(
      function (status) {
        if (status.status && !isNaN(status.multiplier)) {
          naStatusValidation = true;
        }
      });

    if (!naStatusValidation) {
      alert('Please enter valid N/A value and multiplier');
      return;
    }

    let anyrec = this.existingStatusList.find(x => x.statuS_TITLE.trim() == this.statustitle.trim())
    if (anyrec != undefined) {
      alert('There is already an entry with the same name exists. Try using the same name or add a different status list name');
      return;
    }
    this.disableStatusSave = true;

    if (this.statustitle != undefined && this.metStatusValues.length > 0) {
      this._appservice.addStatusValues(this.statustitle, this.metStatusValues, this.nmetStatusValues, this.naStatusValues).subscribe(data => {
        this.statusList.push(data);
        alert('Status list added Successfully');
        this.disableStatusSave = false;
        this.statustitle = undefined;
        this.metStatusValues = [];
        this.nmetStatusValues = [];
        this.naStatusValues = [];
        this.showStatusList = false;
      },
        (error) => { alert('There is an error in adding status list'); this.disableStatusSave = false; });
    }
  }

  // saveNewWeightage() {
  //   //debugger
  //   if(this.newChecklist.id  == 0 || this.newChecklist.id == null)
  //     {
  //       alert("Please update the weightage after checklist creation.");
  //       return;
  //     }
  //   if (this.newWeightageRec.weightagE_TITLE != undefined && this.newWeightageRec.weightagE_SCORE != undefined) {     
  //     this.newWeightageRec.isactive = true;
  //     this.newWeightageRec.updateD_DATE = new Date();
  //     this.newWeightageRec.createD_DATE = new Date();
  //     this.newWeightageRec.checklisT_ID = this.newChecklist.id;     
  //     this._appservice.addWeightageForChecklist(this.newWeightageRec,this.newChecklist.id).subscribe(data => {
  //       alert('New Weightage record added successfully');
  //       this.newWeightageRec = new AuditCheckListWeightage();
  //       this.showAddCategory = false;
  //     },
  //       (error) => {
  //         this._util.serviceError(error);
  //       });
  //     }    
  //   else {
  //     alert('Please enter weightage and score');
  //   }

  // }

  loadApplicableMaturityLevel(processmodelid) {

    this.maturityLevel = this.originalMaturityLevel.filter(x => x.procesS_MODEL_ID == processmodelid);

  }

  // loadWeightageScore(weightageId) {
  //  debugger ;
  //   var weightage = this.originalweightage.filter(x => x.id == weightageId);

  //   if (weightage != undefined && weightage.length > 0) {

  //     this.newWeightageRec.weightagE_ID= weightage[0].id ;
  //     this.newWeightageRec.weightagE_TITLE = weightage[0].weightagE_TITLE;
  //     this.newWeightageRec.weightagE_SCORE = weightage[0].weightagE_SCORE//this.originalweightage.filter(x => x.id == weightageId)[0].weightagE_SCORE;
  //   }
  // }

  Service_GetMaturiryLevel() {
    this._appservice.getMaturityLevel().subscribe(data => {
      this.originalMaturityLevel = data;
      this.maturityLevel = data;
    }, error => { this._util.serviceError(error) })
  }

  Service_GetWeightage() {
    this._appservice.getWeightage().subscribe(data => {
      this.originalweightage = data;
      this.weightage = data;
      this.originalweightage.forEach(x => x.iS_CHECKED = true);
      this.weightage.forEach(x => x.iS_CHECKED = true);
    }, error => { this._util.serviceError(error) })
  }

  Service_GetWeightageForChecklist(checklistId) {
    //this.originalweightage = [];
    this.weightage = [];
    this._appservice.getWeightageForChecklist(checklistId).subscribe(data => {
      //this.originalweightage = data;
      this.weightage = data;
      if (this.weightage.length > 0) {
        var checklistSubmitted = this.weightage.filter(x => x.iS_USED_IN_SUMBITTED_ASSESSMENT);
        this.isWeightageDisabled = checklistSubmitted.length > 0 ? true : false;
      }
    }, error => { this._util.serviceError(error) })
  }

  service_getChecklistQuestionList(checklistId) {
    this._appservice.getChecklistQuestionList(checklistId).subscribe(data => {
      this.questionList = data;


    }, error => { this._util.serviceError(error); });
  }

  // Service_GetChecklistUsedInSubmitAssessment() {
  //   this._appservice.getChecklistUsedInSubmitAssessment().subscribe(data => {
  //     this.checklistUsedInSubmittedAssessment = data;      
  //   }, error => { this._util.serviceError(error) })
  // }



  btnAddNewCategory() {
    this.showAddCategory = !this.showAddCategory;
  }

  checkAll(event: MatCheckboxChange) {
    if (event.checked)
      this.checklistList.forEach(x => x.iS_CHECKED = true);
    else
      this.checklistList.forEach(x => x.iS_CHECKED = false);
  }

  toggleCheck(event: MatCheckboxChange) {
    if (!event.checked) {
      this.AllChecked.checked = false;
      return;
    }

    let element = this.checklistList.find(x => x.iS_CHECKED == false);
    if (element != undefined)
      this.AllChecked.checked = false;
    else
      this.AllChecked.checked = true;
  }

  EditRow_onClick(element: ChecklistModel) {
    this.newChecklist = element;
    this.effectivE_FROM = new Date(this.newChecklist.effectivE_FROM.toString());

    this.loadApplicableMaturityLevel(this.newChecklist.procesS_MODEL_ID);
    this.Service_GetWeightageForChecklist(this.newChecklist.id);
    this.service_getChecklistQuestionList(this.newChecklist.id);
    this.getchecklistUsedInAssessment();
    //this.isChecklistAdded = false;


  }

  DeleteRow_onClick(element: ChecklistModel) {
    if (confirm('Are you sure want to delete?')) {
      this.service_deleteChecklist(element);
    }
  }

  ReviseChecklist_onClick(element: ChecklistModel) {
    if (confirm('This will create a new version of checkpoints. Do you want to continue?')) {
      element.version = parseFloat((element.version + 0.01).toString());
      element.effectivE_FROM = new Date().toDateString();
      element.createD_DATE = new Date().toDateString();
      element.createD_BY = localStorage.getItem('empid');
      element.updateD_BY = localStorage.getItem('empid');
      element.updateD_DATE = new Date().toDateString();;
      element.iS_APPROVED = false;
      this.service_reviseChecklist(element, element.id);
    }
  }

  ApproveChecklist_onClick() {
    var checklists = this.checklistList.filter(x => x.iS_CHECKED == true);
    this.service_approveChecklist(checklists);
  }

  service_approveChecklist(checklists: ChecklistModel[]) {
    this._appservice.approveChecklist(checklists).subscribe(data => {
      alert('Selected Checklists approved Successfully');
      this.service_getChecklistList();
    }, error => { this._util.serviceError(error); });
  }

  service_reviseChecklist(element: ChecklistModel, oldchecklistid: number) {
    this._appservice.reviseChecklist(element, oldchecklistid).subscribe(data => {
      alert('Checklist revised Successfully');
      this.service_getChecklistList();
    }, error => { this._util.serviceError(error); });

  }


  btnSaveChecklist_Onclick() {

    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (this.newChecklist.title == undefined || this.newChecklist.title.trim() == "") {
      alert('Please enter title');
      return;
    }
    if (this.newChecklist.description == undefined || this.newChecklist.description.trim() == "") {
      alert('Please enter description');
      return;
    }
    if (this.newChecklist.version == undefined || this.newChecklist.version == 0) {
      alert('Please enter version');
      return;
    }
    if (isNaN(this.newChecklist.version)) {
      alert('Please enter valid version');
      return;
    }
    if (this.newChecklist.version.toString().length > 11) {
      alert('Please enter a version with less than 10 digits');
      return;
    }
    if (this.newChecklist.effectivE_FROM == undefined) {
      alert('Please enter effective date');
      return;
    }
    if (this.newChecklist.maturitY_LEVEL) {

      if (this.newChecklist.procesS_MODEL_ID == undefined || this.newChecklist.procesS_MODEL_ID == 0) {
        alert('Please select a process model');
        return;
      }

      if (this.maturityLevel.length == 0) {
        alert("Maturity Level scores are not defined for the selected Process Model. Please define the Maturity Level scores before proceeding further.");
        return;
      }
    }

    if (this.newChecklist.correctivE_ACTION_TRACKING) {
      if (isNaN(this.newChecklist.findingstypE_ID) || this.newChecklist.findingstypE_ID == null) {
        alert('Please select findings type');
        return;
      }
    }

    if (isNaN(this.newChecklist.statuS_LIST_ID) || this.newChecklist.statuS_LIST_ID == null) {
      alert('Please choose a status list');
      return;
    }

    if (this.newChecklist.iS_WEIGHTAGE_APPLICABLE) {
      if (this.weightage.length == this.weightage.filter(x => x.iS_CHECKED == false).length) {
        alert('Please choose the weightage.');
        return;
      }

    }

    if ((specialCharPattern.test(this.newChecklist.title)) || numberPattern.test(this.newChecklist.title)) {
      alert('Please enter alphanumeric or numeric values along with special characters for title');
      return;
    }
    if ((specialCharPattern.test(this.newChecklist.description)) || numberPattern.test(this.newChecklist.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }

    this.newChecklist.createD_DATE = new Date().toDateString();
    this.newChecklist.updateD_DATE = new Date().toDateString();
    this.newChecklist.effectivE_FROM = this._util.setLocaleDate(this.newChecklist.effectivE_FROM).toDateString();

    if (this.newChecklist.id == 0 || this.newChecklist.id == undefined) {
      //this.isChecklistAdded = true;
      this.service_addChecklist(this.newChecklist);
    }
    else {
      //this.isChecklistAdded = false;
      this.service_updateChecklist(this.newChecklist);
    }
  }
  btnSaveCopyChecklist_Onclick() {
    this.service_getChecklistList();
    const currentDateTime = new Date().toLocaleString();
    const checkistTitle = prompt("Save the title as", `Copy-${currentDateTime} - ${this.newChecklist.title}`);
    this.service_saveChecklistCopy(this.newChecklist.id, checkistTitle);

  }

  service_saveChecklistCopy(id, checkistTitle) {
    this._appservice.saveChecklistCopy(id, checkistTitle).subscribe(data => {
      alert('Checklist saved successfully');
      this.service_getChecklistList();
    }, error => { this._util.serviceError(error); });
  }

  service_updateChecklist(checklistToUpdate: ChecklistModel) {
    this._appservice.updateChecklist(checklistToUpdate).subscribe(data => {
      if (checklistToUpdate.iS_WEIGHTAGE_APPLICABLE) {
        this.newChecklist.id = checklistToUpdate.id;
        this.UpdateWeightageScores();
      }
      alert('Checklist updated successfully');
      this.newChecklist = new ChecklistModel();
      this.effectivE_FROM = new Date();
      this.isWeightageDisabled = false;
      this.weightage = this.originalweightage;
      this.service_getChecklistList();
    }, error => { this._util.serviceError(error); });
  }


  service_deleteChecklist(checklistToDelete: ChecklistModel) {
    this._appservice.deleteChecklist(checklistToDelete).subscribe(data => {
      alert('Checklist deleted successfully');
      this.service_getChecklistList();
    }, error => {
      this._util.serviceError(error);
      this.errorStr = error.error
      alert(this.errorStr)
      this.errorStr = '';
    });
  }

  service_addChecklist(newChecklist: ChecklistModel) {
    this.isSaved = false;
    this._appservice.addChecklist(newChecklist).subscribe(data => {
      if (data.id > 0) {
        this.isSaved = true;
        if (newChecklist.iS_WEIGHTAGE_APPLICABLE) {
          this.newChecklist.id = data.id;
          this.UpdateWeightageScores();
        }
        alert('Checklist added successfully');
        this.newChecklist = new ChecklistModel();
        this.service_getChecklistList();
      }
    }, error => { this._util.serviceError(error); this.isSaved = true });
  }

  Filter_onChange($event) {

    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.selectversion();
    filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.result);
    // return;
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  showAll($event) {
    //this.AllChecked = $event;
  }


  chkweighatgechange(event: MatCheckboxChange, weightageId: number) {

    if (event.checked)
      this.weightage.find(x => x.id == weightageId).iS_CHECKED = true;
    else

      if (this.questionList.length > 0 && this.newChecklist.id > 0) {
        var weightageUsedinquestions = this.questionList.filter(x => x.weightagE_ID == weightageId);
        if (weightageUsedinquestions.length > 0) {
          if (confirm('If you remove the weightage it will impact the checklist questions. Are you sure to remove?')) {
            this.weightage.find(x => x.id == weightageId).iS_CHECKED = false;
          }
          else {
            this.weightage.find(x => x.id == weightageId).iS_CHECKED = true;
            event.source.checked = true;
            return false;
          }
        }
      }
      else
        this.weightage.find(x => x.id == weightageId).iS_CHECKED = false;

  }

  UpdateWeightageScores() {
    //debugger;
    if (this.newChecklist.id == 0 || this.newChecklist.id == null) {
      alert("Please update weightage after checklist created.");
      return;
    }

    this._appservice.UpdateWeightageForChecklist(this.weightage, this.newChecklist.id).subscribe(data => {
      this.weightage = data;
      // if (!this.isChecklistAdded) {
      //   alert("Weightage updated for checklist.");
      // }
    },
      (error) => {
        this._util.serviceError(error);
      });
  }

  getchecklistUsedInAssessment() {
    debugger;
    this._appservice.getChecklistUsedInAssessment().subscribe(data => {
      this.checklistUsedInAssessment = data;
      var checklistInUse = this.checklistUsedInAssessment.filter(x => x.checklisT_ID == this.newChecklist.id)
      if (checklistInUse.length > 0)
        this.isDisabled = true;
      else
        this.isDisabled = false;
    }, error => { this._util.serviceError(error); });

  }

}