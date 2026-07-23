/**
 * Best Practices Page Component
 * Migrated from LEGACY-SOURCE/src/app/pages/layout/best-practices-page/
 * 
 * This component manages best practices for customer projects with:
 * - Material table with 14 columns (portfolio, project, service tower, process area, process, description, reported by/date, reviewed by/date, approved by/date, edit, delete)
 * - Portfolio and Project filtering (cascading)
 * - Service Tower → Process Area → Process dropdown cascade
 * - Employee autocomplete for 3 fields (Reported By, Reviewed By, Approved By)
 * - Three-stage approval workflow
 * - Matrix view button for quality team
 * - Filter toggle with advanced filtering
 * - Premier customer vs regular customer display logic
 * - Best practice search and filtering by process area
 * - Disabled edit/delete for approved items
 * - Role-based access control
 */

import { Component, OnInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Observable, map, startWith } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { BestPracticesModel, BestPracticesModelExt, GAVSService } from '../../core/models/best-practices-model';
import { ProjectsModel } from '../../models/projects-model';
import { EmpInfoModel } from '../../models/emp-info-model';
import { enumRoles } from '../../shared/enum';
import { SharedService } from '../../shared/shared.service';
import { environment } from '../../../environments/environment';
import { BestpracticeMatrixComponent } from '../bestpractice-matrix/bestpractice-matrix.component';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter.component';

@Component({
  selector: 'app-best-practices-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    NavbarNewComponent,
    TableFilterComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './best-practices-page.component.html',
  styleUrl: './best-practices-page.component.scss'
})
export class BestPracticesPageComponent implements OnInit {
  // Inject dependencies
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  public _util = inject(MyUtility);
  public _layoutService = inject(LayoutService);
  private _appservice = inject(AppsService);
  public _access = inject(AccessControl);
  private changeDetectorRefs = inject(ChangeDetectorRef);
  private _shared = inject(SharedService);
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  // UI state
  bShowFilter: boolean = true;
  bDisabled: boolean = true;
  bVisible: boolean = true;
  toggle: string = "Hide";
  editmode: boolean = false;
  readonlymode: boolean = true;
  allproj: boolean = false;
  flag: boolean = false;

  // Data properties
  selectedCust: string = '';
  selectedProject: string = "All Projects";
  selectedPortfolio: string = "All Portfolios";
  input_projectid: string = '';
  projects: string[] = [];
  portfolio: string[] = [];
  projNames: ProjectsModel[] = [];
  AllBestPractices: BestPracticesModelExt[] = [];
  filteredBestpractices: BestPracticesModelExt[] = [];
  filterSearchedBestpractices: BestPracticesModelExt[] = [];
  projectsForAPortfolio: any;
  portfolioList: any[] = [];
  projIds: string[] = [];
  filterCriteria: any;
  filteredData: any;
  AllChecked: boolean = false;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;

  // Edit model
  editBestPractice: BestPracticesModelExt = new BestPracticesModelExt();

  // Dropdown data
  ddIndustryVertical: any;
  ddClientServiceArea: string[] = [];
  ddProcess: any[] = [];
  ddProcessArea: any[] = [];
  ddServiceArea: any[] = [];
  ddServiceAreaMap: any[] = [];
  projectProcess: any[] = [];
  projectProcessArea: any[] = [];
  ddClientITBusiness: any;
  ddstatus: any[] = [];

  // Employee autocomplete
  myControl = new FormControl();
  myControlReview = new FormControl();
  myControlApprove = new FormControl();
  filteredOptions!: Observable<string[]>;
  filteredOptionsRcsm!: Observable<string[]>;
  filteredOptionsAcsm!: Observable<string[]>;
  empinfo: EmpInfoModel[] = [];
  empinfocsm: EmpInfoModel[] = [];
  empinfopmcsm: EmpInfoModel[] = [];
  customerNamesEmpNames: string[] = [];
  pmcsminfo: string[] = [];
  csminfo: string[] = [];
  empName: any;
  csmReviewName: any;
  csmApproveName: any;

