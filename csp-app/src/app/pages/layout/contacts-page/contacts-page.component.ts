import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ContactsModel } from '../../../models/contacts-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { AccessControl } from '../../../Shared/accessControl';
import { ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LayoutService } from '../layout.service';
import { EmpInfoModel, ProjectResourceByEmpIdModel, ProjectResourceModel } from '../../../models/emp-info-model';
import { Observable } from 'rxjs/internal/Observable';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { TaskService } from '../../../pages/process-model/task/task.service';
import { MatAutocompleteTrigger } from '@angular/material'
import { ContactsRolesModel } from '../../../models/contacts-roles-model';

@Component({
  selector: 'app-contacts-page',
  templateUrl: './contacts-page.component.html',
  styleUrls: ['./contacts-page.component.scss']
})
export class ContactsPageComponent implements OnInit {

  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;

  CUST_ID: string;
  contacts: ContactsModel[];

  filteredOptions: Observable<EmpInfoModel[]>;
  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  newContacts: ContactsModel;
  editCmode: any;
  editmode: Boolean = false;
  displayGavsContactType: Boolean = false;
  displayDisabled: Boolean = false;

  empid: string;
  empname: string[] = [];
  empName: any;
  empFirstName: any;
  unamePattern = "^[A-Z a-z  ]{0,30}$";
  emailPattern = "[a-zA-Z0-9._-]{1,}@[a-zA-Z.-]{1,}[.]{1}[a-zA-Z]{2,}";
  rolePattern = "^[A-Z a-z]{0,30}$";
  phonePattern = "^[0-9- +()]{0,23}$";
  //phonePattern = "^\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$";
  contactCount: any = 0;
  private sub: any;
  contactRoles: ContactsRolesModel[];
  isPremier: Boolean = false;
  isGavs: Boolean = false;

  constructor(public _taskService: TaskService, private route: ActivatedRoute, private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, public _layoutService: LayoutService) { }

  ngOnInit() {
    this.contacts = [];
    this.newContacts = new ContactsModel;
    this.editCmode = false;

    this.sub = this.route.params.subscribe(params => {
      this.CUST_ID = params['custid'];
      this.empid = localStorage.getItem('empid');
      this._layoutService.selectedCust = this.CUST_ID;
      this.LoadDetails();
      this.getContactRoles();

      this.isPremier = this._util.IsPremier(this.CUST_ID);
      this.isGavs = this._util.IsGAVS();

      this.filteredOptions = this.myControl.valueChanges
        .pipe(
          startWith<string | EmpInfoModel>(''),
          map(value => typeof value === 'string' ? value : value.frsT_NM),
          map(name => name ? this._filter(name) : this.empinfo.slice())
        );
    });
  }

  ngOnChanges() {
    this.LoadDetails();
  }

  employeeSearch_onChange(item) {
    let obj: any = JSON.parse(item);
    this.newContacts.contacT_EMP_ID = obj;
    this.GetEmpName(obj);
  }

  GetEmpName(empId) {
    this._appservice.getEmpNameById(empId).subscribe(
      data => {
        this.empName = data;
        this.empname.push(this.empName);
        this.newContacts.contacT_NAME = this.empName;
      },
      error => {
        { this._util.serviceError(error); }
      }
    )
  }

  verifyContactType(contactType) {
    if (contactType == "GAVS") {
      this.displayGavsContactType = true;
      //this.displayCustomerContactType = false;
    }
    else {
      this.displayGavsContactType = false;
      //this.displayCustomerContactType = true;
    }
  }

  private _filter(value: string): EmpInfoModel[] {
    const filterValue = value.toLowerCase();
    return this.empinfo.filter(option => option.frsT_NM.toLowerCase().includes(filterValue));
  }

  displayFn(user?: EmpInfoModel): string | undefined {
    if (!this.editmode)
      return user ? user.frsT_NM : undefined;
    else
      return this.empName;
  }

  LoadDetails() {
    this._appservice.getContacts(this.CUST_ID).subscribe(data => {
      this.contacts = data;
    }, error => { this._util.serviceError(error); });
  }

  getItems(contactType) {
    return this.contacts.filter((contact) => contact.contacT_TYPE === contactType);
  }

  getExistingContacts(ContactName) {
    return this.contacts.filter((contact) => contact.contacT_NAME === ContactName).length;
  }

