import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSidenavComponent } from './dashboard-sidenav.component';

describe('DashboardSidenavComponent', () => {
  let component: DashboardSidenavComponent;
  let fixture: ComponentFixture<DashboardSidenavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardSidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
