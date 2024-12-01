import { Component, OnInit } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { CrispProjectsModel, CrispDataModel } from '../../../models/crisp-projects-model';
import { CrispProjectCriteriaModel } from '../../../models/crisp-project-criteria-model';
import { CrispProjectValidationsModel } from '../../../models/crisp-project-validations-model';
import { CrispScoresCriteriaModel } from '../../../models/crisp-scores-criteria-model';
import { CrispScoresValidationsModel } from '../../../models/crisp-scores-validations-model';
import { CrispValidationsModel } from '../../../models/crisp-validations-model';
import { EmpInfoModel } from '../../../models/emp-info-model';
 

@Component({
  selector: 'app-crisp-scores-validations',
  templateUrl: './crisp-scores-validations.component.html',
  styleUrls: ['./crisp-scores-validations.component.scss']
})
export class CrispScoresValidationsComponent implements OnInit {
  crispData: CrispDataModel = new CrispDataModel();
  tableMonth: string = this._util.Month();
  tableYear: number = this._util.Year();
  panelLeft_width = "100%";
  panelRight_width = "0%";
  selectAll: Boolean = false;
  _loading: Boolean = false;
  allowCSM: Boolean = false;
  spocDetails: EmpInfoModel[]
  ddstatus: string[] = ["All"]
  crispDupData: CrispDataModel = new CrispDataModel();
  statusval: string = "All";
  empId: string = "0";
  isPublisher: boolean = false;
  projList: string[] = [];  

