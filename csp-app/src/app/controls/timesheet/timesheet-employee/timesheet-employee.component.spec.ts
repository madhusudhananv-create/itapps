import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetEmployeeComponent } from './timesheet-employee.component';

describe('TimesheetEmployeeComponent', () => {
  let component: TimesheetEmployeeComponent;
  let fixture: ComponentFixture<TimesheetEmployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetEmployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
