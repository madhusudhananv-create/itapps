import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CssdashboardFilterComponent } from './cssdashboard-filter.component';

describe('CssdashboardFilterComponent', () => {
  let component: CssdashboardFilterComponent;
  let fixture: ComponentFixture<CssdashboardFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CssdashboardFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssdashboardFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
