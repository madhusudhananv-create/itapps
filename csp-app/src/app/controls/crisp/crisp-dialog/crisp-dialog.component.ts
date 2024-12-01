import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-crisp-dialog',
  templateUrl: './crisp-dialog.component.html',
  styleUrls: ['./crisp-dialog.component.scss']
})
export class CrispDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
