import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';

@Component({
  selector: 'app-risk-treatment-popup',
  templateUrl: './risk-treatment-popup.component.html',
  styleUrls: ['./risk-treatment-popup.component.scss']
})
export class RiskTreatmentPopupComponent implements OnInit {
  data: any=[];
  isLoading=true;

  constructor(private dialogRef: MatDialogRef<RiskTreatmentPopupComponent>, @Inject(MAT_DIALOG_DATA) public dialogData: any, public _appservice: AppsService, public _util: myUtility, public myutil: myUtility) { }

  ngOnInit() {
    this.getActionItems(this.dialogData.element.projecT_ID, this.dialogData.element.id);
  }
  closeDialog() {
    this.dialogRef.close();
  }
  getActionItems(projectId: string, riskId) {
    this._appservice.getActionItemsforRisk(projectId, riskId).subscribe(
      data => {
        this.data = data; this.isLoading=false;
        // this.RefreshTableforActionItems(this.result);
      },
      error => { this._util.serviceError(error); this.isLoading=false;})
  }
}
