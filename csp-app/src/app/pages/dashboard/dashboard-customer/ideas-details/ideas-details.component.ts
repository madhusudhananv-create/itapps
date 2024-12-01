import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-ideas-details',
  templateUrl: './ideas-details.component.html',
  styleUrls: ['./ideas-details.component.scss']
})
export class IdeasDetailsComponent implements OnInit {

  AllIdeasData : any

  constructor(private dialogRef: MatDialogRef<IdeasDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if(this.data != null)
      this.AllIdeasData = this.data.ideas
  }
  closeDialog()
  {
    this.dialogRef.close();
  }
}
