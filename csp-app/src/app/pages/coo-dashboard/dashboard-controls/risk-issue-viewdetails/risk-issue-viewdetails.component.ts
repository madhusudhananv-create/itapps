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
import { DashboardSearchParams, NameValuePair } from '../../../../models/coo-dashboard-model';
import { AccessControl } from '../../../../Shared/accessControl';
import { RiskModelExt } from '../../../../models/risk-model';
import { COODashboardCommon } from '../../coo-dashboard-common';
import { TableFilterComponent } from '../../../../controls/table-filter/table-filter.component';
import { CloseComponentService } from '../../../../close-component.service';

@Pipe({
  name: 'sanitizeHtml'
})
@Component({
  selector: 'app-risk-issue-viewdetails',
  templateUrl: './risk-issue-viewdetails.component.html',
  styleUrls: ['./risk-issue-viewdetails.component.scss']
})
export class RiskIssueViewdetailsComponent {
  progress: boolean;

  private _dataModel: DashboardSearchParams = new DashboardSearchParams();
  selectedProject: string;
  selectedPortfoliovalue: string;
  riskIssueDetails: any;
  public projIds: any;
  public startDate: Date;
  public endDate: Date;
  loadIp: any = "R";
  constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility,
    public _access: AccessControl, public filterComp: TableFilterComponent, private close: CloseComponentService) {

  } bShowFilter: boolean = true;
  @Input() showRiskIssueViewdetails: boolean = false;
  dashboard: boolean = false;
  //displayedColumns = ['index', 'Portfolio_Name', 'proJ_NM', 'identifieD_DATE', 'description', 'impact', 'owner', 'probabilitY_SCALE', 'impacT_SCALE', 'rating', 'matrix', 'status', 'actuaL_DATE', 'edit', 'delete', 'view'];
  displayedColumns = ['description', 'impact', 'identifieD_DATE', 'owner', 'probabilitY_SCALE', 'impacT_SCALE', 'rating', 'status', 'targeT_DATE'];
  displayedColumns1 = ['index', 'portfoliO_NM', 'proJ_NM', 'description', 'issuE_TYPE', 'severity', 'actioN_PLAN', 'assigneD_TO', 'identifieD_DATE', 'targeT_DATE', 'issuE_RESOLVED_DATE', 'status'];
  dataSource: MatTableDataSource<any[]>;
  dataSource1: any;
  selectedPeriod = 'asToday';
  selectedValue: string = 'Quarter';
  startYear = new Date().getFullYear();
  selectedCust: string = "All";
  areaChart: Chart;
  openCoverages = false;
  indexSelectedCoverage = 1;
  showViewDashboard: boolean = false;
  ipSearch = "";

  onClose(): void {
    this.close.sendUpdate();
    this.Reset();
    this.showRiskIssueViewdetails = !this.showRiskIssueViewdetails;
  }
  ngOnInit(): void {
    // this.LoadParams();
    // this.getcustomerSuccessSurvey();  
    this.riskIssueDetails = [];
  }
  loadDataBySelection(ip: string) {
    //this.Apply();
    this.loadData(this.projIds, this.startDate, this.endDate, ip);

  }

  // getOwnerName(risk: RiskModelExt) {
  //   if (risk.owneR_NAME != undefined || risk.owneR_NAME != null)
  //     return risk.owneR_NAME;
  //   if (this.TeamMembers.filter(x => x.emP_ID.toString() == risk.owner).length > 0)
  //     return this.TeamMembers.filter(x => x.emP_ID.toString() == risk.owner)[0].frsT_NM;
  //   if (this.TeamMembers.filter(x => x.emaiL_ID == risk.owner).length > 0)
  //     return this.TeamMembers.filter(x => x.emaiL_ID == risk.owner)[0].frsT_NM;
  //   if (risk.owner = "-1")
  //     return "";
  //   return risk.owner;

  // }

  loadData(projIds, startDate, endDate, ip) {
    this.loadIp = ip;
    this._cooDashboardCommon.progressPopup = true;
    this.projIds = this._cooDashboardCommon.selectedprojIds;
    var d = new Date(), d1 = new Date();
    this.endDate = d;
    d1.setDate(d.getDate() - 180);
    this.startDate = d1;
    this._cooDashboardCommon.riskDataSource = [];
    this._cooDashboardCommon.issuesDataSource = [];

    if (ip == "R") {
      this._cooDashboardService.getRisksDetailsForProjects(this.projIds, this.startDate, this.endDate)
        .subscribe
        (
          data => {
            this._cooDashboardCommon.riskDataSource = new MatTableDataSource(data);
            this._cooDashboardCommon.progressPopup = false;
          }
          ,
          error => {
            this._cooDashboardCommon.progressPopup = false;
            this._util.serviceError(error);
          },
        );

    }
    else {
      this._cooDashboardService.getIssuesDetailsForProjects(this.projIds, this.startDate, this.endDate)
        .subscribe
        (
          data => {
            this._cooDashboardCommon.issuesDataSource = new MatTableDataSource(data);
            this._cooDashboardCommon.progressPopup = false;
          }
          ,
          error => {
            this._cooDashboardCommon.progressPopup = false;
            this._util.serviceError(error);
          },
        );

    }
  }

  toggleCustomerSelection(event) {
    this.getProjectsbyCust();
    //this.getPortfoliosbyCust();
  }
  getProjectsbyCust() {
    this.riskIssueDetails = this._cooDashboardCommon.customerSuccessSurvey.csat;
    let filteredRecords = this.riskIssueDetails;
    if (this.selectedCust != "All")
      filteredRecords = this.riskIssueDetails.filter(x => x.customeR_NAME == this.selectedCust);
    this._cooDashboardCommon.popupProjects = this._cooDashboardCommon.getUniqueItemsFromList(filteredRecords, "projecT_NAME").sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupProjects.unshift("All");
    this.selectedProject = "All";
  }
  getPortfoliosbyCust() {
    let filteredRecords = this.riskIssueDetails;
    if (this.selectedCust != "All")
      filteredRecords = this.riskIssueDetails.filter(x => x.customeR_NAME == this.selectedCust);
    this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.getUniqueItemsFromList(filteredRecords, "portfoliO_NAME").sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupPortfolios.unshift("All");
    this.selectedPortfoliovalue = "All";
  }
  getcustomerSuccessSurvey() {
    this.riskIssueDetails = this._cooDashboardCommon.customerSuccessSurvey.csat;
    this._cooDashboardCommon.popupProjects = []; this._cooDashboardCommon.popupCusts = [];
    this._cooDashboardCommon.popupPortfolios = [];

    this._cooDashboardCommon.popupCusts = this._cooDashboardCommon.getUniqueItemsFromList(this.riskIssueDetails, "customeR_NAME");
    this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.getUniqueItemsFromList(this.riskIssueDetails, "portfoliO_NAME");

    // this._cooDashboardCommon.popupProjects = this._cooDashboardCommon.popupProjects.sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupCusts = this._cooDashboardCommon.popupCusts.sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    // this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.popupPortfolios.sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });

    // this._cooDashboardCommon.popupProjects.unshift("All");
    this._cooDashboardCommon.popupCusts.unshift("All");
    // this._cooDashboardCommon.popupPortfolios.unshift("All");
    this.getProjectsbyCust();
    //  this.getPortfoliosbyCust();
    //let projectlist = ["All"], custList = ["All"], portList = ["All"];

    // }, error => {
    //   this.progress = false;
    //   this._util.serviceError(error);
    // });
    // this._cooDashboardCommon.progress=false;
  }

  getCustomerScorebyCustId(value) {
    let temp: any[] = this.riskIssueDetails;
    let custScore = temp.filter(x => x.customeR_NAME == value.customeR_NAME)[0];
    return custScore.score;
  }

  Apply() {
    this.riskIssueDetails = this._cooDashboardCommon.customerSuccessSurvey.csat;
    let dataView = this.riskIssueDetails;
    //if (this.selectedCust != "All")
    dataView = dataView.filter(x => (x.customeR_NAME == this.selectedCust || this.selectedCust == "All")
      && (x.projecT_NAME == this.selectedProject || this.selectedProject == "All") && (x.portfoliO_NAME == this.selectedPortfoliovalue || this.selectedPortfoliovalue == "All")
      && (this.ipSearch.trim() == "" || x.projecT_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 || (x.portfoliO_NAME != null && x.portfoliO_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1) || x.customeR_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 || x.respondenT_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1)
    );
    this.riskIssueDetails = dataView;
  }

  Reset() {
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
