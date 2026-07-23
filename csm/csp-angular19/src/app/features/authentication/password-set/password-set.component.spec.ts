import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PasswordSetComponent } from './password-set.component';
import { AppsService } from '../../../core/services/apps.service';

describe('PasswordSetComponent', () => {
  let component: PasswordSetComponent;
  let fixture: ComponentFixture<PasswordSetComponent>;

  const mockActivatedRoute = {
    params: of({ email: 'test@example.com', code: 'abc123' })
  };

  const mockAppsService = {
    verifyActivationCode: jasmine.createSpy('verifyActivationCode').and.returnValue(of({})),
    setPassword: jasmine.createSpy('setPassword').and.returnValue(of({}))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PasswordSetComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppsService, useValue: mockAppsService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise form field defaults', () => {
    expect(component.password1).toBe('');
    expect(component.password2).toBe('');
    expect(component.isSubmitting).toBeFalsy();
  });

  it('should read email and code from route params', () => {
    expect(component.email).toBe('test@example.com');
    expect(component.code).toBe('abc123');
  });

  it('should enable password fields after valid activation code', () => {
    expect(component.password_disable).toBeFalsy();
  });
});
