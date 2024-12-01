import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CssdashboardComponent } from './cssdashboard.component';

describe('CssdashboardComponent', () => {
  let component: CssdashboardComponent;
  let fixture: ComponentFixture<CssdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CssdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
