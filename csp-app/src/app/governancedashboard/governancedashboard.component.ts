import { Component, OnInit } from '@angular/core';
import { AppsService } from '../Services/apps.service'
import { myUtility } from '../Shared/myUtility'
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CompliancedetailsComponent } from './compliancedetails/compliancedetails.component';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Http } from '@angular/http';
import { ClientDetailsModel } from '../models/client-details-model';
import { CustomerModel } from '../models/customer-model';
import { ProjectsModel } from '../models/projects-model';
import { CustomerProjectsListModel } from '../models/customer-projects-model';
import { CsatDetailsComponent } from './csat-details/csat-details.component';
import { ProjforecastDetailsComponent } from './projforecast-details/projforecast-details.component';
import { BestpracticeMatrixComponent } from '../bestpractice-matrix/bestpractice-matrix.component';
import { IdeasInnovationMatrixComponent } from '../ideas-innovation-matrix/ideas-innovation-matrix.component';
import { CsatdashboardComponent } from '../csatdashboard/csatdashboard.component';
import { CrispDialogValidationsComponent } from '../controls/crisp/crisp-dialog-validations/crisp-dialog-validations.component';
 

@Component({
  selector: 'app-governancedashboard',
  templateUrl: './governancedashboard.component.html',
  styleUrls: ['./governancedashboard.component.scss']
})
export class GovernancedashboardComponent implements OnInit {
  selectedCustomer: CustomerProjectsListModel;
  selectedMonth: string = this._util.Month();
  selectedProject: string = "";
  selectedYear: number = this._util.Year();
  customer: CustomerProjectsListModel;
  month: string = this._util.Month();;
  year: number = this._util.Year();;
  sub: any;
  custid: string;
  projid: string;
  Customers: CustomerProjectsListModel[] = [];
  ProjectIds: string[] = [];
  complianceinfofail: any;
  complianceinfopass: any;
  compliancecount: number;
  projectforecast: any;
  CSATData: any;
  empId: string;
  employeecountfail: number = 0;
  employeecountpass: number = 0;
  details = [];
  constructor(private route: ActivatedRoute, private _appService: AppsService, public _util: myUtility, public dialog: MatDialog) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      if(params['month']!=undefined)
      { 
        this.selectedMonth = params['month'];
        this.selectedMonth = this.selectedMonth.charAt(0).toUpperCase() + this.selectedMonth.substr(1);
      }
      if(params['year']!=undefined)
        this.selectedYear = parseInt(  params['year']);
      if(params['custid']!=undefined)
        this.custid = params['custid'];
      if(params['projid']!=undefined && this.selectedProject != params['projid'])
        this.selectedProject = params['projid'];
      
    });
  
    this._util.validateLogin();
    
    this.LoadData();
    localStorage.setItem('navigateurl','');
  }
  ngOnChanges() {
  }
  LoadData() {
    this.service_getProjectList();
    if(this.selectedProject!=undefined && this.selectedProject!="")
    {
        this.service_getProjectCrispDetails(this.selectedProject,this.selectedMonth, this.selectedYear);

    }
  }
  ApplyFilter() {
    this.customer = this.selectedCustomer;
    this.month = this.selectedMonth;
    this.year = this.selectedYear;
    this.ProjectIds = this.customer.projects.map(({ proJ_ID }) => proJ_ID);
    this.GetProjectCount(this.ProjectIds);
    this.GetComplianceInfoPass(this.ProjectIds);
    this.GetComplianceInfoFail(this.ProjectIds);
    this.GetCSATData(this.ProjectIds, this.month, this.year);
  }

  ReEvaluate(){
    alert("re evaluate");
    this._appService.ProcessCrispScoresForProject(this.selectedCustomer.cusT_ID, "", this.selectedMonth, this.selectedYear).subscribe(e=>{

      this.ProjectIds = this.customer.projects.map(({ proJ_ID }) => proJ_ID);
    });
  }
  GetProjectCount(ProjectIds) {
    this._appService.getProjectComplainceCount(ProjectIds).subscribe(
      data => {
        this.compliancecount = data;
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }
  GetComplianceInfoFail(ProjectIds) {
    this._appService.getProjectComplainceInfoFail(ProjectIds).subscribe(
      data => {
        this.complianceinfofail = data;
        this.GetEmployeeCountFail(this.complianceinfofail)
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }
  GetComplianceInfoPass(ProjectIds) {
    this._appService.getProjectComplainceInfoPass(ProjectIds).subscribe(
      data => {
        this.complianceinfopass = data;
        this.GetEmployeeCountPass(this.complianceinfopass)
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }
  GetEmployeeCountFail(complianceinfofail) {
    let i;
    this.employeecountfail = 0;
    for (i = 0; i < complianceinfofail.length; i++) {
      this.employeecountfail = this.employeecountfail + complianceinfofail[i].projecT_COMPLIANCE.length;
    }
  }
  GetEmployeeCountPass(complianceinfopass) {
    let i;
    this.employeecountpass = 0
    for (i = 0; i < complianceinfopass.length; i++) {
      this.employeecountpass = this.employeecountpass + complianceinfopass[i].projecT_COMPLIANCE.length;
    }
  }

  GetProjectForecast() {
    this.empId = localStorage.getItem('empid');
    this._appService.getProjectForecast(this.empId).subscribe(
      data => {
        this.projectforecast = data;
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }
  GetCSATData(ProjectIds, month, year) {
    this._appService.getCSATData(ProjectIds, month, year).subscribe(
      data => {
        this.CSATData = data;
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }
  GetCSATDetail(CSATData) {
    this.showCSAT(CSATData)
  }
  DisplayDetails(complianceinfo, status) {
    this.showRisk(complianceinfo, status)
  }
  GetProjectForecastDetail(projectforecast, id) {
    this.showForecast(projectforecast, id)
  }
  showRisk(complianceinfo, status) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      info: complianceinfo,
      status: status
    }
    const dialogRef = this.dialog.open(CompliancedetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
  //  console.log(`Dialog result: ${result}`);
    });
  }
  showBestPracMatrix() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      processArea: "all",
      serviceArea:"all"
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(BestpracticeMatrixComponent, dialogConfig);
    // dialogRef.updateSize('100%', '100%');
    dialogRef.updatePosition({ top: '10px' });
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }
  showCSATDashboard() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(CsatdashboardComponent, dialogConfig);
    // dialogRef.updateSize('100%', '100%');
    dialogRef.updatePosition({ top: '10px' });
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }
  showIdeaMatrix() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true,
      dialogConfig.data = {
        processArea: "all"
      },

      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(IdeasInnovationMatrixComponent, dialogConfig);
    // dialogRef.updateSize('100%', '100%');
    dialogRef.updatePosition({ top: '10px' });
    dialogRef.afterClosed().subscribe(result => {
//console.log(`Dialog result: ${result}`);
    });
  }
  showForecast(complianceinfo, id) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      info: complianceinfo,
      id: id
    }
    dialogConfig.height = "300px"
    const dialogRef = this.dialog.open(ProjforecastDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
//console.log(`Dialog result: ${result}`);
    });
  }
  ShowCrispDetails( ) {
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      summary: this.details[0],
       
    }
    const dialogRef = this.dialog.open(CrispDialogValidationsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
   
    });
  }

  showCSAT(CSATData) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      info: CSATData,
    }
    const dialogRef = this.dialog.open(CsatDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }
  service_getProjectList() {
    this._appService.GetCustomerProjectsList(localStorage.getItem('empid'))
      .subscribe
      (
      data => {
        this.Customers = data;
        if(this.custid!="")
          this.selectedCustomer = this.Customers.filter(x=>x.cusT_ID == this.custid)[0];
        else
          this.selectedCustomer =  this.Customers[0];
        if(this.projid!="")
            this.ProjectIds = this.selectedCustomer.projects.filter(x=>x.proJ_ID == this.projid).map(x=>x.proJ_ID);
        else
          this.ProjectIds = this.Customers[0].projects.map(({ proJ_ID }) => proJ_ID);
        this.GetProjectCount(this.ProjectIds);
        //this.GetComplianceInfoFail(this.ProjectIds);
        //this.GetComplianceInfoPass(this.ProjectIds);
        this.GetProjectForecast();
        //this.GetCSATData(this.ProjectIds, this.month, this.year);
        this.ApplyFilter();
      }
      ,
      error => {
        this._util.serviceError(error);
      }
      );
  }

  service_getProjectCrispDetails(ProjectIds, month, year) {
    // if( this._dialogOpen  ) { alert("dailog open"); return;}
     if(ProjectIds ==undefined || ProjectIds =="") return;
    let projIdsArray =[];
    projIdsArray.push(ProjectIds);
     this._appService.GetCrispDetails(projIdsArray, month, year).subscribe(data => {
      console.log(data);
       this.details = data;
       console.log(this.details);
       this.ShowCrispDetails( );
     }, error => { this._util.serviceError(error);  });
   }

}
