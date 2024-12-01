import { Component, OnInit, ViewChild } from "@angular/core";
import { ProjectDataConfigurationModel } from '../../../models/project-data-configuration-model';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatOption, MatSelect } from "@angular/material";

import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { ProjectsModel } from "../../../models/projects-model";
import { Router, ActivatedRoute } from "@angular/router";

import { Http, Headers, RequestOptions } from '@angular/http';
import { AccessControl } from "../../../Shared/accessControl";
import { LayoutService } from "../layout.service";
import { enumRoles } from "../../../Shared/enum";
import { ProjectMasterConfigurationModel } from "../../../models/project-master-configuration-model";
import { environment } from "../../../../environments/environment";
import { ApprovalPopupComponent } from "./approval-popup/approval-popup.component";

@Component({
  selector: 'app-project-data-configuration-page',
  templateUrl: './project-data-configuration-page.component.html',
  styleUrls: ['./project-data-configuration-page.component.scss']
})

export class ProjectDataConfigurationComponent implements OnInit {

  dataSource: MatTableDataSource<ProjectDataConfigurationModel>;
  editprojectdata: ProjectDataConfigurationModel = new ProjectDataConfigurationModel();


  displayedColumns = ['index', 'setting_Name', 'settinG_VALUE', 'iS_APPROVED', 'approveD_BY', 'enD_DATE', 'edit'];


  private sub: any;
  input_projectid: string;
  input_customerid: string;
  _loading: boolean = true;
  showdetails: boolean = false;
  minDate = new Date();
  projNames: ProjectsModel[];
  allproj: boolean = false;
  readonlymode: boolean = true;
  editmode: boolean = false;
  empid: string;
  isApprova: boolean = false;
  projSettings: ProjectMasterConfigurationModel[];
  projectConfigurationData: ProjectDataConfigurationModel[];
  modalToggle: boolean = false;
  setting: number;
  isInteger: boolean = false;
  isString: boolean = false;
  isBoolean: boolean = false;
  approvalComments: string;
  showApproval: boolean = false;
  isApprover: boolean = false;
  errorStr: string = "";
  isUpdatedthroughMail: boolean = false;
  congifSettingdId: number[];
  editOnly: boolean = false;
  existSetting: boolean = false;
  settingModel = [];
  approverName: string = "";

  @ViewChild(MatPaginator) tbpaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('allsettingSelected') allsettingSelected: MatOption;
  @ViewChild('selectsetting') selectsetting: MatSelect;


  constructor(private _router: Router, private route: ActivatedRoute, private _http: Http, private _util: myUtility, private _appservice: AppsService, private _access: AccessControl, public _layoutService: LayoutService, public dialog: MatDialog) { }
  ngOnInit() {
    this._access.CheckValidAccess(48);
    let role = localStorage.getItem('role');
    var empId = localStorage.getItem('empid');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.getProjectSettings();
    this.getAllProjectsFromCustomer();

    let approvers = "";
    this._appservice.GetDBConfigValue("PROJECTSETTING_APPROVERS", -1, "").subscribe(e => {
      approvers = e;
      if (e.indexOf(empId) >= 0) {
        this.isApprover = true;
      }
      this.projectConfigurationApproval(approvers, empId);
      this.GetProjectConfigurationData();
    });
  }

  projectConfigurationApproval(approvers, empId) {
    if (this.route.snapshot.url.toString().startsWith("projectdataconfigurationApproval")) { // MailApproval starts
      this.route.params.subscribe(params => {
        const approversArray = approvers.split(','); // Split the approvers string into an array
        //verify if employee can approve
        if (!approversArray.includes(empId)) {
          alert("Sorry! You are not authorized to approve project related settings");
          //redirect to first page
          this._router.navigateByUrl('/newdashboard/custm');
        }
        else {
          this.editprojectdata.cust_Id = params['custid'];
          this.editprojectdata.proj_Id = params['projid'];
          this.editprojectdata.configuration_Setting_Id = Number(params['settingid']);
          this.approvalComments = params['isApproveReject'] == "1" ? "Approved" : "Rejected";
          this.input_projectid = this.editprojectdata.proj_Id;
          this.isUpdatedthroughMail = true;
          if (params['isApproveReject'] == 1) {            
            this.editprojectdata.isMailApproveReject = true;
            this.service_updateProjectData(this.editprojectdata, true, this.isUpdatedthroughMail);// Mail Approval
          }
          else {            
            this.approvalComments = prompt("Please enter rejection comments", "");
            this.editprojectdata.isMailApproveReject = false;
            this.service_updateProjectData(this.editprojectdata, false, this.isUpdatedthroughMail);// Mail reject
          }
        }
        this.GetProjectConfigurationData();
      });
    }
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          this.input_projectid = !this.isUpdatedthroughMail ? this.projNames[0].proJ_ID : this.input_projectid;
          this.onProjectChange();
        }
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  onProjectChange() {
    this.GetProjectConfigurationData();
    this.readonlymode = true;
    this.editmode = false;
  }

