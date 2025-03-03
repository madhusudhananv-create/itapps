import { Component, OnInit } from '@angular/core';
import { EmpInfoModel, ProjectResourceByEmpIdModel, ProjectResourceModel } from '../../../models/emp-info-model';
import { myUtility } from "../../../Shared/myUtility";
import { AppsService } from "../../../Services/apps.service";
import { Observable } from 'rxjs/internal/Observable';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { ProjectSelectorComponent } from '../../project-selector/project-selector.component';
import { AccessControl } from '../../../Shared/accessControl';
import { AddProjectsModel } from '../../../models/projects-model'; //rc/app/models/projects-model';
import { HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Console } from 'console';

@Component({
  selector: 'app-access-control-project',
  templateUrl: './access-control-project.component.html',
  styleUrls: ['./access-control-project.component.scss'],
  providers: [ProjectSelectorComponent]
})
export class AccessControlProjectComponent implements OnInit {
  custId: string;
  projId: string;
  isBillable: boolean = false;
  isProjResource: boolean = false;
  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  projectResource: ProjectResourceByEmpIdModel[] = [];
  filteredOptions: Observable<EmpInfoModel[]>;
  dataSource: ProjectResourceByEmpIdModel[] = [];
  //displayedColumns = ['cusT_NM', 'proJ_NM', 'curR_INDC', 'bilL_FLG', 'delete'];
  displayedColumns = ['cusT_NM', 'proJ_NM', 'curR_INDC', 'bilL_FLG', 'starT_DATE', 'enD_DATE', 'delete'];

  startdate: any = new Date().toISOString().split('T')[0];   //GenerateCurrentDate
  enddate: any = new Date();
  year : number = new Date().getFullYear();
  crispMonth: string;
  crispYear: string ="2024";
  errorStr: string = "";
  isCreateAccessDisabled: boolean = true;
  AddNewProjectObj: any;
  constructor(public _util: myUtility, public _appservice: AppsService, public _projectSelector: ProjectSelectorComponent, public _access: AccessControl) {

    if (this._access.IsAllowed(39, 2, '', '')) { // check user have create access right
      this.isCreateAccessDisabled = false;// used directly in disabled field

    }

  }

