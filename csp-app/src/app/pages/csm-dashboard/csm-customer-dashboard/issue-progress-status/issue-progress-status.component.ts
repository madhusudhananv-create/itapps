import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as Highcharts from 'highcharts';
import { myUtility } from '../../../../Shared/myUtility';

@Component({
  selector: 'app-issue-progress-status',
  templateUrl: './issue-progress-status.component.html',
  styleUrls: ['./issue-progress-status.component.scss']
})
export class IssueProgressStatusComponent implements OnInit {
  Highcharts = Highcharts;
  constructor(public _util: myUtility,public dialog: MatDialog) { }

  ngOnInit() {
  }

}
