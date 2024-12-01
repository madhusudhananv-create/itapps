import { Component, OnInit, Inject } from '@angular/core';
import { DateSelectionModel } from '../../../../models/DateSelection-model';
import { myUtility } from './../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as Highcharts from 'highcharts/highstock';

@Component({
  selector: 'app-Achievementtrend',
  templateUrl: './Achievementtrend.component.html',
  styleUrls: ['./Achievementtrend.component.scss']
})
export class AchievementtrendComponent implements OnInit {
  DateSelection : DateSelectionModel = new DateSelectionModel(this._util);
  lineGraphData : any[];
  custId : string
  projIds : string[] = [];
  Highcharts = Highcharts;
  constructor(private dialogRef: MatDialogRef<AchievementtrendComponent>, @Inject(MAT_DIALOG_DATA) public data: any,public _util: myUtility, private _appService : AppsService) { }

  ngOnInit() 
  { 
    if(this.data != undefined)
    { 
      this.custId = this.data.custid;
      this.projIds = this.data.projids;
    }
    this.SetStartAndEndDate(this.DateSelection);
    this.Service_GetAchievementTrendByMonthLine();
  }

    

  
  SetStartAndEndDate(DateSelection : DateSelectionModel)
  {
    DateSelection.endDate = new Date();
    DateSelection.startDate.setMonth(DateSelection.endDate.getMonth() - 6);

    DateSelection.selectedEndMonth = this._util.getMonthAbr(DateSelection.endDate.getMonth());
    DateSelection.selectedEndYear = DateSelection.endDate.getFullYear();

    DateSelection.selectedStartMonth = this._util.getMonthAbr(DateSelection.startDate.getMonth());
    DateSelection.selectedStartYear = DateSelection.startDate.getFullYear();
  }

  Service_GetAchievementTrendByMonthLine()
  {
    this._appService.GetAchievementTrendByMonthLine(this.custId, this.projIds, this.DateSelection.startDate, this.DateSelection.endDate).subscribe(
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
