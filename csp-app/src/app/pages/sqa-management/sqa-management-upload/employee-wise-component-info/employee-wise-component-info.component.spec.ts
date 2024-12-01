import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeWiseComponentInfoComponent } from './employee-wise-component-info.component';

describe('EmployeeWiseComponentInfoComponent', () => {
  let component: EmployeeWiseComponentInfoComponent;
  let fixture: ComponentFixture<EmployeeWiseComponentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeWiseComponentInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeWiseComponentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
