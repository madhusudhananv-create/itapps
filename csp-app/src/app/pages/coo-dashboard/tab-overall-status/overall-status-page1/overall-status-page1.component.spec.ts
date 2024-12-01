import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallStatusPage1Component } from './overall-status-page1.component';

describe('OverallStatusPage1Component', () => {
  let component: OverallStatusPage1Component;
  let fixture: ComponentFixture<OverallStatusPage1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverallStatusPage1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverallStatusPage1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
