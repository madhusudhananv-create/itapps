import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-action-items',
  templateUrl: './action-items.component.html',
  styleUrls: ['./action-items.component.scss']
})
export class ActionItemsComponent implements OnInit {

  ActionItems : any;
  constructor(private dialogRef: MatDialogRef<ActionItemsComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if(this.data != null)
      this.ActionItems = this.data;
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
