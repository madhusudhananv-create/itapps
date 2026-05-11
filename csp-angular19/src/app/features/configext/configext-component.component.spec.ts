import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { ConfigextComponentComponent } from './configext-component.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { SharedService } from '../../shared/shared.service';

describe('ConfigextComponentComponent', () => {
  let component: ConfigextComponentComponent;
  let fixture: ComponentFixture<ConfigextComponentComponent>;

  const mockActivatedRoute = {
    params: of({})
  };

  const mockAppsService = {
    GetConfigextList: jasmine.createSpy('GetConfigextList').and.returnValue(of([])),
    getConfigextDetails: jasmine.createSpy('getConfigextDetails').and.returnValue(of([])),
    GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([])),
    GetProjectsForCustomer: jasmine.createSpy('GetProjectsForCustomer').and.returnValue(of([]))
  };  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ConfigextComponentComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: SharedService, useValue: {} },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) }) } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigextComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise boolean flags', () => {
    expect(component.editmode).toBeFalsy();
    expect(component.readonlymode).toBeTruthy();
    expect(component.disableConfig).toBeFalsy();
    expect(component.isAddMode).toBeFalsy();
  });

  it('should initialise arrays as empty', () => {
    expect(component.result).toEqual([]);
    expect(component.filteredResult).toEqual([]);
    expect(component.Customer).toEqual([]);
    expect(component.Project).toEqual([]);
  });
});
