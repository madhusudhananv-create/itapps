import { Component, OnInit, Input, ViewChild ,ChangeDetectorRef, ElementRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { LayoutService } from '../../layout/layout.service';
import { MatPaginator, MatTableDataSource, MatSort, MatDialogConfig, MatDialog } from '@angular/material';
//import { ActionitemModel, ActionitemModelNew } from '../../../models/actionitem-model';
import { ProjectsModel } from '../../../models/projects-model';
import {enumRoles} from '../../../Shared/enum'
import { AccessControl } from '../../../Shared/accessControl';
import { BestPracticesModel ,GAVSService, BestPracticesModelExt} from '../../../models/best-practices-model';
import { environment } from '../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { map, startWith } from 'rxjs/operators';
import { BestpracticeMatrixComponent } from '../../../bestpractice-matrix/bestpractice-matrix.component';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { LayoutComponent } from '../layout.component';
import { projecT_INFO, cusT_GROUP, portfoliO_GROUP } from '../../../models/customer-portfolio-project-model';
import { forEach } from '@angular/router/src/utils/collection';
import { SharedService } from '../../../Shared/shared.service';

@Component({
  selector: 'app-best-practices-page',
  templateUrl: './best-practices-page.component.html',
  styleUrls: ['./best-practices-page.component.scss']
})
export class BestPracticesPageComponent implements OnInit {  
  actionItemData: any;
  bShowFilter: boolean = true;
  bDisabled : boolean = true;
  bVisible : boolean = true;
  
  toggle : string = "Hide" ;
  result : any;
  selectedCust: string;
  private sub : any;
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  selectedProject: string = "All Projects";
  selectedPortfolio : string = "All Portfolios";    
  editmode: boolean = false;
  readonlymode: boolean = true;
  projects : string[] = [];
  projNames : ProjectsModel[];
  //EditActionitem: ActionitemModelNew = new ActionitemModelNew;
  dataSource = new MatTableDataSource(this.result);
  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['index', 'portfoliO_NM','proJ_NM','servicE_AREA','procesS_AREA','process','description', 'reporteD_BY', 'reporteD_DATE', 'revieweD_BY', 'revieweD_DATE', 'approveD_BY', 'approveD_DATE',  'edit', 'delete'];
  
  displayedColumns1 = ['index1', 'description1', 'reporteD_BY1', 'reporteD_DATE1', 'use'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('bppaginator') paginator1: MatPaginator;
  @ViewChild('bppaginator1') paginator2: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) sort1: MatSort;
  @ViewChild(MatSort) sort2: MatSort;
  AllBestPractices: any;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }  
  portfolio: string[] = [];
  allcust : boolean = false;
  allproj : boolean = false;
  flag : boolean = false;
  ownerList: EmpInfoModel[];
  ownermodel : EmpInfoModel = new EmpInfoModel();  
  constructor(private route: ActivatedRoute,private _http: Http, private _util: myUtility,public _layoutService:LayoutService, private _layout : LayoutComponent, private _appservice: AppsService, private _access: AccessControl, private changeDetectorRefs: ChangeDetectorRef, private _spinner: Ng4LoadingSpinnerService, public dialog: MatDialog,private _shared: SharedService) { }
//  @Input('ProjectId') input_projectid: string;
  //@Input('CustomerId') input_customerid: string; 
  
  
  
  dataSource1: MatTableDataSource<BestPracticesModel>
  dataSource2: MatTableDataSource<BestPracticesModel>
  ddIndustryVertical: any;
  ddClientServiceArea: string[];
  clientservicearea: string;
  myControl = new FormControl();  
  myControlReview = new FormControl();  
  myControlApprove = new FormControl();  
  ddProcess: any;
  ddProcessArea: any;
  ddServiceArea: any;
  ddServiceAreaMap : any;
  projectProcess: any[];
  projectProcessArea:any[];
  ddClientITBusiness: any;  
  ddstatus: any
  //  editBestPractice: BestPracticesModel = new BestPracticesModel()
  editBestPractice:BestPracticesModelExt = new BestPracticesModelExt();
  filteredBestpractices: BestPracticesModelExt[] = [];
  filterSearchedBestpractices: BestPracticesModelExt[] = [];
  projectsForAPortfolio : any;
  portfolioList : cusT_GROUP[] = [];
  //filteredOptions: Observable<EmpInfoModel[]>;
  filteredOptions: Observable<string[]>;
  filteredOptionsRcsm: Observable<string[]>;
  filteredOptionsAcsm: Observable<string[]>;
  empinfo: EmpInfoModel[] = [];
  empinfocsm: EmpInfoModel[] = [];
  empinfopmcsm: EmpInfoModel[] = [];
  customerNamesEmpNames:string[] = [];
  pmcsminfo:string[] = [];
  csminfo:string[] = [];
  empName: any;
  csmReviewName: any;
  csmApproveName: any;
  projIds: string[] = [];
  filterCriteria:any;
  filteredData: any;
  AllChecked: boolean;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;

  ngOnInit() {

    this.service_GetEmpInfo();  
    this.service_GetAllCustomerNamesEmpNames();
    //this.getBestPracticesforProject()
    let role = localStorage.getItem('role');
    if(role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

   if (role == enumRoles.CustomerSuccessManager.toString() || role == enumRoles.ProjectManager.toString())
      this.bDisabled = false;
 
  
    this.sub = this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];      
    });

    

    if(!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'proJ_NM','servicE_AREA','procesS_AREA','process','description', 'reporteD_BY', 'reporteD_DATE', 'revieweD_BY', 'revieweD_DATE', 'approveD_BY', 'approveD_DATE', 'edit', 'delete'];
      
    this.getAllProtofolio();
    this.getAllBestPracticesForCustomer();
    this.getAllProjectsForCustomer();
    this.RefreshTableForProject(this.AllBestPractices);    
    this.filteredOptions = this.myControl.valueChanges
    .pipe(
      startWith<string>(''),
     map(value => typeof value === 'string' ? value : value),
     map(name => name ? this._filter(name) : this.customerNamesEmpNames.slice())
    );

    this.filteredOptionsRcsm = this.myControlReview.valueChanges
    .pipe(
    startWith<string >(''),
    map(value => typeof value === 'string' ? value : value),
    map(pmcsmRename => pmcsmRename ? this._filterReview(pmcsmRename) : this.pmcsminfo.slice())
    );  

    this.filteredOptionsAcsm = this.myControlApprove.valueChanges
    .pipe(
    startWith<string>(''),
    map(valuecsm => typeof valuecsm === 'string' ? valuecsm : valuecsm),
    map(csmAppname => csmAppname ? this._filterApprove(csmAppname) : this.csminfo.slice())
    );  
  
    
  }
  private _filter(value: any): any[] {
    const filterValue = value.toLowerCase();
    return this.customerNamesEmpNames.filter(option => option.toLowerCase().includes(filterValue));
  }
  private _filterReview(value: string): string[] {
    const filterValuepmcsm = value.toLowerCase();
    return this.pmcsminfo.filter(pmcsmoption => pmcsmoption.toLowerCase().includes(filterValuepmcsm));
  }
  private _filterApprove(value: string): string[] {
    const filterValueAcsm = value.toLowerCase();
    return this.csminfo.filter(appoption => appoption.toLowerCase().includes(filterValueAcsm));
  }
  displayReporteByFn(user?: string): string | undefined {    
    if(!this.editmode)
      return user ? user : undefined;
    else 
      return this.empName;
  }
  displayReviewFn(user?: string): string | undefined {    
    if(!this.editmode)
      return user ? user : undefined;
    else 
      return this.csmReviewName;
  }
  displayApproveFn(user?: string): string | undefined {    
    if(!this.editmode)
      return user ? user : undefined;
    else 
      return this.csmApproveName;
  } 
  service_GetAllCustomerNamesEmpNames() {
    this._appservice.getAllCustomerNamesEmpNames().subscribe(data => {
      this.customerNamesEmpNames = data;
    }, error => { this._util.serviceError(error); });
  }
  service_GetEmpInfo() {
    // this._appservice.getEmpInfo().subscribe(data => {    
    //   this.empinfocsm = data.filter(x => x.csM_TITLE_ID == 1 && x.projecT_ID == this.editBestPractice.projecT_ID);
    //   this.csminfo = this.empinfocsm.map(x => x.frsT_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
    // }, error => { this._util.serviceError(error); });
    this.projIds[0] = this.editBestPractice.projecT_ID;
    this._appservice.getProjectResourcebyProjIds(this.projIds).subscribe(data => {
      this.empinfocsm = data.filter(x => x.csM_TITLE_ID == 1);
      this.empinfopmcsm = data.filter(x => x.csM_TITLE_ID == 1 || x.csM_TITLE_ID == 2);      
        this.pmcsminfo = this.empinfopmcsm.map(x => x.frsT_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.csminfo = this.empinfocsm.map(x => x.frsT_NM).filter((x, i, a) => a.indexOf(x) == i).sort();        
      }, error => { this._util.serviceError(error); });
  }
 
  getAllProtofolio()
  {
    this._appservice.getCustomerPortfolioProjectsList(localStorage.getItem('empid'), this.allproj).subscribe(data => {
      this._layoutService.custGroup = data;
    },
      error => { this._util.serviceError(error); },
      () => {       
        this.portfolioList = this._layoutService.custGroup.filter(x => x.cusT_ID == this.selectedCust);              
      if(!this._util.IsPremier(this.selectedCust))
      {
        this.getSelectedPortfolioProjects();
      }
     }      
    )  
  }
  getSelectedPortfolioProjects()
  {
    // if(this._util.IsPremier(this.selectedCust))
    // {
    //   this.projectsForAPortfolio = this.portfolioList[0].portfoliO_GROUP.filter(x => x.portfoliO_ID == this.editBestPractice.portfoliO_ID)[0].projecT_INFO;
    //   if(this.projectsForAPortfolio.length == 1)
    //   this.editBestPractice.portfoliO_ID = this.portfolioList[0].portfoliO_GROUP[0].portfoliO_ID; 
    // }
    // else
    // {
    //   this.projectsForAPortfolio = this.portfolioList[0].projecT_INFO;//.filter(x => x.portfoliO_ID == null)[0];
    //   if(this.projectsForAPortfolio.length == 1)
    //   this.editBestPractice.projecT_ID = this.portfolioList[0].projecT_INFO[0].proJ_ID; 
    // //  this.getotherDetails(this.editBestPractice);
    // }   




  }
  
  getAllBestPracticesForCustomer()
  {
    if(this.selectedCust ==undefined)
         return;
      this._appservice.getAllBestPracticesForCustomer(this.selectedCust, this.allproj).subscribe(
        data => {
          if(data==undefined || data==null) return;
          this.AllBestPractices = data;
          let role = localStorage.getItem('role');
          if (role == enumRoles.Customer.toString())
          {
            // this._appservice.getEmpInfo().subscribe(data => {    
            //     this.empinfo = data.filter(x => x.csM_TITLE_ID == 3 && x.projecT_ID == this.editBestPractice.projecT_ID);
            // })
            // this.AllBestPractices = data.filter(x => x.STATUS.ToUpper() != "PLANNED" && x.STATUS.ToUpper() != "STARTED" && x.STATUS.ToUpper() != "COMPLETED");           
            this.AllBestPractices = data.filter(x => x.STATUS.ToUpper() == "PLANNED" && x.STATUS.ToUpper() == "STARTED" && x.STATUS.ToUpper() == "COMPLETED")
          }

          this.RefreshTableForProject(this.AllBestPractices);          
        if(this.AllBestPractices.length == 0)
          this.bShowFilter = false;
        },
        error => {},
        () => {
          this.filter_projectPortfolio(this.AllBestPractices);
          this.RefreshTableForProject(this.AllBestPractices);
        });
  }
  
  getAllProjectsForCustomer()
  {
    // let role = localStorage.getItem('role');

    // if(role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
    //   this.allcust = true;
    // else
    //   this.allcust = false;

    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allproj).subscribe(
      data => {
        this.projNames = data;
        // if(!this._util.IsPremier(this.selectedCust))
        // {this.projectsForAPortfolio =  this.projNames;}
      },
      error => {
        this._util.serviceError(error);
      }
    )    
  }

  getPortfolioName()
  {
    this.getSelectedPortfolioProjects();
    this._appservice.getPortfolioName(this.editBestPractice.projecT_ID).subscribe(
      data => {
        this.editBestPractice.portfoliO_NM = data;
      }
    )
  }  

  
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.changeDetectorRefs.detectChanges();
  }

  ngOnChanges() {
    this.getBestPracticesforProject();
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

  bestpracticeData:BestPracticesModel[] = [];
  getBestPracticesforProject() {
    this._spinner.show();
    this.editmode = false;
    this.readonlymode = true;
    this._appservice.getBestPracticesbyProjId(this.selectedProject).subscribe(data => {
      let newdadta = data.bestpractice.filter(t=> t.status != "Not Applicable");
      this.dataSource1 = new MatTableDataSource<BestPracticesModel>(newdadta)
      this.bestpracticeData = newdadta;
      this.dataSource1.paginator = this.paginator1;
      this.dataSource1.sort = this.sort1;
      this.editBestPractice = new BestPracticesModelExt();    
      this.getotherDetails(null);
      this.filteredBestpractices = []
      this._spinner.hide();
    }, error => { this._util.serviceError(error); })
  }
 
  getotherDetails(element : BestPracticesModelExt) {
    this.getPortfolioName();
    this.getddValues(element);    
  } 
 
  getddValues(element : BestPracticesModelExt)
  {
    this._appservice.getBestPracticesbyProjId(this.editBestPractice.projecT_ID).subscribe(data => {
      let newdadta = data.bestpractice.filter(t=> t.status != "Not Applicable");
      this.ddIndustryVertical = data.ddIndVertical;
      this.ddClientITBusiness = data.ddClientITBusiness;      
      this.ddServiceArea = data.ddServiceArea;
      this.ddServiceAreaMap = data.ddServiceAreaMap;
      this.ddProcessArea = data.ddProcessArea
      this.ddProcess = data.ddProcess;
      this.ddstatus = data.ddStatus; 
      if (element != null)
      {        
        if (element.servicE_AREA != null && this.ddServiceArea.length >0)
        {
          let sid =null;
          sid=this.ddServiceArea.find(x => x.title == element.servicE_AREA).id;
          this.editBestPractice.servicE_AREA_ID= sid;
        }        
        this.loadProcessAreaswithProcess();        
        if (element.procesS_AREA != null && this.ddProcessArea.length >0 )
        {
          let pAreaid =null;
          pAreaid =this.ddProcessArea.find(x => x.title == element.procesS_AREA).id;
          this.editBestPractice.procesS_AREA_ID= pAreaid;
        }
       
        if (element.process !=null && this.ddProcess.length >0 )
        {
        this.editBestPractice.procesS_ID= this.ddProcess.find(x => x.title == element.process).id;
        }
      }
      else
      { this.loadProcessAreaswithProcess();}
      this.service_GetEmpInfo();
    }, error => { })
  }


  Edit_onClick() {
    this.editBestPractice = new BestPracticesModelExt();
    this.readonlymode = false;
    this.editmode = true;
    this.filteredBestpractices = [];
  } 
  GetFilteredBestPractices(event: any) {
    this._appservice.getBestPracticesFromDescription(event).subscribe(
      data => {
        console.log("Filtered", data);
        this.filteredBestpractices = data;
        this.dataSource2 = new MatTableDataSource<BestPracticesModelExt>(this.filteredBestpractices);
      }, error => { this._util.serviceError(error); })
  }
  // onKey(event: any) {
  //   let desc = event.target.value;
  //   if(desc != "")
  //   {
  //     this.filterSearchedBestpractices = this.filteredBestpractices.filter(t=>t.description.toLowerCase().includes(desc.toLowerCase()));
  //     this.dataSource2 = new MatTableDataSource<BestPracticesModel>(this.filterSearchedBestpractices);
  //   }  
  //   else
  //   this.filterSearchedBestpractices = [];
  // }
  _focus(input) {
    if (input.readOnly == false)
    {
      let dtval;
      if(input.name == 'dtReportedDate')
      {
        dtval = this.editBestPractice.reporteD_BY;      
      }
      else if(input.name == 'dtReviewedDate')
      {
        dtval = this.editBestPractice.revieweD_BY;
      }
      else if (input.name == 'dtApprovedDate')
      {
        dtval = this.editBestPractice.approveD_BY;
      }     
      if (dtval.length >0 && input.value.length==0)
        {
          //this.editBestPractice.revieweD_DATE = new Date();
          dtval= new Date();
          if(input.name == 'dtReportedDate')
          {
            this.editBestPractice.reporteD_DATE = new Date();      
          }
          else if(input.name == 'dtReviewedDate')
          {
            this.editBestPractice.revieweD_DATE = new Date();
          }
          else if (input.name == 'dtApprovedDate')
          {
            this.editBestPractice.approveD_DATE = new Date();
          }  
        }
      }        
  }
  showBestPracMatrix() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      processArea: "all",
      serviceArea: "all"
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(BestpracticeMatrixComponent, dialogConfig);
    // dialogRef.updateSize('100%', '100%');
    dialogRef.updatePosition({ top: '10px' });
    dialogRef.afterClosed().subscribe(result => {
     // console.log(`Dialog result: ${result}`);
    });
  }
  Portfolio_OnClick()
  {
    let portfolioData;
    if(this.selectedPortfolio != "All Portfolios")
    {
          portfolioData = this.AllBestPractices.filter(x => x.portfoliO_NM == this.selectedPortfolio);
          this.RefreshTableForProject(portfolioData);
          this.projects = this.AllBestPractices.filter(x => x.portfoliO_NM == this.selectedPortfolio).map(x => x.proJ_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
          this.projects.unshift("All Projects");
            
    }
    else if(this.selectedPortfolio == "All Portfolios")
    {
      this.RefreshTableForProject(this.AllBestPractices);
      this.projects = (this.AllBestPractices.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
    }
  }
  Project_OnClick()
  {
    let projdata = this.AllBestPractices;
    if (this.selectedProject != "All Projects") {
      projdata = this.AllBestPractices.filter(x => x.proJ_NM == this.selectedProject);
    }
      else if(this.selectedProject == "All Projects" && this.selectedPortfolio != "All Portfolios" && this.selectedPortfolio != undefined && this.selectedPortfolio != null)
        projdata =  this.AllBestPractices.filter(x => x.portfoliO_NM == this.selectedPortfolio);
    this.RefreshTableForProject(projdata);
  }
 
loadProcessAreaswithProcess()
{
  let servicemap =  this.ddServiceAreaMap.filter(x => x.servicE_AREA_ID == this.editBestPractice.servicE_AREA_ID);           
    this.projectProcess = [];
    this.projectProcessArea = []; 
   /* servicemap.forEach(obj => {    
      this.projectProcess.push(this.ddProcess.filter(t => t.id == obj.procesS_ID)[0]);    
      console.log("projectProcess",this.projectProcess);         
    });  */

    servicemap.forEach(obj => {
      const process = this.ddProcess.find(t => t.id == obj.procesS_ID);
      if (process && !this.projectProcess.some(p => p.id === process.id)) {
        this.projectProcess.push(process);
      }
    }); 

    if(this.projectProcess.length == 1)
     this.editBestPractice.procesS_ID = this.projectProcess[0].id;   

    this.projectProcess.forEach(obj => {
      this.projectProcessArea.push(this.ddProcessArea.filter(x => x.id == obj.procesS_AREA_ID)[0]);       
    }); 
    if(this.projectProcessArea.length == 1)
     this.editBestPractice.procesS_AREA_ID = this.projectProcessArea[0].id; 
}
  
  RefreshTableForProject(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
 
  sendMailToCSM(bestpractiseForm)
  {
    this.SubmitForm(bestpractiseForm.valid);
    if(bestpractiseForm.valid)
    {
      // console.log("this.editBestPractice",this.editBestPractice);
      this._appservice.sendMailToCSM(this.selectedProject, this.selectedCust, this.editBestPractice).subscribe(data => { this.dataSource.paginator=this.paginator;this.dataSource.sort=this.sort; }, error => { this._util.serviceError(error); });
    }
    this.editBestPractice = new BestPracticesModelExt();
    this.changeDetectorRefs.detectChanges();
  }

  Use_Element(element) {
    this.editBestPractice.description = element.description;
    this.editBestPractice.referencE_BEST_PRACTICE_ID = element.id
  }
  
  
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.editBestPractice = new BestPracticesModelExt();
    this.getAllBestPracticesForCustomer();
    this.filteredBestpractices = [];
  }
  
  Close_onClick(){    
    this.bVisible = false;
  }

  EditRow_onClick(element : BestPracticesModelExt) {    
    if (element.approveD_BY != null)
    {
      if (element.approveD_BY.length >0)
      {
        //return;
      }
    }
    this.bVisible = true;
    // console.log("element",element);
    this.editBestPractice = element;   
    this.GetFilteredBestPractices(element.procesS_AREA)
    this.getotherDetails(element);  
    this.editmode = true;
    this.readonlymode = false;       
  } 


  DeleteRow_onClick(element): void {
    if (element.approveD_BY != null)
    {
      if (element.approveD_BY.length >0)
      {
        return;
      }
    }
    if (confirm('Are you sure you want to delete the record?')) {      
      this._appservice.deleteBestPractices(element).subscribe(data => { 
        this.getBestPracticesforProject();
       }, error => { this._util.serviceError(error); },
      () => {
        this.AllBestPractices.splice(this.AllBestPractices.indexOf(element), 1);
        this.AllBestPractices.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
        this.RefreshTableForProject(this.AllBestPractices);
     });
    } else {

    }   

    

  }
  GetBPIndustryVertical(depT_ID) {
    this.ddIndustryVertical.dep
  }
  // AddNewType() 
  // {
  //   if (this.clientservicearea != "" && this.clientservicearea != undefined) {
  //     if(!this.ddClientServiceArea.includes(this.clientservicearea))
  //     this.ddClientServiceArea.push(this.clientservicearea);
  //     this.editBestPractice.clienT_SERVICE_AREA = this.clientservicearea;
  //   }
  // }
  // ClearType() 
  // {
  //   this.clientservicearea = "";
  // }
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    
    if (this.editBestPractice.id === 0 || this.editBestPractice.id === undefined) {      
      this.editBestPractice.cusT_ID = this.selectedCust;
      this.editBestPractice.proJ_NM = this.projNames.find(x => x.proJ_ID == this.editBestPractice.projecT_ID).proJ_NM;
      this.editBestPractice.createD_BY = localStorage.getItem('empid');
      this.editBestPractice.createD_DATE = new Date();
      this.editBestPractice.updateD_BY = localStorage.getItem('empid');
      this.editBestPractice.updateD_DATE = new Date();  
      this.editBestPractice.servicE_AREA= this.ddServiceArea.find(x => x.id == this.editBestPractice.servicE_AREA_ID).title;
      this.editBestPractice.procesS_AREA= this.ddProcessArea.find(x => x.id == this.editBestPractice.procesS_AREA_ID).title;
      let process = this.ddProcess.find(x => x.id == this.editBestPractice.procesS_ID && x.procesS_AREA_ID == this.editBestPractice.procesS_AREA_ID);
      if(process != undefined)
      this.editBestPractice.process = process.title;
      else
      this.editBestPractice.process = "";
      this.editBestPractice.reporteD_BY= this.myControl.value;
      this.editBestPractice.revieweD_BY=this.myControlReview.value;
      this.editBestPractice.approveD_BY=this.myControlApprove.value;     
      this.service_addBestPractices(this.editBestPractice);
      this.readonlymode = true;
      this.editmode = false;

    }
    else {     

      this.editBestPractice.servicE_AREA= this.ddServiceArea.find(x => x.id == this.editBestPractice.servicE_AREA_ID).title;
      this.editBestPractice.procesS_AREA= this.ddProcessArea.find(x => x.id == this.editBestPractice.procesS_AREA_ID).title;
      this.editBestPractice.process= this.ddProcess.find(x => x.id == this.editBestPractice.procesS_ID && x.procesS_AREA_ID == this.editBestPractice.procesS_AREA_ID).title;
      this.editBestPractice.reporteD_BY= this.myControl.value;
      this.editBestPractice.revieweD_BY=this.myControlReview.value;
      this.editBestPractice.approveD_BY=this.myControlApprove.value; 
      this.editBestPractice.updateD_BY = localStorage.getItem('empid');
      this.editBestPractice.updateD_DATE = new Date();
      this.service_updateBestPractices(this.editBestPractice);
      this.readonlymode = true;
      this.editmode = false;

    }    
    // this.editBestPractice = new BestPracticesModelExt();
    this.changeDetectorRefs.detectChanges();
  }
  

  //service methods
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem('empid'))
    return headers;
  }
  service_addBestPractices(bestpractice: BestPracticesModelExt) {
    let apiuri: string = environment.webapiuri + 'AddBestPractices';
    this._http.post(apiuri, bestpractice, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.AllBestPractices.push(JSON.parse(data.text()));
        this.AllBestPractices.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
        this.getBestPracticesforProject();
        this.RefreshTableForProject(this.AllBestPractices);
      }, error => { this._util.serviceError(error); },

      () => {
        this.getBestPracticesforProject();
        this.RefreshTableForProject(this.AllBestPractices);          
      }
      );
  }
  service_updateBestPractices(bestpractice: BestPracticesModelExt) {
    let apiuri: string = environment.webapiuri + 'UpdateBestPractices';
    this._http.post(apiuri, bestpractice, { headers: this.GetAuthHeader() })
      .subscribe(data => {       
        this.getBestPracticesforProject();
      }, error => { this._util.serviceError(error); });
  }
 // bShowFilter: boolean = true;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }
  Filter_onChange($event) {
    

    let filteredData = $event;
    this.filterCriteria = $event.criteria;

    this.AllChecked=true;
    this.PastDueChecked=false;
    this.DueClosureChecked=false;
    this.filterData( this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    // return;
    // this.dataSource = new MatTableDataSource(filteredData);
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;

  }


  filterData(  portfolioId: any, projectId: any, allchecked: any, pastDue: any, dueforClosure: any) {
     
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.AllBestPractices);

    // if (portfolioId != null && portfolioId != 0 && portfolioId !="All Portfolios") {
    //   this.filteredData = this.filteredData.filter(x => x.portfoliO_ID == portfolioId || x.portfoliO_NAME == portfolioId);
    // }
    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length>0  ) {
        this.filteredData = this.filteredData.filter(x => this._shared.selectedProjects.indexOf(x.proJ_ID ) >=0 );
    }
    if (allchecked) {

    }
    else {
      this.filteredData = this.filteredData.filter(x => x.status == 'Planned' || x.status == 'Started');
     
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
   
    this.RefreshTableForProject(this.filteredData);
  }

}
