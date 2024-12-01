import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig, MatTableDataSource, MAT_DIALOG_DATA, MatPaginator, MatSort, MatDialogRef } from '@angular/material';
import { ActionitemModelNew } from '../../../models/actionitem-model';
import { environment } from '../../../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';
import { SharedService } from '../../../Shared/shared.service';
import { SelectionModel } from '@angular/cdk/collections';
import { asElementData } from '@angular/core/src/view';
import { RiskPageComponent } from '../risk-page/risk-page.component';
@Component({
  selector: 'app-risk-repository',
  templateUrl: './risk-repository.component.html',
  styleUrls: ['./risk-repository.component.scss']
})
export class RiskRepositoryComponent implements OnInit {
  customerId: any;
  projectId: any;
  riskData: any = [];
  selection = new SelectionModel(true, []);
  dataSource = new MatTableDataSource(this.riskData);
  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['isSelected', 'index', 'serviceTower', 'riskDescription', 'riskImpact', 'riskStrategy', 'threats', 'vulnerabilities'];
  @Output() getRiskInputs = new EventEmitter<any>();
  filterCriteria: any;
  filteredData: any[];
  showTable: boolean = false;
  isLoading: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor(private route: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _http: Http, public _util: myUtility, private changeDetectorRefs: ChangeDetectorRef,
    public _access: AccessControl, @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<RiskRepositoryComponent>) { }

  ngOnInit() {
    if (this.data) {
      this.customerId = this.data.CustomerId;
      this.projectId = this.data.ProjectId;
      this.getRiskFromRepository(this.customerId, this.projectId)
    }
  }

  getRiskFromRepository(customerId, projectId) {
    this._appservice.getRiskFromRepository(customerId, projectId).subscribe(
      data => {
        this.riskData = data;
        if (this.riskData.length > 0) {
          this.showTable = true;
        }
        else {
          this.showTable = false;
        }
        this.RefreshTable();
      },
      error => { this._util.serviceError(error); })
  }

  AddRisk() {
    let selectedRisk = this.selection.selected;
    if (selectedRisk.length == 0) {
      alert("Please select atleast one risk.");
      return false;
    }
    var empId = localStorage.getItem('empid');
    if (selectedRisk.length > 0) {
      for (let risk of selectedRisk) {
        risk["projecT_ID"] = this.projectId;
        risk["rag"] = "green";
        risk["owner"] = "Team";
        risk["status"] = "Identified";
        risk["iS_DRAFT"] = true;
        risk["identifieD_BY"] = empId;
        risk["createD_BY"] = empId;
        risk["updateD_BY"] = empId;
      }
    }
    this.addRiskList(selectedRisk)
  }

  addRiskList(selectedRiskList) {
    this.isLoading = true;
    this._appservice.addRiskList(selectedRiskList).subscribe(
      data => {
        this.isLoading = false;
        alert("Risk added successfully");
        this.clear();
        this.dialog.close({ data: selectedRiskList });
      },
      error => {
        this.isLoading = false;
        this._util.serviceError(error);
      })
  }

  RefreshTable() {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource(this.riskData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  Cancel_onClick() {
    this.dialog.close();
  }

  clear() {
    this.selection.clear();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  Filter_onChange($event) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.riskData);
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showAll($event) {

  }

}