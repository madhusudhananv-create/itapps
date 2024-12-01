import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPreviousNextComponent } from './dashboard-previous-next.component';

describe('DashboardPreviousNextComponent', () => {
  let component: DashboardPreviousNextComponent;
  let fixture: ComponentFixture<DashboardPreviousNextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPreviousNextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPreviousNextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
