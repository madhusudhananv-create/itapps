import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../../environments/environment';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';


import {
  RequirementRefModel, Req_CategoryModel, Req_LevelModel, GetRequirementRefModel, ProcessModelList, ProcessAreaModelNew,
  ProcessModelNew, CustomerModel, ServiceAreaModelNew, Project, RequirementModel, Req_StatusModel, Req_Stage_Status_Model
} from './../../../models/requirement-reference.model';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatTableDataSource, MatSort, MatDialog, MatDialogConfig } from '@angular/material';
import { SharedService } from '../../../Shared/shared.service';
import { enumRoles } from '../../../Shared/enum';
import { ProjectsModel } from '../../../models/projects-model';





@Component({
  selector: 'app-requirement-reference',
  templateUrl: './requirement-reference.component.html',
  styleUrls: ['./requirement-reference.component.scss']
})
export class RequirementReferenceComponent implements OnInit {

  editRequirementRef: RequirementRefModel = new RequirementRefModel();
  getRequirementRef: GetRequirementRefModel[];
  showdetails: boolean = true
  categories: Req_CategoryModel[];
  owners: any[];
  levels: Req_LevelModel[];
  categoryId: number;
  processModelList: ProcessModelList[] = [];
  processAreaList: ProcessAreaModelNew[] = [];
  statusList: Req_StatusModel[] = [];
  processList: ProcessModelNew[] = [];
  CustomerList: CustomerModel[] = [];
  serviceAreaList: ServiceAreaModelNew[] = [];
  projectLevelList: Project[];
  genericplaceholder: string;
  reqStages: Req_Stage_Status_Model[] = [];
  dataSource: MatTableDataSource<GetRequirementRefModel>;
  genericlist: any[] = [];
  customer_Project_Name:number;
  projectName:string[];

  date = new Date();
  startdate: Date;
  enddate: Date;
  minDate: Date = new Date();

  Requirementrefinput: RequirementModel = new RequirementModel()

  
  allproj: boolean = false;

  fieldMapDict = {
    1: this.CustomerList,
    2: this.CustomerList,
    3: this.serviceAreaList,
    5: this.processModelList,
    6: this.processAreaList,
    7: this.processList
  }

  placeholderMapDict = {
    1: 'Select Customer',
    2: 'Select Customer',
    3: 'Select Service Level',
    5: 'Select Process Model',
    6: 'Select Process Area',
    7: 'Select Process'
  }

  @Input() input: GetRequirementRefModel[];


  displayedColumns = ['index', 'doc_Req_Reference', 'requirement_Title', 
    'compliance_fulfilment', 'documents_Evidence', 'owner','status', 'action'];


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('TABLE') table: ElementRef;

  emp: any;
  filterCriteria: any;
  projectList: any[];
  customerId: any;
  selectedCust: string;
  req_Id: any;
  
  constructor(private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService,
    private changeDetectorRefs: ChangeDetectorRef, public dialog: MatDialog, private route: ActivatedRoute, private _shared: SharedService) { }
  ngOnInit() {
    this.startdate = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    this.enddate = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);

