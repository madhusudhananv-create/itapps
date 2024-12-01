import { Component, OnInit } from '@angular/core';
import { EmpInfoModel, ProjectResourceByEmpIdModel, ProjectResourceModel } from '../../../models/emp-info-model';
import { myUtility } from "../../../Shared/myUtility";
import { AppsService } from "../../../Services/apps.service";
import { Observable } from 'rxjs/internal/Observable';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { AccessControl } from '../../../Shared/accessControl';

@Component({
  selector: 'app-access-control-project-resource',
  templateUrl: './access-control-project-resource.component.html',
  styleUrls: ['./access-control-project-resource.component.scss']
})
export class AccessControlProjectResourceComponent implements OnInit {
  custId: string;
  projId: string;
  isBillable: boolean = true;
  isProjResource: boolean = true;
  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  projectResource: ProjectResourceByEmpIdModel[] = [];
  filteredOptions: Observable<EmpInfoModel[]>;
  dataSource: ProjectResourceByEmpIdModel[] = [];
  //displayedColumns = ['emP_ID', 'frsT_NM', 'curR_INDC', 'bilL_FLG', 'delete'];
  displayedColumns = ['emP_ID', 'frsT_NM', 'curR_INDC', 'bilL_FLG','starT_DATE','enD_DATE','delete'];  

  startdate :any = new Date().toISOString().split('T')[0];   //GenerateCurrentDate
  enddate: any = new Date();
  errorStr : string = "";
  isCreateAccessDisabled: boolean = true;
  constructor(public _util: myUtility, public _appservice: AppsService,public _access: AccessControl) {
    if (this._access.IsAllowed(39, 2, '', '')) { // check user have create access right
      this.isCreateAccessDisabled = false;// used directly in disabled field

    }

  }

  ngOnInit() {
    this.LoadData();
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
  AddResource_OnClick() {
if (this._access.IsAllowed(39, 2, '', '')) {
    let pr: ProjectResourceModel = new ProjectResourceModel();
    pr.proJ_ID = this.projId;
    pr.emP_ID = this.myControl.value.emP_ID;
    pr.bilL_FLG = this.isProjResource === false ? false : this.isBillable;
    pr.curR_INDC = this.isProjResource === true ? 'Y' : 'N';
    pr.createD_BY = localStorage.getItem("empid");
    pr.starT_DATE = this.startdate;
    pr.enD_DATE = this.enddate;
    //this.service_AddProjectResource(pr);
                 
    this.service_checkIfResourceAlreadyExistsByDates(pr);  
}

  }
  GetProjectResource_OnClick() {
    this.service_GetProjectResource(this.projId);
  }
  DeleteRow_onClick(element: ProjectResourceByEmpIdModel): void {    
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteProjectResource(element).subscribe(data => {
        this.service_GetProjectResource(this.projId);
      }, error => { this._util.serviceError(error); });

      //this.RefreshTable();
    } else {

    }
  }
 
  service_AddProjectResource(pr: ProjectResourceModel) {
    this._appservice.addProjectResource(pr).subscribe(data => {
      this.service_GetProjectResource(this.projId)
      alert("Resource added successfully");
    }, error => { this._util.serviceError(error); });
  }

  service_checkIfResourceAlreadyExistsByDates(prm : ProjectResourceModel) {
    this._appservice.checkIfResourceAlreadyExistsByDates(prm.proJ_ID, prm.emP_ID, prm.starT_DATE, prm.enD_DATE).subscribe(data => {
      if (data == null && this.errorStr==""){        
        this.service_AddProjectResource(prm);            
        this.errorStr = "";
      }                
    }, error => { this._util.serviceError(error);
      this.errorStr = error.error;
    
      alert(this.errorStr); 
      this.errorStr = "";     
    });

  }
  service_GetEmpInfo() {
    this._appservice.getEmpInfo().subscribe(data => {
      this.empinfo = data;
    }, error => { this._util.serviceError(error); });
  }

  service_GetProjectResource(ProjId: string) {
    this._appservice.getProjectResourceByProjId(ProjId).subscribe(data => {
      
      let tmpstrtDate:any;   // 2020-12-31T00:00:00  
      let tmpEndDate:any;      

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
    this.service_GetProjectResource(this.projId);
    this.service_GetProjEndDateByProjId(this.projId);
  }

  service_GetProjEndDateByProjId(pid:string){
    this._appservice.GetProjEndDateByProjId(pid).subscribe(data => {  
      
      let tmpEndDate:any = data.enD_DATE;  // 2020-12-31T00:00:00        
      this.enddate = tmpEndDate.split('T')[0];      
      
    }, error => { this._util.serviceError(error); });

  }
}
