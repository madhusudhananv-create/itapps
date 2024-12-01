import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlEmployeeComponent } from './access-control-employee.component';

describe('AccessControlEmployeeComponent', () => {
  let component: AccessControlEmployeeComponent;
  let fixture: ComponentFixture<AccessControlEmployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessControlEmployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
