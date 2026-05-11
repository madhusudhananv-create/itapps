import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { QagoverancedashboardInputs } from '../../../../models/qagoverancedashboard-inputs';
import { MyUtility } from '../../../../shared/my-utility';
import { AppsService } from '../../../../core/services/apps.service';

@Component({
  selector: 'app-view-assessment-finding-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './view-assessment-finding-details.component.html',
  styleUrl: './view-assessment-finding-details.component.scss'
})
export class ViewAssessmentFindingDetailsComponent implements OnInit {
  private _appService = inject(AppsService);
  public _util = inject(MyUtility);
  
  assessmentFindingInputs!: QagoverancedashboardInputs;
  _loading: boolean = false;
  assessmentFindingsViewDetailsData: any;
  projDisplayIndex = -1;
  isExpanded = false;

  constructor(
    private dialog: MatDialogRef<ViewAssessmentFindingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data != null) {
      this.assessmentFindingInputs = this.data.assessmentFindingInputs;
      this.getAssessmentFindingsViewDetails();      
    }    
  }

  onClose() {
    this.dialog.close();
  }

  openWin(url: string) {
    window.open(url, '_blank');
  }

  getAssessmentFindingsViewDetails() {
    this._loading = true;
    this._appService.getAssessmentFindingsViewDetails(this.assessmentFindingInputs).subscribe(data => {
      this.assessmentFindingsViewDetailsData = data;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }

  setProjectIndex(index: number, image: any) {
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
