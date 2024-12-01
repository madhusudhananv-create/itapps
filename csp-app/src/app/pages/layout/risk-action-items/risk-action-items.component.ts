import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { ActionitemModelNew } from '../../../models/actionitem-model';
import { environment } from '../../../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';
import { SharedService } from '../../../Shared/shared.service';


@Component({
  selector: 'app-risk-action-items',
  templateUrl: './risk-action-items.component.html',
  styleUrls: ['./risk-action-items.component.scss']
})
export class RiskActionItemsComponent implements OnInit {

  result: any = [];
  selectedCust: string;
  riskId: any;
  EditActionitem: ActionitemModelNew = new ActionitemModelNew;
  projectName: any;
  projectId: any;

  constructor(private route: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _http: Http, public _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, public _access: AccessControl, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
  }

  ngOnInit() {
    if (this.data && this.data.Flag == "add") {
      this.projectName = this.data.ProjectName;
      this.projectId = this.data.ProjectId;
      this.riskId = this.data.RiskId;
      this.newEditActionitem();
    }
    else {
      this.projectName = this.data.ProjectName;
      this.projectId = this.data.ProjectId;
      this.EditActionitem = this.data.ActionItem;
    }
  }


  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }

    let tDate = new Date(this.EditActionitem.targeT_DATE);
    tDate.setHours(0, 0, 0, 0);

    let iDate = new Date(this.EditActionitem.identifieD_DATE);
    iDate.setHours(0, 0, 0, 0);

    let cdate = this.EditActionitem.completioN_DATE;

    if (this.EditActionitem.completioN_DATE != null && this.EditActionitem.completioN_DATE != undefined) {
      cdate = new Date(this.EditActionitem.completioN_DATE);
      cdate.setHours(0, 0, 0, 0);
    }

    if (!this.IsDateValid(tDate, iDate)) {
      alert('Please enter valid target and identified dates');
      return;
    }

    if (!this.IsCompletionDateValid(cdate, iDate)) {
      alert('Please enter valid identified and completion dates');
      return;
    }
    if (this.EditActionitem.id === 0 || this.EditActionitem.id === undefined) {
      this.EditActionitem.cusT_ID = this.selectedCust;
      this.EditActionitem.proJ_ID = this.projectId;
      this.EditActionitem.rag = 'green';
      this.EditActionitem.createD_BY = localStorage.getItem('empid');
      this.EditActionitem.createD_DATE = new Date();
      this.EditActionitem.updateD_BY = localStorage.getItem('empid');
      this.EditActionitem.updateD_DATE = new Date();
      this.EditActionitem.risk_id = this.riskId;
      this.service_addActionitem(this.EditActionitem);
      this.dialog.closeAll();
      alert("Added Successfully");
    }
    else {
      this.service_updateActionitem(this.EditActionitem);
      this.dialog.closeAll();
      alert("Updated Successfully");
    }
    this.newEditActionitem();
  }

  IsCompletionDateValid(completionDate, identifiedDate) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (completionDate != null && completionDate != undefined) {
      if (completionDate >= identifiedDate && completionDate <= currentDate && identifiedDate <= currentDate)
        return true;
      else
        return false;
    }
    else
      return true;

  }

  IsDateValid(targetDate, identifiedDate) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (targetDate >= identifiedDate && identifiedDate <= currentDate)
      return true;
    else
      return false;
  }

  newEditActionitem() {
    this.EditActionitem = new ActionitemModelNew();
  }

  Cancel_onClick() {
    this.dialog.closeAll();
  }

  service_addActionitem(actionitem) {

    let apiuri: string = environment.webapiuri + 'AddActionitemNew';
    this._http.post(apiuri, actionitem, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.result.push(JSON.parse(data.text()));
        this.result.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
      }, error => { this._util.serviceError(error); },
      );
  }

  service_updateActionitem(actionitem) {

    let apiuri: string = environment.webapiuri + 'UpdateActionitemforRisk';
    this._http.post(apiuri, actionitem, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.result = data;
      }, error => { this._util.serviceError(error); });
  }

  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empid', localStorage.getItem('empid'));
    return headers;
  }

}
