import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordforgotComponent } from './passwordforgot.component';

describe('PasswordforgotComponent', () => {
  let component: PasswordforgotComponent;
  let fixture: ComponentFixture<PasswordforgotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordforgotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordforgotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
