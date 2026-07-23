import { Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { ProcessModelModel, ProcessSqaServiceArea, ProcessSqaProcess } from '../../../core/models/process-sqa-model';
import { WarningPopupComponent } from '../../../shared/components/warning-popup/warning-popup.component';

// Import child components
import { SetupChecklistNewComponent } from '../setup-checklist-new/setup-checklist-new.component';
import { ProcessAreaComponent } from '../process-area/process-area.component';
import { ProcessServiceAreaMappingComponent } from '../process-service-area-mapping/process-service-area-mapping.component';
import { ProcessProcessModelMappingComponent } from '../process-process-model-mapping/process-process-model-mapping.component';
import { ProcessProcessModelViewComponent } from '../process-process-model-view/process-process-model-view.component';
import { ProcessChecklistMappingComponent } from '../process-checklist-mapping/process-checklist-mapping.component';
import { PspdComponent } from '../pspd/pspd.component';
import { MergeChecklistComponent } from '../merge-checklist/merge-checklist.component';

@Component({
  selector: 'app-checklist-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    SetupChecklistNewComponent,
    ProcessAreaComponent,
    ProcessServiceAreaMappingComponent,
    ProcessProcessModelMappingComponent,
    ProcessProcessModelViewComponent,
    ProcessChecklistMappingComponent,
    PspdComponent,
    MergeChecklistComponent
  ],
  templateUrl: './checklist-user.component.html',
  styleUrls: ['./checklist-user.component.scss']
})
export class ChecklistUserComponent implements OnInit, AfterViewInit {
  @ViewChild('processModelForm') processModelForm!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Output() onChecklistCreated = new EventEmitter();

  modelList: ProcessModelModel[] = [];
  dataSource = new MatTableDataSource<ProcessModelModel>([]);
  displayedColumns: string[] = ['sno', 'title', 'description', 'releaseVersion', 'releaseDate', 'actions'];
  processAreaList: ProcessSqaServiceArea[] = [];
  processProcessList: ProcessSqaProcess[] = [];
  gavsServiceArea: any[] = [];
  model = new ProcessModelModel();
  processArea = new ProcessSqaServiceArea();
  processProcess = new ProcessSqaProcess();
  refreshTrigger = 0;
  isLoading = false;

  specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
  numberPattern = /^[0-9\s]+$/;

  constructor(
    public _appsService: AppsService,
    public _utility: MyUtility,
    public _access: AccessControl,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.LoadData();
    this.getServiceAreaProvided();
  }

  ngAfterViewInit() {
    
    // Use setTimeout to ensure the view is fully initialized
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      } else {
        console.warn('Paginator not found in ngAfterViewInit');
      }
      
