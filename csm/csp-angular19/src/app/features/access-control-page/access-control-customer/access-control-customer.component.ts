import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { AccessControlRowModel, AppControlFeaturesModel, AppControlsModel } from '../../../models/access-control.model';
import { CustomerProjectsModel } from '../../../models/customer-projects-model';
import { ProjectsModel } from '../../../models/projects-model';

/**
 * Access Control - Customer Level tab
 * Migrated from LEGACY-SOURCE/src/app/controls/access-control/access-control-customer/access-control-customer.component.ts
 * Assign resource-level (view/create/edit/delete) permissions per customer/project.
 */
@Component({
  selector: 'app-access-control-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './access-control-customer.component.html',
  styleUrls: ['./access-control-customer.component.scss']
})
export class AccessControlCustomerComponent implements OnInit {
  customers: CustomerProjectsModel[] = [];
  selectedCustomer: CustomerProjectsModel | null = null;
  projects: ProjectsModel[] = [];
  selectedProject: ProjectsModel | null = null;

  accessControls: AccessControlRowModel[] = [];
  appControlFeatures: AppControlFeaturesModel[] = [];
  appControls: AppControlsModel[] = [];

  constructor(public _util: MyUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
  }

  LoadData() {
    this.service_GetAppControlFeatures();
    this.service_GetAppControls();
    this.service_GetCustomers(localStorage.getItem('empid') || '');
  }

  ddCustomer_Onchange() {
    this.selectedProject = null;
    this.accessControls = [];
    if (this.selectedCustomer) {
      this.service_GetClientProjects(this.selectedCustomer.id);
    }
  }

  ddProject_Onchange() {
    if (this.selectedCustomer && this.selectedProject) {
      this.service_GetCustomerAccessControls(this.selectedCustomer.emailid, this.selectedProject.proJ_ID);
    }
  }

  GetResourceName(resourceId: number): string {
    const match = this.appControls.find(t => t.resourcE_ID === resourceId);
    return match ? `${match.resourcE_NAME}(${match.resourcE_ID})` : '';
  }

  IsAllowed(row: AccessControlRowModel, feature: string): boolean {
    const recs = this.appControlFeatures.filter(t => t.resourcE_ID === row.resourcE_ID && t.feature === feature);
    return recs.length > 0;
  }

  save() {
    this._appservice.updateAccessControls(this.accessControls).subscribe({
      next: () => {
        this._util.showSuccessPopup('Updated Successfully');
        this.ddProject_Onchange();
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  delete() {
    this._appservice.deleteAccessControls(this.accessControls).subscribe({
      next: () => {
        this._util.showSuccessPopup('Restored Successfully');
        this.ddProject_Onchange();
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetClientProjects(clientId: number) {
    this._appservice.getClientProjects(clientId.toString()).subscribe({
      next: (data) => { this.projects = data; },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetCustomers(empid: string) {
    this._appservice.getCustomerInfo(empid).subscribe({
      next: (data) => { this.customers = data; },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetCustomerAccessControls(emailid: string, projid: string) {
    this._appservice.getCustomerAccessControls(emailid, projid).subscribe({
      next: (data) => { this.accessControls = data; },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetAppControlFeatures() {
    this._appservice.getAppControlFeatures().subscribe({
      next: (data) => { this.appControlFeatures = data; },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetAppControls() {
    this._appservice.getAppControls().subscribe({
      next: (data) => { this.appControls = data; },
      error: (error) => { this._util.serviceError(error); }
    });
  }
}
