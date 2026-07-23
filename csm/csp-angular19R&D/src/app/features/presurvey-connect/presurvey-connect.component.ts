/**
 * PresurveyConnectComponent - PCSAT Presurvey Connect Dialog
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - Dialog component for managing presurvey connect data
 * - Status management (To Be Planned, Planned, Completed)
 * - Date picker for planned and actual dates
 * - Remarks text area
 * - Form validation
 * - Loading indicator
 * - History display (updated by and date)
 */

import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideNativeDateAdapter } from '@angular/material/core';

// Services and Models
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { SharedService } from '../../shared/shared.service';
import { CssPresurveyConnectModel } from '../../models/css-project-selection-list-model';

@Component({
  selector: 'app-presurvey-connect',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './presurvey-connect.component.html',
  styleUrl: './presurvey-connect.component.scss'
})
export class PresurveyConnectComponent implements OnInit {
  // Dependency Injection
  private _appservice = inject(AppsService);
  private _shared = inject(SharedService);
  public _util = inject(MyUtility);
  public _access = inject(AccessControl);
  public dialog = inject(MatDialog);
  public dialogRef = inject(MatDialogRef<PresurveyConnectComponent>);
  
  // Component Properties
  overallPreconnectData: any;
  presurveyData: CssPresurveyConnectModel[] = [];
  isDisabledData: boolean = false;
  isDisabled: boolean = false;
  isEditable: boolean = false;
  batchCustomerId: number = 0;
  isLoading: boolean = false;
  presurveyformData: CssPresurveyConnectModel = new CssPresurveyConnectModel();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isDisabled = data.isDisabled;
    this.isEditable = data.isEditable;
    this.batchCustomerId = data.batchCustomerId;
  }

  ngOnInit() {
    this.getPreconnectDataList();
    this.presurveyformData.csS_BATCH_CUSTOMER_ID = this.batchCustomerId;
    this.presurveyformData.status = 'To Be Planned';
  }

  /**
   * Close the dialog
   */
  closePopup() {
    this.dialogRef.close();
  }

  /**
   * Submit form
   * @param isValid Form validation status
   */
  SubmitForm(isValid: boolean | null) {
    if (isValid) {
      this.savePreconnectData();
    }
  }

  /**
   * Get preconnect data list
   */
  getPreconnectDataList() {
    this.isLoading = true;
    this._appservice.getOverallPreconnectData(this.batchCustomerId).subscribe(
      (data: any) => {
        this.overallPreconnectData = data;
        this.isLoading = false;
        if (this.overallPreconnectData) {
          if (!this.isEditable) {
            this.isDisabledData = this.isDisabled;
          }
          this.presurveyformData = this.overallPreconnectData;
          if (!this.presurveyformData.status) {
            this.presurveyformData.status = 'To Be Planned';
          }
        }
        this.setDisabledState();
      },
      (error: any) => {
        this._util.serviceError(error);
        this.isLoading = false;
      }
    );
  }

  /**
   * Save preconnect data
   */
  savePreconnectData() {
    this.isLoading = true;
    const surveyData: CssPresurveyConnectModel = {
      csS_BATCH_CUSTOMER_ID: this.data.batchCustomerId,
      actuaL_DATE: (this.presurveyformData.actuaL_DATE && this.presurveyformData.actuaL_DATE !== undefined)
        ? this._util.setLocaleDate(this.presurveyformData.actuaL_DATE)
        : null,
      planneD_DATE: (this.presurveyformData.planneD_DATE && this.presurveyformData.planneD_DATE !== undefined)
        ? this._util.setLocaleDate(this.presurveyformData.planneD_DATE)
        : null,
      status: this.presurveyformData.status,
      remarks: this.presurveyformData.remarks || '',
      updateD_BY_NAME: ''
    };

    this._appservice.savePreconnectSurveyData(surveyData).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.showWarningPopup('Data saved successfully.');
        this.dialogRef.close(true);
      },
      (error: any) => {
        this.showWarningPopup('Error saving data: ' + error);
        this.isLoading = false;
      }
    );
  }

  /**
   * Show warning popup
   * @param message Message to display
   */
  showWarningPopup(message: string) {
    // TODO: Replace with proper alert dialog when RatingCriteriaRemarksComponent is available
    alert(message);
  }

  /**
   * Set disabled state based on status and editable flag
   */
  setDisabledState() {
    if (!this.isEditable) {
      this.isDisabledData = true;
      return;
    }

    if (this.isEditable) {
      if (this.presurveyformData.status === 'Completed' && this.presurveyformData.actuaL_DATE) {
        this.isDisabledData = true;
      } else {
        this.isDisabledData = false;
      }
    }
  }
}
