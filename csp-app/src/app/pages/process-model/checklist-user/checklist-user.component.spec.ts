import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistUserComponent } from './checklist-user.component';

describe('ChecklistUserComponent', () => {
  let component: ChecklistUserComponent;
  let fixture: ComponentFixture<ChecklistUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
