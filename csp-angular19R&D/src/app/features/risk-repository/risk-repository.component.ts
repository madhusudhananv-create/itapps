import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, inject, Inject, Optional, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';

import { AppsService, ServiceAreaModelNew } from '../../core/services/apps.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter.component';

/**
 * Risk Repository Component
 * Manages centralized risk repository with service tower mapping
 * 
 * Features:
 * - View all risks in repository
 * - Add/Edit/Delete risks
 * - Assign risks to service towers
 * - Risk assessment (Likelihood & Consequences)
 * - Risk treatment strategies
 * - Threats and vulnerabilities tracking
 * - Table filtering and pagination
 * 
 * Migrated from Angular 6 to Angular 19
 * All business logic, names, and styles preserved
 */
@Component({
  selector: 'app-risk-repository',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTooltipModule,
    NavbarNewComponent,
    TableFilterComponent,
    DialogYesNoComponent
  ],
  templateUrl: './risk-repository.component.html',
  styleUrls: ['./risk-repository.component.scss']
})
export class RiskRepositoryComponent implements OnInit, AfterViewInit {
  // Dialog mode properties
  customerId: any;
  projectId: any;
  riskData: any[] = [];
  selection = new SelectionModel<any>(true, []);
  showTable: boolean = false;
  isLoading: boolean = false;
  isDialogMode: boolean = false;
  
  // Standalone mode properties
  result: any[] = [];
  rst: any = [];
  serviceTowerList: any = [];
  editItem: any;
  editmode: boolean = false;
  readonlymode: boolean = true;
  isAddMode: boolean = false;
  filterCriteria: any;
  filteredData: any[] = [];
  selectedServiceArea: any[] = [];
  ServiceAreaList: any[] = [];
  selectedServiceTowerIds: number[] = [];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild("TABLE") table!: ElementRef;
  displayedColumns = [
    "sno",
    "description",
    "impact",
    "likelihood",
    "consequences",
    "risktrtment",
    "serviceTower",
    "threats",
    "vulnerabilities",
    "edit",
    "delete",
  ];
  displayedColumnsDialog = ['isSelected', 'index', 'serviceTower', 'riskDescription', 'riskImpact', 'riskStrategy', 'threats', 'vulnerabilities'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) matTable!: MatTable<any>;
  disableConfig: boolean = false;
  searchValueSAL: any;

  constructor(
    private route: ActivatedRoute, 
    private _appservice: AppsService, 
    private _shared: SharedService, 
    private _util: MyUtility, 
    public _access: AccessControl,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef: MatDialogRef<RiskRepositoryComponent>
  ) {
  }

  ngOnInit() {
    // Check if component is opened in dialog mode
    if (this.data && this.data.CustomerId && this.data.ProjectId) {
      this.isDialogMode = true;
      this.customerId = this.data.CustomerId;
      this.projectId = this.data.ProjectId;
      this.getRiskFromRepository(this.customerId, this.projectId);
    } else {
      this.isDialogMode = false;
      this.GetServiceTower();
      this.GetAllRiskFromRepository();
    }
  }

