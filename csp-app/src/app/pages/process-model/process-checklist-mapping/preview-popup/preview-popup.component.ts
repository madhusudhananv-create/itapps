import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { myUtility } from '../../../../Shared/myUtility';

@Component({
  selector: 'app-preview-popup',
  templateUrl: './preview-popup.component.html',
  styleUrls: ['./preview-popup.component.scss']
})
export class PreviewPopupComponent implements OnInit {
  previewData : any[] = [];
  checklistname : string;
  version : number;
  effectivefrom: Date;
  isweightageApplicable : boolean;
  ismaturityApplicable : boolean;
  processModelDescription : string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<PreviewPopupComponent>, private _util: myUtility) {
    if(data != null)
    {
      console.log("preview data", data);  
      this.previewData = data.previewData;
      this.checklistname = data.checklistName;
      this.version = data.version;
      this.effectivefrom = data.effectivE_FROM;
      this.isweightageApplicable = data.iS_WEIGHTAGE_APPLICABLE;
      this.ismaturityApplicable = data.iS_MATURITY_APPLICABLE;
      this.processModelDescription = data.process_Model_description;
    }
   }

   closepopup()
   {
     this.dialogRef.close();
   }

  ngOnInit() {
  }

}
