import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { BvdEntryService } from '../services/bvd-entry.service';
import { myUtility } from '../../../Shared/myUtility';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort, MatCheckboxChange, MatDialog } from '@angular/material';
import { Idea, IdeaStatus, IdeaViewModel } from '../../../models/bvd-entry/idea-model';
import { ImplementationPlan } from '../../../models/bvd-entry/idea-implementation-plan-model';
import { IdeaReview } from '../../../models/bvd-entry/idea-review-model';
import { SelectionModel } from '@angular/cdk/collections';
import { AppsService } from '../../../Services/apps.service';
import { BvdDashboardService } from '../../bvd-dashboard/services/bvd-dashboard.service';
import { enumRoles } from '../../../Shared/enum';

@Component({
  selector: 'app-ideas-list-view',
  templateUrl: './ideas-list-view.component.html',
  styleUrls: ['./ideas-list-view.component.scss']
})
export class IdeasListViewComponent implements OnInit {
  bShowFilter: boolean = true;
  status: IdeaStatus[] = [];
  ideaDetails: any;
  statusRec: any;
  menuToggleStatus: boolean;
  ideas: any[] = [];
  ideaAction = 4;
  displayedColumns: string[] = ['select', 'projecT_NAME', 'description', 'potentiaL_SOLUTION_DESCRIPTION', 'type', 'identified_By', 'status', 'identifieD_DATE', 'targeT_DATE', 'actions'];
  dataSource = new MatTableDataSource(this.ideas);
  selection = new SelectionModel<IdeaViewModel>(true, [])
  filterCriteria: any;
  filteredData: any;
  selectedCust: string;
  bulkActionFilter = new ideaUpdate();
  sub: any;
  reset: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild('paginator') pagination: ElementRef;
  custid: string;
  date = new Date();
  fromDate: Date;
  endDate: Date;
  ideaId: number;
  forApproval: boolean = false;
  role: string;
  showAllCust: boolean = false;
  isViewOrApproveOrReject: string;
  projId: string;
  isSelectedRow: any;
  ideaInputs: IdeaInputModel;
  constructor(private _bvdService: BvdEntryService, private _util: myUtility, private router: Router,
    private route: ActivatedRoute, private dialog: MatDialog, private _appService: AppsService, private _bvddashboardService: BvdDashboardService) { }

