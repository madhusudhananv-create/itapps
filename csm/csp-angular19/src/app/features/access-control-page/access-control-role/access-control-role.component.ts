import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { AccessControlRowModel, AppControlFeaturesModel, AppControlsModel } from '../../../models/access-control.model';
import { ProjectRolesModel } from '../../../models/project-roles-model';

/**
 * Access Control - Role Level tab
 * Migrated from LEGACY-SOURCE/src/app/controls/access-control/access-control-role/access-control-role.component.ts
 * Assign resource-level (view/create/edit/delete) permissions per application role.
 */
@Component({
  selector: 'app-access-control-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './access-control-role.component.html',
  styleUrls: ['./access-control-role.component.scss']
})
export class AccessControlRoleComponent implements OnInit {
  selectedRoleId: number | null = null;
  accessControls: AccessControlRowModel[] = [];
  projectRoles: ProjectRolesModel[] = [];
  appControlFeatures: AppControlFeaturesModel[] = [];
  appControls: AppControlsModel[] = [];

  constructor(public _util: MyUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
  }

  LoadData() {
    this.service_GetAppControlFeatures();
    this.service_GetAppControls();
    this.service_GetProjectRoles();
  }

  ddRoles_Onchange() {
    if (this.selectedRoleId === null || this.selectedRoleId === undefined) {
      this._util.showWarningPopup('Please select a role');
      return;
    }
    this.service_GetAccessControlsByRoleId(this.selectedRoleId);
  }

  AddRow_onClick() {
    if (this.selectedRoleId === null || this.selectedRoleId === undefined) {
      this._util.showWarningPopup('Please select a role first');
      return;
    }
    const empid = localStorage.getItem('empid') || '';
    const newRow: AccessControlRowModel = {
      id: 0,
      resourcE_ID: 0,
      accesS_LEVEL: 1,
      rolE_ID: this.selectedRoleId,
      cusT_ID: '',
      proJ_ID: '',
      emP_ID: '',
      vieW_ACCESS: false,
      creatE_ACCESS: false,
      ediT_ACCESS: false,
      deletE_ACCESS: false,
      comments: '',
      createD_BY: empid,
      createD_DATE: new Date(),
      updateD_BY: empid,
      updateD_DATE: new Date(),
      isactive: true
    };
    this.accessControls = [...this.accessControls, newRow];
  }

  GetResourceName(resourceId: number): string {
    const match = this.appControls.find(t => t.resourcE_ID === resourceId);
    return match ? `${match.resourcE_NAME}(${match.resourcE_ID})` : '';
  }

  IsAllowed(row: AccessControlRowModel, feature: string): boolean {
    const recs = this.appControlFeatures.filter(t => t.resourcE_ID === row.resourcE_ID && t.feature === feature);
    return recs.length > 0;
  }

  SaveRow_onClick(row: AccessControlRowModel) {
    if (!row.resourcE_ID) {
      this._util.showWarningPopup('Please select a resource');
      return;
    }
    // Use the bulk endpoint (not the single-row one) since it also handles inserting
    // brand-new rows (id === 0) - the single-row UpdateAccessControl endpoint only updates.
    this._appservice.updateAccessControls([row]).subscribe({
      next: () => {
        this._util.showSuccessPopup('Updated Successfully');
        if (this.selectedRoleId !== null && this.selectedRoleId !== undefined) {
          this.service_GetAccessControlsByRoleId(this.selectedRoleId);
        }
      },
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

  service_GetProjectRoles() {
    this._appservice.getProjectRoles().subscribe({
      next: (data) => { this.projectRoles = data; },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetAccessControlsByRoleId(roleId: number) {
    this._appservice.getAccessControlsByRoleId(roleId).subscribe({
      next: (data) => { this.accessControls = data; },
      error: (error) => { this._util.serviceError(error); }
    });
  }
}
