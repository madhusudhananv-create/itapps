import { Component, OnInit ,Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-projforecast-details',
  templateUrl: './projforecast-details.component.html',
  styleUrls: ['./projforecast-details.component.scss']
})
export class ProjforecastDetailsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
