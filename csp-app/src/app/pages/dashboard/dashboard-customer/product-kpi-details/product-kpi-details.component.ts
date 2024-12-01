import { Component, OnInit, Inject,ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA,MatDialog, MatDialogConfig, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';


@Component({
  selector: 'app-product-kpi-details',
  templateUrl: './product-kpi-details.component.html',
  styleUrls: ['./product-kpi-details.component.scss']
})
export class ProductKpiDetailsComponent implements OnInit {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private dialog : MatDialogRef<ProductKpiDetailsComponent>,private _appservice: AppsService,public _util: myUtility) { }

  status: string;
  kpiName : string;
  kpiData : any[]=[];
  //tableData : any[];
  custId:string;
  month:string;
  year:number;
  detailsFilter = new EngagementKPIDetails();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource(this.kpiData);
  displayedColumns: string[] = ['product', 'expectedLevel', 'minLevel', 'actuals', 'slaStatus'];
  isLoading : Boolean=false;
  viewBy : string;
  ngOnInit() {
    if (this.data != null) {
      this.status = this.data.status;
      this.kpiName = this.data.kpiName;
      this.custId = this.data.custId;
      this.month = this.data.month;
      this.year = this.data.year;
      this.viewBy = this.data.viewBy;
      this.loadData();
    }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  loadData(){
    this.isLoading = true;
    this.detailsFilter.kpiName = this.kpiName;
    this.detailsFilter.status = this.status;
    this.detailsFilter.custId = this.custId;
    this.detailsFilter.month = this.month;
    this.detailsFilter.year = this.year;
    this.detailsFilter.viewBy = this.viewBy;
    this._appservice.getEngagementKPIDetails(this.detailsFilter).subscribe(data => {
        this.kpiData = data;
        this.dataSource = new MatTableDataSource(this.kpiData);
        this.isLoading = false;
        //console.log(this.kpiData)
    },(err)=> {this._util.serviceError(err)})
  }
  onClose(){
    this.dialog.close();
 }
}
export class EngagementKPIDetails {
  kpiName: string;
  status: string;
  custId: string;
  month:string;
  year:number;
  viewBy:string;
}