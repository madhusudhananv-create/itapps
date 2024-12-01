import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsModel,AddProjectsModel } from '../../../models/projects-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { find } from 'rxjs/operators';
import { stringify } from 'querystring';
import { ConsoleListener } from 'sp-pnp-js/lib/pnp';
import {ActivatedRoute} from '@angular/router'; //test
import { Http } from '@angular/http';
import {Router} from '@angular/router';
import { ProjectModel } from '../../../models/ras/project-model';
import { project } from '../../process-model/audit-execution/audit-execution.component';
import { isNullOrUndefined } from 'util';
import { RasService } from '../ras.service';


@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})

export class ProjectDetailsComponent implements OnInit {

  @Input('selectedProject') selectedProject: ProjectsModel=new ProjectsModel();
  @Input('UpdateSelectedProject') UpdateSelectedProject: ProjectsModel=new ProjectsModel();
  @Input('AddselectedProject') AddselectedProject: AddProjectsModel=new AddProjectsModel();
  @Input('CustId') custId: string;    
  
  //selectedProject: ProjectsModel=new ProjectsModel(); 
  projects: ProjectsModel[] = [];
  projects1: ProjectsModel[] = [];

  aliasnameupdate_button: string="Edit";
  boolaliasnameupdate:boolean=false;
  boolisupdated:boolean=false;
  
  ProjectNameAlreadyExist:boolean=false;
  ProjectIdAlreadyExist:boolean=false;
  isAddProjectBtnClicked :boolean = false; 
  SelectedParentProjId : string;

  ppFromDropDwn : boolean = false;
  ppByDefault : boolean = true;  
  projId : string; //get from querystring
  private sub: any;
  isProjectEditBtnClicked :boolean =false;

  //constructor(private _util: myUtility, private _appservice: AppsService) { } //bak
  constructor(public _rasUtil:RasService, private router: Router,private _http: Http, private route: ActivatedRoute,private _util: myUtility, private _appservice: AppsService) {}

   ngOnInit() {        
        this.sub = this.route.params.subscribe(params => {  

        if(this.router.url.includes('/project')){        
          this.projId = params['projid']; //projid coming from ras routing ts page                         
          this.service_getProjectDetailForEdit(this.projId);        
          this.isProjectEditBtnClicked = true;
        }
        if(this.router.url.includes('/addproject')){                
          //this.custId = params['custid'];
          //this.AddselectedProject.cusT_ID = this.custId;        
          //this.loadProjectDetailsForAdd(this.custId);
          this.loadProjectDetailsForAdd(this._rasUtil.selectedCustomer.cusT_ID);
          this.isAddProjectBtnClicked = true;        
        }
   });
  }

 ngOnDestroy() {
    this.sub.unsubscribe();
  }
  // ngOnInit() {
  //   //console.log(this.selectedProject);
  // }
  ngOnChanges(){
    //console.log(this.selectedProject);
  }
  toggle()
  {   
    this.boolaliasnameupdate=true;    
  }
  updateProjectALiasName()
  {
    this.service_updateProjectalias();
    this.boolaliasnameupdate=false;
  }
  service_updateProjectalias()
  {
    this._appservice.updateProjectAliasName(this.selectedProject.proJ_ID,this.selectedProject.proJ_ALIAS_NM).subscribe(data =>
     {
      //this.boolisupdated = data;
    // if(this.boolisupdated)
    // {
    //   alert("Project Alias Name updated");
    // }
    // else
    // {
    //   alert("Project Alias Name update -Failed");
    // }
     },
   error => {
      this._util.serviceError(error);      
  });    
  }

  loadProjectDetailsForAdd(customerid){         
    let sdate:any = this.AddselectedProject.starT_DATE;
    let enddate:any = this.AddselectedProject.enD_DATE;
    this.AddselectedProject.starT_DATE = sdate.toISOString().split('T')[0];
    this.AddselectedProject.enD_DATE = enddate.toISOString().split('T')[0];    
    this.AddselectedProject.cusT_ID = customerid;
    this.service_getProjectList(this.AddselectedProject.cusT_ID);
  }

