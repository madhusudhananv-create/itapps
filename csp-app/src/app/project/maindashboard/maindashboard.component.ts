import { Component, OnInit, Input } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { kpi_kpiDetails } from '../../models/kpi';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { ChartsCtrl } from '../../controls/charts';
import { HighlightsModel } from '../../models/highlights-model';
import { ChartsModel } from '../../models/charts-model';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material';
import * as Highcharts from 'highcharts/highstock';
import { List } from 'sp-pnp-js/lib/pnp';
import { NeedfocusIssueComponent } from './needfocus-issue/needfocus-issue.component'
import { MatDialog, MatDialogConfig } from '@angular/material';
import { NeedFocusDashboard } from '../../models/need_focus_dashboard';
import { AccessControl } from '../../Shared/accessControl';

@Component({
  selector: 'app-maindashboard',
  templateUrl: './maindashboard.component.html',
  styleUrls: ['./maindashboard.component.scss']
})

export class MaindashboardComponent implements OnInit {
  Highcharts = Highcharts;
  @Input() customerId: string;
  Projects = [];
  ProjectIds = [];
  SelectedProjectId: string;
  // tableMonth: string = this._util.Month();
  // tableYear: number = this._util.Year();
  highlightsWidth: number = 200;
  report1_data: kpi_kpiDetails;
  highlights: HighlightsModel[];
  chartsMonthly: ChartsModel;
  issuecount: NeedFocusDashboard = new NeedFocusDashboard();
  issue: any;
  _period: string = 'Monthly';

  constructor(private _appservice: AppsService, public _util: myUtility, private _chartsctrl: ChartsCtrl, public dialog: MatDialog, public _access: AccessControl) { }
  ngOnChanges() {
    this.LoadProject();
    this._util.chartsMonthly = null;
    this._util.highlights = null;
  }
  ngOnInit() {
    //this.LoadNeedFocus();
    
  }
  LoadCharts() {
    //this._util.GetHighlights(this.customerId, this.SelectedProjectId, new Date()); highlights called after getCharts
    this._util.GetCharts(this.customerId, this.SelectedProjectId);
  }
  LoadNeedFocus() {
    this._appservice.getneedFocusCountData(this.SelectedProjectId).subscribe(
      data => {
        this.issuecount = data;
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }
  // getIssue(i) {
  //   if (this.issuecount != undefined && this.issuecount[i] != null)
  //     return this.issuecount;
  //   return 0;
  // }
  LoadProject() {
    if (this._util.IsGAVS()) {
      this._appservice.GetCustomerProjectsNameWithCustNM(this.customerId, localStorage.getItem('empid')).subscribe(data => {
        this.Projects = data;
        if (this.Projects.length > 0) {
          this.SelectedProjectId = this.Projects[0].proJ_ID
          this.ProjectIds = this.Projects.map(a => a.proJ_ID);
          this.LoadCharts();
          this.LoadNeedFocus();
        }
      }, error => { this._util.serviceError(error); });
    }
    else {
      this._appservice.GetCustomerProjectsNameForClient(this.customerId, localStorage.getItem('empid')).subscribe(data => {
        this.Projects = data;
        if (this.Projects.length > 0) {
          this.SelectedProjectId = this.Projects[0].proJ_ID
          this.ProjectIds = this.Projects.map(a => a.proJ_ID);
          this.LoadCharts();
          this.LoadNeedFocus();
        }
      }, error => { this._util.serviceError(error); });
    }
  }
  GetNeedFocusDetail(proJ_ID, div) {
    this._appservice.getNeedFocusDetail(proJ_ID, div).subscribe(
      data => {
        this.issue = data;
        this.showRisk(div);
      },
      error => { this._util.serviceError(error); });
  }
  getStyle(color) {
    if (color === "#237f00")
      return "green_border";
    else if (color === "#f9a400")
      return "orange_border";
    else if (color === "#f60000")
      return "red_border";
    else if (color === "#00bfff")
      return "blue_border";
  }
  ddProject_Onchange() {
    this.LoadCharts();
    this.LoadNeedFocus();
  }
  toggleHighlights() {
    if (this.highlightsWidth == 25) {
      this.highlightsWidth = 200;
    }
    else {
      this.highlightsWidth = 25;
    }
  }
  showRisk(div) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      issue: this.issue,
      directive: div
    }
    const dialogRef = this.dialog.open(NeedfocusIssueComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
//console.log(`Dialog result: ${result}`);
    });
  }

  GetKPIDetails(client_ID) {
    this._appservice.getKPI(client_ID)
      .subscribe
      (
      data => {
        this.report1_data = data;
      }
      ,
      error => {
        this._util.serviceError(error);
      }
      );
  }

  period(p) {
    this._period = p;
  }

  chosenYearHandler() {
    alert('year');
  }

  chosenMonthHandler() {
    alert('month');
  }
  reloadKPITable() {
    //let d: Date = new Date("1-" + this._util.tableMonth + "-" + this._util.tableYear);
    let d = "1-" + this._util.tableMonth + "-" + this._util.tableYear;
    this._util.GetTable(this.customerId, this.SelectedProjectId, d);
    this._util.GetHighlights(this.customerId, this.SelectedProjectId, d);
  }
}
//----------------------
//https://github.com/gmazzamuto/ng2-google-charts/blob/master/demo/src/app/app.component.ts