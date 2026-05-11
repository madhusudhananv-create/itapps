import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialogModule, MatDialogConfig, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AppsService } from '../../../services/apps.service';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MyUtility } from '../../../shared/my-utility';
import { MOM_DETAIL, MOM } from '../../../shared/models/mom.model';
import { enumRoles } from '../../../shared/enum'
import { AccessControl } from '../../../shared/access-control';
import { SharedService } from '../../../shared/shared.service';
import { PortfolioProjectSelectorComponent } from '../../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { MinutesofmeetingComponent } from '../../../components/minutesofmeeting/minutesofmeeting.component';
import { formatDate } from '@angular/common';
import { EntityBaseInfoComponent } from '../entity-base-info/entity-base-info.component';
import { TableFilterComponent } from '../../../shared/components/table-filter/table-filter.component';
import { WarningPopupComponent } from '../../../shared/components/warning-popup/warning-popup.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

// Temporary type placeholders until models are migrated
export class ActionitemModelNew {
  actioN_ITEM_ID?: number;
  cusT_ID?: string;
  proJ_ID?: string;
  proJ_NM?: string;
  portfoliO_NAME?: string;
  portfoliO_ID?: number;
  description?: string;
  owner?: string;
  targeT_DATE?: any;
  identifieD_DATE?: any;
  status?: string;
  priority?: string;
  source?: string;
  sourcE_DESCRIPTION?: string;
  completioN_DATE?: any;
  rag?: string;
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  actuaL_PLAN_DECLARATION?: boolean;
  planneD_DECLARATION?: boolean;
  closurE_ACKNOWLEDGE?: boolean;
  actuaL_CUST_DATE?: any;
  planneD_CUST_DATE?: any;
  closurE_ACTUAL_CUST_DATE?: any;
  originaL_DESCRIPTION?: string;
  comments?: string;
  rooT_CAUSE?: string;
  perspective?: string;
  score?: string;
  customeR_REMARKS?: string;
  preventivE_ACTION_PLAN?: string;
  planneD_TARGET_DATE?: any;
  planneD_ACTUAL_DATE?: any;
}

export class ActionitemModel {}

export class ProjectsModel {
  proJ_ID?: string;
  proJ_NM?: string;
}

export class EmpInfoModel {
  emP_ID?: string;
  frsT_NM?: string;
}

export class FilterPreferenceModel {
  id?: number;
  include?: boolean;
  isactive?: boolean;
  searchStringValue?: string;
  fielD_NAME?: string;

  constructor(
    public tablE_NAME?: string,
    public fielD_DISPLAY_NAME?: string,
    public isRange?: boolean,
    public datatype?: string,
    public value?: any[]
  ) {}
}

@Component({
  selector: 'app-action-items',
  templateUrl: './action-items-page.component.html',
  styleUrls: ['./action-items-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    TextFieldModule,
    PortfolioProjectSelectorComponent,
    TableFilterComponent
  ]
})
export class ActionItemsPageComponent implements OnInit {

  actionItemData: any;
  bShowFilter: boolean = true;
  toggle: string = "Hide";
  result: any = [];
  selectedCust: string = '';
  private sub: any;
  selectedProject: string = "All Projects";
  selectedPortfolio: string = "All Portfolios";
  editmode: boolean = false;
  readonlymode: boolean = true;
  projects: string[] = []
  projNames: ProjectsModel[] = [];
  EditActionitem: ActionitemModelNew = new ActionitemModelNew;

  // ─── FIX: single shared DataSource instance – never replaced ───────────────
  dataSource = new MatTableDataSource<any>([]);
  // ───────────────────────────────────────────────────────────────────────────

  @ViewChild('TABLE') table!: ElementRef;
  displayedColumns = ['index', 'portfoliO_NAME', 'proJ_NM', 'description', 'owner', 'targeT_DATE', 'identifieD_DATE', 'status', 'priority', 'source', 'completioN_DATE', 'info', 'edit', 'delete'];

