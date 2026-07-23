import { Component, OnInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';

// Models
export class RequirementRefModel {
  id: number = 0;
  applicability_Level: number = 0;
  customer_Project_Name: number[] = [];
  category_Id: number[] = [];
  doc_Req_Reference: string = '';
  doc_Revision_No: string = '';
  doc_Revision_Date: Date | null = null;
  requirement_Title: string = '';
  requirement_Desc: string = '';
  compliance_fulfilment: string = '';
  documents_Evidence: string = '';
  owner: string = '';
  concerned_Authority: string = '';
  created_By: string = '';
  created_Date: Date = new Date();
  updated_By: string = '';
  updated_Date: Date = new Date();
  status: string = '';
  comments: string = '';
  issues: string = '';
  documentTargetDate: Date | null = null;
  responsibility: string = '';
  isActive: boolean = true;
  projectName: string[] = [];
  customer: string = '';
  updateD_FORMAT_DATE: Date | null = null;
  updateD_PERSON: string = '';
}

export class Req_CategoryModel {
  id: number = 0;
  category: string = '';
  created_By: string = '';
  created_Date: Date = new Date();
  updated_By: string = '';
  updated_Date: Date = new Date();
  isActive: boolean = true;
}

export class Req_LevelModel {
  id: number = 0;
  level: string = '';
  created_By: string = '';
  created_Date: Date = new Date();
  updated_By: string = '';
  updated_Date: Date = new Date();
  isActive: boolean = true;
}

export class Req_StatusModel {
  id: number = 0;
  status: string = '';
}

export class Req_Stage_Status_Model {
  id: number = 0;
  req_Id: number = 0;
  status: string = '';
  updateD_FORMAT_DATE: Date | null = null;
  updateD_PERSON: string = '';
  updated_By: string = '';
  updated_Date: Date = new Date();
  isActive: boolean = true;
}

export class GetRequirementRefModel {
  id: number = 0;
  applicability_Level: number = 0;
  customer_Project_Name: number[] = [];
  projectName: string[] = [];
  category_Id: number[] = [];
  doc_Req_Reference: string = '';
  doc_Revision_No: string = '';
  doc_Revision_Date: Date | null = null;
  requirement_Title: string = '';
  requirement_Desc: string = '';
  compliance_fulfilment: string = '';
  documents_Evidence: string = '';
  owner: string = '';
  concerned_Authority: string = '';
  created_By: string = '';
  created_Date: Date = new Date();
  updated_By: string = '';
  updated_Date: Date = new Date();
  status: string = '';
  comments: string = '';
  issues: string = '';
  documentTargetDate: Date | null = null;
  responsibility: string = '';
  isActive: boolean = true;
  updateD_FORMAT_DATE: Date | null = null;
  updateD_PERSON: string = '';
}

export class RequirementModel {
  starT_DATE: Date | null = null;
  enD_DATE: Date | null = null;
  customer_Project_Name: number = 0;
  projectName: string[] = [];
}

@Component({
  selector: 'app-requirement-reference',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatStepperModule,
    MatDialogModule
  ],
  templateUrl: './requirement-reference.component.html',
  styleUrls: ['./requirement-reference.component.scss']
})
export class RequirementReferenceComponent implements OnInit {
  private _appservice = inject(AppsService);
  private _util = inject(MyUtility);
  private _access = inject(AccessControl);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  editRequirementRef: RequirementRefModel = new RequirementRefModel();
  getRequirementRef: GetRequirementRefModel[] = [];
  showdetails: boolean = true;
  categories: Req_CategoryModel[] = [];
  owners: any[] = [];
  levels: Req_LevelModel[] = [];
  categoryId: number = 0;
  processModelList: any[] = [];
  processAreaList: any[] = [];
  statusList: Req_StatusModel[] = [];
  processList: any[] = [];
  CustomerList: any[] = [];
  serviceAreaList: any[] = [];
  projectLevelList: any[] = [];
  genericplaceholder: string = '';
  reqStages: Req_Stage_Status_Model[] = [];
  dataSource: MatTableDataSource<GetRequirementRefModel> = new MatTableDataSource();
  genericlist: any[] = [];
  customer_Project_Name: number = 0;
  projectName: string[] = [];

