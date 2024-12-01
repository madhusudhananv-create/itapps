import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardprojectstatusComponent } from './dashboardprojectstatus.component';

describe('DashboardprojectstatusComponent', () => {
  let component: DashboardprojectstatusComponent;
  let fixture: ComponentFixture<DashboardprojectstatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardprojectstatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardprojectstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
