import { Component, OnInit, ViewChild,ViewEncapsulation  } from '@angular/core';
import { CITrackerModel } from '../../models/ci_tracker';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../../pages/layout/layout.service';
import { ParameterModel } from '../../models/parameter-model';
import { MatFormFieldModule, MatTableDataSource, MatPaginator, MatSort, MatTableModule, MatOption, MatSelect  } from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EmpInfoModel } from '../../models/emp-info-model';
import { PortfolioProjectSelectorComponent } from '../../controls/portfolio-project-selector/portfolio-project-selector.component';
import { PortfolioModel, ProjectModelNew } from '../../models/portfolio-model';
import { CustomerModel } from '../../models/customer-model';
import { SharedService } from '../../Shared/shared.service';
import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from "@angular/common";
import { DateSelectionModel } from '../../models/DateSelection-model';
import { ProjectsModel } from '../../models/projects-model';
import { CustomerProjectIds, CustomerProjectIdsSingle } from '../../models/customer-projects-model';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-ci-tracker-page',
  templateUrl: './ci-tracker-page.component.html',
  styleUrls: ['./ci-tracker-page.component.scss']
})
export class CiTrackerPageComponent implements OnInit {


  //CITracker = new CITrackerModel();
  CITrackerList : any;  
  ciTrackerParamerterModel : CITrackerParamerterModel = new CITrackerParamerterModel();
  ciTrackerTotalColumns : CITrackerTotalColumns;

  DateSelection: DateSelectionModel = new DateSelectionModel(this._util);
  selectedParams: CITrackerModel = new CITrackerModel();
  ciCategory : number[] = [];
  ddlviewBy : number;
  ddlstatus : number[] = [];
  selectedCust : string;
  private sub : any;
  
  custId: any;
  projId: any;
  
  WeightageList : ParameterModel[] = [];
  projDisplayIndex = -1;
  showPortprojIndex = -1;
  @ViewChild('allSelected') allSelected : MatOption;
  @ViewChild('select') ciselect: MatSelect;

  @ViewChild('statusDefaultSelected') statusDefaultSelected : MatOption;
  displayText: string = '';

  mobileQuery: MediaQueryList;  
  private _mobileQueryListener: () => void;

  menuToggleStatus: boolean;
  positionToolTip : string;
  automationIndexToolTip : string;
  
  constructor(private route: ActivatedRoute, public _util: myUtility,private _appservice: AppsService,private _formBuilder: FormBuilder,private _shared : SharedService,public _layoutService: LayoutService,media: MediaMatcher,changeDetectorRef: ChangeDetectorRef) { 

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  ngOnInit() {     
     
     
     this.sub = this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
    });

    this._layoutService.selectedCust = this.selectedCust;
     
     this.ciTrackerParamerterModel = new CITrackerParamerterModel();
     this.ciTrackerTotalColumns = new CITrackerTotalColumns();
     this.ciTrackerParamerterModel.cusT_ID = "-1";
     this.ciTrackerParamerterModel.all = true;
     this.ciTrackerParamerterModel.automate = true;
     this.ciTrackerParamerterModel.customeR_SAVINGS =  true;  
     this.ciTrackerParamerterModel.innovation = true;
     this.ciTrackerParamerterModel.improvement = true;   
     //var monthNames = ["Jan", "Feb", "Mar", "Apr", "May","Jun","Jul", "Aug", "Sep", "Oct", "Nov","Dec"];

     var dt : Date = new Date();
    // var cmonthName : string = monthNames[dt.getMonth()];  
     var cyear  : number = dt.getFullYear();
    
     
     this.DateSelection.selectedStartMonth = "Apr";        
     this.DateSelection.selectedStartYear = cyear; 
     this.DateSelection.selectedEndMonth = this._util.Month()       
     this.DateSelection.selectedEndYear = cyear; 


     this.ciCategory = [0,1,2,3,4];
     this.ddlviewBy = 0;
     this.ddlstatus = [4];

     this.ciTrackerParamerterModel.viewBy = this.ddlviewBy;     
     this.ciTrackerParamerterModel.iiStatus = this.ddlstatus;
     
     this.saveDates();
    
     this.Service_getWeightage();

     this.getCITracker();

     

     this.positionToolTip = "Sum of all CI Impact Category value X Weightage. Position is calculated based on the highest value to lowest value";
     this.automationIndexToolTip = "Effort Saved through Automation (Automated Effort / Manual Effort)";

