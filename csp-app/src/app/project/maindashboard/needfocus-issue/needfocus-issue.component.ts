import { Component, OnInit , Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';

@Component({
  selector: 'app-needfocus-issue',
  templateUrl: './needfocus-issue.component.html',
  styleUrls: ['./needfocus-issue.component.scss']
})
export class NeedfocusIssueComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private _util: myUtility  ) { }

  ngOnInit() {
  }

}
