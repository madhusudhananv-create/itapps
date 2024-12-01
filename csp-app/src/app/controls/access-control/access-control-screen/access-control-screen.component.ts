import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { MediaMatcher } from '@angular/cdk/layout';
// import { MatTableDataSource } from '@angular/material';
// import { Router } from '@angular/router';
// import { AccessControlModel } from '../../../models/access-control-model';
// import { ProjectRolesModel } from '../../../models/project-roles-model';
// import { EmpInfoModel } from '../../../models/emp-info-model';
import { myUtility } from '../../../Shared/myUtility';
// import { AppsService } from '../../../Services/apps.service';
// import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-access-control-screen',
  templateUrl: './access-control-screen.component.html',
  styleUrls: ['./access-control-screen.component.scss']
})
export class AccessControlScreenComponent implements OnInit {
  // mobileQuery: MediaQueryList;
  // private _mobileQueryListener: () => void;
  // displayedColumns: string[] = ['index', 'resourcE_NAME', 'rolE_ID', 'emP_ID', 'vieW_ACCESS', 'creatE_ACCESS', 'ediT_ACCESS', 'deletE_ACCESS', 'save', 'copy', 'delete'];
  // selectedRoleId: number;
  
  
  // employees: EmpInfoModel[] = [];
  // selectedEmployee: EmpInfoModel;
  
  constructor(public _util: myUtility,) {
   
  }

  ngOnInit() {
   
  }
  ngOnChange() {
   
  }
  
  // applyFilter(filterValue: string) {
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }
  ddRoles_Onchange() {
    // if (this.selectedRoleId === undefined) {
    //   alert("Please select a role");
    //   return;
    // }
    //this.service_GetAccessControlsByRoleId(this.selectedRoleId);
  }
  ddEmployee_Onchange(){

  }
  LoadData() {
    //this.service_GetEmployees()
  } 
  // SaveRow_onClick(row: AccessControlModel) {
  //   this._appservice.UpdateAccessControl(row).subscribe(data => {
  //     alert("Updated Successfully");
  //     //this.accessControls = data;
  //     //this.dataSource = new MatTableDataSource(this.accessControls);
  //   }, error => { this._util.serviceError(error); });
  // }
  // CopyRow_onClick(row: AccessControlModel) {
  //   alert("Updated Successfully");
  // }
  // service_GetEmployees() {
  //   this._appservice.getEmployees(localStorage.getItem('empid')).subscribe(data => {
  //     this.employees = data;
  //   }, error => { this._util.serviceError(error); });
  // }
  
  // service_GetAccessControlsByRoleId(roleId: number) {
  //   this._appservice.GetAccessControlsByRoleId(roleId).subscribe(data => {
  //     this.accessControls = data;
  //     this.dataSource = new MatTableDataSource(this.accessControls);
  //   }, error => { this._util.serviceError(error); });
  // }

  
}




