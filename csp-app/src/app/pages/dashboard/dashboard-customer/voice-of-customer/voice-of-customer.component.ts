import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { myUtility } from './../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { IssueModelExt } from '../../../../models/issue-model';
import { startWith } from 'rxjs/operators';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { VocpopupComponent } from './vocpopup/vocpopup.component';

@Component({
  selector: 'app-voice-of-customer',
  templateUrl: './voice-of-customer.component.html',
  styleUrls: ['./voice-of-customer.component.scss']
})
export class VoiceOfCustomerComponent implements OnInit {

  // Chart Specifications

  @Input() type;
  @Input() data;
  @Input() columnNames;
  @Input() options;
  @Input() width;
  @Input() height;
 

 // data for chart

 MonCount : number = 0;
 TueCount : number = 0;
 WedCount : number = 0;
 ThurCount: number = 0;
 FriCount : number = 0;
 SatCount : number = 0;
 SunCount : number = 0;

 MonLabel : string = "Mon";
 TueLabel : string ="Tue";
 WebLabel : string = "Wed";
 ThurLabel : string = "Thur";
 FriLabel : string = "Fri";
 SatLabel : string = "Sat"
 SunLabel : string = "Sun";

 CustomerIds : string[];
 date1 : string;
 date2 : string;

 OpenEscalations : IssueModelExt[] = [];

 StartDate : Date = new Date();
 EndDate : Date = new Date();
 showFilterWindow : boolean;
 @ViewChild('statusSelect') statusSelect : HTMLSelectElement
 selectedOption : string = "Open";
 tempdata : number;

  constructor(private _myUtil : myUtility, private _appservice : AppsService, public dialog: MatDialog) 
  { }

  ngOnInit() 
  {
    
    this.EndDate = new Date();
    this.tempdata = (this.EndDate.getTime() - (1000*60*60*24*6));
    this.StartDate.setTime(this.tempdata);
    this.date1 = this.getFormattedDate(this.StartDate);
    this.date2 = this.getFormattedDate(this.EndDate);
    this._myUtil.determineCustIdsBasedOnRole().subscribe(
      data => {
        this.CustomerIds = data;
//console.log(this.CustomerIds);
      },
      (error) => {},
      () => {
        this.getOpenEscalationsForWeekByCustomer(this.CustomerIds, this.StartDate, this.EndDate, this.selectedOption);
      }
    )    
  }

  showEscalationdetails()
  {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'issues': this.OpenEscalations
    },
      dialogConfig.width = "100%"
      dialogConfig.height = "100%"
      dialogConfig.maxWidth = "100%"
     this.dialog.open(VocpopupComponent, dialogConfig);
  }

  Applyfilter()
  {
    this.tempdata = this.EndDate.getTime() - (1000*60*60*24*6);
    this.StartDate.setTime(this.tempdata);
    this.date1 = this.getFormattedDate(this.StartDate);
    this.date2 = this.getFormattedDate(this.EndDate);
    this.getOpenEscalationsForWeekByCustomer(this.CustomerIds, this.StartDate, this.EndDate, this.selectedOption);
    this.showFilterWindow = false;
  }

  getOpenEscalationsForWeekByCustomer(CustIds : string[], date1: Date, date2 : Date, status : string)
  {
    this._appservice.getOpenEscalationsForWeekByCustomer(CustIds , date1, date2, status).subscribe(
      data => {
        this.OpenEscalations = data;
        this.generatedaaforGraph(this.OpenEscalations);
        this.mapDatetoDay();
        this.fillAreaGraph();
      }
    )
  }

  mapDatetoDay()
  {
    let newDate : Date;
    this.initializeLabelVariables();
    for(let i = 0; i < 7; i++)
    {
      newDate = this.addDays(this.StartDate, i);

      if(newDate.getDay() == 0)
        this.SunLabel = this.SunLabel + "(" + newDate.getDate().toString() + ")";
      else if(newDate.getDay() == 1)
        this.MonLabel = this.MonLabel + "(" + newDate.getDate().toString() + ")";
      else if(newDate.getDay() == 2)
        this.TueLabel = this.TueLabel + "(" + newDate.getDate().toString() + ")";
      else if(newDate.getDay() == 3)
        this.WebLabel = this.WebLabel + "(" + newDate.getDate().toString() + ")";
      else if(newDate.getDay() == 4)
        this.ThurLabel = this.ThurLabel + "(" + newDate.getDate().toString() + ")";
      else if(newDate.getDay() == 5)
        this.FriLabel = this.FriLabel + "(" + newDate.getDate().toString() + ")";
      else if(newDate.getDay() == 6)
        this.SatLabel = this.SatLabel + "(" + newDate.getDate().toString() + ")";
    }
  }

   addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
  }

   getFormattedDate(date : Date) 
   {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return month + '/' + day + '/' + year;
  }

  initializeLabelVariables()
  {
    this.MonLabel  = "Mon";
    this.TueLabel ="Tue";
    this.WebLabel = "Wed";
    this.ThurLabel  = "Thur";
    this.FriLabel = "Fri";
    this.SatLabel  = "Sat"
    this.SunLabel  = "Sun";
  }

  initializeCountVariables()
  {
    this.MonCount =0;
    this.SunCount = 0;
    this.TueCount = 0;
    this.WedCount = 0;
    this.ThurCount = 0;
    this.FriCount = 0;
    this.SatCount = 0;
  }

  generatedaaforGraph(issuesArray: IssueModelExt[])
  {
    this.initializeCountVariables();
     issuesArray.forEach(x => {

      let identifydate = new Date(x.identifieD_DATE);

      if(identifydate.getDay() == 0)
        this.SunCount++;
      else if(identifydate.getDay() == 1)
        this.MonCount ++; 
      else if(identifydate.getDay() == 2)
        this.TueCount ++;
      else if(identifydate.getDay() == 3)
        this.WedCount ++;
      else if(identifydate.getDay() == 4)
        this.ThurCount ++;
      else if(identifydate.getDay() == 5)
        this.FriCount++;
      else if(identifydate.getDay() == 6)
        this.SatCount++;
    })
  }

  fillAreaGraph()
  {
    this.data = [];
    this.data.push([this.MonLabel, this.MonCount]);
    this.data.push([this.TueLabel, this.TueCount]);
    this.data.push([this.WebLabel, this.WedCount]);
    this.data.push([this.ThurLabel, this.ThurCount]);
    this.data.push([this.FriLabel, this.FriCount]);
    this.data.push([this.SatLabel, this.SatCount]);
    this.data.push([this.SunLabel, this.SunCount]);
  }
}
