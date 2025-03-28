import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../../Services/apps.service';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogConfig, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ActionitemModel, ActionitemModelNew } from '../../../models/actionitem-model';
import { environment } from '../../../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { MOM_DETAIL } from '../../../models/mom-details-model';
import { ProjectsModel } from '../../../models/projects-model';
import { enumRoles } from '../../../Shared/enum'
import { AccessControl } from '../../../Shared/accessControl';
import { e } from '@angular/core/src/render3';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { SharedService } from '../../../Shared/shared.service';
import { PortfolioProjectSelectorComponent } from '../../../controls/portfolio-project-selector/portfolio-project-selector.component';
import { MinutesofmeetingComponent } from '../../../minutesofmeeting/minutesofmeeting.component';
import { FilterPreferenceModel } from '../../../models/filter-preference-model';
import { formatDate } from '@angular/common';
import { EntityBaseInfoComponent } from '../entity-base-info/entity-base-info.component';

@Component({
  selector: 'app-action-items',
  templateUrl: './action-items-page.component.html',
  styleUrls: ['./action-items-page.component.scss']

})
export class ActionItemsPageComponent implements OnInit {

  actionItemData: any;
  bShowFilter: boolean = true;
  toggle: string = "Hide";
  result: any = [];
  selectedCust: string;
  private sub: any;
  selectedProject: string = "All Projects";
  selectedPortfolio: string = "All Portfolios";
  editmode: boolean = false;
  readonlymode: boolean = true;
  projects: string[] = []
  projNames: ProjectsModel[];
  EditActionitem: ActionitemModelNew = new ActionitemModelNew;
  dataSource = new MatTableDataSource(this.result);
  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['index', 'portfoliO_NAME', 'proJ_NM', 'description', 'owner', 'targeT_DATE', 'identifieD_DATE', 'status', 'priority', 'source', 'completioN_DATE','info', 'edit', 'delete'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  portfolio: string[] = [];
  allcust: boolean = false;
  allproj: boolean = false;
  flag: boolean = false;
  ownerList: EmpInfoModel[];
  ownermodel: EmpInfoModel = new EmpInfoModel();
  selectedOption: string = "1";
  tempData: any;
  tempData1: any;
  filteredData: any;
  filterCriteria: any;
  AllChecked: boolean;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;
  portfolioData: any;
  mom_detail: MOM_DETAIL = new MOM_DETAIL;
  canUpdateToCustomer: boolean = false;
  isPopOpened: boolean = false;
  isLoading: boolean = false;
  isQATeam: boolean = false;
  csatBased: boolean = false;
  isSaved: boolean = false;
  isCustomerUpdated: boolean = false;
  maxTargetDate: any;  
  isDescUpdated : boolean = false;
  originalDescription: string = ""; 
  constructor(private route: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _http: Http, private _util: myUtility,
    private changeDetectorRefs: ChangeDetectorRef, public _access: AccessControl, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    if (role == enumRoles.Quality.toString())
      this.isQATeam = true;

    if (this.data.custId != null && this.data.custId != undefined) {
      this.selectedCust = this.data.custId;
      this.isPopOpened = true;
    }
    else {
      this.sub = this.route.params.subscribe(params => {
        this.selectedCust = params['custid'];
        if (params['projid'] != undefined) {
          this._shared.selectedProjects.push(params['projid']);
        }
        if (params['iscss'] == "true") {
          let filterValue = [];
          let newFilterValue = new FilterPreferenceModel('PROJECT_ACTIONITEM', 'Source', true, 'string', ['CSS']);
          newFilterValue.id = 55;
          newFilterValue.include = true;
          newFilterValue.isactive = true;
          newFilterValue.searchStringValue = "Customer Success Survey";
          newFilterValue.fielD_NAME = "source"
          filterValue.push(newFilterValue);
          this.filterCriteria = filterValue;
        }

      });
    }

    if (!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'portfoliO_NAME', 'proJ_NM', 'description', 'owner', 'targeT_DATE', 'identifieD_DATE', 'status', 'priority', 'source', 'completioN_DATE','info', 'edit', 'delete'];

    this.getAllActionItemsForCustomer();
    this.getAllProjectsFromCustomer();
    this.Service_CanUpdateToCustomer();
    this.originalDescription = this.EditActionitem.description;

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  getAllActionItemsForCustomer() {
    this.service_getActionItems();
  }

  filterData(portfolioId: any, projectId: any, allchecked: any, pastDue: any, dueforClosure: any) {

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.result);

    // if (portfolioId != null && portfolioId != 0 && portfolioId !="All Portfolios") {
    //   this.filteredData = this.filteredData.filter(x => x.portfoliO_ID == portfolioId || x.portfoliO_NAME == portfolioId);
    // }
    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0) {
      this.filteredData = this.filteredData.filter(x => this._shared.selectedProjects.indexOf(x.proJ_ID) >= 0);
    }
    if (allchecked) {

    }
    else {
      this.filteredData = this.filteredData.filter(x => x.status == 'Planned' || x.status == 'Started' || x.status == 'Identified');

      if (pastDue && dueforClosure) { }
      else if (!pastDue && !dueforClosure) {
        //this.AllChecked=true;
        this.filteredData = [];
      }
      else if (pastDue) {
        this.filteredData = this.filteredData.filter(x => new Date(x.targeT_DATE) < currentDate);
      }
      else if (dueforClosure) {
        this.filteredData = this.filteredData.filter(x => new Date(x.targeT_DATE) >= currentDate);
      }
    }

    this.RefreshTableForProject(this.filteredData);
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  showFilteredRows() {

    this.filterData(this._shared.savedportfolioId, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (this.portfolioData == undefined) {
      if (this.AllChecked && this._shared.savedportfolioId != 0)
        this.tempData1 = this.result.filter(x => x.portfoliO_ID == this._shared.savedportfolioId);

      else if (this.AllChecked && this._shared.savedportfolioId == 0)
        this.tempData1 = this.result;

      if (this.PastDueChecked && this.DueClosureChecked)
        this.tempData1 = this.tempData;

      else if (this.PastDueChecked && !this.DueClosureChecked)
        this.tempData1 = this.tempData.filter(x => new Date(x.targeT_DATE) <= currentDate);

      else if (!this.PastDueChecked && this.DueClosureChecked)
        this.tempData1 = this.tempData.filter(x => new Date(x.targeT_DATE) > currentDate);

      else if (!this.AllChecked && !this.PastDueChecked && !this.DueClosureChecked)
        this.tempData1 = [];
    }
    else {
      if (this.AllChecked)
        this.tempData1 = this.portfolioData;

      else if (this.PastDueChecked && this.DueClosureChecked)
        this.tempData1 = this.portfolioData.filter(x => x.status == 'Planned' || x.status == 'Started' || x.status == 'Identified');

      else if (this.PastDueChecked && !this.DueClosureChecked)
        this.tempData1 = this.portfolioData.filter(x => new Date(x.targeT_DATE) <= currentDate && (x.status == 'Planned' || x.status == 'Started' || x.status == 'Identified'));

      else if (!this.PastDueChecked && this.DueClosureChecked)
        this.tempData1 = this.portfolioData.filter(x => new Date(x.targeT_DATE) > currentDate && (x.status == 'Planned' || x.status == 'Started' || x.status == 'Identified'));

      else if (!this.AllChecked && !this.PastDueChecked && !this.DueClosureChecked)
        this.tempData1 = [];
    }

    this.RefreshTableForProject(this.tempData1);
  }

  filter_projectPortfolio(input) {
    this.projects = (input.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
    this.portfolio = (input.map(x => x.portfoliO_NAME)).filter((x, i, a) => a.indexOf(x) == i).sort();
    if (!this.portfolio.includes("All Portfolios"))
      this.portfolio.unshift("All Portfolios");
    if (!this.projects.includes("All Projects"))
      this.projects.unshift("All Projects");
  }

  service_getActionItems() {
    this.isLoading = true;
    this._appservice.getActionItemsDetails(this.selectedCust, this.allproj, 1).subscribe(
      data => {
        this.result = data;
        this.tempData = this.result.filter(x => x.status == 'Planned' || x.status == 'Started' || x.status == 'Identified')
        if (this.result.length == 0)
          this.bShowFilter = false;

        this.isLoading = false;
      },
      error => { },
      () => {
        this.isLoading = false;
        if (this._util.IsPremier(this.selectedCust)) {
          if (this._shared.savedportfolioId != 0)
            this.tempData = this.tempData.filter(x => x.portfoliO_ID == this._shared.savedportfolioId);

          if (this._shared.savedportfolioId != 0)
            this.selectedPortfolio = this.tempData[0].portfoliO_NAME;
          else
            this.selectedPortfolio = "All Portfolios";
        }

        //this.RefreshTableForProject(this.tempData);
        this.filterData(this.selectedPortfolio, null, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);

      });
  }

  uncheckOthers() {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  Project_OnClick() {
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
    let projdata = this.result;
    if (this.selectedProject != "All Projects") {
      projdata = this.result.filter(x => x.proJ_NM == this.selectedProject);
    }
    else if (this.selectedProject == "All Projects" && this.selectedPortfolio != "All Portfolios" && this.selectedPortfolio != undefined && this.selectedPortfolio != null)
      projdata = this.result.filter(x => x.portfoliO_NAME == this.selectedPortfolio);
    this.RefreshTableForProject(projdata);
  }

  Portfolio_OnClick() {
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    if (this.selectedPortfolio != "All Portfolios") {
      // this.portfolioData = this.result.filter(x => x.portfoliO_NAME == this.selectedPortfolio);
      // this.RefreshTableForProject(this.portfolioData);
      this.projects = this.result.filter(x => x.portfoliO_NAME == this.selectedPortfolio).map(x => x.proJ_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
      //this.AllChecked = true;

    }
    else if (this.selectedPortfolio == "All Portfolios") {
      //this.RefreshTableForProject(this.result);
      this.projects = (this.result.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
      //this.AllChecked = true;
    }
  }

  getAllProjectsFromCustomer() {
    let role = localStorage.getItem('role');

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allcust = true;
    else
      this.allcust = false;

    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allcust).subscribe(
      data => {
        this.projNames = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }



  RefreshTableForProject(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  ExportTOExcel() {
    let name = 'ActionItem'
    this._util.exportToExcel(this.table.nativeElement, name)
    // const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // /* save to file */
    // XLSX.writeFile(wb, 'ActionItem.xlsx');

  }


  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
    if (this.bShowFilter)
      this.toggle = "Hide";
    else
      this.toggle = "Show";
  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable();
    this.Service_CanUpdateToCustomer();
  }

  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getotherDetails() {
    this.getPortfolioName();
    this.getOwnerNamesList();
  }

  getPortfolioName() {
    this._appservice.getPortfolioName(this.EditActionitem.proJ_ID).subscribe(
      data => {
        this.EditActionitem.portfoliO_NAME = data;
      }
    )
  }

  getOwnerNamesList() {
    this._appservice.getAuditeeDetails(this.selectedCust, this.EditActionitem.proJ_ID).subscribe(
      data => {
        this.ownerList = data;
      },
      error => { }
    )
  }

  getprojectsNameForAPortfolio(portid) {
    this.projects = this.result.filter(x => x.portfoliO_ID == portid).map(x => x.proJ_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
    this.projects.unshift("All Projects");
  }

  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }
    if (this.EditActionitem.status == "Identified") {
      alert("Please update the status (other than Identified) to save this Action item");
      return;
    }
    let tDate = new Date(this.EditActionitem.targeT_DATE);
    tDate.setHours(0, 0, 0, 0);

    let iDate = new Date(this.EditActionitem.identifieD_DATE);
    iDate.setHours(0, 0, 0, 0);

    let cdate = this.EditActionitem.completioN_DATE;

    if (this.EditActionitem.completioN_DATE != null && this.EditActionitem.completioN_DATE != undefined) {
      cdate = new Date(this.EditActionitem.completioN_DATE);
      cdate.setHours(0, 0, 0, 0);
    }

    if (!this.IsDateValid(tDate, iDate)) {
      alert('Please enter valid target and identified dates');
      return;
    }

    if (!this.IsCompletionDateValid(cdate, iDate)) {
      alert('Please enter valid identified and completion dates');
      return;
    }
    this.getProjectName();
    this.isSaved = true;
    if (this.EditActionitem.actioN_ITEM_ID === 0 || this.EditActionitem.actioN_ITEM_ID === undefined) {
      this.EditActionitem.cusT_ID = this.selectedCust;
      this.EditActionitem.proJ_NM = this.projNames.find(x => x.proJ_ID == this.EditActionitem.proJ_ID).proJ_NM;
      this.EditActionitem.rag = 'green';
      this.EditActionitem.createD_BY = localStorage.getItem('empid');
      this.EditActionitem.createD_DATE = new Date();
      this.EditActionitem.updateD_BY = localStorage.getItem('empid');
      this.EditActionitem.updateD_DATE = new Date();
      this.service_addActionitem(this.EditActionitem);
      this.readonlymode = true;
      this.editmode = false;

    }
    else {
      this.EditActionitem.updateD_BY = localStorage.getItem('empid');
      this.EditActionitem.updateD_DATE = new Date();
      this.service_updateActionitem(this.EditActionitem);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditActionitem();
    this.changeDetectorRefs.detectChanges();



  }

  getOwner() {
    if (this.ownermodel.emP_ID == "-1")
      this.EditActionitem.owner = this.ownermodel.frsT_NM;
    else
      this.EditActionitem.owner = this.ownermodel.emP_ID.toString();
  }

  getProjectName() {
    let projectName;
    projectName = this.projNames.find(x => x.proJ_ID == this.EditActionitem.proJ_ID);
    if (projectName != undefined && projectName != null)
      this.EditActionitem.proJ_NM = projectName.proJ_NM
  }

  IsCompletionDateValid(completionDate, identifiedDate) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (completionDate != null && completionDate != undefined) {
      if (completionDate >= identifiedDate && completionDate <= currentDate && identifiedDate <= currentDate)
        return true;
      else
        return false;
    }
    else
      return true;

  }

  IsDateValid(targetDate, identifiedDate) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (targetDate >= identifiedDate && identifiedDate <= currentDate)
      return true;
    else
      return false;
  }

  newEditActionitem() {
    this.csatBased = false;
    this.isDescUpdated = false;
    this.EditActionitem = new ActionitemModelNew();
    this.isDescUpdated = false;
  }
  onInputChange(newValue: string) {  
    this.isDescUpdated = (newValue && newValue.trim()) !== (this.originalDescription && this.originalDescription.trim() ? this.originalDescription.trim() : "");  
  }
  
  EditRow_onClick(element) {
    this.csatBased = false;
    this.isDescUpdated = false;
    this.EditActionitem = Object.assign({}, element);
    //Set Max Target Date 
    let tDate = new Date(this.EditActionitem.identifieD_DATE);
    tDate.setDate(tDate.getDate() + 28);
    this.maxTargetDate = tDate;

    if (element.source == "CSS" || element.source.includes('Customer Success Survey') || element.source == 'CSAT') {
      this.csatBased = true;
    }
    this.Edit_onClick()
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteActionItem(element).subscribe(data => { }, error => { this._util.serviceError(error); },
        () => {
          this.result.splice(this.result.indexOf(element), 1);
          this.result.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
          //this.RefreshTableForProject(this.result);
          this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        });

    } else {

    }
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.csatBased = false;
    this.newEditActionitem();
    this.getAllActionItemsForCustomer();
  }

  SendUpdateToCustomer(EditActionitem) {
    this.isCustomerUpdated = true;
    if (EditActionitem.originaL_DESCRIPTION == EditActionitem.description) {
      alert('Please update the required details in Description which will be sent as Improvement Plan to Customer and save and continue.');
      this.isCustomerUpdated = false;
      return;
    }

  
    if (EditActionitem.status == 'Identified') {
      alert('Please update the status and save and then send the Update to Customer.');
      this.isCustomerUpdated = false;
      return;
    }
    if (confirm('If you have made any updates to this action item, please save it first and then send the update to customer. Do you want to continue sending?')) {
      this.service_SubmitActionItemPlanToCustomer(this.selectedCust, this.EditActionitem.proJ_ID, this.EditActionitem.actioN_ITEM_ID);
    }
    else
    {
      return;
    }
   
   
  }

  service_addActionitem(actionitem) {
    let apiuri: string = environment.webapiuri + 'AddActionitemNew';
    this._http.post(apiuri, actionitem, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.result.push(JSON.parse(data.text()));
        this.result.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
        //this.RefreshTableForProject(this.result);
        this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        alert("Action Item Saved");
        this.isSaved = false;
      }, error => { this._util.serviceError(error); this.isSaved = false },
      );
  }

  Service_CanUpdateToCustomer() {
    this._appservice.service_UpdateTocustomer(this.EditActionitem.proJ_ID).subscribe(data => {
      if (data.includes(localStorage.getItem("empid"))) {
        this.canUpdateToCustomer = true;
      }
      else {
        this.canUpdateToCustomer = false;
      }
    }, error => { this._util.serviceError(error); })
  }

  service_SubmitActionItemPlanToCustomer(custid, projId, actionItemId) {
    let apiuri: string = environment.webapiuri + 'SubmitActionItemPlanToCustomer?customerId=' + custid + '&projectId=' + projId + '&actionItemId=' + actionItemId;
    this._http.post(apiuri, null, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        alert("Successfully sent the update to Customer Contact.");
        this.isCustomerUpdated = false;
      }, error => { this._util.serviceError(error); this.isSaved = false; this.isCustomerUpdated = false; },
      );
  }

  service_updateActionitem(actionitem) {
    let apiuri: string = environment.webapiuri + 'UpdateActionitemNew';
    this._http.post(apiuri, actionitem, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.getAllActionItemsForCustomer();
        alert("Action Item Updated");
        this.isSaved = false;
      }, error => { this._util.serviceError(error); });
  }

  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empid', localStorage.getItem('empid'));
    return headers;
  }

  Filter_onChange($event) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showAll($event) {
    //this.AllChecked = $event;
  }

  projectSelected($event) {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  showMoM() {
    this.mom_detail = new MOM_DETAIL;
    // this.mom_detail.customeR_ID.push(Number(this.input_custId));
    this.mom_detail.customeR_ID.push(this.selectedCust);
    // this.mom_detail.projecT_ID.push(this.input_projectid);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      mom: this.mom_detail,
    }
    const dialogRef = this.dialog.open(MinutesofmeetingComponent, dialogConfig);
    dialogRef.updateSize('90%', '600px').updatePosition({ top: '25px', left: '120px' });
    dialogRef.afterClosed().subscribe(result => {

      this.getAllActionItemsForCustomer();
      this.getAllProjectsFromCustomer();
    });
    // this.getAllActionItemsForCustomer();

  }
  OpenEntityInfoPopup(element) {
    element.id = element.actioN_ITEM_ID;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      entity: element,
      entityType: 'actionitem',
      header: 'Action Item',
      project: element.proJ_NM
    }

    dialogConfig.maxWidth = "80%",
      dialogConfig.maxHeight = 'fit-content',
      dialogConfig.height = 'auto'

    const dialogRef = this.dialog.open(EntityBaseInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }


}