  GetProjectConfigurationData() {

    this._loading = true;
    this._appservice.getProjectConfigurationData(this.input_projectid).subscribe(data => {
      this.projectConfigurationData = [];
      this.projectConfigurationData = data;
      this.dataSource = new MatTableDataSource<ProjectDataConfigurationModel>(data);
      this.dataSource.paginator = this.tbpaginator;
      this.dataSource.sort = this.sort;
      this._loading = false;
    },
      error => {
        this._util.serviceError(error);
        this._loading = false;
      }
    )
  }
  getProjectSettings() {
    this.projSettings = [];
    this._appservice.getProjectSettings().subscribe(data => {
      this.projSettings = data;
    },
      error => {
        this._util.serviceError(error);
        this._loading = false;
      })
  }


  getSettingValue(tbdata) {
    var item = this.projSettings.filter(function (item) {
      return item.id == tbdata.configuration_Setting_Id;
    });
    if (item)
      var settingType = item[0].setting_Type;
    if (settingType == 1)
      return tbdata.int_Value;
    else if (settingType == 2)
      return tbdata.string_Value;
    else if (settingType == 3)
      return tbdata.bit_Value ? "Yes" : "No";

  }

  AddNew_onClick() {
    this.settingModel = [];
    this.approverName = '';
    this.editprojectdata = new ProjectDataConfigurationModel();
    this.readonlymode = false;
    this.editmode = true;
    this.editOnly = false;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.editOnly = false;
    this.GetProjectConfigurationData();
    this.editprojectdata = new ProjectDataConfigurationModel();

  }

  SubmitForm(isValid) {
    
    this._loading = true;

    if (!isValid) {
      this._loading = false;
      alert("Please enter required fields");
      return;
    }

    if (this.editprojectdata.id === 0 || this.editprojectdata.id === undefined) {
 
      this.service_addProjectData(this.editprojectdata);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {     
      this.service_updateProjectData(this.editprojectdata, false, false);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.readonlymode = true;
    this.editmode = false;
  }

  service_addProjectData(projData: ProjectDataConfigurationModel) {

    let isSettingAlreadyUsedArray = [];
    this.congifSettingdId.forEach(id => {
      var isAlreadyPresent = this.projectConfigurationData.some(x => x.configuration_Setting_Id === id);
      isSettingAlreadyUsedArray.push(isAlreadyPresent);
    });

    if (isSettingAlreadyUsedArray.includes(true)) {
      this._loading = false;
      var item = [];
      this.congifSettingdId.forEach(id => {
          var filteredSettings = this.projSettings.filter(x => x.id === id);
          var settingTypes = filteredSettings.map(s => s.setting_Type);
          item.push(settingTypes);
      });  
          
      if (!item.every((value, index, array) => JSON.stringify(value) === JSON.stringify(array[0]))) {
          alert('Please select records with the same Configuration Setting.');
          return;
      }    
      const usedSettings = this.projectConfigurationData
        .filter(setting => this.congifSettingdId.includes(setting.configuration_Setting_Id))
        .map(setting => {
          const item = this.projSettings.find(item => item.id === setting.configuration_Setting_Id);
          return item ? item.setting_Name : null;
        });
      alert(`Selected Setting(s) ${usedSettings.join(', ')} is/are already being used for the project`);
      return;
    }



    let projDetails = [];
    projData.cust_Id = this.input_customerid;
    projData.proj_Id = this.input_projectid;
    if (projData.end_date != null)
      projData.end_date = this._util.setLocaleDate(projData.end_date);

    if (this.congifSettingdId) {

      projDetails = this.congifSettingdId.map(id => ({
        configuration_Setting_Id: id,
        cust_Id: projData.cust_Id,
        proj_Id: projData.proj_Id,
        end_date: projData.end_date,
        Bit_Value: projData.bit_Value,
        Int_Value:projData.int_Value,
        String_Value:projData.string_Value,
        comments: projData.comments,
        approved_By: projData.approved_By,
        created_Date:new Date(),
        created_By:localStorage.getItem('empid')
      }));

      // let apiuri: string = environment.webapiuri + 'AddProjectConfigurationData';
      let apiuri: string = environment.webapiuri + 'AddProjectConfigurationDataMultiple';
      this._http.post(apiuri, projDetails, { headers: this.GetAuthHeaderForProjectData() })
        .subscribe(data => {
          alert("Record Added Successfully");
          this.GetProjectConfigurationData();
          this.dataSource.paginator = this.tbpaginator;
          this.dataSource.sort = this.sort;
          this._loading = false;
        }, error => { this._util.serviceError(error); this._loading = false; });
    }
  }

  service_updateProjectData(projData, isapproval, isUpdatedthroughMail) {    
    if (!isUpdatedthroughMail) {
      var item = this.projSettings.filter(x => x.id == projData.configuration_Setting_Id);
      this.setting = item[0].setting_Type;
      projData.iS_APPROVAL = isapproval;
      projData.approval_Comments = this.approvalComments;
      if (projData.end_date != null)
        projData.end_date = this._util.setLocaleDate(projData.end_date);
    }
    else {
      projData.approval_Comments = this.approvalComments;
      projData.iS_APPROVAL = isapproval;
      projData.Is_Approved = isapproval;
	  projData.Bit_Value = true;
    }
    let apiuri: string = environment.webapiuri + 'UpdateProjectConfigurationData';
    this._http.post(apiuri, projData, { headers: this.GetAuthHeaderForProjectData() })
      .subscribe(data => {
        if (!isUpdatedthroughMail) {
          alert("Record Updated Successfully");
          this.approvalComments = "";
          this._loading = false;
        }
        else {
          this.approvalComments = "";
          this.isUpdatedthroughMail = false;
        }
        this.GetProjectConfigurationData();
      }, error => {
        this._util.serviceError(error);
        this._loading = false;
        if (isUpdatedthroughMail) {

          this.errorStr = error._body;
          alert(this.errorStr);
          this.errorStr = '';
          this.isUpdatedthroughMail = false;
        }
      });
  }

  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem('empid'))
    return headers;
  }

