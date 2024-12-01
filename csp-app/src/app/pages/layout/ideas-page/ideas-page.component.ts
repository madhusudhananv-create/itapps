import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { InnovationModel, GAVSService, InnovationModelExt } from '../../../models/innovation-model';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatDialogConfig } from '@angular/material';
import { AccessControl } from '../../../Shared/accessControl';
import { Http, Headers } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { IdeasInnovationMatrixComponent } from '../../../../app/ideas-innovation-matrix/ideas-innovation-matrix.component';
import { environment } from '../../../../../src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { enumRoles } from '../../../Shared/enum';
import { ProjectsModel } from '../../../models/projects-model';
import { SharedService } from '../../../Shared/shared.service';
import { ParameterModel } from '../../../models/parameter-model';
import { LayoutService } from '../../../pages/layout/layout.service';
import { createUrlResolverWithoutPackagePrefix } from '@angular/compiler';
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: 'app-ideas-page',
  templateUrl: './ideas-page.component.html',
  styleUrls: ['./ideas-page.component.scss']
})
export class IdeasPageComponent implements OnInit {
  //input: any[];
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  EditInnovation: InnovationModelExt
  filteredIdeas:InnovationModelExt[];
  filtered1Ideas:InnovationModelExt[] =[];
  displayedColumns = [];
  displayedColumns1 = [];
  projects : string[] = [];
  portfolio: string[] = [];
  gavsServices:any;
  gavsServiceChecked:any[] = []
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource2: MatTableDataSource<InnovationModelExt>
  tempData: any;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  selectedCust : string;
  private sub : any;
  ideasdata : any;
  idea:any;
  allproj: boolean = false;
  projNames : ProjectsModel[];
  dataSource = new MatTableDataSource(this.ideasdata);
  selectedProject: string = "All Projects";
  selectedPortfolio : string = "All Portfolios";
  AllChecked : boolean;
  PastDueChecked : boolean = true;
  DueClosureChecked : boolean = true;
  viewType : string = "details";
  UOMList : ParameterModel[] = [];
  
  isOneTime : boolean = false;
  phCases : string = "No. of cases/Instances in one month";
  phFTEPersonHours : string = "How many person hours in a month considered as one FTE";
  
  phEffort  =  "Effort In Person hour";
  phCost  ="Cost in USD";
  phFTESpent = "FTE Spent";


  isBenefitsView : boolean = false;
  cycleTimeToolTip : string = "Cycle Time is the amount of time a team spends actually working on producing an item, up until the product is ready for shipment. ... This includes time spent producing the item and the wait stages (amount of time the task is left 'waiting' on the board) between active work times.";
  leadTimeToolTip : string = "Lead time clock starts when the request is made and ends at delivery. Cycle time clock starts when work begins on the request and ends when the item is ready for delivery. Cycle time is a more mechanical measure of process capability. Lead time is what the customer sees.";
  ciyToolTip : string = "Please input no. of cases / instances applicable in a financial year – April to Mar";
  statusToolTip : string = "Please note system will not allow you to change the status to “Complete” unless the required data is filled under Current state and Future state section";

  beforE_COST_YEAR : string;
  afteR_COST_YEAR : string;
  
  beforE_EFFORT_YEAR : string;
  afteR_EFFORT_YEAR : string;
  
  status : string = "";
  colspan : number = 6;

  disableSave: boolean = false;
  showIdea: boolean = false;
  ideasid: any;
  errorStr : string = "";
  //routerLink : string = "['/newdashboard/cust', selectedCust, false]";

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    //this.cdref.detectChanges();
  }
  constructor(private route: ActivatedRoute, private _layoutService: LayoutService, private _shared : SharedService, private _access:AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService,public dialog: MatDialog, private cdref: ChangeDetectorRef) 
  {    }
  ngOnInit() {    
    
    
    let role = localStorage.getItem('role');
    if(role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      
      this.selectedCust = params['custid'];
      this._layoutService.selectedCust = params['custid'];
    });

    
    this.route.queryParams.subscribe(params => {             
          this.isBenefitsView =  params['showBenefits'];  
    });

    this.route.params.subscribe(params => {
      if (params['ideasid'] != undefined && params['ideasid'] != null) {
        this.ideasid = params['ideasid'];
        this.showIdea = true;
      }
    });    
    

    this.displayedColumns = ['index', 'portfoliO_NM', 'proJ_NM', 'description', 'identifieD_DATE', 'status', 'targeT_DATE', 'actuaL_DATE', 'responsible', 'approach','comments', 'edit', 'delete'];

    if(!this._util.IsPremier(this.selectedCust))
    {
      this.displayedColumns = ['index', 'proJ_NM', 'description', 'identifieD_DATE', 'status', 'targeT_DATE', 'actuaL_DATE', 'responsible', 'approach','comments', 'edit', 'delete'];
      this.colspan = 5;
     }

    this.displayedColumns1 = ['index', 'identifieD_DATE','description','status', 'responsible','area','use'];

    this.getAllIdeasDetails();
    this.Service_GetUOMList();

    
    //this.getProjectNames();
    this.newEditInnovation();

    if(this.isBenefitsView)
    {
      this.viewType = "benefits";
      this.DoApplicable();
    }
  }


