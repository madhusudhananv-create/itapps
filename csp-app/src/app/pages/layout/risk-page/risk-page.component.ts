

import { Component, OnInit, Input, ViewChild, ElementRef, Inject, TemplateRef } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource, MatSort, MAT_DIALOG_DATA, MatExpansionPanel } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { AppsService } from '../../../Services/apps.service';
import { RiskModel, RiskModelExt } from '../../../models/risk-model';
import { AccessControl } from '../../../Shared/accessControl';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { LayoutService } from '../../../pages/layout/layout.service';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { ProjectsModel } from '../../../models/projects-model';
import { enumRoles } from '../../../Shared/enum';
import { SharedService } from '../../../Shared/shared.service';
import { ActionitemModelNew } from '../../../models/actionitem-model';
import { RiskActionItemsComponent } from '../risk-action-items/risk-action-items.component';
import { RiskTreatmentPopupComponent } from '../risk-treatment-popup/risk-treatment-popup.component';
import { RiskRepositoryComponent } from '../risk-repository/risk-repository.component';
import { RiskStatementGuidelineComponent } from '../risk-statement-guideline/risk-statement-guideline.component';
import { EntityBaseInfoComponent } from '../entity-base-info/entity-base-info.component';


@Component({
  selector: 'app-risk-page',
  templateUrl: './risk-page.component.html',
  styleUrls: ['./risk-page.component.scss']
})
export class RiskPageComponent implements OnInit {
  private sub: any;
  selectedProject: string = "All Projects";
  projects: string[] = [];
  input: RiskModelExt[];
  showtable: boolean = false;
  newRisk: boolean = false;
  fields: string[] = [];
  EditRisk: RiskModel;
  projNames: ProjectsModel[];
  TeamMembers: EmpInfoModel[] = [];
  displayedColumns = ['index', 'Portfolio_Name', 'proJ_NM', 'identifieD_DATE', 'description', 'impact', 'owner', 'probabilitY_SCALE', 'impacT_SCALE', 'rating', 'matrix', 'status', 'iS_PLAN_EXISTS', 'actuaL_DATE', 'edit']
  displayedColumns1 = ['index', 'description', 'owner', 'identifieD_DATE', 'targeT_DATE', 'status', 'priority', 'info', 'edit', 'delete'];
  //filters: FiltersModel = new FiltersModel(this._util, this._appservice, this.input, 'PROJECT_RISK');
  dataSource = new MatTableDataSource();
  @ViewChild('paginatorRisk') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource1: MatTableDataSource<ActionitemModelNew>
  @ViewChild('TABLE') table: ElementRef;
  portfolio: string[] = [];
  selectedPortfolio: string;
  tempData: RiskModelExt[];
  selectedOption: string = "1";
  AllChecked: boolean;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;
  tempData1: RiskModelExt[];
  result: any;
  projectId: string;
  projectName: any;
  projectData: any;
  riskTrtPlanData: any;
  allproj: boolean = false;
  riskId: any;
  overallData: any;
  riskInputData: any;
  isPopOpened: boolean = false;
  isLoading: boolean = false;
  isSelectedRow: any;
  riskLocations: any;
  riskCategories: any;
  isoStandardList: any;
  proj_isoStandardList: any;
  filteredIsoStandardList: any;
  riskIsoMappingList: any;
  @ViewChild('confirmationDialog') confirmationDialogTemplate: TemplateRef<any>
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel;

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getAllProjectsFromCustomer();
    this.GetEmployeeNames();
    this.getAllRiskLocation();
    this.getAllRiskCategories();

  }
  numberOfTicks = 0;
  constructor(public router: Router, private _layoutService: LayoutService, private _shared: SharedService, private route: ActivatedRoute, private _http: Http, public _util: myUtility, private _appservice: AppsService,
    private _access: AccessControl, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) private data: any) {
  }
  ngOnInit() {
    if (this.data.custId != null && this.data.custId != undefined) {
      this._layoutService.selectedCust = this.data.custId;
      this.isPopOpened = true;
    }
    else {
      this.sub = this.route.params.subscribe(params => {
        this._layoutService.selectedCust = params['custid'];
        this.riskId = params['riskid'];
      });
    }

    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;


    if (!this._util.IsPremier(this._layoutService.selectedCust)) {
      this.displayedColumns = ['index', 'proJ_NM', 'identifieD_DATE', 'description', 'impact', 'owner', 'probabilitY_SCALE', 'impacT_SCALE', 'rating', 'matrix', 'status', 'iS_PLAN_EXISTS', 'actuaL_DATE', 'edit'];
    }
    this.service_getRiskDetailsByCustomerId(this._layoutService.selectedCust);
    this.getAllProjectsFromCustomer();
    this.getAllRiskCategories();
    this.getAllRiskLocation();
    this.GetEmployeeNames();
  }
  filterCriteria: any;
  filteredData: any;

  filterData(portfolioId: any, projectId: string[], allchecked: any, pastDue: any, dueforClosure: any) {

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.input);

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    // if (portfolioId != null && portfolioId != 0 && portfolioId !="All Portfolios") {
    //   this.filteredData = this.filteredData.filter(x => x.portfoliO_ID == portfolioId || x.portfoliO_NM == portfolioId);
    // }

    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0 && this.filteredData != undefined && this.filteredData != null) {
      this.filteredData = this.filteredData.filter(x => this._shared.selectedProjects.indexOf(x.projecT_ID) >= 0);
    }

    if (allchecked) {

    }
    else {
      this.filteredData = this.filteredData.filter(x => x.status != 'Occurred' && x.status != 'Closed');

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

  uncheckOthers() {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  showFilteredRows() {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
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

  ngOnChanges() {
    this.GetEmployeeNames();
  }

  service_getAuditeeDetails(customerId, projectId: string) {
    if (projectId != undefined && projectId != null && projectId.trim() != "" && projectId != "All Projects"
      && customerId != 0) {
      this._appservice.getAuditeeDetails(customerId, projectId).subscribe(data => {
        this.TeamMembers = data;
        this.TeamMembers.forEach(x => x.empid = x.emP_ID.toString());
      }, error => { this._util.serviceError(error); });
    }
  }

  GetRiskIsoMappingList(riskId) {
    this.riskIsoMappingList = [];
    this._appservice.GetRiskIsoMappingList().subscribe(data => {
      this.riskIsoMappingList = data;
      if (riskId > 0)
        this.EditRisk.isO_STD_ID = this.riskIsoMappingList.filter(item => item.risK_ID === riskId).map(item => item.isO_STANDARD_ID);
    })

  }
  getIsoStandardProjectMappingList(projId, riskId) {
    this.GetRiskIsoMappingList(riskId);
    this.isoStandardList = [];
    this.proj_isoStandardList = [];
    this.filteredIsoStandardList = [];

    this._appservice.GetIsoStandardList().subscribe(data => {
      this.isoStandardList = data;

      this._appservice.GetIsoStandardProjectMappingList(projId).subscribe(data => {
        this.proj_isoStandardList = data;

        if (this.isoStandardList && this.proj_isoStandardList) {
          const projIds = this.proj_isoStandardList.map(item => item.isO_STANDARD_ID);

          this.filteredIsoStandardList = this.isoStandardList.filter(standard =>
            projIds.includes(standard.id)
          );
        }
      }, error => { this._util.serviceError(error); });

    }, error => {
      this._util.serviceError(error);
    });
  }




  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this._layoutService.selectedCust, this.allproj).subscribe(
      data => {
        this.projNames = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getAllRiskLocation() {
    this._appservice.GetRiskLocation().subscribe(data => {
      this.riskLocations = data;
    },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getAllRiskCategories() {
    this._appservice.GetRiskCategory().subscribe(data => {
      this.riskCategories = data;
    },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  checkforever(val) {
    if (val) {

    }
    else {
      this.EditRisk.accepT_TILL = null;
    }
  }

  GetEmployeeNames() {
    return;
    if (this.input == undefined) return;
    if (this.TeamMembers.length > 0) {
      this.input.forEach(x => {
        if (x.owneR_NAME == undefined || x.owneR_NAME == null || x.owneR_NAME == "") {
          var owner = this.TeamMembers.filter(t => t.emaiL_ID == x.owner);
          if (owner.length > 0)
            x.owneR_NAME = owner[0].frsT_NM;
        }
      });
    }
    else {
      this.input.forEach(x => {
        if (x.owneR_NAME == undefined || x.owneR_NAME == null || x.owneR_NAME == "") {
          let empid = x.owner;
          this._appservice.getEmpNameById(empid).subscribe(
            data => {
              x.owneR_NAME = data;
            },
            error => { return empid; }
          )
        }
      });
    }

  }

  calculateRisk() {
    if (this.EditRisk.probabilitY_SCALE != null && this.EditRisk.probabilitY_SCALE != undefined &&
      this.EditRisk.impacT_SCALE != null && this.EditRisk.impacT_SCALE != undefined) {
      const probabilityScale = this.EditRisk.probabilitY_SCALE;
      const impactScale = this.EditRisk.impacT_SCALE;

      if (probabilityScale * impactScale < 5) {
        this.EditRisk.risK_LEVEL = "Low";
      } else if (probabilityScale * impactScale < 10) {
        this.EditRisk.risK_LEVEL = "Moderate";
      } else if (probabilityScale * impactScale < 20) {
        this.EditRisk.risK_LEVEL = "High";
      } else {
        this.EditRisk.risK_LEVEL = "Catastrophic";
      }
    }

  }

  calculateNewRisk() {
    if (this.EditRisk.neW_LIKELIHOOD_SCALE != null && this.EditRisk.neW_LIKELIHOOD_SCALE != undefined &&
      this.EditRisk.neW_CONSEQUENCES_SCALE != null && this.EditRisk.neW_CONSEQUENCES_SCALE != undefined) {
      const probabilityScale = this.EditRisk.neW_CONSEQUENCES_SCALE;
      const impactScale = this.EditRisk.neW_LIKELIHOOD_SCALE;

      if (probabilityScale * impactScale < 5) {
        this.EditRisk.neW_RISK_LEVEL = "Low";
      } else if (probabilityScale * impactScale < 10) {
        this.EditRisk.neW_RISK_LEVEL = "Moderate";
      } else if (probabilityScale * impactScale < 20) {
        this.EditRisk.neW_RISK_LEVEL = "High";
      } else {
        this.EditRisk.neW_RISK_LEVEL = "Catastrophic";
      }
    }
  }

  isEditAllowed = false;
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataUpdate: any;
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter valid values for required fields in all sections");
      return;
    }
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;
    if (this.EditRisk.targeT_DATE != undefined && this.EditRisk.targeT_DATE != null) {
      var curDate = new Date();
      if (this.EditRisk.targeT_DATE
        < new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0, 0)) {
        alert("Target Date should be later than Today");
        return;
      }
    }
    if (this.EditRisk.accepT_TILL != undefined && this.EditRisk.accepT_TILL != null) {
      if (new Date(this.EditRisk.identifieD_DATE) > new Date(this.EditRisk.accepT_TILL)) {
        alert("Accept Till date should be after Risk identified date.")
        return;
      }
    }
    if ((specialCharPattern.test(this.EditRisk.description)) || numberPattern.test(this.EditRisk.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for risk description');
      return;
    }
    if ((specialCharPattern.test(this.EditRisk.impact)) || numberPattern.test(this.EditRisk.impact)) {
      alert('Please enter alphanumeric or numeric values along with special characters for business impact description');
      return;
    }
    if ((specialCharPattern.test(this.EditRisk.owner)) || numberPattern.test(this.EditRisk.owner)) {
      alert('Please enter alphanumeric or numeric values along with special characters for risk owner');
      return;
    }
    if ((specialCharPattern.test(this.EditRisk.area)) || numberPattern.test(this.EditRisk.area)) {
      alert('Please enter alphanumeric or numeric values along with special characters for risk area');
      return;
    }
    if ((specialCharPattern.test(this.EditRisk.identifieD_BY)) || numberPattern.test(this.EditRisk.identifieD_BY)) {
      alert('Please enter alphanumeric name for identified by');
      return;
    }

    const currentDate = new Date();
    const minDate = new Date();
    minDate.setMonth(currentDate.getMonth() - 12);
    if (this.EditRisk.identifieD_DATE <= minDate) {
      alert("Identified date should be within a year from current date")
      return;
    }
    if (this.EditRisk.targeT_DATE != undefined && this.EditRisk.targeT_DATE != null
      && this.EditRisk.identifieD_DATE != undefined && this.EditRisk.identifieD_DATE != null) {
      if (new Date(this.EditRisk.identifieD_DATE) > new Date(this.EditRisk.targeT_DATE)) {
        alert("Target date should be after Risk identified date.")
        return;
      }
    }

    this.EditRisk.actuaL_DATE = this.EditRisk.actuaL_DATE != null ? this._util.setLocaleDate(this.EditRisk.actuaL_DATE) : null;
    this.EditRisk.identifieD_DATE = this.EditRisk.identifieD_DATE != null ? this._util.setLocaleDate(this.EditRisk.identifieD_DATE) : null;
    this.EditRisk.targeT_DATE = this.EditRisk.targeT_DATE != null ? this._util.setLocaleDate(this.EditRisk.targeT_DATE) : null;
    this.EditRisk.actioN_ITEM_IDENTIFIED_DATE = this.EditRisk.actioN_ITEM_IDENTIFIED_DATE ? this._util.setLocaleDate(this.EditRisk.actioN_ITEM_IDENTIFIED_DATE) : null;
    this.EditRisk.actioN_ITEM_TARGET_DATE = this.EditRisk.actioN_ITEM_TARGET_DATE ? this._util.setLocaleDate(this.EditRisk.actioN_ITEM_TARGET_DATE) : null;
    this.EditRisk.actioN_ITEM_COMPLETION_DATE = this.EditRisk.actioN_ITEM_COMPLETION_DATE ? this._util.setLocaleDate(this.EditRisk.actioN_ITEM_COMPLETION_DATE) : null;
    this.EditRisk.neW_RISK_ASSESSMENT_DATE = this.EditRisk.neW_RISK_ASSESSMENT_DATE ? this._util.setLocaleDate(this.EditRisk.neW_RISK_ASSESSMENT_DATE) : null;
    this.EditRisk.risK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE = this.EditRisk.risK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE ? this._util.setLocaleDate(this.EditRisk.risK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE) : null;

    if (this.EditRisk.id === 0 || this.EditRisk.id === undefined) {
      this.EditRisk.id = 0;
      this.EditRisk.rag = 'green';
      this.EditRisk.createD_BY = localStorage.getItem('empid');
      this.EditRisk.createD_DATE = new Date();
      this.EditRisk.updateD_BY = localStorage.getItem('empid');
      this.EditRisk.updateD_DATE = new Date();
      this.EditRisk.iS_DRAFT = false;
      this.service_addRisk(this.EditRisk);
      alert("Risk added successfully");
      this.readonlymode = true;
      this.editmode = false;
      this.showtable = false;
    }
    else {
      this.EditRisk.updateD_BY = localStorage.getItem('empid');
      this.EditRisk.updateD_DATE = new Date();
      this.EditRisk.iS_DRAFT = false;
      this.service_updateRisk(this.EditRisk);
      alert("Risk updated successfully");
      this.readonlymode = true;
      this.editmode = false;
      this.showtable = false;
    }

    this.service_getRiskDetailsByCustomerId(this._layoutService.selectedCust);
    this.newEditRisk();
  }

  Edit_onClick() {
    let today = new Date();
    if (this.EditRisk.id == 0 || this.EditRisk.id == undefined || this.EditRisk.id == null) {
      this.EditRisk.neW_RISK_ASSESSMENT_DATE = new Date(today.getTime() + (31 * 24 * 60 * 60 * 1000));
    }


    this.readonlymode = false;
    this.editmode = true;
    this.showtable = false;
    this.newRisk = false;


  }
  Cancel_onClick() {
    if (this.riskId != null || this.riskId != undefined || this.riskId != 0) {
      this.riskId = null;
    }
    this.readonlymode = true;
    this.editmode = false;
    this.newEditRisk();
    this.service_getRiskDetailsByCustomerId(this._layoutService.selectedCust);
    this.showtable = false;
    this.newRisk = false;
  }

  EditRow_onClick(element) {
    this.EditRisk = element;
    this.getIsoStandardProjectMappingList(element.projecT_ID, element.id);
    this.EditRisk.forever = this.EditRisk.accepT_TILL != null && this.EditRisk.accepT_TILL != undefined;
    this.Edit_onClick();
    this.getActionItems(this.EditRisk.projecT_ID, this.EditRisk.id);
    this.projectId = this.EditRisk.projecT_ID;
    this.getProjectName(this.projectId);
    this.newRisk = true;
  }

  showRiskTreatmentPlanTable() {
    if (this.newRisk) {
      if (this.expansionPanel.expanded) {
        this.showtable = true;
      }
      else {
        this.showtable = false;
      }
    }
  }

  getProjectName(_projectId) {
    this._appservice.GetProjectDetailForEdit(this.projectId).subscribe(
      data => {
        this.projectData = data;
        this.projectName = this.projectData.proJ_NM;
      });
  }

  Add_ActionItem() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = "90%";
    dialogConfig.height = "90%";
    dialogConfig.data = {
      ProjectName: this.projectName,
      ProjectId: this.projectId,
      RiskId: this.EditRisk.id,
      Flag: 'add'
    }
    const dialogRef = this.dialog.open(RiskActionItemsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      this.getActionItems(this.projectId, this.EditRisk.id);
    });
  }


  Edit_ActionItem(element: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = "90%";
    dialogConfig.height = "90%";
    dialogConfig.data = {
      ProjectName: this.projectName,
      ActionItem: element,
      Flag: 'edit'
    }
    const dialogRef = this.dialog.open(RiskActionItemsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      this.getActionItems(element.projecT_ID, element.risK_ID);
    });
  }

  Delete_ActionItem(element) {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteActionItemforRisk(element).subscribe(data => {
      },
        error => {
          this._util.serviceError(error);
        },
        () => {
          this.result.splice(this.result.indexOf(element), 1);
          this.result.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
          this.getActionItems(element.projecT_ID, element.risK_ID)
        });
    } else {

    }
  }

  loadData(element) {
    this.getIsoStandardProjectMappingList(element, 0);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = "90%";
    dialogConfig.height = "90%";
    dialogConfig.data = {
      CustomerId: this._layoutService.selectedCust,
      ProjectId: element,
    }
    const dialogRef = this.dialog.open(RiskRepositoryComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != null && result != undefined && result.data != null && result.data != undefined) {
        this.Cancel_onClick();
      }
    })
  }

  ExportTOExcel() {
    let name = 'Risks'
    this._util.exportToExcel(this.table.nativeElement, name)
  }

  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteRisk(element).subscribe(data => { }, error => { this._util.serviceError(error); });
      this.input.splice(this.input.indexOf(element), 1);
      this.input.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
      this.RefreshTable();
    } else {

    }
  }

  ViewTrtPlan_onClick(element) {
    this.getRiskTreatPlanItems(element.projecT_ID, element.id)
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      element: element,
    }
    dialogConfig.maxWidth = "60%";
    dialogConfig.width = "60%";
    dialogConfig.maxHeight = "60%";
    dialogConfig.height = "60%";
    const dialogRef = this.dialog.open(RiskTreatmentPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  getRiskTreatPlanItems(projectId: string, riskId) {
    this._appservice.getActionItemsforRisk(projectId, riskId).subscribe(
      data => {
        this.riskTrtPlanData = data;
      },
      error => { this._util.serviceError(error); })
  }

  RefreshTable() {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource(this.input);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  RefreshTableforActionItems(data) {
    this.dataSource1 = new MatTableDataSource<ActionitemModelNew>(data);
    this.dataSource1.paginator = this.paginator;
    this.dataSource1.sort = this.sort;
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
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem("empid"));
    return headers;
  }
  Project_OnClick() {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
    let projdata = this.input;
    if (this.selectedProject != "All Projects") {
      projdata = this.input.filter(x => x.proJ_NM == this.selectedProject);
    }
    this.RefreshTableForProject(projdata);
  }

  Portfolio_OnClick() {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
    let portfoliodata = this.input;
    if (this.selectedPortfolio != "All Portfolios") {
      portfoliodata = this.input.filter(x => x.portfoliO_NM == this.selectedPortfolio);
    }
    this.RefreshTableForProject(portfoliodata);
  }

  Project_Change() {
    this.EditRisk.owner = null;
    this.EditRisk.identifieD_BY = null;
    this.GetEmployeeNames();
  }

  getOwnerName(risk: RiskModelExt) {
    if (risk.owneR_NAME != undefined || risk.owneR_NAME != null)
      return risk.owneR_NAME;
    if (this.TeamMembers.filter(x => x.emP_ID.toString() == risk.owner).length > 0)
      return this.TeamMembers.filter(x => x.emP_ID.toString() == risk.owner)[0].frsT_NM;
    if (this.TeamMembers.filter(x => x.emaiL_ID == risk.owner).length > 0)
      return this.TeamMembers.filter(x => x.emaiL_ID == risk.owner)[0].frsT_NM;
    if (risk.owner = "-1")
      return "";
    return risk.owner;

  }

  strategy_change() {
    if (this.EditRisk.risK_TREATMENT_STRATEGY == "Accept") {

    }
    else
      this.EditRisk.accepT_TILL = null;
  }


  service_getRiskDetailsByCustomerId(custid) {
    this.isLoading = true;
    this._appservice.GetRiskDetailsByCustomerId(custid, this.allproj).subscribe(
      data => {
        this.overallData = data;
        this.isEditAllowed = this.overallData.editAllowed;
        this.input = this.overallData.riskDetails;
        this.tempData = this.input.filter(x => x.status != 'Closed' && x.status != 'Occurred');

        if (this._shared.savedportfolioId != 0)
          this.tempData = this.tempData.filter(x => x.portfoliO_ID == this._shared.savedportfolioId);

        if (this._shared.savedportfolioId != 0 && this.tempData.length > 0)
          this.selectedPortfolio = this.tempData[0].portfoliO_NM;
        else
          this.selectedPortfolio = "All Portfolios";

        this.projects = (this.input.map(x => x.proJ_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.projects.unshift("All Projects");
        this.portfolio = (this.input.map(x => x.portfoliO_NM)).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.portfolio.unshift("All Portfolios");
        this.newEditRisk();
        this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        if (this.riskId != null && this.riskId != undefined && this.riskId != 0) {
          let element = this.input.filter(x => x.id == this.riskId)[0];
          this.EditRow_onClick(element);
        }
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    );
  }

  service_updateRag(ragdetails) {
    let apiuri: string = environment.webapiuri + 'UpdateRags';
    this._http.post(apiuri, ragdetails, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  service_addRisk(risk: RiskModel) {
    let apiuri: string = environment.webapiuri + 'AddRisk';
    this._http.post(apiuri, risk, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.input.push(JSON.parse(data.text()));
        this.input.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
        this.RefreshTable();
        this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        this._http.get(environment.webapiuri + 'LoadOverAllRisksData', { headers: this.GetAuthHeader() })
          .subscribe(data => { }, error => { });
      }, error => { this._util.serviceError(error); });
  }
  service_updateRisk(risk: RiskModel) {
    let apiuri: string = environment.webapiuri + 'UpdateRisk';
    this._http.post(apiuri, risk, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.input.sort((a, b) => a.identifieD_DATE > b.identifieD_DATE ? -1 : a.identifieD_DATE < b.identifieD_DATE ? 1 : 0);
        this.RefreshTable();
        this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        this._http.get(environment.webapiuri + 'LoadOverAllRisksData', { headers: this.GetAuthHeader() })
          .subscribe(data => { }, error => { });
      }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  newEditRisk() {
    this.EditRisk = new RiskModel();
  }
  bShowFilter: boolean = true;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }
  Filter_onChange($event) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getActionItems(projectId: string, riskId) {
    this._appservice.getActionItemsforRisk(projectId, riskId).subscribe(
      data => {
        this.result = data;
        this.RefreshTableforActionItems(this.result);
      },
      error => { this._util.serviceError(error); })
  }

  showAll($event) {
    //this.AllChecked = $event;
  }

  projectSelected($event) {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }
  showRiskGuideline() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {

    }

    dialogConfig.maxWidth = "80%",
      dialogConfig.maxHeight = 'fit-content',
      dialogConfig.height = 'auto'

    const dialogRef = this.dialog.open(RiskStatementGuidelineComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  OpenRiskPopup(riskTreatmentStatus) {
    if (riskTreatmentStatus == 'Completed') {
      const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
        width: '500px',
        height: '170px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result == 1) {
          this.EditRisk.probabilitY_SCALE = this.EditRisk.neW_LIKELIHOOD_SCALE;
          this.EditRisk.impacT_SCALE = this.EditRisk.neW_CONSEQUENCES_SCALE;
          this.calculateRisk();
        }
      })
    }
  }
  OpenEntityInfoPopup(element) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      entity: element,
      entityType: 'risk',
      header: 'Risk',
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