  constructor(public _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    //this.crispData.crisP_PROJECT = [];
    //this.LoadData(); commented not fetch data while loading the page.
    this.empId= localStorage.getItem('empid');
    this.getSpocData();
    this._appservice.GetDBConfigValue("CRISP_APPROVERS",-1,"",).subscribe( data => {
     
      let emp = localStorage.getItem('empid');
      if(data.indexOf(emp) >=0) this.isPublisher =  true;
       
    });
  }
  GetCrispData() {
    this.LoadData();
  }
  AnalyzeCrispData(p, month, year) {
    this.service_getAnalyzedScore(p, month, year);
  }
  LoadData() {
    
  
    this.service_getCrispProjectDetails(this.empId, this.tableMonth, this.tableYear);
    
  }
  validations = [];
  projectValidations = [];
  selectedProject: CrispProjectsModel = new CrispProjectsModel();
  DisplayNeedFocus: Boolean = false;
  DisplayHRNeedFocus: Boolean = false;
  DisplayValidations: Boolean = false;
  DisplayValidationComments: Boolean = false;
  GetTotalScore(project: CrispProjectsModel) {
    let score: number = 0;
    for (let s of project.crisP_SCORES_CRITERIA) {
      if (s.score.toString() != 'NaN')
        score += s.score;
    }
    return score;
  }
  Save_OnClick() {
    for (let p of this.crispData.crisP_PROJECT) {
      if (p.crisP_SCORES_PROJECT.selected)
        p.crisP_SCORES_PROJECT.status = "WIP";
    }
    this.service_saveCrispProjectDetails("Successfully Saved");
  }
  Reject_OnClick() {
    for (let p of this.crispData.crisP_PROJECT) {
      if (p.crisP_SCORES_PROJECT.selected) {
        p.crisP_SCORES_PROJECT.status = "Reject";
      }
    }
    this.service_saveCrispProjectDetails("Successfully Rejected");
  }
  MailToCSM_OnClick() {
    if (confirm("Are you sure you want send CRSIP scores to CSM?")) {
      this.service_MailsToCSM_CRISP();
    }
  }
  MailToMgt_OnClick() {
    if (confirm("Are you sure you want to send CRSIP scores to Management?")) {
      this.service_MailsToMGT_CRISP();
      //this.service_RefreshBatchCustomer(this.selectedBatch.id);
    }
  }
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please provide required data");
    }
    else {
      if (!this.IsPublisher()) {
        for (let p of this.crispData.crisP_PROJECT) {
          if (p.crisP_SCORES_PROJECT.selected) {
            p.crisP_SCORES_PROJECT.status = "For Approval";
          }
        }
        this.service_saveCrispProjectDetails("Successfully Submited for Approval");
      }
      else {
        for (let p of this.crispData.crisP_PROJECT) {
          if (p.crisP_SCORES_PROJECT.selected) {
            p.crisP_SCORES_PROJECT.status = "Published";
          }
        }
        this.service_publishCrispProjectDetails("Successfully Approved and Published");
      }
    }
  }
  AnalyzeCrispDataAll(projects, month, year) {
    for (let p of projects.filter(x=>x.crisP_SCORES_PROJECT.selected)) {
      this.service_getAnalyzedScore(p, month, year);
    }
  }
  getSpocData() {
    this.service_getSpocData();
  }

  GetProjectValidations(projectId) {
    let project: CrispProjectsModel = this.crispData.crisP_PROJECT.filter(t => t.crisP_SCORES_PROJECT.projecT_ID === projectId)[0];
    this.selectedProject = project;
    this.projectValidations = project.crisP_SCORES_VALIDATIONS.filter(y => y.achieved === false);
  }
  GetScore(maxScore: number, percentage: string) {
    let i = Number(percentage);
    let score: number = 0;
    score = Math.ceil(maxScore * (i / 100));
    // if (percentage === "50")
    //   score = Math.ceil(maxScore / 2);
    // else if (percentage === "100")
    //   score = maxScore;
    return score;
  }
  GetValidationName(validatioN_ID) {
    let validation = this.crispData.crisP_VALIDATIONS.filter(c => c.id === validatioN_ID);
   
    //console.log(validation);
   
    if (validation != undefined && validation != null && validation.length > 0){
      
      return validation[0].validatioN_NAME;
    }      
    else{
     
      return "";
    //return this.crispData.crisP_VALIDATIONS.filter(c => c.id === validatioN_ID)[0].validatioN_NAME;
    }      
  }
  GetCriteriaName(validatioN_ID) {
    let criteriaId = this.crispData.crisP_VALIDATIONS.filter(c => c.id === validatioN_ID)[0].criteriA_ID;
    return this.crispData.crisP_CRITERIA.filter(c => c.id === criteriaId)[0].criteriA_NAME;
  }
  GetProjectName(projecT_ID) {
    return this.crispData.projects.filter(c => c.proJ_ID === projecT_ID)[0].proJ_NM;
  }
  AddComments(project: CrispProjectsModel) {
    this.selectedProject = project;
    this.DisplayValidations = false;
    this.DisplayNeedFocus = true;
    this.DisplayHRNeedFocus = false;
    this.panelLeft_width = "65%";
    this.panelRight_width = "34%";
    this.GetProjectValidations(project.crisP_SCORES_PROJECT.projecT_ID)
    //alert(project.crisP_SCORES_PROJECT.comments);
  }
  AddHRComments(project: CrispProjectsModel) {
    this.selectedProject = project;
    this.DisplayValidations = false;
    this.DisplayNeedFocus = false;
    this.DisplayHRNeedFocus = true;
    this.panelLeft_width = "65%";
    this.panelRight_width = "34%";
    this.GetProjectValidations(project.crisP_SCORES_PROJECT.projecT_ID)
    //alert(project.crisP_SCORES_PROJECT.comments);
  }
  SaveNeedFocusComments_OnClick() {

  }
  ClearNeedFocusComments_OnClick() {
    this.selectedProject.crisP_SCORES_PROJECT.comments = "";
  }
  ClearHRNeedFocusComments_OnClick() {
    this.selectedProject.crisP_SCORES_PROJECT.hR_NEED_FOCUS_COMMENTS = "";
  }
  CloseNeedFocusComments_OnClick() {
    this.DisplayNeedFocus = false;
    this.panelLeft_width = "100%";
    this.panelRight_width = "0%";
  }
  CloseHRNeedFocusComments_OnClick() {
    this.DisplayHRNeedFocus = false;
    this.panelLeft_width = "100%";
    this.panelRight_width = "0%";
  }
  CloseValidations_OnClick() {
    this.DisplayValidations = false;
    this.panelLeft_width = "100%";
    this.panelRight_width = "0%";
  }
  IsPublisher() {
    return this.isPublisher;
   
  }

  getPercentageList(project: CrispProjectsModel, criteria) {
    let ipercentages: number[] = [];
    let spercentages: string[] = [];
    if (project.crisP_PROJECT_VALIDATIONS == undefined) {
      spercentages.push("NA");
      return spercentages;
    }
    //General validations based on cirteria id
    let generalValidations: CrispValidationsModel[] = this.crispData.crisP_VALIDATIONS.filter(t => t.criteriA_ID === criteria.criteriA_ID)
    for (let v of project.crisP_PROJECT_VALIDATIONS) {
      let validation = generalValidations.filter(t => t.id == v.validatioN_ID);
      if (validation != undefined && validation != null && validation.length > 0) {
        ipercentages.push(validation[0].scorE_PERCENTAGE)
      }
    }

    ipercentages = ipercentages.filter((x, i, a) => a.indexOf(x) == i)
    ipercentages = ipercentages.sort();
    for (let s of ipercentages) {
      spercentages.push(s.toString());
    }

    spercentages.push("NA");

    return spercentages;
  }
  getPercentage(id: number, validations) {
    let percentage: number;
    let val = this.crispData.crisP_VALIDATIONS.filter(t => t.id === id)
    if (val != undefined && val.length > 0)
      percentage = val[0].scorE_PERCENTAGE;
    return percentage;
  }
  //Events
  selectAll_onClick() {
    for (let p of this.crispData.crisP_PROJECT) {
      p.crisP_SCORES_PROJECT.selected = this.selectAll;
    }
  }
  getStatus(crispData) {
    let i;
    for (i = 0; i < crispData.length; i++) {
      if (!this.ddstatus.includes(crispData[i].crisP_SCORES_PROJECT.status))
        this.ddstatus.push(crispData[i].crisP_SCORES_PROJECT.status);
    }
  }
  ddCriteria_Onchange(project: CrispProjectsModel, criteria: CrispScoresCriteriaModel) {
    this.selectedProject = project;
    if (!this._util.IsQuality()) {
      if (!this.allowCSM)
        this.selectedProject.crisP_SCORES_VALIDATIONS = this.selectedProject.crisP_SCORES_VALIDATIONS.filter(t => t.comments != null && t.comments != "");
    }
    this.DisplayValidations = true;
    this.DisplayNeedFocus = false;
    this.panelLeft_width = "65%";
    this.panelRight_width = "34%";
    let validationIds: number[] = this.crispData.crisP_VALIDATIONS.filter(t => t.criteriA_ID === criteria.criteriA_ID).map(({ id }) => id)
    this.validations = []; //] = new [CrispScoresValidationsModel]; 
    try {
      let maxScore: number = this.crispData.crisP_CRITERIA.filter(c => c.id === criteria.criteriA_ID)[0].score;
      criteria.score = this.GetScore(maxScore, criteria.scorE_PERCENTAGE);
      this.GetTotalScore(project);
      for (let v of project.crisP_SCORES_VALIDATIONS) {
        if (validationIds.find(x => x == v.validatioN_ID)) {
          this.validations.push(v);
        }
      }
      this.projectValidations = project.crisP_SCORES_VALIDATIONS.filter(y => y.achieved === false);
    }
    catch (e) {
      alert(e);
    }

  }
  AnaylizeCrisp(projectId) {

  }
  //Service Calls
  service_MailsToCSM_CRISP(){
    this._loading = true
    this._appservice.MailsToCSM_CRISP().subscribe(data => {
      this._loading = false;
    }, error => {
      this._util.serviceError(error);
      this._loading = false;
    });
  }
  service_MailsToMGT_CRISP(){
    this._loading = true
    this._appservice.MailsToMGT_CRISP().subscribe(data => {
      this._loading = false;
    }, error => {
      this._util.serviceError(error);
      this._loading = false;
    });
  }
  service_getCrispProjectDetails(empid, month, year) {
    if(this._loading) return;
    this._loading = true
    this._appservice.GetCrispProjects(empid, month, year).subscribe(data => {
       
      this.crispData = data;   
      //console.log("crisp data", this.crispData); 
      this._loading = false;
      this.getStatus(this.crispData.crisP_PROJECT)
      this.FilterbyStatus();
      this.getEmpProjList();
      this.crispDupData = this._util.CopyObject(this.crispData);
      this.selectedProject = this.crispData.crisP_PROJECT[0];
      this._loading = false;
    }, error => {
      this._loading = false;
      this._util.serviceError(error);
      
    });
  }
  FilterbyStatus() {
    if (this.statusval != "All") {
      var filtereddata = []
      this.crispData.crisP_PROJECT.forEach((element, index) => {
        if (element.crisP_SCORES_PROJECT.status === this.statusval)
          filtereddata.push(element);
      });
      this.crispData.crisP_PROJECT = filtereddata;
    }
  }

  GetCriterias(p){
    // if(p.crisP_SCORES_PROJECT.projecT_ID == "212P000140")
    //   console.log("criteria scores", p.crisP_SCORES_CRITERIA.sort((x, y) => Number(x.id) - Number(y.id)).slice(0,11));
    return   p.crisP_SCORES_CRITERIA.sort((x, y) => Number(x.id) - Number(y.id)).slice(0,11);
  }

  getEmpProjList() {
    if (this.empId != "0") {
  
      var filtereddata =  [];
     // this.crispData.projects.forEach((element, index) => {
        // if (this.projList.includes(element.crisP_SCORES_PROJECT.projecT_ID))
        // if(element.qualitY_SPOC!=null && this.empId === element.qualitY_SPOC)
        //    filtereddata.push( this.crispData.crisP_PROJECT.filter(x=>x.crisP_SCORES_PROJECT.projecT_ID === element.proJ_ID ));
      //});
      this.projList = this.crispData.projects.filter(x=>x.qualitY_SPOC === this.empId).map(x=>x.proJ_ID);
      this.crispData.crisP_PROJECT.forEach((element, index) => {
        if (this.projList.includes(element.crisP_SCORES_PROJECT.projecT_ID))
          filtereddata.push(element);
      });
       this.crispData.crisP_PROJECT = filtereddata;
     
      
    }
  }
  service_saveCrispProjectDetails(message) {
    if(this.crispData.crisP_PROJECT==undefined || this.crispData.crisP_PROJECT.length==0) return;
    this._loading = true;
    this._appservice.UpdateCrispProjects(this.crispData.crisP_PROJECT).subscribe(data => {
      alert(message);
      this._loading = false;
      this.getStatus(this.crispData.crisP_PROJECT)
    }, error => {
      this._util.serviceError(error);
      this._loading = false;
    });
  }
  service_publishCrispProjectDetails(message) {
    this._appservice.PublishCrispProjects(this.crispData.crisP_PROJECT).subscribe(data => {
      alert(message);
      this.getStatus(this.crispData.crisP_PROJECT)
    }, error => { this._util.serviceError(error); });
  }
  service_getAnalyzedScore(p, month, year) {
    this._appservice.getAnalyzedScore(p.crisP_SCORES_PROJECT.projecT_ID, month, year).subscribe(data => {
      
      this.automatedScore(data, p);
    }, error => { this._util.serviceError(error); });
  }
  service_getSpocData() {
    this._appservice.getSpocDetails().subscribe(data => {
      this.spocDetails = data;
      
    }, error => { this._util.serviceError(error); });
  }
  automatedScore(data, p) {
    let i;
    for (i = 0; i < data.length; i++) {
      this.allowCSM = true;
      let b = data[i].crisp_score_criteria.criteriA_ID - 1;
      let v = data[i].crisp_score_validations.validatioN_ID - 1;
      p.crisP_SCORES_CRITERIA[b].scorE_PERCENTAGE = data[i].crisp_score_criteria.scorE_PERCENTAGE;
      if (data[i].crisp_score_validations.comments != null && data[i].crisp_score_validations != undefined)
        p.crisP_SCORES_VALIDATIONS[v].comments = data[i].crisp_score_validations.comments;
      this.ddCriteria_Onchange(p, this.selectedProject.crisP_SCORES_CRITERIA[b]);
    }
  }



}

