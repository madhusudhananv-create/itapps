import { Component, OnInit, ViewChild, ElementRef, QueryList, ViewChildren, NO_ERRORS_SCHEMA, ViewEncapsulation } from "@angular/core";
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect, MatSelectChange } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';

import { AppsService, GlobalKpiCategoryModel } from "../../core/services/apps.service";
import { MyUtility } from "../../shared/my-utility";
import { NavbarNewComponent } from "../../components/navbar-new/navbar-new.component";
import { ProjectSelectorMultipleComponent } from "../../components/project-selector-multiple/project-selector-multiple.component";

/**
 * Benchmark KPI Component (Projects KPI)
 * Complex reporting component for KPI benchmarking across projects
 * 
 * Features:
 * - Multiple view modes: By Project, By Enterprise KPI, Summary
 * - Date range selection (month/year)
 * - Service tower filtering
 * - Global KPI category filtering
 * - Customer and project selection
 * - Dynamic table generation
 * - KPI target tooltips
 * - Excel export
 * 
 * Migrated from Angular 6 to Angular 19
 * All business logic, names, and styles preserved
 * 
 * NOTE: This component requires project-selector-multiple component
 * which should be migrated separately
 */
@Component({
  selector: "app-projects-kpi",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    KeyValuePipe,
    NavbarNewComponent,
    ProjectSelectorMultipleComponent
  ],
  schemas: [NO_ERRORS_SCHEMA], // Allow unknown elements if needed
  templateUrl: "./projects-kpi.component.html",
  styleUrls: ["./projects-kpi.component.scss"],
  encapsulation: ViewEncapsulation.None // Allow inline styles to work properly
})
export class ProjectsKPIComponent implements OnInit {
  projectsKpi: any[] = [];
  monthColumns: any[] = [];
  menuToggleStatus: boolean = false;
  globaL_KPI_CATEGORY_IDs: number[] = [];
  GlobalCategories: GlobalKpiCategoryModel[] = [];
  filteredGlobalCategories: GlobalKpiCategoryModel[] = [];
  Obj: CustomerProjectIds = new CustomerProjectIds();
  requestObj: GlobalKPIRequest = new GlobalKPIRequest();
  DateSelection: DateSelectionModel;
  startDate: Date = new Date();
  endDate: Date = new Date();
  Customerids: string[] = [];
  Projectids: string[] = [];
  showtooltip: boolean = false;
  kpiSearchText: string = '';
  serviceTowerSearchText: string = '';
  processedData: any;
  groupbyProjectsKPi: any;
  selectedoption: string = "PROJECT";
  flag: boolean = false;
  allcustFlag: boolean = false; // Flag for "All Customers" mode
  allprojFlag: boolean = false; // Flag for "All Projects" mode
  allcust: any[] = []; // Array of all customers for dropdown
  allproj: any[] = []; // Array of all projects for dropdown
  globalData: any;
  role: string = "";
  ServiceAreaList: any[] = [];
  filteredServiceAreaList: any[] = [];
  serviceTowerIds: any[] = [];
  serviceTower: any[] = [];
  serviceList: any[] = [];
  @ViewChildren("gcategory") gcategory!: QueryList<ElementRef>;
  @ViewChildren("project") project!: QueryList<ElementRef>;
  @ViewChildren("summary") summary!: QueryList<ElementRef>;
  @ViewChild('allServiceSelected') allServiceSelected!: MatOption;
  @ViewChild('selectservice') selectservice!: MatSelect;

  constructor(public _appService: AppsService, public _util: MyUtility) {
    this.DateSelection = new DateSelectionModel(this._util);
  }

  ngOnInit() {
    this.role = localStorage.getItem('role') || '';

    if (this.requestObj != null) {
      if (this.role == "1" || this.role == "7" || this.role == "4") {
        this.allcustFlag = true;
        this.allprojFlag = true;
        this.requestObj.loadAll = true;
      }
      else {
        this.allcustFlag = false;
        this.allprojFlag = false;
        this.requestObj.loadAll = false;
      }
      this.GetServiceAreaList();
      this.requestObj.startDate = this.getStartAndEndDates().startDate;
      this.requestObj.endDate = this.getStartAndEndDates().endDate;
      this.DateSelection.selectedStartMonth = this._util.getMonthAbr(
        new Date(this.requestObj.startDate).getMonth()
      );
      this.DateSelection.selectedStartYear = new Date(
        this.requestObj.startDate
      ).getFullYear();
      this.DateSelection.selectedEndMonth = this._util.getMonthAbr(
        new Date(this.requestObj.endDate).getMonth()
      );
      this.DateSelection.selectedEndYear = new Date(
        this.requestObj.endDate
      ).getFullYear();

      this.requestObj.globalkpis = this.globaL_KPI_CATEGORY_IDs.map((x) =>
        x.toString()
      );
      this.selectedoption = "PROJECT";
      this.requestObj.customerids = this.Customerids;
      this.requestObj.projectids = this.Projectids;
      this.requestObj.initialGroup = this.selectedoption;
    }

    this.Service_GetProjectKPIData(this.requestObj);
    this.service_GetGlobalKpiCategories();
  }

