import { Component, OnInit, Output, ViewChild, EventEmitter, Input, Pipe, PipeTransform } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { LayoutService } from '../../../layout/layout.service';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatOption, MatSelect } from '@angular/material';
import { ProjectModelNew } from '../../../../models/portfolio-model';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material';
import { MatIconModule } from '@angular/material';
import { MatInput } from '@angular/material/input';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { type } from 'os';
import { CustomerProjectsScores, DashboardSearchParams, NameValuePair, PortfolioScores, ProjectScores } from '../../../../models/coo-dashboard-model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { filter } from 'rxjs-compat/operator/filter';
import { debug } from 'console';
import { COODashboardCommon } from '../../coo-dashboard-common';
@Pipe({
  name: 'sanitizeHtml'
})
@Component({
  selector: 'app-account-health-viewdetails',
  templateUrl: './account-health-viewdetails.component.html',
  styleUrls: ['./account-health-viewdetails.component.scss']
})
export class AccountHealthViewdetailsComponent implements PipeTransform {
  progress: boolean;

  accountOverallHealth: any;
  private _dataModel: DashboardSearchParams = new DashboardSearchParams();
  loadDonutIp: string = 'NF';
  constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility, private _sanitizer: DomSanitizer) {

  }
  transform(value: any) {
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }
  testhtml = "";
  selectedProject: string = "All";
  selectedPortfoliovalue: string = "All";
  selectedprojvalue: string = "All";
  selectedViewVlaue: string = 'Quarterly';
  selectedQValue: string = 'Q1';
  @Input() isvisible = false;
  dashboard: boolean = false;
  dataSource: MatTableDataSource<{
    ews: string, account: string,
    status: string, projects: string, severity: string
  }>; dataSource1: any;
  selectedPeriod = 'asToday';
  selectedValue: string = 'Quarter';
  displayedColumns: string[] = ['proJ_NAME', 'SCORE', 'status', 'Action', 'View'];
  range1: any[] = [2022, 2023];
  startYear = new Date().getFullYear();
  selectedCust: string = "All";
  areaChart: Chart;
  openCoverages = false;
  indexSelectedCoverage = 1;
  showViewDashboard: boolean = false;
  ipSearch = "";
  onClose() {
    this.Reset();
    this.isvisible = !this.isvisible;
  }
  ngOnInit(): void {
    // this.LoadParams();
    // this.getAccountOverallHealth(); 
  }
  getStatus(score): SafeHtml {
    let ophtml = "";
    if (score >= 90) {
      ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;" src="../../../../../assets/images/up-arrow.png" /> Above Target`;
    }
    else if (score >= 80) {
      ophtml = `<img class="targetImg" style="height: 14px;margin-right: 5px;" src="../../../../../assets/images/target.png" /> On Target`;
    }
    else
      ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;"  src="../../../../../assets/images/down-arrow.png" /> Below Target`;
    this.testhtml = ophtml;
    return this.transform(ophtml);
  }
  loadDataBySelection(ip: string) {
    this.loadDonutIp = ip;
    this.Apply();
    // if (ip == 'NF') {
    //   this.dataSource = new MatTableDataSource(this._cooDashboardCommon.dataNF);
    //   this.dataSource1 = this._cooDashboardCommon.dataNF;
    // }
    // else
    //   this.dataSource = new MatTableDataSource(this._cooDashboardCommon.dataUC);
    // this.dataSource1 = this._cooDashboardCommon.dataUC;
  }
  toggleCustomerSelection(event) {
    this.getProjectsbyCust();
    this.getPortfoliosbyCust();
  } 
  getProjectsbyCust() {
    let filteredRecords = this._cooDashboardCommon.accountOverallHealth.projecT_KPIS;
    this.selectedProject="All";
    if (this.selectedCust != "All")
      filteredRecords = this._cooDashboardCommon.accountOverallHealth.projecT_KPIS.filter(x => x.cusT_NAME == this.selectedCust);
    this._cooDashboardCommon.popupProjects = this._cooDashboardCommon.getUniqueItemsFromList(filteredRecords, "proJ_NAME").sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupProjects.unshift("All");
  }
  getPortfoliosbyCust() {
    let filteredRecords = this._cooDashboardCommon.accountOverallHealth.projecT_KPIS;
    this.selectedPortfoliovalue="All";
    if (this.selectedCust != "All")
      filteredRecords = this._cooDashboardCommon.accountOverallHealth.projecT_KPIS.filter(x => x.cusT_NAME == this.selectedCust);
    this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.getUniqueItemsFromList(filteredRecords, "portfoliO_NAME").sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupPortfolios.unshift("All");
  }
  getAccountOverallHealth() {
    // this._cooDashboardCommon.progress = true;
    //this.LoadParams();
    //this._cooDashboardCommon.getOverallAccountHealth(this._dataModel).subscribe(data => {
    //this.accountOverallHealth = data;
    this.loadDonutIp = "NF";
    this._cooDashboardCommon.popupProjects = []; this._cooDashboardCommon.popupCusts = [];
    this._cooDashboardCommon.popupPortfolios = [];

    this._cooDashboardCommon.popupCusts = this._cooDashboardCommon.getUniqueItemsFromList(this._cooDashboardCommon.accountOverallHealth.projecT_KPIS, "cusT_NAME");
    this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.getUniqueItemsFromList(this._cooDashboardCommon.accountOverallHealth.projecT_KPIS, "portfoliO_NAME");

    // this._cooDashboardCommon.popupProjects = this._cooDashboardCommon.popupProjects.sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupCusts = this._cooDashboardCommon.popupCusts.sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    // this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.popupPortfolios.sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });

    // this._cooDashboardCommon.popupProjects.unshift("All");
    this._cooDashboardCommon.popupCusts.unshift("All");
    // this._cooDashboardCommon.popupPortfolios.unshift("All");
    this.getProjectsbyCust();
    this.getPortfoliosbyCust();
    this.BindData(this._cooDashboardCommon.accountOverallHealth.projecT_KPIS);
    //let projectlist = ["All"], custList = ["All"], portList = ["All"];

    // }, error => {
    //   this.progress = false;
    //   this._util.serviceError(error);
    // });
    // this._cooDashboardCommon.progress=false;
  }

  sortData(ip, isDesc = false): NameValuePair[] {
    if (isDesc)
      return ip.sort((n1, n2) => { return n2.value - n1.value; });//.slice(0, 3);
    else
      return ip.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
  }
  sortDataWithField(ip, field, isDesc = false): NameValuePair[] {
    if (isDesc)
      return ip.sort((n1, n2) => { return n2[field] - n1[field]; });//.slice(0, 3);
    else
      return ip.sort((n1, n2) => { return n1[field] - n2[field]; });//.slice(0, 3);
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
              op.push(new NameValuePair(prev, temp / i));
              i = 0; temp = 0;
            }
          }
          temp += value.value;
          i++;
          prev = value.Name;
        }
      });
      if (prev != "")
        op.push(new NameValuePair(prev, temp / i));
      return op;
    }
    else return ip;
  }
  getColor(severity) {
    if (severity = 'High') {
      return 'red';
    }

    if (severity = 'Medium') {
      return 'orange';
    }

    if (severity = 'Low') {
      return 'green';
    }



  }


  getCustomerScorebyCustId(value:any) {
    let temp: any[] = this._cooDashboardCommon.accountOverallHealth.cusT_KPIS; 
    let custScore = temp.filter(x => x.cusT_NAME == value.cusT_NAME)[0];
    return custScore.score;
  }
  ViewBatch_onClick(element) {
    this._cooDashboardCommon.selectedCustomerID = element.custID;
    this._cooDashboardCommon.selectedCustomerName = element.custName;
    this.showViewDashboard = !this.showViewDashboard;
  }
  getScoresbyPortId(value) { 
    let temp: any[] = this._cooDashboardCommon.accountOverallHealth.portfoliO_KPIS; 
    let portScore = temp.filter(x => x.portfoliO_NAME == value)[0];
    return portScore.score;
  }
  BindData(ipdata) {
    let dataNF = [];
    let dataUC = [];
    let tempcust: any[] = this._cooDashboardCommon.accountOverallHealth.cusT_KPIS;
    let tempport: any[] = this._cooDashboardCommon.accountOverallHealth.portfoliO_KPIS;
    ipdata.forEach(function (value) {
      let custScore = tempcust.filter(x => x.cusT_NAME == value.cusT_NAME)[0];
      if (custScore.score == 100) {
        // if(value.score == 100){
        dataUC.push(value);
      }
      else {
        dataNF.push(value);
      }
    }); 
    let data = [];
    // this._cooDashboardCommon.dataNF = dataNF;
    // this._cooDashboardCommon.dataUC = dataUC;
    if (this.loadDonutIp == "NF")
      data = dataNF;
    else
      data = dataUC;
    //this.dataSource = new MatTableDataSource(this._cooDashboardCommon.dataNF);
    //performDataAccounts.push(new NameValuePair(value.cusT_NAME, value.score)); 
    data = data.sort((n1, n2) => { return n1.cusT_NAME.toLowerCase() > n2.cusT_NAME.toLowerCase() ? 1 : -1 });//.slice(0, 3);
    let prevCust = "", prevProj = "", prevPortfolio = "";
    let customerProjectsScores = [];
    let i = 0;
    data.forEach(function (value) {
      let customerProjectsScore = new CustomerProjectsScores();
      if (prevCust != value.cusT_NAME) {
        //  custList.push(value.cusT_NAME);
        let portfolios = data.filter((obj) => {
          return obj.cusT_NAME === value.cusT_NAME && obj.portfoliO_NAME != null;
        });
        portfolios = portfolios.sort((n1, n2) => { return n1.portfoliO_NAME.toLowerCase() > n2.portfoliO_NAME.toLowerCase() ? 1 : -1 });
        let portfolioScores: PortfolioScores[] = [];
        let k = 0;
        if (portfolios.length > 0) {
          portfolios.forEach(function (pvalue) {
            let portfolioScore = new PortfolioScores();
            if (prevPortfolio != pvalue.portfoliO_NAME) {


              let projects = portfolios.filter((obj) => {
                return obj.portfoliO_NAME === pvalue.portfoliO_NAME;
              });
              let projectScores: ProjectScores[] = [];
              projects.forEach(function (pvalue1, j) {
                let projectScore = new ProjectScores();
                // if (prevProj != pvalue.proJ_NAME) {
                //   projectlist.push(pvalue.proJ_NAME);
                // }
                projectScore.projName = pvalue1.proJ_NAME;
                projectScore.score = pvalue1.score;
                projectScore.projID = pvalue1.proJ_ID;
                projectScores[j] = projectScore;
                prevProj = pvalue1.proJ_NAM;
              });
              
              portfolioScore.portfolioName = pvalue.portfoliO_NAME;
              let portScore = tempport.filter(x => x.portfoliO_NAME == pvalue.portfoliO_NAME)[0]; 
              portfolioScore.score = portScore.score;
              portfolioScore.portfolioID = pvalue.portfoliO_ID;
              portfolioScore.projScores = projectScores; portfolioScore.isExpanded = false;
              portfolioScores[k] =portfolioScore ;//this.getScoresbyPortId(portScore.portfoliO_NAME);
              k++;
            }
            prevPortfolio = pvalue.portfoliO_NAME;
          });

 
          let custScore = tempcust.filter(x => x.cusT_NAME == value.cusT_NAME)[0]; 
          customerProjectsScore.custID = value.cusT_ID;
          customerProjectsScore.custName = value.cusT_NAME;
          customerProjectsScore.score = custScore.score;
          customerProjectsScore.portfolioScores = portfolioScores;

          customerProjectsScore.isExpanded = false;

          customerProjectsScores[i] = customerProjectsScore;
          i++;
        }
        else {
          let projects = data.filter((obj) => {
            return obj.cusT_NAME === value.cusT_NAME;
          });
          let projectScores: ProjectScores[] = [];
          projects.forEach(function (pvalue, j) {
            let projectScore = new ProjectScores();
            // if (prevProj != pvalue.proJ_NAME) {
            //   projectlist.push(pvalue.proJ_NAME);
            // }
            projectScore.projName = pvalue.proJ_NAME;
            projectScore.score = pvalue.score;
            projectScore.projID = pvalue.proJ_ID;
            projectScores[j] = projectScore;
            prevProj = pvalue.proJ_NAM;
          });
          let portfolioScores: PortfolioScores[] = [];
          let portfolioScore = new PortfolioScores();
          portfolioScore.portfolioName = "";
          portfolioScore.score = 0;
          portfolioScore.portfolioID = "-99"; portfolioScore.isExpanded = false;
          portfolioScore.projScores = projectScores;
          //portfolioScore.projScores= pr
          portfolioScores[0] = portfolioScore;
          // prevPortfolio = pvalue.portfoliO_NAME;


          let custScore = tempcust.filter(x => x.cusT_NAME == value.cusT_NAME)[0]; 
          customerProjectsScore.custID = value.cusT_ID;
          customerProjectsScore.custName = value.cusT_NAME;
          customerProjectsScore.score = custScore.score; 
          customerProjectsScore.portfolioScores = portfolioScores;

          customerProjectsScore.isExpanded = false;

          customerProjectsScores[i] = customerProjectsScore;
          i++;
        }
      }
      prevCust = value.cusT_NAME;
    });
    this._cooDashboardCommon.customerProjectsScores = customerProjectsScores;
  }


  Apply() {
    let dataView = this._cooDashboardCommon.accountOverallHealth.projecT_KPIS;
    //if (this.selectedCust != "All")
    dataView = dataView.filter(x => (x.cusT_NAME == this.selectedCust || this.selectedCust == "All")
      && (x.proJ_NAME == this.selectedProject || this.selectedProject == "All") && (x.portfoliO_NAME == this.selectedPortfoliovalue || this.selectedPortfoliovalue == "All") && (this.ipSearch.trim() == "" || x.proJ_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 || (x.portfoliO_NAME != null && x.portfoliO_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1) || x.cusT_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1)
    );
    this.BindData(dataView);
  }

  Reset() {
    this.loadDonutIp = "NF";
    this.selectedCust = "All";
    this.toggleCustomerSelection("");
    this.selectedPortfoliovalue = "All";
    this.selectedProject = "All";
    this.ipSearch = "";
    this.Apply();
  }
  Search() {
    this.Apply();
  }
  selectItemCoverages(index: number) {
    //this.openCoverages = this.openCoverages && this.indexSelectedCoverage === index ? false : true;
    //this.indexSelectedCoverage = index;
  }

}
