import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CssDashboardCSSTableComponent } from './cssdashboard-css-table.component';

describe('CssDashboardCSSTableComponent', () => {
  let component: CssDashboardCSSTableComponent;
  let fixture: ComponentFixture<CssDashboardCSSTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CssDashboardCSSTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssDashboardCSSTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
