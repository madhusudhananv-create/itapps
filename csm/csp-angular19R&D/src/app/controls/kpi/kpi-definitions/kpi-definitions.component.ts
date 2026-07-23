/**
 * KPI Definitions Component - Angular 19 Migration
 * 100% Feature Coverage - Migrated from legacy codebase
 * 
 * Tab 2: Set KPI & Targets
 * 
 * This component handles both regular project-based KPIs and product-based KPIs.
 * Features:
 * - Goal-based KPI management
 * - 4-level target system (Low/Medium/High/VeryHigh) with color coding
 * - Service tower multi-select
 * - Global category selection
 * - KPI master selection with search
 * - Target period management
 * - Product view mode support
 */

import { Input, ViewChild, ElementRef, OnChanges, SimpleChanges, inject, Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { KpiSharedService } from '../kpi-shared.service';
import { AccessControl } from '../../../shared/access-control';
import { TableFilterComponent } from '../../../shared/components/table-filter/table-filter.component';
import { trigger, state, style, transition, animate, } from '@angular/animations';
export const detailExpandAnimation = trigger('detailExpand', [
  state('collapsed', style({ height: '0px', minHeight: '0', opacity: 0 })),
  state('expanded', style({ height: '*', opacity: 1 })),
  transition('expanded <=> collapsed',
    animate('220ms cubic-bezier(0.4, 0.0, 0.2, 1)')
  ),
]);
@Component({
  selector: 'app-kpi-definitions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    TableFilterComponent
  ],
  templateUrl: './kpi-definitions.component.html',
  styleUrls: ['./kpi-definitions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [detailExpandAnimation],
})
export class KpiDefinitionsComponent implements OnInit, OnChanges {
  @Input('custId') custId: string = '';
  @Input('projId') projId: string = '';
  @Input('prodId') prodId: number = 0;
  @Input('isProductView') isProductView: Boolean = false;
  @Input('tierId') tierId: number = 0;

  isLoading: Boolean = false;
  serviceAreaProjectMappingList: any[] = [];
  serviceAreaList: any[] = [];
  selectedKPI: any;
  selectedFormula: any;
  selectedNumerator: any;
  selectedDenominator: any;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('definitionForm') definitionForm!: NgForm;
  @ViewChild('proddefinitionForm') proddefinitionForm!: NgForm;

  public _kpiService = inject(KpiSharedService);
  public _util = inject(MyUtility);
  public _appservice = inject(AppsService);
  public _access = inject(AccessControl);

  editAllowed: boolean = false;

  expandedRow: any | null = null;

  // -- Toggle row expansion --------------------------------------------------
  toggleExpand(row: any): void {
    this.expandedRow = this.expandedRow === row ? null : row;
    this.cdr.markForCheck();
  }

  // -- Get row index for display (handles multiTemplateDataRows) -------------
  getRowIndex(row: any): number {
    return this.dataSource.indexOf(row) + 1;
  }

  getTarget(row: any): any | null {
    if (!row?.kpI_TARGETS?.length) return null;
    return row.kpI_TARGETS[row.kpI_TARGETS.length - 1];
  }


  constructor(private cdr: ChangeDetectorRef) {
    if (this._access.IsAllowed(59, 1, '212100001', '')) {
      this.editAllowed = true;
    }
  }

  // Properties
  get goals(): any[] {
    return this._kpiService.goals;
  }
  set goals(val) {
    this._kpiService.goals = val;
  }

  get selectedGoal(): any {
    return this._kpiService.selectedGoal;
  }
  set selectedGoal(val) {
    this._kpiService.selectedGoal = val;
  }

  definitions: any[] = [];
  dataSource: any[] = [];
  definition: any = this.GetNewDefinition();
  kpiDefnitions: any[] = [];
  dataSource1 = new MatTableDataSource(this.kpiDefnitions);
  prodDefinitions: any = {};
  GlobalCategories: any[] = [];
  readonlymode: boolean = true;
  editmode: boolean = false;
  editProdMode: boolean = false;

  dict: any = {
    'ddFrequency': "Frequency",
    'ddGlobalCategory': "Global Category",
    'ddHighOperator': "High Operator",
    'ddUOM': "Unit Of Measurement",
    'txtUniqueId': "KPI Identifier",
    'txtServiceArea': "KPI Area",
    'txtSupportWindow': "Support Window",
    'txtTargetHighDescription': "Green Target Description",
    'txtSLAHighTarget': "Green Target Value",
    'txtAbbreviation': "Abbreviation",
    'selSeviceTower': "Service Tower",
    'txtKPIName': "KPI name",
    'txtSpecLimt': "Specification Limit",
    'txtKPIDesc': "KPI Description",
    'ddServiceRef': "Reference",
    'ddselectKPI': "Base Measure Master KPI"
  };

  // displayedColumns = ['index', 'kpI_UNIQUEID', 'servicE_AREA', 'kpI_NAME', 'servicE_TOWER_ID', 'supporT_WINDOW', 'priority', 'frequency', 'slA_TARGET_LOW_DESCRIPTION', 'slA_TARGET_LOW_OPERATOR', 'slA_TARGET_LOW_VALUE', 'slA_TARGET_MEDIUM_DESCRIPTION', 'slA_TARGET_MEDIUM_OPERATOR', 'slA_TARGET_MEDIUM_VALUE', 'slA_TARGET_HIGH_DESCRIPTION', 'slA_TARGET_HIGH_OPERATOR', 'slA_TARGET_HIGH_VALUE', 'slA_TARGET_VERYHIGH_DESCRIPTION', 'slA_TARGET_VERYHIGH_OPERATOR', 'slA_TARGET_VERYHIGH_VALUE', 'slA_TARGET_UNIT_OF_MEASUREMENT', 'edit', 'delete'];

  baseColumns: string[] = [
    'index',
    'kpI_UNIQUEID',
    'servicE_AREA',
    'kpI_NAME',
    'servicE_TOWER_ID',
    'supporT_WINDOW',
    'frequency',
    'slA_TARGET_UNIT_OF_MEASUREMENT',
    'actions',
  ]
  displayedColumns1 = ['index', 'reference', 'kpiname', 'description', 'serviceArea', 'serviceType', 'sla', 'frequency', 'expectedLevel', 'minLevel'];

  serviceModes: any[] = [];
  selectedMode: string = '';
  selectedLevel: string = '';
  reference: any[] = [];
  selectedModetitle: string = '';
  overallKPIList: any[] = [];
  originalKPIList: any[] = [];
  serviceArea: any[] = [];
  serviceLevel: any[] = [];
  // filteredData: any[] = []; // Removed - filter only in KPI Achievements entry tab
  // filterCriteria: any[] = []; // Removed - filter only in KPI Achievements entry tab

  selectedTarget: any = this.GetNewTarget();
  selectedProdTarget: any = this.GetNewProdTarget();
  selectedKPIDetails: any = {};

  // Lifecycle hooks
  ngOnInit() {
    this.Service_GetServiceAreaList();
    this.getOverallKPIList();
    if (this.isProductView && this.prodId != null && this.prodId != undefined) {
      this.LoadProductData();
    } else {
      this.LoadData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    
    // Check if prodId has changed (including first change)
    if (changes['prodId']) {
      const newProdId = changes['prodId'].currentValue;
      const oldProdId = changes['prodId'].previousValue;
      
      // Only load if we have a valid new prodId and it's different from the old one
      if (this.isProductView && newProdId != null && newProdId != undefined && newProdId !== oldProdId) {
        this.LoadProductData();
        this.readonlymode = true;
        this.editmode = false;
        this.editProdMode = false;
        return;
      }
    }
    
    if (this.isProductView && this.prodId != null && this.prodId != undefined) {
      this.LoadProductData();
      this.readonlymode = true;
      this.editmode = false;
      this.editProdMode = false;
    } else {
      this.LoadData();
      this.readonlymode = true;
      this.editmode = false;
    }
  }

  // Helper functions to create new objects
  GetNewDefinition(): any {
    return {
      id: 0,
      goaL_ID: 0,
      customeR_ID: '',
      projecT_ID: '',
      kpI_MASTER_ID: 0,
      kpI_UNIQUEID: '',
      servicE_AREA: '',
      kpI_NAME: '',
      abbreviation: '',
      globaL_KPI_CATEGORY_ID: 0,
      supporT_WINDOW: '',
      priority: '',
      frequency: '',
      servicE_TOWER_ID: [],
      slA_TARGET_UNIT_OF_MEASUREMENT: '',
      shoW_IN_CHART: false,
      iS_SOW_COMMITMENT: false,
      succesS_GOAL: '',
      modE_ID: 0,
      producT_ID: 0,
      createD_BY: '',
      createD_DATE: new Date(),
      updateD_BY: '',
      updateD_DATE: new Date(),
      isactive: true,
      kpI_TARGETS: [],
      producT_kPI_DETAILS: []
    };
  }

  GetNewTarget(): any {
    return {
      id: 0,
      kpI_ID: 0,
      starT_DATE: new Date(),
      enD_DATE: new Date(),
      slA_TARGET_LOW_DESCRIPTION: '',
      slA_TARGET_LOW_OPERATOR: '',
      slA_TARGET_LOW_VALUE: null,
      slA_TARGET_MEDIUM_DESCRIPTION: '',
      slA_TARGET_MEDIUM_OPERATOR: '',
      slA_TARGET_MEDIUM_VALUE: null,
      slA_TARGET_HIGH_DESCRIPTION: '',
      slA_TARGET_HIGH_OPERATOR: '',
      slA_TARGET_HIGH_VALUE: null,
      slA_TARGET_VERYHIGH_DESCRIPTION: '',
      slA_TARGET_VERYHIGH_OPERATOR: '',
      slA_TARGET_VERYHIGH_VALUE: null
    };
  }

  GetNewProdTarget(): any {
    return {
      id: 0,
      kpI_ID: 0,
      starT_DATE: new Date(),
      enD_DATE: new Date(),
      specificatioN_LIMIT: '',
      slA_TARGET_HIGH_OPERATOR: '',
      minimuM_SERVICE_LEVEL: null,
      slA_TARGET_VERYHIGH_OPERATOR: '',
      expecteD_SERVICE_LEVEL: null,
      updateD_BY: '',
      updateD_DATE: new Date(),
      isactive: true
    };
  }

  // Data loading functions
  LoadProductData() {
    if (this.prodId && this.prodId > 0) {
      this.loadProductModes(this.prodId);
      this.loadServiceArea();
      this.service_GetGlobalKpiCategories();
      this.loadReference();
      // Don't call Service_GetServiceAreaProjectMapping in product view (no projId)
    } else {
      console.warn('LoadProductData: Invalid prodId - skipping data load');
    }
  }

  LoadData() {
    if (this.projId != undefined && this.projId != '') {
      this._appservice.GetKpiDefinitions(this.custId, this.projId).subscribe({
        next: (data: any) => {
          this.definitions = data;
          this.ddGoals_Onchange();
          // Force OnPush change detection after data load
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('LoadData: Error loading KPI definitions', error);
          this._util.serviceError(error);
        }
      });
    } else {
      console.warn('LoadData: No projId provided - skipping KPI definitions load');
    }
    this.service_GetGlobalKpiCategories();
    this.Service_GetServiceAreaProjectMapping();
  }

  ddGoals_Onchange() {
    if (this.selectedGoal != undefined && this.selectedGoal != null) {
      this.dataSource = this.definitions.filter(t => t.goaL_ID === this.selectedGoal.id);
    } else if (this.goals != undefined && this.goals.length > 0) {
      this.dataSource = this.definitions.filter(t => t.goaL_ID === this.goals[0].id);
    }
    this.setKpiExpiry(this.dataSource);
    // Create new array reference to trigger OnPush change detection
    this.dataSource = [...this.dataSource];
    // Force OnPush change detection
    this.cdr.markForCheck();
  }

  setKpiExpiry(dataSource: any[]) {
    let currentDate = new Date();
    dataSource.forEach(x => {
      if (!x.kpI_TARGETS || x.kpI_TARGETS.length === 0) {
        x.isExpired = false;
        return;
      }

      let maxrec = x.kpI_TARGETS.reduce((prev: any, curr: any) => {
        if (prev.enD_DATE > curr.enD_DATE)
          return prev;
        else
          return curr;
      });

      if (new Date(maxrec.enD_DATE) < currentDate)
        x.isExpired = true;
      else
        x.isExpired = false;
    });

    dataSource.sort((a, b) => {
      if (!a.isExpired)
        return 1;
      if (a.isExpired)
        return -1;
      return 0;
    });
  }

  Refresh_onClick() {
    this.ddGoals_Onchange();
  }

  // Helper method to check if any KPIs are expired
  hasExpiredKpis(): boolean {
    return this.dataSource && this.dataSource.some((kpi: any) => kpi.isExpired === true);
  }

  formReset(definitionForm: any) {
    this.definition = this.GetNewDefinition();
  }

  // Edit/Delete operations
  EditRow_onClick(row: any) {
    this.definition = { ...row };
    this.selectedKPI = this.definition.kpI_MASTER_ID;
    this.updateKPIName(this.selectedKPI);
    this.readonlymode = false;
    this.editmode = true;

    for (let i = 0; i < this.definition.kpI_TARGETS.length; i++) {
      this.dict["dtStartDate[" + i + "]"] = "Start Date";
      this.dict["dtEndDate[" + i + "]"] = "End Date";
    }

    if (this.definition.kpI_TARGETS.length > 0) {
      this.selectedTarget = this.definition.kpI_TARGETS[this.definition.kpI_TARGETS.length - 1];
    } else {
      this.definition.kpI_TARGETS.push(this.GetNewKPITarget());
    }

    // Mark form as pristine and untouched after Angular updates the view
    setTimeout(() => {
      if (this.definitionForm) {
        this.definitionForm.form.markAsPristine();
        this.definitionForm.form.markAsUntouched();
      }
    }, 0);
  }

  Edit_onClick(row: any) {
    this.readonlymode = false;
    this.editProdMode = true;
    this.prodDefinitions = { ...row };
    this.definition = this.GetNewDefinition();
    this.definition.id = this.prodDefinitions.kpI_ID;
    this.definition.goaL_ID = 0;
    this.definition.projecT_ID = '0';
    this.definition.globaL_KPI_CATEGORY_ID = this.prodDefinitions.categorY_ID;
    this.definition.kpI_NAME = this.prodDefinitions.servicE_LEVEL_METRICS;
    this.definition.kpI_UNIQUEID = this.prodDefinitions.kpI_UNIQUEID;
    this.definition.servicE_TOWER_ID = this.prodDefinitions.servicE_TOWER_ID;
    this.definition.frequency = this.prodDefinitions.frequency;
    this.definition.supporT_WINDOW = this.prodDefinitions.supporT_WINDOW;
    this.definition.priority = this.prodDefinitions.priority;
    this.definition.modE_ID = this.prodDefinitions.modE_ID;
    this.definition.producT_ID = this.prodDefinitions.producT_ID;
    this.definition.slA_TARGET_UNIT_OF_MEASUREMENT = this.prodDefinitions.uniT_OF_MEASUREMENT;
    this.definition.shoW_IN_CHART = false;
    this.definition.updateD_BY = localStorage.getItem('empid') || '';
    this.definition.updateD_DATE = new Date();
    this.definition.isactive = true;
    this.definition.kpI_TARGETS.push(this.getKPIWithTargets());
    this.definition.producT_kPI_DETAILS.push(this.getKPIDetails());

    for (let i = 0; i < this.definition.kpI_TARGETS.length; i++) {
      this.dict["dtStartDate[" + i + "]"] = "Start Date";
      this.dict["dtEndDate[" + i + "]"] = "End Date";
    }

    if (this.definition.kpI_TARGETS.length > 0) {
      this.selectedProdTarget = this.definition.kpI_TARGETS[this.definition.kpI_TARGETS.length - 1];
    } else {
      this.definition.kpI_TARGETS.push(this.GetNewProdKPITarget());
    }

    // Mark form as pristine and untouched after Angular updates the view
    setTimeout(() => {
      if (this.proddefinitionForm) {
        this.proddefinitionForm.form.markAsPristine();
        this.proddefinitionForm.form.markAsUntouched();
      }
    }, 0);
  }

  Delete_onClick(row: any): void {
    this._util.showDeleteConfirmation(
      'Are you sure you want to delete this product KPI definition? This action cannot be undone.',
      'Confirm Delete Product KPI'
    ).subscribe((result: boolean) => {
      if (result) {
        this.service_deleteProdKpiDefinition(row);
      }
    });
  }

  DeleteRow_onClick(row: any): void {
    this._util.showDeleteConfirmation(
      'Are you sure you want to delete this KPI definition? This action cannot be undone.',
      'Confirm Delete KPI Definition'
    ).subscribe((result: boolean) => {
      if (result) {
        this.service_deleteKpiDefinition(row);
      }
    });
  }

  // Product KPI specific functions
  getKPIWithTargets(): any {
    this.selectedProdTarget = this.GetNewProdTarget();
    this.selectedProdTarget.id = this.prodDefinitions.id;
    this.selectedProdTarget.kpI_ID = this.prodDefinitions.kpI_ID;
    this.selectedProdTarget.starT_DATE = this.prodDefinitions.starT_DATE;
    this.selectedProdTarget.enD_DATE = this.prodDefinitions.enD_DATE;
    this.selectedProdTarget.specificatioN_LIMIT = this.prodDefinitions.specificatioN_LIMIT;
    this.selectedProdTarget.slA_TARGET_HIGH_OPERATOR = this.prodDefinitions.minimuM_TARGET_OPERATOR;
    this.selectedProdTarget.minimuM_SERVICE_LEVEL = this.prodDefinitions.minimuM_SERVICE_LEVEL;
    this.selectedProdTarget.slA_TARGET_VERYHIGH_OPERATOR = this.prodDefinitions.expecteD_TARGET_OPERATOR;
    this.selectedProdTarget.expecteD_SERVICE_LEVEL = this.prodDefinitions.expecteD_SERVICE_LEVEL;
    this.selectedProdTarget.updateD_BY = localStorage.getItem('empid') || '';
    this.selectedProdTarget.updateD_DATE = new Date();
    this.selectedProdTarget.isactive = true;
    return this.selectedProdTarget;
  }

  getKPIDetails(): any {
    this.selectedKPIDetails = {
      kpI_ID: this.prodDefinitions.kpI_ID,
      reference: this.prodDefinitions.referencE_ID,
      servicE_AREA_ID: this.prodDefinitions.servicE_AREA_ID,
      servicE_LEVEL_ID: this.prodDefinitions.servicE_LEVEL_ID,
      servicE_LEVEL_METRIC_DESCRIPTION: this.prodDefinitions.servicE_LEVEL_METRIC_DESCRIPTION,
      updateD_BY: localStorage.getItem('empid') || '',
      updateD_DATE: new Date()
    };
    return this.selectedKPIDetails;
  }

  // Add operations
  AddKPI_onClick() {
    if (this._kpiService.selectedGoal == undefined || this._kpiService.selectedGoal == null) {
      this._util.showWarning("Please select a goal before adding a KPI");
      return;
    }
    this.readonlymode = false;
    this.editmode = true;
    this.definition = this.GetNewKPIWithTargets();
  }

  AddProdKPI_onClick() {
    this.readonlymode = false;
    this.editProdMode = true;
    this.prodDefinitions = this.GetNewProdKPIWithTargets();
  }

  // Service area functions
  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe({
      next: (data: any) => {
        this.serviceAreaList = data;
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  getOverallKPIList() {
    this._appservice.getOverallKPIList().subscribe({
      next: (data: any) => {
        this.overallKPIList = data;
        this.originalKPIList = data;
      },
      error: (error: any) => {
        console.error('getOverallKPIList: Error fetching KPI list', error);
        this._util.serviceError(error);
      }
    });
  }

  updateKPIName(selectedKPI: any) {
    const selectedKPIData = this.overallKPIList.find((kpi: any) => kpi.kpI_ID === selectedKPI);
    if (selectedKPIData) {
      this.definition.kpI_NAME = selectedKPIData.kpI_NAME;
      this.definition.slA_TARGET_UNIT_OF_MEASUREMENT = selectedKPIData.slA_TARGET_UNIT_OF_MEASUREMENT;
      this.selectedFormula = selectedKPIData.formula;
      this.selectedNumerator = selectedKPIData.numeratordescription;
      this.selectedDenominator = selectedKPIData.denominatordescription;
    } else {
      this.definition.kpI_NAME = '';
      this.definition.slA_TARGET_UNIT_OF_MEASUREMENT = '';
      this.selectedFormula = '';
      this.selectedNumerator = '';
      this.selectedDenominator = '';
    }
  }

  resetFilterValue(opened: boolean) {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
      this.applyFilterForKPI(this.searchInput.nativeElement.value);
    }
  }

  applyFilterForKPI(value: string) {
    if (value.trim() === '') {
      this.overallKPIList = this.originalKPIList;
    } else {
      if (this.overallKPIList != null && this.overallKPIList.length > 0) {
        this.overallKPIList = this.originalKPIList.filter((x: any) =>
          x.kpI_NAME.toLowerCase().includes(value.toLowerCase())
        );
      }
    }
  }

  GetServiceAreaName(id: any) {
    let sa = this.serviceAreaList.filter(t => t.id == id);
    return sa.length > 0 ? sa[0].title : undefined;
  }

  GetServiceAreaNames(id: any) {
    var serviceTowers = "";
    if (id != undefined && id != null && id.length > 0) {
      var slist: any[] = [];
      id.forEach((element: any) => {
        let sa = this.serviceAreaList.filter(t => t.id == element);
        if (sa.length > 0) {
          slist.push(sa[0].title);
        }
      });
      slist = slist.sort();
      serviceTowers = slist.join(", ");
    }
    return serviceTowers;
  }

  // Validation functions
  checkIf2TargetsProvided() {
    const targets = ["LOW", "MEDIUM", "HIGH", "VERYHIGH"];
    let validCount = 0;
    targets.forEach(target => {
      const desc = this.selectedTarget[`slA_TARGET_${target}_DESCRIPTION`];
      const operator = this.selectedTarget[`slA_TARGET_${target}_OPERATOR`];
      const value = this.selectedTarget[`slA_TARGET_${target}_VALUE`];

      if (desc && desc.length > 0 && operator && operator.length > 0 && !isNaN(value)) {
        validCount++;
      }
    });

    return validCount >= 2;
  }

  checkIf2ProdTargetsProvided() {
    const targets = ["HIGH", "VERYHIGH"];
    let validCount = 0;
    targets.forEach(target => {
      const operator = this.selectedProdTarget[`slA_TARGET_${target}_OPERATOR`];
      if (operator && operator.length > 0 &&
        !isNaN(this.selectedProdTarget.minimuM_SERVICE_LEVEL) &&
        !isNaN(this.selectedProdTarget.expecteD_SERVICE_LEVEL)) {
        validCount++;
      }
    });

    return validCount >= 2;
  }

  // Object creation functions
  GetNewKPIWithTargets(): any {
    this.definition = this.GetNewDefinition();
    this.selectedKPI = '';
    this.selectedFormula = '';
    this.selectedNumerator = '';
    this.selectedDenominator = '';
    this.definition.kpI_TARGETS.push(this.GetNewKPITarget());
    return this.definition;
  }

  GetNewProdKPIWithTargets(): any {
    this.definition = this.GetNewDefinition();
    this.definition.kpI_TARGETS.push(this.GetNewProdKPITarget());
    return this.definition;
  }

  GetNewKPITarget(): any {
    this.selectedTarget = this.GetNewTarget();
    this.selectedTarget.kpI_ID = this.definition.id;
    this.selectedTarget.starT_DATE = this._util.setLocaleDate(this._kpiService.selectedGoal.starT_DATE);
    this.selectedTarget.enD_DATE = this._util.setLocaleDate(this._kpiService.selectedGoal.enD_DATE);
    return this.selectedTarget;
  }

  GetNewProdKPITarget(): any {
    this.selectedProdTarget = this.GetNewProdTarget();
    this.selectedProdTarget.kpI_ID = this.prodDefinitions.kpI_ID;
    this.selectedProdTarget.starT_DATE = this.prodDefinitions.starT_DATE;
    this.selectedProdTarget.enD_DATE = this.prodDefinitions.enD_DATE;
    return this.selectedProdTarget;
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.editProdMode = false;
  }

  // Target management
  AddTarget_OnClick() {
    this.definition.kpI_TARGETS.push(this.GetNewKPITarget());
  }

  AddProdTarget_OnClick() {
    this.definition.kpI_TARGETS.push(this.GetNewProdKPITarget());
  }

  DeleteTarget_Onclick(target: any) {
    if (target.starT_DATE != null && target.enD_DATE != null) {
      this._util.showDeleteConfirmation(
        'Are you sure you want to delete this KPI target? This action cannot be undone.',
        'Confirm Delete KPI Target'
      ).subscribe((result: boolean) => {
        if (result) {
          const data = { kpi_ID: target.kpI_ID };
          this.service_deleteKpiTarget(data);
        }
      });
    } else {
      this._util.showWarning("Please choose the target date range.")
    }
  }

  EditTarget_Onclick(target: any) {
    this.selectedTarget = target;
  }

  EditProdTarget_Onclick(target: any) {
    this.selectedProdTarget = target;
  }

  DeleteProdRow_onClick(target: any) {
    this._util.showDeleteConfirmation(
      'Are you sure you want to delete this product target? This action cannot be undone.',
      'Confirm Delete Product Target'
    ).subscribe((result: boolean) => {
      if (result) {
        this.service_deleteKpiTarget(target);
      }
    });
  }

  getGoal(id: number) {
    if (this.goals.length > 0) {
      let tmpGoals = this.goals.filter(t => t.id === id);
      return tmpGoals.length > 0 ? tmpGoals[0].description : "";
    }
    return "";
  }

  // Form submission
  SubmitForm_Definition(ngform: NgForm) {
    var keys = Object.keys(ngform.controls);

    for (var key of keys) {
      if (!ngform.controls[key].valid) {
        if (this.dict[key] == "Start Date" || this.dict[key] == "End Date") {
          this._util.showWarning("Please note that the start date and end date of KPI should be within its goal start and end date");
          return;
        } else if (key == "selSeviceTower") {
          this._util.showWarning("Please select " + this.dict[key]);
          return;
        } else {
          this._util.showWarning("Please select/enter valid value for " + this.dict[key]);
          return;
        }
      }
    }

    if (!this.checkIf2TargetsProvided()) {
      this._util.showWarning("Please enter minimum of 2 targets");
      return;
    }

    if (this.definition.frequency == "Quarterly") {
      for (let i = 0; i < this.definition.kpI_TARGETS.length; i++) {
        if (!this.validateQuarterlyPeriod(this.definition.kpI_TARGETS[i].starT_DATE, this.definition.kpI_TARGETS[i].enD_DATE)) {
          this._util.showWarning("The entered period is not a valid range.");
          return;
        }
      }
    }

    if (this.definition.id === 0 || this.definition.id === undefined) {
      this.definition.id = 0;
      this.definition.succesS_GOAL = "";
      this.definition.customeR_ID = this.custId;
      this.definition.projecT_ID = this.projId;
      this.definition.kpI_MASTER_ID = this.selectedKPI;
      this.definition.goaL_ID = this._kpiService.selectedGoal.id;
      this.definition.createD_BY = localStorage.getItem('empid') || '';
      this.definition.createD_DATE = new Date();
      this.definition.updateD_BY = localStorage.getItem('empid') || '';
      this.definition.updateD_DATE = new Date();
      this.definition.isactive = true;

      this.service_addKpiDefinition(this.definition);
    } else {
      this.definition.kpI_MASTER_ID = this.selectedKPI;
      this.definition.updateD_BY = localStorage.getItem('empid') || '';
      this.definition.updateD_DATE = new Date();

      this.service_updateKpiDefinition(this.definition);
    }
  }

  SubmitProdForm_Definition(ngform: NgForm) {
    var keys = Object.keys(ngform.controls);

    for (var key of keys) {
      if (!ngform.controls[key].valid) {
        this._util.showWarning("Please enter a valid value for " + this.dict[key]);
        return;
      }
    }

    if (!this.checkIf2ProdTargetsProvided()) {
      this._util.showWarning("Please enter minimum of 2 targets");
      return;
    }

    if (this.definition.frequency == "Quarterly") {
      for (let i = 0; i < this.definition.kpI_TARGETS.length; i++) {
        if (!this.validateQuarterlyPeriod(this.definition.kpI_TARGETS[i].starT_DATE, this.definition.kpI_TARGETS[i].enD_DATE)) {
          this._util.showWarning("The entered period is not a valid range.");
          return;
        }
      }
    }

    this.definition = this.GetNewDefinition();
    this.definition.id = this.prodDefinitions.kpI_ID;
    this.definition.goaL_ID = 0;
    this.definition.projecT_ID = '0';
    this.definition.globaL_KPI_CATEGORY_ID = this.prodDefinitions.categorY_ID;
    this.definition.kpI_NAME = this.prodDefinitions.servicE_LEVEL_METRICS;
    this.definition.kpI_UNIQUEID = this.prodDefinitions.kpI_UNIQUEID;
    this.definition.servicE_TOWER_ID = this.prodDefinitions.servicE_TOWER_ID;
    this.definition.frequency = this.prodDefinitions.frequency;
    this.definition.supporT_WINDOW = this.prodDefinitions.supporT_WINDOW;
    this.definition.priority = this.prodDefinitions.priority;
    this.definition.modE_ID = this.prodDefinitions.modE_ID;
    this.definition.producT_ID = this.prodDefinitions.producT_ID;
    this.definition.slA_TARGET_UNIT_OF_MEASUREMENT = this.prodDefinitions.uniT_OF_MEASUREMENT;
    this.definition.shoW_IN_CHART = false;
    this.definition.updateD_BY = localStorage.getItem('empid') || '';
    this.definition.updateD_DATE = new Date();
    this.definition.isactive = true;
    this.definition.kpI_TARGETS.push(this.getKPIWithTargets());
    this.definition.producT_kPI_DETAILS.push(this.getKPIDetails());

    // Actually save the definition
    this.service_updateprodKpiDefinition(this.definition);
  }

  validateQuarterlyPeriod(startDt: Date, endDt: Date) {
    let sDate = new Date(startDt);
    let eDate = new Date(endDt);
    let months = eDate.getMonth() - sDate.getMonth() + (12 * (eDate.getFullYear() - sDate.getFullYear()));
    return (months + 1) % 3 == 0;
  }

  // Service functions
  service_addKpiDefinition(_goal: any) {
    this._appservice.AddKpiDefinition(_goal).subscribe({
      next: (data: any) => {
        this.LoadData();
        this._util.showSuccess("Added Successfully");
        this.definition = this.GetNewDefinition();
        this.readonlymode = true;
        this.editmode = false;
      },
      error: (error: any) => {
        this.readonlymode = false;
        this.editmode = true;
        this._util.showError(error.error);
        this._util.serviceError(error);
      }
    });
  }

  service_updateKpiDefinition(_goal: any) {
    this._appservice.UpdateKpiDefinition(_goal).subscribe({
      next: (data: any) => {
        this._util.showSuccess("Updated Successfully");
        this.definition = this.GetNewDefinition();
        this.readonlymode = true;
        this.editmode = false;
        this.LoadData();
      },
      error: (error: any) => {
        this.readonlymode = false;
        this.editmode = true;
        this._util.showError(error.error);
        this._util.serviceError(error);
      }
    });
  }

  service_updateprodKpiDefinition(_goal: any) {
    (this._appservice as any).UpdateProdKpiDefinition(_goal).subscribe({
      next: (data: any) => {
        this._util.showSuccess("Updated Successfully");
        this.definition = this.GetNewDefinition();
        this.readonlymode = true;
        this.editProdMode = false;
        // Reload the KPI list to show updated data
        if (this.selectedLevel) {
          this.ddlevel_Onchange(this.selectedLevel);
        }
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  service_deleteKpiDefinition(row: any) {
    this._appservice.DeleteKpiDefinition(row).subscribe({
      next: (data: any) => {
        this.definitions.splice(this.definitions.indexOf(row), 1);
        this.LoadData();
        this._util.showSuccess("Deleted Successfully");
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  service_deleteProdKpiDefinition(row: any) {
    this._appservice.DeleteKpiDefinition(row).subscribe({
      next: (data: any) => {
        this.definitions.splice(this.definitions.indexOf(row), 1);
        this.LoadData();
        this._util.showSuccess("Deleted Successfully");
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  service_deleteKpiTarget(row: any) {
    this._appservice.DeleteKpiTarget(row).subscribe({
      next: (data: any) => {
        this.definition.kpI_TARGETS.splice(this.definition.kpI_TARGETS.indexOf(row), 1);
        this._util.showSuccess("Deleted Successfully");
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  service_GetGlobalKpiCategories() {
    this._appservice.GetGlobalKpiCategories().subscribe({
      next: (data: any) => {
        this.GlobalCategories = data;
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  // Product view functions
  loadProductModes(prodId: number) {
    this.isLoading = true;
    this._appservice.getAllServiceMode(prodId).subscribe({
      next: (data: any) => {
        this.serviceModes = data;
        if (data.length > 0) {
          const firstMode = this.serviceModes.filter(x => x.modE_TITLE)[0];
          if (firstMode) {
            this.selectedMode = firstMode.id;
            this.selectedModetitle = firstMode.modE_TITLE;
          }
        }
        this.loadServiceLevel();
        // Don't set isLoading = false here - let loadServiceLevel chain complete
      },
      error: (err: any) => {
        console.error('loadProductModes: Error', err);
        this._util.serviceError(err);
        this.isLoading = false;
      }
    });
  }

  ddMode_Onchange(modeId: any) {
    const mode = this.serviceModes.find(x => x.id === modeId);
    if (mode) {
      this.selectedModetitle = mode.modE_TITLE;
    }
    if (this.selectedLevel) {
      this.ddlevel_Onchange(this.selectedLevel);
    }
  }

  ddlevel_Onchange(lvlid: any) {
    // Set loading state (may already be true from initialization chain, but safe to set again)
    this.isLoading = true;
    if (this.selectedMode != undefined) {
      (this._appservice as any).getAllKpiByModeId(this.selectedMode, lvlid, this.prodId).subscribe((data: any) => {
        this.kpiDefnitions = data;
        this.dataSource1 = new MatTableDataSource(this.kpiDefnitions);
        this.isLoading = false; // Final operation completes - turn off loading
        this.cdr.markForCheck(); // Force change detection
      }, (err: any) => {
        console.error('ddlevel_Onchange: Error', err);
        this._util.serviceError(err);
        this.isLoading = false;
      });
    } else {
      console.warn('ddlevel_Onchange: No mode selected, skipping API call');
      this.isLoading = false;
    }
  }

  getmeasurementforServiceLevel(kpiId: any) {
    if (this.kpiDefnitions.length > 0 && kpiId != undefined && kpiId != null) {
      const kpi = this.kpiDefnitions.filter(x => x.kpI_ID == kpiId)[0];
      if (kpi) {
        const uom = kpi.uniT_OF_MEASUREMENT;
        const expectedLvl = kpi.expecteD_SERVICE_LEVEL;
        if (uom == '%') return expectedLvl + '%';
        if (uom == 'Number') return expectedLvl + ' per product';
      }
    }
    return '';
  }

  getmeasurementforMinServiceLevel(kpiId: any) {
    if (this.kpiDefnitions.length > 0 && kpiId != undefined && kpiId != null) {
      const kpi = this.kpiDefnitions.filter(x => x.kpI_ID == kpiId)[0];
      if (kpi) {
        const uom = kpi.uniT_OF_MEASUREMENT;
        const expectedLvl = kpi.minimuM_SERVICE_LEVEL;
        if (uom == '%') return expectedLvl + '%';
        if (uom == 'Number') return expectedLvl + ' per product';
      }
    }
    return '';
  }

  loadServiceArea() {
    (this._appservice as any).getProductServiceArea().subscribe({
      next: (data: any) => {
        this.serviceArea = data;
      },
      error: (err: any) => {
        this._util.serviceError(err);
      }
    });
  }

  loadServiceLevel() {
    // isLoading already set to true by loadProductModes
    (this._appservice as any).getServiceLevel().subscribe({
      next: (data: any) => {
        this.serviceLevel = data;
        if (data.length > 0) {
          const firstLevel = this.serviceLevel.filter(x => x.servicE_LEVEL)[0];
          if (firstLevel) {
            this.selectedLevel = firstLevel.id;
            this.ddlevel_Onchange(this.selectedLevel);
          }
        } else {
          // No service levels found - stop loading
          this.isLoading = false;
        }
        // Don't set isLoading = false here - let ddlevel_Onchange complete
      },
      error: (err: any) => {
        this._util.serviceError(err);
        this.isLoading = false;
      }
    });
  }

  Service_GetServiceAreaProjectMapping() {
    this.serviceAreaProjectMappingList = [];

    // Only call this API in project view mode (when projId exists)
    if (this.projId != undefined && this.projId != '' && this.projId != null) {
      this._appservice.getServiceTowersProjectMapping(this.projId).subscribe({
        next: (data: any) => {
          this.serviceAreaProjectMappingList = data;
        },
        error: (error: any) => {
          console.error('Service_GetServiceAreaProjectMapping: Error', error);
          this._util.serviceError(error);
        }
      });
    } else {
    }
  }

  loadReference() {
    (this._appservice as any).getServiceReference().subscribe((data: any) => {
      this.reference = data;
    }, (err: any) => {
      console.error('loadReference: Error', err);
      this._util.serviceError(err);
    });
  }

  // Input validation
  alphaNumberOnly(e: any) {
    var regex = new RegExp("^[a-zA-Z0-9._]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
      return true;
    }
    e.preventDefault();
    return false;
  }

  onPaste(e: any) {
    e.preventDefault();
    return false;
  }

  // NOTE: Filter methods removed - filter component only appears in KPI Achievements entry tab (kpi-product-view)
  // Filter_onChange($event: any) {
  //   this.filteredData = $event;
  //   this.filterCriteria = $event.criteria;    
  //   this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.kpiDefnitions);
  //   this.dataSource1 = new MatTableDataSource(this.filteredData);
  //   this.cdr.markForCheck();
  // }

  // showAll($event: any) {
  //   // Handle show all event
  // }
}

