// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FMEAModel, ServiceLevelIdentifier, ProcessAreaModelNew, ServiceAreaModelNew, FMEAStage2Model, FMEARatingFactorsModel } from '../../../models/fmea-model';
// import { AppsService } from '../../../Services/apps.service';
// import { myUtility } from '../../../Shared/myUtility';
// import { ActivatedRoute } from '@angular/router';
// import { LayoutService } from '../layout.service';
// import { ParameterModel } from '../../../models/parameter-model';
// import { MatFormFieldModule, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { EmpInfoModel } from '../../../models/emp-info-model';
// import { PortfolioProjectSelectorComponent } from '../../../controls/portfolio-project-selector/portfolio-project-selector.component';
// import { PortfolioModel, ProjectModelNew } from '../../../models/portfolio-model';
// import { CustomerModel } from '../../../models/customer-model';
// import { SharedService } from '../../../Shared/shared.service';

// @Component({
//   selector: 'app-fmea-page',
//   templateUrl: './fmea-page.component.html',
//   styleUrls: ['./fmea-page.component.scss'],
//   providers: [PortfolioProjectSelectorComponent]
// })
// export class FMEAPageComponent implements OnInit {

//   selectedFMEAType: number;
//   selectedServiceTower: number;
//   selectedServiceIdentifier: number;
//   selectedProcess: number;
//   selectedTask: number;

//   firstFormGroup: FormGroup;
//   secondFormGroup: FormGroup;
//   thirdFormGroup: FormGroup;

//   Stage1EditMode: Boolean = false;
//   Stage1ReadOnlyMode: Boolean = false;
//   Stage2EditMode: Boolean = false;

//   isOpen: Boolean;
//   currentlyOpenedItemIndex: number = -1;

//   FMEAList: FMEAModel[] = [];


//   FMEAActivitiyList: FMEAModel[] = [];
//   FMEAListByTask: FMEAModel[] = [];
//   ActivitiesList;
//   ActivitiesListStage2;
//   result: any;


//   FMEA = new FMEAModel();
//   //dataSource : MatTableDataSource<FMEAModel>;
//   dataSource = new MatTableDataSource(this.FMEAList);
//   //dataSource : MatTableDataSource<FMEAModel>;
//   //dataSource = new MatTableDataSource<FMEAModel>([]);

//   //dataSource = new MatTableDataSource(this.result);

//   FMEAStage2List: FMEAStage2Model[] = [];
//   dataSourceStage2 = new MatTableDataSource(this.FMEAStage2List);

//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   @ViewChild(MatSort) sort: MatSort;
//   @ViewChild(MatSort) set content(sort: MatSort) {
//     this.dataSource.sort = sort;
//   }

//   selectedParams: FMEAModel = new FMEAModel();

//   selectedParamsStage2: FMEAStage2Model = new FMEAStage2Model();



//   ServiceAreaList: ServiceAreaModelNew[] = [];
//   selectedServiceArea = new ServiceAreaModelNew();

//   selectedProcessArea = new ProcessAreaModelNew();

//   ProcessAreaList: ProcessAreaModelNew[] = [];
//   FMEATypeList: ParameterModel[] = [];
//   TaskCategoryList: ParameterModel[] = [];
//   PotentialCauseFactorList: ParameterModel[] = [];

//   ServiceLevelList = [];
//   TaskList = [];
//   selectedTaskCategory = new ParameterModel()

//   selectedServiceLevel = new ServiceLevelIdentifier();

//   title: string;
//   description: string;
//   private sub: any;
//   CUST_ID: string;

//   ServiceLevelIdentifier: string;
//   ServiceLevelTitle: string;
//   //selectedServiceArea : string;
//   statusMessage: string;

//   TaskTitle: string;


//   showServiceLevelPopup: boolean = false;
//   showTasksPopup: boolean = false;
//   showRejectionPopup: boolean = false;

//   displayedColumns: string[] = ['index', 'functioN_ACTIVITIES', 'potentiaL_FAILURE_MODE', 'potentiaL_FAILURE_EFFECT', 'potentiaL_CAUSE', 'potentiaL_CAUSE_FACTOR_OPTIONS', 'edit'];
//   displayedColumnsStage2: string[] = ['index', 'functioN_ACTIVITIES', 'occurrencE_RATING', 'severitY_RATING', 'detectioN_RATING', 'rpn', 'edit'];