  ngOnInit() {
    
    this.sub = this.route.params.subscribe(params => {
      localStorage.removeItem('selectedCustomer');
      this.selectedCust = params['customerid'];
      this.projId = params['projid'];
      this.ideaId = params['Ideaid'];
      this.isViewOrApproveOrReject = params['isvieworapproveorreject'];
      this.reset = params['reset'];
      this.ideaAction = params['ideaAction'];
      this.role = localStorage.getItem('role');

      if (this.role == enumRoles.CustomerSuccessManager.toString()) {
        this.forApproval = true;

        if (this.forApproval && (this.isViewOrApproveOrReject == "A" || this.isViewOrApproveOrReject == "R")) {
          this.ideaAction = this.isViewOrApproveOrReject == "A" ? 4 : 5;
          this.approveOrRejectThroughMail();
        }
      }

    }
    );
    if (this.reset == undefined)
      this.reset = true;

    this.getIdeaStatus();

    if (this.route.snapshot.url.toString().startsWith("allcust")) {
      this.route.params.subscribe(params => {
        this.showAllCust = true;
        this.getCustomerList();
      })
    }
    else if (this.ideaId != undefined && this.ideaId != null) {
      localStorage.setItem('ideaId', this.ideaId.toString())
      this.getAllIdeasbyId(this.ideaId);
    }
    else {
      this.ideaInputs = new IdeaInputModel();
      this.ideaInputs.customeR_ID = this.selectedCust;
      this.ideaInputs.StarT_DATE = this._bvddashboardService.dashboardStartdate;
      this.ideaInputs.enD_DATE = this._bvddashboardService.dashboardEnddate;
      this.getAllIdeas(this.ideaInputs);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getIdeaStatus() {
    this._bvdService.getIdeaStatus().subscribe(data => {
      this.status = data;
    }, (err) => { this._util.serviceError(err) })
  }
  getStatus(id) {
    this.statusRec = this.status.find(x => x.id == id);
    if (this.statusRec != undefined)
      return this.statusRec.title

    return "";
  }

  getAllIdeas(ideaInputs) {
    if (ideaInputs.StarT_DATE == null || ideaInputs.StarT_DATE == undefined || ideaInputs.enD_DATE == null || ideaInputs.enD_DATE == undefined) {
      return;
    }

    this._bvdService.ideas = undefined;
    this._bvdService.getAllIdeas(ideaInputs).subscribe(data => {
      this._bvdService.ideas = data;
      this.refreshTable(this._bvdService.ideas);
      this.showFilteredRows();
    }, (err) => { this._util.serviceError(err); this._bvdService.ideas = [] })
  }

  getAllIdeasbyId(ideaId) {
    if (ideaId == null || ideaId == undefined) {
      alert("There is no corresponding idea exists.")
      return;
    }
    this._bvdService.getIdeaById(ideaId).subscribe(data => {
      this._bvdService.ideas = data;
      this._util.linkCalledWithIdeaId = true;
      this.refreshTable(this._bvdService.ideas);
    }, (err) => { this._util.serviceError(err); this._bvdService.ideas = [] })
  }

  btnSubmit_Click() {
    if (this.selection.selected.length == 0) {
      alert("Please Select Records to Update Status");
      return;
    }
    this.bulkActionFilter.IdeaId = this.selection.selected.map(x => x.id);
    this.bulkActionFilter.Status = this.ideaAction;

    this._bvdService.updateIdeaStatus(this.bulkActionFilter).subscribe(data => {
      alert("Idea Status has been Updated");
      this.getAllIdeas(this.ideaInputs);

    }, (err) => {
      this._util.serviceError(err);
    })
  }

  approveOrRejectThroughMail() {
    let statustext = this.bulkActionFilter.Status == 4 ? "Approved" : "Rejected";
    if (confirm('Do you want to continue to move the idea as ' + statustext)) {
      this.bulkActionFilter.IdeaId.push(this.ideaId);
      this.bulkActionFilter.Status = this.ideaAction;

      this._bvdService.updateIdeaStatus(this.bulkActionFilter).subscribe(data => {
        alert("Idea " + statustext);
        this.getAllIdeas(this.ideaInputs);

      }, (err) => {
        this._util.serviceError(err);
      })
    }
  }

  refreshTable(source) {
    this.dataSource = new MatTableDataSource(source);
    this.dataSource.paginator = this.paginator;
    this.selection.clear();
  }

  showAll($event) { }

  addNewIdea() {
    this._bvdService.bvdViewType = 1;
    this._bvdService.bvdidea = new Idea();
    this._bvdService.bvdbenefit = [];
    this._bvdService.bvdimplementationschdules = [];
    this._bvdService.currentStep = 1;
    this._bvdService.isIdeaSubmitted = false;
    this._bvdService.projecT_ID = '';
    this._bvdService.ideA_ID = 0;
    this._bvdService.isIdeaApproved = false;
    this._bvdService.bvdreview = new IdeaReview();

    if (this._util.IsPremier(this.selectedCust)) {
      this.router.navigate(['/serviceleveldashboard/cust', this.selectedCust, this.reset, 'listview', 'entry']);
    }
    else {
      this.router.navigate(['/newdashboard/cust', this.selectedCust, this.reset, 'listview', 'entry']);
    }

  }

  getIdeasDetailsById(id) {
    this.isSelectedRow = id;
    this._bvdService.getIdeaDetailsById(id).subscribe(data => {
      this.ideaDetails = data;
      let ideaStatus = this.ideaDetails.idea.ideA_STATUS_ID
      this._bvdService.bvdViewType = (ideaStatus === 1 || ideaStatus === 5) ? 1 : 2;
      this._bvdService.bvdidea = this.ideaDetails.idea;
      this._bvdService.bvdimplementationschdules = this.ideaDetails.implementatioN_SCHDULES;
      this.ideaDetails.ideA_BENEFITS.forEach(x => x.isExpand = true);
      this._bvdService.bvdbenefit = this.ideaDetails.ideA_BENEFITS;
      this._bvdService.bvdstages = this.ideaDetails.ideaStages;
      this._bvdService.currentStep = this.ideaDetails.idea.stagE_ID;
      this._bvdService.isIdeaSubmitted = this.ideaDetails.idea.issubmitted;
      this._bvdService.ideA_ID = this.ideaDetails.idea.id;
      this._bvdService.projecT_ID = this.ideaDetails.idea.projecT_ID;
      this._bvdService.isIdeaApproved = false;
      this._bvdService.bvdreview = {
        ideA_ID: this._bvdService.ideA_ID,
        ideA_STATUS_ID:
          (this._bvdService.bvdidea.ideA_STATUS_ID == 3 || this._bvdService.bvdidea.ideA_STATUS_ID == 4) ? 4 : undefined,
        revieW_COMMENTS: this._bvdService.bvdidea.revieW_COMMENTS,
        ideA_STATUS_TITLE: this.getStatus(this._bvdService.bvdidea.ideA_STATUS_ID)
      };

      if (this._bvdService.isIdeaSubmitted)
        this._bvdService.currentStep = 4;
      if (this._util.IsPremier(this.selectedCust)) {
        this.router.navigate(['/serviceleveldashboard/cust', this.selectedCust, this.reset, 'listview', 'entry']);
      }
      else {
        this.router.navigate(['/newdashboard/cust', this.selectedCust, this.reset, 'listview', 'entry']);
      }
    }, (err) => { this._util.serviceError(err) })
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.filter(x => x.ideA_STATUS_ID != 1 && x.ideA_STATUS_ID != 4 && x.ideA_STATUS_ID != 3 && x.ideA_STATUS_ID != 5).length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.filter(data => data.ideA_STATUS_ID != 1 && data.ideA_STATUS_ID != 4 && data.ideA_STATUS_ID != 3 && data.ideA_STATUS_ID != 5).forEach(row => this.selection.select(row));
  }

  Filter_onChange($event) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this._bvdService.ideas);
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  resetValues() {
    this._bvdService.ideas = [];
    if (this.custid != undefined) {
      localStorage.setItem('selectedCustomer', this.custid.toString())
      this.router.navigate(['/newdashboard/cust', this.selectedCust, true])
    }
    else {
      if (this._util.IsPremier(this.selectedCust)) {
        this.router.navigate(['/serviceleveldashboard/cust', this.selectedCust, true])
      }
      else {
        this.router.navigate(['/newdashboard/cust', this.selectedCust, false])
      }
    }
  }

  deleteIdeaById(ideaId, statusId) {
    if (statusId == 2 || statusId == 3 || statusId == 4 || statusId == 8) {
      alert("Idea Cannot be Deleted,Since it is already Submitted or Implemented or Approved")
      return;
    }
    if (confirm('Are you sure you want to delete?')) {
      this._bvdService.DeleteIdeaById(ideaId).subscribe(data => {
        alert("Idea Deleted Successfully");
        this.getAllIdeas(this.ideaInputs);
      }, (err) => { this._util.serviceError(err); alert(err.error) })
    }

  }
  showFilteredRows() {
    this.filterData(this.forApproval);

  }
  filterData(pendingApproval: any) {
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this._bvdService.ideas);
    if (pendingApproval) {
      this.filteredData = this.filteredData.filter(x => x.status == 'Submitted');
      // return;
    }
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  empId: string;
  customerList: any[] = [];
  input_custId: string;

  getCustomerList() {
    this.empId = localStorage.getItem('empid');
    if (!this.empId)
      return;
    this._appService.getCustomerByEmpId(this.empId).subscribe(data => {
      this.customerList = data;
      if (this.selectedCust != undefined)
        this.input_custId = this.selectedCust;
      else {
        this.input_custId = this.customerList.filter(x => x.cusT_ID)[0].cusT_ID;
        this.selectedCust = this.input_custId;
      }
      this._util.linkCallfromAllCustlistView = true;
      this.getAllIdeasByCustomer(this.input_custId);
    }, (err) => { this._util.serviceError(err) })
  }

  onCustomerChange(custId) {
    localStorage.removeItem('selectedCustomer');
    this.selectedCust = custId
    this.getAllIdeasByCustomer(this.selectedCust);
  }

  getAllIdeasByCustomer(customerId) {
    this._bvdService.getAllIdeasByCustomer(customerId).subscribe(data => {
      this._bvdService.ideas = data;
      this.refreshTable(this._bvdService.ideas);
      this.showFilteredRows();
    }, (err) => { this._util.serviceError(err) })
  }

}

export class ideaUpdate {
  IdeaId: number[] = [];
  Status: number;
  ideA_STATUS_ID: any[];
  IdeaStatus: any[];
}

export class IdeaInputModel {
  customeR_ID: string;
  StarT_DATE: Date;
  enD_DATE: Date;
}


