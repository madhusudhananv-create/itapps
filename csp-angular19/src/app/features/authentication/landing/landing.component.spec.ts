import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { LandingComponent } from './landing.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppsService } from '../../../core/services/apps.service';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  const mockActivatedRoute = {
    fragment: of(null),
    queryParams: of({})
  };

  const mockAuthService = {
    loginWithOffice365Token: jasmine.createSpy('loginWithOffice365Token').and.returnValue(of({})),
    loginWithGoogleToken: jasmine.createSpy('loginWithGoogleToken').and.returnValue(of({}))
  };

  const mockAppsService = {
    Login: jasmine.createSpy('Login').and.returnValue(of({}))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AppsService, useValue: mockAppsService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