      if (this.sort) {
        this.dataSource.sort = this.sort;
      } else {
        console.warn('Sort not found in ngAfterViewInit');
      }
    });
  }

  LoadData() {
    this.isLoading = true;
    this._appsService.getProcessModel().subscribe((data: any) => {
      this.modelList = data || [];
      this.sortByRetirementDate();
      this.dataSource.data = this.modelList;
      
      // Re-attach paginator and sort after data load to ensure proper functioning
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      
      this.isLoading = false;
    }, error => { 
      console.error('Error loading process models:', error);
      this._utility.serviceError(error);
      this.modelList = [];
      this.dataSource.data = [];
      this.isLoading = false;
    });
  }

  getServiceAreaProvided() {
    this.isLoading = true;
    this._appsService.getServiceAreaList().subscribe((data: any) => {
      this.gavsServiceArea = data;
      this.isLoading = false;
    }, error => { 
      this._utility.serviceError(error);
      this.isLoading = false;
    });
  }

  sortByRetirementDate() {
    this.modelList.sort((a, b) => {
      if (!a.retiremenT_DATE && !b.retiremenT_DATE) {
        return 0;
      }
      if (!a.retiremenT_DATE) {
        return -1;
      }
      if (!b.retiremenT_DATE) {
        return 1;
      }
      return new Date(a.retiremenT_DATE).getTime() - new Date(b.retiremenT_DATE).getTime();
    });
  }

  SubmitModelForm() {
    if (!this.validateForm()) {
      return;
    }

    const isNewModel = this.model.id == 0;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: isNewModel 
        ? 'Are you sure you want to save this Process Model?' 
        : 'Are you sure you want to update this Process Model?',
      isConfirmation: true,
      confirmText: isNewModel ? 'Save' : 'Update',
      cancelText: 'Cancel',
      title: isNewModel ? 'Save Process Model' : 'Update Process Model',
      icon: 'save',
      actionType: isNewModel ? 'save' : 'update'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';

    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.saveOrUpdateModel(isNewModel);
      }
    });
  }

  private saveOrUpdateModel(isNewModel: boolean) {
    this.model.createD_BY = this._utility.GetUserName();
    this.model.updateD_BY = this._utility.GetUserName();
    this.model.createD_DATE = new Date();
    this.model.updateD_DATE = new Date();
    this.model.isactive = true;

    this.isLoading = true;
    if (isNewModel) {
      this._appsService.addProcessModel(this.model).subscribe({
        next: (response: any) => {
          this._utility.showSuccess('Process Model added successfully');
          this.ClearInputs();
          this.LoadData();
          this.isLoading = false;
        },
        error: (error: any) => {
          if (error.status === 401) {
            this._utility.showError('Session expired. Please login again.');
          } else {
            this._utility.showError('Error adding Process Model');
          }
          console.error(error);
          this.isLoading = false;
        }
      });
    } else {
      this._appsService.updateProcessModel(this.model).subscribe({
        next: (response: any) => {
          this._utility.showSuccess('Process Model updated successfully');
          this.ClearInputs();
          this.LoadData();
          this.isLoading = false;
        },
        error: (error: any) => {
          if (error.status === 401) {
            this._utility.showError('Session expired. Please login again.');
          } else {
            this._utility.showError('Error updating Process Model');
          }
          console.error(error);
          this.isLoading = false;
        }
      });
    }
  }

  validateForm(): boolean {
    // Validate Process Model Description (bound to model.title in the form)
    if (!this.model.title || this.model.title.trim() === '') {
      this._utility.showError('Process Model Description is required');
      return false;
    }

    if (!this.model.releasE_DATE) {
      this._utility.showError('Release Date is required');
      return false;
    }

    // Validate description - should not be all special characters
    if (this.specialCharPattern.test(this.model.title.trim())) {
      this._utility.showError('Process Model Description cannot contain only special characters');
      return false;
    }

    // Validate description - should not be all numbers
    if (this.numberPattern.test(this.model.title.trim())) {
      this._utility.showError('Process Model Description cannot contain only numbers');
      return false;
    }

    // Validate Industry Standard Reference if provided (bound to model.description in the form)
    if (this.model.description) {
      if (this.specialCharPattern.test(this.model.description.trim())) {
        this._utility.showError('Industry Standard Reference cannot contain only special characters');
        return false;
      }
      if (this.numberPattern.test(this.model.description.trim())) {
        this._utility.showError('Industry Standard Reference cannot contain only numbers');
        return false;
      }
    }

    // Validate Release Version Reference if provided
    if (this.model.releasE_VERSION_REFERENCE) {
      if (this.specialCharPattern.test(this.model.releasE_VERSION_REFERENCE.trim())) {
        this._utility.showError('Release Version Reference cannot contain only special characters');
        return false;
      }
      if (this.numberPattern.test(this.model.releasE_VERSION_REFERENCE.trim())) {
        this._utility.showError('Release Version Reference cannot contain only numbers');
        return false;
      }
    }

    return true;
  }

  EditRow_onClick(item: ProcessModelModel) {
    this.model = { ...item };
  }

  DeleteRow_onClick(item: ProcessModelModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Are you sure you want to delete this Process Model?',
      isConfirmation: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      title: 'Delete Process Model',
      icon: 'delete_forever',
      actionType: 'delete'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';

    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isLoading = true;
        this._appsService.deleteProcessModel(item).subscribe({
          next: (response: any) => {
            // Remove item from the list immediately for instant UI update
            const index = this.modelList.findIndex(m => m.id === item.id);
            if (index > -1) {
              this.modelList.splice(index, 1);
              this.dataSource.data = this.modelList;
            }
            // Show success toast message immediately after deleting the model
            this._utility.showSuccess('Process Model deleted successfully');
            this.isLoading = false;
            
            // Try to delete related process model mappings (don't block success if this fails)
            this._appsService.deleteProcessModelProcessMapping(item.id).subscribe({
              next: () => {
              },
              error: (error: any) => {
                // Log the error but don't show it to user since main delete succeeded
                console.warn('Error deleting mappings (non-critical):', error);
              }
            });
          },
          error: (error: any) => {
            console.error('Error deleting process model:', error);
            if (error.status === 401) {
              this._utility.showError('Session expired. Please login again.');
            } else {
              this._utility.showError('Error deleting Process Model');
            }
            this.isLoading = false;
          }
        });
      } else {
      }
    });
  }

  ClearInputs() {
    this.model = new ProcessModelModel();
    if (this.processModelForm) {
      this.processModelForm.resetForm();
    }
  }

  ClearInputsArea() {
    this.processArea = new ProcessSqaServiceArea();
  }

  ClearInputsProcess() {
    this.processProcess = new ProcessSqaProcess();
  }

  onTabChange(event: any) {
    // Handle tab change if needed
  }

  onChecklistCreatedEvent() {
    this.refreshTrigger++;
    this.onChecklistCreated.emit();
  }
}
