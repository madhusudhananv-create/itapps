import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallHealthTrendComponent } from './overall-health-trend.component';

describe('OverallHealthTrendComponent', () => {
  let component: OverallHealthTrendComponent;
  let fixture: ComponentFixture<OverallHealthTrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverallHealthTrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverallHealthTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
