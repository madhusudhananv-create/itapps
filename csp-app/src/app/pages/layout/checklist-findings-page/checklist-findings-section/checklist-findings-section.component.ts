
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
  selector: 'app-checklist-findings-section',
  templateUrl: './checklist-findings-section.component.html',
  styleUrls: ['./checklist-findings-section.component.scss']
})
export class ChecklistFindingsSectionComponent implements OnInit {

  checkListdata: CheckListExecutionModel = new CheckListExecutionModel();
  chosenFindingType: string;
  empList: any;
  findinG_DESCRIPTION : string[] = [];
  findinG_TYPE : any[] = [];
  findingsArray : FindingsForQuestion[] = [];

  constructor(private _appService: AppsService, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ChecklistFindingsSectionComponent>, private _util: myUtility, private _http: HttpClient) { 
    this.checkListdata = data.fdata;
    this.findinG_TYPE = data.findingsTypes;
    console.log(this.findinG_TYPE);

    
    // if (this.checkListdata.status == "No")
    //   this.getFindingType()
    this.getEmployeeListFromproject();
  }

  

  ngOnInit() {
    console.log("checklist findings", this.checkListdata.findings);
    if(this.checkListdata.findings != undefined && this.checkListdata.findings.length > 0)
    {
      for(var i = 0; i < this.checkListdata.findings.length; i++)
      {
        this.findinG_DESCRIPTION[i] = this.checkListdata.findings[i].findinG_DESCRIPTION;
        this.findinG_TYPE[i] = this.checkListdata.findings[i].findinG_TYPE;
      }
    }
  }

  getEmployeeListFromproject() {
    this._appService.getAuditeeDetails(this.checkListdata.customeR_ID, this.checkListdata.projecT_ID).subscribe(
      data => {
        this.empList = data
        console.log("auditee details", this.empList);
      }
      ,
      error => { this._util.serviceError(error); }
    )
  }

  SaveRows_onClick()
  {
    let flag = false;
    if(this.checkListdata.statuS_CATEGORY == "NMET")
    {
      this.checkListdata.findings.forEach(x => {
        if(x.findinG_DESCRIPTION != undefined && x.findinG_DESCRIPTION.length > 0)
        {
          if(x.findinG_CATEGORY == "MANDATORY")
          {
            flag = true; 
          }
        }
      });
    }
    else if(this.checkListdata.statuS_CATEGORY == "MET")
    {
      flag = true;
    }

    if(!flag)
    {
      alert("Please enter at least one finding for mandatory type");
      return;
    }

    alert('Data Saved');
  }

  
  // getFindingType() {
  //   this.service_getFindingType(this.checkListdata);
  // }
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
    // if(this.checkSample(this.checkListdata) && this.checkListdata.checklisT_SAMPLE_AUDITED.length > 0)
    // this.dialogRef.close(ChecklistFindingsComponent);

    // else if(this.checkListdata.checklisT_SAMPLE_AUDITED.length == 0)
    console.log("findings array", this.checkListdata.findings);
    this.dialogRef.close(ChecklistFindingsSectionComponent);

    // else
    // alert("Fill Incomplete details")
  }
  // pushData(auditdata: CheckListExecutionModel, finding) {
  //   if (auditdata.status == "Yes")
  //     this.pushBestdata(auditdata, finding)
  //   else {
  //     if (auditdata.findings.length == 0 && (finding == "Major" || finding == "Minor")) {
  //       let b = new ObservationModel();
  //       b.findingS_TYPE = finding;
  //       auditdata.findings.push(b);
  //     }
  //     else if (auditdata.findings.length > 0 && (finding != "Major" && finding != "Minor")) {
  //       // let count;
  //       // count = auditdata.findings.findIndex(t=>t.findingS_TYPE == finding);
  //       if (auditdata.findings.length > 1) {
  //         auditdata.findings[auditdata.findings.length - 1].findingS_TYPE = finding;
  //         this.chosenFindingType = auditdata.findings[auditdata.findings.length - 1].findingS_TYPE;
  //       }
  //       else {
  //         let b = new ObservationModel();
  //         b.findingS_TYPE = finding;
  //         auditdata.findings.push(b);
  //       }
  //     }
  //     else {
  //       if (auditdata.findings[0].findingS_TYPE == "Best Practice" || auditdata.findings[0].findingS_TYPE == "OFI") {
  //         auditdata.findings = []
  //         let b = new ObservationModel();
  //         b.findingS_TYPE = finding;
  //         auditdata.findings.push(b);
  //       }
  //     }
  //     this.chosenFindingType = auditdata.findings[auditdata.findings.length - 1].findingS_TYPE;
  //   }
  // }
  // pushBestdata(auditdata: CheckListExecutionModel, finding) {
  //   if (auditdata.findings.length == 0) {
  //     let b = new ObservationModel();
  //     b.findingS_TYPE = finding;
  //     auditdata.findings.push(b);
  //   }
  //   else {
  //     let count;
  //     count = auditdata.findings.findIndex(t => t.findingS_TYPE == finding);
  //     if (count == -1) {
  //       auditdata.findings = []
  //       let b = new ObservationModel();
  //       b.findingS_TYPE = finding;
  //       auditdata.findings.push(b);
  //     }
  //     else
  //       auditdata.findings[count].findingS_TYPE = finding;
  //   }
  //   this.chosenFindingType = auditdata.findings[auditdata.findings.length - 1].findingS_TYPE;
  // }
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
  //services
  // service_getFindingType(weightagetitle: CheckListExecutionModel) {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem("empid") });
  //   let apiuri: string = environment.webapiuri + 'GetFindingTypeForWeight?WeightageID=' + weightagetitle.weightagE_ID + '&FindingType=' + weightagetitle.status;
  //   this._http.get(apiuri, { headers: header })
  //     .subscribe((data: string) => {
  //       weightagetitle.findings.findinG_TYPE = data;
  //       // this.pushData(weightagetitle, data)
  //     }, error => { this._util.serviceError(error); });
  // }
}

export class FindingsForQuestion{
  findinG_TYPE : string[];
  findinG_DESCRIPTION : string[];
}



