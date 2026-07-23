import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavbarMenuComponent } from './navbar-menu.component';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';
import { provideHttpClient } from '@angular/common/http';

describe('NavbarMenuComponent', () => {
  let component: NavbarMenuComponent;
  let fixture: ComponentFixture<NavbarMenuComponent>;

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
  };

  const mockMyUtility = {
    AppSettings: { empid: 'E001', logintype: 'gavs', displayname: 'Test User' }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NavbarMenuComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MyUtility, useValue: mockMyUtility }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have _util injected', () => {
    expect(component._util).toBeDefined();
  });

  it('should have _access injected', () => {
    expect(component._access).toBeDefined();
  });

  it('should render without errors', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
