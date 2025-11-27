import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesscontrolManagementComponent } from './accesscontrol-management.component';

describe('AccesscontrolManagementComponent', () => {
  let component: AccesscontrolManagementComponent;
  let fixture: ComponentFixture<AccesscontrolManagementComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccesscontrolManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesscontrolManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
