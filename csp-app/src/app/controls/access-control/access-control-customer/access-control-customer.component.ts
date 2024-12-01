import { Component, OnInit } from '@angular/core';
import { AppAccessControlsModel, AppControlFeaturesModel } from '../../../models/access-control-model';
import { MatTableDataSource } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { CustomerProjectIds, CustomerProjectsModel } from '../../../models/customer-projects-model';
import { ProjectsModel } from '../../../models/projects-model';

@Component({
  selector: 'app-access-control-customer',
  templateUrl: './access-control-customer.component.html',
  styleUrls: ['./access-control-customer.component.scss']
})
export class AccessControlCustomerComponent implements OnInit {
  custId: any;
  projId: any;
  customers: CustomerProjectsModel[] = [];
  selectedCustomer: CustomerProjectsModel;
  projects: ProjectsModel[] = [];
  selectedProject: ProjectsModel;

  accessControls: AppAccessControlsModel[] = [];
  dataSource = new MatTableDataSource(this.accessControls);
  displayedColumns: string[] = ['index', 'resourcE_ID', 'cusT_ID', 'proJ_ID', 'emP_ID', 'vieW_ACCESS', 'creatE_ACCESS', 'ediT_ACCESS', 'deletE_ACCESS', 'defaulT_ACCESS'];
  constructor(public _util: myUtility, private _appservice: AppsService, ) { }

  ngOnInit() {
    this.LoadData();
  }
  ngOnChange() {
    this.LoadData();
  }
  LoadData() {
    this.service_GetAppControlFeatures()
    //this.service_GetCustomers(localStorage.getItem('empid'));
  }
  save() {
    this.service_UpdateAccessControl()
  }
  delete(){
    this.service_DeleteAccessControls()
  }
  ddCustomer_Onchange() {
    this.selectedProject = null;
    this.accessControls = [];
    this.dataSource = new MatTableDataSource(this.accessControls);
    this.service_GetClientProjects(this.selectedCustomer.id);
  }
  ddProject_Onchange() {
    this.service_GetCustomerAccessControls(this.selectedCustomer.emailid, this.selectedProject.proJ_ID);
  }
  service_GetClientProjects(clientId) {
    this._appservice.GetClientProjects(clientId).subscribe(data => {
      this.projects = data;
    }, error => { this._util.serviceError(error); });
  }
  service_UpdateAccessControl() {
    this._appservice.UpdateAccessControls(this.accessControls).subscribe(data => {
      alert("Updated Successfully");
      this.service_GetCustomerAccessControls(this.selectedCustomer.emailid, this.selectedProject.proJ_ID)
    }, error => { this._util.serviceError(error); });
  }

  service_DeleteAccessControls(){
    this._appservice.DeleteAccessControls(this.accessControls).subscribe(data => {
      alert("Restored Successfully");
      this.service_GetCustomerAccessControls(this.selectedCustomer.emailid, this.selectedProject.proJ_ID)
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
  service_GetCustomers(empid) {
    //localStorage.getItem('empid')
    this._appservice.getCustomerInfo(empid).subscribe(data => {
      this.customers = data;
    }, error => { this._util.serviceError(error); });
  }

  service_GetCustomerAccessControls(emailid, projid) {
    this._appservice.GetCustomerAccessControls(emailid, projid).subscribe(data => {
      this.accessControls = data;
      this.dataSource = new MatTableDataSource(this.accessControls);
    }, error => { this._util.serviceError(error); });
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
      this.service_GetCustomers(localStorage.getItem('empid'));
    }, error => { this._util.serviceError(error); });
  }
  
}
