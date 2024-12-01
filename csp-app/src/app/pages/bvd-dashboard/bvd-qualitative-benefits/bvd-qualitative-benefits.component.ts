import { Component, OnInit, Input, Output } from '@angular/core';
import { BvdDashboardService } from '../services/bvd-dashboard.service';
import { myUtility } from '../../../Shared/myUtility';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BvdQualitativeBenefitsDetailComponent } from '../bvd-qualitative-benefits-detail/bvd-qualitative-benefits-detail.component';

@Component({
  selector: 'app-bvd-qualitative-benefits',
  templateUrl: './bvd-qualitative-benefits.component.html',
  styleUrls: ['./bvd-qualitative-benefits.component.scss']
})
export class BvdQualitativeBenefitsComponent implements OnInit {

  @Input('ValueBenefitdata') benefitdata: any;
  @Input('ValueBenefitDetaildata') benefitDetaildata : any;

  graphData: any;
  constructor(private dialog:MatDialog,private _bvdService: BvdDashboardService, private _util: myUtility) { }

  ngOnInit() {
    this.graphData = undefined;
    this.graphData = this.benefitdata;
  }

  ngOnChanges() {
    this.graphData = undefined;
    this.graphData = this.benefitdata;
  }
  
  openDialog()
  {
     const dialogConfig = new MatDialogConfig();
     dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'DetailsdataQualitative' : this.benefitDetaildata
    }
    dialogConfig.width = '75%'
     const dialogRef = this.dialog.open(BvdQualitativeBenefitsDetailComponent,dialogConfig);
     dialogRef.afterClosed().subscribe(res => {});
  }
}
