import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-project-status',
  templateUrl: './project-status.component.html',
  styleUrls: ['./project-status.component.scss']
})
export class ProjectStatusComponent implements OnInit {

  ProjectforeCast : any;
  customerName : string;

  constructor(private dialogRef: MatDialogRef<ProjectStatusComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if(this.data != null)
      this.ProjectforeCast = this.data.projectStatus;
      this.customerName = this.data.custName
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
