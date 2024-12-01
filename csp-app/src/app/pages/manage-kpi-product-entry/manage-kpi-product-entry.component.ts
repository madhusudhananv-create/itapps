import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { AccessControl } from '../../Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';
import { SharedService } from '../../Shared/shared.service';
import { MatStepper } from '@angular/material';



@Component({
  selector: 'app-manage-kpi-product-entry',
  templateUrl: './manage-kpi-product-entry.component.html',
  styleUrls: ['./manage-kpi-product-entry.component.scss']
})


export class ManageKpiProductEntryComponent implements OnInit {
  custId: string;
  IsBackButtonEnabled: boolean = false;
  menuToggleStatus: boolean;
  isIdeaSubmitted: boolean = false;
  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private _activatedRoute: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, public _access: AccessControl
  ) {
  }

  ngOnInit() {
    this.custId = this._activatedRoute.snapshot.params["custid"];
  }

}