setDisabled()
{
  let dsErrors = false;
  let dsCycleTime = false;
  let dsLeadTime = false;
  let dsEffortOptimization = false;

  

  if(this.EditInnovation.beforE_ERROR != null && this.EditInnovation.afteR_ERROR != null)
  {
    dsErrors = true;
  }
  
  if(this.EditInnovation.beforE_CYCLE_TIME != null && this.EditInnovation.afteR_CYCLE_TIME != null)
  {
    dsCycleTime = true;
  }

  if(this.EditInnovation.beforE_LEAD_TIME != null && this.EditInnovation.afteR_LEAD_TIME != null)
  {
    dsLeadTime = true;
  }

  if(this.EditInnovation.beforE_CASES_COUNT != null && this.EditInnovation.beforE_TIME_TAKEN &&
    this.EditInnovation.beforE_FTECOST_HOUR != null && this.EditInnovation.beforE_FTECOST_MONTH != null &&
    this.EditInnovation.afteR_CASES_COUNT != null && this.EditInnovation.afteR_TIME_TAKEN &&
    this.EditInnovation.afteR_FTECOST_HOUR != null && this.EditInnovation.afteR_FTECOST_MONTH != null
    )
  {

    if(!this.EditInnovation.iS_ONETIME)
    {
      if(this.EditInnovation.beforE_OCCOURANCE_COUNT != null && this.EditInnovation.afteR_OCCOURANCE_COUNT != null)
        dsEffortOptimization = true;      
    }
    else
      dsEffortOptimization = true;     
  }  


  if(dsErrors || dsCycleTime || dsLeadTime || dsEffortOptimization)
  {      
      return false;
  }
  else
  {
      //this.EditInnovation.status = this.status;
      //this.cdref.detectChanges();
      return true;
  }
}


Service_GetUOMList(){
    this._appservice.GetParametersByType('UOM').subscribe(data => {
      this.UOMList = data;                 
    }, error => { this._util.serviceError(error); });
  } 



DoOneTime(event)
{  
  this.EditInnovation.iS_ONETIME = event.checked;
  this.isOneTime = event.checked;

  this.phEffort  =  "Effort In Person hour";
  this.phCost  ="Cost in USD";
  this.phFTESpent = "FTE Spent";

  if(this.isOneTime)
  {
      this.phCases = "No. of cases/Instances";
      this.phFTEPersonHours = "How many person hours considered as one FTE";      
  }
  else
  {
      this.phCases = "No. of cases/Instances in one month";
      this.phFTEPersonHours = "How many person hours in a month considered as one FTE";
      // this.phEffort  =  "Effort Per Month in Person hour";
      // this.phCost  ="Cost Per Month(In USD)";
      // this.phFTESpent = "FTE Spent Per Month";      
  }

} 


