import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CssdashboardNextPage2Component } from './cssdashboard-next-page2.component';

describe('CssdashboardNextPage2Component', () => {
  let component: CssdashboardNextPage2Component;
  let fixture: ComponentFixture<CssdashboardNextPage2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CssdashboardNextPage2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssdashboardNextPage2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
