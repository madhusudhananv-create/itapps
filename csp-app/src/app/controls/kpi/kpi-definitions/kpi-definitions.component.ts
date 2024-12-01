import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { kpi, kpiWithTargets, kpI_TARGETS, ProductkpiDetails, ProductkpiWithTargets } from '../../../models/kpi';
import { KpiGoalModel } from '../../../models/kpi-goal-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { GlobalKpiCategoryModel } from '../../../models/global-kpi-category-model';
import { KpiSharedService } from '../../../controls/kpi/kpi-shared.service';
import { NgForm } from '@angular/forms';
import { AccessControl } from '../../../Shared/accessControl';
import { ServiceAreaProjectMappingModel, ServiceTowersProjectMappingModel } from '../../../models/service-area-project-mapping-model';
import { ServiceAreaModelNew } from '../../../models/audit-checklist-based-model';
import { List } from 'sp-pnp-js';

@Component({
  selector: 'app-kpi-definitions',
  templateUrl: './kpi-definitions.component.html',
  styleUrls: ['./kpi-definitions.component.scss']
})
export class KpiDefinitionsComponent implements OnInit {
  @Input('custId') custId: string;
  @Input('projId') projId: string;
  @Input('prodId') prodId: number;
  @Input('isProductView') isProductView: Boolean = false;
  @Input('tierId') tierId: number;
  isLoading: Boolean = false;
  serviceAreaProjectMappingList: ServiceTowersProjectMappingModel[] = [];
  serviceAreaList: ServiceAreaModelNew[] = [];
  selectedKPI: any;
  selectedFormula: any;
  selectedNumerator: any;
  selectedDenominator: any;
  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(private _kpiService: KpiSharedService, private _util: myUtility, private _appservice: AppsService, public _access: AccessControl) {
    if (this._access.IsAllowed(59, 1, '212100001', '')) {
      this.editAllowed = true;
    }
  }

  //Properties
  get goals(): KpiGoalModel[] {
    return this._kpiService.goals;
  }
  set goals(val) {
    this._kpiService.goals = val;
  }

  get selectedGoal(): KpiGoalModel {
    return this._kpiService.selectedGoal;
  }
  set selectedGoal(val) {
    this._kpiService.selectedGoal = val;
  }

  definitions: kpiWithTargets[] = [];
  dataSource: kpiWithTargets[] = [];
  definition: kpiWithTargets = new kpiWithTargets();
  kpiDefnitions: any[] = [];
  prodDefinitions: any;
  GlobalCategories: GlobalKpiCategoryModel[] = []
  readonlymode: boolean = true;
  editmode: boolean = false;
  editProdMode: boolean = false;
  dict: Object = {
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
    'selSeviceTower': "Sevice Tower",
    'txtKPIName': "KPI name",
    'txtSpecLimt': "Specification Limt",
    'txtKPIDesc': "KPI Description",
    'ddServiceRef': "Reference",
    'ddselectKPI': "Base Measure Master KPI"
  }

  displayedColumns = ['index', 'kpI_UNIQUEID', 'servicE_AREA', 'kpI_NAME', 'servicE_TOWER_ID', 'supporT_WINDOW', 'priority', 'frequency', 'slA_TARGET_LOW_DESCRIPTION', 'slA_TARGET_LOW_OPERATOR', 'slA_TARGET_LOW_VALUE', 'slA_TARGET_MEDIUM_DESCRIPTION', 'slA_TARGET_MEDIUM_OPERATOR', 'slA_TARGET_MEDIUM_VALUE', 'slA_TARGET_HIGH_DESCRIPTION', 'slA_TARGET_HIGH_OPERATOR', 'slA_TARGET_HIGH_VALUE', 'slA_TARGET_VERYHIGH_DESCRIPTION', 'slA_TARGET_VERYHIGH_OPERATOR', 'slA_TARGET_VERYHIGH_VALUE', 'slA_TARGET_UNIT_OF_MEASUREMENT', 'edit', 'delete'];
  displayedColumns1 = ['reference', 'kpiname', 'description', 'serviceArea', 'serviceType', 'sla', 'frequency', 'expectedLevel', 'minLevel', 'actions'];
  serviceModes = [];
  selectedMode: string;
  selectedLevel: string;
  reference = [];
  selectedModetitle: string;
  kpiList: any[] = [];
  overallKPIList: any;
  originalKPIList: any;
  serviceArea = [];
  serviceLevel = [];
  dataSource1 = new MatTableDataSource(this.kpiDefnitions);

