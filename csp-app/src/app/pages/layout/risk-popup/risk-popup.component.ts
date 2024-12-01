import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';

@Component({
  selector: 'app-risk-popup',
  templateUrl: './risk-popup.component.html',
  styleUrls: ['./risk-popup.component.scss']
})
export class RiskPopupComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RiskPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public myutil: myUtility) { }

  ngOnInit() {

  }
  closeDialog() {
    this.dialogRef.close();
  }
}
