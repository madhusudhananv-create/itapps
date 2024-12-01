import { Component, OnInit, Inject } from '@angular/core';
import { DateSelectionModel } from '../../../../models/DateSelection-model';
import { myUtility } from './../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as Highcharts from 'highcharts/highstock';

@Component({
  selector: 'app-kpitrend',
  templateUrl: './kpitrend.component.html',
  styleUrls: ['./kpitrend.component.scss']
})
export class KPITrendComponent implements OnInit {
  DateSelection : DateSelectionModel = new DateSelectionModel(this._util);
  lineGraphData : any[];
  custId : string
  projIds : string[] = [];
  Highcharts = Highcharts;
  constructor(private dialogRef: MatDialogRef<KPITrendComponent>, @Inject(MAT_DIALOG_DATA) public data: any,public _util: myUtility, private _appService : AppsService) { }

  ngOnInit() 
  {
    if(this.data != undefined)
    {
      this.custId = this.data.custid;
      this.projIds = this.data.projids;
    }
    if(this.projIds.length == 0)
    {
      this.GetProjectList();
    }
    else
    {
      this.SetStartAndEndDate(this.DateSelection);
      this.Service_GetKPITrendByMonthLine();
    }
  }

   GetProjectList()
  {
     this._appService.GetProjectsNameForCustomer(this.custId).subscribe(
       data => {
         this.projIds = data.map(x => x.proJ_ID);
       },
       (error) => {this._util.serviceError(error)},
       () =>{
         this.SetStartAndEndDate(this.DateSelection);
         this.Service_GetKPITrendByMonthLine();
       }
     );
  }

  saveDates(DateSelection) 
  {
    DateSelection.startDate = new Date(DateSelection.selectedStartYear, this._util.getMonthNum(DateSelection.selectedStartMonth), 1);
    DateSelection.endDate = new Date(DateSelection.selectedEndYear, this._util.getMonthNum(DateSelection.selectedEndMonth)+1, 0);
  }

  // SetStartAndEndDate(DateSelection)
  // {
  //   if (new Date().getMonth() < 3) {
  //     DateSelection.selectedStartMonth = this._util.getMonthAbr(3);
  //     DateSelection.selectedStartYear = (new Date().getFullYear()) - 1;
  //     DateSelection.selectedEndMonth = this._util.getMonthAbr(2);
  //     DateSelection.selectedEndYear = (new Date().getFullYear());
  //     DateSelection.startDate = new Date(DateSelection.selectedStartYear, 3, 1);
  //     DateSelection.endDate = new Date(DateSelection.selectedEndYear, 2, 1);
  //   }
  //   else {
  //     DateSelection.selectedStartMonth = this._util.getMonthAbr(3);
  //     DateSelection.selectedStartYear = (new Date().getFullYear());
  //     DateSelection.selectedEndMonth = this._util.getMonthAbr(2);
  //     DateSelection.selectedEndYear = (new Date().getFullYear()) + 1;
  //     DateSelection.startDate = new Date(DateSelection.selectedStartYear, 3, 1);
  //     DateSelection.endDate = new Date(DateSelection.selectedEndYear, 2, 1);
  //   }
  // }

  SetStartAndEndDate(DateSelection : DateSelectionModel)
  {
    // DateSelection.selectedStartMonth = this._util.getMonthAbr((new Date().getMonth()- 6));
    // DateSelection.selectedStartYear = (new Date().getFullYear());
    // DateSelection.selectedEndMonth = this._util.getMonthAbr((new Date().getMonth()));
    // DateSelection.selectedEndYear = (new Date().getFullYear());
    // DateSelection.startDate = new Date(DateSelection.selectedStartYear, 3, 1);
    //DateSelection.endDate = new Date(DateSelection.selectedEndYear, DateSelection.selectedEndMonth, 1);
    

    DateSelection.endDate = new Date();
    DateSelection.startDate.setMonth(DateSelection.endDate.getMonth() - 12);

    DateSelection.selectedEndMonth = this._util.getMonthAbr(DateSelection.endDate.getMonth());
    DateSelection.selectedEndYear = DateSelection.endDate.getFullYear();

    DateSelection.selectedStartMonth = this._util.getMonthAbr(DateSelection.startDate.getMonth());
    DateSelection.selectedStartYear = DateSelection.startDate.getFullYear();
  }

  Service_GetKPITrendByMonthLine()
  {
     
    this._appService.getKPITrendByMonthLine(this.custId, this.projIds, this.DateSelection.startDate, this.DateSelection.endDate).subscribe(
      data =>
      {
        this.lineGraphData = data;
        console.log("line graph data", this.lineGraphData);
      }
    )
  }

  closePopup()
  {
    this.dialogRef.close();
  }

}
