import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ParameterModel } from '../../models/parameter-model';
import { MatOption, MatSelect } from '@angular/material';

import { DateSelectionModel } from '../../models/DateSelection-model';
import { CITrackerModel } from '../../models/ci_tracker';
import { MediaMatcher } from '@angular/cdk/layout';
import { LayoutService } from '../layout/layout.service';
import { SharedService } from '../../Shared/shared.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { CustomerProjectIdsSingle } from '../../models/customer-projects-model';
import { AccessControl } from '../../Shared/accessControl';
import { IdeaImprovementType } from '../../models/bvd-entry/idea-model';
import { BvdEntryService } from '../bvd-entry/services/bvd-entry.service';
import { BvdDashboardService } from '../bvd-dashboard/services/bvd-dashboard.service';

@Component({
  selector: 'app-ci-leaderboard-page',
  templateUrl: './ci-leaderboard-page.component.html',
  styleUrls: ['./ci-leaderboard-page.component.scss']
})
export class CiLeaderboardPageComponent implements OnInit {
  CITrackerList: any;
  ciTrackerParamerterModel: CITrackerParamerterModelNew = new CITrackerParamerterModelNew();
//  ciTrackerTotalColumns: CITrackerTotalColumns;

  DateSelection: DateSelectionModel = new DateSelectionModel(this._util);
  selectedParams: CITrackerModel = new CITrackerModel();
  ciCategory: number[] = [];
  //ddlviewBy: number;
  ddlstatus: number[] = [];
  selectedCust: string;
  private sub: any;

  custId: any;
  projId: any;

  //WeightageList: ParameterModel[] = [];
  projDisplayIndex = -1;
  showPortprojIndex = -1;
  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('select') ciselect: MatSelect;

  @ViewChild('statusDefaultSelected') statusDefaultSelected: MatOption;
  displayText: string = '';

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  menuToggleStatus: boolean;
  //positionToolTip: string;
  //automationIndexToolTip: string;

  beneficiary : number;
  uom:number;
  measurement1:string;
  measurement2:string;
  allcust: boolean = false;
  allproj: boolean = false;
  ideaImprovementType : IdeaImprovementType[] = [];
  uomList : any[] = [];

