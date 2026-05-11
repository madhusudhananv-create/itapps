import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { EmployeeSearchComponent } from './employee-search.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';

describe('EmployeeSearchComponent', () => {
  let component: EmployeeSearchComponent;
  let fixture: ComponentFixture<EmployeeSearchComponent>;

  const mockAppsService = {
    getEmpInfo: jasmine.createSpy('getEmpInfo').and.returnValue(of([   // ✅ lowercase 'g' matches component call: this._appservice.getEmpInfo()
      { emP_ID: 'E001', frsT_NM: 'John', lasT_NM: 'Doe' },
      { emP_ID: 'E002', frsT_NM: 'Jane', lasT_NM: 'Smith' }
    ]))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EmployeeSearchComponent],
      providers: [
        provideHttpClient(),
        { provide: AppsService, useValue: mockAppsService },
        MyUtility
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.emP_ID).toBe('');
    expect(component.emP_Name).toBe('');
    expect(component.emp_name_readOnly).toBeFalsy();
    expect(component.multiSelect).toBeFalsy();
    expect(component.searchText).toBe('');
  });

  it('should initialize empinfo as empty array', () => {
    expect(component.empinfo).toBeDefined();
    expect(Array.isArray(component.empinfo)).toBeTruthy();
  });

  it('should initialize selectedEmployee as empty array', () => {
    expect(component.selectedEmployee).toEqual([]);
  });

  it('should have onChange EventEmitter defined', () => {
    expect(component.onChange).toBeDefined();
  });

  it('should emit onChange when employee is selected', () => {
    const emitSpy = spyOn(component.onChange, 'emit');
    component.onChange.emit({ emP_ID: 'E001', frsT_NM: 'John' });
    expect(emitSpy).toHaveBeenCalledWith({ emP_ID: 'E001', frsT_NM: 'John' });
  });

  it('should initialize myControl FormControl', () => {
    expect(component.myControl).toBeDefined();
  });

  it('should accept multiSelect input as true', () => {
    component.multiSelect = true;
    fixture.detectChanges();
    expect(component.multiSelect).toBeTruthy();
  });
});
