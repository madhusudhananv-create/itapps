import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispReportComponent } from './crisp-report.component';

describe('CrispReportComponent', () => {
  let component: CrispReportComponent;
  let fixture: ComponentFixture<CrispReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
