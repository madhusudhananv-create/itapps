import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ProjectSelectorMultipleComponent } from './project-selector-multiple.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';

describe('ProjectSelectorMultipleComponent', () => {
  let component: ProjectSelectorMultipleComponent;
  let fixture: ComponentFixture<ProjectSelectorMultipleComponent>;

  // ✅ Correct method names matching actual component usage
  const mockAppsService = {
    GetRASCustomerList: jasmine.createSpy('GetRASCustomerList').and.returnValue(of([])),
    getCustomerList: jasmine.createSpy('getCustomerList').and.returnValue(of([])),
    GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of([]))
  };

  // ✅ Mock MyUtility with all methods used in component
  const mockMyUtility = {
    AppSettings: { empid: 'E001', logintype: 'gavs', token: 'mock-token' },
    serviceError: jasmine.createSpy('serviceError'),
    ShouldLoadAllProjects: jasmine.createSpy('ShouldLoadAllProjects').and.returnValue(false)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProjectSelectorMultipleComponent],
      providers: [
        provideHttpClient(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility }  // ✅ use mock instead of real MyUtility
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    // ✅ Reset spies before each test
    mockAppsService.GetRASCustomerList.calls.reset();
    mockAppsService.getCustomerList.calls.reset();
    mockAppsService.GetCustomerProjectsName.calls.reset();

    fixture = TestBed.createComponent(ProjectSelectorMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize Customer as empty array', () => {
    expect(component.Customer).toEqual([]);
  });

  it('should initialize Project as empty array', () => {
    expect(component.Project).toEqual([]);
  });

  it('should initialize selectedCustomers as empty array', () => {
    expect(component.selectedCustomers).toEqual([]);
  });

  it('should initialize selectedProjects as empty array', () => {
    expect(component.selectedProjects).toEqual([]);
  });

  it('should have onChange EventEmitter defined', () => {
    expect(component.onChange).toBeDefined();
  });

  it('should emit onChange when customer selection changes', () => {
    const emitSpy = spyOn(component.onChange, 'emit');
    component.selectedCustomers = ['C001'];
    component.onCustomerChange();
    expect(emitSpy).toHaveBeenCalled();
  });
});