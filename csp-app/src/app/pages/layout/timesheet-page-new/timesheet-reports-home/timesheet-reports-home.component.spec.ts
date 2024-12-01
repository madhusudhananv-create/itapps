import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetReportsHomeComponent } from './timesheet-reports-home.component';

describe('TimesheetHomeComponent', () => {
  let component: TimesheetReportsHomeComponent;
  let fixture: ComponentFixture<TimesheetReportsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetReportsHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetReportsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
