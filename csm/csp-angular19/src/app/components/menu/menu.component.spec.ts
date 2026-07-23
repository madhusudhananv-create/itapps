import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MenuComponent } from './menu.component';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';
import { provideHttpClient } from '@angular/common/http';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
  };

  const mockMyUtility = {
    AppSettings: { empid: 'E001', logintype: 'gavs' },
    btnCalledFromNewCSMDashboard: false,
    IsBaseMeasureEnabledCustomer: jasmine.createSpy('IsBaseMeasureEnabledCustomer').and.returnValue(false)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MenuComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MyUtility, useValue: mockMyUtility }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have custid input default as empty string', () => {
    expect(component.custid).toBe('');
  });

  it('should accept custid input', () => {
    component.custid = 'CUST001';
    fixture.detectChanges();
    expect(component.custid).toBe('CUST001');
  });

  it('should initialize isBaseMeasureEnabled as false', () => {
    expect(component.isBaseMeasureEnabled).toBeFalsy();
  });

  it('should initialize customerName as a string', () => {
    expect(typeof component.customerName).toBe('string');
  });

  it('should have _access and _util injected', () => {
    expect(component._access).toBeDefined();
    expect(component._util).toBeDefined();
  });
});
