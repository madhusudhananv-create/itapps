import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { AccessControl } from '../../Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';
import { SharedService } from '../../Shared/shared.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-master-kpi',
  templateUrl: './master-kpi.component.html',
  styleUrls: ['./master-kpi.component.scss']
})
export class MasterKpiComponent implements OnInit {
  kpiList: any[] = [];
  dataSource = new MatTableDataSource(this.kpiList);
  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['isSelected', 'index', 'reference', 'kpiname', 'serviceArea', 'serviceType', 'sla', 'frequency', 'expectedLevel', 'minLevel'];
  isLoading: boolean = false;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  customerId: any;
  productId: any;
  modeId: any;
  filterCriteria: any;
  filteredData: any[];
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _appservice: AppsService,
    private dialog: MatDialogRef<MasterKpiComponent>, private route: ActivatedRoute, private _shared: SharedService, private _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, private _access: AccessControl) { }

  ngOnInit() {
    this.customerId = this.data.customerId;
    this.productId = this.data.productId;
    this.modeId = this.data.modeId;
    this.getAllKPIList();
  }

  getAllKPIList() {
    this._appservice.getAllKpiMasterList().subscribe(data => {
      this.kpiList = data;
      this.RefreshTable();
    }, error => { this._util.serviceError(error); });
  }

  AddKPI() {
    let selectedKPI = this.selection.selected;
    if (selectedKPI.length == 0) {
      alert("Please select atleast one KPI.");
      return false;
    }
    if (selectedKPI.length > 0) {
      for (let kpi of selectedKPI) {
        kpi["customeR_ID"] = this.customerId;
        kpi["projecT_ID"] = "0";
        kpi["goaL_ID"] = "0";
        kpi["modE_ID"] = this.modeId;
        kpi["producT_ID"] = this.productId;
      }
      this.addKpiList(selectedKPI);
    }
  }

  addKpiList(selectedKPI) {
    this.isLoading = true;
    this._appservice.addKpiList(selectedKPI).subscribe(
      data => {
        this.isLoading = false;
        alert("KPI added successfully");
        this.clear();
        this.dialog.close({ data: selectedKPI });
      },
      error => {
        this.isLoading = false;
        this._util.serviceError(error);
      })
  }

  clear() {
    this.selection.clear();
  }

  RefreshTable() {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource(this.kpiList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  getmeasurementforServiceLevel(kpiId) {
    let uom; let expectedLvl;
    if (this.kpiList.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.kpiList.filter(x => x.kpI_MASTER_ID == kpiId)[0]!.slA_TARGET_UNIT_OF_MEASUREMENT;
        expectedLvl = this.kpiList.filter(x => x.kpI_MASTER_ID == kpiId)[0]!.expecteD_SERVICE_LEVEL;
        if (uom == '%')
          return expectedLvl + '%'
        else if (uom == 'Number')
          return expectedLvl + ' per product'
        else
          return expectedLvl
      }
    }
  }

  getmeasurementforMinServiceLevel(kpiId) {
    let uom; let expectedLvl;
    if (this.kpiList.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.kpiList.filter(x => x.kpI_MASTER_ID == kpiId)[0]!.slA_TARGET_UNIT_OF_MEASUREMENT;
        expectedLvl = this.kpiList.filter(x => x.kpI_MASTER_ID == kpiId)[0]!.minimuM_SERVICE_LEVEL;
        if (uom == '%')
          return expectedLvl + '%'
        else if (uom == 'Number')
          return expectedLvl + ' per product'
        else
          return expectedLvl
      }
    }
  }

  Filter_onChange($event) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.kpiList);
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showAll($event) {

  }

  Cancel_onClick() {
    this.dialog.close();
  }

}
