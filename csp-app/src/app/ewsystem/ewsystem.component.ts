import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../Shared/myUtility';
import { AppsService } from '../Services/apps.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { IssueModel } from '../models/issue-model';
import { IssuedetailewsComponent } from '../ewsystem/issuedetailews/issuedetailews.component'
import { CrispScoresProjectModel } from '../models/crisp-scores-project-model';

@Component({
  selector: 'app-ewsystem',
  templateUrl: './ewsystem.component.html',
  styleUrls: ['./ewsystem.component.scss']
})
export class EwsystemComponent implements OnInit {
  @Input('ProjectIds') projectIds: string[];
  custId: string;
  projId: string;
  ewsData: any;
  issue: IssueModel[] = [];
  needFocus: any;
  legend: boolean = false;
  constructor(private _activatedRoute: ActivatedRoute, private _http: Http, private _util: myUtility, private _appService: AppsService, public dialog: MatDialog) { }

  ngOnInit() {
    this.loadData();
  }
  loadData() {
    this.service_getProjectIssuesEWS(this.projectIds);
  }
  ngOnChanges() {
    this.service_getProjectIssuesEWS(this.projectIds);
  }
  enablestatus() {
    this.legend = true;
  }
  disablestatus() {
    this.legend = false;
  }
  GetIssues(projId) {
    this._appService.getNeedFocus(projId)
      .subscribe
      (
      data => {
        this.needFocus = data;
      }
      ,
      error => {
        this._util.serviceError(error);
      }
      );
    this._appService.getProjectIssueById(projId)
      .subscribe
      (
      data => {
        this.issue = data;
        this.showRisk();
      }
      ,
      error => {
        this._util.serviceError(error);
      }
      );
  }
  service_getProjectIssuesEWS(projectIds) {
    this._appService.getProjectIssueEWS(projectIds, new Date())
      .subscribe
      (
      data => {
        this.ewsData = data;
      }
      ,
      error => {
        this._util.serviceError(error);
      }
      );
  }
  showRisk() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      issue: this.issue,
      needFocus: this.needFocus
    }
    const dialogRef = this.dialog.open(IssuedetailewsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
     
    });
  }
}

// export interface Test{
//   des:string;
// }
// const elem:Test[]=[{des:'Project 1'},{des:'Project 2'},{des:'Project 3 '}];
