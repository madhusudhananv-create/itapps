import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskEventPageComponent } from './task-event-page.component';

describe('TaskEventPageComponent', () => {
  let component: TaskEventPageComponent;
  let fixture: ComponentFixture<TaskEventPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskEventPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskEventPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