     this.statusDefaultSelected.select();
     this.getNote();

     

     
     
  }

  getNote(){
    this._appservice.GetDBConfigValue("DISPLAY_MSG_CIL",-1,"").subscribe(data => {
     console.log("MSG:",data)
     
      if(data.length > 0)
       {
         this.displayText = data; 
        }
    }, error => { this._util.serviceError(error); });
  }

  ngAfterViewInit()
  {
     //this.allSelected.select();
     //this.toggleSelection();
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
    if (this.ciCategory.length == 4)
      this.allSelected.select();
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
 Service_getWeightage(){
    this._appservice.GetParametersByType('CI_TRACKER_WEIGHTAGE').subscribe(data => {
      this.WeightageList = data;  
        
          
    }, error => { this._util.serviceError(error); });
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

  getabsoluteValue(value)
  {
    return Math.abs(value);
  }

project_onChange($event) {
    
    let obj: CustomerProjectIdsSingle = $event;
    this.custId = obj.customer;
    this.projId = obj.project;    
    this.ciTrackerParamerterModel.projectids = obj.project;
    this.ciTrackerParamerterModel.cusT_ID = this.custId;
  }

  btnApply()
  {  
     this.getCITracker();
  }

  OnCategorychange()
  {
    this.ciTrackerParamerterModel.all = false;
    this.ciTrackerParamerterModel.automate = false;
    this.ciTrackerParamerterModel.innovation = false;
    this.ciTrackerParamerterModel.improvement = false;
    this.ciTrackerParamerterModel.customeR_SAVINGS = false;

    if(this.ciCategory.length > 0)
     {
       this.ciCategory.forEach((element, index) => {
        if(element == 0) this.ciTrackerParamerterModel.all = true;
        if(element == 1) this.ciTrackerParamerterModel.automate = true;
        if(element == 2) this.ciTrackerParamerterModel.innovation = true;
        if(element == 3) this.ciTrackerParamerterModel.improvement = true;
        if(element == 4) this.ciTrackerParamerterModel.customeR_SAVINGS = true;
      });       
     }
  }

  OnStatusChange()
  {
    this.ciTrackerParamerterModel.iiStatus = this.ddlstatus;
  }

  // OnViewByChange() {
  //        this.ciTrackerParamerterModel.viewBy = this.ddlviewBy;
  // }


getTotal()
  {  

    let tmp = 0;
    console.log(this.CITrackerList);
    
    if(this.CITrackerList != undefined)
    {

        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {    
          tmp = tmp + element.cI_CUST_PROPERTIES.completed; 
        });
        this.ciTrackerTotalColumns.completed_SUM = tmp;  

        tmp= 0;
         

        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.inprogress; 
        });

        this.ciTrackerTotalColumns.inprogress_SUM = tmp;

        tmp= 0;

        var tmpa = 0;
        var tmpb = 0;

        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmpb = tmpb + element.cI_CUST_PROPERTIES.totaL_BEFORE_ERROR; 
        });
        
        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmpa = tmpa + element.cI_CUST_PROPERTIES.totaL_AFTER_ERROR; 
        });                
        
        this.ciTrackerTotalColumns.qualitY_REDUCTION_OF_ERRORS_SUM = (tmpb - tmpa) / tmpb * 100;     
        

        tmp= 0;

        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.reductioN_IN_LEAD_TIME; 
        });

        this.ciTrackerTotalColumns.reductioN_IN_LEAD_TIME_SUM = tmp;  


        

       tmp= 0;

        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.reductioN_IN_CYCLE_TIME; 
        });

        this.ciTrackerTotalColumns.reductioN_IN_CYCLE_TIME_SUM = tmp; 

        

        tmp= 0;

        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.automatioN_INDEX; 
        });

        this.ciTrackerTotalColumns.automatioN_INDEX_SUM = tmp; 
       

        tmp= 0;

        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.savinG_PER_YEAR_EFFORT; 
        });

        this.ciTrackerTotalColumns.savinG_PER_YEAR_EFFORT_SUM = tmp;


        tmp= 0;


        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.savingS_IN_USD; 
        });

        this.ciTrackerTotalColumns.savinG_IN_USD_SUM = tmp;


        tmp= 0;


        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.harD_BENEFITS; 
        });

        this.ciTrackerTotalColumns.harD_BENEFITS_SUM = tmp;

        tmp= 0;


        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.revenue; 
        });

        this.ciTrackerTotalColumns.revenuE_SUM = tmp;


        tmp= 0;

        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.operatinG_COST; 
        });

        this.ciTrackerTotalColumns.operatinG_COST_SUM = tmp;


        tmp= 0;


        this.CITrackerList.ctB_CUSTOMER_GROUPING.forEach((element, index) => {        
          tmp = tmp + element.cI_CUST_PROPERTIES.profitability; 
        });

        this.ciTrackerTotalColumns.profitabilitY_SUM = tmp;

    }
  }


  processCycleTime(value)
  {
       var result = "0";
       var temph : number;
       var tempm : number;

       if(value < 0)
          value = value * (-1);

       if(value > 0 && value < 60)
       {
            result = value + " mins";
       }
       else if(value > 60 && value < 480)
       {             
            temph = Math.floor(value / 60);
            tempm = value % 60;

            result = temph + " hrs " + tempm + " mins"
       }
       else if(value >= 480)
       {
            temph = Math.floor(value / 8);
            tempm = value % 8;

            result = temph + " days " + tempm + " hrs"
       }

       return result;
  }
    


  getCITracker()
  {  
     this.CITrackerList = undefined;
     this.showPortprojIndex = -1;
     this.projDisplayIndex = -1;
     
     this._appservice.GetCITracker(this.ciTrackerParamerterModel).subscribe(data => {      
     this.CITrackerList = data;   
     
     console.log(this.CITrackerList);
     //this.getTotal();


      }, error => { this._util.serviceError(error);});     
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

}

export class CITrackerParamerterModel
{
  all : boolean;
  starT_DATE: string;
  enD_DATE : string;
  automate: boolean;
  customeR_SAVINGS : boolean; 
  innovation : boolean;
  improvement : boolean;
  cusT_ID : string; 
  projectids : string[];
  viewBy : number;  
  iiStatus : number[];
}
export class CITrackerTotalColumns
{            
        completed_SUM : number;
        inprogress_SUM : number;
        qualitY_REDUCTION_OF_ERRORS_SUM : number;
        reductioN_IN_LEAD_TIME_SUM : number;
        reductioN_IN_CYCLE_TIME_SUM : number;
        savinG_PER_YEAR_EFFORT_SUM : number;
        savinG_IN_USD_SUM : number;
        harD_BENEFITS_SUM  : number;
        sofT_BENEFITS_SUM  : string;
        revenuE_SUM : number;
        operatinG_COST_SUM  : number;        
        profitabilitY_SUM : number;   
        automatioN_INDEX_SUM : number;
        revenue:number;

        
}

