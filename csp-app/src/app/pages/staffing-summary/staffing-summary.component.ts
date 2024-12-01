import { Component, Input, OnInit, ViewChild, Inject } from '@angular/core';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { Router, ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts/highstock';
//import * as HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { MatPaginator, MatTableDataSource, MatSort, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { StaffingProject, StaffingSummary } from '../../models/staffing-model';
import { StaffingSharedService } from '../../pages/staffing-summary/staffing-shared.service';
import { MockNgModuleResolver } from '@angular/compiler/testing';
import { SharedService } from '../../Shared/shared.service';

declare var require: any
const HC_exporting = require('highcharts/modules/exporting');
const HC_ExportData = require('highcharts/modules/export-data');

//HighchartsSolidGauge(Highcharts);

@Component({
  selector: 'app-staffing-summary',
  templateUrl: './staffing-summary.component.html',
  styleUrls: ['./staffing-summary.component.scss'],
  providers: [StaffingSharedService],
})

export class StaffingSummaryComponent implements OnInit {
  Highcharts = Highcharts;
  constructor(private _appService: StaffingSharedService, private route: ActivatedRoute, private _util: myUtility, public dialog: MatDialog, private _shared : SharedService,
              private dialogRef: MatDialogRef<StaffingSummaryComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  @Input('customerId') input_customerId1: string;
  input_customerId: string
  pieChartData: any;
  private sub: any;
  projDetail: any;
  summaryResData: any;
  summaryBillData: any;
  summaryProjData: StaffingProject[] = [];
  resourceData: StaffingSummary[] = [];
  projectSummaryColumns = ['projecT_NAME', 'offshorE_BILLED', 'offshorE_UNBILLED', 'onshorE_BILLED', 'onshorE_UNBILLED', 'billed', 'unbilled']
  resourceSummaryColumns = ['name', 'projecT_NAME', 'offshore', 'onsite', 'total']
  dataSource = new MatTableDataSource(this.summaryProjData);
  resourceDataSource = new MatTableDataSource(this.resourceData);

  @ViewChild("projPaginator") projPaginator: MatPaginator;
  @ViewChild("sort") sort: MatSort;

  @ViewChild("resPaginator") resPaginator: MatPaginator;
  @ViewChild("resSort") resSort: MatSort;

  ngOnInit() {
    if(this.data != null)
    {
      this.input_customerId = this.data.custid;      
    }

    if(this.input_customerId == null || this.input_customerId == undefined)
      this.input_customerId = this.input_customerId1;
      
    if (this.input_customerId != undefined) {
      this.service_GetStaffingSummaryReport(this.input_customerId, "false");
      this.service_GetStaffingSummaryReport(this.input_customerId, "true");
      this.service_GetStaffingProjectSummary(this.input_customerId, "");
      this.service_GetStaffingAssignedProjects(this.input_customerId, "");
    }
  }
  ngOnChanges() {
    if (this.input_customerId != undefined) {
      this.service_GetStaffingProjectSummary(this.input_customerId, "");
      this.service_GetStaffingAssignedProjects(this.input_customerId, "");
    }
  }
  assignCharts() {
    this.pieChartData.forEach(element => {
      if (element.title.text == "Resources Summary")
        this.summaryResData = element;
      else if (element.title.text == "Billing Summary")
        this.summaryBillData = element;
    });

  }

  service_GetStaffingSummaryReport(custId: string, isBilledReport?: string) {
    this._appService.GetStaffingSummaryReport(custId.toString(), isBilledReport).subscribe(data => {
      this.pieChartData = data;
      this.assignCharts();
      //console.log(this.summaryResData);

    }, error => { this._util.serviceError(error); });
  }
  service_GetStaffingProjectSummary(custId: string, projId?: string) {
    this._appService.GetStaffingProjectSummary(custId.toString(), projId).subscribe(data => {
      if(data != null)
      {
        if(this._shared.selectedProjects.length > 0){    
          this._shared.selectedProjects.forEach(element => {      
            this.summaryProjData.push(...data.filter(p => p.proJ_ID === element));          
          });
        }
        else{
          this.summaryProjData = data;
        }
      }
      
      this.dataSource = new MatTableDataSource(this.summaryProjData);
      this.dataSource.paginator = this.projPaginator;
      this.dataSource.sort = this.sort;
    }, error => { this._util.serviceError(error); });
  }
  service_GetStaffingAssignedProjects(custId: string, projId?: string) {
    this._appService.GetStaffingAssignedProjects(custId.toString(), projId).subscribe(data => {
      if(data != null)
      {
        if(this._shared.selectedProjects.length > 0){     
          this._shared.selectedProjects.forEach(element => {      
            this.resourceData.push(...data.filter(p => p.proJ_ID === element));
          });
        }
        else{
          this.resourceData = data;
        }
      }
      
      this.resourceDataSource = new MatTableDataSource(this.resourceData);
      this.resourceDataSource.paginator = this.resPaginator;
      this.resourceDataSource.sort = this.resSort;      
    }, error => { this._util.serviceError(error); });    
  }
  ViewRow_onClick(row, type: string) {

    this.projDetail = [{ proj_Id: row.parenT_PROJ_ID == null ? row.proJ_ID : row.parenT_PROJ_ID, projType: type, projName: row.projecT_NAME }]
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      projectDetails: this.projDetail
    }
    const dialogRef = this.dialog.open(ProjectDetailComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    //  console.log(`Dialog result: ${result}`);
    });
  }

  closeDialog(){
    this.dialogRef.close();
  }
}

