import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CSMDashboardComponent } from './csm-dashboard.component';

describe('CSMDashboardComponent', () => {
  let component: CSMDashboardComponent;
  let fixture: ComponentFixture<CSMDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CSMDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CSMDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
