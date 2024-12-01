import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispSummaryComponent } from './crisp-summary.component';

describe('CrispSummaryComponent', () => {
  let component: CrispSummaryComponent;
  let fixture: ComponentFixture<CrispSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
