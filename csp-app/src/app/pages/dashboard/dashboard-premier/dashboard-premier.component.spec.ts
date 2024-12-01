import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPremierComponent } from './dashboard-premier.component';

describe('DashboardPremierComponent', () => {
  let component: DashboardPremierComponent;
  let fixture: ComponentFixture<DashboardPremierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPremierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPremierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
