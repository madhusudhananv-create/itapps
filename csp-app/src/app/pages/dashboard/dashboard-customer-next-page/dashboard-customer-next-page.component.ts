import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DashboardDetailsModel } from '../../../models/dashboard-details-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { ProjectModelNew } from '../../../models/portfolio-model';
import { PortfolioProjectSelectorComponent } from '../.././../controls/portfolio-project-selector/portfolio-project-selector.component';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-dashboard-customer-next-page',
  templateUrl: './dashboard-customer-next-page.component.html',
  styleUrls: ['./dashboard-customer-next-page.component.scss'],
  providers: [PortfolioProjectSelectorComponent]
})
export class DashboardCustomerNextPageComponent implements OnInit {
  @Input('customerId') customerId: string;
  @Input('month') month: string;
  @Input('year') year: any;

  @Input('projectArray') projArray: any[] = [];
  isFindingsByTimeEmpty: boolean = false;
  isFindingsByTypeEmpty: boolean = false;
  findingdatatype = [];
  dashboardDetails: DashboardDetailsModel[] = [];
  portfolioprojectMap: ProjectModelNew[] = [];
  isAuditStatusEmpty: boolean = false;
  isFindingsByStageEmpty: boolean = false;
  planned: number = 0;
  inProgress: number = 0;
  cancelled: number = 0;
  completed: number = 0;
  constructor(public _dashboardUtil: DashboardService, private route: ActivatedRoute, private _router: Router, private _appservice: AppsService, public _util: myUtility
  ) { }


  ngOnInit() {
    
    if (this._util.IsPremier(this.customerId) && this.projArray.length == 0) {
    
      this.service_getProjectPortfolioMapping();
      this.service_GetDashboardDetails();
    }
  }

  ngOnChanges() {
    if (this._util.IsPremier(this.customerId) && this.projArray.length == 0) {
      this.service_getProjectPortfolioMapping();
      this.service_GetDashboardDetails();
    }
    else {
      this.service_GetDashboardDetails();
    }
    

  }
  getSelectedProjectsList(event) {
    

    this.projArray = event;
  }

  stagesDict = {
    'STAGE_FINDING_AUDITEE_ACCEPTANCE AND CAP SUBMISSION': "Submitted",
    'STAGE_FINDING_CAP REVIEW': 'Review',
    'STAGE_FINDING_IMPLEMENT CAP': 'Implementation',
    'STAGE_FINDING_APPROVE CAP BY CUSTOMER': 'Verification'
  }

  // QA Findings by age


  typefindingBytime = 'ColumnChart';
  findingdatatime: any[] = [];

  columfindingtime;
  widthfindingtime = 500; // 140
  heightfindingtime = 190;
  optionfindingtime: google.visualization.ColumnChartOptions = {
    colors: ['#07A445', '#FFA500', '#0000FF', '#ff0000', '#F67280', '#00D7CD', '#D79300', '#4B5320'],
    chartArea: { 'width': '100%', 'height': '100%', bottom: 40, top: 8, left: 50, right: 150 },
    legend: {
      position: 'right', alignment: 'center', maxLines: 2
    },
    tooltip: { isHtml: true },
    isStacked: true,
    vAxis: {
      minValue: 0, format: '0', title: "count", textStyle: {
        fontSize: 12
      }
    },
    hAxis: {
      title: "days", textStyle: {
        fontSize: 8
      }
    },

  };
  // QA Assessment Summary

  typefindingBytype = 'PieChart';
  findingdata: any[] = [];
  columfinding = ['Status', 'Value'];
  widthfinding = 500;
  heightfinding = 180;
  optionfinding: google.visualization.PieChartOptions = {
    colors: ['#07A445', '#FFA500', '#0000FF', '#ff0000', '#F67280', '#00D7CD', '#D79300', '#4B5320'],
    //colors: ['green', 'orange', 'blue', 'red'],
    sliceVisibilityThreshold: 0,

    chartArea: { 'width': '100%', 'height': '80%', 'left': 0 },

    legend: {
      position: 'right', alignment: 'center'
    },
    tooltip: { isHtml: true },
    //pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 10 },
  };

