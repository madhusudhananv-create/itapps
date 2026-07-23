import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { AccesscontrolManagementComponent } from './accesscontrol-management.component';
import { AppsService } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';

describe('AccesscontrolManagementComponent', () => {
  let component: AccesscontrolManagementComponent;
  let fixture: ComponentFixture<AccesscontrolManagementComponent>;

  const mockAppsService = {
    RequestAccess: jasmine.createSpy('RequestAccess').and.returnValue(of({ status: 200 })),
    AcceptOrRejectAccessRequest: jasmine.createSpy('AcceptOrRejectAccessRequest').and.returnValue(of({})),
    GetAccessRequestByRequestId: jasmine.createSpy('GetAccessRequestByRequestId').and.returnValue(of({}))
  };

  const mockActivatedRoute = {
    params: of({ requestid: null }),
    queryParams: of({})
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AccesscontrolManagementComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideAnimations(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        AccessControl,
        MyUtility,
        MatDialog
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesscontrolManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.resourceIds).toEqual([]);
    expect(component.resourceId).toBe(0);
    expect(component.projectId).toBe('');
    expect(component.custId).toBe('');
    expect(component.feature).toBe('');
    expect(component.accessType).toBe(0);
    expect(component.showAccessRequestButton).toBeFalsy();
  });

  it('should initialize component state correctly', () => {
    expect(component.alreadyRequested).toBeDefined();
    expect(component.isRequestingAccess).toBeFalsy();
    expect(component.rejectReason).toBe('');
    expect(component.showReasonInput).toBeFalsy();
  });

  it('should not call requestAccess if alreadyRequested is true', () => {
    component.alreadyRequested = true;
    component.requestAccess();
    expect(mockAppsService.RequestAccess).not.toHaveBeenCalled();
  });

  it('should not call requestAccess if isRequestingAccess is true', () => {
    component.isRequestingAccess = true;
    component.requestAccess();
    expect(mockAppsService.RequestAccess).not.toHaveBeenCalled();
  });

  it('should accept @Input resourceIds', () => {
    component.resourceIds = [1, 2, 3];
    fixture.detectChanges();
    expect(component.resourceIds).toEqual([1, 2, 3]);
  });

  it('should accept @Input showAccessRequestButton', () => {
    component.showAccessRequestButton = true;
    fixture.detectChanges();
    expect(component.showAccessRequestButton).toBeTruthy();
  });
});
