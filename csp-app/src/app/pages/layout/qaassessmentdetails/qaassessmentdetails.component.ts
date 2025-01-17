import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { AppServiceOthers } from '../../../Services/apps.service.other';
import { AppsService } from '../../../Services/apps.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IsObjectPipe } from 'ngx-pipes';
import { MatTableDataSource, MatPaginator, MatSort, MatTabChangeEvent, MatDialogConfig, MatDialog } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { SharedService } from '../../../Shared/shared.service';
import { DateSelectionModel } from '../../../models/DateSelection-model';
import { findingByType, findingModel, findingDetails } from '../../../models/qaassesmentdetails-model';
import { FilterPreferenceModel } from '../../../models/filter-preference-model';
import { ParameterModel } from '../../../../app/models/parameter-model';
import { LayoutService } from "../layout.service";
import { Http, Headers, RequestOptions } from '@angular/http';
import { auditeE_ACCEPTANCE } from '../../../models/auditee-acceptance';
import { ChecklistExecutionNewComponent } from '../../process-model/checklist-execution-new/checklist-execution-new.component';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-qaassessmentdetails',
  templateUrl: './qaassessmentdetails.component.html',
  styleUrls: ['./qaassessmentdetails.component.scss']
})
export class QaassessmentdetailsComponent implements OnInit {
  originalfindings: findingByType[];
  filterCriteria: any;
  findings: findingByType[] = [];
  constructor(private _router: Router, private _appservice: AppsService, private route: ActivatedRoute, private _http: Http, public _util: myUtility, public _shared: SharedService, private router: Router, public _layoutService: LayoutService, private dialog: MatDialog) { }
  selectedCust: string;
  private sub: any;
  displayedColumns = [];
  dataSource = new MatTableDataSource(this.findings);
  showport: boolean = true;
  //AllFindings : boolean;
  OpenFindings: boolean = true;
  ClosedFindings: boolean;
  showByFindings: string;
  multiProject: boolean = true;
  allfindings: findingDetails[] = [];
  isFromFindingByAge: Boolean = false;
  findingId: number;
  auditId: number;
  stageStatus: string;
  rejectReason: string;
  isAuditorAccept: boolean;
  stageDict = {
    'AUDITEE_ACCEPTANCE AND CAP SUBMISSION': 'Auditee acceptance',
    'CAP REVIEW': 'CAP review',
    'IMPLEMENT CAP': 'Implement CAP',
    'VERIFY CAP IMPLEMENTATION': 'Verify CAP'
  }
  @ViewChildren("paginator") paginator: QueryList<MatPaginator>;
  //@ViewChildren("paginator") paginator2: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  DateSelection: DateSelectionModel = new DateSelectionModel(this._util);
  findingType: string;
  isSelectedRow: any;
  ngOnInit() {
    this.showByFindings = "2";
    this.isFromFindingByAge = Boolean(localStorage.getItem("isFromFindingByAge"));
    if (this.isFromFindingByAge)
      this.displayedColumns = ["index", "portfoliO_NAME", "proJ_NM", "findinG_TYPE", "findinG_DESCRIPTION", "createD_DATE", "stagE_DESCRIPTION", "stagE_STATUS", "targeT_DATE", "responsible", 'agE_OF_FINDING', 'statuS_DATE'];
    else
      this.displayedColumns = ["index", "portfoliO_NAME", "proJ_NM", "findinG_TYPE", "findinG_DESCRIPTION", "createD_DATE", "stagE_DESCRIPTION", "stagE_STATUS", "targeT_DATE", "responsible", 'statuS_DATE'];
    this.sub = this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
      if (params['isfromqagoverance'] == "true") {
        let filterValue = [];
        let findingsType: ParameterModel[] = [];
        this.DateSelection.selectedStartMonth = params['frommonth'];
        this.DateSelection.selectedStartYear = Number(params['fromyear']);
        this.DateSelection.selectedEndMonth = params['tomonth'];
        this.DateSelection.selectedEndYear = Number(params['toyear']);
        this.showByFindings = "1";

        if (params['projid'] != undefined) {
          this._shared.selectedProjects.push(params['projid']);
        }
        switch (params['findingstatus']) {
          case "O": this.OpenFindings = true; break;
          case "C": this.ClosedFindings = true; break;
          case "A": this.OpenFindings = true; this.ClosedFindings = true; break;
          default: break;
        }

        switch (params['findingtype']) {
          case "S": this.findingType = "Strength"; findingsType.push(this.NewParam(1, this.findingType)); break;
          case "W": this.findingType = "Weakness"; findingsType.push(this.NewParam(2, this.findingType)); break;
          case "O": this.findingType = "Opportunity"; findingsType.push(this.NewParam(3, this.findingType)); break;
          case "T": this.findingType = "Threat"; findingsType.push(this.NewParam(4, this.findingType)); break;
          default: break;
        }
        let newFilterValue = new FilterPreferenceModel('PROJECT_FINDINGS', 'Finding Type', true, 'number', findingsType);
        newFilterValue.id = 68;
        newFilterValue.include = true;
        newFilterValue.isactive = true;
        newFilterValue.searchStringValue = this.findingType;
        newFilterValue.fielD_NAME = "findinG_TYPE";
        filterValue.push(newFilterValue);
        this.filterCriteria = filterValue;
      }
    });
    this.showdisplayedColumns();
    this.getAllFindingsForCustomer();
    this.acceptOrRejectFindings();

  }
  acceptOrRejectFindings() {

    var findingStatusDataList: auditeE_ACCEPTANCE[] = [];
    let findingStageData;
    findingStageData = new auditeE_ACCEPTANCE();
    this.route.params.subscribe(params => {
      findingStageData = new auditeE_ACCEPTANCE();
      this.findingId = params['findingid'];
      this.auditId = params['asssessmentid'];
      findingStageData.audit_ID = this.auditId;
      findingStageData.finding_ID = this.findingId;
      if (params['isauditor'] == undefined || params['isauditor'] == null) {
        return;
      }

      if (params['isauditor'] == "1") {
        this.findAcceptValue();
        findingStageData.status = this.stageStatus;
        findingStageData.remarks = this.rejectReason;
        findingStageData.iS_AUDITOR_ACCEPT = true;
        findingStatusDataList.push(findingStageData);
        this._appservice.saveAuditorAcceptanceStatus(findingStatusDataList)
          .subscribe(data => {
            alert("Finding status updated successfully");
            this.getAllFindingsForCustomer();
          },
            (error) => {
              this._util.serviceError(error);

            });
      }
      else if (params['isauditor'] == "0") {
        this.findAcceptValue();
        findingStageData.status = this.stageStatus;
        findingStageData.remarks = this.rejectReason;
        findingStageData.iS_AUDITOR_ACCEPT = false;
        findingStatusDataList.push(findingStageData);

        this._appservice.saveAuditeeAcceptanceStatus(findingStatusDataList)
          .subscribe(data => {
            alert("Finding status updated successfully");
            this.getAllFindingsForCustomer();
          },
            (error) => {
              this._util.serviceError(error);

            });

      }
    });

  }

  findAcceptValue() {
    this.route.params.subscribe(params => {
      if (params['acceptval'] == undefined || params['acceptval'] == null) {
        return;
      }

      if (params['acceptval'] == "1") {
        if (confirm('Are you sure want to accept this finding?')) {
          this.stageStatus = "Accept";
        }
      }
      else if (params['acceptval'] == "0") {
        if (confirm('Are you sure want to reject this finding?')) {
          const reason = prompt('Please provide a reason for rejection');
          if (reason) {
            this.rejectReason = reason;
            this.stageStatus = "Reject";
          }

        }
      }
    });
  }

  getstageDesc(id) {
    return this.stageDict[id];
  }

  saveDates() {
    if (this.showByFindings == "2") {
      this.DateSelection.startDate = null;
      this.DateSelection.endDate = null;
    }
    else {

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
    }
  }


  showdisplayedColumns() {
    if (this._util.IsPremier(this.selectedCust))
      this.showport = false;
    else
      this.showport = true;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  filteredData() {
    let tempData: findingDetails[] = [];
    let groupeddata: findingByType[] = [];
    let filtered: findingDetails[] = [];
    console.log(this.filterCriteria);
    if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0 && this.allfindings != undefined && this.allfindings.length > 0) {
      tempData = this.allfindings.filter(x => this._shared.selectedProjects.indexOf(x.projecT_ID) >= 0);
    }
    else if (this._shared.selectedProjects == undefined || this._shared.selectedProjects.length == 0) {
      tempData = this.allfindings;
    }

    tempData = this._util.ApplyCriteriaRange(this.filterCriteria, tempData);
    if (tempData.length > 0) {
      if (this.ClosedFindings && !this.OpenFindings)
        tempData = tempData.filter(x => x.stagE_STATUS == "Corrective Action Implementation Verified");
      else if (this.OpenFindings && !this.ClosedFindings)
        tempData = tempData.filter(x => x.stagE_STATUS != "Corrective Action Implementation Verified");
      else if (!this.OpenFindings && !this.ClosedFindings)
        tempData = [];
    }

    this.findings = this.getgroupedData(tempData);
    if (this.findings != undefined && this.findings.length > 0) {
      filtered = this.findings[0].findings;
    }
    this.refreshTable(filtered);
  }

  getgroupedData(data: findingDetails[]) {
    var output: findingByType[] = [];
    let element: findingByType;

    for (let i = 0; i < data.length; i++) {
      element = output.find(x => x.findinG_TYPE == data[i].findinG_TYPE);
      if (element != null)
        element.findings.push(data[i])
      else {
        element = new findingByType(data[i].findinG_TYPE);
        output.push(element);
        element.findings.push(data[i]);
      }
    }

    return output;
  }

  onTabChanged(event: MatTabChangeEvent) {
    if (this.findings != undefined && this.findings.length > 0) {
      let filteredfindings = this.findings[event.index].findings
      this.refreshTable(filteredfindings)
    }
  }

  Filter_onChange($event) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData();
  }

  getAllFindingsForCustomer() {
    this.saveDates();
    let obj = new findingModel();
    obj.cusT_ID = this.selectedCust;
    obj.starT_DATE = this.DateSelection.startDate == null ? null : this.DateSelection.startDate.toDateString();
    obj.enD_DATE = this.DateSelection.endDate == null ? null : this.DateSelection.endDate.toDateString();
    obj.proJ_ID = this._shared.selectedProjects[0];
    this.findings = undefined;
    this.originalfindings = undefined;
    this._appservice.getAllFindingsForCustomer(obj).subscribe(data => {
      this.findings = data;
      this.originalfindings = data;
      this.getFindingsWithoutGroup(this.originalfindings);
      this.filteredData();

    },
      (error) => { this._util.serviceError(error); this.originalfindings = []; })
  }

  getFindingsWithoutGroup(findings: findingByType[]) {
    this.allfindings = [];
    findings.forEach(x => {
      this.allfindings.push(...x.findings);
    })
  }
  refreshTable(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

  NewParam(id: number, name: string) {
    let prob = new ParameterModel();
    prob.id = id;
    prob.name = name;
    return prob;
  }

  ViewAssessmentFindingDetails(row) {
    this.isSelectedRow = row;
    let obj = new findingModel();
    obj.cusT_ID = row.customeR_ID;
    obj.proJ_ID = row.projecT_ID;
    obj.assessmenT_ID = row.assessmenT_ID;
    obj.iS_FROM_DASHBOARD = true;

    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.data = {
      'assessmentFindingInputs': obj
    }
    dialogRef.maxWidth = "85%";
    dialogRef.width = "85%";
    dialogRef.height = "100%";
    const dialog = this.dialog.open(ChecklistExecutionNewComponent, dialogRef);
    dialog.afterClosed().subscribe(res => {
      //this.assessmentFindingInputs = new QagoverancedashboardInputs();
    })
  }

  clearValue() {
    localStorage.setItem("isFromFindingByAge", "");
  }
}

