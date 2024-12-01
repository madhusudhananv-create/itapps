import { Component, OnInit ,Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-compliancedetails',
  templateUrl: './compliancedetails.component.html',
  styleUrls: ['./compliancedetails.component.scss']
})
export class CompliancedetailsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
