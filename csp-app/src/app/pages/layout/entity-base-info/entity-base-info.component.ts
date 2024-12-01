import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { AppsService } from '../../../../app/Services/apps.service';

@Component({
  selector: 'app-entity-base-info',
  templateUrl: './entity-base-info.component.html',
  styleUrls: ['./entity-base-info.component.scss']
})
export class EntityBaseInfoComponent implements OnInit {

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<EntityBaseInfoComponent>, private appService: AppsService) { }
  response: any;
  empName: any;
  header: string;
  project: string;
 

  closeInfo() {
    this.dialogRef.close();
  }
  ngOnInit() {
    this.getEntityGeneralInfo();
    this.header = this.data.header;
    this.project = this.data.project;
  }
  closeDialog(): void {
    this.dialogRef.close(EntityBaseInfoComponent);
  }
  getEntityGeneralInfo() {
    this.appService.getEntityGeneralInfo(this.data.entity, this.data.entityType).subscribe(data => {
      this.response = data;
    })
  }

}