  // ─── FIX: use setters so paginator/sort wire up whenever ViewChild resolves ─
  private _paginator!: MatPaginator;
  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    this._paginator = p;
    if (p) {
      this.dataSource.paginator = p;
    }
  }
  get paginator(): MatPaginator { return this._paginator; }

  private _sort!: MatSort;
  @ViewChild(MatSort) set sort(s: MatSort) {
    this._sort = s;
    if (s) {
      this.dataSource.sort = s;
    }
  }
  get sort(): MatSort { return this._sort; }
  // ───────────────────────────────────────────────────────────────────────────

  showActualDeclaration: boolean = false;
  showPlanDeclaration: boolean = false;
  showclosureDeclaration: boolean = false;
  disablePlannedCheckbox: boolean= false;
  disableClosurePlanCheckbox: boolean= false;
  disableActualPlanDate: any;
  disablePlannedDate: any;
  disableClosureDate: any;

  portfolio: string[] = [];
  allcust: boolean = false;
  allproj: boolean = false;
  flag: boolean = false;
  ownerList: EmpInfoModel[] = [];
  ownermodel: EmpInfoModel = new EmpInfoModel();
  selectedOption: string = "1";
  tempData: any;
  tempData1: any;
  filteredData: any;
  filterCriteria: any;
  AllChecked: boolean = false;
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
  maxActualPlanTargetDate: any;
  originalDescription: string = "";
  status = '';
  actuaL_PLAN_DECLARATION: boolean = false;
  planneD_DECLARATION : boolean = false;
  closurE_ACKNOWLEDGE : boolean = false;
  disableActualPlanCheckbox: boolean = false;
  showCommCheckboxError: boolean = false;
  showCommCheckboxErrorComplete: boolean = false;
  showSelectChecboxError: boolean = false;
  declarationVisibility = {
    actual: false,
    plan: false,
    closure: false
  };
  identifiedToCompleted: string[] = ["closure"];
  previousStatus: string = '';
  showInfo = false;
  showDescriptionError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private _appservice: AppsService,
    public _shared: SharedService,
    private _http: HttpClient,
    public _util: MyUtility,
    private changeDetectorRefs: ChangeDetectorRef,
    public _access: AccessControl,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    if (role == enumRoles.Quality.toString())
      this.isQATeam = true;

    if (this.data?.custId != null && this.data?.custId != undefined) {
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
      this.displayedColumns = ['index', 'portfoliO_NAME', 'proJ_NM', 'description', 'owner', 'targeT_DATE', 'identifieD_DATE', 'status', 'priority', 'source', 'completioN_DATE', 'info', 'edit', 'delete'];

    this.getAllActionItemsForCustomer();
    this.getAllProjectsFromCustomer();
    this.Service_CanUpdateToCustomer();
    this.originalDescription = this.EditActionitem.description || '';
    this.status = this.EditActionitem.status || '';
    this.showCommCheckboxError = false;
    this.showCommCheckboxErrorComplete = false;
    this.showSelectChecboxError = false;
    this.showDescriptionError = false;
  }

  ngAfterViewInit() {
    // Paginator/sort are already wired via setters above.
    // This is kept as a safety net in case ViewChild resolves after ngOnInit data load.
    if (this._paginator) this.dataSource.paginator = this._paginator;
    if (this._sort) this.dataSource.sort = this._sort;
  }

  getAllActionItemsForCustomer() {
    this.service_getActionItems();
  }

  filterData(portfolioId: any, projectId: any, allchecked: any, pastDue: any, dueforClosure: any) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.result);

    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0) {
      this.filteredData = this.filteredData.filter((x: any) => this._shared.selectedProjects.indexOf(x.proJ_ID) >= 0);
    }

    if (allchecked) {
      // show all – no extra filtering
    } else {
      this.filteredData = this.filteredData.filter((x: any) => x.status == 'In Progress' || x.status == 'Open');

      if (pastDue && dueforClosure) { /* show both */ }
      else if (!pastDue && !dueforClosure) {
        this.filteredData = [];
      } else if (pastDue) {
        this.filteredData = this.filteredData.filter((x: any) => new Date(x.targeT_DATE) < currentDate);
      } else if (dueforClosure) {
        this.filteredData = this.filteredData.filter((x: any) => new Date(x.targeT_DATE) >= currentDate);
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
        this.tempData1 = this.result.filter((x: any) => x.portfoliO_ID == this._shared.savedportfolioId);
      else if (this.AllChecked && this._shared.savedportfolioId == 0)
        this.tempData1 = this.result;

      if (this.PastDueChecked && this.DueClosureChecked)
        this.tempData1 = this.tempData;
      else if (this.PastDueChecked && !this.DueClosureChecked)
        this.tempData1 = this.tempData.filter((x: any) => new Date(x.targeT_DATE) <= currentDate);
      else if (!this.PastDueChecked && this.DueClosureChecked)
        this.tempData1 = this.tempData.filter((x: any) => new Date(x.targeT_DATE) > currentDate);
      else if (!this.AllChecked && !this.PastDueChecked && !this.DueClosureChecked)
        this.tempData1 = [];
    } else {
      if (this.AllChecked)
        this.tempData1 = this.portfolioData;
      else if (this.PastDueChecked && this.DueClosureChecked)
        this.tempData1 = this.portfolioData.filter((x: any) => x.status == 'In Progress' || x.status == 'Open');
      else if (this.PastDueChecked && !this.DueClosureChecked)
        this.tempData1 = this.portfolioData.filter((x: any) => new Date(x.targeT_DATE) <= currentDate && (x.status == 'In Progress' || x.status == 'Open'));
      else if (!this.PastDueChecked && this.DueClosureChecked)
        this.tempData1 = this.portfolioData.filter((x: any) => new Date(x.targeT_DATE) > currentDate && (x.status == 'In Progress' || x.status == 'Open'));
      else if (!this.AllChecked && !this.PastDueChecked && !this.DueClosureChecked)
        this.tempData1 = [];
    }

    this.RefreshTableForProject(this.tempData1);
  }

  filter_projectPortfolio(input: any) {
    this.projects = (input.map((x: any) => x.proJ_NM)).filter((x: any, i: any, a: any) => a.indexOf(x) == i).sort();
    this.portfolio = (input.map((x: any) => x.portfoliO_NAME)).filter((x: any, i: any, a: any) => a.indexOf(x) == i).sort();
    if (!this.portfolio.includes("All Portfolios"))
      this.portfolio.unshift("All Portfolios");
    if (!this.projects.includes("All Projects"))
      this.projects.unshift("All Projects");
  }

  service_getActionItems() {
    this.isLoading = true;
    this._appservice.getActionItemsDetails(this.selectedCust, this.allproj, 1).subscribe(
      (data: any) => {
        this.result = data;
        this.tempData = this.result.filter((x: any) => x.status == 'In Progress' || x.status == 'Open');

        if (this.result.length == 0)
          this.bShowFilter = false;

        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error loading action items:', error);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
        if (this._util.IsPremier(this.selectedCust)) {
          if (this._shared.savedportfolioId != 0)
            this.tempData = this.tempData.filter((x: any) => x.portfoliO_ID == this._shared.savedportfolioId);

          if (this._shared.savedportfolioId != 0)
            this.selectedPortfolio = this.tempData[0].portfoliO_NAME;
          else
            this.selectedPortfolio = "All Portfolios";
        }

        this.filterData(this.selectedPortfolio, null, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
      }
    );
  }

  uncheckOthers() {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  Project_OnClick() {
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  Portfolio_OnClick() {
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    if (this.selectedPortfolio != "All Portfolios") {
      this.projects = this.result.filter((x: any) => x.portfoliO_NAME == this.selectedPortfolio).map((x: any) => x.proJ_NM).filter((x: any, i: any, a: any) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
    } else {
      this.projects = (this.result.map((x: any) => x.proJ_NM)).filter((x: any, i: any, a: any) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
    }
  }

  getAllProjectsFromCustomer() {
    let role = localStorage.getItem('role');

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allcust = true;
    else
      this.allcust = false;

    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allcust).subscribe(
      (data: any) => {
        this.projNames = data;
      },
      (error: any) => {
        console.error('Error loading project names:', error);
        this._util.serviceError(error);
      }
    );
  }

  // ─── FIX: update .data in-place instead of replacing the whole DataSource ──
  RefreshTableForProject(data: any[]) {
    this.dataSource.data = data;
    // Re-assign paginator and sort to guarantee the connection is live,
    // then reset to page 1 so the count reflects the new dataset.
    setTimeout(() => {
      if (this._paginator) {
        this.dataSource.paginator = this._paginator;
        this._paginator.firstPage();
      }
      if (this._sort) {
        this.dataSource.sort = this._sort;
      }
    });
  }

  RefreshTable() {
    this.dataSource.data = this.result;
    setTimeout(() => {
      if (this._paginator) {
        this.dataSource.paginator = this._paginator;
        this._paginator.firstPage();
      }
      if (this._sort) {
        this.dataSource.sort = this._sort;
      }
    });
  }
  // ───────────────────────────────────────────────────────────────────────────

  ExportTOExcel() {
    let name = 'ActionItem';
    this._util.exportToExcel(this.table.nativeElement, name);
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
    // Scroll to top after entering edit mode
    // Note: Using document.querySelector for mat-sidenav-content which is from parent layout
    setTimeout(() => {
      const sidenavContent = document.querySelector('mat-sidenav-content');
      if (sidenavContent) {
        sidenavContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100);
  }

  getotherDetails() {
    this.getPortfolioName();
    this.getOwnerNamesList();
  }

  getPortfolioName() {
    this._appservice.getPortfolioName(this.EditActionitem.proJ_ID || '').subscribe(
      (data: any) => {
        this.EditActionitem.portfoliO_NAME = data;
      },
      (error: any) => {
        console.error('Error loading portfolio name:', error);
      }
    );
  }

  getOwnerNamesList() {
    this._appservice.getAuditeeDetails(this.selectedCust, this.EditActionitem.proJ_ID || '').subscribe(
      (data: any) => {
        this.ownerList = data;
      },
      (error: any) => {
        console.error('Error loading owner names:', error);
      }
    );
  }

  getprojectsNameForAPortfolio(portid: any) {
    this.projects = this.result.filter((x: any) => x.portfoliO_ID == portid).map((x: any) => x.proJ_NM).filter((x: any, i: any, a: any) => a.indexOf(x) == i).sort();
    this.projects.unshift("All Projects");
  }

  SubmitForm(isValid: any) {
    let a2Date;
    const specialCarPattern = /^[!@#$^&*()?":{}|<>~`_\+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;
    if (this.EditActionitem.description && (specialCarPattern.test(this.EditActionitem.description) || numberPattern.test(this.EditActionitem.description))) {
      this.showWarningPopup('Invalid Description - Please enter alphanumeric or numeric values for description');
      return;
    }
    if (!isValid) {
      this.showWarningPopup("Please enter valid values for required fields");
      return;
    }
    if (this.EditActionitem.status == "Open") {
      this.showWarningPopup("Please update the status (other than Open) to save this Action item");
      return;
    }

    let tDate = new Date(this.EditActionitem.targeT_DATE);
    tDate.setHours(0, 0, 0, 0);

    let iDate = new Date(this.EditActionitem.identifieD_DATE);
    iDate.setHours(0, 0, 0, 0);

    let cdate = this.EditActionitem.completioN_DATE;

    let aDate = new Date(this.EditActionitem.actuaL_CUST_DATE);
    aDate.setHours(0, 0, 0, 0);

    if (this.EditActionitem.closurE_ACTUAL_CUST_DATE) {
      a2Date = new Date(this.EditActionitem.closurE_ACTUAL_CUST_DATE);
      a2Date.setHours(0, 0, 0, 0);
    }

    let plannedDate = new Date(this.EditActionitem.planneD_CUST_DATE);
    plannedDate.setHours(0, 0, 0, 0);

    if (this.EditActionitem.completioN_DATE != null && this.EditActionitem.completioN_DATE != undefined) {
      cdate = new Date(this.EditActionitem.completioN_DATE);
      cdate.setHours(0, 0, 0, 0);
    }

    if (!this.IsDateValid(tDate, iDate)) {
      this.showWarningPopup('Please enter valid target and identified dates');
      return;
    }

    if (!this.IsCompletionDateValid(cdate, iDate)) {
      this.showWarningPopup('Please enter valid identified and completion dates');
      return;
    }

    this.getProjectName();
    this.isSaved = true;
    this.showCommCheckboxError = false;
    this.showCommCheckboxErrorComplete = false;
    this.showSelectChecboxError = false;
    this.showDescriptionError = false;

    if (this.csatBased && this.EditActionitem.status === 'In Progress') {
      if (!this.planneD_DECLARATION && !this.actuaL_PLAN_DECLARATION) {
        this.showCommCheckboxError = true;
        return;
      }
      if (this.planneD_DECLARATION && this.actuaL_PLAN_DECLARATION) {
        this.showSelectChecboxError = true;
        return;
      }
    } else if (this.csatBased && this.EditActionitem.status === 'Completed') {
      if (!this.closurE_ACKNOWLEDGE || !this.EditActionitem.closurE_ACTUAL_CUST_DATE) {
        this.showCommCheckboxErrorComplete = true;
        return;
      }
    }

    if (this.EditActionitem.actioN_ITEM_ID === 0 || this.EditActionitem.actioN_ITEM_ID === undefined) {
      this.EditActionitem.cusT_ID = this.selectedCust;
      const foundProj = this.projNames.find((x: any) => x.proJ_ID == this.EditActionitem.proJ_ID);
      if (foundProj) {
        this.EditActionitem.proJ_NM = foundProj.proJ_NM;
      }
      this.EditActionitem.rag = 'green';
      this.EditActionitem.createD_BY = localStorage.getItem('empid') || '';
      this.EditActionitem.createD_DATE = new Date();
      this.EditActionitem.updateD_BY = localStorage.getItem('empid') || '';
      this.EditActionitem.updateD_DATE = new Date();
      this.service_addActionitem(this.EditActionitem);
      this.readonlymode = true;
      this.editmode = false;
    } else {
      this.EditActionitem.updateD_BY = localStorage.getItem('empid') || '';
      this.EditActionitem.updateD_DATE = new Date();
      this.EditActionitem.actuaL_PLAN_DECLARATION = this.actuaL_PLAN_DECLARATION;
      this.EditActionitem.actuaL_CUST_DATE = aDate;
      this.EditActionitem.planneD_DECLARATION = this.planneD_DECLARATION;
      this.EditActionitem.planneD_CUST_DATE = plannedDate;
      this.EditActionitem.closurE_ACKNOWLEDGE = this.closurE_ACKNOWLEDGE;
      this.EditActionitem.closurE_ACTUAL_CUST_DATE = a2Date;
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
    else if (this.ownermodel.emP_ID)
      this.EditActionitem.owner = this.ownermodel.emP_ID.toString();
  }

  getProjectName() {
    let projectName;
    projectName = this.projNames.find((x: any) => x.proJ_ID == this.EditActionitem.proJ_ID);
    if (projectName != undefined && projectName != null)
      this.EditActionitem.proJ_NM = projectName.proJ_NM;
  }

  IsCompletionDateValid(completionDate: any, identifiedDate: any) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (completionDate != null && completionDate != undefined) {
      if (completionDate >= identifiedDate && completionDate <= currentDate && identifiedDate <= currentDate)
        return true;
      else
        return false;
    } else {
      return true;
    }
  }

  IsDateValid(targetDate: any, identifiedDate: any) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (targetDate >= identifiedDate && identifiedDate <= currentDate)
      return true;
    else
      return false;
  }

  newEditActionitem() {
    this.csatBased = false;
    this.EditActionitem = new ActionitemModelNew();
  }

  EditRow_onClick(element: any) {
    this.csatBased = false;
    this.EditActionitem.actuaL_PLAN_DECLARATION = element.actuaL_PLAN_DECLARATION;
    this.EditActionitem.planneD_DECLARATION = element.planneD_DECLARATION;
    this.EditActionitem.closurE_ACKNOWLEDGE = element.closurE_ACKNOWLEDGE;
    this.disableActualPlanCheckbox = element.actuaL_PLAN_DECLARATION === true;
    this.disablePlannedCheckbox = element.planneD_DECLARATION === true;
    this.disableClosurePlanCheckbox = element.closurE_ACKNOWLEDGE === true;
    this.disableActualPlanDate = element.actuaL_CUST_DATE != null;
    this.disablePlannedDate = element.planneD_CUST_DATE != null;
    this.disableClosureDate = element.closurE_ACTUAL_CUST_DATE != null;

    this.EditActionitem = Object.assign({}, element);

    let tDate = new Date(this.EditActionitem.identifieD_DATE);
    tDate.setDate(tDate.getDate() + 28);
    this.maxTargetDate = tDate;

    let aDate = new Date(this.EditActionitem.identifieD_DATE);
    aDate.setDate(aDate.getDate() + 90);
    this.maxActualPlanTargetDate = aDate;

    if (element.source == "CSS" || element.source.includes('Customer Success Survey') || element.source == 'CSAT' || element.source.includes('Customer Satisfaction Survey')) {
      this.csatBased = true;
    }

    this.Edit_onClick();
  }

  DeleteRow_onClick(element: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Are you sure you want to delete this action item?',
      isConfirmation: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      title: 'Delete Action Item',
      icon: 'delete_forever'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';

    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._appservice.deleteActionItem(element).subscribe(
          (data: any) => { },
          (error: any) => { this._util.serviceError(error); },
          () => {
            this.result.splice(this.result.indexOf(element), 1);
            this.result.sort((a: any, b: any) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
            this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
            this.showWarningPopup('Action Item deleted successfully');
          }
        );
      }
    });
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.csatBased = false;
    this.newEditActionitem();
    this.getAllActionItemsForCustomer();
    this.resetCheckBoxes();
    this.showDescriptionError = false;
  }

  SendUpdateToCustomer(EditActionitem: any) {
    this.isCustomerUpdated = true;
    if (EditActionitem.originaL_DESCRIPTION == EditActionitem.description) {
      this.showWarningPopup('Please update the required details in Description which will be sent as Improvement Plan to Customer and save and continue.');
      this.isCustomerUpdated = false;
      return;
    }

    if (EditActionitem.status == 'Open') {
      this.showWarningPopup('Please update the status and save and then send the Update to Customer.');
      this.isCustomerUpdated = false;
      return;
    }

    const dialogRef = this._util.showWarningConfirmation(
      'If you have made any updates to this action item, please save it first and then send the update to customer. Do you want to continue sending?',
      'Send Update to Customer'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.service_SubmitActionItemPlanToCustomer(this.selectedCust, this.EditActionitem.proJ_ID, this.EditActionitem.actioN_ITEM_ID);
      }
    });
  }

  service_addActionitem(actionitem: any) {
    let apiuri: string = environment.webapiuri + 'AddActionitemNew';
    this._http.post(apiuri, actionitem, { headers: this.GetAuthHeader() })
      .subscribe(
        (data: any) => {
          this.result.push(data);
          this.result.sort((a: any, b: any) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
          this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
          this.showWarningPopup("Action Item Saved");
          this.isSaved = false;
        },
        (error: any) => { this._util.serviceError(error); this.isSaved = false; }
      );
  }

  Service_CanUpdateToCustomer() {
    if (this.EditActionitem?.proJ_ID) {
      this._appservice.service_UpdateTocustomer(this.EditActionitem.proJ_ID).subscribe(
        (data: any) => {
          if (data && data.includes(localStorage.getItem("empid"))) {
            this.canUpdateToCustomer = true;
          } else {
            this.canUpdateToCustomer = false;
          }
        },
        (error: any) => {
          console.error('Error checking update permission:', error);
          this._util.serviceError(error);
        }
      );
    }

    if (this.EditActionitem && this.EditActionitem.status) {
      this.actuaL_PLAN_DECLARATION = this.EditActionitem.actuaL_PLAN_DECLARATION || false;
      this.planneD_DECLARATION = this.EditActionitem.planneD_DECLARATION || false;
      this.closurE_ACKNOWLEDGE = this.EditActionitem.closurE_ACKNOWLEDGE || false;
      this.showCheckBoxVisibility(this.EditActionitem.status);
    }
  }

  service_SubmitActionItemPlanToCustomer(custid: any, projId: any, actionItemId: any) {
    let apiuri: string = environment.webapiuri + 'SubmitActionItemPlanToCustomer?customerId=' + custid + '&projectId=' + projId + '&actionItemId=' + actionItemId;
    this._http.post(apiuri, null, { headers: this.GetAuthHeader() })
      .subscribe(
        data => {
          this.showWarningPopup("Successfully sent the update to Customer Contact.");
          this.isCustomerUpdated = false;
        },
        error => { this._util.serviceError(error); this.isSaved = false; this.isCustomerUpdated = false; }
      );
  }

  service_updateActionitem(actionitem: any) {
    let apiuri: string = environment.webapiuri + 'UpdateActionitemNew';
    this._http.post(apiuri, actionitem, { headers: this.GetAuthHeader() })
      .subscribe(
        data => {
          this.getAllActionItemsForCustomer();
          this.showWarningPopup("Action Item Updated");
          this.isSaved = false;
        },
        error => { this._util.serviceError(error); }
      );
  }

  GetAuthHeader() {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers = headers.append('token', this._util.AppSettings.token);
    headers = headers.append('empid', localStorage.getItem('empid') || '');
    return headers;
  }

  showWarningPopup(message: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { Message: message };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    this.dialog.open(WarningPopupComponent, dialogConfig);
  }

  Filter_onChange($event: any) {
    this.filterCriteria = $event.criteria;
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  showAll($event: any) {
    // Event handler
  }

  projectSelected($event: any) {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  showMoM() {
    this.mom_detail = new MOM_DETAIL();
    this.mom_detail.customeR_ID = Number(this.selectedCust);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      custId: this.selectedCust,
      checked: false
    };
    const dialogRef = this.dialog.open(MinutesofmeetingComponent, dialogConfig);
    dialogRef.updateSize('90%', '600px').updatePosition({ top: '25px', left: '120px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllActionItemsForCustomer();
      }
    });
  }

  OpenEntityInfoPopup(element: any) {
    element.id = element.actioN_ITEM_ID;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      entity: element,
      entityType: 'actionitem',
      header: 'Action Item',
      project: element.proJ_NM
    };
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.panelClass = 'entity-info-dialog';

    const dialogRef = this.dialog.open(EntityBaseInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => { });
  }

  showCheckBoxVisibility(currentStatus: string): void {
    let showList: string[] = [];
    const actualSelected = this.EditActionitem.actuaL_PLAN_DECLARATION;
    const planSelected = this.EditActionitem.planneD_DECLARATION;
    const closureSelected = this.EditActionitem.closurE_ACKNOWLEDGE;

    if (currentStatus === 'Open') {
      showList = [];
    } else if (this.previousStatus === 'Open' && currentStatus === 'Completed') {
      showList = this.identifiedToCompleted;
    } else if (currentStatus === 'In Progress') {
      if (actualSelected || planSelected) {
        showList = [];
        if (actualSelected) showList.push('actual');
        if (planSelected) showList.push('plan');
      } else {
        showList = ['actual', 'plan'];
      }
    } else {
      showList = ['closure'];
      if (actualSelected || planSelected) {
        if (actualSelected) showList.push('actual');
        if (planSelected) showList.push('plan');
      } else {
        showList = ['closure'];
      }
    }

    this.updateDeclarationVisibility(showList);
    this.previousStatus = currentStatus;
  }

  private updateDeclarationVisibility(showList: string[]): void {
    Object.keys(this.declarationVisibility).forEach(x => {
      this.declarationVisibility[x as keyof typeof this.declarationVisibility] = showList.includes(x);
    });
  }

  resetCheckBoxes() {
    this.actuaL_PLAN_DECLARATION = false;
    this.planneD_DECLARATION = false;
    this.closurE_ACKNOWLEDGE = false;
    this.showCommCheckboxErrorComplete = false;
    this.showCommCheckboxError = false;
    this.showSelectChecboxError = false;
  }

  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  onCheckBoxChange(type: any) {
    this.showCommCheckboxError = false;
    this.showSelectChecboxError = false;
    this.showCommCheckboxErrorComplete = false;
    let checkBoxSelectedCount = [this.actuaL_PLAN_DECLARATION, this.planneD_DECLARATION, this.closurE_ACKNOWLEDGE].filter(value => value).length;

    if (this.EditActionitem.status === 'In Progress') {
      if (this.showCommCheckboxError && checkBoxSelectedCount > 1) {
        this.showCommCheckboxError = false;
      } else if (checkBoxSelectedCount == 0) {
        this.showCommCheckboxError = true;
      }
      if (this.showSelectChecboxError && checkBoxSelectedCount == 1) {
        this.showSelectChecboxError = false;
      } else if (checkBoxSelectedCount == 2) {
        this.showSelectChecboxError = true;
        setTimeout(() => {
          if (type === 'actuaL_PLAN_DECLARATION') {
            this.actuaL_PLAN_DECLARATION = false;
          } else if (type === 'planneD_DECLARATION') {
            this.planneD_DECLARATION = false;
          } else if (type === 'closurE_ACKNOWLEDGE') {
            this.closurE_ACKNOWLEDGE = false;
          }
        }, 0);
      }
    }

    if (this.EditActionitem.status === 'Completed') {
      if (this.showCommCheckboxErrorComplete && checkBoxSelectedCount == 2) {
        this.showCommCheckboxErrorComplete = false;
      }
    }
  }

  hasSpecialChars(text: string): boolean {
    const specialCharPattern = /[!@#$^&*()?":{}|<>~`_\+=\[\]\\\/]/;
    return specialCharPattern.test(text);
  }

  validateDescription() {
    const description = this.EditActionitem.description || '';
    if (this.hasSpecialChars(description)) {
      this.showDescriptionError = true;
    } else {
      this.showDescriptionError = false;
    }
  }
}