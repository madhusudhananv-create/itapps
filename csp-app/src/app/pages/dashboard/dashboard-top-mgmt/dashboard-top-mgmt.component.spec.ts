import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTopMgmtComponent } from './dashboard-top-mgmt.component';

describe('DashboardTopMgmtComponent', () => {
  let component: DashboardTopMgmtComponent;
  let fixture: ComponentFixture<DashboardTopMgmtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTopMgmtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTopMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
