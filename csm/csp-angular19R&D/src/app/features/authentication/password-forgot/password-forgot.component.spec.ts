import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PasswordForgotComponent } from './password-forgot.component';
import { AppsService } from '../../../core/services/apps.service';

describe('PasswordForgotComponent', () => {
  let component: PasswordForgotComponent;
  let fixture: ComponentFixture<PasswordForgotComponent>;

  const mockAppsService = {
    forgotPassword: jasmine.createSpy('forgotPassword').and.returnValue(of({}))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PasswordForgotComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordForgotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise email as empty string', () => {
    expect(component.email).toBe('');
  });

  it('should initialise isSubmitting to false', () => {
    expect(component.isSubmitting).toBeFalsy();
  });
});
