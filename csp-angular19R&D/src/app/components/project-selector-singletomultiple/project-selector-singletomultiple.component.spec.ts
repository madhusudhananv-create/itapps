import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ProjectSelectorSingletomultipleComponent } from './project-selector-singletomultiple.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';

describe('ProjectSelectorSingletomultipleComponent', () => {
  let component: ProjectSelectorSingletomultipleComponent;
  let fixture: ComponentFixture<ProjectSelectorSingletomultipleComponent>;

  // ✅ Correct method names matching actual component usage
  const mockAppsService = {
    GetRASCustomerList: jasmine.createSpy('GetRASCustomerList').and.returnValue(of([])),           // ✅ used when allcust === true
    GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([])),                 // ✅ used when allcust === false
    GetMultipleCustomersProjectNamesSingle: jasmine.createSpy('GetMultipleCustomersProjectNamesSingle').and.returnValue(of([]))  // ✅ used in LoadProject()
  };

  // ✅ Mock MyUtility with all used methods
  const mockMyUtility = {
    AppSettings: { empid: 'E001', logintype: 'gavs', token: 'mock-token' },
    serviceError: jasmine.createSpy('serviceError')  // ✅ used in error callbacks
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProjectSelectorSingletomultipleComponent],
      providers: [
        provideHttpClient(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility }      // ✅ use mock instead of real MyUtility
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    // ✅ Reset spies before each test to avoid cross-test contamination
    mockAppsService.GetRASCustomerList.calls.reset();
    mockAppsService.GetCustomerList.calls.reset();
    mockAppsService.GetMultipleCustomersProjectNamesSingle.calls.reset();

    fixture = TestBed.createComponent(ProjectSelectorSingletomultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input projId as ["-1"]', () => {
    expect(component.projId).toEqual(['-1']);
  });

  it('should have default input custId as "-1"', () => {
    expect(component.custId).toBe('-1');
  });

  it('should have default allcust as false', () => {
    expect(component.allcust).toBeFalsy();
  });

  it('should have default allproj as false', () => {
    expect(component.allproj).toBeFalsy();
  });

  it('should initialize Customer as empty array', () => {
    expect(component.Customer).toEqual([]);
  });

  it('should initialize Project as empty array', () => {
    expect(component.Project).toEqual([]);
  });

  it('should have onChange EventEmitter defined', () => {
    expect(component.onChange).toBeDefined();
  });

  it('should accept allcust input as true', () => {
    component.allcust = true;
    fixture.detectChanges();
    expect(component.allcust).toBeTruthy();
  });

  it('should accept custId input', () => {
    component.custId = 'CUST001';
    fixture.detectChanges();
    expect(component.custId).toBe('CUST001');
  });

  it('should call GetCustomerList when allcust is false', () => {
    expect(mockAppsService.GetCustomerList).toHaveBeenCalled();  // ✅ default allcust=false
  });

  it('should call GetRASCustomerList when allcust is true', () => {
    mockAppsService.GetRASCustomerList.calls.reset();
    component.allcust = true;
    component.ngOnInit();
    expect(mockAppsService.GetRASCustomerList).toHaveBeenCalled();  // ✅ allcust=true path
  });
});