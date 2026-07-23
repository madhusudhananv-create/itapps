import { Component, OnInit, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

/**
 * ApprovalPopupComponent
 * Migrated from Angular 6 to Angular 19 standalone
 *
 * Dialog popup for entering approval comments.
 * Opened from ProjectDataConfigurationComponent when approving a project setting.
 * Returns { approved: true, data: comments } on submit, { approved: false } on close.
 */
@Component({
  selector: 'app-approval-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './approval-popup.component.html',
  styleUrls: ['./approval-popup.component.scss']
})
export class ApprovalPopupComponent implements OnInit {

  approvalComments: string = '';

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogref: MatDialogRef<ApprovalPopupComponent>
  ) { }

  ngOnInit(): void { }

  Cancel_onClick(): void { }

  close(): void {
    this.dialogref.close({ approved: false });
  }

  SubmitForm(isValid: boolean): void {
    if (!isValid) return;
    this.dialogref.close({
      approved: true,
      data: this.approvalComments.length > 0 ? this.approvalComments : ''
    });
  }
}
