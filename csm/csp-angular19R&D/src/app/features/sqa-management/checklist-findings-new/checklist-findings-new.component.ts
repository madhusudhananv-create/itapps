import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';

import { CheckListExecutionModel } from '../../../shared/models/checklist-execution.model';
import { ObservationModel, AuditSampleModel, FindingsForQuestion } from '../../../shared/models/audit-checklist-based.model';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

@Component({
  selector: 'app-checklist-findings-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './checklist-findings-new.component.html',
  styleUrls: ['./checklist-findings-new.component.scss']
})
export class ChecklistFindingsNewComponent implements OnInit {
  private _appService = inject(AppsService);
  private _util = inject(MyUtility);
  private _http = inject(HttpClient);

  checkListdata: CheckListExecutionModel = new CheckListExecutionModel();
  chosenFindingType: string = '';
  empList: any[] = [];
  findinG_DESCRIPTION: string[] = [];
  findinG_TYPE: any[] = [];
  findingsArray: FindingsForQuestion[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ChecklistFindingsNewComponent>
  ) {
    this.checkListdata = data.fdata;
    this.findinG_TYPE = data.findingsTypes;
    this.getEmployeeListFromproject();
  }

  ngOnInit() {
    // Initialization logic if needed
  }

  getEmployeeListFromproject() {
    this._appService.getAuditeeDetails(this.checkListdata.customeR_ID, this.checkListdata.projecT_ID).subscribe({
      next: (data: any) => {
        this.empList = data;
      },
      error: (error: any) => { 
        this._util.serviceError(error); 
      }
    });
  }

  SaveRows_onClick() {
    if (this.checkListdata.statuS_CATEGORY != 'NMET') {
      this._util.showSuccess('Data Saved');
      this.CancelOnClick();
      return;
    }

    let flag = false;

    for (let i = 0; i < this.checkListdata.findings.length; i++) {
      if (this.checkListdata.findings[i].findinG_CATEGORY == 'MANDATORY') {
        if (this.checkListdata.findings[i].findinG_DESCRIPTION != undefined && 
            this.checkListdata.findings[i].findinG_DESCRIPTION.trim().length > 0) {
          flag = true;
          break;
        }
      }
    }

    if (!flag) {
      this._util.showError("Please enter at least one finding for mandatory type");
      return;
    }
    this._util.showSuccess('Data Saved');
    this.CancelOnClick();
  }

  FillNotCompletedData(sample: AuditSampleModel) {
    if (sample.totaL_SAMPLES_AUDITED != undefined && sample.sampleS_COMPLIED != undefined) {
      if (sample.totaL_SAMPLES_AUDITED > sample.sampleS_COMPLIED) {
        sample.sampleS_NOTCOMPLIED = sample.totaL_SAMPLES_AUDITED - sample.sampleS_COMPLIED;
        sample.percentage = Math.floor((sample.sampleS_COMPLIED / sample.totaL_SAMPLES_AUDITED) * 100);
      } else {
        this._util.showError("Tickets passed should be less than/equal to total tickets");
      }
    }
  }

  CancelOnClick() {
    this.dialogRef.close();
  }

  AddNewRow(checkListdata: CheckListExecutionModel) {
    if (checkListdata.checklisT_SAMPLE_AUDITED.length == 0) {
      let m = new AuditSampleModel();
      this.checkListdata.checklisT_SAMPLE_AUDITED.push(m);
    } else {
      this.checkSampleValidation(checkListdata);
    }
  }

  checkSampleValidation(checkListdata: CheckListExecutionModel) {
    let count = (checkListdata.checklisT_SAMPLE_AUDITED.length - 1);
    if (checkListdata.checklisT_SAMPLE_AUDITED[count].emP_ID != undefined || 
        checkListdata.checklisT_SAMPLE_AUDITED[count].totaL_SAMPLES_AUDITED != undefined || 
        checkListdata.checklisT_SAMPLE_AUDITED[count].sampleS_COMPLIED != undefined || 
        checkListdata.checklisT_SAMPLE_AUDITED[count].percentage != undefined) {
      let m = new AuditSampleModel();
      this.checkListdata.checklisT_SAMPLE_AUDITED.push(m);
    } else {
      this._util.showError("Fill Sample details");
    }
  }

  checkSample(checkListdata: CheckListExecutionModel) {
    let count = (checkListdata.checklisT_SAMPLE_AUDITED.length - 1);
    if (checkListdata.checklisT_SAMPLE_AUDITED[count].emP_ID != undefined || 
        checkListdata.checklisT_SAMPLE_AUDITED[count].totaL_SAMPLES_AUDITED != undefined || 
        checkListdata.checklisT_SAMPLE_AUDITED[count].sampleS_COMPLIED != undefined || 
        checkListdata.checklisT_SAMPLE_AUDITED[count].percentage != undefined) {
      return true;
    } else {
      return false;
    }
  }

  deleteSample(sample: AuditSampleModel) {
    let index = this.checkListdata.checklisT_SAMPLE_AUDITED.indexOf(sample);
    this.checkListdata.checklisT_SAMPLE_AUDITED.splice(index, 1);
  }
}
