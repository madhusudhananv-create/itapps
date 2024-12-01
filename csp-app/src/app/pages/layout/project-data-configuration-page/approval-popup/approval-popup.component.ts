import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-approval-popup',
  templateUrl: './approval-popup.component.html',
  styleUrls: ['./approval-popup.component.scss']
})
export class ApprovalPopupComponent implements OnInit {

  approvalComments: string;
  constructor(

    @Optional() @Inject(MAT_DIALOG_DATA) public data: string,
    private dialogref: MatDialogRef<ApprovalPopupComponent>) { }

  ngOnInit() {
  }
  Cancel_onClick() {

  }

  close() {
    this.dialogref.close({approved:false});
  }

  SubmitForm(isValid) {

    
    this.dialogref.close({ approved:true, data: this.approvalComments.length > 0 ? this.approvalComments : "" });
  }

}
