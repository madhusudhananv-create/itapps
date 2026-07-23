import { Component, OnInit, ViewChild, Inject, inject, AfterViewInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

import { PortfolioProjectSelectorComponent } from '../../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { TableFilterComponent } from '../../../shared/components/table-filter/table-filter.component';
import { EmployeeSearchComponent } from '../../../components/employee-search/employee-search.component';
import { EntityBaseInfoComponent } from '../entity-base-info/entity-base-info.component';
import { WarningPopupComponent } from '../../../shared/components/warning-popup/warning-popup.component';
import { IssueModel, IssueModelExt } from '../../../shared/models/issue.model';
import { AppsService } from '../../../services/apps.service';
import { AccessControl } from '../../../shared/access-control';
import { LayoutService } from '../../../features/layout/layout.service';
import { UtilityService } from '../../../core/services/utility.service';
import { SharedService } from '../../../shared/shared.service';
import { environment } from '../../../../environments/environment';
import { EmpInfoModel } from '../../../models/emp-info.model';

enum enumRoles {
  BUHeadIMS = 10,
  PMO = 11,
  Quality = 12
}

@Component({
  selector: 'app-issue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    MatRadioModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    PortfolioProjectSelectorComponent,
    TableFilterComponent,
    EmployeeSearchComponent
  ],
  templateUrl: './issues-page.component.html',
  styleUrls: ['./issues-page.component.scss']
})
export class IssuesPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  _appservice = inject(AppsService);
  _access = inject(AccessControl);
  _util = inject(UtilityService);
  _shared = inject(SharedService);

  selectedCust: string = '';
  input: IssueModelExt[] = [];
  EditIssue: IssueModelExt = new IssueModelExt();
  portfolio: string[] = [];
  displayedColumns: string[] = ['index', 'portfoliO_NM', 'subvertical', 'proJ_NM', 'title', 'description', 'issuE_TYPE', 'severity', 'actioN_PLAN', 'assigneD_TO', 'identifieD_DATE', 'targeT_DATE', 'issuE_RESOLVED_DATE', 'status', 'info', 'edit', 'delete'];
  dataSource = new MatTableDataSource<IssueModelExt>(this.input);
  tempData: IssueModelExt[] = [];
  tempData1: IssueModelExt[] = [];
  companyName: string = '';
  _isEmpSelVisible: any;
  projNames: any[] = [];
  allproj: boolean = false;
  selectedProject: string = "All Projects";
  selectedPortfolio: string = "All Portfolios";
  projects: string[] = [];
  toggletext: string = "Hide";
  selectedOption: string = "1";
  AllChecked: boolean = false;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;
  isPopOpened: boolean = false;
  isLoading: boolean = false;
  empinfo: EmpInfoModel[] = [];
  assignedtoText: string = "Assigned To";
  levelmode: boolean = false;
  impactmode: boolean = false;
  EditAllowed: boolean = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  filteredData: any;
  filterCriteria: any;
  bShowFilter: boolean = true;
  input_projectid: string = '';

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any) {}

  ngOnInit() {
    // Scroll to top on navigation
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    this.companyName = environment.company_name;
    
    if (this.data?.custId != null && this.data?.custId != undefined) {
      this.selectedCust = this.data.custId;
      this.isPopOpened = true;
    } else {
      this.route.params.subscribe(params => {
        this.selectedCust = params['custid'];
      });
    }

    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.getAllIssuesForCustomer(this.selectedCust);

    if (!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'subvertical', 'proJ_NM', 'title', 'description', 'issuE_TYPE', 'severity', 'actioN_PLAN', 'assigneD_TO', 'identifieD_DATE', 'targeT_DATE', 'issuE_RESOLVED_DATE', 'status', 'info', 'edit', 'delete'];
    
    this.service_GetEmpInfo();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  employeeSearch_onChange($event: any) {
    let obj = $event;
    this.EditIssue.assigneD_TO_EMPID = obj;
    const employee = this.empinfo.filter(x => x.emP_ID == obj)[0];
    this.EditIssue.assigneD_TO_NAME = employee.frsT_NM;
    this.EditIssue.assigneD_TO = employee.frsT_NM;
    this._isEmpSelVisible = false;
  }

  changeResponsible() {
    if (!this._isEmpSelVisible)
      this._isEmpSelVisible = true;
  }

  getAllIssuesForCustomer(custid: string) {
    this.isLoading = true;
    this._appservice.getAllIssuesForCustomer(custid, this.allproj).subscribe({
      next: (data) => {
        this.input = data.output;
        this.tempData = this.input.filter(x => x.status != 'Closed');
        this.projNames = data.projects;
        this.isLoading = false;

        if (this.input.length == 0)
          this.bShowFilter = false;

        this.projects = (this.input.map(x => x.proJ_NM!)).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.portfolio = (this.input.map(x => x.portfoliO_NM!)).filter((x, i, a) => a.indexOf(x) == i).sort();
        
        if (!this.portfolio.includes("All Portfolios"))
          this.portfolio.unshift("All Portfolios");
        if (!this.projects.includes("All Projects"))
          this.projects.unshift("All Projects");

        if (this._shared.savedportfolioId != 0)
          this.tempData = this.tempData.filter(x => x.portfoliO_ID == this._shared.savedportfolioId);

        if (this._shared.savedportfolioId != 0 && this.tempData.length > 0)
          this.selectedPortfolio = this.tempData[0].portfoliO_NM!;
        else
          this.selectedPortfolio = "All Portfolios";
        
        this.newEditIssue();
        this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
      },
      error: (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    });
  }

  uncheckOthers() {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  getAllProjectsForCustomer() {
    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allproj).subscribe({
      next: (data) => {
        this.projNames = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  getPortfolioName() {
    this._appservice.getPortfolioName(this.EditIssue.projecT_ID!).subscribe(
      data => {
        this.EditIssue.portfoliO_NM = data;
      }
    );
  }

  filterData(portfolioId: any, projectId: any, allchecked: any, pastDue: any, dueforClosure: any) {
    // Apply filter criteria from table-filter component
    this.filteredData = this.input;
    
    // Apply table-filter criteria
    if (this.filterCriteria && this.filterCriteria.length > 0) {
      for (const criteria of this.filterCriteria) {
        try {
          if (criteria.datA_TYPE === 'string' && criteria.values.length === 0) {
            // Regular string search (text fields)
            this.filteredData = this.filteredData.filter((t: any) => {
              const value = t[criteria.fielD_NAME];
              if (value === null || value === undefined) return false;
              return value.toString().toLowerCase().includes(criteria.searchStringValue.toLowerCase());
            });
          } else if (criteria.datA_TYPE === 'string' && criteria.values.length > 0) {
            // String dropdown (like status)
            this.filteredData = this.filteredData.filter((t: any) => {
              return t[criteria.fielD_NAME] === criteria.searchString;
            });
          } else if (criteria.datA_TYPE === 'number') {
            // Number dropdown
            this.filteredData = this.filteredData.filter((t: any) => {
              return t[criteria.fielD_NAME] == criteria.searchString;
            });
          }
        } catch (e) {
          console.error('Filter error:', e);
        }
      }
    }
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0) {
      this.filteredData = this.filteredData.filter((x: any) => this._shared.selectedProjects.indexOf(x.projecT_ID) >= 0);
    }

    if (allchecked) {
      // Show all
    } else {
      this.filteredData = this.filteredData.filter((x: any) => x.status != 'Occured' && x.status != 'Closed');

      if (pastDue && dueforClosure) {
        // Show both
      } else if (!pastDue && !dueforClosure) {
        this.filteredData = [];
      } else if (pastDue) {
        this.filteredData = this.filteredData.filter((x: any) => new Date(x.targeT_DATE) < currentDate);
      } else if (dueforClosure) {
        this.filteredData = this.filteredData.filter((x: any) => new Date(x.targeT_DATE) >= currentDate);
      }
    }

    this.RefreshTableForProject(this.filteredData);
  }

  showFilteredRows() {
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  SubmitForm(isValid: boolean) {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (!isValid) {
      this.showWarningPopup("Please enter valid values for required fields");
      return;
    }

    if ((specialCharPattern.test(this.EditIssue.description!)) || numberPattern.test(this.EditIssue.description!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }

    if ((specialCharPattern.test(this.EditIssue.impacT_SUMMARY!)) || numberPattern.test(this.EditIssue.impacT_SUMMARY!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for Impact Summary');
      return;
    }

    if (specialCharPattern.test(this.EditIssue.geO_LOCATION!) || numberPattern.test(this.EditIssue.geO_LOCATION!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for Location');
      return;
    }

    if (specialCharPattern.test(this.EditIssue.actioN_PLAN!) || numberPattern.test(this.EditIssue.actioN_PLAN!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for Action Plan');
      return;
    }

    if (specialCharPattern.test(this.EditIssue.assigneD_TO!) || numberPattern.test(this.EditIssue.assigneD_TO!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for Assigned To');
      return;
    }

    if (specialCharPattern.test(this.EditIssue.identifieD_BY!) || numberPattern.test(this.EditIssue.identifieD_BY!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for Identified By');
      return;
    }

    if (specialCharPattern.test(this.EditIssue.comments!) || numberPattern.test(this.EditIssue.comments!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for Comments');
      return;
    }

    // Use assigneD_TO as fallback if assigneD_TO_EMPID is not set (for existing records from API)
    if (!this.EditIssue.assigneD_TO_EMPID && this.EditIssue.assigneD_TO) {
      this.EditIssue.assigneD_TO_EMPID = this.EditIssue.assigneD_TO;
    }

    if (this.EditIssue.assigneD_TO_EMPID == null || this.EditIssue.assigneD_TO_EMPID == "" || this.EditIssue.assigneD_TO_EMPID == undefined) {
      this.showWarningPopup('Please enter valid value for Assigned To. Please make sure you select an active employee from the list');
      return;
    }

    let tDate = new Date(this.EditIssue.targeT_DATE!);
    tDate.setHours(0, 0, 0, 0);

    let iDate = new Date(this.EditIssue.identifieD_DATE!);
    iDate.setHours(0, 0, 0, 0);

    if (!this.IsDateValid(tDate, iDate)) {
      this.showWarningPopup('Please enter valid target and identified dates');
      return;
    }

    if (this.EditIssue.status != null && this.EditIssue.status == 'Closed' && this.EditIssue.issuE_RESOLVED_DATE == null) {
      this.showWarningPopup('Please enter value for resolved date for Issues in closed status');
      return;
    }

    if (this.EditIssue.status != null && this.EditIssue.status == 'Closed' && (this.EditIssue.comments == null || this.EditIssue.comments.trim() == '')) {
      this.showWarningPopup('Please enter value for Comments for Issues in closed status');
      return;
    }

    let rdate: any = this.EditIssue.issuE_RESOLVED_DATE;

    if (this.EditIssue.issuE_RESOLVED_DATE != null && this.EditIssue.issuE_RESOLVED_DATE != undefined) {
      rdate = new Date(this.EditIssue.issuE_RESOLVED_DATE);
      rdate.setHours(0, 0, 0, 0);

      if (!this.IsResolvedDateValid(rdate, iDate)) {
        this.showWarningPopup('Please enter valid target and resolved dates');
        return;
      }
    }

    let projectName = this.projNames.find(x => x.proJ_ID == this.EditIssue.projecT_ID);
    if (projectName != undefined && projectName != null)
      this.EditIssue.proJ_NM = projectName.proJ_NM;

    if (this.EditIssue.id === 0 || this.EditIssue.id === undefined) {
      this.EditIssue.id = 0;
      this.EditIssue.rag = 'green';
      this.EditIssue.createD_BY = localStorage.getItem('empid')!;
      this.EditIssue.createD_DATE = new Date();
      this.EditIssue.updateD_BY = localStorage.getItem('empid')!;
      this.EditIssue.updateD_DATE = new Date();
      this.service_addIssue(this.EditIssue);
      this.readonlymode = true;
      this.editmode = false;
    } else {
      this.EditIssue.updateD_BY = localStorage.getItem('empid')!;
      this.EditIssue.updateD_DATE = new Date();
      this.service_updateIssue(this.EditIssue);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditIssue();
  }

  IsResolvedDateValid(resolvedDate: Date, identifiedDate: Date): boolean {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (resolvedDate >= identifiedDate && identifiedDate <= currentDate && resolvedDate <= currentDate)
      return true;
    else
      return false;
  }

  IsDateValid(targetDate: Date, identifiedDate: Date): boolean {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (targetDate >= identifiedDate && identifiedDate <= currentDate)
      return true;
    else
      return false;
  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    // Scroll to top of page after view renders
    // Note: Using document.querySelector for mat-sidenav-content which is from parent layout
    setTimeout(() => {
      // Try scrolling the mat-sidenav-content container (parent layout)
      const sidenavContent = document.querySelector('mat-sidenav-content');
      if (sidenavContent) {
        sidenavContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Also scroll window/body as fallback
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100);
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newEditIssue();
    this.getAllIssuesForCustomer(this.selectedCust);
  }

  EditRow_onClick(element: IssueModelExt) {
    this.EditIssue = Object.assign({}, element);
    this._isEmpSelVisible = false;

    if (this.EditIssue.iS_POTENTIAL_RISK == true)
      this.EnableImpact();

    if (this.EditIssue.reporteD_BY != "reportedbyGAVS")
      this.EnableLevel();

    this.Edit_onClick();
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

  DeleteRow_onClick(element: IssueModelExt): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Are you sure you want to delete this issue?',
      isConfirmation: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      title: 'Delete Issue',
      icon: 'delete_forever'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    
    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._appservice.deleteIssue(element).subscribe({
          next: (data) => {
          },
          error: (error) => {
            console.error('❌ Issue Delete failed:', error);
            this._util.serviceError(error);
          }
        });
        this.input.splice(this.input.indexOf(element), 1);
        this.input.sort((a, b) => a.identifieD_DATE! > b.identifieD_DATE! ? -1 : a.identifieD_DATE! < b.identifieD_DATE! ? 1 : 0);
        this.showWarningPopup("Issue Deleted Successfully");
        this.RefreshTableForProject(this.input);
      }
    });
  }

  Portfolio_OnClick() {
    let portfolioData;
    if (this.selectedPortfolio != "All Portfolios") {
      portfolioData = this.input.filter(x => x.portfoliO_NM == this.selectedPortfolio);
      this.RefreshTableForProject(portfolioData);
      this.projects = this.input.filter(x => x.portfoliO_NM == this.selectedPortfolio).map(x => x.proJ_NM!).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
    } else if (this.selectedPortfolio == "All Portfolios") {
      this.RefreshTableForProject(this.input);
      this.projects = (this.input.map(x => x.proJ_NM!)).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
      this.selectedProject = "All Projects";
    }
  }

  Project_OnClick() {
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  RefreshTableForProject(data: IssueModelExt[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  service_addIssue(issue: IssueModelExt) {
    this._appservice.addIssue(issue).subscribe({
      next: (data) => {
        this.showWarningPopup("Issue Added Successfully");
        this.input.push(data);
        this.input.sort((a, b) => a.identifieD_DATE! > b.identifieD_DATE! ? -1 : a.identifieD_DATE! < b.identifieD_DATE! ? 1 : 0);
        this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
      },
      error: (error) => {
        console.error('❌ Issue Add failed:', error);
        this._util.serviceError(error);
      }
    });
  }

  service_updateIssue(issue: IssueModelExt) {
    this._appservice.updateIssue(issue).subscribe({
      next: (data) => {
        this.showWarningPopup("Issue Updated Successfully");
        this.getAllIssuesForCustomer(this.selectedCust);
      },
      error: (error) => {
        console.error('❌ Issue Update failed:', error);
        this._util.serviceError(error);
      }
    });
  }

  newEditIssue() {
    this.EditIssue = new IssueModelExt();
    this.EditIssue.reporteD_BY = "reportedbyGAVS";
    
    if (this.EditIssue.iS_POTENTIAL_RISK == true)
      this.EnableImpact();

    if (this.EditIssue.reporteD_BY != "reportedbyGAVS")
      this.EnableLevel();
  }

  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
    if (this.bShowFilter)
      this.toggletext = "Hide";
    else
      this.toggletext = "Show";
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

  OpenEntityInfoPopup(element: IssueModelExt) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      entity: element,
      entityType: 'issue',
      header: 'Issue',
      project: element.proJ_NM
    };

    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.panelClass = 'entity-info-dialog';

    const dialogRef = this.dialog.open(EntityBaseInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  service_GetEmpInfo() {
    this._appservice.getEmpInfo().subscribe({
      next: (data) => {
        this.empinfo = data;
      },
      error: (error) => this._util.serviceError(error)
    });
  }

  showWarningPopup(message: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    this.dialog.open(WarningPopupComponent, dialogConfig);
  }
}
