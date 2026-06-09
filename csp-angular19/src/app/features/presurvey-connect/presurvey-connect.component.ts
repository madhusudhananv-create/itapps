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
import { WarningPopupComponent, WarningPopupData } from '../../shared/components/warning-popup/warning-popup.component';

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
   * Handle status change to reset dates when status is "To Be Planned"
   */
  onStatusChange() {
    if (this.presurveyformData.status === 'To Be Planned') {
      this.presurveyformData.planneD_DATE = null;
      this.presurveyformData.actuaL_DATE = null;
    }
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
          
          // Convert date strings to proper Date objects to avoid timezone issues
          if (this.presurveyformData.planneD_DATE) {
            this.presurveyformData.planneD_DATE = this.convertToLocalDate(this.presurveyformData.planneD_DATE);
          }
          if (this.presurveyformData.actuaL_DATE) {
            this.presurveyformData.actuaL_DATE = this.convertToLocalDate(this.presurveyformData.actuaL_DATE);
          }
          
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
   * Convert date string to local date object without timezone shift
   */
  convertToLocalDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    // If it's already a Date object, normalize it to midnight local time
    if (dateValue instanceof Date) {
      return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 0, 0, 0, 0);
    }
    
    // Parse the date string directly to avoid timezone issues
    // API returns format: "2026-06-11T00:00:00"
    const dateStr = dateValue.toString();
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
      const day = parseInt(match[3], 10);
      return new Date(year, month, day, 0, 0, 0, 0);
    }
    
    return new Date(dateValue);
  }

  /**
   * Convert date to string format for API without timezone conversion
   * Formats as: "YYYY-MM-DDTHH:mm:ss"
   */
  formatDate(dateValue: Date | null): string | null {
    if (!dateValue) return null;
    
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}T00:00:00`;
  }

  /**
   * Save preconnect data
   */
  savePreconnectData() {
    this.isLoading = true;
    const surveyData: CssPresurveyConnectModel = {
      csS_BATCH_CUSTOMER_ID: this.data.batchCustomerId,
      actuaL_DATE: this.formatDate(this.presurveyformData.actuaL_DATE) as any,
      planneD_DATE: this.formatDate(this.presurveyformData.planneD_DATE) as any,
      status: this.presurveyformData.status,
      remarks: this.presurveyformData.remarks || '',
      updateD_BY_NAME: ''
    };

    this._appservice.savePreconnectSurveyData(surveyData).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.showWarningPopup('Data saved successfully.', 'Success', 'check_circle');
        this.dialogRef.close(true);
      },
      (error: any) => {
        this.showWarningPopup('Error saving data: ' + error, 'Error', 'error');
        this.isLoading = false;
      }
    );
  }

  /**
   * Show warning popup
   * @param message Message to display
   * @param title Title of the dialog
   * @param icon Icon to display
   */
  showWarningPopup(message: string, title: string = 'Warning', icon: string = 'warning') {
    this.dialog.open(WarningPopupComponent, {
      width: '400px',
      data: {
        Message: message,
        title: title,
        icon: icon,
        isConfirmation: false
      } as WarningPopupData
    });
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
