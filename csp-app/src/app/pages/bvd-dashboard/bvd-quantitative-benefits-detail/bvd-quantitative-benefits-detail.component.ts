import { Component, OnInit, Inject,ViewChild } from '@angular/core';
import { MatDialog,MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource,MatPaginator, MatSort } from '@angular/material';


@Component({
  selector: 'app-bvd-quantitative-benefits-detail',
  templateUrl: './bvd-quantitative-benefits-detail.component.html',
  styleUrls: ['./bvd-quantitative-benefits-detail.component.scss']
})
export class BvdQuantitativeBenefitsDetailComponent implements OnInit {

  displayedColumns: string[] = ['identifiedDate','idea','area','responsible','savings'];
  dataSource = new MatTableDataSource();
  quantitativebenfits : any[] =[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private dialog : MatDialogRef<BvdQuantitativeBenefitsDetailComponent>) 
  { 
    //this.dataSource = new MatTableDataSource(data.Detailsdata)
  }

  ngOnInit() {
    if(this.data != undefined)
    {
      this.quantitativebenfits = this.data.DetailsdataQuantitative;
      this.dataSource = new MatTableDataSource(this.quantitativebenfits)
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      //console.log("quantitativebenfits:",this.quantitativebenfits)
    }
  }

  ngOnChanges(){
    this.dataSource = new MatTableDataSource(this.quantitativebenfits);
    }
  
  onClose(){
    this.dialog.close();
 }
}

export interface Benefits {
  identifiedDate: string;
  savings: string;
  responsible:string;
  area:string;
  idea: string;
  
  
}

// const benefitsDetail : Benefits[] = [{identifiedDate:'03-Sep-2018',benefit:'Object Cleanup',responsible:'Database Team',area:'Incident Management',idea:'Name of the Idea'},
// {identifiedDate:'03-Dec-2018',benefit:'Release',responsible:'Gokulakannan J',area:'Incident Management',idea:'Name of the Idea'},
// {identifiedDate:'08-Oct-2018',benefit:'Ticket Reduction in DL tickets - No Owner DL',responsible:'Leads Team',area:'Incident Management',idea:'Name of the Idea'}]
