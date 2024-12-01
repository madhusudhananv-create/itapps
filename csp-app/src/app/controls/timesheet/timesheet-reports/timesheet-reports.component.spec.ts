import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetReportsComponent } from './timesheet-reports.component';

describe('TimesheetReportsComponent', () => {
  let component: TimesheetReportsComponent;
  let fixture: ComponentFixture<TimesheetReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