  editAllowed: boolean = false;
  ngOnInit() {
    this.Service_GetServiceAreaList();
    this.getOverallKPIList();
    if (this.isProductView && this.prodId != null && this.prodId != undefined) {
      this.LoadProductData();
    }
    else {
      this.LoadData();
    }
  }

  ngOnChanges() {
    if (this.isProductView && this.prodId != null && this.prodId != undefined) {
      this.LoadProductData();
      this.readonlymode = true;
      this.editmode = false;
      this.editProdMode = false;
    }
    else {
      this.LoadData();
      this.readonlymode = true;
      this.editmode = false;
    }
  }
  LoadProductData() {
    this.loadProductModes(this.prodId);
    this.loadServiceArea();
    this.service_GetGlobalKpiCategories();
    this.loadReference();
    this.Service_GetServiceAreaProjectMapping();
  }
  ddGoals_Onchange() {
    let currentDate = new Date();
    if (this.selectedGoal != undefined && this.selectedGoal != null) {

      this.dataSource = this.definitions.filter(t => t.goaL_ID === this.selectedGoal.id);
    }
    else if (this.goals != undefined && this.goals.length > 0) {
      this.dataSource = this.definitions.filter(t => t.goaL_ID === this.goals[0].id);
    }
    this.setKpiExpiry(this.dataSource);
  }