  ClearSelectedDropDown(){
    this.SelectedParentProjId = null;
    if(this.AddselectedProject.parenT_PROJ_ID == null){
      this.AddselectedProject.parenT_PROJ_ID = this.AddselectedProject.proJ_ID;      
    }
    this.ppFromDropDwn = false;
    this.ppByDefault = true;
  }

  dd_parentOnChange(value){
    if(this.isAddProjectBtnClicked == false){
      console.log("ddval:"+value);
      this.UpdateSelectedProject = value;
      this.ppFromDropDwn = true;
      this.ppByDefault = false;    
    }
    else{
      console.log("ddval:"+value);
      this.AddselectedProject.parenT_PROJ_ID = value;
      this.ppFromDropDwn = true;
      this.ppByDefault = false;    
    }    
  }

  UpdateProject(pm : ProjectsModel) {
    //this.UpdateSelectedProject = pm;
    if(pm.cusT_ID == undefined || pm.cusT_ID == null){
      alert("Customer Id not found");
    }
    else if(pm.proJ_ID == undefined || pm.proJ_ID ==""){
      alert("Please Enter Project ID");
    }
    else if(pm.proJ_NM == undefined || pm.proJ_NM ==""){
      alert("Please Enter Project Name");
    }
    else if(pm.proC_TYPE == undefined || pm.proC_TYPE ==""){
      alert("Please Enter PROC Type");
    }
    else if(pm.starT_DATE == undefined || pm.starT_DATE==null || !pm.starT_DATE){
      alert("Please Enter Start Date");
    }    
    else if(pm.enD_DATE == undefined || pm.enD_DATE ==null || !pm.enD_DATE){
      alert("Please Enter End Date");
    }
    else{
      pm.proJ_NM = pm.proJ_NM.trim();
      if(pm.proJ_ALIAS_NM!= undefined && pm.proJ_ALIAS_NM!= null)
        pm.proJ_ALIAS_NM = pm.proJ_ALIAS_NM.trim();      
      this.service_updateExistingProject(pm);
    }    
  }
  
  GoBackToCustomers(){
    let url = "ras/customer";
    //let myurl = `${url}/${p.cusT_ID}/${p.proJ_ID}/${p.proJ_NM}`;
    let myurl = `${url}`;    
    this.router.navigateByUrl(myurl).then(e => {
      if (e) {
        console.log("Navigation to :"+myurl+" page is successful!");
      } else {
        console.log("Navigation has failed!");
      }
    });
  }
  InsertProject(){
    if(this.AddselectedProject.cusT_ID == undefined){
      alert("Customer Id not found");
    }
    else if(this.AddselectedProject.proJ_ID == undefined || this.AddselectedProject.proJ_ID ==""){
      alert("Please Enter Project ID");
    }
    else if(this.AddselectedProject.proJ_NM == undefined || this.AddselectedProject.proJ_NM ==""){
      alert("Please Enter Project Name");
    }
    else if(this.AddselectedProject.proC_TYPE == undefined || this.AddselectedProject.proC_TYPE ==""){
      alert("Please Enter PROC Type");
    }
    // else if(this.AddselectedProject.parenT_PROJ_ID == undefined || this.AddselectedProject.parenT_PROJ_ID ==""){
    //   alert("Please Select Parent Project ");
    // }
    // else if(this.AddselectedProject.proJ_ALIAS_NM == undefined || this.AddselectedProject.proJ_ALIAS_NM ==""){
    //   alert("Please Enter Project Name");
    // }
    else {
       //Trim 
      this.AddselectedProject.proJ_ID = this.AddselectedProject.proJ_ID.trim();
      this.AddselectedProject.proJ_NM = this.AddselectedProject.proJ_NM.trim();
      this.AddselectedProject.proJ_ALIAS_NM = this.AddselectedProject.proJ_ALIAS_NM;    
      
      if(this.SelectedParentProjId == null || this.SelectedParentProjId == undefined){          
        this.AddselectedProject.parenT_PROJ_ID = this.AddselectedProject.proJ_ID;      
      }
      else{
        this.AddselectedProject.parenT_PROJ_ID = this.SelectedParentProjId;          
      }

      var isValidProjId = this.validateProjectId(this.AddselectedProject.proJ_ID);     
      if(isValidProjId){                     
        this.service_AddNewProject(this.AddselectedProject);                
      }
      else{
        alert("Invalid Project ID");
      }      
    }      
  }

