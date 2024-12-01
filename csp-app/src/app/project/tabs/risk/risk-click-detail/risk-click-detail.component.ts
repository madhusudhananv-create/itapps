import { Component, OnInit ,Inject} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material';

@Component({
  selector: 'app-risk-click-detail',
  templateUrl: './risk-click-detail.component.html',
  styleUrls: ['./risk-click-detail.component.scss']
})
export class RiskClickDetailComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