  setKpiExpiry(dataSource) {
    let currentDate = new Date();
    dataSource.forEach(x => {
      if (!x.kpI_TARGETS || x.kpI_TARGETS.length === 0)
        return x.isExpired = false;

      let maxrec = x.kpI_TARGETS.reduce((prev, curr) => {
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
        return 1
      if (a.isExpired)
        return -1;
      return 0;
    });
  }

  LoadData() {
    if (this.projId != undefined) {
      this._appservice.GetKpiDefinitions(this.custId, this.projId).subscribe(data => {
        this.definitions = data;
        this.ddGoals_Onchange();
      }, error => { this._util.serviceError(error); });
    }
    this.service_GetGlobalKpiCategories();
    this.Service_GetServiceAreaProjectMapping();
  }
  Refresh_onClick() {
    this.ddGoals_Onchange();
  }
  formReset(definitionForm) {
    this.definition = new kpiWithTargets();
  }
  EditRow_onClick(row) {
    this.definition = row;
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
    }
    else {
      this.definition.kpI_TARGETS.push(this.GetNewKPITarget());
    }
  }

  Edit_onClick(row) {
    this.readonlymode = false;
    this.editProdMode = true;
    this.prodDefinitions = [];
    this.definition = new kpiWithTargets();
    this.prodDefinitions = row;
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
    this.definition.updateD_BY = localStorage.getItem('empid');
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
    }
    else {
      this.definition.kpI_TARGETS.push(this.GetNewProdKPITarget());
    }
  }
  Delete_onClick(row): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this.service_deleteProdKpiDefinition(row);
    } else {
    }
  }
  getKPIWithTargets() {
    this.selectedProdTarget = new ProductkpiWithTargets();
    this.selectedProdTarget.id = this.prodDefinitions.id;
    this.selectedProdTarget.kpI_ID = this.prodDefinitions.kpI_ID;
    this.selectedProdTarget.starT_DATE = this.prodDefinitions.starT_DATE;
    this.selectedProdTarget.enD_DATE = this.prodDefinitions.enD_DATE;
    this.selectedProdTarget.specificatioN_LIMIT = this.prodDefinitions.specificatioN_LIMIT;
    this.selectedProdTarget.slA_TARGET_HIGH_OPERATOR = this.prodDefinitions.minimuM_TARGET_OPERATOR;
    this.selectedProdTarget.minimuM_SERVICE_LEVEL = this.prodDefinitions.minimuM_SERVICE_LEVEL;
    this.selectedProdTarget.slA_TARGET_VERYHIGH_OPERATOR = this.prodDefinitions.expecteD_TARGET_OPERATOR;
    this.selectedProdTarget.expecteD_SERVICE_LEVEL = this.prodDefinitions.expecteD_SERVICE_LEVEL;
    this.selectedProdTarget.updateD_BY = localStorage.getItem('empid');
    this.selectedProdTarget.updateD_DATE = new Date();
    this.selectedProdTarget.isactive = true;
    return this.selectedProdTarget;
  }
  getKPIDetails() {
    this.selectedKPIDetails = new ProductkpiDetails();
    this.selectedKPIDetails.kpI_ID = this.prodDefinitions.kpI_ID;
    this.selectedKPIDetails.reference = this.prodDefinitions.referencE_ID;
    this.selectedKPIDetails.servicE_AREA_ID = this.prodDefinitions.servicE_AREA_ID;
    this.selectedKPIDetails.servicE_LEVEL_ID = this.prodDefinitions.servicE_LEVEL_ID;
    this.selectedKPIDetails.servicE_LEVEL_METRIC_DESCRIPTION = this.prodDefinitions.servicE_LEVEL_METRIC_DESCRIPTION;
    this.selectedKPIDetails.updateD_BY = localStorage.getItem('empid');
    this.selectedKPIDetails.updateD_DATE = new Date();
    return this.selectedKPIDetails;
  }
  selectedTarget: kpI_TARGETS = new kpI_TARGETS();
  selectedProdTarget: ProductkpiWithTargets = new ProductkpiWithTargets();
  selectedKPIDetails: ProductkpiDetails = new ProductkpiDetails();
  AddKPI_onClick() {
    if (this._kpiService.selectedGoal == undefined || this._kpiService.selectedGoal == null) {
      alert("Please select a goal before adding a KPI");
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
  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe(data => {
      this.serviceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }

  getOverallKPIList() {
    this._appservice.getOverallKPIList().subscribe(data => {
      this.overallKPIList = data;
      this.originalKPIList = data;
    }, error => { this._util.serviceError(error); });
  }

  updateKPIName(selectedKPI) {
    const selectedKPIData = this.overallKPIList.find(kpi => kpi.kpI_ID === selectedKPI);
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
    this.searchInput.nativeElement.value = '';
    this.applyFilterForKPI(this.searchInput.nativeElement.value);
  }

  applyFilterForKPI(value: string) {
    if (value.trim() === '') {
      this.overallKPIList = this.originalKPIList;
    }
    else {
      if (this.overallKPIList != null && this.overallKPIList != undefined && this.overallKPIList.length > 0) {
        let kpi = this.originalKPIList.filter(x => x.kpI_NAME.toLowerCase().includes(value.toLowerCase()));
        this.overallKPIList = kpi;
      }
    }
  }

  GetServiceAreaName(id) {
    let sa = this.serviceAreaList.filter(t => t.id == id);
    if (sa.length > 0) {
      return sa[0].title;
    }
    else
      return undefined;
  }

  GetServiceAreaNames(id) {
    var serviceTowers = "";
    if (id != undefined && id != null && id.length > 0) {
      var slist: any[] = [];
      id.forEach(element => {
        let sa = this.serviceAreaList.filter(t => t.id == element);
        if (sa.length > 0) {
          slist.push(sa[0].title);
        }
      }
      );
      slist = slist.sort();
      serviceTowers = slist.join(", ");
    }
    return serviceTowers;
  }
  checkIf2TargetsProvided() {
    const targets = ["LOW", "MEDIUM", "HIGH", "VERYHIGH"];
    let validCount = 0;
    targets.forEach(target => {
      if (this.selectedTarget[`slA_TARGET_${target}_DESCRIPTION`] && this.selectedTarget[`slA_TARGET_${target}_DESCRIPTION`].length > 0
        && this.selectedTarget[`slA_TARGET_${target}_OPERATOR`] && this.selectedTarget[`slA_TARGET_${target}_OPERATOR`].length > 0
        && !isNaN(this.selectedTarget[`slA_TARGET_${target}_VALUE`])) {
        validCount++;
      }
    });

    if (validCount >= 2) {
      return true;
    }

    return false;
  }
  checkIf2ProdTargetsProvided() {
    const targets = ["HIGH", "VERYHIGH"];
    let validCount = 0;
    targets.forEach(target => {
      if (this.selectedProdTarget[`slA_TARGET_${target}_OPERATOR`] && this.selectedProdTarget[`slA_TARGET_${target}_OPERATOR`].length > 0
        && !isNaN(this.selectedProdTarget[`minimuM_SERVICE_LEVEL`] && this.selectedProdTarget[`expecteD_SERVICE_LEVEL`])) {
        validCount++;
      }
    });

    if (validCount >= 2) {
      return true;
    }

    return false;
  }
  GetNewKPIWithTargets(): kpiWithTargets {
    this.definition = new kpiWithTargets();
    this.selectedKPI = '';
    this.selectedFormula = '';
    this.selectedNumerator = '';
    this.selectedDenominator = '';
    this.definition.kpI_TARGETS.push(this.GetNewKPITarget());
    return this.definition;
  }
  GetNewProdKPIWithTargets(): kpiWithTargets {
    this.definition = new kpiWithTargets();
    this.definition.kpI_TARGETS.push(this.GetNewProdKPITarget());
    return this.definition;
  }
  GetNewKPITarget(): kpI_TARGETS {
    this.selectedTarget = new kpI_TARGETS();
    this.selectedTarget.kpI_ID = this.definition.id;
    this.selectedTarget.starT_DATE = this._util.setLocaleDate(this._kpiService.selectedGoal.starT_DATE);
    this.selectedTarget.enD_DATE = this._util.setLocaleDate(this._kpiService.selectedGoal.enD_DATE);
    return this.selectedTarget;
  }
  GetNewProdKPITarget(): ProductkpiWithTargets {
    this.selectedProdTarget = new ProductkpiWithTargets();
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
  AddTarget_OnClick() {
    this.definition.kpI_TARGETS.push(this.GetNewKPITarget());
  }
  AddProdTarget_OnClick() {
    this.definition.kpI_TARGETS.push(this.GetNewProdKPITarget());
  }
  DeleteTarget_Onclick(target) {
    if(target.starT_DATE != null && target.starT_DATE != undefined && target.enD_DATE != null && target.enD_DATE != undefined){
      if (confirm('Are you sure you want to delete the record?')) {
        this.service_deleteKpiTarget(target);
      }
    }
    else{
      alert("Please choose the target date range.")
    }
  }

  EditTarget_Onclick(target) {
    this.selectedTarget = target;
  }
  DeleteRow_onClick(row): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this.service_deleteKpiDefinition(row);
    } else {
    }
  }
  EditProdTarget_Onclick(target) {
    this.selectedProdTarget = target;
  }
  DeleteProdRow_onClick(target) {
    if (confirm('Are you sure you want to delete the record?')) {
      this.service_deleteKpiTarget(target);
    } else {
    }
  }
  getGoal(id) {
    if (this.goals.length > 0) {
      let tmpGoals: KpiGoalModel[] = this.goals.filter(t => t.id === id);
      if (tmpGoals.length > 0) {
        return tmpGoals[0].description;
      }
    }
    else
      return "";
  }
  SubmitForm_Definition(ngform: NgForm) {
    var keys = Object.keys(ngform.controls);

    for (var key of keys) {
      if (!ngform.controls[key].valid) {
        if (this.dict[key] == "Start Date" || this.dict[key] == "End Date") {
          alert("Please note that the start date and end date of KPI should be within its goal start and end date");
          return;
        }
        else if (key == "selSeviceTower") {
          alert("Please select " + this.dict[key]);
          return;
        }
        else {
          alert("Please select/enter valid value for " + this.dict[key]);
          return;
        }
      }
    }
    if (!this.checkIf2TargetsProvided()) {
      alert("Please enter minimum of 2 targets");
      return;
    }
    if (this.definition.frequency == "Quarterly") {
      for (let i = 0; i < this.definition.kpI_TARGETS.length; i++) {
        if (!this.validateQuarterlyPeriod(this.definition.kpI_TARGETS[i].starT_DATE, this.definition.kpI_TARGETS[i].enD_DATE)) {
          alert("The entered period is not a valid range.");
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
      this.definition.createD_BY = localStorage.getItem('empid');
      this.definition.createD_DATE = new Date();
      this.definition.updateD_BY = localStorage.getItem('empid');
      this.definition.updateD_DATE = new Date();
      this.definition.isactive = true;

      this.service_addKpiDefinition(this.definition);
    }
    else {
      this.definition.kpI_MASTER_ID = this.selectedKPI;
      this.definition.updateD_BY = localStorage.getItem('empid');
      this.definition.updateD_DATE = new Date();

      this.service_updateKpiDefinition(this.definition);
    }
  }

  SubmitProdForm_Definition(ngform: NgForm) {
    var keys = Object.keys(ngform.controls);

    for (var key of keys) {
      if (!ngform.controls[key].valid) {
        alert("Please enter a valid value for " + this.dict[key]);
        return;
      }
    }
    if (!this.checkIf2ProdTargetsProvided()) {
      alert("Please enter minimum of 2 targets");
      return;
    }
    if (this.definition.frequency == "Quarterly") {
      for (let i = 0; i < this.definition.kpI_TARGETS.length; i++) {
        if (!this.validateQuarterlyPeriod(this.definition.kpI_TARGETS[i].starT_DATE, this.definition.kpI_TARGETS[i].enD_DATE)) {
          alert("The entered period is not a valid range.");
          return;
        }
      }
    }
    this.definition = new kpiWithTargets();
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
    // this.definition.createD_DATE = new Date();
    this.definition.updateD_BY = localStorage.getItem('empid');
    this.definition.updateD_DATE = new Date();
    this.definition.isactive = true;
    this.definition.kpI_TARGETS.push(this.getKPIWithTargets());
    this.definition.producT_kPI_DETAILS.push(this.getKPIDetails());
  }

  validateQuarterlyPeriod(startDt: Date, endDt: Date) {
    let sDate = new Date(startDt);
    let eDate = new Date(endDt);
    let months = eDate.getMonth() - sDate.getMonth() +
      (12 * (eDate.getFullYear() - sDate.getFullYear()));
    // let months = endDt.getMonth() - startDt.getMonth() +
    //     (12 * (endDt.getFullYear() - startDt.getFullYear()));

    if ((months + 1) % 3 == 0)
      return true;
    else
      return false;
  }

  service_addKpiDefinition(_goal) {
    this._appservice.AddKpiDefinition(_goal).subscribe(data => {
      this.LoadData();
      alert("Added Successfully");
      this.definition = new kpiWithTargets();
      this.readonlymode = true;
      this.editmode = false;
    }, error => {
      this.readonlymode = false;
      this.editmode = true; alert(error.error); this._util.serviceError(error);
    });
  }
  service_updateKpiDefinition(_goal) {
    this._appservice.UpdateKpiDefinition(_goal).subscribe(data => {
      alert("Updated Successfully");
      this.definition = new kpiWithTargets();
      this.readonlymode = true;
      this.editmode = false;
      this.LoadData();
    }, error => {
      this.readonlymode = false;
      this.editmode = true; alert(error.error); this._util.serviceError(error);
    });
  }
  service_updateprodKpiDefinition(_goal) {
    this._appservice.UpdateProdKpiDefinition(_goal).subscribe(data => {
      alert("Updated Successfully");
      this.LoadProductData();
    }, error => { this._util.serviceError(error); });
  }
  service_deleteKpiDefinition(row) {
    this._appservice.DeleteKpiDefinition(row).subscribe(data => {
      this.definitions.splice(this.definitions.indexOf(row), 1);
      this.LoadData();
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
  service_deleteProdKpiDefinition(row) {
    this._appservice.DeleteKpiDefinition(row).subscribe(data => {
      this.definitions.splice(this.definitions.indexOf(row), 1);
      this.LoadData();
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
  service_deleteKpiTarget(row) {
    this._appservice.DeleteKpiTarget(row).subscribe(data => {
      this.definition.kpI_TARGETS.splice(this.definition.kpI_TARGETS.indexOf(row), 1);
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
  service_GetGlobalKpiCategories() {
    this._appservice.GetGlobalKpiCategories().subscribe(data => {
      this.GlobalCategories = data;
    }, error => { this._util.serviceError(error); });
  }

  loadProductModes(prodId) {
    this.isLoading = true;
    this._appservice.getAllServiceMode(prodId).subscribe(data => {
      this.serviceModes = data;
      if (data.length > 0) {
        this.selectedMode = this.serviceModes.filter(x => x.modE_TITLE)[0].id;
        this.selectedModetitle = this.serviceModes.filter(x => x.modE_TITLE)[0].modE_TITLE;
      }
      this.loadServiceLevel();
      this.isLoading = false;
    }, (err) => { this._util.serviceError(err) })
  }
  ddlevel_Onchange(lvlid) {
    this.isLoading = true;
    if (this.selectedMode != undefined) {
      this._appservice.getAllKpiByModeId(this.selectedMode, lvlid, this.prodId).subscribe(data => {
        this.kpiDefnitions = data;
        this.dataSource1 = new MatTableDataSource(this.kpiDefnitions);
        this.isLoading = false;
      }, (err) => { this._util.serviceError(err) })
    }
  }
  getmeasurementforServiceLevel(kpiId) {
    let uom; let expectedLvl;
    if (this.kpiDefnitions.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.kpiDefnitions.filter(x => x.kpI_ID == kpiId)[0]!.uniT_OF_MEASUREMENT;
        expectedLvl = this.kpiDefnitions.filter(x => x.kpI_ID == kpiId)[0]!.expecteD_SERVICE_LEVEL;
        if (uom == '%')
          return expectedLvl + '%'
        else if (uom == 'Number')
          return expectedLvl + ' per product'
      }
    }
  }
  getmeasurementforMinServiceLevel(kpiId) {
    let uom; let expectedLvl;
    if (this.kpiDefnitions.length > 0) {
      if (kpiId != undefined || kpiId != null) {
        uom = this.kpiDefnitions.filter(x => x.kpI_ID == kpiId)[0]!.uniT_OF_MEASUREMENT;
        expectedLvl = this.kpiDefnitions.filter(x => x.kpI_ID == kpiId)[0]!.minimuM_SERVICE_LEVEL;
        if (uom == '%')
          return expectedLvl + '%'
        else if (uom == 'Number')
          return expectedLvl + ' per product'
      }
    }

  }

  loadServiceArea() {
    this._appservice.getProductServiceArea().subscribe(data => {
      this.serviceArea = data;
    }, (err) => { this._util.serviceError(err) })
  }

  loadServiceLevel() {
    this.isLoading = true;
    this._appservice.getServiceLevel().subscribe(data => {
      this.serviceLevel = data;
      if (data.length > 0) {
        this.selectedLevel = this.serviceLevel.filter(x => x.servicE_LEVEL)[0].id;
        this.ddlevel_Onchange(this.selectedLevel);
      }
      this.isLoading = false;
    }, (err) => { this._util.serviceError(err) })
  }

  Service_GetServiceAreaProjectMapping() {
    this.serviceAreaProjectMappingList = undefined;
    if (this.projId != undefined) {
      this._appservice.getServiceTowersProjectMapping(this.projId).subscribe(data => {
        this.serviceAreaProjectMappingList = data;
      }, error => { this._util.serviceError(error); });
    }
  }

  loadReference() {
    this._appservice.getServiceReference().subscribe(data => {
      this.reference = data;
    }, (err) => { this._util.serviceError(err) })
  }

  alphaNumberOnly(e) {  // Accept only alpha numerics, not special characters 
    var regex = new RegExp("^[a-zA-Z0-9._]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
      return true;
    }
    e.preventDefault();
    return false;
  }
  onPaste(e) {
    e.preventDefault();
    return false;
  }
}