  // Assessment Status
  typeaudit = 'PieChart';
  auditdata: any[] = [
    ["Planned", 0],
    ["In Progress", 0],
    ["Completed", 0],
    ["Cancelled", 0],
  ];
  columaudit = ['Status', 'Value'];
  widthaudit = 500;
  heightaudit = 180;
  optionaudit: google.visualization.PieChartOptions = {
    //colors: ['#54b8e8', '#ff6f00', '#3ab376', 'red'],
    chartArea: { 'width': '100%', 'height': '80%' },
    legend: {
      position: 'right', alignment: 'center'
    },
    tooltip: { trigger: 'selection' },
    //pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 10 },
  };

  // QA findings by stage

  typefindingBystage = 'PieChart';
  findingdatastage: any[] = [];
  columfindingstage = ['Status', 'Value'];
  widthfindingstage = 500;
  heightfindingstage = 180;
  optionfindingstage: google.visualization.PieChartOptions = {
    colors: ['rgb(16, 150, 24)', 'rgb(51, 102, 204)', 'rgb(255, 153, 0)', 'rgb(220, 57, 18)'],
    chartArea: { 'width': '100%', 'height': '80%', 'left': 0, right: 0 },

    legend: {
      position: 'right', alignment: 'center'
    },
    tooltip: { trigger: 'selection' },
    //pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 10 },
  };

  GetAssessmentFindingsByTime(custId: string, projArray: any[]) {


    let assessmentFindingData = [];

    this._appservice.getAssessmentFindingsByTime(custId, projArray).subscribe(data => {
      this.findingdatatime = data.values;
      this.columfindingtime = data.columnnames;


      if (this.findingdatatime.length > 0)

        this.isFindingsByTimeEmpty = false;
      else
        this.isFindingsByTimeEmpty = true;

    }, error => { this._util.serviceError(error); },

    );
  }