  constructor( private _bvdService: BvdEntryService, private _bvdDashboardService:BvdDashboardService, public _access: AccessControl,private route: ActivatedRoute, public _util: myUtility, private _appservice: AppsService, private _formBuilder: FormBuilder, private _shared: SharedService, public _layoutService: LayoutService, media: MediaMatcher, changeDetectorRef: ChangeDetectorRef)
  {

    if (this._access.IsAllowed(71, 1, '', ''))
    {
      this.allcust = true;
      this.allproj = true;

    }
    else
    {
      this.allcust = false;
      this.allproj = true;
    }

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
    });
    this.getIdeaImprovementTypes();
    this._layoutService.selectedCust = this.selectedCust;

    this.ciTrackerParamerterModel = new CITrackerParamerterModelNew();
    this.ciTrackerParamerterModel.cusT_ID = "-1";
    this.ciTrackerParamerterModel.all = true;
    this.ddlstatus = [2,3,4,8];
    var dt: Date = new Date();
    // var cmonthName : string = monthNames[dt.getMonth()];
    var cyear: number = dt.getFullYear();


    this.DateSelection.selectedStartMonth = "Apr";
    this.DateSelection.selectedStartYear = cyear;
    this.DateSelection.selectedEndMonth = this._util.Month()
    this.DateSelection.selectedEndYear = cyear;
    this.beneficiary = 1;
    this.ciTrackerParamerterModel.beneficiary = this.beneficiary
    this.uom = 1;
    this.ciTrackerParamerterModel.uom = this.uom;
    this.ciTrackerParamerterModel.cilCategory = this.ciCategory;
    this.ciTrackerParamerterModel.iiStatus = this.ddlstatus;

    this.saveDates();
    this.getCITracker();

    this.getNote();
    this.getUOM();
    //this.getIdeaImprovementTypes();
  }
  getNote(){
    this._appservice.GetDBConfigValue("DISPLAY_MSG_CIL",-1,"").subscribe(data => {


      if(data.length > 0)
       {
         this.displayText = data;
        }
    }, error => { this._util.serviceError(error); });
  }

  getIdeaImprovementTypes()
  {
    const firstelement = 0;
    var array = [];

    this._bvdService.getIdeaImprovementTypes().subscribe(data => {
     this.ideaImprovementType = data;
     array = this.ideaImprovementType.map(x=>x.id);
     this.ciCategory = [firstelement].concat(array);
    },(err)=>{this._util.serviceError(err)})
  }

  getUOM()
  {

    this._bvdDashboardService.getUOM().subscribe(data => {
      this.uomList = data;
     },(err)=>{this._util.serviceError(err)})
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  project_onChange($event) {

    let obj: CustomerProjectIdsSingle = $event;
    this.custId = obj.customer;
    this.projId = obj.project;
    this.ciTrackerParamerterModel.projectids = obj.project;
    this.ciTrackerParamerterModel.cusT_ID = this.custId;
  }
  toggleSelection()
  {
      if(this.allSelected.selected)
        this.ciselect.options.forEach((item : MatOption) => item.select());
      else
        this.ciselect.options.forEach((item : MatOption) => item.deselect());
  }
  tosslePerOne() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.ciCategory.length == 3)
      this.allSelected.select();
  }
  OnbeneficiaryChange(){
    this.ciTrackerParamerterModel.beneficiary = this.beneficiary;
  }
  OnCategorychange(){
    this.ciTrackerParamerterModel.cilCategory = this.ciCategory;
  }
  OnStatusChange()
  {
    this.ciTrackerParamerterModel.iiStatus = this.ddlstatus;
  }

  OnuomChange(){
    this.ciTrackerParamerterModel.uom = this.uom;
  }

  btnApply() {
if(this.uomList.length > 0)
    {
        this.measurement1 = this.uomList.filter(x=>x.id == this.uom)[0].datatypE_SYMBOL;
    }

    if(new Date(this.ciTrackerParamerterModel.starT_DATE) > new Date(this.ciTrackerParamerterModel.enD_DATE))
    {
      alert("Please select end date greater than start date")
      return;
    }
    this.getCITracker();
  }

  setProjectIndex(index,image:any)
  {

    if(this.projDisplayIndex == index)
    {
      this.projDisplayIndex = -1;
      image.src='/assets/images/plus.svg';
    }
    else
    {
      this.projDisplayIndex = index
      image.src='/assets/images/minus.png';
    }

  }
  setProjectId(projectId,portfolio)
  {
      this._shared.selectedProjects.length = 0;
      this._shared.selectedProjects.push(projectId);
      this._shared.selectedPortfolios.length = 0;
      this._shared.selectedPortfolios.push(portfolio.portfoliO_ID);
  }
  setProjectIDS(projectgroup:any)
  {
      projectgroup.forEach(element => {
        this._shared.selectedProjects.push(element.proJ_ID);
      });
  }

  showProjectsForPortfolio(portindex,image:any)
  {
    if(this.showPortprojIndex == portindex)
    {
      this.showPortprojIndex = -1;
      image.src='/assets/images/plus.svg';
    }
    else
    {
      this.showPortprojIndex = portindex;
      image.src='/assets/images/minus.png';
    }
  }
  setPortfolio(portfolio:any)
  {
     this._shared.selectedPortfolios.length = 0;
     this._shared.selectedPortfolios.push(portfolio.portfoliO_ID);

     //let portfolioProjectGroup = portfolio.cI .cI_TRACKER_PORTFOLIO_GOUPING.filter(x => x.portfoliO_ID === portfolioId);
     let projectGroup = portfolio.cI_TRACKER_PROJECT_GROUPING;
     this._shared.selectedProjects.length = 0;

     if(projectGroup != undefined) {
     projectGroup.forEach(element => {
        this._shared.selectedProjects.push(element.proJ_ID);
      });
     }

  }
  saveDates() {
    this.DateSelection.startDate = new Date(
      this.DateSelection.selectedStartYear,
      this._util.getMonthNum(this.DateSelection.selectedStartMonth),
      1
    );
    this.DateSelection.endDate = new Date(
      this.DateSelection.selectedEndYear,
      this._util.getMonthNum(this.DateSelection.selectedEndMonth) + 1,
      0
    );

    this.ciTrackerParamerterModel.starT_DATE = this.DateSelection.startDate.toDateString();
    this.ciTrackerParamerterModel.enD_DATE = this.DateSelection.endDate.toDateString();
  }

  getCITracker() {
    this.CITrackerList = undefined;
    this.showPortprojIndex = -1;
    this.projDisplayIndex = -1;

     this._appservice.GetCITrackerNew(this.ciTrackerParamerterModel).subscribe(data => {
       this.CITrackerList = data;

     //



     }, error => { this._util.serviceError(error); });
  }



}

export class CITrackerParamerterModelNew {
  all: boolean;
  starT_DATE: string;
  enD_DATE: string;
  beneficiary:number;
  uom:number;
  cusT_ID: string;
  projectids: string[];
//  viewBy: number;
  iiStatus : number[];
  cilCategory : number[];
}