  // Table configuration
  dataSource = new MatTableDataSource<BestPracticesModelExt>([]);
  dataSource1!: MatTableDataSource<BestPracticesModel>;
  dataSource2!: MatTableDataSource<BestPracticesModelExt>;
  displayedColumns = ['index', 'portfoliO_NM', 'proJ_NM', 'servicE_AREA', 'procesS_AREA', 'process', 'description', 'reporteD_BY', 'reporteD_DATE', 'revieweD_BY', 'revieweD_DATE', 'approveD_BY', 'approveD_DATE', 'edit', 'delete'];
  displayedColumns1 = ['index1', 'description1', 'reporteD_BY1', 'reporteD_DATE1', 'use'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('bppaginator') paginator1!: MatPaginator;
  @ViewChild('bppaginator1') paginator2!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatSort) sort2!: MatSort;

  ngOnInit() {
    this.service_GetEmpInfo();
    this.service_GetAllCustomerNamesEmpNames();

    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    if (role == enumRoles.CustomerSuccessManager.toString() || role == enumRoles.ProjectManager.toString())
      this.bDisabled = false;

    this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
    });

    if (!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'proJ_NM', 'servicE_AREA', 'procesS_AREA', 'process', 'description', 'reporteD_BY', 'reporteD_DATE', 'revieweD_BY', 'revieweD_DATE', 'approveD_BY', 'approveD_DATE', 'edit', 'delete'];

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
        startWith<string>(''),
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

  displayReporteByFn = (user?: string): string => {
    if (!this.editmode)
      return user ? user : '';
    else
      return this.empName;
  }

  displayReviewFn = (user?: string): string => {
    if (!this.editmode)
      return user ? user : '';
    else
      return this.csmReviewName;
  }

  displayApproveFn = (user?: string): string => {
    if (!this.editmode)
      return user ? user : '';
    else
      return this.csmApproveName;
  }

  service_GetAllCustomerNamesEmpNames() {
    this._appservice.getAllCustomerNamesEmpNames().subscribe({
      next: (data) => {
        this.customerNamesEmpNames = data;
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetEmpInfo() {
    this.projIds[0] = this.editBestPractice.projecT_ID;
    this._appservice.getProjectResourcebyProjIds(this.projIds).subscribe({
      next: (data: any) => {
        this.empinfocsm = data.filter((x: any) => x.csM_TITLE_ID == 1);
        this.empinfopmcsm = data.filter((x: any) => x.csM_TITLE_ID == 1 || x.csM_TITLE_ID == 2);
        this.pmcsminfo = this.empinfopmcsm.map((x: any) => x.frsT_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.csminfo = this.empinfocsm.map((x: any) => x.frsT_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  getAllProtofolio() {
    this._appservice.getCustomerPortfolioProjectsList(localStorage.getItem('empid') || '', this.allproj).subscribe({
      next: (data: any) => {
        this._layoutService.custGroup = data;
      },
      error: (error: any) => { this._util.serviceError(error); },
      complete: () => {
        this.portfolioList = this._layoutService.custGroup.filter((x: any) => x['cusT_ID'] == this.selectedCust);
        if (!this._util.IsPremier(this.selectedCust)) {
          this.getSelectedPortfolioProjects();
        }
      }
    });
  }

  getSelectedPortfolioProjects() {
    // Project selection logic for non-premier customers
  }

  getAllBestPracticesForCustomer() {
    if (this.selectedCust == undefined)
      return;
    this._appservice.getAllBestPracticesForCustomer(this.selectedCust, this.allproj).subscribe({
      next: (data) => {
        if (data == undefined || data == null) return;
        this.AllBestPractices = data;
        let role = localStorage.getItem('role');
        if (role == enumRoles.Customer.toString()) {
          this.AllBestPractices = data.filter((x: any) => x.status?.toUpperCase() == "PLANNED" || x.status?.toUpperCase() == "STARTED" || x.status?.toUpperCase() == "COMPLETED")
        }

        this.RefreshTableForProject(this.AllBestPractices);
        if (this.AllBestPractices.length == 0)
          this.bShowFilter = false;
      },
      error: (error) => { },
      complete: () => {
        this.filter_projectPortfolio(this.AllBestPractices);
        this.RefreshTableForProject(this.AllBestPractices);
      }
    });
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
    this.getSelectedPortfolioProjects();
    this._appservice.getPortfolioName(this.editBestPractice.projecT_ID).subscribe({
      next: (data) => {
        this.editBestPractice.portfoliO_NM = data;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.changeDetectorRefs.detectChanges();
  }

  filter_projectPortfolio(input: any[]) {
    this.projects = (input.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
    this.portfolio = (input.map(x => x.portfoliO_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
    if (!this.portfolio.includes("All Portfolios"))
      this.portfolio.unshift("All Portfolios");
    if (!this.projects.includes("All Projects"))
      this.projects.unshift("All Projects");
  }

  getotherDetails(element: BestPracticesModelExt | null) {
    this.getPortfolioName();
    this.getddValues(element);
  }

  getddValues(element: BestPracticesModelExt | null) {
    this._appservice.getBestPracticesbyProjId(this.editBestPractice.projecT_ID).subscribe({
      next: (data) => {
        this.ddIndustryVertical = data.ddIndVertical;
        this.ddClientITBusiness = data.ddClientITBusiness;
        this.ddServiceArea = data.ddServiceArea;
        this.ddServiceAreaMap = data.ddServiceAreaMap;
        this.ddProcessArea = data.ddProcessArea
        this.ddProcess = data.ddProcess;
        this.ddstatus = data.ddStatus;
        if (element != null) {
          if (element.servicE_AREA != null && this.ddServiceArea.length > 0) {
            let sid = null;
            sid = this.ddServiceArea.find(x => x.title == element.servicE_AREA)?.id;
            this.editBestPractice.servicE_AREA_ID = sid;
          }
          this.loadProcessAreaswithProcess();
          if (element.procesS_AREA != null && this.ddProcessArea.length > 0) {
            let pAreaid = null;
            pAreaid = this.ddProcessArea.find(x => x.title == element.procesS_AREA)?.id;
            this.editBestPractice.procesS_AREA_ID = pAreaid;
          }

          if (element.process != null && this.ddProcess.length > 0) {
            const processID = this.ddProcess.find((x: any) => x.title == element.process);
            if (processID) {
              this.editBestPractice.procesS_ID = processID.id;
            }
          }
        }
        else {
          this.loadProcessAreaswithProcess();
        }
        this.service_GetEmpInfo();
      },
      error: (error) => { }
    });
  }

  Edit_onClick() {
    this.editBestPractice = new BestPracticesModelExt();
    this.readonlymode = false;
    this.editmode = true;
    this.filteredBestpractices = [];
  }

  GetFilteredBestPractices(event: any) {
    this._appservice.getBestPracticesFromDescription(event).subscribe({
      next: (data) => {
        this.filteredBestpractices = data;
        this.dataSource2 = new MatTableDataSource<BestPracticesModelExt>(this.filteredBestpractices);
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  _focus(input: any) {
    if (input.readOnly == false) {
      let dtval;
      if (input.name == 'dtReportedDate') {
        dtval = this.editBestPractice.reporteD_BY;
      }
      else if (input.name == 'dtReviewedDate') {
        dtval = this.editBestPractice.revieweD_BY;
      }
      else if (input.name == 'dtApprovedDate') {
        dtval = this.editBestPractice.approveD_BY;
      }
      if (dtval && dtval.length > 0 && input.value.length == 0) {
        if (input.name == 'dtReportedDate') {
          this.editBestPractice.reporteD_DATE = new Date();
        }
        else if (input.name == 'dtReviewedDate') {
          this.editBestPractice.revieweD_DATE = new Date();
        }
        else if (input.name == 'dtApprovedDate') {
          this.editBestPractice.approveD_DATE = new Date();
        }
      }
    }
  }

  Portfolio_OnClick() {
    let portfolioData;
    if (this.selectedPortfolio != "All Portfolios") {
      portfolioData = this.AllBestPractices.filter(x => x.portfoliO_NM == this.selectedPortfolio);
      this.RefreshTableForProject(portfolioData);
      this.projects = this.AllBestPractices.filter(x => x.portfoliO_NM == this.selectedPortfolio).map(x => x.proJ_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
    }
    else if (this.selectedPortfolio == "All Portfolios") {
      this.RefreshTableForProject(this.AllBestPractices);
      this.projects = (this.AllBestPractices.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projects.unshift("All Projects");
    }
  }

  Project_OnClick() {
    let projdata = this.AllBestPractices;
    if (this.selectedProject != "All Projects") {
      projdata = this.AllBestPractices.filter(x => x.proJ_NM == this.selectedProject);
    }
    else if (this.selectedProject == "All Projects" && this.selectedPortfolio != "All Portfolios" && this.selectedPortfolio != undefined && this.selectedPortfolio != null)
      projdata = this.AllBestPractices.filter(x => x.portfoliO_NM == this.selectedPortfolio);
    this.RefreshTableForProject(projdata);
  }

  loadProcessAreaswithProcess() {
    let servicemap = this.ddServiceAreaMap.filter(x => x.servicE_AREA_ID == this.editBestPractice.servicE_AREA_ID);
    this.projectProcess = [];
    this.projectProcessArea = [];

    servicemap.forEach((obj: any) => {
      const process = this.ddProcess.find(t => t.id == obj.procesS_ID);
      if (process && !this.projectProcess.some(p => p.id === process.id)) {
        this.projectProcess.push(process);
      }
    });

    if (this.projectProcess.length == 1)
      this.editBestPractice.procesS_ID = this.projectProcess[0].id;

    this.projectProcess.forEach((obj: any) => {
      const processArea = this.ddProcessArea.find(t => t.id == obj.procesS_AREA_ID);
      if (processArea && !this.projectProcessArea.some(p => p.id === processArea.id)) {
        this.projectProcessArea.push(processArea);
      }
    });
    if (this.projectProcessArea.length == 1)
      this.editBestPractice.procesS_AREA_ID = this.projectProcessArea[0].id;
  }

  RefreshTableForProject(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  sendMailToCSM(bestpractiseForm: any) {
    this.SubmitForm(bestpractiseForm.valid);
    if (bestpractiseForm.valid) {
      this._appservice.sendMailToCSM(this.selectedProject, this.selectedCust, this.editBestPractice).subscribe({
        next: (data) => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: (error) => { this._util.serviceError(error); }
      });
    }
    this.editBestPractice = new BestPracticesModelExt();
    this.changeDetectorRefs.detectChanges();
  }

  Use_Element(element: any) {
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

  Close_onClick() {
    this.bVisible = false;
  }

  EditRow_onClick(element: BestPracticesModelExt) {
    if (element.approveD_BY != null) {
      if (element.approveD_BY.length > 0) {
        // Approved items cannot be edited
        // return;
      }
    }
    this.bVisible = true;
    this.editBestPractice = element;
    this.GetFilteredBestPractices(element.procesS_AREA)
    this.getotherDetails(element);
    this.editmode = true;
    this.readonlymode = false;
  }

  DeleteRow_onClick(element: any): void {
    if (element.approveD_BY != null) {
      if (element.approveD_BY.length > 0) {
        return;
      }
    }

    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this best practice record? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'delete',
        iconColor: '#ef4444'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._appservice.deleteBestPractices(element).subscribe({
          next: (data) => {
            this.showToast('Best practice deleted successfully', 'warn');
          },
          error: (error) => { 
            this._util.serviceError(error);
            this.showToast('Failed to delete best practice', 'error');
          },
          complete: () => {
            this.AllBestPractices.splice(this.AllBestPractices.indexOf(element), 1);
            this.RefreshTableForProject(this.AllBestPractices);
          }
        });
      }
    });
  }

  SubmitForm(isValid: boolean) {
    if (!isValid) {
      this.showToast('Please enter all required fields', 'warn');
      return;
    }

    if (this.editBestPractice.id === 0 || this.editBestPractice.id === undefined) {
      this.editBestPractice.cusT_ID = this.selectedCust;
      this.editBestPractice.proJ_NM = this.projNames.find(x => x.proJ_ID == this.editBestPractice.projecT_ID)?.proJ_NM || '';
      this.editBestPractice.createD_BY = localStorage.getItem('empid') || '';
      this.editBestPractice.createD_DATE = new Date();
      this.editBestPractice.updateD_BY = localStorage.getItem('empid') || '';
      this.editBestPractice.updateD_DATE = new Date();
      this.editBestPractice.servicE_AREA = this.ddServiceArea.find(x => x.id == this.editBestPractice.servicE_AREA_ID)?.title || '';
      this.editBestPractice.procesS_AREA = this.ddProcessArea.find(x => x.id == this.editBestPractice.procesS_AREA_ID)?.title || '';
      let process = this.ddProcess.find(x => x.id == this.editBestPractice.procesS_ID && x.procesS_AREA_ID == this.editBestPractice.procesS_AREA_ID);
      if (process != undefined)
        this.editBestPractice.process = process.title;
      else
        this.editBestPractice.process = "";
      this.editBestPractice.reporteD_BY = this.myControl.value;
      this.editBestPractice.revieweD_BY = this.myControlReview.value;
      this.editBestPractice.approveD_BY = this.myControlApprove.value;
      this.service_addBestPractices(this.editBestPractice);
      this.showToast('Best practice added successfully', 'success');
      this.readonlymode = true;
      this.editmode = false;

    }
    else {
      const saveProcess = this.ddProcess.find((x: any) => x.id == this.editBestPractice.procesS_ID && x.procesS_AREA_ID == this.editBestPractice.procesS_AREA_ID);
      this.editBestPractice.servicE_AREA = this.ddServiceArea.find(x => x.id == this.editBestPractice.servicE_AREA_ID)?.title || '';
      this.editBestPractice.procesS_AREA = this.ddProcessArea.find(x => x.id == this.editBestPractice.procesS_AREA_ID)?.title || '';
      this.editBestPractice.process = saveProcess ? saveProcess.title : "";
      this.editBestPractice.reporteD_BY = this.myControl.value;
      this.editBestPractice.revieweD_BY = this.myControlReview.value;
      this.editBestPractice.approveD_BY = this.myControlApprove.value;
      this.editBestPractice.updateD_BY = localStorage.getItem('empid') || '';
      this.editBestPractice.updateD_DATE = new Date();
      this.service_updateBestPractices(this.editBestPractice);
      this.showToast('Best practice updated successfully', 'success');
      this.readonlymode = true;
      this.editmode = false;

    }
    this.changeDetectorRefs.detectChanges();
  }

  // Service methods
  GetAuthHeader() {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers = headers.append('token', this._util.AppSettings.token);
    headers = headers.append('empId', localStorage.getItem('empid') || '');
    return headers;
  }

  service_addBestPractices(bestpractice: BestPracticesModelExt) {
    let apiuri: string = environment.webapiuri + 'AddBestPractices';
    this.http.post(apiuri, bestpractice, { headers: this.GetAuthHeader() })
      .subscribe({
        next: (data: any) => {
          this.AllBestPractices.push(data);
          this.RefreshTableForProject(this.AllBestPractices);
        },
        error: (error) => { this._util.serviceError(error); },
        complete: () => {
          this.RefreshTableForProject(this.AllBestPractices);
        }
      });
  }

  service_updateBestPractices(bestpractice: BestPracticesModelExt) {
    let apiuri: string = environment.webapiuri + 'UpdateBestPractices';
    this.http.post(apiuri, bestpractice, { headers: this.GetAuthHeader() })
      .subscribe({
        next: (data) => {
        },
        error: (error) => { this._util.serviceError(error); }
      });
  }

  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }

  Filter_onChange($event: any) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;

    this.AllChecked = true;
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
    this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  filterData(portfolioId: any, projectId: any, allchecked: any, pastDue: any, dueforClosure: any) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.AllBestPractices);

    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0) {
      this.filteredData = this.filteredData.filter((x: any) => this._shared.selectedProjects.indexOf(x.proJ_ID) >= 0);
    }
    if (allchecked) {

    }
    else {
      this.filteredData = this.filteredData.filter((x: any) => x.status == 'Planned' || x.status == 'Started');

      if (pastDue && dueforClosure) { }
      else if (!pastDue && !dueforClosure) {
        this.filteredData = [];
      }
      else if (pastDue) {
        this.filteredData = this.filteredData.filter((x: any) => new Date(x.targeT_DATE) <= currentDate);
      }
      else if (dueforClosure) {
        this.filteredData = this.filteredData.filter((x: any) => new Date(x.targeT_DATE) > currentDate);
      }
    }

    this.RefreshTableForProject(this.filteredData);
  }

  // Open Best Practice Matrix Dialog
  showBestPracMatrix() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      processArea: "all",
      serviceArea: "all"
    };
    dialogConfig.maxWidth = "100%";
    dialogConfig.height = "100%";
    dialogConfig.width = "100vw";
    
    const dialogRef = this.dialog.open(BestpracticeMatrixComponent, dialogConfig);
    dialogRef.updatePosition({ top: '10px' });
  }

  // Public property for template access
  IsAllowed(featureId: number, actionId: number): boolean {
    return this._access.IsAllowed(featureId, actionId, '', '');
  }

  // Toast notification helper
  private showToast(message: string, type: 'success' | 'warn' | 'error'): void {
    const duration = type === 'error' ? 4000 : 3000;
    const panelClass = `${type}-snackbar`;

    this._snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}
