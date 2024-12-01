import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { myUtility } from '../../Shared/myUtility';
import { environment } from '../../../environments/environment';
import { DashboardSearchParams, NameValuePair } from '../../models/coo-dashboard-model';
import { Chart } from 'angular-highcharts';
import { riskDashboardInputsModel } from '../../controls/risk-chart/risk-chart.component';
import { CssdashboardInputs } from '../../models/cssdashboard-inputs';
@Injectable({
  providedIn: 'root'
})
export class COODashboardCommon {

  date = new Date();
  public dashboardStartdate: Date;
  public dashboardEnddate: Date;
  public custIds: string[] = ["-1"];
  public projectIds: string[] = ["-1"];
  public earlyWarningSignalCount: any = 0;
  public overallHealthIndex: any = 0;
  public customerSuccessGoalScore: any = -1;
  public accountOverallHealth: any;
  public performDataAccounts: NameValuePair[];
  public performDataPortfolios: NameValuePair[];
  public performDataProjects: NameValuePair[];
  public nonPerformDataAccounts: NameValuePair[];
  public nonPerformDataPortfolios: NameValuePair[];
  public nonPerformDataProjects: NameValuePair[];
  public loadDonutIp: string = 'UC';
  public progress: boolean = true;
  public progressPopup: boolean = true;
  public top3Accounts: NameValuePair[];
  public top3Portfolios: NameValuePair[];
  public top3Projects: NameValuePair[];
  top3AccountsCsg: NameValuePair[];
  public LastQtrScore: number = 0;
  public YTMScore: number = 0;
  public csgLastQtrChangeText: string = "0% decrease";
  public kpiLastQtrChangeText: string = "0% decrease";
  public LastQtrScorePopUp: number = 0;
  public YTMScorePopUp: number = 0;
  public csgLastQtrChangePopUpText: string = "0% decrease";
  public kpiLastQtrChangePopUpText: string = "0% decrease";
  selectedQPeriodCsg: string;
  selectedQPeriodCss: string;
  selectedYearCss: number;
  selectedYearCsg: number;
  qStartYear: number;
  qEndYear: number;
  qStartMonth: any;
  qEndMonth: any;
  overAllData: any;
  riskDashboardInputs: any;
  riskStatus: string[] = ["-1"];
  businessUnit: string[] = ["-1"];
  csmIds: string[] = ["-1"];
  public heatMapData: any;
  public frequency: string = "Monthly";
  public cssDashboardInputs: CssdashboardInputs;

  customerProjectsList: any[];
  userProjects: any[];
  top3PortfoliosCsg: NameValuePair[];
  top3ProjectsCsg: NameValuePair[];
  public nfucSummaryData: (number | [number, number] | [string, number] | Highcharts.DataPoint)[]
  public donutChart: Chart;
  public allcust: boolean = false;
  public allproj: boolean = false;
  public ViewId: number = 5;
  public showViewDashboard: boolean = false;
  public customerProjectsScores: any[];
  // dataNF: any[];
  // dataUC: any[];
  popupProjects = [];
  popupCusts = [];
  popupPortfolios = [];
  public areaChart: Chart;
  selectedCustomerID: string = "";
  selectedCustomerName: string = "";
  selectedprojIds: any[] = [];
  currentQuarter: number = 1;
  KPIPerspectives: any = []; showkpitrendbygoal: boolean = false;
  public achievementsByCustomerSuccessGoal: any = [];
  customerSuccessSurvey: any = [];
  public vwcustomerSuccessSurvey: any = [];
  top3CSSAccounts: any;
  top3CSSPortfolios: any;
  top3CSSProjects: any;
  goalDetails: any[];
  public issuesDataSource: any;
  public riskDataSource: any;
  customersList: any[];
  cssGoalDetails: any[];

  constructor(private _util: myUtility, private _http: HttpClient) {
  }

