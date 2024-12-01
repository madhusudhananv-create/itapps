import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CheckListExecutionModel } from '../../../../models/checklist-execution';
import { ObservationModel, AuditSampleModel } from '../../../../models/audit-checklist-based-model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { ObserveOnMessage } from 'rxjs/internal/operators/observeOn';

@Component({
  selector: 'app-checklist-findings-new',
  templateUrl: './checklist-findings-new.component.html',
  styleUrls: ['./checklist-findings-new.component.scss']
})
export class ChecklistFindingsNewComponent implements OnInit {
  checkListdata: CheckListExecutionModel = new CheckListExecutionModel();
  chosenFindingType: string;
  empList: any;
  findinG_DESCRIPTION: string[] = [];
  findinG_TYPE: any[] = [];
  findingsArray: FindingsForQuestion[] = [];

  constructor(private _appService: AppsService, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ChecklistFindingsNewComponent>, private _util: myUtility, private _http: HttpClient) {
    this.checkListdata = data.fdata;
    this.findinG_TYPE = data.findingsTypes;
    this.getEmployeeListFromproject();
  }

  ngOnInit() {
    
  }

  getEmployeeListFromproject() {
    this._appService.getAuditeeDetails(this.checkListdata.customeR_ID, this.checkListdata.projecT_ID).subscribe(
      data => {
        this.empList = data
      }
      ,
      error => { this._util.serviceError(error); }
    )
  }

  SaveRows_onClick() {
    if (this.checkListdata.statuS_CATEGORY != 'NMET') {
      alert('Data Saved');
      this.CancelOnClick();
      return;
    }

    let flag = false;

    for (let i = 0; i < this.checkListdata.findings.length; i++) {
      if (this.checkListdata.findings[i].findinG_CATEGORY == 'MANDATORY') {
        if (this.checkListdata.findings[i].findinG_DESCRIPTION != undefined && this.checkListdata.findings[i].findinG_DESCRIPTION.trim().length > 0) {
          flag = true;
          break;
        }
      }
    }

    if (!flag) {
      alert("Please enter at least one finding for mandatory type");
      return;
    }
    alert('Data Saved');
    this.CancelOnClick();
  }

  FillNotCompletedData(sample: AuditSampleModel) {
    if (sample.totaL_SAMPLES_AUDITED != undefined && sample.sampleS_COMPLIED != undefined) {
      if (sample.totaL_SAMPLES_AUDITED > sample.sampleS_COMPLIED) {
        sample.sampleS_NOTCOMPLIED = sample.totaL_SAMPLES_AUDITED - sample.sampleS_COMPLIED
        sample.percentage = Math.floor((sample.sampleS_COMPLIED / sample.totaL_SAMPLES_AUDITED) * 100);
      }
      else
        alert("Tickets passed should be less than/equal to total tickets");
    }
  }

  CancelOnClick() {
    this.dialogRef.close(ChecklistFindingsNewComponent);
  }

  AddNewRow(checkListdata: CheckListExecutionModel) {
    if (checkListdata.checklisT_SAMPLE_AUDITED.length == 0) {
      let m = new AuditSampleModel();
      this.checkListdata.checklisT_SAMPLE_AUDITED.push(m)
    }
    else {
      this.checkSampleValidation(checkListdata)
    }
  }

  checkSampleValidation(checkListdata) {
    let count = (checkListdata.checklisT_SAMPLE_AUDITED.length - 1)
    if (checkListdata.checklisT_SAMPLE_AUDITED[count].emP_ID != undefined || checkListdata.checklisT_SAMPLE_AUDITED[count].totaL_SAMPLES_AUDITED != undefined || checkListdata.checklisT_SAMPLE_AUDITED[count].sampleS_COMPLIED != undefined || checkListdata.checklisT_SAMPLE_AUDITED[count].percentage != undefined) {
      let m = new AuditSampleModel();
      this.checkListdata.checklisT_SAMPLE_AUDITED.push(m)
    }
    else
      alert("Fill Sample details")
  }
  checkSample(checkListdata) {
    let count = (checkListdata.checklisT_SAMPLE_AUDITED.length - 1)
    if (checkListdata.checklisT_SAMPLE_AUDITED[count].emP_ID != undefined || checkListdata.checklisT_SAMPLE_AUDITED[count].totaL_SAMPLES_AUDITED != undefined || checkListdata.checklisT_SAMPLE_AUDITED[count].sampleS_COMPLIED != undefined || checkListdata.checklisT_SAMPLE_AUDITED[count].percentage != undefined) {
      return true
    }
    else
      return false;
  }
  deleteSample(sample: AuditSampleModel) {
    let index = this.checkListdata.checklisT_SAMPLE_AUDITED.indexOf(sample);
    this.checkListdata.checklisT_SAMPLE_AUDITED.splice(index, 1);
  }

}

export class FindingsForQuestion {
  findinG_TYPE: string[];
  findinG_DESCRIPTION: string[];
}
