import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DialogData } from "../../../../controls/kpi/kpi-details/kpi-details.component";
import { Component, Inject } from "@angular/core";

@Component({
    selector: 'app-timesheet-dialog-popup',
    styleUrls: ['./timesheet-dialog-popup.scss'],
    templateUrl: 'timesheet-dialog-popup.html',
  })
  export class TimesheetDialogPopupComponent {
  
    constructor(
      public dialogRef: MatDialogRef<TimesheetDialogPopupComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        dialogRef.disableClose = true;
      }
  
    onBack(): void {
      this.dialogRef.close("back");
    }
  
  }