import { Component, OnInit, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

@Component({
  selector: 'app-view-css-details',
  templateUrl: './view-css-details.component.html',
  styleUrls: ['./view-css-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatIconModule
  ]
})
export class ViewCssDetailsComponent implements OnInit {
  _loading: boolean = false;
  cssInputs: CssdashboardInputs = new CssdashboardInputs();
  cssViewDetailsData: any;
  projDisplayIndex = -1;
  isExpanded = false;

  private dialog = inject(MatDialogRef<ViewCssDetailsComponent>);
  public _util = inject(MyUtility);
  private _appService = inject(AppsService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data != null) {
      this.cssInputs = this.data.cssInputs;
      this.getCSSViewDetails();      
    }    
  }

  onClose() {
    this.dialog.close();
  }
  
  openWin(url: any) {
    this._loading = true;
    window.open(url, '_blank');
  }

  getCSSViewDetails() {
    this._loading = true;
    this._appService.getCSSViewDetails(this.cssInputs).subscribe({
      next: (data: any) => {
        this.cssViewDetailsData = data;
        this._loading = false;
      },
      error: (error: any) => { this._util.serviceError(error); this._loading = false; }
    })
  }

  getPaddingLeftPercentage(actionPlanSubmitted: any, actionPlanNotSubmitted: any)
  {
    
      if(this.cssViewDetailsData.frequencY_LIST.length == 1 && actionPlanSubmitted == 0 && actionPlanNotSubmitted == 0)
      {
             return 9;
      }
      else if(this.cssViewDetailsData.frequencY_LIST.length > 1 && actionPlanSubmitted == 0 && actionPlanNotSubmitted == 0)
      {
             return 4;
      }
      else if(this.cssViewDetailsData.frequencY_LIST.length == 1 && (actionPlanSubmitted > 0 || actionPlanNotSubmitted > 0))
      {
             return 7;
      }

      else if(this.cssViewDetailsData.frequencY_LIST.length > 1 && (actionPlanSubmitted > 0 || actionPlanNotSubmitted > 0))
      {
             return 3;
      }
      else if(this.cssViewDetailsData.frequencY_LIST.length > 1 && actionPlanSubmitted == 0 && actionPlanNotSubmitted == 0)
      {
             return 4;
      }

      return 0;
  }

  setProjectIndex(index: any, image: any) {


    if (this.projDisplayIndex == index) {
      this.projDisplayIndex = -1;
      this.cssViewDetailsData.csaT_DETAILS[index].isexpanded = false;

    }
    else {
      this.cssViewDetailsData.csaT_DETAILS[index].isexpanded = true;
      if (this.projDisplayIndex != -1) {
        this.cssViewDetailsData.csaT_DETAILS[this.projDisplayIndex].isexpanded = false;
      }

      this.projDisplayIndex = index;

    }

  }

}