  GetAuthHeaderForProjectData() {

    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem('empid'))
    return headers;
  }

  EditRow_onClick(element) {

    this.showApproval = !element.is_Approved;
    this.readonlymode = false;
    this.editmode = true;
    this.editOnly = true;
    var item = this.projSettings.filter(x => x.id == element.configuration_Setting_Id);
    this.settingModel = item.map(option => option.id);

    var settingtype = item[0].setting_Type;

    this.editprojectdata.id = element.id;
    this.editprojectdata.cust_Id = element.cust_Id;
    this.editprojectdata.proj_Id = element.proj_Id;
  
    this.editprojectdata.configuration_Setting_Id = element.configuration_Setting_Id;
    this.editprojectdata.is_Approved = element.is_Approved;
    this.editprojectdata.comments = element.comments;
    this.editprojectdata.approved_By = element.approved_By;
    this.getEmployeeName(element.approved_By);
    this.editprojectdata.approval_Comments = element.approval_Comments;
    this.editprojectdata.end_date = element.end_date;
    this.editprojectdata.isActive = element.isActive;
    this.editprojectdata.created_By = element.created_By;
    this.editprojectdata.created_Date = element.created_Date;
    this.editprojectdata.updated_Date = element.updated_Date;
    this.editprojectdata.updated_By = element.updated_By;
    if (settingtype == 1) {
      this.editprojectdata.int_Value = element.int_Value;
      this.isInteger = true;
      this.isBoolean = false;
      this.isString = false;
    }
    else if (settingtype == 2) {
      this.editprojectdata.string_Value = element.string_Value;
      this.isInteger = false;
      this.isBoolean = false;
      this.isString = true;
    }
    else if (settingtype == 3) {
      this.editprojectdata.bit_Value = element.bit_Value;
      if(element.bit_Value == null)
        {
          this.editprojectdata.bit_Value = false;
        }
      this.isInteger = false;
      this.isBoolean = true;
      this.isString = false;
      
    }
    
  }
  getEmployeeName(approved_By) {
    this._appservice.getEmpNameById(approved_By).subscribe(data => {
      if (data == "null") {
        this.approverName = '';
      }
      else {
        this.approverName = data;
      }

    })
  }
  getSettingName(settingId) {
    var item = this.projSettings.filter(function (item) {
      return item.id == settingId;
    });
    if (item)
      return item[0].setting_Name;
  }

  modalOpen() {
    this.modalToggle = true;
  }
  getisApproved(isApproved: boolean) {
    return isApproved ? "Yes" : "No";
  }
  onSettingChange(settingIds) {
    this.congifSettingdId = settingIds;

    var item = this.projSettings.filter(function (item) {
      return item.id == settingIds;
    });
    if (item.length > 0)
      var settingType: number = item[0].setting_Type;

    if (settingType == 1) {
      this.isInteger = true;
      this.isString = false;
      this.isBoolean = false;
    }
    else if (settingType == 2) {
      this.isInteger = false;
      this.isString = true;
      this.isBoolean = false;
    }
    else if (settingType == 3) {
      this.isInteger = false;
      this.isString = false;
      this.isBoolean = true;
    }
  }
  opendialog() {
    const dialogRef = this.dialog.open(ApprovalPopupComponent);
    dialogRef.afterClosed().subscribe(result => {
      this.approvalComments = result.data;
      this.editprojectdata.is_Approved = result.approved;
      this.editprojectdata.approval_Comments = result.data;      
      this.service_updateProjectData(this.editprojectdata, true, false);
      this.readonlymode = true;
      this.editmode = false;
      this.editOnly = false;
    })
  }

  toggleSelection() {
    if (this.allsettingSelected.selected) {
      this.selectsetting.options.forEach((item: MatOption) => item.select());
    } else {
      this.selectsetting.options.forEach((item: MatOption) => item.deselect());
    }
  }
  TosslePerOne() {
    if (this.allsettingSelected.selected) {
      this.allsettingSelected.deselect();
    }
    let count = 0;
    this.selectsetting.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.projSettings.length == count)
      this.allsettingSelected.select();
  }
}

