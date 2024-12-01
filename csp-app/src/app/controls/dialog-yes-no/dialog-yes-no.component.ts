import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-yes-no',
  templateUrl: './dialog-yes-no.component.html',
})
export class DialogYesNoComponent  {

  constructor(
    public dialogRef: MatDialogRef<DialogYesNoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
      this.dialogRef.close();
    }

}
