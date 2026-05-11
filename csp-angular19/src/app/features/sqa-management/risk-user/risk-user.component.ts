/**
 * Risk User Component - Migrated from Legacy
 * Manages Process Risks and their mapping to Objectives
 * Features: Add/Edit risks, 3-level risk categorization, Risk-Objective mapping
 */

import { Component, OnInit, ViewChild, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

// Models (using 'any' for flexibility since models may vary)
interface RiskCategory {
  id: number;
  title: string;
  [key: string]: any;
}

interface RiskCategory2 {
  id: number;
  title: string;
  [key: string]: any;
}

interface RiskOwner {
  id?: number;
  title: string;
  [key: string]: any;
}

interface ProcessModelRisksNew {
  id?: number;
  title: string;
  description: string;
  risK_CATEGORY_LEVEL1: number;
  risK_CATEGORY_LEVEL2: number;
  risK_CATEGORY_LEVEL3: number;
  risK_OWNER: string;
  isMapped?: boolean;
  [key: string]: any;
}

interface ObjectiveNew {
  id: number;
  title: string;
  description: string;
  bSelected?: boolean;
  [key: string]: any;
}

interface RiskObjectiveMappingData {
  procesS_MODEL_RISKS_NEW: ProcessModelRisksNew;
  procesS_MODEL_OBJECTIVES_NEW: ObjectiveNew[];
  [key: string]: any;
}

interface ServiceAreaModelNew {
  id: number;
  title: string;
  [key: string]: any;
}

@Component({
  selector: 'app-risk-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './risk-user.component.html',
  styleUrls: ['./risk-user.component.scss']
})
export class RiskUserComponent implements OnInit {
  
  // Template reference for confirmation dialog
  @ViewChild('deleteConfirmDialog') deleteConfirmDialogTemplate!: TemplateRef<any>;
  
  // Risk category lists
  allriskList2: RiskCategory2[] = [];
  allriskList3: RiskCategory2[] = [];
  riskList1: RiskCategory[] = [];
  riskList2: RiskCategory2[] = [];
  riskList3: RiskCategory2[] = [];
  riskOwnerList: RiskOwner[] = [];
  
  // Selected values for form
  id: number = 0;
  selectedRisk1: number | undefined;
  selectedRisk2: number | undefined;
  selectedRisk3: number | undefined;
  selectedOwner: RiskOwner | undefined;
  
  // Risk data
  title: string = '';
  description: string = '';
  riskList: ProcessModelRisksNew[] = [];
  selectedRisk: ProcessModelRisksNew | undefined;
  RiskModel: ProcessModelRisksNew = {
    title: '',
    description: '',
    risK_CATEGORY_LEVEL1: 0,
    risK_CATEGORY_LEVEL2: 0,
    risK_CATEGORY_LEVEL3: 0,
    risK_OWNER: ''
  };
  
  // Objectives
  ObjectivesList: ObjectiveNew[] = [];
  Objectives: ObjectiveNew[] = [];
  
  // Service Areas
  ServiceAreas: ServiceAreaModelNew[] = [];
  ServiceArea: ServiceAreaModelNew | undefined;
  
  // Mapping data
  mappingData: RiskObjectiveMappingData[] = [];
  
  // UI state
  showMapScreen: boolean = false;
  viewMode: boolean = true;
  editMode: boolean = false;
  showAddScreen: boolean = false;
  
  // Data sources
  dataSource: MatTableDataSource<ObjectiveNew> = new MatTableDataSource<ObjectiveNew>();
  dataSource1: MatTableDataSource<RiskObjectiveMappingData> = new MatTableDataSource<RiskObjectiveMappingData>();
  
  displayedColumns = ['index', 'title', 'description', 'action'];
  displayedColumns1 = ['index', 'risK_TITLE', 'risK_DESCRIPTION', 'obJ_LIST', 'risK_CATEGORY_LEVEL1', 
    'risK_CATEGORY_LEVEL2', 'risK_CATEGORY_LEVEL3', 'action'];
  
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild('paginator1') paginator1!: MatPaginator;

  private _appService = inject(AppsService);
  private _util = inject(MyUtility);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.Service_GetRiskCategory1List();
    this.Service_GetRiskCategory2List();
    this.Service_GetRiskCategory3List();
    this.Service_GetObjectivesList();
    this.Service_GetRiskOwnersList();
    this.Service_GetServiceAreaList();
    this.Service_GetRiskObjectivesMappingData();
  }

  Service_GetRiskList() {
    this._appService.GetProcessModelRisksNew().subscribe({
      next: (data: any[]) => {
        this.riskList = data;
        this.determineIfMapped();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  determineIfMapped() {
    this.riskList.forEach(x => x.isMapped = false);
    if (this.mappingData && this.mappingData.length > 0) {
      this.riskList.forEach(x => {
        const element = this.mappingData.find(y => 
          (y.procesS_MODEL_OBJECTIVES_NEW.length === 0 && y.procesS_MODEL_RISKS_NEW.id === x.id)
        );
        x.isMapped = element === undefined;
      });
    }
    this.riskList.sort((a, b) => Number(a.isMapped) - Number(b.isMapped));
  }

  getRiskCategory1Name(id: number): string {
    const element = this.riskList1.find(x => x.id === id);
    return element ? element.title : '';
  }

  getRiskCategory2Name(id: number): string {
    const element = this.allriskList2.find(x => x.id === id);
    return element ? element.title : '';
  }

  getRiskCategory3Name(id: number): string {
    const element = this.allriskList3.find(x => x.id === id);
    return element ? element.title : '';
  }

  Service_GetObjectivesList() {
    this._appService.getObjectivesList().subscribe({
      next: (data: any[]) => {
        this.ObjectivesList = data;
        this.refreshTable(this.ObjectivesList);
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  refreshTable(source: ObjectiveNew[]) {
    this.dataSource = new MatTableDataSource(source);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  refreshTable1(source: RiskObjectiveMappingData[]) {
    this.dataSource1 = new MatTableDataSource(source);
    setTimeout(() => {
      this.dataSource1.paginator = this.paginator1;
    });
  }

  Service_GetRiskCategory1List() {
    this._appService.GetRiskCategory1List().subscribe({
      next: (data: any[]) => {
        this.riskList1 = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetRiskCategory2List() {
    this._appService.GetAllRiskCategory2List().subscribe({
      next: (data: any[]) => {
        this.riskList2 = data;
        this.allriskList2 = this.riskList2;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetRiskCategory3List() {
    this._appService.GetAllRiskCategory3List().subscribe({
      next: (data: any[]) => {
        this.riskList3 = data;
        this.allriskList3 = this.riskList3;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetRiskOwnersList() {
    this._appService.GetRiskOwnersList().subscribe({
      next: (data: any[]) => {
        this.riskOwnerList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetServiceAreaList() {
    this._appService.getServiceAreaList().subscribe({
      next: (data: any[]) => {
        this.ServiceAreas = data as any;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetRiskObjectivesMappingData() {
    this._appService.GetRiskObjectivesMappingData().subscribe({
      next: (data: any[]) => {
        this.mappingData = data;
        this.refreshTable1(this.mappingData);
        this.Service_GetRiskList();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  filterCategory2(id: number) {
    this._appService.GetRiskCategory2List(id).subscribe({
      next: (data: any[]) => {
        this.riskList2 = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  filterCategory3(id: number) {
    this._appService.GetRiskCategory3List(id).subscribe({
      next: (data: any[]) => {
        this.riskList3 = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  filterObjectivesByServiceId(id: number) {
    this._appService.GetObjectivesByServiceAreaId(id).subscribe({
      next: (data: any[]) => {
        this.ObjectivesList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  displayAsString(objarray: ObjectiveNew[]): string {
    if (objarray && objarray.length > 0) {
      return objarray.map(s => s.title).join(', ');
    }
    return "Not Mapped";
  }

  openMapScreen() {
    this.viewMode = false;
    this.showAddScreen = false;
    this.showMapScreen = true;
    this.refreshTable(this.ObjectivesList);
  }

  CloseMapScreen_OnClick() {
    this.showMapScreen = false;
    this.viewMode = true;
    this.showAddScreen = false;
  }

  openAddRiskScreen() {
    this.showAddScreen = !this.showAddScreen;
  }

  CloseAddRisk_OnClick() {
    this.showAddScreen = false;
  }

  CloseMapRisk_OnClick() {
    this.showAddScreen = false;
  }

  ClearInputs() {
    this.title = "";
    this.id = 0;
    this.description = "";
    this.selectedRisk1 = undefined;
    this.selectedRisk2 = undefined;
    this.selectedRisk3 = undefined;
    this.ServiceArea = undefined;
    this.selectedOwner = undefined;
  }

  ClearData() {
    this.ObjectivesList.forEach(x => x.bSelected = false);
    this.selectedRisk = undefined;
  }

  saveRiskMapping_OnClick() {
    if (!this.selectedRisk) {
      this._util.showError("Please select a risk to map");
      return;
    }

    this.Objectives = this.ObjectivesList.filter(x => x.bSelected === true);
    this.RiskModel.title = this.selectedRisk.title;
    this.RiskModel.id = this.selectedRisk.id;
    this.RiskModel.description = this.selectedRisk.description;
    this.RiskModel.risK_CATEGORY_LEVEL1 = this.selectedRisk.risK_CATEGORY_LEVEL1;
    this.RiskModel.risK_CATEGORY_LEVEL2 = this.selectedRisk.risK_CATEGORY_LEVEL2;
    this.RiskModel.risK_CATEGORY_LEVEL3 = this.selectedRisk.risK_CATEGORY_LEVEL3;
    this.RiskModel.risK_OWNER = this.selectedRisk.risK_OWNER;

    if (this.Objectives.length > 0) {
      this._appService.UpdateRiskAndRiskObjMapping(this.Objectives, this.RiskModel).subscribe({
        next: (data: any) => {
          this._util.showSuccess("Update Successful");
          this.Service_GetRiskObjectivesMappingData();
          this.ObjectivesList.forEach(x => x.bSelected = false);
          this.selectedRisk = undefined;
        },
        error: (error: any) => { this._util.serviceError(error); }
      });
    } else {
      this._util.showError("Please choose objectives to map to this risk");
    }
  }

  saveRisk_OnClick() {
    if (!this.title || !this.description || !this.selectedRisk1 || !this.selectedRisk2 ||
        !this.selectedRisk3 || !this.selectedOwner?.title) {
      this._util.showError("Please enter all the required fields");
      return;
    }

    this.RiskModel = {
      title: this.title,
      description: this.description,
      risK_CATEGORY_LEVEL1: this.selectedRisk1,
      risK_CATEGORY_LEVEL2: this.selectedRisk2,
      risK_CATEGORY_LEVEL3: this.selectedRisk3,
      risK_OWNER: this.selectedOwner.title,
      id: this.id
    };

    if (!this.RiskModel.id || this.RiskModel.id === 0) {
      this._appService.addSQARisk(this.RiskModel).subscribe({
        next: (data: any) => {
          this._util.showSuccess('Risk Added Successfully');
          this.ClearInputs();
          this.Service_GetRiskObjectivesMappingData();
          this.showAddScreen = false;
        },
        error: (error: any) => { this._util.serviceError(error); }
      });
    } else {
      this._appService.updateSQARisk(this.RiskModel).subscribe({
        next: (data: any) => {
          this._util.showSuccess('Risk Updated Successfully');
          this.ClearInputs();
          this.Service_GetRiskObjectivesMappingData();
          this.showAddScreen = false;
        },
        error: (error: any) => { this._util.serviceError(error); }
      });
    }
  }

  EditRow_onClick(element: RiskObjectiveMappingData) {
    this.showAddScreen = true;
    this.viewMode = true;
    this.showMapScreen = false;
    this.id = element.procesS_MODEL_RISKS_NEW.id || 0;
    this.title = element.procesS_MODEL_RISKS_NEW.title;
    this.description = element.procesS_MODEL_RISKS_NEW.description;
    this.selectedRisk1 = element.procesS_MODEL_RISKS_NEW.risK_CATEGORY_LEVEL1;
    this.selectedRisk2 = element.procesS_MODEL_RISKS_NEW.risK_CATEGORY_LEVEL2;
    this.selectedRisk3 = element.procesS_MODEL_RISKS_NEW.risK_CATEGORY_LEVEL3;
    this.selectedOwner = this.riskOwnerList.find(x => x.title === element.procesS_MODEL_RISKS_NEW.risK_OWNER);
    
    // Load filtered categories
    if (this.selectedRisk1) {
      this.filterCategory2(this.selectedRisk1);
    }
    if (this.selectedRisk2) {
      this.filterCategory3(this.selectedRisk2);
    }
  }

  DeleteRow_onClick(mapdata: RiskObjectiveMappingData) {
    const dialogRef = this.dialog.open(this.deleteConfirmDialogTemplate, {
      width: '400px',
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this._appService.getStatusOfRisk(mapdata.procesS_MODEL_RISKS_NEW.id || 0).subscribe({
          next: (data: any) => {
            if (data) {
              this._util.showError('This Risk cannot be deleted.');
            } else {
              this._util.showWarning('Please get the consent from CSM/PM to delete this Risk');
            }
          },
          error: (error: any) => { this._util.serviceError(error); }
        });
      }
    });
  }
}