DoApplicable()
{   
  if(this.viewType == "details")
  {
    
    this.isBenefitsView = false;

    if(!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'proJ_NM', 'description', 'identifieD_DATE', 'status', 'targeT_DATE', 'actuaL_DATE', 'responsible','approach','comments', 'edit', 'delete'];
    else
      this.displayedColumns = ['index', 'portfoliO_NM', 'proJ_NM', 'description', 'identifieD_DATE', 'status', 'targeT_DATE', 'actuaL_DATE', 'responsible', 'approach','comments', 'edit', 'delete'];
  }
  else if(this.viewType == "benefits")
  {  
    this.isBenefitsView = true;
    
    if(!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'proJ_NM', 'description', 'identifieD_DATE', 'status', 'qualitY_REDUCTION_OF_ERRORS','reductioN_IN_LEAD_TIME_DATA','reductioN_IN_CYCLE_TIME_DATA','savinG_PER_YEAR_EFFORT','automatioN_INDEX','savingS_IN_USD','harD_BENEFITS','customeR_BUSINESS_VALUE','revenue','operatinG_COST','profitability', 'edit', 'delete'];  
    else
      this.displayedColumns = ['index', 'portfoliO_NM', 'proJ_NM', 'description', 'identifieD_DATE', 'status', 'qualitY_REDUCTION_OF_ERRORS','reductioN_IN_LEAD_TIME_DATA','reductioN_IN_CYCLE_TIME_DATA','savinG_PER_YEAR_EFFORT','automatioN_INDEX','savingS_IN_USD','harD_BENEFITS','customeR_BUSINESS_VALUE','revenue','operatinG_COST','profitability', 'edit', 'delete'];
  }

  this.RefreshTable(this.ideasdata);

}

  ngOnChanges() {
    this.RefreshTable(this.ideasdata);
    this.newEditInnovation();
    this.editmode = false;
    this.readonlymode = true;
  }

  getProjectNames()
  {
    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allproj).subscribe(
      data => {
        this.projNames = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  showFilteredRows() {
    
    this.filterData( this._shared.savedportfolioId, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
  }

  Project_OnClick()
  {
    this.filterData( this.selectedPortfolio, this.selectedProject, true, false,false);
    return;
    let projdata = this.ideasdata;
    if (this.selectedProject != "All Projects") {
      projdata = this.ideasdata.filter(x => x.proJ_NM == this.selectedProject);
    }
      else if(this.selectedProject == "All Projects" && this.selectedPortfolio != "All Portfolios" && this.selectedPortfolio != undefined && this.selectedPortfolio != null)
        projdata =  this.ideasdata.filter(x => x.portfoliO_NM == this.selectedPortfolio);
    this.RefreshTable(projdata);
  }

  Portfolio_OnClick()
  {
    let portfolioData;
    if(this.selectedPortfolio != "All Portfolios")
    {
      // portfolioData = this.ideasdata.filter(x => x.portfoliO_NM == this.selectedPortfolio);
      // this.RefreshTable(portfolioData);
      this.projects = this.ideasdata.filter(x => x.portfoliO_NM == this.selectedPortfolio).map(x => x.proJ_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
            
    }
    else if(this.selectedPortfolio == "All Portfolios")
    {
      //this.RefreshTable(this.ideasdata);
      this.projects = (this.ideasdata.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
    }
    this.filterData( this.selectedPortfolio, this.selectedProject, true, false,false);
  }

  setBeforeEffort()
  {
    if(this.EditInnovation.beforE_CASES_COUNT == undefined || this.EditInnovation.beforE_CASES_COUNT == null)
    {
      this.EditInnovation.beforE_EFFORT = null;
      return;
    }
    if(this.EditInnovation.beforE_TIME_TAKEN == undefined || this.EditInnovation.beforE_TIME_TAKEN == null)
    {
      this.EditInnovation.beforE_EFFORT = null;
      return;
    }

    let totalMins;
   
    if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 1)
    {
      this.EditInnovation.beforE_EFFORT = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString()))/ 60).toFixed(2);
      totalMins = parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString())
    }
    else if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 2)
    {
      this.EditInnovation.beforE_EFFORT = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString()))).toFixed(2);
      totalMins = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString()))) * 60;
    }
    else if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 3)
    {
      this.EditInnovation.beforE_EFFORT = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString())) * 8).toFixed(2);
      totalMins = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString()))) * 8 * 60;
    }

    
    return this.processCycleTime(totalMins);
  }


  setBeforeEffortPerYear()
  {
    if(this.EditInnovation.beforE_OCCOURANCE_COUNT == undefined || this.EditInnovation.beforE_OCCOURANCE_COUNT == null)
    {
      this.beforE_EFFORT_YEAR = null;
      return;
    }

    if(this.EditInnovation.beforE_TIME_TAKEN == undefined || this.EditInnovation.beforE_TIME_TAKEN == null)
    {
      this.beforE_EFFORT_YEAR = null;
      return;
    }

    let totalMins;
    if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 1)
    {
      this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString()))/ 60).toFixed(2);
      totalMins = parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *  
        this.EditInnovation.beforE_OCCOURANCE_COUNT 
    }
    else if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 2)
    {
      this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString()))).toFixed(2);
      totalMins = parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * 
         60 *  this.EditInnovation.beforE_OCCOURANCE_COUNT 
    }
    else if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 3)
    {
      this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString())) * 8).toFixed(2);      
      totalMins = parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * 
         8 * 60 * this.EditInnovation.beforE_OCCOURANCE_COUNT
    }

    return  this.processCycleTime(totalMins);

    //return (this.EditInnovation.beforE_OCCOURANCE_COUNT * parseFloat(this.EditInnovation.beforE_EFFORT)).toFixed(2);
  }


 setAfterEffortPerYear()
  {
    if(this.EditInnovation.afteR_OCCOURANCE_COUNT == undefined || this.EditInnovation.afteR_OCCOURANCE_COUNT == null)
    {
      this.afteR_EFFORT_YEAR = null;
      return;
    }

    if(this.EditInnovation.afteR_TIME_TAKEN == undefined || this.EditInnovation.afteR_TIME_TAKEN == null)
    {
      this.afteR_EFFORT_YEAR = null;
      return;
    }

    let totalMins;
    if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 1)
    {
      this.afteR_EFFORT_YEAR = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString()))/ 60).toFixed(2);
      totalMins = parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *       
        this.EditInnovation.afteR_OCCOURANCE_COUNT;
    }
    else if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 2)
    {
      this.afteR_EFFORT_YEAR = (parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString())).toFixed(2);      
      totalMins = parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * 
        60 * this.EditInnovation.afteR_OCCOURANCE_COUNT;
    }
    else if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 3)
    {
      this.afteR_EFFORT_YEAR = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString())) * 8).toFixed(2);      
      totalMins = parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * 
        8 * 60 * this.EditInnovation.afteR_OCCOURANCE_COUNT;
    }

    return  this.processCycleTime(totalMins);
    //(this.EditInnovation.afteR_OCCOURANCE_COUNT * parseFloat(this.EditInnovation.afteR_EFFORT)).toFixed(2);
  }

