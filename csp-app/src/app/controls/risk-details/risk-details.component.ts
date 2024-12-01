import { Component, OnInit, Inject, Renderer2  } from '@angular/core';
import { MatDialog, MatDialogConfig, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'app-risk-details',
  templateUrl: './risk-details.component.html',
  styleUrls: ['./risk-details.component.scss']
})
export class RiskDetailsComponent implements OnInit {

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private renderer: Renderer2) { }
  showLegend: boolean = false;
  count: number = 0;
  isSelectedRow: any;
  ngOnInit() {
  }

  handleRowClick(link: string) {
    this.isSelectedRow = link;
    window.open(link, '_blank');
  }

  Cancel_onClick() {
    this.dialog.closeAll();
  }

}