    this.loadIntitialData();

    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

  }

  readonlymode: boolean = true;
  editmode: boolean = false;
  selectedArray: any[] = [];




  Edit_onClick() {
    this.req_Id='';
    this.reqStages = [];
    this.editRequirementRef = new RequirementRefModel();
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable(this.getRequirementRef);

  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.RefreshTable(this.getRequirementRef);

  }

  printvalue() {
    this.loadIntitialData();
  }

  fillDropDownValues() {
    this.genericlist = this.fieldMapDict[this.editRequirementRef.applicability_Level];
    this.genericplaceholder = this.placeholderMapDict[this.editRequirementRef.applicability_Level];

  }


  getreqApplicabilty(id) {
    let element: Req_LevelModel;
    element = this.levels.find(x => x.id == id);
    if (element != undefined)
      return element.level;
    else
      return "";
  }

  

  EditRow_onClick(element: RequirementRefModel) {
    localStorage.setItem("id",element.id.toString());

     if(element.applicability_Level==2){
         this.editRequirementRef = element;
         this.editRequirementRef.customer=element.customer;
         this.selectedCust =  this.editRequirementRef.customer;
         this.getProjectLevel();

     }
     else{
    this.genericlist = this.fieldMapDict[element.applicability_Level];
    this.editRequirementRef = element;
     }

    this.readonlymode = false;
    this.editmode = true;
    this.getReqStages();
    this.RefreshTable(this.getRequirementRef);

  }
  DeleteRow_onClick(element: RequirementRefModel) {
    if (confirm('Are you sure want to delete?')) {
      this.service_deleteRequirementRef(element);
    }
  }
  
  
  RefreshTable(data) {

    this.dataSource = new MatTableDataSource<GetRequirementRefModel>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
  }

  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId',localStorage.getItem("empid"));
    return headers;
  }

  loadIntitialData() {
    this.emp = localStorage.getItem('empid');

    this.getCategories();
    this.getProcessModelList();
    this.getProcessAreaList();
    this.getProcessList();
    this.GetCustomerList();
    this.getServiceAreaList();
    this.getProjectLevel();
    this.getApplicabilityLevels();
    this.getReqReference();
    this.getOwnersList();
    this.getStatusList();
    this.RefreshTable(this.getRequirementRef);

  }
  getStatusList() {
    this._appservice.getStatusList().subscribe(data => {

      this.statusList = data;
    },
      (error) => { this._util.serviceError(error) });

  }

  getReqStages() {

    this.req_Id=localStorage.getItem('id');
    this._appservice.getReqStages(parseInt(this.req_Id)).subscribe(data => {
      this.reqStages = data;  
    }, 
    error => {
       this._util.serviceError(error); 
      }
    )
  }

  getProcessModelList() {
    this._appservice.getProcessModelList().subscribe(data => {

      this.processModelList = data;
      this.fieldMapDict[5] = this.processModelList;
    },
      (error) => { this._util.serviceError(error) });
  }

  getProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe(data => {

      this.processAreaList = data;
      this.fieldMapDict[6] = this.processAreaList;
    },
      (error) => { this._util.serviceError(error) });
  }

  getProcessList() {
    this._appservice.getProcessList().subscribe(data => {

      this.processList = data;
      this.fieldMapDict[7] = this.processList;
    },
      (error) => { this._util.serviceError(error) });
  }

  GetCustomerList() {
    let empid = localStorage.getItem('empid');
    this._appservice.GetCustomerList(empid, false).subscribe(data => {
      this.CustomerList = data.filter(x => x.cusT_ID == this.customerId);
      
      if(this.CustomerList.length > 0)
      {
        this.selectedCust = this.CustomerList.filter(x => x.cusT_ID == this.customerId)[0].cusT_ID;
        this.getProjectLevel();
      }
      this.CustomerList = data;
      this.fieldMapDict[1] = this.CustomerList;
      this.fieldMapDict[2] = this.CustomerList;
    },
      (error) => { this._util.serviceError(error) });
  }

  getProjectLevel() {
    
    if (this.selectedCust == null || this.selectedCust == undefined)
      return;

    this._appservice.getAllProjectsForCustomer(this.selectedCust).subscribe(data => {
      this.projectList = data;
    }, 
      (err) => { this._util.serviceError(err) })
  }


  
  getServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe(data => {

      this.serviceAreaList = data;
      this.fieldMapDict[3] = this.serviceAreaList;
    },
      (error) => { this._util.serviceError(error) });
  }

  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    this.editRequirementRef.doc_Revision_Date = this._util.setLocaleDate(this.editRequirementRef.doc_Revision_Date);
    this.editRequirementRef.documentTargetDate = this._util.setLocaleDate(this.editRequirementRef.documentTargetDate);
    if (this.editRequirementRef.id === 0 || this.editRequirementRef.id === undefined) {

      this.service_addRequirementRef(this.editRequirementRef);
      this.editmode = false;
      this.readonlymode = true;


    }
    else {
      this.service_updateRequirementRef(this.editRequirementRef);
      this.readonlymode = true;
      this.editmode = false;

    }
    this.editRequirementRef = new RequirementRefModel();
  }

  getOwnersList() {
    this._appservice.GetRiskOwnersList().subscribe(
      data => {
        this.owners = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getCategories() {
    this._appservice.getCategories().subscribe(
      data => {
        this.categories = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getReqReference() {

    this.Requirementrefinput.starT_DATE = this._util.setLocaleDate(this.startdate);
    this.Requirementrefinput.enD_DATE = this._util.setLocaleDate(this.enddate);
    this.Requirementrefinput.customer_Project_Name = this.customer_Project_Name;
    this.Requirementrefinput.projectName = this.projectName;

    this.getRequirementRef = [];
    this._appservice.getReqReference(this.Requirementrefinput).subscribe(
      data => {
        this.getRequirementRef = data;

        this.RefreshTable(this.getRequirementRef);
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getApplicabilityLevels() {
    this._appservice.getApplicabilityLevels().subscribe(
      data => {
        this.levels = data;

      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  
  service_addRequirementRef(requirementRef: RequirementRefModel) {

    requirementRef.created_By = this.emp;


    let apiuri: string = environment.webapiuri + 'AddRequirementRef';
    this._http.post(apiuri, requirementRef, { headers: this.GetAuthHeader() })
      .subscribe(data => {

        this.getReqReference();
        alert("Saved Successfully");


      }, error => { this._util.serviceError(error); });
  }

  service_updateRequirementRef(requirementRef: RequirementRefModel) {
    requirementRef.updated_By = this.emp;
    let apiuri: string = environment.webapiuri + 'UpdateRequirementRef';
    this._http.post(apiuri, requirementRef, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        alert("Updated Successfully");
        this.getReqReference();

      }, error => { this._util.serviceError(error); });
  }

  service_deleteRequirementRef(requirementRef: RequirementRefModel) {

    let apiuri: string = environment.webapiuri + 'DeleteRequirementReference';
    this._http.post(apiuri, requirementRef, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        alert("Deleted Successfully");
        this.getReqReference();

      }, error => { this._util.serviceError(error); });
  }

  Filter_onChange($event) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData();
  }

  filteredData() {
    let tempData: RequirementRefModel[] = [];

    // if(this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0 && this.getRequirementRef != undefined && this.getRequirementRef.length > 0)
    // {
    //   tempData = this.getRequirementRef.filter(x => this._shared.selectedProjects.indexOf(x.pr ) >= 0);
    // }
    // else if(this._shared.selectedProjects == undefined || this._shared.selectedProjects.length == 0)
    // {
    // tempData = this.getRequirementRef;
    // }

    tempData = this._util.ApplyCriteriaRange(this.filterCriteria, this.getRequirementRef);

    this.RefreshTable(tempData);
  }

  onCustomerChange() {
    this.projectList = [];

    this._appservice.GetCustomerProjectsName(this.editRequirementRef.customer, this.allproj).subscribe(
      data => {

        data.forEach(x => {
          let c = new ProjectsModel()
          c.proJ_ID = x.proJ_ID;
          c.proJ_NM = x.proJ_NM
          this.projectList.push(c);
        })
        this.projectList.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);
      },
      (error) => { },
      () => {
        // this.allProjectsSelected.select();
        //  this.toggleProjectSelection();
      }
    )
  }
}