//   RatingFactorsList: FMEARatingFactorsModel[] = [];
//   SEVERITY_RatingFactorsList: FMEARatingFactorsModel[] = [];
//   OCCURRENCE_RatingFactorsList: FMEARatingFactorsModel[] = [];
//   DETECTION_RatingFactorsList: FMEARatingFactorsModel[] = [];

//   fmea_Status: number;
//   fmea_RejectionComments: string;


//   maxValue: Date;
//   employees: EmpInfoModel[] = [];

//   customerid: string;
//   reset: boolean = false;
//   portfolioList: PortfolioModel[] = []
//   customerList: CustomerModel[] = [];
//   selectedCustomer: CustomerModel;
//   portArray: number[] = [];
//   selectedProj: string

//   disableBtn: boolean;
//   menuToggleStatus: boolean;

//   constructor(public _layoutService: LayoutService, private route: ActivatedRoute, private _util: myUtility, private _appservice: AppsService, private _formBuilder: FormBuilder, private _shared: SharedService) { }

//   onMenuToggleChange(value: boolean) {
//     this.menuToggleStatus = value;
//   }

//   ngOnInit() {



//     this.sub = this.route.params.subscribe(params => {
//       this.CUST_ID = params['custid'];


//       this._layoutService.selectedCust = this.CUST_ID;
//       this.Service_GetFMEATypeList();
//       this.Service_GetTaskCategory();
//       this.Service_GetServiceAreaList();
//       //this.Service_GetServiceLevelList();

//       //this.getFMEAData();
//       this.Service_GetPotentialCauseFactor();

//     });

//     this.firstFormGroup = this._formBuilder.group({
//       firstCtrl: ['', Validators.required]
//     });
//     this.secondFormGroup = this._formBuilder.group({
//       secondCtrl: ['', Validators.required]
//     });

//     this.thirdFormGroup = this._formBuilder.group({
//       thirdCtrl: ['', Validators.required]
//     });

//     //this.getFMEAData();

//     this.GetRatingFactors("All");
//     this.service_GetEmployees();

//     // Loding Customer Details


//     //  this.sub = this.route.params.subscribe(params => {
//     //   this.customerid = this.CUST_ID;
//     //   this.reset = params['reset'];
//     // });


//     // this.customerid = this.CUST_ID;
//     // console.log(this.customerid);


//     // if (this.reset == undefined)
//     //   this.reset = true;
//     //this.startTimer();
//     //Customer's main page,  


//     // this.service_getPortfolioDetails();
//     // if (this.customerid == undefined && this.selectedCustomer == undefined) {
//     //   this.service_LoadCustomerByEmpId();
//     // } //Employee clicked customer card and got redirected to Customer Dashboard Page 
//     // else if (this.customerid != undefined) {
//     //   this.service_LoadCustomerByEmpIdByCustomerId(this.customerid);
//     // }

//     // End  - Loding Customer Details

//   }





//   getFMEAData() {
//     //this._appservice.GetFMEADATA(this.selectedFMEAType, this.selectedServiceTower,this.selectedProcess,this.selectedServiceIdentifier,this.selectedTask).subscribe(data => {

//     this._appservice.GetFMEADATA(155, 5, 25, 6, 4).subscribe(data => {

//       this.FMEAList = data;

//       // var taskItem = this.TaskList.filter(x => x.id === this.selectedTask);

//       // var taskCategoryItem = this.TaskCategoryList.filter(x => x.id === 157)


//       //this.dataSource = new MatTableDataSource(this.FMEAList);
//       //this.ActivitiesList = this.FMEAList.map(t=> t.functioN_ACTIVITIES).sort();
//       const Activities = new Set(this.FMEAList.map(t => t.tasK_CATEGORY));
//       if (Activities.size > 0)
//         this.ActivitiesList = Activities;
//       else
//         this.ActivitiesList = ["New Category"];

//       this.RefreshTableForStage1(this.FMEAList);

//     }, error => { this._util.serviceError(error); });

//     //GetFMEADATAStage2

//     this.getFMEADataStage2();


//   }

//   getFMEADataStage2() {
//     //changes**

//     if (this.selectedFMEAType == undefined || this.selectedServiceTower == undefined || this.selectedProcess == undefined || this.selectedServiceIdentifier == undefined || this.selectedTask == undefined)
//       return;

//     this._appservice.GetFMEADATAStage2(this.selectedFMEAType, this.selectedServiceTower, this.selectedProcess, this.selectedServiceIdentifier, this.selectedTask).subscribe(data => {
//       this.FMEAStage2List = data;

