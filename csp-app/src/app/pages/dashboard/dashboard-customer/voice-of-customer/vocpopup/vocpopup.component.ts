import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { VoiceOfCustomerComponent } from '../voice-of-customer.component';
import { IssueModel, IssueModelExt } from './../../../../../models/issue-model';


@Component({
  selector: 'app-vocpopup',
  templateUrl: './vocpopup.component.html',
  styleUrls: ['./vocpopup.component.scss']
})
export class VocpopupComponent implements OnInit {
  escalations: IssueModelExt[];
  displayedColumns : string[] =  ['cusT_NM', 'proJ_NM', 'description', 'status', 'identifieD_BY', 'identifieD_DATE', 'targeT_DATE'];
  dataSource : MatTableDataSource<IssueModelExt>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialogRef: MatDialogRef<VoiceOfCustomerComponent>, @Inject(MAT_DIALOG_DATA) public data: any) 
  { }

  ngOnInit() {
    if(this.data != null)
      this.escalations = this.data.issues;

    //console.log(this.escalations)

    this.dataSource = new  MatTableDataSource(this.escalations);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
