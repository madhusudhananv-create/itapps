import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlRoleComponent } from './access-control-role.component';

describe('AccessControlRoleComponent', () => {
  let component: AccessControlRoleComponent;
  let fixture: ComponentFixture<AccessControlRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessControlRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
