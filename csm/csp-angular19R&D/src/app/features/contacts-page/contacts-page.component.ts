/**
 * ContactsPageComponent - Customer contacts management
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 *
 * Features:
 * - Two-tab interface (GAVS contacts and Customer contacts)
 * - Employee autocomplete search
 * - Add, edit, and delete contacts
 * - Contact role management
 * - Email validation
 * - Customer invitation workflow
 */

import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';

// Material Imports
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Models
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { ContactsModel, ContactsRolesModel } from '../../core/models/contacts-model';
import { EmpInfoModel } from '../../models/emp-info-model';
import { environment } from '../../../environments/environment';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss'
})
export class ContactsPageComponent implements OnInit {
  // Dependency Injection
  private route = inject(ActivatedRoute);
  public _access = inject(AccessControl);
  public _util = inject(MyUtility);
  private _appservice = inject(AppsService);
  public _layoutService = inject(LayoutService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // ViewChild for autocomplete trigger
  @ViewChild(MatAutocompleteTrigger) _auto!: MatAutocompleteTrigger;

  // Component Properties
  CUST_ID: string = '';
  contacts: ContactsModel[] = [];
  filteredOptions!: Observable<EmpInfoModel[]>;
  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  newContacts: ContactsModel = new ContactsModel();
  editCmode: boolean = false;
  editmode: boolean = false;
  displayGavsContactType: boolean = false;
  displayDisabled: boolean = false;

  // Employee Information
  empid: string = '';
  empname: string[] = [];
  empName: any;
  empFirstName: any;

  // Validation Patterns
  unamePattern = "^[A-Z a-z  ]{0,30}$";
  emailPattern = "[a-zA-Z0-9._-]{1,}@[a-zA-Z.-]{1,}[.]{1}[a-zA-Z]{2,}";
  rolePattern = "^[A-Z a-z]{0,30}$";
  phonePattern = "^[0-9- +()]{0,23}$";

  // Other Properties
  contactCount: number = 0;
  contactRoles: ContactsRolesModel[] = [];
  isPremier: boolean = false;
  isGavs: boolean = false;
  companyName: string = '';

  ngOnInit() {
    this.contacts = [];
    this.newContacts = new ContactsModel();
    this.editCmode = false;
    this.companyName = environment.company_name;

    this.route.params.subscribe((params: any) => {
      this.CUST_ID = params['custid'];
      this.empid = localStorage.getItem('empid') || '';
      this._layoutService.selectedCust = this.CUST_ID;
      this.LoadDetails();
      this.getContactRoles();

      this.isPremier = this._util.IsPremier(this.CUST_ID);
      this.isGavs = this._util.IsGAVS();

      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith<string | EmpInfoModel>(''),
        map(value => typeof value === 'string' ? value : (value as EmpInfoModel).frsT_NM),
        map(name => name ? this._filter(name) : this.empinfo.slice())
      );
    });
  }

