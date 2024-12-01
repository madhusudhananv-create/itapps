import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffingSummaryDetailsComponent } from './staffing-summary-details.component';

describe('StaffingSummaryDetailsComponent', () => {
  let component: StaffingSummaryDetailsComponent;
  let fixture: ComponentFixture<StaffingSummaryDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffingSummaryDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffingSummaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
