import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppsService } from '../../../core/services/apps.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const mockAuthService = {
    isLoading: signal(false),
    loginWithGoogle: jasmine.createSpy('loginWithGoogle').and.returnValue(of({})),
    loginWithCredentials: jasmine.createSpy('loginWithCredentials').and.returnValue(of({}))
  };

  const mockAppsService = {
    Login: jasmine.createSpy('Login').and.returnValue(of({}))
  };

  const mockActivatedRoute = {
    queryParams: of({}),
    paramMap: of({ get: () => null })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: AppsService, useValue: mockAppsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise email and password as empty strings', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should have isLoading signal from authService', () => {
    expect(component.isLoading()).toBeFalsy();
  });
});
