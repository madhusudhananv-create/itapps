import { Component, OnInit, Inject, Input, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { myUtility } from '../../../../Shared/myUtility';


@Component({
  selector: 'app-preview-popup',
  templateUrl: './preview-popup.component.html',
  styleUrls: ['./preview-popup.component.scss']
})
export class PreviewPopupComponent implements OnInit {
  @Input() previewData: any[] = [];
  @Input() checklistname: string;
  @Input() version: number;
  @Input() effectivefrom: Date;
  @Input() isMergeView: boolean = false;
  @Input() showSelectColumn: boolean = false;
  isweightageApplicable: boolean;
  ismaturityApplicable: boolean;
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any, @Optional() private dialogRef: MatDialogRef<PreviewPopupComponent>, private _util: myUtility) {
    if (data != null) {
      console.log("preview data", data);
      this.previewData = data.previewData;
      this.checklistname = data.checklistName;
      this.version = data.version;
      this.effectivefrom = data.effectivE_FROM;
      this.isweightageApplicable = data.iS_WEIGHTAGE_APPLICABLE;
      this.ismaturityApplicable = data.iS_MATURITY_APPLICABLE;
    }
  }

  closepopup() {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
