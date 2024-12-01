import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { debug } from 'console';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';

@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit {
  @Input("custId") custId: string;
  @Input("projId") projId: string;
  @Input("custNM") custNM: string;
  @Input("projNM") projNM: string;
  @Input("allcust") allcust: boolean = false;
  @Input("allproj") allproj: boolean = false;
  @Input("skipNonAuditProjects") skipNonAuditProjects: boolean = false;
  @Input("disabled") disabled: boolean = false;
  Customer = [];
  Project = [];
  SkipAuditProjects = [];
  settingValue: any;
  searchValueCUST: string = "";
  searchValuePJT: string = "";
  MasterCustomer: any = [];
  MasterProjectList: any = [];

  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(private _appservice: AppsService, public _util: myUtility) { }

  ngOnInit() {
    if (this.allcust == true)
      this.LoadCustomer(this.allcust);
    else {
      this.LoadCustomerByEmpId();
    }
    this.loadProjectDataConfigurationValues();
  }
  ngOnChanges() {
    this.LoadProject(this.custId, this.allproj);
  }
  ddCustomer_Onchange() {
    this.LoadProject(this.custId, this.allproj);
  }
  ddProject_Onchange() {
    this.emitChanges();
  }
  LoadCustomer(allcust: boolean) {
    this._appservice.GetRASCustomerList().subscribe(data => {
      this.Customer = data;
      this.MasterCustomer = data;
    }, error => { this._util.serviceError(error); });
  }
  LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.Customer = data;
      this.MasterCustomer = data;
      this.LoadProject(this.custId, this.allproj);
    }, error => { this._util.serviceError(error); });
  }
  loadProjectDataConfigurationValues() {
    this.settingValue = 'SKIP_INTERNAL_AUDIT';
    this._appservice.GetProjectDataConfigurationValues(this.settingValue, this.custId, this.projId).subscribe(data => {
      this.SkipAuditProjects = data;
    }, error => { this._util.serviceError(error); });
  }
  LoadProject(custId, allproj: boolean) {
    if (custId == undefined) return;
    this._appservice.GetCustomerProjectsName(custId, allproj || this._util.ShouldLoadAllProjects()).subscribe(data => {
      this.Project = data;
      this.MasterProjectList = data;
      if (this.skipNonAuditProjects && this.SkipAuditProjects != undefined
        && this.SkipAuditProjects != null && this.SkipAuditProjects.length > 0) {
        for (var i = 0; i < this.SkipAuditProjects.length; i++) {
          this.Project = this.Project.filter(x => x.proJ_ID != this.SkipAuditProjects[i]);
          this.MasterProjectList = this.Project;
        }
        this.loadProjectChanges();
      }
      else {
        this.Project = data;
        this.MasterProjectList = data;
        this.loadProjectChanges();
      }
    }, error => { this._util.serviceError(error); });
  }

  loadProjectChanges() {
    if (this.Project.length > 0 && this.projId != undefined) {
      let bFound: boolean = false;
      for (let a of this.Project) {
        if (a.proJ_ID === this.projId) {
          bFound = true;
          break;
        }
      }
      if (!bFound) {
        this.projId = this.Project[0].proJ_ID;
      }
      this.emitChanges();
    }
    else if (this.Project.length > 0) {
      this.projId = this.Project[0].proJ_ID;
      this.emitChanges();
    }
  }
  emitChanges() {
    let customer = this.Customer.filter((item) => item.cusT_ID === this.custId);
    let project = this.Project.filter((item) => item.proJ_ID === this.projId);
    if (customer != null && customer != undefined && customer.length > 0)
      this.custNM = customer[0].cusT_NM;
    if (project != null && project != undefined && project.length > 0)
      this.projNM = project[0].proJ_NM;
    this.onChange.emit('{"customer": "' + this.custId + '", "project": "' + this.projId + '", "customerName": "' + this.custNM + '", "projectName": "' + this.projNM.trim() + '"}');
  }
  openedChangeSPAL(opened: boolean) {
    this.searchValueCUST = "";
    this.applyFilterForCustomer(this.searchValueCUST);
  }
  applyFilterForCustomer(filterValue: string) {
    this.Customer = this.MasterCustomer.filter(p => p.cusT_NM.toLowerCase().includes(filterValue.toLowerCase()));
  }
  openedChangePJT(opened: boolean) {
    this.searchValuePJT = "";
    this.applyFilterForProject(this.searchValuePJT);
  }
  applyFilterForProject(filterValue: string) {
    this.Project = this.MasterProjectList.filter(p => p.proJ_NM.toLowerCase().includes(filterValue.toLowerCase()));
  }
}
