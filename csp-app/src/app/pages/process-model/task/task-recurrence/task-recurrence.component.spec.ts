import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskRecurrenceComponent } from './task-recurrence.component';

describe('TaskRecurrenceComponent', () => {
  let component: TaskRecurrenceComponent;
  let fixture: ComponentFixture<TaskRecurrenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskRecurrenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskRecurrenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
