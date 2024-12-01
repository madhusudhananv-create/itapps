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
import { COODashboardCommon } from '../../coo-dashboard-common';
@Pipe({
  name: 'sanitizeHtml'
})
@Component({
  selector: 'app-contract-status-viewdetails',
  templateUrl: './contract-status-viewdetails.component.html',
  styleUrls: ['./contract-status-viewdetails.component.scss']
})
export class ContractStatusViewdetailsComponent {
  progress: boolean;

  private _dataModel: DashboardSearchParams = new DashboardSearchParams();
  selectedProject: string;
  selectedPortfoliovalue: string;
  startDate: any;
  endDate: any;
  contractStatusDetails: any;
  constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility) {

  }
  @Input() showContractStatusViewdetails: boolean = false;
  dashboard: boolean = false;
  dataSource: MatTableDataSource<{
    ews: string, account: string,
    status: string, projects: string, severity: string
  }>; dataSource1: any;
  selectedPeriod = 'asToday';
  selectedValue: string = 'Quarter';
  startYear = new Date().getFullYear();
  selectedCust: string = "All";
  areaChart: Chart;
  openCoverages = false;
  indexSelectedCoverage = 1;
  showViewDashboard: boolean = false;
  ipSearch = "";
  onClose() {
    this.Reset();
    this.showContractStatusViewdetails = !this.showContractStatusViewdetails;
  }
  ngOnInit(): void {
    // this.LoadParams();
    // this.getcustomerSuccessSurvey();  
    this.contractStatusDetails = [];
  }
  loadData(){
    this._cooDashboardService.getContractStatusDetailsForProjects(this._cooDashboardCommon.LoadParams(),this.startDate,this.endDate).subscribe(data => {
     
    }), error => { this._util.serviceError(error); }
  }  
  toggleCustomerSelection(event) {
    this.getProjectsbyCust(); 
  }
  getProjectsbyCust() { 
    this.contractStatusDetails=this.contractStatusDetails;
    let filteredRecords = this.contractStatusDetails;
    if (this.selectedCust != "All")
      filteredRecords = this.contractStatusDetails.filter(x => x.customeR_NAME == this.selectedCust);
    this._cooDashboardCommon.popupProjects = this._cooDashboardCommon.getUniqueItemsFromList(filteredRecords, "projecT_NAME").sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupProjects.unshift("All");
    this.selectedProject = "All";
  }
  getPortfoliosbyCust() {
    let filteredRecords = this.contractStatusDetails.csat;
    if (this.selectedCust != "All")
      filteredRecords = this.contractStatusDetails.filter(x => x.customeR_NAME == this.selectedCust);
    this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.getUniqueItemsFromList(filteredRecords, "portfoliO_NAME").sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupPortfolios.unshift("All");
    this.selectedPortfoliovalue = "All";
  }
  getcustomerSuccessSurvey() { 
    this.contractStatusDetails = this.contractStatusDetails;
    this._cooDashboardCommon.popupProjects = []; this._cooDashboardCommon.popupCusts = [];
    this._cooDashboardCommon.popupPortfolios = [];

    this._cooDashboardCommon.popupCusts = this._cooDashboardCommon.getUniqueItemsFromList(this.contractStatusDetails, "customeR_NAME");
    this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.getUniqueItemsFromList(this.contractStatusDetails, "portfoliO_NAME");

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
    let temp: any[] = this.contractStatusDetails;
    let custScore = temp.filter(x => x.customeR_NAME == value.customeR_NAME)[0];
    return custScore.score;
  } 

  Apply() {
    this.contractStatusDetails=this.contractStatusDetails;
    let dataView = this.contractStatusDetails;
    //if (this.selectedCust != "All")
    dataView = dataView.filter(x => (x.customeR_NAME == this.selectedCust || this.selectedCust == "All")
      && (x.projecT_NAME == this.selectedProject || this.selectedProject == "All") && (x.portfoliO_NAME == this.selectedPortfoliovalue || this.selectedPortfoliovalue == "All") 
      && (this.ipSearch.trim() == "" || x.projecT_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 || (x.portfoliO_NAME != null && x.portfoliO_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1) || x.customeR_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 || x.respondenT_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 )
      );
    this.contractStatusDetails = dataView;
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
