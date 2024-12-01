import { Component, OnInit, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Http } from '@angular/http';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { SqaProjectReportsModel, SqaChartParamsModel, SqaChartFilterModel, SqaChartParamsWithFilterModel } from '../../../../models/sqa-project-reports-model';
import { EmployeeWiseComponentInfoComponent } from '../employee-wise-component-info/employee-wise-component-info.component';
import { LayoutService } from '../../../layout/layout.service';
import {  enumRoles } from '../../../../Shared/enum';
import { ActivatedRoute } from '@angular/router';
import { ProjectsModel } from '../../../../models/projects-model';
export interface User {
  value: string;
  viewValue: string;

}

export interface PeriodicElement {
  name: string;
  position: number;
  complaint: number;
  noncomplaint: number;
  total: number;

}
const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'bala', complaint: 2, noncomplaint: 3, total: 4 },
  { position: 2, name: 'roop', complaint: 23, noncomplaint: 34545, total: 1233 },
  { position: 3, name: 'basha', complaint: 23, noncomplaint: 34545, total: 1233 },
  { position: 4, name: 'saker', complaint: 23, noncomplaint: 34545, total: 1233 }
];
@Component({
  selector: 'app-compliance-insights',
  templateUrl: './compliance-insights.component.html',
  styleUrls: ['./compliance-insights.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ComplianceInsightsComponent implements OnInit {
  @Input("CustId") custId: any;
  @Input("ProjId") projId: any;
  @Input("reporType") type: any;
  displayedColumns: string[] = ['position', 'name', 'complaint', 'noncomplaint', 'total'];
  selectedReportType: any;
  dataSource = ELEMENT_DATA;
  reportTypes: SqaProjectReportsModel[] = [];
  dataDumpType: string = 'Incident and Service Request';
  ddDataDumpType = ['Incident and Service Request', 'Incident', 'Service Request', 'CSAT', 'Others']
  filteredInsights: any;
  startDate: Date;
  insightDetails: any;
  endDate: Date;
  rowIds: string[] = [];
  _loading: Boolean = false;
  allproj: boolean = false;
  input_projectid: string;
  input_customerid: string;
  projNames: ProjectsModel[];
  showdetails: boolean = false;
  menuToggleStatus: boolean;
  private sub: any;
  // Highlight the 1st and 20th day of each month.
  // return (date === 1 || date === 20) ? 'example-custom-date-class' : undefined;


  constructor(public dialog: MatDialog, private _http: Http, private _util: myUtility, private _appservice: AppsService, public _layoutService: LayoutService, private route: ActivatedRoute) { }

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
      this.input_projectid = params['projid'];
      if (this.input_projectid != undefined && this.input_projectid != null) {        
        this.projId = this.input_projectid;
        this._layoutService.selectedProj = this.input_projectid;
      }
    });
    this.getAllProjectsFromCustomer();
    this.service_GetSQAReportTypes(this.projId);
  }

  ngOnChanges() {
    this.service_GetSQAReportTypes(this.projId);
  }
  users: User[] = [
    { value: 'csm-0', viewValue: 'csm' },
    { value: 'mbl-1', viewValue: 'mbl' },
    { value: 'app-2', viewValue: 'app' }
  ];




  AnalyzeInsights() {
    this.service_getAnalyzedInsights(this.custId, this.projId, this.dataDumpType, this.startDate, this.endDate);
  }
  service_getAnalyzedInsights(custId, projId, type, startdate, enddate) {
    this._loading = true;
    this._appservice.GetAnalyzedInsights(custId, projId, type, startdate, enddate).subscribe(
      data => {
        this.filteredInsights = data;
        this._loading = false;
      },
      error => { this._util.serviceError(error); }
    );
  }
  getDetails(element) {
    this.rowIds = [];
    element.forEach(val => {
      this.rowIds.push(val.roW_ID);
    });
    this.service_getInsightDetails(this.rowIds);
  }
  service_getInsightDetails(rows) {
    this._appservice.getInsightDetails(rows).subscribe(
      data => {
        this.insightDetails = data;
        this.showDetailPopUp(this.insightDetails);
      },
      error => { this._util.serviceError(error); }
    );
  }
  showDetailPopUp(details) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      details
    }
    dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(EmployeeWiseComponentInfoComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });
  }
  // openDialog() {
  //   const dialogRef = this.dialog.open(ProjectUserComponent);

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }
  service_GetSQAReportTypes(projid) {
    this._appservice.GetSQAReportTypes(projid).subscribe(data => {
      this.selectedReportType = new SqaProjectReportsModel();
      this.reportTypes = data;
    }, error => { this._util.serviceError(error); });
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          if (this._layoutService.selectedProj != undefined && this._layoutService.selectedProj != null) {
            this.input_projectid = this._layoutService.selectedProj;
            this.showdetails = true;
            this.onProjectChange();
            this._layoutService.selectedProj = null;
          }
          else {
            this.input_projectid = this.projNames[0].proJ_ID;
            this.showdetails = true;
            this.onProjectChange();
          }
        }

      },
      error => {
        this._util.serviceError(error);
      }
    )
  }
  onProjectChange() {
    this.projId = this.input_projectid;
    this.service_GetSQAReportTypes(this.projId);
  }
  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }
}