  fillQAFindingsSummary1() {
    let findingsTitle = [];
    let result = []
    this.projArray.forEach(x => {
      findingsTitle = this.getTitlesByString('FINDING_', x);
      result = result.concat(findingsTitle);
    });

    result = result.filter((x, i, a) => a.indexOf(x) === i);
    var valuesArray = [0];

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projArray.length; j++) {
        if (isNaN(valuesArray[i]))
          valuesArray[i] = 0;

        valuesArray[i] += this.getGraphValue_project(result[i], this.projArray[j]);
      }
    }



    this.findingdata = [];
    var title = "";
    for (let i = 0; i < result.length; i++) {
      title = result[i].substr(8);
      title = title.charAt(0) + title.substr(1).toLowerCase();
      this.findingdata.push([title, valuesArray[i]]);
    }
    
    this.getChartVal();
    var total = valuesArray.reduce((x, y) => { return x + y });
    if (total == 0)
      this.isFindingsByTypeEmpty = true;
    else
      this.isFindingsByTypeEmpty = false;
  }

  getChartVal() {
    let typerArr = [["Strength", 0], ["Weakness", 0], ["Opportunity", 0], ["Threat", 0],
    ["Major", 0], ["Minor", 0], ["Opportunities for Improvement", 0], ["Recommendations", 0]];
    this.findingdatatype = typerArr;

    typerArr.forEach((x, i) => {
      this.findingdata.forEach((y) => {
        if (x[0] === y[0]) {
          this.findingdatatype[i][1] = y[1];
        }
      });
    });
    
  }

  getTitlesByString(string, projid) {
    var list = [];
    if (this.dashboardDetails != undefined) {
      list = this.dashboardDetails.filter((entry) => entry.title.startsWith(string) && entry.proJ_ID == projid).filter((x, i, a) => a.indexOf(x) == i).map(x => x.title);
    }

    return list;
  }

  getGraphValue_project(title, projid) {
    let iValue = 0;
    let sValue = this.getTitleByProject(title, projid);
    if (sValue != undefined && sValue != "-") {
      sValue = sValue.replace(/\D/g, "");
      iValue = Number(sValue);
    }
    else
      iValue = 0;
    return iValue;
  }

  getTitleByProject(title, projid) {
    let content: string = '-';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == projid);
      if (details.length > 0) {
        content = details[0].content;
      }
    }

    return content;
  }

  service_GetDashboardDetails() {

    this._appservice.GetDashboardDetailsbyCustomerId(this.customerId).subscribe(data => {
      this.dashboardDetails = data;
    }, error => {
      this._util.serviceError(error);
    }, () => {
      this.fillQAAuditStatus1();

      this.fillQAFindingsSummary1();

      this.fillQAFindingsByStage1();

      this.GetAssessmentFindingsByTime(this.customerId, this.projArray);

    });
  }

  setValue() {
    localStorage.setItem('isFromFindingByAge', "true");
  }



  service_getProjectPortfolioMapping() {
    this._appservice.getProjectPortfolioMapping(this.customerId, this._util.ShouldLoadAllProjects()).subscribe(
      data => {
        this.portfolioprojectMap = data;
        this.projArray = this.portfolioprojectMap.map(x => x.proj_id);
      },
      error => { },
      () => {
      }
    )
  }

  fillQAAuditStatus1() {
    this._appservice.GetAssessmentDetails(this.customerId, this._util.getMonthNum(this.month), this.year).subscribe(data => {
      this.planned = data['audiT_PLANNED'];
      this.inProgress = data['audiT_IN_PROGRESS'];
      this.completed = data['audiT_COMPLETED'];
      this.cancelled = data['audiT_CANCELLED'];


      if ((this.planned + this.inProgress + this.completed + this.cancelled) == 0) {
        this.isAuditStatusEmpty = true;
      }
      else {
        this.isAuditStatusEmpty = false;
        this.auditdata=[];
        this.auditdata.push(["Planned", this.planned]);
        this.auditdata.push(["In Progress", this.inProgress]);
        this.auditdata.push(["Completed", this.completed]);
        this.auditdata.push(["Cancelled", this.cancelled]);
      }


    }), error => {
      this._util.serviceError(error);
    }
    // let planned = 0;
    // let inprogress = 0;
    // let completed = 0;
    // let cancelled = 0;

    // this.projArray.forEach(x => {
    //   planned = planned + this.getGraphValue_project('AUDIT_PLANNED', x);
    //   inprogress = inprogress + this.getGraphValue_project('AUDIT_IN PROGRESS', x);
    //   completed = completed + this.getGraphValue_project('AUDIT_COMPLETED', x);
    //   cancelled = cancelled + this.getGraphValue_project('AUDIT_CANCELLED', x);
    // });

    // if (planned + inprogress + completed + cancelled == 0) {
    //   this.isAuditStatusEmpty = true;
    // }
    // else {
    //   this.isAuditStatusEmpty = false;
    //   this.auditdata = [];
    //   this.auditdata.push(["Planned", planned]);
    //   this.auditdata.push(["In Progress", inprogress]);
    //   this.auditdata.push(["Completed", completed]);
    //   this.auditdata.push(["Cancelled", cancelled]);
    // }
  }

  fillQAFindingsByStage1() {
    let findingsTitle = [];
    // let result = ["STAGE_FINDING_AUDITEE_ACCEPTANCE AND CAP SUBMISSION", "STAGE_FINDING_CAP REVIEW", "STAGE_FINDING_IMPLEMENT CAP", "STAGE_FINDING_VERIFY CAP IMPLEMENTATION"];
    let result = [];
    this.projArray.forEach(x => {
      findingsTitle = this.getTitlesByString('STAGE_FINDING_', x);
      result = result.concat(findingsTitle);
    });

    result = result.filter((x, i, a) => a.indexOf(x) === i);

    let valuesArray = [0];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projArray.length; j++) {
        if (isNaN(valuesArray[i]))
          valuesArray[i] = 0;

        valuesArray[i] += this.getGraphValue_project(result[i], this.projArray[j]);
      }
    }

    var total = valuesArray.reduce((x, y) => {
      return x + y
    });
    if (total == 0)
      this.isFindingsByStageEmpty = true;
    else
      this.isFindingsByStageEmpty = false;

    this.findingdatastage = [];
    var title = "";
    for (let i = 0; i < result.length; i++) {
      // title = result[i].substr(13);
      // title = title.charAt(0) + title.substr(1).toLowerCase();
      title = this.stagesDict[result[i]];
      this.findingdatastage.push([title, valuesArray[i]]);
    }
  }
}
