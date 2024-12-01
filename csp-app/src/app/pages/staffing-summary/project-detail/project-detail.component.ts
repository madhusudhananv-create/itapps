import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MatDialogConfig, MatDialog, MAT_DIALOG_DATA, MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material';
import { StaffingProject } from '../../../models/staffing-model';
import { myUtility } from '../../../Shared/myUtility';
import { StaffingSharedService } from '../../../pages/staffing-summary/staffing-shared.service';
@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  popupTitle:string = "Project Resource Detail";
  projDetailData: StaffingProject[] = [];
  projectDetailColumns = ['emP_NAME', 'emP_START_DATE', 'bilL_FLG', 'iS_ONSITE']
  dataSource = new MatTableDataSource(this.projDetailData);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _util: myUtility, private _appService: StaffingSharedService) { this.projDetailData = data; }

  ngOnInit() {
      this.populateProjectDetails(this.data.projectDetails[0]);
  }
  ngOnChanges() {
    this.populateProjectDetails(this.data.projectDetails[0]);
  }

  populateProjectDetails(projDetail: any) {
    switch (projDetail.projType) {
      case "Project":
        this.service_GetStaffingProjectDetails(projDetail.proj_Id);
        this.popupTitle =  this.popupTitle + " - " + projDetail.projName;
        break;
      case "Portfolio":
        this.projectDetailColumns = ['projecT_NAME', 'emP_NAME', 'iS_ONSITE']
        this.service_GetStaffingAssignedProjectDetails(projDetail.proj_Id);
        this.popupTitle =  "Portfolio Resource Detail";
        break;
    }
  }
  service_GetStaffingProjectDetails(projId: string) {
    this._appService.GetStaffingProjectDetails(projId).subscribe(data => {
      this.projDetailData = data;
      this.dataSource = new MatTableDataSource(this.projDetailData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, error => { this._util.serviceError(error); });
  }
  service_GetStaffingAssignedProjectDetails(projId: string) {
    this._appService.GetStaffingAssignedProjectDetails(projId).subscribe(data => {
      this.projDetailData = data;
      this.dataSource = new MatTableDataSource(this.projDetailData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, error => { this._util.serviceError(error); });
  }
}