  date = new Date();
  startdate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  enddate: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  minDate: Date = new Date();

  Requirementrefinput: RequirementModel = new RequirementModel();

  allproj: boolean = false;

  fieldMapDict: { [key: number]: any[] } = {};
  placeholderMapDict: { [key: number]: string } = {
    1: 'Select Customer',
    2: 'Select Customer',
    3: 'Select Service Level',
    5: 'Select Process Model',
    6: 'Select Process Area',
    7: 'Select Process'
  };

  displayedColumns = ['index', 'doc_Req_Reference', 'requirement_Title',
    'compliance_fulfilment', 'documents_Evidence', 'owner', 'status', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deleteConfirmDialog') deleteConfirmDialogTemplate!: TemplateRef<any>;

  emp: any;
  filterCriteria: any;
  projectList: any[] = [];
  customerId: any;
  selectedCust: string = '';
  req_Id: any;

  readonlymode: boolean = true;
  editmode: boolean = false;
  selectedArray: any[] = [];

  ngOnInit() {
    this.loadIntitialData();

    let role = localStorage.getItem('role');
    if (role == '3' || role == '9' || role == '10') { // BUHeadIMS, PMO, Quality
      this.allproj = true;
    }
  }

  Edit_onClick() {
    this.req_Id = '';
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
    this.genericlist = this.fieldMapDict[this.editRequirementRef.applicability_Level] || [];
    this.genericplaceholder = this.placeholderMapDict[this.editRequirementRef.applicability_Level] || '';
  }

  getreqApplicabilty(id: number) {
    let element: Req_LevelModel | undefined;
    element = this.levels.find(x => x.id == id);
    if (element != undefined)
      return element.level;
    else
      return "";
  }

  EditRow_onClick(element: any) {
    localStorage.setItem("id", element.id.toString());

    if (element.applicability_Level == 2) {
      this.editRequirementRef = element;
      this.editRequirementRef.customer = element.customer;
      this.selectedCust = this.editRequirementRef.customer;
      this.getProjectLevel();
    } else {
      this.genericlist = this.fieldMapDict[element.applicability_Level] || [];
      this.editRequirementRef = element;
    }

    this.readonlymode = false;
    this.editmode = true;
    this.getReqStages();
    this.RefreshTable(this.getRequirementRef);
  }

  DeleteRow_onClick(element: RequirementRefModel) {
    const dialogRef = this.dialog.open(this.deleteConfirmDialogTemplate, {
      width: '400px',
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.service_deleteRequirementRef(element);
      }
    });
  }

  RefreshTable(data: GetRequirementRefModel[]) {
    this.dataSource = new MatTableDataSource<GetRequirementRefModel>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    this._appservice.getStatusList().subscribe({
      next: (data: any) => {
        this.statusList = data;
      },
      error: (error) => { this._util.serviceError(error) }
    });
  }

