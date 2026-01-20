import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { LayoutService } from '../layout.service';
import { SurveyComponent } from '../../../customer/survey/survey.component';
import { ReportsSPParamsModel } from '../../../models/report-model';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DatePipe } from '@angular/common';
import { AccessControl } from '../../../Shared/accessControl';

@Component({
  selector: 'app-view-csat',
  templateUrl: './view-csat.component.html',
  styleUrls: ['./view-csat.component.scss']
})
export class ViewCsatComponent implements OnInit {
  sub: any;
  projNames: any[] = [];
  custNames: any[] = [];
  reportRec: any[] = [];
  input_projectid: string;
  input_customerid: string;
  input_userid: string;
  input_respondedid: number;
  ddyear: number[];
  selectedQuarter: number; //= 1;
  //selectedYear: number;
  surveyGuid: any;
  surveyPram = new SurveyModel();
  guid: any;
  showSurveyGuid: boolean = false;
  showSurveyText: boolean = false;

  showPreconnect:boolean = false;
  showQualitativeFeedback: boolean = false;
  loading: boolean = false;
  month = [];
  showMonthly: boolean;
  isMonthly: boolean = false;
  tableMonth: number;
  disablebtn: boolean = false;
  showProjectDropdown: boolean = true;
  displayedColumns: string[];
  dataSource = new MatTableDataSource(this.reportRec)
  @ViewChild('TABLE') table: ElementRef;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginatorTable') paginator: MatPaginator;
  selectedSPName: string; errorStr: string = "";
  selectedqrt: string;
  fileName: string;
  constructor(private route: ActivatedRoute, public _layoutService: LayoutService, private _appService: AppsService,
    public _util: myUtility, public datepipe: DatePipe, public _access: AccessControl) {

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this.input_projectid = params['projid'];
      this._util.tableYear = params['year'] != undefined ? Number(params['year']) : this._util.tableYear;
      this.input_respondedid = params['respondedid'] != undefined ? Number(params['respondedid']) : 0;
      if (params['frequencytype'] == "Monthly") {
        this.showMonthly = true;
        this.tableMonth = Number(params['frequency']);
      }
      else {
        this.selectedQuarter = params['frequency'] != undefined ? Number(params['frequency']) : 0;
        this.showMonthly = false;
        this.tableMonth = 0;
      }

    });

    this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    this._layoutService.selectedCust = this.input_customerid
    this.getDBConfig();
  }

  onViewTypeChange() {
  if (!this.showProjectDropdown) {
    this.input_projectid = '';
  } else {
    if (this.projNames && this.projNames.length > 0) {
      this.input_projectid = this.projNames[0].proJ_ID;
    }
  }
  this.guid = [];
  this.showSurveyGuid = false;
  this.showSurveyText = false;
  this.surveyGuid = null;
  this.getAllCustomerUser(this.input_customerid, this.input_projectid, this.isMonthly);
}

  getDBConfig() {
    this._appService.GetDBConfigValue("MONTHLYCSS", -1, "").subscribe(data => {
      if (data.indexOf(this.input_customerid.toString()) >= 0) {
        this.showMonthly = true;
        this.surveyPram.iS_MONTHLY = true;
        this.getAllCustomerUser(this.input_customerid, '', this.surveyPram.iS_MONTHLY);
      }
      else {
        this.surveyPram.iS_MONTHLY = false;
        this.showMonthly = false;
      }
      this.getQuarterorMonth();
      this.getAllProjectsFromCustomer();
    }, (error) => { this._util.serviceError(error) },
      () => {
        this.getReportDetails(this.surveyPram.iS_MONTHLY);
        this.getRportSpName(this.surveyPram.iS_MONTHLY);
      })
  }

  getQuarterorMonth() {
    let m = new Date().getMonth() + 1;
    let y = new Date().getFullYear() - 1;
    if (m == 4 || m == 5 || m == 6) {
      this.selectedQuarter = 4;
      this._util.tableYear = y;
    }
    else if (m == 7 || m == 8 || m == 9)
      this.selectedQuarter = 1;
    else if (m == 10 || m == 11 || m == 12)
      this.selectedQuarter = 2;
    else if (m == 1 || m == 2 || m == 3)
      this.selectedQuarter = 3;
  }

  onYearChange() {
    this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    this.guid = [];
  }
  onMonthChange() {
    this.guid = [];
  }
  onQuarterChange() {
    this.guid = [];
  }
  onUserChange() {
    this.guid = [];
  }

  getAllProjectsFromCustomer() {
    this._appService.GetCustomerProjectsName(this.input_customerid, false).subscribe(
      data => {
        this.projNames = data;

        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          if (!this.input_projectid)
             this.input_projectid = this.projNames[0].proJ_ID;  
          this.getAllCustomerUser(this.input_customerid, this.input_projectid, this.isMonthly);
        }
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getAllCustomerUser(customerId, projectId, isMonthly) {
    this.input_userid = this.input_respondedid == 0 ? "" : this.input_userid;
    this._layoutService.GetAllCustomerUser(customerId, projectId, isMonthly).subscribe(
      data => {
        this.custNames = data;
        if (this.input_respondedid == 0) {
          this.input_userid = "";
          this.disablebtn = false;
          if (this.custNames.length > 0)
            this.input_userid = this.custNames[0].emailid;
          else
            this.disablebtn = true;
        }
        else {
          if (this.custNames.length > 0)
            this.input_userid = this.custNames.filter(x => x.id == this.input_respondedid)[0].emailid;
        }
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  bindData() {
    this.disablebtn = true;
    this.showQualitativeFeedback = false;
    this.surveyPram.cusT_ID = this.input_customerid;
    this.surveyPram.proJ_ID = this.input_projectid;
    this.surveyPram.montH = this.tableMonth;
    this.surveyPram.quarteR = this.selectedQuarter;
    this.surveyPram.yeaR = this._util.tableYear;
    this.surveyPram.useR_EMAIL_ID = this.input_userid;
    this.surveyPram.iS_MONTHLY = this.showMonthly;
    this.surveyPram.iS_QUALITATIVE_FEEDBACK = this.showQualitativeFeedback;
    this.showSurveyGuid = false;
    this._layoutService.getSurveyGuid(this.surveyPram).subscribe(
      data => {
        this.loading = true;
        this.surveyGuid = data.guid;
        if(data.status =="Mail Sent" || data.status =="Mail Re-Sent"|| data.status =="Draft" )
        {
          if(data.spoc == this._util.empid )
          {

            this.showPreconnect = true;
          }
        }
        if (this.surveyGuid.guid != null) {
          this.loading = false;
          this.showSurveyText = false;
          this.showSurveyGuid = true;
          this.guid = this.surveyGuid;
        }
        else {
          this.loading = false;
          this.showSurveyGuid = false;
          this.showSurveyText = true;
        }
        this.disablebtn = false;
      },
      error => { this._util.serviceError(error) }
    )
  }

  get_CSATFeedbackForm(isQualitative) {
    if (confirm('Are you sure you want to give feedback? It will not be reverted once feedback has been given. When you complete entering the Customer feedback in this screen and click on Submit button, system will send the customer feedback details as an email to the chosen customer contact.')) {
      this.showQualitativeFeedback = isQualitative;
      this.surveyPram.iS_QUALITATIVE_FEEDBACK = true;

      this._layoutService.getSurveyGuid(this.surveyPram).subscribe(
        data => {
          this.loading = true;
          this.surveyGuid = data;
          if (this.surveyGuid.guid != null) {
            this.loading = false;
            this.showSurveyText = false;
            this.showSurveyGuid = true;
            this.guid = this.surveyGuid;
          }
          else {
            alert("Please send the customer success survey for the selected quarter. Once sent you can fill the survey on behlaf of the Customer.");
            this.loading = false;
            this.showSurveyGuid = false;
            this.showSurveyText = true;
          }
          this.disablebtn = false;
        },
        error => { this._util.serviceError(error) }
      )
    }
    else {
      this.showSurveyGuid = false;
    }
  }

  onProjectChange() {
    this.guid = [];
    this.getAllCustomerUser(this.input_customerid, this.input_projectid, this.isMonthly);
  }

  reportParamData: ReportsSPParamsModel[] = [];
  paramData: any[] = [];
  startDate: Date; endDate: Date;

  getReportDetails(isMonthly) {
    this._layoutService.getReportdetails(isMonthly).subscribe(data => {
      this.paramData = data;
    }, error => { this._util.serviceError(error) })
  }

  getRportSpName(isMonthly) {
    this._layoutService.getRportSpName(isMonthly).subscribe(data => {
      this.selectedSPName = data;
    }, error => { this._util.serviceError(error) })
  }

  getTabledata() {
    this.reportParamData = [];
    this.reportRec = [];
    if (this.surveyPram.iS_MONTHLY) {
      this.startDate = new Date(this._util.tableYear, this.tableMonth - 1, 1);
      this.endDate = new Date(this._util.tableYear, this.tableMonth, 0);

      this.reportParamData.push({ id: this.paramData[0].id, reporT_SP_ID: this.paramData[0].reporT_SP_ID, paraM_NAME: this.paramData[0].paraM_NAME, paraM_TYPE: this.paramData[0].paraM_TYPE, paraM_VALUE: this.datepipe.transform(this.startDate, 'yyyy-MM-dd') })
      this.reportParamData.push({ id: this.paramData[1].id, reporT_SP_ID: this.paramData[1].reporT_SP_ID, paraM_NAME: this.paramData[1].paraM_NAME, paraM_TYPE: this.paramData[1].paraM_TYPE, paraM_VALUE: this.datepipe.transform(this.endDate, 'yyyy-MM-dd') })
    }

    else {
      if (this.selectedQuarter == 1) {
        this.startDate = new Date(this._util.tableYear + "-04-01");
        this.endDate = new Date(this._util.tableYear + "-06-30");
      }
      else if (this.selectedQuarter == 2) {
        this.startDate = new Date(this._util.tableYear + "-07-01");
        this.endDate = new Date(this._util.tableYear + "-09-30");
      }
      else if (this.selectedQuarter == 3) {
        this.startDate = new Date(this._util.tableYear + "-10-01");
        this.endDate = new Date(this._util.tableYear + "-12-31");
      }
      else {
        this.startDate = new Date((this._util.tableYear + 1) + "-01-01");
        this.endDate = new Date((this._util.tableYear + 1) + "-03-31");
      }
      this.reportParamData.push({ id: this.paramData[0].id, reporT_SP_ID: this.paramData[0].reporT_SP_ID, paraM_NAME: this.paramData[0].paraM_NAME, paraM_TYPE: this.paramData[0].paraM_TYPE, paraM_VALUE: this.datepipe.transform(this.startDate, 'yyyy-MM-dd') })
      this.reportParamData.push({ id: this.paramData[1].id, reporT_SP_ID: this.paramData[1].reporT_SP_ID, paraM_NAME: this.paramData[1].paraM_NAME, paraM_TYPE: this.paramData[1].paraM_TYPE, paraM_VALUE: this.datepipe.transform(this.endDate, 'yyyy-MM-dd') })

      this.selectedqrt = 'Q' + this.selectedQuarter;
    }

    this._appService.displaySpData(this.reportParamData, this.selectedSPName).subscribe(data => {
      if (this.surveyPram.iS_MONTHLY)
        this.custNames.forEach(ele => {
          let arr = data.filter(x => x.customer_ID == this.input_customerid && x.email_Id === ele.emailid)
          this.reportRec.push(...arr);
        })
      else {
        this.projNames.forEach(ele => {
          let arr = data.filter(x => x.project_ID === ele.proJ_ID);
          this.reportRec.push(...arr);
        })
      }
      if (this.reportRec.length > 0) {
        this.displayedColumns = Object.keys(this.reportRec[0]);
        this.updateTable();
      }
      else {
        alert("No Feedback Available For Selected Period");
        return;
      }

    }, error => { this._util.serviceError(error) },
      () => {
        if (this.reportRec.length > 0) {
          setTimeout(() => {
            this.ExportTOExcel()
          }, 6000);
        }
      })
  }

  ExportTOExcel() {
    let getdate = new Date();
    let fileName = `${'Report'}_${this.surveyPram.iS_MONTHLY ? this._util.getMonthAbr(this.tableMonth - 1) + this._util.tableYear : this.selectedqrt + `_` + this._util.tableYear}`;
    this._util.exportToExcel(this.table.nativeElement, fileName);
  }

  updateTable() {
    this.dataSource = new MatTableDataSource(this.reportRec);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
}

class SurveyModel {
  cusT_ID: string;
  useR_EMAIL_ID: string;
  proJ_ID: string;
  quarteR: number;
  yeaR: number;
  montH: number;
  iS_MONTHLY: boolean;
  iS_QUALITATIVE_FEEDBACK: boolean;
}