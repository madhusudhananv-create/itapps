import { Component, OnInit, ViewChild } from '@angular/core';
import { AppServiceOthers } from '../../Services/apps.service.other';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { ProcessAreaModelNew, ProcessModelNew } from '../../models/audit-checklist-based-model';
import { ServiceAreaModelNew } from '../../models/fmea-model';
import { BvdEntryService } from './services/bvd-entry.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
//import { TokenInterceptor } from './services/token-interceptor';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-bvd-entry',
  templateUrl: './bvd-entry.component.html',
  styleUrls: ['./bvd-entry.component.scss']
})
export class BvdEntryComponent implements OnInit {

  menuToggleStatus: boolean;
  isIdeaSubmitted: boolean = false;
  //selectedIndex: number = 0;
  @ViewChild('stepper') stepper: MatStepper;
  constructor(public _bvdEntry: BvdEntryService) {
  }

  ngOnInit() {
    //this.stepper.selectedIndex = this._bvdEntry.currentStep - 1;
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  getCurrentIndex(index) {
    this.stepper.selectedIndex = index;
  }
}
