import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { VoiceOfCustomerComponent } from '../../../dashboard-customer/voice-of-customer/voice-of-customer.component';
import { InnovationModelExt } from './../../../../../models/innovation-model';

@Component({
  selector: 'app-ideas-popup',
  templateUrl: './ideas-popup.component.html',
  styleUrls: ['./ideas-popup.component.scss']
})
export class IdeasPopupComponent implements OnInit {
  displayedColumns  = ['index','portfoliO_NM', 'proJ_NM', 'description', 'status','identifieD_DATE', 'targeT_DATE', 'actuaL_DATE', 'responsible', 'area', 'comments'];
  dataSource : MatTableDataSource<InnovationModelExt>;
  ideasData : InnovationModelExt[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dialogRef: MatDialogRef<VoiceOfCustomerComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if(this.data != undefined)
    { 
      this.ideasData = this.data.ideas;
//console.log(this.ideasData);
      this.dataSource = new MatTableDataSource(this.ideasData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  
  closePopup()
  {
    this.dialogRef.close();
  }

}