  ngOnInit() {
    this.LoadData();
    if(this._util.getMonthAbr(new Date().getMonth()) =="Jan")
    { 
      this.crispMonth = "Dec";
      
    }
    else
      this.crispMonth = this._util.getMonthAbr(new Date().getMonth() - 1);
   
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith<string | EmpInfoModel>(''),
        map(value => typeof value === 'string' ? value : value.frsT_NM),
        map(name => name ? this._filter(name) : this.empinfo.slice())
      );
  }
  private _filter(value: string): EmpInfoModel[] {
    const filterValue = value.toLowerCase();

    return this.empinfo.filter(option => option.frsT_NM.toLowerCase().includes(filterValue));
  }

  displayFn(user?: EmpInfoModel): string | undefined {
    return user ? user.frsT_NM : undefined;
  }
  LoadData() {
    this.service_GetEmpInfo();
  }
  AddProject_OnClick() {
    if (this._access.IsAllowed(39, 2, '', '') && this.projId && this.myControl.value != null && this.myControl.value != "") {

      let pr: ProjectResourceModel = new ProjectResourceModel();
      pr.proJ_ID = this.projId;
      pr.emP_ID = this.myControl.value.emP_ID;
      pr.bilL_FLG = this.isProjResource === false ? false : this.isBillable;
      pr.curR_INDC = this.isProjResource === true ? 'Y' : 'N';
      pr.createD_BY = localStorage.getItem("empid");
      pr.starT_DATE = this.startdate;
      pr.enD_DATE = this.enddate;

      this.service_checkIfResourceAlreadyExistsByDates(pr);
    }
    else{
      alert("Please choose Resource Name,Customer and Project");
      return;
    }
  }
  GetDetails_Onclick() {
    if(this.myControl.value != null && this.myControl.value != ""){
      this.service_GetProjectResourceByEmpId(this.myControl.value.emP_ID);
    }
    else{
      alert("Please enter Resource Name");
      return;
    }
  }
  DeleteRow_onClick(element: ProjectResourceByEmpIdModel): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteProjectResource(element).subscribe(data => {
        this.service_GetProjectResourceByEmpId(this.myControl.value.emP_ID);
      }, error => { this._util.serviceError(error); });

      //this.RefreshTable();
    } else {

    }
  }

  EditRow_onClick(element: ProjectResourceByEmpIdModel): void {
    this.startdate = element.starT_DATE;
    this.enddate = element.enD_DATE;
    this.isProjResource = element.curR_INDC;
    this.isBillable = element.bilL_FLG;
    this._projectSelector.custId = element.cusT_ID;
    this._projectSelector.projId = element.proJ_ID;
  }

  service_AddProjectResource(pr: ProjectResourceModel) {
    this._appservice.addProjectResource(pr).subscribe(data => {
      this.service_GetProjectResourceByEmpId(this.myControl.value.emP_ID)
      alert("Project added successfully");
    }, error => { this._util.serviceError(error); });
  }

  //service_checkIfResourceAlreadyExists(projectid,empid,start_date,end_date) {
  service_checkIfResourceAlreadyExistsByDates(prm: ProjectResourceModel) {
    this._appservice.checkIfResourceAlreadyExistsByDates(prm.proJ_ID, prm.emP_ID, prm.starT_DATE, prm.enD_DATE).subscribe(data => {
      if (data == null && this.errorStr == "") {
        this.service_AddProjectResource(prm);
        this.errorStr = "";
      }
    }, error => {
      this._util.serviceError(error);
      this.errorStr = error.error;

      alert(this.errorStr);
      this.errorStr = "";
    });


  }

  ProcessPSA() {
    this._appservice.ProcessPSARequests().subscribe(e => {
      alert("done!");
    });

  }

  ProcessCrisp() {

    this._appservice.ProcessCrispScoresForPeriod(this.crispMonth, this.crispYear.toString(), true).subscribe(e => {
      alert("done!");
    });
  }
  ProcessExternalKPI(){

  }
  
  ProcessC() {
    this._appservice.ProcessCScoreForPeriod(this.crispMonth, this.year.toString(), true).subscribe(e => {
      alert("done!");
    });

  }

  ProcessCrispPM() {

    this._appservice.ProcessCrispScoresForPeriodPM(this.crispMonth, this.year.toString()).subscribe(e => {
      alert("done!");
    });
  }

  CreateNewProject(){  
    this.AddNewProjectObj = new AddProjectsModel();
    this.AddNewProjectObj.proJ_ID = '201P000291-10';
    this.AddNewProjectObj.proJ_NM = 'test project Startup Audit';
    this.AddNewProjectObj.proJ_ALIAS_NM = '';     
    this.AddNewProjectObj.cusT_ID='201100010';
    this.AddNewProjectObj.proJ_PM_EMP_ID='102802';
    this.AddNewProjectObj.createD_BY='102802';
 
      this._appservice.addNewProject(this.AddNewProjectObj).subscribe(data => {    
        alert("Project Added Successfully");
        //this.emptyFields(AddNewProjectObj);
  
      }, 
      error => { this._util.serviceError(error);
  
      var getError = JSON.stringify(error);
      var getErrorJson = JSON.parse(getError);
      var getExactError = getErrorJson.error;
        
      // if(getExactError.search("PROJ_NM") || getExactError.search("Cannot insert duplicate key"))
      //Project Name Duplication Check
      if(getExactError.includes("Violation") && getExactError.includes("UNIQUE KEY") && getExactError.includes("PROJ_NM") && getExactError.includes("Cannot insert duplicate key in object 'dbo.PROJECT'"))
      {
      //  this.ProjectNameAlreadyExist = true;   
      }
      //Project ID Duplication Check
      else if(getExactError.includes("Violation") && getExactError.includes("PRIMARY KEY constraint") && getExactError.includes("PROJECT_PK") && getExactError.includes("Cannot insert duplicate key in object 'dbo.PROJECT"))
      { 
       // this.ProjectIdAlreadyExist = true;   
      }
      else
      {     
      }    
      // var ErrorMsgToDisplay = getExactError.search()
      });
    }
  
  GeneralMethod() {

    this._appservice.service_DowloadFile('aa','', '', 1)  .subscribe(
      (data:  Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        // const contentDisposition = data.headers.get('content-disposition');
        // // Rest of your code to extract filename using contentDisposition
        // // Extract the file name
        // console.log(contentDisposition);
        // const filename = contentDisposition
        //   .split(';')[1]
        //   .split('filename')[1]
        //   .split('=')[1]
        //   .trim();

        a.download =   'assessment.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error => {
        this._util.serviceError(error);
      }
    );
    // this._appservice.GeneralMethod( ).subscribe(e => {
    //   alert("done!");
    // });
  }

  service_GetEmpInfo() {
    this._appservice.getEmpInfo().subscribe(data => {
      this.empinfo = data;
    }, error => { this._util.serviceError(error); });
  }

  service_GetProjectResourceByEmpId(EmpId: string) {
    this._appservice.getProjectResourceByEmpId(EmpId).subscribe(data => {
      let tmpstrtDate: any;   // 2020-12-31T00:00:00  
      let tmpEndDate: any;

      data.forEach(element => {
        tmpstrtDate = element.starT_DATE;
        element.starT_DATE = tmpstrtDate.split('T')[0];

        tmpEndDate = element.enD_DATE;
        element.enD_DATE = tmpEndDate.split('T')[0];
      });

      this.projectResource = data;
      this.dataSource = data;
    }, error => { this._util.serviceError(error); });
  }

  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    //this.LoadData();    
    this.service_GetProjEndDateByProjId(this.projId);
  }

  service_GetProjEndDateByProjId(pid: string) {
    this._appservice.GetProjEndDateByProjId(pid).subscribe(data => {

      let tmpEndDate: any = data.enD_DATE;  // 2020-12-31T00:00:00        
      this.enddate = tmpEndDate.split('T')[0];

    }, error => { this._util.serviceError(error); });

  }

}