//       const Activities = new Set(this.FMEAList.map(t => t.tasK_CATEGORY));
//       if (Activities.size > 0)
//         this.ActivitiesListStage2 = Activities;
//       else
//         this.ActivitiesListStage2 = ["New Category"];

//       this.RefreshTableForStage2(this.FMEAStage2List);

//     }, error => { this._util.serviceError(error); });

//   }


//   getFMEADataByActivities(activity) {

//     let FMEAActivitiyList1: FMEAModel[] = [];


//     for (let item of this.FMEAList) {
//       if (item.tasK_CATEGORY === activity) {
//         FMEAActivitiyList1.push(item);
//       }
//     }

//     // this.FMEAList.forEach((element, index) => {

//     // if (element.tasK_CATEGORY === activity)      

//     //   }); 



//     //this.dataSource = new MatTableDataSource(FMEAActivitiyList1);
//     this.FMEAListByTask = FMEAActivitiyList1;

//     return FMEAActivitiyList1;

//   }




//   Service_GetPotentialCauseFactor() {
//     this._appservice.GetParametersByType('POTENTIAL_CAUSE_FACTOR').subscribe(data => {
//       this.PotentialCauseFactorList = data;
//     }, error => { this._util.serviceError(error); });
//   }



//   Service_GetFMEATypeList() {
//     this._appservice.GetParametersByType('FMEA_TYPE').subscribe(data => {

//       this.FMEATypeList = data;
//       this.FMEATypeList.sort((a, b) => (a.options > b.options) ? 1 : ((b.options > a.options) ? -1 : 0));

//     }, error => { this._util.serviceError(error); });
//   }


//   Service_GetTaskCategory() {
//     this._appservice.GetParametersByType('TASK_CATEGORY').subscribe(data => {
//       this.TaskCategoryList = data;
//     }, error => { this._util.serviceError(error); });
//   }

//   Service_GetServiceAreaList() {
//     this._appservice.getServiceAreaList().subscribe(data => {

//       this.ServiceAreaList = data;
//       this.ServiceAreaList.sort((a, b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));

//     }, error => { this._util.serviceError(error); });
//   }


//   Service_GetServiceLevelList() {
//     this._appservice.GetServiceLevelIdentifier(this.selectedServiceTower).subscribe(data => {
//       this.ServiceLevelList = data;
//     }, error => { this._util.serviceError(error); });
//   }


//   Service_FMEATaskList() {
//     // Changes**

//     if (this.selectedServiceTower == undefined || this.selectedProcess == undefined || this.selectedServiceIdentifier == undefined)
//       return;

//     this._appservice.GetFMEATasks(this.selectedServiceTower, this.selectedProcess, this.selectedServiceIdentifier).subscribe(data => {
//       this.TaskList = data;


//     }, error => { this._util.serviceError(error); });


//   }

//   Service_GetProcessList() {
//     this._appservice.GetProcessAreaByServiceAreaIdNew(this.selectedServiceTower).subscribe(
//       (data) => {
//         this.ProcessAreaList = data;
//       },
//       (error) => { this._util.serviceError(error) }
//     )
//   }


//   btnSaveServiceLevel() {

//     if (this.ServiceLevelIdentifier == undefined || this.ServiceLevelTitle == undefined || this.selectedServiceTower == undefined)
//       return;
//     this._appservice.AddServiceLevelIdentifier(this.ServiceLevelIdentifier, this.ServiceLevelTitle, this.selectedServiceTower).subscribe(data => {

//       this.statusMessage = data;
//       this.showServiceLevelPopup = false;
//       this.Service_GetServiceLevelList();
//     },
//       (error) => { this._util.serviceError(error) })
//   }


//   btnSaveTasks() {

//     if (this.selectedServiceTower == undefined || this.selectedProcess == undefined || this.selectedServiceIdentifier == undefined || this.TaskTitle == undefined || this.selectedTaskCategory.id == undefined)
//       return;
//     this._appservice.AddFMEATask(this.selectedServiceTower, this.selectedProcess, this.selectedServiceIdentifier, this.TaskTitle, this.selectedTaskCategory.id).subscribe(data => {

//       this.statusMessage = data;
//       this.showTasksPopup = false;
//       alert(this.statusMessage);
//       this.Service_FMEATaskList();
//     },
//       (error) => { this._util.serviceError(error) })
//   }

