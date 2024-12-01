import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from "@angular/core";
import { AppsService } from "../../Services/apps.service";
import { myUtility } from "../../Shared/myUtility";
import { CustomerProjectIds } from "../../models/customer-projects-model";
import { MOM_DETAIL } from "../../models/mom-details-model";
import { MatOption, MatSelect } from "@angular/material";
import { CloseComponentService } from "../../close-component.service";
import { Subject, Subscription } from 'rxjs';



@Component({
  selector: "app-project-selector-multiple",
  templateUrl: "./project-selector-multiple.component.html",
  styleUrls: ["./project-selector-multiple.component.scss"],
})
export class ProjectSelectorMultipleComponent implements OnInit {
  @Input("projId") projId: string[];
  @Input("custId") custId: string[];
  @Input("rowId") rowId: number;
  @Input("allcust") allcust: boolean = false;
  @Input("allproj") allproj: boolean = false;
  @Input("skipNonAuditProjects") skipNonAuditProjects: boolean = false;
  @ViewChild('selectCustomer') selectCustomer: MatSelect;
  @ViewChild('allCustomerSelected') allCustomerSelected: MatOption;
  @ViewChild('selectProject') selectProject: MatSelect;
  @ViewChild('allProjectSelected') allProjectSelected: MatOption;
  Customer = [];
  Project = [];
  @Output() onChange: EventEmitter<CustomerProjectIds> = new EventEmitter<CustomerProjectIds>();
  projectList: any[];
  MasterProjectList: any[] = [];
  isLoading: boolean = false;
  SkipAuditProjects = [];
  settingValue: any;
  projects = [];
  isAllProjects: boolean = false;
  private subscriptionName: Subscription;


  constructor(private _appservice: AppsService, public _util: myUtility, private close: CloseComponentService) {

  }

  ngOnInit() {
    if (this.allcust == true) {
      this.LoadCustomer(this.allcust);
    }
    else {
      this.LoadCustomerByEmpId();
    }
    if (this.skipNonAuditProjects) {
      this.loadProjectDataConfigurationValues();
    }

    this.subscriptionName = this.close.getUpdate().subscribe
      (() => {
        this.refreshComponent();
      });
  }

  ngOnDestroy() {
    this.subscriptionName.unsubscribe();
  }

  LoadCustomer(allcust: boolean) {
    this.isLoading = true;
    this._appservice.GetRASCustomerList().subscribe(
      (data) => {
        let n = data.length;
        this.Customer = data;
        if (this.Customer.length > 0 && this.custId != undefined) {
          this.getCustomerProjects(this.custId);
        } else if (this.Customer.length > 0 && this.custId != undefined) {
          this.custId = this.Customer[0].releasE_ID;
          this.getCustomerProjects(this.custId);
        }
        setTimeout(() => {
          if (this.allCustomerSelected)
            this.allCustomerSelected.select();
          this.toggleSelectionForCustomer();
        }, n * 5); this.emitChanges();
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
    this.isLoading = false;
  }
  LoadCustomerByEmpId() {
    this.isLoading = true;
    this._appservice.GetCustomerList(localStorage.getItem("empid"), false).subscribe(
      (data) => {
        this.Customer = data;

        if (this.Customer != undefined) {
          if (this.allcust) {
            this.Customer.splice(0, 1);
            this.custId = this.Customer.map(x => x.cusT_ID);
            this.custId.unshift("-1");
          }
          else {
            this.custId = this.Customer.map(x => x.cusT_ID);
            this.custId.unshift("-1");
          }
        }
        this.LoadProject();
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    );
  }
  loadProjectDataConfigurationValues() {
    this.settingValue = 'SKIP_INTERNAL_AUDIT';
    this._appservice.GetProjectDataConfigurationValues(this.settingValue, this.custId, this.projId).subscribe(data => {
      this.SkipAuditProjects = data;
    }, error => { this._util.serviceError(error); });
  }
  ddCustomer_Onchange(event) {
  }
  ddProject_Onchange() {
  }
  toggleSelectionForCustomer() {
    this.isLoading = true;
    if (this.allCustomerSelected.selected) {
      this.selectCustomer.options.forEach((item: MatOption) => item.select());
      this.getCustomerProjects(this.custId);
    }
    else {
      this.selectCustomer.options.forEach((item: MatOption) => item.deselect());
      this.getCustomerProjects(this.custId);     
    }
    this.isLoading = false;
  }
  customerTosslePerOne() {
    if (this.allCustomerSelected.selected) {
      this.allCustomerSelected.deselect();
    }
    let count = 0;
    this.selectCustomer.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.Customer.length == count) {
      this.allCustomerSelected.select();
    }
    this.getCustomerProjects(this.custId);
  }

  toggleSelectionForProject() {
    this.isLoading = true;
    if (this.allProjectSelected.selected) {
      this.selectProject.options.forEach((item: MatOption) => item.select());
    } else {
      this.selectProject.options.forEach((item: MatOption) => item.deselect());
    }
    this.projId = this.selectProject.options.filter(option => option.selected).map(option => option.value);
    this.emitChanges();
    this.isLoading = false;
  }

  projectTosslePerOne() {
    if (this.allProjectSelected.selected) {
      this.allProjectSelected.deselect();
    }
    let count = 0;
    this.selectProject.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (count == this.Project.length) {
      this.allProjectSelected.select();
    }
    this.projId = this.selectProject.options.filter(option => option.selected).map(option => option.value);
    this.emitChanges();
  }

  getCustomerProjects(custId) {
    if(custId && custId.length == 0)
      {
        this.Project = [];
        this.projId = [];
        if (this.allProjectSelected.selected) {
          this.allProjectSelected.deselect();
        }
      }
      else{
        setTimeout(() => { this.LoadProject(); })
      }
   
  }

  LoadProject() {
    this.isLoading = true;
    this.Project = [];
    this._appservice.GetMultipleCustomersProjectNames(this.custId, this.allproj || this._util.ShouldLoadAllProjects()).subscribe(
      (data) => {
        let n = data.length;
        if (this.skipNonAuditProjects && this.SkipAuditProjects != undefined && this.SkipAuditProjects != null) {
          for (var i = 0; i < this.SkipAuditProjects.length; i++) {
            this.MasterProjectList = data.filter(x => x.proJ_ID != this.SkipAuditProjects[i]);
            this.projectList = this.MasterProjectList;
            this.filterProjects(data);
          }
        }
        else {
          this.projectList = data;
          this.MasterProjectList = data;
          this.filterProjects(this.MasterProjectList);
        }
        setTimeout(() => {
          if (this.allProjectSelected)
            this.allProjectSelected.select();
          this.toggleSelectionForProject();
        }, n);
      },
      (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    );

  }
  filterProjects(masterdata) {
    this.isLoading = true;
    if (masterdata) {
      this.Project = masterdata;
      if (this.Project) {
        this.projId = this.Project.map(x => x.proJ_ID);
      }
      this.projId.unshift("-1");
      this.emitChanges();
    }
    this.isLoading = false;
  }

  refreshComponent() {
    this.LoadCustomerByEmpId();
  }

  emitChanges() {
    let str: CustomerProjectIds = new CustomerProjectIds();
    str.customer = this.custId;
    str.project = this.projId;
    str.rowId = this.rowId;
    this.onChange.emit(str);
  }

}
