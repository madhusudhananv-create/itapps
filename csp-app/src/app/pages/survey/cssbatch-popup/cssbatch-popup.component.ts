import { Component, OnInit, NgModule, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { myUtility } from '../../../Shared/myUtility';


@Component({
  selector: 'app-cssbatch-popup',
  templateUrl: './cssbatch-popup.component.html',
  styleUrls: ['./cssbatch-popup.component.scss']
})

export class CssbatchPopupComponent implements OnInit {

  constructor(public _util: myUtility, public dialogRef: MatDialogRef<CssbatchPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  months: any[] = [];
  selectedMonth: string;

  ngOnInit() {
    if (this.data.quarter == false) {
      this.months = this._util.getMonthNames();
      this.selectedMonth = "Jan"
    }
    else {
      this.months = [{ title: "Q1" }, { title: "Q2" }, { title: "Q3" }, { title: "Q4" }];
      this.selectedMonth = "Q1"
    }

  }

  closePopup(): void {
    this.dialogRef.close();
  }

  SaveDetails() {

    if (this.data.quarter == false) {
      let d: String = (this._util.tableYear + "-" + this.selectedMonth + '-01');
      let result: any = {
        month: this._util.getMonthNum(this.selectedMonth) + 1,
        year: this._util.tableYear
      }
      this.dialogRef.close(result);
    }
    else {
      let quarterPart: string = this.selectedMonth.substring(1);
      let result: any = {
        year: this._util.tableYear,
        sequence: parseInt(quarterPart, 10)
      };
      this.dialogRef.close(result);
    }
  }
}
