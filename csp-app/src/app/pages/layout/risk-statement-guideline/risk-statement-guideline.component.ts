import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-risk-statement-guideline',
  templateUrl: './risk-statement-guideline.component.html',
  styleUrls: ['./risk-statement-guideline.component.scss']
})
export class RiskStatementGuidelineComponent implements OnInit {

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any,private dialogRef: MatDialogRef<RiskStatementGuidelineComponent>){}

  ngOnInit() {
  }
  closeDialog(): void {
    this.dialogRef.close(RiskStatementGuidelineComponent);
  }
}
