import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { IssueModel } from '../../../../models/issue-model';

@Component({
  selector: 'app-issue-details',
  templateUrl: './issue-details.component.html',
  styleUrls: ['./issue-details.component.scss']
})
export class IssueDetailsComponent implements OnInit {

  IssuesArray: IssueModel[] = [];
  constructor(private dialogRef: MatDialogRef<IssueDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (this.data != null)
      this.IssuesArray = this.data.issues;
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
