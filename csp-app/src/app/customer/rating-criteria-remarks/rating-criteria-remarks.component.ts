import { Component, Inject, OnInit,Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-rating-criteria-remarks',
  templateUrl: './rating-criteria-remarks.component.html',
  styleUrls: ['./rating-criteria-remarks.component.scss']
})
export class RatingCriteriaRemarksComponent implements OnInit {
  @Input() Message: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private dialog: MatDialogRef<RatingCriteriaRemarksComponent>) {  }
  remarks : any[];
  ngOnInit() {
     this.Message = this.data.Message;
  }
  closeDialog(): void {
    this.dialog.close(RatingCriteriaRemarksComponent);
  }
}
