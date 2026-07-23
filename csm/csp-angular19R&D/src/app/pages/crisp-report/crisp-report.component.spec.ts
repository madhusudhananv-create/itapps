import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispReportComponent } from './crisp-report.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('CrispReportComponent', () => {
  let component: CrispReportComponent;
  let fixture: ComponentFixture<CrispReportComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ CrispReportComponent ],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
