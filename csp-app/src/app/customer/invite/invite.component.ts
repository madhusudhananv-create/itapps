import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CustomerModel } from '../../models/customer-model';
import { AppsService } from '../../Services/apps.service';
import { Observable } from 'rxjs/Observable';
import { myUtility } from '../../Shared/myUtility';
import { ProjectDetailsModel } from '../../models/project-details-model';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { ClientDetailsModel } from '../../models/client-details-model';
import { CustomerProjectsModel } from '../../models/customer-projects-model';
import { MatDialog } from '@angular/material';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { EmpInfoModel } from '../../models/emp-info-model';
import { ContactsModel } from '../../models/contacts-model';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
  _loading: boolean = false;
  employees: EmpInfoModel[];
  token: string;
  nodata: boolean = false;
  empid: string;
  selectedcontact: ContactsModel;
  customername: string;
  clientDetails: ClientDetailsModel[];
  customerProjects: CustomerProjectsModel[];
  customerProjectsOriginal: CustomerProjectsModel[];
  customerEmail: string;
  selectedClient: ClientDetailsModel;
  selectedProjectsArr: any;
  selectedProjects: CustomerProjectsModel[] = [];
  ClientContacts: ContactsModel[];
  searchText: string;
  selectedEmailId: string;
  csaT_FREQUENCY: string[] = ['', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
  specificSurveyOpted: boolean = false;
  isMonthly: boolean = false;
  isCSSMonthly: boolean = false;
  dataCSSMonthly: any = [];
  @ViewChild('contentContainer') contentContainer: ElementRef;

  constructor(private _router: Router, public _util: myUtility, private _appservice: AppsService, public dialog: MatDialog) { }

  ngOnInit() {
    this.specificSurveyOpted = false;
    this._util.validateLogin();
    this.LoadDetails();
    this.LoadCSSMonthly();
  }
  async LoadCSSMonthly() {
    this._appservice.GetDBConfigValue("MONTHLYCSS", -1, "").subscribe(data => {
      this.dataCSSMonthly = data;
    });
  }
  LoadDetails() {
    this._loading = true;
    this._appservice.getCustomerProjects(localStorage.getItem('empid')).subscribe(data => {
      this.customerProjects = data;
      this.customerProjectsOriginal = data;
    }, error => { this._util.serviceError(error); });
    this._appservice.getGetCSPDetails_EmployeeShort(localStorage.getItem('empid'), new Date(), '').subscribe(data => {
      this.clientDetails = data;
      this._loading = false;
    }, error => { this._util.serviceError(error); });
  }

  GetContactsForCustomer(selectedClient) {
    if (selectedClient == undefined || selectedClient == null) return;
    this._appservice.getCustomerContacts(selectedClient.client_ID, localStorage.getItem('empid'))
      .subscribe(
        data => {
          this.ClientContacts = data;
          this.ClientContacts.sort(function (a, b) { return a.contacT_NAME.localeCompare(b.contacT_NAME) });
          if (this.ClientContacts.length == 0)
            this.nodata = true;
        },
        error => {
          this._util.serviceError(error);
        });
  }
  validateLogin() {
    this.empid = localStorage.getItem('empid');
    this.token = localStorage.getItem('token');
    if (this.empid === "" || this.empid === null) {
      alert("Please login again");
      this._router.navigateByUrl('/login');
    }
  }
  checkdata() {
    alert(this.selectedClient.client_NM);
  }
  getprojs(id) {
    let p: CustomerProjectsModel[];
    // if (this.customerDetails.projects) {
    //   p = this.customerDetails.projects.filter(x => x.customeR_USER_ID == id);
    // }
    return p;
  }
  getSelectedProjects() {
    let s: string = '';
    this.selectedProjects = [];
    if (this.selectedClient && this.selectedProjectsArr != undefined) {
      for (let a of this.selectedProjectsArr) {
        let p = this.selectedClient.projects.find(x => x.proJ_ID == a)
        if (p != null && p != undefined) {
          s += p.proJ_NM + '\r\n';
          let cust = new CustomerProjectsModel();
          cust.id = 0;
          cust.displaY_NAME = '';
          cust.emailid = '';
          cust.isverified = false;
          cust.cusT_ID = "0";
          cust.cusT_NM = '';
          cust.customeR_ID = "0";
          cust.proJ_ID = p.proJ_ID;
          cust.proJ_NM = p.proJ_NM;
          cust.projects = '';
          cust.projectids = '';
          cust.csaT_SURVEY = false;
          cust.csaT_FREQUENCY = '';
          this.selectedProjects.push(cust);
        }
      }
    }
    return s;
  }
  ddProject_OnChange() {
    for (let s of this.selectedProjectsArr) {
      if (!this.IsProjectAlreadyAdded(s)) {
        let proj_nm;
        for (let c of this.clientDetails) {
          for (let p of c.projects)
            if (p.proJ_ID === s)
              proj_nm = p.proJ_NM;
        }
        let cust = new CustomerProjectsModel();
        cust.id = 0;
        cust.displaY_NAME = '';
        cust.emailid = '';
        cust.isverified = false;
        cust.cusT_ID = "0";
        cust.cusT_NM = '';
        cust.customeR_ID = "0";
        cust.proJ_ID = s;
        cust.proJ_NM = proj_nm;
        cust.projects = '';
        cust.projectids = '';
        cust.csaT_SURVEY = false;
        cust.csaT_FREQUENCY = '';
        this.selectedProjects.push(cust);
      }
    }
    for (let i = this.selectedProjects.length - 1; i > -1; i--) {
      let found = this.selectedProjectsArr.filter(t => t == this.selectedProjects[i].proJ_ID)
      if (found === undefined || found.length == 0) {
        this.selectedProjects.splice(i, 1);
      }
    }
  }

  IsProjectAlreadyAdded(proj_id: string): Boolean {
    let bAdded: Boolean = false;
    let proj = this.selectedProjects.filter(t => t.proJ_ID === proj_id)
    if (proj != undefined && proj.length > 0) {
      bAdded = true;
    }
    return bAdded;
  }

  isEditVisible(cust: CustomerProjectsModel) {
    if (cust.customeR_PROJECTS.every(x => x.id == 0))
      return false;

    return true;
  }

  ddCustomer_Onchange(selectedClient) {
    this.selectedProjectsArr = [];
    this.selectedProjects = [];
    this.GetContactsForCustomer(selectedClient);
    this.customerEmail = "";
    this.specificSurveyOpted = false;
    if (this.dataCSSMonthly.indexOf(this.selectedClient.client_ID) >= 0) {
      this.isCSSMonthly = true;
    }
    else {
      this.isCSSMonthly = false;
      this.isMonthly = false;
    }
    // this.specificSurveyOpted = false;
  }
  // ddContact_Onchange(selectedcontact)
  // {
  // this.customerEmail = selectedcontact;
  // }


  ddContact_Onchange() {
    let p: any = this.ClientContacts.filter(t => t.contacT_EMAILID == this.selectedEmailId);
    if (p.length > 0)
      this.customerEmail = p[0].contacT_EMAILID;
    else
      this.customerEmail = "";
  }

  email = new FormControl('', [Validators.required, Validators.email]);

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        null;
  }

  SubmitForm(custForm) {
    if (!custForm.valid) {
      alert("Please enter required fields");
      return;
    }
    {
      for (let p of this.selectedProjects) {
        if (p.csaT_SURVEY === true && p.csaT_FREQUENCY === "") {
          alert("Please select Survey Frequency for '" + p.proJ_NM + "'");
          return;
        }
      }
      let newCust = {
        "CUST_ID": this.selectedClient.client_ID,
        "CUST_NM": this.selectedClient.client_NM,
        "CUSTOMER_PROJECTS": this.selectedProjects,
        "DISPLAY_NAME": this.getSelectedName(),
        "EMAILID": this.selectedEmailId,
        "SPECIFIC_SURVEY_OPTED": (this.specificSurveyOpted == null || this.specificSurveyOpted == undefined ? false : this.specificSurveyOpted)
      }
      this._appservice.addCustomerProjects(newCust).subscribe(data1 => {
        this.LoadDetails();
        custForm.reset();
        this.email.reset();
      }, error => { this._util.serviceError(error); });

    }
  }
  getSelectedName() {
    let name: string;
    let p: any = this.ClientContacts.filter(t => t.contacT_EMAILID == this.selectedEmailId);
    if (p.length > 0)
      name = p[0].contacT_NAME;
    else
      name = "";
    return name;
  }

  SubmitEmployeeForm(employeeForm) {
    this._loading = true;
    this._appservice.saveEmployees(this.employees).subscribe(data1 => {
      alert("Updated Successfully");
      this._loading = false;
    }, error => { this._loading = false; this._util.serviceError(error); });
  }

  Invite_onClick(cust) {
    this._appservice.inviteUser(cust.emailid, localStorage.getItem('empid')).subscribe(data => {
      alert("Invitation sent to " + cust.emailid);
    }, error => { this._util.serviceError(error); });
  }
  Delete_onClick(cust) {
    if (confirm('Are you sure you want to delete the Customer Contact Configuration?')) {
      this._appservice.deleteCustomerProjects(cust.emailid, cust.cusT_ID, localStorage.getItem('empid'))
        .subscribe(
          data => {
            alert("Customer " + cust.emailid + " deleted successfully");
            this.LoadDetails();
          },
          error => { this._util.serviceError(error); });
    }
  }

  scrollToTop() {
    this.contentContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  Edit_onClick(cust) {
    this.selectedProjects = [];
    if (cust == undefined) return;
    this.selectedClient = this.clientDetails.filter(t => t.client_NM == cust.cusT_NM)[0];
    for (let proj of cust.customeR_PROJECTS) {
      if (proj.id == 0) continue;
      let cust = new CustomerProjectsModel();
      cust.id = 0;
      cust.displaY_NAME = '';
      cust.emailid = '';
      cust.isverified = false;
      cust.cusT_ID = "0";
      cust.cusT_NM = '';
      cust.customeR_ID = "0";
      cust.proJ_ID = proj.proJ_ID;
      cust.proJ_NM = proj.proJ_NM;
      cust.projects = '';
      cust.projectids = '';
      cust.csaT_SURVEY = proj.csaT_SURVEY;
      cust.csaT_FREQUENCY = proj.csaT_FREQUENCY;
      cust.reporting = proj.reporting;
      this.selectedProjects.push(cust);
    }
    this._appservice.getCustomerContacts(this.selectedClient.client_ID, localStorage.getItem('empid'))
      .subscribe(
        data => {
          this.ClientContacts = data;
          this.selectedProjectsArr = [];
          let arr: any = [];
          for (let s of cust.projectids.split(','))
            arr.push(s.trim());
          this.selectedProjectsArr = arr;
          this.selectedEmailId = cust.emailid;
          this.customerEmail = cust.emailid;
          this.specificSurveyOpted = false;
          let c = cust.customeR_PROJECTS.filter(x => x.csaT_FREQUENCY.toLowerCase() == "monthly")
          if (c.length > 0) {
            this.specificSurveyOpted = data.filter(x => x.contacT_EMAILID == cust.emailid)[0].specifiC_SURVEY_OPTED;
            this.isMonthly = true;
          }
          else {
            this.specificSurveyOpted = data.filter(x => x.contacT_EMAILID == cust.emailid)[0].specifiC_SURVEY_OPTED;
            this.isMonthly = false;
            this.isCSSMonthly = false;
          }
          if (this.ClientContacts.length == 0)
            this.nodata = true;
        },
        error => {
          this._util.serviceError(error);
        });

    this.scrollToTop();
  }
  checkbox_OnChange(emp: EmpInfoModel) {
    if (emp.emP_CSP_ROLE === "" || emp.emP_CSP_ROLE === null)
      emp.emP_CSP_ROLE = "DELIVERY MANAGER";
    else
      emp.emP_CSP_ROLE = "";
  }

  FilterResults() {
    let searchtextLower = this.searchText.toLowerCase();
    this.customerProjects = this.customerProjectsOriginal.filter(x => x.emailid.toLowerCase().includes(searchtextLower) || x.cusT_NM.toLowerCase().includes(searchtextLower)
      || x.customeR_PROJECTS.some(c => c.proJ_NM.toLowerCase().includes(searchtextLower)));

  }

  ClearFilter() {
    this.searchText = "";
    this.customerProjects = this.customerProjectsOriginal;
  }
}