  getStartAndEndDates() {
    let dateObj = { startDate: "", endDate: "" };
    let currentDate = new Date();

    let endDt: Date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    let startDt;
    let tempDt = new Date();

    tempDt.setMonth(endDt.getMonth() - 10);

    startDt = new Date(tempDt.getFullYear(), tempDt.getMonth(), 1);

    dateObj.startDate = startDt.toDateString();
    dateObj.endDate = endDt.toDateString();

    return dateObj;
  }

  closewindow(flag: boolean) {
    flag = false;
  }

  Service_GetProjectKPIData(requestObj: any) {
    this.processedData = null;
    this._appService
      .GetGlobalKPICategoryDetailsAcrossProject(requestObj)
      .subscribe(
        (data: any) => {
          if (!this.flag)
            this.globalData = data;

          this.flag = true;
          this.processedData = data;
          this.projectsKpi = data.projectsKpi;
          this.monthColumns = data.monthColumns;
        },
        (error: any) => {
          this._util.serviceError(error);
        }
      );
  }

  showtooltipfn() {
    this.showtooltip = !this.showtooltip;
  }

  getConsolidatedMinValue(value: any) {
    if (value.actualsEmpty > 0)
      return value.min + " #";
    else if (value.singleTarget > 0)
      return value.min;
    else
      return value.min
  }

  getConsolidatedMaxValue(value: any) {
    if (value.actualsEmpty > 0)
      return value.max + " #";
    else if (value.singleTarget > 0)
      return value.max;
    else
      return value.max
  }

  getConsolidatedMedianValue(value: any) {
    if (value.actualsEmpty > 0)
      return value.median + " #";
    else if (value.singleTarget > 0)
      return value.median;
    else
      return value.median
  }

  getKPIAcheievementScore(period: any) {
    if (period.actualsEmpty > 0)
      return period.kpiachievementscore.toString() + " #";
    else if (period.singleTarget > 0)
      return period.kpiachievementscore.toString() + "@";
    else
      return period.kpiachievementscore.toString() + ' %'
  }

  getKPIAverageScore(period: any) {
    if (period.actualsEmpty > 0)
      return period.average.toString() + ' #'
    else if (period.singleTarget > 0)
      return period.average.toString() + '@'
    else
      return period.average.toString() + ' %'
  }

  getOverallKPIAchieveddata(custdata: any) {
    if (custdata.kpI_NOT_CALCULATED > 0)
      return custdata.kpI_ACHIEVED + '* %';
    else
      return custdata.kpI_ACHIEVED + ' %';
  }

