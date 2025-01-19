import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource, MatSort, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { IssueModel, IssueModelExt } from '../../../models/issue-model';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../layout.service';
import { enumRoles } from '../../../Shared/enum';
import { SharedService } from '../../../Shared/shared.service';
import { EntityBaseInfoComponent } from '../entity-base-info/entity-base-info.component';


@Component({
  selector: 'app-issue',
  templateUrl: './issues-page.component.html',
  styleUrls: ['./issues-page.component.scss']
})
export class IssuesPageComponent implements OnInit {
  selectedCust: string;
  input: IssueModelExt[] = [];
  private sub: any;
  tempObject: any;

  // @Input('inputrag') input_rag: any;
  // @Input('ProjectId') input_projectid: string;

  EditIssue: IssueModelExt;
  portfolio: string[] = [];
  displayedColumns = ['index', 'portfoliO_NM', 'subvertical', 'proJ_NM', 'description', 'issuE_TYPE', 'severity', 'actioN_PLAN', 'assigneD_TO', 'identifieD_DATE', 'targeT_DATE', 'issuE_RESOLVED_DATE', 'status', 'info', 'edit', 'delete'];
  dataSource = new MatTableDataSource(this.input);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  tempData: IssueModelExt[];
  tempData1: IssueModelExt[];
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  projNames: any[];
  allproj: boolean = false;
  selectedProject: string = "All Projects";
  selectedPortfolio: string = "All Portfolios";
  projects: string[] = [];
  toggletext: string = "Hide";
  selectedOption: string = "1";
  AllChecked: boolean;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;
  isPopOpened: boolean = false;
  isLoading: boolean = false;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(private _http: Http, private _util: myUtility, private _shared: SharedService, private _appservice: AppsService,
    private _access: AccessControl, private route: ActivatedRoute, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit() {
    if (this.data.custId != null && this.data.custId != undefined) {
      this.selectedCust = this.data.custId;
      this.isPopOpened = true;
    }
    else {
      this.sub = this.route.params.subscribe(params => {
        this.selectedCust = params['custid'];
      });
    }

    let role = localStorage.getItem('role');

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.getAllIssuesForCustomer(this.selectedCust);

    if (!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'subvertical', 'proJ_NM', 'description', 'issuE_TYPE', 'severity', 'actioN_PLAN', 'assigneD_TO', 'identifieD_DATE', 'targeT_DATE', 'issuE_RESOLVED_DATE', 'status', 'info', 'edit', 'delete'];
  }

  ngOnChanges() {
    this.RefreshTableForProject(this.input);
    this.newEditIssue();
    this.newEditIssue();
  }

  getAllIssuesForCustomer(custid) {
    this.isLoading = true;
    this._appservice.getAllIssuesForCustomer(custid, this.allproj).subscribe(
      data => {

        this.input = data.output;
        this.tempData = this.input.filter(x => x.status != 'Closed');
        this.projNames = data.projects;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this._util.serviceError(error);
      },
      () => {
        if (this.input.length == 0)
          this.bShowFilter = false;

        this.projects = (this.input.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.portfolio = (this.input.map(x => x.portfoliO_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
        if (!this.portfolio.includes("All Portfolios"))
          this.portfolio.unshift("All Portfolios");
        if (!this.projects.includes("All Projects"))
          this.projects.unshift("All Projects");

        if (this._shared.savedportfolioId != 0)
          this.tempData = this.tempData.filter(x => x.portfoliO_ID == this._shared.savedportfolioId);

        //this.RefreshTableForProject(this.tempData);

        if (this._shared.savedportfolioId != 0)
          this.selectedPortfolio = this.tempData[0].portfoliO_NM;
        else
          this.selectedPortfolio = "All Portfolios";
        this.newEditIssue();
        this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
      }
    )
  }

  uncheckOthers() {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  // showFilteredRows(option)
  // {
  //   this.RefreshTableForProject(this._util.showFilteredRows(option, this.tempData));
  // }

  // public showFilteredRows(option, datasource, RefreshTableForProject : (any) => void)
  // { 
  //     let currentDate = new Date();
  //     currentDate.setHours(0, 0, 0, 0);
  //     if(option == 1)
  //         this.tempData1 = datasource;
  //     else if(option == "2")
  //         this.tempData1 = datasource.filter(x => new Date(x.targeT_DATE) <= currentDate);
  //     else if(option == "3")
  //         this.tempData1 = datasource.filter(x => new Date(x.targeT_DATE) > currentDate);

  //     this.RefreshTableForProject(this.tempData1);
  // }

  getAllProjectsForCustomer() {

    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allproj).subscribe(
      data => {
        this.projNames = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getPortfolioName() {
    this._appservice.getPortfolioName(this.EditIssue.projecT_ID).subscribe(
      data => {
        this.EditIssue.portfoliO_NM = data;
      }
    )
  }

  filteredData: any;
  filterCriteria: any;

  filterData(portfolioId: any, projectId: any, allchecked: any, pastDue: any, dueforClosure: any) {

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.input);
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    // if (portfolioId != null && portfolioId != 0 && portfolioId !="All Portfolios") {
    //   this.filteredData = this.filteredData.filter(x => x.portfoliO_ID == portfolioId || x.portfoliO_NM == portfolioId);
    // }
    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0) {
      this.filteredData = this.filteredData.filter(x => this._shared.selectedProjects.indexOf(x.projecT_ID) >= 0);
    }
    if (allchecked) {

    }
    else {
      this.filteredData = this.filteredData.filter(x => x.status != 'Occured' && x.status != 'Closed');

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


  showFilteredRows() {
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (this.AllChecked && this._shared.savedportfolioId != 0)
      this.tempData1 = this.input.filter(x => x.portfoliO_ID == this._shared.savedportfolioId);

    else if (this.AllChecked && this._shared.savedportfolioId == 0)
      this.tempData1 = this.input;

    else if (this.PastDueChecked && this.DueClosureChecked)
      this.tempData1 = this.tempData;

    else if (this.PastDueChecked && !this.DueClosureChecked)
      this.tempData1 = this.tempData.filter(x => new Date(x.targeT_DATE) <= currentDate);

    else if (!this.PastDueChecked && this.DueClosureChecked)
      this.tempData1 = this.tempData.filter(x => new Date(x.targeT_DATE) > currentDate);

    else if (!this.AllChecked && !this.PastDueChecked && !this.DueClosureChecked)
      this.tempData1 = [];

    this.RefreshTableForProject(this.tempData1);

  }

  levelmode: boolean = false;
  impactmode: boolean = false;
  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataUpdate: any;


  SubmitForm(isValid) {

    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }
    if ((specialCharPattern.test(this.EditIssue.description)) || numberPattern.test(this.EditIssue.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }
    if ((specialCharPattern.test(this.EditIssue.impacT_SUMMARY)) || numberPattern.test(this.EditIssue.impacT_SUMMARY)) {
      alert('Please enter alphanumeric or numeric values along with special characters for Impact Summary');
      return;
    }
    if (specialCharPattern.test(this.EditIssue.geO_LOCATION) || numberPattern.test(this.EditIssue.geO_LOCATION)) {
      alert('Please enter alphanumeric or numeric values along with special characters for Location');
      return;
    }
    if (specialCharPattern.test(this.EditIssue.actioN_PLAN) || numberPattern.test(this.EditIssue.actioN_PLAN)) {
      alert('Please enter alphanumeric or numeric values along with special characters for Action Plan');
      return;
    }
    if (specialCharPattern.test(this.EditIssue.assigneD_TO) || numberPattern.test(this.EditIssue.assigneD_TO)) {
      alert('Please enter alphanumeric or numeric values along with special characters for Assigned To');
      return;
    }
    if (specialCharPattern.test(this.EditIssue.identifieD_BY) || numberPattern.test(this.EditIssue.identifieD_BY)) {
      alert('Please enter alphanumeric or numeric values along with special characters for Identified By');
      return;
    }
    if (specialCharPattern.test(this.EditIssue.comments) || numberPattern.test(this.EditIssue.comments)) {
      alert('Please enter alphanumeric or numeric values along with special characters for Comments');
      return;
    }

    let tDate = new Date(this.EditIssue.targeT_DATE);
    tDate.setHours(0, 0, 0, 0);

    let iDate = new Date(this.EditIssue.identifieD_DATE);
    iDate.setHours(0, 0, 0, 0);

    if (!this.IsDateValid(tDate, iDate)) {
      alert('Please enter valid target and identified dates');
      return;
    }

    let rdate = this.EditIssue.issuE_RESOLVED_DATE;

    if (this.EditIssue.issuE_RESOLVED_DATE != null && this.EditIssue.issuE_RESOLVED_DATE != undefined) {
      rdate = new Date(this.EditIssue.issuE_RESOLVED_DATE);
      rdate.setHours(0, 0, 0, 0);

      if (!this.IsResolvedDateValid(rdate, iDate)) {
        alert('Please enter valid target and resolved dates');
        return;
      }
    }


    let projectName;
    projectName = this.projNames.find(x => x.proJ_ID == this.EditIssue.projecT_ID);
    if (projectName != undefined && projectName != null)
      this.EditIssue.proJ_NM = projectName.proJ_NM

    if (this.EditIssue.id === 0 || this.EditIssue.id === undefined) {
      this.EditIssue.id = 0;
      this.EditIssue.rag = 'green';
      this.EditIssue.createD_BY = localStorage.getItem('empid');
      this.EditIssue.createD_DATE = new Date();
      this.EditIssue.updateD_BY = localStorage.getItem('empid');
      this.EditIssue.updateD_DATE = new Date();
      this.service_addIssue(this.EditIssue);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {

      this.EditIssue.updateD_BY = localStorage.getItem('empid');
      this.EditIssue.updateD_DATE = new Date();
      this.service_updateIssue(this.EditIssue);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditIssue();
  }

  IsResolvedDateValid(resolvedDate, identifiedDate) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (resolvedDate >= identifiedDate && identifiedDate <= currentDate && resolvedDate <= currentDate)
      return true;
    else
      return false;
  }

  IsDateValid = (targetDate, identifiedDate) => {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (targetDate >= identifiedDate && identifiedDate <= currentDate)
      return true;
    else
      return false;
  }

  // IsDateValid(targetDate, identifiedDate)
  // {
  //   let currentDate = new Date();
  //   currentDate.setHours(0, 0, 0 ,0);
  //     if(targetDate >= identifiedDate && identifiedDate <= currentDate)
  //       return true;
  //     else
  //       return false;
  // }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newEditIssue();
    this.getAllIssuesForCustomer(this.selectedCust);
  }
  EditRow_onClick(element) {
    //this.EditIssue = element;
    this.EditIssue = Object.assign({}, element);

    if (this.EditIssue.iS_POTENTIAL_RISK == true)
      this.EnableImpact();

    if (this.EditIssue.reporteD_BY != "reportedbyGAVS")
      this.EnableLevel();

    this.Edit_onClick()
  }
  EnableLevel() {
    this.levelmode = true;
  }
  DisableLevel() {
    this.levelmode = false;
  }
  EnableImpact() {
    this.impactmode = true;
  }
  DisableImpact() {
    this.impactmode = false;
  }
  // SaveRAG_onClick(rag) {
  //   this._util.updateRAG(this.input_rag, 'issue', rag);
  //   let ragdetails = {
  //     PROJECT_ID: this.input_projectid,
  //     CATEGORY: 'issue',
  //     RAG: rag,
  //     UPDATED_BY: localStorage.getItem('empid'),
  //     UPDATED_DATE: this._util.getDate(new Date())
  //   };
  //   this.service_updateRag(ragdetails);
  // }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteIssue(element).subscribe(data => { }, error => { this._util.serviceError(error); });
      this.input.splice(this.input.indexOf(element), 1);
      this.input.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
      alert("Issue Deleted Successfully");
      this.RefreshTableForProject(this.input);
    } else {

    }
  }

  Portfolio_OnClick() {
    let portfolioData;
    if (this.selectedPortfolio != "All Portfolios") {
      portfolioData = this.input.filter(x => x.portfoliO_NM == this.selectedPortfolio);
      this.RefreshTableForProject(portfolioData);
      this.projects = this.input.filter(x => x.portfoliO_NM == this.selectedPortfolio).map(x => x.proJ_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");

    }
    else if (this.selectedPortfolio == "All Portfolios") {
      this.RefreshTableForProject(this.input);
      this.projects = (this.input.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
      this.selectedProject = "All Projects";
    }
  }

  Project_OnClick() {
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;

    let projdata = this.input;
    if (this.selectedProject != "All Projects") {
      projdata = this.input.filter(x => x.proJ_NM == this.selectedProject);
    }
    else if (this.selectedProject == "All Projects" && this.selectedPortfolio != "All Portfolios" && this.selectedPortfolio != undefined && this.selectedPortfolio != null)
      projdata = this.input.filter(x => x.portfoliO_NM == this.selectedPortfolio);
    this.RefreshTableForProject(projdata);
  }


  RefreshTableForProject(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('empId', localStorage.getItem('empid'));
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
  // service_updateRag(ragdetails) {
  //   let apiuri: string = environment.webapiuri + 'UpdateRags';
  //   this._http.post(apiuri, ragdetails, { headers: this.GetAuthHeader() })
  //     .subscribe(data => { }, error => { this._util.serviceError(error); });
  // }
  service_addIssue(issue: IssueModelExt) {
    let apiuri: string = environment.webapiuri + 'AddIssue';
    this._http.post(apiuri, issue, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        alert("Issue Updated Successfully");
        this.input.push(JSON.parse(data.text()));
        this.input.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
        this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        //this.RefreshTableForProject(this.input);
      }, error => { this._util.serviceError(error); });
  }
  service_updateIssue(issue: IssueModelExt) {
    let apiuri: string = environment.webapiuri + 'UpdateIssue';
    this._http.post(apiuri, issue, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        alert("Issue Updated Successfully");
        this.getAllIssuesForCustomer(this.selectedCust);

      }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  newEditIssue() {
    this.EditIssue = new IssueModelExt();
    this.EditIssue.financiaL_IMPACT = false;
    this.EditIssue.reporteD_BY = "reportedbyGAVS";
    if (this.EditIssue.iS_POTENTIAL_RISK == true)
      this.EnableImpact();

    if (this.EditIssue.reporteD_BY != "reportedbyGAVS")
      this.EnableLevel();
  }
  bShowFilter: boolean = true;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
    if (this.bShowFilter)
      this.toggletext = "Hide";
    else
      this.toggletext = "Show";
  }
  Filter_onChange($event) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
    this.RefreshTableForProject(filteredData);
  }
  showAll($event) {
    //.AllChecked = $event;
  }
  projectSelected($event) {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }
  OpenEntityInfoPopup(element) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      entity: element,
      entityType: 'issue',
      header: 'Issue',
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