  SubmitForm(contactsForm) {

    if (!contactsForm.valid) {
      alert("Please enter required fields");
      return;
    }

    if (this.newContacts.id === 0 || this.newContacts.id === undefined) {

      this.newContacts.id = 0;
      this.newContacts.customeR_ID = this.CUST_ID;

      if (this.newContacts.contacT_TYPE == "GAVS") {
        this.newContacts.contacT_NAME = this.myControl.value.frsT_NM;
        this.newContacts.contacT_EMP_ID = this.myControl.value.emP_ID;


        if (this.newContacts.contacT_NAME == null || this.newContacts.contacT_EMP_ID == null) {
          alert("Contact name is invalid");
          this.newContacts = new ContactsModel;
          contactsForm.resetForm();
          this.myControl.reset();
          return;
        }
      }

      this.newContacts.createD_BY = localStorage.getItem('empid');
      this.newContacts.createD_DATE = new Date();
      this.contactCount = this.getExistingContacts(this.newContacts.contacT_NAME)

      if (this.contactCount > 0) {
        alert("Contact exists already");
        this.newContacts = new ContactsModel;
        contactsForm.resetForm();
        this.myControl.reset();
        return;
      }

      this._appservice.addContacts(this.newContacts)
        .subscribe(data => {
          this.contacts.push(data);
          alert("Contacts added successfully. If you wish to obtain Customer Success Survey from this contact, Please navigate to Customer details page from settings menu (https://csm.gavstech.com/customerinvite) to map the Customer contact to the project.")
        }, error => { this._util.serviceError(error); });
    }
    else {
      this._appservice.updateContacts(this.newContacts)
        .subscribe(data => {
          this.LoadDetails();
          alert("Contact updated successfully. If you wish to obtain Customer Success Survey from this contact, Please navigate to Customer details page from settings menu (https://csm.gavstech.com/customerinvite) to map the Customer contact to the project.")
        }, error => { this._util.serviceError(error); });
    }
    this.newContacts = new ContactsModel;
    contactsForm.resetForm();
    this.myControl.reset();
    this.displayDisabled = false;
    contactsForm.submitted = false;
  }

  EditRow_onClick(element) {
    this.newContacts.id = element.id;
    this.newContacts.customeR_ID = element.customeR_ID;
    this.newContacts.contacT_NAME = element.contacT_NAME;
    this.newContacts.contacT_ROLE = element.contacT_ROLE;
    this.newContacts.contacT_EMAILID = element.contacT_EMAILID;
    this.newContacts.contacT_PHONE = element.contacT_PHONE;
    this.newContacts.createD_BY = element.createD_BY;
    this.newContacts.createD_DATE = element.createD_DATE;
    this.newContacts.contacT_TYPE = element.contacT_TYPE;
    this.newContacts.contacT_EMP_ID = element.contacT_EMP_ID;
    this.newContacts.isactive = element.isactive;
    //this.newContacts.isactive = element.isactive;
    this.editmode = true;
    this.displayGavsContactType = false;
    //this.verifyContactType(element.contacT_TYPE);
    this.displayDisabled = true;
    this.newContacts.rolE_ID = element.rolE_ID;
  }

  disableEntry() {
    return this.displayDisabled;
  }

  DeleteRow_onClick(contacts, contactsForm) {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteContacts(contacts)
        .subscribe(data => {
          this.LoadDetails();
          alert("Contact deleted successfully")
        }, error => { this._util.serviceError(error); });

      this.newContacts = new ContactsModel;
      contactsForm.resetForm();
      this.myControl.reset();
    }
    else {

    }
  }

  changemode() {
    this.editCmode = true;
    this.displayDisabled = false;
    this.service_GetEmpInfo();

  }

  changeeditmode(contactsForm) {
    this.editCmode = false;
    this.displayDisabled = true;
    this.newContacts = new ContactsModel;
    contactsForm.resetForm();
    this.myControl.reset();
    this.displayGavsContactType = true;
  }

  service_GetEmpInfo() {
    this._appservice.getEmpInfo().subscribe(data => {
      this.empinfo = data;
    }, error => { this._util.serviceError(error); });
  }

  getContactRoles() {
    this._appservice.getContactRoles().subscribe(data => {
      this.contactRoles = data;
    }, error => { this._util.serviceError(error); });
  }
  getContactRoleTypeName(roleId: number) {
    if (roleId != undefined || roleId > 0) {
      return this.contactRoles.filter(x => x.rolE_ID == roleId)[0].rolE_NAME;
    }
  }
}