  getCustAndProjects(event: any) {
    if (event.customer != undefined) this.Customerids = event.customer;
    if (event.project != undefined) this.Projectids = event.project;
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  calculateRowSpan(kpis: any[]) {
    let sum = 0;
    kpis.forEach((x) => {
      sum += x.periods.length;
    });
    return sum;
  }

  service_GetGlobalKpiCategories() {
    this._appService.GetGlobalKpiCategories().subscribe(
      (data: any) => {
        this.GlobalCategories = data;
        this.filteredGlobalCategories = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  getKpiActualValue(actual: any) {
    if (actual != null) {
      if (actual.kpiActualValue == -1)
        return "NA"
      else if (actual.isActualEmpty)
        return "NU";
      else
        return actual.kpiActualValue;
    }
    return "-";
  }

  Service_GetCustomerSummaryReport(requestObj: any) {
    this.processedData = null;
    this._appService
      .GetConsolidatedProjectWiseKPIDetails(requestObj)
      .subscribe(
        (data: any) => {
          this.processedData = data;
        },
        (error: any) => {
          this._util.serviceError(error);
        }
      );
  }

  applyFilter() {
    this.saveDates();
    this.requestObj = new GlobalKPIRequest();
    if (this.role == "1" || this.role == "7" || this.role == "4")
      this.requestObj.loadAll = true;
    else
      this.requestObj.loadAll = false;

    this.requestObj.startDate = this.DateSelection.startDate.toDateString();
    this.requestObj.endDate = this.DateSelection.endDate.toDateString();
    this.requestObj.globalkpis = this.globaL_KPI_CATEGORY_IDs.map((x) =>
      x.toString()
    );
    this.requestObj.customerids = this.Customerids;
    this.requestObj.projectids = this.Projectids;
    this.requestObj.serviceTowerIds = this.serviceTowerIds;
    this.requestObj.initialGroup = this.selectedoption;

    if (this.selectedoption == 'SUMMARY')
      this.Service_GetCustomerSummaryReport(this.requestObj);
    else
      this.Service_GetProjectKPIData(this.requestObj);
  }

  saveDates() {
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

  getFirstelementofdic(element: any) {
    return element[Object.keys(element)[0]];
  }

  exportexcel() {
    let name: string = '';
    if (this.requestObj.initialGroup == "GCATEGORY") {
      name = "Grouping by Global Category";
      this.gcategory.toArray().forEach(x => {
        this._util.exportToExcel(x.nativeElement, name);
      });
    }
    else if (this.requestObj.initialGroup == "PROJECT") {
      alert("The download feature for view by project will be made available by end of May-2020");
    }
    else if (this.requestObj.initialGroup == "SUMMARY") {
      name = "Overall KPI Performance";
      this.summary.toArray().forEach(x => {
        this._util.exportToExcel(x.nativeElement, name);
      })
    }
  }

  GetServiceAreaList() {
    this.ServiceAreaList = [];
    this._appService.getServiceAreaList().subscribe((data: any) => {
      this.ServiceAreaList = data;
      this.filteredServiceAreaList = data;
      
      setTimeout(() => {
        if (this.allServiceSelected)
          this.allServiceSelected.select();
        this.toggleSelectionForService();
      }, data.length);
    });
  }

  onSelectionChange(event: MatSelectChange) {
    this.serviceTowerIds = event.value;
  }

  toggleSelectionForService() {
    if (this.allServiceSelected && this.allServiceSelected.selected) {
      this.selectservice.options.forEach((item: MatOption) => item.select());
    } else {
      this.selectservice.options.forEach((item: MatOption) => item.deselect());
    }
    this.serviceTowerIds = this.selectservice.options.filter(option => option.selected).map(option => option.value);
  }

  serviceTosslePerOne() {
    if (this.allServiceSelected && this.allServiceSelected.selected) {
      this.allServiceSelected.deselect();
    }
    let count = 0;
    this.selectservice.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.ServiceAreaList.length == count)
      this.allServiceSelected.select();
    this.serviceTowerIds = this.selectservice.options.filter(option => option.selected).map(option => option.value);
  }

  filterKPIs() {
    const searchTerm = this.kpiSearchText.toLowerCase().trim();
    if (searchTerm === '') {
      this.filteredGlobalCategories = [...this.GlobalCategories];
    } else {
      this.filteredGlobalCategories = this.GlobalCategories.map(group => {
        const filteredCategories = group.category?.filter(cat => 
          cat.shorT_DESC?.toLowerCase().includes(searchTerm)
        ) || [];
        return {
          ...group,
          category: filteredCategories
        };
      }).filter(group => group.category && group.category.length > 0);
    }
  }

  filterServiceTowers() {
    const searchTerm = this.serviceTowerSearchText.toLowerCase().trim();
    if (searchTerm === '') {
      this.filteredServiceAreaList = [...this.ServiceAreaList];
    } else {
      this.filteredServiceAreaList = this.ServiceAreaList.filter(tower =>
        tower.title?.toLowerCase().includes(searchTerm)
      );
    }
  }

  toggleAllKPIs() {
    const allKPIIds: number[] = [];
    this.GlobalCategories.forEach(group => {
      group.category?.forEach(cat => {
        allKPIIds.push(cat.id);
      });
    });
    
    if (this.globaL_KPI_CATEGORY_IDs.length === allKPIIds.length) {
      // Deselect all
      this.globaL_KPI_CATEGORY_IDs = [];
    } else {
      // Select all
      this.globaL_KPI_CATEGORY_IDs = [...allKPIIds];
    }
  }
}

// ============================================
// MODELS - Local to Component
// ============================================

export class CustomerProjectIds {
  customer?: string[];
  project?: string[];
}

export class GlobalKPIRequest {
  startDate?: string;
  endDate?: string;
  globalkpis?: string[];
  customerids?: string[];
  projectids?: string[];
  serviceTowerIds?: any[];
  initialGroup?: string;
  loadAll?: boolean;
}

export class DateSelectionModel {
  selectedStartMonth: string;
  selectedStartYear: number;
  selectedEndMonth: string;
  selectedEndYear: number;
  startDate: Date;
  endDate: Date;

  constructor(private _util: MyUtility) {
    let currentDate = new Date();
    this.selectedStartMonth = this._util.getMonthAbr(currentDate.getMonth());
    this.selectedStartYear = currentDate.getFullYear();
    this.selectedEndMonth = this._util.getMonthAbr(currentDate.getMonth());
    this.selectedEndYear = currentDate.getFullYear();
    this.startDate = new Date();
    this.endDate = new Date();
  }
}
