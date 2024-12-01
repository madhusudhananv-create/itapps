import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FMEAModel, ServiceLevelIdentifier, ProcessAreaModelNew, ServiceAreaModelNew, FMEAStage2Model, FMEARatingFactorsModel, FMEAStage3Model, failurE_MODE_MASTER } from '../../models/fmea-model';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { ActivatedRoute } from '@angular/router';
import { ParameterModel } from '../../models/parameter-model';
import { MatFormFieldModule, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { EmpInfoModel } from '../../models/emp-info-model';
import { PortfolioProjectSelectorComponent } from '../../controls/portfolio-project-selector/portfolio-project-selector.component';
import { PortfolioModel, ProjectModelNew } from '../../models/portfolio-model';
import { CustomerModel } from '../../models/customer-model';
import { SharedService } from '../../Shared/shared.service';
import { ChangeDetectorRef } from "@angular/core";
import { LayoutService } from '../../pages/layout/layout.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ProcessServiceAreaMapping } from '../../models/audit-checklist-based-model';


@Component({
  selector: 'app-fmea-management',
  templateUrl: './fmea-management.component.html',
  styleUrls: ['./fmea-management.component.scss']
})
export class FmeaManagementComponent implements OnInit {

  processes: ProcessServiceAreaMapping[];
  selectedEmployee: EmpInfoModel;
  selectedFMEAType: number;
  selectedServiceTower: number;
  selectedServiceIdentifier: number;
  selectedProcess: number;
  selectedTask: number;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  EditMode: Boolean = false;
  readOnly: Boolean = false;
  Stage2EditMode: Boolean = false;
  Stage3EditMode: Boolean = false;
  isOpen: Boolean;
  currentlyOpenedItemIndex: number = -1;
  FMEAList: FMEAModel[] = [];
  selection = new SelectionModel<FMEAModel>(true, []);
  FMEAActivitiyList: FMEAModel[] = [];
  FMEAListByTask: FMEAModel[] = [];
  ActivitiesList;
  ActivitiesListStage2;
  ActivitiesListStage3;
  result: any;
  FMEA = new failurE_MODE_MASTER();
  FMEAStage2List: FMEAStage2Model[] = [];
  FMEAStage3List: FMEAStage3Model[] = [];
  TempFMEAStage2ApplicableList: FMEAStage2Model[] = [];
  TempFMEAStage2List: FMEAStage2Model[] = [];
  dataSource: MatTableDataSource<FMEAModel>;
  dataSourceStage2: MatTableDataSource<FMEAStage2Model>;
  dataSourceStage3: MatTableDataSource<FMEAStage3Model>;

  @ViewChild('paginator1') paginator1: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;
  @ViewChild('paginator3') paginator3: MatPaginator;



  selectedParams = new FMEAModel();
  selectedParamsStage2: FMEAStage2Model = new FMEAStage2Model();
  selectedParamsStage3: FMEAStage3Model = new FMEAStage3Model();
  ServiceAreaList: ServiceAreaModelNew[] = [];
  selectedServiceArea = new ServiceAreaModelNew();
  selectedProcessArea = new ProcessAreaModelNew();
  ProcessAreaList: ProcessAreaModelNew[] = [];
  FMEATypeList: ParameterModel[] = [];
  TaskCategoryList: ParameterModel[] = [];
  PotentialCauseFactorList: ParameterModel[] = [];
  FMEAFailureCategory: ParameterModel[] = [];
  ServiceLevelList = [];
  TaskList = [];
  selectedTaskCategory = new ParameterModel()
  selectedServiceLevel = new ServiceLevelIdentifier();
  title: string;
  description: string;
  private sub: any;
  CUST_ID: string;
  ServiceLevelIdentifier: string;
  ServiceLevelTitle: string;
  statusMessage: string;
  TaskTitle: string;
  showServiceLevelPopup: boolean = false;
  showTasksPopup: boolean = false;
  showRejectionPopup: boolean = false;
  showRejectionPopupStage2: boolean = false;
  showRejectionPopupStage3: boolean = false;
  showRejectionPopupStage2All: boolean = false;
  showStepper : boolean = false;

  displayedColumns: string[] = ['select', 'index', 'functioN_ACTIVITIES', 'potentiaL_FAILURE_MODE', 'potentiaL_CAUSE_FACTOR_OPTIONS', 'potentiaL_CAUSE', 'potentiaL_FAILURE_EFFECT', 'approve', 'edit', 'view'];
  displayedColumnsStage2: string[] = ['selected', 'index', 'functioN_ACTIVITIES', 'potentiaL_FAILURE_MODE', 'potentiaL_CAUSE_FACTOR', 'potentiaL_CAUSE', 'occurrencE_RATING_DEFINITION', 'severitY_RATING_DEFINITION', 'detectioN_RATING_DEFINITION', 'rpn', 'fmeA_STAGE2_STATUS_DESC', 'edit'];
  displayedColumnsStage3: string[] = ['index', 'functioN_ACTIVITIES', 'potentiaL_FAILURE_MODE', 'potentiaL_CAUSE_FACTOR', 'potentiaL_CAUSE', 'futurE_ACTION_TAKEN', 'futurE_OCCURRENCE_RATING_DEFINITION', 'futurE_SEVERITY_RATING_DEFINITION', 'futurE_DETECTION_RATING_DEFINITION', 'futurE_RPN', 'edit'];

  RatingFactorsList: FMEARatingFactorsModel[] = [];
  SEVERITY_RatingFactorsList: FMEARatingFactorsModel[] = [];
  OCCURRENCE_RatingFactorsList: FMEARatingFactorsModel[] = [];
  DETECTION_RatingFactorsList: FMEARatingFactorsModel[] = [];
  FUTURE_SEVERITY_RatingFactorsList: FMEARatingFactorsModel[] = [];
  FUTURE_OCCURRENCE_RatingFactorsList: FMEARatingFactorsModel[] = [];
  FUTURE_DETECTION_RatingFactorsList: FMEARatingFactorsModel[] = [];
  fmea_Status: number;
  fmea_RejectionComments: string = "";
  fmea_RejectionComments_Stage2: string = "";
  fmea_RejectionComments_Stage3: string = "";
  maxValue: Date;
  employees: EmpInfoModel[] = [];
  customerid: string;
  reset: boolean = false;
  portfolioList: PortfolioModel[] = []
  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;
  portArray: number[] = [];
  selectedProj: string;
  disableBtn: boolean;
  isApplicableStatus: string = "0";
  isRequired: boolean = true;
  frmStage2Status: boolean;
  FSRating: any;
  FDRating: any;
  FORating: any;
  plannedTasks: any[];
  custId: string;
  projId: string;
  showData: boolean = false;
  selectedStage2Status: number = 0;
  selectedStage2StatusForApplicable: number = 0;

  menuToggleStatus: boolean;
  isSubmitted: boolean = false;



  constructor(public _layoutService: LayoutService, private route: ActivatedRoute, private _util: myUtility, private _appservice: AppsService, private _formBuilder: FormBuilder, private _shared: SharedService, private cdref: ChangeDetectorRef) { }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.RefreshTableForStage1(this.FMEAList);
  //     this.RefreshTableForStage2(this.FMEAStage2List);
  //     this.RefreshTableForStage3(this.FMEAStage3List);
  //   });


  //   this.cdref.detectChanges();

  // }

  // ngOnChanges() {
  //   setTimeout(() => {
  //     this.RefreshTableForStage1(this.FMEAList);
  //     this.RefreshTableForStage2(this.FMEAStage2List);
  //     this.RefreshTableForStage3(this.FMEAStage3List);
  //   });

  //   this.cdref.detectChanges();
  // }

  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
      this.CUST_ID = params['custid'];

      if (localStorage.getItem('role') === '7')
        this.CUST_ID = "200000000";

      //this._layoutService.selectedCust = this.CUST_ID;      
      this.Service_GetFMEATypeList();
      this.Service_GetTaskCategory();
      this.Service_GetServiceAreaList();
      this.Service_GetPotentialCauseFactor();
      this.Service_GetFMEAFailureCategoryList();

    });

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });

    this.GetRatingFactors("All");
    this.service_GetEmployees();

  }

  btnSetStatus_onClick(status) {
    var list = this.FMEAList.filter(x => x.isselected);

    if (list.length == 0) {
      alert("Please select records to approve/reject");
      return;
    }

    if (status == "Approved")
      list.forEach(x => x.status = "Approved");
    else
      list.forEach(x => x.status = "Rejected");
    this.isSubmitted = true;

    this._appservice.UpdateStatusofFailures(list).subscribe(data => {
      for (var row of data) {
        var index = this.FMEAList.findIndex(x => x.id == row.id);
        if (index > -1)
          this.FMEAList[index] = row;
      }
      alert(`Selected rows ${status} successfully`);
      this.selection.clear();
      this.RefreshTableForStage1(this.FMEAList);
      this.isSubmitted = false;


    }, (err) => {
      this._util.serviceError(err);
      this.selection.clear();
      this.RefreshTableForStage1(this.FMEAList);
      this.isSubmitted = false
    })

  }

  viewElement_onClick(element: FMEAModel) {
    this.EditMode = true;
    this.selectedParams = element;
    this.readOnly = true;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }




  public rbApplicableSelection = [
    { name: 'All', value: '0' },
    { name: 'Applicable', value: '1' },
    { name: 'Not Applicable', value: '2' }
  ];


  Service_GetTasksForFMEA(custid, projid) {
    this._appservice.getTasksForFMEA(custid, projid).subscribe(data => {
      this.plannedTasks = data;
    })
  }


  Service_GetFMEAStage2DataByTask(taskId) {
    this._appservice.getFMEAStage2DataByTask(taskId).subscribe(data => {
      this.plannedTasks = data;
    })
  }


  // project_onChange($event) {
  //   let obj: any = JSON.parse($event);
  //   this.custId = obj.customer;
  //   this.projId = obj.project;
  //   this.Service_GetTasksForFMEA(this.custId, this.projId);
  // }


  setRequestAll(request, comments) {

    let FMEAStage2ApplicableAll: any;
    FMEAStage2ApplicableAll = this.FMEAStage2List.filter(x => x.selected == true);

    if (request != "APPLICABLE")
      FMEAStage2ApplicableAll = FMEAStage2ApplicableAll.filter(x => x.isapplicable == true);

    this._appservice.UpdateFMEAStage2MultipleRequests(request, FMEAStage2ApplicableAll).subscribe(data => {
      let status = data;
      this.btnApply();
    }, error => { this._util.serviceError(error); });
  }

  getFMEAStage2DataByTask(taskId) {
    this.Service_GetFMEAStage2DataByTask(taskId);
  }


  toggleAll(event, data) {

    if (data == "ApplicableAll") {
      if (event.checked)
        this.FMEAStage2List.forEach(x => x.isapplicable = true);
      else
        this.FMEAStage2List.forEach(x => x.isapplicable = false);
    }

    if (data == "ApproveAll") {
      if (event.checked)
        this.FMEAStage2List.forEach(x => x.isapprove = true);
      else
        this.FMEAStage2List.forEach(x => x.isapprove = false);
    }

    if (data == "RejectAll") {
      if (event.checked)
        this.FMEAStage2List.forEach(x => x.isreject = true);
      else
        this.FMEAStage2List.forEach(x => x.isreject = false);
    }

  }

  toggle(event, data) {

    this._appservice.UpdateApplicable(data.id, event.checked).subscribe(data => {
      this.statusMessage = data;
    }, error => { this._util.serviceError(error); });


    this.selectedParamsStage2.cusT_ID = this.CUST_ID;
    this.selectedParamsStage2.proJ_ID = this.selectedProj;

    this._appservice.AddFMEADataStage2Model(this.selectedParamsStage2).subscribe(data => {

    },
      (error) => { this._util.serviceError(error) });


  }

  calcRPN(event, control) {
    var SRating, DRating, ORating;
    SRating = this.SEVERITY_RatingFactorsList.filter(x => x.id == this.selectedParamsStage2.rF_SEVERITY_ID);
    DRating = this.DETECTION_RatingFactorsList.filter(x => x.id == this.selectedParamsStage2.rF_DETECTION_ID);
    ORating = this.OCCURRENCE_RatingFactorsList.filter(x => x.id == this.selectedParamsStage2.rF_OCCURRENCE_ID);

    if (control == "S") {
      SRating = this.SEVERITY_RatingFactorsList.filter(x => x.id == event.value);

      if (parseFloat(SRating[0].ratinG_FACTORS_RATING) > 8)
        this.isRequired = true;
      else
        this.isRequired = false;
    }

    if (control == "D") {
      DRating = this.DETECTION_RatingFactorsList.filter(x => x.id == event.value);
    }
    if (control == "O") {
      ORating = this.OCCURRENCE_RatingFactorsList.filter(x => x.id == event.value);
    }

    if (SRating.length > 0 && DRating.length > 0 && ORating.length > 0) {
      this.selectedParamsStage2.rpn = parseFloat(SRating[0].ratinG_FACTORS_RATING) * parseFloat(DRating[0].ratinG_FACTORS_RATING)
        * parseFloat(ORating[0].ratinG_FACTORS_RATING);
    }

  }


  calcRPNStage3(event, control) {

    if (this.selectedParamsStage2.rF_SEVERITY_ID != null)
      this.FSRating = this.FUTURE_SEVERITY_RatingFactorsList.filter(x => x.id == this.selectedParamsStage3.futurE_RF_SEVERITY_ID);

    if (this.selectedParamsStage2.rF_DETECTION_ID != null)
      this.FDRating = this.FUTURE_DETECTION_RatingFactorsList.filter(x => x.id == this.selectedParamsStage3.futurE_RF_DETECTION_ID);

    if (this.selectedParamsStage2.rF_OCCURRENCE_ID != null)
      this.FORating = this.FUTURE_OCCURRENCE_RatingFactorsList.filter(x => x.id == this.selectedParamsStage3.futurE_RF_OCCURRENCE_ID);

    if (control == "S") {
      //this.selectedParamsStage3.futurE_RF_SEVERITY_ID = event.value;
      this.FSRating = this.FUTURE_SEVERITY_RatingFactorsList.filter(x => x.id == event.value);
      var SRating = this.SEVERITY_RatingFactorsList.filter(x => x.id == this.selectedParamsStage3.rF_SEVERITY_ID);

      if (this.FSRating != undefined && SRating != undefined) {
        if (this.FSRating.length > 0 && SRating.length > 0) {
          if (this.FSRating[0].ratinG_FACTORS_RATING > SRating[0].ratinG_FACTORS_RATING) {
            alert("Warning! : Stage3 Severity Rating should be less than the Severity Rating of Stage2");
          }
        }
      }

    }
    if (control == "D") {

      this.FDRating = this.FUTURE_DETECTION_RatingFactorsList.filter(x => x.id == event.value);
      var DRating = this.DETECTION_RatingFactorsList.filter(x => x.id == this.selectedParamsStage3.rF_DETECTION_ID);

      if (this.FDRating != undefined && DRating != undefined) {
        if (this.FDRating.length > 0 && DRating.length > 0) {
          if (this.FDRating[0].ratinG_FACTORS_RATING > DRating[0].ratinG_FACTORS_RATING) {
            alert("Warning! : Stage3 Detection Rating should be less than the Detection Rating of Stage2");
          }
        }
      }

    }
    if (control == "O") {

      this.FORating = this.FUTURE_OCCURRENCE_RatingFactorsList.filter(x => x.id == event.value);
      var ORating = this.OCCURRENCE_RatingFactorsList.filter(x => x.id == this.selectedParamsStage3.rF_OCCURRENCE_ID);

      if (this.FORating != undefined && ORating != undefined) {
        if (this.FORating.length > 0 && ORating.length > 0) {
          if (this.FORating[0].ratinG_FACTORS_RATING > ORating[0].ratinG_FACTORS_RATING) {
            alert("Warning! : Stage3 Occurrence Rating should be less than the Occurrence Rating of Stage2");
          }
        }
      }

    }


    if (this.FSRating != undefined && this.FDRating != undefined && this.FORating != undefined) {
      if (this.FSRating.length > 0 && this.FDRating.length > 0 && this.FORating.length > 0) {
        this.selectedParamsStage3.futurE_RPN = parseFloat(this.FSRating[0].ratinG_FACTORS_RATING) * parseFloat(this.FDRating[0].ratinG_FACTORS_RATING)
          * parseFloat(this.FORating[0].ratinG_FACTORS_RATING);
      }
    }

  }

  DoApplicable() {

    if (this.selectedStage2StatusForApplicable == 1)
      this.TempFMEAStage2ApplicableList = this.FMEAStage2List.filter(x => x.isapplicable == true);
    else if (this.selectedStage2StatusForApplicable == 2)
      this.TempFMEAStage2ApplicableList = this.FMEAStage2List.filter(x => x.isapplicable == false);
    else
      this.TempFMEAStage2ApplicableList = this.FMEAStage2List;
    this.RefreshTableForStage2(this.TempFMEAStage2ApplicableList);

  }

  RefreshStage1() {
    this.RefreshTableForStage1(this.FMEAList);
  }

  RefreshStage3() {
    this.RefreshTableForStage3(this.FMEAStage3List);
  }



  getFailureModeMasterData() {

    this._appservice.GetFailureModeMasterData(this.selectedFMEAType, this.selectedServiceTower, this.selectedProcess, this.selectedServiceIdentifier, this.selectedTask).subscribe(data => {
      this.FMEAList = data;
      console.log("fmea list", this.FMEAList);
      // const Activities = new Set(this.FMEAList.map(t => t.tasK_CATEGORY));
      // if (Activities.size > 0)
      //   this.ActivitiesList = Activities;
      // else
      //   this.ActivitiesList = ["New Categorgy"];

      this.RefreshTableForStage1(this.FMEAList);

    }, error => { this._util.serviceError(error); });


    this.getFMEADataStage2();
    this.getFMEADataStage3();

  }

  getFMEADataStage2() {

    if (this.selectedFMEAType == undefined || this.selectedServiceTower == undefined || this.selectedProcess == undefined || this.selectedServiceIdentifier == undefined || this.selectedTask == undefined)
      return;
    this._appservice.GetFMEADATAStage2(this.selectedFMEAType, this.selectedServiceTower, this.selectedProcess,
      this.selectedServiceIdentifier, this.selectedTask).subscribe(data => {
        this.FMEAStage2List = data;

        const Activities = new Set(this.FMEAList.map(t => t.tasK_CATEGORY));
        if (Activities.size > 0)
          this.ActivitiesListStage2 = Activities;
        else
          this.ActivitiesListStage2 = ["Email Handling"];

        this.RefreshTableForStage2(this.FMEAStage2List);
        this.cdref.detectChanges();

      }, error => { this._util.serviceError(error); });
  }


  getFMEADataStage3() {
    if (this.selectedFMEAType == undefined || this.selectedServiceTower == undefined || this.selectedProcess == undefined || this.selectedServiceIdentifier == undefined || this.selectedTask == undefined)
      return;

    this._appservice.GetFMEADATAStage3(this.selectedFMEAType, this.selectedServiceTower, this.selectedProcess, this.selectedServiceIdentifier, this.selectedTask).subscribe(data => {
      this.FMEAStage3List = data;

      const Activities = new Set(this.FMEAList.map(t => t.tasK_CATEGORY));
      if (Activities.size > 0)
        this.ActivitiesListStage3 = Activities;
      else
        this.ActivitiesListStage3 = ["Email Handling"];

      this.RefreshTableForStage3(this.FMEAStage3List);

    }, error => { this._util.serviceError(error); });
  }


  getFMEADataByActivities(activity) {

    let FMEAActivitiyList1: FMEAModel[] = [];
    for (let item of this.FMEAList) {
      if (item.tasK_CATEGORY === activity) {
        //FMEAActivitiyList1.push(item);
      }
    }
    this.FMEAListByTask = FMEAActivitiyList1;
    return FMEAActivitiyList1;
  }


  Service_GetPotentialCauseFactor() {
    this._appservice.GetParametersByType('POTENTIAL_CAUSE_FACTOR').subscribe(data => {
      this.PotentialCauseFactorList = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetFMEATypeList() {
    this._appservice.GetParametersByType('FMEA_TYPE').subscribe(data => {
      this.FMEATypeList = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetTaskCategory() {
    this._appservice.GetParametersByType('TASK_CATEGORY').subscribe(data => {
      this.TaskCategoryList = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe(data => {
      this.ServiceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }


  Service_GetServiceLevelList() {
    this._appservice.GetServiceLevelIdentifier(this.selectedServiceTower).subscribe(data => {
      this.ServiceLevelList = data;
    }, error => { this._util.serviceError(error); });
  }


  Service_FMEATaskList() {

    this._appservice.GetFMEATasks(this.selectedServiceTower, this.selectedProcess, this.selectedServiceIdentifier).subscribe(data => {
      this.TaskList = data;


    }, error => { this._util.serviceError(error); });
  }

  Service_GetProcessList() {
    this._appservice.GetProcessAreaByServiceAreaIdNew(this.selectedServiceTower).subscribe(
      (data) => {
        this.ProcessAreaList = data;
      },
      (error) => { this._util.serviceError(error) }
    )
  }

  service_GetProcesses() {
    this._appservice.GetAllProcessesByServiceArea(this.selectedServiceTower).subscribe(data => {
      this.processes = data;
    },
      error => {
        this._util.serviceError(error);
      })
  }

  Service_GetFMEAFailureCategoryList() {
    this._appservice.GetParametersByType('FMEA_FAILURE_CATEGORY').subscribe(data => {
      this.FMEAFailureCategory = data;
    }, error => { this._util.serviceError(error); });
  }


  btnSaveServiceLevel() {

    this._appservice.AddServiceLevelIdentifier(this.ServiceLevelIdentifier, this.ServiceLevelTitle, this.selectedServiceTower).subscribe(data => {

      this.statusMessage = data;
      this.showServiceLevelPopup = false;
      this.Service_GetServiceLevelList();
    },
      (error) => { this._util.serviceError(error) })
  }


  btnSaveTasks() {
    this._appservice.AddFMEATask(this.selectedServiceTower, this.selectedProcess, this.selectedServiceIdentifier, this.TaskTitle, this.selectedTaskCategory.id).subscribe(data => {

      this.statusMessage = data;
      this.showTasksPopup = false;
      alert(this.statusMessage);
      this.Service_FMEATaskList();
    },
      (error) => { this._util.serviceError(error) })
  }

  OnfilterChange() {
    this.service_GetProcesses();
    this.Service_GetServiceLevelList();
  }

  OnProcessChange() {
    this.Service_FMEATaskList();
  }

  OnTaskChange() {
  }

  OnStage2StatusChange() {

    if (this.selectedStage2Status == 1)
      this.TempFMEAStage2List = this.TempFMEAStage2ApplicableList.filter(x => x.fmeA_STATUS_STAGE2 == 1);
    else if (this.selectedStage2Status == 2)
      this.TempFMEAStage2List = this.TempFMEAStage2ApplicableList.filter(x => x.fmeA_STATUS_STAGE2 == 0);
    else
      this.TempFMEAStage2List = this.TempFMEAStage2ApplicableList;


    this.RefreshTableForStage2(this.TempFMEAStage2List);
  }

  closePopup(popupName: string) {
    if (popupName == "ServiceLevel")
      this.showServiceLevelPopup = false;

    if (popupName == "Tasks")
      this.showTasksPopup = false;

    if (popupName == "Rejection")
      this.showRejectionPopup = false;

    if (popupName == "RejectionStage2")
      this.showRejectionPopupStage2 = false;

    if (popupName == "RejectionStage3")
      this.showRejectionPopupStage3 = false;

    if (popupName == "RejectionStage2All")
      this.showRejectionPopupStage2All = false;
  }

  btnCancelServiceLevel() {
    this.showServiceLevelPopup = false;
  }

  btnCancelTasks() {
    this.showTasksPopup = false;
  }


  btnCancelRejectionComments() {
    this.showRejectionPopup = false;
  }

  btnCancelRejectionCommentsStage2() {
    this.showRejectionPopupStage2 = false;
  }

  btnCancelRejectionCommentsStage2All() {
    this.showRejectionPopupStage2All = false;
  }

  btnCancelRejectionCommentsStage3() {
    this.showRejectionPopupStage3 = false;
  }

  EditRow_onClick(row) {
    this.selectedParams = row;
    this.EditMode = true;
  }

  DeleteRow_onClick(row) {
    if (confirm('Are you sure you want to delete FMEA entry?')) {

      this._appservice.deleteFMEADataModel(row.id).subscribe(id => {
        alert("This FMEA entry deleted successfully");
        var index = this.FMEAList.findIndex(x => x.id == id);
        if (index > -1) {
          this.FMEAList = this.FMEAList.splice(index, 1);
          this.RefreshTableForStage1(this.FMEAList);
        }

      },
        (error) => { this._util.serviceError(error) })

      this.RefreshTableForStage1(this.FMEAList);
    }
  }

  UIRender() {
    // if (this.selectedParams.fmeA_STATUS == 1)
    //   this.readOnly = true;
    // else
    //   this.readOnly = false;


    // if (this.selectedParams.id == 0) {
    //   this.disableBtn = false;
    //   this.readOnly = false;
    // }
    // else {
    //   if (this.selectedParams.fmeA_STATUS == 1)
    //     this.disableBtn = true;
    //   else
    //     this.disableBtn = false;
    // }

  }

  SubmitModelForm(form: NgForm) {

    if (!form.valid) {
      alert("Please enter the mandatory fields");
      return;
    }

    this.selectedParams.fmeA_TYPE_ID = this.selectedFMEAType;
    this.selectedParams.servicE_AREA_ID = this.selectedServiceTower;
    this.selectedParams.servicE_LEVEL_IDENTIFIER_ID = this.selectedServiceIdentifier;
    this.selectedParams.procesS_ID = this.selectedProcess;
    this.selectedParams.tasK_ID = this.selectedTask;
    this.isSubmitted = true;

    if (this.selectedParams.id == 0) {
      this._appservice.addFailureModeMaster(this.selectedParams).subscribe(data => {
        alert("Added Successfully");
        this.isSubmitted = false;
        this.selectedParams.id = data.id;
        this.FMEAList.push(this.selectedParams);
        this.RefreshTableForStage1(this.FMEAList);
        this.EditMode = false;
      }, error => {
        if (error.status === 409)
          alert(error.error);
        this._util.serviceError(error);
        this.isSubmitted = false;
      });
    }
    else {
      this._appservice.updateFailureModeMaster(this.selectedParams).subscribe(data => {
        alert("Updated Successfully");
        this.isSubmitted = false;
        var index = this.FMEAList.findIndex(x => x.id == data.id);
        if (index > -1)
          this.FMEAList[index] = data;
        this.RefreshTableForStage1(this.FMEAList);
        this.EditMode = false;
      }, error => {
        if (error.status === 409)
          alert(error.error);
        this._util.serviceError(error);
        this.isSubmitted = false;
      });
    }

  }


  btnAddFMEAData() {

    this.EditMode = true;
    this.selectedParams = new FMEAModel();
    this.selectedParams.id = 0;
  }

  btnCancelFMEAData() {
    this.EditMode = false;

  }

  btnApply() {

    console.log("type", this.selectedFMEAType);
    console.log("tower", this.selectedServiceTower);
    console.log("level", this.selectedServiceIdentifier);
    console.log("process", this.selectedProcess);
    console.log("task", this.selectedTask);

    if (this.selectedFMEAType == undefined || this.selectedServiceTower == undefined || this.selectedServiceIdentifier == undefined || this.selectedProcess == undefined || this.selectedTask == undefined) {
      alert("Please select all filters");
    }
    else {
      this.showData = true;
      this.getFailureModeMasterData();
    }

  }

  setOpened(itemIndex) {
    this.currentlyOpenedItemIndex = itemIndex;
  }

  setClosed(itemIndex) {
    if (this.currentlyOpenedItemIndex === itemIndex) {
      this.currentlyOpenedItemIndex = -1;
    }
  }

  RefreshTableForStage1(data) {
    this.dataSource = new MatTableDataSource<FMEAModel>(data);
    this.dataSource.paginator = this.paginator1;
    this.cdref.detectChanges();
  }

  /// Statge2 functionalies

  RefreshTableForStage2(data) {

    data.forEach(element => {
      if (element.isapplicable == 1) {
        if (element.fmeA_STATUS_STAGE2 == 1)
          element.fmeA_STAGE2_STATUS_DESC = "Approved";
        else if (element.fmeA_STATUS_STAGE2 == 0)
          element.fmeA_STAGE2_STATUS_DESC = "Rejected";
        else
          element.fmeA_STAGE2_STATUS_DESC = "Applicable";

      }
      else
        element.fmeA_STAGE2_STATUS_DESC = "Not Applicable";
    });



    this.dataSourceStage2 = new MatTableDataSource<FMEAStage2Model>(data);
    this.dataSourceStage2.paginator = this.paginator2;
    this.cdref.detectChanges();
  }

  RefreshTableForStage3(data) {
    this.dataSourceStage3 = new MatTableDataSource<FMEAStage3Model>(data);
    this.dataSourceStage3.paginator = this.paginator3;
    this.cdref.detectChanges();
  }

  private refreshTable(dataSrc) {
    // if there's a paginator active we're using it for refresh

    if (dataSrc._paginator == undefined)
      return;

    if (dataSrc._paginator.hasNextPage()) {
      dataSrc._paginator.nextPage();
      dataSrc._paginator.previousPage();
      // in case we're on last page this if will tick
    } else if (dataSrc._paginator.hasPreviousPage()) {
      dataSrc._paginator.previousPage();
      dataSrc._paginator.nextPage();
      // in all other cases including active filter we do it like this
    } else {
      dataSrc.filter = '';
      //dataSrc.filter = dataSrc.filter.nativeElement.value;
    }
  }

  GetRatingFactors(ratingType) {
    this._appservice.GetRatingFactors(ratingType).subscribe(data => {
      this.RatingFactorsList = data;
      this.SEVERITY_RatingFactorsList = this.RatingFactorsList.filter(t => t.ratinG_FACTORS_CATEGORY == "SEVERITY");
      this.OCCURRENCE_RatingFactorsList = this.RatingFactorsList.filter(t => t.ratinG_FACTORS_CATEGORY == "OCCURRENCE");
      this.DETECTION_RatingFactorsList = this.RatingFactorsList.filter(t => t.ratinG_FACTORS_CATEGORY == "DETECTION");

      this.FUTURE_SEVERITY_RatingFactorsList = this.SEVERITY_RatingFactorsList;
      this.FUTURE_OCCURRENCE_RatingFactorsList = this.OCCURRENCE_RatingFactorsList;
      this.FUTURE_DETECTION_RatingFactorsList = this.DETECTION_RatingFactorsList;


    }, error => { this._util.serviceError(error); });
  }

  EditRow_onClickStage2(row) {
    this.selectedParamsStage2 = (JSON.parse(JSON.stringify(row)));

    var SRating = this.SEVERITY_RatingFactorsList.filter(x => x.id == this.selectedParamsStage2.rF_SEVERITY_ID);

    if (SRating.length > 0) {
      if (SRating[0].ratinG_FACTORS_RATING > 8)
        this.isRequired = true;
      else
        this.isRequired = false;
    }

    this.OnfilterChange();
    this.OnProcessChange();
    this.OnTaskChange();
    this.Stage2EditMode = true;

  }

  setRatingFactorsForStage3(rF_OCCURRENCE_ID, rF_SEVERITY_ID, rF_DETECTION_ID) {
    var RatingRow;
    var Rating;

    RatingRow = this.OCCURRENCE_RatingFactorsList.filter(x => x.id == rF_OCCURRENCE_ID);

    if (RatingRow.length > 0)
      Rating = RatingRow[0].ratinG_FACTORS_RATING;

    this.FUTURE_OCCURRENCE_RatingFactorsList = this.OCCURRENCE_RatingFactorsList.filter(x => x.ratinG_FACTORS_RATING < Rating);


    RatingRow = this.SEVERITY_RatingFactorsList.filter(x => x.id == rF_SEVERITY_ID);

    if (RatingRow.length > 0)
      Rating = RatingRow[0].ratinG_FACTORS_RATING;

    this.FUTURE_SEVERITY_RatingFactorsList = this.SEVERITY_RatingFactorsList.filter(x => x.ratinG_FACTORS_RATING < Rating);


    RatingRow = this.DETECTION_RatingFactorsList.filter(x => x.id == rF_DETECTION_ID);

    if (RatingRow.length > 0)
      Rating = RatingRow[0].ratinG_FACTORS_RATING;

    this.FUTURE_DETECTION_RatingFactorsList = this.DETECTION_RatingFactorsList.filter(x => x.ratinG_FACTORS_RATING < Rating);



  }


  EditRow_onClickStage3(row) {
    this.selectedParamsStage3 = (JSON.parse(JSON.stringify(row)));
    this.Stage3EditMode = true;

  }

  btnCancelFMEADataStage2() {
    this.Stage2EditMode = false;
  }


  btnCancelFMEADataStage3() {
    this.Stage3EditMode = false;
  }

  service_GetEmployees() {
    this._appservice.getEmployees(101955).subscribe(data => {
      this.employees = data;
    }, error => { this._util.serviceError(error); });
  }


  SubmitModelFormStage2(form) {

    if (!form.valid) {
      alert("Please enter required fields");
      return;
    }

    if (form.valid) {

      this._appservice.updateFMEADataModelStage2(this.selectedParamsStage2).subscribe(data => {
        this.RefreshTableForStage2(this.FMEAStage2List);
        this.btnApply();
        alert("Stage2 Updated Successfully");

      }, error => {
        if (error.status === 409)
          alert(error.error);
        this._util.serviceError(error);
      });

      this.Stage2EditMode = false;
    }


  }


  SubmitModelFormStage3(form) {
    if (form.valid) {

      this._appservice.updateFMEADataModelStage3(this.selectedParamsStage3).subscribe(data => {
        this.RefreshTableForStage3(this.FMEAStage3List);
        this.btnApply();
        alert("Stage3 Updated Successfully");
      }, error => {
        if (error.status === 409)
          alert(error.error);
        this._util.serviceError(error);
      });

    }
    this.Stage3EditMode = false;
  }


  getSelectedProjectsList(event) {
    this.selectedProj = event;
  }

  service_getPortfolioDetails() {
    this._appservice.GetPortfolioList().subscribe(data => {
      this.portfolioList = data;
    }, error => { this._util.serviceError(error); });
  }




  service_LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList[0];
        this.customerid = this.selectedCustomer.cusT_ID;

      }
    });
  }
  service_LoadCustomerByEmpIdByCustomerId(customerid) {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
        this.customerid = this.selectedCustomer.cusT_ID;
      }
    }, error => { this._util.serviceError(error); });
  }

  UpdateApproval(status) {
    var rejectionComments = "";
    var astatus = "approved";

    if (status != 1) {
      rejectionComments = this.fmea_RejectionComments;
      astatus = "rejected";
    }
    else {
      this.fmea_RejectionComments = "";
    }

    this._appservice.UpdateApproval(this.selectedParams.id, status, this.fmea_RejectionComments).subscribe(data => {

      this.statusMessage = data;
    },
      (error) => { this._util.serviceError(error) });


    alert("This activity is " + astatus + " successfully!");

  }

  UpdateApprovalStage2(status) {
    var rejectionComments = "";
    var astatus = "approved";

    if (status != 1) {
      rejectionComments = this.fmea_RejectionComments_Stage2;
      astatus = "rejected";
    }
    else {
      this.fmea_RejectionComments_Stage2 = "";
    }

    this._appservice.UpdateApprovalStage2(this.selectedParamsStage2.fmeA_DATA_ID, status, this.fmea_RejectionComments_Stage2).subscribe(data => {

      this.statusMessage = data;
    },
      (error) => { this._util.serviceError(error) });


    alert("This activity is " + astatus + " successfully!");

  }

  UpdateApprovalStage3(status) {
    var rejectionComments = "";
    var astatus = "approved";

    if (status != 1) {
      rejectionComments = this.fmea_RejectionComments_Stage3;
      astatus = "rejected";
    }
    else {
      this.fmea_RejectionComments_Stage3 = "";
    }

    this._appservice.UpdateApprovalStage3(this.selectedParamsStage3.fmeA_DATA_ID, status, this.fmea_RejectionComments_Stage3).subscribe(data => {

      this.statusMessage = data;
    },
      (error) => { this._util.serviceError(error) });


    alert("This activity is " + astatus + " successfully!");

  }


  btnReject() {
    this.showRejectionPopup = true;
  }

  btnRejectStage2() {
    this.showRejectionPopupStage2 = true;
  }

  btnRejectStage2All() {
    this.showRejectionPopupStage2All = true;
  }

  btnRejectStage3() {
    this.showRejectionPopupStage3 = true;
  }

  btnApprove() {
    this.fmea_Status = 1;
    this.UpdateApproval(this.fmea_Status);

    this.selectedParamsStage2.fmeA_DATA_ID = this.selectedParams.id;

    this.EditMode = false;
  }

  btnApproveStage2() {
    this.selectedParamsStage2.fmeA_STATUS_STAGE2 = 1;
    this.UpdateApprovalStage2(this.selectedParamsStage2.fmeA_STATUS_STAGE2);
  }

  btnApproveStage3() {
    this.selectedParamsStage3.fmeA_STATUS_STAGE3 = 1;
    this.UpdateApprovalStage3(this.selectedParamsStage3.fmeA_STATUS_STAGE3);
  }

  btnSaveRejectionComments() {
    this.fmea_Status = 0;
    this.UpdateApproval(this.fmea_Status);
    this.showRejectionPopup = false;
    alert("This activity rejected successfully!");
    this.EditMode = false;
  }

  btnSaveRejectionCommentsStage2() {
    this.selectedParamsStage2.fmeA_STATUS_STAGE2 = 0;
    this.UpdateApprovalStage2(this.selectedParamsStage2.fmeA_STATUS_STAGE2);
    this.showRejectionPopupStage2 = false;
    alert("This activity rejected successfully!");
  }

  btnSaveRejectionCommentsStage3() {
    this.selectedParamsStage3.fmeA_STATUS_STAGE3 = 0;
    this.UpdateApprovalStage3(this.selectedParamsStage3.fmeA_STATUS_STAGE3);
    this.showRejectionPopupStage3 = false;
    alert("This activity rejected successfully!");
  }

}
