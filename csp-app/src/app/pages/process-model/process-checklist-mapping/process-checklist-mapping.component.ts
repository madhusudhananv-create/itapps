import { Component, OnInit, ViewChild } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { ProcessAreaModelNew, ServiceAreaModelNew, ProcessModelNew } from '../../../models/audit-checklist-based-model';
import { ChecklistModel, ProcessChecklistMappingModel, ChecklistQuestionsModelNew, ProcessChecklistQuestionsMappingModel, PM_MATURITYLEVEL_MAPPING, AuditCheckListWeightage } from '../../../models/checklist-model';
import { MatTableDataSource, MatPaginator, MatDialogConfig, MatDialog } from '@angular/material';
import { PreviewPopupComponent } from './preview-popup/preview-popup.component';
import { DropdownFilterComponent } from '../../dropdown-filter/dropdown-filter.component';

@Component({
  selector: 'app-process-checklist-mapping',
  templateUrl: './process-checklist-mapping.component.html',
  styleUrls: ['./process-checklist-mapping.component.scss']
})
export class ProcessChecklistMappingComponent implements OnInit {

  bAddNewServiceArea: Boolean = false;
  selectedProcess: ProcessModelNew;
  selectedProcessArea: ProcessAreaModelNew = new ProcessAreaModelNew();
  selectedServiceArea: ServiceAreaModelNew = new ServiceAreaModelNew();
  processModelDescription: string;
  ProcessAreaList: ProcessAreaModelNew[] = [];
  OriginalProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessList: ProcessModelNew[] = [];
  checklistList: ChecklistModel[] = [];
  processChecklistMapping: ProcessChecklistMappingModel[] = []

  displayedColumns = ["index", "displaY_ORDER", "description", "weightagE_ID", "globaL_PERSPECTIVE_ID", "effectivE_FROM", "edit"];//"weightagE_SCORE",
  ServiceAreaList: ServiceAreaModelNew[];
  OriginalServiceAreaList: ServiceAreaModelNew[];
  checklistQuestions: ChecklistQuestionsModelNew[];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild("paginator") paginator: MatPaginator;
  category: any[] = [];
  processChecklistQuestionMapping: ProcessChecklistQuestionsMappingModel[];
  selectedChecklist: ChecklistModel = new ChecklistModel();
  hideMaturity: boolean;
  hideWeightage: boolean;
  questionList: ChecklistQuestionsModelNew[] = [];
  weightage: AuditCheckListWeightage[] = [];
  originalweightage: AuditCheckListWeightage[] = [];
  originalMaturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  maturityLevel: PM_MATURITYLEVEL_MAPPING[];
  effectivefrom = new Date();
  checklistinAudit: any[] = [];
  selectedChoice: string = 'latestVersion';
  originalChecklistList: ChecklistModel[];
  isPreviewChecklistClicked: boolean = false;
  checklistWithVersion: any[] = [];





  constructor(private _util: myUtility, private _appservice: AppsService, public dialog: MatDialog) { }
  iEditIndex = -1;
  ngOnInit() {
    this.service_getChecklistList();
    //this.Service_GetChecklistQuestionsList();
    this.Service_GetProcessAreaList();
    this.Service_GetServiceAreaList();
    this.Service_GetProcessList();
    this.getCategory();
    this.getWeightageForAllChecklist();
    this.Service_GetMaturiryLevel();
  }
  ngOnChanges() {
    this.Service_GetProcessAreaList();
  }


  Service_GetChecklistQuestionsList() {
    this._appservice.getChecklistQuestionList(-1).subscribe(
      data => {
        this.checklistQuestions = data;
        this.refreshTable(this.checklistQuestions);
      }
    )
  }


  Service_VerifyChecklistInAudit() {
    this._appservice.VerifyChecklistInAudit(this.selectedChecklist.id).subscribe(
      data => {

        this.checklistinAudit = data;
      }
    )

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
    this._appservice.getQuestionCategory().subscribe(data => {
      this.category = data;
    },
      error => { this._util.serviceError(error); })
  }

