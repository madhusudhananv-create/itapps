import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetPageNewComponent } from './timesheet-page-new.component';

describe('TimesheetPageNewComponent', () => {
  let component: TimesheetPageNewComponent;
  let fixture: ComponentFixture<TimesheetPageNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetPageNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetPageNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
