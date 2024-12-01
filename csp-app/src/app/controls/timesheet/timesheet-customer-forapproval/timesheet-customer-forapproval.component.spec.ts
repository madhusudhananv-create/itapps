import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetCustomerForapprovalComponent } from './timesheet-customer-forapproval.component';

describe('TimesheetCustomerForapprovalComponent', () => {
  let component: TimesheetCustomerForapprovalComponent;
  let fixture: ComponentFixture<TimesheetCustomerForapprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetCustomerForapprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetCustomerForapprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
