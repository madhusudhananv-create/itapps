import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';

// --- Interfaces ---
export interface ProjectContactRow { businessUnit: string; name: string; role: string; email: string; phone: string; }
export interface ContactsInformationData {
  projectContacts: ProjectContactRow[];
  authorityToInvokeBrpUrl?: string;
  accountContactsUrl?: string;
  cshDetailsUrl?: string;
}

// --- Mock Data ---
const MOCK_USERS = [
  { name: 'John Doe', role: 'Project Manager', email: 'john.doe@example.com', phone: '+1-555-0101' },
  { name: 'Jane Smith', role: 'Tech Lead', email: 'jane.smith@example.com', phone: '+1-555-0102' },
  { name: 'Michael Brown', role: 'Developer', email: 'm.brown@example.com', phone: '+1-555-0103' },
  { name: 'Emily Davis', role: 'QA Lead', email: 'emily.d@example.com', phone: '+1-555-0104' },
];

@Component({
  selector: 'bcp-contacts-information',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatIconModule, MatButtonModule, MatSelectModule, 
    MatTooltipModule, MatAutocompleteModule 
  ],
  changeDetection: ChangeDetectionStrategy.OnPush, // Note: We need CDR to update this
  templateUrl: './contacts-information.component.html',
  styleUrl: './contacts-information.component.scss'
})
export class ContactsInformationComponent implements OnInit {
  @Input() initialData?: ContactsInformationData;
  @Input() mode: 'view' | 'edit' = 'edit';
  @Input() businessUnit?: string;
  @Output() dataChange = new EventEmitter<ContactsInformationData>();
  @Output() validityChange = new EventEmitter<boolean>();

  form: FormGroup;
  filteredOptions: Observable<any[]>[] = [];
  teamUrl: string = '';

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef){
    this.form = this.fb.group({
      projectContacts: this.fb.array([], Validators.required),
      authorityToInvokeBrpUrl: ['', [Validators.pattern(/^https?:\/\/.+$/)]],
      accountContactsUrl: ['', [Validators.pattern(/^https?:\/\/.+$/)]],
      cshDetailsUrl: ['', [Validators.pattern(/^https?:\/\/.+$/)]],
    });
    this.form.valueChanges.subscribe(()=>{
      const valid = this.contacts.length > 0 && this.form.valid;
      this.validityChange.emit(valid);
      if (valid) this.dataChange.emit(this.serialize());
    });
  }

  ngOnInit(): void {
    if (this.initialData?.projectContacts){
      this.initialData.projectContacts.forEach(c => this.addContact(c));
      this.form.patchValue({
        authorityToInvokeBrpUrl: this.initialData.authorityToInvokeBrpUrl || '',
        accountContactsUrl: this.initialData.accountContactsUrl || '',
        cshDetailsUrl: this.initialData.cshDetailsUrl || '',
      });
    }
    const valid = this.contacts.length > 0 && this.form.valid;
    this.validityChange.emit(valid);
    if (valid) this.dataChange.emit(this.serialize());
  }

  get contacts(): FormArray<FormGroup> { return this.form.get('projectContacts') as FormArray<FormGroup>; }

  addContact(row?: ProjectContactRow): void {
    const phonePattern = /^[0-9+\-()\s]{6,20}$/;
    const businessUnitValue = row?.businessUnit || this.businessUnit || '';
    const nameValue = row?.name || MOCK_USERS[0]?.name || '';
    const roleValue = row?.role || MOCK_USERS.find(u => u.name === nameValue)?.role || '';
    const emailValue = row?.email || MOCK_USERS.find(u => u.name === nameValue)?.email || '';
    const phoneValue = row?.phone || MOCK_USERS.find(u => u.name === nameValue)?.phone || '';

    const fg = this.fb.group({
      businessUnit: [businessUnitValue, Validators.required],
      name: [nameValue, Validators.required],
      role: [roleValue, Validators.required],
      email: [emailValue, [Validators.required, Validators.email]],
      phone: [phoneValue, [Validators.required, Validators.pattern(phonePattern)]],
    });

    this.contacts.push(fg);

    // --- SETUP AUTOCOMPLETE LOGIC ---
    const nameControl = fg.get('name');
    if (nameControl) {
      const filtered$ = nameControl.valueChanges.pipe(
        startWith(nameControl.value || ''),
        map(value => this._filterUsers(value || ''))
      );
      // Push to our array
      this.filteredOptions.push(filtered$);
    }
    
    this.cdr.detectChanges();
  }

  removeContact(index: number): void { 
    this.contacts.removeAt(index);
    this.filteredOptions.splice(index, 1);
    this.cdr.detectChanges(); // Update view after removal
  }

  private serialize(): ContactsInformationData {
    const rows: ProjectContactRow[] = this.contacts.controls.map(c => ({
      businessUnit: c.get('businessUnit')?.value,
      name: c.get('name')?.value,
      role: c.get('role')?.value,
      email: c.get('email')?.value,
      phone: c.get('phone')?.value,
    }));
    return {
      projectContacts: rows,
      authorityToInvokeBrpUrl: this.form.get('authorityToInvokeBrpUrl')?.value,
      accountContactsUrl: this.form.get('accountContactsUrl')?.value,
      cshDetailsUrl: this.form.get('cshDetailsUrl')?.value,
    };
  }
  onUserSelected(index: number, event: MatAutocompleteSelectedEvent): void {
    const selectedName = event.option.value;
    const user = MOCK_USERS.find(u => u.name === selectedName);

    if (user) {
      const row = this.contacts.at(index);
      row.patchValue({
        role: user.role,
        email: user.email,
        phone: user.phone
      });
      this.cdr.detectChanges(); // Ensure fields visual update
    }
  }

  onNameInput(index: number): void {
    const row = this.contacts.at(index);
    // If user types manually, clear the dependent fields
    if (row.get('phone')?.value) {
      row.patchValue({ phone: '', email: '', role: '' });
    }
  }

  private _filterUsers(value: string): any[] {
    const filterValue = value.toLowerCase();
    // Return ALL users if value is empty (allows dropdown to show on click)
    return MOCK_USERS.filter(user => user.name.toLowerCase().includes(filterValue));
  }
  openLink(url: string): void {
    if(!url.startsWith('http')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  }
}