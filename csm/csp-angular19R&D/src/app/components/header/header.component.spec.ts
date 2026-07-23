import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { MenuToggleService } from '../../core/services/menu-toggle.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const mockMenuToggleService = {
    toggle: jasmine.createSpy('toggle'),
    menuState$: of(false)
  };

  // ✅ Store mockMediaQueryList separately so same reference is used
  const mockMediaQueryList = {
    matches: false,
    addListener: jasmine.createSpy('addListener'),
    removeListener: jasmine.createSpy('removeListener'),
    addEventListener: jasmine.createSpy('addEventListener'),
    removeEventListener: jasmine.createSpy('removeEventListener'),
    dispatchEvent: jasmine.createSpy('dispatchEvent'),
    onchange: null,
    media: '(max-width: 600px)'
  } as any;

  const mockMediaMatcher = {
    matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList) // ✅ same reference
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: MenuToggleService, useValue: mockMenuToggleService },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        ChangeDetectorRef
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize showMenu as false by default', () => {
    expect(component.showMenu).toBeFalsy();
  });

  it('should initialize mobileQuery', () => {
    expect(component.mobileQuery).toBeDefined();
  });

  it('should show menu for /newdashboard/cust routes', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'url' as any).and.returnValue('/newdashboard/cust/123');
    (component as any).updateMenuVisibility('/newdashboard/cust/123');
    expect(component.showMenu).toBeTruthy();
  });

  it('should show menu for /layout/ routes', () => {
    (component as any).updateMenuVisibility('/layout/overview');
    expect(component.showMenu).toBeTruthy();
  });

  it('should show menu for /coodashboard route', () => {
    (component as any).updateMenuVisibility('/coodashboard');
    expect(component.showMenu).toBeTruthy();
  });

  it('should not show menu for unrelated routes', () => {
    (component as any).updateMenuVisibility('/login');
    expect(component.showMenu).toBeFalsy();
  });

  it('should call removeListener on ngOnDestroy', () => {
    mockMediaQueryList.removeListener.calls.reset(); // reset previous calls
    component.ngOnDestroy();
    expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
  });
});