//   OnfilterChange() {
//     this.Service_GetProcessList();
//     this.Service_GetServiceLevelList();
//   }

//   OnProcessChange() {
//     this.Service_FMEATaskList();
//   }


//   OnServiceLevelChange() {

//   }

//   OnTaskChange() {

//   }

//   closePopup(popupName: string) {
//     if (popupName == "ServiceLevel")
//       this.showServiceLevelPopup = false;

//     if (popupName == "Tasks")
//       this.showTasksPopup = false;

//     if (popupName == "Rejection")
//       this.showRejectionPopup = false;
//   }

//   btnCancelServiceLevel() {
//     this.showServiceLevelPopup = false;
//   }

//   btnCancelTasks() {
//     this.showTasksPopup = false;
//   }


//   btnCancelRejectionComments() {
//     this.showRejectionPopup = false;
//   }



//   EditRow_onClick(row) {
//     this.selectedParams = (JSON.parse(JSON.stringify(row)));
//     // console.log(this.selectedParams);
//     this.OnfilterChange();
//     this.OnProcessChange();
//     this.OnTaskChange();
//     this.Stage1EditMode = true;



//     if (this.selectedParams.fmeA_STATUS == 1)
//       this.Stage1ReadOnlyMode = true;
//     else
//       this.Stage1ReadOnlyMode = false;


//     if (this.selectedParams.id == 0)
//       this.disableBtn = false;
//     else {
//       if (this.selectedParams.fmeA_STATUS == 1)
//         this.disableBtn = true;
//       else
//         this.disableBtn = false;
//     }


//   }

//   SubmitModelForm(form) {
//     if (form.valid) {

//       this.selectedParams.fmeA_TYPE_ID = this.selectedFMEAType;
//       this.selectedParams.servicE_AREA_ID = this.selectedServiceTower;
//       this.selectedParams.servicE_LEVEL_IDENTIFIER_ID = this.selectedServiceIdentifier;
//       this.selectedParams.procesS_ID = this.selectedProcess;
//       this.selectedParams.tasK_ID = this.selectedTask;
//       this.selectedParams.fmeA_STATUS = 0;

//       this.selectedParams.cusT_ID = this.CUST_ID;
//       this.selectedParams.proJ_ID = this.selectedProj;


//       if (this.selectedParams.id == 0) {
//         this._appservice.addFMEADataModel(this.selectedParams).subscribe(data => {
//           //this.FMEAList = data;
//           //this.dataSource.push(data)
//           //this.LoadData()
//           //this.getFMEAData();
//           this.btnApply();
//           alert("Added Successfully");
//         }, error => {
//           if (error.status === 409)
//             alert(error.error);
//           this._util.serviceError(error);
//         });
//       }
//       else {
//         this._appservice.updateFMEADataModel(this.selectedParams).subscribe(data => {
//           //this.modelList.push(data)
//           //this.LoadData()
//           //this.FMEAList = data;
//           this.btnApply();
//           alert("Updated Successfully");
//         }, error => {
//           if (error.status === 409)
//             alert(error.error);
//           this._util.serviceError(error);
//         });
//       }

//       this.Stage1EditMode = false;


//     }
//     else {
//       alert("Please enter the mandatory fields")
//     }
//   }

//   ClearInputs() {
//     this.selectedParams = new FMEAModel();
//     this.selectedParams.id = 0;
//   }

//   btnAddFMEAData() {
//     this.Stage1EditMode = true;
//     this.ClearInputs();
//   }

//   btnCancelFMEAData() {
//     this.Stage1EditMode = false;
//   }

//   btnApply() {
//     this.getFMEAData();
//     //  Changes**
//   }


//   setOpened(itemIndex) {
//     this.currentlyOpenedItemIndex = itemIndex;
//   }

//   setClosed(itemIndex) {
//     if (this.currentlyOpenedItemIndex === itemIndex) {
//       this.currentlyOpenedItemIndex = -1;
//     }
//   }

//   RefreshTableForStage1(data) {
//     this.dataSource = new MatTableDataSource(data);
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort = this.sort;
//   }



//   /// Statge2 functionalies

//   RefreshTableForStage2(data) {
//     this.dataSourceStage2 = new MatTableDataSource(data);
//     this.dataSourceStage2.paginator = this.paginator;
//     this.dataSourceStage2.sort = this.sort;
//   }

