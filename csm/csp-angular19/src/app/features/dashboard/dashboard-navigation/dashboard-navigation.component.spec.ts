import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, of } from 'rxjs';

import { DashboardNavigationComponent } from './dashboard-navigation.component';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { SharedData } from '../../../shared/shared-data';
import { MenuToggleService } from '../../../core/services/menu-toggle.service';
import { enumRoles } from '../../../shared/enum';
import { provideHttpClient } from '@angular/common/http';

describe('DashboardNavigationComponent', () => {
  let component: DashboardNavigationComponent;
  let fixture: ComponentFixture<DashboardNavigationComponent>;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockSharedData: any;
  let mockMenuToggleService: any;
  let paramSubject: Subject<any>;
  let menuToggleSubject: Subject<boolean>;

  beforeEach(waitForAsync(() => {
    paramSubject = new BehaviorSubject<any>({ customerid: 'C001', reset: 'true' });
    menuToggleSubject = new Subject<boolean>();

    mockMyUtility = {};
    mockAccessControl = {};
    mockSharedData = {};

    mockMenuToggleService = {
      menuToggle$: menuToggleSubject.asObservable()
    };

    TestBed.configureTestingModule({
      imports: [DashboardNavigationComponent],
      providers: [
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: SharedData, useValue: mockSharedData },
        { provide: MenuToggleService, useValue: mockMenuToggleService },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } },
        provideHttpClient()
      ]
    })
    .overrideComponent(DashboardNavigationComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardNavigationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('role');
    localStorage.removeItem('slaAvailableList');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set customerid from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001', reset: 'true' });
      expect(component.customerid).toBe('C001');
    });

    it('should parse reset as boolean from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001', reset: 'true' });
      expect(component.reset).toBe(true);
    });

    it('should set reset to false when param is "false"', () => {
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001', reset: 'false' });
      expect(component.reset).toBe(false);
    });

    it('should read role from localStorage', () => {
      localStorage.setItem('role', '2');
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001' });
      expect(component.role).toBe('2');
    });

    it('should set ShowMenu to true for non-customer role', () => {
      localStorage.setItem('role', enumRoles.BUHeadIMS.toString());
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001' });
      expect(component.ShowMenu).toBe(true);
    });

    it('should set ShowMenu to false for Customer role', () => {
      localStorage.setItem('role', enumRoles.Customer.toString());
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001' });
      expect(component.ShowMenu).toBe(false);
    });
  });

  // ─── slaAvailable from localStorage ──────────────────────────────────────

  describe('slaAvailable', () => {
    it('should set slaAvailable to true when customer is in slaAvailableList', () => {
      const slaList = [{ customerId: 'C001', slaAvailable: true }];
      localStorage.setItem('slaAvailableList', JSON.stringify(slaList));
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001' });
      expect(component.slaAvailable).toBe(true);
    });

    it('should set slaAvailable to false when customer is not in slaAvailableList', () => {
      const slaList = [{ customerId: 'C002', slaAvailable: true }];
      localStorage.setItem('slaAvailableList', JSON.stringify(slaList));
      fixture.detectChanges();
      paramSubject.next({ customerid: 'C001' });
      expect(component.slaAvailable).toBe(false);
    });

    it('should handle invalid JSON in slaAvailableList gracefully', () => {
      localStorage.setItem('slaAvailableList', 'invalid-json');
      expect(() => { fixture.detectChanges(); paramSubject.next({ customerid: 'C001' }); }).not.toThrow();
    });
  });

  // ─── menuToggle$ subscription ─────────────────────────────────────────────

  describe('menuToggle$ subscription', () => {
    it('should update menuToggleStatus when service emits', () => {
      fixture.detectChanges();
      menuToggleSubject.next(true);
      expect(component.menuToggleStatus).toBe(true);
    });

    it('should update menuToggleStatus to false', () => {
      fixture.detectChanges();
      menuToggleSubject.next(true);
      menuToggleSubject.next(false);
      expect(component.menuToggleStatus).toBe(false);
    });
  });

  // ─── onMenuToggleChange ───────────────────────────────────────────────────

  describe('onMenuToggleChange', () => {
    it('should update menuToggleStatus directly', () => {
      fixture.detectChanges();
      component.onMenuToggleChange(true);
      expect(component.menuToggleStatus).toBe(true);
      component.onMenuToggleChange(false);
      expect(component.menuToggleStatus).toBe(false);
    });
  });

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe from route params on destroy', () => {
      fixture.detectChanges();
      const subSpy = spyOn(component['sub'] as any, 'unsubscribe').and.callThrough();
      component.ngOnDestroy();
      expect(subSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from menuToggle on destroy', () => {
      fixture.detectChanges();
      const subSpy = spyOn(component['menuToggleSub'] as any, 'unsubscribe').and.callThrough();
      component.ngOnDestroy();
      expect(subSpy).toHaveBeenCalled();
    });
  });
});
