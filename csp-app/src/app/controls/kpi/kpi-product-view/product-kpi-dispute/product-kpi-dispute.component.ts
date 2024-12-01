import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { KPIDetailsForProduct } from '../../../../models/kpi-details-extended-model';

@Component({
  selector: 'app-product-kpi-dispute',
  templateUrl: './product-kpi-dispute.component.html',
  styleUrls: ['./product-kpi-dispute.component.scss']
})
export class ProductKpiDisputeComponent implements OnInit {
  dialogTitle: string;
  kpiDetails = [];
  KpiPeriod: any;
  kpiAction: any;
  reason : string;
  constructor(private dialog: MatDialogRef<ProductKpiDisputeComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private _appservice: AppsService, public _util: myUtility) { }

  ngOnInit() {
    //console.log(this.data);
    if (this.data != null) {
      this.dialogTitle = this.data.title;
      this.kpiDetails = this.data.editedRow;
      this.KpiPeriod = this.data.date;
      this.kpiAction = this.data.action;
    }
    //console.log("kpiDetails",this.kpiDetails);
  }
  onClose() {
    this.dialog.close();
  }
  SaveDetails() {
    debugger;
    // if(this.kpiDetails != undefined || this.kpiDetails.length == 0)
    // {
    //      alert("Please select SLA.");
    //      return false;
    // }
    switch(this.kpiAction)
    {
       case 3: 
           if(this.kpiDetails != undefined)
           {
                 for(let i = 0 ; i < this.kpiDetails.length;i++)
                 {
                  this.kpiDetails[i].disputeOverallReason.overalL_DISPUTE_RAISED_REASON = this.reason;
                 }
           }
           break;
           case 4: 
           if(this.kpiDetails != undefined)
           {
                 for(let i = 0 ; i < this.kpiDetails.length;i++)
                 {
                  this.kpiDetails[i].disputeOverallReason.overalL_DISPUTE_REJECT_REASON = this.reason;
                 }
           }
           break;

    }
    
    // if (this.kpiAction)

    console.log("SaveDetails",this.kpiDetails); 
    // this._appservice.updateDisputeForProductKPI(this.kpiDetails, this.KpiPeriod, this.kpiAction).subscribe(data => {
      
    //   if(this.kpiAction == 3)
    //      alert("Dispute raised successfully.");
    //   else if(this.kpiAction == 5)
    //      alert("Dispute rejected successfully.");
      
 
    //   //this.freez = false;
    //   //this.LoadData();
    //   //this.isLoading = false;
    //   // this.selection.clear();
    // }, (err) => { this._util.serviceError(err) })
  }

  // bindreason($event)
  // {
  //   this.kpiDetails.disputeOverallReason.overalL_DISPUTE_RAISED_REASON = $event;
  // }

  // dataChanged(event)
  // {
  //   if(this.kpiAction == 3)
  //      this.kpiDetails.disputeOverallReason.overalL_DISPUTE_RAISED_REASON = event;
  //   else if(this.kpiAction == 5)
  //      this.kpiDetails.disputeOverallReason.overalL_DISPUTE_REJECT_REASON = event;
  // }

}
