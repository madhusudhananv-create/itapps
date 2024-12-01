import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispSummaryProjectsComponent } from './crisp-summary-projects.component';

describe('CrispSummaryProjectsComponent', () => {
  let component: CrispSummaryProjectsComponent;
  let fixture: ComponentFixture<CrispSummaryProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispSummaryProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispSummaryProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