//   GetRatingFactors(ratingType) {
//     this._appservice.GetRatingFactors(ratingType).subscribe(data => {
//       this.RatingFactorsList = data;
//       this.SEVERITY_RatingFactorsList = this.RatingFactorsList.filter(t => t.ratinG_FACTORS_CATEGORY == "SEVERITY");
//       this.OCCURRENCE_RatingFactorsList = this.RatingFactorsList.filter(t => t.ratinG_FACTORS_CATEGORY == "OCCURRENCE");
//       this.DETECTION_RatingFactorsList = this.RatingFactorsList.filter(t => t.ratinG_FACTORS_CATEGORY == "DETECTION");

//     }, error => { this._util.serviceError(error); });
//   }

//   EditRow_onClickStage2(row) {
//     this.selectedParamsStage2 = (JSON.parse(JSON.stringify(row)));
//     this.OnfilterChange();
//     this.OnProcessChange();
//     this.OnTaskChange();
//     this.Stage2EditMode = true;

//   }

//   btnCancelFMEADataStage2() {
//     this.Stage2EditMode = false;
//   }

//   service_GetEmployees() {
//     this._appservice.getEmployees(101955).subscribe(data => {
//       this.employees = data;
//     }, error => { this._util.serviceError(error); });
//   }


//   SubmitModelFormStage2(form) {
//     if (form.valid) {

//       this.selectedParamsStage2.rpn = 302.25;
//       this._appservice.updateFMEADataModel(this.selectedParamsStage2).subscribe(data => {
//         alert("Stage2 Updated Successfully");
//       }, error => {
//         if (error.status === 409)
//           alert(error.error);
//         this._util.serviceError(error);
//       });

//     }

//     this.Stage2EditMode = false;

//   }

//   getSelectedProjectsList(event) {
//     this.selectedProj = event;
//     // console.log(this.selectedProj);
//   }

//   service_getPortfolioDetails() {
//     this._appservice.GetPortfolioList().subscribe(data => {
//       this.portfolioList = data;
//     }, error => { this._util.serviceError(error); });
//   }


//   ngAfterViewInit() {
//     // if(this._shared.selectedPortfolios != undefined && this._shared.selectedPortfolios.length > 0)
//     //   this.portArray = this._shared.selectedPortfolios;

//     // if(this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0)
//     //   this.projArray = this._shared.selectedProjects; 
//   }

//   service_LoadCustomerByEmpId() {
//     this._appservice.GetCustomerList(localStorage.getItem('empid')).subscribe(data => {
//       this.customerList = data;
//       if (this.customerList.length > 0) {
//         this.selectedCustomer = this.customerList[0];
//         this.customerid = this.selectedCustomer.cusT_ID;

//       }
//     });
//   }
//   service_LoadCustomerByEmpIdByCustomerId(customerid) {
//     this._appservice.GetCustomerList(localStorage.getItem('empid')).subscribe(data => {
//       this.customerList = data;
//       if (this.customerList.length > 0) {
//         this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
//         this.customerid = this.selectedCustomer.cusT_ID;


//       }
//     }, error => { this._util.serviceError(error); });
//   }

//   UpdateApproval(status) {


//     var rejectionComments = "";
//     var astatus = "approved";

//     if (status != 1) {
//       rejectionComments = this.fmea_RejectionComments;
//       astatus = "rejected";
//     }

//     this._appservice.UpdateApproval(this.selectedParams.id, status, this.fmea_RejectionComments).subscribe(data => {

//       this.statusMessage = data;
//     },
//       (error) => { this._util.serviceError(error) });


//     alert("This activity is " + astatus + " successfully!");

//   }


//   btnReject() {
//     this.showRejectionPopup = true;
//   }

//   btnApprove() {
//     this.fmea_Status = 1;
//     this.UpdateApproval(this.fmea_Status);

//     this.selectedParamsStage2.fmeA_DATA_ID = this.selectedParams.id;

//     this._appservice.AddFMEADataStage2Model(this.selectedParamsStage2).subscribe(data => {
//       //this.statusMessage = data;              
//     },
//       (error) => { this._util.serviceError(error) });

//     this.Stage1EditMode = false;

//   }


//   btnSaveRejectionComments() {
//     this.fmea_Status = 0;
//     this.UpdateApproval(this.fmea_Status);
//     this.showRejectionPopup = false;
//     alert("This activity rejected successfully!");
//     this.Stage1EditMode = false;
//   }


// }



