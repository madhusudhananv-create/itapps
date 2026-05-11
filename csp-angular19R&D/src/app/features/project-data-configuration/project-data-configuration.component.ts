import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

import { ProjectDataConfigurationModel } from '../../models/project-data-configuration-model';
import { ProjectMasterConfigurationModel } from '../../models/project-master-configuration-model';
import { ProjectsModel } from '../../models/projects-model';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { enumRoles } from '../../shared/enum';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-project-data-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatRadioModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatButtonModule,
    RouterModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './project-data-configuration.component.html',
  styleUrl: './project-data-configuration.component.scss'
})
export class ProjectDataConfigurationComponent implements OnInit {
  // Inject services
  private _router = inject(Router);
  private route = inject(ActivatedRoute);
  private _appservice = inject(AppsService);
  private _util = inject(MyUtility);
  private _access = inject(AccessControl);
  public _layoutService = inject(LayoutService);
  public dialog = inject(MatDialog);
  private http = inject(HttpClient);
  private _snackBar = inject(MatSnackBar);

  // Approval dialog state (replaces prompt())
  showApprovalDialog: boolean = false;
  approvalDialogComments: string = '';
  pendingApprovalReject: boolean = false;

  // Table data
  dataSource!: MatTableDataSource<ProjectDataConfigurationModel>;
  editprojectdata: ProjectDataConfigurationModel = new ProjectDataConfigurationModel();
  displayedColumns = ['index', 'setting_Name', 'settinG_VALUE', 'iS_APPROVED', 'approveD_BY', 'enD_DATE', 'edit'];

  // Component properties
  private sub: any;
  input_projectid: string = '';
  input_customerid: string = '';
  _loading: boolean = true;
  showdetails: boolean = false;
  minDate = new Date();
  projNames: ProjectsModel[] = [];
  allproj: boolean = false;
  readonlymode: boolean = true;
  editmode: boolean = false;
  empid: string = '';
  isApprova: boolean = false;
  projSettings: ProjectMasterConfigurationModel[] = [];
  projectConfigurationData: ProjectDataConfigurationModel[] = [];
  modalToggle: boolean = false;
  setting: number = 0;
  isInteger: boolean = false;
  isString: boolean = false;
  isBoolean: boolean = false;
  approvalComments: string = '';
  showApproval: boolean = false;
  isApprover: boolean = false;
  errorStr: string = '';
  isUpdatedthroughMail: boolean = false;
  congifSettingdId: number[] = [];
  editOnly: boolean = false;
  existSetting: boolean = false;
  settingModel: number[] = [];
  approverName: string = '';

  @ViewChild(MatPaginator) tbpaginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('allsettingSelected') allsettingSelected!: MatOption;
  @ViewChild('selectsetting') selectsetting!: MatSelect;

  ngOnInit() {
    // this._access.CheckValidAccess(48);
    const role = localStorage.getItem('role');
    const empId = localStorage.getItem('empid') || '';
    this.empid = empId;

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString()) {
      this.allproj = true;
    }

    this.sub = this.route.params.subscribe((params: any) => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.getProjectSettings();
    this.getAllProjectsFromCustomer();

    let approvers = '';
    this._appservice.GetDBConfigValue('PROJECTSETTING_APPROVERS', -1, '').subscribe((e: any) => {
      approvers = e;
      if (e.indexOf(empId) >= 0) {
        this.isApprover = true;
      }
      this.projectConfigurationApproval(approvers, empId);
      this.GetProjectConfigurationData();
    });
  }