  GetViewType(): string {
    switch (this.ViewId) {
      case 1: return "Quarterly";
      case 3: return "Annual";
      case 4: return "Period";
      case 5: return "Monthly"
      default: return "Monthly";
    }
  }
  LoadParams() {
    let dataModel: DashboardSearchParams = new DashboardSearchParams();
    dataModel.CUST_ID = ["-1"];
    dataModel.START_DATE = this._util.setLocaleDate(this.dashboardStartdate); //new Date(date.getFullYear(), date.getMonth() - 6, 1);
    dataModel.END_DATE = this._util.setLocaleDate(this.dashboardEnddate);// new Date(date.getFullYear(), date.getMonth(), 0);
    dataModel.PROJ_IDS = this.projectIds == null ? ["-1"] : this.projectIds;
    dataModel.ALL_PROJECTS = this.allproj;
    return dataModel;
  }
  GetPeriodText(period, year) {
    let d = this.GetperiodDates(period, year);
    return period + " " + year + ": " + d.qStartMonth + " " + (d.qStartYear % 100) + " to " + d.qEndMonth + " " + (d.qEndYear % 100);
  }

  GetperiodDates(period, year) {
    let dates = this._util.getDatesForQuarter(period, year)
    let qStartDate = this._util.setLocaleDate(dates.startDate);
    let qEndDate = this._util.setLocaleDate(dates.endDate);
    return {
      qStartYear: qStartDate.getFullYear(),
      qEndYear: qEndDate.getFullYear(),
      qStartMonth: this._util.getMonthAbr(qStartDate.getMonth()),
      qEndMonth: this._util.getMonthAbr(qEndDate.getMonth()),
    }
  }

  groupData(ip): NameValuePair[] {
    if (ip.length > 0) {
      ip = ip.sort((n1, n2) => (n1.Name > n2.Name ? -1 : 1));//.slice(0, 3);
      let i = 0, temp = 0, prev = "";
      let op = [];
      ip.forEach(function (value) {
        if (value.Name != undefined && value.Name != null) {
          if (prev != value.Name) {
            if (prev != "") {
              op.push(new NameValuePair(prev, Math.round(temp / i)));
              i = 0; temp = 0;
            }
          }
          temp += value.value;
          i++;
          prev = value.Name;
        }
      });
      if (prev != "")
        op.push(new NameValuePair(prev, Math.round(temp / i)));
      return op;
    }
    else return ip;
    // return ip.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
  }

  sortData(ip, isDesc = false): NameValuePair[] {
    if (isDesc)
      return ip.sort((n1, n2) => { return n2.value - n1.value; });//.slice(0, 3);
    else
      return ip.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
  }

  getChangeInScore(curQtr, lstQtr): string {
    let changeStr = "";
    if (curQtr == lstQtr) {
      changeStr = 0 + "% increase";
    }
    else if (curQtr > lstQtr) {
      if (lstQtr == 0)
        changeStr = 100 + "% increase";
      else
        changeStr = Math.floor(((curQtr - lstQtr) / lstQtr) * 100) + "% increase";
    }
    else {
      if (curQtr <= 0)
        changeStr = 0 + "% decrease";
      else
        changeStr = Math.floor(((lstQtr - curQtr) / curQtr) * 100) + "% decrease";
    }
    return changeStr;
  }


  getDashboardSearchParams(projectIds, startDate, endDate): DashboardSearchParams {
    let data: DashboardSearchParams = new DashboardSearchParams();
    data.START_DATE = startDate; //new Date(date.getFullYear(), date.getMonth() - 6, 1);
    data.END_DATE = endDate;// new Date(date.getFullYear(), date.getMonth(), 0);
    //if project ids.count =1 and it contains -1 only, then pass this.projectids else pass projectids params
    if (projectIds != undefined && projectIds != null && projectIds.length == 1 && projectIds.includes("-1") && this.projectIds != undefined && this.projectIds != null) {
      data.PROJ_IDS = this.projectIds;
    }
    else {
      data.PROJ_IDS = projectIds;
    }
    return data;
  }
  LoadRiskDashboard(riskStatus?: any, businessUnit?: any) {
    this._util.riskSubject.subscribe((res) => {
      this.overAllData = res;
      //this._coodashboardService.progress = false;
    });
    this.CallRiskData(riskStatus, businessUnit);
  }

