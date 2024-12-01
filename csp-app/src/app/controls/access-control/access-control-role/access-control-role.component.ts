import { Component, OnInit } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { ProjectRolesModel } from '../../../models/project-roles-model';
import { MatTableDataSource } from '@angular/material';
import { AppAccessControlsModel, AppControlFeaturesModel } from '../../../models/access-control-model';

@Component({
  selector: 'app-access-control-role',
  templateUrl: './access-control-role.component.html',
  styleUrls: ['./access-control-role.component.scss']
})
export class AccessControlRoleComponent implements OnInit {
  selectedRoleId: number;
  accessControls: AppAccessControlsModel[] = [];
  projectRoles: ProjectRolesModel[] = [];
  appControlFeatures: AppControlFeaturesModel[] = [];
  dataSource = new MatTableDataSource(this.accessControls);
  displayedColumns: string[] = ['index', 'resourcE_ID', 'rolE_ID', 'emP_ID', 'vieW_ACCESS', 'creatE_ACCESS', 'ediT_ACCESS', 'deletE_ACCESS', 'save', 'delete'];
  constructor(public _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
    this._util.LoadAppResource();
  }
  ngOnChange() {
    this.LoadData();
  }
  LoadData() {
    this.service_GetAppControlFeatures()
    //this.service_GetProjectRoles();
  }
  SaveRow_onClick(row: AppAccessControlsModel) {
    this._appservice.UpdateAccessControl(row).subscribe(data => {
      alert("Updated Successfully");
      //this.accessControls = data;
      //this.dataSource = new MatTableDataSource(this.accessControls);
    }, error => { this._util.serviceError(error); });
  }
  ddRoles_Onchange() {
    if (this.selectedRoleId === undefined) {
      alert("Please select a role");
      return;
    }
    this.service_GetAccessControlsByRoleId(this.selectedRoleId);
  }

  CopyRow_onClick(row: AppAccessControlsModel) {
    alert("Updated Successfully");
  }
  IsAllowed(row, feature) {
    let recs = this.appControlFeatures.filter(t => t.resourcE_ID == row.resourcE_ID && t.feature == feature);
    if (recs == null || recs.length ==0)
      return false;
    else
      return true;
  }
  service_GetAppControlFeatures() {
    this._appservice.GetAppControlFeatures().subscribe(data => {
      this.appControlFeatures = data;
      this.service_GetProjectRoles();
    }, error => { this._util.serviceError(error); });
  }
  service_GetProjectRoles() {
    this._appservice.GetProjectRoles().subscribe(data => {
      this.projectRoles = data;
    }, error => { this._util.serviceError(error); });
  }
  service_GetAccessControlsByRoleId(roleId: number) {
    this._appservice.GetAccessControlsByRoleId(roleId).subscribe(data => {
      this.accessControls = data;
       
      this.dataSource = new MatTableDataSource(this.accessControls);
    }, error => { this._util.serviceError(error); });
  }
}