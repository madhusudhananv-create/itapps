import { Component, OnInit } from '@angular/core';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { MatTableDataSource } from '@angular/material';
import { AppAccessControlsModel, AppControlFeaturesModel } from '../../../models/access-control-model';
import { CustomerProjectIds } from '../../../models/customer-projects-model';

@Component({
  selector: 'app-access-control-employee',
  templateUrl: './access-control-employee.component.html',
  styleUrls: ['./access-control-employee.component.scss']
})
export class AccessControlEmployeeComponent implements OnInit {
  custId: any;
  projId: any;
  employees: EmpInfoModel[] = [];
  selectedEmployee: EmpInfoModel;
  accessControls: AppAccessControlsModel[] = [];
  dataSource = new MatTableDataSource(this.accessControls);
  displayedColumns: string[] = ['index', 'resourcE_ID', 'proJ_ID', 'vieW_ACCESS', 'creatE_ACCESS', 'ediT_ACCESS', 'deletE_ACCESS', 'defaulT_ACCESS'];
  constructor(public _util: myUtility, private _appservice: AppsService, ) { }

  ngOnInit() {
    this._util.LoadAppResource();
    this.LoadData();
  }
  ngOnChange() {
    this.LoadData();
  }
  LoadData() {
    this.service_GetAppControlFeatures()
    //this.service_GetEmployees();
  }
  save() {
    for (let a of this.accessControls) {
      // if (a.PROJ_ID === null || a.PROJ_ID === '' || a.PROJ_ID === ' ' ) {
      //   alert("Please asign a Project")
      //   return;
      // }
    }
    this.service_UpdateAccessControl()
  }
  delete() {
    this.service_DeleteAccessControls()
  }
  service_UpdateAccessControl() {
    this._appservice.UpdateAccessControls(this.accessControls).subscribe(data => {
      alert("Updated Successfully");
      this.service_GetAccessControlsByEmpId(this.selectedEmployee.emP_ID)
    }, error => { this._util.serviceError(error); });
  }
  service_DeleteAccessControls() {
    this._appservice.DeleteAccessControls(this.accessControls).subscribe(data => {
      alert("Restored Successfully");
      this.service_GetAccessControlsByEmpId(this.selectedEmployee.emP_ID)
    }, error => { this._util.serviceError(error); });
  }

  project_onChange($event) {
    let obj: CustomerProjectIds = $event;
    this.custId = obj.customer;
    this.projId = obj.project;
    for (let r of this.accessControls) {
      r.PROJ_ID.push(obj.project.toString());
    }
  }
  service_GetEmployees() {
    this._appservice.getEmployees(localStorage.getItem('empid')).subscribe(data => {
      this.employees = data;
    }, error => { this._util.serviceError(error); });
  }

  service_GetAccessControlsByEmpId(empid) {
    this._appservice.GetAccessControlsByEmpId(empid).subscribe(data => {
      this.accessControls = data;
      this.dataSource = new MatTableDataSource(this.accessControls);
    }, error => { this._util.serviceError(error); });
  }

  ddEmployee_Onchange() {
    this.service_GetAccessControlsByEmpId(this.selectedEmployee.emP_ID);
  }
  
  appControlFeatures: AppControlFeaturesModel[] = [];
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
      this.service_GetEmployees();
    }, error => { this._util.serviceError(error); });
  }

}