  selectversion() {
    if (this.selectedChoice == 'latestVersion') {
      this.getLatestVersion();
    }
    else {
      this.checklistList = [...this.originalChecklistList];
      this.MapChecklistWithVersion();
      //this.checklistList.sort((a, b) => a.effectivE_FROM > b.effectivE_FROM ? -1 : a.effectivE_FROM < b.effectivE_FROM ? 1 : 0);
      // this.refreshTable(this.checklistList);
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

    //this.refreshTable(output);
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
      procesS_MODEL_DESCRIPTION: item.procesS_MODEL_DESCRIPTION,
    }));
  }

  getChecklistName(checklistid) {
    let element = this.checklistList.find(x => x.id == checklistid);
    if (element != undefined)
      return element.title;
    else
      return "";
  }
  previewChecklistData: any[] = [];
  PreviewChecklist() {
    if (this.selectedChecklist === undefined || this.selectedChecklist.id == undefined || this.selectedChecklist.id == 0) {
      alert("Please select a checklist to preview");
      return;
    }
    this._appservice.GetPreviewChecklist(this.selectedChecklist.id).subscribe(data => {
      this.previewChecklistData = data;
      this.openPopup();
     
    },
      (error) => this._util.serviceError(error));
  }
 
  openPopup() {
   
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;  
    dialogConfig.data = {
      'previewData': this.previewChecklistData,
      'checklistName': this.selectedChecklist.title,
      'version': this.selectedChecklist.version,
      'effectivE_FROM': this.selectedChecklist.effectivE_FROM,
      'iS_WEIGHTAGE_APPLICABLE': this.selectedChecklist.iS_WEIGHTAGE_APPLICABLE,
      'iS_MATURITY_APPLICABLE': this.selectedChecklist.maturitY_LEVEL,
      'process_Model_description': this.selectedChecklist.procesS_MODEL_DESCRIPTION,
    }
    dialogConfig.height = "90%";
    dialogConfig.width = "90%"
    const dialogRef = this.dialog.open(PreviewPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }


 


  getglobalCategoryName(categoryid) {
    let element = this.category.find(x => x.id == categoryid);
    if (element != undefined)
      return element.shorT_DESC;
    else
      return "";
  }

  refreshTable(dataSource) {
    this.dataSource = new MatTableDataSource(dataSource);
    this.dataSource.paginator = this.paginator;
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe(data => {
      this.ServiceAreaList = data;
      this.OriginalServiceAreaList = data;
      //this.MasterMapServiceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }

  ddServiceAreaChange($event) {
    this.selectedServiceArea = $event;
    this.Service_GetProcessAreaForServiceArea();
    this.selectedProcessArea = new ProcessAreaModelNew();
    this.ProcessAreaList = [];
    this.ProcessList = []
    this.selectedProcess = new ProcessModelNew();

  }

  Service_GetProcessAreaForServiceArea() {
    this.ProcessAreaList = [];
    this._appservice.GetProcessAreaByServiceAreaIdNew(this.selectedServiceArea.id).subscribe(
      (data) => {
        this.ProcessAreaList = data;
        this.OriginalProcessAreaList = data;
      },
      (error) => { this._util.serviceError(error) }
    )
  }

  SaveRows_onClick() {
    // let list = this.checklistQuestions.filter(t => t.bSelected);
    // if (list.length > 0) {
    //   let mapping: ProcessChecklistQuestionsMappingModel[] = [];
    //   for (let chk of list) {
    //     let map: ProcessChecklistQuestionsMappingModel = new ProcessChecklistQuestionsMappingModel();
    //     if (chk.checklisT_ID == this.selectedChecklist.id) {
    //       map.questioN_ID = chk.id
    //       map.procesS_ID = this.selectedProcess.id;
    //       mapping.push(map);
    //     }
    //     else {
    //       alert('Please choose Questions within the same checklist to map a Process');
    //       return;
    //     }
    //}
    //this.service_UpdateProcessChecklistMapping(mapping);
    //this.service_UpdateProcessQuestionMapping(mapping)
    let mapping: ProcessChecklistQuestionsMappingModel[] = [];
    for (let chk of this.questionList) {
      let map: ProcessChecklistQuestionsMappingModel = new ProcessChecklistQuestionsMappingModel();

      map.questioN_ID = chk.id
      map.procesS_ID = this.selectedProcess.id;
      map.checklisT_ID = this.selectedChecklist.id;
      mapping.push(map);

    }
    this.service_UpdateProcessQuestionMapping(mapping)
  }
  //   else {
  //     alert("Please select Questions to save");
  //   }
  // }


  // openedChangePAL(opened: boolean) {
  //   this.searchValuePAL = "";
  //   this.applyFilterForProcessArea(this.searchValuePAL);
  // }
  // openedChangeMPAL(opened: boolean) {
  //   this.searchValueMPAL = "";
  //   this.applyFilterForProcess(this.searchValueMPAL);
  // }

  // openedChangeSPAL(opened: boolean) {
  //   this.searchValueSPAL = "";
  //   this.applyFilterForMapServiceArea(this.searchValueSPAL);
  // }

  // openedChangeCL(opened: boolean) {
  //   this.searchValueCL = "";
  //   this.applyFilterForCheckList(this.searchValueCL);
  // }

  // applyFilterForCheckList(filterValue: string){
  //   this.checklistList = this.MasterCheckList.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  // }

  // applyFilterForProcessArea(filterValue: string) {
  //   this.ProcessAreaList = this.MasterProcessAreaList.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  // }

  // applyFilterForProcess(filterValue: string) {
  //   this.ProcessList = this.MasterProcessList.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  // }

  // applyFilterForMapServiceArea(filterValue: string) {
  //   this.ServiceAreaList = this.MasterMapServiceAreaList.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  // }

  ddProcessAreaChange($event) {
    this.selectedProcessArea = $event;
    this.Service_GetProcessByProcessArea(this.selectedProcessArea.id);
    this.ProcessList = []
    this.selectedProcess = new ProcessModelNew();

  }
  ddProcessChange($event) {
    this.selectedProcess = $event;
    //this.checklistQuestions.forEach((el) => { el.bSelected = false; })
    //this.Service_GetProcessChecklistMappingList(this.selectedProcess.id);
    if (this.selectedChecklist == undefined || this.selectedChecklist.id == undefined || this.selectedChecklist.id == 0) {
      alert("Please select a Checklist");
      return;
    }

    if (this.selectedServiceArea == undefined || this.selectedServiceArea.id == undefined || this.selectedServiceArea.id <= 0) {
      alert('Please select a service Tower, process area and then process');
      return;
    }
    if (this.selectedProcessArea == undefined || this.selectedProcessArea.id == undefined || this.selectedProcessArea.id <= 0) {
      alert('Please select process area and then process');
      return;
    }
    if (this.selectedProcess == undefined || this.selectedProcess.id == undefined || this.selectedProcess.id <= 0) {
      alert('Please select process');
      return;
    }

    this.Service_GetProcessChecklistQuestionsMappingList(this.selectedChecklist.id,
      this.selectedProcess.id, this.selectedProcessArea.id, this.selectedServiceArea.id);
  }
  getProcessArea(id) {
    let processA: ProcessAreaModelNew[] = this.ProcessAreaList.filter(t => t.id == id);
    if (processA != null && processA != undefined && processA.length > 0) {
      return processA[0].title;
    }
  }
  Service_GetProcessByProcessArea(processAreaId: number) {
    this.ProcessList = [];
    this._appservice.GetProcessByProcessArea(processAreaId).subscribe(data => {
      this.ProcessList = data;
      //      this.MasterProcessList = data;
    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessByServiceArea(processModelId: number) {
    this._appservice.GetProcessByServiceArea(processModelId).subscribe(data => {
      //this.ProcessList = data;
      // let ids: number[] = this.processServiceAreaMapping.map(x => x.procesS_ID);
      // var filteredProcess = this.ProcessList.filter(function (itm) {
      //   return ids.indexOf(itm.id) > -1;
      // });
      // filteredProcess.forEach((el) => { el.bSelected = true; })
    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe(data => {
      this.ProcessList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_UpdateProcessServiceAreaMapping(serviceArea: ServiceAreaModelNew, processList: ProcessModelNew[]) {
    this._appservice.UpdateProcessServiceAreaMapping(serviceArea, processList).subscribe(data => {
      //this.Service_GetProcessAreaList();
    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessChecklistMappingList(processId: number) {
    this._appservice.GetProcessChecklistMappingList(processId).subscribe(data => {
      this.processChecklistMapping = data;
      let ids: number[] = this.processChecklistMapping.map(x => x.checklisT_ID);
      var filteredProcess = this.checklistList.filter(function (itm) {
        return ids.indexOf(itm.id) > -1;
      });
      filteredProcess.forEach((el) => { el.bSelected = true; })
    }, error => { this._util.serviceError(error); });
  }


  Service_GetProcessChecklistQuestionsMappingList(checklistId: number, processId: number, processAreaId: number, serviceAreaId: number) {
    this._appservice.GetProcessChecklistQuestionsMappingList(checklistId, processId, processAreaId, serviceAreaId).subscribe(data => {
      //this.processChecklistQuestionMapping = data;
      this.questionList = data;
      this.refreshTable(this.questionList);
      // this.selectedChecklist = data.checklisT_ID;
      // let ids: number[] = this.processChecklistQuestionMapping.map(x => x.questioN_ID);
      // if (this.processChecklistQuestionMapping.length > 0)
      // var filteredProcess = this.checklistQuestions.filter(function (itm) {
      //   return ids.indexOf(itm.id) > -1;
      // });
      // filteredProcess.forEach((el) => { el.bSelected = true; })
      // filteredProcess.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
      //   this.checklistQuestions.forEach(x => {
      //     if (ids.indexOf(x.id) > -1)
      //       x.bSelected = true;
      //     else
      //       x.bSelected = false;
      //   });
      // this.checklistQuestions.sort((x, y) => Number(y.bSelected) - Number(x.bSelected));

    }, error => { this._util.serviceError(error); });
  }

  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe(data => {
      this.ProcessAreaList = data;
      //      this.MasterProcessAreaList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_UpdateProcessArea(processArea: ProcessAreaModelNew) {
    this._appservice.UpdateProcessArea(processArea).subscribe(data => {
      this.Service_GetProcessAreaList();
    }, error => { this._util.serviceError(error); });
  }
  service_getChecklistList() {
    this._appservice.getChecklistList().subscribe(data => {
      this.checklistList = data;
      this.originalChecklistList = data;
      this.MapChecklistWithVersion();
      this.selectedChoice = 'latestVersion';
      this.selectversion();
    }, error => { this._util.serviceError(error); });
  }
  // service_UpdateProcessChecklistMapping(mapping: ProcessChecklistMappingModel[]) {
  //   this._appservice.UpdateProcessChecklistMapping(mapping).subscribe(data => {
  //     //this.checklistList = data;
  //     alert('Process CheckList Mapping done Successfully');
  //     this.ClearInputs();
  //   }, error => { this._util.serviceError(error); });
  // }

  service_UpdateProcessQuestionMapping(mapping: ProcessChecklistQuestionsMappingModel[]) {
    this._appservice.UpdateProcessChecklistQuestionsMapping(mapping).subscribe(data => {
      //this.checklistList = data;
      alert('Process Questions Mapping done Successfully');
      // this.ClearInputs();
    }, error => { this._util.serviceError(error); });
  }

  ClearInputs() {
    this.selectedProcessArea = undefined;
    this.selectedProcess = undefined;
    this.selectedServiceArea = undefined;
    this.ServiceAreaList = this.OriginalServiceAreaList;
    this.ProcessAreaList = [];
    this.ProcessList = [];
    this.selectedChecklist = undefined;
    this.questionList = []
    this.dataSource = new MatTableDataSource(this.questionList);
  }

  Service_GetMaturiryLevel() {
    this._appservice.getMaturityLevel().subscribe(data => {
      this.originalMaturityLevel = data;
      this.maturityLevel = data;
    }, error => { this._util.serviceError(error) })
  }

  ddChecklistChange($event) {
    this.selectedChecklist = $event;
    this.maturityLevel = this.originalMaturityLevel.filter(x => x.procesS_MODEL_ID == this.selectedChecklist.procesS_MODEL_ID);
    if (this.selectedChecklist.iS_WEIGHTAGE_APPLICABLE) {
      this.weightage = this.originalweightage.filter(x => x.checklisT_ID == this.selectedChecklist.id);
      if (this.weightage.length == 0) {
        alert("Weightage is not available for checklist.Please update.");
      }
    }
    this.displayColumnsList();
    this.questionList = []
    this.dataSource = new MatTableDataSource(this.questionList);

    // this.checklistinAudit = undefined;
    // this.Service_VerifyChecklistInAudit();

    // this.checklistQuestions.forEach(x => x.bSelected = false);
    // this.checklistQuestions.forEach(x => {
    //   if (x.checklisT_ID == this.selectedChecklist.id)
    //     x.bSelected = true;
    // });

    //this.checklistQuestions.sort((x, y) => Number(y.bSelected) - Number(x.bSelected));
    //this.refreshTable(this.checklistQuestions);
  }

  btnAddQuestion_Onclick() {

    this.checklistinAudit = undefined;
    this.Service_VerifyChecklistInAudit();

    if (this.selectedChecklist == undefined || this.selectedChecklist.id == undefined || this.selectedChecklist.id == 0) {
      alert("Please select a Checklist to add question");
      return;
    }
    if (this.selectedServiceArea == undefined || this.selectedServiceArea.id == undefined || this.selectedServiceArea.id <= 0) {
      alert('Please select a service Tower');
      return;
    }
    if (this.selectedProcessArea == undefined || this.selectedProcessArea.id == undefined || this.selectedProcessArea.id <= 0) {
      alert('Please select process area and then process');
      return;
    }
    // if (!this.selectedProcess || this.selectedProcess.id == 0) {
    //   alert("Please select a Process to add question");
    //   return;
    // }
    if (this.selectedProcess == undefined || this.selectedProcess.id == undefined || this.selectedProcess.id <= 0) {
      alert('Please select process');
      return;
    }
    if (this.checklistinAudit != undefined) {
      alert("Checklist being used in Audit, new questions cannot be added.  Please revise the checklist and then add questions.");
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

  EditRow_onClick(row, id) {
    this.iEditIndex = id;
  }
  SaveRow_onClick(row: ChecklistQuestionsModelNew) {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    row.effectivE_FROM = this.effectivefrom.toDateString();
    if (row.title == undefined) {
      alert("Please enter question title");
      return;
    }
    if (row.displaY_ORDER == undefined) {
      alert('Please enter display order for the question');
      return;
    }
    if (this.selectedChecklist.iS_WEIGHTAGE_APPLICABLE) {
      if (row.weightagE_ID == undefined) {
        alert('Please choose the weightage.');
        return;
      }
    }
    if ((specialCharPattern.test(row.title)) || numberPattern.test(row.title)) {
      alert('Please enter alphanumeric or numeric values along with special characters for question title');
      return;
    }

    if (row.id == undefined || row.id == 0)
      this.service_addChecklistQuestion(row);
    else
      this.service_UpdateChecklistQuestion(row);
    this.iEditIndex = -1;
  }
  CancelEdit_onClick(row) { this.iEditIndex = -1; }
  DeleteRow_onClick(row) {
    if (row.id === undefined || row.id === 0) {
      this.questionList.splice(this.questionList.indexOf(row), 1);
      this.dataSource = new MatTableDataSource(this.questionList);
    }
    else {
      let newRow = new checklistquestionInput()
      newRow.checklisT_ID = this.selectedChecklist.id;
      newRow.procesS_AREA_ID = this.selectedProcessArea.id;
      newRow.servicE_AREA_ID = this.selectedServiceArea.id;
      newRow.procesS_ID = this.selectedProcess.id;
      newRow.questioN_ID = row.id;

      this.service_DeleteChecklistQuestion(newRow);
    }
  }

  service_DeleteChecklistQuestion(question: checklistquestionInput) {
    this._appservice.DeleteChecklistQuestion(question).subscribe(data => {
      alert('Question Deleted Successfully');
      this.Service_GetProcessChecklistQuestionsMappingList(this.selectedChecklist.id, this.selectedProcess.id, this.selectedProcessArea.id, this.selectedServiceArea.id);
    }, error => { this._util.serviceError(error); });
  }

  service_getChecklistQuestionList(checklistId) {
    this._appservice.getChecklistQuestionList(checklistId).subscribe(data => {
      this.questionList = data;

      this.dataSource = new MatTableDataSource(this.questionList);
    }, error => { this._util.serviceError(error); });
  }
  GetWeightageTitle(id) {
    let weight = this.weightage.filter(t => t.id == id)
    if (weight.length > 0)
      return weight[0].weightagE_TITLE + '(' + weight[0].weightagE_SCORE + ')';
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
  GetWeightageScore(id) {
    let weight = this.weightage.filter(t => t.id == id)
    if (weight.length > 0)
      return weight[0].weightagE_SCORE;
    else
      return '';
  }

  // getWeightage() {
  //   this._appservice.getQuestionWeightage().subscribe(data => {
  //     this.weightage = data;
  //   },
  //     error => { this._util.serviceError(error); })
  // }

  getWeightageForAllChecklist() {

    this._appservice.getWeightageForAllChecklist().subscribe(data => {
      this.originalweightage = data
      this.weightage = data;
    },
      error => { this._util.serviceError(error); })

  }

  getMaturityLevelTitle(id) {
    let element = this.originalMaturityLevel.find(x => x.maturitY_LEVEL_ID == id);
    if (element != undefined)
      return element.leveL_TITLE;
    else
      return "";
  }

  service_UpdateChecklistQuestion(question: ChecklistQuestionsModelNew) {
    this._appservice.UpdateChecklistQuestion(question, this.selectedProcess.id, this.selectedProcessArea.id, this.selectedServiceArea.id).subscribe(data => {
      // this.service_getChecklistQuestionList(this.selectedChecklist.id);
      this.Service_GetProcessChecklistQuestionsMappingList(this.selectedChecklist.id, this.selectedProcess.id, this.selectedProcessArea.id, this.selectedServiceArea.id);
      alert('Question Updated Successfully');
    }, error => { this._util.serviceError(error); });
  }
  service_addChecklistQuestion(question: ChecklistQuestionsModelNew) {
    this._appservice.AddChecklistQuestion(question, this.selectedProcess.id, this.selectedProcessArea.id, this.selectedServiceArea.id).subscribe(data => {
      alert('Question Added Successfully');
      // question.id = data.id;
      //  this.service_getChecklistQuestionList(this.selectedChecklist.id);
      this.Service_GetProcessChecklistQuestionsMappingList(this.selectedChecklist.id, this.selectedProcess.id, this.selectedProcessArea.id, this.selectedServiceArea.id);
    }, error => { this._util.serviceError(error); });
  }
}

export class checklistquestionInput {
  questioN_ID: number;
  checklisT_ID: number;
  servicE_AREA_ID: number;
  procesS_AREA_ID: number;
  procesS_ID: number;
}