  /**
   * Load contacts for the customer
   */
  LoadDetails() {
    this._appservice.getContacts(this.CUST_ID).subscribe(
      (data: any) => {
        this.contacts = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  /**
   * Get contact roles from service
   */
  getContactRoles() {
    this._appservice.getContactRoles().subscribe(
      (data: any) => {
        this.contactRoles = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  /**
   * Filter contacts by type (GAVS or Customer)
   */
  getItems(contactType: string): ContactsModel[] {
    return this.contacts.filter((contact) => contact.contacT_TYPE === contactType);
  }

  /**
   * Check if contact already exists
   */
  getExistingContacts(ContactName: string): number {
    return this.contacts.filter((contact) => contact.contacT_NAME === ContactName).length;
  }

  /**
   * Get employee name by ID
   */
  GetEmpName(empId: string) {
    this._appservice.getEmpNameById(empId).subscribe(
      (data: any) => {
        this.empName = data;
        this.empname.push(this.empName);
        this.newContacts.contacT_NAME = this.empName;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  /**
   * Handle employee search selection
   */
  employeeSearch_onChange(item: string) {
    const obj: any = JSON.parse(item);
    this.newContacts.contacT_EMP_ID = obj;
    this.GetEmpName(obj);
  }

  /**
   * Verify and set contact type display
   */
  verifyContactType(contactType: string) {
    if (contactType === this.companyName) {
      this.displayGavsContactType = true;
    } else {
      this.displayGavsContactType = false;
    }
  }

  /**
   * Filter autocomplete options
   */
  private _filter(value: string): EmpInfoModel[] {
    const filterValue = value.toLowerCase();
    return this.empinfo.filter(option => option.frsT_NM.toLowerCase().includes(filterValue));
  }

  /**
   * Display function for autocomplete
   */
  displayFn(user?: EmpInfoModel): string {
    if (!this.editmode) {
      return user ? user.frsT_NM : '';
    } else {
      return this.empName || '';
    }
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'warn' | 'error', duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`]
    });
  }

  /**
   * Submit contact form (Add or Update)
   */
  SubmitForm(contactsForm: any) {
    if (!contactsForm.valid) {
      this.showToast('Please enter required fields', 'warn', 3000);
      return;
    }

    const domain = environment.loginpage.replace('login/', '');
    const url = 'customerinvite/';
    const msg = 'Contacts added successfully. If you wish to obtain Customer Success Survey from this contact, You need to navigate to Customer details page from settings menu to map the Customer contact to the project. Click Ok to navigate to Customer Details Page, click Cancel to Stay here.';

    if (this.newContacts.id === 0 || this.newContacts.id === undefined) {
      // Add new contact
      this.newContacts.id = 0;
      this.newContacts.customeR_ID = this.CUST_ID;

      if (this.newContacts.contacT_TYPE === this.companyName) {
        const controlValue = this.myControl.value;
        this.newContacts.contacT_NAME = controlValue.frsT_NM;
        this.newContacts.contacT_EMP_ID = controlValue.emP_ID;

        if (this.newContacts.contacT_NAME == null || this.newContacts.contacT_EMP_ID == null) {
          this.showToast('Contact name is invalid', 'warn', 3000);
          this.newContacts = new ContactsModel();
          contactsForm.resetForm();
          this.myControl.reset();
          return;
        }
      }

      this.newContacts.createD_BY = localStorage.getItem('empid') || '';
      this.newContacts.createD_DATE = new Date();
      this.contactCount = this.getExistingContacts(this.newContacts.contacT_NAME);

      if (this.contactCount > 0) {
        this.showToast('Contact exists already', 'warn', 3000);
        this.newContacts = new ContactsModel();
        contactsForm.resetForm();
        this.myControl.reset();
        return;
      }

      this._appservice.addContacts(this.newContacts).subscribe(
        (data: any) => {
          this.contacts.push(data);
          this.showToast('Saved successfully', 'success', 3000);

          const dialogRef = this.dialog.open(DialogYesNoComponent, {
            data: {
              title: 'Contact Added',
              message: msg
            }
          });

          dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result === true) {
              const newWindow = window.open(url, '_blank');
              if (newWindow) {
                newWindow.focus();
              }
            }
          });
        },
        (error: any) => {
          this.showToast('Something went wrong', 'error', 4000);
          this._util.serviceError(error);
        }
      );
    } else {
      // Update existing contact
      this._appservice.updateContacts(this.newContacts).subscribe(
        (data: any) => {
          this.LoadDetails();
          this.showToast('Saved successfully', 'success', 3000);

          const dialogRef = this.dialog.open(DialogYesNoComponent, {
            data: {
              title: 'Contact Updated',
              message: msg
            }
          });

          dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result === true) {
              const newWindow = window.open(url, '_blank');
              if (newWindow) {
                newWindow.focus();
              }
            }
          });
        },
        (error: any) => {
          this.showToast('Something went wrong', 'error', 4000);
          this._util.serviceError(error);
        }
      );
    }

    this.newContacts = new ContactsModel();
    contactsForm.resetForm();
    this.myControl.reset();
    this.displayDisabled = false;
    contactsForm.submitted = false;
  }

  /**
   * Edit contact - populate form
   */
  EditRow_onClick(element: ContactsModel) {
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
    this.newContacts.category = element.category;
    this.newContacts.rolE_ID = element.rolE_ID;
    this.editmode = true;
    this.displayGavsContactType = false;
    this.displayDisabled = true;
  }

  /**
   * Check if entry fields should be disabled
   */
  disableEntry(): boolean {
    return this.displayDisabled;
  }

  /**
   * Delete contact
   */
  DeleteRow_onClick(contacts: ContactsModel, contactsForm: any) {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this contact? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._appservice.deleteContacts(contacts).subscribe(
          (data: any) => {
            this.LoadDetails();
            this.showToast('Deleted successfully', 'warn', 3000);
          },
          (error: any) => {
            this.showToast('Something went wrong', 'error', 4000);
            this._util.serviceError(error);
          }
        );

        this.newContacts = new ContactsModel();
        contactsForm.resetForm();
        this.myControl.reset();
      }
    });
  }

  /**
   * Enable add mode
   */
  changemode() {
    this.editCmode = true;
    this.displayDisabled = false;
    this.service_GetEmpInfo();
  }

  /**
   * Disable add mode
   */
  changeeditmode(contactsForm: any) {
    this.editCmode = false;
    this.displayDisabled = true;
    this.newContacts = new ContactsModel();
    contactsForm.resetForm();
    this.myControl.reset();
    this.displayGavsContactType = true;
  }

  /**
   * Get employee information for autocomplete
   */
  service_GetEmpInfo() {
    this._appservice.getEmpInfo().subscribe(
      (data: any) => {
        this.empinfo = data;
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  /**
   * Get contact role name by ID
   */
  getContactRoleTypeName(roleId: number): string {
    if (roleId !== undefined && roleId > 0) {
      const role = this.contactRoles.filter(x => x.rolE_ID === roleId)[0];
      return role ? role.rolE_NAME : '';
    }
    return '';
  }
}
