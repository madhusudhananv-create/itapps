import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdDashboardComponent } from './bvd-dashboard.component';

describe('BvdDashboardComponent', () => {
  let component: BvdDashboardComponent;
  let fixture: ComponentFixture<BvdDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
