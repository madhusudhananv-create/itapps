import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef, Inject } from '@angular/core';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { MatDialog, MatDialogConfig, MatTableDataSource, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Http, Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { AccessControl } from '../../Shared/accessControl';
import { SharedService } from '../../Shared/shared.service';
import { CssPresurveyConnectModel } from '../../models/css-project-selection-list-model';
import { RatingCriteriaRemarksComponent } from '../rating-criteria-remarks/rating-criteria-remarks.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'app-presurvey-connect',
  templateUrl: './presurvey-connect.component.html',
  styleUrls: ['./presurvey-connect.component.scss']
})
export class PresurveyConnectComponent implements OnInit {
  overallPreconnectData: any;
  presurveyData: CssPresurveyConnectModel[] = [];
  isDisabledData: boolean = false;
  isDisabled: boolean = false;
  isEditable: boolean = false;
  batchCustomerId: number;
  isLoading: boolean = false;
  presurveyformData: CssPresurveyConnectModel = new CssPresurveyConnectModel();
  constructor(private route: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _http: Http, public _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, public _access: AccessControl, public dialog: MatDialog,
    public dialogRef: MatDialogRef<PresurveyConnectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.isDisabled = data.isDisabled;
    this.isEditable = data.isEditable;
    this.batchCustomerId = data.batchCustomerId;

  }

  ngOnInit() {
    this.getPreconnectDataList();
    this.presurveyformData.csS_BATCH_CUSTOMER_ID = this.batchCustomerId;
    this.presurveyformData.status = 'To Be Planned';
  }

  closePopup() {
    this.dialogRef.close();
  }

  SubmitForm(isValid: boolean) {
    if (isValid) {
      this.savePreconnectData();
    }
  }



  /* getPreconnectDataList() {
    this.isLoading = true;
    this._appservice.getOverallPreconnectData(this.batchCustomerId).subscribe(data => {
      this.overallPreconnectData = data;
      this.isLoading = false;
      if (this.overallPreconnectData && this.overallPreconnectData.length > 0) {
        if (!this.isEditable) {
          this.isDisabledData = this.isDisabled;
        }
        const foundRecord = this.overallPreconnectData.find(x => x.csS_BATCH_CUSTOMER_ID == this.batchCustomerId);
        if (foundRecord) {
          this.presurveyformData = foundRecord;
          if (!this.presurveyformData.status) {
            this.presurveyformData.status = 'To Be Planned';
          }
          this.setDisabledState();
        }
      }
    }, error => { this._util.serviceError(error); this.isLoading = false; });
  } */

  getPreconnectDataList() {
    this.isLoading = true;
    this._appservice.getOverallPreconnectData(this.batchCustomerId).subscribe(data => {
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

    }, error => { 
      this._util.serviceError(error); 
      this.isLoading = false; 
    });
  }
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
      updateD_BY_NAME :''
    };

    this._appservice.savePreconnectSurveyData(surveyData).subscribe(
      (data) => {
        this.isLoading = false;
        this.showWarningPopup('Data saved successfully.');
        this.dialogRef.close(true);
      },
      (error) => {
        this.showWarningPopup('Error saving data' + error);
        this.isLoading = false;
      }
    );
  }

  showWarningPopup(message: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
    }
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    return this.dialog.open(RatingCriteriaRemarksComponent, dialogConfig);
  }

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