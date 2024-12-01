
import { Component, OnInit, Inject, Input } from '@angular/core';
import { ReportsSPParamsModel } from '../../../models/report-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { enumRoles } from '../../../Shared/enum';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../layout.service';
import { ProjectsModel } from '../../../models/projects-model';
import { environment } from '../../../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { CrispProjectSummaryModel } from '../../../models/crisp-project-summary-model';
import { MatDialogConfig, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { CrispDialogValidationsComponent } from '../../../controls/crisp/crisp-dialog-validations/crisp-dialog-validations.component';
import { CustomerProjectsListModel } from '../../../models/customer-projects-model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-crisp-report',
  templateUrl: './crisp-report.component.html',
  styleUrls: ['./crisp-report.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})
export class CrispReportComponent implements OnInit {


  input_customerid: string;
  allproj: boolean = false;
  generateResults: boolean = false;
  projNames: ProjectsModel[];
  input_projectid: string[] = [];

  panelExpand:boolean[]=[];

  data: CrispProjectSummaryModel[];
  detail: CrispProjectSummaryModel;
  validations = [];
  //ProjectIds: string[] = [];
  selectedProject: string = "";
  month: string = this._util.Month();
  year: number = this._util.Year();

  Customers: CustomerProjectsListModel[] = [];
  custid: string;
  projid: string;
  selectedCustomer: CustomerProjectsListModel;

  summary: CrispProjectSummaryModel[] = [];
  details = [];
  _loading: boolean = false;

  displayedColumns = ['projecT_NAME', 'Customer Success', 'Risks and Issues', 'Ideas and Innovations', 'Success Survey', 'Process Compliance'];
  dataSource: MatTableDataSource<any>;

  constructor(public _util: myUtility, private _appService: AppsService, private route: ActivatedRoute, public _layoutService: LayoutService, private _http: Http, public dialog: MatDialog) { }

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;


    this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
      this.custid = this.input_customerid;
    });

    this.route.params.subscribe(params => {
      this.selectedProject = params['projid'];

      if (this.selectedProject != undefined && this.selectedProject != null && this.selectedProject != '') {

        this.input_projectid.push(this.selectedProject);
        this.generateResults = true;
      }
    });
    this.route.params.subscribe(params => {
      if (params['month'] != undefined && params['month'] != null)
        this.month = params['month'];

    });
    this.route.params.subscribe(params => {
      if (params['year'] != undefined && params['year'] != null)
        this.year = +params['year'];
    });
    // this.service_getProjectList();
    this.getAllProjectsFromCustomer();

  }
  ngOnChanges() {
    this.service_getCrispProjectSummary(this.input_projectid, this.month, this.year);
  }

  getAllProjectsFromCustomer() {
    this._appService.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {

          if (this.generateResults)
            this.ApplyFilter();
        }



      },
      error => {
        // this.showGetDetails=true;

        this._util.serviceError(error);
      }
    )

  }


  service_getProjectList() {
    this.Customers = [];
    if (this.input_projectid == undefined)
      this.input_projectid = [];
    this._appService.GetCustomerProjectsList(localStorage.getItem('empid'))
      .subscribe
      (
      data => {
        this.Customers = data;


        // if(this.custid>0)
        this.selectedCustomer = this.Customers.filter(x => x.cusT_ID == this.custid)[0];

        this.service_getCrispProjectSummary(this.input_projectid, this.month, this.year);

      }
      ,
      error => {
        this._util.serviceError(error);

      }
      );
  }

  service_getCrispProjectSummary(projectIds, month, year) {
    this._loading = true;
    this.summary = [];
    this.data = [];


    this._appService.GetCrispProjectSummary(projectIds, month, year).subscribe(data => {
      this.summary = data;
      this.dataSource = new MatTableDataSource(this.summary);

      this._loading = false;

      if (this.selectedProject != undefined && this.selectedProject != "") {

      }
      this.summary.forEach(x => {

        this.service_getProjectCrispDetails(x.projecT_ID, this.month, this.year);
        this.panelExpand.push(false);

      });
    }, error => {
      this._loading = false;
      this._util.serviceError(error);
    });
  }


  service_getProjectCrispDetails(projectId, month, year) {
    // if( this._dialogOpen  ) { alert("dailog open"); return;}
    if (projectId == undefined || projectId == "") return;


    this._appService.GetCrispDetailsNew(projectId, month, year).subscribe(data => {

      this.data.push(data[0]);

    }, error => { this._util.serviceError(error); });
  }


  getCategoryDetails(projId) {

    this.detail = this.data.filter(x => x.projecT_ID == projId)[0];

    if (this.detail == undefined || this.detail == null) return [];
    return this.detail.validations;



  }
  ApplyFilter() {
    this._loading = true;
    this.panelExpand=[];
    this.service_getCrispProjectSummary(this.input_projectid, this.month, this.year);
  }

  Refresh() {
    this._loading = true;
    this.panelExpand=[];
    console.log(this.input_projectid);
    this._appService.ProcessCrispScoresForProject(this.custid, this.input_projectid, this.month, this.year).subscribe(data => {
      this.service_getCrispProjectSummary(this.input_projectid, this.month, this.year);

    });
  }

  Reset() {
    this.month = this._util.Month();;
    this.year = this._util.Year();    
    this.input_projectid = [];
    this.panelExpand=[];
    // this.ProjectIds=this.input_projectid;
    //this.input_projectid =[];
    this.summary = [];
  }

  navigate(proj, val) {
    let url = '';
    if (val.criteriA_ID == 1) {
      //successgoal/goals/212100001/212P000155/Nov/2020
      url = "/successgoal/goals/" + this.custid + "/" + proj.projecT_ID + "/" + this.month + "/" + this.year;
    }
    else if (val.criteriA_ID == 2) {
      url = url = "/successgoal/goals/" + this.custid + "/" + proj.projecT_ID + "/" + this.month + "/" + this.year;
    }
    else if (val.criteriA_ID == 3) {
      url = "/layout/risk/" + this.custid + "/" + proj.projecT_ID;
    }
    else if (val.criteriA_ID == 4) {
      url = "/layout/issues/" + this.custid;
    }
    else if (val.criteriA_ID == 5) {
      url = "/layout/ideas/" + this.custid;
    }
    else if (val.criteriA_ID == 6) {
      url = "/layout/ideas/" + this.custid;
    }
    else if (val.criteriA_ID == 8) {
      url = "/layout/issues/" + this.custid;
    }
    else if (val.criteriA_ID == 7) {
      this._appService.GetProjectCsatURL(proj.projecT_ID, this.month, this.year).subscribe(e=>{

        if(e!='')
          window.open(e, '_blank');
      });
    }
    else if (val.criteriA_ID == 9) {
      url = "/layout/checklistfindings/" + this.custid;
    }
    else if (val.criteriA_ID == 10) {
      url = "/layout/mandatorytrainingreport/" + this.custid + "/" + proj.projecT_ID + "/" + this.year + "/" + this.month;
    }
    else if (val.criteriA_ID == 11) {
      url = "/layout/mandatorytrainingreport/" + this.custid + "/" + proj.projecT_ID + "/" + this.year + "/" + this.month;
    }

    if (url != '')
      window.open(url, '_blank');
  }

}
