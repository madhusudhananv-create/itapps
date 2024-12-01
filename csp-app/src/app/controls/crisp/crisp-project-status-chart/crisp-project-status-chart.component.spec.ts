import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispProjectStatusComponent } from './crisp-project-status-chart.component';

describe('CrispProjectStatusChartComponent', () => {
  let component: CrispProjectStatusChartComponent;
  let fixture: ComponentFixture<CrispProjectStatusChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispProjectStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispProjectStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
