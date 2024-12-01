import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordsetComponent } from './passwordset.component';

describe('PasswordsetComponent', () => {
  let component: PasswordsetComponent;
  let fixture: ComponentFixture<PasswordsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordsetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
