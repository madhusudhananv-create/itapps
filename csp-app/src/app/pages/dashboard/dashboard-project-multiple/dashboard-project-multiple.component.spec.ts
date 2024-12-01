import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProjectMultipleComponent } from './dashboard-project-multiple.component';

describe('DashboardProjectMultipleComponent', () => {
  let component: DashboardProjectMultipleComponent;
  let fixture: ComponentFixture<DashboardProjectMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardProjectMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardProjectMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
