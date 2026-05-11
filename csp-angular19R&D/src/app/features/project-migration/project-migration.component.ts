/**
 * ProjectMigrationComponent - Project data migration tool
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - Select old project (source) and new project (destination)
 * - Display project details side-by-side
 * - Migrate project data with confirmation
 * - Success message display
 * - Filter projects by status and date
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';

// Services and Models
import { LayoutService } from '../layout/layout.service';
import { MigrateProjectsModel } from '../../models/projects-model';
import { AppsService } from '../../core/services/apps.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { MyUtility } from '../../shared/my-utility';

@Component({
  selector: 'app-project-migration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatDividerModule
  ],
  templateUrl: './project-migration.component.html',
  styleUrl: './project-migration.component.scss'
})
export class ProjectMigrationComponent implements OnInit {
  // Dependency Injection
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  public _layoutService = inject(LayoutService);
  private _appservice = inject(AppsService);
  public _util = inject(MyUtility);
  private snackBar = inject(MatSnackBar);

  // Component Properties
  CUST_ID: string = '';
  input_oldprojectid: string = '';
  input_newprojectid: string = '';
  projNames: MigrateProjectsModel[] = [];
  oldProjNames: MigrateProjectsModel[] = [];
  newProjNames: MigrateProjectsModel[] = [];
  tempProjNames: MigrateProjectsModel[] = [];
  
  newProjDetails: MigrateProjectsModel = new MigrateProjectsModel();
  oldProjDetails: MigrateProjectsModel = new MigrateProjectsModel();
  
  selectedOldProject: any;
  selectedNewProject: any;
  allproj: boolean = true;
  
  successMessage: string = '';
  statusMessage: string = '';
  errorStatus: number = 0;
  showMessage: boolean = false;

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      this.CUST_ID = params['custid'];
      this._layoutService.selectedCust = this.CUST_ID;
    });
    
    this.getOldProjects();
    this.getNewProjects();
  }

  /**
   * Get list of old projects (including closed projects)
   */
  getOldProjects() {
    this._appservice.GetCustomerProjectsForMigration(this.CUST_ID, true).subscribe(
      (data: any) => {
        this.oldProjNames = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
    this.showMessage = false;
  }

  /**
   * Get list of new projects (active projects only)
   */
  getNewProjects() {
    this._appservice.GetCustomerProjectsForMigration(this.CUST_ID, false).subscribe(
      (data: any) => {
        this.newProjNames = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
    this.showMessage = false;
  }

  /**
   * Get project details by project ID
   * @param ptype Project type ('new' or 'old')
   * @param projectId Project ID
   */
  getProjectDetails(ptype: string, projectId: string): MigrateProjectsModel | undefined {
    if (ptype === 'new') {
      this.tempProjNames = this.newProjNames.filter((projName) => projName.proJ_ID === projectId);
    } else {
      this.tempProjNames = this.oldProjNames.filter((projName) => projName.proJ_ID === projectId);
    }

    if (this.tempProjNames.length > 0) {
      return this.tempProjNames[0];
    }
    return undefined;
  }

  /**
   * Get filtered projects by type and status
   * @param ptype Project type ('new' or 'old')
   * @param pstatus Project status to exclude
   */
  getProjects(ptype: string, pstatus: string): MigrateProjectsModel[] {
    const today = new Date();
    
    if (ptype === 'new') {
      return this.projNames.filter((t) => 
        t.Proj_Status !== pstatus && 
        formatDate(t.enD_DATE, 'dd-MMM-yyyy', 'en-US') > formatDate(today, 'dd-MMM-yyyy', 'en-US')
      );
    } else {
      return this.projNames.filter((t) => t.Proj_Status !== pstatus);
    }
  }

  /**
   * Handle project selection change
   * @param ptype Project type ('new' or 'old')
   */
  onProjectChange(ptype: string) {
    if (ptype === 'new') {
      const details = this.getProjectDetails(ptype, this.input_newprojectid);
      if (details) {
        this.newProjDetails = details;
      }
    } else {
      const details = this.getProjectDetails(ptype, this.input_oldprojectid);
      if (details) {
        this.oldProjDetails = details;
      }
    }

    this.successMessage = '';
    this.showMessage = false;
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'warn' | 'error', duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`]
    });
  }

  /**
   * Migrate project data from old project to new project
   */
  MigrateProjectData() {
    if (this.input_newprojectid === undefined || this.input_newprojectid === '') {
      this.showToast('Please select a new project.', 'warn', 3000);
      return;
    }

    if (this.input_oldprojectid === undefined || this.input_oldprojectid === '') {
      this.showToast('Please select an old project.', 'warn', 3000);
      return;
    }

    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Confirm Migration',
        message: `Are you sure you want to migrate data from "${this.oldProjDetails.proJ_NM}" to "${this.newProjDetails.proJ_NM}"?`
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._appservice.MigrateProjectData(this.input_oldprojectid, this.input_newprojectid).subscribe(
          (data: any) => {
            this.statusMessage = data;
            this.errorStatus = 1;
            this.getOldProjects();
            this.getNewProjects();
            this.showMessage = true;
            this.showToast('Saved successfully', 'success', 3000);
          },
          (error: any) => {
            this._util.serviceError(error);
            this.successMessage = '';
            this.errorStatus = 0;
            this.showMessage = true;
            this.showToast('Something went wrong', 'error', 4000);
          }
        );
      }
    });
  }
}
