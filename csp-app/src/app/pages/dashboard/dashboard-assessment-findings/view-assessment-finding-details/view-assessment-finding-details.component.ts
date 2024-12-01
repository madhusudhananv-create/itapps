import { Component, Inject, OnInit } from '@angular/core';
import { QagoverancedashboardInputs } from '../../../../models/qagoverancedashboard-inputs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';

@Component({
  selector: 'app-view-assessment-finding-details',
  templateUrl: './view-assessment-finding-details.component.html',
  styleUrls: ['./view-assessment-finding-details.component.scss']
})
export class ViewAssessmentFindingDetailsComponent implements OnInit {
  assessmentFindingInputs: QagoverancedashboardInputs;
  _loading : boolean;
  assessmentFindingsViewDetailsData : any;
  projDisplayIndex = -1;
  isExpanded = false;
  constructor(private dialog: MatDialogRef<ViewAssessmentFindingDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public _util: myUtility, private _appService: AppsService) { }

  ngOnInit() {
    if (this.data != null) {
      this.assessmentFindingInputs = this.data.assessmentFindingInputs;
      this.getAssessmentFindingsViewDetails();      
    }    
  }

  onClose() {
    this.dialog.close();
  }
  openWin(url) {
    window.open(url, '_blank');
  }

  getAssessmentFindingsViewDetails() {
    this._loading = true;
    this._appService.getAssessmentFindingsViewDetails(this.assessmentFindingInputs).subscribe(data => {
      this.assessmentFindingsViewDetailsData = data;
      console.log(this.assessmentFindingsViewDetailsData);
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }

  setProjectIndex(index, image: any) {


    if (this.projDisplayIndex == index) {
      this.projDisplayIndex = -1;
      this.assessmentFindingsViewDetailsData.assessmenT_FINDINGS_DETAILS[index].isexpanded = false;

    }
    else {
      this.assessmentFindingsViewDetailsData.assessmenT_FINDINGS_DETAILS[index].isexpanded = true;
      if (this.projDisplayIndex != -1) {
        this.assessmentFindingsViewDetailsData.assessmenT_FINDINGS_DETAILS[this.projDisplayIndex].isexpanded = false;
      }

      this.projDisplayIndex = index;

    }

  }


}
