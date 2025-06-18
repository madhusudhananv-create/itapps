import { Component, OnInit, Inject, Input, Optional, Output, EventEmitter } from '@angular/core';
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
  @Input() sa: any;
  @Input() pa: any;
  @Input() p: any;
  @Input() question: any;
  @Output() checkboxChange = new EventEmitter<{ type: string, data: any, parentData: any, grandparentData: any }>();
  isweightageApplicable: boolean;
  ismaturityApplicable: boolean;
  onCheckboxChange(type: string, data: any, parentData: any = null, grandparentData: any = null) {
    this.checkboxChange.emit({ type, data, parentData, grandparentData });
  }
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
