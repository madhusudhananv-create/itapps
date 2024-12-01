import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetHomeComponent } from './timesheet-home.component';

describe('TimesheetHomeComponent', () => {
  let component: TimesheetHomeComponent;
  let fixture: ComponentFixture<TimesheetHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
