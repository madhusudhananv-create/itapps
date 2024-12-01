import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinutesOfMeetingComponent } from './minutes-of-meeting.component';

describe('MinutesOfMeetingComponent', () => {
  let component: MinutesOfMeetingComponent;
  let fixture: ComponentFixture<MinutesOfMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinutesOfMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinutesOfMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
