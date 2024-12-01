import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupchecklistUserComponent } from './setupchecklist-user.component';

describe('SetupchecklistUserComponent', () => {
  let component: SetupchecklistUserComponent;
  let fixture: ComponentFixture<SetupchecklistUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupchecklistUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupchecklistUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