  getUniqueCustomer(): any {
    let data = this.customerProjectsList;
    return this.getUniqueCustIdNameFromList(data, "cusT_ID", "cusT_NM");
  }
  getUniqueProject(custId) {
    let data = this.customerProjectsList.filter(x => custId.includes(x.cusT_ID));
    let projectsList = this.getUniqueProjIdNameFromList(data, "proJ_ID", "proJ_NM").sort((n1, n2) => { return n1.proJ_NM.toLowerCase() > n2.proJ_NM.toLowerCase() ? 1 : -1 });
    let projects = localStorage.getItem('projIds');
    const selectedIds = projectsList.map(x => x.proJ_ID);
    //this.projectIds = selectedIds;
    if (projects == null || projects == undefined) {
      localStorage.setItem('projIds', JSON.stringify(selectedIds));
    }
    return projectsList;
  }

  getUniqueItemsFromList(data, column) {
    var uniqueItems = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i][column] != null && data[i][column].trim() != "" && uniqueItems.indexOf(data[i][column]) === -1) {
        uniqueItems.push(data[i][column]);
      }
    }
    return uniqueItems;
  }

  getUniqueIdNameFromList(data, idColumn, nameColumn) {
    var uniqueItems = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i][nameColumn] != null && data[i][nameColumn].trim() != "" && uniqueItems.indexOf(data[i][nameColumn]) === -1) {
        uniqueItems.push(new NameValuePair(data[i][idColumn], data[i][nameColumn]));
      }
    }
    return uniqueItems;
  }
  getUniqueCustIdNameFromList(data, idColumn, nameColumn) {
    var uniqueItems = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i][nameColumn] != null && data[i][nameColumn].trim() != "" && uniqueItems.indexOf(data[i][nameColumn]) === -1) {
        if (data[i][nameColumn].toLowerCase() != "all")
          uniqueItems.push({ "cusT_ID": data[i][idColumn], "cusT_NM": data[i][nameColumn] });
      }
    }
    return uniqueItems;
  }
  getUniqueProjIdNameFromList(data, idColumn, nameColumn) {
    var uniqueItems = [];

    data.forEach(item => {
      item.projects.forEach(project => {
        const projectName = project[nameColumn]?project[nameColumn].trim():'';
        if (projectName && projectName.toLowerCase() !== "all" && !uniqueItems.some(item => item.proJ_NM === projectName)) {
          uniqueItems.push({ "proJ_ID": project[idColumn], "proJ_NM": projectName });
        }
      });
    });
  
    return uniqueItems;


  }
  CallRiskData(riskStatus: any, businessUnit?: any) {
    this.riskDashboardInputs = new riskDashboardInputsModel();
    this.riskDashboardInputs.customeR_IDS = "-1";
    this.riskDashboardInputs.StarT_DATE = this._util.setLocaleDate(this.dashboardStartdate);
    this.riskDashboardInputs.enD_DATE = this._util.setLocaleDate(this.dashboardEnddate);
    this.riskDashboardInputs.projecT_IDS = "-1";
    this.riskDashboardInputs.risK_STATUS = "-1";
    this.riskDashboardInputs.businesS_UNITS = "-1";

    if (this.custIds.length > 0 && this.custIds != undefined)
      this.riskDashboardInputs.customeR_IDS = this.custIds.join(',');
    if (this.projectIds.length > 0 && this.projectIds != undefined)
      this.riskDashboardInputs.projecT_IDS = this.projectIds.join(',');
    if (riskStatus != null && riskStatus != undefined)
      this.riskDashboardInputs.risK_STATUS = riskStatus.join(',');
    if (businessUnit != null && businessUnit != undefined)
      this.riskDashboardInputs.businesS_UNITS = businessUnit.join(',');

    if (this.riskDashboardInputs.customeR_IDS == "" || this.riskDashboardInputs.customeR_IDS == undefined || this.riskDashboardInputs.customeR_IDS == null) {
      alert("Please choose any customer");
      return;
    }
    if (this.riskDashboardInputs.risK_STATUS == "" || this.riskDashboardInputs.risK_STATUS == undefined || this.riskDashboardInputs.risK_STATUS == null) {
      alert("Please choose any risk status");
      return;
    }
    if (this.riskDashboardInputs.businesS_UNITS == "" || this.riskDashboardInputs.businesS_UNITS == undefined || this.riskDashboardInputs.businesS_UNITS == null) {
      alert("Please choose any business unit");
      return;
    }
    if (this.riskDashboardInputs.StarT_DATE > this.riskDashboardInputs.enD_DATE) {
      alert("Please select To date greater than From date");
      return;
    }
    this._util.GetRiskChart(this.riskDashboardInputs);
  }
  loadRiskDashboardInputs(riskStatus: any, businessUnit: any) {
    this.riskDashboardInputs = new riskDashboardInputsModel();
    this.riskDashboardInputs.customeR_IDS = "-1";
    this.riskDashboardInputs.StarT_DATE = this._util.setLocaleDate(this.dashboardStartdate);
    this.riskDashboardInputs.enD_DATE = this._util.setLocaleDate(this.dashboardEnddate);
    this.riskDashboardInputs.projecT_IDS = "-1";
    this.riskDashboardInputs.risK_STATUS = "-1";
    this.riskDashboardInputs.businesS_UNITS = "-1";

    if (this.custIds != undefined && this.custIds.length > 0  )
      this.riskDashboardInputs.customeR_IDS = this.custIds.join(',');
    if (this.projectIds != undefined && this.projectIds.length > 0 )
      this.riskDashboardInputs.projecT_IDS = this.projectIds.join(',');
    if (riskStatus != null && riskStatus != undefined)
      this.riskDashboardInputs.risK_STATUS = riskStatus.join(',');
    if (businessUnit != null && businessUnit != undefined)
      this.riskDashboardInputs.businesS_UNITS = businessUnit.join(',');

    if (this.riskDashboardInputs.customeR_IDS == "" || this.riskDashboardInputs.customeR_IDS == undefined || this.riskDashboardInputs.customeR_IDS == null) {
      alert("Please choose any customer");
      return;
    }
    if (this.riskDashboardInputs.risK_STATUS == "" || this.riskDashboardInputs.risK_STATUS == undefined || this.riskDashboardInputs.risK_STATUS == null) {
      alert("Please choose any risk status");
      return;
    }
    if (this.riskDashboardInputs.businesS_UNITS == "" || this.riskDashboardInputs.businesS_UNITS == undefined || this.riskDashboardInputs.businesS_UNITS == null) {
      alert("Please choose any business unit");
      return;
    }
    if (this.riskDashboardInputs.StarT_DATE > this.riskDashboardInputs.enD_DATE) {
      alert("Please select To date greater than From date");
      return;
    }
    return this.riskDashboardInputs;
  }
  checkAndReturnDate(date): Date {
    try {
      if (date._d != null)
        return date._d;
      else
        return date;
    }
    catch {
      return date;
    }
  }
  loadCSATInsightsInputs(csmIds: any) {
    this.cssDashboardInputs = new CssdashboardInputs();
    this.cssDashboardInputs.customeR_IDS = "-1";
    this.cssDashboardInputs.StarT_DATE = this.checkAndReturnDate(this.dashboardStartdate).toDateString();
    this.cssDashboardInputs.enD_DATE = this.checkAndReturnDate(this.dashboardEnddate).toDateString();
    this.cssDashboardInputs.projecT_IDS = "-1";

    if (this.custIds.length > 0 && this.custIds != undefined)
      this.cssDashboardInputs.customeR_IDS = this.custIds.join(',');
    if (this.projectIds.length > 0 && this.projectIds != undefined)
      this.cssDashboardInputs.projecT_IDS = this.projectIds.join(',');
    if (csmIds != null)
      this.cssDashboardInputs.csM_IDs = csmIds.join(",");
    else
      this.cssDashboardInputs.csM_IDs = "-1";
    return this.cssDashboardInputs;
  }
}