  projectConfigurationApproval(approvers: string, empId: string) {
    if (this.route.snapshot.url.toString().startsWith('projectdataconfigurationApproval')) {
      this.route.params.subscribe((params: any) => {
        const approversArray = approvers.split(',');
        
        if (!approversArray.includes(empId)) {
          this.showToast('Sorry! You are not authorized to approve project related settings', 'warn');
          this._router.navigateByUrl('/newdashboard/custm');
        } else {
          this.editprojectdata.cust_Id = params['custid'];
          this.editprojectdata.proj_Id = params['projid'];
          this.editprojectdata.configuration_Setting_Id = Number(params['settingid']);
          this.approvalComments = params['isApproveReject'] == '1' ? 'Approved' : 'Rejected';
          this.input_projectid = this.editprojectdata.proj_Id;
          this.isUpdatedthroughMail = true;
          
          if (params['isApproveReject'] == 1) {
            this.editprojectdata.isMailApproveReject = true;
            this.service_updateProjectData(this.editprojectdata, true, this.isUpdatedthroughMail);
          } else {
            // Use inline approval dialog instead of prompt()
            this.pendingApprovalReject = true;
            this.showApprovalDialog = true;
            this.approvalDialogComments = '';
            // service_updateProjectData will be called from confirmRejectComments()
            this.editprojectdata.isMailApproveReject = false;
          }
        }
        this.GetProjectConfigurationData();
      });
    }
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      (data: any) => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          this.input_projectid = !this.isUpdatedthroughMail ? this.projNames[0].proJ_ID : this.input_projectid;
          this.onProjectChange();
        }
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  onProjectChange() {
    this.GetProjectConfigurationData();
    this.readonlymode = true;
    this.editmode = false;
  }

  GetProjectConfigurationData() {
    this._loading = true;
    this._appservice.getProjectConfigurationData(this.input_projectid).subscribe(
      (data: any) => {
        this.projectConfigurationData = [];
        this.projectConfigurationData = data;
        this.dataSource = new MatTableDataSource<ProjectDataConfigurationModel>(data);
        this.dataSource.paginator = this.tbpaginator;
        this.dataSource.sort = this.sort;
        this._loading = false;
      },
      (error: any) => {
        this._util.serviceError(error);
        this._loading = false;
      }
    );
  }

  getProjectSettings() {
    this.projSettings = [];
    this._appservice.getProjectSettings().subscribe(
      (data: any) => {
        this.projSettings = data;
      },
      (error: any) => {
        this._util.serviceError(error);
        this._loading = false;
      }
    );
  }

  getSettingValue(tbdata: ProjectDataConfigurationModel) {
    const item = this.projSettings.filter((item: any) => {
      return item.id == tbdata.configuration_Setting_Id;
    });
    if (item && item.length > 0) {
      const settingType = item[0].setting_Type;
      if (settingType == 1) return tbdata.int_Value;
      else if (settingType == 2) return tbdata.string_Value;
      else if (settingType == 3) return tbdata.bit_Value ? 'Yes' : 'No';
    }
    return '';
  }

  AddNew_onClick() {
    this.settingModel = [];
    this.approverName = '';
    this.editprojectdata = new ProjectDataConfigurationModel();
    this.isInteger = false;
    this.isString = false;
    this.isBoolean = false;
    this.readonlymode = false;
    this.editmode = true;
    this.editOnly = false;
  }

  Cancel_onClick() {
    this.settingModel = [];
    this.isInteger = false;
    this.isString = false;
    this.isBoolean = false;
    this.readonlymode = true;
    this.editmode = false;
    this.editOnly = false;
    this.GetProjectConfigurationData();
    this.editprojectdata = new ProjectDataConfigurationModel();
  }

