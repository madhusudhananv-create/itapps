import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MyUtility } from '../../../shared/my-utility';

@Component({
  selector: 'app-cssbatch-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './cssbatch-popup.component.html',
  styleUrls: ['./cssbatch-popup.component.scss']
})
export class CssbatchPopupComponent implements OnInit {
  months: any[] = [];
  selectedMonth: string = '';

  constructor(
    public _util: MyUtility,
    public dialogRef: MatDialogRef<CssbatchPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data.quarter == false) {
      this.months = this._util.getMonthNames();
      this.selectedMonth = 'Jan';
    } else {
      this.months = [{ title: 'Q1' }, { title: 'Q2' }, { title: 'Q3' }, { title: 'Q4' }];
      this.selectedMonth = 'Q1';
    }
  }

  closePopup(): void {
    this.dialogRef.close();
  }

  SaveDetails() {
    if (this.data.quarter == false) {
      const d: string = this._util.tableYear + '-' + this.selectedMonth + '-01';
      const result: any = {
        month: this._util.getMonthNum(this.selectedMonth) + 1,
        year: this._util.tableYear
      };
      this.dialogRef.close(result);
    } else {
      const quarterPart: string = this.selectedMonth.substring(1);
      const result: any = {
        year: this._util.tableYear,
        sequence: parseInt(quarterPart, 10)
      };
      this.dialogRef.close(result);
    }
  }
}
