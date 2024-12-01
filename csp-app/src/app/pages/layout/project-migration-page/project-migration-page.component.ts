import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../layout.service';
import { ProjectsModel } from '../../../models/projects-model';
import { MigrateProjectsModel } from '../../../models/projects-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';

@Component({
  selector: 'app-project-migration-page',
  templateUrl: './project-migration-page.component.html',
  styleUrls: ['./project-migration-page.component.scss']
})
export class ProjectMigrationPageComponent implements OnInit {

   CUST_ID: string;
   private sub: any;
   input_oldprojectid: string;
   input_newprojectid: string;
   projNames: MigrateProjectsModel[] = [];
   oldProjNames : MigrateProjectsModel[] = [];
   newProjNames : MigrateProjectsModel[] = [];

   tempProjNames : MigrateProjectsModel[] = [];

   newProjDetails : MigrateProjectsModel = new MigrateProjectsModel();
   oldProjDetails : MigrateProjectsModel = new MigrateProjectsModel();

   selectedOldProject : any;
   selectedNewProject : any;
   allproj: boolean = true;

   successMessage : string;
   statusMessage  : string;
   errorStatus : number;
   showMessage : boolean = false;

  constructor(private route: ActivatedRoute,public _layoutService: LayoutService,private _appservice: AppsService,public _util: myUtility) { }

  ngOnInit() {


     this.sub = this.route.params.subscribe(params => {
      this.CUST_ID = params['custid'];
      this._layoutService.selectedCust = this.CUST_ID;
     });
     this.getOldProjects();
     this.getNewProjects();

  }

  getOldProjects() {
    this._appservice.GetCustomerProjectsForMigration(this.CUST_ID, true).subscribe(
      data => {
        this.oldProjNames = data;
      },
      error => {
        this._util.serviceError(error);
      }

    )
    this.showMessage=false;
  }


  getNewProjects() {
    this._appservice.GetCustomerProjectsForMigration(this.CUST_ID, false).subscribe(
      data => {
        this.newProjNames = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
    this.showMessage=false;
  }

getProjectDetails(ptype,projectId){
  if(ptype == "new")
      this.tempProjNames  =  this.newProjNames.filter((projName) => projName.proJ_ID === projectId);
  else
      this.tempProjNames =  this.oldProjNames.filter((projName) => projName.proJ_ID === projectId);

  if(this.tempProjNames.length > 0)
         return this.tempProjNames[0];

}

getProjects(ptype, pstatus) {

    var today = new Date();
    if(ptype == "new"){
        return this.projNames.filter((t) => t.Proj_Status != pstatus && formatDate(t.enD_DATE, "dd-MMM-yyyy", "en-US") > formatDate(today, "dd-MMM-yyyy", "en-US"));
    }
    else
    {
        return this.projNames.filter((t) => t.Proj_Status != pstatus);
    }

}

  onProjectChange(ptype) {

     if(ptype == "new")
        this.newProjDetails =  this.getProjectDetails(ptype,this.input_newprojectid);
     else
        this.oldProjDetails =  this.getProjectDetails(ptype,this.input_oldprojectid);

     this.successMessage = "";
     this.showMessage = false;

  }

  MigrateProjectData()
  {
    if(this.input_newprojectid == undefined )
    {
      alert ("Please select a new project.");
      return;
    }

      this._appservice.MigrateProjectData(this.input_oldprojectid,this.input_newprojectid).subscribe(
      data => {
                  this.statusMessage = data;

                   //alert(  "Project data of " + this.oldProjDetails.proJ_NM + " is successfully migrated to project " + this.newProjDetails.proJ_NM  );
                  this.errorStatus = 1;

                  this.getOldProjects();
                  this.getNewProjects();
                  this.showMessage = true;

      },

      error => { this._util.serviceError(error);
                 this.successMessage = "";
                 this.errorStatus = 0;
               });
               this.showMessage=true;

  }

}