  SubmitForm(isValid: boolean | null) {
    this._loading = true;

    if (!isValid) {
      this._loading = false;
      this.showToast('Please enter required fields', 'warn');
      return;
    }

    if (this.editprojectdata.id === 0 || this.editprojectdata.id === undefined) {
      this.service_addProjectData(this.editprojectdata);
      this.readonlymode = true;
      this.editmode = false;
    } else {
      this.service_updateProjectData(this.editprojectdata, false, false);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.readonlymode = true;
    this.editmode = false;
  }

  service_addProjectData(projData: ProjectDataConfigurationModel) {
    const isSettingAlreadyUsedArray: boolean[] = [];
    this.congifSettingdId.forEach((id: any) => {
      const isAlreadyPresent = this.projectConfigurationData.some((x: any) => x.configuration_Setting_Id === id);
      isSettingAlreadyUsedArray.push(isAlreadyPresent);
    });

    if (isSettingAlreadyUsedArray.includes(true)) {
      this._loading = false;
      const item: any[] = [];
      this.congifSettingdId.forEach((id: any) => {
        const filteredSettings = this.projSettings.filter((x: any) => x.id === id);
        const settingTypes = filteredSettings.map((s: any) => s.setting_Type);
        item.push(settingTypes);
      });

      if (!item.every((value: any, index: any, array: any) => JSON.stringify(value) === JSON.stringify(array[0]))) {
        this.showToast('Please select records with the same Configuration Setting.', 'warn');
        return;
      }

      const usedSettings = this.projectConfigurationData
        .filter((setting: any) => this.congifSettingdId.includes(setting.configuration_Setting_Id))
        .map((setting: any) => {
          const item = this.projSettings.find((item: any) => item.id === setting.configuration_Setting_Id);
          return item ? item.setting_Name : null;
        });
      this.showToast(`Setting(s) ${usedSettings.join(', ')} already in use for this project`, 'warn');
      return;
    }

    let projDetails: any[] = [];
    projData.cust_Id = this.input_customerid;
    projData.proj_Id = this.input_projectid;
    if (projData.end_date != null) {
      projData.end_date = this._util.setLocaleDate(projData.end_date);
    }

    if (this.congifSettingdId) {
      projDetails = this.congifSettingdId.map((id: any) => ({
        configuration_Setting_Id: id,
        cust_Id: projData.cust_Id,
        proj_Id: projData.proj_Id,
        end_date: projData.end_date,
        Bit_Value: projData.bit_Value,
        Int_Value: projData.int_Value,
        String_Value: projData.string_Value,
        comments: projData.comments,
        approved_By: projData.approved_By,
        created_Date: new Date(),
        created_By: localStorage.getItem('empid')
      }));

      const apiuri = environment.webapiuri + 'AddProjectConfigurationDataMultiple';
      const headers = {
        'Accept': 'application/json',
        'token': this._util.AppSettings.token,
        'empId': localStorage.getItem('empid') || ''
      };
      this.http.post(apiuri, projDetails, { headers }).subscribe(
        (data: any) => {
          this.showToast('Saved successfully', 'success');
          this.GetProjectConfigurationData();
          this.dataSource.paginator = this.tbpaginator;
          this.dataSource.sort = this.sort;
          this._loading = false;
        },
        (error: any) => {
          this._util.serviceError(error);
          this.showToast('Something went wrong', 'error');
          this._loading = false;
        }
      );
    }
  }

  service_updateProjectData(projData: ProjectDataConfigurationModel, isapproval: boolean, isUpdatedthroughMail: boolean) {
    if (!isUpdatedthroughMail) {
      const item = this.projSettings.filter((x: any) => x.id == projData.configuration_Setting_Id);
      if (item.length > 0) {
        this.setting = item[0].setting_Type;
      }
      projData.iS_APPROVAL = isapproval;
      projData.approval_Comments = this.approvalComments;
      if (projData.end_date != null) {
        projData.end_date = this._util.setLocaleDate(projData.end_date);
      }
    } else {
      projData.approval_Comments = this.approvalComments;
      projData.iS_APPROVAL = isapproval;
      projData.is_Approved = isapproval;
      projData.bit_Value = true;
    }

    const apiuri = environment.webapiuri + 'UpdateProjectConfigurationData';
    const headers = {
      'Accept': 'application/json',
      'token': this._util.AppSettings.token,
      'empId': localStorage.getItem('empid') || ''
    };
    this.http.post(apiuri, projData, { headers }).subscribe(
      (data: any) => {
        if (!isUpdatedthroughMail) {
          this.showToast('Saved successfully', 'success');
          this.approvalComments = '';
          this._loading = false;
        } else {
          this.approvalComments = '';
          this.isUpdatedthroughMail = false;
        }
        this.GetProjectConfigurationData();
      },
      (error: any) => {
        this._util.serviceError(error);
        this._loading = false;
        if (isUpdatedthroughMail) {
          this.errorStr = error._body || error.message || 'An error occurred';
          this.showToast(this.errorStr, 'error', 4000);
          this.errorStr = '';
          this.isUpdatedthroughMail = false;
        } else {
          this.showToast('Something went wrong', 'error');
        }
      }
    );
  }

  EditRow_onClick(element: ProjectDataConfigurationModel) {
    this.showApproval = !element.is_Approved;
    this.readonlymode = false;
    this.editmode = true;
    this.editOnly = true;
    
    const item = this.projSettings.filter((x: any) => x.id == element.configuration_Setting_Id);
    this.settingModel = item.map((option: any) => option.id);

    let settingtype = 0;
    if (item.length > 0) {
      settingtype = item[0].setting_Type;
    }

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
    } else if (settingtype == 2) {
      this.editprojectdata.string_Value = element.string_Value;
      this.isInteger = false;
      this.isBoolean = false;
      this.isString = true;
    } else if (settingtype == 3) {
      this.editprojectdata.bit_Value = element.bit_Value;
      if (element.bit_Value == null) {
        this.editprojectdata.bit_Value = false;
      }
      this.isInteger = false;
      this.isBoolean = true;
      this.isString = false;
    }
  }

