import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { ChecklistQuestionsModel, QuestionsModel } from '../../../models/checklist-questions-model';
import { MatSelectChange, MatTableDataSource } from '@angular/material';
import { ChecklistModel, ChecklistQuestionsModelNew, PM_MATURITYLEVEL_MAPPING } from '../../../models/checklist-model';
import { ProcessModelNew } from '../../../models/audit-checklist-based-model';
import { ProcessModelService } from './../process-model.service';

@Component({
  selector: 'app-setup-checklist',
  templateUrl: './setup-checklist.component.html',
  styleUrls: ['./setup-checklist.component.scss']
})
export class SetupchecklistComponent implements OnInit {
  bShow: Boolean = false;
  bAddNewChecklist = false;
  selectedChecklist: ChecklistModel = new ChecklistModel();
  newChecklist: ChecklistModel = new ChecklistModel();
  checklistList: ChecklistModel[] = [];
  questionList: ChecklistQuestionsModelNew[] = [];
  iEditIndex = -1;
  displayedColumns = ["index", "title", "weightagE_ID", "globaL_PERSPECTIVE_ID", "maturitY_LEVEL", "effectivE_FROM", "edit", "delete"];

  hideWeightage: boolean = false;
  hideMaturity: boolean = false;

  weigtageid: number;
  selectedProcessModel: number = 0;
  processModel: any;
  processServiceArea: any
  processArea: any
  processList: any;
  weightage: any;
  category: any
  savedQuestionList: ChecklistQuestionsModel[]
  clauses: any
  selectionVersion: ChecklistQuestionsModel
  checkListSetUpList: ChecklistQuestionsModel[] = []
  checkListSetUp: ChecklistQuestionsModel = new ChecklistQuestionsModel()
  dataSource = new MatTableDataSource(this.questionList);
  ProcessModelList: ProcessModelNew[];
  showAddCategory: boolean;
  newWeightageName: string;
  maturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  originalMaturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  effectivefrom = new Date();
  constructor(private _appservice: AppsService, private _util: myUtility, public _processService: ProcessModelService) { }
  ngOnInit() {
    this.LoadData()
  }
  LoadData() {
    this.Service_GetProcessModelList();
    this.Service_GetMaturiryLevel();
    this.getWeightage();
    this.getCategory();
  }