  getReqStages() {
    this.req_Id = localStorage.getItem('id');
    this._appservice.getReqStages(parseInt(this.req_Id)).subscribe({
      next: (data: any) => {
        this.reqStages = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  getProcessModelList() {
    this._appservice.getProcessModelList().subscribe({
      next: (data: any) => {
        this.processModelList = data;
        this.fieldMapDict[5] = this.processModelList;
      },
      error: (error) => { this._util.serviceError(error) }
    });
  }

  getProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe({
      next: (data: any) => {
        this.processAreaList = data;
        this.fieldMapDict[6] = this.processAreaList;
      },
      error: (error) => { this._util.serviceError(error) }
    });
  }

  getProcessList() {
    this._appservice.getProcessList().subscribe({
      next: (data: any) => {
        this.processList = data;
        this.fieldMapDict[7] = this.processList;
      },
      error: (error) => { this._util.serviceError(error) }
    });
  }

  GetCustomerList() {
    const empid = localStorage.getItem('empid') || '';
    if (empid) {
      this._appservice.GetCustomerList(empid, false).subscribe({
        next: (data: any) => {
          this.CustomerList = data.filter((x: any) => x.cusT_ID == this.customerId);

          if (this.CustomerList.length > 0) {
            this.selectedCust = this.CustomerList.filter((x: any) => x.cusT_ID == this.customerId)[0].cusT_ID;
            this.getProjectLevel();
          }
          this.CustomerList = data;
          this.fieldMapDict[1] = this.CustomerList;
          this.fieldMapDict[2] = this.CustomerList;
        },
        error: (error) => { this._util.serviceError(error) }
      });
    }
  }

  getProjectLevel() {
    if (this.selectedCust == null || this.selectedCust == undefined)
      return;

    this._appservice.getAllProjectsForCustomer(this.selectedCust).subscribe({
      next: (data: any) => {
        this.projectList = data;
      },
      error: (err) => { this._util.serviceError(err) }
    });
  }

  getServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe({
      next: (data: any) => {
        this.serviceAreaList = data;
        this.fieldMapDict[3] = this.serviceAreaList;
      },
      error: (error) => { this._util.serviceError(error) }
    });
  }

  SubmitForm(isValid: boolean) {
    if (!isValid) {
      this._util.showError("Please enter required fields");
      return;
    }
    
    if (this.editRequirementRef.doc_Revision_Date) {
      this.editRequirementRef.doc_Revision_Date = this._util.setLocaleDate(this.editRequirementRef.doc_Revision_Date);
    }
    if (this.editRequirementRef.documentTargetDate) {
      this.editRequirementRef.documentTargetDate = this._util.setLocaleDate(this.editRequirementRef.documentTargetDate);
    }
    
    if (this.editRequirementRef.id === 0 || this.editRequirementRef.id === undefined) {
      this.service_addRequirementRef(this.editRequirementRef);
      this.editmode = false;
      this.readonlymode = true;
    } else {
      this.service_updateRequirementRef(this.editRequirementRef);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.editRequirementRef = new RequirementRefModel();
  }

  getOwnersList() {
    this._appservice.GetRiskOwnersList().subscribe({
      next: (data: any) => {
        this.owners = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  getCategories() {
    this._appservice.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  getReqReference() {
    this.Requirementrefinput.starT_DATE = this._util.setLocaleDate(this.startdate);
    this.Requirementrefinput.enD_DATE = this._util.setLocaleDate(this.enddate);
    this.Requirementrefinput.customer_Project_Name = this.customer_Project_Name;
    this.Requirementrefinput.projectName = this.projectName;

    this.getRequirementRef = [];
    this._appservice.getReqReference(this.Requirementrefinput).subscribe({
      next: (data: any) => {
        this.getRequirementRef = data;
        this.RefreshTable(this.getRequirementRef);
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  getApplicabilityLevels() {
    this._appservice.getApplicabilityLevels().subscribe({
      next: (data: any) => {
        this.levels = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  service_addRequirementRef(requirementRef: RequirementRefModel) {
    requirementRef.created_By = this.emp;

    this._appservice.AddRequirementRef(requirementRef).subscribe({
      next: (data: any) => {
        this.getReqReference();
        this._util.showSuccess("Saved Successfully");
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_updateRequirementRef(requirementRef: RequirementRefModel) {
    requirementRef.updated_By = this.emp;
    
    this._appservice.UpdateRequirementRef(requirementRef).subscribe({
      next: (data: any) => {
        this._util.showSuccess("Updated Successfully");
        this.getReqReference();
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_deleteRequirementRef(requirementRef: RequirementRefModel) {
    this._appservice.DeleteRequirementReference(requirementRef).subscribe({
      next: (data: any) => {
        this._util.showSuccess("Deleted Successfully");
        this.getReqReference();
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  Filter_onChange($event: any) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData();
  }

  filteredData() {
    let tempData: any[] = [];
    tempData = this._util.ApplyCriteriaRange(this.filterCriteria, this.getRequirementRef);
    this.RefreshTable(tempData);
  }

  onCustomerChange() {
    this.projectList = [];

    this._appservice.GetCustomerProjectsName(this.editRequirementRef.customer, this.allproj).subscribe({
      next: (data: any) => {
        data.forEach((x: any) => {
          let c: any = {};
          c.proJ_ID = x.proJ_ID;
          c.proJ_NM = x.proJ_NM;
          this.projectList.push(c);
        });
        this.projectList.sort((a, b) => a.proJ_NM > b.proJ_NM ? 1 : a.proJ_NM < b.proJ_NM ? -1 : 0);
      },
      error: (error) => { },
      complete: () => { }
    });
  }
}
