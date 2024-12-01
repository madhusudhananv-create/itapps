import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { audit } from 'rxjs-compat/operator/audit';
import { AuditExecutionModel } from '../../../../models/audit-execution-model';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TestReportSummary } from '../../../../models/process-sqa-model';

@Component({
  selector: 'app-audit-report',
  templateUrl: './audit-report.component.html',
  styleUrls: ['./audit-report.component.scss']
})
export class AuditReportComponent implements OnInit {
  newDate: Date;
  testdata: TestReportSummary[];
  ProcessModelSummary: any[] = [];
  selectedProcessModel: number[] = [];
  selectedServiceArea: number[] = [];
  ControlandTestCount :any;
  auditExecutionReport:any;
  empName:string;
  ShowDetail : boolean = false;
  text : string = "View";
  constructor(private dialogRef: MatDialogRef<AuditReportComponent>,@Inject(MAT_DIALOG_DATA) public data: any,private _appService: AppsService, private _util: myUtility, private _http: HttpClient) { }
  auditData:AuditExecutionModel[];
  getData : any;
  ngOnInit() {
    if(this.data != null)
    this.getData = this.data;

    //this.GetEmpName(this.getData.auditoR_NAME);
    this.newDate = this.getStDate(this.getData.audiT_START_DATE);
    this.getProcessModelSummary(this.getData.projecT_ID, this.newDate, this.getData.audiT_TITLE, +this.getData.customeR_ID);
    this.getTestsReport(this.getData.customeR_ID,this.getData.projecT_ID, this.getData.audiT_TITLE );
    this.getControlandTestCount(this.getData.projecT_ID,this.newDate, this.getData.customeR_ID, this.getData.audiT_TITLE);
  }

  getStDate(stdate: Date) {
    stdate = new Date(stdate);
    let date: number = stdate.getDate();
    let month: number = stdate.getMonth();
    let year: number = stdate.getFullYear();

    let newDate: Date = new Date(year, month, date);

    return newDate;
  }

  // getNameById(id : number)
  // {
  //   this._appService.getEmpNameById(id).subscribe(
  //     data => { this}
  //   )
  // }

  getTestsReport(custid, projid, audittitle)
  {
    this._appService.getTestsReport(custid, projid, audittitle).subscribe(
      data => {
        this.testdata = data;
      }
      ,
      error => { this._util.serviceError(error); }
    )
  }

  getProcessModelSummary(projId , startDate, audittitle, custid)
  {
    this.ProcessModelSummary = undefined;
    this._appService.getProcessModelSummary(projId , startDate, audittitle, custid).subscribe(
      data => {
        this.ProcessModelSummary = data;
        console.log("processmodel summary", this.ProcessModelSummary);
      }
      ,
      error => { this._util.serviceError(error); }
    )
  }
  getControlandTestCount(projId , startDate, custid, title)
  {
    this._appService.getAuditControlandTestCountReport(projId ,startDate, custid, title).subscribe(
      data => {
        this.ControlandTestCount = data;
      }
      ,
      error => { this._util.serviceError(error); }
    )
  }
  getAuditExecutionreport(projId , startDate)
  {
    this._appService.getAuditExecutionReport(projId ,startDate).subscribe(
      data => {
        this.auditExecutionReport = data;
      }
      ,
      error => { this._util.serviceError(error); }
    )
  }

  GetEmpName(empId) {
      this._appService.getEmpNameById(empId).subscribe(
        data => {
          this.empName = data;
        },
        error => {
          { this._util.serviceError(error); }
        }
      )
  }
  getModelandServiceAreaDD(custId, projId) {
    this._appService.getProcessModelandServiceAreaDD(custId, projId).subscribe(
      data => {
        this.selectedProcessModel = data.projecT_MODEL;
        this.selectedServiceArea = data.projecT_SERVICE_AREA;
      }
      ,
      error => { this._util.serviceError(error); }
    )
  }
  CancelOnClick() {
    this.dialogRef.close();
  }

  ViewReport_OnClick()
  {
    this.ShowDetail != this.ShowDetail;
    if(this.ShowDetail)
     this.text = "Hide";
     else
     this.text ="View";
  }
}
