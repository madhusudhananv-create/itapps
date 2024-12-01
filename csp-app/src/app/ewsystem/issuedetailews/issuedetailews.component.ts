import { Component, OnInit , Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-issuedetailews',
  templateUrl: './issuedetailews.component.html',
  styleUrls: ['./issuedetailews.component.scss']
})
export class IssuedetailewsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
