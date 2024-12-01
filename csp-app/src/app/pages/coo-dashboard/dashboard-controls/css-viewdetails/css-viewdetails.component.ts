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
import { Router } from '@angular/router';

@Pipe({
  name: 'sanitizeHtml'
})
@Component({
  selector: 'app-css-viewdetails',
  templateUrl: './css-viewdetails.component.html',
  styleUrls: ['./css-viewdetails.component.scss']
})
export class CSSViewdetailsComponent {
  progress: boolean;

  private _dataModel: DashboardSearchParams = new DashboardSearchParams();
  selectedProject: string;
  selectedPortfoliovalue: string;
  constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility,
    private router: Router) {

  }
  @Input() showCSSViewdetails: boolean = false;
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
    this.showCSSViewdetails = !this.showCSSViewdetails;
  }
  ngOnInit(): void {
    // this.LoadParams();
    // this.getcustomerSuccessSurvey();  
    this._cooDashboardCommon.vwcustomerSuccessSurvey = [];
  }
  loadDataBySelection(ip: string) {
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
    //this.getPortfoliosbyCust();
  }
  getProjectsbyCust() { 
    this._cooDashboardCommon.vwcustomerSuccessSurvey=this._cooDashboardCommon.customerSuccessSurvey.csat;
    let filteredRecords = this._cooDashboardCommon.vwcustomerSuccessSurvey;
    if (this.selectedCust != "All")
      filteredRecords = this._cooDashboardCommon.vwcustomerSuccessSurvey.filter(x => x.customeR_NAME == this.selectedCust);
    this._cooDashboardCommon.popupProjects = this._cooDashboardCommon.getUniqueItemsFromList(filteredRecords, "projecT_NAME").sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupProjects.unshift("All");
    this.selectedProject = "All";
  }
  getPortfoliosbyCust() {
    let filteredRecords = this._cooDashboardCommon.vwcustomerSuccessSurvey.csat;
    if (this.selectedCust != "All")
      filteredRecords = this._cooDashboardCommon.vwcustomerSuccessSurvey.filter(x => x.customeR_NAME == this.selectedCust);
    this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.getUniqueItemsFromList(filteredRecords, "portfoliO_NAME").sort((n1, n2) => { return n1.toLowerCase() > n2.toLowerCase() ? 1 : -1 });
    this._cooDashboardCommon.popupPortfolios.unshift("All");
    this.selectedPortfoliovalue = "All";
  }
  getcustomerSuccessSurvey() {
    this._cooDashboardCommon.vwcustomerSuccessSurvey = this._cooDashboardCommon.customerSuccessSurvey.csat;
    this._cooDashboardCommon.popupProjects = []; this._cooDashboardCommon.popupCusts = [];
    this._cooDashboardCommon.popupPortfolios = [];

    this._cooDashboardCommon.popupCusts = this._cooDashboardCommon.getUniqueItemsFromList(this._cooDashboardCommon.vwcustomerSuccessSurvey, "customeR_NAME");
    this._cooDashboardCommon.popupPortfolios = this._cooDashboardCommon.getUniqueItemsFromList(this._cooDashboardCommon.vwcustomerSuccessSurvey, "portfoliO_NAME");

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


  getCustomerScorebyCustId(value) {
    let temp: any[] = this._cooDashboardCommon.vwcustomerSuccessSurvey;
    let custScore = temp.filter(x => x.customeR_NAME == value.customeR_NAME)[0];
    return custScore.score;
  } 

  Apply() {
    this._cooDashboardCommon.vwcustomerSuccessSurvey=this._cooDashboardCommon.customerSuccessSurvey.csat;
    let dataView = this._cooDashboardCommon.vwcustomerSuccessSurvey;
    //if (this.selectedCust != "All")
    dataView = dataView.filter(x => (x.customeR_NAME == this.selectedCust || this.selectedCust == "All")
      && (x.projecT_NAME == this.selectedProject || this.selectedProject == "All") && (x.portfoliO_NAME == this.selectedPortfoliovalue || this.selectedPortfoliovalue == "All") 
      && (this.ipSearch.trim() == "" || x.projecT_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 || (x.portfoliO_NAME != null && x.portfoliO_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1) || x.customeR_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 || x.respondenT_NAME.toLowerCase().indexOf(this.ipSearch.toLowerCase()) != -1 )
      );
    this._cooDashboardCommon.vwcustomerSuccessSurvey = dataView;
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

  navigateToDetails(proj: any) {
    window.open('/CustomerSuccessSurvey/' + proj.surveY_ID, '_blank');
  }
  

}
