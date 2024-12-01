import { Component, OnInit, ViewChild, ElementRef, QueryList, ViewChildren } from "@angular/core";
import { AppsService } from "./../../../Services/apps.service";
import { myUtility } from "./../../../Shared/myUtility";
import { GlobalKpiCategoryModel } from "./../../../models/global-kpi-category-model";
import {
  CustomerProjectIds,
  GlobalKPIRequest,
} from "./../../../models/customer-projects-model";
import { DateSelectionModel } from './../../../models/DateSelection-model';
import { MatOption, MatSelect, MatSelectChange } from "@angular/material";


@Component({
  selector: "app-projects-kpi",
  templateUrl: "./projects-kpi.component.html",
  styleUrls: ["./projects-kpi.component.scss"],
})
export class ProjectsKPIComponent implements OnInit {
  projectsKpi: any[] = [];
  monthColumns: any[] = [];
  menuToggleStatus: boolean;
  globaL_KPI_CATEGORY_IDs: number[] = [];
  GlobalCategories: GlobalKpiCategoryModel[] = [];
  Obj: CustomerProjectIds = new CustomerProjectIds();
  requestObj: GlobalKPIRequest = new GlobalKPIRequest();
  DateSelection: DateSelectionModel = new DateSelectionModel(this._util);
  startDate: Date = new Date();
  endDate: Date = new Date();
  Customerids: string[] = [];
  Projectids: string[] = [];
  showtooltip: boolean = false;
  processedData: any;
  groupbyProjectsKPi: any;
  selectedoption: string;
  flag: boolean = false;
  allcust: boolean = false;
  allproj: boolean = false;
  globalData: any;
  role: string;
  ServiceAreaList: any[] = [];
  serviceTowerIds: any[] = [];
  serviceTower: any[] = [];
  serviceList: any[] = [];
  @ViewChildren("gcategory") gcategory: QueryList<ElementRef>;
  @ViewChildren("project") project: QueryList<ElementRef>;
  @ViewChildren("summary") summary: QueryList<ElementRef>;
  @ViewChild('allServiceSelected') allServiceSelected: MatOption;
  @ViewChild('selectservice') selectservice: MatSelect;

  constructor(public _appService: AppsService, public _util: myUtility) { }

  ngOnInit() {

    this.role = localStorage.getItem('role');

    if (this.requestObj != null) {
      if (this.role == "1" || this.role == "7" || this.role == "4") {
        this.allcust = true;
        this.allproj = true;
        this.requestObj.loadAll = true;
      }
      else {
        this.allcust = false;
        this.allproj = false;
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

  closewindow(flag) {

    flag = false;
  }

  Service_GetProjectKPIData(requestObj) {
    this.processedData = null;
    this._appService
      .GetGlobalKPICategoryDetailsAcrossProject(requestObj)
      .subscribe(
        (data) => {
          if (!this.flag)
            this.globalData = data;

          this.flag = true;
          this.processedData = data;
          this.projectsKpi = data.projectsKpi;
          this.monthColumns = data.monthColumns;

        },
        (error) => {
          this._util.serviceError(error);
        }
      );
  }

  showtooltipfn() {
    this.showtooltip = !this.showtooltip;
  }

  getConsolidatedMinValue(value) {
    if (value.actualsEmpty > 0)
      return value.min + " #";
    else if (value.singleTarget > 0)
      return value.min;
    else
      return value.min
  }

  getConsolidatedMaxValue(value) {
    if (value.actualsEmpty > 0)
      return value.max + " #";
    else if (value.singleTarget > 0)
      return value.max;
    else
      return value.max
  }

  getConsolidatedMedianValue(value) {
    if (value.actualsEmpty > 0)
      return value.median + " #";
    else if (value.singleTarget > 0)
      return value.median;
    else
      return value.median
  }

  getKPIAcheievementScore(period) {
    if (period.actualsEmpty > 0)
      return period.kpiachievementscore.toString() + " #";
    else if (period.singleTarget > 0)
      return period.kpiachievementscore.toString() + "@";
    else
      return period.kpiachievementscore.toString() + ' %'
  }

  getKPIAverageScore(period) {
    if (period.actualsEmpty > 0)
      return period.average.toString() + ' #'
    else if (period.singleTarget > 0)
      return period.average.toString() + '@'
    else
      return period.average.toString() + ' %'
  }

  getOverallKPIAchieveddata(custdata) {
    if (custdata.kpI_NOT_CALCULATED > 0)
      return custdata.kpI_ACHIEVED + '* %';
    else
      return custdata.kpI_ACHIEVED + ' %';
  }

  getCustAndProjects(event: CustomerProjectIds) {
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
      (data) => {
        this.GlobalCategories = data;
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  getKpiActualValue(actual) {
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

  Service_GetCustomerSummaryReport(requestObj) {
    this.processedData = null;
    this._appService
      .GetConsolidatedProjectWiseKPIDetails(requestObj)
      .subscribe(
        (data) => {
          this.processedData = data;

        },
        (error) => {
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

  getFirstelementofdic(element) {
    return element[Object.keys(element)[0]];
  }

  exportexcel() {
    let name;
    if (this.requestObj.initialGroup == "GCATEGORY") {
      name = "Grouping by Global Category";
      this.gcategory.toArray().forEach(x => {
        this._util.exportToExcel(x.nativeElement, name);
      });
    }
    else if (this.requestObj.initialGroup == "PROJECT") {
      // name = "Grouping by Project";
      // this.project.toArray().forEach(x => {
      //   this._util.exportToExcel(x.nativeElement, name);
      // });
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
    this._appService.getServiceAreaList().subscribe(data => {
      this.ServiceAreaList = data;
      
    setTimeout(() => {
      if (this.allServiceSelected)
        this.allServiceSelected.select();
      this.toggleSelectionForService();
    }, data.length);
    });

    



  }
  // GetServiceAreaListbyId(projectId: string) {
  //   this.ServiceAreaList = [];

  //   this._appService.getServiceTowersProjectMapping(projectId).subscribe(data => {
  //     this.serviceList.push(...data);
  //     this.ServiceAreaList = this.serviceList.filter((item, index, self) => {
  //       return index === self.findIndex(i => i.id === item.id);
  //     });
  //   })
  // }
  onSelectionChange(event: MatSelectChange) {
    this.serviceTowerIds = event.value;

  }
  toggleSelectionForService() {
    if (this.allServiceSelected.selected) {
      this.selectservice.options.forEach((item: MatOption) => item.select());
    } else {
      this.selectservice.options.forEach((item: MatOption) => item.deselect());
    }
    this.serviceTowerIds = this.selectservice.options.filter(option => option.selected).map(option => option.value);
  }
  serviceTosslePerOne() {
    if (this.allServiceSelected.selected) {
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

}