processCycleTime(value)
{
    var result ="0";
    var temph : number;
    var tempm : number;
    
    if(value < 0)
      value = value * (-1);
    
    if(value >= 0 && value < 60)
    {
      result = value +" min(s)";
    }
    else if(value >= 60 && value < 480)
    { 
      temph = Math.floor(value /60);
      result = temph+ " hr(s) ";
      tempm = value %60;
      if(tempm > 0)
        result = result + tempm +" mins"
    }
    else if(value >= 480)
    {
      var hour = Math.floor(value/ 60);
      temph = Math.floor(hour/8);
      result = temph +" day(s) "
      tempm = hour % 8;
      if(tempm > 0)
         result = result + tempm +" hr(s)"
    }
 
    return result;
 }


  setAfterEffort()
  {
    if(this.EditInnovation.afteR_CASES_COUNT == undefined || this.EditInnovation.afteR_CASES_COUNT == null)
    {
      this.EditInnovation.afteR_EFFORT = null;
      return;
    }
    if(this.EditInnovation.afteR_TIME_TAKEN == undefined || this.EditInnovation.afteR_TIME_TAKEN == null)
    {
      this.EditInnovation.afteR_EFFORT = null;
      return;   
    }
    
    let totalMins;
    if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 1)
    {
      this.EditInnovation.afteR_EFFORT = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString()))/ 60).toFixed(2);
      totalMins = parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString());
    }
    else if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 2)
    {
      this.EditInnovation.afteR_EFFORT = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString()))).toFixed(2);
      totalMins = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString()))) * 60;
    }
    else if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 3)
    {
      this.EditInnovation.afteR_EFFORT = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString())) * 8).toFixed(2);
      totalMins = (parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString())) * 8 * 60;
    }
     
    return this.processCycleTime(totalMins);
  }

  setBeforeCost()
  {
    if(this.EditInnovation.beforE_FTECOST_HOUR == undefined || this.EditInnovation.beforE_FTECOST_HOUR == null)
    {
      this.EditInnovation.beforE_COST = null;
      return;
    }
    if(this.EditInnovation.beforE_EFFORT == undefined || this.EditInnovation.beforE_EFFORT == null)
    {
      this.EditInnovation.beforE_COST = null;
      return;
    }

    this.EditInnovation.beforE_COST = (parseFloat(this.EditInnovation.beforE_FTECOST_HOUR.toString()) * parseFloat(this.EditInnovation.beforE_EFFORT)).toFixed(2);
    
    
    return this.EditInnovation.beforE_COST;
  }

  setBeforeCostPerYear()
  {

    if(this.EditInnovation.beforE_FTECOST_HOUR  == undefined || this.EditInnovation.beforE_FTECOST_HOUR  == null)
    {
      this.beforE_COST_YEAR = null;
      return;
    }

    if(this.beforE_EFFORT_YEAR == undefined || this.beforE_EFFORT_YEAR == null)
    {
      this.beforE_COST_YEAR = null;
      return;
    }

    // if(this.EditInnovation.beforE_OCCOURANCE_COUNT == undefined || this.EditInnovation.beforE_OCCOURANCE_COUNT == null)
    //   return;
    

    // let beforE_EFFORT_YEAR = "";
    
    // if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 1)
    // {
    //   this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString()))/ 60).toFixed(2);
      
    // }
    // else if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 2)
    // {
    //   this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString()))).toFixed(2);
      
    // }
    // else if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 3)
    // {
    //   this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString())) * 8).toFixed(2);      
    // }

    this.beforE_COST_YEAR = (parseFloat(this.EditInnovation.beforE_FTECOST_HOUR.toString()) * parseFloat(this.beforE_EFFORT_YEAR)).toFixed(2);

    return this.beforE_COST_YEAR;
    
  
 }


 setAfterCostPerYear()
  {

    if(this.EditInnovation.afteR_FTECOST_HOUR  == undefined || this.EditInnovation.afteR_FTECOST_HOUR  == null)
    {
      this.afteR_COST_YEAR = null;
      return;
    }

    if(this.afteR_EFFORT_YEAR == undefined || this.afteR_EFFORT_YEAR == null)
    {
      this.afteR_COST_YEAR = null;
      return;
    }

   //let afteR_EFFORT_YEAR = "";
   //let afteR_COST_YEAR = "";
    
    // if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 1)
    // {
    //   this.afteR_EFFORT_YEAR = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString()))/ 60).toFixed(2);
      
    // }
    // else if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 2)
    // {
    //   this.afteR_EFFORT_YEAR = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString()))).toFixed(2);
      
    // }
    // else if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 3)
    // {
    //   this.afteR_EFFORT_YEAR = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString())) * 8).toFixed(2);      
    // }

    this.afteR_COST_YEAR = (parseFloat(this.EditInnovation.afteR_FTECOST_HOUR.toString()) * parseFloat(this.afteR_EFFORT_YEAR)).toFixed(2);

    return this.afteR_COST_YEAR;
    
  
 }

  setAfterCost()
  {
    if(this.EditInnovation.afteR_FTECOST_HOUR == undefined || this.EditInnovation.afteR_FTECOST_HOUR == null)
    {
      this.EditInnovation.afteR_COST = null;
      return;
    }
    if(this.EditInnovation.afteR_EFFORT == undefined || this.EditInnovation.afteR_EFFORT == null)
    {
      this.EditInnovation.afteR_COST = null;
      return;
    }
    
    this.EditInnovation.afteR_COST = (parseFloat(this.EditInnovation.afteR_FTECOST_HOUR.toString()) * parseFloat(this.EditInnovation.afteR_EFFORT)).toFixed(2);
    return this.EditInnovation.afteR_COST;
  }

  setBeforeFTESpent()
  {
    if(this.EditInnovation.beforE_FTECOST_MONTH == undefined || this.EditInnovation.beforE_FTECOST_MONTH == null)
    {
      this.EditInnovation.beforE_FTESPENT_MONTH = null;
      return;
    }
    if(this.EditInnovation.beforE_EFFORT == undefined || this.EditInnovation.beforE_EFFORT == null)
    {
      this.EditInnovation.beforE_FTESPENT_MONTH = null;
      return;
    }

    this.EditInnovation.beforE_FTESPENT_MONTH = +(parseFloat(this.EditInnovation.beforE_EFFORT) / parseFloat(this.EditInnovation.beforE_FTECOST_MONTH.toString())).toFixed(2)

    return this.EditInnovation.beforE_FTESPENT_MONTH;
  }

  setBeforeFTESpentYear()
  {
    
    let beforE_FTESPENT_YEAR = 0;
    
    if(this.EditInnovation.beforE_FTECOST_MONTH == undefined || this.EditInnovation.beforE_FTECOST_MONTH == null)
      return beforE_FTESPENT_YEAR;

    if(this.beforE_EFFORT_YEAR == undefined || this.beforE_EFFORT_YEAR == null)
      return beforE_FTESPENT_YEAR;
      
    // if(this.EditInnovation.beforE_OCCOURANCE_COUNT == undefined || this.EditInnovation.beforE_OCCOURANCE_COUNT == null)
    //   return;

   //let beforE_EFFORT_YEAR = "";
    
    // if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 1)
    // {
    //   this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString()))/ 60).toFixed(2);
      
    // }
    // else if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 2)
    // {
    //   this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString()))).toFixed(2);
      
    // }
    // else if(this.EditInnovation.beforE_TIME_TAKEN_UOM == 3)
    // {
    //   this.beforE_EFFORT_YEAR = ((parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString())) * 8).toFixed(2);      
    // }

    //this.EditInnovation.beforE_FTESPENT_MONTH = +(parseFloat(this.EditInnovation.beforE_EFFORT) / parseFloat(this.EditInnovation.beforE_FTECOST_MONTH.toString())).toFixed(2)

    beforE_FTESPENT_YEAR = +(parseFloat(this.beforE_EFFORT_YEAR) / parseFloat(this.EditInnovation.beforE_FTECOST_MONTH.toString())).toFixed(2)

    return beforE_FTESPENT_YEAR;
  }

  setAfterFTESpentYear()
  {
    
    let afteR_FTESPENT_YEAR = 0;
    
    if(this.EditInnovation.afteR_FTECOST_MONTH == undefined || this.EditInnovation.afteR_FTECOST_MONTH == null)
      return afteR_FTESPENT_YEAR;
    if(this.afteR_EFFORT_YEAR == undefined || this.afteR_EFFORT_YEAR == null)
      return afteR_FTESPENT_YEAR;
    // if(this.EditInnovation.afteR_OCCOURANCE_COUNT == undefined || this.EditInnovation.afteR_OCCOURANCE_COUNT == null)
    //   return;

   //let afteR_EFFORT_YEAR = "";
    
    // if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 1)
    // {
    //   this.afteR_EFFORT_YEAR = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString()))/ 60).toFixed(2);
      
    // }
    // else if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 2)
    // {
    //   this.afteR_EFFORT_YEAR = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString()))).toFixed(2);
      
    // }
    // else if(this.EditInnovation.afteR_TIME_TAKEN_UOM == 3)
    // {
    //   this.afteR_EFFORT_YEAR = ((parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString())) * 8).toFixed(2);      
    // }

    //this.EditInnovation.beforE_FTESPENT_MONTH = +(parseFloat(this.EditInnovation.beforE_EFFORT) / parseFloat(this.EditInnovation.beforE_FTECOST_MONTH.toString())).toFixed(2)

    afteR_FTESPENT_YEAR = +(parseFloat(this.afteR_EFFORT_YEAR) / parseFloat(this.EditInnovation.afteR_FTECOST_MONTH.toString())).toFixed(2)

    return afteR_FTESPENT_YEAR;
  }

  setAfterFTESpent()
  {
    if(this.EditInnovation.afteR_FTECOST_MONTH == undefined || this.EditInnovation.afteR_FTECOST_MONTH == null)
    {
      this.EditInnovation.afteR_FTESPENT_MONTH = null;
      return;
    }
    if(this.EditInnovation.afteR_EFFORT == undefined || this.EditInnovation.afteR_EFFORT == null)
    {
      this.EditInnovation.afteR_FTECOST_MONTH = null;
      return;
    }

    this.EditInnovation.afteR_FTESPENT_MONTH = +(parseFloat(this.EditInnovation.afteR_EFFORT) / parseFloat(this.EditInnovation.afteR_FTECOST_MONTH.toString())).toFixed(2)

    return this.EditInnovation.afteR_FTESPENT_MONTH;
  }

  getinteralsavingsperyear()
  {
    if(this.EditInnovation.beforE_COST == undefined || this.EditInnovation.beforE_COST == null)
      return;
    if(this.EditInnovation.afteR_COST == undefined || this.EditInnovation.afteR_COST == null)
      return;
    if(this.EditInnovation.beforE_OCCOURANCE_COUNT == undefined || this.EditInnovation.beforE_OCCOURANCE_COUNT == null)
      return;
    if(this.EditInnovation.afteR_OCCOURANCE_COUNT == undefined || this.EditInnovation.afteR_OCCOURANCE_COUNT == null)
      return;

    // this.EditInnovation.internaL_SAVINGS = (((parseFloat(this.EditInnovation.beforE_COST) * this.EditInnovation.beforE_OCCOURANCE_COUNT) -
    // (parseFloat(this.EditInnovation.afteR_COST)) * this.EditInnovation.afteR_OCCOURANCE_COUNT).toFixed(2));

    this.EditInnovation.internaL_SAVINGS = (parseFloat(this.beforE_COST_YEAR) - parseFloat(this.afteR_COST_YEAR)).toFixed(2);
    
    return Math.abs(parseFloat(this.EditInnovation.internaL_SAVINGS));
  }

  getinteralsavingsperyearonetime()
  {
    if(this.EditInnovation.beforE_COST == undefined || this.EditInnovation.beforE_COST == null)
      return;
    if(this.EditInnovation.afteR_COST == undefined || this.EditInnovation.afteR_COST == null)
      return;
    this.EditInnovation.internaL_SAVINGS = (parseFloat(this.EditInnovation.beforE_COST) - parseFloat(this.EditInnovation.afteR_COST)).toFixed(2);
     
    return Math.abs(parseFloat(this.EditInnovation.internaL_SAVINGS));
  }

  getpersonhoursperyear()
  {
    if(this.beforE_EFFORT_YEAR == undefined || this.beforE_EFFORT_YEAR == null)
      return;
    if(this.afteR_EFFORT_YEAR == undefined || this.afteR_EFFORT_YEAR == null)
      return;
    // if(this.EditInnovation.beforE_OCCOURANCE_COUNT == undefined || this.EditInnovation.beforE_OCCOURANCE_COUNT == null)
    //   return;
    // if(this.EditInnovation.afteR_OCCOURANCE_COUNT == undefined || this.EditInnovation.afteR_OCCOURANCE_COUNT == null)
    //   return;
    // this.EditInnovation.customeR_PERSONHOUR_SAVINGS = parseFloat((((parseFloat(this.EditInnovation.beforE_EFFORT) * this.EditInnovation.beforE_OCCOURANCE_COUNT) - 
    // (parseFloat(this.EditInnovation.afteR_EFFORT)) * this.EditInnovation.afteR_OCCOURANCE_COUNT)).toFixed(2));
    // console.log("before effort", this.beforE_EFFORT_YEAR);
    // console.log("After effort", this.afteR_EFFORT_YEAR);
    this.EditInnovation.customeR_PERSONHOUR_SAVINGS = parseFloat(this.beforE_EFFORT_YEAR) - parseFloat(this.afteR_EFFORT_YEAR);
    
    return Math.abs(this.EditInnovation.customeR_PERSONHOUR_SAVINGS);
  }

  getpersonhoursperyearonetime()
  {
    if(this.EditInnovation.beforE_EFFORT == undefined || this.EditInnovation.beforE_EFFORT == null)
      return;
    if(this.EditInnovation.afteR_EFFORT == undefined || this.EditInnovation.afteR_EFFORT == null)
      return;
    this.EditInnovation.customeR_PERSONHOUR_SAVINGS = parseFloat((parseFloat(this.EditInnovation.beforE_EFFORT) - parseFloat(this.EditInnovation.afteR_EFFORT)).toFixed(2))

    return Math.abs(this.EditInnovation.customeR_PERSONHOUR_SAVINGS);
  }

  getAllIdeasDetails()
  {
    this._appservice.getIdeasDetails(this.selectedCust, this.allproj).subscribe(
      data => {
        
        this.ideasdata = data.output;
        
        this.ideasdata.sort((x,y) => {
          if(x.identifieD_DATE > y.identifieD_DATE) return -1;
          if(x.identifieD_DATE < y.identifieD_DATE) return 1;
          return 0;
        });
        this.projNames = data.projects;                     

        if (this.showIdea) {
          this.idea = this.ideasdata.filter(x => x.id == this.ideasid);
          this.EditRow_onClick(this.idea[0]);
        }
        
        
      },
      error => {},
      () => {
        this.filter_projectPortfolio(this.ideasdata);

        if(this._shared.savedportfolioId != 0)
        {
          this.ideasdata = this.ideasdata.filter(x => x.portfoliO_ID == this._shared.savedportfolioId);
          this.ideasdata.sort((x,y) => {
            if(x.identifieD_DATE > y.identifieD_DATE) return -1;
            if(x.identifieD_DATE < y.identifieD_DATE) return 1;
            return 0;
          });
        }

        if(this._shared.savedportfolioId != 0 && this.ideasdata.length  > 0)
          this.selectedPortfolio = this.ideasdata[0].portfoliO_NM;
        else
          this.selectedPortfolio = "All Portfolios";

        //this.RefreshTable(this.ideasdata);
        this.filterData( this.selectedPortfolio, this.selectedProject, true, false,false);
      }
    )
  }

  filter_projectPortfolio(input)
  {
    this.projects = (input.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
    this.portfolio = (input.map(x => x.portfoliO_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
    if(!this.portfolio.includes("All Portfolios"))
      this.portfolio.unshift("All Portfolios");
    if(!this.projects.includes("All Projects"))
      this.projects.unshift("All Projects");
  }

  getPortfolioName()
  {
   //console.log("Project id" + this.EditInnovation.projecT_ID);
    this._appservice.getPortfolioName(this.EditInnovation.projecT_ID).subscribe(
      data => {
        this.EditInnovation.portfoliO_NM = data;
      }
    )
  }

  
  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  processArea:string[];

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.getProcessAreaData();
    this.filteredIdeas = [];
    this.getGavsServices()
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newEditInnovation();
    this.EditInnovation.gavS_SERVICE = [];
    this.getAllIdeasDetails();
  }

  getProcessAreaData()
  {
    this._appservice.getProcessArea(this.input_projectid).subscribe(data => { this.processArea = data; }, error => { this._util.serviceError(error); })
  }

  GetFilteredIdeas(event :any)
  {
    this._appservice.getIdeasFromProcessArea(event).subscribe(
      data => {
        this.filteredIdeas = data;
        this.dataSource2 =  new MatTableDataSource<InnovationModelExt>(this.filteredIdeas);
       }, error => { this._util.serviceError(error); })
  }

  getGavsServices()
  {
    this._appservice.getGavsServices().subscribe(
      data => {
        this.gavsServices = data;
        this.gavsServices.forEach((element ,index) => {
          this.EditInnovation.gavS_SERVICE.push(new GAVSService()) 
          this.EditInnovation.gavS_SERVICE[index].servicE_ID = element.servicE_ID
        });
       }, error => { this._util.serviceError(error); })
  }

  EditRow_onClick(element) {

    if (this.showIdea)
      this.EditInnovation = element;
    else
      this.EditInnovation = Object.assign({}, element);

    if (this.EditInnovation.status.toLowerCase() == 'completed' || this.EditInnovation.status.toLowerCase() == 'cancelled' || this.EditInnovation.status.toLowerCase() == 'suspended')
      this.disableSave = true;
    else
      this.disableSave = false;


    if (this.showIdea)
      this.disableSave = true;

    
    if(this.EditInnovation.iS_ONETIME == undefined)
    {
      this.EditInnovation.iS_ONETIME = false;
    }

     
 
    if(this.EditInnovation.beforE_CYCLE_TIME_UOM == null)
      this.EditInnovation.beforE_CYCLE_TIME_UOM = 1;

    if(this.EditInnovation.beforE_LEAD_TIME_UOM == null)
      this.EditInnovation.beforE_LEAD_TIME_UOM = 1;

    if(this.EditInnovation.beforE_TIME_TAKEN_UOM == null)
      this.EditInnovation.beforE_TIME_TAKEN_UOM = 1;


    if(this.EditInnovation.afteR_CYCLE_TIME_UOM == null)
      this.EditInnovation.afteR_CYCLE_TIME_UOM = 1;

    if(this.EditInnovation.afteR_LEAD_TIME_UOM == null)
      this.EditInnovation.afteR_LEAD_TIME_UOM = 1;

    if(this.EditInnovation.afteR_TIME_TAKEN_UOM == null)
      this.EditInnovation.afteR_TIME_TAKEN_UOM = 1;


    this.status = this.EditInnovation.status;

    this.GetFilteredIdeas(element.area)
    this.Edit_onClick();
  }

  showIdeaMatrix()
  {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true,
    dialogConfig.data = {
      processArea: "all"
    },

      dialogConfig.maxWidth = "100%"
      dialogConfig.height ="100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(IdeasInnovationMatrixComponent, dialogConfig);
    // dialogRef.updateSize('100%', '100%');
     dialogRef.updatePosition({top :'10px'});
    dialogRef.afterClosed().subscribe(result => {
//console.log(`Dialog result: ${result}`);
    });
  }

  SaveRAG_onClick(rag) {
    if (rag === "" || rag === null) {
      alert("Please select RAG");
      return;
    }
    this._util.updateRAG(this.input_rag, 'innovation', rag);
    let ragdetails = {
      PROJECT_ID: this.input_projectid,
      CATEGORY: 'innovation',
      RAG: rag,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: this._util.getDate(new Date())
    };
    this.service_updateRag(ragdetails);
  }

  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteInnovation(element).subscribe(data => 
        {
          alert('Data deleted successfully');
        },
        error => { this._util.serviceError(error);
          this.errorStr = error.error
          alert(this.errorStr)
          this.errorStr = '';
          this.getAllIdeasDetails();
        });
      this.ideasdata.splice(this.ideasdata.indexOf(element), 1);
      this.ideasdata.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
      this.filterData( this.selectedPortfolio, this.selectedProject, true, false,false);
    } 
  }

  Use_Element(element)
  {
    this.EditInnovation.description = element.description;
    this.EditInnovation.referencE_IDEA_ID = element.id
  }
 
  // onKey(event: any) {
  //   let desc = event.target.value;
  //   if(desc != "")
  //   {
  //     this.filtered1Ideas = this.filteredIdeas.filter(t=>t.description.toLowerCase().includes(desc.toLowerCase()));
  //     this.dataSource2 = new MatTableDataSource<InnovationModel>(this.filtered1Ideas);
  //   }  
  //   else
  //   this.filteredIdeas = [];
  // }
  RefreshTable(input) {
    this.dataSource = new MatTableDataSource<any>(input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }

    let tDate = new Date(this.EditInnovation.targeT_DATE);
    tDate.setHours(0, 0, 0 ,0);

    let iDate = new Date(this.EditInnovation.identifieD_DATE);
    iDate.setHours(0, 0, 0, 0);

    if(!this.IsDateValid(tDate, iDate))
    {
      alert('Please enter valid target and identified dates');
      return;
    }

    let adate = this.EditInnovation.actuaL_DATE;

    if(this.EditInnovation.actuaL_DATE != null && this.EditInnovation.actuaL_DATE != undefined)
    {
        adate = new Date(this.EditInnovation.actuaL_DATE);
        adate.setHours(0, 0, 0, 0);

        if(!this.IsCompletionDateValid(adate , iDate))
        {
          alert('Please enter valid identified and actual dates');
          return;
        }
    }

    let projectName;
      projectName = this.projNames.find(x => x.proJ_ID == this.EditInnovation.projecT_ID);
    if(projectName != undefined && projectName != null)
         this.EditInnovation.proJ_NM = projectName.proJ_NM

    if (this.EditInnovation.id === 0 || this.EditInnovation.id === undefined) {
      this.EditInnovation.id = 0;
      this.EditInnovation.rag = 'green';
      this.EditInnovation.createD_BY = localStorage.getItem('empid');
      this.EditInnovation.createD_DATE = new Date();
      this.EditInnovation.updateD_BY = localStorage.getItem('empid');
      this.EditInnovation.updateD_DATE = new Date();
      // this._appservice.addInnovation(this.EditInnovation)
      // .subscribe(data => {
      //   this.input.push(JSON.parse(JSON.stringify(data)));
      //   this.readonlymode = true;
      //   this.editmode = false;
      //   this.RefreshTable();
      //   alert("Improvements/Ideas added successfully")
      // }, error => { this._util.serviceError(error); });
      this.service_addInnovation(this.EditInnovation);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      this.EditInnovation.updateD_BY = localStorage.getItem('empid');
      this.EditInnovation.updateD_DATE = new Date();
      this._appservice.updateInnovation(this.EditInnovation)
        .subscribe(data => {
          alert('Data updated successfully');
          this.getAllIdeasDetails();
        }, error => { this._util.serviceError(error);
          this.errorStr = error.error
          alert(this.errorStr)
          this.errorStr = '';
        });
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditInnovation();
  }

  IsCompletionDateValid(completionDate, identifiedDate)
  {
    let currentDate = new Date();
      currentDate.setHours(0, 0, 0 ,0);

    if(completionDate != null && completionDate != undefined)
    {
      if(completionDate >= identifiedDate && completionDate <= currentDate && identifiedDate <= currentDate )
        return true;
      else
        return false;
    }
    else
     return true;
    
  }

  IsDateValid(targetDate, identifiedDate)
  {
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0 ,0);
      if(targetDate >= identifiedDate && identifiedDate <= currentDate)
        return true;
      else
        return false;
  }
  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
  service_updateRag(ragdetails) {
    let apiuri: string = environment.webapiuri + 'UpdateRags';
    this._http.post(apiuri, ragdetails, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  service_addInnovation(innovation) {
    let apiuri: string = environment.webapiuri + 'AddInnovation';
    this._http.post(apiuri, innovation, { headers: this.GetAuthHeader() })
      .subscribe(data => {

        console.log(JSON.parse(data.text()));

        this.ideasdata.push(JSON.parse(data.text()));
        this.ideasdata.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
        alert('Data added successfully');
        //this.RefreshTable(this.ideasdata);
        this.filterData( this.selectedPortfolio, this.selectedProject, true, false,false)
      }, error => { this._util.serviceError(error); 
        this.errorStr = error._body
        alert(this.errorStr)
        this.errorStr = '';
      });
  }
  service_updateinnovation(innovation) {
    let apiuri: string = environment.webapiuri + 'UpdateInnovation';
    this._http.post(apiuri, innovation, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.ideasdata.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
        alert('Data updated successfully');
        //this.RefreshTable(this.ideasdata);
        this.filterData( this.selectedPortfolio, this.selectedProject, true, false,false);
      }, error => { this._util.serviceError(error);
      
        this.errorStr = error._body
        alert(this.errorStr)
        this.errorStr = '';
      });
  }



  //**********************************************
  newEditInnovation() {
    this.EditInnovation = new InnovationModelExt();
  }
  bShowFilter: boolean = true;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }
  Filter_onChange($event) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filterData( this.selectedPortfolio, this.selectedProject, true, false,false)
    return;
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  uncheckOthers()
  {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }
  
  projectSelected($event)  {
    this.filterData( this.selectedPortfolio,  Array.of(  this.selectedProject), true, false,false);
  }
  
  
  filteredData :any;
  filterCriteria:any;
  filterData(  portfolioId: any, projectId: any, allchecked: any, pastDue: any, dueforClosure: any) {
    
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.ideasdata);

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    // if (portfolioId != null && portfolioId != 0 && portfolioId !="All Portfolios") {
    //   this.filteredData = this.filteredData.filter(x => x.portfoliO_ID == portfolioId || x.portfoliO_NM == portfolioId);
    // }
    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length>0  ) {
      this.filteredData = this.filteredData.filter(x => this._shared.selectedProjects.indexOf(x.projecT_ID ) >=0 );
    }
    if (allchecked) {

    }
    else {
      this.filteredData = this.filteredData.filter(x => x.status != 'Completed' );
     
      if (pastDue && dueforClosure) { }
      else if(!pastDue && !dueforClosure){
        //this.AllChecked=true;
        this.filteredData =[];
      }
      else if (pastDue) {
        this.filteredData = this.filteredData.filter(x => new Date(x.targeT_DATE) <= currentDate);
      }
      else if (dueforClosure) {
        this.filteredData = this.filteredData.filter(x => new Date(x.targeT_DATE) > currentDate);
      }
    }
   
    this.RefreshTable(this.filteredData);
  }
}

