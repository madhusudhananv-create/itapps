import { Component, OnInit, Input } from '@angular/core';
import { ContactsModel } from '../../models/contacts-model';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { AccessControl } from '../../Shared/accessControl';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  @Input('CustomerId') CUST_ID: string;
  contacts: ContactsModel[];
  newContacts: ContactsModel;
  editCmode: any;
  editmode: Boolean = false;

  unamePattern = "^[A-Z a-z]{0,30}$";
  emailPattern = "^[A-Z a-z]+[A-Za-z0-9._-]+@[A-Z a-z]+\.[A-Z a-z.]{2,5}$";
  //emailPattern = "^[a-z]+[a-z0-9._-]+@[a-z]+\.[a-z.]{2,5}$";

  rolePattern = "^[A-Z a-z]{0,30}$";
  phonePattern = "^[0-9- +()]{0,23}$";
  constructor(private _access: AccessControl, private _appservice: AppsService, public _util: myUtility) { }

  ngOnInit() {
    this.contacts = [];
    this.newContacts = new ContactsModel;
    this.editCmode = false;
    //this.LoadDetails();
  }
  ngOnChanges() {
    this.LoadDetails();
  }
  LoadDetails() {
    this._appservice.getContacts(this.CUST_ID).subscribe(data => {
      this.contacts = data;
    }, error => { this._util.serviceError(error); });
  }

  employeeSearch_onChange($event){
     let obj: any = JSON.parse($event);
   // this.newContacts.contacT_NAME = $event.frsT_NM;
    //this._taskService.selectedTask.assigneD_TO = obj;
  }

  SubmitForm(contactsForm) {
    if (!contactsForm.valid) {
      alert("Please enter required fields");
      return;
    }

    if (this.newContacts.id === 0 || this.newContacts.id === undefined) {

      this.newContacts.id = 0;
      this.newContacts.customeR_ID = this.CUST_ID;
      this.newContacts.createD_BY = localStorage.getItem('empid');
      this.newContacts.createD_DATE = new Date();
      this._appservice.addContacts(this.newContacts)
        .subscribe(data => {
          this.contacts.push(data);
          alert("Contacts added successfully")
        }, error => { this._util.serviceError(error); });
    }
    else {
      //   this.newContacts.updateD_BY = localStorage.getItem('empid');
      //   this.newContacts.updateD_DATE = new Date();
      this._appservice.updateContacts(this.newContacts)
        .subscribe(data => {
          this.LoadDetails();
          alert("Contact updated successfully")
        }, error => { this._util.serviceError(error); });
    }
    this.newContacts = new ContactsModel;
    contactsForm.reset();
    contactsForm.submitted = false;
  }
  EditRow_onClick(element) {
   
    this.newContacts.id = element.id;
    this.newContacts.customeR_ID = element.customeR_ID;
    this.newContacts.contacT_ROLE = element.contacT_ROLE;
    this.newContacts.contacT_EMAILID = element.contacT_EMAILID;
    this.newContacts.contacT_PHONE = element.contacT_PHONE;
    this.newContacts.createD_BY = element.createD_BY;
    this.newContacts.createD_DATE = element.createD_DATE;
    this.newContacts.contacT_TYPE = element.contacT_TYPE;
    this.newContacts.isactive = element.isactive;
    this.editmode = true;
  }

  DeleteRow_onClick(contacts) {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteContacts(contacts)
        .subscribe(data => {
          this.LoadDetails();
          alert("Contact deleted successfully")
        }, error => { this._util.serviceError(error); });
    }
    else {

    }
  }
  changemode() {
    this.editCmode = true;
  }
  changeeditmode() {
    this.editCmode = false;
  }
}