  getEmployeeName(approved_By: string) {
    this._appservice.getEmpNameById(approved_By).subscribe((data: any) => {
      if (data == 'null') {
        this.approverName = '';
      } else {
        this.approverName = data;
      }
    });
  }

  getSettingName(settingId: number) {
    const item = this.projSettings.filter((item: any) => {
      return item.id == settingId;
    });
    if (item && item.length > 0) return item[0].setting_Name;
    return '';
  }

  modalOpen() {
    this.modalToggle = true;
  }

  getisApproved(isApproved: boolean) {
    return isApproved ? 'Yes' : 'No';
  }

  onSettingChange(settingIds: any) {
    this.congifSettingdId = settingIds;

    const item = this.projSettings.filter((item: any) => {
      return item.id == settingIds;
    });
    
    if (item.length > 0) {
      const settingType: number = item[0].setting_Type;

      if (settingType == 1) {
        this.isInteger = true;
        this.isString = false;
        this.isBoolean = false;
      } else if (settingType == 2) {
        this.isInteger = false;
        this.isString = true;
        this.isBoolean = false;
      } else if (settingType == 3) {
        this.isInteger = false;
        this.isString = false;
        this.isBoolean = true;
      }
    }
  }

  opendialog() {
    // Opens the inline approval comments panel (replaces browser prompt())
    this.approvalDialogComments = '';
    this.pendingApprovalReject = false;
    this.showApprovalDialog = true;
  }

  /** Confirm from the inline approval dialog */
  confirmApprovalComments() {
    this.approvalComments = this.approvalDialogComments;
    this.editprojectdata.is_Approved = true;
    this.editprojectdata.approval_Comments = this.approvalDialogComments;
    this.showApprovalDialog = false;
    this.service_updateProjectData(this.editprojectdata, true, false);
    this.readonlymode = true;
    this.editmode = false;
    this.editOnly = false;
  }

  /** Confirm rejection comments from the inline approval dialog (mail flow) */
  confirmRejectComments() {
    this.approvalComments = this.approvalDialogComments;
    this.editprojectdata.isMailApproveReject = false;
    this.showApprovalDialog = false;
    this.pendingApprovalReject = false;
    this.service_updateProjectData(this.editprojectdata, false, this.isUpdatedthroughMail);
    this.GetProjectConfigurationData();
  }

  /** Cancel the inline approval dialog */
  cancelApprovalDialog() {
    this.showApprovalDialog = false;
    this.approvalDialogComments = '';
    this.pendingApprovalReject = false;
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
    if (this.projSettings.length == count) {
      this.allsettingSelected.select();
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'warn' | 'error', duration?: number): void {
    const dur = duration ?? (type === 'error' ? 4000 : 3000);
    this._snackBar.open(message, '✕', {
      duration: dur,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`],
    });
  }
}
