import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { SessionTimeoutService } from './core/services/session-timeout.service';

describe('AppComponent', () => {
  const mockAuthService = {
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
    logout: jasmine.createSpy('logout'),
    getToken: jasmine.createSpy('getToken').and.returnValue(null),
    userSession$: of(null)
  };

  const mockSessionTimeoutService = {
    startWatching: jasmine.createSpy('startWatching'),
    stopWatching: jasmine.createSpy('stopWatching'),
    startMonitoring: jasmine.createSpy('startMonitoring'),
    stopMonitoring: jasmine.createSpy('stopMonitoring')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionTimeoutService, useValue: mockSessionTimeoutService }
      ]
    }).overrideComponent(AppComponent, {
      set: { imports: [], template: '<div>{{title}}</div>' }
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'CSM Application'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('CSM Application');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('CSM Application');
  });
});
