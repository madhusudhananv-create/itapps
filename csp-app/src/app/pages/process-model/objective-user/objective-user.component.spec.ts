import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveUserComponent } from './objective-user.component';

describe('ObjectiveUserComponent', () => {
  let component: ObjectiveUserComponent;
  let fixture: ComponentFixture<ObjectiveUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectiveUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectiveUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