  ngAfterViewInit() {
    // Link paginator and sort to dataSource after view is initialized
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  // Dialog mode methods
  getRiskFromRepository(customerId: string, projectId: string) {
    this.isLoading = true;
    this._appservice.getRiskFromRepository(customerId, projectId).subscribe(
      (data: any) => {
        this.riskData = data || [];
        this.showTable = this.riskData.length > 0;
        this.isLoading = false;
        this.RefreshTableDialog();
      },
      (error: any) => { 
        console.error('Error fetching risks:', error);
        this.isLoading = false;
        this.showTable = false;
        this._util.serviceError(error); 
      }
    );
  }

  RefreshTableDialog() {
    // Use a longer timeout to ensure modal DOM is fully rendered
    setTimeout(() => {
      
      // Update dataSource data with a new array reference
      this.dataSource.data = [...this.riskData];
      
      // Re-connect paginator and sort after data is set
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator._changePageSize(this.paginator.pageSize);
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      
      // Force table to render rows
      if (this.matTable) {
        this.matTable.renderRows();
      }
      
      // Force change detection multiple times to ensure rendering
      this.cdr.detectChanges();
      
      // Additional change detection after a brief delay
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    }, 300);
  }

  AddRisk() {
    let selectedRisk = this.selection.selected;
    if (selectedRisk.length == 0) {
      this._util.showWarning("Please select at least one risk.");
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
    this.addRiskList(selectedRisk);
    return true;
  }

  addRiskList(selectedRiskList: any[]) {
    this.isLoading = true;
    this._appservice.addRiskList(selectedRiskList).subscribe(
      (data: any) => {
        this.isLoading = false;
        this._util.showSuccess("Risk added successfully");
        this.clear();
        if (this.dialogRef) {
          this.dialogRef.close({ data: selectedRiskList });
        }
      },
      (error: any) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    );
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

  // Standalone mode methods

  GetServiceTower() {
    this._appservice.getServiceAreaList().subscribe(
      (data) => {
        this.serviceTowerList = data;
        this.ServiceAreaList = data;
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  GetAllRiskFromRepository() {
    this._appservice.GetAllRiskFromRepository().subscribe(
      (data) => {
        this.result = data;
        this.RefreshTable(this.result);
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  RefreshTable(data: any) {
    setTimeout(() => {
      this.dataSource.data = data;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }, 100);
  }

  Filter_onChange($event: any) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    
    if (this.isDialogMode) {
      // Don't filter if data hasn't loaded yet
      if (!this.riskData || this.riskData.length === 0) {
        return;
      }
      this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.riskData);
      this.showTable = this.filteredData.length > 0 || this.riskData.length > 0;
    } else {
      if (!this.result || this.result.length === 0) {
        return;
      }
      this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.result);
    }
    
    // Update data without recreating dataSource
    this.dataSource.data = this.filteredData;
  }

  showAll($event: any) {
    // Implementation for show all functionality
  }

  Cancel_onClick() {
    if (this.isDialogMode && this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.readonlymode = true;
      this.editmode = false;
      this.GetAllRiskFromRepository();
    }
  }

  Edit_onClick(flag: any = 0) {
    if (flag == 1) {
      this.disableConfig = true;
      this.isAddMode = false;
    }
    else {
      this.selectedServiceArea = [];
      this.editItem = {};
      this.disableConfig = false;
      this.isAddMode = true;
    }
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable(this.result);
  }

  EditRow_onClick(element: any) {
    this.editItem = Object.assign({}, element);
    this.selectedServiceArea = this.ServiceAreaList.filter(area => element.servicE_TOWER_LIST.includes(area.id));
    this.Edit_onClick(1);
  }

  getServiceIDs(id: any) {
    const associatedServiceTowers = this.rst.filter((x: any) => x.risK_REPOSITORY_ID === id);
    this.selectedServiceTowerIds = associatedServiceTowers.map((item: any) => item.servicE_TOWER_ID);
    this.selectedServiceArea = this.ServiceAreaList.filter(x => this.selectedServiceTowerIds.includes(x.id));
  }

  SubmitForm(isValid: any) {
    if (!isValid) {
      this._util.showWarning("Please enter valid values for required fields");
      return;
    }

    let body = this.saveReqBody();
    body.id = body.id === null || body.id === undefined ? 0 : body.id;
    if (body.risK_DESCRIPTION != undefined) {
      body.risK_DESCRIPTION = body.risK_DESCRIPTION.trim();
      body.risK_DESCRIPTION = body.risK_DESCRIPTION.replace(/\s+/g, ' ');
    }
    if (body.risK_IMPACT != undefined) {
      body.risK_IMPACT = body.risK_IMPACT.trim();
      body.risK_IMPACT = body.risK_IMPACT.replace(/\s+/g, ' ');
    }
    const specialCarPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/]+$/;
    const numberPattern = /^[0-9]+$/;
    if (body.risK_DESCRIPTION != undefined && (specialCarPattern.test(body.risK_DESCRIPTION.trim()) || numberPattern.test(body.risK_DESCRIPTION.trim()))) {
      this._util.showWarning('Invalid Risk Description - Please enter alphanumeric or numeric values along with special characters');
      return;
    }

    if (body.risK_IMPACT != undefined && (specialCarPattern.test(body.risK_IMPACT.trim()) || numberPattern.test(body.risK_IMPACT.trim()))) {
      this._util.showWarning('Invalid Risk Impact - Please enter alphanumeric or numeric values along with special characters');
      return;
    }
    if (body.risK_DESCRIPTION === '') {
      this._util.showWarning('Invalid Risk Description - Please enter alphanumeric or numeric values along with special characters');
      return;
    }
    if (body.risK_IMPACT === '') {
      this._util.showWarning('Invalid Risk Impact - Please enter alphanumeric or numeric values along with special characters');
      return;
    }
    this.AddUpdateRiskRepo(body);
  }

  AddUpdateRiskRepo(item: any) {
    this._appservice.AddUpdateRiskRepo(item).subscribe(
      (data) => {
        this._util.showSuccess("Data Saved Successfully");
        this.readonlymode = true;
        this.editmode = false;
        this.GetAllRiskFromRepository();
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  saveReqBody() {
    let body: RiskRepositoryModel = new RiskRepositoryModel();
    return (body = {
      id: this.editItem.id,
      risK_DESCRIPTION: this.editItem.risK_DESCRIPTION,
      risK_IMPACT: this.editItem.risK_IMPACT,
      likelihood: this.editItem.likelihood,
      isactive: true,
      risK_TREATMENT_STRATEGY: this.editItem.risK_TREATMENT_STRATEGY,
      consequences: this.editItem.consequences,
      threats: this.editItem.threats,
      vulnerabilities: this.editItem.vulnerabilities,
      servicE_TOWER_LIST: this.selectedServiceArea.map(item => item.id)
    });
  }

  DeleteRow_onClick(element: any) {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete the record?'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._appservice.DeleteRiskFromRepository(element).subscribe(
          (data) => {
            this.GetAllRiskFromRepository();
          },
          (error) => {
            this._util.serviceError(error);
          },
          () => {
            this._util.showSuccess("Deleted Successfully");
            this.GetAllRiskFromRepository();
          }
        );
      }
    });
  }

  openedChangeSAL($event: any) {
    // Handle dropdown open/close events if needed
  }

  applyFilterForServiceArea(searchValue: string) {
    // Filter service area list based on search value
    if (searchValue) {
      this.ServiceAreaList = this.serviceTowerList.filter((area: any) => 
        area.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      this.ServiceAreaList = this.serviceTowerList;
    }
  }
}

export class RiskRepositoryModel {
  id?: number;
  risK_DESCRIPTION?: string;
  risK_IMPACT?: string;
  likelihood?: number;
  consequences?: number;
  risK_TREATMENT_STRATEGY?: string;
  isactive?: boolean;
  servicE_TOWER_LIST?: number[];
  threats?: any;
  vulnerabilities?: string;
}
