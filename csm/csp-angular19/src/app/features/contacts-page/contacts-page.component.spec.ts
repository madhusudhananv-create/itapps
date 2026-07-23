import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { ContactsPageComponent } from './contacts-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControlService } from '../../core/services/access-control.service';
import { LayoutService } from '../layout/layout.service';

describe('ContactsPageComponent', () => {
  let component: ContactsPageComponent;
  let fixture: ComponentFixture<ContactsPageComponent>;

  const mockActivatedRoute = {
    params: of({ custid: 'C001' })
  };

  const mockAppsService = {
    GetContactsByCustomer: jasmine.createSpy('GetContactsByCustomer').and.returnValue(of([])),
    GetContactRoles: jasmine.createSpy('GetContactRoles').and.returnValue(of([])),
    GetEmpInfoList: jasmine.createSpy('GetEmpInfoList').and.returnValue(of([])),
    SaveContact: jasmine.createSpy('SaveContact').and.returnValue(of({})),
    DeleteContact: jasmine.createSpy('DeleteContact').and.returnValue(of({}))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
    IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
    serviceError: jasmine.createSpy('serviceError')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  const mockLayoutService = { selectedCust: '' };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContactsPageComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControlService, useValue: mockAccessControl },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }) } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read CUST_ID from route params', () => {
    expect(component.CUST_ID).toBe('C001');
  });

  it('should initialise boolean flags', () => {
    expect(component.editCmode).toBeFalsy();
    expect(component.editmode).toBeFalsy();
    expect(component.displayGavsContactType).toBeFalsy();
    expect(component.displayDisabled).toBeFalsy();
  });

  it('should initialise contacts array as empty', () => {
    expect(component.contacts).toEqual([]);
  });

  it('should initialise contactRoles as empty', () => {
    expect(component.contactRoles).toEqual([]);
  });

  it('should initialise empinfo as empty', () => {
    expect(component.empinfo).toEqual([]);
  });

  it('should initialise isPremier and isGavs flags', () => {
    expect(component.isPremier).toBeFalsy();
    expect(component.isGavs).toBeFalsy();
  });

  it('should have correct validation patterns', () => {
    expect(component.emailPattern).toContain('@');
    expect(component.phonePattern).toBeTruthy();
  });
});
