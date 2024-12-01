import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { $ } from 'protractor';
import { Item } from 'sp-pnp-js';
import { CssdashboardInputs } from '../../../../models/cssdashboard-inputs';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';

@Component({
  selector: 'app-view-css-details',
  templateUrl: './view-css-details.component.html',
  styleUrls: ['./view-css-details.component.scss']
})
export class ViewCssDetailsComponent implements OnInit {
  _loading: boolean = false;
  cssInputs: CssdashboardInputs;
  cssViewDetailsData: any;
  projDisplayIndex = -1;
  isExpanded = false;

  constructor(private dialog: MatDialogRef<ViewCssDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public _util: myUtility, private _appService: AppsService,) { }

  ngOnInit() {
    if (this.data != null) {
      this.cssInputs = this.data.cssInputs;
      this.getCSSViewDetails();      
    }    
  }

  onClose() {
    this.dialog.close();
  }
  openWin(url) {
    this._loading = true;
    window.open(url, '_blank');
  }

  getCSSViewDetails() {
    this._loading = true;
    this._appService.getCSSViewDetails(this.cssInputs).subscribe(data => {
      this.cssViewDetailsData = data;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }

  getPaddingLeftPercentage(actionPlanSubmitted,actionPlanNotSubmitted)
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

      
  }

  setProjectIndex(index, image: any) {


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
