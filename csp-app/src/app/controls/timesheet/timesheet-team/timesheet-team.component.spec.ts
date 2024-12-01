import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetTeamComponent } from './timesheet-team.component';

describe('TimesheetTeamComponent', () => {
  let component: TimesheetTeamComponent;
  let fixture: ComponentFixture<TimesheetTeamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetTeamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
