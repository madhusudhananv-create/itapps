import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPortfolioComponent } from './dashboard-portfolio.component';

describe('DashboardPortfolioComponent', () => {
  let component: DashboardPortfolioComponent;
  let fixture: ComponentFixture<DashboardPortfolioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPortfolioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