  ddChecklistChange() {
    this.iEditIndex = -1;
    this.maturityLevel = this.originalMaturityLevel.filter(x => x.procesS_MODEL_ID == this.selectedChecklist.procesS_MODEL_ID);
    this.displayColumnsList();
    this.service_getChecklistQuestionList(this.selectedChecklist.id);
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

  getMaturityLevelTitle(id) {
    let element = this.originalMaturityLevel.find(x => x.maturitY_LEVEL_ID == id);
    if (element != undefined)
      return element.leveL_TITLE;
    else
      return "";
  }

  btnAddChecklist_Onclick() {
    this.bAddNewChecklist = true;
    this.maturityLevel = undefined
    this.newChecklist = new ChecklistModel();
  }

  loadApplicableMaturityLevel(processmodelid) {
    this.maturityLevel = this.originalMaturityLevel.filter(x => x.procesS_MODEL_ID == processmodelid);
  }

  btnAddNewCategory() {
    this.showAddCategory = !this.showAddCategory;
  }
  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe(data => {
      this.ProcessModelList = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetMaturiryLevel() {
    this._appservice.getMaturityLevel().subscribe(data => {
      this.originalMaturityLevel = data;
      this.maturityLevel = data;
    }, error => { this._util.serviceError(error) })
  }
  btnCancelChecklist_Onclick() {
    this.bAddNewChecklist = false;
  }
  btnSaveChecklist_Onclick() {
    this.service_addChecklist(this.newChecklist);
    this.bAddNewChecklist = false;
  }
  btnAddQuestion_Onclick() {
    if (this.selectedChecklist.id == undefined) {
      alert("Please select a Checklist to add question");
      return;
    }
    this.displayColumnsList();
    this.iEditIndex = this.questionList.length;
    let question = new ChecklistQuestionsModelNew();
    question.checklisT_ID = this.selectedChecklist.id;
    question.id = 0;
    this.questionList.push(question);
    console.log("question list", this.questionList);
    this.dataSource = new MatTableDataSource(this.questionList);
  }

  EditRow_onClick(row, id) {
    this.iEditIndex = id;
  }
  SaveRow_onClick(row: ChecklistQuestionsModelNew) {
    row.effectivE_FROM = this.effectivefrom.toDateString();
    if (row.title == undefined) {
      alert("Please enter question title");
      return;
    }
    console.log("row to add", row);
    if (row.id == undefined || row.id == 0)
    {
      
    }
     // this.service_addChecklistQuestion(row);
   // else
//this.service_UpdateChecklistQuestion(row);
    this.iEditIndex = -1;
  }
  CancelEdit_onClick(row) { this.iEditIndex = -1; }
  DeleteRow_onClick(row) {
    if (row.id === undefined || row.id === 0) {
      this.questionList.splice(this.questionList.indexOf(row), 1);
      this.dataSource = new MatTableDataSource(this.questionList);
    }
    //else
      //this.service_DeleteChecklistQuestion(row);
  }
  GetWeightageTitle(id) {
    let weight = this.weightage.filter(t => t.id == id)
    if (weight.length > 0)
      return weight[0].weightagE_TITLE;
    else
      return '';
  }
  GetCategoryTitle(id) {
    let cat = this.category.filter(t => t.id == id)
    if (cat.length > 0)
      return cat[0].shorT_DESC;
    else
      return '';
  }
  getWeightage() {
    this._appservice.getQuestionWeightage().subscribe(data => {
      this.weightage = data;
    },
      error => { this._util.serviceError(error); })
  }
  getModelClauses(modelId) {
    this.getSAListFromPSPD(this.checkListSetUp.customeR_ID, this.checkListSetUp.projecT_ID, modelId)
    this._appservice.getModelClauses(modelId).subscribe(data => {
      this.clauses = data;
    },
      error => { this._util.serviceError(error); })
  }
  getCategory() {
    this._appservice.getQuestionCategory().subscribe(data => {
      this.category = data;
    },
      error => { this._util.serviceError(error); })
  }
  getProcessModel() {
    this._appservice.getProcessModel().subscribe(data => {
      this.processModel = data;
      this.getServiceArea()
    },
      error => { this._util.serviceError(error); })
  }
  getSavedQuestions() {
    if (this.checkListSetUp.customeR_ID != undefined && this.checkListSetUp.projecT_ID && this.checkListSetUp.procesS_MODEL_ID != undefined && this.checkListSetUp.servicE_AREA_ID != undefined && this.checkListSetUp.procesS_ID != undefined) {
      this._appservice.getSavedCheckListQuestions(this.checkListSetUp).subscribe(data => {
        this.checkListSetUp = data;
      },
        error => { this._util.serviceError(error); })
    }
    else
      this.savedQuestionList = []
  }
  getServiceArea() {
    this._appservice.getServiceArea().subscribe(data => {
      this.processServiceArea = data;
    },
      error => { this._util.serviceError(error); })
  }
  addNewRow() {
    let ques: QuestionsModel = new QuestionsModel()
    ques.procesS_ID = this.checkListSetUp.procesS_ID

    this.checkListSetUp.questionS_MODEL.push(ques)
  }
  removeRow(i) {
    this.checkListSetUp.questionS_MODEL.splice(i, 1);
    this.checkListSetUp.questionS_MODEL = this.checkListSetUp.questionS_MODEL
  }
  EditRow(row: QuestionsModel, i) {
    this.checkListSetUp.questionS_MODEL[i] = row;
  }
  // processModelChange(event: MatSelectChange) {
  //   let modelId = event.value;
  //   this._appservice.getServiceAreaforModel(modelId).subscribe(data => {
  //     this.processServiceArea = data;
  //   },
  //     error => { this._util.serviceError(error); })
  // }
  processModelChange() {
    // this._appservice.getProcessAreaForModelandSA(this.checkListSetUp.procesS_MODEL_ID ,this.checkListSetUp.servicE_AREA_ID).subscribe(data => {
    //   this.processArea = data;
    // }, error => { this._util.serviceError(error); });
    this._appservice.getProcessAreaandProcessForSA(this.checkListSetUp.customeR_ID, this.checkListSetUp.projecT_ID, this.checkListSetUp.procesS_MODEL_ID, this.checkListSetUp.servicE_AREA_ID).subscribe(data => {
      this.processArea = data;
    }, error => { this._util.serviceError(error); });
  }
  getProcessForArea(areaId) {
    this._appservice.getProcessSQA(areaId).subscribe(data => {
      this.processList = data;
    }, error => { this._util.serviceError(error); });
  }
  SelectedVersion(version: ChecklistQuestionsModel) {
    this.checkListSetUp = this.selectionVersion
  }
  SubmitForm() {
    this._appservice.saveCheckListQuestions(this.checkListSetUp).subscribe(data => {
      this.checkListSetUp = data
      this.getSavedQuestions();
      //this.checkListSetUp = new ChecklistQuestionsModel()
    }, error => { this._util.serviceError(error); });
  }
  ClearAll() {
    this.checkListSetUp = new ChecklistQuestionsModel()
    this.savedQuestionList = []
  }
  SaveAsNewVersion() {
    if (confirm("Save As will create next version of the checkpoints.Do you want to confirm?")) {
      this.checkListSetUp.versionid = this.checkListSetUp.versionid + 0.01;
      this.checkListSetUp.issubmitted = true
      this.saveNewCheckListVersion()
    }
    {

    }
  }
  saveNewCheckListVersion() {
    this._appservice.saveNewCheckListVersion(this.checkListSetUp).subscribe(data => {
      this.checkListSetUp = data;
    },
      error => { this._util.serviceError(error); })
  }
  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.checkListSetUp.customeR_ID = obj.customer;
    this.checkListSetUp.projecT_ID = obj.project;
    this.getModelListFromPSPD(this.checkListSetUp.customeR_ID, this.checkListSetUp.projecT_ID)
    this.getCheckPointsHistory(this.checkListSetUp.customeR_ID, this.checkListSetUp.projecT_ID)
    //this.getApplicableProcess(this.checkListSetUp.customeR_ID, this.checkListSetUp.projecT_ID)
  }

  // service_UpdateChecklistQuestion(question: ChecklistQuestionsModelNew) {
  //   this._appservice.UpdateChecklistQuestion(question).subscribe(data => {
  //     this.service_getChecklistQuestionList(this.selectedChecklist.id);
  //     alert('Question Updated Successfully');
  //   }, error => { this._util.serviceError(error); });
  // }
  // service_addChecklistQuestion(question: ChecklistQuestionsModelNew) {
  //   this._appservice.AddChecklistQuestion(question).subscribe(data => {
  //     alert('Question Added Successfully');
  //     this.service_getChecklistQuestionList(this.selectedChecklist.id);
  //   }, error => { this._util.serviceError(error); });
  // }
  // service_DeleteChecklistQuestion(question: ChecklistQuestionsModelNew) {
  //   this._appservice.DeleteChecklistQuestion(question).subscribe(data => {
  //     alert('Question Deleted Successfully');
  //     this.service_getChecklistQuestionList(this.selectedChecklist.id);
  //   }, error => { this._util.serviceError(error); });
  // }

  service_getChecklistList() {
    this._appservice.getChecklistList().subscribe(data => {
      this.checklistList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_addChecklist(newChecklist: ChecklistModel) {
    // this._appservice.addChecklist(newChecklist, newChecklist.procesS_MODEL_ID, this.newWeightageName).subscribe(data => {
    //   alert('Checklist Added Successfully');
    //   this.service_getChecklistList();
    // }, error => { this._util.serviceError(error); });
  }

  service_getChecklistQuestionList(checklistId) {
    this._appservice.getChecklistQuestionList(checklistId).subscribe(data => {
      this.questionList = data;
      console.log("questions", this.questionList);
      this.dataSource = new MatTableDataSource(this.questionList);
    }, error => { this._util.serviceError(error); });
  }
  getCheckPointsHistory(custId, projId) {
    this._appservice.getCheckPointHistory(custId, projId).subscribe(data => {
      this.savedQuestionList = data;
    }, error => { this._util.serviceError(error); });
  }
  getModelListFromPSPD(custId, projId) {
    this._appservice.getModelListFromPSPD(custId, projId).subscribe(data => {
      this.processModel = data;
    }, error => { this._util.serviceError(error); });
  }
  getSAListFromPSPD(custId, projId, modelId) {
    this._appservice.getSAListFromPSPD(custId, projId, modelId).subscribe(data => {
      this.processServiceArea = data;
    }, error => { this._util.serviceError(error); });
  }
  getApplicableProcess(custId, projId) {
    this._appservice.getApplicableProcess(custId, projId).subscribe(data => {
      this.checkListSetUp = data;
    }, error => { this._util.serviceError(error); });
  }
  Isdisabled() {
    if (this.checkListSetUp != undefined) {
      for (let f of this.checkListSetUp.questionS_MODEL) {
        if (f.issubmitted)
          return true;
        else {

        }
      }
    }
  }
}
