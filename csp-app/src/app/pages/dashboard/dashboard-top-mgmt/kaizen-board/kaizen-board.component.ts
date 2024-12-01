import { Component, OnInit, Input } from '@angular/core';
import { AppsService } from './../../../../Services/apps.service';
import { myUtility } from './../../../../Shared/myUtility';
import { filter } from 'rxjs/operators';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { InnovationModelExt } from '../../../../models/innovation-model';
import { IdeasPopupComponent } from './ideas-popup/ideas-popup.component';

@Component({
  selector: 'app-kaizen-board',
  templateUrl: './kaizen-board.component.html',
  styleUrls: ['./kaizen-board.component.scss']
})
export class KaizenBoardComponent implements OnInit {

  @Input() type1: any;
  @Input() data1: (string | number)[][];
  @Input() columnNames1: any;
  @Input() options1: any;
  @Input() width1: any;
  @Input() height1: any;
  dashboardDetails : any[] = [];
  ideasData : InnovationModelExt[] = []
  CustomerIds : string[] = [];
  ideasCount : number = 0;
  automationCount : number = 0;
  innovationCount : number = 0;
  improvementsCount : number = 0;
  hoursSaved : number = 0;
  effortSaved : number = 0;
  hoursSaved1: string;
  effortSaved1: string;

  constructor(private _appService : AppsService, private _util : myUtility, public dialog: MatDialog) { }

  ngOnInit() {
    this.getdashboardIdeasValues();
    this.getAllIdeasDetails();
  }

  getdashboardIdeasValues()
  { 
    this._appService.GetAllCustomerLevelIdeasDetails().subscribe(
      data => {
        this.dashboardDetails = data;
//console.log(this.dashboardDetails);
        this._util.determineCustIdsBasedOnRole().subscribe(
          data => {
            this.CustomerIds = data;
//console.log(this.CustomerIds);
          },
          (error) => {},
          () => {
            this.populateChartValues();
          }
        )
      },
      (error) => {}
    )
  }

  getAllIdeasDetails()
  {
    this._appService.getIdeasDetailsByUser().subscribe(
      data => {
        this.ideasData = data;
        console.log(this.ideasData);
      },
      (error) => {}
    )
  }

  populateChartValues()
  {
    let Completed = 0
    let Inprogress = 0
    let filteredValue1: number = 0
    let filteredValue2: number = 0;
    let filteredValue3: number = 0;
    let filteredValue4: number = 0;
    let filteredValue5: number = 0;
    let filteredValue6: number = 0;
    let filteredValue7: string 
    let filteredValue8: string 

    this.CustomerIds.forEach(x => {
      // Ideas Completed

      filteredValue1 =  +this.dashboardDetails.filter(y => (y.title == "IDEAS_COMPLETED") && (y.cusT_ID == x)).map(z => z.content)[0]
      if(!Number.isNaN(filteredValue1))
        Completed = Completed + filteredValue1;
      
      // Ideas In progress

      filteredValue2 = +this.dashboardDetails.filter(y => (y.title == "IDEAS_INPROGRESS") && (y.cusT_ID == x)).map(z => z.content)[0]
      if(!Number.isNaN(filteredValue2))
        Inprogress = Inprogress + filteredValue2;

      // Total Ideas

      filteredValue3 = +this.dashboardDetails.filter(y => (y.title == "IDEAS") && (y.cusT_ID == x)).map(z => z.content)[0]
      if(!Number.isNaN(filteredValue3))
        this.ideasCount = this.ideasCount + filteredValue3;

      // Total automations

      filteredValue4 = +this.dashboardDetails.filter(y => (y.title == "IDEAS_AUTOMATIONS") && (y.cusT_ID == x)).map(z => z.content)[0]
      if(!Number.isNaN(filteredValue4))
        this.automationCount = this.automationCount + filteredValue4;

      // Total innovations
      
      filteredValue5 = +this.dashboardDetails.filter(y => (y.title == "IDEAS_INNOVATIONS") && (y.cusT_ID == x)).map(z => z.content)[0]
      if(!Number.isNaN(filteredValue5))
        this.innovationCount = this.innovationCount + filteredValue5;

      // Total improvements

      filteredValue6 = +this.dashboardDetails.filter(y => (y.title == "IDEAS_IMPROVEMENTS") && (y.cusT_ID == x)).map(z => z.content)[0]
      if(!Number.isNaN(filteredValue6))
        this.improvementsCount = this.improvementsCount + filteredValue6;

      // Total hours saved

      filteredValue7 = this.dashboardDetails.filter(y => (y.title == "IDEAS_HOURS") && (y.cusT_ID == x)).map(z => z.content)[0]

      if(filteredValue7 != undefined)
      {
        filteredValue7 = filteredValue7.replace(/\D/g, "");
        if(!Number.isNaN(+filteredValue7))
          this.hoursSaved = this.hoursSaved + +filteredValue7;
      }
        
      // Total savings

      filteredValue8 = this.dashboardDetails.filter(y => (y.title == "IDEAS_DOLLARS") && (y.cusT_ID == x)).map(z => z.content)[0]
      if(filteredValue8 != undefined)
      {
        filteredValue8 = filteredValue8.replace(/\D/g, "");
        if(!Number.isNaN(+filteredValue8))
          this.effortSaved = this.effortSaved + +filteredValue8;
      }
     
    });

    this.hoursSaved1 = this.hoursSaved.toString() + " hrs";
    this.effortSaved1 = this.effortSaved.toString() + " k";


    this.data1 = [];
    this.data1.push([
      "Completed",
      Completed,
      Completed,
      '#3ab376'
      ]);
      this.data1.push([
      "In Progress",
      Inprogress,
      Inprogress,
      '#ff6f00'
      ]);
  }

  openIdeasDetails()
  {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'ideas': this.ideasData
    },
      dialogConfig.maxWidth = "100%";
      dialogConfig.height = "100%";
      dialogConfig.width = "100%";
      this.dialog.open(IdeasPopupComponent, dialogConfig);
  }
}
