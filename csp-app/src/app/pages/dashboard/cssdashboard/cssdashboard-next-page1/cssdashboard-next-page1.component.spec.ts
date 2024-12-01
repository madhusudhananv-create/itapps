import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CssdashboardNextPage1Component } from './cssdashboard-next-page1.component';

describe('CssdashboardNextPage1Component', () => {
  let component: CssdashboardNextPage1Component;
  let fixture: ComponentFixture<CssdashboardNextPage1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CssdashboardNextPage1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssdashboardNextPage1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
