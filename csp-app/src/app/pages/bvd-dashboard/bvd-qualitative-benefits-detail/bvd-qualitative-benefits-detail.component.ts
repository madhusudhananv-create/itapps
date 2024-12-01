import { Component, OnInit,Input,Inject,ViewChild } from '@angular/core';
import { MatDialog,MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource,MatPaginator, MatSort } from '@angular/material';


@Component({
  selector: 'app-bvd-qualitative-benefits-detail',
  templateUrl: './bvd-qualitative-benefits-detail.component.html',
  styleUrls: ['./bvd-qualitative-benefits-detail.component.scss']
})
export class BvdQualitativeBenefitsDetailComponent implements OnInit {

  

  displayedColumns: string[] = ['identifiedDate','idea','area','responsible','benefit'];
  dataSource = new MatTableDataSource();
  qualitativeBenefits : any[] =[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(private dialog : MatDialogRef<BvdQualitativeBenefitsDetailComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {
    //this.dataSource = new MatTableDataSource(data.Detailsdata)
   }

  ngOnInit() {
    if(this.data != undefined)
    {
    this.qualitativeBenefits = this.data.DetailsdataQualitative;
    this.dataSource = new MatTableDataSource(this.qualitativeBenefits);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    }
  }

   ngOnChanges(){
   this.dataSource = new MatTableDataSource(this.qualitativeBenefits);
   }
  
  onClose(){
     this.dialog.close();
  }

}

export interface Benefits {
  identifiedDate: string;
  benefit: string;
  savings:string;
  responsible:string;
  area:string;
  idea: string;
  
  
}
// const benefitsDetail : Benefits[] = [{identifiedDate:'03-Sep-2018',benefit:'Object Cleanup',savings:'90 hrs',responsible:'Database Team',area:'Incident Management',idea:'Name of the Idea'},
// {identifiedDate:'03-Dec-2018',benefit:'Release',savings:'10 hrs',responsible:'Gokulakannan J',area:'Incident Management',idea:'Name of the Idea'},
// {identifiedDate:'08-Oct-2018',benefit:'Ticket Reduction in DL tickets - No Owner DL',savings:'18 hrs',responsible:'Leads Team',area:'Incident Management',idea:'Name of the Idea'}]
