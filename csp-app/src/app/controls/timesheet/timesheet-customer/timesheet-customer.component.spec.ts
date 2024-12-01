import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetCustomerComponent } from './timesheet-customer.component';

describe('TimesheetCustomerComponent', () => {
  let component: TimesheetCustomerComponent;
  let fixture: ComponentFixture<TimesheetCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