    service_getProjectDetailForEdit(projId){
    if(projId != undefined ){
      this._appservice.GetProjectDetailForEdit(projId).subscribe(data => {                     
      let tempData = JSON.stringify(data);
      let tempData2 = JSON.parse(tempData);
      let tempstdate = tempData2.starT_DATE;
      let tempEnddate = tempData2.enD_DATE;
      let filteredsdate = tempstdate.split('T')[0];
      let filteredEnddate = tempEnddate.split('T')[0];

      tempData2.starT_DATE = filteredsdate; 
      tempData2.enD_DATE = filteredEnddate;        

        this.projects1 = tempData2;  
        //this.AddselectedProject =a1;                                  
        let getcustid = tempData2.cusT_ID;
        this.service_getProjectList(getcustid);

      }, error => { this._util.serviceError(error); });
    }
  }
  
  service_updateExistingProject(pr){    
    if(pr != undefined){
      this._appservice.UpdateExistingProject(pr).subscribe(data => {        
        console.log("updatestatus:" +data);
        let status1 = JSON.stringify(data);
        let updateStatus = status1.toString();
        if(updateStatus == "true"){
          alert("Project Updated Successfully");
        }
      }, error => { this._util.serviceError(error); });  
    }    
  }    

  service_getProjectList(custid: string) {
    if (custid != undefined) {
      this._appservice.GetRASProjectList(custid).subscribe(data => {
        this.projects = data;
      }, error => { this._util.serviceError(error); });
    }
  }

  service_AddNewProject(AddNewProjectObj: AddProjectsModel) {
    console.log("data to data:");
    console.log(AddNewProjectObj);
    this._appservice.addNewProject(AddNewProjectObj).subscribe(data => {    
      console.log("This is data:" + data);
      alert("Project Added Successfully");
      this.emptyFields(AddNewProjectObj);

    }, 
    error => { this._util.serviceError(error);

    var getError = JSON.stringify(error);
    var getErrorJson = JSON.parse(getError);
    var getExactError = getErrorJson.error;
    
    console.log("Exact Error:"+getExactError);    
    // if(getExactError.search("PROJ_NM") || getExactError.search("Cannot insert duplicate key"))
    //Project Name Duplication Check
    if(getExactError.includes("Violation") && getExactError.includes("UNIQUE KEY") && getExactError.includes("PROJ_NM") && getExactError.includes("Cannot insert duplicate key in object 'dbo.PROJECT'"))
    {
      console.log("It contains PROJ_NM error keywords.....");   
      this.ProjectNameAlreadyExist = true;   
    }
    //Project ID Duplication Check
    else if(getExactError.includes("Violation") && getExactError.includes("PRIMARY KEY constraint") && getExactError.includes("PROJECT_PK") && getExactError.includes("Cannot insert duplicate key in object 'dbo.PROJECT"))
    {
      console.log("It contains PROJECT_PK error keywords.....");   
      this.ProjectIdAlreadyExist = true;   
    }
    else
    {
      console.log("It does not contain any of the above keywords.....different error");      
    }    
    // var ErrorMsgToDisplay = getExactError.search()
    //   console.log("Exact Error:" +getExactError);
    });
  }

  validateProjectId(checkProjId:string):boolean {    
    var result : boolean;      
    var regexp = new RegExp(/^[1-9]{1}[0-9]{2}[A-Z]{1}[0-9]{6}-[0-9]{2}$/);
    var regexp1 = new RegExp(/^[1-9]{1}[0-9]{2}[A-Z]{1}[0-9]{6}$/);
    result = regexp.test(checkProjId) || regexp1.test(checkProjId);
    console.log(result);
    return result;
  }

  emptyFields(fields): void {
    fields.proJ_ID = undefined;
    fields.proJ_NM = undefined;
    fields.proJ_ALIAS_NM = undefined;  
    
    if(this.ProjectNameAlreadyExist == true || this.ProjectIdAlreadyExist == true){
      this.ProjectIdAlreadyExist = false;
      this.ProjectNameAlreadyExist = false;
    }
    this.ClearSelectedDropDown();
  }

  CancelAddProject(): void {    
    this.emptyFields(this.AddselectedProject);   
  }

}
