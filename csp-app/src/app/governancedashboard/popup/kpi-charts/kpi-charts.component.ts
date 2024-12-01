import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { TreeHealthReportCustomer } from '../../../models/kpi-details-extended-model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-kpi-charts',
  templateUrl: './kpi-charts.component.html',
  styleUrls: ['./kpi-charts.component.scss']
})
export class KpiChartsComponent implements OnInit {
  // @Input("startDate") startDate: any;
  // @Input("endDate") endDate: any;
  // @Input("data") data: any;
  TreeHealthReport: TreeHealthReportCustomer[] = []
  constructor( @Inject(MAT_DIALOG_DATA) public data: any, private _util: myUtility, private _appService: AppsService, private dialogRef: MatDialogRef<KpiChartsComponent>, ) { }

  ngOnInit() {
    if (this.data.startDate != undefined && this.data.endDate != undefined)
      this.Service_GetHealthReportDetailedProject(this.data.custId ,this.data.projId,this.data.startDate, this.data.endDate);
  }
  CancelOnClick() {
    this.dialogRef.close();
  }
  Service_GetHealthReportDetailedProject(custId,projId,startdate: Date, enddate: Date) {
    this._appService.GetHealthReportDetailedProject(custId ,projId, startdate.toDateString(), enddate.toDateString()).subscribe(data => {
      //this._appService.GetHealthReportDetailed('1-jan-2018', '31-dec-2018').subscribe(data => {
      this.TreeHealthReport = data;
    }, error => { this._util.serviceError(error); });
  }

}
